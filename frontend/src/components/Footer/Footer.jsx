import "./Footer.css";
import footer_logo from "../../assets/img/footer_logo.png"

function Footer() {
    return (
        <footer>
        <div class="img_and_links">
            <img src={footer_logo}></img>
            <div class="link_container_wrapper">
                <div class="link_container">
                    <span class="link_title">Pages</span>
                    <span class="footer_link">Home</span>
                    <span class="footer_link">Products</span>
                    <span class="footer_link">Contact</span>
                </div>
                <div class="link_container">
                    <span class="link_title">FAQ</span>
                    <span class="footer_link">Return policy</span>
                    <span class="footer_link"></span>
                </div>
                <div class="link_container">
                    <span class="link_title">Our social</span>
                    <span class="footer_link">Tik tok</span>
                    <span class="footer_link">Instagram</span>
                    <span class="footer_link">Youtube</span>
                </div>
            </div>
        </div>
        <div class="footer_slogan">
            <span>MORE THAN A GIFT</span>
        </div>
    </footer>
    );
  }
  
  export default Footer;