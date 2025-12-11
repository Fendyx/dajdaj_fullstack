import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from "react-i18next";
import { ImageCarousel } from '../ImageCarousel';
import { PostersProductDetails } from './PostesrsProductDetails';
import { useGetAllProductsQuery } from '../../slices/productsApi'; 
import "../ProductPage.css";
import SimilarProducts from '../../components/SimilarProducts/SimilarProducts';
import { FaCube } from "react-icons/fa";

// Диапазон ID для плакатов
const MIN_ID = 18;
const MAX_ID = 21;

export default function Posters() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const { i18n } = useTranslation();

  // --- ЗАГРУЗКА ВСЕХ ПРОДУКТОВ ---
  const { data: products = [], isLoading, isError } = useGetAllProductsQuery(i18n.language);

  // --- ИЩЕМ ПРОДУКТ ПО SLUG ---
  const product = useMemo(() => products.find(p => p.slug === slug), [products, slug]);

  // --- МЕМОРИЗАЦИЯ ИЗОБРАЖЕНИЙ ---
  const productImages = useMemo(() => product?.images || [product?.image] || [], [product]);
  const threeDModelSrc = product?.threeDModelSrc || null;

  const [currentImage, setCurrentImage] = useState(productImages[0] || '');
  const [show3D, setShow3D] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const modelViewerRef = useRef(null);

  // --- ОБНОВЛЕНИЕ СОСТОЯНИЙ ПРИ СМЕНЕ ПРОДУКТА ---
  useEffect(() => {
    setCurrentImage(productImages[0] || '');
    setShow3D(false);
    setIsModelLoading(true);
  }, [productImages, slug]);

  // --- РЕДИРЕКТ НА 404 ПРИ ОШИБКЕ ИЛИ НЕ НАЙДЕННОМ ПРОДУКТЕ ---
  useEffect(() => {
    if (!isLoading && (isError || !product)) {
      const timer = setTimeout(() => {
        navigate("/404", { replace: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isError, product, navigate]);

  // --- ПРОВЕРКА ДИАПАЗОНА ID ---
  const rawProductId = product?.id;
  const productId = parseInt(rawProductId, 10);

  useEffect(() => {
    if (!isLoading && product && !isNaN(productId) && (productId < MIN_ID || productId > MAX_ID)) {
      navigate("/404", { replace: true });
    }
  }, [productId, navigate, isLoading, product]);

  // --- ОБРАБОТКА 3D ---
  const handle3DToggle = () => setShow3D(prev => !prev);

  useEffect(() => {
    const modelViewer = modelViewerRef.current;
    if (modelViewer && show3D) {
      const handleLoad = () => setIsModelLoading(false);
      const handleError = () => setIsModelLoading(false);
      modelViewer.addEventListener('load', handleLoad);
      modelViewer.addEventListener('error', handleError);
      return () => {
        modelViewer.removeEventListener('load', handleLoad);
        modelViewer.removeEventListener('error', handleError);
      };
    }
  }, [show3D]);

  // --- PAY NOW ---
  const handlePayNow = () => {
    if (!product) return;

    const buyNowItem = {
      id: productId,
      name: product.name,
      price: product.price,
      image: productImages[0],
      qty: 1,
    };

    if (!auth._id) {
      navigate(`/login?redirect=/product/${slug}`);
      return;
    }

    const deliveryList = auth.deliveryDatas || [];
    if (deliveryList.length === 0) {
      navigate("/shipping-info", { state: { fromPayNow: true, buyNowItem } });
      return;
    }

    navigate("/checkout-stripe", { state: { buyNowItem } });
  };

  // --- РЕНДЕР ЗАГРУЗКИ ---
  if (isLoading) {
    return (
      <div className="product-page-loading">
        <FaCube className="loading-icon" />
        <p>Загрузка данных плаката...</p>
      </div>
    );
  }

  // --- РЕНДЕР ПРОСТОГО СООБЩЕНИЯ, ПОКА РЕДИРЕКТ ---
  if (!product || isError || isNaN(productId) || productId < MIN_ID || productId > MAX_ID) {
    return (
      <div className="product-page-error">
        <p>Плакат не найден или недоступен.</p>
      </div>
    );
  }

  // --- ОСНОВНОЙ РЕНДЕР ---
  return (
    <div className="product-page">
      <div className="product-page-container">
        <div className="product-layout">
          <div className="product-left-side">
            {show3D && threeDModelSrc ? (
              <div className="model-viewer-wrapper" style={{ position: 'relative' }}>
                {isModelLoading && (
                  <div className="loader-overlay">
                    <div className="spinner"></div>
                    <p>Loading model...</p>
                  </div>
                )}
                <model-viewer
                  ref={modelViewerRef}
                  id="productViewer"
                  src={threeDModelSrc}
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
            <PostersProductDetails
              product={product}
              productImages={productImages}
              has3D={!!threeDModelSrc}
              show3D={show3D}
              on3DToggle={handle3DToggle}
              onPayNow={handlePayNow}
            />
          </div>
        </div>
      </div>

      <SimilarProducts productId={productId} range={[18, 21]} title="You also may like" />
    </div>
  );
}
