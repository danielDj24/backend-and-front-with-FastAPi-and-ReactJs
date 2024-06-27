import React from "react";
import Intranet from "../components/intranet/HomeIntranet" 
import { CustomModal } from "../components/functions/CustomModal";

const IntranetHome = () => {
    return (
        <div>
            <Intranet></Intranet>
            <CustomModal></CustomModal> 
        </div>
    );
};

export default IntranetHome;
