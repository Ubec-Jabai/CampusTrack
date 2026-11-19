import logging
from typing import Callable

from django.core.exceptions import TooManyFilesSent
from django.core.files.uploadedfile import UploadedFile
from django.http.multipartparser import MultiPartParserError
from django.http.request import HttpRequest
from django.http.response import HttpResponse, JsonResponse

from incident_photo.schemas import (
  ALLOWED_IMAGE_CONTENT_TYPES,
  IMAGE_FIELD_NAME,
  MAX_IMAGE_BYTES,
)


logger = logging.getLogger(__name__)

_PHOTO_UPLOAD_PREFIX: str = "/api/incident-photo/"


def _has_image_signature(image: UploadedFile, content_type: str) -> bool:
  header = image.read(12)
  image.seek(0)

  if content_type == "image/jpeg":
    return header.startswith(b"\xff\xd8\xff")
  if content_type == "image/png":
    return header.startswith(b"\x89PNG\r\n\x1a\n")
  if content_type == "image/webp":
    return header.startswith(b"RIFF") and header[8:12] == b"WEBP"
  return False


def _declared_size(request: HttpRequest) -> int | None:
  raw_length = request.META.get("CONTENT_LENGTH")
  if not raw_length:
    return None
  try:
    return int(raw_length)
  except (TypeError, ValueError):
    return None


class IncidentPhotoMiddleware:
  def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]) -> None:
    self.get_response = get_response

  def __call__(self, request: HttpRequest) -> HttpResponse:
    if request.method != "POST" or not request.path_info.startswith(_PHOTO_UPLOAD_PREFIX):
      return self.get_response(request)

    if request.content_type != "multipart/form-data":
      return JsonResponse({ "message": "Content-Type must be multipart/form-data." }, status=415)

    declared_size = _declared_size(request)
    if declared_size is not None and declared_size > MAX_IMAGE_BYTES:
      return JsonResponse({ "message": "Image must be 5 MB or smaller." }, status=413)

    try:
      image = request.FILES.get(IMAGE_FIELD_NAME)
    except (MultiPartParserError, TooManyFilesSent):
      logger.warning("Malformed multipart incident photo upload")
      return JsonResponse({ "message": "Malformed multipart request." }, status=400)

    if image is None:
      return self.get_response(request)

    content_type = image.content_type
    if content_type is None or content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
      return JsonResponse({ "message": "Only JPEG, PNG, and WebP images are allowed." }, status=415)

    if image.size is not None and image.size > MAX_IMAGE_BYTES:
      return JsonResponse({ "message": "Image must be 5 MB or smaller." }, status=413)

    if not _has_image_signature(image, content_type):
      return JsonResponse({ "message": "Uploaded file is not a valid JPEG, PNG, or WebP image." }, status=415)

    return self.get_response(request)
