import { create } from "zustand";
import Cookies from "js-cookie";

const useAuthStore = create((set) =>({
    token : null,
    setToken : (token) =>{ 
    console.log("Token received and stored:");
    set({ token });
    Cookies.set('auth_token', token, {expires: 2})},
    
    clearToken : () => {
        Cookies.remove('auth_token');
        set({ token:null });
    },
}));

export default useAuthStore;
