import { useState } from "react";
import PageLayout from "./PageLayout";

function DoctorPatients() {
	const [search, setSearch] = useState("");
	const patients = ["Ananya Sharma", "Meera Patel", "Kavya Nair"];
	return <PageLayout title="Patients" eyebrow="PATIENT DIRECTORY" description="Search and open patient records for review.">
		<section className="content-card"><input className="search-input" placeholder="Search patients" value={search} onChange={(e) => setSearch(e.target.value)} />{patients.filter((name) => name.toLowerCase().includes(search.toLowerCase())).map((name) => <div className="list-row" key={name}><div><strong>{name}</strong><span>Last CBC: 12 Aug 2026</span></div><button className="secondary-btn">Open record</button></div>)}</section>
	</PageLayout>;
}

export default DoctorPatients;
