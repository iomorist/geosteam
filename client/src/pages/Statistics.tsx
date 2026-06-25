import React, { useState } from 'react';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useLocation } from '../contexts/LocationContext';

const StatisticsContainer = styled.div`
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

const TabContainer = styled.div`
  display: flex;
  gap: 5px;
  margin-bottom: 20px;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  background: ${props => props.$active
        ? '#5b8cff'
        : 'rgba(255,255,255,0.08)'
    };
  color: ${props => props.$active ? '#ffffff' : '#dce5f5'};
  
  &:hover {
    background: ${props => props.$active ? '#4f7fe8' : 'rgba(255,255,255,0.14)'};
    color: #ffffff;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
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
  
  .stat-value {
    font-size: 28px;
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

const TableContainer = styled.div`
  overflow-x: auto;
  margin-top: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #4a586f;
  }
  
  th {
    background: rgba(255,255,255,0.06);
    color: #dce5f5;
    font-weight: 600;
    font-size: 14px;
  }
  
  td {
    color: #eef2f8;
    font-size: 14px;
  }
  
  tr:hover {
    background: rgba(255,255,255,0.06);
  }
`;

const ChartContainer = styled.div`
  height: 400px;
  margin-top: 20px;
`;

const COLORS = ['#bdbdbd', '#9e9e9e', '#7f7f7f', '#616161', '#424242', '#8d8d8d', '#a9a9a9', '#d0d0d0'];

const Statistics: React.FC = () => {
    const { countryStats, cityStats } = useLocation();
    const [activeTab, setActiveTab] = useState<'countries' | 'cities'>('countries');

    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const countryChartData = countryStats
        .sort((a, b) => b.total_time - a.total_time)
        .slice(0, 10)
        .map(stat => ({
            name: stat.country,
            time: stat.total_time,
            visits: stat.visit_count
        }));

    const cityChartData = cityStats
        .sort((a, b) => b.total_time - a.total_time)
        .slice(0, 10)
        .map(stat => ({
            name: stat.city,
            time: stat.total_time,
            visits: stat.visit_count
        }));

    const pieChartData = countryStats
        .sort((a, b) => b.total_time - a.total_time)
        .slice(0, 8)
        .map(stat => ({
            name: stat.country,
            value: stat.total_time
        }));

    return (
        <StatisticsContainer>
            <Card>
                <h2 style={{ color: '#eef2f8', marginBottom: '20px' }}>Статистика путешествий</h2>

                <TabContainer>
                    <Tab
                        $active={activeTab === 'countries'}
                        onClick={() => setActiveTab('countries')}
                    >
                        По странам
                    </Tab>
                    <Tab
                        $active={activeTab === 'cities'}
                        onClick={() => setActiveTab('cities')}
                    >
                        По городам
                    </Tab>
                </TabContainer>

                <StatsGrid>
                    <StatCard>
                        <h3>Всего стран посещено</h3>
                        <div className="stat-value">{countryStats.length}</div>
                        <div className="stat-label">Уникальных локаций</div>
                    </StatCard>
                    <StatCard>
                        <h3>Всего городов посещено</h3>
                        <div className="stat-value">{cityStats.length}</div>
                        <div className="stat-label">Уникальных городов</div>
                    </StatCard>
                    <StatCard>
                        <h3>Общее время путешествий</h3>
                        <div className="stat-value">
                            {formatTime(countryStats.reduce((sum, stat) => sum + stat.total_time, 0))}
                        </div>
                        <div className="stat-label">Время в пути</div>
                    </StatCard>
                    <StatCard>
                        <h3>Самый посещаемый регион</h3>
                        <div className="stat-value">
                            {countryStats.length > 0 ? countryStats[0].country : 'Нет данных'}
                        </div>
                        <div className="stat-label">По времени пребывания</div>
                    </StatCard>
                </StatsGrid>

                {activeTab === 'countries' && (
                    <>
                        <Card>
                            <h3 style={{ color: '#eef2f8', marginBottom: '15px' }}>Время пребывания по странам</h3>
                            <ChartContainer>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={countryChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e2e2" />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#aab4c3"
                                            fontSize={12}
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis stroke="#aab4c3" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#ffffff',
                                                border: '1px solid #d9d9d9',
                                                borderRadius: '6px',
                                                color: '#eef2f8'
                                            }}
                                            formatter={(value: number) => [formatTime(value), 'Время']}
                                        />
                                        <Bar dataKey="time" fill="#8f8f8f" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </Card>

                        <Card>
                            <h3 style={{ color: '#eef2f8', marginBottom: '15px' }}>Распределение времени по странам</h3>
                            <ChartContainer>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieChartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={120}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {pieChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#ffffff',
                                                border: '1px solid #d9d9d9',
                                                borderRadius: '6px',
                                                color: '#eef2f8'
                                            }}
                                            formatter={(value: number) => [formatTime(value), 'Время']}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </Card>

                        <Card>
                            <h3 style={{ color: '#eef2f8', marginBottom: '15px' }}>Детальная статистика по странам</h3>
                            <TableContainer>
                                <Table>
                                    <thead>
                                        <tr>
                                            <th>Страна</th>
                                            <th>Время пребывания</th>
                                            <th>Количество посещений</th>
                                            <th>Последнее посещение</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {countryStats
                                            .sort((a, b) => b.total_time - a.total_time)
                                            .map((stat, index) => (
                                                <tr key={index}>
                                                    <td>{stat.country}</td>
                                                    <td>{formatTime(stat.total_time)}</td>
                                                    <td>{stat.visit_count}</td>
                                                    <td>{formatDate(stat.last_visit)}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </Table>
                            </TableContainer>
                        </Card>
                    </>
                )}

                {activeTab === 'cities' && (
                    <>
                        <Card>
                            <h3 style={{ color: '#eef2f8', marginBottom: '15px' }}>Время пребывания по городам</h3>
                            <ChartContainer>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={cityChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e2e2" />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#aab4c3"
                                            fontSize={12}
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis stroke="#aab4c3" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#ffffff',
                                                border: '1px solid #d9d9d9',
                                                borderRadius: '6px',
                                                color: '#eef2f8'
                                            }}
                                            formatter={(value: number) => [formatTime(value), 'Время']}
                                        />
                                        <Bar dataKey="time" fill="#8f8f8f" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </Card>

                        <Card>
                            <h3 style={{ color: '#eef2f8', marginBottom: '15px' }}>Детальная статистика по городам</h3>
                            <TableContainer>
                                <Table>
                                    <thead>
                                        <tr>
                                            <th>Город</th>
                                            <th>Страна</th>
                                            <th>Время пребывания</th>
                                            <th>Количество посещений</th>
                                            <th>Последнее посещение</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cityStats
                                            .sort((a, b) => b.total_time - a.total_time)
                                            .map((stat, index) => (
                                                <tr key={index}>
                                                    <td>{stat.city}</td>
                                                    <td>{stat.country}</td>
                                                    <td>{formatTime(stat.total_time)}</td>
                                                    <td>{stat.visit_count}</td>
                                                    <td>{formatDate(stat.last_visit)}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </Table>
                            </TableContainer>
                        </Card>
                    </>
                )}
            </Card>
        </StatisticsContainer>
    );
};

export default Statistics; 