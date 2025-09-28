import { useState } from "react";
import CreateNewProfileModal from "../../../CreateNewProfileModal.jsx/CreateNewProfileModal";
import "./NewRecipientCard.css";

export function NewRecipientCard({ onAdd }) {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="uc-new-recipient-card" onClick={onAdd}>
        <div className="uc-new-card-pattern">
          <div className="uc-new-pattern-element-1"></div>
          <div className="uc-new-pattern-element-2"></div>
          <div className="uc-new-pattern-element-3"></div>
        </div>

        <div className="uc-new-card-content">
          <div className="uc-new-card-icon">
            {/* svg */}
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
              setModalOpen(true);
            }}
          >
            <svg className="uc-new-button-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Create Profile
          </button>
        </div>
      </div>

      <CreateNewProfileModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
      />
    </>
  );
}
