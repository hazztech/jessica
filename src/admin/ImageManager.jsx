import { useRef, useState } from 'react';
import { uploadPublicImage } from '../services/storage.js';
import { checkFile } from '../lib/uploadStore.js';
import { CameraIcon } from '../components/icons.jsx';

const ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];

/** Upload, order, caption and remove photos. value: [{ url, alt, width, height, fileName, ... }] */
export default function ImageManager({ value, onChange, max = 10, label = 'Photos', altHint, bucket = 'product-images' }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [problems, setProblems] = useState([]);

  const add = async (files) => {
    const errs = [];
    const room = max - value.length;
    const list = Array.from(files).slice(0, Math.max(0, room));
    if (files.length > room) errs.push(`You can add up to ${max} photos.`);
    setBusy(true);
    const added = [];
    for (const f of list) {
      const problem = checkFile(f, { accept: ACCEPT, maxSizeMB: 15 });
      if (problem) { errs.push(problem); continue; }
      try { added.push({ ...(await uploadPublicImage(bucket, f)), alt: '' }); } catch (err) {
        errs.push(/\.hei[cf]$/i.test(f.name)
          ? `“${f.name}” is an iPhone HEIC photo this browser can’t open. Export it as JPG, or set iPhone Camera → Formats → Most Compatible.`
          : err?.message || `“${f.name}” couldn’t be read.`);
      }
    }
    setBusy(false);
    setProblems(errs);
    if (added.length) onChange([...value, ...added]);
    if (input.current) input.current.value = '';
  };
  const move = (i, d) => {
    const next = [...value];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const update = (i, patch) => onChange(value.map((img, k) => (k === i ? { ...img, ...patch } : img)));

  return (
    <div className="imgm">
      <div className="cz-label"><span>{label}</span><span className="cz-selected">{value.length}/{max}</span></div>
      {value.length > 0 && (
        <ul role="list" className="imgm__list">
          {value.map((img, i) => (
            <li key={img.url.slice(-40) + i} className="imgm__item">
              <div className="imgm__thumb">
                <img src={img.url} alt="" />
                {i === 0 && <span className="imgm__main">Main photo</span>}
              </div>
              <label className="visually-hidden" htmlFor={`alt-${i}`}>Description for photo {i + 1}</label>
              <input id={`alt-${i}`} className="cz-input imgm__alt" value={img.alt || ''} maxLength={140}
                placeholder={altHint || 'Describe the photo'} onChange={(e) => update(i, { alt: e.target.value })} />
              <div className="imgm__tools">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move photo ${i + 1} earlier`}>←</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label={`Move photo ${i + 1} later`}>→</button>
                <button type="button" className="imgm__remove" onClick={() => onChange(value.filter((_, k) => k !== i))}
                  aria-label={`Remove photo ${i + 1}`}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {value.length < max && (
        <div className="upload__drop imgm__drop"
          onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); add(e.dataTransfer.files); }}>
          <CameraIcon size={24} />
          <p className="upload__cta">
            <button type="button" className="upload__btn" onClick={() => input.current?.click()} disabled={busy}>
              {busy ? 'Processing…' : 'Upload photos'}
            </button>
            <span className="upload__or"> or drag them here</span>
          </p>
          <p className="upload__rules">JPG, PNG, WEBP · resized automatically · first photo is the main image</p>
          <input ref={input} type="file" className="visually-hidden" tabIndex={-1} accept={ACCEPT.join(',')} multiple
            onChange={(e) => add(e.target.files)} />
        </div>
      )}
      {problems.length > 0 && <div className="cz-error" role="alert">{problems.map((p, i) => <p key={i}>{p}</p>)}</div>}
    </div>
  );
}
