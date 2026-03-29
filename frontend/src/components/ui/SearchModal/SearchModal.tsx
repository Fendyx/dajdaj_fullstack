//frontend/src/components/ui/SearchModal/SearchModal.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Clock, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUI } from "@/shared/context/UIContext";
import { useSearchSuggestions } from "./useSearchSuggestions";
import { resolveImage } from "@/features/admin/utils/resolveImage";
import "./SearchModal.css";

const WHO_CHIPS = ["for him", "for her", "boyfriend", "girlfriend", "for kids", "parents"];
const CAT_CHIPS = ["Tech", "Beauty", "Figurines", "Games", "Jewelry", "Home"];
const RECENT_MOCK = ["Couple figurine", "Gift for girlfriend", "Tech gadgets"];

export const SearchModal = () => {
  const { isSearchOpen, setIsSearchOpen } = useUI();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const { suggestions, isLoading, debouncedQuery } = useSearchSuggestions(query);

  const showSuggestions = query.trim().length >= 2;
  const showDefault = query.trim().length < 2;

  // Lock body scroll
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isSearchOpen]);

  // Escape key
  useEffect(() => {
    if (!isSearchOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isSearchOpen]);

  // ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setIsSearchOpen]);

  const handleClose = () => {
    setIsSearchOpen(false);
    setActiveTag(null);
    setQuery("");
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) handleClose();
  };

  const toggleTag = (tag: string) => {
    setActiveTag((prev) => (prev === tag ? null : tag));
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSuggestionClick = (slug: string) => {
    navigate(`/products/${slug}`);
    handleClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      handleClose();
    }
  };

  if (!isSearchOpen) return null;

  return (
    <div
      className="search-modal-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={t("search.ariaLabel", "Search")}
    >
      <div className="search-modal">

        {/* ── Search bar ── */}
        <form onSubmit={handleSubmit} className="search-modal__bar">
          <Search size={15} strokeWidth={2.2} className="search-modal__bar-icon" />

          <div className="search-modal__bar-inner">
            {activeTag && (
              <span className="search-modal__tag">
                {activeTag}
                <button
                  type="button"
                  className="search-modal__tag-x"
                  onClick={() => setActiveTag(null)}
                  aria-label="Remove filter"
                >
                  <X size={10} strokeWidth={3} />
                </button>
              </span>
            )}
            <input
              ref={inputRef}
              type="text"
              className="search-modal__input"
              placeholder={t("search.placeholder", "Search gifts...")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {query && (
              <button
                type="button"
                className="search-modal__clear"
                onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                aria-label="Clear search"
              >
                <X size={13} strokeWidth={2.5} />
              </button>
            )}
          </div>

          <button type="button" className="search-modal__cancel" onClick={handleClose}>
            {t("search.cancel", "Cancel")}
          </button>
        </form>

        {/* ── Suggestions ── */}
        {showSuggestions && (
          <div className="search-modal__suggestions">

            {isLoading && (
              <div className="search-modal__suggestions-loading">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="search-modal__suggestion-skeleton">
                    <div className="search-modal__suggestion-skeleton-img" />
                    <div className="search-modal__suggestion-skeleton-text">
                      <div className="search-modal__suggestion-skeleton-line search-modal__suggestion-skeleton-line--name" />
                      <div className="search-modal__suggestion-skeleton-line search-modal__suggestion-skeleton-line--price" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && suggestions.length > 0 && (
              <>
                <p className="search-modal__chips-label search-modal__suggestions-label">
                  {t("search.suggestions", "Products")}
                </p>
                {suggestions.map((item) => (
                  <button
                    key={item.slug}
                    className="search-modal__suggestion-item"
                    onClick={() => handleSuggestionClick(item.slug)}
                  >
                    <img
                      src={resolveImage(item.image)}
                      alt={item.name}
                      className="search-modal__suggestion-img"
                      loading="lazy"
                    />
                    <div className="search-modal__suggestion-info">
                      <span className="search-modal__suggestion-name">
                        <HighlightMatch text={item.name} query={debouncedQuery} />
                      </span>
                      <span className="search-modal__suggestion-cat">{item.category}</span>
                    </div>
                    <span className="search-modal__suggestion-price">
                      {item.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}zł
                    </span>
                    <ArrowRight size={13} strokeWidth={2} className="search-modal__suggestion-arrow" />
                  </button>
                ))}
              </>
            )}

            {!isLoading && suggestions.length === 0 && debouncedQuery.length >= 2 && (
              <div className="search-modal__no-results">
                <Search size={20} strokeWidth={1.5} />
                <p>
                  {t("search.noResults", "No products found for")}{" "}
                  <strong>"{debouncedQuery}"</strong>
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Default: Chips + Recent ── */}
        {showDefault && (
          <>
            <div className="search-modal__chips-section">
              <p className="search-modal__chips-label">{t("search.forWho", "For who")}</p>
              <div className="search-modal__chips-row">
                {WHO_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    className={`search-modal__chip search-modal__chip--who${
                      activeTag === chip ? " search-modal__chip--selected" : ""
                    }`}
                    onClick={() => toggleTag(chip)}
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <p className="search-modal__chips-label">{t("search.categories", "Categories")}</p>
              <div className="search-modal__chips-row">
                {CAT_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    className={`search-modal__chip search-modal__chip--cat${
                      activeTag === chip ? " search-modal__chip--selected" : ""
                    }`}
                    onClick={() => toggleTag(chip)}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="search-modal__recent">
              <p className="search-modal__chips-label">{t("search.recent", "Recent")}</p>
              {RECENT_MOCK.map((item) => (
                <button key={item} className="search-modal__recent-item">
                  <Clock size={13} strokeWidth={1.8} className="search-modal__recent-icon" />
                  <span>{item}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <div className="search-modal__esc-hint">
          <kbd>Esc</kbd>
          <span>{t("search.escHint", "to close")}</span>
        </div>
      </div>
    </div>
  );
};

// ── Подсветка совпадения ─────────────────────────────────────────────────────
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  try {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="search-modal__highlight">{part}</mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  } catch {
    return <>{text}</>;
  }
}