import { useEffect, useState, useCallback } from "react";
import { LiveCounter } from "./components/LiveCounter";
import { ActivityChart } from "./components/ActivityChart";
import { GeoTable } from "./components/GeoTable";
import { GeoMap } from "./components/GeoMap";
import "./AnalyticsPage.css";

const API_BASE = import.meta.env.VITE_API_URL ?? "";
const REFRESH_MS = 30_000;

export interface GeoLocation {
  country: string;
  city: string;
  lat: number;
  lng: number;
  count: number;
}

export interface HistoryEntry {
  date: string;
  uniqueUsers: number;
  peakOnline: number;
}

export interface AnalyticsData {
  realtime: {
    count: number;
    locations: GeoLocation[];
    breakdown: {
      last1min: number;
      last5min: number;
      last10min: number;
      last30min: number;
    };
  };
  today: { peak: number };
  history: HistoryEntry[];
}

export function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/analytics/dashboard-stats`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: AnalyticsData = await res.json();
      setData(json);
      setLastUpdated(new Date());
      setError(null);
    } catch {
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="analytics-page analytics-page--loading">
        <div className="analytics-spinner" />
        <p>Loading analytics…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="analytics-page analytics-page--error">
        <p>{error ?? "No data available"}</p>
        <button onClick={fetchData}>Try again</button>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <header className="analytics-header">
        <h1 className="analytics-title">Analytics</h1>
        {lastUpdated && (
          <span className="analytics-meta">
            <span className="analytics-meta__dot" />
            updated at {lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        )}
      </header>

      <LiveCounter realtime={data.realtime} peak={data.today.peak} />
      <ActivityChart history={data.history} />

      <div className="analytics-geo-row">
        <GeoTable locations={data.realtime.locations} />
        <GeoMap locations={data.realtime.locations} />
      </div>
    </div>
  );
}