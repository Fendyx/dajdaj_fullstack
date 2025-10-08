import React, { useState } from 'react';
import { ImageCarousel } from '../ImageCarousel';
import { ProductDetails } from '../ProductDetails';
import { ThreeDViewButton } from '../ThreeDViewButton';
import BeerModelPoster from "../../assets/img/arnold_wooden_stand_2.png"; // постер
import "../ProductPage.css"

export default function BeerEdition() {
  const productImages = [
    'https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/NewPiwoEdycja_withBox.png',
    'https://images.unsplash.com/photo-1704440278730-b420f5892700?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1648316316198-5f15553e55df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1731401737053-313b3b8a447c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
  ];

  const [currentImage, setCurrentImage] = useState(productImages[0]);
  const [show3D, setShow3D] = useState(false);

  const handle3DToggle = () => {
    setShow3D((prev) => !prev);
  };

  return (
    <div className="product-page">
      <div className="product-page-container">
        <div className="product-layout">
          {/* Left Side - Gallery / 3D */}
          <div className="product-left-side">
            {show3D ? (
              <model-viewer
                id="beerViewer"
                src="/3dObj/BeerEdition/BeerEdition.gltf"
                shadow-intensity="1"
                autoplay
                camera-orbit="-90deg 75deg"
                camera-controls
                disable-zoom
                poster={BeerModelPoster}
                style={{ width: "100%", height: "500px" }}
              >
              </model-viewer>
            ) : (
              <ImageCarousel
                images={productImages}
                mainImage={currentImage}
                onImageChange={setCurrentImage}
              />
            )}

            {/* 3D View Button */}
            <div className="product-three-d-container">
              <ThreeDViewButton onClick={handle3DToggle} is3DMode={show3D} />
            </div>
          </div>

          {/* Right Side - Product Details */}
          <div className="product-right-side">
            <ProductDetails />
          </div>
        </div>
      </div>
    </div>
  );
}
