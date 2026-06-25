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

  label { font-size: 13px; color: #aab4c3; }

  input {
    padding: 9px 11px;
    border-radius: 8px;
    border: 1px solid #5a6880;
    background: rgba(255,255,255,0.06);
    color: #eef2f8;
  }

  input:required { border-left: 3px solid #66c0f4; }
  input:optional, input:not([required]) { border-left: 3px solid #8f98a0; }
  input:focus { outline: 2px solid #66c0f4; }
  input:valid:not(:placeholder-shown) { border-color: #4bb34b; }
  input:invalid:not(:placeholder-shown):not(:focus) { border-color: #c0392b; }

  .hint { font-size: 12px; color: #8f98a0; }
  .err { font-size: 12px; color: #c0392b; min-height: 1em; }
`;

const Button = styled.button`
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #4f7fe8;
  background: #5b8cff;
  color: #ffffff;
  font-weight: 600;
  &:disabled { background: #555; cursor: not-allowed; }
`;

const ErrorText = styled.div`
  margin-top: 10px;
  color: #c0392b;
  font-size: 13px;
`;

function validateName(value: string, label: string): string {
  if (!value) return `${label} обязательно`;
  if (!/^[A-ZА-ЯЁ][a-zа-яё]+$/.test(value)) {
    return `${label}: только буквы, одна заглавная`;
  }
  return '';
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    e.firstName = validateName(firstName, 'Имя');
    e.lastName = validateName(lastName, 'Фамилия');
    if (!email) e.email = 'Email обязателен';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Некорректный email';
    if (!password) e.password = 'Пароль обязателен';
    else if (password.length < 6) e.password = 'Минимум 6 символов';
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setError(null);
    try {
      await register(email, password, displayName || undefined, firstName, lastName);
      navigate('/profile');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Не удалось зарегистрироваться');
    }
  };

  const canSubmit = firstName && lastName && email && password.length >= 6
    && !validateName(firstName, 'Имя') && !validateName(lastName, 'Фамилия');

  return (
    <Container>
      <Card>
        <h2 style={{ marginBottom: 14 }}>Регистрация</h2>
        <p style={{ fontSize: 13, color: '#aab4c3', marginBottom: 14 }}>
          Лаб. 2: CSS :valid/:invalid + JS-валидация
        </p>
        <form onSubmit={onSubmit} noValidate>
          <Field>
            <label>Имя *</label>
            <input value={firstName} onChange={e => setFirstName(e.target.value)} required placeholder="Иван" />
            <div className="hint">Только буквы, одна заглавная</div>
            <div className="err">{errors.firstName}</div>
          </Field>
          <Field>
            <label>Фамилия *</label>
            <input value={lastName} onChange={e => setLastName(e.target.value)} required placeholder="Иванов" />
            <div className="err">{errors.lastName}</div>
          </Field>
          <Field>
            <label>Отображаемое имя</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Опционально" />
          </Field>
          <Field>
            <label>Email *</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="user@mail.ru" />
            <div className="err">{errors.email}</div>
          </Field>
          <Field>
            <label>Пароль *</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" required minLength={6} placeholder="Мин. 6 символов" />
            <div className="err">{errors.password}</div>
          </Field>
          <Button type="submit" disabled={!canSubmit}>Создать аккаунт</Button>
          {error && <ErrorText>{error}</ErrorText>}
        </form>
        <div style={{ marginTop: 12, fontSize: 13, color: '#aab4c3' }}>
          Уже есть аккаунт? <Link to="/login" style={{ textDecoration: 'underline' }}>Войти</Link>
        </div>
      </Card>
    </Container>
  );
};

export default Register;
