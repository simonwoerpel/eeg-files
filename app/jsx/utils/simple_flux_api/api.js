'use strict';

/*
* a very simple flux async requests integration
*
* idea from http://www.code-experience.com/async-requests-with-react-js-and-flux-revisited/
*
* it basically dispatches its request state and request responses for itself
* to a given dispatcher, to have this business logic seperated from other stores or components
*
* basic usage – set your dispatcher, url and some other settings... put this into your actions.js
* or something similar
*
* let DropzoneApi = new SimpleApi({
*   url: '/sparkassen/api/sourceupload/',
*   dispatcher: AppDispatcher,
*   timeout: 10000,
*   method: 'POST',
*   actionType: DropzoneConstants.API_POST_DROPZONE,
*   csrfToken: csrfToken
* });
*
* then you can use DropzoneApi.processRequest(options) where options currently
* can contain `payload` (parameters that will be passed to the api endpoint)
* and `appendUrl` which will appended to the initialized url (to allow dynamic endpoints
* for the same Api instance)
*
* it can also attach files to a post request: Api.attachFile(file)
* FIXME better implementation of this
*
* the `actionType` set on new initialization of an api will be the actionType
* dispatched on every apiState change, the action payload will contain a key `apiState`
* which will be one of {PENDING, TIMEOUT, ERROR, SUCCESS} and always the `response`
* (which may be empty on PENDING or TIMEOUT state)
*
* this dispatching approach allows to listen to actions based on a specified api endpoint
* (with the `actionType` setting during initialization) and then switch further between
* the ApiConstants, example store implementatio for this:
*
*
*  case DropzoneConstants.API_POST_DROPZONE:  <-- the `actionType` for specific api endpoint to listen to
*
*    // further dispatching for apiStates for this Api Endpoint:
*    switch(action.apiState) {
*
*      case ApiConstants.PENDING:
*        break;
*
*      case ApiConstants.TIMEOUT:
*        break;
*
*      case ApiConstants.ERROR:
*        break;
*
*      case ApiConstants.SUCCESS:
*        setFileId(action.response.body.files[0]);
*        break;
*
*      default:
*        // no op
*
*  case DropzoneConstants.SOME_OTHER_ACTION:
*  ....
*
*
*
*/


import request from 'superagent';

import ApiConstants from './constants';


// some information hiding...
//

function _dispatch(dispatcher, actionType, apiState, response) {
  // see implementation in `processResponse`
  dispatcher.dispatch({
    actionType: actionType,
    apiState: apiState,
    response: response
  });
}


function _processResponse(dispatcher, actionType, timeout) {
  // dispatch actionType, apiState and response (if any) to given dispatcher

  return function (err, res) {
    if (err && err.timeout === timeout) {
      _dispatch(dispatcher, actionType, ApiConstants.TIMEOUT, res);
    } else if (res.status === 400) {
      _dispatch(dispatcher, actionType, ApiConstants.ERROR, res);
    } else if (!res.ok) {
      _dispatch(dispatcher, actionType, ApiConstants.ERROR, res);
    } else {
      _dispatch(dispatcher, actionType, ApiConstants.SUCCESS, res);
    }
  };
}


function _doRequest(url, method, timeout, payload, csrfToken, file) {
  // do get or post request
  // invoked by `processRequest`

  let req;

  switch(method) {

    case 'GET':
      req = request
        .get(url)
        .query(payload);
      break;

    case 'HEAD':
      req = request
        .head(url)
        .query(payload);
      break;

    case 'POST':
      req = request
        .post(url)
        .send(payload);

      if (file) {
        req.attach(file.name, file);
      }
      break;

    default:
      // no op, method must be specified
  }

  if (csrfToken) {
    req.set('X-CSRFToken', csrfToken);
  }

  req.timeout(timeout);

  return req;

}


// the base api class
class Api {

  constructor({url, dispatcher, timeout, method, actionType, csrfToken}) {
    this.url = url;
    this.dispatcher = dispatcher;
    this.timeout = timeout;
    this.method = method;
    this.actionType = actionType;
    this._pendingRequests = {};
    this.csrfToken = csrfToken;
    this.file = null;
  }

  abortPendingRequests() {
  // abort older request with same actionType
    if (this._pendingRequests[this.actionType]) {
      this._pendingRequests[this.actionType]._callback = function(){};
      this._pendingRequests[this.actionType].abort();
      this._pendingRequests[this.actionType] = null;
    }
  }

  attachFile(file) {
    // TODO how should file uploading implemented in general?
    this.file = file;
  }

  processRequest(options) {
    // process request, firt stop old request of same actionType
    // then dispatch 'PENDING' state for this actionType and processResponse
    // (see above)
    //
    // param options: optional appendUrl and/or payload
    // payload must be mapping, if method is post, it will passed to superagent's .send() method
    // else to superagents' query() method
    // if options.appendUrl, this will simply appended to the url

    var url = this.url;

    if (options) {
      if (options.appendUrl) {
        url = this.url + options.appendUrl;
      }

      if (options.payload) {
        var payload = options.payload;
      }
    }

    this.abortPendingRequests();

    _dispatch(this.dispatcher, this.actionType, ApiConstants.PENDING, null);

    this._pendingRequests[this.actionType] = _doRequest(
      url, this.method, this.timeout, payload, this.csrfToken, this.file).end(
        _processResponse(this.dispatcher, this.actionType, this.timeout)
    );

    // remove file after request to avoid having "old files" in new
    // request with this same api instance
    // TODO see above
    this.file = null;

  }
}

export default Api;

