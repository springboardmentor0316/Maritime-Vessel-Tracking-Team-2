from rest_framework.routers import DefaultRouter
from .views import VoyageViewSet

router = DefaultRouter()
router.register(r'voyages', VoyageViewSet)

urlpatterns = router.urls
