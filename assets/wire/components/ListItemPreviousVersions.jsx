import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { gettext } from 'utils';
import { fetchVersions, openItem } from '../actions';

import ItemVersion from './ItemVersion';

class ListItemPreviousVersions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {versions: [], loading: true, error: false};
        this.baseClass = this.props.isPreview ? 'wire-column__preview' : 'wire-articles';
        this.open = this.open.bind(this);
        this.fetch(props);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.item._id !== this.props.item._id) {
            this.fetch(nextProps);
        }
    }

    open(version, event) {
        event.stopPropagation();
        this.props.dispatch(openItem(version));
    }

    fetch(props) {
        props.dispatch(fetchVersions(props.item))
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
            <ItemVersion
                key={version._id}
                version={version}
                baseClass={this.baseClass}
                withDivider={this.props.isPreview}
                onClick={this.open}
            />
        ));

        return (
            this.props.item.ancestors ?
                <div className={this.baseClass + '__versions'} id={this.props.inputId}>
                    {this.props.isPreview && (
                        <span className="wire-column__preview__versions__box-headline">{gettext('Previous versions')}</span>
                    )}
                    {versions}
                </div> : null
        );
    }
}

ListItemPreviousVersions.propTypes = {
    item: PropTypes.shape({
        _id: PropTypes.string,
        ancestors: PropTypes.array,
    }).isRequired,
    isPreview: PropTypes.bool.isRequired,
    dispatch: PropTypes.func,
    inputId: PropTypes.string,
};

export default connect()(ListItemPreviousVersions);
