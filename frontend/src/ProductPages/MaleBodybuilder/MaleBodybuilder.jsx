import React, { useState, useEffect, useRef } from 'react';
import { ImageCarousel } from '../ImageCarousel';
import { ProductDetails } from '../ProductDetails';
import { ThreeDViewButton } from '../ThreeDViewButton';
import FemaleModelPoster from "../../assets/img/arnold_wooden_stand_2.png";
import "../ProductPage.css"
import SimilarProducts from '../../components/SimilarProducts/SimilarProducts';

export default function MaleBodybuilder() {
  const productImages = [
    'https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/brunetteHair_web.png',
    'https://images.unsplash.com/photo-1704440278730-b420f5892700?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwc2lkZSUyMHZpZXclMjBwcm9kdWN0JTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzU1ODE3NDI5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1648316316198-5f15553e55df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwdG9wJTIwdmlldyUyMHN0dWRpbyUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc1NTgxNzQzNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1731401737053-313b3b8a447c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlbGVzcyUyMGhlYWRwaG9uZXMlMjBkZXRhaWwlMjBjbG9zZSUyMHVwfGVufDF8fHx8MTc1NTgxNzQ0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  ];

  const [currentImage, setCurrentImage] = useState(productImages[0]);
  const [show3D, setShow3D] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const modelViewerRef = useRef(null);


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
                id="femaleViewer"
                src="/3dObj/FemaleBlond/blond.gltf"
                shadow-intensity="1"
                autoplay
                camera-orbit="-90deg 75deg"
                camera-controls
                disable-zoom
                poster={FemaleModelPoster}
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
          <ProductDetails 
            show3D={show3D} 
            on3DToggle={handle3DToggle}
          />
          </div>
        </div>
      </div>
      <SimilarProducts 
            range={[1, 8]} 
            title="More from this collection" 
          />
    </div>
  );
}