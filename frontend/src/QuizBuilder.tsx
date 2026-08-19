import React, { useEffect, useState } from 'react';
import API from './api';

interface OptionInput {
  id?: number;
  option_text: string;
  is_correct: boolean;
}

interface QuestionInput {
  id?: number;
  question: string;
  options: OptionInput[];
}

interface Quiz {
  id: number;
  title: string;
  questions: QuestionInput[];
}

interface QuizBuilderProps {
  sectionId: number;
  onQuizCreated?: () => void;
}

const QuizBuilder: React.FC<QuizBuilderProps> = ({ sectionId, onQuizCreated }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [editingQuizId, setEditingQuizId] = useState<number | null>(null);

  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<QuestionInput[]>([
    {
      question: '',
      options: [
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
      ],
    },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, [sectionId]);

  const fetchQuizzes = async () => {
    try {
      const res = await API.get(`/quizzes/section/${sectionId}`);
      setQuizzes(res.data.quizzes || []);
    } catch (err) {
      setQuizzes([]);
    }
  };

  const resetForm = () => {
    setTitle('');
    setEditingQuizId(null);
    setQuestions([
      {
        question: '',
        options: [
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
        ],
      },
    ]);
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        options: [
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
        ],
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) {
      alert('A quiz must have at least one question!');
      return;
    }
    setQuestions(questions.filter((_, idx) => idx !== index));
  };

  const handleQuestionChange = (qIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].question = text;
    setQuestions(updated);
  };

  const handleAddOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.push({ option_text: '', is_correct: false });
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex].option_text = text;
    setQuestions(updated);
  };

  const handleSelectCorrectOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.forEach((opt, idx) => {
      opt.is_correct = idx === oIndex;
    });
    setQuestions(updated);
  };

  // Populate form for Editing
  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuizId(quiz.id);
    setTitle(quiz.title);
    setQuestions(quiz.questions || []);
  };

  // Delete Quiz
  const handleDeleteQuiz = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await API.delete(`/quizzes/${id}`);
        alert('Quiz deleted successfully!');
        fetchQuizzes();
        if (onQuizCreated) onQuizCreated();
      } catch (err: any) {
        alert(err.response?.data?.error || 'Failed to delete quiz');
      }
    }
  };

  // Create or Update Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingQuizId) {
        await API.put(`/quizzes/${editingQuizId}`, {
          title,
          questions,
        });
        alert('Quiz updated successfully!');
      } else {
        await API.post('/quizzes', {
          section_id: sectionId,
          title,
          questions,
        });
        alert('Quiz created successfully!');
      }
      resetForm();
      fetchQuizzes();
      if (onQuizCreated) onQuizCreated();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        padding: '28px',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        marginTop: '20px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Existing Quizzes List */}
      {quizzes.length > 0 && (
        <div style={{ marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <h5 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.2px' }}>
              📋 Existing Quizzes
            </h5>
            <span
              style={{
                background: '#e0e7ff',
                color: '#4338ca',
                fontSize: '12px',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '12px',
              }}
            >
              {quizzes.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {quizzes.map((q) => (
              <div
                key={q.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f8fafc',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <strong style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{q.title}</strong>
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#64748b',
                      background: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                    }}
                  >
                    {q.questions?.length || 0} Questions
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEditQuiz(q)}
                    style={{
                      padding: '6px 12px',
                      background: '#fef3c7',
                      color: '#d97706',
                      border: '1px solid #fde68a',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'background 0.2s ease',
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteQuiz(q.id)}
                    style={{
                      padding: '6px 12px',
                      background: '#fef2f2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'background 0.2s ease',
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quiz Form (Create / Edit) */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.3px' }}>
          {editingQuizId ? '✏️ Edit Quiz' : '➕ Add New Quiz'}
        </h4>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
          {editingQuizId ? 'Update your quiz details and questions below.' : 'Create a new assessment for this course section.'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Quiz Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g., Chapter 1 Knowledge Check"
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            }}
          />
        </div>

        {questions.map((q, qIndex) => (
          <div
            key={qIndex}
            style={{
              border: '1px solid #e2e8f0',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '20px',
              backgroundColor: '#f8fafc',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#4338ca', color: '#ffffff', fontSize: '12px', fontWeight: '700', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {qIndex + 1}
                </span>
                <label style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>Question</label>
              </div>

              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(qIndex)}
                  style={{
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              )}
            </div>

            <input
              type="text"
              value={q.question}
              onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
              required
              placeholder="Enter the question text"
              style={{
                width: '100%',
                padding: '10px 14px',
                marginBottom: '16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#ffffff',
              }}
            />

            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              Options (Select radio for correct answer):
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {q.options.map((opt, oIndex) => (
                <div
                  key={oIndex}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: opt.is_correct ? '#f0fdf4' : '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: opt.is_correct ? '1px solid #86efac' : '1px solid #e2e8f0',
                  }}
                >
                  <input
                    type="radio"
                    name={`correct_${qIndex}`}
                    checked={opt.is_correct}
                    onChange={() => handleSelectCorrectOption(qIndex, oIndex)}
                    style={{ accentColor: '#16a34a', width: '16px', height: '16px', cursor: 'pointer' }}
                    required
                  />
                  <input
                    type="text"
                    value={opt.option_text}
                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                    required
                    placeholder={`Option ${oIndex + 1}`}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#ffffff',
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleAddOption(qIndex)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                color: '#334155',
              }}
            >
              + Add Option
            </button>
          </div>
        ))}

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' }}>
          <button
            type="button"
            onClick={handleAddQuestion}
            style={{
              padding: '10px 16px',
              cursor: 'pointer',
              background: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '13px',
            }}
          >
            + Add Another Question
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: editingQuizId ? '#2563eb' : '#16a34a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            {loading ? 'Saving...' : editingQuizId ? 'Update Quiz' : 'Save Quiz'}
          </button>

          {editingQuizId && (
            <button
              type="button"
              onClick={resetForm}
              style={{
                padding: '10px 16px',
                background: '#64748b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default QuizBuilder;