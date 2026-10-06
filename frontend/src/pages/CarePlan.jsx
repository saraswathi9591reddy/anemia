import PageLayout from "./PageLayout";

function CarePlan() {
	return <PageLayout title="My Care Plan" eyebrow="PERSONALIZED CARE" activePath="/dashboard" description="A simple plan to support your anemia care journey.">
		<div className="content-grid"><section className="content-card"><span className="card-kicker">THIS WEEK</span><h2>Build healthy routines</h2><ul className="check-list"><li>Take prescribed iron supplement after breakfast</li><li>Pair iron-rich foods with vitamin C</li><li>Rest and hydrate throughout the day</li></ul></section><section className="content-card"><span className="card-kicker">NEXT REVIEW</span><h2>Repeat CBC test</h2><p>Schedule a follow-up test in 4 weeks and share the result with your doctor.</p></section></div>
	</PageLayout>;
}

export default CarePlan;
