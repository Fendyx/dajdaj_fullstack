import "./Footer.css";
import footer_logo from "../../assets/img/footer_logo.png";

function Footer() {
    return (
        <footer>
            <div className="img_and_links">
                <img src={footer_logo} alt="Logo" />
                <div className="link_container_wrapper">
                    <div className="link_container">
                        <span className="link_title">Nawigacja</span>
                        <a href="/"><span className="footer_link">Główna</span></a>
                        <a href="/kontakt"><span className="footer_link">Kontakt</span></a>
                    </div>
                    <div className="link_container">
                        <span className="link_title">FAQ</span>
                        <a href="/polityka-zwrotu"><span className="footer_link">Polityka zwrotu</span></a>
                        <a href="/sposoby-platnosci"><span className="footer_link">Sposoby płatności</span></a>
                        <a href="/dostawa"><span className="footer_link">Dostawa</span></a>
                    </div>
                    <div className="link_container">
                        <span className="link_title">Media</span>
                        <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer">
                            <span className="footer_link">TikTok</span>
                        </a>
                        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                            <span className="footer_link">Instagram</span>
                        </a>
                        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                            <span className="footer_link">Facebook</span>
                        </a>
                    </div>
                </div>
            </div>
            <div className="footer_slogan">
                <span>WIĘCEJ NIŻ PREZENT</span>
            </div>
        </footer>
    );
}

export default Footer;
