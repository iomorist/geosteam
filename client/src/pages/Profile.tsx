import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  max-width: 680px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: linear-gradient(180deg, #2e3747 0%, #323d4f 100%);
  border: 1px solid #445166;
  border-radius: 12px;
  padding: 16px;
  color: #eef2f8;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.26);
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #4a586f;

  &:last-child {
    border-bottom: none;
  }

  .label {
    color: #aab4c3;
  }
`;

const Button = styled.button`
  margin-top: 16px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #4f7fe8;
  background: #5b8cff;
  color: #ffffff;
  font-weight: 600;

  &:hover {
    background: #4f7fe8;
  }
`;

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const doLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <Container>
      <Card>
        <h2 style={{ marginBottom: 8 }}>Личный кабинет</h2>
        <div style={{ color: '#aab4c3', marginBottom: 12, fontSize: 13 }}>
          Аккаунт используется для привязки истории и статистики.
        </div>

        <Row>
          <div className="label">Email</div>
          <div>{user.email}</div>
        </Row>
        <Row>
          <div className="label">Имя</div>
          <div>{user.displayName || '—'}</div>
        </Row>

        <Button onClick={doLogout}>Выйти</Button>
      </Card>
    </Container>
  );
};

export default Profile;

