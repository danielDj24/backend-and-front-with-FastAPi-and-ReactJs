import React, {useState,useEffect} from "react";
import { axiosInstance, resourcesInstance } from "../../functions/axiosConfig";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

import "./Brandscomponent.css"

const BrandsComponent= () => {
    const [brands, setBrands] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const FetchBrands = async () => {
        try{
            const response = await axiosInstance.get("/uploaded/brands");
            setBrands(response.data);
        } catch (error) {
            setError(error.response ? error.response.data.detail : "Error fetching config");
        } finally {
            setLoading(false);
        }
    }

    const responsive = {
        superLargeDesktop: {
        // the naming can be any, depends on you.
        breakpoint: { max: 4000, min: 1024 },
        items: 5
        },
        desktop: {
        breakpoint: { max: 1024, min: 768 },
        items: 3
        },
        tablet: {
        breakpoint: { max: 768, min: 464 },
        items: 2
        },
        mobile: {
        breakpoint: { max: 464, min: 0 },
        items: 1
        }
    };

    useEffect(() => {
        setLoading(true);
        FetchBrands();

    }, []);
    
        if (loading) {
            return <div>Loading...</div>;
        }

    return (
        <div>
            <Carousel showThumbs={false} showIndicators={false}
                responsive={responsive}
                autoPlay={true}
                autoPlaySpeed={3000}
                containerClass="carousel-container-brand"
            >
                {brands.map((brand, index) => (
                    <div key={index}>
                        <img
                            src={`${resourcesInstance.defaults.baseURL}${brand.brand_logo}`}
                            alt={brand.name_brand}
                            className="carousel-image-brand"
                        />
                    </div>
                ))}
            </Carousel>
        </div>
    );
};

export default BrandsComponent;
