import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosResetPassword } from "../../functions/axiosConfig";
import { ShowErrorAlter, ShowSuccesAlert } from '../../functions/Alerts';
import qs from 'qs'; // Importa qs para manejar el formato x-www-form-urlencoded
import "./ResetPassword.css"
const ResetPassword = () => {
    const navigate = useNavigate(); // Inicializa useNavigate
    const { token } = useParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(''); // Estado para el mensaje de error


     // Función para validar la contraseña
    const isPasswordValid = (password) => {
        const passwordPattern = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,16}$/; // Patrón: al menos una mayúscula, un número, entre 8 y 16 caracteres
        return passwordPattern.test(password);
    };

    // Función para manejar el restablecimiento de contraseña
    const handleResetPassword = async () => {
        setErrorMessage('');

        if (newPassword !== confirmPassword) {
            setErrorMessage("Las contraseñas no coinciden.");
            return;
        }

        if (!isPasswordValid(newPassword)) {
            setErrorMessage("La contraseña debe tener entre 8 y 16 caracteres, incluir al menos una letra mayúscula y un número.");
            return;
        }
        if (newPassword !== confirmPassword) {
            ShowErrorAlter("Las contraseñas no coinciden.");
            return;
        }

        try {
            // Crea el objeto que se enviará
            const data = qs.stringify({
                token: token, // Agrega el token
                new_password: newPassword // Agrega la nueva contraseña
            });

            const response = await axiosResetPassword.post("/reset-password", data); // Envía la solicitud
            ShowSuccesAlert("Contraseña restablecida correctamente. Ahora puedes iniciar sesión.");
            navigate('/'); // Redirige a la página principal
        } catch (error) {
            ShowErrorAlter("Error al restablecer la contraseña, por favor inténtalo de nuevo.");
        }
    };
    
    return (
        <div className="reset-password-container"> {/* Aplica la clase de estilos */}
            <h2>Restablecer Contraseña</h2>
            <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nueva Contraseña"
                required
            />
            <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmar Nueva Contraseña"
                required
            />
            {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Muestra el mensaje de error si existe */}
            <button onClick={handleResetPassword}>Restablecer Contraseña</button>
        </div>
    );
};

export default ResetPassword;