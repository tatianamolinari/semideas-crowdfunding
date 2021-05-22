import React from "react";
import {render, within} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';


import ProposalDetail from "../proposals/ProposalDetail";

let getByTestId;

beforeEach(() => {
  ({ getByTestId } =  render(<ProposalDetail
                                            index_proposal={1}
                                            title="Titulo proposal test"
                                            description="Descripcion mockeada para test"
                                            proposal_date="11/02/2019"
                                            isMember={false}
                                            isOwner={true}/>));
});

it("Check ProposalDetail title render", () => {

    const { getByText } = within(getByTestId('titulo'));
    expect(getByText('Titulo proposal test')).toBeInTheDocument();


});

it("Check ProposalDetail description render", () => {

    const { getByText } = within(getByTestId('descripcion'));
    expect(getByText('Descripcion mockeada para test')).toBeInTheDocument();

});

it("Check ProposalDetail valor render", () => {

    const { getByText } = within(getByTestId('fecha_creacion'));
    expect(getByText('11/02/2019')).toBeInTheDocument();

});
