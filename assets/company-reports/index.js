import { createStore, render } from 'utils';
import companyReportReducer from './reducers';
import CompanyReportsApp from './components/CompanyReportsApp';


const store = createStore(companyReportReducer);


render(store, CompanyReportsApp, document.getElementById('reports-app'));
