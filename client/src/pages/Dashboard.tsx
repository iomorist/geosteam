import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useLocation } from '../contexts/LocationContext';
import WorldMap from '../components/WorldMap';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Card = styled.div`
  background: linear-gradient(180deg, #2e3747 0%, #323d4f 100%);
  border: 1px solid #445166;
  color: #eef2f8;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.26);
`;

const MapContainer = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 520px;
  
  .map-placeholder {
    width: min(1100px, 100%);
    height: 430px;
    border-radius: 12px;
    margin: 0 auto 14px auto;
  }
`;

const BottomGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
`;

const LocationInfo = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const LocationCard = styled.div`
  background: rgba(255,255,255,0.04);
  border: 1px solid #4a586f;
  border-radius: 10px;
  padding: 15px;
  
  h3 {
    color: #eef2f8;
    margin-bottom: 10px;
    font-size: 16px;
    font-weight: 600;
  }
  
  .location-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    font-size: 14px;
    
    .detail {
      display: flex;
      justify-content: space-between;
      
      .label {
        color: #aab4c3;
      }
      
      .value {
        color: #eef2f8;
        font-weight: 500;
      }
    }
  }
`;

const ControlPanel = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Button = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  
  ${props => props.$primary && `
    background: #5b8cff;
    color: #ffffff;
    border: 1px solid #4f7fe8;
    
    &:hover {
      background: #4f7fe8;
      transform: none;
      box-shadow: none;
    }
  `}
  
  ${props => props.$danger && `
    background: rgba(255,255,255,0.08);
    color: #dce5f5;
    border: 1px solid #5b6a81;
    
    &:hover {
      background: rgba(255,255,255,0.14);
      transform: none;
      box-shadow: none;
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 20px;
`;

const StatCard = styled.div`
  background: rgba(255,255,255,0.04);
  border: 1px solid #4a586f;
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  
  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #eef2f8;
    margin-bottom: 5px;
  }
  
  .stat-label {
    font-size: 12px;
    color: #aab4c3;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const Dashboard: React.FC = () => {
    const {
        currentLocation,
        isTracking,
        startTracking,
        stopTracking,
        countryStats,
        cityStats
    } = useLocation();

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <DashboardContainer>
            <MapContainer>
                <h2 style={{ color: '#eef2f8', marginBottom: '14px' }}>Карта местоположения</h2>
                <div className="map-placeholder">
                    <WorldMap
                        latitude={currentLocation?.latitude}
                        longitude={currentLocation?.longitude}
                    />
                </div>

                <ControlPanel>
                    <Button
                        $primary={!isTracking}
                        $danger={isTracking}
                        onClick={isTracking ? stopTracking : startTracking}
                    >
                        {isTracking ? 'Остановить отслеживание' : 'Начать отслеживание'}
                    </Button>
                </ControlPanel>
            </MapContainer>

            <BottomGrid>
                <LocationInfo>
                    <h2 style={{ color: '#eef2f8', marginBottom: '15px' }}>Текущая информация</h2>

                    <LocationCard>
                        <h3>Время и дата</h3>
                        <div className="location-details">
                            <div className="detail">
                                <span className="label">Время:</span>
                                <span className="value">{formatTime(currentTime)}</span>
                            </div>
                            <div className="detail">
                                <span className="label">Дата:</span>
                                <span className="value">{formatDate(currentTime)}</span>
                            </div>
                        </div>
                    </LocationCard>

                    {currentLocation && (
                        <LocationCard>
                            <h3>Последнее местоположение</h3>
                            <div className="location-details">
                                <div className="detail">
                                    <span className="label">Широта:</span>
                                    <span className="value">{currentLocation.latitude.toFixed(6)}</span>
                                </div>
                                <div className="detail">
                                    <span className="label">Долгота:</span>
                                    <span className="value">{currentLocation.longitude.toFixed(6)}</span>
                                </div>
                                {currentLocation.city && (
                                    <div className="detail">
                                        <span className="label">Город:</span>
                                        <span className="value">{currentLocation.city}</span>
                                    </div>
                                )}
                                {currentLocation.country && (
                                    <div className="detail">
                                        <span className="label">Страна:</span>
                                        <span className="value">{currentLocation.country}</span>
                                    </div>
                                )}
                                {typeof (currentLocation as any).accuracy === 'number' && (
                                    <div className="detail">
                                        <span className="label">Точность:</span>
                                        <span className="value">±{Math.round((currentLocation as any).accuracy)} м</span>
                                    </div>
                                )}
                                <div className="detail">
                                    <span className="label">Обновлено:</span>
                                    <span className="value">
                                        {new Date(currentLocation.timestamp).toLocaleTimeString('ru-RU')}
                                    </span>
                                </div>
                            </div>
                        </LocationCard>
                    )}
                </LocationInfo>

                <Card>
                    <h2 style={{ color: '#eef2f8', marginBottom: '15px' }}>Краткая статистика</h2>
                    <StatsGrid>
                        <StatCard>
                            <div className="stat-value">{countryStats.length}</div>
                            <div className="stat-label">Стран посещено</div>
                        </StatCard>
                        <StatCard>
                            <div className="stat-value">{cityStats.length}</div>
                            <div className="stat-label">Городов посещено</div>
                        </StatCard>
                        <StatCard>
                            <div className="stat-value">
                                {countryStats.reduce((sum, stat) => sum + stat.visit_count, 0)}
                            </div>
                            <div className="stat-label">Всего посещений</div>
                        </StatCard>
                        <StatCard>
                            <div className="stat-value">
                                {countryStats.reduce((sum, stat) => sum + stat.total_time, 0)}
                            </div>
                            <div className="stat-label">Общее время (мин)</div>
                        </StatCard>
                    </StatsGrid>
                </Card>
            </BottomGrid>
        </DashboardContainer>
    );
};

export default Dashboard; 