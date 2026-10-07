import { useRef, useState } from 'react';
import { addFile, checkFile, getPreview, hasFile, removeFile } from '../lib/uploadStore.js';
import { formatAddon } from '../lib/format.js';
import { CameraIcon, CloseIcon } from './icons.jsx';

const fmtSize = (b) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);
const ImageIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><circle cx="9" cy="10" r="1.6" /><path d="m4 17 5-5 4 4 2.5-2.5L20 18" />
  </svg>
);

/**
 * Upload field built for phones:
 *  • "Photo library" opens the camera roll (multiple selection)
 *  • "Take photo" opens the camera directly (touch devices)
 *  • drag & drop on desktop
 * value: [{ id, name, size, type }] — the File objects live in uploadStore.
 */
export default function UploadField({
  id, label, help, value, onChange, accept = [], maxFiles = 5, maxSizeMB = 10, price, required, error,
}) {
  const library = useRef(null);
  const camera = useRef(null);
  const [drag, setDrag] = useState(false);
  const [problems, setProblems] = useState([]);
  const [broken, setBroken] = useState({});
  const full = value.length >= maxFiles;
  const imagesOnly = accept.every((t) => t.startsWith('image/'));
  const types = [...new Set(accept.map((t) => (t === 'application/pdf' ? 'PDF' : t.split('/')[1].toUpperCase().replace('JPEG', 'JPG').replace('HEIF', 'HEIC'))))];
  const acceptAttr = [...accept, ...(accept.includes('image/heic') ? ['.heic', '.heif'] : [])].join(',');

  const take = (fileList) => {
    const errs = [];
    const added = [];
    for (const file of Array.from(fileList || [])) {
      if (value.length + added.length >= maxFiles) { errs.push(`You can add up to ${maxFiles} file${maxFiles > 1 ? 's' : ''}.`); break; }
      const problem = checkFile(file, { accept, maxSizeMB });
      if (problem) errs.push(problem);
      else added.push(addFile(file));
    }
    setProblems(errs);
    if (added.length) onChange([...value, ...added.map(({ previewUrl, ...meta }) => meta)]);
    [library, camera].forEach((r) => { if (r.current) r.current.value = ''; });
  };

  const remove = (fileId) => {
    removeFile(fileId);
    onChange(value.filter((f) => f.id !== fileId));
  };

  const errId = `${id}-err`;
  const helpId = `${id}-help`;
  const describedBy = [help && helpId, error && errId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="upload">
      <div className="cz-label" id={`${id}-label`}>
        <span>{label}</span>
        {required && <span className="cz-req">Required</span>}
        {price ? <span className="cz-price">+{formatAddon(price)}</span> : null}
        {maxFiles > 1 && <span className="cz-selected">{value.length}/{maxFiles}</span>}
      </div>
      {help && <p className="cz-help" id={helpId}>{help}</p>}

      {value.length > 0 && (
        <ul role="list" className="upload__list">
          {value.map((f) => {
            const preview = getPreview(f.id);
            const missing = !hasFile(f.id);
            return (
              <li key={f.id} className={`upload__item ${missing ? 'is-missing' : ''}`}>
                <span className="upload__thumb">
                  {preview && !broken[f.id]
                    ? <img src={preview} alt="" onError={() => setBroken((b) => ({ ...b, [f.id]: true }))} />
                    : <span className="upload__ext">{f.type === 'application/pdf' ? 'PDF' : 'Photo'}</span>}
                </span>
                <span className="upload__meta">
                  <span className="upload__name">{f.name}</span>
                  <span className="upload__size">{missing ? 'Re-attach this file' : fmtSize(f.size)}</span>
                </span>
                <button type="button" className="upload__remove" onClick={() => remove(f.id)} aria-label={`Remove ${f.name}`}>
                  <CloseIcon size={18} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {!full && (
        <div
          className={`upload__drop ${drag ? 'is-drag' : ''} ${error ? 'has-error' : ''} ${value.length ? 'upload__drop--more' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); take(e.dataTransfer.files); }}
        >
          <div className="upload__btns">
            <button type="button" className="upload__btn" onClick={() => library.current?.click()} aria-describedby={describedBy}>
              <ImageIcon />
              {value.length ? 'Add more' : imagesOnly ? 'Photo library' : 'Choose files'}
            </button>
            {imagesOnly && (
              <button type="button" className="upload__btn upload__btn--camera" onClick={() => camera.current?.click()}>
                <CameraIcon size={22} /> Take photo
              </button>
            )}
          </div>
          <p className="upload__or">or drag files here</p>
          <p className="upload__rules">{types.join(', ')} · up to {maxSizeMB} MB each{maxFiles > 1 ? ` · max ${maxFiles}` : ''}</p>
          <input ref={library} id={id} type="file" className="visually-hidden" tabIndex={-1}
            accept={acceptAttr} multiple={maxFiles > 1} onChange={(e) => take(e.target.files)} />
          {imagesOnly && (
            <input ref={camera} type="file" className="visually-hidden" tabIndex={-1}
              accept="image/*" capture="environment" onChange={(e) => take(e.target.files)} />
          )}
        </div>
      )}

      {(error || problems.length > 0) && (
        <div className="cz-error" id={errId} role="alert">
          {error && <p>{error}</p>}
          {problems.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      )}
    </div>
  );
}
