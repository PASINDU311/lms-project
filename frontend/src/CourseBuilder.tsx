import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from './api';
import QuizBuilder from './QuizBuilder';
import InstructorAssignmentManager from './InstructorAssignmentManager';

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

  // Edit Section State
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editSectionTitle, setEditSectionTitle] = useState('');

  // Edit Lesson State
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [editLessonTitle, setEditLessonTitle] = useState('');
  const [editLessonVideoUrl, setEditLessonVideoUrl] = useState('');
  const [editLessonContent, setEditLessonContent] = useState('');

  // Quiz Toggle State
  const [activeQuizSectionId, setActiveQuizSectionId] = useState<number | null>(null);

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

  // Section Actions
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
      fetchCourseDetails();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add section');
    }
  };

  const handleUpdateSection = async (sectionId: number) => {
    try {
      await API.put(`/sections/${sectionId}`, { title: editSectionTitle });
      setEditingSectionId(null);
      fetchCourseDetails();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update section');
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!window.confirm('Are you sure you want to delete this section and all its lessons?')) return;
    try {
      await API.delete(`/sections/${sectionId}`);
      fetchCourseDetails();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete section');
    }
  };

  // Lesson Actions
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
      fetchCourseDetails();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add lesson');
    }
  };

  const handleUpdateLesson = async (lessonId: number) => {
    try {
      await API.put(`/lessons/${lessonId}`, {
        title: editLessonTitle,
        video_url: editLessonVideoUrl,
        content: editLessonContent,
      });
      setEditingLessonId(null);
      fetchCourseDetails();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update lesson');
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await API.delete(`/lessons/${lessonId}`);
      fetchCourseDetails();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete lesson');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ padding: '24px 32px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', color: '#64748b', fontSize: '15px', fontWeight: 500 }}>
          Loading Course Builder...
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ padding: '24px 32px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', color: '#0f172a', fontSize: '15px', fontWeight: 600 }}>
          Course not found.
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1020px', margin: '0 auto', padding: '40px 24px', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", color: '#0f172a', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Breadcrumb Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
        <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => navigate('/dashboard')}>Dashboard</span>
        <span>&rsaquo;</span>
        <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => navigate('/dashboard')}>My Courses</span>
        <span>&rsaquo;</span>
        <span style={{ color: '#4f46e5', fontWeight: 600 }}>Course Curriculum Builder</span>
      </div>

      {/* Course Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div>
          <span style={{ display: 'inline-block', padding: '4px 10px', backgroundColor: '#e0e7ff', color: '#4338ca', borderRadius: '20px', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
            Instructor Mode
          </span>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.25 }}>
            {course.title}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <button
            onClick={() => navigate(`/learn/${course.id}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              color: '#334155',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
          >
            <span>👁</span> Preview Course
          </button>
          <button
            onClick={() => alert('Course published successfully!')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              backgroundColor: '#4f46e5',
              border: 'none',
              borderRadius: '10px',
              color: '#ffffff',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#4338ca')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
          >
            <span>↑</span> Publish Course
          </button>
        </div>
      </div>

      <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.6, margin: '0 0 32px 0', maxWidth: '820px' }}>
        {course.description || 'Design and structure your curriculum. Add new multimedia lessons, modules, and quizzes to enhance the learning experience.'}
      </p>

      {/* Add New Section Input Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '36px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01)',
        }}
      >
        <form onSubmit={handleAddSection} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontSize: '18px', fontWeight: 'bold' }}>
            +
          </div>
          <input
            type="text"
            placeholder="Enter new section or module title (e.g., Introduction to Advanced Concepts)..."
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
            required
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '14.5px',
              color: '#0f172a',
              background: 'transparent',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(99, 102, 241, 0.2)',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#6366f1')}
          >
            Add Section
          </button>
        </form>
      </div>

      {/* Existing Sections & Lessons List */}
      {course.sections && course.sections.length > 0 ? (
        course.sections.map((section, idx) => (
          <div
            key={section.id}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              marginBottom: '24px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
              overflow: 'hidden',
              transition: 'box-shadow 0.2s ease',
            }}
          >
            {/* Section Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 24px',
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '240px' }}>
                <span style={{ color: '#94a3b8', cursor: 'grab', fontSize: '15px', fontWeight: 700 }} title="Drag to reorder">::</span>
                
                {editingSectionId === section.id ? (
                  <div style={{ display: 'flex', gap: '10px', flex: 1, marginRight: '16px' }}>
                    <input
                      type="text"
                      value={editSectionTitle}
                      onChange={(e) => setEditSectionTitle(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={() => handleUpdateSection(section.id)}
                      style={{ padding: '8px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingSectionId(null)}
                      style={{ padding: '8px 14px', background: '#94a3b8', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#4f46e5', backgroundColor: '#eef2ff', padding: '2px 8px', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}>
                      Module {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                    <span>{section.title}</span>
                  </h3>
                )}
              </div>

              {editingSectionId !== section.id && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => {
                      setEditingSectionId(section.id);
                      setEditSectionTitle(section.title);
                    }}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: 600, padding: '4px 8px', borderRadius: '6px', transition: 'background 0.2s' }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    Edit Title
                  </button>
                  <button
                    onClick={() => handleDeleteSection(section.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', fontWeight: 600, padding: '4px 8px', borderRadius: '6px', transition: 'background 0.2s' }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    Delete Section
                  </button>
                </div>
              )}
            </div>

            {/* Lessons List */}
            <div style={{ padding: '12px 24px 20px 24px' }}>
              {section.lessons && section.lessons.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {section.lessons.map((lesson, lIdx) => (
                    <div
                      key={lesson.id}
                      style={{
                        padding: '14px 0',
                        borderBottom: lIdx === section.lessons.length - 1 ? 'none' : '1px solid #f1f5f9',
                      }}
                    >
                      {editingLessonId === lesson.id ? (
                        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                          <input
                            type="text"
                            value={editLessonTitle}
                            onChange={(e) => setEditLessonTitle(e.target.value)}
                            placeholder="Lesson Title"
                            style={{ width: '100%', padding: '10px 12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' }}
                          />
                          <input
                            type="text"
                            value={editLessonVideoUrl}
                            onChange={(e) => setEditLessonVideoUrl(e.target.value)}
                            placeholder="Video URL"
                            style={{ width: '100%', padding: '10px 12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' }}
                          />
                          <textarea
                            value={editLessonContent}
                            onChange={(e) => setEditLessonContent(e.target.value)}
                            placeholder="Lesson Notes"
                            rows={3}
                            style={{ width: '100%', padding: '10px 12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' }}
                          />
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleUpdateLesson(lesson.id)} style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                              Update Lesson
                            </button>
                            <button onClick={() => setEditingLessonId(null)} style={{ padding: '8px 16px', background: '#94a3b8', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <span style={{ color: '#cbd5e1', cursor: 'grab', fontSize: '14px' }}>::</span>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4338ca', fontSize: '13px', fontWeight: 'bold' }}>
                              ▶
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '14.5px', fontWeight: 600, color: '#334155' }}>
                                {idx + 1}.{lIdx + 1} {lesson.title}
                              </span>
                              {lesson.video_url && (
                                <span style={{ backgroundColor: '#dcfce7', color: '#15803d', fontSize: '11.5px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px' }}>
                                  Video Attached
                                </span>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button
                              onClick={() => {
                                setEditingLessonId(lesson.id);
                                setEditLessonTitle(lesson.title);
                                setEditLessonVideoUrl(lesson.video_url);
                                setEditLessonContent(lesson.content);
                              }}
                              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: 600, padding: '4px 8px', borderRadius: '6px', transition: 'background 0.2s' }}
                              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(lesson.id)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', fontWeight: 600, padding: '4px 8px', borderRadius: '6px', transition: 'background 0.2s' }}
                              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '16px 0', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
                    No lessons added to this section yet. Use the buttons below to build your curriculum.
                  </p>
                </div>
              )}

              {/* Add Lesson Form Expansion */}
              {selectedSectionId === section.id && (
                <form onSubmit={handleAddLesson} style={{ marginTop: '20px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)' }}>
                  <h5 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Add New Lesson to: {section.title}</h5>
                  <input
                    type="text"
                    placeholder="Lesson Title (e.g., Understanding Components)"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 14px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', fontSize: '14px' }}
                  />
                  <input
                    type="text"
                    placeholder="YouTube Video URL (optional)"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', fontSize: '14px' }}
                  />
                  <textarea
                    placeholder="Lesson Content / Detailed Notes"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={3}
                    style={{ width: '100%', padding: '10px 14px', marginBottom: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', fontSize: '14px' }}
                  />
                  <button type="submit" style={{ padding: '10px 20px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13.5px', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)' }}>
                    Save Lesson
                  </button>
                </form>
              )}

              {/* Add Quiz Expansion */}
              {activeQuizSectionId === section.id && (
                <div style={{ marginTop: '20px' }}>
                  <QuizBuilder
                    sectionId={section.id}
                    onQuizCreated={() => {
                      setActiveQuizSectionId(null);
                      fetchCourseDetails();
                    }}
                  />
                </div>
              )}

              {/* Action Buttons Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '20px' }}>
                <button
                  onClick={() => {
                    setSelectedSectionId(selectedSectionId === section.id ? null : section.id);
                    setActiveQuizSectionId(null);
                  }}
                  style={{
                    padding: '12px 16px',
                    border: '1.5px dashed #cbd5e1',
                    borderRadius: '10px',
                    backgroundColor: selectedSectionId === section.id ? '#f1f5f9' : '#ffffff',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = '#94a3b8')}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
                >
                  <span style={{ fontSize: '16px', color: '#6366f1' }}>+</span> {selectedSectionId === section.id ? 'Cancel Lesson' : 'Add Lesson'}
                </button>

                <button
                  onClick={() => {
                    setActiveQuizSectionId(activeQuizSectionId === section.id ? null : section.id);
                    setSelectedSectionId(null);
                  }}
                  style={{
                    padding: '12px 16px',
                    border: '1.5px dashed #cbd5e1',
                    borderRadius: '10px',
                    backgroundColor: activeQuizSectionId === section.id ? '#f1f5f9' : '#ffffff',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = '#94a3b8')}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
                >
                  <span>📝</span> {activeQuizSectionId === section.id ? 'Cancel Quiz' : 'Add Quiz'}
                </button>
              </div>

              {/* Instructor Assignment Manager Integration */}
              <div style={{ marginTop: '20px' }}>
                <InstructorAssignmentManager 
                  sectionId={section.id} 
                  sectionTitle={section.title} 
                />
              </div>
            </div>
          </div>
        ))
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 24px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📚</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>No sections added yet</h3>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Start building your comprehensive course structure by adding a section above.</p>
        </div>
      )}
    </div>
  );
};

export default CourseBuilder;