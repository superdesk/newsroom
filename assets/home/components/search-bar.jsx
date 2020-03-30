import React from 'react';
import {gettext} from 'utils';

export class SearchBar extends React.PureComponent {
    render() {
        return (
            <section className="content-header">
                <nav className="content-bar navbar justify-content-start flex-nowrap flex-sm-wrap">
                    <div className="search form-inline">
                        <span className="search__icon d-none d-sm-block">
                            <i className="icon--search icon--gray-light" />
                        </span>
                        <div className={classNames('search__form input-group', {
                            'searchForm--active': !!this.state.query,
                        })}>
                            <form className="form-inline" action="/wire">
                                <input type="text" name="q" className="search__input form-control"
                                    placeholder={gettext('Search for...')}
                                    aria-label={gettext('Search for...')} />
                                <div className="search__form__buttons">
                                    <button type="reset" className="icon-button search__clear" title={gettext('Clear')}>
                                        <span className="search__clear">
                                            <img src="/static/search_clear.png" width="16" height="16"/>
                                        </span>
                                    </button>
                                    <button className="btn btn-outline-secondary" type="submit" title={gettext('Search')}>
                                        {gettext('Search')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </nav>
            </section>
        );
    }
}
