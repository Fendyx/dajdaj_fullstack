// SearchQueries.tsx (упрощённо)
export function SearchQueries({ queries }: { queries: Array<{_id: string, count: number}> }) {
    return (
      <div className="search-queries">
        <h3 className="search-queries__title">Top Search Queries</h3>
        {queries.length === 0 ? <p className="search-queries__empty">No searches yet</p> : (
          <div className="search-queries__grid">
            {queries.slice(0, 20).map((q, i) => (
              <div key={q._id} className="search-queries__chip">
                <span className="search-queries__rank">#{i+1}</span>
                <span className="search-queries__text">{q._id}</span>
                <span className="search-queries__count">{q.count}×</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }