import { UserCard } from "../UserCard/UserCard";
import { FlippableDeliveryCard } from "../FlippableDeliveryCard/FlippableDeliveryCard";

export function UserProfileCard({ profile, onEditProfile, onLogOut }) {
  if (!profile || !profile.deliveryDatas) return [];

  const [mainDelivery, ...extraDeliveries] = profile.deliveryDatas;

  const cards = [];

  // Первая карточка — основная
  cards.push(
    <UserCard
      key={`main-${profile.id}`}
      profile={mainDelivery}
      onEdit={() => onEditProfile?.(profile.id)}
      onLogOut={() => onLogOut?.()}
    />
  );

  // Остальные карточки — дополнительные доставки
  extraDeliveries.forEach((delivery, idx) => {
    cards.push(
      <FlippableDeliveryCard
        key={`extra-${profile.id}-${idx}`}
        profile={delivery}
        onEdit={() => onEditProfile?.(profile.id)}
        onLogOut={() => onLogOut?.()}
        isActive={false} // будет управляться извне
      />
    );
  });

  return cards;
}
