import React, { useState } from 'react';
import API from './api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await API.post('/auth/login', { email, password });

      sessionStorage.setItem('token', res.data.token);
      sessionStorage.setItem('role', res.data.user.role);
      sessionStorage.setItem('userName', res.data.user.name);

      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', fontFamily: "'Inter', sans-serif", backgroundColor: '#FAF8F3', color: '#201F1C' }}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');`}
      </style>

      {/* Left Form Section */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px 24px',
          backgroundColor: '#FAF8F3',
          borderRight: '1px solid #E4DFD1',
        }}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          
          {/* Brand Logo Header */}
          <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', backgroundColor: '#2B4A3E', borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#FAF8F3' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <span style={{ fontSize: '22px', fontWeight: '700', color: '#201F1C', fontFamily: "'Fraunces', serif" }}>
              EduFlow
            </span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: '28px', paddingBottom: '16px', borderBottom: '1px solid #E4DFD1' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
              SECURE PORTAL INTAKE
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#201F1C', margin: '0 0 6px 0', fontFamily: "'Fraunces', serif" }}>
              Welcome Back
            </h1>
            <p style={{ color: '#6B6558', fontSize: '13.5px', margin: 0, lineHeight: 1.5 }}>
              Log in to your account to continue your learning journey.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#FBEAE3',
                border: '1px solid #B5482F',
                borderRadius: '7px',
                color: '#B5482F',
                fontSize: '12.5px',
                marginBottom: '24px',
                fontFamily: "'IBM Plex Mono', monospace",
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form Container with Intake Dashed Border */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px dashed #D2CBB8',
            borderRadius: '10px',
            padding: '24px',
            position: 'relative'
          }}>
            <form onSubmit={handleLogin}>
              {/* Email Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#A39C8C', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.05em', marginBottom: '6px' }}>
                  Email address
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#A39C8C', display: 'flex', alignItems: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={email}
                    placeholder="name@company.com"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '7px',
                      border: '1px solid #E4DFD1',
                      backgroundColor: '#FAF8F3',
                      fontSize: '13.5px',
                      color: '#201F1C',
                      fontFamily: "'Inter', sans-serif",
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#A39C8C', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.05em' }}>
                    Password
                  </label>
                  <a href="#forgot" style={{ fontSize: '11px', fontWeight: 600, color: '#2B4A3E', textDecoration: 'none', fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.03em' }}>
                    Forgot Password?
                  </a>
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#A39C8C', display: 'flex', alignItems: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    type="password"
                    value={password}
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '7px',
                      border: '1px solid #E4DFD1',
                      backgroundColor: '#FAF8F3',
                      fontSize: '13.5px',
                      color: '#201F1C',
                      fontFamily: "'Inter', sans-serif",
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  backgroundColor: '#2B4A3E',
                  color: '#FAF8F3',
                  border: 'none',
                  borderRadius: '7px',
                  fontWeight: '600',
                  fontSize: '13.5px',
                  fontFamily: "'Inter', sans-serif",
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {loading ? 'Authenticating...' : 'Log In →'}
              </button>
            </form>
          </div>

          {/* Register Link */}
          <p style={{ marginTop: '28px', textAlign: 'center', fontSize: '13px', color: '#6B6558' }}>
            Don't have an account?{' '}
            <a href="/register" style={{ color: '#2B4A3E', fontWeight: '600', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              Register here
            </a>
          </p>
        </div>
      </div>

      {/* Right Ledger Image Banner Section */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px',
          backgroundImage: 'url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        {/* Paper-tint Overlay with border frame */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(32, 31, 28, 0.4)',
            backdropFilter: 'contrast(105%)',
          }}
        />

        {/* Top Ledger Strip Badge */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'flex-start' }}>
          <span style={{ 
            backgroundColor: '#FAF8F3', 
            color: '#201F1C', 
            border: '1px solid #E4DFD1', 
            padding: '6px 12px', 
            borderRadius: '6px', 
            fontSize: '11px', 
            fontWeight: '600', 
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: '0.05em'
          }}>
            ACADEMIC CATALOG & SCHOLASTIC SYSTEM
          </span>
        </div>

        {/* Floating Ledger Card with Stamp Badge */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            backgroundColor: '#FFFFFF',
            padding: '28px',
            borderRadius: '10px',
            border: '1px solid #E4DFD1',
            borderTop: '3px solid #2B4A3E',
            maxWidth: '440px',
            boxShadow: '0 12px 28px -8px rgba(32,31,28,0.18)'
          }}
        >
          {/* Stamp Badge */}
          <div style={{ 
            position: 'absolute', 
            top: '20px', 
            right: '20px', 
            transform: 'rotate(28deg)', 
            backgroundColor: '#E7EEE9', 
            color: '#2B4A3E', 
            border: '1.5px solid #2B4A3E', 
            padding: '2px 8px', 
            borderRadius: '4px', 
            fontFamily: "'IBM Plex Mono', monospace", 
            fontSize: '10px', 
            fontWeight: 600, 
            textTransform: 'uppercase', 
            letterSpacing: '0.08em', 
            zIndex: 3,
            pointerEvents: 'none'
          }}>
            VERIFIED
          </div>

          <h3 style={{ margin: '0 0 10px 0', color: '#201F1C', fontSize: '22px', fontWeight: '600', lineHeight: 1.3, fontFamily: "'Fraunces', serif" }}>
            "Unlock your potential with EduFlow"
          </h3>
          <p style={{ margin: 0, color: '#6B6558', fontSize: '12px', fontWeight: '500', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            — THE MODERN LEARNING ECOSYSTEM
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;