import React, { useState, useEffect } from "react";
import { axiosInstance, resourcesInstance } from "./axiosConfig";
import "../styles/menuStyles.css";
import { Button } from "bootstrap";
 

const MenuComponent = () => {
    const [logo, setLogo] = useState('');
    const [primaryColor, setPrimaryColor] = useState('');
    const [secondaryColor, setSecondaryColor] = useState('');
    const [menuData, setMenuData] = useState([]);

    useEffect(() => {
        axiosInstance.get('/config')
        .then(response =>  {
            const data = response.data;
            setLogo(data.logo_site);
            setPrimaryColor(data.primary_color);
            setSecondaryColor(data.secondary_color);
            const menuArray = data.menu.split(",");
            setMenuData(menuArray);
        })
        .catch(error => {
            console.error('Error fetching data', error);
        });
    }, []);

    return (
        <div className= "Menu">
            <div className="menu-container" style={{ backgroundColor: primaryColor }}>
                <img src={`${resourcesInstance.defaults.baseURL}${logo}`} alt="Site logo" className="logo-img" />
                <nav className="menu-nav">
                    {menuData.map((menuItem, index) => (
                        <p key={index} className="menu-item" style={{ color: secondaryColor }}>{menuItem}</p>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default MenuComponent;
