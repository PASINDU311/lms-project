import React, { useRef } from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface CertificateProps {
  studentName: string;
  courseTitle: string;
  completionDate: string;
  onClose: () => void;
}

const Certificate: React.FC<CertificateProps> = ({
  studentName,
  courseTitle,
  completionDate,
  onClose,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = () => {
    const element = certificateRef.current;
    if (!element) return;

    const opt = {
      margin: 0,
      filename: `${studentName}_${courseTitle}_Certificate.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' as const },
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: 20,
        boxSizing: 'border-box',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Action Buttons Toolbar */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          marginBottom: 20,
          display: 'flex',
          gap: 12,
          backgroundColor: '#ffffff',
          padding: '8px 16px',
          borderRadius: 40,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        }}
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleDownloadPDF}
          style={{
            padding: '9px 18px',
            backgroundColor: '#059669',
            color: '#ffffff',
            border: 'none',
            borderRadius: 20,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 13.5,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)',
          }}
        >
          <span>📥</span> Download PDF
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onClose}
          style={{
            padding: '9px 18px',
            backgroundColor: '#f1f5f9',
            color: '#475569',
            border: '1px solid #cbd5e1',
            borderRadius: 20,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 13.5,
          }}
        >
          Close
        </motion.button>
      </motion.div>

      {/* Certificate Printable Canvas */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15 }}
        ref={certificateRef}
        style={{
          width: '800px',
          height: '550px',
          padding: '24px',
          backgroundColor: '#ffffff',
          border: '12px solid #0f172a',
          outline: '3px solid #d97706',
          textAlign: 'center',
          boxSizing: 'border-box',
          position: 'relative',
          color: '#0f172a',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div
          style={{
            border: '2px solid #e2e8f0',
            height: '100%',
            padding: '30px 40px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          }}
        >
          {/* Header Badge & Title */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '3px',
                color: '#d97706',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Official Certification
            </div>
            <h1
              style={{
                fontSize: 34,
                margin: 0,
                textTransform: 'uppercase',
                color: '#0f172a',
                fontFamily: "'Playfair Display', Georgia, serif",
                letterSpacing: '1px',
                fontWeight: 700,
              }}
            >
              Certificate of Completion
            </h1>
            <div
              style={{
                width: 60,
                height: 3,
                backgroundColor: '#d97706',
                margin: '12px auto 0 auto',
                borderRadius: 2,
              }}
            />
          </div>

          {/* Student Name */}
          <div style={{ width: '100%' }}>
            <p style={{ fontSize: 14, margin: '0 0 6px 0', color: '#64748b', fontStyle: 'italic' }}>
              This is proudly presented to
            </p>
            <h2
              style={{
                fontSize: 30,
                margin: '0 auto',
                color: '#1e293b',
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 700,
                borderBottom: '1px solid #cbd5e1',
                paddingBottom: 8,
                width: '75%',
              }}
            >
              {studentName}
            </h2>
          </div>

          {/* Course Details */}
          <div>
            <p style={{ fontSize: 13.5, margin: '0 0 6px 0', color: '#64748b' }}>
              for successfully completing the online course:
            </p>
            <h3 style={{ fontSize: 22, margin: 0, color: '#2563eb', fontWeight: 700 }}>
              {courseTitle}
            </h3>
          </div>

          {/* Footer Signatures */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              width: '80%',
              fontSize: 13,
            }}
          >
            <div style={{ textAlign: 'center', width: 180 }}>
              <p style={{ margin: '0 0 4px 0', fontWeight: 700, color: '#1e293b' }}>{completionDate}</p>
              <p style={{ margin: 0, borderTop: '1px solid #cbd5e1', paddingTop: 6, color: '#64748b', fontSize: 12 }}>
                Date Issued
              </p>
            </div>

            {/* Emblem Watermark Placeholder */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: '#fef3c7',
                border: '2px solid #f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}
            >
              🎓
            </div>

            <div style={{ textAlign: 'center', width: 180 }}>
              <p style={{ margin: '0 0 4px 0', fontWeight: 700, color: '#1e293b' }}>LMS Academy</p>
              <p style={{ margin: 0, borderTop: '1px solid #cbd5e1', paddingTop: 6, color: '#64748b', fontSize: 12 }}>
                Authorized Signature
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Certificate;