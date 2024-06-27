import { create } from "zustand";
import Cookies from "js-cookie";

const useAuthStore = create((set) =>({
    token : null,
    setToken : (token) =>{ 
    set({ token });
    Cookies.set('auth_token', token, {expires: 2})},
    
    clearToken : () => {
        Cookies.remove('auth_token');
        set({ token:null });
    },

    checkToken: () => {
        const token = Cookies.get('auth_token');
        if (token) {
            set({ token });
        }
    }
}));

export default useAuthStore;
