import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import AddCustomName from "../AddCustomName/AddCustomName";
import { addToCart } from "../../slices/cartSlice";

const FemalePink = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [selectedProduct, setSelectedProduct] = useState(null);

    const openModal = (e) => {
        e.preventDefault();
        setSelectedProduct({
            id: "female_pink",
            name: "Różowa figurka z Twoim napisem",
            price: 59,
            link: "/female-pink",
            image: "https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/Agnieszka.png"
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
                            src="/3dObj/FemalePink/pink.gltf"
                            shadow-intensity="1"
                            autoplay
                            camera-orbit="-15deg 75deg "
                            camera-controls
                            disable-zoom
                            poster="https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/Agnieszka.png"
                        >
                        </model-viewer>
                    </div>

                    <div className="description-section">
                        <div className="heading-block">
                            <h1>Różowa figurka z Twoim napisem</h1>
                            <p>Wyjątkowy prezent dla każdej kobiety, która kocha siłownię, styl i siłę! Spersonalizuj ją imieniem!</p>
                        </div>
                
                        <div className="features-list">
                            <div className="feature-element">
                                <div className="feature-icon">🔠</div>
                                <div className="feature-details">
                                    <h3>Twój własny napis</h3>
                                    <p>Dodaj imię, motywujący cytat lub cokolwiek, co sprawi, że będzie jedyna w swoim rodzaju.</p>
                                </div>
                            </div>

                            <div className="feature-element">
                                <div className="feature-icon">💖</div>
                                <div className="feature-details">
                                    <h3>Dla wyjątkowej kobiety</h3>
                                    <p>Idealna niespodzianka dla dziewczyny, partnerki, mamy lub przyjaciółki.</p>
                                </div>
                            </div>

                            <div className="feature-element">
                                <div className="feature-icon">💪</div>
                                <div className="feature-details">
                                    <h3>Symbol siły i kobiecości</h3>
                                    <p>Pokazuje, że siła i styl mogą iść w parze - idealna ozdoba lub inspiracja.</p>
                                </div>
                            </div>

                            <div className="feature-element">
                                <div className="feature-icon">♻️</div>
                                <div className="feature-details">
                                    <h3>Ekologiczny wybór</h3>
                                    <p>Wykonane z biodegradowalnego materiału PLA - bezpieczne dla Ciebie i planety.</p>
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

export default FemalePink;
