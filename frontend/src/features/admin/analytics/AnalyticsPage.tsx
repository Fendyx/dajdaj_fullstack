import { useEffect, useState, useCallback } from "react";
import { LiveCounter } from "./components/LiveCounter";
import { ActivityChart } from "./components/ActivityChart";
import { GeoTable } from "./components/GeoTable";
import { GeoMap } from "./components/GeoMap";
import { ConversionFunnel } from "./components/ConversionFunnel";
import { TopProductsTable } from "./components/TopProductsTable";
import { TrafficSources } from "./components/TrafficSources";
import { SearchQueries } from "./components/SearchQueries";
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

export interface TopProduct    { productId?: string; _id?: string; name?: string; namePl?: string; slug?: string; views: number; uniqueViews: number }
export interface TrafficSource { _id: string; count: number }
export interface SearchQuery   { _id: string; count: number }

export function AnalyticsPage() {
  const [data,        setData]        = useState<AnalyticsData | null>(null);
  const [allHistory,  setAllHistory]  = useState<HistoryEntry[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [sources,     setSources]     = useState<TrafficSource[]>([]);
  const [searches,    setSearches]    = useState<SearchQuery[]>([]);

  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined;

      // ConversionFunnel теперь сам делает свои запросы — убираем funnel отсюда
      const [dashboardRes, allHistoryRes, productsRes, sourcesRes, searchesRes] =
        await Promise.all([
          fetch(`${API_BASE}/api/analytics/dashboard-stats`,    { headers: authHeader }),
          fetch(`${API_BASE}/api/analytics/history-all`,        { headers: authHeader }),
          fetch(`${API_BASE}/api/events/top-products?limit=10`, { headers: authHeader }),
          fetch(`${API_BASE}/api/events/sources`,               { headers: authHeader }),
          fetch(`${API_BASE}/api/events/searches`,              { headers: authHeader }),
        ]);

      if (!dashboardRes.ok) throw new Error(`HTTP ${dashboardRes.status}`);

      setData(await dashboardRes.json());
      if (allHistoryRes.ok) setAllHistory(await allHistoryRes.json());
      if (productsRes.ok)   setTopProducts(await productsRes.json());
      if (sourcesRes.ok)    setSources(await sourcesRes.json());
      if (searchesRes.ok)   setSearches(await searchesRes.json());

      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError("Failed to load analytics data");
      console.error(e);
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
            updated at{" "}
            {lastUpdated.toLocaleTimeString("en-US", {
              hour: "2-digit", minute: "2-digit", second: "2-digit",
            })}
          </span>
        )}
      </header>

      <LiveCounter realtime={data.realtime} peak={data.today.peak} />
      <ActivityChart history={data.history} allHistory={allHistory} />

      <div className="analytics-geo-row">
        <GeoTable locations={data.realtime.locations} />
        <GeoMap   locations={data.realtime.locations} />
      </div>

      <div className="analytics-new-section">
        <h2 className="analytics-section-title">Conversion & Behavior</h2>

        {/* ConversionFunnel сам управляет датами и запросами */}
        <ConversionFunnel />

        <div className="analytics-grid-2">
          <TopProductsTable products={topProducts} />
          <TrafficSources   sources={sources} />
        </div>

        <SearchQueries queries={searches} />
      </div>
    </div>
  );
}