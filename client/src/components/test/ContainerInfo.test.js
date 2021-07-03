import React from "react";
import '@testing-library/jest-dom/extend-expect';

import {Dimmer, Loader }  from 'semantic-ui-react';

var enzyme = require('enzyme');
var Adapter = require('enzyme-adapter-react-16');
enzyme.configure({ adapter: new Adapter() });
import {shallow} from 'enzyme';


import ContainerInfo from "../campaign/ContainerInfo";
import ErrorMessage from "../errors/ErrorMessage";
import MenuButton from "../buttons/MenuButton";
  
it("Check that renders the error message when error is true", () => {
    const wrapper =  shallow(<ContainerInfo 
                                active="general_data"
                                indexCampaign={0}
                            />);
    wrapper.setState({ error: true });
    expect(wrapper.find(ErrorMessage).exists()).toBeTruthy();
});


it("Check that not renders the error message when error is true", () => {
    const wrapper =  shallow(<ContainerInfo 
                                active="general_data"
                                indexCampaign={0}
                            />);
    wrapper.setState({ error: false });
    expect(wrapper.find(ErrorMessage).exists()).toBeFalsy();
});

it("Check that renders four Menu Buttons", () => {
    const wrapper =  shallow(<ContainerInfo 
                                active="general_data"
                                indexCampaign={0}
                            />);
    wrapper.setState({ error: true });
    expect(wrapper.find(MenuButton).length).toEqual(4);
});


it("Check that renders the loading message when is not loaded", () => {
    const wrapper =  shallow(<ContainerInfo 
                                active="general_data"
                                indexCampaign={0}
                            />);
    wrapper.setState({ loaded: false });
    expect(wrapper.find(Dimmer).exists()).toBeTruthy();
    expect(wrapper.find(Loader).exists()).toBeTruthy();
});
