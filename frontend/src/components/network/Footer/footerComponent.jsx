import React, {useState,useEffect} from "react";
import { axiosInstance, resourcesInstance } from "../../functions/axiosConfig";
import { useTranslation } from "react-i18next";
//styles 
import "./FooterStyles.css"

//assets
import FacebookIcon from "../../../assets/icons/facebook-icon.svg";
//import InstagramIcon from "../assets/IconInstagram.svg";
import WhatsAppIcon from "../../../assets/icons/whatsapp-icon.svg";
import YoutubeIcon from "../../../assets/icons/youtube-icon.svg";
import TwitterIcon from "../../../assets/icons/twitter-icon.svg";
import BehanceIcon from "../../../assets/icons/behance-logo.svg";
import GithubIcon from "../../../assets/icons/github-logo.svg";




const FooterComponent = ({handleOpenLoginModal, userRole, handleLogout}) => {
    const { t } = useTranslation();
    const [primaryColor, setPrimaryColor] = useState('');
    const [secondaryColor, setSecondaryColor] = useState('');
    const [facebookLink, setFacebookLink] = useState('');
    const [whatsappLink, setWhatsappLink] = useState('');
    const [youtubeLink, setYoutubeLink] = useState('');
    const [twitterLink, setTwitterLink] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [address,setAddres] =useState('');
    const [logo, setLogo] = useState('');

    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchConfigSite = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("/config");
            const { primary_color, secondary_color, facebook_link, youtube_link, whatsapp_link, twitter_link, contact_email, contact_phone,address,logo_site  } = response.data;
            setPrimaryColor(primary_color);
            setSecondaryColor(secondary_color);
            setFacebookLink(facebook_link);
            setYoutubeLink(youtube_link);
            setWhatsappLink(whatsapp_link);
            setTwitterLink(twitter_link);
            setContactEmail(contact_email);
            setContactPhone(contact_phone);
            setAddres(address);
            setLogo(logo_site);
        } catch (error) {
            setError(error.response ? error.response.data.detail : "Error fetching config");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
    fetchConfigSite();
        }, []);

    if (loading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>Error: {error}</div>;
    }
    const handleLogoClick = () => {
        window.location.href = '/';
    };
    
    return (
        <footer className="footer-container" style={{ backgroundColor: secondaryColor, color: primaryColor }}>
            <div className="footer-content">
                <div className="footer-logo-container">
                    <img src={`${resourcesInstance.defaults.baseURL}${logo}`} alt="Logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }} />
                </div>
                <div className="address-container">
                    <div>
                        <h3>{t("addressTitle")}</h3>
                        <p>{address}</p>
                    </div>
                </div>
                <div className="contact-container">
                    <div>
                        <h3>{t("contactUsTitle")}</h3>
                        <p>{contactEmail}</p>
                        <p>{contactPhone}</p>
                    </div>
                </div>
                <div>
                    <div className="access-container">
                        <h3>{t("accessTitle")}</h3>
                        {!userRole ? (
                            <button className="btn btn-dark" onClick={handleOpenLoginModal}>
                                {t("loginButton")}
                            </button>
                        ) : (
                            <button className="btn btn-dark" onClick={handleLogout}>
                                {t("logoutButton")}
                            </button>
                        )}
                    </div>
                </div>
                <div>
                    <div className="social-links-container">
                        <div>
                            <h3>{t("socialMediaTitle")}</h3>
                            <a href={facebookLink}>
                                <img src={FacebookIcon} alt="Facebook" className="social-icon" /></a>
                            <a href={whatsappLink}>
                                <img src={WhatsAppIcon} alt="WhatsApp" className="social-icon" /></a>
                            <a href={youtubeLink}>
                                <img src={YoutubeIcon} alt="Youtube" className="social-icon" /></a>
                            <a href={twitterLink}>
                                <img src={TwitterIcon} alt="Twitter" className="social-icon" /></a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="copyright-container">
                <div>
                    <p>{t("copyrightText")} 2024 Frames. {t("allRightsReserved")} {t("privacyPolicy")}</p>
                    <p>
                        <a href="https://github.com/danielDj24" target="_blank" rel="noopener noreferrer">
                            <img src={GithubIcon} alt="GitHub" className="github-icon" />
                        </a>
                        {t("developedBy")} danielDj24
                    </p>
                    <p>
                        <a href="https://www.behance.net/cristhirodrigu21" target="_blank" rel="noopener noreferrer">
                            <img src={BehanceIcon} alt="Behance" className="behance-icon" />
                        </a>
                        {t("designsBy")} Camilo Mora
                    </p>
                </div>
            </div>
        </footer>
    );
};



export default FooterComponent;