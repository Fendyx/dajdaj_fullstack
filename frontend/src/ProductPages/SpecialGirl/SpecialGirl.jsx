import React, { useState } from 'react';
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import AddCustomName from "../../components/AddCustomName/AddCustomName";
import { addToCart } from "../../slices/cartSlice";
import { ImageCarousel } from '../ImageCarousel';
import { ProductDetails } from '../ProductDetails';
import { ThreeDViewButton } from '../ThreeDViewButton';

const SpecialGirl = () => {
    const productImages = [
        'https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/NewPiwoEdycja_withBox.png',
        'https://images.unsplash.com/photo-1704440278730-b420f5892700?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwc2lkZSUyMHZpZXclMjBwcm9kdWN0JTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzU1ODE3NDI5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'https://images.unsplash.com/photo-1648316316198-5f15553e55df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwdG9wJTIwdmlldyUyMHN0dWRpbyUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc1NTgxNzQzNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'https://images.unsplash.com/photo-1731401737053-313b3b8a447c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlbGVzcyUyMGhlYWRwaG9uZXMlMjBkZXRhaWwlMjBjbG9zZSUyMHVwfGVufDF8fHx8MTc1NTgxNzQ0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        ];
    
      const [currentImage, setCurrentImage] = useState(productImages[0]);

    return(
        <div className="page">
      <div className="page-container">
        <div className="layout">
          {/* Left Side - Image Gallery */}
          <div className="left-side">
            <ImageCarousel
              images={productImages}
              mainImage={currentImage}
              onImageChange={setCurrentImage}
            />
            
            {/* 3D View Button */}
            <div className="three-d-container">
              <ThreeDViewButton />
            </div>
          </div>

          {/* Right Side - Product Details */}
          <div className="right-side">
          <ProductDetails
                product={{
                  name: "Figurine Brunette",
                  description: "Experience crystal-clear sound...",
                  price: "$299.99",
                  image: currentImage,
                }}
              />
          </div>
        </div>
      </div>
    </div>
    )
}

export default SpecialGirl;
