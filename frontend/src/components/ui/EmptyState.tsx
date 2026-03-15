import {type ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  children?: ReactNode;
  // 🔥 Добавляем наши новые пропсы для кнопки
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState = ({ 
  icon, 
  title, 
  description, 
  children,
  actionText,
  onAction
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center w-full py-16 px-4 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
      {icon && (
        <div className="text-5xl mb-4 opacity-50 flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-sm">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">{description}</p>}
      
      {/* 🔥 Если передали actionText и onAction — рисуем красивую кнопку */}
      {actionText && onAction && (
        <button 
          onClick={onAction}
          className="mt-4 px-6 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          {actionText}
        </button>
      )}

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};