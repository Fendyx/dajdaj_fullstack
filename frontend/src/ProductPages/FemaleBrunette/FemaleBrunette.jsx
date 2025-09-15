import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import AddCustomName from "../../components/AddCustomName/AddCustomName";
import { addToCart } from "../../slices/cartSlice";

const FemaleBrunette = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [selectedProduct, setSelectedProduct] = useState(null);

    const openModal = (e) => {
        e.preventDefault();
        setSelectedProduct({
            id: "female_brunette",
            name: "Figurka brunetki z Twoim napisem",
            price: 59,
            link: "/female-brunette",
            image: "https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/Ewa.png"
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
                            src="/3dObj/FemaleBrunette/brunette.gltf"
                            shadow-intensity="1"
                            autoplay
                            camera-orbit="-15deg 75deg "
                            camera-controls
                            disable-zoom
                            poster="https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/Ewa.png"
                        >
                        </model-viewer>
                    </div>

                    <div className="description-section">
                        <div className="heading-block">
                            <h1>Figurka brunetki z Twoim napisem</h1>
                            <p>Idealny prezent dla fanki fitnessu lub siłowni. Możesz dodać imię lub inspirujący tekst!</p>
                        </div>
                
                        <div className="features-list">
                            <div className="feature-element">
                                <div className="feature-icon">🔠</div>
                                <div className="feature-details">
                                    <h3>Spersonalizowany napis</h3>
                                    <p>Dodaj unikalny tekst, który najlepiej pasuje do obdarowanej osoby.</p>
                                </div>
                            </div>

                            <div className="feature-element">
                                <div className="feature-icon">🎁</div>
                                <div className="feature-details">
                                    <h3>Niezapomniany prezent</h3>
                                    <p>Dla dziewczyny, przyjaciółki lub siostry - idealny, by sprawić radość.</p>
                                </div>
                            </div>

                            <div className="feature-element">
                                <div className="feature-icon">💃</div>
                                <div className="feature-details">
                                    <h3>Styl i siła</h3>
                                    <p>Podkreśl jej wyjątkowość - figurka, która łączy pasję i charakter.</p>
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

export default FemaleBrunette;
