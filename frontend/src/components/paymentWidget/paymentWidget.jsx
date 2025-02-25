import React, { useEffect } from "react";

const WompiPayment = ({ amount, reference }) => {
    useEffect(() => {
        // Crear el script dinámicamente
        const script = document.createElement("script");
        script.src = "https://checkout.wompi.co/widget.js";
        script.async = true;
        script.setAttribute("data-render", "button");
        script.setAttribute("data-public-key", process.env.REACT_APP_WOMPI_SANDBOX_PUBLIC_KEY);
        script.setAttribute("data-currency", "COP");
        script.setAttribute("data-amount-in-cents", amount);
        script.setAttribute("data-reference", reference);
        script.setAttribute("data-signature:integrity", "tu_firma_de_integridad"); 

        // Agregar el script al formulario
        const form = document.getElementById("wompi-form");
        form.appendChild(script);

        // Limpiar el script al desmontar el componente
        return () => {
            form.removeChild(script);
        };
    }, [amount, reference]);

    return (
        <form id="wompi-form">
            {/* El botón de Wompi se renderizará aquí */}
        </form>
    );
};

export default WompiPayment;