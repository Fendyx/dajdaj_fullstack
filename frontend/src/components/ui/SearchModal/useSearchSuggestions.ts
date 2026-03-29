//frontend/src/components/ui/SearchModal/useSearchSuggestions.ts
import { useState, useEffect } from "react";
import { useSearchProductsQuery, type ProductSuggestion } from "@/services/productsApi";
import { useTranslation } from "react-i18next";

interface UseSearchSuggestionsResult {
  suggestions: ProductSuggestion[];
  isLoading: boolean;
  hasResults: boolean;
  debouncedQuery: string;
}

/**
 * Хук для autocomplete suggestions в SearchModal.
 *
 * - Debounce: запрос идёт только через 300ms после того как юзер перестал печатать
 * - Минимум 2 символа: короче — не запрашиваем
 * - Автоматически определяет язык из i18n
 */
export const useSearchSuggestions = (
  query: string,
  delayMs = 300
): UseSearchSuggestionsResult => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith("pl") ? "pl" : "en";

  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce: обновляем debouncedQuery только после паузы в печатании
  useEffect(() => {
    const trimmed = query.trim();

    // Сразу сбрасываем если строка слишком короткая — не ждём debounce
    if (trimmed.length < 2) {
      setDebouncedQuery("");
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedQuery(trimmed);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [query, delayMs]);

  // skip=true когда запрос пустой — RTK Query не делает fetch
  const { data, isFetching } = useSearchProductsQuery(
    { q: debouncedQuery, lang, limit: 6 },
    { skip: debouncedQuery.length < 2 }
  );

  const suggestions = data ?? [];

  return {
    suggestions,
    isLoading: isFetching,
    hasResults: suggestions.length > 0,
    debouncedQuery,
  };
};