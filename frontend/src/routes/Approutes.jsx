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
import CreateProduct from "../components/intranet/ProductsControl/ProductsControl";
import CreateShape from "../components/intranet/ShapeControl/shapeControl";
import CreateDiscount from "../components/intranet/DiscountsControl/discountControl";
//importacion de las paginas principales del sitio

import Home from "../pages/Home/Home";
import Blog from "../pages/Blog/Blog"
import AboutUs from "../pages/AboutUs/aboutUs";
import WhatUs from "../pages/WhatUS/whatUs";
import Intranet from "../pages/HomeIntranet/HomeIntranet";
import DetailProduct from "../pages/Detail/Detailproduct";
import ProductsByPrice from "../pages/EconomicProducts/ProductsbyPrice";
import ResetPassword from "../components/network/Reset-password/ResetPassword";

//importacion paginas del e-commerce 
import HomeEcomerce from "../pages/homeStore/homeStore";
import Shop from "../pages/Shop/Shop";
import SearchPage from "../pages/SearchPage/SearchComponent";
import SearchProductsByDiscount from "../pages/Discounts/DiscountPage";
import ProductsByType from "../components/e-commerce/productsType/productsComponent";
import ProductsByDiscounts from "../components/e-commerce/productsDiscounts/productsDiscounts";
import ProductsByBrand from "../components/e-commerce/productsBrands/productsBrands";
import CartShop from "../pages/Cart/Cart";
//proteccion de rutas 
import ProtectedRoute from "../components/store/ProtectedRoute";
import UpdateTitleAndFavIcon from "../components/functions/updateTitlendFavIcon";


const AppRoutes = () => {
    
    return (
        <BrowserRouter>
        <UpdateTitleAndFavIcon/>
            <Routes>
                {/* rutas del website */}
                <Route path="/*" element = {<Home/>}   />
                <Route path="/sobre-nosotros" element={< AboutUs/>}/>
                <Route path="/por-que-nosotros" element={< WhatUs/>}/>
                <Route path="/blog/*" element={<Blog view="blog" />} />
                <Route path="/notice/*" element={<Blogcomponent view="detail" />} />
                <Route path= "/reset-password/:token" element={<ResetPassword/>} />
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
                <Route
                    path="/intranet/config/upload/products"
                    element={<ProtectedRoute roles={['admin']} element={CreateProduct} />}
                />
                <Route
                    path="/intranet/config/upload/shapes"
                    element={<ProtectedRoute roles={['admin']} element={CreateShape} />}
                />
                <Route
                    path="/intranet/config/upload/discounts"
                    element={<ProtectedRoute roles={['admin']} element={CreateDiscount} />}
                />
                
                {/* rutas e-commerce */}
                
                <Route
                path = "/e-commerce"
                element= {<ProtectedRoute roles={['admin', 'client']} element={HomeEcomerce} />}
                />

                <Route
                path = "/e-commerce/products"
                element= {<ProtectedRoute roles={['admin', 'client']} element={Shop} />}
                />

                <Route
                    path="/e-commerce/products/search"
                    element={<ProtectedRoute roles={['admin', 'client']} element={SearchPage} />} 
                />
                <Route
                    path="/e-commerce/products/discounts"
                    element={<ProtectedRoute roles={['admin', 'client']} element={SearchProductsByDiscount} />} 
                />
                <Route
                    path="/e-commerce/products/gender/:gender"
                    element={<ProtectedRoute roles={['admin', 'client']} element={ProductsByType} />} 
                />
                <Route
                    path="/e-commerce/products/discounts/:discountId"
                    element={<ProtectedRoute roles={['admin', 'client']} element={ProductsByDiscounts} />} 
                />
                <Route
                    path="/e-commerce/products/brands/:brandId"
                    element={<ProtectedRoute roles={['admin', 'client']} element={ProductsByBrand} />} 
                />
                <Route 
                    path="/e-commerce/products/detail/:productId"
                    element={<ProtectedRoute roles={['admin', 'client']} element={DetailProduct} />}
                />
                <Route 
                    path="/e-commerce/cart/:userId"
                    element={<ProtectedRoute roles={['admin', 'client']} element={CartShop} />}
                />
                <Route 
                    path="/e-commerce/products/price"
                    element={<ProtectedRoute roles={['admin', 'client']} element={ProductsByPrice} />}
                />
                
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;