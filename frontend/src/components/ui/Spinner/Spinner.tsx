import { Loader2 } from "lucide-react";
import "./Spinner.css";

interface SpinnerProps {
  size?: number;
  className?: string;
  color?: string;
  text?: string; // 🔥 Добавили поддержку текста
}

export const Spinner = ({ 
  size = 24, 
  className = "", 
  color = "currentColor",
  text 
}: SpinnerProps) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 
        size={size} 
        color={color}
        className="ui-spinner-icon animate-spin" // Добавили анимацию вращения, если её нет в CSS
      />
      {text && <span className="text-sm font-medium text-gray-500">{text}</span>}
    </div>
  );
};