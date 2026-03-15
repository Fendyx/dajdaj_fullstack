import { ProductCard } from '@/components/ui/ProductCard/ProductCard';
import { useNavigate } from 'react-router-dom';
import './CategorySection.css'; // Не забудь импортировать файл стилей

export function CategorySection({ title, products, onAddToCart, onToggleFavorite, favorites }: any) {
  if (!products || products.length === 0) return null;
  const navigate = useNavigate();

  return (
    <section className="category-section">
      <div className="category-header">
        <h2 className="category-title">{title}</h2>
        <div className="category-divider" />
      </div>

      <div className="category-grid">
        {products.map((product: any) => (
          <ProductCard
            key={product.id}
            product={product}
            favorites={favorites}
            toggleFavorite={onToggleFavorite}
            handleAddToCart={onAddToCart}
            // Единый роутинг для всех товаров!
            handleViewProduct={() => navigate(`/products/${product.slug || product.id}`)} 
          />
        ))}
      </div>
    </section>
  );
}