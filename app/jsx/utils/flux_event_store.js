/*
* base store for flux pattern
*
* implements default event listeners
*/


'use strict';

import {EventEmitter} from 'events';


const CHANGE_EVENT = 'change';


class FluxComponentStore extends EventEmitter {

  emitChange() {
    this.emit(CHANGE_EVENT);
  }

  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  }

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
}


export default FluxComponentStore;

