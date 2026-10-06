import { useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";

function Consultation() {
	const navigate = useNavigate();
	return (
		<PageLayout title="Consultation" eyebrow="CARE CONNECT" activePath="/appointments" description="Prepare for your next conversation with a healthcare professional.">
			<section className="content-card">
				<span className="card-kicker">UPCOMING CONSULTATION</span>
				<h2>Dr. Ananya Rao</h2>
				<p>General Physician • Video consultation • Tomorrow at 10:30 AM</p>
				<div className="action-row">
					<button className="primary-btn" onClick={() => alert("Your consultation room will open at the scheduled time.")}>Join Consultation</button>
					<button className="secondary-btn" onClick={() => navigate("/appointments")}>View Appointments</button>
				</div>
			</section>
			<section className="content-card">
				<h2>What to keep ready</h2>
				<ul className="check-list"><li>Your latest CBC report</li><li>Current medicines and supplements</li><li>Questions about symptoms or pregnancy care</li></ul>
			</section>
		</PageLayout>
	);
}

export default Consultation;
