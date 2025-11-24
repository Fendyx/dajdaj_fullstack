import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaTruck,
  FaChevronDown,
  FaChevronUp
} from "react-icons/fa";

const PersonalInformationForm = ({
  formData,
  handleChange,
  isExpanded,
  setIsExpanded
}) => {
  return (
    <div className="stripe-card">
      <div className="stripe-card-header">
        <h2 className="stripe-card-title">Personal Information</h2>
      </div>

      <div className="stripe-card-content">
        <div className="stripe-grid">
          <div className="stripe-form-group">
            <label htmlFor="firstName" className="stripe-label-with-icon">
              <FaUser className="stripe-icon" />
              First Name
            </label>
            <input
              id="firstName"
              name="name"
              type="text"
              placeholder="Enter your first name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isExpanded}
              className={!isExpanded ? "stripe-disabled-input" : ""}
              required
            />
          </div>
        </div>

        {isExpanded && (
          <>
            <div className="stripe-form-group">
              <label htmlFor="lastName" className="stripe-label-with-icon">
                <FaUser className="stripe-icon" />
                Last Name
              </label>
              <input
                id="lastName"
                name="surname"
                type="text"
                placeholder="Enter your last name"
                value={formData.surname}
                onChange={handleChange}
                required
              />
            </div>

            <div className="stripe-form-group">
              <label htmlFor="address" className="stripe-label-with-icon">
                <FaMapMarkerAlt className="stripe-icon" />
                Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                placeholder="Enter your full address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="stripe-grid">
              <div className="stripe-form-group">
                <label htmlFor="email" className="stripe-label-with-icon">
                  <FaEnvelope className="stripe-icon" />
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="stripe-form-group">
                <label htmlFor="phone" className="stripe-label-with-icon">
                  <FaPhone className="stripe-icon" />
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="stripe-form-group">
              <label htmlFor="deliveryMethod" className="stripe-label-with-icon">
                <FaTruck className="stripe-icon" />
                Delivery Method
              </label>
              <select
                id="deliveryMethod"
                name="method"
                value={formData.method}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select delivery method</option>
                <option value="standard">InPost (3-5 business days)</option>
                <option value="express">ORLEN Paczka (3-5 business days)</option>
                <option value="overnight">Poczta Polska (3-5 business days)</option>
              </select>
            </div>
          </>
        )}
      </div>

      <div className="stripe-card-footer">
        <button
          type="button"
          className="stripe-toggle-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <FaChevronUp />
              Collapse Form
            </>
          ) : (
            <>
              <FaChevronDown />
              See full info
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PersonalInformationForm;
