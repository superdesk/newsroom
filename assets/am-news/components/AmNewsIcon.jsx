import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {bem} from 'ui/utils';


const AMNewsIcon = ({iconType, borderRight, toolTip}) => {
    const css = classNames(
        'wire-articles__item__am-icons',
        bem('wire-articles__item', 'meta-time', {'border-right': borderRight})
    );
    return (
        <div className={css} data-toggle="tooltip" data-placement="left" title={toolTip}>
            <i className={`icon--${iconType}`}></i>
        </div>
    );
};

AMNewsIcon.propTypes = {
    iconType: PropTypes.string.isRequired,
    borderRight: PropTypes.boolean,
    toolTip: PropTypes.string,
};

export default AMNewsIcon;