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
  columns?: number;       // desktop columns for grid OR visible cards for carousel
  showCount?: number;     // 0 = show all
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

  const cssVars = { "--cat-cols": columns } as React.CSSProperties;

  return (
    <section className="category-section">
      {/* ── Header ── */}
      <div className="category-header">
        <div className="category-header-top">
          <h2 className="category-title">{title}</h2>
          {layout === "carousel" && (
            <div className="carousel-controls">
              <button
                className="carousel-btn"
                onClick={() => scrollCarousel("left")}
                aria-label="Scroll left"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                className="carousel-btn"
                onClick={() => scrollCarousel("right")}
                aria-label="Scroll right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
        <div className="category-divider" />
      </div>

      {/* ── Grid layout ── */}
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

      {/* ── Carousel layout ── */}
      {layout === "carousel" && (
        <div className="category-carousel" ref={carouselRef} style={cssVars}>
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
      )}
    </section>
  );
}