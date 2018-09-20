import {get} from 'lodash';

class Analytics {
    _event(name, params) {
        if (window.gtag) {
            const company = get(window, 'profileData.companyName', 'none');
            const user = get(window, 'profileData.user.first_name', 'unknown');
            const userParams = {
                event_category: company,
                company: company,
                user: user,
            };

            window.gtag('event', name, Object.assign(userParams, params));
        }
    }

    event(name, label, params) {
        this._event(name, Object.assign({
            event_label: label,
        }, params));
    }

    itemEvent(name, item, params) {
        this.event(name, item.headline || item.name || item.slugline, params);
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

    sendEvents(events) {
        events.forEach((event) => {
            this._event(event);
        });
    }

    multiItemEvent(event, items) {
        items.forEach((item) => item && this.itemEvent(event, item));
    }
}

// make it available
window.analytics = new Analytics();
export default window.analytics;