import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { useSearchProductsQuery } from "@/services/productsApi";
import { useGetUserFavoritesQuery, useAddFavoriteMutation, useRemoveFavoriteMutation } from "@/services/userApi";
import { useProductActions } from "@/hooks/useProductActions";
import { ProductCard } from "@/components/ui/ProductCard/ProductCard";
import { PersonalizationModal } from "@/features/products/components/PersonalizationModal/PersonalizationModal";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import "./SearchPage.css";

export function SearchPage() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const lang = i18n.language?.startsWith("pl") ? "pl" : "en";

  const { data: results = [], isFetching } = useSearchProductsQuery(
    { q: query, lang, limit: 24 },
    { skip: query.trim().length < 2 }
  );

  const { data: favorites = [], refetch } = useGetUserFavoritesQuery();
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();
  const { selectedProduct, isModalOpen, setIsModalOpen, handleAddToCart, confirmPersonalization } =
    useProductActions();

  const toggleFavorite = async (slug: string) => {
    try {
      if (favorites.find((p: any) => p.slug === slug)) {
        await removeFavorite(slug).unwrap();
      } else {
        await addFavorite(slug).unwrap();
      }
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewProduct = (product: any) => {
    window.location.href = `/products/${product.slug}`;
  };

  return (
    <div className="search-page">
        <Helmet>
        <title>
          {query
            ? `${query} — Szukaj prezentów | DajDaj`
            : "Szukaj prezentów — DajDaj"}
        </title>
        <meta name="description" content="Znajdź idealny prezent na każdą okazję — figurki 3D, upominki personalizowane i wyjątkowe podarunki." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      {/* ── Header ── */}
      <div className="search-page__header">
        <h1 className="search-page__title">
          {query
            ? t("searchPage.resultsFor", "Results for")
            : t("searchPage.search", "Search")}
          {query && <span className="search-page__query">"{query}"</span>}
        </h1>
        {!isFetching && query.trim().length >= 2 && (
          <span className="search-page__count">
            {results.length > 0
              ? t("searchPage.found", "{{count}} products found", { count: results.length })
              : ""}
          </span>
        )}
      </div>

      {/* ── Loading ── */}
      {isFetching && <Spinner text={t("productGrid.loading", "Loading...")} />}

      {/* ── Empty query ── */}
      {!isFetching && query.trim().length < 2 && (
        <div className="search-page__empty">
          <Search size={40} strokeWidth={1.2} />
          <p>{t("searchPage.typeToSearch", "Type at least 2 characters to search")}</p>
        </div>
      )}

      {/* ── No results ── */}
      {!isFetching && query.trim().length >= 2 && results.length === 0 && (
        <div className="search-page__empty">
          <Search size={40} strokeWidth={1.2} />
          <p>{t("search.noResults", "No products found for")} <strong>"{query}"</strong></p>
          <span className="search-page__empty-hint">
            {t("searchPage.tryDifferent", "Try different keywords")}
          </span>
        </div>
      )}

      {/* ── Results grid ── */}
      {!isFetching && results.length > 0 && (
        <div className="search-page__grid">
          {results.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              handleAddToCart={handleAddToCart}
              handleViewProduct={handleViewProduct}
            />
          ))}
        </div>
      )}

      {/* ── Personalization modal ── */}
      {isModalOpen && selectedProduct && (
        <PersonalizationModal
          product={selectedProduct}
          onClose={() => setIsModalOpen(false)}
          onConfirm={confirmPersonalization}
        />
      )}
    </div>
  );
}