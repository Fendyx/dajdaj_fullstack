import { useState, useEffect, useCallback } from "react";
import "./ConversionFunnel.css";

export interface FunnelStep {
  step: string;
  count: number;
}

type Range = "1d" | "7d" | "30d" | "all";

const RANGES: { key: Range; label: string }[] = [
  { key: "1d",  label: "Today"  },
  { key: "7d",  label: "7D"     },
  { key: "30d", label: "30D"    },
  { key: "all", label: "All"    },
];

const STEP_ORDER  = ["product_view", "add_to_cart", "checkout_start", "order_complete"];
const STEP_LABELS: Record<string, string> = {
  product_view:   "Product Views",
  add_to_cart:    "Added to Cart",
  checkout_start: "Started Checkout",
  order_complete: "Orders Completed",
};
const STEP_COLORS: Record<string, string> = {
  product_view:   "#6366f1",
  add_to_cart:    "#8b5cf6",
  checkout_start: "#ec4899",
  order_complete: "#22c55e",
};

function safePct(num: number, denom: number): number {
  if (!denom || !num) return 0;
  return Math.min(Math.round((num / denom) * 100), 100);
}

// Форматирует Date в "YYYY-MM-DD" в локальном времени (не UTC!)
function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getRangeDates(range: Range): { from: string; to: string } {
  const now   = new Date();
  const today = toLocalDateStr(now);

  if (range === "1d") {
    return { from: today, to: today };
  }
  if (range === "7d") {
    const from = new Date(now);
    from.setDate(from.getDate() - 6);
    return { from: toLocalDateStr(from), to: today };
  }
  if (range === "30d") {
    const from = new Date(now);
    from.setDate(from.getDate() - 29);
    return { from: toLocalDateStr(from), to: today };
  }
  // "all" — с 2020-01-01 до сегодня
  return { from: "2020-01-01", to: today };
}

const API_BASE = import.meta.env.VITE_API_URL ?? "";

interface Props {
  /** Начальные данные от родителя (30д) — используются пока не загрузим свои */
  initialSteps?: FunnelStep[];
}

export function ConversionFunnel({ initialSteps = [] }: Props) {
  const [range,       setRange]      = useState<Range>("30d");
  const [customDate,  setCustomDate] = useState<string>("");   // "YYYY-MM-DD"
  const [steps,       setSteps]      = useState<FunnelStep[]>(initialSteps);
  const [loading,     setLoading]    = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchFunnel = useCallback(async (from: string, to: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const res = await fetch(
        `${API_BASE}/api/events/funnel?from=${from}&to=${to}`,
        { headers }
      );
      if (res.ok) setSteps(await res.json());
    } catch {
      // тихо — не ломаем UI
    } finally {
      setLoading(false);
    }
  }, []);

  // При смене пресета
  useEffect(() => {
    if (customDate) return;           // если выбрана кастомная дата — пресет не трогаем
    const { from, to } = getRangeDates(range);
    fetchFunnel(from, to);
  }, [range, fetchFunnel, customDate]);

  // При выборе конкретной даты
  useEffect(() => {
    if (!customDate) return;
    fetchFunnel(customDate, customDate);
  }, [customDate, fetchFunnel]);

  // ── Подготовка данных ──────────────────────────────────────────────────────
  const orderedSteps = STEP_ORDER.map((key) => ({
    step:  key,
    count: steps.find((s) => s.step === key)?.count ?? 0,
  }));

  const maxCount    = Math.max(...orderedSteps.map((s) => s.count), 1);
  const firstCount  = orderedSteps[0].count;
  const lastCount   = orderedSteps[orderedSteps.length - 1].count;
  const overallCR   = safePct(lastCount, firstCount);

  // Заголовок периода
  const periodLabel = customDate
    ? customDate
    : RANGES.find((r) => r.key === range)?.label ?? "";

  return (
    <div className="conversion-funnel">
      {/* ── Header ── */}
      <div className="conversion-funnel__header">
        <h3 className="conversion-funnel__title">
          Conversion Funnel
          {loading && <span className="conversion-funnel__spinner" />}
        </h3>

        <div className="conversion-funnel__controls">
          {/* Range tabs */}
          <div className="conversion-funnel__ranges">
            {RANGES.map(({ key, label }) => (
              <button
                key={key}
                className={`cf-range-btn ${range === key && !customDate ? "cf-range-btn--active" : ""}`}
                onClick={() => { setCustomDate(""); setRange(key); }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Date picker */}
          <div className="conversion-funnel__datepicker">
            <label className="conversion-funnel__datepicker-label">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12">
                <rect x="1" y="2" width="14" height="13" rx="2"/>
                <path d="M5 1v2M11 1v2M1 6h14"/>
              </svg>
              <input
                type="date"
                className="conversion-funnel__date-input"
                value={customDate}
                max={toLocalDateStr(new Date())}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  setRange("1d"); // сбрасываем активный пресет визуально
                }}
              />
            </label>
            {customDate && (
              <button
                className="conversion-funnel__clear-date"
                onClick={() => { setCustomDate(""); }}
                title="Clear date"
              >
                ✕
              </button>
            )}
          </div>

          <span className="conversion-funnel__period">{periodLabel}</span>
        </div>
      </div>

      {/* ── Bars ── */}
      <div className="conversion-funnel__bars">
        {orderedSteps.map((item, index) => {
          const barWidth  = Math.round((item.count / maxCount) * 100);
          const prevCount = index > 0 ? orderedSteps[index - 1].count : item.count;
          const conversion = index === 0 ? 100 : safePct(item.count, prevCount);
          const color     = STEP_COLORS[item.step] ?? "#666";

          return (
            <div key={item.step} className="conversion-funnel__row">
              <div className="conversion-funnel__label">
                <span className="conversion-funnel__dot" style={{ background: color }} />
                {STEP_LABELS[item.step] ?? item.step}
              </div>

              <div className="conversion-funnel__bar-wrap">
                <div
                  className="conversion-funnel__bar"
                  style={{
                    width:      `${barWidth}%`,
                    background: `linear-gradient(90deg, ${color}, ${color}88)`,
                  }}
                />
                <span className="conversion-funnel__value">
                  {item.count === 0 ? "—" : item.count.toLocaleString()}
                </span>
              </div>

              {index > 0 && (
                <span
                  className={`conversion-funnel__conv ${
                    conversion >= 20 ? "good" : conversion >= 10 ? "mid" : "low"
                  }`}
                >
                  {item.count === 0 ? "—" : `${conversion}%`}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Summary ── */}
      {firstCount > 0 && (
        <div className="conversion-funnel__summary">
          <span>Overall CR:</span>
          <strong>{overallCR}%</strong>
          <span className="conversion-funnel__summary-hint">
            ({lastCount} orders / {firstCount} views)
          </span>
        </div>
      )}

      {firstCount === 0 && !loading && (
        <p className="conversion-funnel__no-data">
          No events for this period.
        </p>
      )}
    </div>
  );
}