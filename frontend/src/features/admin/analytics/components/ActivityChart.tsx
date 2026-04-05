import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { HistoryEntry } from "../AnalyticsPage";
import "./ActivityChart.css";

type Range = "7d" | "30d" | "all";

interface Props {
  history: HistoryEntry[];        // 30-дневная история из GA / DailyStats
  allHistory: HistoryEntry[];     // вся история из DailyStats
}

const RANGES: { key: Range; label: string }[] = [
  { key: "7d",  label: "7D"       },
  { key: "30d", label: "30D"      },
  { key: "all", label: "All Time" },
];

const fmt = (dateStr: string, range: Range) => {
  const d = new Date(dateStr);
  if (range === "all") {
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  }
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="activity-tooltip">
      <p className="activity-tooltip__date">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value?.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
};

export function ActivityChart({ history, allHistory }: Props) {
  const [range, setRange] = useState<Range>("30d");

  const sourceData = useMemo(() => {
    if (range === "7d")  return history.slice(-7);
    if (range === "30d") return history;
    // "all" — используем allHistory (из DailyStats), сортируем
    return [...allHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [range, history, allHistory]);

  // Для "all time" — если много точек, группируем по неделям
  const chartData = useMemo(() => {
    if (range === "all" && sourceData.length > 90) {
      // Группируем по неделям
      const weeks = new Map<string, { uniqueUsers: number; peakOnline: number; count: number }>();
      sourceData.forEach((h) => {
        const d = new Date(h.date);
        // Начало недели (понедельник)
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const weekStart = new Date(d.setDate(diff));
        const key = weekStart.toISOString().split("T")[0];
        const existing = weeks.get(key);
        if (existing) {
          existing.uniqueUsers  += h.uniqueUsers;
          existing.peakOnline    = Math.max(existing.peakOnline, h.peakOnline);
          existing.count        += 1;
        } else {
          weeks.set(key, { uniqueUsers: h.uniqueUsers, peakOnline: h.peakOnline, count: 1 });
        }
      });
      return [...weeks.entries()].map(([date, v]) => ({
        date: fmt(date, range),
        Unique:       Math.round(v.uniqueUsers),
        "Peak Online": v.peakOnline,
      }));
    }

    return sourceData.map((h) => ({
      date: fmt(h.date, range),
      Unique:       h.uniqueUsers,
      "Peak Online": h.peakOnline,
    }));
  }, [sourceData, range]);

  // Суммарные цифры для карточки
  const totalUnique = useMemo(
    () => sourceData.reduce((s, h) => s + h.uniqueUsers, 0),
    [sourceData]
  );
  const peakMax = useMemo(
    () => Math.max(...sourceData.map((h) => h.peakOnline), 0),
    [sourceData]
  );

  return (
    <div className="activity-chart">
      <div className="activity-chart__header">
        <h2 className="activity-chart__title">Activity</h2>

        {/* Range selector */}
        <div className="activity-chart__ranges">
          {RANGES.map(({ key, label }) => (
            <button
              key={key}
              className={`range-btn ${range === key ? "range-btn--active" : ""}`}
              onClick={() => setRange(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Summary pills */}
        <div className="activity-chart__summary">
          <span className="activity-chart__pill activity-chart__pill--unique">
            {totalUnique.toLocaleString()} unique
          </span>
          <span className="activity-chart__pill activity-chart__pill--peak">
            {peakMax} peak
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="gradUnique" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradPeak" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#555", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "#555", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#666", paddingTop: 8 }} />

          <Area
            type="monotone"
            dataKey="Unique"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#gradUnique)"
            dot={false}
            activeDot={{ r: 3 }}
          />
          <Area
            type="monotone"
            dataKey="Peak Online"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#gradPeak)"
            dot={false}
            activeDot={{ r: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}