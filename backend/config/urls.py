from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from apps.core.views import HealthCheckView

urlpatterns = [
    # OpenAPI Schema & Swagger UI
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Health Check
    path('api/v1/health', HealthCheckView.as_view(), name='health-check'),

    # Apps API v1
    path('api/v1/', include('apps.core.urls')),
    path('api/v1/', include('apps.accounts.urls')),
    path('api/v1/', include('apps.catalog.urls')),
    path('api/v1/', include('apps.circulation.urls')),
    path('api/v1/', include('apps.reservations.urls')),
    path('api/v1/', include('apps.fines.urls')),
    path('api/v1/', include('apps.suggestions.urls')),
    path('api/v1/', include('apps.notifications.urls')),
    path('api/v1/', include('apps.reports.urls')),
    path('api/v1/', include('apps.audit.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

