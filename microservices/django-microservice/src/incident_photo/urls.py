from django.urls import path
from incident_photo import views

urlpatterns = [
    path("upload/", views.upload_incident_photo, name="upload_incident_photo")
]
