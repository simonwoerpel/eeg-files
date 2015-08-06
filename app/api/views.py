"""
eeg api views
"""


from django.conf import settings

from rest_framework import viewsets
from rest_framework.response import Response
from elastic_views.connection import CONNECTION as E


def get_query(query_term):
    """
    may be overriden
    """
    query = {
        "query":{
            "bool":{
                "must":[{
                    "query_string":{
                        "default_field":"_all",
                        "query": query_term,
                    }
                }],
                "must_not":[],
                "should":[]
            }
        },
        "from": 0,
        "size": 10000,
        "sort":[],
        "facets":{}
    }

    return query


class ElasticSearchViewSet(viewsets.ViewSet):
    """
    base api endpoint for querying elastic search
    """
    index = settings.ELASTICSEARCH['DEFAULT_INDEX']


    def list(self, request):

        term = request.GET.get('q', None)

        if not term:
            return Response({'data': None})

        query = get_query(term)
        result = E.search(index=self.index, body=query)
        return Response({'data': result})


