import React from "react";
import { Row, Col } from "react-bootstrap";

class NavBar extends React.Component {


  render() {
    return (<Row className="nav-bar"> 
              <Col className="logo-row" lg={3}>
                <img src="logos/complete_row.png" alt="" className="container_img" data-testid="logoimage" />
              </Col>
              <Col className="navigation-campaigns" lg={9}>
                <Row> 
                  <Col lg={6} className="aling-left">
                    { this.props.indexCampaign > 0 &&
                      <button 
                        className="invisible_button"
                        style={{color: "black"}}
                        onClick={this.props.previusCampaign}> 
                        &lt;&lt; 
                      </button>
                    }
                  </Col>
                  <Col lg={6} className="aling-right">
                    { this.props.indexCampaign < 1 &&
                       <button 
                        className="invisible_button"
                        style={{color: "black"}}
                        onClick={this.props.nextCampaign}> 
                        &gt;&gt; 
                      </button>
                    }
                  </Col>
                </Row>
              </Col>
            </Row>);
  }
}

export default NavBar;