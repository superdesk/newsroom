import React from 'react';
import PropTypes from 'prop-types';

import { sectionsPropType } from '../types';

export default function SectionSwitch({sections, activeSection, selectSection}) {
    return (
        <div className="btn-group btn-group--navbar ml-0 mr-3">
            {sections.map((section) => (
                <button key={section._id}
                    className={'btn btn-outline-primary' + (section._id === activeSection ? ' active' : '')}
                    onClick={() => selectSection(section._id)}
                >{section.name}</button>
            ))}
        </div>
    );
}

SectionSwitch.propTypes = {
    sections: sectionsPropType,
    activeSection: PropTypes.string,

    selectSection: PropTypes.func.isRequired,
};
