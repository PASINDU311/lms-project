import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#201F1C', backgroundColor: '#FAF8F3', minHeight: '100vh', paddingBottom: '40px' }}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');`}
      </style>

      {/* 1. TOP NAVIGATION BAR */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 8%',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E4DFD1'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: '28px', height: '28px', backgroundColor: '#2B4A3E', borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#FAF8F3' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <span style={{ fontSize: '20px', fontWeight: '700', color: '#201F1C', fontFamily: "'Fraunces', serif" }}>EduFlow</span>
        </div>

        {/* Right Navigation Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => navigate('/login')}
            style={{ 
              background: 'transparent', 
              border: '1px solid #2B4A3E', 
              color: '#2B4A3E',
              padding: '8px 16px',
              borderRadius: '7px',
              fontSize: '13px', 
              fontWeight: '600', 
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif"
            }}>
            Log in
          </button>
          <button 
            onClick={() => navigate('/register')}
            style={{ 
              backgroundColor: '#2B4A3E', 
              color: '#FAF8F3', 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: '7px', 
              fontSize: '13px', 
              fontWeight: '600', 
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif"
            }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section style={{ padding: '60px 8% 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', gap: '32px', justifyContent: 'space-between' }}>
          
          {/* Left Text Column */}
          <div style={{ flex: '1 1 500px', maxWidth: '600px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ 
              backgroundColor: '#FBF1DA', 
              color: '#B98A1E', 
              border: '1px solid #B98A1E', 
              padding: '4px 10px', 
              borderRadius: '4px', 
              fontSize: '11px', 
              fontWeight: '600', 
              display: 'inline-block', 
              marginBottom: '20px',
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: '0.05em',
              width: 'fit-content'
            }}>
              CATALOG UPDATE: ADVANCED AI COURSES
            </span>
            
            <h1 style={{ fontSize: '42px', fontWeight: '600', lineHeight: '1.15', color: '#201F1C', fontFamily: "'Fraunces', serif", marginBottom: '20px' }}>
              Master Your Future with EduFlow
            </h1>

            <p style={{ fontSize: '15.5px', color: '#6B6558', lineHeight: '1.6', marginBottom: '32px' }}>
              Experience a new era of personalized, interactive learning. Gain high-demand skills from world-class instructors in an environment designed for your success.
            </p>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '32px' }}>
              <button 
                onClick={() => navigate('/register')}
                style={{ 
                  backgroundColor: '#2B4A3E', 
                  color: '#FAF8F3', 
                  border: 'none', 
                  padding: '12px 22px', 
                  borderRadius: '7px', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif"
                }}>
                Start Learning for Free →
              </button>
              <button 
                onClick={() => navigate('/login')}
                style={{ 
                  backgroundColor: 'transparent', 
                  color: '#2B4A3E', 
                  border: '1px solid #2B4A3E', 
                  padding: '12px 22px', 
                  borderRadius: '7px', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif"
                }}>
                Browse Catalog
              </button>
            </div>

            {/* Social Proof Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '16px', borderTop: '1px dashed #D2CBB8' }}>
              <div style={{ display: 'flex' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#E7EEE9', border: '1px solid #2B4A3E', color: '#2B4A3E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>01</div>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#E9EFF3', border: '1px solid #3D5A73', color: '#3D5A73', marginLeft: '-8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>02</div>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#FBF1DA', border: '1px solid #B98A1E', color: '#B98A1E', marginLeft: '-8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>03</div>
              </div>
              <span style={{ fontSize: '12px', color: '#6B6558', fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.03em' }}>
                JOIN <strong style={{ color: '#201F1C' }}>10,000+</strong> REGISTERED LEARNERS
              </span>
            </div>
          </div>

          {/* Right Hero Image Column */}
          <div style={{ flex: '1 1 420px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
              position: 'relative',
              backgroundColor: '#FFFFFF', 
              borderRadius: '10px', 
              overflow: 'hidden', 
              border: '1px solid #E4DFD1', 
              borderTop: '3px solid #2B4A3E',
              padding: '12px'
            }}>
              {/* Stamp Badge */}
              <div style={{ 
                position: 'absolute', 
                top: '24px', 
                right: '24px', 
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
                zIndex: 2,
                pointerEvents: 'none'
              }}>
                ACTIVE SESSION
              </div>

              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop" 
                alt="Students learning together" 
                style={{ width: '100%', height: 'auto', borderRadius: '6px', filter: 'grayscale(15%) contrast(95%)', display: 'block' }}
              />

              {/* Floating Card Overlay */}
              <div style={{
                marginTop: '12px',
                backgroundColor: '#FAF8F3',
                border: '1.5px dashed #D2CBB8',
                padding: '12px 16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ width: '32px', height: '32px', border: '1px solid #2B4A3E', color: '#2B4A3E', backgroundColor: '#E7EEE9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                    <path d="M4 22h16"/>
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
                  </svg>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '10px', color: '#A39C8C', fontWeight: '600', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    COURSE COMPLETED
                  </p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '13.5px', color: '#201F1C', fontWeight: '600', fontFamily: "'Inter', sans-serif" }}>
                    Data Science Fundamentals
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* REPORT-CARD STRIP METRICS */}
      <section style={{ padding: '0 8%', maxWidth: '1200px', margin: '20px auto 60px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E4DFD1',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '20px', borderRight: '1px solid #E4DFD1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              ENROLLED STUDENTS
            </span>
            <div style={{ fontSize: '28px', fontWeight: 600, color: '#201F1C', fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.1 }}>
              10,480
            </div>
          </div>

          <div style={{ padding: '20px', borderRight: '1px solid #E4DFD1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              VERIFIED COURSES
            </span>
            <div style={{ fontSize: '28px', fontWeight: 600, color: '#2B4A3E', fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.1 }}>
              320+
            </div>
          </div>

          <div style={{ padding: '20px', borderRight: '1px solid #E4DFD1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              COMPLETION RATE
            </span>
            <div style={{ fontSize: '28px', fontWeight: 600, color: '#3D5A73', fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.1 }}>
              94.2%
            </div>
          </div>

          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              GLOBAL INSTRUCTORS
            </span>
            <div style={{ fontSize: '28px', fontWeight: 600, color: '#B98A1E', fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.1 }}>
              145
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section style={{ padding: '0 8%', maxWidth: '1200px', margin: '0 auto 60px' }}>
        <div style={{ borderBottom: '1px solid #E4DFD1', paddingBottom: '16px', marginBottom: '32px' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
            PLATFORM CAPABILITIES
          </span>
          <h2 style={{ fontSize: '28px', fontWeight: '600', color: '#201F1C', fontFamily: "'Fraunces', serif", margin: 0 }}>
            Why Learn with EduFlow?
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {/* Card 1 */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '10px', border: '1px solid #E4DFD1', borderTop: '3px solid #2B4A3E', textAlign: 'left' }}>
            <div style={{ width: '36px', height: '36px', border: '1px solid #2B4A3E', color: '#2B4A3E', backgroundColor: '#E7EEE9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#201F1C', fontFamily: "'Fraunces', serif", marginBottom: '8px' }}>Expert-Led Courses</h3>
            <p style={{ color: '#6B6558', fontSize: '13.5px', lineHeight: '1.6', margin: 0 }}>
              Learn directly from industry leaders and academic professionals who bring real-world experience to every lesson.
            </p>
          </div>

          {/* Card 2 */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '10px', border: '1px solid #E4DFD1', borderTop: '3px solid #3D5A73', textAlign: 'left' }}>
            <div style={{ width: '36px', height: '36px', border: '1px solid #3D5A73', color: '#3D5A73', backgroundColor: '#E9EFF3', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#201F1C', fontFamily: "'Fraunces', serif", marginBottom: '8px' }}>Interactive Learning</h3>
            <p style={{ color: '#6B6558', fontSize: '13.5px', lineHeight: '1.6', margin: 0 }}>
              Engage with dynamic content, hands-on projects, and real-time feedback designed to ensure deep comprehension.
            </p>
          </div>

          {/* Card 3 */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '10px', border: '1px solid #E4DFD1', borderTop: '3px solid #B98A1E', textAlign: 'left' }}>
            <div style={{ width: '36px', height: '36px', border: '1px solid #B98A1E', color: '#B98A1E', backgroundColor: '#FBF1DA', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#201F1C', fontFamily: "'Fraunces', serif", marginBottom: '8px' }}>Global Certification</h3>
            <p style={{ color: '#6B6558', fontSize: '13.5px', lineHeight: '1.6', margin: 0 }}>
              Earn universally recognized certificates that validate your skills and accelerate your career on a global scale.
            </p>
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E4DFD1', padding: '40px 8% 24px', maxWidth: '1200px', margin: '0 auto', borderRadius: '10px', border: '1px solid #E4DFD1' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '40px', marginBottom: '32px' }}>
          
          <div style={{ maxWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ width: '22px', height: '22px', backgroundColor: '#2B4A3E', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#FAF8F3' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#201F1C', fontFamily: "'Fraunces', serif" }}>EduFlow</span>
            </div>
            <p style={{ color: '#6B6558', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
              Empowering learners worldwide through accessible, high-quality education.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ fontSize: '11px', fontWeight: '600', color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Platform</h4>
              <p style={{ fontSize: '13px', color: '#6B6558', margin: '6px 0', cursor: 'pointer' }}>About Us</p>
              <p style={{ fontSize: '13px', color: '#6B6558', margin: '6px 0', cursor: 'pointer' }}>Careers</p>
              <p style={{ fontSize: '13px', color: '#6B6558', margin: '6px 0', cursor: 'pointer' }}>Contact</p>
            </div>

            <div>
              <h4 style={{ fontSize: '11px', fontWeight: '600', color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Legal</h4>
              <p style={{ fontSize: '13px', color: '#6B6558', margin: '6px 0', cursor: 'pointer' }}>Privacy Policy</p>
              <p style={{ fontSize: '13px', color: '#6B6558', margin: '6px 0', cursor: 'pointer' }}>Terms of Service</p>
            </div>

            <div>
              <h4 style={{ fontSize: '11px', fontWeight: '600', color: '#A39C8C', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Support</h4>
              <p style={{ fontSize: '13px', color: '#6B6558', margin: '6px 0', cursor: 'pointer' }}>Help Center</p>
              <p style={{ fontSize: '13px', color: '#6B6558', margin: '6px 0', cursor: 'pointer' }}>Community</p>
            </div>
          </div>

        </div>

        <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: '1px solid #E4DFD1', color: '#A39C8C', fontSize: '11px', fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.03em' }}>
          © 2026 EDUFLOW LMS. ALL RIGHTS RESERVED.
        </div>
      </footer>

    </div>
  );
};

export default Home;