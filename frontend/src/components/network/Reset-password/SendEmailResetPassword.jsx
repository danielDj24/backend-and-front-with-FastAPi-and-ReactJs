import React, { useState } from 'react';
import { sendResetPasswordEmail } from '../../functions/axiosConfig'; // Asegúrate de que esta función esté bien configurada
import { ShowErrorAlter, ShowSuccesAlert } from '../../functions/Alerts';
import "./ResetPassword.css"

const RequestPasswordReset = () => {
    const [email, setEmail] = useState('');

    const handleSendResetEmail = async () => {
        if (!email) {
            ShowErrorAlter('Por favor, ingresa un correo electrónico válido.'); // Validación adicional
            return;
        }
        try {
            // Asegúrate de que se envíe el email en el cuerpo de la solicitud
            await sendResetPasswordEmail.post('/reset-password/send-email', { email });
            ShowSuccesAlert('Hemos enviado un email con el enlace para restablecer la contraseña. Revisa tu correo.');
        } catch (error) {
            console.error("Error al enviar el correo:", error.response ? error.response.data : error.message);
            ShowErrorAlter(error.response?.data?.message || 'Error al enviar el correo. Por favor, inténtalo de nuevo.');
        }
    };


    return (
        <div className="reset-password-container"> {/* Aplica la clase de estilos */}
            <p><strong>Solicitar Restablecimiento de Contraseña</strong></p>
            <p>enviaremos un email con el enlace para establecer tu contraseña, revisa la bandeja de spam</p>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu correo electrónico"
                required
            />
            <button onClick={handleSendResetEmail}>Enviar</button>
        </div>
    );
};

export default RequestPasswordReset;
