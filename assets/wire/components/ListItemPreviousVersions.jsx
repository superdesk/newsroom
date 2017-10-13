import React from 'react';
import PropTypes from 'prop-types';

import { gettext, formatTime, formatDate, wordCount } from 'utils';
import { fetchVersions } from '../actions';

class ListItemPreviousVersions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {versions: [], loading: true, error: false};
        fetchVersions(props.item)
            .then((versions) => this.setState({versions, loading: false}))
            .catch(() => this.setState({error: true}));
    }

    render() {
        if (this.state.loading) {
            return (
                <div className="wire-articles__versions wire-articles__versions--open">
                    {gettext('Loading')}
                </div>
            );
        }

        const versions = this.state.versions.map((version) => (
            <div key={version._id} className="wire-articles__versions__item">
                <div className="wire-articles__versions__time">
                    <span>{formatTime(version.versioncreated)}</span>
                </div>
                <div className="wire-articles__versions__meta">
                    <div className="wire-articles__item__meta-info">
                        <span className="bold">{version.slugline}</span>
                        <span>{formatDate(version.versioncreated)} {'//'} <span className="bold">{wordCount(version.body_html)}</span> {gettext('words')}</span>
                    </div>
                </div>
                <span className="wire-articles__item__divider"></span>
                <div className="wire-articles__versions__name">
                    <h5 className="wire-articles__versions__headline">{version.headline}</h5>
                </div>
            </div>
        ));

        return (
            <div className="wire-articles__versions wire-articles__versions--open">
                {versions}
            </div>
        );
    }
}

ListItemPreviousVersions.propTypes = {
    item: PropTypes.shape({
        _id: PropTypes.string.isRequired,
    }).isRequired,
};

export default ListItemPreviousVersions;
