import React, { useState, useEffect, useRef } from 'react';
import { ImageCarousel } from '../ImageCarousel';
import { ProductDetails } from '../ProductDetails';
import { ThreeDViewButton } from '../ThreeDViewButton';
import BeerModelPoster from "../../assets/img/arnold_wooden_stand_2.png";
import "../ProductPage.css";
import SimilarProducts from '../../components/SimilarProducts/SimilarProducts';

export default function BeerEdition() {
  const productImages = [
    'https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/NewTrustedTheBulk.png',
    'https://images.unsplash.com/photo-1704440278730-b420f5892700?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1648316316198-5f15553e55df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1731401737053-313b3b8a447c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
  ];

  const [currentImage, setCurrentImage] = useState(productImages[0]);
  const [show3D, setShow3D] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const modelViewerRef = useRef(null);

  const handle3DToggle = () => {
    setShow3D((prev) => !prev);
  };

  useEffect(() => {
    const modelViewer = modelViewerRef.current;

    if (modelViewer) {
      const handleLoad = () => setIsLoading(false);
      const handleError = () => setIsLoading(false);

      modelViewer.addEventListener('load', handleLoad);
      modelViewer.addEventListener('error', handleError);

      return () => {
        modelViewer.removeEventListener('load', handleLoad);
        modelViewer.removeEventListener('error', handleError);
      };
    }
  }, [show3D]);

  return (
    <div className="product-page">
      <div className="product-page-container">
        <div className="product-layout">

          {/* Left Side */}
          <div className="product-left-side">
            {show3D ? (
              <div className="model-viewer-wrapper" style={{ position: 'relative' }}>
                {isLoading && (
                  <div className="loader-overlay">
                    <div className="spinner"></div>
                    <p>Loading model...</p>
                  </div>
                )}
              <model-viewer
                ref={modelViewerRef}
                id="beerViewer"
                src="/3dObj/BeerEdition/BeerEdition.gltf"
                shadow-intensity="1"
                autoplay
                camera-orbit="-90deg 75deg"
                camera-controls
                disable-zoom
                style={{ width: "100%", height: "500px" }}
              />
              </div>
            ) : (
              <ImageCarousel
                images={productImages}
                mainImage={currentImage}
                onImageChange={setCurrentImage}
              />
            )}
          </div>

          {/* Right Side */}
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
