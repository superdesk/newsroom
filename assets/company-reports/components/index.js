import React from 'react';
import ReactDOM from 'react-dom';
import { panels } from '../utils';

const Panel = panels[window.report];

ReactDOM.render(
    <Panel data={window.reportData} print={true}/>, document.getElementById('print-reports')
);

