import React from 'react';
import { mount } from 'enzyme';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import 'tests/setup';

import WireApp from '../components/WireApp';


function setup(state) {
    const store = createStore(() => state);
    const enzymeWrapper = mount(<Provider store={store}><WireApp /></Provider>);
    return enzymeWrapper;
}

function getActions(enzymeWrapper) {
    return enzymeWrapper.find('Preview').props().actions;
}

function getNames(actions) {
    return actions.map((action) => action.name);
}

describe('WireApp', () => {
    const state = {
        items: [],
        itemsById: {'foo': {}},
        previewItem: 'foo',
    };

    it('should filter actions if there is no user or company', () => {
        const enzymeWrapper = setup(state);
        const actions = getActions(enzymeWrapper);
        const names = getNames(actions);
        expect(names).toEqual(['Open', 'Print', 'Copy']);
    });

    it('should more actions if there is user and company', () => {
        const enzymeWrapper = setup({...state, user: 'foo', company: 'bar'});
        const actions = getActions(enzymeWrapper);
        const names = getNames(actions);
        expect(names).toEqual(['Open', 'Share', 'Print', 'Copy', 'Download']);
    });
});
