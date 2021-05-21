import React from "react";
import {render, within} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';


import DisplayContent from "./DisplayContent";

let getByTestId, queryByTestId;

beforeEach(() => {
  ({ getByTestId, queryByTestId } =  render(<DisplayContent
                                            data={{ 
                                            status: "Created",
                                            owner: "0xDF0fd73D8e1539290a73073d466c3a933Ca895D5",
                                            goal: 50,
                                            minimunContribution: 5,
                                            membersCount: 2,
                                            isMember: false,
                                            balance: 25,
                                            isOwner: true
                                            }}/>));
});


it("Check DisplayContent goal render", () => {

    const { getByText } = within(getByTestId('goal'));
    expect(getByText('Para que esta campaña comience se deben recaudar 50 wei o más.')).toBeInTheDocument();


});

it("Check DisplayContent balance render", () => {

    const { getByText } = within(getByTestId('balance'));
    expect(getByText('Contriobuciones totales: 25 wei.')).toBeInTheDocument();

});

it("Check DisplayContent minimunContribution render", () => {

    const { getByText } = within(getByTestId('minimunContribution'));
    expect(getByText('La contribución mínima es de 5 wei.')).toBeInTheDocument();

});

it("Check DisplayContent owner render", () => {

    const { getByText } = within(getByTestId('owner'));
    expect(getByText('Autor: 0xDF0fd73D8e1539290a73073d466c3a933Ca895D5.')).toBeInTheDocument();

});

it("Check DisplayContent contribution-row not render when isOwner is true", () => {

    expect(queryByTestId('contribution-row')).not.toBeInTheDocument();

});

