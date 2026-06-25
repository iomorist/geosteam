import React, { useState } from 'react';
import styled from 'styled-components';
import { useLocation } from '../contexts/LocationContext';

const SettingsContainer = styled.div`
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

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #ececec;
  border-bottom: 1px solid #4a586f;
  
  &:last-child {
    border-bottom: none;
  }
  
  .setting-info {
    flex: 1;
    
    .setting-title {
      color: #eef2f8;
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 5px;
    }
    
    .setting-description {
      color: #aab4c3;
      font-size: 14px;
    }
  }
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #e74c3c;
    transition: 0.3s;
    border-radius: 24px;
    
    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: #ffffff;
      transition: 0.3s;
      border-radius: 50%;
    }
  }
  
  input:checked + .slider {
    background: #2ecc71;
  }
  
  input:checked + .slider:before {
    transform: translateX(26px);
    background-color: #ffffff;
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #5a6880;
  background: rgba(255,255,255,0.06);
  color: #eef2f8;
  font-size: 14px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #5b8cff;
    box-shadow: 0 0 0 2px rgba(91, 140, 255, 0.26);
  }
  
  option {
    background: #323d4f;
    color: #eef2f8;
  }
`;

const Button = styled.button`
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  background: rgba(255,255,255,0.08);
  color: #dce5f5;
  border: 1px solid #5b6a81;
  
  &:hover {
    background: rgba(255,255,255,0.14);
    transform: none;
    box-shadow: none;
  }
`;

const InfoSection = styled.div`
  background: rgba(255,255,255,0.04);
  border: 1px solid #4a586f;
  border-radius: 10px;
  padding: 15px;
  margin-top: 20px;
  
  h3 {
    color: #eef2f8;
    margin-bottom: 10px;
    font-size: 16px;
    font-weight: 600;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
    font-size: 14px;
    
    .info-item {
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

const Settings: React.FC = () => {
    const { locationHistory, countryStats, cityStats } = useLocation();
    const [autoTracking, setAutoTracking] = useState(true);
    const [highAccuracy, setHighAccuracy] = useState(true);
    const [updateInterval, setUpdateInterval] = useState('30');

    const handleClearData = () => {
        if (window.confirm('Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.')) {
            // Здесь можно добавить логику очистки данных
            alert('Функция очистки данных будет реализована в следующей версии');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <SettingsContainer>
            <Card>
                <h2 style={{ color: '#eef2f8', marginBottom: '20px' }}>Настройки приложения</h2>

                <SettingItem>
                    <div className="setting-info">
                        <div className="setting-title">Автоматическое отслеживание</div>
                        <div className="setting-description">
                            Автоматически начинать отслеживание при загрузке приложения
                        </div>
                    </div>
                    <Toggle>
                        <input
                            type="checkbox"
                            checked={autoTracking}
                            onChange={(e) => setAutoTracking(e.target.checked)}
                        />
                        <span className="slider"></span>
                    </Toggle>
                </SettingItem>

                <SettingItem>
                    <div className="setting-info">
                        <div className="setting-title">Высокая точность</div>
                        <div className="setting-description">
                            Использовать GPS для более точного определения местоположения
                        </div>
                    </div>
                    <Toggle>
                        <input
                            type="checkbox"
                            checked={highAccuracy}
                            onChange={(e) => setHighAccuracy(e.target.checked)}
                        />
                        <span className="slider"></span>
                    </Toggle>
                </SettingItem>

                <SettingItem>
                    <div className="setting-info">
                        <div className="setting-title">Интервал обновления</div>
                        <div className="setting-description">
                            Как часто обновлять данные о местоположении
                        </div>
                    </div>
                    <Select
                        value={updateInterval}
                        onChange={(e) => setUpdateInterval(e.target.value)}
                    >
                        <option value="10">10 секунд</option>
                        <option value="30">30 секунд</option>
                        <option value="60">1 минута</option>
                        <option value="300">5 минут</option>
                    </Select>
                </SettingItem>

                <SettingItem>
                    <div className="setting-info">
                        <div className="setting-title">Очистить данные</div>
                        <div className="setting-description">
                            Удалить всю историю местоположений и статистику
                        </div>
                    </div>
                    <Button onClick={handleClearData}>
                        Очистить
                    </Button>
                </SettingItem>
            </Card>

            <Card>
                <h2 style={{ color: '#eef2f8', marginBottom: '20px' }}>Информация о приложении</h2>

                <InfoSection>
                    <h3>Статистика данных</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="label">Пользователь:</span>
                            <span className="value">через аккаунт</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Записей в истории:</span>
                            <span className="value">{locationHistory.length}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Стран посещено:</span>
                            <span className="value">{countryStats.length}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Городов посещено:</span>
                            <span className="value">{cityStats.length}</span>
                        </div>
                    </div>
                </InfoSection>

                <InfoSection>
                    <h3>О приложении</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="label">Версия:</span>
                            <span className="value">1.0.0</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Разработчик:</span>
                            <span className="value">Geo Steam Team</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Лицензия:</span>
                            <span className="value">MIT</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Последнее обновление:</span>
                            <span className="value">{formatDate(new Date().toISOString())}</span>
                        </div>
                    </div>
                </InfoSection>
            </Card>

            <Card>
                <h2 style={{ color: '#eef2f8', marginBottom: '20px' }}>Помощь и поддержка</h2>

                <div style={{ color: '#d5deec', lineHeight: '1.6' }}>
                    <h3 style={{ color: '#eef2f8', marginBottom: '15px' }}>Как использовать приложение</h3>
                    <p style={{ marginBottom: '15px' }}>
                        Geo Steam - это приложение для отслеживания ваших путешествий и анализа геолокации.
                        Приложение автоматически определяет ваше местоположение и сохраняет статистику посещений.
                    </p>

                    <h4 style={{ color: '#eef2f8', marginBottom: '10px' }}>Основные функции:</h4>
                    <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
                        <li>Автоматическое отслеживание местоположения</li>
                        <li>Статистика по странам и городам</li>
                        <li>История всех посещений</li>
                        <li>Визуализация данных в виде графиков</li>
                    </ul>

                    <h4 style={{ color: '#eef2f8', marginBottom: '10px' }}>Примечание о конфиденциальности:</h4>
                    <p>
                        Все данные о местоположении хранятся локально на вашем устройстве.
                        Мы не передаем ваши персональные данные третьим лицам.
                    </p>
                </div>
            </Card>
        </SettingsContainer>
    );
};

export default Settings; 