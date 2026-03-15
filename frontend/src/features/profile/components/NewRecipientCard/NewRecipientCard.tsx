import { UserPlus, Plus } from "lucide-react";
import "./NewRecipientCard.css";

interface NewRecipientCardProps {
  onAdd?: (e: React.MouseEvent) => void;
}

export function NewRecipientCard({ onAdd }: NewRecipientCardProps) {
  // ✂️ УДАЛИЛИ: const [isModalOpen, setModalOpen] = useState(false);

  return (
    <div className="uc-new-recipient-card" onClick={onAdd}>
      <div className="uc-new-card-pattern">
        {/* ... */}
      </div>

      <div className="uc-new-card-content">
        <div className="uc-new-card-icon">
          <UserPlus size={24} color="#fff" />
        </div>

        <div className="uc-new-card-text">
          <h3 className="uc-new-card-title">Add New Recipient</h3>
          <p className="uc-new-card-description">
            Create a new delivery profile for a different recipient or address
          </p>
        </div>

        <button 
          className="uc-new-card-button"
          onClick={(e) => {
            e.stopPropagation();
            onAdd?.(e); // 👈 Теперь кнопка тоже просто вызывает onAdd родителя
          }}
        >
          <Plus className="uc-new-button-icon" size={20} />
          Create Profile
        </button>
      </div>
    </div>
    // ✂️ УДАЛИЛИ: <CreateNewProfileModal ... />
  );
}