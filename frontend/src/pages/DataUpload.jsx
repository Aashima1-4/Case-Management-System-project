import React, { useState } from 'react';
import Toast from '../components/common/Toast';

const DataUpload = () => {
  const [toast, setToast] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = (e) => {
    e.preventDefault();
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setToast({ message: "File uploaded and metadata stored successfully", type: "success" });
    }, 2000);
  };

  return (
    <div className="module-container">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="module-header">
        <h2>Data <span>Upload</span></h2>
        <p>Securely upload case files and forensic reports to the database.</p>
      </div>

      <div className="glass-card form-section" style={{marginTop: '2rem', maxWidth: '600px'}}>
        <form onSubmit={handleUpload} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          <div className="form-group">
            <label style={{color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block'}}>Select File</label>
            <input type="file" className="input-field" required />
          </div>
          <div className="form-group">
            <label style={{color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block'}}>Description</label>
            <textarea className="input-field" placeholder="Briefly describe the file contents..." style={{minHeight: '100px'}}></textarea>
          </div>
          <button type="submit" className="btn-primary" disabled={isUploading}>
            {isUploading ? "Uploading..." : "Start Upload"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DataUpload;
