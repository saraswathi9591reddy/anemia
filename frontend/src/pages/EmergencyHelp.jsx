import PageLayout from "./PageLayout";

function EmergencyHelp() {
	return <PageLayout title="Emergency Help" eyebrow="URGENT SUPPORT" activePath="/dashboard" description="Get immediate help when symptoms feel severe or sudden.">
		<section className="urgent-card"><span>🚨</span><div><h2>Call emergency services</h2><p>If you have chest pain, severe breathlessness, fainting, or heavy bleeding, call your local emergency number now.</p><a href="tel:112">Call 112</a></div></section>
		<section className="content-card"><h2>Non-urgent support</h2><p>For questions about your results, contact your doctor or book a consultation.</p></section>
	</PageLayout>;
}

export default EmergencyHelp;
