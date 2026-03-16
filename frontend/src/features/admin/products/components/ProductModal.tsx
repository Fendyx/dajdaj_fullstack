import { useState } from "react";
import { useUpdateProductMutation, useDeleteProductMutation } from "../api/adminProductsApi";
import type { ProductRaw } from "../api/adminProductsApi";
import { resolveImage } from "../../utils/resolveImage";
import "./ProductModal.css";

interface Props {
  product: ProductRaw;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: Props) {
  const [form, setForm] = useState<ProductRaw>({ ...product });
  const [activeTab, setActiveTab] = useState<"main" | "media" | "content">("main");
  const [updateProduct, { isLoading: isSaving }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // ── Helpers ───────────────────────────────────────────────
  const setField = (path: string, value: unknown) => {
    setForm((prev) => {
      const next = { ...prev } as Record<string, unknown>;
      const keys = path.split(".");
      let cur: Record<string, unknown> = next;
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = { ...(cur[keys[i]] as object) };
        cur = cur[keys[i]] as Record<string, unknown>;
      }
      cur[keys[keys.length - 1]] = value;
      return next as unknown as ProductRaw;
    });
  };

  // ── Image gallery ─────────────────────────────────────────
  const moveImage = (index: number, dir: -1 | 1) => {
    const imgs = [...form.images];
    const target = index + dir;
    if (target < 0 || target >= imgs.length) return;
    [imgs[index], imgs[target]] = [imgs[target], imgs[index]];
    setField("images", imgs);
  };

  const removeImage = (index: number) => {
    setField("images", form.images.filter((_, i) => i !== index));
  };

  // ── Save ──────────────────────────────────────────────────
  const handleSave = async () => {
    await updateProduct({ id: form._id, data: form });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirm(`Delete "${form.name.en}"? This cannot be undone.`)) return;
    await deleteProduct(form._id);
    onClose();
  };

  return (
    <div className="product-modal__backdrop" onClick={handleBackdropClick}>
      <div className="product-modal">

        {/* Header */}
        <div className="product-modal__header">
          <div className="product-modal__header-left">
            <h2 className="product-modal__title">{product.name.en}</h2>
            <span className="product-modal__slug">/{product.slug}</span>
          </div>
          <div className="product-modal__header-actions">
            <button
              className="product-modal__btn product-modal__btn--unavailable"
              title="Toggle availability (not implemented)"
              disabled
            >
              Unavailable
            </button>
            <button
              className="product-modal__btn product-modal__btn--delete"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
            <button className="product-modal__close" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="product-modal__tabs">
          {(["main", "media", "content"] as const).map((tab) => (
            <button
              key={tab}
              className={`product-modal__tab ${activeTab === tab ? "product-modal__tab--active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="product-modal__body">

          {/* ── MAIN TAB ── */}
          {activeTab === "main" && (
            <div className="product-modal__section-group">
              <section className="product-modal__section">
                <h3 className="product-modal__section-title">Basic Info</h3>
                <div className="product-modal__form-grid">
                  <div className="product-modal__form-field">
                    <label>Slug</label>
                    <input value={form.slug} onChange={(e) => setField("slug", e.target.value)} />
                  </div>
                  <div className="product-modal__form-field">
                    <label>Category</label>
                    <input value={form.category} onChange={(e) => setField("category", e.target.value)} />
                  </div>
                  <div className="product-modal__form-field">
                    <label>Price (zł)</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setField("price", Number(e.target.value))}
                    />
                  </div>
                  <div className="product-modal__form-field">
                    <label>Sort Order</label>
                    <input
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) => setField("sortOrder", Number(e.target.value))}
                    />
                  </div>
                </div>
              </section>

              <section className="product-modal__section">
                <h3 className="product-modal__section-title">Name</h3>
                <div className="product-modal__form-grid">
                  <div className="product-modal__form-field">
                    <label>EN</label>
                    <input value={form.name.en} onChange={(e) => setField("name.en", e.target.value)} />
                  </div>
                  <div className="product-modal__form-field">
                    <label>PL</label>
                    <input value={form.name.pl} onChange={(e) => setField("name.pl", e.target.value)} />
                  </div>
                </div>
              </section>

              <section className="product-modal__section">
                <h3 className="product-modal__section-title">Short Description</h3>
                <div className="product-modal__form-grid">
                  <div className="product-modal__form-field">
                    <label>EN</label>
                    <textarea
                      rows={3}
                      value={form.description.en}
                      onChange={(e) => setField("description.en", e.target.value)}
                    />
                  </div>
                  <div className="product-modal__form-field">
                    <label>PL</label>
                    <textarea
                      rows={3}
                      value={form.description.pl}
                      onChange={(e) => setField("description.pl", e.target.value)}
                    />
                  </div>
                </div>
              </section>

              <section className="product-modal__section">
                <h3 className="product-modal__section-title">Product Page Description</h3>
                <div className="product-modal__form-grid">
                  <div className="product-modal__form-field">
                    <label>EN</label>
                    <textarea
                      rows={4}
                      value={form.descriptionProductPage.en}
                      onChange={(e) => setField("descriptionProductPage.en", e.target.value)}
                    />
                  </div>
                  <div className="product-modal__form-field">
                    <label>PL</label>
                    <textarea
                      rows={4}
                      value={form.descriptionProductPage.pl}
                      onChange={(e) => setField("descriptionProductPage.pl", e.target.value)}
                    />
                  </div>
                </div>
              </section>

              <section className="product-modal__section">
                <h3 className="product-modal__section-title">Flags</h3>
                <div className="product-modal__flags">
                  {(["isNew", "isPopular", "isPersonalized"] as const).map((flag) => (
                    <label key={flag} className="product-modal__checkbox">
                      <input
                        type="checkbox"
                        checked={form[flag] as boolean}
                        onChange={(e) => setField(flag, e.target.checked)}
                      />
                      <span>{flag}</span>
                    </label>
                  ))}
                </div>
                {form.isPersonalized && (
                  <div className="product-modal__form-field" style={{ marginTop: 12 }}>
                    <label>Personalization Type</label>
                    <input
                      value={form.personalizationType || ""}
                      placeholder="figurine | custom"
                      onChange={(e) => setField("personalizationType", e.target.value || null)}
                    />
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ── MEDIA TAB ── */}
          {activeTab === "media" && (
            <div className="product-modal__section-group">
              <section className="product-modal__section">
                <h3 className="product-modal__section-title">Main Image (path)</h3>
                <div className="product-modal__form-field">
                  <input
                    value={form.image}
                    onChange={(e) => setField("image", e.target.value)}
                    placeholder="/images/..."
                  />
                </div>
                {form.image && (
                  <img
                    src={resolveImage(form.image)}
                    alt="main"
                    className="product-modal__preview-img"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
              </section>

              <section className="product-modal__section">
                <h3 className="product-modal__section-title">
                  Gallery ({form.images.length} images)
                </h3>
                <div className="product-modal__gallery">
                  {form.images.length === 0 && (
                    <span className="product-modal__empty">No gallery images</span>
                  )}
                  {form.images.map((img, i) => (
                    <div key={i} className="product-modal__gallery-item">
                      <img
                        src={resolveImage(img)}
                        alt={`gallery-${i}`}
                        className="product-modal__gallery-img"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <div className="product-modal__gallery-path">{img}</div>
                      <div className="product-modal__gallery-actions">
                        <button
                          onClick={() => moveImage(i, -1)}
                          disabled={i === 0}
                          title="Move up"
                        >←</button>
                        <button
                          onClick={() => moveImage(i, 1)}
                          disabled={i === form.images.length - 1}
                          title="Move down"
                        >→</button>
                        <button
                          className="product-modal__gallery-del"
                          onClick={() => removeImage(i)}
                          title="Remove"
                        >✕</button>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Add image path */}
                <div className="product-modal__gallery-add">
                  <input
                    id="gallery-add-input"
                    placeholder="Add image path, e.g. /images/product.jpg"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) {
                          setField("images", [...form.images, val]);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById("gallery-add-input") as HTMLInputElement;
                      const val = input?.value.trim();
                      if (val) {
                        setField("images", [...form.images, val]);
                        input.value = "";
                      }
                    }}
                  >
                    Add
                  </button>
                </div>
              </section>

              <section className="product-modal__section">
                <h3 className="product-modal__section-title">3D Model Src</h3>
                <div className="product-modal__form-field">
                  <input
                    value={form.threeDModelSrc || ""}
                    onChange={(e) => setField("threeDModelSrc", e.target.value || null)}
                    placeholder="URL or path to .glb / .gltf"
                  />
                </div>
              </section>
            </div>
          )}

          {/* ── CONTENT TAB ── */}
          {activeTab === "content" && (
            <div className="product-modal__section-group">
              {/* Specifications */}
              <section className="product-modal__section">
                <h3 className="product-modal__section-title">
                  Specifications ({form.specifications.length})
                </h3>
                <div className="product-modal__spec-list">
                  {form.specifications.map((spec, i) => (
                    <div key={i} className="product-modal__spec-row">
                      <div className="product-modal__spec-inputs">
                        <input
                          placeholder="Label EN"
                          value={spec.label.en}
                          onChange={(e) => {
                            const specs = [...form.specifications];
                            specs[i] = { ...specs[i], label: { ...specs[i].label, en: e.target.value } };
                            setField("specifications", specs);
                          }}
                        />
                        <input
                          placeholder="Label PL"
                          value={spec.label.pl}
                          onChange={(e) => {
                            const specs = [...form.specifications];
                            specs[i] = { ...specs[i], label: { ...specs[i].label, pl: e.target.value } };
                            setField("specifications", specs);
                          }}
                        />
                        <input
                          placeholder="Value EN"
                          value={spec.value.en}
                          onChange={(e) => {
                            const specs = [...form.specifications];
                            specs[i] = { ...specs[i], value: { ...specs[i].value, en: e.target.value } };
                            setField("specifications", specs);
                          }}
                        />
                        <input
                          placeholder="Value PL"
                          value={spec.value.pl}
                          onChange={(e) => {
                            const specs = [...form.specifications];
                            specs[i] = { ...specs[i], value: { ...specs[i].value, pl: e.target.value } };
                            setField("specifications", specs);
                          }}
                        />
                      </div>
                      <button
                        className="product-modal__row-del"
                        onClick={() => setField("specifications", form.specifications.filter((_, j) => j !== i))}
                      >✕</button>
                    </div>
                  ))}
                  <button
                    className="product-modal__add-row"
                    onClick={() =>
                      setField("specifications", [
                        ...form.specifications,
                        { label: { en: "", pl: "" }, value: { en: "", pl: "" } },
                      ])
                    }
                  >
                    + Add Specification
                  </button>
                </div>
              </section>

              {/* FAQ */}
              <section className="product-modal__section">
                <h3 className="product-modal__section-title">FAQ ({form.faq.length})</h3>
                <div className="product-modal__spec-list">
                  {form.faq.map((item, i) => (
                    <div key={i} className="product-modal__spec-row">
                      <div className="product-modal__spec-inputs">
                        <input
                          placeholder="Question EN"
                          value={item.question.en}
                          onChange={(e) => {
                            const faq = [...form.faq];
                            faq[i] = { ...faq[i], question: { ...faq[i].question, en: e.target.value } };
                            setField("faq", faq);
                          }}
                        />
                        <input
                          placeholder="Question PL"
                          value={item.question.pl}
                          onChange={(e) => {
                            const faq = [...form.faq];
                            faq[i] = { ...faq[i], question: { ...faq[i].question, pl: e.target.value } };
                            setField("faq", faq);
                          }}
                        />
                        <textarea
                          rows={2}
                          placeholder="Answer EN"
                          value={item.answer.en}
                          onChange={(e) => {
                            const faq = [...form.faq];
                            faq[i] = { ...faq[i], answer: { ...faq[i].answer, en: e.target.value } };
                            setField("faq", faq);
                          }}
                        />
                        <textarea
                          rows={2}
                          placeholder="Answer PL"
                          value={item.answer.pl}
                          onChange={(e) => {
                            const faq = [...form.faq];
                            faq[i] = { ...faq[i], answer: { ...faq[i].answer, pl: e.target.value } };
                            setField("faq", faq);
                          }}
                        />
                      </div>
                      <button
                        className="product-modal__row-del"
                        onClick={() => setField("faq", form.faq.filter((_, j) => j !== i))}
                      >✕</button>
                    </div>
                  ))}
                  <button
                    className="product-modal__add-row"
                    onClick={() =>
                      setField("faq", [
                        ...form.faq,
                        { question: { en: "", pl: "" }, answer: { en: "", pl: "" } },
                      ])
                    }
                  >
                    + Add FAQ
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="product-modal__footer">
          <button className="product-modal__btn product-modal__btn--cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`product-modal__btn product-modal__btn--save ${saveSuccess ? "product-modal__btn--saved" : ""}`}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : saveSuccess ? "✓ Saved" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}