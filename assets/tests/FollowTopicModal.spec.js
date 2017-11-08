import expect from 'expect';
import React from 'react';
import { mount } from 'enzyme';
import { createStore, applyMiddleware } from 'redux';
import FollowTopicModal from '../components/FollowTopicModal';
import thunk from 'redux-thunk';

import 'tests/setup';

function setup(props) {
    const store = createStore(() => null, applyMiddleware(thunk));

    return {
        submit: props.submit,
        wrapper: mount(<FollowTopicModal {...props} store={store} />),
    };
}

describe('FollowTopicModal', () => {
    const newTopic = {
        data: {
            topic: {
                label: 'test-label',
                query: 'foo',
                notifications: true,
            }
        }
    };

    it('renders form for new topic', () => {
        const { wrapper } = setup(newTopic);
        expect(wrapper.find('label').length).toBe(2);
        expect(wrapper.find('input').length).toBe(2);
    });
});
