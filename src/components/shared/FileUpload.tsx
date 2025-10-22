import React from 'react';

interface FileUploadProps {
  label: string;
  description: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  required?: boolean;
  accept?: string;
  maxSize?: number; // in bytes
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  description,
  file,
  onFileChange,
  required = false,
  accept = 'application/pdf',
  maxSize = 1 * 1024 * 1024 // default 1MB
}) => {
  const [error, setError] = React.useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError('');

    if (!selectedFile) {
      onFileChange(null);
      return;
    }

    // Validate file type
    if (accept && selectedFile.type !== accept) {
      const fileType = accept.split('/')[1].toUpperCase();
      setError(`Please upload a ${fileType} file`);
      onFileChange(null);
      return;
    }

    // Validate file size
    if (selectedFile.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
      setError(`File size must be less than ${maxSizeMB}MB`);
      onFileChange(null);
      return;
    }

    onFileChange(selectedFile);
  };

  const handleRemoveFile = () => {
    onFileChange(null);
    setError('');
    // Reset the input value
    const input = document.querySelector(`input[type="file"][accept="${accept}"]`) as HTMLInputElement;
    if (input) input.value = '';
  };

  return (
    <div style={{
      borderTop: '1px solid #e5e7eb',
      paddingTop: '1.5rem',
      marginBottom: '1.5rem'
    }}>
      <h3 style={{
        fontSize: '1.125rem',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '0.5rem'
      }}>
        {label}{' '}
        {required ? (
          <span style={{ color: '#dc2626' }}>*</span>
        ) : (
          <span style={{ color: '#6b7280', fontWeight: '400', fontSize: '0.875rem' }}>(Optional)</span>
        )}
      </h3>
      <p style={{
        fontSize: '0.875rem',
        color: '#6b7280',
        marginBottom: '1rem'
      }}>
        {description}
      </p>

      <div style={{ position: 'relative' }}>
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          style={{
            display: 'block',
            width: '100%',
            padding: '0.75rem',
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            fontSize: '0.875rem',
            cursor: 'pointer',
            backgroundColor: '#f9fafb',
            transition: 'border-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#667eea';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
        />
        {file && (
          <div style={{
            marginTop: '0.75rem',
            padding: '0.75rem',
            backgroundColor: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '6px',
            fontSize: '0.875rem',
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>
              ✓ {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </span>
            <button
              type="button"
              onClick={handleRemoveFile}
              style={{
                background: 'none',
                border: 'none',
                color: '#16a34a',
                cursor: 'pointer',
                fontSize: '1.25rem',
                padding: '0 0.5rem'
              }}
            >
              ×
            </button>
          </div>
        )}
        {error && (
          <div style={{
            marginTop: '0.75rem',
            padding: '0.75rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            fontSize: '0.875rem',
            color: '#dc2626'
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
