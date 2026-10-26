/* Utilitats que el component Scroll Gallery de 21st.dev importa però no inclou. */

export function isWindowScroller(scroller: Element | Window): scroller is Window {
  return scroller === window;
}

/** Espera que les fonts i el layout estiguin llestos abans de mesurar el ScrollTrigger. */
export async function waitForScrollerReady(_scroller: Element | Window): Promise<void> {
  try {
    await document.fonts?.ready;
  } catch {}
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

/**
 * Crida `callback` quan canvia l'amplada de la finestra (amb debounce).
 * S'ignoren els canvis només d'altura perquè la barra d'adreces del mòbil no faci saltar el pin.
 */
export function observeWindowResize(callback: () => void): () => void {
  let lastWidth = window.innerWidth;
  let timer = 0;
  const onResize = () => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    window.clearTimeout(timer);
    timer = window.setTimeout(callback, 150);
  };
  window.addEventListener("resize", onResize);
  return () => {
    window.removeEventListener("resize", onResize);
    window.clearTimeout(timer);
  };
}
