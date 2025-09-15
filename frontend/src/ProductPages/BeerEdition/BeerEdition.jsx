import React, { useState } from 'react';
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../../slices/cartSlice";
import { ImageCarousel } from '../ImageCarousel';
import { ProductDetails } from '../ProductDetails';
import { ThreeDViewButton } from '../ThreeDViewButton';
import { PersonalizationModal } from '../../components/PersonalizationModal/PersonalizationModal';

const BeerEdition = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const productImages = [
    'https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/NewPiwoEdycja_withBox.png',
    'https://images.unsplash.com/photo-1704440278730-b420f5892700?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1648316316198-5f15553e55df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1731401737053-313b3b8a447c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080'
  ];

  const [currentImage, setCurrentImage] = useState(productImages[0]);
  const [showModal, setShowModal] = useState(false);

  const productInfo = {
    name: "Beer Edition",
    description: "Experience crystal-clear sound with our premium wireless headphones. Featuring active noise cancellation and 30-hour battery life for uninterrupted listening pleasure.",
    price: 299.99,
    image: productImages[0],
    phrases: [
      "Cheers to strength",
      "Train hard, sip easy",
      "Beer and gains unite",
      "Work out, chill out",
      "Sip after the set"
    ]
  };

  const handleAddToCartClick = () => {
    setShowModal(true);
  };

  const handleConfirmPersonalization = (personalizedData) => {
    const productWithPersonalization = {
      ...productInfo,
      ...personalizedData,
    };
    dispatch(addToCart(productWithPersonalization));
    setShowModal(false);
    navigate("/cart");
  };

  return (
    <div className="page">
      <div className="page-container">
        <div className="layout">
          <div className="left-side">
            <ImageCarousel
              images={productImages}
              mainImage={currentImage}
              onImageChange={setCurrentImage}
            />
            <div className="three-d-container">
              <ThreeDViewButton />
            </div>
          </div>

          <div className="right-side">
            <ProductDetails />
          </div>
        </div>
      </div>

      {showModal && (
        <PersonalizationModal
          product={productInfo}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmPersonalization}
        />
      )}
    </div>
  );
};

export default BeerEdition;
