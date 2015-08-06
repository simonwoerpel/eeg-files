"""
urls for eeg app api
"""

from django.conf.urls import include, url

from rest_framework.routers import DefaultRouter

from .views import ElasticSearchViewSet


router = DefaultRouter()

router.register(r'search', ElasticSearchViewSet, base_name='search')

urlpatterns = router.urls

