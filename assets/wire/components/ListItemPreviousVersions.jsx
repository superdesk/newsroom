import React from 'react';
import PropTypes from 'prop-types';

import { gettext, formatTime, formatDate, wordCount } from 'utils';
import { fetchVersions } from '../actions';

class ListItemPreviousVersions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {versions: [], loading: true, error: false};
        this.baseClass = this.props.isPreview ? 'wire-column__preview' : 'wire-articles';
        fetchVersions(props.item)
            .then((versions) => this.setState({versions, loading: false}))
            .catch(() => this.setState({error: true}));
    }

    render() {
        if (this.state.loading) {
            return (
                <div className={`${this.baseClass}__versions`}>
                    {gettext('Loading')}
                </div>
            );
        }

        const versions = this.state.versions.map((version) => (
            <div key={version._id} className={`${this.baseClass}__versions__item`}>
                <div className={`${this.baseClass}__versions__wrap`}>
                    <div className={`${this.baseClass}__versions__time`}>
                        <span>{formatTime(version.versioncreated)}</span>
                    </div>
                    <div className={`${this.baseClass}__versions__meta`}>
                        <div className={`${this.baseClass}__item__meta-info`}>
                            <span className="bold">{version.slugline}</span>
                            <span>{formatDate(version.versioncreated)} {'//'}
                                <span className="bold">{wordCount(version.body_html)}</span> {gettext('words')}
                            </span>
                        </div>
                    </div>
                </div>
                {!this.props.isPreview ? <span className={`${this.baseClass}__item__divider`}></span> : null}
                <div className={`${this.baseClass}__versions__name`}>
                    <h5 className={`${this.baseClass}__versions__headline`}>{version.headline}</h5>
                </div>
            </div>
        ));

        return (
            this.props.item.ancestors ?
                <div className={`${this.baseClass}__versions`}>
                    {this.props.isPreview ? <span className="wire-column__preview__versions__box-headline">Previous versions</span> : null }
                    {versions}
                </div> : null
        );
    }
}

ListItemPreviousVersions.propTypes = {
    item: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        ancestors: PropTypes.array,
    }).isRequired,
    isPreview: PropTypes.bool.isRequired
};

export default ListItemPreviousVersions;
