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

/* ---------------------------------------------------------------------- *
 * Design tokens
 * A "ledger" identity: warm paper background, deep-forest ink as the
 * primary accent, a brick red reserved for things that need attention,
 * and marigold used sparingly like a highlighter. Fraunces carries
 * headings, Inter carries body copy, and IBM Plex Mono renders every
 * number — like figures entered by hand in a gradebook.
 * ---------------------------------------------------------------------- */
const T = {
  paper: '#FAF8F3',
  surface: '#FFFFFF',
  ink: '#201F1C',
  inkSoft: '#6B6558',
  inkFaint: '#A39C8C',
  line: '#E4DFD1',
  lineStrong: '#D2CBB8',
  forest: '#2B4A3E',
  forestSoft: '#E7EEE9',
  brick: '#B5482F',
  brickSoft: '#FBEAE3',
  marigold: '#B98A1E',
  marigoldSoft: '#FBF1DA',
  slate: '#3D5A73',
  slateSoft: '#E9EFF3',
  display: "'Fraunces', Georgia, 'Times New Roman', serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace",
};

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
    @media (prefers-reduced-motion: reduce) {
      * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
    }
  `}</style>
);

const Icon = {
  Bell: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  Students: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Book: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Ledger: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  ),
  Flag: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Door: () => (
    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V3h9v18M9 3L4 4v17l5-1M13 12v.01" />
    </svg>
  ),
  Plus: () => (
    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  Pencil: () => (
    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
};

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
        console.error('Could not fetch user enrollments', e);
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
          background: T.paper,
          fontFamily: T.body,
        }}
      >
        <FontLoader />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            border: `2.5px solid ${T.line}`,
            borderTopColor: T.forest,
            marginBottom: 18,
          }}
        />
        <p style={{ color: T.inkSoft, fontSize: 13, fontFamily: T.mono, letterSpacing: '0.03em' }}>
          opening the gradebook…
        </p>
      </div>
    );
  }

  const isStaff = user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR';

  const statCards = isStaff && adminStats
    ? [
        { label: 'STUDENTS ON ROLL', value: adminStats.total_students.toLocaleString(), note: '+12% this month', tone: T.forest, icon: <Icon.Students /> },
        { label: 'COURSES LISTED', value: String(adminStats.total_courses), note: 'active this term', tone: T.slate, icon: <Icon.Book /> },
        { label: 'NEW ENROLLMENTS', value: String(adminStats.total_enrollments), note: '+5% this week', tone: T.forest, icon: <Icon.Ledger /> },
        { label: 'PENDING REVIEW', value: String(adminStats.pending_submissions), note: 'needs a look', tone: T.brick, icon: <Icon.Flag /> },
      ]
    : [
        { label: 'OPEN COURSES', value: String(courses.length), note: 'ready to start', tone: T.slate, icon: <Icon.Book /> },
        { label: 'YOUR ENROLLMENTS', value: String(enrolledCourseIds.length), note: 'in progress', tone: T.forest, icon: <Icon.Ledger /> },
      ];

  // Signature detail: each course card gets a hairline "rule" color and a
  // rotated stamp in the corner, like a due-date stamp on a library card.
  const ruleColors = [T.forest, T.brick, T.marigold, T.slate];

  return (
    <div style={{ minHeight: '100vh', background: T.paper, fontFamily: T.body, color: T.ink }}>
      <FontLoader />

      {/* Navbar */}
      <header
        style={{
          background: T.paper,
          borderBottom: `1px solid ${T.line}`,
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            padding: '0 24px',
            height: 68,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo & Main Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 44 }}>
            <div
              style={{ display: 'flex', alignItems: 'baseline', gap: 8, cursor: 'pointer' }}
              onClick={() => navigate('/dashboard')}
            >
              <span
                style={{
                  fontFamily: T.display,
                  fontSize: 22,
                  fontWeight: 600,
                  color: T.ink,
                  letterSpacing: '-0.01em',
                }}
              >
                EduFlow
              </span>
              <span
                style={{
                  fontFamily: T.mono,
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: T.forest,
                  background: T.forestSoft,
                  padding: '2px 6px',
                  borderRadius: 3,
                  letterSpacing: '0.06em',
                }}
              >
                LMS
              </span>
            </div>

            <nav style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
              <a
                onClick={() => navigate('/dashboard')}
                style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: T.ink,
                  textDecoration: 'none',
                  borderBottom: `2px solid ${T.forest}`,
                  paddingBottom: 22,
                  marginTop: 22,
                  cursor: 'pointer',
                  fontFamily: T.body,
                }}
              >
                Dashboard
              </a>
              <a
                onClick={() => navigate('/my-courses')}
                style={{
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: T.inkSoft,
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                My Courses
              </a>
            </nav>
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {isStaff && (
              <button
                onClick={() => setShowCourseForm(!showCourseForm)}
                style={{
                  background: T.forest,
                  color: T.paper,
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: 7,
                  fontWeight: 600,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  cursor: 'pointer',
                  fontFamily: T.body,
                }}
              >
                <Icon.Plus /> New Course
              </button>
            )}

            {/* Notification Dropdown Component */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: 'none',
                  border: `1px solid ${T.line}`,
                  color: T.inkSoft,
                  cursor: 'pointer',
                  padding: 8,
                  borderRadius: '50%',
                  position: 'relative',
                  display: 'flex',
                }}
              >
                <Icon.Bell />
                {notifications.filter((n) => !n.is_read).length > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      background: T.brick,
                      color: '#fff',
                      fontSize: 9.5,
                      fontFamily: T.mono,
                      fontWeight: 600,
                      borderRadius: '50%',
                      width: 15,
                      height: 15,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1.5px solid ${T.paper}`,
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
                    top: 44,
                    width: 320,
                    background: T.surface,
                    borderRadius: 10,
                    boxShadow: '0 12px 28px -8px rgba(32,31,28,0.18)',
                    border: `1px solid ${T.line}`,
                    zIndex: 50,
                    padding: 16,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: T.ink, fontFamily: T.display }}>
                      Notifications
                    </h4>
                    <button
                      onClick={handleMarkAllRead}
                      style={{ background: 'none', border: 'none', color: T.forest, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: T.mono }}
                    >
                      mark all read
                    </button>
                  </div>

                  <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <p style={{ fontSize: 13, color: T.inkFaint, margin: 0, padding: '14px 0', textAlign: 'center' }}>
                        Nothing here yet.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          style={{
                            padding: '10px 0',
                            borderBottom: `1px solid ${T.line}`,
                            opacity: n.is_read ? 0.55 : 1,
                          }}
                        >
                          <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{n.title}</div>
                          <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 2 }}>{n.message}</div>
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
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: T.forest,
                  color: T.paper,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 14,
                  fontFamily: T.display,
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
                    top: 46,
                    width: 200,
                    background: T.surface,
                    borderRadius: 10,
                    boxShadow: '0 12px 28px -8px rgba(32,31,28,0.18)',
                    border: `1px solid ${T.line}`,
                    zIndex: 50,
                    padding: '8px 0',
                  }}
                >
                  <div style={{ padding: '8px 16px', borderBottom: `1px solid ${T.line}` }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, fontFamily: T.display }}>{user?.name}</div>
                    <div style={{ fontSize: 11, color: T.inkSoft }}>{user?.email}</div>
                  </div>

                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 16px',
                      background: 'none',
                      border: 'none',
                      color: T.brick,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 9,
                      fontFamily: T.body,
                    }}
                  >
                    <Icon.Door /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1240, margin: '0 auto', padding: '40px 24px 72px' }}>
        {/* Welcome Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <h1
              style={{
                fontFamily: T.display,
                fontSize: 32,
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: T.ink,
                margin: 0,
              }}
            >
              Welcome back, {user?.name || 'User'}
            </h1>
            <span
              style={{
                fontFamily: T.mono,
                background: T.forestSoft,
                color: T.forest,
                fontSize: 10.5,
                fontWeight: 600,
                padding: '3px 9px',
                borderRadius: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {user?.role?.toLowerCase()}
            </span>
          </div>
          <span style={{ fontSize: 14.5, color: T.inkSoft }}>
            Here's what's on today's page.
          </span>
        </div>

        {/* Report-card style stat strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${statCards.length}, 1fr)`,
            border: `1px solid ${T.line}`,
            borderRadius: 12,
            background: T.surface,
            marginBottom: 40,
            overflow: 'hidden',
          }}
        >
          {statCards.map((card, i) => (
            <div
              key={card.label}
              style={{
                padding: '20px 22px',
                borderLeft: i === 0 ? 'none' : `1px solid ${T.line}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: card.tone }}>
                {card.icon}
                <span
                  style={{
                    fontFamily: T.mono,
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: T.inkFaint,
                    letterSpacing: '0.05em',
                  }}
                >
                  {card.label}
                </span>
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 28, fontWeight: 600, color: T.ink, lineHeight: 1 }}>
                {card.value}
              </div>
              <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 8 }}>{card.note}</div>
            </div>
          ))}
        </div>

        {/* Admin User Management */}
        {user?.role === 'ADMIN' && (
          <div
            style={{
              marginBottom: 40,
              background: T.surface,
              borderRadius: 12,
              border: `1px solid ${T.line}`,
              padding: 24,
            }}
          >
            {AdminUserManagement ? (
              <AdminUserManagement />
            ) : (
              <p style={{ color: T.inkSoft }}>Admin User Management Module</p>
            )}
          </div>
        )}

        {/* Create Course Form — styled like a card-catalog intake slip */}
        <AnimatePresence>
          {showCourseForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreateCourse}
              style={{
                background: T.surface,
                padding: 28,
                borderRadius: 12,
                border: `1.5px dashed ${T.lineStrong}`,
                marginBottom: 40,
                overflow: 'hidden',
              }}
            >
              <h3 style={{ margin: '0 0 4px 0', fontSize: 18, fontWeight: 600, color: T.ink, fontFamily: T.display }}>
                Add a course to the catalog
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: 12.5, color: T.inkFaint, fontFamily: T.mono }}>
                new entry
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: T.inkSoft, display: 'block', marginBottom: 6, fontFamily: T.mono, letterSpacing: '0.03em' }}>
                    TITLE
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
                      borderRadius: 7,
                      border: `1px solid ${T.line}`,
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: T.body,
                      background: T.paper,
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: T.inkSoft, display: 'block', marginBottom: 6, fontFamily: T.mono, letterSpacing: '0.03em' }}>
                    PRICE ($)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 7,
                      border: `1px solid ${T.line}`,
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: T.mono,
                      background: T.paper,
                    }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: T.inkSoft, display: 'block', marginBottom: 6, fontFamily: T.mono, letterSpacing: '0.03em' }}>
                  DESCRIPTION
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
                    borderRadius: 7,
                    border: `1px solid ${T.line}`,
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    fontFamily: T.body,
                    background: T.paper,
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="submit"
                  style={{
                    background: T.forest,
                    color: T.paper,
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: 7,
                    fontWeight: 600,
                    fontSize: 13.5,
                    cursor: 'pointer',
                    fontFamily: T.body,
                  }}
                >
                  Add to catalog
                </button>
                <button
                  type="button"
                  onClick={() => setShowCourseForm(false)}
                  style={{
                    background: 'none',
                    color: T.inkSoft,
                    border: `1px solid ${T.line}`,
                    padding: '10px 20px',
                    borderRadius: 7,
                    fontWeight: 600,
                    fontSize: 13.5,
                    cursor: 'pointer',
                    fontFamily: T.body,
                  }}
                >
                  Discard
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Active Courses */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: T.ink, margin: 0, fontFamily: T.display }}>
            Course Catalog
          </h2>
          <span style={{ fontSize: 12, color: T.inkFaint, fontFamily: T.mono }}>
            {courses.length} {courses.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
          }}
        >
          {courses.map((course, idx) => {
            const rule = ruleColors[idx % ruleColors.length];
            const isEnrolled = enrolledCourseIds.includes(course.id);
            const pct = Math.min(45 + idx * 20, 85);
            const stampText = isEnrolled ? 'ENROLLED' : isStaff ? 'INSTRUCTOR' : 'OPEN';
            const stampTone = isEnrolled ? T.forest : isStaff ? T.slate : T.marigold;

            return (
              <div
                key={course.id}
                style={{
                  position: 'relative',
                  background: T.surface,
                  border: `1px solid ${T.line}`,
                  borderTop: `3px solid ${rule}`,
                  borderRadius: 10,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                {/* corner stamp */}
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: -30,
                    transform: 'rotate(28deg)',
                    border: `1.5px solid ${stampTone}`,
                    color: stampTone,
                    fontFamily: T.mono,
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    padding: '3px 34px',
                    borderRadius: 3,
                    opacity: 0.85,
                    pointerEvents: 'none',
                  }}
                >
                  {stampText}
                </div>

                <div style={{ padding: '22px 20px 0 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, paddingRight: 40 }}>
                    <span
                      style={{
                        fontFamily: T.mono,
                        fontSize: 10.5,
                        fontWeight: 600,
                        color: T.inkFaint,
                        letterSpacing: '0.05em',
                      }}
                    >
                      {course.price === 0 ? 'FREE ACCESS' : 'PAID COURSE'}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: T.display,
                      fontSize: 18,
                      fontWeight: 600,
                      color: T.ink,
                      margin: '0 0 8px 0',
                      lineHeight: 1.3,
                    }}
                  >
                    {course.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: T.inkSoft,
                      margin: '0 0 18px 0',
                      lineHeight: 1.55,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {course.description}
                  </p>

                  <div style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.inkFaint, letterSpacing: '0.04em' }}>
                        SEATS FILLED
                      </span>
                      <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.inkSoft, fontWeight: 600 }}>
                        {pct}%
                      </span>
                    </div>
                    <div style={{ height: 3, width: '100%', background: T.line, borderRadius: 999 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: rule, borderRadius: 999 }} />
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: '14px 20px 20px 20px',
                    borderTop: `1px solid ${T.line}`,
                    marginTop: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      fontFamily: T.mono,
                      fontSize: 15,
                      fontWeight: 600,
                      color: T.ink,
                      minWidth: 46,
                    }}
                  >
                    {course.price === 0 ? '—' : `$${course.price}`}
                  </span>

                  {isEnrolled || isStaff ? (
                    <button
                      onClick={() => navigate(`/learn/${course.id}`)}
                      style={{
                        flex: 1,
                        background: T.forest,
                        color: T.paper,
                        border: 'none',
                        padding: '9px',
                        borderRadius: 7,
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: 'pointer',
                        fontFamily: T.body,
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
                        background: 'none',
                        border: `1.5px solid ${T.forest}`,
                        color: T.forest,
                        padding: '9px',
                        borderRadius: 7,
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: 'pointer',
                        opacity: enrollingId === course.id ? 0.6 : 1,
                        fontFamily: T.body,
                      }}
                    >
                      {enrollingId === course.id ? 'Enrolling…' : 'Enroll Now'}
                    </button>
                  )}

                  {isStaff && (
                    <button
                      onClick={() => navigate(`/builder/${course.id}`)}
                      style={{
                        background: 'none',
                        border: `1px solid ${T.line}`,
                        color: T.inkSoft,
                        width: 36,
                        height: 36,
                        borderRadius: 7,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                      title="Edit Course Builder"
                    >
                      <Icon.Pencil />
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
                border: `1.5px dashed ${T.lineStrong}`,
                borderRadius: 10,
                minHeight: 300,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                cursor: 'pointer',
                background: 'transparent',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  border: `1.5px solid ${T.forest}`,
                  color: T.forest,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <Icon.Plus />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: T.ink, margin: '0 0 6px 0', fontFamily: T.display }}>
                Add a new entry
              </h3>
              <p style={{ fontSize: 12.5, color: T.inkSoft, textAlign: 'center', margin: '0 0 18px 0', maxWidth: 200 }}>
                Start a module, syllabus, or full curriculum.
              </p>
              <span
                style={{
                  fontFamily: T.mono,
                  fontSize: 11,
                  color: T.forest,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                }}
              >
                OPEN BUILDER
              </span>
            </div>
          )}
        </div>

        {courses.length === 0 && !isStaff && (
          <div
            style={{
              textAlign: 'center',
              padding: '64px 20px',
              border: `1.5px dashed ${T.lineStrong}`,
              borderRadius: 12,
              color: T.inkFaint,
            }}
          >
            <p style={{ fontFamily: T.display, fontSize: 16, color: T.inkSoft, margin: '0 0 4px 0' }}>
              The catalog is empty.
            </p>
            <p style={{ fontSize: 12.5, margin: 0, fontFamily: T.mono }}>
              check back once courses are listed
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;