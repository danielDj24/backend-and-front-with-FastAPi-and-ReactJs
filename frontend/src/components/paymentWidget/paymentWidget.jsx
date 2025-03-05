import React, { useEffect, useState } from "react";
import { axiosInstanceAuth } from "../functions/axiosConfig";
import { useParams } from "react-router-dom";
import useAuthStore from "../store/userAuthToken";

const WompiPayment = ({ amount, reference }) => {
    const { userId } = useParams();
    const { token } = useAuthStore();
    const [signature, setSignature] = useState(null);
    const [error, setError] = useState(null);

    const fetchSignaturedPayment = async () => {
        if (!token) {
            setError("Authentication error. Please log in again.");
            return;
        }

        // Evitar múltiples llamadas si ya hay una firma
        if (signature) return;

        const axiosAuth = axiosInstanceAuth(token);
        try {
            const response = await axiosAuth.post("create/signature/order", {
                reference,
                amount,
                currency: "COP",
            });
            console.log("Firma recibida:", response.data.signature);
            setSignature(response.data.signature);
        } catch (err) {
            setError("Error fetching signature.");
            console.error(err);
        }
    };

    useEffect(() => {
        // Solo ejecutar si amount y reference tienen valores válidos
        if (amount && reference) {
            fetchSignaturedPayment();
        }
    }, [amount, reference]); // Dependencias: amount y reference

    useEffect(() => {
        if (!signature) return;

        const script = document.createElement("script");
        script.src = "https://checkout.wompi.co/widget.js";
        script.async = true;
        script.setAttribute("data-render", "button");
        script.setAttribute("data-public-key", process.env.REACT_APP_WOMPI_SANDBOX_PUBLIC_KEY);
        script.setAttribute("data-currency", "COP");
        script.setAttribute("data-amount-in-cents", amount);
        script.setAttribute("data-reference", reference);
        script.setAttribute("data-signature:integrity", signature); // Corregido

        const form = document.getElementById("wompi-form");
        if (form) {
            form.appendChild(script);
        } else {
            console.error("Formulario 'wompi-form' no encontrado en el DOM.");
        }

        return () => {
            if (form) {
                form.removeChild(script);
            }
        };
    }, [signature]); // Solo se ejecuta cuando la firma cambia

    return (
        <form id="wompi-form">
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!signature && <p>Cargando botón de pago...</p>}
        </form>
    );
};

export default WompiPayment;