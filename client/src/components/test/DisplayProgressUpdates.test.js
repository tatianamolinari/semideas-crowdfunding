import React from "react";
import {render} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import deployedCampaignsInfo from "../../contracts/campaignAddresses.json"


import DisplayProgressUpdates from "../progressUpdates/DisplayProgressUpdates";

it("Check if logo is render", () => {

    const { getByTestId } =  render( <DisplayProgressUpdates
                                        instance={null}
                                        active="progress_updates_list"/> );

});

