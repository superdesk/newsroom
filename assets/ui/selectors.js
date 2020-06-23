import {get} from 'lodash';

export const uiConfigSelector = (state) => get(state, 'uiConfig') || {};
export const previewConfigSelector = (state) => uiConfigSelector(state).preview || {};
export const detailsConfigSelector = (state) => uiConfigSelector(state).details || {};
export const advancedSearchTabsConfigSelector = (state) => uiConfigSelector(state).advanced_search_tabs || {};
export const multiSelectTopicsConfigSelector = (state) => uiConfigSelector(state).multi_select_topics || false;
export const companiesSubscriberIdEnabled = (state) => get(state, 'ui_config.list.sd_subscriber_id.enabled', false);
