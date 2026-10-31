from typing import Callable
from threading import Lock
from time import time
import jwt
from django.conf import settings
from django.core.cache import cache
from django.core.exceptions import ImproperlyConfigured
from django.http.request import HttpRequest
from django.http.response import HttpResponse, JsonResponse
from jwt import InvalidTokenError

from core.settings import PUBLIC_PATHS

_RATE_LIMIT_LOCK: Lock = Lock()


def is_public(path: str) -> bool:
  return path in PUBLIC_PATHS


class PdfParserMiddleware:
  def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]):
    self.get_response = get_response
    self.key = settings.JWT_SECRET.encode("utf-8")
    self.rate_limit: int = settings.RATE_LIMIT_REQUESTS
    self.window_seconds: int = settings.RATE_LIMIT_WINDOW_SECONDS

    if len(self.key) < 32 or not settings.JWT_ISSUER:
      raise ImproperlyConfigured("Set JWT_SECRET (at least 32 UTF-8 bytes) and JWT_ISSUER to match the backend.")

  def __call__(self, request: HttpRequest) -> HttpResponse:
    if is_public(request.path_info):
      return self.get_response(request)

    headers = request.headers

    if headers.get("Authorization") is None:
      return JsonResponse({ "message": "Unauthorized" }, status=401)

    try:
      scheme, token = headers.get("Authorization", "").split()

      if scheme.lower() != "bearer":
        raise ValueError

      claims = jwt.decode(
        token,
        self.key,
        algorithms=settings.JWT_ALGORITHMS,
        issuer=settings.JWT_ISSUER,
        options={"require": ["exp", "iss", "sub", "role"]}
      )

      user_id = int(claims["sub"])
      role = claims["role"]

      if user_id <= 0 or not isinstance(role, str) or not role.strip():
        raise ValueError
    except InvalidTokenError or ValueError or TypeError as ex:
      print(f"Middleware Error: {ex}")
      return JsonResponse({ "message": "Invalid or missing authentication token." }, status=401)

    setattr(request, "user_id", user_id)
    setattr(request, "role", role)

    # A cache get/set pair is not atomic without synchronizing request threads.
    with _RATE_LIMIT_LOCK:
      now: float = time()
      cache_key: str = f"pdf-parser:rate-limit:{user_id}:{int(now // self.window_seconds)}"
      request_count: object = cache.get(cache_key, 0)
      if not isinstance(request_count, int):
        raise TypeError("Invalid request count in rate-limit cache.")
      if request_count >= self.rate_limit:
        retry_after: int = self.window_seconds - int(now % self.window_seconds)
        return JsonResponse({ "message": "Too many requests. Please try again later." }, status=429,
                            headers={"Retry-After": str(retry_after)})
      cache.set(cache_key, request_count + 1, timeout=self.window_seconds)

    return self.get_response(request)
  
