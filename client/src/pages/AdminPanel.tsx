import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

interface AdminUserRow {
  id: number;
  email: string;
  displayName: string | null;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
}

interface ModerationLogRow {
  id: number;
  adminUserId: number;
  adminEmail: string | null;
  targetUserId: number | null;
  targetEmail: string | null;
  action: string;
  details: Record<string, unknown> | null;
  createdAt: string;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Card = styled.div`
  background: linear-gradient(180deg, #2e3747 0%, #323d4f 100%);
  border: 1px solid #445166;
  border-radius: 12px;
  padding: 16px;
  color: #eef2f8;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.26);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;

  th, td {
    text-align: left;
    padding: 10px;
    border-bottom: 1px solid #4a586f;
    font-size: 14px;
  }

  th {
    color: #aab4c3;
    font-weight: 600;
  }
`;

const ActionButton = styled.button`
  padding: 6px 8px;
  margin-right: 6px;
  border: 1px solid #5b6a81;
  background: rgba(255,255,255,0.08);
  border-radius: 6px;
  color: #dce5f5;
  font-size: 12px;

  &:hover {
    background: rgba(255,255,255,0.14);
  }
`;

const ErrorText = styled.div`
  color: #c0392b;
  font-size: 13px;
`;

const Controls = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;

  input, select {
    border: 1px solid #5a6880;
    border-radius: 6px;
    padding: 8px 10px;
    background: rgba(255,255,255,0.06);
    color: #eef2f8;
    font-size: 13px;
  }
`;

const Pager = styled.div`
  margin-top: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 13px;
  color: #aab4c3;
`;

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [logs, setLogs] = useState<ModerationLogRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [usersPagination, setUsersPagination] = useState<PaginationMeta>({ page: 1, pageSize: 10, total: 0, totalPages: 1 });
  const [logsPagination, setLogsPagination] = useState<PaginationMeta>({ page: 1, pageSize: 15, total: 0, totalPages: 1 });
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [logActionFilter, setLogActionFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');

  const fetchUsers = async (page = usersPagination.page) => {
    setError(null);
    const res = await axios.get('/api/admin/users', {
      params: {
        page,
        pageSize: usersPagination.pageSize,
        search: userSearch || undefined,
        role: userRoleFilter || undefined,
        status: userStatusFilter || undefined
      }
    });
    setUsers(res.data.users || []);
    setUsersPagination(res.data.pagination || usersPagination);
  };

  const fetchLogs = async (page = logsPagination.page) => {
    setError(null);
    const res = await axios.get('/api/admin/logs', {
      params: {
        page,
        pageSize: logsPagination.pageSize,
        search: logSearch || undefined,
        action: logActionFilter || undefined
      }
    });
    setLogs(res.data.logs || []);
    setLogsPagination(res.data.pagination || logsPagination);
  };

  useEffect(() => {
    Promise.all([fetchUsers(1), fetchLogs(1)])
      .catch((err) => setError(err?.response?.data?.error || 'Не удалось загрузить пользователей'))
      .finally(() => setLoading(false));
  }, []);

  const patchUser = async (id: number, payload: Record<string, unknown>) => {
    await axios.patch(`/api/admin/users/${id}`, payload);
    await Promise.all([fetchUsers(usersPagination.page), fetchLogs(1)]);
  };

  const deleteUser = async (id: number) => {
    if (!window.confirm('Удалить пользователя и его геоданные?')) return;
    await axios.delete(`/api/admin/users/${id}`);
    await Promise.all([fetchUsers(usersPagination.page), fetchLogs(1)]);
  };

  return (
    <Container>
      <Card>
        <h2>Админ-панель</h2>
        <div style={{ color: '#aab4c3', fontSize: 13, marginTop: 6 }}>
          Модерация пользователей: роли, блокировка и удаление.
        </div>

        <Controls>
          <ActionButton onClick={() => setActiveTab('users')}>Пользователи</ActionButton>
          <ActionButton onClick={() => setActiveTab('logs')}>Журнал действий</ActionButton>
        </Controls>

        {loading && <div style={{ marginTop: 12 }}>Загрузка...</div>}
        {error && <ErrorText style={{ marginTop: 12 }}>{error}</ErrorText>}

        {!loading && !error && activeTab === 'users' && (
          <>
            <Controls>
              <input
                placeholder="Поиск (email, id, имя)"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)}>
                <option value="">Все роли</option>
                <option value="admin">admin</option>
                <option value="user">user</option>
              </select>
              <select value={userStatusFilter} onChange={(e) => setUserStatusFilter(e.target.value)}>
                <option value="">Все статусы</option>
                <option value="active">active</option>
                <option value="blocked">blocked</option>
              </select>
              <ActionButton onClick={() => fetchUsers(1)}>Применить</ActionButton>
            </Controls>

            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Имя</th>
                  <th>Роль</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.email}</td>
                    <td>{u.displayName || '—'}</td>
                    <td>{u.role}</td>
                    <td>{u.isActive ? 'active' : 'blocked'}</td>
                    <td>
                      <ActionButton onClick={() => patchUser(u.id, { role: u.role === 'admin' ? 'user' : 'admin' })}>
                        {u.role === 'admin' ? 'Сделать user' : 'Сделать admin'}
                      </ActionButton>
                      <ActionButton onClick={() => patchUser(u.id, { isActive: !u.isActive })}>
                        {u.isActive ? 'Блокировать' : 'Разблокировать'}
                      </ActionButton>
                      <ActionButton onClick={() => deleteUser(u.id)}>
                        Удалить
                      </ActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Pager>
              <ActionButton disabled={usersPagination.page <= 1} onClick={() => fetchUsers(usersPagination.page - 1)}>
                Назад
              </ActionButton>
              <span>
                Стр. {usersPagination.page} / {usersPagination.totalPages} (всего: {usersPagination.total})
              </span>
              <ActionButton
                disabled={usersPagination.page >= usersPagination.totalPages}
                onClick={() => fetchUsers(usersPagination.page + 1)}
              >
                Вперёд
              </ActionButton>
            </Pager>
          </>
        )}

        {!loading && !error && activeTab === 'logs' && (
          <>
            <Controls>
              <input
                placeholder="Поиск (id, email, действие)"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
              />
              <select value={logActionFilter} onChange={(e) => setLogActionFilter(e.target.value)}>
                <option value="">Все действия</option>
                <option value="user_update">user_update</option>
                <option value="user_delete">user_delete</option>
              </select>
              <ActionButton onClick={() => fetchLogs(1)}>Применить</ActionButton>
            </Controls>

            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Когда</th>
                  <th>Админ</th>
                  <th>Цель</th>
                  <th>Действие</th>
                  <th>Детали</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td>{new Date(log.createdAt).toLocaleString('ru-RU')}</td>
                    <td>{log.adminEmail || log.adminUserId}</td>
                    <td>{log.targetEmail || log.targetUserId || '—'}</td>
                    <td>{log.action}</td>
                    <td>{log.details ? JSON.stringify(log.details) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Pager>
              <ActionButton disabled={logsPagination.page <= 1} onClick={() => fetchLogs(logsPagination.page - 1)}>
                Назад
              </ActionButton>
              <span>
                Стр. {logsPagination.page} / {logsPagination.totalPages} (всего: {logsPagination.total})
              </span>
              <ActionButton
                disabled={logsPagination.page >= logsPagination.totalPages}
                onClick={() => fetchLogs(logsPagination.page + 1)}
              >
                Вперёд
              </ActionButton>
            </Pager>
          </>
        )}
      </Card>
    </Container>
  );
};

export default AdminPanel;

