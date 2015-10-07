from django.conf import settings
from django.http import JsonResponse, Http404
from django.shortcuts import render_to_response

from elasticsearch_dsl import Search


INDEX = settings.ELASTICSEARCH['DEFAULT_INDEX']
POWERKWH = settings.EEG_APP['DEFAULT_POWERKWH_FIELD']


def test(request):
    return render_to_response('index.html')


class Dso(object):
    def __init__(self, name):
        self.name = name

    def get_data(self):
        s = Search(index=INDEX).query('match', dso=self.name)
        s.aggs.metric('plant_count', 'cardinality', field='id')
        s.aggs.metric('carrier_count', 'cardinality', field='carrier')
        s.aggs.metric('power_sum', 'sum', field=POWERKWH)
        e = s.execute()
        return e

    @property
    def serialized(self):
        e = self.get_data()
        return {
            'name': self.name,
            'carrier_count': e.aggregations.carrier_count.to_dict()['value'],
            'plant_count': e.aggregations.plant_count.to_dict()['value'],
            'power_sum': e.aggregations.power_sum.to_dict()['value'],
        }


def local_search(request):
    muni = request.GET.get('muni', None)
    plz = request.GET.get('plz', None)

    if not muni and not plz:
        raise Http404

    if muni:
        s = Search(index=INDEX).query('match', muni=muni)
    elif plz:
        s = Search(index=INDEX).query('match', plz=plz)

    s.aggs.bucket('per_carrier', 'terms', field='carrier')\
        .metric('power_avg', 'avg', field=POWERKWH)\
        .metric('power_sum', 'sum', field=POWERKWH)
    s.aggs.bucket('per_dso', 'terms', field='dso')\
        .metric('power_avg', 'avg', field=POWERKWH)\
        .metric('power_sum', 'sum', field=POWERKWH)
    s.aggs.metric('plant_count', 'cardinality', field='id')
    s.aggs.metric('dso_count', 'cardinality', field='dso')
    s.aggs.metric('carrier_count', 'cardinality', field='carrier')
    s.aggs.metric('power_sum', 'sum', field=POWERKWH)

    e = s.execute()

    data = {
        'lookup': muni or plz,
        'result': {
            'per_carrier': e.aggregations.per_carrier.to_dict()['buckets'],
            'per_dso': e.aggregations.per_dso.to_dict()['buckets'],
            'metrics': {
                'dso_count': e.aggregations.dso_count.to_dict()['value'],
                'carrier_count': e.aggregations.carrier_count.to_dict()['value'],
                'plant_count': e.aggregations.plant_count.to_dict()['value'],
                'power_sum': e.aggregations.power_sum.to_dict()['value'],
            },
            'dsos': [Dso(i['key']).serialized for i in
                     e.aggregations.per_dso.buckets]
        },
    }
    return JsonResponse({'data': data})
