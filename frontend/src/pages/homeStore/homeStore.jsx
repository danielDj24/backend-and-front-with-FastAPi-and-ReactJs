    import React, {useState,useEffect} from "react";
    import MenuComponent from "../../components/network/Menu/MenuComponent";
    import Banners from "../../components/network/Banners/bannerscomponet";
    import FooterComponent from "../../components/network/Footer/footerComponent"

    import {CustomModal} from "../../components/functions/CustomModal";
    import Login from "../../components/network/Login/Login";
    import Register from "../../components/network/Register/Register";
    import useAuthStore from "../../components/store/userAuthToken";



    const HomeEcomerce = () =>{
        // Constantes para controlar el login y el registro en el modal de usuarios
        const [activeForm, setActiveForm] = useState('login');
        const [showLoginModal, setShowLoginModal] = useState(false);

        // Control de rutas para el login admin
        const [userRole, setUserRole] = useState(null);

        const handleOpenLoginModal = () => setShowLoginModal(true);
        const handleCloseLoginModal = () => setShowLoginModal(false);

        useEffect(() => {
            // Método para obtener el token almacenado
            useAuthStore.getState().checkToken();
            const storedToken = useAuthStore.getState().token;
            setUserRole(storedToken ? 'admin' : null);
        }, []);
            
        const handleLoginSuccess = (role) => {
            setUserRole(role); 
            setShowLoginModal(false);            
        };

        const handleLogout = () => {
            useAuthStore.getState().clearToken();
            setUserRole(null);
        };
        return (
            <div className="home-ecommerce">
                <MenuComponent
                    handleOpenLoginModal={handleOpenLoginModal}
                    userRole={userRole}
                    handleLogout={handleLogout}
                    isECommerce={true}
                />
                    <Banners positionFilter={2} />

            </div>
        )
    };

    export default HomeEcomerce;