import React from "react";
import {render, within, fireEvent} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';

import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter() });
import { shallow } from "enzyme";

import ContributeModal from "../modals/ContributeModal";
import MessageModal from "../modals/MessageModal"

let getByTestId, queryByTestId;

beforeEach(() => {
    ({ getByTestId, queryByTestId } =  render(<ContributeModal 
                                                instance={"instance"}
                                                minimunContribution={5}/>));
  });

it("Not show modal in render", () => {

    expect(queryByTestId('contributionModal')).not.toBeInTheDocument();
});


it("Render modal with text after click button", () => {

    const button = getByTestId('cuntributionButton');
    fireEvent.click(button);
    expect(queryByTestId('contributionModal')).toBeInTheDocument();

});


it("Render minimun contribution text in modal after click button", () => {

    const button = getByTestId('cuntributionButton');
    fireEvent.click(button);
    const { getByText } = within(getByTestId('minimunContribution'));
    expect(getByText('5')).toBeInTheDocument();

});


it('check that contribution modal is close when click cancel button', () =>{
    expect(queryByTestId('contributionModal')).not.toBeInTheDocument();
    const button = getByTestId('cuntributionButton');
    fireEvent.click(button);
    expect(queryByTestId('contributionModal')).toBeInTheDocument();
    const cancelButton = getByTestId('cancelButton');
    fireEvent.click(cancelButton);
    expect(queryByTestId('contributionModal')).toBeInTheDocument();
});


it('check if MessageModel render when error is true', () =>{
    const contributeComponent = shallow(<ContributeModal 
                                        instance={"instance"}
                                        minimunContribution={5}/>);
    
    
    contributeComponent.setState({ showMessage: true });
    expect(contributeComponent.find(MessageModal).exists()).toBeTruthy();
});


it('MessageModel not is render when error is false', () =>{
    const contributeComponent = shallow(<ContributeModal 
                                        instance={"instance"}
                                        minimunContribution={5}/>);
    
    
    contributeComponent.setState({ showMessage: false });
    expect(contributeComponent.find(MessageModal).exists()).toBeFalsy();
});

