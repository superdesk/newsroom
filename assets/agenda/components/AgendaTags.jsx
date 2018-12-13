import React from 'react';
import PropTypes from 'prop-types';
import { gettext } from 'utils';
import { isEmpty, uniqBy } from 'lodash';
import InfoBox from 'wire/components/InfoBox';
import PreviewTagsBlock from 'wire/components/PreviewTagsBlock';
import PreviewTagsLink from 'wire/components/PreviewTagsLink';
import {getSubjects} from '../utils';

function formatCV(items, field) {
    return items && items.map((item) => (
        <PreviewTagsLink key={item.code}
            href={`/agenda?q=${field}:"${item.name}"`}
            text={item.name}
        />
    ));
}

function AgendaTags({item, plan, isItemDetail}) {
    const subjects = uniqBy([...getSubjects(item), ...getSubjects(plan)], 'code');
    const formattedSubjects = !isEmpty(subjects) && formatCV(subjects, 'subject.name');

    return (
        formattedSubjects && <InfoBox label={isItemDetail ? gettext('Metadata') : null} top={!isItemDetail}>
            <PreviewTagsBlock label={gettext('Category')}>
                {formattedSubjects}
            </PreviewTagsBlock>
        </InfoBox>
    );
}

AgendaTags.propTypes = {
    item: PropTypes.object,
    plan: PropTypes.object,
    isItemDetail: PropTypes.bool,
};

export default AgendaTags;
