import React from "react";
import { Row, Col } from "react-bootstrap";

class NavBar extends React.Component {
  render() {
    return (<Row className="nav-bar"> 
    
              <Col className="nav-bar" lg={3}>
                <h3>HOLIIIIIIIII, {this.props.name} </h3>
              </Col>
    
    
            </Row>);
  }
}

export default NavBar;