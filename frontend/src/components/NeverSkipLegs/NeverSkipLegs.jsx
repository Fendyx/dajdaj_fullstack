import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import AddCustomName from "../AddCustomName/AddCustomName";
import { addToCart } from "../../slices/cartSlice";

const NeverSkipLegs = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [selectedProduct, setSelectedProduct] = useState(null);

    const openModal = (e) => {
        e.preventDefault();
        setSelectedProduct({
            id: "never_skip_legs",
            name: "Kulturysta z Twoim imieniem",
            price: 59,
            link: "/never-skip-legs",
            image: "https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/Tomasz.png"
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

    return (
        <>
            <div className="body_of_product_info">
                <div className="main-container">
                    <div className="image-section">
                        <model-viewer
                            id="ballViewer"
                            src="/3dObj/NeverSkipLegs/newev_skip_legs.gltf"
                            shadow-intensity="1"
                            autoplay
                            camera-orbit="-15deg 75deg"
                            camera-controls
                            disable-zoom
                            poster="https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/Tomasz.png"
                        >
                        </model-viewer>
                    </div>

                    <div className="description-section">
                        <div className="heading-block">
                            <h1>Kulturysta z Twoim imieniem</h1>
                            <p>Idealny prezent dla fana siłowni. Spersonalizuj go imieniem wybranej osoby!</p>
                        </div>

                        <div className="features-list">
                            <div className="feature-element">
                                <div className="feature-icon">🔠</div>
                                <div className="feature-details">
                                    <h3>Imię na zamówienie</h3>
                                    <p>Wygraweruj imię bliskiej osoby lub przyjaciela – nadaj wyjątkowy charakter.</p>
                                </div>
                            </div>

                            <div className="feature-element">
                                <div className="feature-icon">🎁</div>
                                <div className="feature-details">
                                    <h3>Niepowtarzalny prezent</h3>
                                    <p>Każdy facet to pokocha! Zaskocz go czymś naprawdę wyjątkowym.</p>
                                </div>
                            </div>

                            <div className="feature-element">
                                <div className="feature-icon">🔥</div>
                                <div className="feature-details">
                                    <h3>Pewność siebie i motywacja</h3>
                                    <p>Podkreśl siłę i styl swojego chłopaka dzięki temu wyjątkowemu upominkowi.</p>
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
    );
};

export default NeverSkipLegs;
