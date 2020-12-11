import React from 'react';
import {Source} from './Source';
import {UrgencyLabel} from './UrgencyLabel';
import {CharCount} from './CharCount';
import {WordCount} from './WordCount';
import {PreviousVersions} from './PreviousVersions';
import {Embargo} from './Embargo';
import {VersionCreated} from './VersionCreated';

export function getComponentForField(item, field) {
    if (typeof field === 'object' && typeof field.field === 'string') {
        // example: { field: "source", styles: {fontWeight: "bold"} }
        const Component = getComponentForField(item, field.field);

        if (!Component) {
            return null;
        }

        return (props) => (
            <span style={field.styles || {}}>
                <Component {...props} />
            </span>
        );
    } else if (Array.isArray(field)) {
        // example: ["source", "department"]
        const components = field
            .map((f) => ({field: f, Component: getComponentForField(item, f)}))
            .filter(({Component}) => Boolean(Component)); // skip null components

        return (props) => (
            <span>
                {components
                    .map(({field, Component}) => <Component key={field} {...props} />)
                    .reduce((acc, curr) => [acc, ' // ', curr])
                }
            </span>
        );
    } else if (typeof field === 'string') {
        switch (field) {
        case 'urgency':
            return UrgencyLabel;
        case 'source':
            return Source;
        case 'charcount':
            return CharCount;
        case 'wordcount':
            return WordCount;
        case 'previous_versions':
            return PreviousVersions;
        case 'embargo':
            return Embargo;
        case 'versioncreated':
            return VersionCreated;
        default:
            if (typeof item[field] === 'string') {
                return () => <span>{item[field]}</span>;
            }
        }
    }

    console.warn(`Unknown field ${field}`);

    return null;
}
