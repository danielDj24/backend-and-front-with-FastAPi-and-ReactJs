import { jwtDecode } from "jwt-decode";

const getUserIdFromToken = (token) =>{
    try {
        const decoded = jwtDecode(token);
        return decoded.id
    } catch (error) {
        console.error("Failed to decode token", error);
        return null;
    }
};


export default getUserIdFromToken