import PageLayout from "./PageLayout";

function HealthJourney() {
	return <PageLayout title="Health Journey" eyebrow="YOUR PROGRESS" activePath="/progress" description="See the milestones you have completed on your care journey.">
		<section className="content-card"><div className="journey-step complete"><strong>01</strong><div><h2>Health check completed</h2><p>Symptoms recorded on 03 Sep 2026</p></div></div><div className="journey-step complete"><strong>02</strong><div><h2>CBC report analyzed</h2><p>Latest hemoglobin: 9.2 g/dL</p></div></div><div className="journey-step"><strong>03</strong><div><h2>Consult a doctor</h2><p>Book a consultation to discuss your results.</p></div></div></section>
	</PageLayout>;
}

export default HealthJourney;
