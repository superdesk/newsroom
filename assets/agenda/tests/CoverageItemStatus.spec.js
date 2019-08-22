import expect from 'expect';
import React from 'react';
import {shallow} from 'enzyme';
import CoverageItemStatus from '../components/CoverageItemStatus';

import 'tests/setup';

function setup(coverage) {
    return shallow(<CoverageItemStatus coverage={coverage} />);
}

describe('CoverageItemStatus', () => {
    it('doesnt render "UPDATE COMING"', () => {
        let wrapper = setup({
            workflow_status: 'completed',
            deliveries: [{delivery_state: 'published'}]
        });

        expect(wrapper.find('span.label--blue').length).toBe(0);

        wrapper = setup({
            workflow_status: 'completed',
            deliveries: [{delivery_state: 'corrected'}]
        });

        expect(wrapper.find('span.label--blue').length).toBe(0);

        wrapper = setup({
            workflow_status: 'completed',
            deliveries: [
                {delivery_state: 'published'},
                {delivery_state: 'published'},
            ]
        });

        expect(wrapper.find('span.label--blue').length).toBe(0);

        wrapper = setup({
            workflow_status: 'completed',
            deliveries: [
                {delivery_state: 'corrected'},
                {delivery_state: 'published'},
            ]
        });

        expect(wrapper.find('span.label--blue').length).toBe(0);
    });

    it('renders "UPDATE COMING"', () => {
        let wrapper = setup({
            workflow_status: 'completed',
            deliveries: [{delivery_state: 'in_progress'}]
        });

        expect(wrapper.find('span.label--blue').length).toBe(1);
        expect(wrapper.find('span.label--blue').text()).toBe('Update coming');

        wrapper = setup({
            workflow_status: 'completed',
            deliveries: [
                {delivery_state: 'in_progress'},
                {delivery_state: 'published'},
            ]
        });

        expect(wrapper.find('span.label--blue').length).toBe(1);
        expect(wrapper.find('span.label--blue').text()).toBe('Update coming');
    });
});
