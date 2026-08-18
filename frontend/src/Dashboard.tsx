import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';
import AdminUserManagement from './AdminUserManagement';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
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
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // New Course Form State
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileAndData();
  }, []);

  const fetchProfileAndData = async () => {
    try {
      // 1. Fetch Logged-in User Profile
      const profileRes = await API.get('/profile');
      const currentUser: UserProfile = profileRes.data.user;
      setUser(currentUser);

      // 2. Fetch All Courses
      const courseRes = await API.get('/courses');
      setCourses(courseRes.data.courses || []);

      // 3. Fetch Analytics if Admin / Instructor
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
    window.location.href = '/';
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading Dashboard...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1e293b' }}>Welcome, {user?.name}! 👋</h2>
          <span style={{ fontSize: '12px', background: '#e2e8f0', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold', color: '#475569' }}>
            ROLE: {user?.role}
          </span>
        </div>
        <div>
          <button onClick={() => navigate('/my-courses')} style={{ marginRight: '10px', padding: '8px 15px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            My Enrolled Courses
          </button>
          <button onClick={handleLogout} style={{ padding: '8px 15px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      {/* 📊 Analytics Cards (Instructor & Admin View) */}
      {(user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR') && adminStats && (
        <div style={{ marginTop: '25px' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#334155' }}>📈 Platform Analytics Overview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
            <div style={{ background: '#ebf8ff', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #3182ce' }}>
              <div style={{ fontSize: '12px', color: '#2b6cb0', fontWeight: 'bold' }}>TOTAL STUDENTS</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c5282', marginTop: '5px' }}>{adminStats.total_students}</div>
            </div>
            <div style={{ background: '#f0fff4', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #38a169' }}>
              <div style={{ fontSize: '12px', color: '#276749', fontWeight: 'bold' }}>TOTAL COURSES</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#22543d', marginTop: '5px' }}>{adminStats.total_courses}</div>
            </div>
            <div style={{ background: '#faf5ff', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #805ad5' }}>
              <div style={{ fontSize: '12px', color: '#6b46c1', fontWeight: 'bold' }}>ENROLLMENTS</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4a5568', marginTop: '5px' }}>{adminStats.total_enrollments}</div>
            </div>
            <div style={{ background: '#fffaf0', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #dd6b20' }}>
              <div style={{ fontSize: '12px', color: '#c05621', fontWeight: 'bold' }}>PENDING REVIEWS</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9c4221', marginTop: '5px' }}>{adminStats.pending_submissions}</div>
            </div>
          </div>
        </div>
      )}

      {/* 👥 Admin Only: User Management & Instructor Approvals 🔥 */}
      {user?.role === 'ADMIN' && <AdminUserManagement />}

      {/* Course Management Bar for Instructor / Admin */}
      {(user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR') && (
        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>📚 Course Management</h3>
          <button
            onClick={() => setShowCourseForm(!showCourseForm)}
            style={{ padding: '8px 16px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {showCourseForm ? 'Close Form' : '+ Create New Course'}
          </button>
        </div>
      )}

      {/* Create Course Form */}
      {showCourseForm && (
        <form onSubmit={handleCreateCourse} style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '15px' }}>
          <h4>Create New Course</h4>
          <input
            type="text"
            placeholder="Course Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
          />
          <textarea
            placeholder="Course Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
          />
          <input
            type="number"
            placeholder="Price ($)"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            style={{ width: '150px', padding: '8px', marginBottom: '15px', display: 'block' }}
          />
          <button type="submit" style={{ padding: '8px 20px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Save Course
          </button>
        </form>
      )}

      {/* All Available Courses Grid */}
      <h3 style={{ marginTop: '35px' }}>Available Courses</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '15px' }}>
        {courses.map((course) => (
          <div key={course.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>{course.title}</h4>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 15px 0' }}>{course.description}</p>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#27ae60', marginBottom: '10px' }}>
                {course.price === 0 ? 'Free' : `$${course.price}`}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => navigate(`/learn/${course.id}`)}
                  style={{ flex: 1, padding: '8px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                >
                  View Course
                </button>
                {(user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR') && (
                  <button
                    onClick={() => navigate(`/builder/${course.id}`)}
                    style={{ padding: '8px', background: '#f39c12', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                  >
                    Builder
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;