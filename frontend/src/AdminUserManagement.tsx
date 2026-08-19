import React, { useEffect, useState } from 'react';
import API from './api';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  created_at: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  instructor_id: number;
}

interface Analytics {
  total_users: number;
  total_students: number;
  total_instructors: number;
  total_courses: number;
  total_enrollments: number;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'COURSES' | 'APPROVALS' | 'REVIEWS' | 'ANALYTICS'>('USERS');
  
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Review Delete State
  const [reviewIdToDelete, setReviewIdToDelete] = useState<string>('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [usersRes, coursesRes, analyticsRes] = await Promise.allSettled([
        API.get('/users'),
        API.get('/courses'),
        API.get('/analytics/admin')
      ]);

      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data.users || []);
      if (coursesRes.status === 'fulfilled') setCourses(coursesRes.value.data.courses || []);
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data || null);

    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await API.put(`/users/${userId}/role`, { role: newRole });
      alert(`User role updated to ${newRole}!`);
      fetchInitialData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete user "${name}"?`)) {
      try {
        await API.delete(`/users/${userId}`);
        alert('User deleted successfully!');
        fetchInitialData();
      } catch (err: any) {
        alert(err.response?.data?.error || 'Failed to delete user');
      }
    }
  };

  const handleDeleteCourse = async (courseId: number, title: string) => {
    if (window.confirm(`Are you sure you want to delete the course "${title}"?`)) {
      try {
        await API.delete(`/courses/${courseId}`);
        alert('Course deleted successfully!');
        fetchInitialData();
      } catch (err: any) {
        alert(err.response?.data?.error || 'Failed to delete course');
      }
    }
  };

  const handleDeleteReview = async () => {
    if (!reviewIdToDelete.trim()) return;
    if (window.confirm(`Delete review ID ${reviewIdToDelete}?`)) {
      try {
        await API.delete(`/reviews/${reviewIdToDelete}`);
        alert('Review deleted successfully!');
        setReviewIdToDelete('');
      } catch (err: any) {
        alert(err.response?.data?.error || 'Failed to delete review');
      }
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>Loading Admin Panel...</div>;
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '20px', fontFamily: "'Inter', sans-serif" }}>
      <h2 style={{ fontSize: '28px', color: '#0f172a', marginBottom: '20px' }}>⚡ System Admin Dashboard</h2>

      {/* Tabs Header */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #e2e8f0', marginBottom: '24px' }}>
        {[
          { key: 'USERS', label: '👥 User Management' },
          { key: 'APPROVALS', label: '🎓 Instructor Approvals' },
          { key: 'COURSES', label: '📚 Course Management' },
          { key: 'REVIEWS', label: '🛡️ Review Moderation' },
          { key: 'ANALYTICS', label: '📊 Analytics & Reports' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === tab.key ? '3px solid #4f46e5' : '3px solid transparent',
              color: activeTab === tab.key ? '#4f46e5' : '#64748b',
              fontWeight: activeTab === tab.key ? '700' : '500',
              cursor: 'pointer',
              fontSize: '14.5px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: USER MANAGEMENT */}
      {activeTab === 'USERS' && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, color: '#1e293b' }}>All Registered Users</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px' }}>Role</th>
                <th style={{ padding: '12px' }}>Change Role</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px' }}>{u.id}</td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '12px', color: '#64748b' }}>{u.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', background: u.role === 'ADMIN' ? '#fef3c7' : u.role === 'INSTRUCTOR' ? '#dcfce7' : '#e0f2fe', color: u.role === 'ADMIN' ? '#92400e' : u.role === 'INSTRUCTOR' ? '#166534' : '#075985' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option value="STUDENT">STUDENT</option>
                      <option value="INSTRUCTOR">INSTRUCTOR</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button onClick={() => handleDeleteUser(u.id, u.name)} style={{ padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: INSTRUCTOR APPROVALS */}
      {activeTab === 'APPROVALS' && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, color: '#1e293b' }}>Pending Instructor Requests / Role Upgrades</h3>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Promote Student accounts to Instructor status directly below.</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px' }}>Current Role</th>
                <th style={{ padding: '12px' }}>Approve Action</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => u.role === 'STUDENT').map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '12px', color: '#64748b' }}>{u.email}</td>
                  <td style={{ padding: '12px' }}><span style={{ background: '#e0f2fe', color: '#075985', padding: '3px 8px', borderRadius: '4px', fontSize: '12px' }}>{u.role}</span></td>
                  <td style={{ padding: '12px' }}>
                    <button onClick={() => handleRoleChange(u.id, 'INSTRUCTOR')} style={{ padding: '6px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                      Approve as Instructor
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: COURSE MANAGEMENT */}
      {activeTab === 'COURSES' && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, color: '#1e293b' }}>Platform Courses Control</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th style={{ padding: '12px' }}>Course Title</th>
                <th style={{ padding: '12px' }}>Instructor ID</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px' }}>{c.id}</td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{c.title}</td>
                  <td style={{ padding: '12px', color: '#64748b' }}>Instructor #{c.instructor_id}</td>
                  <td style={{ padding: '12px' }}>
                    <button onClick={() => handleDeleteCourse(c.id, c.title)} style={{ padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                      Remove Course
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: REVIEW MODERATION */}
      {activeTab === 'REVIEWS' && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, color: '#1e293b' }}>Review Moderation & Flagged Content</h3>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <input
              type="text"
              placeholder="Enter Review ID to Delete..."
              value={reviewIdToDelete}
              onChange={(e) => setReviewIdToDelete(e.target.value)}
              style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', width: '260px' }}
            />
            <button onClick={handleDeleteReview} style={{ padding: '10px 18px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              Delete Review
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: ANALYTICS & REPORTS */}
      {activeTab === 'ANALYTICS' && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, color: '#1e293b' }}>Platform Analytics & Overview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px' }}>
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b', fontSize: '13px' }}>Total System Users</span>
              <h2 style={{ margin: '8px 0 0 0', color: '#4f46e5' }}>{analytics?.total_users ?? users.length}</h2>
            </div>
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b', fontSize: '13px' }}>Instructors</span>
              <h2 style={{ margin: '8px 0 0 0', color: '#10b981' }}>{analytics?.total_instructors ?? users.filter(u => u.role === 'INSTRUCTOR').length}</h2>
            </div>
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b', fontSize: '13px' }}>Published Courses</span>
              <h2 style={{ margin: '8px 0 0 0', color: '#06b6d4' }}>{analytics?.total_courses ?? courses.length}</h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;