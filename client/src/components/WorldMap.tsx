import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

interface WorldMapProps {
  latitude?: number;
  longitude?: number;
  title?: string;
}

const MapShell = styled.div`
  width: 100%;
  height: 100%;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  background: #f3f3f3;
  overflow: hidden;
  position: relative;

  .map-caption {
    position: absolute;
    left: 10px;
    bottom: 10px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    padding: 6px 8px;
    font-size: 12px;
    color: #333333;
  }
`;

const SVG_WIDTH = 1000;
const SVG_HEIGHT = 500;
const YANDEX_MAP_SCRIPT_ID = 'yandex-maps-script';
const YANDEX_MAP_SCRIPT_SRC = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const projectToMap = (latitude: number, longitude: number) => {
  const x = ((longitude + 180) / 360) * SVG_WIDTH;
  const y = ((90 - latitude) / 180) * SVG_HEIGHT;
  return {
    x: clamp(x, 0, SVG_WIDTH),
    y: clamp(y, 0, SVG_HEIGHT)
  };
};

const GRATICULE_LONGITUDES = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150];
const GRATICULE_LATITUDES = [-60, -30, 0, 30, 60];

declare global {
  interface Window {
    ymaps?: any;
  }
}

const loadYandexScript = () =>
  new Promise<void>((resolve, reject) => {
    if (window.ymaps) {
      resolve();
      return;
    }

    const existingScript = document.getElementById(YANDEX_MAP_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Yandex map script load failed')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = YANDEX_MAP_SCRIPT_ID;
    script.src = YANDEX_MAP_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Yandex map script load failed'));
    document.head.appendChild(script);
  });

const WorldMap: React.FC<WorldMapProps> = ({ latitude, longitude, title = 'Кастомная офлайн-карта мира' }) => {
  const yandexContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const placemarkRef = useRef<any>(null);
  const [useYandexMap, setUseYandexMap] = useState(false);

  const hasPoint = typeof latitude === 'number' && typeof longitude === 'number';
  const point = useMemo(() => (hasPoint ? projectToMap(latitude, longitude) : null), [hasPoint, latitude, longitude]);

  useEffect(() => {
    let cancelled = false;

    loadYandexScript()
      .then(() => {
        if (cancelled || !window.ymaps) return;
        window.ymaps.ready(() => {
          if (cancelled || !yandexContainerRef.current) return;

          if (!mapRef.current) {
            const defaultCenter = hasPoint ? [latitude, longitude] : [55.751244, 37.618423];
            mapRef.current = new window.ymaps.Map(yandexContainerRef.current, {
              center: defaultCenter,
              zoom: hasPoint ? 4 : 2,
              controls: ['zoomControl']
            });
          }

          setUseYandexMap(true);
        });
      })
      .catch(() => {
        if (!cancelled) {
          setUseYandexMap(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hasPoint, latitude, longitude]);

  useEffect(() => {
    if (!useYandexMap || !mapRef.current || !window.ymaps || !hasPoint) return;

    const coords = [latitude, longitude];
    mapRef.current.setCenter(coords, 5, { duration: 200 });

    if (!placemarkRef.current) {
      placemarkRef.current = new window.ymaps.Placemark(coords, {
        balloonContent: 'Текущее местоположение',
        hintContent: 'Вы здесь'
      }, {
        preset: 'islands#redCircleDotIcon'
      });
      mapRef.current.geoObjects.add(placemarkRef.current);
      placemarkRef.current.balloon.open();
      return;
    }

    placemarkRef.current.geometry.setCoordinates(coords);
  }, [useYandexMap, hasPoint, latitude, longitude]);

  return (
    <MapShell>
      <div ref={yandexContainerRef} style={{ width: '100%', height: '100%', display: useYandexMap ? 'block' : 'none' }} />

      {!useYandexMap && (
        <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} width="100%" height="100%" role="img" aria-label={title}>
          <rect x="0" y="0" width={SVG_WIDTH} height={SVG_HEIGHT} fill="#ececec" />

          {GRATICULE_LONGITUDES.map((lon) => {
            const x = ((lon + 180) / 360) * SVG_WIDTH;
            return <line key={`lon-${lon}`} x1={x} y1="0" x2={x} y2={SVG_HEIGHT} stroke="#d6d6d6" strokeWidth="1" />;
          })}
          {GRATICULE_LATITUDES.map((lat) => {
            const y = ((90 - lat) / 180) * SVG_HEIGHT;
            return <line key={`lat-${lat}`} x1="0" y1={y} x2={SVG_WIDTH} y2={y} stroke="#d6d6d6" strokeWidth="1" />;
          })}

          <g fill="#b8b8b8" stroke="#9b9b9b" strokeWidth="2">
            <path d="M90,120 L170,95 L230,110 L275,150 L265,190 L235,215 L190,225 L145,205 L100,170 Z" />
            <path d="M270,225 L330,255 L350,320 L315,395 L255,430 L205,395 L195,340 L220,280 Z" />
            <path d="M430,85 L520,72 L620,95 L675,132 L655,182 L565,212 L480,202 L435,162 Z" />
            <path d="M545,220 L600,242 L642,300 L622,350 L562,382 L500,362 L478,308 Z" />
            <path d="M700,118 L770,142 L830,186 L855,236 L820,282 L740,292 L690,262 L670,202 Z" />
            <path d="M815,350 L865,380 L842,425 L792,435 L760,400 Z" />
            <path d="M932,400 L952,412 L942,432 L922,422 Z" />
          </g>

          {point && (
            <g>
              <circle cx={point.x} cy={point.y} r="9" fill="#e74c3c" opacity="0.3" />
              <circle cx={point.x} cy={point.y} r="5" fill="#e74c3c" stroke="#ffffff" strokeWidth="2" />
            </g>
          )}
        </svg>
      )}

      <div className="map-caption">
        {useYandexMap
          ? (hasPoint
            ? `Яндекс: ${latitude!.toFixed(4)}, ${longitude!.toFixed(4)}`
            : 'Карта: Яндекс (ожидание координат)')
          : hasPoint
          ? `Широта: ${latitude!.toFixed(4)} | Долгота: ${longitude!.toFixed(4)}`
          : 'Ожидание координат...'}
      </div>
    </MapShell>
  );
};

export default WorldMap;
