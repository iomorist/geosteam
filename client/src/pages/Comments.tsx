import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Comment {
  id: number;
  userId: number;
  content: string;
  createdAt: string;
  author: string;
  likes: number;
  dislikes: number;
}

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: linear-gradient(180deg, #2e3747 0%, #323d4f 100%);
  border: 1px solid #445166;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  color: #eef2f8;
`;

const CommentItem = styled.div`
  border-bottom: 1px solid #445166;
  padding: 14px 0;

  &:last-child { border-bottom: none; }

  .author { font-weight: 600; color: #66c0f4; }
  .date { font-size: 12px; color: #8f98a0; margin-left: 8px; }
  .content { margin: 8px 0; }
  .actions { display: flex; gap: 10px; }

  button {
    padding: 4px 12px;
    border-radius: 6px;
    border: 1px solid #445166;
    background: rgba(255,255,255,0.06);
    color: #c7d5e0;
    cursor: pointer;
    &:hover { background: rgba(102,192,244,0.2); }
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;

  textarea {
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #5a6880;
    background: rgba(255,255,255,0.06);
    color: #eef2f8;
    min-height: 80px;
    resize: vertical;
  }

  button[type="submit"] {
    align-self: flex-start;
    padding: 8px 20px;
    border-radius: 8px;
    border: 1px solid #4f7fe8;
    background: #5b8cff;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
  }
`;

const StatusDot = styled.span<{ $connected: boolean }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${p => p.$connected ? '#4bb34b' : '#c0392b'};
  margin-right: 6px;
`;

const Comments: React.FC = () => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const loadComments = useCallback(async () => {
    const res = await axios.get('/api/comments');
    setComments(res.data);
  }, []);

  useEffect(() => {
    loadComments().catch(console.error);

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.hostname}:5000/ws`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'comment_new') {
        setComments(prev => [msg.data, ...prev]);
      }
      if (msg.type === 'comment_like') {
        setComments(prev => prev.map(c =>
          c.id === msg.data.commentId
            ? { ...c, likes: msg.data.likes, dislikes: msg.data.dislikes }
            : c
        ));
      }
    };

    return () => ws.close();
  }, [loadComments]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    await axios.post('/api/comments', { content: text });
    setText('');
  };

  const onLike = async (id: number, isLike: boolean) => {
    if (!user) return;
    await axios.post(`/api/comments/${id}/${isLike ? 'like' : 'dislike'}`);
  };

  return (
    <Container>
      <h2 style={{ color: '#66c0f4', marginBottom: 16 }}>
        Комментарии <small style={{ fontSize: 14, color: '#8f98a0' }}>
          <StatusDot $connected={connected} />
          {connected ? 'Real-time (WebSocket)' : 'Offline'}
        </small>
      </h2>
      <p style={{ color: '#aab4c3', marginBottom: 20 }}>
        Лабораторная №6: отправка и обновление без перезагрузки страницы (JSON + WebSocket)
      </p>

      {user ? (
        <Card>
          <Form onSubmit={onSubmit}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Напишите комментарий..."
              required
            />
            <button type="submit">Отправить</button>
          </Form>
        </Card>
      ) : (
        <Card><p>Войдите, чтобы оставить комментарий</p></Card>
      )}

      <Card>
        {comments.length === 0 ? (
          <p style={{ color: '#8f98a0' }}>Пока нет комментариев</p>
        ) : (
          comments.map(c => (
            <CommentItem key={c.id}>
              <div>
                <span className="author">{c.author}</span>
                <span className="date">{new Date(c.createdAt).toLocaleString('ru')}</span>
              </div>
              <div className="content">{c.content}</div>
              <div className="actions">
                <button onClick={() => onLike(c.id, true)}>👍 {c.likes}</button>
                <button onClick={() => onLike(c.id, false)}>👎 {c.dislikes}</button>
              </div>
            </CommentItem>
          ))
        )}
      </Card>
    </Container>
  );
};

export default Comments;
