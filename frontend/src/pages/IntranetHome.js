import React from "react";
import Welcome from "../components/intranet/Welcome" 
import { CustomModal } from "../components/functions/CustomModal";

const IntranetHome = () => {
    return (
        <div>
            <Welcome></Welcome>
            <CustomModal></CustomModal> 
        </div>
    );
};

export default IntranetHome;
