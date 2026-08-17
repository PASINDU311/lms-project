import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  status: string;
}

const Dashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const userRole = sessionStorage.getItem('role');
  const userName = sessionStorage.getItem('userName');

  useEffect(() => {
    API.get('/courses')
      .then((res) => {
        setCourses(res.data.courses || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch courses:', err);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = '/';
  };

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>LMS Courses Dashboard</h2>
          <small style={{ color: '#666' }}>Welcome, {userName || 'User'} ({userRole})</small>
        </div>
        <div>
          {(userRole === 'INSTRUCTOR' || userRole === 'ADMIN') && (
            <button
              onClick={() => navigate('/create-course')}
              style={{ padding: '8px 15px', background: '#e67e22', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px', marginRight: '10px' }}
            >
              + Create Course
            </button>
          )}
          <button
            onClick={() => navigate('/my-courses')}
            style={{ padding: '8px 15px', background: '#27ae60', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px', marginRight: '10px' }}
          >
            My Enrolled Courses
          </button>
          <button
            onClick={handleLogout}
            style={{ padding: '8px 15px', background: '#e74c3c', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
          >
            Logout
          </button>
        </div>
      </div>

      <hr />

      {loading ? (
        <p>Loading courses...</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
          {courses.map((course) => (
            <div key={course.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p><strong>Price:</strong> ${course.price}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <span style={{ background: '#2ecc71', color: '#fff', padding: '3px 8px', borderRadius: '3px', fontSize: '12px' }}>
                  {course.status}
                </span>
                <div>
                  {(userRole === 'INSTRUCTOR' || userRole === 'ADMIN') && (
                    <button
                      onClick={() => navigate(`/builder/${course.id}`)}
                      style={{ padding: '8px 15px', background: '#8e44ad', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}
                    >
                      Manage Content ⚙️
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/courses/${course.id}`)}
                    style={{ padding: '8px 15px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    View Course & Enroll
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;