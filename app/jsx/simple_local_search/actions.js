'use strict';

import Dispatcher from '../dispatcher';
import EegAppConstants from '../constants/eeg_app_constants';
import SimpleApi from '../utils/simple_flux_api/api';


const SimpleLocalSearchActions = {

  fetchData: function(dataUrl, lookup, value) {
    let Api = new SimpleApi({
      url: dataUrl,
      dispatcher: Dispatcher,
      timeout: 10000,
      method: 'GET',
      actionType: EegAppConstants.API_GET_SIMPLE_LOCAL_SEARCH
    });
    Api.processRequest({appendUrl: '?' + lookup + '=' + value});
  }

};

export default SimpleLocalSearchActions;
