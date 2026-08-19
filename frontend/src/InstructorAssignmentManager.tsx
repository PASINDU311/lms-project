import React, { useEffect, useState } from 'react';
import API from './api';

interface Assignment {
  id: number;
  title: string;
  description: string;
  max_marks: number;
  due_date?: string;
}

interface Submission {
  id: number;
  user_id: number;
  submission_url: string;
  content: string;
  status: string;
  marks: number | null;
  feedback: string;
  User?: {
    name: string;
    email: string;
  };
}

interface Props {
  sectionId: number;
  sectionTitle: string;
}

const InstructorAssignmentManager: React.FC<Props> = ({ sectionId }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // New Assignment Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxMarks, setMaxMarks] = useState<number>(100);
  const [dueDate, setDueDate] = useState('');

  // Edit Assignment State
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editMaxMarks, setEditMaxMarks] = useState<number>(100);
  const [editDueDate, setEditDueDate] = useState('');

  // Submissions State for Grading
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Grading Inputs State
  const [gradingMarks, setGradingMarks] = useState<{ [key: number]: number }>({});
  const [gradingFeedback, setGradingFeedback] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    fetchAssignments();
  }, [sectionId]);

  const fetchAssignments = async () => {
    try {
      const res = await API.get(`/assignments/section/${sectionId}`);
      setAssignments(res.data.assignments || []);
    } catch (err) {
      console.error('Failed to load assignments', err);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post('/assignments', {
        section_id: sectionId,
        title,
        description,
        max_marks: Number(maxMarks),
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
      });
      alert('Assignment created successfully!');
      setTitle('');
      setDescription('');
      setMaxMarks(100);
      setDueDate('');
      setShowCreateForm(false);
      fetchAssignments();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create assignment');
    }
  };

  // Open Edit Form
  const handleEditClick = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setEditTitle(assignment.title);
    setEditDescription(assignment.description);
    setEditMaxMarks(assignment.max_marks);
    // Format Date for datetime-local input
    if (assignment.due_date) {
      const formattedDate = new Date(assignment.due_date).toISOString().slice(0, 16);
      setEditDueDate(formattedDate);
    } else {
      setEditDueDate('');
    }
  };

  // Save Edit Assignment
  const handleUpdateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment) return;

    try {
      await API.put(`/assignments/${editingAssignment.id}`, {
        title: editTitle,
        description: editDescription,
        max_marks: Number(editMaxMarks),
        due_date: editDueDate ? new Date(editDueDate).toISOString() : null,
      });
      alert('Assignment updated successfully!');
      setEditingAssignment(null);
      fetchAssignments();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update assignment');
    }
  };

  // Delete Assignment
  const handleDeleteAssignment = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this assignment? All submissions will be deleted!')) {
      try {
        await API.delete(`/assignments/${id}`);
        alert('Assignment deleted successfully!');
        fetchAssignments();
      } catch (err: any) {
        alert(err.response?.data?.error || 'Failed to delete assignment');
      }
    }
  };

  const handleViewSubmissions = async (assignmentId: number) => {
    if (selectedAssignmentId === assignmentId) {
      setSelectedAssignmentId(null);
      return;
    }
    setSelectedAssignmentId(assignmentId);
    setLoadingSubmissions(true);
    try {
      const res = await API.get(`/assignments/${assignmentId}/submissions`);
      setSubmissions(res.data.submissions || []);
      setLoadingSubmissions(false);
    } catch (err) {
      console.error('Failed to fetch submissions', err);
      setLoadingSubmissions(false);
    }
  };

  const handleGradeSubmission = async (submissionId: number) => {
    const marks = gradingMarks[submissionId];
    const feedback = gradingFeedback[submissionId] || '';

    if (marks === undefined || marks === null) {
      alert('Please enter marks before saving!');
      return;
    }

    try {
      await API.put(`/assignments/submissions/${submissionId}/grade`, {
        marks: Number(marks),
        feedback: feedback,
      });
      alert('Grade & Feedback saved successfully!');
      if (selectedAssignmentId) {
        handleViewSubmissions(selectedAssignmentId);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to grade submission');
    }
  };

  const cardAccentColors = ['#2B4A3E', '#3D5A73', '#B98A1E', '#B5482F'];

  return (
    <div
      style={{
        marginTop: '20px',
        backgroundColor: '#FFFFFF',
        padding: '24px',
        borderRadius: '10px',
        border: '1px solid #E4DFD1',
        borderTop: '3px solid #2B4A3E',
        fontFamily: "'Inter', sans-serif",
        color: '#201F1C',
      }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');`}
      </style>

      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h5 style={{ margin: 0, color: '#201F1C', fontSize: '18px', fontWeight: '600', fontFamily: "'Fraunces', serif" }}>
            Course Assignments
          </h5>
          <span
            style={{
              backgroundColor: '#E7EEE9',
              color: '#2B4A3E',
              border: '1px solid #2B4A3E',
              fontSize: '11px',
              fontWeight: '600',
              fontFamily: "'IBM Plex Mono', monospace",
              padding: '2px 8px',
              borderRadius: '4px',
              letterSpacing: '0.05em',
            }}
          >
            {assignments.length < 10 ? `0${assignments.length}` : assignments.length} FILLED
          </span>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: '8px 14px',
            backgroundColor: showCreateForm ? '#FAF8F3' : '#2B4A3E',
            color: showCreateForm ? '#201F1C' : '#FAF8F3',
            border: showCreateForm ? '1px solid #E4DFD1' : 'none',
            borderRadius: '7px',
            cursor: 'pointer',
            fontSize: '12.5px',
            fontWeight: '600',
            fontFamily: "'Inter', sans-serif",
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {showCreateForm ? (
            'Discard'
          ) : (
            <>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>+</span> Add Assignment
            </>
          )}
        </button>
      </div>

      {/* Create Assignment Form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateAssignment}
          style={{
            marginTop: '16px',
            marginBottom: '24px',
            backgroundColor: '#FAF8F3',
            padding: '20px',
            borderRadius: '8px',
            border: '1.5px dashed #D2CBB8',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Assignment Title
            </label>
            <input
              type="text"
              placeholder="e.g., Final Project Submission"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '7px',
                border: '1px solid #E4DFD1',
                fontSize: '13.5px',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: '#FFFFFF',
                color: '#201F1C',
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Instructions / Description
            </label>
            <textarea
              placeholder="Provide submission guidelines or details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '7px',
                border: '1px solid #E4DFD1',
                fontSize: '13.5px',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: '#FFFFFF',
                color: '#201F1C',
                resize: 'vertical',
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Max Marks
              </label>
              <input
                type="number"
                value={maxMarks}
                onChange={(e) => setMaxMarks(Number(e.target.value))}
                style={{
                  width: '110px',
                  padding: '8px 10px',
                  borderRadius: '7px',
                  border: '1px solid #E4DFD1',
                  fontSize: '13px',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  color: '#201F1C',
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Deadline
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '7px',
                  border: '1px solid #E4DFD1',
                  fontSize: '13px',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  color: '#201F1C',
                  fontFamily: "'Inter', sans-serif",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              padding: '9px 18px',
              backgroundColor: '#2B4A3E',
              color: '#FAF8F3',
              border: 'none',
              borderRadius: '7px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Add to catalog
          </button>
        </form>
      )}

      {/* Edit Assignment Form */}
      {editingAssignment && (
        <form
          onSubmit={handleUpdateAssignment}
          style={{
            marginTop: '16px',
            marginBottom: '24px',
            backgroundColor: '#FBF1DA',
            padding: '20px',
            borderRadius: '8px',
            border: '1.5px dashed #B98A1E',
          }}
        >
          <h6 style={{ margin: '0 0 16px 0', color: '#B98A1E', fontSize: '15px', fontWeight: '600', fontFamily: "'Fraunces', serif" }}>
            Edit Assignment Entry
          </h6>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#B98A1E', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Assignment Title
            </label>
            <input
              type="text"
              placeholder="Assignment Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '7px',
                border: '1px solid #E4DFD1',
                fontSize: '13.5px',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: '#FFFFFF',
                color: '#201F1C',
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#B98A1E', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Instructions / Description
            </label>
            <textarea
              placeholder="Instructions / Description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              required
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '7px',
                border: '1px solid #E4DFD1',
                fontSize: '13.5px',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: '#FFFFFF',
                color: '#201F1C',
                resize: 'vertical',
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#B98A1E', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Max Marks
              </label>
              <input
                type="number"
                value={editMaxMarks}
                onChange={(e) => setEditMaxMarks(Number(e.target.value))}
                style={{
                  width: '110px',
                  padding: '8px 10px',
                  borderRadius: '7px',
                  border: '1px solid #E4DFD1',
                  fontSize: '13px',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  color: '#201F1C',
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#B98A1E', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Deadline
              </label>
              <input
                type="datetime-local"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '7px',
                  border: '1px solid #E4DFD1',
                  fontSize: '13px',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  color: '#201F1C',
                  fontFamily: "'Inter', sans-serif",
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                backgroundColor: '#2B4A3E',
                color: '#FAF8F3',
                border: 'none',
                borderRadius: '7px',
                cursor: 'pointer',
                fontSize: '12.5px',
                fontWeight: '600',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Update Entry
            </button>
            <button
              type="button"
              onClick={() => setEditingAssignment(null)}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: '1px solid #E4DFD1',
                color: '#6B6558',
                borderRadius: '7px',
                cursor: 'pointer',
                fontSize: '12.5px',
                fontWeight: '600',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Discard
            </button>
          </div>
        </form>
      )}

      {/* Existing Assignments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {assignments.length > 0 ? (
          assignments.map((assignment, idx) => {
            const accentColor = cardAccentColors[idx % cardAccentColors.length];

            return (
              <div
                key={assignment.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #E4DFD1',
                  borderTop: `3px solid ${accentColor}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '600', color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                      REF #{assignment.id}
                    </div>
                    <strong style={{ fontSize: '16px', color: '#201F1C', fontWeight: '600', fontFamily: "'Fraunces', serif", display: 'block' }}>
                      {assignment.title}
                    </strong>
                    <p style={{ margin: '6px 0 12px 0', fontSize: '13.5px', color: '#6B6558', lineHeight: '1.5' }}>
                      {assignment.description}
                    </p>

                    {/* Report Card Strip for Assignment Meta */}
                    <div
                      style={{
                        display: 'inline-flex',
                        backgroundColor: '#FAF8F3',
                        border: '1px solid #E4DFD1',
                        borderRadius: '6px',
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{ padding: '6px 12px', borderRight: '1px solid #E4DFD1', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '9px', fontWeight: '600', color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          MAX MARKS
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#201F1C', fontFamily: "'IBM Plex Mono', monospace" }}>
                          {assignment.max_marks}
                        </span>
                      </div>
                      {assignment.due_date && (
                        <div style={{ padding: '6px 12px', display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '9px', fontWeight: '600', color: '#B5482F', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            DUE DATE
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#B5482F', fontFamily: "'IBM Plex Mono', monospace" }}>
                            {new Date(assignment.due_date).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleEditClick(assignment)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'transparent',
                        color: '#6B6558',
                        border: '1px solid #E4DFD1',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#FBEAE3',
                        color: '#B5482F',
                        border: '1px solid #B5482F',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleViewSubmissions(assignment.id)}
                      style={{
                        padding: '6px 14px',
                        backgroundColor: selectedAssignmentId === assignment.id ? '#FAF8F3' : '#2B4A3E',
                        color: selectedAssignmentId === assignment.id ? '#201F1C' : '#FAF8F3',
                        border: selectedAssignmentId === assignment.id ? '1px solid #E4DFD1' : 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        fontFamily: "'Inter', sans-serif",
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      {selectedAssignmentId === assignment.id ? 'Hide Submissions' : 'Submissions'}
                    </button>
                  </div>
                </div>

                {/* Submissions List & Grading UI */}
                {selectedAssignmentId === assignment.id && (
                  <div
                    style={{
                      marginTop: '20px',
                      backgroundColor: '#FAF8F3',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #E4DFD1',
                      borderTop: '2px solid #2B4A3E',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h6 style={{ margin: 0, fontSize: '11px', color: '#A39C8C', fontWeight: '600', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        STUDENT SUBMISSIONS CATALOG
                      </h6>
                      <span style={{ fontSize: '11px', fontFamily: "'IBM Plex Mono', monospace", color: '#2B4A3E', fontWeight: 600 }}>
                        COUNT: {submissions.length}
                      </span>
                    </div>

                    {loadingSubmissions ? (
                      <p style={{ fontSize: '12px', fontFamily: "'IBM Plex Mono', monospace", color: '#A39C8C', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                        FETCHING SUBMISSIONS DATA...
                      </p>
                    ) : submissions.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {submissions.map((sub) => (
                          <div
                            key={sub.id}
                            style={{
                              position: 'relative',
                              backgroundColor: '#FFFFFF',
                              padding: '16px',
                              borderRadius: '8px',
                              border: '1px solid #E4DFD1',
                              overflow: 'hidden',
                            }}
                          >
                            {/* Rotated Stamp Badge */}
                            <div
                              style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                transform: 'rotate(28deg)',
                                backgroundColor: sub.status === 'GRADED' ? '#E7EEE9' : '#FBF1DA',
                                color: sub.status === 'GRADED' ? '#2B4A3E' : '#B98A1E',
                                border: `1.5px solid ${sub.status === 'GRADED' ? '#2B4A3E' : '#B98A1E'}`,
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: '10px',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                pointerEvents: 'none',
                              }}
                            >
                              {sub.status}
                            </div>

                            <div style={{ marginBottom: '10px', paddingRight: '80px' }}>
                              <span style={{ fontSize: '14px', fontWeight: '600', color: '#201F1C', display: 'block' }}>
                                {sub.User?.name || `Student ID: ${sub.user_id}`}
                              </span>
                              <span style={{ fontSize: '12px', color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace" }}>
                                {sub.User?.email}
                              </span>
                            </div>

                            {sub.submission_url && (
                              <div style={{ fontSize: '13px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3D5A73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                </svg>
                                <span style={{ color: '#6B6558' }}>Attachment:</span>
                                <a href={sub.submission_url} target="_blank" rel="noreferrer" style={{ color: '#3D5A73', fontWeight: '600', textDecoration: 'underline', fontFamily: "'IBM Plex Mono', monospace" }}>
                                  {sub.submission_url}
                                </a>
                              </div>
                            )}

                            {sub.content && (
                              <div style={{ fontSize: '13px', backgroundColor: '#FAF8F3', border: '1px solid #E4DFD1', padding: '10px 12px', borderRadius: '6px', marginBottom: '12px', color: '#201F1C', lineHeight: '1.5' }}>
                                <span style={{ display: 'block', fontSize: '9px', fontWeight: '600', color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                                  SUBMISSION NOTES
                                </span>
                                {sub.content}
                              </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid #E4DFD1' }}>
                              <div>
                                <input
                                  type="number"
                                  placeholder="Marks"
                                  defaultValue={sub.marks ?? ''}
                                  onChange={(e) => setGradingMarks({ ...gradingMarks, [sub.id]: Number(e.target.value) })}
                                  style={{
                                    width: '85px',
                                    padding: '7px 9px',
                                    fontSize: '13px',
                                    borderRadius: '6px',
                                    border: '1px solid #E4DFD1',
                                    outline: 'none',
                                    backgroundColor: '#FFFFFF',
                                    color: '#201F1C',
                                    fontFamily: "'IBM Plex Mono', monospace",
                                  }}
                                />
                              </div>
                              <input
                                type="text"
                                placeholder="Feedback (e.g., Good job!)"
                                defaultValue={sub.feedback ?? ''}
                                onChange={(e) => setGradingFeedback({ ...gradingFeedback, [sub.id]: e.target.value })}
                                style={{
                                  flex: 1,
                                  minWidth: '180px',
                                  padding: '7px 10px',
                                  fontSize: '13px',
                                  borderRadius: '6px',
                                  border: '1px solid #E4DFD1',
                                  outline: 'none',
                                  backgroundColor: '#FFFFFF',
                                  color: '#201F1C',
                                  fontFamily: "'Inter', sans-serif",
                                }}
                              />
                              <button
                                onClick={() => handleGradeSubmission(sub.id)}
                                style={{
                                  padding: '7px 14px',
                                  backgroundColor: '#2B4A3E',
                                  color: '#FAF8F3',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  fontFamily: "'Inter', sans-serif",
                                }}
                              >
                                Save Grade
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1.5px dashed #D2CBB8' }}>
                        <p style={{ fontSize: '11px', color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                          No submissions recorded for this assignment.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ padding: '28px 20px', textAlign: 'center', backgroundColor: '#FAF8F3', borderRadius: '8px', border: '1.5px dashed #D2CBB8' }}>
            <p style={{ fontSize: '11px', color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              The assignment catalog is empty.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorAssignmentManager;