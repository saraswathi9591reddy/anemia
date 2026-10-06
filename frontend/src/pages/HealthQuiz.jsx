import { useState } from "react";
import PageLayout from "./PageLayout";

function HealthQuiz() {
	const [answer, setAnswer] = useState("");
	return <PageLayout title="Health Quiz" eyebrow="LEARN ABOUT ANEMIA" activePath="/dashboard" description="Answer a few questions to strengthen your health knowledge.">
		<section className="content-card"><span className="card-kicker">QUESTION 1 OF 3</span><h2>Which nutrient helps the body make hemoglobin?</h2>{["Iron", "Calcium", "Vitamin D"].map((option) => <button className={`quiz-option ${answer === option ? "selected" : ""}`} key={option} onClick={() => setAnswer(option)}>{option}</button>)}{answer && <p className="success-text">{answer === "Iron" ? "Correct. Iron is essential for hemoglobin production." : "Not quite. Try reviewing the Knowledge Hub."}</p>}</section>
	</PageLayout>;
}

export default HealthQuiz;
