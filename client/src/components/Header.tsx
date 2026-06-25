import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useLocation as useLocationContext } from '../contexts/LocationContext';
import { useAuth } from '../contexts/AuthContext';

const HeaderContainer = styled.header`
  background: linear-gradient(180deg, #202734 0%, #252e3d 100%);
  border-right: 1px solid #3f4c63;
  padding: 18px 14px;
  box-shadow: 1px 0 0 rgba(0, 0, 0, 0.04);
  width: 260px;
  min-width: 260px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;

  @media (max-width: 900px) {
    position: static;
    width: 100%;
    min-width: 0;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #3f4c63;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 14px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 2px;
  
  h1 {
    font-size: 20px;
    font-weight: 700;
    color: #eef2f8;
    text-transform: none;
    letter-spacing: 0.2px;
  }
  
  .logo-icon {
    width: 32px;
    height: 32px;
    background: #5b8cff;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    color: #ffffff;
  }
`;

const ProfileCard = styled.div`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid #445166;
  border-radius: 12px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 10px;

  .avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: #5b8cff;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    flex-shrink: 0;
  }

  .meta {
    min-width: 0;
  }

  .name {
    color: #eef2f8;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sub {
    color: #aab4c3;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Navigation = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NavLink = styled(Link) <{ $isActive: boolean }>`
  padding: 9px 10px;
  border-radius: 8px;
  color: ${props => props.$isActive ? '#ffffff' : '#d6deea'};
  background: ${props => props.$isActive ? '#5b8cff' : 'transparent'};
  font-weight: ${props => props.$isActive ? '600' : '400'};
  transition: all 0.16s ease;
  box-shadow: none;
  text-decoration: none;
  
  &:hover {
    background: ${props => props.$isActive ? '#5b8cff' : 'rgba(255,255,255,0.08)'};
    color: #ffffff;
    transform: none;
    box-shadow: none;
  }
`;

const TrackingStatus = styled.div<{ $isTracking: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 12px;
  border-radius: 8px;
  border: 1px solid #445166;
  background: ${props => props.$isTracking
        ? 'rgba(75, 181, 75, 0.2)'
        : 'rgba(255,255,255,0.06)'
    };
  color: #dbe4f1;
  font-size: 13px;
  font-weight: 500;
  box-shadow: none;
  
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.$isTracking ? '#4bb34b' : '#7f8fa5'};
    animation: ${props => props.$isTracking ? 'pulse 2s infinite' : 'none'};
  }
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const Header: React.FC = () => {
    const location = useLocation();
    const { isTracking, currentLocation } = useLocationContext();
    const { user } = useAuth();
    const profileName = user?.displayName || user?.email || 'Гость';
    const initial = profileName.charAt(0).toUpperCase();

    const isActive = (path: string) => location.pathname === path;

    return (
        <HeaderContainer>
            <HeaderContent>
                <Logo>
                    <div className="logo-icon">🌍</div>
                    <h1>Geo Steam</h1>
                </Logo>

                <ProfileCard>
                    <div className="avatar">{initial}</div>
                    <div className="meta">
                        <div className="name">{profileName}</div>
                        <div className="sub">{user ? (user.role === 'admin' ? 'Администратор' : 'Пользователь') : 'Не авторизован'}</div>
                    </div>
                </ProfileCard>

                <TrackingStatus $isTracking={isTracking}>
                    <div className="status-dot"></div>
                    {isTracking ? 'Отслеживание активно' : 'Отслеживание неактивно'}
                </TrackingStatus>

                <Navigation>
                    <NavLink to="/" $isActive={isActive('/')}>
                        Дашборд
                    </NavLink>
                    <NavLink to="/statistics" $isActive={isActive('/statistics')}>
                        Статистика
                    </NavLink>
                    <NavLink to="/history" $isActive={isActive('/history')}>
                        История
                    </NavLink>
                    <NavLink to="/comments" $isActive={isActive('/comments')}>
                        Комментарии
                    </NavLink>
                    <NavLink to="/feedback" $isActive={isActive('/feedback')}>
                        Обратная связь
                    </NavLink>
                    <NavLink to="/settings" $isActive={isActive('/settings')}>
                        Настройки
                    </NavLink>
                    <NavLink to={user ? "/profile" : "/login"} $isActive={isActive('/profile') || isActive('/login')}>
                        {user ? 'Профиль' : 'Войти'}
                    </NavLink>
                    {user?.role === 'admin' && (
                        <NavLink to="/admin" $isActive={isActive('/admin')}>
                            Админ
                        </NavLink>
                    )}
                </Navigation>
            </HeaderContent>
        </HeaderContainer>
    );
};

export default Header; 