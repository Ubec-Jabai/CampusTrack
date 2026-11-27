import json
from django.http.request import HttpRequest
from django.http.response import JsonResponse
from django.views.decorators.http import require_POST
from pydantic import TypeAdapter, ValidationError
from .schemas import CreateIncidentReportRequest, CreateIncidentReportResponse
from pdf_parser import services


_incident_report_request_adapter = TypeAdapter(CreateIncidentReportRequest)


@require_POST
async def create_pdf_report(request: HttpRequest) -> JsonResponse:
  try:
    payload = json.loads(request.body)
  except json.JSONDecodeError:
    return JsonResponse({"message": "Request body must be valid JSON"}, status=400)

  try:
    report_data = _incident_report_request_adapter.validate_python(payload)
  except ValidationError:
    return JsonResponse({"message": "Invalid incident report data"}, status=400)

  try:
    filename, link = await services.create_incident_report_pdf(report_data)
    response_body: CreateIncidentReportResponse = {"filename": filename, "link": link}
    return JsonResponse(response_body)
  except Exception as e:
    print(f"Create Error: {e}")
    return JsonResponse({ "message": "Something went wrong while processing your PDF file." }, status=500)
