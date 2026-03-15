import React, { useState, useEffect, useCallback, useMemo } from "react";
import ReactDOM from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { UserCard } from "@/features/profile/components/UserCard/UserCard";
import { FlippableDeliveryCard } from "@/features/profile/components/FlippableDeliveryCard/FlippableDeliveryCard";
import { NewRecipientCard } from "@/features/profile/components/NewRecipientCard/NewRecipientCard";

import "./DeliverySelectorModal.css";

interface DeliverySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: any[];
  onSelect: (data: any) => void;
}

export const DeliverySelectorModal = ({
  isOpen,
  onClose,
  profiles,
  onSelect,
}: DeliverySelectorModalProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [flipStates, setFlipStates] = useState<Record<number, boolean>>({});

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  useEffect(() => {
    if (isOpen) setActiveIndex(0);
  }, [isOpen]);

  const cardsData = useMemo(() => {
    const dataList: any[] = [];
    if (profiles && profiles.length > 0) {
      profiles.forEach((profile) => {
        const deliveryDatas = profile?.deliveryDatas || [];
        const [mainDelivery] = deliveryDatas;

        const mainCardData = mainDelivery
          ? {
              ...profile,
              delivery: mainDelivery.delivery,
              personalData: mainDelivery.personalData,
              type: "main",
            }
          : {
              ...profile,
              delivery: { address: "No address", method: "—" },
              personalData: { name: profile.name, email: profile.email },
              type: "main",
            };
        dataList.push(mainCardData);

        deliveryDatas.slice(1).forEach((delivery: any) => {
          dataList.push({
            ...profile,
            ...delivery.personalData,
            delivery: delivery.delivery,
            personalData: delivery.personalData,
            type: "extra",
          });
        });
      });
    }
    dataList.push({ type: "new" });
    return dataList;
  }, [profiles]);

  const totalCards = cardsData.length;
  const nextCard = useCallback(() => setActiveIndex((p) => (p + 1) % totalCards), [totalCards]);
  const prevCard = useCallback(
    () => setActiveIndex((p) => (p - 1 + totalCards) % totalCards),
    [totalCards]
  );
  const goToCard = (i: number) => setActiveIndex(i);
  const toggleFlip = (index: number) =>
    setFlipStates((prev) => ({ ...prev, [index]: !prev[index] }));

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) nextCard();
    else if (distance < -minSwipeDistance) prevCard();
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();
      if (e.key === "ArrowLeft") prevCard();
      if (e.key === "ArrowRight") nextCard();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, nextCard, prevCard, onClose]);

  const handleConfirm = () => {
    onSelect(cardsData[activeIndex]);
    onClose();
  };

  if (!isOpen) return null;

  const gradients = [
    { front: "linear-gradient(135deg, #2c3e50, #1a1a1a)", back: "linear-gradient(135deg, #34495e, #2c3e50)" },
    { front: "linear-gradient(135deg, #4caf50, #2e7d32)", back: "linear-gradient(135deg, #66bb6a, #1b5e20)" },
    { front: "linear-gradient(135deg, #ff7f50, #ff4500)", back: "linear-gradient(135deg, #ff6347, #ff8c00)" },
  ];

  const modalContent = (
    <div className="dsm-overlay">
      <div className="dsm-content">

        <button type="button" className="dsm-close-cross" onClick={onClose} aria-label="Close">
          <X size={22} />
        </button>

        <h3 className="dsm-title">Select Delivery Address</h3>

        <div className="uc-gallery-container modal-gallery-override">
          <div
            className="uc-card-stack"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {cardsData.map((data, index) => {
              const isActive = index === activeIndex;
              const isFlipped = !!flipStates[index];
              const offset = index - activeIndex;
              const xOffset = offset * 40;
              const scale = Math.max(0.8, 1 - Math.abs(offset) * 0.05);
              const zIndex = totalCards - Math.abs(offset);
              const visibility = Math.abs(offset) > 2 ? "hidden" : "visible";

              return (
                <div
                  key={index}
                  className="uc-profile-card-wrapper"
                  style={{
                    transform: `translateX(${xOffset}px) scale(${scale})`,
                    zIndex,
                    visibility: visibility as any,
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                >
                  <div
                    onClick={() => {
                      if (!isActive) goToCard(index);
                      else toggleFlip(index);
                    }}
                    style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center" }}
                  >
                    {data.type === "new" ? (
                      <NewRecipientCard onAdd={() => {}} />
                    ) : data.type === "main" ? (
                      <UserCard profile={data} isFlipped={isFlipped} />
                    ) : (
                      <FlippableDeliveryCard
                        profile={data}
                        isFlipped={isFlipped}
                        gradient={gradients[index % gradients.length]}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="uc-bottom-navigation">
            <button
              type="button"
              className="uc-nav-button"
              onClick={prevCard}
              disabled={totalCards <= 1}
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="uc-card-indicators">
              {cardsData.map((_, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => goToCard(index)}
                  className={`uc-indicator${activeIndex === index ? " uc-active" : ""}`}
                  aria-label={`Card ${index + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              className="uc-nav-button"
              onClick={nextCard}
              disabled={totalCards <= 1}
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="dsm-actions">
          <button type="button" className="dsm-confirm-btn" onClick={handleConfirm}>
            {cardsData[activeIndex].type === "new" ? "Enter New Address" : "Use This Address"}
          </button>
        </div>

      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};