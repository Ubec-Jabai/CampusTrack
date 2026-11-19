import time
import uuid

from django.core.files.uploadedfile import UploadedFile

from core.supabase_client import get_supabase_client
from incident_photo.schemas import IMAGE_EXTENSIONS


_SUPABASE = get_supabase_client()
_BUCKET_NAME: str = "incident_pictures"


def upload_incident_photo(image: UploadedFile) -> tuple[str, str]:
    content_type = image.content_type or ""
    extension = IMAGE_EXTENSIONS.get(content_type)
    if extension is None:
        raise ValueError(f"Unsupported image content type: {content_type}")

    filename = f"{int(time.time())}-{uuid.uuid4().hex[:8]}{extension}"
    photo_bytes = image.read()

    _SUPABASE.storage.from_(_BUCKET_NAME).upload(
        path=filename,
        file=photo_bytes,
        file_options={"content-type": content_type},
    )
    link = _SUPABASE.storage.from_(_BUCKET_NAME).get_public_url(filename)

    return filename, link
