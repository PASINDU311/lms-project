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
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', fontFamily: "'IBM Plex Mono', monospace", color: '#A39C8C', backgroundColor: '#FAF8F3', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '13px' }}>
        LOADING ADMIN PANEL...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1020px', margin: '0 auto', padding: '40px 24px', fontFamily: "'Inter', sans-serif", color: '#201F1C', backgroundColor: '#FAF8F3', minHeight: '100vh' }}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');`}
      </style>

      {/* Header Panel */}
      <div style={{ position: 'relative', backgroundColor: '#FFFFFF', border: '1px solid #E4DFD1', borderTop: '3px solid #2B4A3E', borderRadius: '10px', padding: '28px', marginBottom: '24px' }}>
        <div style={{ position: 'absolute', top: '24px', right: '28px', transform: 'rotate(28deg)', backgroundColor: '#FBEAE3', color: '#B5482F', border: '1.5px solid #B5482F', padding: '2px 8px', borderRadius: '4px', fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', pointerEvents: 'none' }}>
          SYSTEM ADMIN
        </div>

        <div style={{ maxWidth: '720px' }}>
          <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px' }}>
            CONTROL PANEL
          </span>
          <h1 style={{ fontSize: '30px', fontWeight: 600, color: '#201F1C', fontFamily: "'Fraunces', serif", margin: '0 0 12px 0', lineHeight: 1.2 }}>
            System Administration Ledger
          </h1>
          <p style={{ color: '#6B6558', fontSize: '14.5px', lineHeight: 1.6, margin: 0 }}>
            Platform governance, user credentials, approval requests, and system-wide content moderation.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E4DFD1', marginBottom: '28px', overflowX: 'auto' }}>
        {[
          { key: 'USERS', label: 'User Catalog' },
          { key: 'APPROVALS', label: 'Instructor Approvals' },
          { key: 'COURSES', label: 'Course Catalog' },
          { key: 'REVIEWS', label: 'Review Moderation' },
          { key: 'ANALYTICS', label: 'System Reports' },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '10px 16px',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: isActive ? '2px solid #2B4A3E' : '2px solid transparent',
                color: isActive ? '#2B4A3E' : '#6B6558',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                fontSize: '13px',
                fontFamily: isActive ? "'IBM Plex Mono', monospace" : "'Inter', sans-serif",
                textTransform: isActive ? 'uppercase' : 'none',
                letterSpacing: isActive ? '0.03em' : 'normal',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: USER MANAGEMENT */}
      {activeTab === 'USERS' && (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E4DFD1', borderTop: '3px solid #2B4A3E', borderRadius: '10px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#201F1C', fontFamily: "'Fraunces', serif" }}>
              Registered Users
            </h3>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#2B4A3E', backgroundColor: '#E7EEE9', border: '1px solid #2B4A3E', padding: '2px 8px', borderRadius: '4px', fontFamily: "'IBM Plex Mono', monospace" }}>
              TOTAL: {users.length < 10 ? `0${users.length}` : users.length}
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E4DFD1', backgroundColor: '#FAF8F3' }}>
                  <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 600, color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID</th>
                  <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 600, color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                  <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 600, color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                  <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 600, color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                  <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 600, color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Update Role</th>
                  <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 600, color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const roleBg = u.role === 'ADMIN' ? '#FBF1DA' : u.role === 'INSTRUCTOR' ? '#E7EEE9' : '#E9EFF3';
                  const roleColor = u.role === 'ADMIN' ? '#B98A1E' : u.role === 'INSTRUCTOR' ? '#2B4A3E' : '#3D5A73';

                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid #E4DFD1' }}>
                      <td style={{ padding: '12px', fontFamily: "'IBM Plex Mono', monospace", color: '#A39C8C', fontSize: '12.5px' }}>#{u.id}</td>
                      <td style={{ padding: '12px', fontWeight: 600, color: '#201F1C' }}>{u.name}</td>
                      <td style={{ padding: '12px', color: '#6B6558', fontFamily: "'IBM Plex Mono', monospace", fontSize: '12.5px' }}>{u.email}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", backgroundColor: roleBg, color: roleColor, border: `1px solid ${roleColor}` }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #E4DFD1',
                            fontSize: '12.5px',
                            backgroundColor: '#FAF8F3',
                            color: '#201F1C',
                            fontFamily: "'Inter', sans-serif",
                            outline: 'none',
                          }}
                        >
                          <option value="STUDENT">STUDENT</option>
                          <option value="INSTRUCTOR">INSTRUCTOR</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#FBEAE3',
                            color: '#B5482F',
                            border: '1px solid #B5482F',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: INSTRUCTOR APPROVALS */}
      {activeTab === 'APPROVALS' && (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E4DFD1', borderTop: '3px solid #3D5A73', borderRadius: '10px', padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 600, color: '#201F1C', fontFamily: "'Fraunces', serif" }}>
              Pending Instructor Approvals
            </h3>
            <p style={{ margin: 0, color: '#6B6558', fontSize: '13.5px' }}>
              Promote verified student accounts to instructor status in the registry.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E4DFD1', backgroundColor: '#FAF8F3' }}>
                  <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 600, color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                  <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 600, color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                  <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 600, color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Status</th>
                  <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 600, color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Approve Action</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => u.role === 'STUDENT').length > 0 ? (
                  users.filter(u => u.role === 'STUDENT').map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #E4DFD1' }}>
                      <td style={{ padding: '12px', fontWeight: 600, color: '#201F1C' }}>{u.name}</td>
                      <td style={{ padding: '12px', color: '#6B6558', fontFamily: "'IBM Plex Mono', monospace", fontSize: '12.5px' }}>{u.email}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ backgroundColor: '#E9EFF3', color: '#3D5A73', border: '1px solid #3D5A73', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleRoleChange(u.id, 'INSTRUCTOR')}
                          style={{
                            padding: '6px 14px',
                            backgroundColor: '#2B4A3E',
                            color: '#FAF8F3',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '12.5px',
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          Approve as Instructor
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      No pending student promotion requests.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: COURSE MANAGEMENT */}
      {activeTab === 'COURSES' && (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E4DFD1', borderTop: '3px solid #B98A1E', borderRadius: '10px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#201F1C', fontFamily: "'Fraunces', serif" }}>
              Platform Course Control
            </h3>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#B98A1E', backgroundColor: '#FBF1DA', border: '1px solid #B98A1E', padding: '2px 8px', borderRadius: '4px', fontFamily: "'IBM Plex Mono', monospace" }}>
              TOTAL: {courses.length < 10 ? `0${courses.length}` : courses.length}
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E4DFD1', backgroundColor: '#FAF8F3' }}>
                  <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 600, color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID</th>
                  <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 600, color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Course Title</th>
                  <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 600, color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Instructor</th>
                  <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 600, color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.length > 0 ? (
                  courses.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #E4DFD1' }}>
                      <td style={{ padding: '12px', fontFamily: "'IBM Plex Mono', monospace", color: '#A39C8C', fontSize: '12.5px' }}>#{c.id}</td>
                      <td style={{ padding: '12px', fontWeight: 600, color: '#201F1C' }}>{c.title}</td>
                      <td style={{ padding: '12px', color: '#6B6558', fontFamily: "'IBM Plex Mono', monospace", fontSize: '12.5px' }}>INSTRUCTOR #{c.instructor_id}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteCourse(c.id, c.title)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#FBEAE3',
                            color: '#B5482F',
                            border: '1px solid #B5482F',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          Remove Course
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      The course catalog is empty.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: REVIEW MODERATION */}
      {activeTab === 'REVIEWS' && (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E4DFD1', borderTop: '3px solid #B5482F', borderRadius: '10px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600, color: '#201F1C', fontFamily: "'Fraunces', serif" }}>
            Review Moderation & Content Removal
          </h3>
          <p style={{ margin: '0 0 20px 0', color: '#6B6558', fontSize: '13.5px' }}>
            Purge flagged or policy-violating review entries directly from the database by ID reference.
          </p>

          <div style={{ backgroundColor: '#FAF8F3', border: '1.5px dashed #D2CBB8', borderRadius: '8px', padding: '20px' }}>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              TARGET REVIEW REFERENCE ID
            </label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="e.g. 1042"
                value={reviewIdToDelete}
                onChange={(e) => setReviewIdToDelete(e.target.value)}
                style={{
                  padding: '9px 12px',
                  border: '1px solid #E4DFD1',
                  borderRadius: '7px',
                  width: '260px',
                  fontSize: '13.5px',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  color: '#201F1C',
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              />
              <button
                onClick={handleDeleteReview}
                style={{
                  padding: '9px 18px',
                  backgroundColor: '#B5482F',
                  color: '#FAF8F3',
                  border: 'none',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Delete Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ANALYTICS & REPORTS */}
      {activeTab === 'ANALYTICS' && (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E4DFD1', borderTop: '3px solid #2B4A3E', borderRadius: '10px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600, color: '#201F1C', fontFamily: "'Fraunces', serif" }}>
            System Ledger Statistics
          </h3>

          {/* Report-Card Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E4DFD1',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '20px', borderRight: '1px solid #E4DFD1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                TOTAL USERS
              </span>
              <div style={{ fontSize: '28px', fontWeight: 600, color: '#201F1C', fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.1 }}>
                {analytics?.total_users ?? users.length}
              </div>
            </div>

            <div style={{ padding: '20px', borderRight: '1px solid #E4DFD1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                INSTRUCTORS
              </span>
              <div style={{ fontSize: '28px', fontWeight: 600, color: '#2B4A3E', fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.1 }}>
                {analytics?.total_instructors ?? users.filter(u => u.role === 'INSTRUCTOR').length}
              </div>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                COURSES PUBLISHED
              </span>
              <div style={{ fontSize: '28px', fontWeight: 600, color: '#3D5A73', fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.1 }}>
                {analytics?.total_courses ?? courses.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;