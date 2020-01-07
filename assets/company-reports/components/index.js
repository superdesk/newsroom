import {get} from 'lodash';

import {createStore, render} from 'utils';
import { panels } from '../utils';
import companyReportReducer from '../reducers';

const store = createStore(companyReportReducer, 'CompanyReports');
const Panel = panels[window.report];

render(store, Panel, document.getElementById('print-reports'), {
    results: get(window, 'reportData.results'),
    print: true
});
