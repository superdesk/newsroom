import {get} from 'lodash';

class Analytics {
    _event(name, params) {
        if (window.gtag) {
            const company = get(window, 'profileData.companyName', 'none');
            window.gtag('event', name, Object.assign({
                event_category: company,
                company: company,
            }, params));
        }
    }

    event(name, label, params) {
        this._event(name, Object.assign({
            event_label: label,
        }, params));
    }

    itemEvent(name, item, params) {
        this.event(name, item.headline || item.slugline, params);
    }

    timingComplete(name, value) {
        this._event('timing_complete', {name, value});
    }

    pageview(title, path) {
        if (window.gtag) {
            window.gtag('config', get(window, 'newsroom.analytics'), {
                page_title: title,
                page_path: path,
            });
        }
    }

    itemView(item) {
        if (item) {
            this.pageview(item.headline || item.slugline, `/wire?item=${item._id}`);
        } else {
            this.pageview();
        }
    }
}

export default new Analytics();