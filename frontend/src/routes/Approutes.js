import React, { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Register from '../components/network/Register'
import Login from "../components/network/Login";


//importacion de las paginas principales del sitio
import Home from "../pages/Home";
import IntranetHome from "../pages/IntranetHome";

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element = {<Home></Home>}></Route>
                <Route path="/register" element = {<Register></Register>}></Route>
                <Route path="/login" element = {<Login></Login>}></Route>
                <Route path="/intranet/config/home" element = {<IntranetHome></IntranetHome>}></Route>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;