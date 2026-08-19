import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from './api';
import QuizBuilder from './QuizBuilder';
import InstructorAssignmentManager from './InstructorAssignmentManager';

interface Lesson {
  id: number;
  title: string;
  content_type: string;
  video_url: string;
  pdf_url?: string;
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
  const [pdfUrl, setPdfUrl] = useState('');
  const [content, setContent] = useState('');

  // Edit Section State
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editSectionTitle, setEditSectionTitle] = useState('');

  // Edit Lesson State
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [editLessonTitle, setEditLessonTitle] = useState('');
  const [editLessonVideoUrl, setEditLessonVideoUrl] = useState('');
  const [editLessonPdfUrl, setEditLessonPdfUrl] = useState('');
  const [editLessonContent, setEditLessonContent] = useState('');

  // Quiz Toggle State
  const [activeQuizSectionId, setActiveQuizSectionId] = useState<number | null>(null);

  const fetchCourseDetails = useCallback(() => {
    if (!id) return;
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

  useEffect(() => {
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  // Section Actions
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionTitle.trim()) return;
    try {
      await API.post('/sections', {
        course_id: Number(id),
        title: sectionTitle,
        order: (course?.sections?.length || 0) + 1,
      });
      setSectionTitle('');
      fetchCourseDetails();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      alert(error.response?.data?.error || 'Failed to add section');
    }
  };

  const handleUpdateSection = async (sectionId: number) => {
    if (!editSectionTitle.trim()) return;
    try {
      await API.put(`/sections/${sectionId}`, { title: editSectionTitle });
      setEditingSectionId(null);
      fetchCourseDetails();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      alert(error.response?.data?.error || 'Failed to update section');
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!window.confirm('Are you sure you want to delete this section and all its lessons?')) return;
    try {
      await API.delete(`/sections/${sectionId}`);
      fetchCourseDetails();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      alert(error.response?.data?.error || 'Failed to delete section');
    }
  };

  // Lesson Actions
  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSectionId || !lessonTitle.trim()) return;
    try {
      await API.post('/lessons', {
        section_id: selectedSectionId,
        title: lessonTitle,
        content_type: pdfUrl ? 'PDF' : 'VIDEO',
        video_url: videoUrl,
        pdf_url: pdfUrl,
        content: content,
        is_free: false,
        order: 1,
      });
      setLessonTitle('');
      setVideoUrl('');
      setPdfUrl('');
      setContent('');
      setSelectedSectionId(null);
      fetchCourseDetails();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      alert(error.response?.data?.error || 'Failed to add lesson');
    }
  };

  const handleUpdateLesson = async (lessonId: number) => {
    if (!editLessonTitle.trim()) return;
    try {
      await API.put(`/lessons/${lessonId}`, {
        title: editLessonTitle,
        video_url: editLessonVideoUrl,
        pdf_url: editLessonPdfUrl,
        content: editLessonContent,
      });
      setEditingLessonId(null);
      fetchCourseDetails();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      alert(error.response?.data?.error || 'Failed to update lesson');
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await API.delete(`/lessons/${lessonId}`);
      fetchCourseDetails();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      alert(error.response?.data?.error || 'Failed to delete lesson');
    }
  };

  const cardAccentColors = ['#2B4A3E', '#3D5A73', '#B98A1E', '#B5482F'];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', fontFamily: "'IBM Plex Mono', monospace", color: '#A39C8C', backgroundColor: '#FAF8F3', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '13px' }}>
        LOADING CURRICULUM DATA...
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', fontFamily: "'IBM Plex Mono', monospace", color: '#B5482F', backgroundColor: '#FAF8F3', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '13px' }}>
        COURSE ENTRY NOT FOUND.
      </div>
    );
  }

  const totalSections = course.sections?.length || 0;
  const totalLessons = course.sections?.reduce((acc, sec) => acc + (sec.lessons?.length || 0), 0) || 0;

  return (
    <div style={{ maxWidth: '1020px', margin: '0 auto', padding: '40px 24px', fontFamily: "'Inter', sans-serif", color: '#201F1C', backgroundColor: '#FAF8F3', minHeight: '100vh' }}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');`}
      </style>

      {/* Breadcrumb Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontFamily: "'IBM Plex Mono', monospace", color: '#A39C8C', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '24px' }}>
        <span style={{ cursor: 'pointer', color: '#201F1C' }} onClick={() => navigate('/dashboard')}>Dashboard</span>
        <span>/</span>
        <span style={{ cursor: 'pointer', color: '#201F1C' }} onClick={() => navigate('/dashboard')}>Courses</span>
        <span>/</span>
        <span style={{ color: '#2B4A3E', fontWeight: 600 }}>Curriculum Builder</span>
      </div>

      {/* Course Action Header */}
      <div style={{ position: 'relative', backgroundColor: '#FFFFFF', border: '1px solid #E4DFD1', borderTop: '3px solid #2B4A3E', borderRadius: '10px', padding: '28px', marginBottom: '24px' }}>
        <div style={{ position: 'absolute', top: '24px', right: '28px', transform: 'rotate(28deg)', backgroundColor: '#E7EEE9', color: '#2B4A3E', border: '1.5px solid #2B4A3E', padding: '2px 8px', borderRadius: '4px', fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', pointerEvents: 'none' }}>
          INSTRUCTOR MODE
        </div>

        <div style={{ maxWidth: '720px', marginBottom: '20px' }}>
          <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px' }}>
            COURSE REF: #{course.id}
          </span>
          <h1 style={{ fontSize: '30px', fontWeight: 600, color: '#201F1C', fontFamily: "'Fraunces', serif", margin: '0 0 12px 0', lineHeight: 1.2 }}>
            {course.title}
          </h1>
          <p style={{ color: '#6B6558', fontSize: '14.5px', lineHeight: 1.6, margin: 0 }}>
            {course.description || 'Design and structure your curriculum. Add new multimedia lessons, PDF documents, modules, and quizzes to enhance the learning experience.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '16px', borderTop: '1px solid #E4DFD1' }}>
          <button
            onClick={() => navigate(`/learn/${course.id}`)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              backgroundColor: 'transparent',
              border: '1.5px solid #2B4A3E',
              borderRadius: '7px',
              color: '#2B4A3E',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              cursor: 'pointer',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Preview Course
          </button>
          <button
            onClick={() => alert('Course published successfully!')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              backgroundColor: '#2B4A3E',
              border: 'none',
              borderRadius: '7px',
              color: '#FAF8F3',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              cursor: 'pointer',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
            Publish Course
          </button>
        </div>
      </div>

      {/* Stats Summary Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          marginBottom: '28px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E4DFD1',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 20px', borderRight: '1px solid #E4DFD1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
            TOTAL MODULES
          </span>
          <div style={{ fontSize: '26px', fontWeight: 600, color: '#201F1C', fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.1 }}>
            {totalSections}
          </div>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
            TOTAL LESSONS
          </span>
          <div style={{ fontSize: '26px', fontWeight: 600, color: '#201F1C', fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.1 }}>
            {totalLessons}
          </div>
        </div>
      </div>

      {/* Add New Section Form */}
      <div
        style={{
          backgroundColor: '#FAF8F3',
          border: '1.5px dashed #D2CBB8',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '28px',
        }}
      >
        <form onSubmit={handleAddSection} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #2B4A3E', backgroundColor: '#E7EEE9', color: '#2B4A3E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'IBM Plex Mono', monospace", fontSize: '16px', fontWeight: 600, flexShrink: 0 }}>
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
              border: '1px solid #E4DFD1',
              borderRadius: '7px',
              padding: '10px 14px',
              fontSize: '13.5px',
              color: '#201F1C',
              backgroundColor: '#FFFFFF',
              outline: 'none',
              fontFamily: "'Inter', sans-serif",
            }}
          />
          <button
            type="submit"
            style={{
              padding: '10px 18px',
              backgroundColor: '#2B4A3E',
              color: '#FAF8F3',
              border: 'none',
              borderRadius: '7px',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Add Section
          </button>
        </form>
      </div>

      {/* Existing Sections & Lessons List */}
      {course.sections && course.sections.length > 0 ? (
        course.sections.map((section, idx) => {
          const sectionAccent = cardAccentColors[idx % cardAccentColors.length];

          return (
            <div
              key={section.id}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E4DFD1',
                borderTop: `3px solid ${sectionAccent}`,
                borderRadius: '8px',
                marginBottom: '24px',
                overflow: 'hidden',
              }}
            >
              {/* Section Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  backgroundColor: '#FAF8F3',
                  borderBottom: '1px solid #E4DFD1',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '240px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A39C8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'grab' }}>
                    <circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" />
                    <circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" />
                  </svg>

                  {editingSectionId === section.id ? (
                    <div style={{ display: 'flex', gap: '8px', flex: 1, marginRight: '16px' }}>
                      <input
                        type="text"
                        value={editSectionTitle}
                        onChange={(e) => setEditSectionTitle(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '7px 10px',
                          border: '1px solid #E4DFD1',
                          borderRadius: '6px',
                          fontSize: '13.5px',
                          outline: 'none',
                          backgroundColor: '#FFFFFF',
                          color: '#201F1C',
                        }}
                      />
                      <button
                        onClick={() => handleUpdateSection(section.id)}
                        style={{ padding: '7px 12px', background: '#2B4A3E', color: '#FAF8F3', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingSectionId(null)}
                        style={{ padding: '7px 12px', background: 'transparent', border: '1px solid #E4DFD1', color: '#6B6558', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}
                      >
                        Discard
                      </button>
                    </div>
                  ) : (
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#201F1C', fontFamily: "'Fraunces', serif", display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#2B4A3E', backgroundColor: '#E7EEE9', border: '1px solid #2B4A3E', padding: '1px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>
                        MODULE {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </span>
                      <span>{section.title}</span>
                    </h3>
                  )}
                </div>

                {editingSectionId !== section.id && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setEditingSectionId(section.id);
                        setEditSectionTitle(section.title);
                      }}
                      style={{ background: 'none', border: 'none', color: '#6B6558', cursor: 'pointer', fontSize: '12px', fontWeight: 500, padding: '4px 8px', borderRadius: '4px', fontFamily: "'Inter', sans-serif" }}
                    >
                      Edit Title
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      style={{ background: 'none', border: 'none', color: '#B5482F', cursor: 'pointer', fontSize: '12px', fontWeight: 500, padding: '4px 8px', borderRadius: '4px', fontFamily: "'Inter', sans-serif" }}
                    >
                      Delete Section
                    </button>
                  </div>
                )}
              </div>

              {/* Lessons List */}
              <div style={{ padding: '12px 20px 20px 20px' }}>
                {section.lessons && section.lessons.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {section.lessons.map((lesson, lIdx) => (
                      <div
                        key={lesson.id}
                        style={{
                          padding: '12px 0',
                          borderBottom: lIdx === section.lessons.length - 1 ? 'none' : '1px solid #E4DFD1',
                        }}
                      >
                        {editingLessonId === lesson.id ? (
                          <div style={{ background: '#FAF8F3', padding: '16px', borderRadius: '8px', border: '1.5px dashed #D2CBB8' }}>
                            <input
                              type="text"
                              value={editLessonTitle}
                              onChange={(e) => setEditLessonTitle(e.target.value)}
                              placeholder="Lesson Title"
                              style={{ width: '100%', padding: '8px 12px', marginBottom: '8px', borderRadius: '6px', border: '1px solid #E4DFD1', boxSizing: 'border-box', outline: 'none', fontSize: '13.5px', color: '#201F1C' }}
                            />
                            <input
                              type="text"
                              value={editLessonVideoUrl}
                              onChange={(e) => setEditLessonVideoUrl(e.target.value)}
                              placeholder="Video URL (optional)"
                              style={{ width: '100%', padding: '8px 12px', marginBottom: '8px', borderRadius: '6px', border: '1px solid #E4DFD1', boxSizing: 'border-box', outline: 'none', fontSize: '13.5px', color: '#201F1C' }}
                            />
                            <input
                              type="text"
                              value={editLessonPdfUrl}
                              onChange={(e) => setEditLessonPdfUrl(e.target.value)}
                              placeholder="PDF Document URL (e.g. https://domain.com/lecture.pdf)"
                              style={{ width: '100%', padding: '8px 12px', marginBottom: '8px', borderRadius: '6px', border: '1px solid #E4DFD1', boxSizing: 'border-box', outline: 'none', fontSize: '13.5px', color: '#201F1C' }}
                            />
                            <textarea
                              value={editLessonContent}
                              onChange={(e) => setEditLessonContent(e.target.value)}
                              placeholder="Lesson Notes"
                              rows={3}
                              style={{ width: '100%', padding: '8px 12px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #E4DFD1', boxSizing: 'border-box', outline: 'none', fontSize: '13.5px', color: '#201F1C' }}
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => handleUpdateLesson(lesson.id)} style={{ padding: '7px 14px', background: '#2B4A3E', color: '#FAF8F3', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                                Update Lesson
                              </button>
                              <button onClick={() => setEditingLessonId(null)} style={{ padding: '7px 14px', background: 'transparent', border: '1px solid #E4DFD1', color: '#6B6558', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                                Discard
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A39C8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'grab' }}>
                                <circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" />
                                <circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" />
                              </svg>

                              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#E7EEE9', color: '#2B4A3E', border: '1px solid #2B4A3E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {lesson.pdf_url ? (
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                  </svg>
                                ) : (
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                  </svg>
                                )}
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#201F1C' }}>
                                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#A39C8C', marginRight: '6px' }}>
                                    {idx + 1}.{lIdx + 1}
                                  </span>
                                  {lesson.title}
                                </span>
                                {lesson.video_url && (
                                  <span style={{ backgroundColor: '#E7EEE9', color: '#2B4A3E', border: '1px solid #2B4A3E', fontSize: '10px', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                    VIDEO
                                  </span>
                                )}
                                {lesson.pdf_url && (
                                  <span style={{ backgroundColor: '#FBF1DA', color: '#B98A1E', border: '1px solid #B98A1E', fontSize: '10px', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                    PDF ATTACHED
                                  </span>
                                )}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                onClick={() => {
                                  setEditingLessonId(lesson.id);
                                  setEditLessonTitle(lesson.title);
                                  setEditLessonVideoUrl(lesson.video_url || '');
                                  setEditLessonPdfUrl(lesson.pdf_url || '');
                                  setEditLessonContent(lesson.content || '');
                                }}
                                style={{ background: 'none', border: 'none', color: '#6B6558', cursor: 'pointer', fontSize: '12px', fontWeight: 500, padding: '4px 6px' }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteLesson(lesson.id)}
                                style={{ background: 'none', border: 'none', color: '#B5482F', cursor: 'pointer', fontSize: '12px', fontWeight: 500, padding: '4px 6px' }}
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
                  <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#FAF8F3', borderRadius: '6px', border: '1.5px dashed #D2CBB8' }}>
                    <p style={{ fontSize: '12px', color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                      No lessons filed for this module.
                    </p>
                  </div>
                )}

                {/* Add Lesson Form Expansion */}
                {selectedSectionId === section.id && (
                  <form onSubmit={handleAddLesson} style={{ marginTop: '16px', padding: '16px', backgroundColor: '#FAF8F3', borderRadius: '8px', border: '1.5px dashed #D2CBB8' }}>
                    <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#201F1C', fontFamily: "'Fraunces', serif" }}>
                      Add New Lesson Entry: {section.title}
                    </h5>
                    <input
                      type="text"
                      placeholder="Lesson Title (e.g., Understanding Components)"
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                      required
                      style={{ width: '100%', padding: '8px 12px', marginBottom: '8px', borderRadius: '6px', border: '1px solid #E4DFD1', boxSizing: 'border-box', outline: 'none', fontSize: '13.5px', color: '#201F1C', backgroundColor: '#FFFFFF' }}
                    />
                    <input
                      type="text"
                      placeholder="YouTube Video URL (optional)"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', marginBottom: '8px', borderRadius: '6px', border: '1px solid #E4DFD1', boxSizing: 'border-box', outline: 'none', fontSize: '13.5px', color: '#201F1C', backgroundColor: '#FFFFFF' }}
                    />
                    <input
                      type="text"
                      placeholder="PDF Document URL (optional, e.g., https://domain.com/lecture.pdf)"
                      value={pdfUrl}
                      onChange={(e) => setPdfUrl(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', marginBottom: '8px', borderRadius: '6px', border: '1px solid #E4DFD1', boxSizing: 'border-box', outline: 'none', fontSize: '13.5px', color: '#201F1C', backgroundColor: '#FFFFFF' }}
                    />
                    <textarea
                      placeholder="Lesson Content / Detailed Notes"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={3}
                      style={{ width: '100%', padding: '8px 12px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #E4DFD1', boxSizing: 'border-box', outline: 'none', fontSize: '13.5px', color: '#201F1C', backgroundColor: '#FFFFFF' }}
                    />
                    <button type="submit" style={{ padding: '8px 16px', background: '#2B4A3E', color: '#FAF8F3', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12.5px' }}>
                      Save Lesson
                    </button>
                  </form>
                )}

                {/* Add Quiz Expansion */}
                {activeQuizSectionId === section.id && (
                  <div style={{ marginTop: '16px' }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '16px' }}>
                  <button
                    onClick={() => {
                      setSelectedSectionId(selectedSectionId === section.id ? null : section.id);
                      setActiveQuizSectionId(null);
                    }}
                    style={{
                      padding: '10px 14px',
                      border: '1.5px dashed #D2CBB8',
                      borderRadius: '7px',
                      backgroundColor: selectedSectionId === section.id ? '#FAF8F3' : '#FFFFFF',
                      color: '#201F1C',
                      fontWeight: 600,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <span style={{ fontSize: '14px', color: '#2B4A3E', fontFamily: "'IBM Plex Mono', monospace" }}>+</span>
                    {selectedSectionId === section.id ? 'Discard Lesson' : 'Add Lesson'}
                  </button>

                  <button
                    onClick={() => {
                      setActiveQuizSectionId(activeQuizSectionId === section.id ? null : section.id);
                      setSelectedSectionId(null);
                    }}
                    style={{
                      padding: '10px 14px',
                      border: '1.5px dashed #D2CBB8',
                      borderRadius: '7px',
                      backgroundColor: activeQuizSectionId === section.id ? '#FAF8F3' : '#FFFFFF',
                      color: '#201F1C',
                      fontWeight: 600,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    {activeQuizSectionId === section.id ? 'Discard Quiz' : 'Add Quiz'}
                  </button>
                </div>

                {/* Instructor Assignment Manager Integration */}
                <div style={{ marginTop: '16px' }}>
                  <InstructorAssignmentManager
                    sectionId={section.id}
                    sectionTitle={section.title}
                  />
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: '#FAF8F3', borderRadius: '8px', border: '1.5px dashed #D2CBB8' }}>
          <p style={{ fontSize: '12px', color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px 0' }}>
            THE CATALOG IS EMPTY.
          </p>
          <p style={{ color: '#6B6558', fontSize: '13.5px', margin: 0 }}>
            Start building your course structure by filing a section entry above.
          </p>
        </div>
      )}
    </div>
  );
};

export default CourseBuilder;