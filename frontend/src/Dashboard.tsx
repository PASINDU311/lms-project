import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API, { getNotifications, markAllNotificationsAsRead } from './api';

// AdminUserManagement component
import AdminUserManagement from './AdminUserManagement';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  level?: string;
  capacity?: number;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AdminStats {
  total_students: number;
  total_instructors: number;
  total_courses: number;
  total_enrollments: number;
  pending_submissions: number;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<number[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [enrollingId, setEnrollingId] = useState<number | null>(null);

  // Notification & User Menu States
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // New Course Form State
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);

  const navigate = useNavigate();

  // Combined Initial Data Fetching
  useEffect(() => {
    fetchProfileAndData();
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notifications as read', err);
    }
  };

  const fetchProfileAndData = async () => {
    try {
      // 1. Fetch Logged-in User Profile
      const profileRes = await API.get('/profile');
      const currentUser: UserProfile = profileRes.data.user;
      setUser(currentUser);

      // 2. Fetch All Courses
      const courseRes = await API.get('/courses');
      setCourses(courseRes.data.courses || []);

      // 3. Fetch Enrolled Courses for Current User
      try {
        const myCoursesRes = await API.get('/my-courses');
        const enrollments = myCoursesRes.data.enrollments || [];
        const enrolledIds = enrollments.map((e: any) => e.course_id);
        setEnrolledCourseIds(enrolledIds);
      } catch (e) {
        console.error("Could not fetch user enrollments", e);
      }

      // 4. Fetch Analytics if Admin / Instructor
      if (currentUser.role === 'ADMIN' || currentUser.role === 'INSTRUCTOR') {
        const statsRes = await API.get('/analytics/admin');
        setAdminStats(statsRes.data.stats);
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setLoading(false);
    }
  };

  const handleEnroll = async (course: Course) => {
    setEnrollingId(course.id);
    try {
      await API.post('/enrollments', {
        course_id: course.id,
        amount: course.price,
      });
      alert(`Successfully Enrolled in ${course.title}!`);
      fetchProfileAndData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Enrollment failed');
    } finally {
      setEnrollingId(null);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post('/courses', { title, description, price: Number(price) });
      alert('Course created successfully!');
      setTitle('');
      setDescription('');
      setPrice(0);
      setShowCourseForm(false);
      fetchProfileAndData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create course');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('userName');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '3px solid #e2e8f0',
            borderTopColor: '#4f46e5',
            marginBottom: 16,
          }}
        />
        <p style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>
          Loading your dashboard...
        </p>
      </div>
    );
  }

  const isStaff = user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR';

  const statCards = isStaff && adminStats
    ? [
        {
          label: 'TOTAL STUDENTS',
          value: adminStats.total_students.toLocaleString(),
          subtext: '↗ +12% this month',
          subColor: '#16a34a',
          iconBg: '#f1f5f9',
          icon: (
            <svg width="22" height="22" fill="none" stroke="#94a3b8" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          )
        },
        {
          label: 'TOTAL COURSES',
          value: adminStats.total_courses,
          subtext: '✓ Active this semester',
          subColor: '#64748b',
          iconBg: '#f1f5f9',
          icon: (
            <svg width="22" height="22" fill="none" stroke="#94a3b8" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          )
        },
        {
          label: 'NEW ENROLLMENTS',
          value: adminStats.total_enrollments,
          subtext: '↗ +5% this week',
          subColor: '#16a34a',
          iconBg: '#f1f5f9',
          icon: (
            <svg width="22" height="22" fill="none" stroke="#94a3b8" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
          )
        },
        {
          label: 'PENDING REVIEWS',
          value: adminStats.pending_submissions,
          subtext: '⚠ Requires attention',
          subColor: '#dc2626',
          iconBg: '#fef2f2',
          icon: (
            <svg width="22" height="22" fill="none" stroke="#ef4444" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          )
        },
      ]
    : [
        {
          label: 'AVAILABLE COURSES',
          value: courses.length,
          subtext: 'Ready to learn',
          subColor: '#64748b',
          iconBg: '#f1f5f9',
          icon: '📚'
        },
        {
          label: 'MY ENROLLED COURSES',
          value: enrolledCourseIds.length,
          subtext: 'Currently Enrolled',
          subColor: '#16a34a',
          iconBg: '#f1f5f9',
          icon: '🚀'
        },
      ];

  const courseGradients = [
    'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
    'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: '#0f172a',
      }}
    >
      {/* Navbar */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 24px',
            height: 70,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo & Main Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 18,
                }}
              >
                🎓
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#334155', letterSpacing: '-0.3px' }}>
                EduFlow <span style={{ color: '#4f46e5' }}>LMS</span>
              </span>
            </div>

            <nav style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              <a
                onClick={() => navigate('/dashboard')}
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#4f46e5',
                  textDecoration: 'none',
                  borderBottom: '2px solid #4f46e5',
                  paddingBottom: 22,
                  marginTop: 22,
                  cursor: 'pointer',
                }}
              >
                Dashboard
              </a>
              <a
                onClick={() => navigate('/my-courses')}
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#64748b',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                My Courses
              </a>
            </nav>
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {isStaff && (
              <button
                onClick={() => setShowCourseForm(!showCourseForm)}
                style={{
                  background: '#4f46e5',
                  color: '#fff',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 13.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)',
                }}
              >
                <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Create Course
              </button>
            )}

            {/* Notification Dropdown Component */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: 6,
                  borderRadius: '50%',
                  position: 'relative',
                  fontSize: 18,
                }}
              >
                🔔
                {notifications.filter((n) => !n.is_read).length > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 700,
                      borderRadius: '50%',
                      width: 16,
                      height: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {notifications.filter((n) => !n.is_read).length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 40,
                    width: 320,
                    background: '#ffffff',
                    borderRadius: 12,
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    zIndex: 50,
                    padding: 16,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Notifications</h4>
                    <button
                      onClick={handleMarkAllRead}
                      style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, padding: '12px 0', textAlign: 'center' }}>
                        No notifications available
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          style={{
                            padding: '10px 0',
                            borderBottom: '1px solid #f1f5f9',
                            opacity: n.is_read ? 0.6 : 1,
                          }}
                        >
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{n.title}</div>
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar + Dropdown Menu (With Logout Button) */}
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: '#e0e7ff',
                  color: '#4338ca',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 15,
                  border: '2px solid #fff',
                  boxShadow: '0 0 0 2px #e2e8f0',
                  cursor: 'pointer',
                }}
                title={user?.name}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 48,
                    width: 200,
                    background: '#ffffff',
                    borderRadius: 12,
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    zIndex: 50,
                    padding: '8px 0',
                  }}
                >
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{user?.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{user?.email}</div>
                  </div>

                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 16px',
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 24px 64px' }}>
        {/* Welcome Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 32,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: '-0.5px',
                color: '#0f172a',
                margin: '0 0 6px 0',
              }}
            >
              Welcome back, {user?.name || 'User'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 14, color: '#64748b' }}>
                Here is what's happening with your courses today.
              </span>
              <span
                style={{
                  background: '#dcfce7',
                  color: '#15803d',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 10px',
                  borderRadius: 999,
                  textTransform: 'capitalize',
                }}
              >
                {user?.role?.toLowerCase()}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '9px 16px',
              borderRadius: 10,
              color: '#dc2626',
              fontSize: 13.5,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            🚪 Logout
          </button>
        </div>

        {/* Analytics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
            marginBottom: 40,
          }}
        >
          {statCards.map((card) => (
            <div
              key={card.label}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                padding: 22,
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#64748b',
                    letterSpacing: '0.6px',
                    display: 'block',
                    marginBottom: 10,
                  }}
                >
                  {card.label}
                </span>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                  {card.value}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: card.subColor,
                    marginTop: 10,
                  }}
                >
                  {card.subtext}
                </div>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: card.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {card.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Admin User Management */}
        {user?.role === 'ADMIN' && (
          <div
            style={{
              marginBottom: 40,
              background: '#ffffff',
              borderRadius: 16,
              border: '1px solid #e2e8f0',
              padding: 24,
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            {AdminUserManagement ? (
              <AdminUserManagement />
            ) : (
              <p style={{ color: '#64748b' }}>Admin User Management Module</p>
            )}
          </div>
        )}

        {/* Create Course Form */}
        <AnimatePresence>
          {showCourseForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreateCourse}
              style={{
                background: '#ffffff',
                padding: 28,
                borderRadius: 16,
                border: '1px solid #e2e8f0',
                marginBottom: 40,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              }}
            >
              <h3 style={{ margin: '0 0 20px 0', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                Create New Course
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
                    Course Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Advanced Machine Learning Algorithms"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
                    Price ($)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
                  Course Description
                </label>
                <textarea
                  placeholder="Deep dive into neural networks, SVMs, and unsupervised learning..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="submit"
                  style={{
                    background: '#4f46e5',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Save Course
                </button>
                <button
                  type="button"
                  onClick={() => setShowCourseForm(false)}
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Active Courses */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Active Courses
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 24,
          }}
        >
          {courses.map((course, idx) => {
            const bgGradient = courseGradients[idx % courseGradients.length];
            const isEnrolled = enrolledCourseIds.includes(course.id);

            return (
              <div
                key={course.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 16,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <div>
                  <div
                    style={{
                      height: 120,
                      background: bgGradient,
                      padding: 16,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      boxSizing: 'border-box',
                    }}
                  >
                    <span
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        color: '#0f172a',
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '4px 12px',
                        borderRadius: 6,
                      }}
                    >
                      {course.price === 0 ? 'Beginner' : 'Advanced'}
                    </span>
                    <span
                      style={{
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: 15,
                      }}
                    >
                      {course.price === 0 ? 'Free' : `$${course.price}`}
                    </span>
                  </div>

                  <div style={{ padding: 20 }}>
                    <h3
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: '#0f172a',
                        margin: '0 0 8px 0',
                        lineHeight: 1.3,
                      }}
                    >
                      {course.title}
                    </h3>
                    <p
                      style={{
                        fontSize: 13,
                        color: '#64748b',
                        margin: '0 0 20px 0',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {course.description}
                    </p>

                    <div style={{ marginBottom: 20 }}>
                      <div style={{ height: 6, width: '100%', background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(45 + idx * 20, 85)}%`,
                            background: '#4f46e5',
                            borderRadius: 999,
                          }}
                        />
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right', marginTop: 6, fontWeight: 500 }}>
                        {Math.min(45 + idx * 20, 85)}% Capacity
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: '0 20px 20px 20px',
                    display: 'flex',
                    gap: 10,
                  }}
                >
                  {isEnrolled || isStaff ? (
                    <button
                      onClick={() => navigate(`/learn/${course.id}`)}
                      style={{
                        flex: 1,
                        background: '#4f46e5',
                        color: '#ffffff',
                        border: 'none',
                        padding: '10px',
                        borderRadius: 10,
                        fontWeight: 600,
                        fontSize: 13.5,
                        cursor: 'pointer',
                      }}
                    >
                      View Course
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course)}
                      disabled={enrollingId === course.id}
                      style={{
                        flex: 1,
                        background: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        padding: '10px',
                        borderRadius: 10,
                        fontWeight: 600,
                        fontSize: 13.5,
                        cursor: 'pointer',
                        opacity: enrollingId === course.id ? 0.7 : 1,
                      }}
                    >
                      {enrollingId === course.id ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  )}

                  {isStaff && (
                    <button
                      onClick={() => navigate(`/builder/${course.id}`)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#475569',
                        width: 40,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                      title="Edit Course Builder"
                    >
                      ✏️
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Placeholder Card for Staff */}
          {isStaff && (
            <div
              onClick={() => setShowCourseForm(true)}
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: 16,
                minHeight: 340,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                cursor: 'pointer',
                background: '#f8fafc',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: '#e0e7ff',
                  color: '#4f46e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  marginBottom: 16,
                }}
              >
                +
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
                Create New Course
              </h3>
              <p style={{ fontSize: 13, color: '#64748b', textAlign: 'center', margin: '0 0 20px 0', maxWidth: 200 }}>
                Launch a new module, syllabus, or full curriculum.
              </p>
              <button
                style={{
                  background: '#4f46e5',
                  color: '#fff',
                  border: 'none',
                  padding: '9px 20px',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Builder
              </button>
            </div>
          )}
        </div>

        {courses.length === 0 && !isStaff && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#94a3b8',
              fontSize: 14,
            }}
          >
            No courses available yet.
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;