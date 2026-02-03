import React from "react";
// 👇 Импортируем хук из твоего слайса
import { useGetDashboardStatsQuery } from "../../slices/adminApi"; 

import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { FiUsers, FiActivity, FiGlobe, FiUserCheck } from "react-icons/fi";
import "./AnalyticsStats.css"; // 👇 Подключаем стили

export default function AnalyticsStats() {
  // Используем хук RTK Query. 
  // pollingInterval: 30000 означает авто-обновление каждые 30 секунд.
  const { data: stats, isLoading, error } = useGetDashboardStatsQuery(undefined, {
    pollingInterval: 30000, 
  });

  if (isLoading) {
    return <div className="loading-stats">Загрузка аналитики...</div>;
  }

  if (error) {
    console.error("Analytics Error:", error);
    return null; // Или вывести красивое сообщение об ошибке
  }

  if (!stats) return null;

  return (
    <div className="analytics-grid">
      
      {/* Карточка 1: Активные сейчас */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Активные сейчас</CardTitle>
          <FiActivity className="h-4 w-4 text-muted-foreground" style={{ opacity: 0.7 }} />
        </CardHeader>
        <CardContent>
          <div className="stat-value">
            <span className="pulse-circle"></span>
            {stats.activeVisitors}
          </div>
          <p className="stat-label">
            Пользователей онлайн (15 мин)
          </p>
        </CardContent>
      </Card>

      {/* Карточка 2: Всего пользователей */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
          <FiUsers className="h-4 w-4 text-muted-foreground" style={{ opacity: 0.7 }} />
        </CardHeader>
        <CardContent>
          <div className="stat-value">{stats.totalUsers}</div>
          <p className="stat-label">
            Зарегистрированных аккаунтов
          </p>
        </CardContent>
      </Card>

      {/* Карточка 3: Трафик */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Трафик (Уникальные)</CardTitle>
          <FiGlobe className="h-4 w-4 text-muted-foreground" style={{ opacity: 0.7 }} />
        </CardHeader>
        <CardContent>
          <div className="stat-value">{stats.traffic.total}</div>
          <div className="stat-footer">
            <span className="stat-footer-item text-green">
              <FiUserCheck size={12} /> {stats.traffic.registered} рег.
            </span>
            <span className="stat-footer-item text-gray">
               {stats.traffic.guests} гостей
            </span>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}