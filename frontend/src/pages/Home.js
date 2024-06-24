import React from "react";
import MenuComponent from "../components/network/MenuComponent";
import { CustomModal } from "../components/functions/CustomModal";

const Home = () => {
    return (
        <div>
            <MenuComponent></MenuComponent>
            <CustomModal></CustomModal> 
        </div>
    );
};

export default Home;
