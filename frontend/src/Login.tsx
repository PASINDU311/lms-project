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
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Left Form Section */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px 24px',
          background: '#ffffff',
        }}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* Brand Logo */}
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#4338ca', letterSpacing: '-0.5px', margin: 0 }}>
              EduFlow
            </h1>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>
              Welcome Back
            </h2>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
              Log in to your account to continue your learning journey.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              style={{
                padding: '12px 16px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '13px',
                marginBottom: '20px',
              }}
            >
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            {/* Email Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '16px' }}>
                  ✉
                </span>
                <input
                  type="email"
                  value={email}
                  placeholder="name@company.com"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                  Password
                </label>
                <a href="#forgot" style={{ fontSize: '12px', fontWeight: '600', color: '#4338ca', textDecoration: 'none' }}>
                  Forgot Password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '16px' }}>
                  🔒
                </span>
                <input
                  type="password"
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
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
                padding: '12px',
                background: '#4338ca',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(67, 56, 202, 0.2)',
              }}
            >
              {loading ? 'Logging in...' : 'Login →'}
            </button>
          </form>

          {/* Register Link */}
          <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
            Don't have an account?{' '}
            <a href="/register" style={{ color: '#4338ca', fontWeight: '600', textDecoration: 'none' }}>
              Register here
            </a>
          </p>
        </div>
      </div>

      {/* Right Image Banner Section */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '48px',
          backgroundImage: 'url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        {/* Dark Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.5), transparent)',
          }}
        />

        {/* Floating Quote Card */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            padding: '28px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            maxWidth: '440px',
          }}
        >
          <h3 style={{ margin: '0 0 12px 0', color: '#ffffff', fontSize: '20px', fontWeight: '700', lineHeight: 1.4 }}>
            "Unlock your potential with EduFlow"
          </h3>
          <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.85)', fontSize: '13px', fontWeight: '500' }}>
            — The Modern Learning Ecosystem
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;