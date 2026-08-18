import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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

  const getStatusBadgeStyle = (status: string) => {
    const isCompleted = status?.toLowerCase() === 'completed';
    return {
      backgroundColor: isCompleted ? '#dcfce7' : '#e0e7ff',
      color: isCompleted ? '#15803d' : '#4338ca',
      border: `1px solid ${isCompleted ? '#86efac' : '#c7d2fe'}`,
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        maxWidth: '1140px',
        margin: '30px auto',
        padding: '0 20px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              color: '#6366f1',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
              marginBottom: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            &larr; Back to Dashboard
          </button>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
            My Enrolled Courses
          </h2>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '9px 18px',
            backgroundColor: '#ffffff',
            color: '#334155',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13.5px',
            fontWeight: 600,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          }}
        >
          Explore Catalog
        </motion.button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              style={{
                height: '240px',
                backgroundColor: '#f1f5f9',
                borderRadius: '12px',
                animation: 'pulse 1.5s infinite ease-in-out',
              }}
            />
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            marginTop: '20px',
          }}
        >
          <div style={{ fontSize: '42px', marginBottom: '12px' }}>📚</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '18px', fontWeight: 700 }}>
            No Enrolled Courses Found
          </h3>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px 0' }}>
            You haven't enrolled in any learning programs yet.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Browse Course Catalog
          </motion.button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {enrollments.map((item, index) => {
            const courseData = item.course || item.Course;
            const badgeStyle = getStatusBadgeStyle(item.status);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                {/* Visual Banner Placeholder */}
                <div
                  style={{
                    height: '110px',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                    padding: '16px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'flex-start',
                  }}
                >
                  <span
                    style={{
                      ...badgeStyle,
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {item.status || 'Enrolled'}
                  </span>
                </div>

                {/* Card Body */}
                <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3
                    style={{
                      margin: '0 0 8px 0',
                      fontSize: '16.5px',
                      fontWeight: 700,
                      color: '#0f172a',
                      lineHeight: 1.35,
                    }}
                  >
                    {courseData ? courseData.title : `Course #${item.course_id}`}
                  </h3>

                  <p
                    style={{
                      margin: '0 0 20px 0',
                      fontSize: '13.5px',
                      color: '#64748b',
                      lineHeight: 1.5,
                      flexGrow: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {courseData?.description || 'No description available for this course.'}
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => navigate(`/learn/${item.course_id}`)}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      backgroundColor: '#4f46e5',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '13.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)',
                    }}
                  >
                    Start Learning <span>&rarr;</span>
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default MyCourses;