import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Camera, CheckCircle, AlertCircle, ChevronRight, X } from 'lucide-react';
import PageLayout from './PageLayout';
import api from '../api/client';

// ---- OCR Utilities (preserved from original) ----
function normalizeOcrText(text) {
  return text.replace(/[|l1]/g, '').replace(/[oO0]/g, '0').replace(/,/g, '.').replace(/\s+/g, ' ');
}

function extractNumber(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const num = parseFloat(match[1]);
      if (!isNaN(num)) return num;
    }
  }
  return null;
}

function extractCbcValues(text) {
  const t = normalizeOcrText(text).toLowerCase();
  return {
    hb: extractNumber(t, [/h(?:ae?moglobin|b)\D{0,10}(\d{1,3}(?:\.\d{1,2})?)/i, /hgb\D{0,10}(\d{1,3}(?:\.\d{1,2})?)/i]),
    rbc: extractNumber(t, [/r\.?b\.?c\D{0,15}(\d{1,2}(?:\.\d{1,2})?)/i, /red blood cell\D{0,15}(\d{1,2}(?:\.\d{1,2})?)/i]),
    mcv: extractNumber(t, [/mcv\D{0,10}(\d{2,3}(?:\.\d{1,2})?)/i, /mean corp\w*\s+vol\D{0,10}(\d{2,3}(?:\.\d{1,2})?)/i]),
    mch: extractNumber(t, [/\bmch\b\D{0,10}(\d{2,3}(?:\.\d{1,2})?)/i]),
    mchc: extractNumber(t, [/mchc\D{0,10}(\d{2,3}(?:\.\d{1,2})?)/i]),
    hematocrit: extractNumber(t, [/h(?:ae?matocrit|ct|cv)\D{0,10}(\d{2,3}(?:\.\d{1,2})?)/i, /pcv\D{0,10}(\d{2,3}(?:\.\d{1,2})?)/i]),
    rdw: extractNumber(t, [/rdw\D{0,10}(\d{1,2}(?:\.\d{1,2})?)/i]),
    ferritin: extractNumber(t, [/ferritin\D{0,10}(\d{1,3}(?:\.\d{1,2})?)/i]),
  };
}

const FIELD_META = [
  { key: 'hb', label: 'Haemoglobin (Hb)', unit: 'g/dL', placeholder: 'e.g. 11.5', required: true },
  { key: 'rbc', label: 'RBC Count', unit: 'million/µL', placeholder: 'e.g. 4.2' },
  { key: 'mcv', label: 'MCV', unit: 'fL', placeholder: 'e.g. 85' },
  { key: 'mch', label: 'MCH', unit: 'pg', placeholder: 'e.g. 28' },
  { key: 'mchc', label: 'MCHC', unit: 'g/dL', placeholder: 'e.g. 32' },
  { key: 'hematocrit', label: 'Hematocrit (HCT)', unit: '%', placeholder: 'e.g. 36' },
  { key: 'rdw', label: 'RDW', unit: '%', placeholder: 'e.g. 13.5' },
  { key: 'ferritin', label: 'Ferritin', unit: 'ng/mL', placeholder: 'e.g. 25' },
];

function CBCAnalysis() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [values, setValues] = useState({ hb: '', rbc: '', mcv: '', mch: '', mchc: '', hematocrit: '', rdw: '', ferritin: '' });
  const [file, setFile] = useState(null);
  const [ocrStatus, setOcrStatus] = useState(''); // 'processing' | 'done' | 'error' | ''
  const [ocrMessage, setOcrMessage] = useState('');
  const [ocrConfirmed, setOcrConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);

  const handleFile = async (f) => {
    if (!f) return;
    setFile(f);
    setOcrStatus('processing');
    setOcrMessage('Extracting text from your report...');
    setOcrConfirmed(false);

    try {
      if (f.type === 'application/pdf') {
        // PDF.js extraction
        const { getDocument } = await import('pdfjs-dist');
        const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.min.mjs');
        const { GlobalWorkerOptions } = await import('pdfjs-dist');
        GlobalWorkerOptions.workerSrc = pdfjsWorker.default || '/pdf.worker.min.js';
        const buffer = await f.arrayBuffer();
        const pdf = await getDocument({ data: buffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map(item => item.str).join(' ') + '\n';
        }
        const extracted = extractCbcValues(fullText);
        setValues(v => {
          const updated = { ...v };
          Object.keys(extracted).forEach(k => { if (extracted[k] !== null) updated[k] = String(extracted[k]); });
          return updated;
        });
        const found = Object.values(extracted).filter(v => v !== null).length;
        setOcrStatus('done');
        setOcrMessage(`PDF parsed. Found ${found} CBC values. Please verify and confirm below.`);
      } else {
        // Tesseract OCR for images
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('eng');
        const url = URL.createObjectURL(f);
        const { data: { text } } = await worker.recognize(url);
        await worker.terminate();
        URL.revokeObjectURL(url);
        const extracted = extractCbcValues(text);
        setValues(v => {
          const updated = { ...v };
          Object.keys(extracted).forEach(k => { if (extracted[k] !== null) updated[k] = String(extracted[k]); });
          return updated;
        });
        const found = Object.values(extracted).filter(v => v !== null).length;
        setOcrStatus('done');
        setOcrMessage(`OCR complete. Found ${found} CBC values. Please verify all values before confirming.`);
      }
    } catch (err) {
      setOcrStatus('error');
      setOcrMessage('OCR failed: ' + err.message + '. Please enter values manually.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSave = async () => {
    if (!values.hb) { setError('Haemoglobin (Hb) is required for anemia screening.'); return; }
    setError('');
    setSaving(true);
    try {
      const body = {
        ...Object.fromEntries(Object.entries(values).filter(([, v]) => v !== '')),
        reportDate,
        ocrExtracted: ocrStatus === 'done',
        ocrConfirmed,
        uploadedFileName: file?.name || '',
      };
      const data = await api.post('/reports', body);
      const reportId = data.report._id;
      navigate('/health-check', { state: { reportId } });
    } catch (err) {
      setError(err.message || 'Failed to save report.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout title="CBC Analysis" activePath="/cbc-analysis" description="Upload your Complete Blood Count report or enter values manually">
      <div className="alert alert-info" style={{ marginBottom: 24 }}>
        <AlertCircle size={16} />
        Haemoglobin (Hb) is required. All other values are optional but improve screening accuracy.
      </div>

      {/* Upload zone */}
      <div className="section-card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, marginBottom: 4 }}><Upload size={18} /> Upload Report</h2>
        <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 16 }}>Supports JPG, PNG, PDF. OCR will extract CBC values automatically.</p>

        <div
          className={`upload-zone ${file ? 'dragging' : ''}`}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
          {file ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
              <FileText size={28} color="#C0392B" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{file.name}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>{(file.size / 1024).toFixed(1)} KB</div>
              </div>
              <button onClick={e => { e.stopPropagation(); setFile(null); setOcrStatus(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={18} /></button>
            </div>
          ) : (
            <>
              <Camera size={40} style={{ margin: '0 auto 12px', display: 'block', color: '#9CA3AF' }} />
              <p style={{ fontWeight: 600 }}>Drag & drop or click to upload</p>
              <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>JPG, PNG, PDF up to 10 MB</p>
            </>
          )}
        </div>

        {ocrStatus && (
          <div className={`ocr-status ${ocrStatus}`}>
            {ocrStatus === 'processing' && <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />}
            {ocrStatus === 'done' && <CheckCircle size={18} />}
            {ocrStatus === 'error' && <AlertCircle size={18} />}
            <span>{ocrMessage}</span>
          </div>
        )}

        {ocrStatus === 'done' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, fontSize: 14, cursor: 'pointer' }}>
            <input type="checkbox" checked={ocrConfirmed} onChange={e => setOcrConfirmed(e.target.checked)} style={{ width: 18, height: 18 }} />
            <span>I have verified all extracted values are correct</span>
          </label>
        )}
      </div>

      {/* Manual entry */}
      <div className="section-card">
        <h2 style={{ fontSize: 16, marginBottom: 4 }}><FileText size={18} /> CBC Values</h2>
        <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>Enter or confirm values from your report. <strong>Hb is required.</strong></p>

        <div className="form-group" style={{ maxWidth: 240, marginBottom: 20 }}>
          <label>Report Date</label>
          <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)} />
        </div>

        <div className="cbc-grid">
          {FIELD_META.map(({ key, label, unit, placeholder, required }) => (
            <div key={key} className="cbc-field">
              <label>{label}{required && <span style={{ color: '#C0392B' }}> *</span>}</label>
              <input
                type="number"
                step="0.01"
                placeholder={placeholder}
                value={values[key]}
                onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
              />
              <small>{unit}</small>
            </div>
          ))}
        </div>

        {error && <div className="alert alert-error" style={{ marginTop: 16 }}><AlertCircle size={16} />{error}</div>}

        <div style={{ display: 'flex', gap: 16, marginTop: 24, alignItems: 'center' }}>
          <button
            className="btn-submit"
            style={{ width: 'auto', padding: '12px 32px', display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={handleSave}
            disabled={saving || !values.hb}
          >
            {saving ? 'Saving...' : <><span>Save & Continue to Symptom Check</span><ChevronRight size={16} /></>}
          </button>
          <p style={{ fontSize: 13, color: '#9CA3AF' }}>You will assess symptoms next, then get your screening result.</p>
        </div>
      </div>
    </PageLayout>
  );
}

export default CBCAnalysis;
