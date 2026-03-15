import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  X,
  User,
  ChevronRight,
  LayoutGrid,
  Sparkles,
  Armchair,
  ShoppingCart,
  Heart,
  Package,
  Info,
  Mail,
} from "lucide-react";
import "./MobileMenu.css";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  auth: any;
  cartQuantity: number;
}

export const MobileMenu = ({ isOpen, onClose, auth, cartQuantity }: MobileMenuProps) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`mobile-menu-overlay${isOpen ? " mobile-menu-overlay--visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`mobile-menu${isOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="mobile-menu-header">
          <span className="menu-title">Menu</span>
          <div className="close-btn" onClick={onClose} role="button" aria-label="Close menu">
            <X size={18} strokeWidth={2.5} />
          </div>
        </div>

        <div className="mobile-content">

          {/* 1. Auth / Profile */}
          <div className="mobile-section auth-section">
            {auth?._id ? (
              <Link to="/profile" onClick={onClose} className="user-profile-row">
                <div className="user-avatar">
                  <User size={20} strokeWidth={1.8} />
                </div>
                <div className="user-info">
                  <span className="user-name">My Profile</span>
                  <span className="user-action">Account & settings</span>
                </div>
                <ChevronRight size={16} className="arrow-icon" />
              </Link>
            ) : (
              <div className="auth-buttons-row">
                <Link to="/login" onClick={onClose} className="btn-auth login">
                  {t("navbar.signIn", "Sign In")}
                </Link>
                <Link to="/register" onClick={onClose} className="btn-auth register">
                  {t("navbar.joinUs", "Join Us")}
                </Link>
              </div>
            )}
          </div>

          {/* 2. Catalog */}
          <div className="mobile-section">
            <p className="section-label">Catalog</p>
            <ul className="mobile-list">
              <li>
                <Link to="/" onClick={onClose} className="mobile-link">
                  <span className="link-icon link-icon--blue"><LayoutGrid size={18} strokeWidth={1.8} /></span>
                  <span className="link-text">All Products</span>
                  <ChevronRight size={15} className="arrow-icon" />
                </Link>
              </li>
              <li>
                <Link to="/figurines" onClick={onClose} className="mobile-link">
                  <span className="link-icon link-icon--orange"><Sparkles size={18} strokeWidth={1.8} /></span>
                  <span className="link-text">Figurines</span>
                  <ChevronRight size={15} className="arrow-icon" />
                </Link>
              </li>
              <li>
                <Link to="/interior" onClick={onClose} className="mobile-link">
                  <span className="link-icon link-icon--green"><Armchair size={18} strokeWidth={1.8} /></span>
                  <span className="link-text">Interior</span>
                  <ChevronRight size={15} className="arrow-icon" />
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. My Account */}
          <div className="mobile-section">
            <p className="section-label">My Account</p>
            <ul className="mobile-list">
              <li>
                <Link to="/cart" onClick={onClose} className="mobile-link">
                  <span className="link-icon link-icon--blue"><ShoppingCart size={18} strokeWidth={1.8} /></span>
                  <span className="link-text">Cart</span>
                  {cartQuantity > 0 && (
                    <span className="mobile-badge">{cartQuantity}</span>
                  )}
                </Link>
              </li>
              {auth?._id && (
                <>
                  <li>
                    <Link to="/favorites" onClick={onClose} className="mobile-link">
                      <span className="link-icon link-icon--red"><Heart size={18} strokeWidth={1.8} /></span>
                      <span className="link-text">Favorites</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/orders" onClick={onClose} className="mobile-link">
                      <span className="link-icon link-icon--green"><Package size={18} strokeWidth={1.8} /></span>
                      <span className="link-text">My Orders</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* 4. Info */}
          <div className="mobile-section">
            <p className="section-label">Information</p>
            <ul className="mobile-list">
              <li>
                <Link to="/about" onClick={onClose} className="mobile-link">
                  <span className="link-icon link-icon--blue"><Info size={18} strokeWidth={1.8} /></span>
                  <span className="link-text">About Us</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={onClose} className="mobile-link">
                  <span className="link-icon link-icon--green"><Mail size={18} strokeWidth={1.8} /></span>
                  <span className="link-text">Contact</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </>
  );
};