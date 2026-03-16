/**
 * Если путь уже абсолютный URL — возвращаем как есть.
 * Если относительный — добавляем VITE_API_URL спереди.
 */
export function resolveImage(path: string | null | undefined): string {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${import.meta.env.VITE_API_URL}${path}`;
  }