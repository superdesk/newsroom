import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { gettext } from 'utils';
import ItemVersion from './ItemVersion';
import { fetchNext, openItem } from '../actions';

class ListItemNextVersion extends React.Component {
    constructor(props) {
        super(props);
        this.state = {next: null};
        this.open = this.open.bind(this);
        this.fetch(props);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.item.nextversion !== this.props.item.nextversion) {
            this.fetch(nextProps);
        }
    }

    fetch(props) {
        props.dispatch(fetchNext(props.item))
            .then((next) => this.setState({next}))
            .catch(() => this.setState({next: null}));
    }

    open(version, event) {
        event.stopPropagation();
        this.props.dispatch(openItem(this.state.next));
    }

    render() {
        if (!this.state.next) {
            return null;
        }

        const baseClass = 'wire-column__preview';

        return (
            <div className={`${baseClass}__versions`}>
                <span className={`${baseClass}__versions__box-headline`}>
                    {gettext('Next version')}
                </span>

                <ItemVersion
                    version={this.state.next}
                    baseClass={baseClass}
                    onClick={this.open}
                    displayConfig={this.props.displayConfig}
                />
            </div>
        );
    }
}

ListItemNextVersion.propTypes = {
    item: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    displayConfig: PropTypes.object,
};

export default connect()(ListItemNextVersion);
