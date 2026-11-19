from typing import TypedDict


IMAGE_FIELD_NAME: str = "image"

IMAGE_EXTENSIONS: dict[str, str] = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
}

ALLOWED_IMAGE_CONTENT_TYPES: frozenset[str] = frozenset(IMAGE_EXTENSIONS)

MAX_IMAGE_BYTES: int = 5 * 1024 * 1024


class UploadIncidentPhotoResponse(TypedDict):
  filename: str
  link: str
