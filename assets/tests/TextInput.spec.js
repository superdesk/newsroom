import expect from 'expect';
import React from 'react';
import { shallow } from 'enzyme';
import TextInput from '../components/TextInput';
import { spy } from 'sinon';

import 'tests/setup';

function setup(errorStrings) {
    const handleChange = spy();

    const props = {
        name: 'test-ctr',
        label: 'test label',
        onChange: handleChange,
        value: 'test',
        error: errorStrings,
    };

    return {
        handleChange,
        wrapper: shallow(<TextInput {...props} />),
    };
}

describe('TextInput', () => {
    it('renders text and label', () => {
        const { wrapper } = setup([]);
        expect(wrapper.find('label').length).toBe(1);
        expect(wrapper.find('label').text()).toEqual('test label');
        expect(wrapper.find('input').length).toBe(1);
        expect(wrapper.find('input').prop('value')).toEqual('test');
    });

    it('displays error message', () => {
        const { wrapper } = setup(['Data is required']);
        expect(wrapper.find('div.alert').text()).toBe('Data is required');
    });

    it('calls onChange function on change', () => {
        const { handleChange, wrapper } = setup([]);
        const selectWrapper = wrapper.find('input');
        selectWrapper.simulate('change', { target: {value:'some value'} });
        expect(handleChange.called).toEqual(true);
    });
});
