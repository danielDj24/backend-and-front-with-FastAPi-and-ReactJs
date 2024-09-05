import React from 'react';
import Breadcrumbs from "../../components/functions/BreadCums";
import { Container } from 'react-bootstrap';

import './Layout.css'

const Layout = ({ children }) => {
    return (
        <Container>
            <Breadcrumbs />
            {children}
        </Container>
    );
};

export default Layout;