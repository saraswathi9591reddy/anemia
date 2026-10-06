import { useState } from "react";
import PageLayout from "./PageLayout";

function Reminders() {
	const [reminders, setReminders] = useState([{ text: "Take iron supplement", time: "08:30 AM", done: false }, { text: "Drink a glass of water", time: "11:00 AM", done: true }, { text: "Prepare for doctor consultation", time: "Tomorrow", done: false }]);
	const toggle = (index) => setReminders((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, done: !item.done } : item));
	return <PageLayout title="Reminders" eyebrow="DAILY CARE" activePath="/dashboard" description="Small reminders to keep your care plan moving."><section className="content-card">{reminders.map((reminder, index) => <button className={`list-row reminder-row ${reminder.done ? "done" : ""}`} key={reminder.text} onClick={() => toggle(index)}><span className="reminder-check">{reminder.done ? "✓" : "○"}</span><div><strong>{reminder.text}</strong><span>{reminder.time}</span></div></button>)}</section></PageLayout>;
}

export default Reminders;
