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
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '3px solid #e2e8f0',
            borderTopColor: '#4f46e5',
            marginBottom: 16,
          }}
        />
        <p style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>
          Loading Classroom...
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
          background: '#f8fafc',
          fontFamily: "'Inter', sans-serif",
          color: '#64748b',
        }}
      >
        Course content not found.
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#f8fafc',
        color: '#0f172a',
      }}
    >
      {showCertificate && (
        <Certificate
          studentName={studentName}
          courseTitle={course.title}
          completionDate={new Date().toLocaleDateString()}
          onClose={() => setShowCertificate(false)}
        />
      )}

      {/* Top Header Navigation */}
      <header
        style={{
          background: '#0f172a',
          color: '#ffffff',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#f8fafc',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '8px 14px',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'background 0.2s',
              }}
            >
              ← <span style={{ display: 'inline-block' }}>Back</span>
            </button>

            <div style={{ width: 1, height: 24, background: '#334155' }} />

            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#f8fafc',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {course.title}
              </h1>
              {!isInstructorOrAdmin && (
                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
                  {completedLessonIds.length} of {totalLessons} lessons completed
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            {!isInstructorOrAdmin && progressPercent === 100 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCertificate(true)}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
                }}
              >
                🏆 Claim Certificate
              </motion.button>
            )}

            {!isInstructorOrAdmin && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#4f46e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#fff',
                  }}
                >
                  {progressPercent}%
                </div>
                <div style={{ width: 80, height: 6, background: '#334155', borderRadius: 999, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${progressPercent}%`,
                      height: '100%',
                      background: '#10b981',
                      transition: 'width 0.4s ease-out',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Progress Bar Line */}
        {!isInstructorOrAdmin && (
          <div style={{ width: '100%', backgroundColor: '#1e293b', height: '3px' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                backgroundColor: '#10b981',
                height: '100%',
                transition: 'width 0.4s ease-out',
              }}
            />
          </div>
        )}
      </header>

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
            padding: '28px 24px',
            boxSizing: 'border-box',
          }}
        >
          {selectedLesson ? (
            <motion.div
              key={selectedLesson.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Lesson Title & Completion Action Header */}
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
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#4f46e5',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Current Lesson
                  </span>
                  <h2 style={{ margin: '4px 0 0 0', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
                    {selectedLesson.title}
                  </h2>
                </div>

                {!isInstructorOrAdmin && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleComplete(selectedLesson.id)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: completedLessonIds.includes(selectedLesson.id) ? '#10b981' : '#4f46e5',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 10,
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: 13.5,
                      boxShadow: completedLessonIds.includes(selectedLesson.id)
                        ? '0 2px 8px rgba(16, 185, 129, 0.25)'
                        : '0 2px 8px rgba(79, 70, 229, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    {completedLessonIds.includes(selectedLesson.id) ? '✓ Completed' : 'Mark as Complete'}
                  </motion.button>
                )}
              </div>

              {/* Video Player Container with 16:9 Aspect Ratio */}
              {selectedLesson.video_url && (
                <div
                  style={{
                    position: 'relative',
                    paddingTop: '56.25%',
                    background: '#000000',
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    marginBottom: 24,
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

              {/* Text / Lesson Content Card */}
              {selectedLesson.content && (
                <div
                  style={{
                    background: '#ffffff',
                    padding: 24,
                    border: '1px solid #e2e8f0',
                    borderRadius: 16,
                    marginBottom: 28,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <h4 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                    Lesson Notes & Resources
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      lineHeight: '1.7',
                      color: '#334155',
                      fontSize: 14.5,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {selectedLesson.content}
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <div
              style={{
                background: '#ffffff',
                padding: 40,
                borderRadius: 16,
                border: '1px solid #e2e8f0',
                textAlign: 'center',
                color: '#64748b',
              }}
            >
              Please select a lesson from the syllabus to start learning.
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
          <div style={{ marginTop: 32 }}>
            <CourseReviews courseId={Number(id)} isEnrolled={!isInstructorOrAdmin} />
          </div>
        </div>

        {/* Right Syllabus Sidebar */}
        <div
          style={{
            flex: '1 1 30%',
            minWidth: 300,
            borderLeft: '1px solid #e2e8f0',
            background: '#ffffff',
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
            }}
          >
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Course Syllabus
            </h3>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>
              {course.sections?.length || 0} Modules
            </span>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '0 0 20px 0' }} />

          {course.sections && course.sections.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {course.sections.map((section, index) => {
                const isExpanded = expandedSections[section.id] ?? true;

                return (
                  <div
                    key={section.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: 12,
                      overflow: 'hidden',
                      background: '#ffffff',
                    }}
                  >
                    {/* Section Accordion Title */}
                    <div
                      onClick={() => toggleSection(section.id)}
                      style={{
                        padding: '12px 16px',
                        background: '#f8fafc',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        userSelect: 'none',
                        borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
                      }}
                    >
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1e293b' }}>
                        Module {index + 1}: {section.title}
                      </span>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>
                        {isExpanded ? '▲' : '▼'}
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
                            padding: 8,
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
                                    padding: '10px 12px',
                                    marginBottom: 4,
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    backgroundColor: isSelected ? '#e0e7ff' : '#ffffff',
                                    color: isSelected ? '#3730a3' : '#334155',
                                    border: isSelected ? '1px solid #c7d2fe' : '1px solid transparent',
                                    fontSize: 13.5,
                                    fontWeight: isSelected ? 600 : 500,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'background 0.15s',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                                    <span style={{ fontSize: 11, color: isSelected ? '#4f46e5' : '#94a3b8' }}>
                                      ▶
                                    </span>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {lesson.title}
                                    </span>
                                  </div>

                                  {!isInstructorOrAdmin && isDone && (
                                    <span
                                      style={{
                                        color: '#10b981',
                                        fontWeight: 700,
                                        fontSize: 13,
                                        marginLeft: 8,
                                      }}
                                    >
                                      ✓
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
            <p style={{ fontSize: 13.5, color: '#94a3b8', margin: 0 }}>No syllabus sections available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;