import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard/ProductCard";
import "./CategorySection.css";

interface CategorySectionProps {
  title: string;
  products: any[];
  onAddToCart: (product: any) => void;
  onToggleFavorite: (slug: string) => void;
  favorites: any[];
  layout?: "grid" | "carousel";
  columns?: number;
  showCount?: number;
  mobileColumns?: number; // NEW
}

export function CategorySection({
  title,
  products,
  onAddToCart,
  onToggleFavorite,
  favorites,
  layout = "grid",
  columns = 4,
  showCount = 0,
  mobileColumns = 2, // NEW — по умолчанию 2 карточки + peek
}: CategorySectionProps) {
  if (!products || products.length === 0) return null;

  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement>(null);
  const displayProducts = showCount > 0 ? products.slice(0, showCount) : products;

  const scrollCarousel = (dir: "left" | "right") => {
    if (!carouselRef.current) return;
    const item = carouselRef.current.querySelector(".carousel-item") as HTMLElement;
    const amount = item ? item.offsetWidth + 16 : 260;
    carouselRef.current.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  const cssVars = {
    "--cat-cols": columns,
    "--cat-mobile-cols": mobileColumns,
  } as React.CSSProperties;

  return (
    <section className="category-section">
      {/* Header — стрелки убраны отсюда */}
      <div className="category-header">
        <div className="category-header-top">
          <h2 className="category-title">{title}</h2>
        </div>
        <div className="category-divider" />
      </div>

      {/* Grid layout */}
      {layout === "grid" && (
        <div className="category-grid" style={cssVars}>
          {displayProducts.map((product: any) => (
            <ProductCard
              key={product._id ?? product.slug}
              product={product}
              favorites={favorites}
              toggleFavorite={onToggleFavorite}
              handleAddToCart={onAddToCart}
              handleViewProduct={() => navigate(`/products/${product.slug ?? product._id}`)}
            />
          ))}
        </div>
      )}

      {/* Carousel layout — обёртка с боковыми кнопками */}
      {layout === "carousel" && (
        <div className="carousel-outer" style={cssVars}>
          {/* Кнопка слева — только на десктопе (скрыта на мобиле через CSS) */}
          <button
            className="carousel-side-btn carousel-side-btn--left"
            onClick={() => scrollCarousel("left")}
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="category-carousel" ref={carouselRef}>
            {displayProducts.map((product: any) => (
              <div key={product._id ?? product.slug} className="carousel-item">
                <ProductCard
                  product={product}
                  favorites={favorites}
                  toggleFavorite={onToggleFavorite}
                  handleAddToCart={onAddToCart}
                  handleViewProduct={() => navigate(`/products/${product.slug ?? product._id}`)}
                />
              </div>
            ))}
          </div>

          {/* Кнопка справа */}
          <button
            className="carousel-side-btn carousel-side-btn--right"
            onClick={() => scrollCarousel("right")}
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </section>
  );
}