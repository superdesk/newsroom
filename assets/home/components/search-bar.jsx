import React from 'react';
import {gettext} from 'utils';

export class SearchBar extends React.PureComponent {
    render() {
        return (
            <nav className="content-bar navbar justify-content-start flex-nowrap flex-sm-wrap">
                <div className="search form-inline">
                    <span className="search__icon d-none d-sm-block">
                        <i className="icon--search icon--gray-light" />
                    </span>
                    <div className="search__form input-group searchForm--active">
                        <form className="form-inline" action="/wire">
                            <input type="text" name="q" className="search__input form-control"
                                placeholder={gettext('Search for...')}
                                aria-label={gettext('Search for...')} />
                            <div className="search__form__buttons">
                                <button className="btn btn-outline-secondary" type="submit">{gettext('Search')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </nav>
        );
    }
}
