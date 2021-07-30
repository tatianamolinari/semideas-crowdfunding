import React from "react";
import { Modal, Col } from "react-bootstrap";


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
            <Modal.Title id="contained-modal-title-vcenter" data-testid="title">{this.props.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body data-testid="message">
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