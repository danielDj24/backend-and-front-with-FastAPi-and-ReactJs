import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Register from '../components/Register'
import Login from "../components/Login";
import Dashboard from "../components/Dashboard";

//importacion de las paginas principales del sitio
import Home from "../pages/Home";
import About from "../pages/About";
import Profile from "../pages/Profile";

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route exact path="/" element = {<Home></Home>}></Route>
                <Route path="/about" element = {<About></About>}></Route>
                <Route path="/profile" element = {<Profile></Profile>}></Route>
                <Route path="/register" element = {<Register></Register>}></Route>
                <Route path="/login" element = {<Login></Login>}></Route>
                <Route path="/dashboard" element = {<Dashboard></Dashboard>}></Route>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;