import React from 'react';
import {Source} from './Source';
import {UrgencyLabel} from './UrgencyLabel';
import {CharCount} from './CharCount';
import {WordCount} from './WordCount';
import {PreviousVersions} from './PreviousVersions';
import {Embargo} from './Embargo';
import {VersionCreated} from './VersionCreated';
import {VersionType} from './VersionType';

const ALLOWED_SEPARATORS = ['/', '//', '-'];
const SEPARATOR_KEY = 'separator';

const MAP_FIELD_TO_COMPONENT = {
    urgency: UrgencyLabel,
    source: Source,
    charcount: CharCount,
    wordcount: WordCount,
    previous_versions: PreviousVersions,
    embargo: Embargo,
    versioncreated: VersionCreated,
};

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
        if (
            typeof field.component === 'string' &&
            typeof item[field.field] === 'string'
        ) {
            // example: { field: "version", component: "version_type" }
            switch (field.component) {
            case 'version_type':
                return {
                    key: field.field,
                    Component: () => (
                        <VersionType value={item[field.field]} />
                    ),
                };
            }

            return null;
        }

        if (typeof field.styles === 'object') {
            // example: { field: "source", styles: {fontWeight: "bold"} }
            const result = getComponentForField(item, field.field);

            return result
                ? {
                    key: field.field,
                    Component: (props) => (
                        <span style={field.styles || {}}>
                            <result.Component {...props} />
                        </span>
                    ),
                }
                : null;
        }

        return null;
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
        if (MAP_FIELD_TO_COMPONENT.hasOwnProperty(field)) {
            // predefined component
            Component = MAP_FIELD_TO_COMPONENT[field];
        } else if (typeof item[field] === 'string') {
            // string value from item
            Component = () => <span>{item[field]}</span>;
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
