import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { UserCard } from "../UserCard/UserCard";
import { FlippableDeliveryCard } from "../FlippableDeliveryCard/FlippableDeliveryCard";
import { NewRecipientCard } from "../NewRecipientCard/NewRecipientCard";
import {
  useSetDefaultDeliveryMutation,
  useDeleteDeliveryDataMutation,
} from "@/services/userApi";
import "./CardGallery.css";

interface CardGalleryProps {
  userProfile: any;
  onEditProfile?: (deliveryId: number) => void;
  onLogOut?: () => void;
  onAddNewProfile?: () => void;
}

const GRADIENTS = [
  { front: "linear-gradient(135deg, #2c3e50, #1a1a1a)",  back: "linear-gradient(135deg, #34495e, #2c3e50)" },
  { front: "linear-gradient(135deg, #4caf50, #2e7d32)",  back: "linear-gradient(135deg, #66bb6a, #1b5e20)" },
  { front: "linear-gradient(135deg, #ff7f50, #ff4500)",  back: "linear-gradient(135deg, #ff6347, #ff8c00)" },
  { front: "linear-gradient(135deg, #8a2be2, #9400d3)",  back: "linear-gradient(135deg, #9932cc, #8b008b)" },
  { front: "linear-gradient(135deg, #00bfff, #1e90ff)",  back: "linear-gradient(135deg, #87cefa, #4682b4)" },
];

export function CardGallery({ userProfile, onEditProfile, onLogOut, onAddNewProfile }: CardGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [flipStates, setFlipStates]   = useState<Record<number, boolean>>({});
  const [touchStart, setTouchStart]   = useState<number | null>(null);
  const [touchEnd, setTouchEnd]       = useState<number | null>(null);
  const MIN_SWIPE = 50;

  const [setDefaultDelivery] = useSetDefaultDeliveryMutation();
  const [deleteDelivery]     = useDeleteDeliveryDataMutation();

  const cardsData = useMemo(() => {
    const deliveryDatas: any[]     = userProfile?.deliveryDatas   ?? [];
    const defaultId: number | null = userProfile?.defaultDeliveryId ?? null;
    const defaultProfile = deliveryDatas.find((d) => d.deliveryId === defaultId) ?? deliveryDatas[0] ?? null;
    const extraProfiles  = deliveryDatas.filter((d) => d.deliveryId !== defaultProfile?.deliveryId);
    const list: any[] = [];
    list.push({ type: "main", deliveryData: defaultProfile, user: userProfile });
    extraProfiles.forEach((d, idx) => list.push({ type: "extra", deliveryData: d, gradientIndex: (idx + 1) % GRADIENTS.length }));
    list.push({ type: "new" });
    return list;
  }, [userProfile]);

  const total      = cardsData.length;
  const nextCard   = useCallback(() => setActiveIndex((p) => (p + 1) % total), [total]);
  const prevCard   = useCallback(() => setActiveIndex((p) => (p - 1 + total) % total), [total]);
  const goTo       = (i: number) => setActiveIndex(i);
  const toggleFlip = (i: number) => setFlipStates((prev) => ({ ...prev, [i]: !prev[i] }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return;
      if (e.key === "ArrowLeft")  { e.preventDefault(); prevCard(); }
      if (e.key === "ArrowRight") { e.preventDefault(); nextCard(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [nextCard, prevCard]);

  const onTouchStart = (e: React.TouchEvent) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove  = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd   = () => {
    if (touchStart === null || touchEnd === null) return;
    const d = touchStart - touchEnd;
    if (d > MIN_SWIPE) nextCard(); else if (d < -MIN_SWIPE) prevCard();
  };

  const handleSetDefault = async (deliveryId: number) => {
    try {
      await setDefaultDelivery(deliveryId).unwrap();
      setActiveIndex(0); // после смены дефолта — назад к UserCard
    } catch (err) { console.error("setDefault failed:", err); }
  };

  const handleDelete = async (deliveryId: number, cardIndex: number) => {
    try {
      await deleteDelivery(deliveryId).unwrap();
      if (activeIndex >= cardIndex) setActiveIndex(Math.max(0, activeIndex - 1));
    } catch (err) { console.error("delete failed:", err); }
  };

  return (
    <div className="uc-gallery-container">
      <div className="uc-card-stack" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        {cardsData.map((card, index) => {
          const isActive  = index === activeIndex;
          const isFlipped = !!flipStates[index];
          const offset    = index - activeIndex;

          return (
            <div
              key={index}
              className="uc-profile-card-wrapper"
              style={{
                transform: `translateX(${offset * 40}px) translateY(${Math.abs(offset) * 8}px) scale(${Math.max(0.8, 1 - Math.abs(offset) * 0.05)})`,
                zIndex: total - Math.abs(offset),
                visibility: Math.abs(offset) <= 2 ? "visible" : "hidden",
                pointerEvents: isActive ? "auto" : "none",
              }}
              onClick={() => {
                if (!isActive) { goTo(index); return; }
                if (card.type === "new") { onAddNewProfile?.(); return; }
                toggleFlip(index);
              }}
            >
              {card.type === "main" && (
                <UserCard
                  deliveryData={card.deliveryData}
                  user={card.user}
                  accountName={userProfile?.name}
                  isFlipped={isFlipped}
                  onEdit={() => { const id = card.deliveryData?.deliveryId; if (id !== undefined) onEditProfile?.(id); }}
                  onLogOut={onLogOut}
                />
              )}

              {card.type === "extra" && (
                <FlippableDeliveryCard
                  deliveryData={card.deliveryData}
                  isFlipped={isFlipped}
                  gradient={GRADIENTS[card.gradientIndex]}
                  onEdit={() => { const id = card.deliveryData?.deliveryId; if (id !== undefined) onEditProfile?.(id); }}
                  onSetDefault={() => handleSetDefault(card.deliveryData.deliveryId)}
                  onDelete={() => handleDelete(card.deliveryData.deliveryId, index)}
                />
              )}

              {card.type === "new" && <NewRecipientCard onAdd={onAddNewProfile} />}
            </div>
          );
        })}
      </div>

      <div className="uc-bottom-navigation mt-6 flex justify-center items-center gap-4">
        <button type="button" className="uc-nav-button p-2 bg-gray-100 rounded-full hover:bg-gray-200" onClick={prevCard} disabled={total <= 1}>
          <ChevronLeft size={24} />
        </button>
        <div className="uc-card-indicators flex gap-2">
          {cardsData.map((_, i) => (
            <button type="button" key={i} onClick={() => goTo(i)}
              className={`uc-indicator w-2 h-2 rounded-full transition-all ${activeIndex === i ? "bg-black w-4" : "bg-gray-300"}`}
            />
          ))}
        </div>
        <button type="button" className="uc-nav-button p-2 bg-gray-100 rounded-full hover:bg-gray-200" onClick={nextCard} disabled={total <= 1}>
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="uc-nav-hint text-center mt-2">
        <p className="text-xs text-gray-400">Use arrow keys, swipe, or click to navigate • Tap active card to flip</p>
      </div>
    </div>
  );
}