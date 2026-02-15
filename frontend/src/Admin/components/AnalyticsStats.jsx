import React, { useState } from 'react';
import { useGetDashboardStatsQuery } from '../../slices/adminApi';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, AreaChart, Area
} from 'recharts';
import UsersMap from './UsersMap'; 
import './AnalyticsStats.css'; 

const AnalyticsStats = () => {
  const { data, isLoading, error } = useGetDashboardStatsQuery();
  
  // Состояния для UI
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'history'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // По дефолту сегодня

  if (isLoading) return <div className="analytics-loading">Loading analytics...</div>;
  if (error) return <div className="analytics-error">Failed to load analytics data</div>;

  // Распаковка данных
  const realtime = data?.realtime || {};
  const history = data?.history || [];
  const todayPeak = data?.today?.peak || 0; // Пик за сегодня
  
  // Данные для выбранного дня в календаре
  const selectedDayStats = history.find(h => h.date === selectedDate) || { uniqueUsers: 0, peakOnline: 0 };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
             <p key={index} className="tooltip-value" style={{color: entry.color || entry.fill}}>
               {entry.name}: {entry.value}
             </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
           <h2>Analytics Dashboard</h2>
           {/* БЕЙДЖ С ПИКОМ ОНЛАЙНА ЗА СЕГОДНЯ */}
           <div style={{display: 'flex', gap: '10px'}}>
              <span className="source-badge" style={{background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0'}}>
                 🔥 Today Peak: {todayPeak} users
              </span>
           </div>
        </div>
        
        {/* ПЕРЕКЛЮЧАТЕЛЬ ВКЛАДОК */}
        <div className="analytics-tabs">
          <button 
            className={`tab-btn ${activeTab === 'live' ? 'active' : ''}`} 
            onClick={() => setActiveTab('live')}
          >
            🔴 Live Monitor
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} 
            onClick={() => setActiveTab('history')}
          >
            📅 History & Trends
          </button>
        </div>
      </div>

      {/* === ВКЛАДКА 1: LIVE MONITOR === */}
      {activeTab === 'live' && (
        <>
          {/* Сетка таймеров: 1, 5, 10, 30 минут */}
          <div className="time-grid">
            <div className="time-card">
              <div className="time-label">Last 1 Min</div>
              <div className="time-value" style={{color: '#ef4444'}}>{realtime.breakdown?.last1min || 0}</div>
            </div>
            <div className="time-card">
              <div className="time-label">Last 5 Min</div>
              <div className="time-value" style={{color: '#f97316'}}>{realtime.breakdown?.last5min || 0}</div>
            </div>
            <div className="time-card">
              <div className="time-label">Last 10 Min</div>
              <div className="time-value" style={{color: '#eab308'}}>{realtime.breakdown?.last10min || 0}</div>
            </div>
            {/* Основная карточка "Прямо сейчас" (это по сути и есть 30 мин) */}
            <div className="stat-card live-card">
              <div className="card-header">
                <span className="stat-label">Total Online (30m)</span>
                <div className="live-indicator"><span className="blink"></span></div>
              </div>
              <div className="stat-value">{realtime.count || 0}</div>
            </div>
          </div>

          {/* 🔥 ВЕРНУЛ ГРАФИК ГОРОДОВ 🔥 */}
          <div className="chart-section" style={{ marginTop: '24px', marginBottom: '24px' }}>
            <h3>📍 Top Cities (Live)</h3>
            <div style={{ width: '100%', height: 250 }}>
              {realtime.locations && realtime.locations.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={realtime.locations} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="city" 
                      stroke="#9ca3af" 
                      tick={{ fill: '#6b7280', fontSize: 12 }} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10} 
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      tick={{ fill: '#6b7280', fontSize: 12 }} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                    <Bar dataKey="count" name="Users" radius={[4, 4, 0, 0]} barSize={40}>
                      {realtime.locations.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                 <div style={{textAlign: 'center', padding: '40px', color: '#9ca3af'}}>
                   Waiting for active users...
                 </div>
              )}
            </div>
          </div>

          <UsersMap data={realtime.locations} />
        </>
      )}

      {/* === ВКЛАДКА 2: HISTORY & TRENDS === */}
      {activeTab === 'history' && (
        <>
          {/* Блок календаря */}
          <div className="history-controls">
            <div>
              <label style={{display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: 'bold'}}>Select Date:</label>
              <input 
                type="date" 
                className="date-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="selected-date-stats">
              <div className="mini-stat">
                <span className="mini-label">Peak Online (Max)</span>
                <span className="mini-value" style={{color: '#8b5cf6'}}>
                  {selectedDayStats.peakOnline}
                </span>
              </div>
              <div className="mini-stat">
                <span className="mini-label">Unique Visitors</span>
                <span className="mini-value" style={{color: '#3b82f6'}}>
                  {selectedDayStats.uniqueUsers}
                  {selectedDate === new Date().toISOString().split('T')[0] && selectedDayStats.uniqueUsers === 0 && <span style={{fontSize: '10px', color: '#999', marginLeft: '5px'}}>(processing)</span>}
                </span>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            {/* ГРАФИК 1: Total Unique Users (Синий) */}
            <div className="chart-section" style={{ minHeight: '300px' }}>
              <h3>📈 Monthly Growth: Unique Visitors</h3>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <AreaChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="date" stroke="#9ca3af" tick={{fontSize: 12}} tickFormatter={(str) => str.slice(5)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="uniqueUsers" 
                      name="Unique Users"
                      stroke="#3b82f6" 
                      fill="rgba(59, 130, 246, 0.2)" 
                      strokeWidth={2} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ГРАФИК 2: Peak Online (Фиолетовый) */}
            <div className="chart-section" style={{ minHeight: '300px' }}>
              <h3>⚡ Daily Peak Online (Concurrent)</h3>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <BarChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="date" stroke="#9ca3af" tick={{fontSize: 12}} tickFormatter={(str) => str.slice(5)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="peakOnline" 
                      name="Max Online"
                      fill="#8b5cf6" 
                      radius={[4, 4, 0, 0]} 
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsStats;