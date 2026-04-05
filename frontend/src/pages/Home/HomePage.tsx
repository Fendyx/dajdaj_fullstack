import { Helmet } from "react-helmet-async";
import { HeroBanner } from '@/features/marketing/components/HeroBanner/HeroBanner';
import { ProductGrid } from '@/features/products/components/ProductGrid/ProductGrid';

export function HomePage() {
  return (
    <>
      <Helmet>
        <title>DajDaj — Personalizowane figurki 3D na prezent</title>
        <meta name="description" content="Stwórz unikalną figurkę 3D na podstawie zdjęć. Idealny prezent dla pary, przyjaciół i rodziny. Szybka realizacja, dostawa do domu." />
        <link rel="canonical" href="https://dajdaj.pl" />
        <meta property="og:title" content="DajDaj — Personalizowane figurki 3D na prezent" />
        <meta property="og:url" content="https://dajdaj.pl" />
      </Helmet>

      <div>
        <HeroBanner />
        <ProductGrid />
      </div>
    </>
  );
}