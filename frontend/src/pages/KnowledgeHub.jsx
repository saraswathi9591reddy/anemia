import { useState } from "react";
import PageLayout from "./PageLayout";

function KnowledgeHub() {
	const [openTopic, setOpenTopic] = useState(null);
	const topics = [
		["🩸", "Anemia during pregnancy", "Anemia means the blood may not carry enough oxygen. During pregnancy, your body needs more iron to support you and your baby. Screening and follow-up help catch low iron early."],
		["🛡️", "Precautions and warning signs", "Attend scheduled prenatal checkups, take only supplements recommended for you, and share worsening fatigue, dizziness, breathlessness, paleness, or racing heartbeat with your care provider. For fainting, chest pain, severe breathlessness, or heavy bleeding, seek emergency help."],
		["🥗", "Pregnancy-friendly diet", "Include iron-rich foods such as lentils, beans, leafy greens, eggs, meat, and fortified foods. Pair plant-based iron with vitamin C from oranges, guava, tomatoes, or peppers. Tea and coffee close to meals may reduce iron absorption."],
		["📞", "Contacting your care provider", "Keep your CBC and scan reports ready, explain when symptoms started, and mention every medicine or supplement you take. Use Momucoo reports as a conversation aid, not as a replacement for professional prenatal care."],
		["📊", "Understanding CBC reports", "Hemoglobin shows oxygen-carrying protein, RBC is the red blood cell count, MCV describes cell size, and MCH describes hemoglobin per cell. Pregnancy reference ranges can differ by trimester, so your provider should interpret the full report together."]
	];
	return <PageLayout title="Knowledge Hub" eyebrow="PREGNANCY HEALTH EDUCATION" activePath="/dashboard" description="Simple, reliable guidance for understanding anemia and caring for yourself during pregnancy."><div className="knowledge-intro"><strong>Learn at your pace</strong><span>Open a guide to read practical information before your next checkup.</span></div><div className="content-grid knowledge-grid">{topics.map(([icon, title, text], index) => <article className={`content-card knowledge-card ${openTopic === index ? "open" : ""}`} key={title}><div className="knowledge-icon">{icon}</div><span className="card-kicker">PREGNANCY GUIDE</span><h2>{title}</h2><p>{openTopic === index ? text : `${text.slice(0, 92)}...`}</p><button className="text-btn" onClick={() => setOpenTopic(openTopic === index ? null : index)}>{openTopic === index ? "Close guide ↑" : "Read guide →"}</button></article>)}</div></PageLayout>;
}

export default KnowledgeHub;
