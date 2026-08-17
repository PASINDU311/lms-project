import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from './api';

interface Lesson {
  id: number;
  title: string;
  content_type: string;
  video_url: string;
  content: string;
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

const CourseBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // New Section State
  const [sectionTitle, setSectionTitle] = useState('');

  // New Lesson State
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [content, setContent] = useState('');

  const fetchCourseDetails = () => {
    API.get(`/courses/${id}`)
      .then((res) => {
        setCourse(res.data.course);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch course details:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  // Handle Add Section
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionTitle) return;

    try {
      await API.post('/sections', {
        course_id: Number(id),
        title: sectionTitle,
        order: (course?.sections?.length || 0) + 1,
      });
      setSectionTitle('');
      fetchCourseDetails(); // Refresh list
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add section');
    }
  };

  // Handle Add Lesson
  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSectionId || !lessonTitle) return;

    try {
      await API.post('/lessons', {
        section_id: selectedSectionId,
        title: lessonTitle,
        content_type: 'VIDEO',
        video_url: videoUrl,
        content: content,
        is_free: false,
        order: 1,
      });
      setLessonTitle('');
      setVideoUrl('');
      setContent('');
      setSelectedSectionId(null);
      fetchCourseDetails(); // Refresh list
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add lesson');
    }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading Builder...</div>;
  if (!course) return <div style={{ padding: '20px', textAlign: 'center' }}>Course not found.</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', fontFamily: 'sans-serif' }}>
      <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 12px', cursor: 'pointer', marginBottom: '20px' }}>
        &larr; Back to Dashboard
      </button>

      <h2>Course Builder: {course.title}</h2>
      <p style={{ color: '#666' }}>{course.description}</p>
      <hr />

      {/* Add New Section Form */}
      <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '5px', marginBottom: '25px', border: '1px solid #ddd' }}>
        <h3>+ Add New Section / Module</h3>
        <form onSubmit={handleAddSection} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Section Title (e.g. Module 01 - Basics)"
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
            required
            style={{ flex: 1, padding: '8px' }}
          />
          <button type="submit" style={{ padding: '8px 15px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Add Section
          </button>
        </form>
      </div>

      {/* Existing Sections & Lessons List */}
      <h3>Curriculum Structure</h3>
      {course.sections && course.sections.length > 0 ? (
        course.sections.map((section) => (
          <div key={section.id} style={{ border: '1px solid #cbd5e1', borderRadius: '5px', padding: '15px', marginBottom: '15px', backgroundColor: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, color: '#1e293b' }}>📂 {section.title}</h4>
              <button
                onClick={() => setSelectedSectionId(selectedSectionId === section.id ? null : section.id)}
                style={{ padding: '5px 10px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}
              >
                {selectedSectionId === section.id ? 'Cancel' : '+ Add Lesson'}
              </button>
            </div>

            {/* Add Lesson Form for selected section */}
            {selectedSectionId === section.id && (
              <form onSubmit={handleAddLesson} style={{ marginTop: '15px', padding: '10px', background: '#f1f5f9', borderRadius: '4px' }}>
                <h5>New Lesson for: {section.title}</h5>
                <input
                  type="text"
                  placeholder="Lesson Title"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
                />
                <input
                  type="text"
                  placeholder="YouTube Video URL (e.g. https://www.youtube.com/watch?v=...)"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
                />
                <textarea
                  placeholder="Lesson Content / Notes"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
                />
                <button type="submit" style={{ padding: '8px 12px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Save Lesson
                </button>
              </form>
            )}

            {/* Lessons List under Section */}
            <ul style={{ listStyle: 'none', paddingLeft: '15px', marginTop: '10px' }}>
              {section.lessons && section.lessons.length > 0 ? (
                section.lessons.map((lesson) => (
                  <li key={lesson.id} style={{ padding: '6px 0', borderBottom: '1px dashed #e2e8f0', fontSize: '14px', color: '#334155' }}>
                    ▶ <strong>{lesson.title}</strong> {lesson.video_url && <small style={{ color: '#0066cc' }}>(Video Attached)</small>}
                  </li>
                ))
              ) : (
                <li style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>No lessons in this section yet.</li>
              )}
            </ul>
          </div>
        ))
      ) : (
        <p style={{ color: '#64748b' }}>No sections added yet. Start by adding a section above.</p>
      )}
    </div>
  );
};

export default CourseBuilder;