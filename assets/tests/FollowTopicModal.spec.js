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

    const oldTopic = {
        data: {
            topic: {
                _id: 1,
                label: 'test-label',
                query: 'foo',
                notifications: true,
            }
        }
    };

    it('renders query readonly if topic is new', () => {
        const { wrapper } = setup(newTopic);
        expect(wrapper.find('label').length).toBe(3);
        expect(wrapper.find('input').length).toBe(3);
        const input = wrapper.find('input').get(1);
        expect(input.props.readOnly).toBe(true);
    });

    it('renders query editable if existing topic', () => {
        const { wrapper } = setup(oldTopic);
        const input = wrapper.find('input').get(1);
        expect(input.props.readOnly).toBe(false);
    });

});
