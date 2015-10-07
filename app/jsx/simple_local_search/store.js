'use strict';

import FluxEventStore from '../utils/flux_event_store';
import ApiConstants from '../utils/simple_flux_api/constants';
import Dispatcher from '../dispatcher';
import EegAppConstants from '../constants/eeg_app_constants';

let _apiState = null;
let _data = null;

function setApiState(apiState) {
  _apiState = apiState;
}

function setData(data) {
  _data = data;
}

class SimpleLocalSearchStore extends FluxEventStore {

  getApiState() {
    return _apiState;
  }

  getData() {
    return _data;
  }

}

let simpleLocalSearchStore = new SimpleLocalSearchStore();

Dispatcher.register((action) => {

  // debug
  console.log(action.actionType);

  switch(action.actionType) {

  case EegAppConstants.API_GET_SIMPLE_LOCAL_SEARCH:

    switch(action.apiState) {

      case ApiConstants.PENDING:
        break;

      case ApiConstants.TIMEOUT:
        break;

      case ApiConstants.ERROR:
        break;

      case ApiConstants.SUCCESS:
        setData(action.response.body.data);
        break;

      default:
        // no op

      }

    console.log(action.apiState);
    setApiState(action.apiState);
    simpleLocalSearchStore.emitChange();
    break;

    default:
      // no op
  }
});

export default simpleLocalSearchStore;
