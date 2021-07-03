import React from "react";
import {render} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import deployedCampaignsInfo from "../../contracts/campaignAddresses.json"


import DisplayProposals from "../proposals/DisplayProposals";

it("Check if logo is render", () => {

    const { getByTestId } =  render( <DisplayProposals
                                        instance={null}
                                        isMember={false}
                                        isOwner={true}
                                        active="proposals_list"/> );

});

