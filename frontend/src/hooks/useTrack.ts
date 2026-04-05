import { useCallback, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

function getSessionId(): string {
  let sid = sessionStorage.getItem('_sid');
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('_sid', sid);
  }
  return sid;
}

function getUtmParams() {
  const p = new URLSearchParams(window.location.search);
  // Persist UTM params in sessionStorage so they survive navigation
  if (p.get('utm_source')) {
    sessionStorage.setItem('_utm_source',   p.get('utm_source')!);
    sessionStorage.setItem('_utm_medium',   p.get('utm_medium') ?? '');
    sessionStorage.setItem('_utm_campaign', p.get('utm_campaign') ?? '');
  }
  return {
    source:   sessionStorage.getItem('_utm_source')   || null,
    medium:   sessionStorage.getItem('_utm_medium')   || null,
    campaign: sessionStorage.getItem('_utm_campaign') || null,
  };
}

export function useTrack() {
  const utmRef = useRef(getUtmParams());

  const track = useCallback((
    event: string,
    meta?: Record<string, unknown> & { productId?: string }
  ) => {
    const { productId, ...rest } = meta ?? {};

    const payload = {
      event,
      sessionId: getSessionId(),
      productId: productId ?? null,
      meta: rest,
      ...utmRef.current,
    };

    const url = `${API_BASE}/api/events`;
    const body = JSON.stringify(payload);

    // sendBeacon — лучший вариант (не блокирует рендер, работает при закрытии вкладки)
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      const sent = navigator.sendBeacon(url, blob);
      if (sent) return; // успешно поставлено в очередь
    }

    // Fallback: fetch с keepalive (работает если sendBeacon недоступен или вернул false)
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      // Тихо игнорируем — трекинг не должен ломать UX
    });
  }, []);

  return track;
}