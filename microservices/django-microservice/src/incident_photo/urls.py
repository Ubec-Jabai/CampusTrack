from django.urls import path
from incident_photo import views

urlpatterns = [
    path("upload/", views.upload_incident_photo, name="upload_incident_photo"),
    path("link/<str:filename>/", views.get_incident_photo_link, name="get_incident_photo_link"),
    path("<str:filename>/", views.delete_incident_photo, name="delete_incident_photo")
]
