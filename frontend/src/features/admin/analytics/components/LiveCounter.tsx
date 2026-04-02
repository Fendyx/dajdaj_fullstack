import "./LiveCounter.css";

interface Props {
  realtime: {
    count: number;
    breakdown: {
      last1min: number;
      last5min: number;
      last10min: number;
      last30min: number;
    };
  };
  peak: number;
}

const TILES = [
  { key: "last1min",  label: "Last 1m"  },
  { key: "last5min",  label: "Last 5m"  },
  { key: "last10min", label: "Last 10m" },
  { key: "last30min", label: "Last 30m" },
] as const;

export function LiveCounter({ realtime, peak }: Props) {
  return (
    <div className="live-counter">
      <div className="live-counter__hero">
        <div className="live-counter__pulse-ring" />
        <div className="live-counter__count">{realtime.count}</div>
        <div className="live-counter__label">online now</div>
      </div>

      <div className="live-counter__tiles">
        {TILES.map(({ key, label }) => (
          <div key={key} className="live-tile">
            <span className="live-tile__value">{realtime.breakdown[key]}</span>
            <span className="live-tile__label">{label}</span>
          </div>
        ))}

        <div className="live-tile live-tile--peak">
          <span className="live-tile__value">{peak}</span>
          <span className="live-tile__label">today's peak</span>
        </div>
      </div>
    </div>
  );
}