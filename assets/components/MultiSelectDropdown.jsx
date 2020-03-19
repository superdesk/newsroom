import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function MultiSelectDropdown({values, label, field, options, onChange, showAllButton, multi}) {
    const onChanged = (option) => {
        if (multi) {
            if (option === 'all') {
                onChange(field, []);
            } else if (values.includes(option)) {
                onChange(field, values.filter((o) => o !== option));
            } else {
                onChange(field, [...values, option]);
            }
        } else {
            if (option === 'all' || values === option) {
                onChange(field, null);
            } else {
                onChange(field, option);
            }
        }
    };

    const isActive = (multi && !!values.length) || (!multi && values !== null);

    return (
        <div className='btn-group' key={field}>
            <button
                id={field}
                type='button'
                className={classNames(
                    'btn btn-outline-primary btn-sm d-flex align-items-center px-2 ml-2',
                    {'active': isActive}
                )}
                aria-haspopup='true'
                aria-expanded='false'
                data-toggle='dropdown'
            >
                {multi && (
                    <span className='d-block'>{label}</span>
                )}

                {(!multi && !values) && (
                    <span className='d-block'>All {label}</span>
                )}

                {(!multi && values) && (
                    <span className='d-block'>{values}</span>
                )}
                <i className={classNames('icon-small--arrow-down ml-1', {'icon--white': isActive})}  />
            </button>
            <div className='dropdown-menu' aria-labelledby={field}>
                {showAllButton && (
                    <Fragment>
                        <button
                            className='dropdown-item'
                            onClick={onChanged.bind(null, 'all')}
                        >
                            <i className={classNames(
                                'mr-2',
                                {
                                    'icon--': isActive,
                                    'icon--check': !isActive,
                                }
                            )}
                            />
                            <span>All {label}</span>
                        </button>
                        <div className='dropdown-divider' />
                    </Fragment>
                )}
                {options.map((option) => (
                    <Fragment key={option.value}>
                        <button
                            className='dropdown-item'
                            onClick={onChanged.bind(null, option.value)}
                        >
                            <i className={classNames(
                                'mr-2',
                                {
                                    'icon--': (multi && !values.includes(option.value)) ||
                                        (!multi && values !== option.value),
                                    'icon--check': (multi && values.includes(option.value)) ||
                                        (!multi && values === option.value),
                                }
                            )}
                            />
                            <span>{option.label}</span>
                        </button>
                    </Fragment>
                ))}
            </div>
        </div>
    );
}

MultiSelectDropdown.propTypes = {
    values: PropTypes.oneOf([
        PropTypes.arrayOf(PropTypes.string),
        PropTypes.string,
        PropTypes.shape({
            label: PropTypes.string,
            value: PropTypes.string,
        }),
    ]),
    options: PropTypes.arrayOf(PropTypes.string),
    field: PropTypes.string,
    label: PropTypes.string,
    onChange: PropTypes.func,
    showAllButton: PropTypes.bool,
    multi: PropTypes.bool,
};

MultiSelectDropdown.defaultProps = {
    showAllButton: false,
    multi: true,
};

export default MultiSelectDropdown;
