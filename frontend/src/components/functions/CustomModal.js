import React from "react";
import { Modal, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

const CustomModal = ({show, handleClose, title, children}) => {
    return (<Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {children}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};


const ConfirmationModal = ({ show, handleClose, handleConfirm, message }) => {
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Aviso</Modal.Title>
            </Modal.Header>
            <div className="d-flex flex-column align-items-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning mb-3" style={{ fontSize: '10rem' }} />
                    <span className="text-center" style={{ fontSize: '1.5rem' }}>{message}</span>
            </div>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={handleConfirm}>
                    Confirmar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export {CustomModal, ConfirmationModal};



