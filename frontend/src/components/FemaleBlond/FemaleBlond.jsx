import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import AddCustomName from "../AddCustomName/AddCustomName";
import { addToCart } from "../../slices/cartSlice";

const FemaleBlond = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [selectedProduct, setSelectedProduct] = useState(null);

    const openModal = (e) => {
        e.preventDefault();
        setSelectedProduct({
            id: "female_blond",
            name: "Figurka fit dziewczyny z Twoim napisem",
            price: 59,
            link: "/female-blond",
            image: "https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/Zosia_figure.png"
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
                            src="/3dObj/FemaleBlond/blond.gltf"
                            shadow-intensity="1"
                            autoplay
                            camera-orbit="-15deg 75deg "
                            camera-controls
                            disable-zoom
                            poster="https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/Zosia_figure.png"
                        >
                        </model-viewer>
                    </div>

                    <div className="description-section">
                        <div className="heading-block">
                            <h1>Figurka fit dziewczyny z Twoim napisem</h1>
                            <p>Idealny prezent dla miłośniczki siłowni lub aktywnego stylu życia. Spersonalizuj ją imieniem lub zabawnym tekstem!</p>
                        </div>
                
                        <div className="features-list">
                            <div className="feature-element">
                                <div className="feature-icon">🔠</div>
                                <div className="feature-details">
                                    <h3>Spersonalizowany napis</h3>
                                    <p>Dodaj imię, ksywkę lub motywujące hasło – niech będzie naprawdę wyjątkowa.</p>
                                </div>
                            </div>

                            <div className="feature-element">
                                <div className="feature-icon">🎁</div>
                                <div className="feature-details">
                                    <h3>Prezent, który zaskoczy</h3>
                                    <p>Dla siostry, przyjaciółki, dziewczyny – idealny upominek, który wywoła uśmiech.</p>
                                </div>
                            </div>

                            <div className="feature-element">
                                <div className="feature-icon">💪</div>
                                <div className="feature-details">
                                    <h3>Duma i inspiracja</h3>
                                    <p>Podkreśl jej pasję i siłę. Ta figurka to symbol determinacji i stylu.</p>
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

export default FemaleBlond;
