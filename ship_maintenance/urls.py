from django.urls import path, include
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

urlpatterns = [
    path('', include('core.urls')),
] + staticfiles_urlpatterns()
