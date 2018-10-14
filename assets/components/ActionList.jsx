import React from 'react';
import PropTypes from 'prop-types';
import ActionButton from './ActionButton';


class ActionList extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.elem.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'start'});
    }

    render () {
        const {item, user, actions} = this.props;

        return (
            <div
                className='dropdown-menu dropdown-menu-right show'
                ref={(elem) => this.elem = elem}
            >
                {actions.map((action) => !action.shortcut &&
                    <ActionButton
                        key={action.name}
                        action={action}
                        className='dropdown-item'
                        isVisited={action.visited && action.visited(user, item)}
                        displayName={true}
                        item={item}
                    />
                )}
            </div>
        );

    }

}

ActionList.propTypes = {
    item: PropTypes.object,
    user: PropTypes.string,
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
        action: PropTypes.func.isRequired,
    }))
};

export default ActionList;
