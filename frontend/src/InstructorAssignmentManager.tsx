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

  return (
    <div
      style={{
        marginTop: '20px',
        background: '#ffffff',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h5 style={{ margin: 0, color: '#0f172a', fontSize: '16px', fontWeight: '700' }}>
            📝 Assignments
          </h5>
          <span
            style={{
              background: '#f1f5f9',
              color: '#475569',
              fontSize: '12px',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '12px',
            }}
          >
            {assignments.length}
          </span>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: '8px 14px',
            background: showCreateForm ? '#64748b' : '#ea580c',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            transition: 'background 0.2s ease',
          }}
        >
          {showCreateForm ? 'Cancel' : '+ Add Assignment'}
        </button>
      </div>

      {/* Create Assignment Form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateAssignment}
          style={{
            marginTop: '16px',
            marginBottom: '20px',
            background: '#f8fafc',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
          }}
        >
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
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
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#ffffff',
              }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
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
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#ffffff',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                Max Marks
              </label>
              <input
                type="number"
                value={maxMarks}
                onChange={(e) => setMaxMarks(Number(e.target.value))}
                style={{
                  width: '100px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  background: '#ffffff',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                Deadline
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  background: '#ffffff',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              padding: '9px 16px',
              background: '#16a34a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.2)',
            }}
          >
            Save Assignment
          </button>
        </form>
      )}

      {/* Edit Assignment Form */}
      {editingAssignment && (
        <form
          onSubmit={handleUpdateAssignment}
          style={{
            marginTop: '16px',
            marginBottom: '20px',
            background: '#fffbeb',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid #fde68a',
          }}
        >
          <h6 style={{ margin: '0 0 12px 0', color: '#b45309', fontSize: '14px', fontWeight: '700' }}>
            ✏️ Edit Assignment
          </h6>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#92400e', textTransform: 'uppercase', marginBottom: '4px' }}>
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
                borderRadius: '6px',
                border: '1px solid #fcd34d',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#ffffff',
              }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#92400e', textTransform: 'uppercase', marginBottom: '4px' }}>
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
                borderRadius: '6px',
                border: '1px solid #fcd34d',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#ffffff',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#92400e', textTransform: 'uppercase', marginBottom: '4px' }}>
                Max Marks
              </label>
              <input
                type="number"
                value={editMaxMarks}
                onChange={(e) => setEditMaxMarks(Number(e.target.value))}
                style={{
                  width: '100px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #fcd34d',
                  fontSize: '13px',
                  outline: 'none',
                  background: '#ffffff',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#92400e', textTransform: 'uppercase', marginBottom: '4px' }}>
                Deadline
              </label>
              <input
                type="datetime-local"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #fcd34d',
                  fontSize: '13px',
                  outline: 'none',
                  background: '#ffffff',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="submit"
              style={{
                padding: '8px 14px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              Update Assignment
            </button>
            <button
              type="button"
              onClick={() => setEditingAssignment(null)}
              style={{
                padding: '8px 14px',
                background: '#64748b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Existing Assignments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            style={{
              background: '#ffffff',
              padding: '16px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <strong style={{ fontSize: '15px', color: '#0f172a', fontWeight: '700' }}>{assignment.title}</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                  {assignment.description}
                </p>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px', fontSize: '12px' }}>
                  <span style={{ color: '#475569', fontWeight: '600', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                    Max Marks: {assignment.max_marks}
                  </span>
                  {assignment.due_date && (
                    <span style={{ color: '#dc2626', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ⏳ Due: {new Date(assignment.due_date).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => handleEditClick(assignment)}
                  style={{
                    padding: '6px 10px',
                    background: '#fef3c7',
                    color: '#d97706',
                    border: '1px solid #fde68a',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDeleteAssignment(assignment.id)}
                  style={{
                    padding: '6px 10px',
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                >
                  🗑️ Delete
                </button>
                <button
                  onClick={() => handleViewSubmissions(assignment.id)}
                  style={{
                    padding: '6px 12px',
                    background: selectedAssignmentId === assignment.id ? '#1e293b' : '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                >
                  {selectedAssignmentId === assignment.id ? 'Hide Submissions' : 'Submissions 🎯'}
                </button>
              </div>
            </div>

            {/* Submissions List & Grading UI */}
            {selectedAssignmentId === assignment.id && (
              <div
                style={{
                  marginTop: '16px',
                  background: '#f8fafc',
                  padding: '16px',
                  borderRadius: '8px',
                  borderTop: '2px solid #2563eb',
                }}
              >
                <h6 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#1e293b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Student Submissions
                </h6>

                {loadingSubmissions ? (
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Loading submissions...</p>
                ) : submissions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {submissions.map((sub) => (
                      <div
                        key={sub.id}
                        style={{
                          background: '#ffffff',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                            👤 {sub.User?.name || `Student ID: ${sub.user_id}`} <span style={{ color: '#64748b', fontWeight: 'normal' }}>({sub.User?.email})</span>
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              background: sub.status === 'GRADED' ? '#dcfce7' : '#fef3c7',
                              color: sub.status === 'GRADED' ? '#166534' : '#92400e',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontWeight: '700',
                            }}
                          >
                            {sub.status}
                          </span>
                        </div>

                        {sub.submission_url && (
                          <div style={{ fontSize: '13px', marginBottom: '6px' }}>
                            🔗 Link/URL:{' '}
                            <a href={sub.submission_url} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
                              {sub.submission_url}
                            </a>
                          </div>
                        )}

                        {sub.content && (
                          <div style={{ fontSize: '13px', background: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', marginBottom: '10px', color: '#334155' }}>
                            💬 Submission Text: {sub.content}
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <input
                            type="number"
                            placeholder="Marks"
                            defaultValue={sub.marks ?? ''}
                            onChange={(e) => setGradingMarks({ ...gradingMarks, [sub.id]: Number(e.target.value) })}
                            style={{
                              width: '80px',
                              padding: '6px 8px',
                              fontSize: '13px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              outline: 'none',
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Feedback (e.g. Good job!)"
                            defaultValue={sub.feedback ?? ''}
                            onChange={(e) => setGradingFeedback({ ...gradingFeedback, [sub.id]: e.target.value })}
                            style={{
                              flex: 1,
                              minWidth: '180px',
                              padding: '6px 10px',
                              fontSize: '13px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              outline: 'none',
                            }}
                          />
                          <button
                            onClick={() => handleGradeSubmission(sub.id)}
                            style={{
                              padding: '6px 14px',
                              background: '#16a34a',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                            }}
                          >
                            Save Grade
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>No submissions received for this assignment yet.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstructorAssignmentManager;