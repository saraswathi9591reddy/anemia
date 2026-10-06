import { useState } from "react";
import PageLayout from "./PageLayout";

function PatientProfile() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("momucooProfile") || "null");
    const pregnancy = JSON.parse(localStorage.getItem("pregnancyData") || "null");
    return stored || { name: "Ananya Sharma", age: "21 Years", gender: "Female", bloodGroup: "O+", pregnancyStatus: "Pregnant", pregnancyWeek: pregnancy?.week || "", dueDate: "" };
  });

  const update = (event) => {
    setProfile({ ...profile, [event.target.name]: event.target.value });
    setSaved(false);
  };
  const saveProfile = () => {
    localStorage.setItem("momucooProfile", JSON.stringify(profile));
    const pregnancy = JSON.parse(localStorage.getItem("pregnancyData") || "{}");
    localStorage.setItem("pregnancyData", JSON.stringify({ ...pregnancy, week: Number(profile.pregnancyWeek) || pregnancy.week || null }));
    window.dispatchEvent(new Event("momucoo-profile-updated"));
    setEditing(false);
    setSaved(true);
  };

  return (
    <PageLayout title="My Profile" eyebrow="PATIENT PROFILE" activePath="/profile" description="Keep your personal and health information up to date.">
      <section className="profile-hero">
        <div className="profile-avatar">{profile.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div>
        <div><span className="card-kicker">PATIENT ACCOUNT</span><h2>{profile.name}</h2><p>ananya.sharma@example.com</p></div>
        <button className="secondary-btn" onClick={() => editing ? saveProfile() : setEditing(true)}>{editing ? "Save Profile" : "✎ Edit Profile"}</button>
      </section>
      {saved && <p className="edit-notice">Your profile was updated successfully.</p>}
      <div className="profile-grid">
        <ProfileCard title="👤 Personal Information" items={[["name", "Full Name", profile.name, "text"], ["age", "Age", profile.age, "text"], ["gender", "Gender", profile.gender, "text"]]} editing={editing} onChange={update} />
        <ProfileCard title="🩸 Blood Group" items={[["bloodGroup", "Blood Group", profile.bloodGroup, "text"]]} editing={editing} onChange={update} />
        <ProfileCard title="🤰 Pregnancy Details" items={[["pregnancyStatus", "Pregnancy Status", profile.pregnancyStatus || "Pregnant", "text"], ["pregnancyWeek", "Weeks Pregnant", profile.pregnancyWeek || "Not entered", "number"], ["dueDate", "Expected Due Date", profile.dueDate || "Not entered", "date"]]} editing={editing} onChange={update} />
      </div>
    </PageLayout>
  );
}

function ProfileCard({ title, items, editing, onChange }) {
  return <section className="profile-card"><h2>{title}</h2>{items.map(([name, label, value, type]) => <div className="profile-info" key={name}><span>{label}</span>{editing ? <input className="profile-input" name={name} type={type} value={value === "Not entered" ? "" : value} onChange={onChange} /> : <strong>{value}</strong>}</div>)}</section>;
}

export default PatientProfile;