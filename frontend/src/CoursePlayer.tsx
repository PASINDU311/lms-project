import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

  const fetchProgress = () => {
    API.get(`/progress/${id}`)
      .then((res) => {
        setCompletedLessonIds(res.data.completed_lesson_ids || []);
      })
      .catch((err) => console.error('Failed to load progress', err));
  };

  useEffect(() => {
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
        const fetchedCourse = res.data.course;
        setCourse(fetchedCourse);

        if (fetchedCourse?.sections?.length > 0) {
          setSelectedSectionId(fetchedCourse.sections[0].id);
          if (fetchedCourse.sections[0].lessons?.length > 0) {
            setSelectedLesson(fetchedCourse.sections[0].lessons[0]);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load course player:', err);
        setLoading(false);
      });

    fetchProgress();
  }, [id]);

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
  const progressPercent = totalLessons > 0 ? Math.round((completedLessonIds.length / totalLessons) * 100) : 0;

  const isInstructorOrAdmin = userRole === 'INSTRUCTOR' || userRole === 'ADMIN';

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading Course Classroom...</div>;
  if (!course) return <div style={{ padding: '20px', textAlign: 'center' }}>Course content not found.</div>;

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {showCertificate && (
        <Certificate
          studentName={studentName}
          courseTitle={course.title}
          completionDate={new Date().toLocaleDateString()}
          onClose={() => setShowCertificate(false)}
        />
      )}

      {/* Top Bar */}
      <div style={{ background: '#2c3e50', color: '#fff', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px' }}>{course.title}</h2>
          {!isInstructorOrAdmin && (
            <div style={{ fontSize: '13px', color: '#bdc3c7', marginTop: '4px' }}>
              Progress: {progressPercent}% ({completedLessonIds.length}/{totalLessons} Lessons)
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {!isInstructorOrAdmin && progressPercent === 100 && (
            <button
              onClick={() => setShowCertificate(true)}
              style={{ background: '#f1c40f', color: '#2c3e50', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              🏆 View Certificate
            </button>
          )}
          <button
            onClick={() => navigate(isInstructorOrAdmin ? '/dashboard' : '/my-courses')}
            style={{ background: '#7f8c8d', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}
          >
            &larr; Back to Dashboard
          </button>
        </div>
      </div>

      {/* Student Progress Bar Line */}
      {!isInstructorOrAdmin && (
        <div style={{ width: '100%', backgroundColor: '#ecf0f1', height: '6px' }}>
          <div style={{ width: `${progressPercent}%`, backgroundColor: '#2ecc71', height: '100%', transition: 'width 0.3s' }}></div>
        </div>
      )}

      {/* Main Content Layout */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Left Side Content */}
        <div style={{ flex: 3, padding: '20px', backgroundColor: '#fdfdfd' }}>
          {selectedLesson ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>{selectedLesson.title}</h3>
                {!isInstructorOrAdmin && (
                  <button
                    onClick={() => toggleComplete(selectedLesson.id)}
                    style={{
                      padding: '8px 15px',
                      backgroundColor: completedLessonIds.includes(selectedLesson.id) ? '#27ae60' : '#e67e22',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    {completedLessonIds.includes(selectedLesson.id) ? '✓ Completed' : 'Mark as Complete'}
                  </button>
                )}
              </div>
              <hr style={{ margin: '15px 0' }} />

              {/* Video Player */}
              {selectedLesson.video_url && (
                <div style={{ marginBottom: '20px' }}>
                  <iframe
                    width="100%"
                    height="450"
                    src={getEmbedUrl(selectedLesson.video_url)}
                    title={selectedLesson.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ borderRadius: '8px' }}
                  ></iframe>
                </div>
              )}

              {/* Text / Notes Content */}
              {selectedLesson.content && (
                <div style={{ background: '#fff', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px' }}>
                  <h4>Lesson Notes:</h4>
                  <p style={{ lineHeight: '1.6', whiteSpace: 'pre-line' }}>{selectedLesson.content}</p>
                </div>
              )}
            </div>
          ) : (
            <p>Please select a lesson from the syllabus.</p>
          )}

          {/* Section Quiz (Student එකට විතරයි) */}
          {selectedSectionId && !isInstructorOrAdmin && (
            <div style={{ marginTop: '30px' }}>
              <QuizPlayer sectionId={selectedSectionId} />
            </div>
          )}

          {/* Section Assignment */}
          {selectedSectionId && (
            <div style={{ marginTop: '20px' }}>
              <AssignmentPlayer sectionId={selectedSectionId} />
            </div>
          )}

          {/* Course Reviews */}
          <div style={{ marginTop: '30px' }}>
            <CourseReviews courseId={Number(id)} isEnrolled={!isInstructorOrAdmin} />
          </div>
        </div>

        {/* Right Side: Curriculum Sidebar */}
        <div style={{ flex: 1, borderLeft: '1px solid #ddd', background: '#f8f9fa', padding: '15px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '18px', marginTop: '0' }}>Course Syllabus</h3>
          <hr />
          {course.sections && course.sections.length > 0 ? (
            course.sections.map((section) => (
              <div key={section.id} style={{ marginBottom: '15px' }}>
                <strong style={{ display: 'block', padding: '5px 0', color: '#34495e' }}>{section.title}</strong>
                <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
                  {section.lessons &&
                    section.lessons.map((lesson) => {
                      const isDone = completedLessonIds.includes(lesson.id);
                      return (
                        <li
                          key={lesson.id}
                          onClick={() => {
                            setSelectedLesson(lesson);
                            setSelectedSectionId(section.id);
                          }}
                          style={{
                            padding: '10px',
                            marginBottom: '5px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            backgroundColor: selectedLesson?.id === lesson.id ? '#3498db' : '#fff',
                            color: selectedLesson?.id === lesson.id ? '#fff' : '#333',
                            border: '1px solid #e2e8f0',
                            fontSize: '14px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span>▶ {lesson.title}</span>
                          {!isInstructorOrAdmin && isDone && (
                            <span style={{ color: selectedLesson?.id === lesson.id ? '#fff' : '#27ae60', fontWeight: 'bold' }}>✓</span>
                          )}
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))
          ) : (
            <p style={{ fontSize: '14px', color: '#777' }}>No sections available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;