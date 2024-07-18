import  {useEffect,useState} from "react";

import { useLocation } from 'react-router-dom';
    // import { Helmet } from "react-helmet"
import { resourcesInstance,axiosInstance } from "./axiosConfig";

const UpdateTitleAndFavIcon  = ()=>{
    const location = useLocation();
    const [config, setConfig] = useState('');

    useEffect(() => {
        axiosInstance.get('/config')
            .then(response => {
                const data = response.data;
                setConfig(data);
            })
            .catch(error => {
                console.error('Error fetching data', error);
            });
    }, []);

    useEffect(() => {
        let title = 'e-commerce';
        let favicon = `${resourcesInstance.defaults.baseURL}${config.fav_icon}`;

        switch (location.pathname) {
            case '/':
                title = 'Inicio - e-commerce';
                break;
            case '/sobre-nosotros':
                title = 'Sobre Nosotros - e-commerce';
                break;
            case '/por-que-nosotros':
                title = 'Por Qué Nosotros - e-commerce';
                break;
            case '/blog':
                title = 'Blog - e-commerce';
                break;
            case '/intranet/':
                title = 'Intranet - Home';
                break;
            case '/intranet/config/control/users':
                title = 'Intranet - Usuarios';
                break;
            case '/intranet/config/upload/banners':
                title = 'Intranet - Banners';
                break;
            case '/intranet/config/edit/configsite':
            title = 'Intranet - configuración';
            break;
            case '/intranet/config/upload/brands':
            title = 'Intranet - Marcas';
            break;
            case '/intranet/config/upload/notices':
                title = 'Intranet - Noticias';
                break;
            case '/intranet/config/upload/products':
                title = 'Intranet - Productos';
                break;
            case '/e-commerce':
                title = 'e-commerce - Home';
                break;
            
            default:
                title = 'e-commerce';
        }

        document.title = title;
        const link = document.querySelector("link[rel*='icon']");
        if (link) {
            link.href = favicon;
        } else {
            const newLink = document.createElement('link');
            newLink.rel = 'icon';
            newLink.href = favicon;
            document.head.appendChild(newLink);
        }
    }, [location, config.fav_icon]); 

    return null;
};



export default UpdateTitleAndFavIcon;