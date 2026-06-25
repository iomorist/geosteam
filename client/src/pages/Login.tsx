import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  max-width: 420px;
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

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;

  label {
    font-size: 13px;
    color: #aab4c3;
  }

  input {
    padding: 9px 11px;
    border-radius: 8px;
    border: 1px solid #5a6880;
    background: rgba(255,255,255,0.06);
    color: #eef2f8;
  }
`;

const Button = styled.button`
  width: 100%;
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

const ErrorText = styled.div`
  margin-top: 10px;
  color: #c0392b;
  font-size: 13px;
`;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/profile');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Не удалось войти');
    }
  };

  return (
    <Container>
      <Card>
        <h2 style={{ marginBottom: 14 }}>Вход</h2>
        <form onSubmit={onSubmit}>
          <Field>
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </Field>
          <Field>
            <label>Пароль</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </Field>
          <Button type="submit">Войти</Button>
          {error && <ErrorText>{error}</ErrorText>}
        </form>
        <div style={{ marginTop: 12, fontSize: 13, color: '#aab4c3' }}>
          Нет аккаунта? <Link to="/register" style={{ textDecoration: 'underline' }}>Регистрация</Link>
        </div>
      </Card>
    </Container>
  );
};

export default Login;

