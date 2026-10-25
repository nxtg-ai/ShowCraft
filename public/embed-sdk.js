/**
 * Showcraft Open Embed SDK (v1.5.0)
 * Drop <div data-showcraft="http://localhost:3456/?embed=1&mode=playable#scraft=..."></div>
 * and <script src="http://localhost:3456/embed-sdk.js" async></script> onto any webpage.
 */
(() => {
  function mountShowcraftEmbeds() {
    const nodes = document.querySelectorAll('[data-showcraft]:not([data-showcraft-mounted])');
    nodes.forEach((container) => {
      const targetUrl = container.getAttribute('data-showcraft');
      if (!targetUrl) return;
      container.setAttribute('data-showcraft-mounted', 'true');

      const wrapper = document.createElement('div');
      wrapper.style.cssText = [
        'position: relative',
        'width: 100%',
        'max-width: 960px',
        'aspect-ratio: 960 / 580',
        'border-radius: 10px',
        'overflow: hidden',
        'border: 1px solid rgba(128, 128, 128, 0.22)',
        'box-shadow: 0 16px 48px rgba(0, 0, 0, 0.22)',
        'background: #09090b',
      ].join(';');

      const iframe = document.createElement('iframe');
      iframe.src = targetUrl;
      iframe.title = container.getAttribute('data-showcraft-title') || 'Showcraft Interactive Product Demo';
      iframe.loading = 'lazy';
      iframe.allow = 'fullscreen; clipboard-write';
      iframe.style.cssText = 'width: 100%; height: 100%; border: 0; display: block;';

      wrapper.appendChild(iframe);
      container.appendChild(wrapper);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountShowcraftEmbeds);
  } else {
    mountShowcraftEmbeds();
  }
})();
