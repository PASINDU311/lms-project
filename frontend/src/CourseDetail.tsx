import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from './api';

interface Lesson {
  id: number;
  title: string;
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
  price: number;
  sections: Section[];
}

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [enrolling, setEnrolling] = useState<boolean>(false);

  useEffect(() => {
    API.get(`/courses/${id}`)
      .then((res) => {
        setCourse(res.data.course);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch course details:', err);
        setLoading(false);
      });
  }, [id]);

  const handleEnroll = async () => {
    if (!course) return;
    setEnrolling(true);
    try {
      await API.post('/enrollments', {
        course_id: course.id,
        amount: course.price,
      });
      alert('Successfully Enrolled!');
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading course...</p>;
  if (!course) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Course not found.</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', fontFamily: 'sans-serif' }}>
      <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 12px', marginBottom: '20px', cursor: 'pointer' }}>
        &larr; Back to Dashboard
      </button>

      <h2>{course.title}</h2>
      <p>{course.description}</p>
      <h3>Price: ${course.price}</h3>

      <button
        onClick={handleEnroll}
        disabled={enrolling}
        style={{
          padding: '10px 20px',
          background: '#3498db',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          cursor: 'pointer',
          marginBottom: '30px',
        }}
      >
        {enrolling ? 'Enrolling...' : 'Enroll Now'}
      </button>

      <hr />

      <h3>Course Curriculum</h3>
      {course.sections && course.sections.length > 0 ? (
        course.sections.map((section) => (
          <div key={section.id} style={{ background: '#f9f9f9', border: '1px solid #ddd', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
            <h4>{section.title}</h4>
            <ul style={{ paddingLeft: '20px' }}>
              {section.lessons && section.lessons.length > 0 ? (
                section.lessons.map((lesson) => (
                  <li key={lesson.id} style={{ marginBottom: '8px' }}>
                    <strong>{lesson.title}</strong> {lesson.is_free && <span style={{ color: 'green', fontSize: '12px' }}>(Free Preview)</span>}
                  </li>
                ))
              ) : (
                <p style={{ color: '#777', fontSize: '14px' }}>No lessons in this section yet.</p>
              )}
            </ul>
          </div>
        ))
      ) : (
        <p>No curriculum content available yet.</p>
      )}
    </div>
  );
};

export default CourseDetail;