import React from 'react';
import {Source} from './Source';
import {UrgencyLabel} from './UrgencyLabel';
import {CharCount} from './CharCount';
import {WordCount} from './WordCount';
import {PreviousVersions} from './PreviousVersions';
import {Embargo} from './Embargo';
import {VersionCreated} from './VersionCreated';

const ALLOWED_SEPARATORS = ['/', '//', '-'];

const SEPARATOR_KEY = 'separator';

// Example config:
// [
//   "urgency", // simple field
//   ["charcount", "/", "wordcount"] // multiple fields on the same line
//   ["source", "//", {field: "department", styles: {fontWeight: "bold"}}] // custom styles
// ]
export function FieldComponents({config, item, fieldProps = {}}) {
    if (!Array.isArray(config)) {
        return [];
    }

    const fields = config
        .map((field) => getComponentForField(item, field))
        .filter(Boolean)
        .reduce((acc, curr) => {
            if (acc.length > 0 && acc[acc.length - 1].key === curr.key) {
                // remove adjacent separators
                return acc;
            }
            return [...acc, curr];
        }, []);

    let separator = 0;

    return fields.map(({key, Component}) => {
        const _key =
            key === SEPARATOR_KEY ? `${SEPARATOR_KEY}${++separator}` : key;

        return (
            <span key={_key}>
                <Component item={item} {...fieldProps} />
            </span>
        );
    });
}

function getComponentForField(item, field) {
    if (typeof field === 'object' && typeof field.field === 'string') {
        // example: { field: "source", styles: {fontWeight: "bold"} }
        const result = getComponentForField(item, field.field);

        if (!result) {
            return null;
        }

        return {
            key: field.field,
            Component: (props) => (
                <span style={field.styles || {}}>
                    <result.Component {...props} />
                </span>
            ),
        };
    } else if (Array.isArray(field) && field.length > 0) {
        // example: ["source", "//", "department"]
        const components = field
            .map((f) => getComponentForField(item, f))
            .filter(Boolean);

        // remove orphan separators. For example in ['source', '//', 'department']
        // if the 'department' is empty, then '//' should not be shown
        if (components[components.length - 1].key === SEPARATOR_KEY) {
            components.pop();
        }

        return {
            key: components.map(({key}) => key).join('-'),
            Component: (props) => (
                <span>
                    {components.map(({Component}, i) => (
                        <Component key={i} {...props} />
                    ))}
                </span>
            ),
        };
    } else if (typeof field === 'string') {
        // example: "//"
        if (ALLOWED_SEPARATORS.includes(field)) {
            return {
                key: 'separator', // will be modified afterwards, as it's not unique
                Component: () => <span> {field} </span>,
            };
        }

        let Component = null;

        // example: "source"
        switch (field) {
        case 'urgency':
            Component = UrgencyLabel;
            break;
        case 'source':
            Component = Source;
            break;
        case 'charcount':
            Component = CharCount;
            break;
        case 'wordcount':
            Component = WordCount;
            break;
        case 'previous_versions':
            Component = PreviousVersions;
            break;
        case 'embargo':
            Component = Embargo;
            break;
        case 'versioncreated':
            Component = VersionCreated;
            break;
        default:
            if (typeof item[field] === 'string') {
                Component = () => <span>{item[field]}</span>;
            }
            break;
        }

        if (Component) {
            return {
                key: field,
                Component,
            };
        } else {
            return null;
        }
    }

    console.warn(`Unknown field format ${field}`);

    return null;
}
