import "./NewRecipientCard.css";

export function NewRecipientCard({ onAdd }) {
  return (
    <div className="uc-new-recipient-card" onClick={onAdd}>
      <div className="uc-new-card-pattern">
        <div className="uc-new-pattern-element-1"></div>
        <div className="uc-new-pattern-element-2"></div>
        <div className="uc-new-pattern-element-3"></div>
      </div>

      <div className="uc-new-card-content">
        <div className="uc-new-card-icon">
          <svg className="uc-new-icon-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
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
            onAdd?.();
          }}
        >
          <svg className="uc-new-button-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Create Profile
        </button>
      </div>
    </div>
  );
}
