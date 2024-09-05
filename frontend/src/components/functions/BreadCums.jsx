import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Breadcrumb } from "react-bootstrap";

const Breadcrumbs = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const pathnames = location.pathname.split('/').filter(x => x);

    const handleBreadcrumbClick = (to) => {
        navigate(to);
    };

    return (
        <Breadcrumb>
            <Breadcrumb.Item onClick={() => handleBreadcrumbClick("/")} style={{ cursor: 'pointer' }}>
                Inicio
            </Breadcrumb.Item>
            {pathnames.map((value, index) => {
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                return (
                    <Breadcrumb.Item
                        key={to}
                        onClick={() => handleBreadcrumbClick(to)}
                        style={{ cursor: 'pointer' }}
                        active={index === pathnames.length - 1}
                    >
                        {value}
                    </Breadcrumb.Item>
                );
            })}
        </Breadcrumb>
    );
};

export default Breadcrumbs;
