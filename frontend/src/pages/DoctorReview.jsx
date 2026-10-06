import PageLayout from "./PageLayout";

function DoctorReview() {
	return <PageLayout title="Report Review" eyebrow="CLINICAL REVIEW" description="Review flagged screening results and add a clinical note.">
		<section className="content-card"><div className="list-row"><div><strong>Ananya Sharma</strong><span>Hemoglobin 9.2 g/dL • Moderate risk</span></div><span className="status-pill warning">Needs review</span></div><textarea className="note-input" placeholder="Add a note for the patient" /><button className="primary-btn">Save Review</button></section>
	</PageLayout>;
}

export default DoctorReview;
