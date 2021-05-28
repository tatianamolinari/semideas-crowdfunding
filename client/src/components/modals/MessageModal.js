import React, {useState} from "react";
import { Modal, Col, Form } from "react-bootstrap";
import CrowdFundingCampaing from "../../contracts/CrowdFundingCampaing.json";


class MessageModal extends React.Component {

  render() {

    
    return (

      <div>
        <Modal show={this.props.showMessage} onHide={this.props.handleMessageClose}
        className="message-modal-error"
        data-testid="errorModal"
        aria-labelledby="contained-modal-title-vcenter"
        centered>
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">{this.props.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              {this.props.message}
          </Modal.Body>
          <Modal.Footer className="footer-buttons">
              <Col lg={6} className="aling-right">
                  <button 
                      className="normal-button" 
                      onClick={this.props.handleMessageClose}>
                      Cerrar
                  </button>
              </Col>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default MessageModal;