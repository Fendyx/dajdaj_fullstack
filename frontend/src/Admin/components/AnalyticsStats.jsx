import React from 'react';
import { useGetDashboardStatsQuery } from '../../slices/adminApi';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  CartesianGrid 
} from 'recharts';
import UsersMap from './UsersMap'; 
import './AnalyticsStats.css'; 

const AnalyticsStats = () => {
  const { data, isLoading, error } = useGetDashboardStatsQuery();

  if (isLoading) return <div className="analytics-loading">Loading analytics...</div>;
  if (error) return <div className="analytics-error">Failed to load analytics data</div>;

  const locationData = data?.realtime?.locations || [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-value">{payload[0].value} Users</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>Analytics Overview</h2>
        <span className="source-badge">Live Data</span>
      </div>
      
      {/* 1. КАРТОЧКИ */}
      <div className="stats-grid">
        <div className="stat-card live-card">
          <div className="card-header">
            <span className="stat-label">Real-time</span>
            <div className="live-indicator">
              <span className="blink"></span>
            </div>
          </div>
          <div className="stat-value">{data?.realtime?.count || 0}</div>
          <div className="stat-sub">Active users on site</div>
        </div>

        <div className="stat-card">
          <div className="card-header">
            <span className="stat-label">Unique Visitors</span>
          </div>
          <div className="stat-value">{data?.today?.users || 0}</div>
          <div className="stat-sub">Today</div>
        </div>

        <div className="stat-card">
          <div className="card-header">
            <span className="stat-label">Total Views</span>
          </div>
          <div className="stat-value">{data?.today?.views || 0}</div>
          <div className="stat-sub">Page views today</div>
        </div>
      </div>

      {/* 2. ГРАФИК (На всю ширину или в отдельном блоке) */}
      <div style={{ marginBottom: '24px' }}>
        {locationData.length > 0 ? (
          <div className="chart-section" style={{ height: '350px' }}>
             <h3>Top Cities (Live)</h3>
             <div style={{ width: '100%', height: 260 }}>
               <ResponsiveContainer>
                 <BarChart data={locationData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
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
                   <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={50}>
                     {locationData.map((entry, index) => (
                       <Cell 
                         key={`cell-${index}`} 
                         fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} 
                       />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </div>
        ) : (
           <div className="chart-section" style={{textAlign: 'center', padding: '40px', color: '#9ca3af'}}>
             Waiting for live traffic to show charts...
           </div>
        )}
      </div>

      {/* 3. КАРТА (Теперь она вынесена из сетки и занимает всю ширину) */}
      <UsersMap data={locationData} />

    </div>
  );
};

export default AnalyticsStats;