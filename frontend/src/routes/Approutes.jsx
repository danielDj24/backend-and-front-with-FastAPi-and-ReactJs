import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

//componentes network
import Register from '../components/network/Register/Register'
import Login from "../components/network/Login/Login";
import Blogcomponent from "../components/network/Blog/BlogComponent";
//componentes intranet
import UsersList from "../components/intranet/UsersControl/ListUsers";
import UploadBanner from "../components/intranet/BannerControl/BannersUpload";
import ConfigSite from "../components/intranet/SiteControl/ConfigSite";
import UploadBrands from "../components/intranet/BrandControl/Brandcontrol";
//importacion de las paginas principales del sitio
import Home from "../pages/Home/Home";
import Blog from "../pages/Blog/Blog"

const AppRoutes = () => {
    
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element = {<Home/>} />
                <Route path="/register" element = {<Register/>} />
                <Route path="/login" element={<Login/>}></Route>
                <Route path="/intranet/config/control/users" element={<UsersList />} />
                <Route path="/intranet/config/upload/banners" element={<UploadBanner />} />
                <Route path="/intranet/config/edit/configsite" element={<ConfigSite />} />
                <Route path="/intranet/config/upload/brands" element={<UploadBrands />} />
                <Route path="/blog/*" element={<Blog view="blog" />} />
                <Route path="/notice/*" element={<Blogcomponent view="detail" />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;