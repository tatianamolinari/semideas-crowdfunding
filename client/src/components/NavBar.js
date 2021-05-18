import React from "react";
import { Row, Col } from "react-bootstrap";

class NavBar extends React.Component {
  render() {
    return (<Row className="nav-bar"> 
              <Col className="logo-row" lg={3}>
              <img src="/logos/complete_row.png" class="container_img" />
              </Col>
            </Row>);
  }
}

export default NavBar;