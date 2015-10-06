"""
urls for eeg app
"""

from django.conf.urls import include, url


urlpatterns = [
    url(r'^api/', include('elastic_views.urls')),
]
