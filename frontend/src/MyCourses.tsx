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
      backgroundColor: isCompleted ? '#E7EEE9' : '#FBF1DA',
      color: isCompleted ? '#2B4A3E' : '#B98A1E',
      borderColor: isCompleted ? '#2B4A3E' : '#B98A1E',
    };
  };

  // Top border colors that cycle for visual rhythm across cards
  const cardAccentColors = ['#2B4A3E', '#3D5A73', '#B98A1E', '#B5482F'];

  // Summary statistics for report-card strip
  const totalEnrolled = enrollments.length;
  const completedCount = enrollments.filter(
    (e) => e.status?.toLowerCase() === 'completed'
  ).length;
  const inProgressCount = totalEnrolled - completedCount;

  return (
    <div
      style={{
        backgroundColor: '#FAF8F3',
        minHeight: '100vh',
        padding: '32px 20px 60px 20px',
        boxSizing: 'border-box',
        color: '#201F1C',
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}
      </style>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        {/* Navigation / Header Section */}
        <div style={{ marginBottom: '28px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              color: '#6B6558',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              padding: 0,
              marginBottom: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Dashboard
          </button>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '16px',
              paddingBottom: '16px',
              borderBottom: '1px solid #E4DFD1',
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#A39C8C',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                STUDENT RECORD
              </span>
              <h1
                style={{
                  margin: 0,
                  fontFamily: "'Fraunces', serif",
                  fontSize: '30px',
                  fontWeight: 600,
                  color: '#201F1C',
                  letterSpacing: '-0.01em',
                }}
              >
                My Enrolled Courses
              </h1>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '9px 16px',
                backgroundColor: 'transparent',
                color: '#2B4A3E',
                border: '1.5px solid #2B4A3E',
                borderRadius: '7px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Explore Catalog
            </motion.button>
          </div>
        </div>

        {/* Stat Strip / Report Card */}
        {!loading && enrollments.length > 0 && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E4DFD1',
              borderRadius: '8px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              marginBottom: '32px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderRight: '1px solid #E4DFD1',
              }}
            >
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#A39C8C',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '6px',
                }}
              >
                TOTAL ENROLLED
              </div>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#201F1C',
                }}
              >
                {String(totalEnrolled).padStart(2, '0')}
              </div>
            </div>

            <div
              style={{
                padding: '16px 20px',
                borderRight: '1px solid #E4DFD1',
              }}
            >
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#A39C8C',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '6px',
                }}
              >
                IN PROGRESS
              </div>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#3D5A73',
                }}
              >
                {String(inProgressCount).padStart(2, '0')}
              </div>
            </div>

            <div style={{ padding: '16px 20px' }}>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#A39C8C',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '6px',
                }}
              >
                COMPLETED
              </div>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#2B4A3E',
                }}
              >
                {String(completedCount).padStart(2, '0')}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                style={{
                  height: '220px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E4DFD1',
                  borderRadius: '10px',
                  padding: '20px',
                  animation: 'pulse 1.5s infinite ease-in-out',
                }}
              />
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '56px 24px',
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1.5px dashed #D2CBB8',
              marginTop: '16px',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#E7EEE9',
                color: '#2B4A3E',
                marginBottom: '16px',
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <h3
              style={{
                margin: '0 0 8px 0',
                fontFamily: "'Fraunces', serif",
                fontSize: '20px',
                fontWeight: 600,
                color: '#201F1C',
              }}
            >
              No course enrollments on file.
            </h3>
            <p
              style={{
                color: '#6B6558',
                fontSize: '14px',
                margin: '0 0 24px 0',
                maxWidth: '400px',
                marginLeft: 'auto',
                marginRight: 'auto',
                lineHeight: 1.5,
              }}
            >
              Your catalog intake slip is currently empty. Explore available programs to begin.
            </p>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '10px 22px',
                backgroundColor: '#2B4A3E',
                color: '#FAF8F3',
                border: 'none',
                borderRadius: '7px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '13.5px',
                fontFamily: "'Inter', sans-serif",
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Browse Catalog
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
              const accentColor = cardAccentColors[index % cardAccentColors.length];

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                  whileHover={{ y: -3 }}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E4DFD1',
                    borderTop: `3px solid ${accentColor}`,
                    borderRadius: '9px',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Library Stamp Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '14px',
                      right: '14px',
                      transform: 'rotate(28deg)',
                      backgroundColor: badgeStyle.backgroundColor,
                      color: badgeStyle.color,
                      border: `1.5px solid ${badgeStyle.borderColor}`,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '10px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      pointerEvents: 'none',
                      zIndex: 1,
                    }}
                  >
                    {item.status || 'Enrolled'}
                  </div>

                  {/* Card Header & Metadata */}
                  <div style={{ padding: '20px 20px 0 20px' }}>
                    <div
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: '11px',
                        fontWeight: 500,
                        color: '#A39C8C',
                        marginBottom: '6px',
                        letterSpacing: '0.05em',
                      }}
                    >
                      REF: #{String(courseData?.id || item.course_id).padStart(4, '0')}
                    </div>

                    <h3
                      style={{
                        margin: '0 0 10px 0',
                        fontFamily: "'Fraunces', serif",
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#201F1C',
                        lineHeight: 1.3,
                        paddingRight: '60px',
                      }}
                    >
                      {courseData ? courseData.title : `Course #${item.course_id}`}
                    </h3>
                  </div>

                  {/* Card Body */}
                  <div
                    style={{
                      padding: '0 20px 20px 20px',
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <p
                      style={{
                        margin: '0 0 20px 0',
                        fontSize: '13.5px',
                        color: '#6B6558',
                        lineHeight: 1.55,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {courseData?.description || 'No course description recorded.'}
                    </p>

                    <div>
                      {courseData?.price !== undefined && (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingTop: '12px',
                            marginBottom: '14px',
                            borderTop: '1px stroke #E4DFD1',
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: '11px',
                            color: '#A39C8C',
                          }}
                        >
                          <span>TUITION</span>
                          <span style={{ color: '#201F1C', fontWeight: 600 }}>
                            ${courseData.price.toFixed(2)}
                          </span>
                        </div>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => navigate(`/learn/${item.course_id}`)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          backgroundColor: '#2B4A3E',
                          color: '#FAF8F3',
                          border: 'none',
                          borderRadius: '7px',
                          fontWeight: 600,
                          fontSize: '13px',
                          fontFamily: "'Inter', sans-serif",
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                        }}
                      >
                        Start Learning
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MyCourses;