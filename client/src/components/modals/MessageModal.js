import React, {useState} from "react";
import { Modal, Col, Form } from "react-bootstrap";

import ErrorAlert from "../alerts/ErrorAlert"


function ContributeModal(params) {
  const [show, setShow] = useState(false);
  const [value, setValue] = useState('')

  const contract = params.instance;
  const minimunContribution = params.minimunContribution;

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleValue = (val) => setValue(val);


  const contribuir = () =>  {

    if (value >= minimunContribution){
      console.log("cumplio");

    }
    else {

    }
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
        <ErrorAlert title="aaaa" mssj/>
        <Modal.Body>
            <Form>
                <Form.Group controlId="contributeBasicForm">
                    <Form.Label>Contribuir con:</Form.Label>
                    <Form.Control placeholder="Valor en wei" onChange={event => setValue(event.target.value)}/>
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