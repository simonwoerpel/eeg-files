"""
urls for eeg app
"""

from django.conf.urls import url


urlpatterns = [
    url(r'^$', 'app.views.test'),
    url(r'^simple_local_search', 'app.views.local_search'),
]
