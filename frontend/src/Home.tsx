import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", color: '#1e293b', backgroundColor: '#fff', minHeight: '100vh' }}>
      
      {/* 1. TOP NAVIGATION BAR */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 8%',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #f1f5f9'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: '28px', height: '28px', backgroundColor: '#4f46e5', borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontWeight: 'bold' }}>
            🎓
          </div>
          <span style={{ fontSize: '22px', fontWeight: '800', color: '#1e1b4b', letterSpacing: '-0.5px' }}>EduFlow</span>
        </div>

        {/* Right Navigation Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={() => navigate('/login')}
            style={{ background: 'none', border: 'none', fontSize: '15px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
            Log in
          </button>
          <button 
            onClick={() => navigate('/register')}
            style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section style={{ padding: '60px 8% 80px', backgroundColor: '#faf5ff', backgroundImage: 'radial-gradient(at 0% 0%, rgba(238, 242, 255, 0.8) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(243, 232, 255, 0.5) 0px, transparent 50%)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '40px', justifyContent: 'space-between' }}>
          
          {/* Left Text Column */}
          <div style={{ flex: '1 1 500px', maxWidth: '600px' }}>
            <span style={{ backgroundColor: '#e0e7ff', color: '#4338ca', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', display: 'inline-block', marginBottom: '20px' }}>
              New: Advanced AI Courses Added
            </span>
            
            <h1 style={{ fontSize: '48px', fontWeight: '800', lineHeight: '1.15', color: '#0f172a', marginBottom: '20px', letterSpacing: '-1px' }}>
              Master Your Future with <span style={{ color: '#4f46e5' }}>EduFlow</span>
            </h1>

            <p style={{ fontSize: '18px', color: '#64748b', lineHeight: '1.6', marginBottom: '32px' }}>
              Experience a new era of personalized, interactive learning. Gain high-demand skills from world-class instructors in an environment designed for your success.
            </p>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '40px' }}>
              <button 
                onClick={() => navigate('/register')}
                style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)' }}>
                Start Learning for Free →
              </button>
              <button 
                onClick={() => navigate('/login')}
                style={{ backgroundColor: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', padding: '14px 28px', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
                Browse Catalog
              </button>
            </div>

            {/* Social Proof Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', border: '2px solid #fff', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>👩‍💻</div>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e2e8f0', border: '2px solid #fff', marginLeft: '-10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>👨‍💼</div>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#cbd5e1', border: '2px solid #fff', marginLeft: '-10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>👩‍🔬</div>
              </div>
              <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                Join <strong style={{ color: '#0f172a' }}>10,000+</strong> active learners
              </span>
            </div>
          </div>

          {/* Right Hero Image Column */}
          <div style={{ flex: '1 1 450px', position: 'relative' }}>
            <div style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop" 
                alt="Students learning together" 
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
            
            {/* Floating Card Overlay */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              right: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              padding: '16px 20px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px' }}>
                🏆
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Course Completed</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '700' }}>Data Science Fundamentals</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section style={{ padding: '80px 8%', backgroundColor: '#ffffff', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
          Why Learn with EduFlow?
        </h2>
        <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '600px', margin: '0 auto 50px' }}>
          We combine cutting-edge technology with pedagogical excellence to deliver an unmatched learning experience.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          {/* Card 1 */}
          <div style={{ backgroundColor: '#f8fafc', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#6366f1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px', marginBottom: '20px' }}>
              🎓
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '10px' }}>Expert-Led Courses</h3>
            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              Learn directly from industry leaders and academic professionals who bring real-world experience to every lesson.
            </p>
          </div>

          {/* Card 2 */}
          <div style={{ backgroundColor: '#f8fafc', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#10b981', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px', marginBottom: '20px' }}>
              💻
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '10px' }}>Interactive Learning</h3>
            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              Engage with dynamic content, hands-on projects, and real-time feedback designed to ensure deep comprehension.
            </p>
          </div>

          {/* Card 3 */}
          <div style={{ backgroundColor: '#f8fafc', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#8b5cf6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px', marginBottom: '20px' }}>
              🌐
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '10px' }}>Global Certification</h3>
            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              Earn universally recognized certificates that validate your skills and accelerate your career on a global scale.
            </p>
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '50px 8% 30px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '40px', marginBottom: '40px' }}>
          
          <div style={{ maxWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '20px' }}>🎓</span>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>EduFlow</span>
            </div>
            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>
              Empowering learners worldwide through accessible, high-quality education.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '60px', flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Platform</h4>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '8px 0', cursor: 'pointer' }}>About Us</p>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '8px 0', cursor: 'pointer' }}>Careers</p>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '8px 0', cursor: 'pointer' }}>Contact</p>
            </div>

            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Legal</h4>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '8px 0', cursor: 'pointer' }}>Privacy Policy</p>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '8px 0', cursor: 'pointer' }}>Terms of Service</p>
            </div>

            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Support</h4>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '8px 0', cursor: 'pointer' }}>Help Center</p>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '8px 0', cursor: 'pointer' }}>Community</p>
            </div>
          </div>

        </div>

        <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '13px' }}>
          © 2026 EduFlow LMS. Empowering learners worldwide.
        </div>
      </footer>

    </div>
  );
};

export default Home;