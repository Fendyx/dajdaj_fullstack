import { HeroBanner } from '@/features/marketing/components/HeroBanner/HeroBanner';
// Если Categories решишь вернуть, раскомментируй:
// import { Categories } from '@/features/products/components/Categories'; 
import { ProductGrid } from '@/features/products/components/ProductGrid/ProductGrid';

export function HomePage() {
  return (
    <div className="home-container">
      {/* 1. Главный анимированный баннер */}
      <HeroBanner />

      {/* 2. Сетка товаров (Она сама внутри себя загрузит товары и покажет модалки) */}
      <ProductGrid />
    </div>
  );
}