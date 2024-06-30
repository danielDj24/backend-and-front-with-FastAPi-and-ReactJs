import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

//componentes network
import Register from '../components/network/Register'
import Login from "../components/network/Login";

//componentes intranet
import UsersList from "../components/intranet/ListUsers";
import UploadBanner from "../components/intranet/BannersUpload";
import ConfigSite from "../components/intranet/ConfigSite";

//importacion de las paginas principales del sitio
import Home from "../pages/Home";
import IntranetHome from "../pages/IntranetHome";

const AppRoutes = () => {
    
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element = {<Home></Home>} />
                <Route path="/register" element = {<Register></Register>} />
                <Route path="/login" element={<Login/>}></Route>
                <Route path="/intranet/config/home" element={<IntranetHome />} />
                <Route path="/intranet/config/control/users" element={<UsersList />} />
                <Route path="/intranet/config/upload/banners" element={<UploadBanner />} />
                <Route path="/intranet/config/edit/configsite" element={<ConfigSite />} />


            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;