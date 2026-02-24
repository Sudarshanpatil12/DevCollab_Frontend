import { useCallback, useEffect, useState } from 'react';
import { files as filesApi, getApiErrorMessage } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUploadPanel({ projectId, isAdmin }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await filesApi.byProject(projectId);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load files'));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    const timer = setInterval(loadFiles, 8000);
    return () => clearInterval(timer);
  }, [loadFiles]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      setError('File is too large. Max upload size is 3MB.');
      e.target.value = '';
      return;
    }

    setError('');
    setUploading(true);
    try {
      const dataBase64 = await fileToBase64(file);
      await filesApi.upload(projectId, {
        name: file.name,
        contentType: file.type || 'application/octet-stream',
        size: file.size,
        dataBase64,
      });
      await loadFiles();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Upload failed'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Delete this file?')) return;
    setError('');
    try {
      await filesApi.remove(fileId);
      setItems((prev) => prev.filter((item) => item._id !== fileId));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Delete failed'));
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-700/80 p-5 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-white">Files</h2>
        <label className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white cursor-pointer">
          {uploading ? 'Uploading...' : 'Upload'}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
      <p className="text-[11px] text-slate-500 mb-2">Visible to all project members. Max file size: 3MB.</p>
      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
      {loading ? (
        <p className="text-sm text-slate-400">Loading files...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-500">No files uploaded yet.</p>
      ) : (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item._id} className="rounded-lg border border-slate-700 bg-slate-800/70 p-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-100 font-medium break-all">{item.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {formatSize(item.size)} • {item.uploadedBy?.name || 'Unknown'} • {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <a
                    href={filesApi.downloadUrl(item._id)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-400 hover:text-emerald-300"
                  >
                    Download
                  </a>
                  {(isAdmin || item.uploadedBy?._id === user?._id) && (
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
