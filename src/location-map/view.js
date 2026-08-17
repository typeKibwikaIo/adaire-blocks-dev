document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.ad-map').forEach(root => {
    const items = root.querySelectorAll('.ad-map__locations__item');
    const addressPanels = root.querySelectorAll('.ad-map__address__panel');
    const map = root.querySelector('.ad-map__map');
    const isSingle = root.querySelector('.ad-map__container')?.classList.contains('is-single-map');
    let mapPanels = root.querySelectorAll('.ad-map__map__panel');
    const leafletHost = root.querySelector('.ad-map__leaflet');

    const setActiveList = (index) => {
      items.forEach((el, i) => el.classList.toggle('is-active', i === index));
      addressPanels.forEach((el, i) => el.classList.toggle('is-active', i === index));
    };

    const activateMulti = (index) => {
      setActiveList(index);
      mapPanels.forEach((el, i) => el.classList.toggle('is-active', i === index));
    };

    // Leaflet loader
    const ensureLeaflet = () => new Promise((resolve) => {
      if (window.L && window.L.map) return resolve(window.L);
      const cssId = 'leaflet-css';
      const jsId = 'leaflet-js';
      if (!document.getElementById(cssId)) {
        const link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      const done = () => resolve(window.L);
      if (document.getElementById(jsId)) {
        if (window.L) return done();
        document.getElementById(jsId).addEventListener('load', done, { once: true });
        return;
      }
      const script = document.createElement('script');
      script.id = jsId;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = done;
      document.head.appendChild(script);
    });

    let leafletMap = null;
    let leafletMarkers = [];
    let leafletInitialized = false;
    const containerEl = root.querySelector('.ad-map__container');
    const flyDurationAttr = containerEl?.getAttribute('data-fly-duration');
    const flyDuration = Math.max(0.1, parseFloat(flyDurationAttr || '0.9') || 0.9);
    const coordsFromItems = () => Array.from(items).map((item) => {
      const lat = item.getAttribute('data-lat');
      const lng = item.getAttribute('data-lng');
      const title = item.textContent?.trim() || '';
      return (lat && lng) ? { lat: parseFloat(lat), lng: parseFloat(lng), title } : null;
    });

    const initLeafletIfNeeded = async (initialIndex) => {
      if (!isSingle || !leafletHost) return false;
      if (leafletInitialized && leafletMap) return true;
      
      const coords = coordsFromItems().filter(Boolean);
      if (!coords.length) return false;
      
      try {
        const L = await ensureLeaflet();
        if (!L || !L.map) return false;
        
        // Check if map already exists (might have been created but not marked as initialized)
        if (!leafletMap) {
          leafletMap = L.map(leafletHost, { zoomControl: true, attributionControl: true });
          const start = coords[Math.max(0, initialIndex || 0)] || coords[0];
          // Use a lighter, faster Carto Positron basemap for better performance and readability
          const tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
          const tiles = L.tileLayer(tileUrl, { maxZoom: 20, subdomains: 'abcd' });
          tiles.addTo(leafletMap);
          // Start closer in fly mode
          leafletMap.setView([start.lat, start.lng], 16);
          leafletMarkers = coords.map((c) => L.marker([c.lat, c.lng]).addTo(leafletMap).bindPopup(c.title));
        }
        
        // Wait for map to be ready before marking as initialized
        return new Promise((resolve) => {
          if (leafletMap) {
            leafletMap.whenReady(() => {
              leafletInitialized = true;
              resolve(true);
            });
          } else {
            resolve(false);
          }
        });
      } catch (error) {
        console.error('Leaflet initialization error:', error);
        return false;
      }
    };

    const activateSingle = async (index) => {
      setActiveList(index);
      
      // First, ensure Leaflet is initialized if we have coordinates
      const coords = coordsFromItems();
      const hasCoords = coords.some(c => c !== null);
      
      // If we have coordinates, we should be using Leaflet, not iframe
      if (hasCoords) {
        // Initialize Leaflet if not already done
        if (!leafletInitialized || !leafletMap) {
          const initialized = await initLeafletIfNeeded(index);
          if (!initialized) {
            console.error('Failed to initialize Leaflet map');
            return;
          }
        }
        
        // Now use Leaflet flyTo
        if (leafletMap && leafletMap.flyTo) {
          const target = coords[index];
          if (target && typeof target.lat === 'number' && typeof target.lng === 'number') {
            try {
              // Fly closer using configured duration
              const currentZoom = leafletMap.getZoom();
              const targetZoom = Math.max(currentZoom, 16);
              leafletMap.flyTo([target.lat, target.lng], targetZoom, { duration: flyDuration });
              const marker = leafletMarkers[index];
              if (marker && marker.openPopup) {
                setTimeout(() => marker.openPopup(), Math.min(800, flyDuration * 700));
              }
              return;
            } catch (error) {
              console.error('FlyTo error:', error);
            }
          }
        }
      } else {
        // No coordinates - use iframe fallback (Google Maps embed)
        const iframe = root.querySelector('.ad-map__map__panel iframe');
        const panelsArray = Array.from(root.querySelectorAll('.ad-map__map__panel'));
        const urls = panelsArray.map(p => p.querySelector('iframe')?.getAttribute('src')).filter(Boolean);
        const nextSrc = urls[index] || '';
        if (iframe && nextSrc) {
          map?.classList.add('is-sliding');
          iframe.setAttribute('src', nextSrc);
          setTimeout(() => map?.classList.remove('is-sliding'), 380);
        }
      }
    };

    const activate = (index) => {
      if (isSingle) {
        activateSingle(index);
      } else {
        activateMulti(index);
      }
    };

    items.forEach((item, i) => {
      item.addEventListener('click', () => activate(i));
    });

    const initial = [...items].findIndex(el => el.classList.contains('is-active'));
    const start = initial >= 0 ? initial : 0;
    
    // Initialize Leaflet and then activate
    if (isSingle) {
      initLeafletIfNeeded(start).then((initialized) => {
        if (initialized) {
          // Wait a bit for map to be fully ready
          setTimeout(() => activate(start), 100);
        } else {
          activate(start);
        }
      });
    } else {
      activate(start);
    }
  });
});





