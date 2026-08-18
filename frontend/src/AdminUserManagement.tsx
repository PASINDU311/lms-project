import React, { useEffect, useState } from 'react';
import API from './api';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  created_at: string;
}

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users');
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await API.put(`/users/${userId}/role`, { role: newRole });
      alert(`User role updated to ${newRole}!`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete user "${name}"?`)) {
      try {
        await API.delete(`/users/${userId}`);
        alert('User deleted successfully!');
        fetchUsers();
      } catch (err: any) {
        alert(err.response?.data?.error || 'Failed to delete user');
      }
    }
  };

  if (loading) return <div>Loading Users Data...</div>;

  return (
    <div style={{ marginTop: '30px', padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>👥 User Management & Instructor Approvals</h3>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
            <th style={{ padding: '10px' }}>ID</th>
            <th style={{ padding: '10px' }}>Name</th>
            <th style={{ padding: '10px' }}>Email</th>
            <th style={{ padding: '10px' }}>Current Role</th>
            <th style={{ padding: '10px' }}>Change Role / Approve</th>
            <th style={{ padding: '10px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '10px' }}>{u.id}</td>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>{u.name}</td>
              <td style={{ padding: '10px', color: '#64748b' }}>{u.email}</td>
              <td style={{ padding: '10px' }}>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    background: u.role === 'ADMIN' ? '#fef3c7' : u.role === 'INSTRUCTOR' ? '#dcfce7' : '#e0f2fe',
                    color: u.role === 'ADMIN' ? '#92400e' : u.role === 'INSTRUCTOR' ? '#166534' : '#075985',
                  }}
                >
                  {u.role}
                </span>
              </td>
              <td style={{ padding: '10px' }}>
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="STUDENT">STUDENT</option>
                  <option value="INSTRUCTOR">INSTRUCTOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </td>
              <td style={{ padding: '10px' }}>
                <button
                  onClick={() => handleDeleteUser(u.id, u.name)}
                  style={{ padding: '5px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUserManagement;