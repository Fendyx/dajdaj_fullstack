import { useState } from 'react';
import { useAppDispatch } from '@/store/hooks'; // 🔥 Используем типизированный хук
import { addToCart } from '@/features/cart/cartSlice';

export function useProductActions() {
  const dispatch = useAppDispatch();
  
  // 🔥 Явно указываем <any>, чтобы TS знал, что сюда прилетит объект товара
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCart = (product: any) => {
    // Вместо ID лучше проверять свойство, например: product.requiresPersonalization
    if (+product.id <= 8) { 
      setSelectedProduct(product);
      setIsModalOpen(true);
    } else {
      dispatch(addToCart(product));
    }
  };

  const confirmPersonalization = (personalizedData: any) => {
    // 🔥 Защита от дурака: если товара нет, выходим. TS теперь уверен, что ниже точно объект.
    if (!selectedProduct) return; 

    const productWithPersonalization = { ...selectedProduct, ...personalizedData };
    dispatch(addToCart(productWithPersonalization));
    setIsModalOpen(false);
  };

  return {
    selectedProduct,
    isModalOpen,
    setIsModalOpen,
    handleAddToCart,
    confirmPersonalization
  };
}