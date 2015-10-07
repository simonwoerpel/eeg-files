'use strict';

import React from 'react';
import EegApp from './eeg_app';

function renderApp(app, elementId) {
  let element = document.getElementById(elementId);
  if (element) {
    React.render(app, element);
  }
}

const APPS = {
  'eeg__app': <EegApp name='EegApp' />
};

for (let element in APPS) {
  renderApp(APPS[element], element);
}

