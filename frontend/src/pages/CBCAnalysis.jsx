import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Camera, CheckCircle, AlertCircle, ChevronRight, X, HeartPulse, Activity, Download, Sparkles } from 'lucide-react';
import PageLayout from './PageLayout';
import api from '../api/client';

// ---- OCR Utilities ----
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

function extractScanValues(text) {
  const t = normalizeOcrText(text).toLowerCase();
  return {
    gestationalWeek: extractNumber(t, [/(\d{1,2})\s*(?:w|wk|wks|weeks)/i, /gestational\s*age\D{0,10}(\d{1,2})/i]),
    fetalHeartRate: extractNumber(t, [/fetal\s*heart\s*rate\D{0,10}(\d{2,3})/i, /fhr\D{0,10}(\d{2,3})/i]),
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
  const scanRef = useRef(null);

  const [values, setValues] = useState({ hb: '', rbc: '', mcv: '', mch: '', mchc: '', hematocrit: '', rdw: '', ferritin: '' });
  const [file, setFile] = useState(null);
  const [ocrStatus, setOcrStatus] = useState('');
  const [ocrMessage, setOcrMessage] = useState('');
  const [ocrConfirmed, setOcrConfirmed] = useState(false);

  // Pregnancy Scan Report (Optional)
  const [scanFile, setScanFile] = useState(null);
  const [scanStatus, setScanStatus] = useState('');
  const [scanMessage, setScanMessage] = useState('');
  const [scanData, setScanData] = useState({});

  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [inlineAssessment, setInlineAssessment] = useState(null);
  const [error, setError] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);

  const handleCbcFile = async (f) => {
    if (!f) return;
    setFile(f);
    setOcrStatus('processing');
    setOcrMessage('Extracting CBC values...');
    setOcrConfirmed(false);

    try {
      if (f.type === 'application/pdf') {
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
        setOcrMessage(`PDF parsed. Found ${found} CBC values. Please review and edit below.`);
      } else {
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
        setOcrMessage(`OCR complete. Found ${found} CBC values. Please review and edit below.`);
      }
    } catch (err) {
      setOcrStatus('error');
      setOcrMessage('OCR failed: ' + err.message + '. Please enter values manually.');
    }
  };

  const handleScanFile = async (f) => {
    if (!f) return;
    setScanFile(f);
    setScanStatus('processing');
    setScanMessage('Reading pregnancy scan...');

    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');
      const url = URL.createObjectURL(f);
      const { data: { text } } = await worker.recognize(url);
      await worker.terminate();
      URL.revokeObjectURL(url);
      const extracted = extractScanValues(text);
      setScanData(extracted);
      setScanStatus('done');
      if (extracted.gestationalWeek) {
        setScanMessage(`Scan recognized. Estimated gestational age: Week ${extracted.gestationalWeek}.`);
      } else {
        setScanMessage('Pregnancy scan uploaded successfully.');
      }
    } catch {
      setScanStatus('done');
      setScanMessage('Pregnancy scan uploaded.');
    }
  };

  const handleAutoAnalyze = async () => {
    if (!values.hb || String(values.hb).trim() === '') {
      setError('Please enter your Haemoglobin (Hb) value below before analyzing.');
      const hbInput = document.getElementById('cbc-field-hb');
      if (hbInput) hbInput.focus();
      return;
    }

    setError('');
    setAnalyzing(true);
    setInlineAssessment(null);
    try {
      const body = {
        ...Object.fromEntries(Object.entries(values).filter(([, v]) => v !== '' && v !== null && v !== undefined)),
        reportDate,
        ocrExtracted: ocrStatus === 'done',
        ocrConfirmed,
        uploadedFileName: file?.name || '',
      };
      const reportRes = await api.post('/reports', body);
      const reportId = reportRes.report?._id;

      const assessRes = await api.post('/assessments', {
        bloodReportId: reportId,
        symptoms: [],
        pregnancyWeek: scanData.gestationalWeek ? Number(scanData.gestationalWeek) : undefined,
      });

      setInlineAssessment(assessRes.assessment);
      setTimeout(() => {
        const el = document.getElementById('risk-level-result-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err.message || 'Failed to analyze report. Please check your network and try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    // If user didn't enter Hb, prompt with a clear inline error
    if (!values.hb || String(values.hb).trim() === '') {
      setError('Please enter your Haemoglobin (Hb) value below before continuing.');
      const hbInput = document.getElementById('cbc-field-hb');
      if (hbInput) hbInput.focus();
      return;
    }

    setError('');
    setSaving(true);
    try {
      const body = {
        ...Object.fromEntries(Object.entries(values).filter(([, v]) => v !== '' && v !== null && v !== undefined)),
        reportDate,
        ocrExtracted: ocrStatus === 'done',
        ocrConfirmed,
        uploadedFileName: file?.name || '',
      };
      const data = await api.post('/reports', body);
      const reportId = data.report?._id;
      navigate('/health-check', {
        state: {
          reportId,
          suggestedWeek: scanData.gestationalWeek || undefined
        }
      });
    } catch (err) {
      setError(err.message || 'Failed to save report. Please check your network and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout title="CBC & Pregnancy Analysis" activePath="/cbc-analysis" description="Upload your Complete Blood Count report and pregnancy scan, or enter values manually">
      <div className="alert alert-info" style={{ marginBottom: 24 }}>
        <AlertCircle size={16} />
        Haemoglobin (Hb) is required. Pregnancy scan upload is optional.
      </div>

      {/* Dual Upload Cards Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* CBC Report Upload */}
        <div className="section-card" style={{ marginBottom: 0 }}>
          <h2 style={{ fontSize: 16, marginBottom: 4 }}><Upload size={18} /> CBC Report Upload</h2>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 14 }}>Upload blood report image or PDF for auto-reading.</p>

          <div
            className={`upload-zone ${file ? 'dragging' : ''}`}
            onClick={() => fileRef.current?.click()}
            style={{ padding: '24px 16px' }}
          >
            <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => handleCbcFile(e.target.files[0])} />
            {file ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                <FileText size={24} color="#C0392B" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{file.name}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>{(file.size / 1024).toFixed(1)} KB</div>
                </div>
                <button onClick={e => { e.stopPropagation(); setFile(null); setOcrStatus(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={16} /></button>
              </div>
            ) : (
              <>
                <Camera size={32} style={{ margin: '0 auto 8px', display: 'block', color: '#9CA3AF' }} />
                <p style={{ fontWeight: 600, fontSize: 14 }}>Camera or Gallery</p>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>JPG, PNG, PDF</p>
              </>
            )}
          </div>

          {ocrStatus && (
            <div className={`ocr-status ${ocrStatus}`} style={{ marginTop: 12, padding: '10px 14px', fontSize: 13 }}>
              {ocrStatus === 'processing' && <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />}
              {ocrStatus === 'done' && <CheckCircle size={15} />}
              {ocrStatus === 'error' && <AlertCircle size={15} />}
              <span>{ocrMessage}</span>
            </div>
          )}

          {ocrStatus === 'done' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={ocrConfirmed} onChange={e => setOcrConfirmed(e.target.checked)} style={{ width: 16, height: 16 }} />
              <span>I verified extracted CBC values</span>
            </label>
          )}
        </div>

        {/* Pregnancy Scan Report Upload (Optional) */}
        <div className="section-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <h2 style={{ fontSize: 16 }}><HeartPulse size={18} color="#E67E22" /> Pregnancy Scan Report</h2>
            <span style={{ fontSize: 11, background: '#FEF9E7', color: '#B7770D', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>Optional</span>
          </div>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 14 }}>Upload ultrasound or scan report when available.</p>

          <div
            className={`upload-zone ${scanFile ? 'dragging' : ''}`}
            onClick={() => scanRef.current?.click()}
            style={{ padding: '24px 16px' }}
          >
            <input ref={scanRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => handleScanFile(e.target.files[0])} />
            {scanFile ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                <HeartPulse size={24} color="#E67E22" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{scanFile.name}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>{(scanFile.size / 1024).toFixed(1)} KB</div>
                </div>
                <button onClick={e => { e.stopPropagation(); setScanFile(null); setScanStatus(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={16} /></button>
              </div>
            ) : (
              <>
                <Camera size={32} style={{ margin: '0 auto 8px', display: 'block', color: '#9CA3AF' }} />
                <p style={{ fontWeight: 600, fontSize: 14 }}>Camera or Gallery</p>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Ultrasound scan image</p>
              </>
            )}
          </div>

          {scanStatus && (
            <div className={`ocr-status ${scanStatus}`} style={{ marginTop: 12, padding: '10px 14px', fontSize: 13 }}>
              {scanStatus === 'processing' && <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />}
              {scanStatus === 'done' && <CheckCircle size={15} />}
              <span>{scanMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Manual CBC Values Entry & Confirmation */}
      <div className="section-card">
        <h2 style={{ fontSize: 16, marginBottom: 4 }}><FileText size={18} /> CBC Values</h2>
        <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>Enter or review values from your laboratory report. <strong>Hb is required.</strong></p>

        <div className="form-group" style={{ maxWidth: 240, marginBottom: 20 }}>
          <label>Report Date</label>
          <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)} />
        </div>

        <div className="cbc-grid">
          {FIELD_META.map(({ key, label, unit, placeholder, required }) => (
            <div key={key} className="cbc-field">
              <label>{label}{required && <span style={{ color: '#C0392B' }}> *</span>}</label>
              <input
                id={`cbc-field-${key}`}
                type="number"
                step="0.01"
                placeholder={placeholder}
                value={values[key]}
                onChange={e => {
                  setError('');
                  setValues(v => ({ ...v, [key]: e.target.value }));
                }}
              />
              <small>{unit}</small>
            </div>
          ))}
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginTop: 16 }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 16, marginTop: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn-submit"
            style={{ width: 'auto', padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 8, background: '#C0392B', color: '#fff', fontWeight: 600, borderRadius: 8 }}
            onClick={handleAutoAnalyze}
            disabled={analyzing || saving}
          >
            {analyzing ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                <span>Analyzing CBC & Risk Level...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Analyze & Show Risk Level</span>
              </>
            )}
          </button>

          <button
            type="button"
            style={{ width: 'auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8, background: '#F8F9FA', border: '1px solid #D1D5DB', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
            onClick={handleSave}
            disabled={saving || analyzing}
          >
            {saving ? 'Saving...' : <><span>Continue to Symptom Check</span><ChevronRight size={16} /></>}
          </button>
        </div>

        {/* Inline Risk Level Result Card */}
        {inlineAssessment && (
          <div id="risk-level-result-section" style={{ marginTop: 32, padding: 24, borderRadius: 12, border: '2px solid', borderColor: inlineAssessment.screeningCategory === 'no_anemia' ? '#2ECC71' : inlineAssessment.screeningCategory === 'mild_anemia' ? '#F1C40F' : inlineAssessment.screeningCategory === 'moderate_anemia' ? '#E67E22' : '#E74C3C', background: '#FFFFFF', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid #F3F4F6', paddingBottom: 16, marginBottom: 16 }}>
              <div>
                <span style={{
                  display: 'inline-block',
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  background: inlineAssessment.screeningCategory === 'no_anemia' ? '#D4EDDA' : inlineAssessment.screeningCategory === 'mild_anemia' ? '#FFF3CD' : inlineAssessment.screeningCategory === 'moderate_anemia' ? '#FFE8D6' : '#F8D7DA',
                  color: inlineAssessment.screeningCategory === 'no_anemia' ? '#155724' : inlineAssessment.screeningCategory === 'mild_anemia' ? '#856404' : inlineAssessment.screeningCategory === 'moderate_anemia' ? '#A04000' : '#721C24'
                }}>
                  {inlineAssessment.screeningCategory ? inlineAssessment.screeningCategory.replace('_', ' ') : 'Screening Complete'}
                </span>
                <h3 style={{ fontSize: 22, marginTop: 8, marginBottom: 4, fontWeight: 700 }}>
                  Risk Level: {inlineAssessment.screeningCategory === 'no_anemia' ? 'No Anemia Detected' : inlineAssessment.screeningCategory === 'mild_anemia' ? 'Mild Anemia Risk' : inlineAssessment.screeningCategory === 'moderate_anemia' ? 'Moderate Anemia Risk' : 'Severe Anemia Risk'}
                </h3>
                <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>
                  Based on WHO 2011 Pregnancy Guidelines (Haemoglobin: <strong>{inlineAssessment.hbValue || values.hb} g/dL</strong>)
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn-submit"
                  style={{ width: 'auto', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}
                  onClick={() => navigate(`/ai-analysis/${inlineAssessment._id}`)}
                >
                  <Activity size={16} />
                  <span>View Full Details</span>
                </button>
                <a
                  href={`/api/download/assessment/${inlineAssessment._id}`}
                  download
                  style={{ textDecoration: 'none' }}
                >
                  <button
                    type="button"
                    style={{ width: 'auto', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: 8, cursor: 'pointer' }}
                  >
                    <Download size={16} />
                    <span>Download PDF</span>
                  </button>
                </a>
              </div>
            </div>

            {/* Factors Found */}
            {inlineAssessment.factors && inlineAssessment.factors.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Key Extracted Indicators:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {inlineAssessment.factors.map((f, i) => (
                    <span key={i} style={{ background: '#F3F4F6', padding: '4px 10px', borderRadius: 6, fontSize: 13, color: '#1F2937' }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {inlineAssessment.recommendations && inlineAssessment.recommendations.length > 0 && (
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Clinical Recommendations:</h4>
                <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: '#4B5563', lineHeight: 1.6 }}>
                  {inlineAssessment.recommendations.slice(0, 4).map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default CBCAnalysis;
