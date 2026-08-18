import React, { useRef } from 'react';
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
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      {/* Action Buttons */}
      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
        <button
          onClick={handleDownloadPDF}
          style={{
            padding: '10px 20px',
            backgroundColor: '#27ae60',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          📥 Download PDF
        </button>
        <button
          onClick={onClose}
          style={{
            padding: '10px 20px',
            backgroundColor: '#e74c3c',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Close
        </button>
      </div>

      {/* Certificate Printable Canvas */}
      <div
        ref={certificateRef}
        style={{
          width: '800px',
          height: '550px',
          padding: '40px',
          backgroundColor: '#fff',
          border: '10px solid #2c3e50',
          outline: '5px solid #f1c40f',
          textAlign: 'center',
          boxSizing: 'border-box',
          position: 'relative',
          fontFamily: 'serif',
          color: '#2c3e50',
        }}
      >
        <div
          style={{
            border: '2px solid #bdc3c7',
            height: '100%',
            padding: '20px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h1 style={{ fontSize: '38px', margin: '0', textTransform: 'uppercase', color: '#f39c12' }}>
            Certificate of Completion
          </h1>
          <p style={{ fontSize: '16px', margin: '15px 0 5px 0', fontStyle: 'italic' }}>
            This is proudly presented to
          </p>
          <h2
            style={{
              fontSize: '32px',
              margin: '10px 0',
              borderBottom: '2px solid #2c3e50',
              paddingBottom: '5px',
              width: '80%',
            }}
          >
            {studentName}
          </h2>
          <p style={{ fontSize: '16px', margin: '15px 0 5px 0' }}>
            for successfully completing the online course:
          </p>
          <h3 style={{ fontSize: '24px', margin: '10px 0', color: '#2980b9' }}>
            {courseTitle}
          </h3>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '80%',
              marginTop: '40px',
              fontSize: '14px',
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>{completionDate}</p>
              <p style={{ margin: 0, borderTop: '1px solid #7f8c8d', paddingTop: '5px' }}>Date</p>
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>LMS Academy</p>
              <p style={{ margin: 0, borderTop: '1px solid #7f8c8d', paddingTop: '5px' }}>Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;