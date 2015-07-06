"""
urls for eeg app
"""

from django.conf.urls import include, url

urlpatterns = [
    url(r'^', include('couchbase_views.urls')),
]
