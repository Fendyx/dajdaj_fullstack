// TrafficSources.tsx (упрощённо)
export function TrafficSources({ sources }: { sources: Array<{_id: string, count: number}> }) {
    const total = sources.reduce((s, x) => s + x.count, 0);
    return (
      <div className="traffic-sources">
        <h3 className="traffic-sources__title">Traffic Sources</h3>
        {sources.length === 0 ? <p className="traffic-sources__empty">No data</p> : (
          <div className="traffic-sources__list">
            {sources.map(src => {
              const pct = total > 0 ? Math.round((src.count / total) * 100) : 0;
              return (
                <div key={src._id} className="traffic-sources__item">
                  <span className="traffic-sources__name">{src._id}</span>
                  <div className="traffic-sources__bar">
                    <div className="traffic-sources__fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="traffic-sources__count">{src.count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }