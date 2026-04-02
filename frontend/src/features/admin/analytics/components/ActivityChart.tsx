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
  
  interface Props {
    history: HistoryEntry[];
  }
  
  const fmt = (dateStr: string) => {
    const d = new Date(dateStr);
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
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  };
  
  export function ActivityChart({ history }: Props) {
    const data = history.map((h) => ({
      date: fmt(h.date),
      "Unique": h.uniqueUsers,
      "Peak Online": h.peakOnline,
    }));
  
    return (
      <div className="activity-chart">
        <h2 className="activity-chart__title">30-Day Activity</h2>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
  
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
  
            <XAxis
              dataKey="date"
              tick={{ fill: "#888", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: "#888", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
  
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12, color: "#888", paddingTop: 8 }}
            />
  
            <Area
              type="monotone"
              dataKey="Unique"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#gradUnique)"
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Area
              type="monotone"
              dataKey="Peak Online"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#gradPeak)"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }