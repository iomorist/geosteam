import React, { useState } from 'react';
import styled from 'styled-components';
import { useLocation } from '../contexts/LocationContext';

const HistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Card = styled.div`
  background: linear-gradient(180deg, #2e3747 0%, #323d4f 100%);
  border: 1px solid #445166;
  color: #eef2f8;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.26);
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const FilterInput = styled.input`
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #5a6880;
  background: rgba(255,255,255,0.06);
  color: #eef2f8;
  font-size: 14px;
  
  &::placeholder {
    color: #aab4c3;
  }
  
  &:focus {
    outline: none;
    border-color: #5b8cff;
    box-shadow: 0 0 0 2px rgba(91, 140, 255, 0.26);
  }
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 600px;
  overflow-y: auto;
`;

const HistoryItem = styled.div`
  background: rgba(255,255,255,0.04);
  border: 1px solid #4a586f;
  border-radius: 10px;
  padding: 15px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255,255,255,0.08);
    transform: translateX(5px);
  }
`;

const LocationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  
  .location-name {
    font-weight: 600;
    color: #eef2f8;
    font-size: 16px;
  }
  
  .timestamp {
    color: #aab4c3;
    font-size: 12px;
  }
`;

const LocationDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #aab4c3;
  
  .icon {
    font-size: 48px;
    margin-bottom: 20px;
  }
  
  .title {
    font-size: 20px;
    margin-bottom: 10px;
    color: #eef2f8;
  }
  
  .description {
    font-size: 14px;
  }
`;

const LocationHistory: React.FC = () => {
    const { locationHistory } = useLocation();
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const filteredHistory = locationHistory.filter(location => {
        const matchesSearch = searchTerm === '' ||
            (location.city && location.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (location.country && location.country.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesDate = dateFilter === '' ||
            location.timestamp.startsWith(dateFilter);

        return matchesSearch && matchesDate;
    });

    return (
        <HistoryContainer>
            <Card>
                <h2 style={{ color: '#eef2f8', marginBottom: '20px' }}>История местоположений</h2>

                <FilterContainer>
                    <FilterInput
                        type="text"
                        placeholder="Поиск по городу или стране..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FilterInput
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />
                </FilterContainer>

                {filteredHistory.length === 0 ? (
                    <EmptyState>
                        <div className="icon">📍</div>
                        <div className="title">История пуста</div>
                        <div className="description">
                            {locationHistory.length === 0
                                ? 'Начните отслеживание геолокации, чтобы увидеть историю'
                                : 'Попробуйте изменить фильтры поиска'
                            }
                        </div>
                    </EmptyState>
                ) : (
                    <HistoryList>
                        {filteredHistory.map((location, index) => (
                            <HistoryItem key={index}>
                                <LocationHeader>
                                    <div className="location-name">
                                        {location.city && location.country
                                            ? `${location.city}, ${location.country}`
                                            : location.city || location.country || 'Неизвестное место'
                                        }
                                    </div>
                                    <div className="timestamp">
                                        {formatDate(location.timestamp)}
                                    </div>
                                </LocationHeader>

                                <LocationDetails>
                                    <div className="detail">
                                        <span className="label">Широта:</span>
                                        <span className="value">{location.latitude.toFixed(6)}</span>
                                    </div>
                                    <div className="detail">
                                        <span className="label">Долгота:</span>
                                        <span className="value">{location.longitude.toFixed(6)}</span>
                                    </div>
                                    {location.city && (
                                        <div className="detail">
                                            <span className="label">Город:</span>
                                            <span className="value">{location.city}</span>
                                        </div>
                                    )}
                                    {location.country && (
                                        <div className="detail">
                                            <span className="label">Страна:</span>
                                            <span className="value">{location.country}</span>
                                        </div>
                                    )}
                                </LocationDetails>
                            </HistoryItem>
                        ))}
                    </HistoryList>
                )}
            </Card>
        </HistoryContainer>
    );
};

export default LocationHistory; 