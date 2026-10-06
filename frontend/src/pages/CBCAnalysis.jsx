import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createWorker } from "tesseract.js";
import PageLayout from "./PageLayout";

function CBCAnalysis() {

  const navigate = useNavigate();

  const [cbc, setCbc] = useState({
    hb: "",
    rbc: "",
    mcv: "",
    mch: "",
    mchc: "",
    hematocrit: "",
    rdw: ""
  });
  const [cbcFileName, setCbcFileName] = useState("");
  const [scanName, setScanName] = useState("");
  const [scanData, setScanData] = useState({});
  const [reportStatus, setReportStatus] = useState("");
  const [scanStatus, setScanStatus] = useState("");
  const [isReading, setIsReading] = useState(false);

  const change = (e) => {
    setCbc({
      ...cbc,
      [e.target.name]: e.target.value
    });
  };

  const analyze = (e) => {
    e.preventDefault();

    const gestationalWeek = getGestationalWeek(scanData.gestationalAge);

    localStorage.setItem("cbcData", JSON.stringify(cbc));
    localStorage.setItem("scanData", JSON.stringify({ name: scanName, uploaded: Boolean(scanName), values: scanData, uploadedAt: new Date().toISOString() }));
    localStorage.setItem("pregnancyData", JSON.stringify({
      week: gestationalWeek || "",
      symptoms: []
    }));

    navigate("/ai-analysis");
  };

  const readScanReport = async (e) => {
    const file = e.target.files[0];
    setScanName(file?.name || "");
    setScanData({});
    setScanStatus("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setScanStatus("PDF selected. Upload a JPG or PNG to read scan measurements automatically.");
      if (e.target) e.target.value = "";
      return;
    }

    setIsReading(true);
    setScanStatus("Reading the pregnancy scan report...");
    let worker;
    try {
      worker = await createWorker("eng");
      const text = await readScanText(worker, file);
      const values = extractScanValues(text);
      setScanData(values);
      setScanStatus(Object.keys(values).length
        ? "Pregnancy scan measurements recognized."
        : "Scan uploaded, but no readable measurements were found. The original scan is still saved.");
    } catch {
      setScanStatus("Scan uploaded, but its text could not be read. The original scan is still saved.");
    } finally {
      if (worker) await worker.terminate();
      setIsReading(false);
      if (e.target) e.target.value = "";
    }
  };

  const readCbcReport = async (e) => {
    const file = e.target.files[0];
    setCbcFileName(file?.name || "");
    setReportStatus("");
    setCbc({
      hb: "",
      rbc: "",
      mcv: "",
      mch: "",
      mchc: "",
      hematocrit: "",
      rdw: ""
    });
    if (!file || !file.type.startsWith("image/")) {
      setReportStatus("Upload a JPG or PNG CBC blood report for automatic reading.");
      if (e.target) e.target.value = "";
      return;
    }

    setIsReading(true);
    setReportStatus("Reading the CBC report...");
    let worker;
    try {
      worker = await createWorker("eng");
      const { data } = await worker.recognize(file);
      const values = extractCbcValues(data.text);
      setCbc((current) => ({ ...current, ...values }));
      setReportStatus(Object.keys(values).length
        ? `Copied ${Object.keys(values).length} value(s) from the CBC report.`
        : "No CBC values found. Upload a blood report containing Hb, RBC, MCV, MCH, MCHC, HCT, and RDW.");
    } catch {
      setReportStatus("The CBC report could not be read. Upload a clearer image.");
    } finally {
      if (worker) await worker.terminate();
      setIsReading(false);
      if (e.target) e.target.value = "";
    }
  };

  return (
    <PageLayout title="CBC Report Analysis" eyebrow="LAB ANALYSIS" activePath="/cbc-analysis" description="Enter the values from your Complete Blood Count report for a preliminary screening review.">
      <form className="cbc-card" onSubmit={analyze}>
        <div className="cbc-card-heading"><div><span className="card-kicker">REPORT VALUES</span><h2>Complete Blood Count</h2><p>Use the units printed on your report.</p></div><div className="lab-badge">CBC<small>ANALYSIS</small></div></div>

        <div className="cbc-grid">

          <CBCInput
            name="hb"
            label="Hemoglobin"
            unit="g/dL"
            value={cbc.hb}
            onChange={change}
          />

          <CBCInput
            name="rbc"
            label="RBC"
            unit="million/µL"
            value={cbc.rbc}
            onChange={change}
          />

          <CBCInput
            name="mcv"
            label="MCV"
            unit="fL"
            value={cbc.mcv}
            onChange={change}
          />

          <CBCInput
            name="mch"
            label="MCH"
            unit="pg"
            value={cbc.mch}
            onChange={change}
          />

          <CBCInput
            name="mchc"
            label="MCHC"
            unit="g/dL"
            value={cbc.mchc}
            onChange={change}
          />

          <CBCInput
            name="hematocrit"
            label="Hematocrit"
            unit="%"
            value={cbc.hematocrit}
            onChange={change}
          />

          <CBCInput
            name="rdw"
            label="RDW"
            unit="%"
            value={cbc.rdw}
            onChange={change}
          />

        </div>

        <div className="upload-box">
          📄
          <strong>CBC Report Upload</strong>
          <span>Add your blood report if you have a digital copy.</span>
          <input type="file" accept=".jpg,.jpeg,.png" onChange={readCbcReport} />
          {cbcFileName && <span className="upload-name">Selected: {cbcFileName}</span>}
          {reportStatus && <span className="upload-status">{reportStatus}</span>}
        </div>

        <div className="upload-box scan-upload">
          🖥️
          <strong>Pregnancy Scan Report <em>Optional</em></strong>
          <span>Upload an ultrasound or pregnancy scan report when available.</span>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={readScanReport} />
          {scanName && <span className="upload-name">Selected: {scanName}</span>}
          {scanStatus && <span className="upload-status">{scanStatus}</span>}
        </div>

        <button className="analyze-btn" disabled={isReading}>
          🤖 Analyze My CBC →
        </button>

      </form>
    </PageLayout>
  );
}

function normalizeOcrText(text = "") {
  return text
    .replace(/\r/g, "")
    .replace(/µ|μ/g, "u")
    .replace(/[|]/g, "I")
    .replace(/[,]/g, ".")
    .replace(/\s+/g, " ")
    .trim();
}

function extractNumber(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].replace(/[^\d.]/g, "") || match[1];
    }
  }
  return "";
}

function extractCbcValues(text) {
  const reportText = normalizeOcrText(text).toLowerCase();
  const labels = {
    hb: [
      /(?:hemoglobin|haemoglobin|hgb|\bhb\b)[^\d\n]{0,25}(\d{1,3}(?:[.,]\d{1,2})?)/i,
      /(?:\bhb\b|hgb)[^\d\n]{0,12}(\d{1,3}(?:[.,]\d{1,2})?)/i,
    ],
    rbc: [
      /(?:rbc|red\s*blood\s*cell(?:s)?|r8c)[^\d\n]{0,25}(\d{1,3}(?:[.,]\d{1,2})?)/i,
      /(?:\brbc\b|red\s*blood\s*cell(?:s)?)\D{0,25}(\d{1,3}(?:[.,]\d{1,2})?)/i,
    ],
    mcv: [/\bmcv\b\D{0,20}(\d{1,3}(?:[.,]\d{1,2})?)/i],
    mch: [/\bmch(?!c)\b\D{0,20}(\d{1,3}(?:[.,]\d{1,2})?)/i],
    mchc: [/\bmchc\b\D{0,20}(\d{1,3}(?:[.,]\d{1,2})?)/i],
    hematocrit: [
      /(?:hematocrit|haematocrit|hct|pcv)[^\d\n]{0,25}(\d{1,3}(?:[.,]\d{1,2})?)/i,
      /\b(?:hct|pcv)\b\D{0,20}(\d{1,3}(?:[.,]\d{1,2})?)/i,
    ],
    rdw: [/\brdw(?:[- ]?cv)?\b\D{0,20}(\d{1,3}(?:[.,]\d{1,2})?)/i],
  };

  const values = {};
  for (const [name, patterns] of Object.entries(labels)) {
    const parsed = extractNumber(reportText, patterns);
    if (parsed) values[name] = parsed;
  }

  return values;
}

function getGestationalWeek(value) {
  if (!value) return "";
  const match = String(value).match(/(\d{1,2})/);
  return match ? Number(match[1]) : "";
}

function extractScanValues(text) {
  const reportText = normalizeOcrText(text).toLowerCase();
  const patterns = {
    gestationalAge: [
      /(?:gestational(?:\s+age)?|ga)[^\d\n]{0,25}(\d{1,2})\s*(?:weeks?|wks?|w)\s*(?:\d{1,2}\s*(?:days?|d))?/i,
      /(?:gestational(?:\s+age)?|ga)[^\d\n]{0,25}(\d{1,2})/i,
    ],
    fetalHeartRate: [
      /(?:fetal\s+heart\s+rate|\bfhr\b)[^\d\n]{0,25}(\d{2,3})\s*(?:bpm|beats?\s*\/\s*min)?/i,
      /\b(?:fhr|fetal\s+heart)\b[^\d\n]{0,25}(\d{2,3})/i,
    ],
    estimatedWeight: [
      /(?:estimated\s+fetal\s+weight|\befw\b)[^\d\n]{0,25}(\d{2,5})\s*(?:g|grams?)/i,
      /\b(?:efw|estimated\s+fetal\s+weight)\b[^\d\n]{0,25}(\d{2,5})/i,
    ],
    biparietalDiameter: [/\bbpd\b[^\d\n]{0,20}(\d+(?:[.,]\d+)?)\s*(?:cm|mm)?/i],
    headCircumference: [/\bhc\b[^\d\n]{0,20}(\d+(?:[.,]\d+)?)\s*(?:cm|mm)?/i],
    abdominalCircumference: [/\bac\b[^\d\n]{0,20}(\d+(?:[.,]\d+)?)\s*(?:cm|mm)?/i],
    femurLength: [/\b(?:femur\s+length|fl)\b[^\d\n]{0,20}(\d+(?:[.,]\d+)?)\s*(?:cm|mm)?/i],
  };

  return Object.fromEntries(
    Object.entries(patterns)
      .map(([name, patternList]) => [name, extractNumber(reportText, patternList)])
      .filter(([, value]) => value)
  );
}

async function readScanText(worker, file) {
  const original = await worker.recognize(file);
  const image = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = image.width * 2;
  canvas.height = image.height * 2;
  const context = canvas.getContext("2d");
  context.filter = "grayscale(1) contrast(1.5)";
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();
  const enhanced = await worker.recognize(canvas);
  return `${original.data.text}\n${enhanced.data.text}`;
}

function CBCInput({ name, label, unit, value, onChange }) {

  return (
    <div className="cbc-input">

      <label>{label}</label>

      <div>
        <input
          name={name}
          type="number"
          step="any"
          value={value}
          onChange={onChange}
          placeholder="From CBC report"
        />

        <span>{unit}</span>
      </div>

    </div>
  );
}

export default CBCAnalysis;