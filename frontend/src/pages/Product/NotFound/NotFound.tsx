import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Compass } from "lucide-react"; // 🔥 Lucide React

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      {/* Иконка компаса (намек на то, что пользователь потерялся) */}
      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-6">
        <Compass size={48} />
      </div>

      {/* Огромный код ошибки */}
      <h1 className="text-7xl font-black text-gray-900 mb-4 tracking-tighter">
        404
      </h1>
      
      {/* Заголовок */}
      <h2 className="text-2xl font-bold text-gray-800 mb-3">
        {t("notFound.title", "Page Not Found")}
      </h2>
      
      {/* Описание */}
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        {t(
          "notFound.description", 
          "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."
        )}
      </p>
      
      {/* Кнопка возврата */}
      <Link
        to="/"
        className="flex items-center gap-2 bg-black text-white px-8 py-3.5 rounded-lg font-bold hover:bg-gray-800 transition-all shadow-lg shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5"
      >
        <Home size={20} />
        {t("notFound.backHome", "Back to Home")}
      </Link>
    </div>
  );
}