"""
urls for eeg app
"""

from django.conf.urls import include, url


urlpatterns = [
    url(r'^test/$', 'app.views.test'),
    url(r'^simple_local_search', 'app.views.local_search'),
]
