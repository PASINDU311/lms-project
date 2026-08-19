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

  // Cycling accent colors for top border rules
  const cardAccentColors = ['#2B4A3E', '#3D5A73', '#B98A1E', '#B5482F'];

  if (loading) {
    return (
      <div
        style={{
          border: '1.5px dashed #D2CBB8',
          borderRadius: 10,
          padding: 32,
          marginTop: 24,
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        <style>
          {`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');`}
        </style>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: '2px solid #E4DFD1',
            borderTopColor: '#2B4A3E',
          }}
        />
        <p
          style={{
            margin: 0,
            color: '#6B6558',
            fontSize: 12,
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          Loading section quizzes...
        </p>
      </div>
    );
  }

  if (error || quizzes.length === 0) {
    return (
      <div
        style={{
          padding: '20px 24px',
          marginTop: 24,
          borderRadius: 10,
          backgroundColor: '#FFFFFF',
          border: '1.5px dashed #D2CBB8',
          color: '#6B6558',
          fontSize: 13.5,
          fontFamily: "'Inter', sans-serif",
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <style>
          {`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');`}
        </style>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#A39C8C"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>{error || 'No quizzes found for this section.'}</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 24 }}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');`}
      </style>
      {quizzes.map((quiz, qIdx) => {
        const quizResult = results[quiz.id];
        const currentAnswers = answers[quiz.id] || {};
        const totalQuestions = quiz.questions?.length || 0;
        const answeredCount = Object.keys(currentAnswers).length;
        const isSubmitDisabled = answeredCount === 0;
        const accentColor = cardAccentColors[qIdx % cardAccentColors.length];

        return (
          <div
            key={quiz.id}
            style={{
              border: '1px solid #E4DFD1',
              borderTop: `3px solid ${accentColor}`,
              borderRadius: 10,
              padding: 28,
              backgroundColor: '#FFFFFF',
              position: 'relative',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {/* Library Stamp Badge for Quiz Results */}
            {quizResult && (
              <div
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '20px',
                  transform: 'rotate(28deg)',
                  backgroundColor: quizResult.passed ? '#E7EEE9' : '#FBEAE3',
                  color: quizResult.passed ? '#2B4A3E' : '#B5482F',
                  border: `1.5px solid ${quizResult.passed ? '#2B4A3E' : '#B5482F'}`,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '10px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              >
                {quizResult.passed ? 'PASSED' : 'FAILED'}
              </div>
            )}

            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
                paddingBottom: 16,
                borderBottom: '1px solid #E4DFD1',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#A39C8C',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >
                  KNOWLEDGE CHECK #{String(qIdx + 1).padStart(2, '0')}
                </span>
                <h3
                  style={{
                    margin: '4px 0 0 0',
                    fontSize: 20,
                    fontWeight: 600,
                    color: '#201F1C',
                    fontFamily: "'Fraunces', serif",
                  }}
                >
                  {quiz.title}
                </h3>
              </div>

              {!quizResult && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#6B6558',
                    background: '#FAF8F3',
                    border: '1px solid #E4DFD1',
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontFamily: "'IBM Plex Mono', monospace",
                    letterSpacing: '0.05em',
                  }}
                >
                  {answeredCount}/{totalQuestions} ANSWERED
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
                    borderRadius: 8,
                    backgroundColor: quizResult.passed ? '#E7EEE9' : '#FBEAE3',
                    border: `1px solid ${quizResult.passed ? '#2B4A3E' : '#B5482F'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: 18,
                          fontWeight: 600,
                          fontFamily: "'Fraunces', serif",
                          color: quizResult.passed ? '#2B4A3E' : '#B5482F',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        {quizResult.passed ? 'Assessment Passed' : 'Assessment Unsatisfactory'}
                      </h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: 13.5, color: quizResult.passed ? '#2B4A3E' : '#B5482F' }}>
                        {quizResult.passed
                          ? 'You have demonstrated a solid understanding of this subject.'
                          : 'Review the section material and re-attempt the assessment.'}
                      </p>
                    </div>
                  </div>

                  {/* Single Report-Card Strip for Results */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E4DFD1',
                      borderRadius: 8,
                      marginTop: 16,
                      marginBottom: 20,
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ padding: '12px 16px', borderRight: '1px solid #E4DFD1' }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#A39C8C', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.05em' }}>
                        FINAL SCORE
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 600, color: quizResult.passed ? '#2B4A3E' : '#B5482F', fontFamily: "'IBM Plex Mono', monospace" }}>
                        {quizResult.score}%
                      </div>
                    </div>
                    <div style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#A39C8C', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.05em' }}>
                        CORRECT ANSWERS
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 600, color: '#201F1C', fontFamily: "'IBM Plex Mono', monospace" }}>
                        {quizResult.correct_count} <span style={{ fontSize: 13, color: '#A39C8C', fontWeight: 400 }}>/ {quizResult.total}</span>
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
                      padding: '9px 18px',
                      backgroundColor: quizResult.passed ? '#2B4A3E' : '#B5482F',
                      color: '#FAF8F3',
                      border: 'none',
                      borderRadius: 7,
                      fontWeight: 600,
                      fontSize: 13,
                      fontFamily: "'Inter', sans-serif",
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.5 2v6h-6" />
                      <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                    </svg>
                    Retake Assessment
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div key="questions-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {quiz.questions?.map((q, idx) => (
                      <div key={q.id} style={{ textAlign: 'left' }}>
                        <p style={{ margin: '0 0 12px 0', fontSize: 14.5, fontWeight: 600, color: '#201F1C' }}>
                          <span style={{ color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", marginRight: 6 }}>
                            Q{String(idx + 1).padStart(2, '0')}.
                          </span>
                          {q.question}
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
                                  borderRadius: 7,
                                  border: isSelected ? '1.5px solid #2B4A3E' : '1px solid #E4DFD1',
                                  backgroundColor: isSelected ? '#E7EEE9' : '#FFFFFF',
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
                                  style={{ accentColor: '#2B4A3E', width: 16, height: 16, cursor: 'pointer' }}
                                />
                                <span
                                  style={{
                                    fontSize: 13.5,
                                    fontWeight: isSelected ? 600 : 400,
                                    color: isSelected ? '#2B4A3E' : '#201F1C',
                                  }}
                                >
                                  {opt.option_text}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #E4DFD1', display: 'flex', justifyContent: 'flex-end' }}>
                    <motion.button
                      whileHover={!isSubmitDisabled ? { scale: 1.01 } : {}}
                      whileTap={!isSubmitDisabled ? { scale: 0.99 } : {}}
                      onClick={() => handleSubmit(quiz.id)}
                      disabled={isSubmitDisabled}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: isSubmitDisabled ? '#E4DFD1' : '#2B4A3E',
                        color: isSubmitDisabled ? '#A39C8C' : '#FAF8F3',
                        border: 'none',
                        borderRadius: 7,
                        fontWeight: 600,
                        fontSize: 13.5,
                        fontFamily: "'Inter', sans-serif",
                        cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <span>Submit Answers</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
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