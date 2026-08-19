import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from './api';

interface Option {
  id: number;
  option_text: string;
}

interface Question {
  id: number;
  question: string;
  options: Option[];
}

interface Quiz {
  id: number;
  title: string;
  questions: Question[];
}

interface QuizPlayerProps {
  sectionId: number;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ sectionId }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [answers, setAnswers] = useState<{ [quizId: number]: { [questionId: number]: number } }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [results, setResults] = useState<{ [quizId: number]: { score: number; passed: boolean; correct_count: number; total: number } }>({});
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchQuizzes();
  }, [sectionId]);

  const fetchQuizzes = async () => {
    setLoading(true);
    setResults({});
    setAnswers({});
    try {
      const res = await API.get(`/quizzes/section/${sectionId}`);
      const fetchedQuizzes = res.data.quizzes || (res.data.quiz ? [res.data.quiz] : []);
      setQuizzes(fetchedQuizzes);
      setError('');
    } catch (err: any) {
      setError('No quizzes found for this section.');
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (quizId: number, questionId: number, optionId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [quizId]: {
        ...(prev[quizId] || {}),
        [questionId]: optionId,
      },
    }));
  };

  const handleSubmit = async (quizId: number) => {
    const quizAnswers = answers[quizId] || {};
    try {
      const res = await API.post('/quizzes/submit', {
        quiz_id: quizId,
        answers: quizAnswers,
      });
      setResults((prev) => ({
        ...prev,
        [quizId]: res.data,
      }));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit quiz');
    }
  };

  if (loading) {
    return (
      <div
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          padding: 32,
          marginTop: 24,
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '3px solid #e2e8f0',
            borderTopColor: '#4f46e5',
          }}
        />
        <p style={{ margin: 0, color: '#64748b', fontSize: 13.5, fontWeight: 500 }}>
          Loading section quizzes...
        </p>
      </div>
    );
  }

  if (error || quizzes.length === 0) {
    return (
      <div
        style={{
          padding: '16px 20px',
          marginTop: 24,
          borderRadius: 12,
          backgroundColor: '#f8fafc',
          border: '1px dashed #cbd5e1',
          color: '#64748b',
          fontSize: 13.5,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span>💡</span> {error || 'No quizzes found for this section.'}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 24 }}>
      {quizzes.map((quiz, qIdx) => {
        const quizResult = results[quiz.id];
        const currentAnswers = answers[quiz.id] || {};
        const totalQuestions = quiz.questions?.length || 0;
        const answeredCount = Object.keys(currentAnswers).length;
        const isSubmitDisabled = answeredCount === 0;

        return (
          <div
            key={quiz.id}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: 16,
              padding: 28,
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
                paddingBottom: 16,
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#4f46e5',
                    letterSpacing: '0.6px',
                    textTransform: 'uppercase',
                  }}
                >
                  Knowledge Check #{qIdx + 1}
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                  {quiz.title}
                </h3>
              </div>

              {!quizResult && (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#64748b',
                    background: '#f1f5f9',
                    padding: '4px 10px',
                    borderRadius: 20,
                  }}
                >
                  {answeredCount}/{totalQuestions} Answered
                </span>
              )}
            </div>

            <AnimatePresence mode="wait">
              {quizResult ? (
                <motion.div
                  key="result-view"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    padding: 24,
                    borderRadius: 14,
                    backgroundColor: quizResult.passed ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${quizResult.passed ? '#bbf7d0' : '#fecaca'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: 18,
                          fontWeight: 800,
                          color: quizResult.passed ? '#15803d' : '#991b1b',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        {quizResult.passed ? '🎉 Quiz Passed!' : '❌ Quiz Not Passed'}
                      </h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: 13.5, color: quizResult.passed ? '#166534' : '#991b1b' }}>
                        {quizResult.passed
                          ? 'Great job! You have demonstrated a solid understanding.'
                          : 'Review the material again and retry.'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 16, marginTop: 16, marginBottom: 20 }}>
                    <div style={{ background: '#ffffff', padding: '12px 20px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.06)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Final Score</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: quizResult.passed ? '#15803d' : '#dc2626' }}>{quizResult.score}%</div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '12px 20px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.06)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Correct Answers</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
                        {quizResult.correct_count} <span style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>/ {quizResult.total}</span>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      setResults((prev) => {
                        const copy = { ...prev };
                        delete copy[quiz.id];
                        return copy;
                      });
                    }}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: quizResult.passed ? '#166534' : '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: 13.5,
                      cursor: 'pointer',
                    }}
                  >
                    Retake Quiz
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div key="questions-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {quiz.questions?.map((q, idx) => (
                      <div key={q.id} style={{ textAlign: 'left' }}>
                        <p style={{ margin: '0 0 12px 0', fontSize: 14.5, fontWeight: 700, color: '#1e293b' }}>
                          <span style={{ color: '#4f46e5', marginRight: 6 }}>Q{idx + 1}.</span> {q.question}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {q.options?.map((opt) => {
                            const isSelected = currentAnswers[q.id] === opt.id;
                            return (
                              <label
                                key={opt.id}
                                onClick={() => handleOptionSelect(quiz.id, q.id, opt.id)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 12,
                                  padding: '12px 16px',
                                  borderRadius: 10,
                                  border: isSelected ? '1.5px solid #4f46e5' : '1px solid #e2e8f0',
                                  backgroundColor: isSelected ? '#f5f3ff' : '#ffffff',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  userSelect: 'none',
                                }}
                              >
                                <input
                                  type="radio"
                                  name={`q_${quiz.id}_${q.id}`}
                                  value={opt.id}
                                  checked={isSelected}
                                  onChange={() => handleOptionSelect(quiz.id, q.id, opt.id)}
                                  style={{ accentColor: '#4f46e5', width: 16, height: 16, cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: 13.5, fontWeight: isSelected ? 600 : 400, color: isSelected ? '#3730a3' : '#334155' }}>
                                  {opt.option_text}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                    <motion.button
                      whileHover={!isSubmitDisabled ? { scale: 1.01 } : {}}
                      whileTap={!isSubmitDisabled ? { scale: 0.99 } : {}}
                      onClick={() => handleSubmit(quiz.id)}
                      disabled={isSubmitDisabled}
                      style={{
                        padding: '11px 24px',
                        backgroundColor: isSubmitDisabled ? '#cbd5e1' : '#4f46e5',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 10,
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
                        boxShadow: isSubmitDisabled ? 'none' : '0 2px 8px rgba(79, 70, 229, 0.25)',
                      }}
                    >
                      Submit Quiz
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default QuizPlayer;