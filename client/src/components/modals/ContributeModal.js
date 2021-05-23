import React, {useState} from "react";
import { Modal, Col, Form } from "react-bootstrap";

function ContributeModal(params) {
  const [show, setShow] = useState(false);

  const contract = params.instance;
  const minimunContribution = params.minimunContribution;

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const contribuir = () =>  {
      console.log("contribuir");
      console.log(contract);
      console.log(minimunContribution);
  }

  return (
    <div>
      <button 
      className="normal-button"
      onClick={handleShow}
      data-testid="cuntributionButton">
            Quiero contribuir
      </button>

      <Modal show={show} onHide={handleClose}
      data-testid="contributionModal"
      aria-labelledby="contained-modal-title-vcenter"
      centered>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">Contribuir con la campaña</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group controlId="formBasicEmail">
                    <Form.Label>Contribuir con:</Form.Label>
                    <Form.Control type="email" placeholder="Valor en wei" />
                    <Form.Text className="text-muted">
                    *el valor debe ser mayor al mínimo que es <span data-testid="minimunContribution">{minimunContribution}</span>.
                    </Form.Text>
                </Form.Group>
            </Form>
        </Modal.Body>
        <Modal.Footer className="footer-buttons">
            <Col lg={6} className="aling-left">
                <button 
                    className="normal-button" 
                    onClick={handleClose}>
                    Cerrar
                </button>
            </Col>
            <Col lg={6} className="aling-right">
                <button 
                    className="normal-button" 
                    onClick={contribuir}>
                    Contribuir
                </button>
            </Col>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ContributeModal;