import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";

function Appointments() {
	const navigate = useNavigate();
	const [booked, setBooked] = useState(false);
	return <PageLayout title="Appointments" eyebrow="CARE CONNECT" activePath="/appointments" description="Manage your upcoming conversations with healthcare professionals.">
		<section className="content-card"><div className="list-row"><div><strong>Dr. Ananya Rao</strong><span>General Physician • Tomorrow, 10:30 AM • Video</span></div><span className="status-pill success">Confirmed</span></div><div className="action-row"><button className="primary-btn" onClick={() => navigate("/consultation")}>View Consultation</button><button className="secondary-btn" onClick={() => setBooked(true)}>Reschedule</button></div>{booked && <p className="success-text">Rescheduling options will be sent to your registered contact.</p>}</section>
		<section className="content-card"><h2>Need a new appointment?</h2><p>Find a doctor based on specialty, availability, and experience.</p><button className="secondary-btn" onClick={() => navigate("/find-doctor")}>Find a Doctor →</button></section>
	</PageLayout>;
}

export default Appointments;
