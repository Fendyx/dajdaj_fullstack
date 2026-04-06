//frontend/src/types/product.ts
export interface Specification {
    label: string;
    value: string;
  }
  
  export interface OrderExample {
    image: string;
    caption: string;
  }
  
  export interface FaqItem {
    question: string;
    answer: string;
  }
  
  // Главный публичный интерфейс продукта
  export interface Product {
    _id?: string;
    id?: string; // Для корректной работы аналитики
    slug: string;
    name: string;
    price: number;
    oldPrice?: number; // Пришло из ProductCard
    image: string;
    images?: string[];
    category: string;
    description?: string;
    descriptionProductPage?: string;
    isNew?: boolean;
    isPopular?: boolean;
    isPersonalized?: boolean;
    personalizationType?: string | null;
    phrases?: string[];
    threeDModelSrc?: string | null;
    specifications?: Specification[];
    orderExamples?: OrderExample[];
    faq?: FaqItem[];
    sortOrder?: number;
    // Убираем [key: string]: any; чтобы TypeScript строго проверял поля!
  }