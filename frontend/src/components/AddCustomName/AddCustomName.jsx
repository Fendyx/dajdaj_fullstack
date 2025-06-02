import React from 'react';
import "./AddCustomName.css";
import { useState } from 'react';
import { toast } from 'react-toastify';

const AddCustomName = ({ product, onClose, onConfirm }) => {
    const [text, setText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) {
            toast.error("Please enter custom text", {
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
            <div className="modal">
                <button className="close-button" onClick={onClose} disabled={isSubmitting}>
                    &times;
                </button>
                <img src={product.image} alt={product.name} />
                <div className="AddCustomName_productName">{product.name}</div>
                <span className="AddCustomName_InputDescription">
                    Write down a text you want to see on the stand
                </span>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Enter text for stand"
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
                        {isSubmitting ? "Adding..." : "Add to Cart"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddCustomName;
  

