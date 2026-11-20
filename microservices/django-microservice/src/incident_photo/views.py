import logging

from django.core.files.uploadedfile import UploadedFile
from django.http.request import HttpRequest
from django.http.response import HttpResponse, JsonResponse
from django.views.decorators.http import require_GET, require_POST, require_http_methods

from incident_photo import services
from incident_photo.schemas import IMAGE_FIELD_NAME, IncidentPhotoResponse


logger = logging.getLogger(__name__)


@require_POST
def upload_incident_photo(request: HttpRequest) -> JsonResponse:
  image: UploadedFile | None = request.FILES.get(IMAGE_FIELD_NAME)
  if image is None:
    return JsonResponse({ "message": f"Missing '{IMAGE_FIELD_NAME}' image file." }, status=400)

  try:
    filename, link = services.upload_incident_photo(image)
    response_body: IncidentPhotoResponse = { "filename": filename, "link": link }
    return JsonResponse(response_body)
  except Exception:
    logger.exception("Incident photo upload failed")
    return JsonResponse({ "message": "Something went wrong while uploading your photo." }, status=500)


@require_GET
def get_incident_photo_link(request: HttpRequest, filename: str) -> JsonResponse:
  try:
    link = services.get_incident_photo_link(filename)
  except ValueError:
    return JsonResponse({ "message": "Invalid incident photo filename." }, status=400)
  except Exception:
    logger.exception("Incident photo link retrieval failed")
    return JsonResponse({ "message": "Something went wrong while retrieving your photo." }, status=500)

  response_body: IncidentPhotoResponse = { "filename": filename, "link": link }
  return JsonResponse(response_body)


@require_http_methods(["DELETE"])
def delete_incident_photo(request: HttpRequest, filename: str) -> HttpResponse:
  try:
    services.delete_incident_photo(filename)
  except ValueError:
    return JsonResponse({ "message": "Invalid incident photo filename." }, status=400)
  except Exception:
    logger.exception("Incident photo deletion failed")
    return JsonResponse({ "message": "Something went wrong while deleting your photo." }, status=500)

  return HttpResponse(status=204)
