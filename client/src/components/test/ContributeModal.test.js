import React from "react";
import {render, within, fireEvent} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';


import ContributeModal from "../modals/ContributeModal";

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


