import { useNavigate } from "react-router-dom";
import "./TopProductsTable.css";

export interface TopProduct {
  productId?: string;
  _id?: string;
  name?: string;
  namePl?: string;
  slug?: string;
  views: number;
  uniqueViews: number;
}

interface Props {
  products: TopProduct[];
}

function resolveName(p: TopProduct): string {
  // Backend может вернуть name.en как name, или name.pl как namePl
  // Показываем первое непустое
  return p.name || p.namePl || "Unknown product";
}

export function TopProductsTable({ products }: Props) {
  const navigate = useNavigate();
  const maxViews = Math.max(...products.map((p) => p.views), 1);

  return (
    <div className="top-products">
      <h3 className="top-products__title">Top Products (Views)</h3>

      {products.length === 0 ? (
        <p className="top-products__empty">No data yet — visit product pages to start tracking</p>
      ) : (
        <div className="top-products__table-wrap">
          <table className="top-products__table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th className="num">Views</th>
                <th className="num">Unique</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => {
                const barPct = Math.round((p.views / maxViews) * 100);
                return (
                  <tr
                    key={p.productId ?? p._id ?? i}
                    className="top-products__row"
                    onClick={() => navigate("/admin/products")}
                    style={{ cursor: "pointer" }}
                    title="Go to products"
                  >
                    <td className="top-products__rank">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                    </td>
                    <td className="top-products__name-cell">
                      <span className="top-products__name">{resolveName(p)}</span>
                      {/* Mini bar показывает относительную популярность */}
                      <div className="top-products__bar">
                        <div
                          className="top-products__bar-fill"
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                    </td>
                    <td className="top-products__num">{p.views.toLocaleString()}</td>
                    <td className="top-products__num top-products__unique">
                      {p.uniqueViews.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}