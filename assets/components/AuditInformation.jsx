import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {connect} from 'react-redux';
import {get} from 'lodash';

import {getEditUsers} from 'actions';
import { gettext, fullDate, getItemFromArray} from 'utils';

class AuditInformation extends React.Component {
    componentWillMount() {
        this.props.getEditUsers(this.props.item);
    }

    componentWillReceiveProps(nextProps) {
        if (get(this.props, 'item._created') !== get(nextProps, 'item._created') ||
            get(this.props, 'item._updated') !== get(nextProps, 'item._updated')) {
            nextProps.getEditUsers(nextProps.item);
        }
    }

    getElement(field) {
        const {item} = this.props;
        if (field === '_created' && item._created) {
            const creator = getItemFromArray(item.original_creator,
                this.props.editUsers || []);
            return (
                <div className='wire-column__preview__date'>
                    {gettext('Created {{creator}}at {{created}}',
                        {
                            creator: creator ? gettext(`by ${creator.first_name} ${creator.last_name} `) : '',
                            created: fullDate(item._created),
                        }
                    )}
                </div>
            );
        }

        if (field === '_updated' && item.version_creator) {
            const updator = getItemFromArray(item.version_creator, (this.props.editUsers || []));
            return (
                <div className='wire-column__preview__date'>
                    {gettext('Updated {{updator}}at {{updated}}',
                        {
                            updator: updator ? gettext(`by ${updator.first_name} ${updator.last_name} `) : '',
                            updated: fullDate(item._updated),
                        }
                    )}
                </div>
            );
        }
        
        return null;
    }

    render () {
        const {noPadding} = this.props;
        return (
            <div className={classNames(
                'wire-column__preview__top-bar pt-0 audit-information',
                {'pt-2': !noPadding},
                {'pl-0': noPadding})}>
                {this.getElement('_created')}
                {this.getElement('_updated')}
            </div>
        );
    }
}

AuditInformation.propTypes = {
    item: PropTypes.object,
    editUsers: PropTypes.array,
    getEditUsers: PropTypes.func.isRequired,
    noPadding: PropTypes.bool
};

const mapStateToProps = (state) => ({ editUsers: state.editUsers });

const mapDispatchToProps = (dispatch) => ({
    getEditUsers: (item) => dispatch(getEditUsers(item))
});

export default connect(mapStateToProps, mapDispatchToProps)(AuditInformation);
