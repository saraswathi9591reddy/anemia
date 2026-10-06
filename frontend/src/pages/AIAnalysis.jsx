import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";

function AIAnalysis() {

  const navigate = useNavigate();

  const [result, setResult] = useState(null);

  useEffect(() => {

    const cbc = JSON.parse(localStorage.getItem("cbcData") || "{}");
    const pregnancy = JSON.parse(localStorage.getItem("pregnancyData") || "{}");
    const scan = JSON.parse(localStorage.getItem("scanData") || "{}");
    const symptoms = pregnancy.symptoms || JSON.parse(localStorage.getItem("symptoms") || "[]");

    const hb = Number(cbc.hb) || 0;
    const mcv = Number(cbc.mcv) || 0;
    const mch = Number(cbc.mch) || 0;
    const hct = Number(cbc.hematocrit) || 0;
    const rbc = Number(cbc.rbc) || 0;

    const anemiaLikely = hb > 0 && (hb < 11 || (mcv > 0 && mcv < 80) || (mch > 0 && mch < 27) || (hct > 0 && hct < 33) || (rbc > 0 && rbc < 3.8));
    const anemiaStatus = anemiaLikely ? "Anemia likely" : "No anemia detected";

    let score = 0;
    const factors = [];

    if (hb > 0 && hb < 11) {
      score += 35;
      factors.push("Hemoglobin is below the usual pregnancy reference range.");
    } else if (hb > 0) {
      factors.push("Hemoglobin is within a healthier pregnancy range.");
    }

    if (mcv > 0 && mcv < 80) {
      score += 20;
      factors.push("MCV is low, which can support a microcytic anemia pattern.");
    }

    if (mch > 0 && mch < 27) {
      score += 15;
      factors.push("MCH is low.");
    }

    if (hct > 0 && hct < 33) {
      score += 10;
      factors.push("Hematocrit is lower than expected for pregnancy.");
    }

    score += Math.min(symptoms.length * 5, 25);

    if (symptoms.length > 0) {
      factors.push(`${symptoms.length} symptom(s) were reported.`);
    }

    if (pregnancy.week) factors.push(`Pregnancy week ${pregnancy.week} was included in the screening context.`);
    if (scan.uploaded) factors.push(`Optional scan report selected: ${scan.name}. A clinician should review the original scan.`);

    let risk = "Low";

    if (score >= 60 || anemiaLikely && score >= 45) risk = "High";
    else if (score >= 30 || anemiaLikely) risk = "Moderate";

    setResult({
      score: Math.min(score, 100),
      risk,
      anemiaLikely,
      anemiaStatus,
      factors,
      scan,
      recommendations: risk === "High" ? ["Contact your prenatal care provider promptly with this result.", "Choose iron-rich foods with vitamin C as part of a clinician-approved diet.", "For severe breathlessness, fainting, chest pain, or heavy bleeding, call emergency services."] : ["Continue your prenatal care plan and repeat testing as advised.", "Discuss nutrition and supplements with your prenatal care provider."]
    });
    localStorage.setItem("aiResult", JSON.stringify({ score: Math.min(score, 100), risk, anemiaStatus, completedAt: new Date().toISOString() }));

  }, []);

  if (!result) {
    return <div className="loading-screen">🤖 Analyzing...</div>;
  }

  return (
    <PageLayout title="AI Health Analysis" eyebrow="HEMACARE AI ENGINE" activePath="/ai-analysis" description="A preliminary screening based on your symptoms and CBC information.">
      <section className="ai-result-card">
        <div className="risk-circle"><strong>{result.score}</strong><span>/100</span></div>
        <div className="ai-result-copy"><span className="card-kicker">SCREENING RESULT</span><h2>{result.risk} Risk</h2><p>{result.anemiaLikely ? "This CBC pattern is consistent with anemia risk and should be reviewed by a clinician." : "This CBC pattern does not suggest anemia based on the entered values."}</p></div>
        <span className={`status-pill ${result.risk === "Low" ? "success" : "warning"}`}>{result.anemiaStatus}</span>
      </section>
      <section className="content-card factor-card">
        <div className="card-heading"><h2>Pregnancy scan report</h2><span>{result.scan.uploaded ? "UPLOADED" : "NOT UPLOADED"}</span></div>
        {result.scan.uploaded ? <>
          <p>File: {result.scan.name}</p>
          <div className="cbc-result-grid">
            <ScanValue label="Gestational age" value={result.scan.values?.gestationalAge} />
            <ScanValue label="Fetal heart rate" value={result.scan.values?.fetalHeartRate} unit="bpm" />
            <ScanValue label="Estimated fetal weight" value={result.scan.values?.estimatedWeight} unit="g" />
            <ScanValue label="BPD" value={result.scan.values?.biparietalDiameter} />
            <ScanValue label="Head circumference" value={result.scan.values?.headCircumference} />
            <ScanValue label="Abdominal circumference" value={result.scan.values?.abdominalCircumference} />
            <ScanValue label="Femur length" value={result.scan.values?.femurLength} />
          </div>
        </> : <p>No pregnancy scan was uploaded.</p>}
      </section>
      <section className="content-card factor-card"><div className="card-heading"><h2>🔍 What influenced your result?</h2><span>{result.factors.length} FACTORS</span></div>{result.factors.length === 0 ? <p>No major factors detected from the entered information.</p> : result.factors.map((factor, index) => <div className="factor-row" key={index}><span>✓</span><p>{factor}</p></div>)}</section>
      <section className="content-card recommendation-card"><span className="card-kicker">NEXT STEPS</span><h2>Care recommendations</h2>{result.recommendations.map((recommendation) => <p className="recommendation-row" key={recommendation}>→ {recommendation}</p>)}<div className="action-row"><button className="secondary-btn" onClick={() => navigate("/care-plan")}>View Nutrition Plan</button><button className="secondary-btn" onClick={() => navigate("/emergency")}>Emergency Help</button></div></section>
      <div className="ai-actions"><button className="secondary-btn" onClick={() => navigate("/cbc-analysis")}>← Review CBC</button><button className="primary-btn" onClick={() => navigate("/feedback")}>Share Feedback →</button></div>
    </PageLayout>
  );
}

function ScanValue({ label, value, unit = "" }) {
  return <div className="cbc-result-item"><strong>{label}</strong><span>{value || "Not detected"} <small>{unit}</small></span></div>;
}

export default AIAnalysis;