"""
urls for eeg app
"""

from django.conf.urls import include, url
from .views import EEGPlantSearch


urlpatterns = [
    # url(r'^', include('couchbase_views.urls')),
    url(r'^', 'app.views.index'),
    url(r'^suche/', EEGPlantSearch.as_view(), name='eeg-plant-search'),
    url(r'^api/', include('app.api.urls')),
]
