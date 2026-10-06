import { useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";

function DoctorDashboard() {
	const navigate = useNavigate();
	return <PageLayout title="Doctor Dashboard" eyebrow="CLINIC OVERVIEW" description="Review patient activity and follow-ups in one place.">
		<div className="stats-grid"><div className="stat-card"><strong>24</strong><span>Active patients</span></div><div className="stat-card"><strong>8</strong><span>Today's appointments</span></div><div className="stat-card"><strong>5</strong><span>Reports to review</span></div></div>
		<section className="content-card"><h2>Quick actions</h2><div className="action-row"><button className="primary-btn" onClick={() => navigate("/doctor-patients")}>View Patients</button><button className="secondary-btn" onClick={() => navigate("/doctor-review")}>Review Reports</button></div></section>
	</PageLayout>;
}

export default DoctorDashboard;
