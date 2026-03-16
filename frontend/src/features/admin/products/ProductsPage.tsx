import { useState } from "react";
import { useGetAdminProductsQuery } from "./api/adminProductsApi";
import type { ProductRaw } from "./api/adminProductsApi";
import { ProductModal } from "./components/ProductModal";
import { resolveImage } from "../utils/resolveImage";
import "./ProductsPage.css";

export function ProductsPage() {
  const { data: products = [], isLoading, isError } = useGetAdminProductsQuery();
  const [selectedProduct, setSelectedProduct] = useState<ProductRaw | null>(null);

  if (isLoading) return <div className="admin-loading">Loading products...</div>;
  if (isError) return <div className="admin-error">Failed to load products</div>;

  return (
    <div className="products-page">
      <div className="products-page__header">
        <h1 className="products-page__title">Products</h1>
        <span className="products-page__count">{products.length}</span>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <div
            key={product._id}
            className="products-grid__card"
            onClick={() => setSelectedProduct(product)}
          >
            <div className="products-grid__img-wrap">
              {product.image ? (
                <img
                  src={resolveImage(product.image)}
                  alt={product.name.en}
                  className="products-grid__img"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="products-grid__img-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path strokeLinecap="round" d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
              )}
              <div className="products-grid__badges">
                {product.isNew && <span className="products-grid__badge products-grid__badge--new">New</span>}
                {product.isPopular && <span className="products-grid__badge products-grid__badge--popular">Popular</span>}
                {product.isPersonalized && <span className="products-grid__badge products-grid__badge--personal">Custom</span>}
              </div>
            </div>

            <div className="products-grid__info">
              <div className="products-grid__names">
                <span className="products-grid__name-en">{product.name.en}</span>
                <span className="products-grid__name-pl">{product.name.pl}</span>
              </div>
              <div className="products-grid__meta">
                <span className="products-grid__category">{product.category}</span>
                <span className="products-grid__price">{product.price} zł</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}