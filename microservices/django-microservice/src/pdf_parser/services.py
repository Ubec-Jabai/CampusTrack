import time, uuid
from asgiref.sync import sync_to_async
from django.template.loader import render_to_string
from playwright.async_api import async_playwright
from core.supabase_client import get_supabase_client
from .schemas import CreateIncidentReportRequest


_SUPABASE = get_supabase_client()
_PDF_TEMPLATE_PATH = "pdf/incident_report_pdf.html"


def _upload_pdf_to_supabase(pdf_bytes: bytes, filename: str, bucket_name: str = "PDFs") -> str:
    destination_path = f"{int(time.time())}-{filename}"

    try:
      _SUPABASE.storage.from_(bucket_name).upload(path=destination_path, file=pdf_bytes)
      public_url = _SUPABASE.storage.from_(bucket_name).get_public_url(destination_path)
      return public_url
    except Exception as e:
        print(f"Upload failed: {e}")
        raise


async def create_incident_report_pdf(data: CreateIncidentReportRequest) -> tuple[str, str]:
    rendered_html = await sync_to_async(render_to_string)(_PDF_TEMPLATE_PATH, {
        "report": data.get("report", {}),
        "involved_parties": data.get("involved_parties", []),
        "details": data.get("details", {}),
        "preparer": data.get("preparer", {}),
    })

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        try:
            page = await browser.new_page()
            await page.set_content(rendered_html, wait_until="networkidle")
            pdf_bytes = await page.pdf(format="A4", print_background=True)
        finally:
            await browser.close()

    filename = f"UC_Incident_Report_{uuid.uuid4().hex[:8]}.pdf"
    # Supabase uses the synchronous client, so keep its network calls off the event loop.
    supabase_url = await sync_to_async(_upload_pdf_to_supabase)(pdf_bytes, filename)

    return filename, supabase_url
