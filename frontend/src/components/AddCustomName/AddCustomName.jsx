import React, { useState } from 'react';
import "./AddCustomName.css";
import { toast } from 'react-toastify';

const AddCustomName = ({ product, onClose, onConfirm }) => {
    const [text, setText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) {
            toast.error("Wprowadź tekst personalizacji", {
                position: "bottom-left",
                autoClose: 2000,
            });
            return;
        }
        setIsSubmitting(true);
        onConfirm({
            ...product,
            customText: text.trim()
        });
        setIsSubmitting(false);
    };

    if (!product) return null;

    return (
        <div className="AddCustomName_window">
            <div className="overlay" onClick={onClose}></div>
            <div className="modal modal-fade-in">
                <button className="close-button" onClick={onClose} disabled={isSubmitting}>
                    &times;
                </button>
                <img src={product.image} alt={product.name} />
                <div className="AddCustomName_productName">{product.name}</div>
                <span className="AddCustomName_InputDescription">
                    Wpisz tekst, który ma pojawić się na podstawce
                </span>
                <span className="AddCustomName_Warning">
                    Jeśli nie podasz własnego tekstu, zostanie użyty domyślny, jak na zdjęciu.
                </span>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Wpisz tekst do wygrawerowania"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        required
                        minLength={2}
                        maxLength={100}
                        disabled={isSubmitting}
                    />
                    <button 
                        className="confirm-button"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Dodawanie..." : "Dodaj do koszyka"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddCustomName;

  

