import { useState } from "react";
import PageLayout from "./PageLayout";

function Feedback() {
	const [sent, setSent] = useState(false);
	return <PageLayout title="Feedback" eyebrow="HELP US IMPROVE" activePath="/dashboard" description="Tell us what would make your care experience better.">
		<section className="content-card">{sent ? <><h2>Thank you for your feedback.</h2><p>Your response has been recorded.</p></> : <><label className="field-label">How was your experience?</label><select className="search-input"><option>Very good</option><option>Good</option><option>Needs improvement</option></select><textarea className="note-input" placeholder="Share more details" /><button className="primary-btn" onClick={() => setSent(true)}>Submit Feedback</button></>}</section>
	</PageLayout>;
}

export default Feedback;
