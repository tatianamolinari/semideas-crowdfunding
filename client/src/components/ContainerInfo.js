import React from "react";
import { Row, Col } from "react-bootstrap";
import SideBarCampaignInfo from "./SideBarCampaignInfo.js";
import DisplayContent from "./DisplayContent.js"

class NavBar extends React.Component {
  render() {
    return (<Row className="container-info"> 
    
              <SideBarCampaignInfo/>
              <DisplayContent/>
    
            </Row>);
  }
}

export default NavBar;