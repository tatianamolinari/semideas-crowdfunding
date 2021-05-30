import React from "react";
import {render, within, fireEvent} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';

import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter() });
import { shallow } from "enzyme";

import MessageModal from "../modals/MessageModal"

let getByTestId;

beforeEach(() => {
    ({ getByTestId } =  render(<MessageModal
        showMessage={true}
        handleMessageClose={() => {}}
        message="Mensaje para la modal"
        title="Titulo modal mensaje" />));
});

it("Check MessageModal title render", () => {

    const { getByText } = within(getByTestId('title'));
    expect(getByText('Titulo modal mensaje')).toBeInTheDocument();


});

it("Check MessageModal message render", () => {

    const { getByText } = within(getByTestId('message'));
    expect(getByText('Mensaje para la modal')).toBeInTheDocument();


});

