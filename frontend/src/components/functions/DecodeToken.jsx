import { jwtDecode } from "jwt-decode";

const getRoleFromToken = (token) => {
    
    try {
        const decoded = jwtDecode(token);
        

        return decoded.role;
    } catch (error) {
        console.error("Failed to decode token", error);
        return null;
    } 


};

export default getRoleFromToken;
