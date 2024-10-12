import React from "react";
import generatePdf from "./GeneratePdf";
const DownloadPdfButton = ({ products }) => {
    return (
        <div className="generate-pdf-button">
            <button className="btn btn-dark" onClick={() => generatePdf(products)}>
                Clic para Descargar el catalogo 
            </button>
        </div>
    );
};

export default DownloadPdfButton;
