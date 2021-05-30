import React from "react";
import { Row, Col } from "react-bootstrap";

class NavBar extends React.Component {
  render() {
    return (<Row className="nav-bar"> 
              <Col className="logo-row" lg={3}>
                <img src="/logos/complete_row.png" alt="" className="container_img" data-testid="logoimage" />
              </Col>
            </Row>);
  }
}

export default NavBar;