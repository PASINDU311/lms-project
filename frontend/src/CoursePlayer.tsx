import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from './api';

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
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    API.get(`/courses/${id}`)
      .then((res) => {
        const fetchedCourse = res.data.course;
        setCourse(fetchedCourse);
        
        if (fetchedCourse?.sections?.length > 0 && fetchedCourse.sections[0].lessons?.length > 0) {
          setSelectedLesson(fetchedCourse.sections[0].lessons[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load course player:', err);
        setLoading(false);
      });
  }, [id]);

  // Helper to extract YouTube Video Embed URL safely
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

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading Course Classroom...</div>;
  if (!course) return <div style={{ padding: '20px', textAlign: 'center' }}>Course content not found.</div>;

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <div style={{ background: '#2c3e50', color: '#fff', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '20px' }}>{course.title}</h2>
        <button 
          onClick={() => navigate('/my-courses')} 
          style={{ background: '#7f8c8d', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}
        >
          &larr; Back to My Courses
        </button>
      </div>

      {/* Main Content Layout */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Left Side: Video / Content Player */}
        <div style={{ flex: 3, padding: '20px', backgroundColor: '#fdfdfd' }}>
          {selectedLesson ? (
            <div>
              <h3>{selectedLesson.title}</h3>
              <hr />
              
              {/* Video Player Section */}
              {selectedLesson.video_url && (
                <div style={{ marginBottom: '20px', marginTop: '15px' }}>
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

              {/* Text / Article Content Section */}
              {selectedLesson.content && (
                <div style={{ background: '#fff', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginTop: '15px' }}>
                  <h4>Lesson Notes:</h4>
                  <p style={{ lineHeight: '1.6', whiteSpace: 'pre-line' }}>{selectedLesson.content}</p>
                </div>
              )}
            </div>
          ) : (
            <p>Please select a lesson from the syllabus to start learning.</p>
          )}
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
                  {section.lessons && section.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      onClick={() => setSelectedLesson(lesson)}
                      style={{
                        padding: '10px',
                        marginBottom: '5px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        backgroundColor: selectedLesson?.id === lesson.id ? '#3498db' : '#fff',
                        color: selectedLesson?.id === lesson.id ? '#fff' : '#333',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                      }}
                    >
                      ▶ {lesson.title}
                    </li>
                  ))}
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