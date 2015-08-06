from django.core.urlresolvers import reverse
from django.shortcuts import render_to_response
from elastic_views.views import SimpleElasticQueryView


def index(request):
    return render_to_response('index.html')


class EEGPlantSearch(SimpleElasticQueryView):

    def get_result_object_url(self, row):
        return reverse('cb-document-detail', kwargs={'id': row['_id']})

    def get_result_object_name(self, row):
        return row['_id']


