import { useState } from "react";
import { ImageCarousel } from '../ImageCarousel';
import { ProductDetails } from '../ProductDetails';
import { ThreeDViewButton } from '../ThreeDViewButton';
import "../ProductPage.css"

export default function NeverSkipLegs() {
    const productImages = [
        'https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/NewNeverSkipLegDay.png',
        'https://images.unsplash.com/photo-1704440278730-b420f5892700?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwc2lkZSUyMHZpZXclMjBwcm9kdWN0JTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzU1ODE3NDI5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'https://images.unsplash.com/photo-1648316316198-5f15553e55df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwdG9wJTIwdmlldyUyMHN0dWRpbyUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc1NTgxNzQzNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'https://images.unsplash.com/photo-1731401737053-313b3b8a447c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlbGVzcyUyMGhlYWRwaG9uZXMlMjBkZXRhaWwlMjBjbG9zZSUyMHVwfGVufDF8fHx8MTc1NTgxNzQ0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        ];
    
      const [currentImage, setCurrentImage] = useState(productImages[0]);
    
      return (
        <div className="product-page">
          <div className="product-page-container">
            <div className="product-layout">
              {/* Left Side - Image Gallery */}
              <div className="product-left-side">
                <ImageCarousel
                  images={productImages}
                  mainImage={currentImage}
                  onImageChange={setCurrentImage}
                />
                
                {/* 3D View Button */}
                <div className="product-three-d-container">
                  <ThreeDViewButton />
                </div>
              </div>
    
              {/* Right Side - Product Details */}
              <div className="product-right-side">
              <ProductDetails
                productName="Figurine Brunette"
                productDescription="Experience crystal-clear sound with our premium wireless headphones. Featuring active noise cancellation and 30-hour battery life for uninterrupted listening pleasure."
                price="$299.99"
              />
              </div>
            </div>
          </div>
        </div>
      );
    }
