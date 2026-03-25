import { useState } from "react";
import { LayoutGrid, GalleryHorizontal, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import {
  useGetAdminCategoriesQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "./api/adminCategoriesApi";
import type { CategoryConfig } from "@/services/categoriesApi";
import { CategoryModal } from "./components/CategoryModal";
import "./CategoriesPage.css";

export function CategoriesPage() {
  const { data: categories = [], isLoading, isError } = useGetAdminCategoriesQuery();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [selectedCategory, setSelectedCategory] = useState<CategoryConfig | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  const handleEdit = (cat: CategoryConfig) => {
    setSelectedCategory(cat);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCategory(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleDelete = async (cat: CategoryConfig) => {
    if (!confirm(`Delete "${cat.name.en}"?`)) return;
    await deleteCategory(cat._id);
  };

  const handleToggleVisible = async (cat: CategoryConfig) => {
    await updateCategory({ id: cat._id, data: { isVisible: !cat.isVisible } });
  };

  if (isLoading) return <div className="admin-loading">Loading categories...</div>;
  if (isError) return <div className="admin-error">Failed to load categories</div>;

  return (
    <div className="categories-page">
      <div className="categories-page__header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1 className="categories-page__title">Categories</h1>
          <span className="categories-page__count">{categories.length}</span>
        </div>
        <button className="categories-page__add-btn" onClick={handleCreate}>
          <Plus size={14} />
          Add category
        </button>
      </div>

      <div className="categories-table-wrapper">
        <table className="categories-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Slug</th>
              <th>Name EN</th>
              <th>Name PL</th>
              <th>Layout</th>
              <th>Columns</th>
              <th>Show</th>
              <th>Visible</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr
                key={cat._id}
                className={`categories-table__row ${!cat.isVisible ? "categories-table__row--hidden" : ""}`}
                onClick={() => handleEdit(cat)}
              >
                <td><span className="categories-table__order">{cat.sortOrder}</span></td>
                <td><code className="categories-table__slug">{cat.slug}</code></td>
                <td><span className="categories-table__name">{cat.name.en}</span></td>
                <td><span className="categories-table__name">{cat.name.pl}</span></td>
                <td>
                  <span className={`categories-table__badge categories-table__badge--${cat.layout}`}>
                    {cat.layout === "grid"
                      ? <><LayoutGrid size={11} /> Grid</>
                      : <><GalleryHorizontal size={11} /> Carousel</>
                    }
                  </span>
                </td>
                <td className="categories-table__td-center">
                  <span className="categories-table__cols">{cat.columns}</span>
                </td>
                <td className="categories-table__td-center">
                  {cat.showCount === 0
                    ? <span className="categories-table__muted">All</span>
                    : cat.showCount
                  }
                </td>
                <td className="categories-table__td-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    className={`categories-table__vis-btn ${cat.isVisible ? "visible" : "hidden"}`}
                    onClick={() => handleToggleVisible(cat)}
                    title={cat.isVisible ? "Hide" : "Show"}
                  >
                    {cat.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="categories-table__actions">
                    <button className="categories-table__btn edit" onClick={() => handleEdit(cat)}>
                      <Pencil size={13} />
                    </button>
                    <button className="categories-table__btn delete" onClick={() => handleDelete(cat)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <CategoryModal
          category={modalMode === "edit" ? selectedCategory : null}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}