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
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '15px' }}>
      
      {/* Existing Quizzes List */}
      {quizzes.length > 0 && (
        <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #eee' }}>
          <h5 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>📋 Existing Quizzes ({quizzes.length})</h5>
          {quizzes.map((q) => (
            <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px', borderRadius: '6px', marginBottom: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <strong style={{ fontSize: '14px', color: '#1e293b' }}>{q.title}</strong>
                <span style={{ marginLeft: '10px', fontSize: '12px', color: '#64748b' }}>({q.questions?.length || 0} Questions)</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => handleEditQuiz(q)} style={{ padding: '4px 8px', background: '#f39c12', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}>
                  ✏️ Edit
                </button>
                <button onClick={() => handleDeleteQuiz(q.id)} style={{ padding: '4px 8px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quiz Form (Create / Edit) */}
      <h4>{editingQuizId ? '✏️ Edit Quiz' : '➕ Add New Quiz'}</h4>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Quiz Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g., Chapter 1 Knowledge Check"
            style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
          />
        </div>

        {questions.map((q, qIndex) => (
          <div key={qIndex} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '6px', marginBottom: '15px', backgroundColor: '#fafafa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontWeight: 'bold' }}>Question #{qIndex + 1}:</label>
              {questions.length > 1 && (
                <button type="button" onClick={() => handleRemoveQuestion(qIndex)} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '3px', padding: '2px 6px', fontSize: '11px', cursor: 'pointer' }}>
                  Remove Question
                </button>
              )}
            </div>
            <input
              type="text"
              value={q.question}
              onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
              required
              placeholder="Enter the question text"
              style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
            />

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>
              Options (Select radio for correct answer):
            </label>
            {q.options.map((opt, oIndex) => (
              <div key={oIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <input
                  type="radio"
                  name={`correct_${qIndex}`}
                  checked={opt.is_correct}
                  onChange={() => handleSelectCorrectOption(qIndex, oIndex)}
                  style={{ marginRight: '10px' }}
                  required
                />
                <input
                  type="text"
                  value={opt.option_text}
                  onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                  required
                  placeholder={`Option ${oIndex + 1}`}
                  style={{ flex: 1, padding: '6px' }}
                />
              </div>
            ))}
            <button type="button" onClick={() => handleAddOption(qIndex)} style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>
              + Add Option
            </button>
          </div>
        ))}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={handleAddQuestion} style={{ padding: '8px 12px', cursor: 'pointer' }}>
            + Add Another Question
          </button>
          <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: editingQuizId ? '#2980b9' : '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {loading ? 'Saving...' : editingQuizId ? 'Update Quiz' : 'Save Quiz'}
          </button>
          {editingQuizId && (
            <button type="button" onClick={resetForm} style={{ padding: '8px 16px', background: '#7f8c8d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default QuizBuilder;