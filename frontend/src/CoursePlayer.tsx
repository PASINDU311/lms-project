import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from './api';
import QuizPlayer from './QuizPlayer';
import Certificate from './Certificate';
import AssignmentPlayer from './AssignmentPlayer';
import CourseReviews from './CourseReviews';

interface Lesson {
  id: number;
  title: string;
  content_type: string;
  video_url: string;
  pdf_url?: string;
  content: string;
  is_free: boolean;
}

interface Section {
  id: number;
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: number;
  title: string;
  description: string;
  sections: Section[];
}

const CoursePlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [studentName, setStudentName] = useState<string>('Student');
  const [userRole, setUserRole] = useState<string>('STUDENT');
  const [showCertificate, setShowCertificate] = useState<boolean>(false);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

  const fetchProgress = useCallback(() => {
    if (!id) return;
    API.get(`/progress/${id}`)
      .then((res) => {
        setCompletedLessonIds(res.data?.completed_lesson_ids || []);
      })
      .catch((err) => console.error('Failed to load progress', err));
  }, [id]);

  useEffect(() => {
    if (!id) return;

    // Current User Profile & Role Fetch
    API.get('/profile')
      .then((res) => {
        if (res.data?.user) {
          setStudentName(res.data.user.name || 'User');
          setUserRole(res.data.user.role || 'STUDENT');
        }
      })
      .catch(() => console.log('Could not fetch user profile'));

    API.get(`/courses/${id}`)
      .then((res) => {
        const fetchedCourse: Course = res.data?.course || res.data;
        setCourse(fetchedCourse);

        if (fetchedCourse?.sections?.length > 0) {
          const firstSection = fetchedCourse.sections[0];
          setSelectedSectionId(firstSection.id);
          if (firstSection.lessons?.length > 0) {
            setSelectedLesson(firstSection.lessons[0]);
          }

          // Expand all sections by default
          const initialExpanded: Record<number, boolean> = {};
          fetchedCourse.sections.forEach((sec: Section) => {
            initialExpanded[sec.id] = true;
          });
          setExpandedSections(initialExpanded);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load course player:', err);
        setLoading(false);
      });

    fetchProgress();
  }, [id, fetchProgress]);

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const toggleComplete = async (lessonId: number) => {
    try {
      await API.post('/progress/complete', {
        lesson_id: lessonId,
        course_id: Number(id),
      });
      fetchProgress();
    } catch (err) {
      alert('Failed to update lesson status');
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    let videoId = '';
    if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('embed/')) {
      return url;
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const totalLessons = course?.sections?.reduce((acc, sec) => acc + (sec.lessons?.length || 0), 0) || 0;
  const progressPercent = totalLessons > 0 ? Math.min(100, Math.round((completedLessonIds.length / totalLessons) * 100)) : 0;

  const isInstructorOrAdmin = userRole === 'INSTRUCTOR' || userRole === 'ADMIN';

  // Section card top rule color palette generator
  const getAccentColor = (index: number) => {
    const colors = ['#2B4A3E', '#3D5A73', '#B98A1E', '#B5482F']; // Forest, Slate, Marigold, Brick
    return colors[index % colors.length];
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
          background: '#FAF8F3',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <style>
          {`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');`}
        </style>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '2px solid #E4DFD1',
            borderTopColor: '#2B4A3E',
            marginBottom: 16,
          }}
        />
        <p style={{ color: '#6B6558', fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Loading Record...
        </p>
      </div>
    );
  }

  if (!course) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FAF8F3',
          fontFamily: "'Inter', sans-serif",
          color: '#201F1C',
          padding: 24,
        }}
      >
        <style>
          {`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');`}
        </style>
        <div
          style={{
            border: '1.5px dashed #D2CBB8',
            borderRadius: 8,
            padding: '32px 48px',
            background: '#FFFFFF',
            textAlign: 'center',
          }}
        >
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#A39C8C', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
            Catalog Error
          </span>
          <p style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 18, color: '#201F1C' }}>
            Course content not found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#FAF8F3',
        color: '#201F1C',
      }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');`}
      </style>

      {showCertificate && (
        <Certificate
          studentName={studentName}
          courseTitle={course.title}
          completionDate={new Date().toLocaleDateString()}
          onClose={() => setShowCertificate(false)}
        />
      )}

      {/* Top Ledger Header Bar */}
      <header
        style={{
          background: '#FFFFFF',
          color: '#201F1C',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          borderBottom: '1px solid #E4DFD1',
        }}
      >
        <div
          style={{
            padding: '12px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: 1600,
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, overflow: 'hidden' }}>
            <button
              onClick={() => navigate(isInstructorOrAdmin ? '/dashboard' : '/my-courses')}
              style={{
                background: 'transparent',
                color: '#2B4A3E',
                border: '1px solid #2B4A3E',
                padding: '6px 12px',
                borderRadius: 7,
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'background 0.2s',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Back</span>
            </button>

            <div style={{ width: 1, height: 20, background: '#E4DFD1' }} />

            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 600,
                  color: '#201F1C',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {course.title}
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            {!isInstructorOrAdmin && progressPercent === 100 && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setShowCertificate(true)}
                style={{
                  background: '#2B4A3E',
                  color: '#FAF8F3',
                  border: 'none',
                  padding: '7px 14px',
                  borderRadius: 7,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 15l-2 5l9-5l-4-10l-3 10z"></path>
                  <circle cx="12" cy="8" r="7"></circle>
                </svg>
                Claim Certificate
              </motion.button>
            )}

            {!isInstructorOrAdmin && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#E7EEE9',
                  padding: '4px 10px',
                  borderRadius: 7,
                  border: '1px solid #E4DFD1',
                }}
              >
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#2B4A3E',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Status:
                </span>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#2B4A3E',
                  }}
                >
                  {progressPercent}% Complete
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Global Progress Bar Line */}
        {!isInstructorOrAdmin && (
          <div style={{ width: '100%', backgroundColor: '#E4DFD1', height: '2px' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                backgroundColor: '#2B4A3E',
                height: '100%',
                transition: 'width 0.4s ease-out',
              }}
            />
          </div>
        )}
      </header>

      {/* Report Card Stat Strip */}
      {!isInstructorOrAdmin && (
        <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E4DFD1' }}>
          <div
            style={{
              maxWidth: 1600,
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ padding: '12px 24px', borderRight: '1px solid #E4DFD1' }}>
              <span style={{ display: 'block', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#A39C8C', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                Completed Units
              </span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, fontWeight: 600, color: '#201F1C' }}>
                {completedLessonIds.length}
              </span>
            </div>
            <div style={{ padding: '12px 24px', borderRight: '1px solid #E4DFD1' }}>
              <span style={{ display: 'block', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#A39C8C', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                Total Syllabus Items
              </span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, fontWeight: 600, color: '#201F1C' }}>
                {totalLessons}
              </span>
            </div>
            <div style={{ padding: '12px 24px' }}>
              <span style={{ display: 'block', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#A39C8C', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                Current Progress
              </span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, fontWeight: 600, color: '#2B4A3E' }}>
                {progressPercent}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          maxWidth: 1600,
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
      >
        {/* Left Primary Content Section */}
        <div
          style={{
            flex: '1 1 65%',
            minWidth: 320,
            padding: '24px',
            boxSizing: 'border-box',
          }}
        >
          {selectedLesson ? (
            <motion.div
              key={selectedLesson.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Lesson Card */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E4DFD1',
                  borderTop: '3px solid #2B4A3E',
                  borderRadius: 8,
                  padding: 24,
                  marginBottom: 24,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Stamp Badge */}
                {completedLessonIds.includes(selectedLesson.id) && !isInstructorOrAdmin && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      transform: 'rotate(12deg)',
                      border: '1.5px solid #2B4A3E',
                      color: '#2B4A3E',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      background: '#E7EEE9',
                      pointerEvents: 'none',
                    }}
                  >
                    PASSED / RECORDED
                  </div>
                )}

                {/* Lesson Title & Completion Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 16,
                    marginBottom: 20,
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontWeight: 600,
                        color: '#6B6558',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Active Lesson Item
                    </span>
                    <h2
                      style={{
                        margin: '4px 0 0 0',
                        fontSize: 22,
                        fontFamily: "'Fraunces', serif",
                        fontWeight: 600,
                        color: '#201F1C',
                      }}
                    >
                      {selectedLesson.title}
                    </h2>
                  </div>

                  {!isInstructorOrAdmin && (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => toggleComplete(selectedLesson.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: completedLessonIds.includes(selectedLesson.id) ? '#2B4A3E' : 'transparent',
                        color: completedLessonIds.includes(selectedLesson.id) ? '#FAF8F3' : '#2B4A3E',
                        border: '1px solid #2B4A3E',
                        borderRadius: 7,
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 12,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      {completedLessonIds.includes(selectedLesson.id) ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          Completed
                        </>
                      ) : (
                        'Mark as Complete'
                      )}
                    </motion.button>
                  )}
                </div>

                {/* Video Player Container */}
                {selectedLesson.video_url && (
                  <div
                    style={{
                      position: 'relative',
                      paddingTop: '56.25%',
                      background: '#201F1C',
                      borderRadius: 6,
                      overflow: 'hidden',
                      border: '1px solid #E4DFD1',
                      marginBottom: 20,
                    }}
                  >
                    <iframe
                      src={getEmbedUrl(selectedLesson.video_url)}
                      title={selectedLesson.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none',
                      }}
                    />
                  </div>
                )}

                {/* Lecture PDF Section */}
                {selectedLesson.pdf_url && (
                  <div
                    style={{
                      background: '#FAF8F3',
                      border: '1px solid #E4DFD1',
                      borderRadius: 7,
                      padding: 20,
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 16,
                        flexWrap: 'wrap',
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            border: '1px solid #E4DFD1',
                            background: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#2B4A3E',
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                          </svg>
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: 15, fontFamily: "'Fraunces', serif", fontWeight: 600, color: '#201F1C' }}>
                            Lecture Document / PDF
                          </h4>
                          <p style={{ margin: 0, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#6B6558', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Reference file for lesson record
                          </p>
                        </div>
                      </div>

                      <a
                        href={selectedLesson.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        style={{
                          padding: '7px 14px',
                          backgroundColor: '#2B4A3E',
                          color: '#FAF8F3',
                          textDecoration: 'none',
                          borderRadius: 7,
                          fontSize: 12,
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontWeight: 600,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download PDF
                      </a>
                    </div>

                    {/* Embedded PDF Viewer */}
                    <div
                      style={{
                        width: '100%',
                        height: '550px',
                        borderRadius: 6,
                        overflow: 'hidden',
                        border: '1px solid #E4DFD1',
                        background: '#FFFFFF',
                      }}
                    >
                      <iframe
                        src={selectedLesson.pdf_url}
                        title="PDF Document Viewer"
                        style={{ width: '100%', height: '100%', border: 'none' }}
                      />
                    </div>
                  </div>
                )}

                {/* Text / Lesson Content Card */}
                {selectedLesson.content && (
                  <div
                    style={{
                      background: '#FAF8F3',
                      padding: 20,
                      border: '1px solid #E4DFD1',
                      borderRadius: 7,
                    }}
                  >
                    <h4 style={{ margin: '0 0 10px 0', fontSize: 15, fontFamily: "'Fraunces', serif", fontWeight: 600, color: '#201F1C' }}>
                      Lesson Notes & Resources
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        lineHeight: '1.65',
                        color: '#6B6558',
                        fontSize: 14,
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {selectedLesson.content}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div
              style={{
                background: '#FFFFFF',
                padding: 40,
                borderRadius: 8,
                border: '1.5px dashed #D2CBB8',
                textAlign: 'center',
                color: '#6B6558',
              }}
            >
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#A39C8C', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                Catalog Selection Pending
              </span>
              <p style={{ margin: 0, fontFamily: "'Inter', sans-serif", fontSize: 14 }}>
                The active viewer is empty. Select a lesson from the syllabus to begin.
              </p>
            </div>
          )}

          {/* Section Quiz (Students Only) */}
          {selectedSectionId && !isInstructorOrAdmin && (
            <div style={{ marginTop: 24 }}>
              <QuizPlayer sectionId={selectedSectionId} />
            </div>
          )}

          {/* Section Assignment */}
          {selectedSectionId && (
            <div style={{ marginTop: 24 }}>
              <AssignmentPlayer sectionId={selectedSectionId} />
            </div>
          )}

          {/* Course Reviews */}
          <div style={{ marginTop: 24 }}>
            <CourseReviews courseId={Number(id)} isEnrolled={!isInstructorOrAdmin} />
          </div>
        </div>

        {/* Right Syllabus Sidebar */}
        <div
          style={{
            flex: '1 1 30%',
            minWidth: 300,
            borderLeft: '1px solid #E4DFD1',
            background: '#FFFFFF',
            padding: 24,
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: '1px solid #E4DFD1',
            }}
          >
            <h3 style={{ fontSize: 16, fontFamily: "'Fraunces', serif", fontWeight: 600, color: '#201F1C', margin: 0 }}>
              Course Syllabus
            </h3>
            <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: '#A39C8C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {course.sections?.length || 0} Modules
            </span>
          </div>

          {course.sections && course.sections.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {course.sections.map((section, index) => {
                const isExpanded = expandedSections[section.id] ?? true;
                const topRuleColor = getAccentColor(index);

                return (
                  <div
                    key={section.id}
                    style={{
                      border: '1px solid #E4DFD1',
                      borderTop: `3px solid ${topRuleColor}`,
                      borderRadius: 8,
                      overflow: 'hidden',
                      background: '#FFFFFF',
                    }}
                  >
                    {/* Section Accordion Title */}
                    <div
                      onClick={() => toggleSection(section.id)}
                      style={{
                        padding: '10px 14px',
                        background: '#FAF8F3',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        userSelect: 'none',
                        borderBottom: isExpanded ? '1px solid #E4DFD1' : 'none',
                      }}
                    >
                      <span style={{ fontSize: 13, fontFamily: "'Fraunces', serif", fontWeight: 600, color: '#201F1C' }}>
                        Module {index + 1}: {section.title}
                      </span>
                      <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#A39C8C' }}>
                        {isExpanded ? '[-]' : '[+]'}
                      </span>
                    </div>

                    {/* Section Lessons List */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{
                            listStyle: 'none',
                            padding: '6px',
                            margin: 0,
                          }}
                        >
                          {section.lessons &&
                            section.lessons.map((lesson) => {
                              const isDone = completedLessonIds.includes(lesson.id);
                              const isSelected = selectedLesson?.id === lesson.id;

                              return (
                                <li
                                  key={lesson.id}
                                  onClick={() => {
                                    setSelectedLesson(lesson);
                                    setSelectedSectionId(section.id);
                                  }}
                                  style={{
                                    padding: '8px 10px',
                                    marginBottom: 4,
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    backgroundColor: isSelected ? '#E7EEE9' : 'transparent',
                                    color: isSelected ? '#2B4A3E' : '#201F1C',
                                    border: isSelected ? '1px solid #2B4A3E' : '1px solid transparent',
                                    fontSize: 13,
                                    fontWeight: isSelected ? 600 : 400,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'background 0.15s',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                                    <span style={{ fontSize: 12, color: isSelected ? '#2B4A3E' : '#A39C8C', flexShrink: 0, display: 'flex' }}>
                                      {lesson.pdf_url ? (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                          <polyline points="14 2 14 8 20 8"></polyline>
                                        </svg>
                                      ) : (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                        </svg>
                                      )}
                                    </span>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {lesson.title}
                                    </span>
                                  </div>

                                  {!isInstructorOrAdmin && isDone && (
                                    <span
                                      style={{
                                        color: '#2B4A3E',
                                        fontWeight: 700,
                                        fontFamily: "'IBM Plex Mono', monospace",
                                        fontSize: 11,
                                        marginLeft: 8,
                                        flexShrink: 0,
                                      }}
                                    >
                                      [DONE]
                                    </span>
                                  )}
                                </li>
                              );
                            })}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: '#A39C8C', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              The catalog is empty.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;