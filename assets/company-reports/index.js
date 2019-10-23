import { createStore, render } from 'utils';
import companyReportReducer from './reducers';
import { initData } from './actions';
import CompanyReportsApp from './components/CompanyReportsApp';


const store = createStore(companyReportReducer, 'CompanyReports');

// init data
store.dispatch(initData(window.companyReportsData));

render(store, CompanyReportsApp, document.getElementById('reports-app'));
