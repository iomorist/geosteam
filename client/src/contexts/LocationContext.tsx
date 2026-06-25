import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

declare global {
    interface Window {
        ymaps?: any;
    }
}

interface LocationData {
    latitude: number;
    longitude: number;
    country?: string;
    city?: string;
    accuracy?: number;
    timestamp: string;
}

interface CountryStats {
    country: string;
    total_time: number;
    visit_count: number;
    last_visit: string;
}

interface CityStats {
    city: string;
    country: string;
    total_time: number;
    visit_count: number;
    last_visit: string;
}

interface LocationContextType {
    currentLocation: LocationData | null;
    isTracking: boolean;
    countryStats: CountryStats[];
    cityStats: CityStats[];
    locationHistory: LocationData[];
    startTracking: () => void;
    stopTracking: () => void;
    updateLocation: (location: LocationData) => void;
    fetchStats: () => Promise<void>;
    fetchHistory: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};

interface LocationProviderProps {
    children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
    const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [countryStats, setCountryStats] = useState<CountryStats[]>([]);
    const [cityStats, setCityStats] = useState<CityStats[]>([]);
    const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
    const [watchId, setWatchId] = useState<number | null>(null);

    const updateLocation = async (location: LocationData) => {
        setCurrentLocation(location);

        try {
            await axios.post('/api/location/update', {
                latitude: location.latitude,
                longitude: location.longitude,
                country: location.country,
                city: location.city
            });

            // После записи координат обновляем статистику и историю,
            // чтобы UI сразу показывал новые данные.
            await Promise.all([fetchStats(), fetchHistory()]);
        } catch (error) {
            console.error('Error updating location:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const [countriesResponse, citiesResponse] = await Promise.all([
                axios.get(`/api/stats/countries`),
                axios.get(`/api/stats/cities`)
            ]);

            setCountryStats(countriesResponse.data);
            setCityStats(citiesResponse.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setCountryStats([]);
            setCityStats([]);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await axios.get(`/api/location/history`);
            setLocationHistory(response.data);
        } catch (error) {
            console.error('Error fetching history:', error);
            setLocationHistory([]);
        }
    };

    const YANDEX_MAP_SCRIPT_ID = 'yandex-maps-script';
    const YANDEX_MAP_SCRIPT_SRC = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';

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

    const formatCityAndDistrict = (city?: string, district?: string) => {
        const c = city?.trim();
        const d = district?.trim();
        if (!c && !d) return undefined;
        if (c && d && c.toLowerCase() !== d.toLowerCase()) return `${c}, ${d}`;
        return c || d;
    };

    const yandexReverseGeocode = async (latitude: number, longitude: number) => {
        await loadYandexScript();
        if (!window.ymaps) return null;

        return await new Promise<{ country?: string; city?: string; district?: string } | null>((resolve) => {
            window.ymaps.ready(async () => {
                try {
                    const res = await window.ymaps.geocode([latitude, longitude], { results: 1 });
                    const geoObject = res?.geoObjects?.get?.(0);
                    if (!geoObject) {
                        resolve(null);
                        return;
                    }

                    const getFirst = (arr: any) => (Array.isArray(arr) && arr.length > 0 ? arr[0] : undefined);

                    const country = getFirst(geoObject.getCountry?.() ? [geoObject.getCountry()] : undefined);
                    const localities = geoObject.getLocalities?.() || [];
                    const adminAreas = geoObject.getAdministrativeAreas?.() || [];
                    const subAdminAreas = geoObject.getSubAdministrativeAreas?.() || [];
                    const dependentLocalities = geoObject.getDependentLocalities?.() || [];

                    const city =
                        getFirst(localities) ||
                        getFirst(subAdminAreas) ||
                        getFirst(adminAreas) ||
                        undefined;

                    // Dependent locality обычно содержит район/микрорайон/поселение.
                    const district =
                        getFirst(dependentLocalities) ||
                        undefined;

                    resolve({ country, city, district });
                } catch (e) {
                    resolve(null);
                }
            });
        });
    };

    const bigDataCloudFallback = async (latitude: number, longitude: number) => {
        const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ru`
        );
        const data = await response.json();

        const district: string | undefined = data?.locality || undefined;

        const banned = new Set(
            ['Москва', 'Moscow', data?.countryName, data?.countryCode, data?.principalSubdivision]
                .filter(Boolean)
                .map((v: any) => String(v).toLowerCase())
        );

        const adminNames: string[] = (data?.localityInfo?.administrative || [])
            .map((a: any) => a?.name)
            .filter(Boolean)
            .map((v: any) => String(v));

        const cityFromAdministrative =
            [...adminNames]
                .reverse()
                .find((name) => {
                    const n = name.toLowerCase();
                    if (banned.has(n)) return false;
                    if (district && n === district.toLowerCase()) return false;
                    return true;
                }) || undefined;

        const city: string | undefined = cityFromAdministrative || data?.city || undefined;

        return {
            country: data?.countryName,
            city,
            district
        };
    };

    const processPosition = async (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        const accuracy = position.coords.accuracy;

        // Получаем информацию о стране/городе/районе через reverse geocoding.
        // Предпочитаем Яндекс (точнее по "город+район"), BigDataCloud используем как fallback.
        try {
            const yandex = await yandexReverseGeocode(latitude, longitude);
            const resolved = yandex || await bigDataCloudFallback(latitude, longitude);

            const locationData: LocationData = {
                latitude,
                longitude,
                accuracy,
                country: resolved?.country,
                city: formatCityAndDistrict(resolved?.city, resolved?.district),
                timestamp: new Date().toISOString()
            };

            updateLocation(locationData);
        } catch (error) {
            // Если не удалось получить данные о местоположении, сохраняем только координаты
            const locationData: LocationData = {
                latitude,
                longitude,
                accuracy,
                timestamp: new Date().toISOString()
            };

            updateLocation(locationData);
        }
    };

    const handleGeoError = (error: GeolocationPositionError) => {
        console.error('Error getting location:', error);

        // Не останавливаем трекинг на временных ошибках, чтобы watchPosition продолжил работу.
        if (error.code === 1) {
            setIsTracking(false);
            alert('Доступ к геолокации запрещен. Разрешите доступ в браузере.');
        }
    };

    const startTracking = () => {
        if (!navigator.geolocation) {
            alert('Геолокация не поддерживается вашим браузером');
            return;
        }

        setIsTracking(true);

        // Быстрый первый замер, чтобы сразу показать точку на карте.
        navigator.geolocation.getCurrentPosition(
            (position) => {
                processPosition(position);
            },
            (error) => {
                handleGeoError(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 0
            }
        );

        const id = navigator.geolocation.watchPosition(
            (position) => {
                processPosition(position);
            },
            (error) => {
                handleGeoError(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 60000,
                maximumAge: 0
            }
        );

        setWatchId(id);
    };

    const stopTracking = () => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
        }
        setIsTracking(false);
    };

    useEffect(() => {
        fetchStats();
        fetchHistory();
    }, []);

    const value: LocationContextType = {
        currentLocation,
        isTracking,
        countryStats,
        cityStats,
        locationHistory,
        startTracking,
        stopTracking,
        updateLocation,
        fetchStats,
        fetchHistory
    };

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
}; 