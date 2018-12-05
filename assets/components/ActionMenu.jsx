import React from 'react';
import PropTypes from 'prop-types';
import ActionList from './ActionList';
import {Popover, PopoverBody} from 'reactstrap';

class ActionMenu extends React.Component {
    constructor(props) {
        super(props);
        this.onMouseLeave = this.onMouseLeave.bind(this);
    }

    onMouseLeave(event) {
        if (this.props.showActions) {
            this.props.onActionList(event, this.props.item, this.props.group);
        }
    }

    render() {
        const { item, user, actions, group, onActionList, showActions } = this.props;
        return (
            <div className='btn-group'>
                <span
                    ref={(elem) => this.referenceElem = elem}
                    onClick={(event) => onActionList(event, item, group)}>
                    <i className='icon--more icon--gray-light'></i>
                </span>
                {this.referenceElem &&
              <Popover placement="left" isOpen={showActions} target={this.referenceElem} className="action-popover">
                  <PopoverBody>
                      <ActionList
                          item={item}
                          user={user}
                          actions={actions}
                          onMouseLeave={this.onMouseLeave}
                      />
                  </PopoverBody>
              </Popover>}
            </div>
        );
    }
}

ActionMenu.propTypes = {
    item: PropTypes.object,
    user: PropTypes.string,
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
        action: PropTypes.func.isRequired,
    })),
    group: PropTypes.string,
    onActionList: PropTypes.func.isRequired,
    showActions: PropTypes.bool.isRequired,
};

export default ActionMenu;
