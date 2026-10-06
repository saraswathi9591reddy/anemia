import PageLayout from "./PageLayout";

function ProgressTracking() {
	return <PageLayout title="Progress Tracking" eyebrow="HEALTH TRENDS" activePath="/progress" description="Track your latest measurements and follow-up milestones.">
		<section className="content-card"><div className="progress-heading"><div><span className="card-kicker">HEMOGLOBIN</span><h2>9.2 g/dL</h2></div><span className="status-pill warning">Needs attention</span></div><div className="chart-placeholder"><span>10.1</span><span>9.6</span><strong>9.2</strong></div><p>Your next measurement will help show whether your care plan is working.</p></section>
	</PageLayout>;
}

export default ProgressTracking;
