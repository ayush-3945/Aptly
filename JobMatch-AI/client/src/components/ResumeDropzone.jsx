import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, Loader2, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

const ResumeDropzone = ({ onFileSelected, isParsing, parseProgressText, uploadedFileName, onUseDemoResume }) => {
  const onDrop = useCallback(
    (acceptedFiles, fileRejections) => {
      if (fileRejections && fileRejections.length > 0) {
        const rejection = fileRejections[0];
        if (rejection.errors && rejection.errors[0]?.code === 'file-too-large') {
          alert('File size exceeds the 5MB limit. Please upload a smaller PDF.');
        } else {
          alert('Invalid file format. Please upload a valid PDF resume.');
        }
        return;
      }

      if (acceptedFiles && acceptedFiles.length > 0) {
        onFileSelected(acceptedFiles[0]);
      }
    },
    [onFileSelected]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    disabled: isParsing,
  });

  return (
    <div
      style={{
        marginBottom: '2rem',
        background: 'var(--bg-card)',
        borderRadius: '8px',
        border: '1px solid var(--border-default)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-subtle)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'var(--accent-teal-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(15, 107, 92, 0.2)',
            }}
          >
            <Sparkles size={16} color="var(--accent-teal)" />
          </div>
          <div>
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                fontFamily: "'Newsreader', Georgia, serif",
                margin: 0,
              }}
            >
              Automated Resume Parser
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
              Upload your PDF resume to auto-fill your profile fields instantly using Gemini AI
            </p>
          </div>
        </div>

        {onUseDemoResume && !isParsing && (
          <button
            type="button"
            onClick={onUseDemoResume}
            className="btn btn-ghost"
            style={{
              fontSize: '0.8rem',
              padding: '0.4rem 0.8rem',
              color: 'var(--accent-teal)',
              backgroundColor: 'var(--accent-teal-light)',
              border: '1px solid rgba(15, 107, 92, 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <FileText size={14} />
            <span>Try sample resume</span>
          </button>
        )}
      </div>

      {/* Dropzone Container */}
      <div
        {...getRootProps()}
        className={`resume-dropzone ${isDragActive ? 'dropzone-active' : ''} ${
          isDragReject ? 'dropzone-reject' : ''
        }`}
        style={{
          minHeight: '140px',
          cursor: isParsing ? 'not-allowed' : 'pointer',
          backgroundColor: isParsing ? 'rgba(15, 107, 92, 0.02)' : undefined,
        }}
      >
        <input {...getInputProps()} />

        {isParsing ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.85rem',
              padding: '1rem 0',
            }}
          >
            <Loader2
              size={36}
              className="animate-spin"
              style={{ color: 'var(--accent-teal)' }}
            />
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: 'var(--accent-teal)',
                  letterSpacing: '0.01em',
                }}
              >
                Parsing your resume...
              </div>
              <div
                style={{
                  fontSize: '0.84rem',
                  color: 'var(--text-secondary)',
                  marginTop: '0.25rem',
                }}
              >
                {parseProgressText || 'Extracting profile, experience, and competencies via Gemini AI...'}
              </div>
            </div>
          </div>
        ) : uploadedFileName ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--accent-teal-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-teal)',
              }}
            >
              <CheckCircle size={24} />
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {uploadedFileName}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Click or drop another PDF to replace and re-parse
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.65rem',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '8px',
                background: isDragActive ? 'var(--accent-teal-light)' : 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDragActive ? 'var(--accent-teal)' : 'var(--text-muted)',
                transition: 'var(--transition)',
              }}
            >
              <UploadCloud size={24} />
            </div>
            <div>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                {isDragActive ? 'Drop your PDF here...' : 'Drop your resume PDF here, or '}
              </span>
              {!isDragActive && (
                <span
                  style={{
                    color: 'var(--accent-teal)',
                    fontWeight: 700,
                    textDecoration: 'underline',
                    fontSize: '0.92rem',
                  }}
                >
                  browse files
                </span>
              )}
            </div>
            <p
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                margin: 0,
              }}
            >
              PDF format only • Max file size 5MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeDropzone;
