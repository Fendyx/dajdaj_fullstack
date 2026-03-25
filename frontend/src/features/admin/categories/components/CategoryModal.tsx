import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "../api/adminCategoriesApi";
import type { CategoryConfig } from "@/services/categoriesApi";
import "./CategoryModal.css";

interface Props {
  category: CategoryConfig | null;
  onClose: () => void;
}

interface CategoryForm {
    slug: string;
    name: { en: string; pl: string };
    layout: "grid" | "carousel";
    columns: number;
    showCount: number;
    sortOrder: number;
    isVisible: boolean;
  }
  
  const DEFAULTS: CategoryForm = {
    slug: "",
    name: { en: "", pl: "" },
    layout: "grid",
    columns: 4,
    showCount: 0,
    sortOrder: 0,
    isVisible: true,
  };

export function CategoryModal({ category, onClose }: Props) {
  const isEdit = !!category;
  const [form, setForm] = useState<CategoryForm>({ ...DEFAULTS });
  const [error, setError] = useState("");

  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const isSaving = creating || updating;

  useEffect(() => {
    if (category) {
      setForm({
        slug: category.slug,
        name: { en: category.name.en, pl: category.name.pl },
        layout: category.layout,
        columns: category.columns,
        showCount: category.showCount,
        sortOrder: category.sortOrder,
        isVisible: category.isVisible,
      });
    } else {
      setForm({ ...DEFAULTS });
    }
  }, [category]);

  const set = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const setName = (lang: "en" | "pl", value: string) =>
    setForm((prev) => ({ ...prev, name: { ...prev.name, [lang]: value } }));

  const handleSubmit = async () => {
    if (!form.slug || !form.name.en || !form.name.pl) {
      setError("Slug, EN name and PL name are required.");
      return;
    }
    setError("");
    try {
      if (isEdit && category) {
        await updateCategory({ id: category._id, data: form }).unwrap();
      } else {
        await createCategory(form).unwrap();
      }
      onClose();
    } catch (err: any) {
      setError(err?.data?.message ?? "Something went wrong");
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="cat-modal__backdrop" onClick={handleBackdropClick}>
      <div className="cat-modal">
        {/* Header */}
        <div className="cat-modal__header">
          <h2 className="cat-modal__title">
            {isEdit ? `Edit — ${category?.slug}` : "New category"}
          </h2>
          <button className="cat-modal__close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="cat-modal__body">
          {/* Slug */}
          <div className="cat-modal__field">
            <label className="cat-modal__label">Slug *</label>
            <input
              className="cat-modal__input"
              value={form.slug}
              onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              placeholder="figurines"
              disabled={isEdit}
            />
            {isEdit && (
              <p className="cat-modal__hint">Slug cannot be changed after creation.</p>
            )}
          </div>

          {/* Names */}
          <div className="cat-modal__row">
            <div className="cat-modal__field">
              <label className="cat-modal__label">Name (EN) *</label>
              <input
                className="cat-modal__input"
                value={form.name.en}
                onChange={(e) => setName("en", e.target.value)}
                placeholder="Figurines"
              />
            </div>
            <div className="cat-modal__field">
              <label className="cat-modal__label">Name (PL) *</label>
              <input
                className="cat-modal__input"
                value={form.name.pl}
                onChange={(e) => setName("pl", e.target.value)}
                placeholder="Figurki"
              />
            </div>
          </div>

          {/* Layout */}
          <div className="cat-modal__field">
            <label className="cat-modal__label">Layout</label>
            <div className="cat-modal__toggle-group">
              {(["grid", "carousel"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  className={`cat-modal__toggle ${form.layout === l ? "active" : ""}`}
                  onClick={() => set("layout", l)}
                >
                  {l === "grid" ? "⊞ Grid" : "⟺ Carousel"}
                </button>
              ))}
            </div>
          </div>

          {/* Columns slider */}
          <div className="cat-modal__field">
            <label className="cat-modal__label">
              {form.layout === "grid" ? "Columns (desktop)" : "Visible cards"}
              <span className="cat-modal__value-badge">{form.columns}</span>
            </label>
            <input
              type="range"
              min={2}
              max={6}
              step={1}
              value={form.columns}
              onChange={(e) => set("columns", Number(e.target.value))}
              className="cat-modal__range"
            />
            <div className="cat-modal__range-labels">
              <span>2</span><span>3</span><span>4</span><span>5</span><span>6</span>
            </div>
          </div>

          {/* Show count + sort order */}
          <div className="cat-modal__row">
            <div className="cat-modal__field">
              <label className="cat-modal__label">
                Show count <span className="cat-modal__hint-inline">(0 = all)</span>
              </label>
              <input
                className="cat-modal__input"
                type="number"
                min={0}
                value={form.showCount}
                onChange={(e) => set("showCount", Number(e.target.value))}
              />
            </div>
            <div className="cat-modal__field">
              <label className="cat-modal__label">Sort order</label>
              <input
                className="cat-modal__input"
                type="number"
                value={form.sortOrder}
                onChange={(e) => set("sortOrder", Number(e.target.value))}
              />
            </div>
          </div>

          {/* Visible */}
          <div className="cat-modal__field">
            <label className="cat-modal__checkbox-label">
              <input
                type="checkbox"
                checked={form.isVisible}
                onChange={(e) => set("isVisible", e.target.checked)}
                className="cat-modal__checkbox"
              />
              Visible on storefront
            </label>
          </div>

          {error && <p className="cat-modal__error">{error}</p>}
        </div>

        {/* Footer */}
        <div className="cat-modal__footer">
          <button className="cat-modal__btn cat-modal__btn--cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="cat-modal__btn cat-modal__btn--save"
            onClick={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? "Saving…" : isEdit ? "Save changes" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}