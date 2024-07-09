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
import UploadNotices from "../components/intranet/NoticesControl/NoticesControl";

//importacion de las paginas principales del sitio
import Home from "../pages/Home/Home";
import Blog from "../pages/Blog/Blog"
import AboutUs from "../pages/AboutUs/aboutUs";
import WhatUs from "../pages/WhatUS/whatUs";
import Intranet from "../pages/HomeIntranet/HomeIntranet";

//importacion paginas del e-commerce 
import HomeEcomerce from "../pages/homeStore/homeStore";

//proteccion de rutas 
import ProtectedRoute from "../components/store/ProtectedRoute";
import UpdateTitleAndFavIcon from "../components/functions/updateTitlendFavIcon";


const AppRoutes = () => {
    
    return (
        <BrowserRouter>
        <UpdateTitleAndFavIcon/>
            <Routes>
                {/* rutas del website */}

                <Route path="/*" element = {<Home/>} />
                <Route path="/sobre-nosotros" element={< AboutUs/>}/>
                <Route path="/por-que-nosotros" element={< WhatUs/>}/>
                <Route path="/blog/*" element={<Blog view="blog" />} />
                <Route path="/notice/*" element={<Blogcomponent view="detail" />} />
                
                <Route path="/register" element = {<Register/>} />
                <Route path="/login" element={<Login/>} />
                

                {/* rutas de la intranet */}

                <Route
                    path="/intranet/"
                    element={<ProtectedRoute roles={['admin']} element={Intranet} />}
                />
                <Route
                    path="/intranet/config/control/users"
                    element={<ProtectedRoute roles={['admin']} element={UsersList} />}
                />
                <Route
                    path="/intranet/config/upload/banners"
                    element={<ProtectedRoute roles={['admin']} element={UploadBanner} />}
                />
                <Route
                    path="/intranet/config/edit/configsite"
                    element={<ProtectedRoute roles={['admin']} element={ConfigSite} />}
                />
                <Route
                    path="/intranet/config/upload/brands"
                    element={<ProtectedRoute roles={['admin']} element={UploadBrands} />}
                />
                <Route
                    path="/intranet/config/upload/notices"
                    element={<ProtectedRoute roles={['admin']} element={UploadNotices} />}
                />
                {/* rutas e-commerce */}
                <Route
                path = "/e-commerce"
                element= {<ProtectedRoute roles={['admin', 'client']} element={HomeEcomerce} />}
                />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;