import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Импорт для навигации
import { useSelector } from 'react-redux'; // Импорт для проверки авторизации
import { ImageCarousel } from '../ImageCarousel';
import { ProductDetails } from '../ProductDetails';
import { ThreeDViewButton } from '../ThreeDViewButton';
// ... остальные импорты
import "../ProductPage.css";
import SimilarProducts from '../../components/SimilarProducts/SimilarProducts';

export default function BeerEdition() {
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);

  // --- ХАРДКОД ДАННЫХ ТОВАРА ---
  // Убедись, что ID совпадает с тем, что в базе данных (MongoDB)
  const productData = {
    id: "beer-edition-id", // <-- ЗАМЕНИ НА РЕАЛЬНЫЙ ID ТОВАРА ИЗ БАЗЫ
    name: "Beer Edition Special",
    price: 50, // <-- Цена
    image: 'https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/NewPiwoEdycja_withBox.png',
    qty: 1
  };

  const productImages = [
    'https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/kuba.png',
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

  // --- ЛОГИКА PAY NOW ---
  const handlePayNow = () => {
    // 1. Проверка авторизации
    if (!auth._id) {
      navigate("/login?redirect=/product/beer-edition");
      return;
    }

    // 2. Проверка адреса
    const deliveryList = auth.deliveryDatas || [];
    if (deliveryList.length === 0) {
      // Если нет адреса, отправляем на shipping-info, но передаем товар, 
      // чтобы после сохранения адреса нас вернуло к покупке именно этого товара
      navigate("/shipping-info", { 
        state: { 
          fromPayNow: true,
          buyNowItem: productData 
        } 
      });
      return;
    }

    // 3. Переход на оплату ТОЛЬКО С ЭТИМ ТОВАРОМ
    navigate("/checkout-stripe", {
      state: {
        buyNowItem: productData
      }
    });
  };
  // -----------------------

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

          <div className="product-right-side">
            {/* Передаем функцию Pay Now в ProductDetails */}
            <ProductDetails 
              show3D={show3D} 
              on3DToggle={handle3DToggle}
              onPayNow={handlePayNow} // <--- ВОТ ЗДЕСЬ
            />
          </div>
        </div>
      </div>
      <SimilarProducts range={[1, 8]} title="More from this collection" />
    </div>
  );
}