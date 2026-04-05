import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useGetProductBySlugQuery } from "@/services/productsApi";
import { ImageCarousel } from "@/features/products/components/ImageCarousel/ImageCarousel";
import { ProductDetails } from "@/features/products/components/ProductDetails/ProductDetails";
import { ProductSpecifications } from "@/features/products/components/ProductSpecifications/ProductSpecifications";
import { OrderExamples } from "@/features/products/components/OrderExamples/OrderExamples";
import { ProductFaq } from "@/features/products/components/ProductFaq/ProductFaq";
import { ThreeDViewer } from "@/features/products/components/ThreeDViewer";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import "./ProductPage.css";
import { useTrack } from "@/hooks/useTrack";

export function ProductPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, isError } = useGetProductBySlugQuery(
    { slug: slug!, lang: i18n.language },
    { skip: !slug }
  );

  const [currentImage, setCurrentImage] = useState<string>("");
  const [show3D, setShow3D] = useState(false);

  const track = useTrack();

  useEffect(() => {
    if (product) {
      // 🔍 Лог для отладки
      console.log('📡 Tracking product_view:', { 
        _id: product._id, 
        id: product.id,
        slug: product.slug 
      });
      
      track('product_view', { 
        productId: product._id || product.id, // ← страхуемся
        category: product.category,
        price: product.price 
      });
    }
  }, [product]); // ← зависим от всего product, а не только _id

  useEffect(() => {
    if (product?.images?.length) {
      setCurrentImage(product.images[0]);
    } else if (product?.image) {
      setCurrentImage(product.image);
    }
  }, [product]);

  const handlePayNow = (personalizationData?: any) => {
    navigate("/checkout-stripe", {
      state: {
        buyNowItem: {
          ...product,
          ...(personalizationData && { personalization: personalizationData }),
        },
      },
    });
  };

  // ── мета-теги для текущего продукта ──
  const pageTitle = product
    ? `${product.name} — DajDaj`
    : "DajDaj — Personalizowane figurki 3D";

  const pageDescription = product?.description
    ? product.description.slice(0, 155)
    : "Stwórz unikalną figurkę 3D na podstawie zdjęć. Idealny prezent dla pary, przyjaciół i rodziny.";

  const pageImage = product?.images?.[0] ?? product?.image ?? "https://dajdaj.pl/og-image.jpg";
  const pageUrl = `https://dajdaj.pl/products/${slug}`;

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner /></div>;
  }

  if (isError || !product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">{t("product.notFound", "Товар не найден")}</h2>
        <button onClick={() => navigate("/")} className="mt-4 text-blue-500 underline">
          {t("product.backToHome", "Вернуться на главную")}
        </button>
      </div>
    );
  }

  const productImages = product.images?.length ? product.images : [product.image];

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={pageUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={pageImage} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="product" />

        {/* JSON-LD для продукта */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "${product.name}",
            "description": "${pageDescription.replace(/"/g, '\\"')}",
            "image": "${pageImage}",
            "url": "${pageUrl}",
            "brand": { "@type": "Brand", "name": "DajDaj" },
            "offers": {
              "@type": "Offer",
              "priceCurrency": "PLN",
              "price": "${product.price ?? ''}",
              "availability": "https://schema.org/InStock"
            }
          }
        `}</script>
      </Helmet>

      <div className="product-page">
        <div className="product-page-container">
          {/* ── Hero: фото + детали ── */}
          <div className="product-hero">
            <div className="product-hero__visual">
              {show3D && product.threeDModelSrc ? (
                <ThreeDViewer modelUrl={product.threeDModelSrc} fallbackImage={currentImage} />
              ) : (
                <ImageCarousel
                  images={productImages}
                  mainImage={currentImage}
                  onImageChange={setCurrentImage}
                />
              )}
            </div>
            <div className="product-hero__info">
              <ProductDetails
                product={product}
                show3D={show3D}
                has3DModel={!!product.threeDModelSrc}
                on3DToggle={() => setShow3D(!show3D)}
                onPayNow={handlePayNow}
              />
            </div>
          </div>

          {/* ── Характеристики ── */}
          <ProductSpecifications specifications={product.specifications ?? []} />

          {/* ── Примеры заказов ── */}
          <OrderExamples examples={product.orderExamples ?? []} />

          {/* ── FAQ ── */}
          <ProductFaq faq={product.faq ?? []} />
        </div>
      </div>
    </>
  );
}