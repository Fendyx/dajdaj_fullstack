import type { GeoLocation } from "../AnalyticsPage";
import "./GeoTable.css";

interface Props {
  locations: GeoLocation[];
}

const FLAG_MAP: Record<string, string> = {
  Poland: "🇵🇱", Germany: "🇩🇪", "United States": "🇺🇸",
  France: "🇫🇷", Ukraine: "🇺🇦", "United Kingdom": "🇬🇧",
  Netherlands: "🇳🇱", Sweden: "🇸🇪", Norway: "🇳🇴",
  Italy: "🇮🇹", Spain: "🇪🇸", Czechia: "🇨🇿",
  Austria: "🇦🇹", Switzerland: "🇨🇭", Belgium: "🇧🇪",
};

const getFlag = (country: string) => FLAG_MAP[country] ?? "🌐";

function aggregateByCountry(locations: GeoLocation[]) {
  const map = new Map<string, { country: string; cities: Set<string>; count: number }>();
  for (const loc of locations) {
    const existing = map.get(loc.country);
    if (existing) {
      existing.count += loc.count;
      existing.cities.add(loc.city);
    } else {
      map.set(loc.country, { country: loc.country, cities: new Set([loc.city]), count: loc.count });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export function GeoTable({ locations }: Props) {
  const grouped = aggregateByCountry(locations);
  const total = locations.reduce((s, l) => s + l.count, 0);

  return (
    <div className="geo-table-card">
      <h2 className="geo-table-card__title">Geography</h2>

      {locations.length === 0 ? (
        <p className="geo-table-card__empty">No active visitors</p>
      ) : (
        <div className="geo-table-scroll">
          <table className="geo-table">
            <thead>
              <tr>
                <th>Country</th>
                <th>Cities</th>
                <th className="geo-table__num">Online</th>
                <th className="geo-table__num">%</th>
              </tr>
            </thead>
            <tbody>
              {grouped.map((row) => {
                const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
                return (
                  <tr key={row.country}>
                    <td>
                      <span className="geo-table__flag">{getFlag(row.country)}</span>
                      {row.country}
                    </td>
                    <td className="geo-table__cities">
                      {[...row.cities].filter(c => c !== "(not set)").join(", ") || "—"}
                    </td>
                    <td className="geo-table__num">{row.count}</td>
                    <td className="geo-table__num geo-table__pct">
                      <div className="pct-bar">
                        <div
                          className="pct-bar__fill"
                          style={{ width: `${pct}%` }}
                        />
                        <span>{pct}%</span>
                      </div>
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