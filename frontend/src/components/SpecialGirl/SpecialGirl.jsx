import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import AddCustomName from "../AddCustomName/AddCustomName";
import { addToCart } from "../../slices/cartSlice";

const SpecialGirl = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [selectedProduct, setSelectedProduct] = useState(null);

    const openModal = (e) => {
        e.preventDefault();
        setSelectedProduct({
            id: "special_girl",
            name: "Modelka jak z okładki – z Twoim podpisem!",
            price: 59,
            link: "/special-girl",
            image: "https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/Onlyfans.png"
        });
    };

    const closeModal = () => {
        setSelectedProduct(null);
    };

    const handleConfirm = (productWithCustomText) => {
        dispatch(addToCart(productWithCustomText));
        closeModal();
        navigate("/cart");
    };

    return(
        <>
            <div className="body_of_product_info">
                <div className="main-container">
                    <div className="image-section">
                        <model-viewer
                            id="ballViewer"
                            src="/3dObj/SpecialGirl/specialGirl.gltf"
                            shadow-intensity="1"
                            autoplay
                            camera-orbit="-15deg 75deg "
                            camera-controls
                            disable-zoom
                            poster="https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/Onlyfans.png"
                        >
                        </model-viewer>
                    </div>

                    <div className="description-section">
                        <div className="heading-block">
                            <h1>Modelka jak z okładki – z Twoim podpisem!</h1>
                            <p>Dla dziewczyny, która wie, że aparat ją kocha. Odważny prezent, który bawi, kusi i zaskakuje!</p>
                        </div>
                
                        <div className="features-list">
                            <div className="feature-element">
                                <div className="feature-icon">🔠</div>
                                <div className="feature-details">
                                    <h3>Dodaj własny podpis</h3>
                                    <p>Twoje imię? Jej pseudonim? A może „Miss Selfie”? Personalizuj, jak tylko chcesz!</p>
                                </div>
                            </div>

                            <div className="feature-element">
                                <div className="feature-icon">📸</div>
                                <div className="feature-details">
                                    <h3>Gwiazda Instagrama</h3>
                                    <p>Idealna dla królowej selfie i wszystkich, którzy kochają trochę błysku i stylu.</p>
                                </div>
                            </div>

                            <div className="feature-element">
                                <div className="feature-icon">😉</div>
                                <div className="feature-details">
                                    <h3>Seksowny żart</h3>
                                    <p>Prezent z przymrużeniem oka – wywołuje uśmiech i rumieńce!</p>
                                </div>
                            </div>

                            <div className="feature-element">
                                <div className="feature-icon">♻️</div>
                                <div className="feature-details">
                                    <h3>Ekologiczny wybór</h3>
                                    <p>Wykonane z biodegradowalnego materiału PLA – bezpieczne dla Ciebie i planety.</p>
                                </div>
                            </div>
                        </div>

                        <div className="purchase-section">
                            <div className="price-tag">59 zł</div>
                            <button className="purchase-button" onClick={openModal}>Kup teraz</button>
                        </div>
                    </div>
                </div>
            </div>

            {selectedProduct && (
                <AddCustomName
                    product={selectedProduct}
                    onClose={closeModal}
                    onConfirm={handleConfirm}
                />
            )}
        </>
    )
}

export default SpecialGirl;
