import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: linear-gradient(180deg, #2e3747 0%, #323d4f 100%);
  border: 1px solid #445166;
  border-radius: 12px;
  padding: 20px;
  color: #eef2f8;
`;

const Field = styled.div`
  margin-bottom: 14px;

  label { display: block; font-size: 13px; color: #aab4c3; margin-bottom: 4px; }

  input, textarea {
    width: 100%;
    padding: 9px 11px;
    border-radius: 8px;
    border: 1px solid #5a6880;
    background: rgba(255,255,255,0.06);
    color: #eef2f8;
    box-sizing: border-box;
  }

  input:valid:not(:placeholder-shown) { border-color: #4bb34b; }
  input:invalid:not(:placeholder-shown):not(:focus) { border-color: #c0392b; }
`;

const Button = styled.button`
  padding: 10px 24px;
  border-radius: 8px;
  border: 1px solid #4f7fe8;
  background: #5b8cff;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
`;

const Feedback: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Отправка...');
    setError(false);
    try {
      const res = await axios.post('/api/feedback', { name, email, message });
      setStatus(res.data.telegramSent
        ? 'Сообщение отправлено! Уведомление в Telegram доставлено.'
        : 'Сообщение сохранено. (Telegram не настроен — см. .env.example)');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setStatus('Ошибка отправки');
      setError(true);
    }
  };

  return (
    <Container>
      <h2 style={{ color: '#66c0f4', marginBottom: 8 }}>Обратная связь</h2>
      <p style={{ color: '#aab4c3', marginBottom: 20 }}>
        Лабораторная №3: REST API + Telegram Bot API
      </p>
      <Card>
        <form onSubmit={onSubmit}>
          <Field>
            <label>Имя *</label>
            <input value={name} onChange={e => setName(e.target.value)} required placeholder="Иван" />
          </Field>
          <Field>
            <label>Email *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="user@mail.ru" />
          </Field>
          <Field>
            <label>Сообщение *</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={5} placeholder="Ваше сообщение..." />
          </Field>
          <Button type="submit">Отправить в Telegram</Button>
        </form>
        {status && <p style={{ marginTop: 16, color: error ? '#c0392b' : '#4bb34b' }}>{status}</p>}
      </Card>
    </Container>
  );
};

export default Feedback;
