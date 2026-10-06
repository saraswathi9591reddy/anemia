import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";

function FindDoctor() {

  const navigate = useNavigate();

  const doctors = [
    {
      name: "Dr. Ananya Rao",
      specialty: "General Physician",
      experience: "12 years",
      rating: "4.9",
      available: "Today"
    },
    {
      name: "Dr. Rahul Sharma",
      specialty: "Hematologist",
      experience: "15 years",
      rating: "4.8",
      available: "Tomorrow"
    },
    {
      name: "Dr. Priya Menon",
      specialty: "Internal Medicine",
      experience: "10 years",
      rating: "4.7",
      available: "Today"
    }
  ];

  const [search, setSearch] = useState("");

  const filtered = doctors.filter((doctor) =>
    `${doctor.name} ${doctor.specialty}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <PageLayout title="Find the right doctor" eyebrow="CARE CONNECT" activePath="/find-doctor" description="Connect with a healthcare professional for a closer review of your screening results.">
      <div className="doctor-search"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by doctor or specialty" /></div>
      <div className="doctor-grid">

        {filtered.map((doctor) => (

          <div className="doctor-profile-card" key={doctor.name}>

            <div className="doctor-avatar">👨‍⚕️</div>

            <div className="doctor-info">

              <h2>{doctor.name}</h2>

              <p className="specialty">
                {doctor.specialty}
              </p>

              <div className="doctor-meta">
                ⭐ {doctor.rating}
                <span>•</span>
                {doctor.experience}
              </div>

              <div className="available">
                🟢 Available {doctor.available}
              </div>

              <button className="primary-btn" onClick={() => navigate("/appointments")}>Book Appointment →</button>

            </div>

          </div>

        ))}

      </div>
      {filtered.length === 0 && <section className="content-card empty-state"><h2>No doctors found</h2><p>Try a different name or specialty.</p></section>}
    </PageLayout>
  );
}

export default FindDoctor;