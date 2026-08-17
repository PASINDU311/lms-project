import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
}

interface Enrollment {
  id: number;
  course_id: number;
  status: string;
  course?: Course;
  Course?: Course;
}

const MyCourses: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/my-courses')
      .then((res) => {
        setEnrollments(res.data.enrollments || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch enrolled courses:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>My Enrolled Courses</h2>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 12px', cursor: 'pointer' }}>
          &larr; All Courses
        </button>
      </div>

      <hr />

      {loading ? (
        <p>Loading your courses...</p>
      ) : enrollments.length === 0 ? (
        <p>You haven't enrolled in any courses yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
          {enrollments.map((item) => {
            const courseData = item.course || item.Course;
            return (
              <div key={item.id} style={{ border: '1px solid #2ecc71', padding: '15px', borderRadius: '5px', backgroundColor: '#f0fff4' }}>
                <h3>{courseData ? courseData.title : `Course #${item.course_id}`}</h3>
                {courseData && <p>{courseData.description}</p>}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <span style={{ background: '#2ecc71', color: '#fff', padding: '3px 8px', borderRadius: '3px', fontSize: '12px' }}>
                    Status: {item.status}
                  </span>
                  <button
                    onClick={() => navigate(`/learn/${item.course_id}`)}
                    style={{ padding: '8px 15px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Start Learning &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCourses;