import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";

const anemiaWords = ["tired", "fatigue", "weak", "dizzy", "breathless", "breath", "pale", "headache", "heartbeat", "palpitation"];
const questions = [
  "How are you feeling today? You can describe anything you have noticed in your own words.",
  "Have you felt unusually tired, weak, dizzy, or short of breath recently?",
  "How many weeks pregnant are you?",
  "Have you been taking your prenatal vitamins or iron supplements?"
];

function HealthCheck() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => JSON.parse(localStorage.getItem("momucooProfile") || JSON.stringify({ name: "there" })));
  const [messages, setMessages] = useState(() => [{ from: "bot", text: `Hi ${profile.name}, I’m Momucoo. I’m here to listen and help you understand your early-pregnancy symptoms.` }, { from: "bot", text: questions[0] }]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [symptoms, setSymptoms] = useState([]);
  const [week, setWeek] = useState("");
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const updateProfile = () => setProfile(JSON.parse(localStorage.getItem("momucooProfile") || JSON.stringify({ name: "there" })));
    window.addEventListener("momucoo-profile-updated", updateProfile);
    return () => window.removeEventListener("momucoo-profile-updated", updateProfile);
  }, []);

  const addMessage = (from, text) => setMessages((current) => [...current, { from, text }]);
  const send = (value = input) => {
    const answer = value.trim();
    if (!answer || finished) return;
    addMessage("user", answer);
    setInput("");

    if (step === 0) {
      const found = anemiaWords.filter((word) => answer.toLowerCase().includes(word));
      setSymptoms(found);
      addMessage("bot", found.length ? `Thank you for sharing that. I noticed ${found.length > 1 ? "a few symptoms" : "a symptom"} that can sometimes be linked with low iron or anemia. I’ll ask two quick questions to understand better.` : "Thank you for sharing that. Every detail helps, and I’ll ask a couple of gentle questions next.");
    } else if (step === 1) {
      const positive = /yes|often|sometimes|frequently|a lot/i.test(answer);
      if (positive) setSymptoms((current) => [...new Set([...current, "tired or dizzy"])]);
      addMessage("bot", "Got it. Knowing your pregnancy stage will help us read your blood results more carefully.");
    } else if (step === 2) {
      setWeek(answer);
      addMessage("bot", "Thanks. One last question: " + questions[3]);
    } else {
      const positive = /yes|taking|regular/i.test(answer);
      addMessage("bot", positive ? "That’s good to know. Please continue only as advised by your prenatal care provider." : "Thanks for telling me. Please discuss supplements with your prenatal care provider before starting or changing them.");
      localStorage.setItem("pregnancyData", JSON.stringify({ week: Number.parseInt(week, 10) || null, symptoms, chatTranscript: [...messages, { from: "user", text: answer }], createdAt: new Date().toISOString() }));
      setFinished(true);
      return;
    }
    const nextStep = step + 1;
    setStep(nextStep);
    if (nextStep === 1) addMessage("bot", questions[1]);
    if (nextStep === 2) addMessage("bot", questions[2]);
  };

  return <PageLayout title="Health Check" eyebrow="MOMUCOO AI CHAT" activePath="/health-check" description="Talk naturally about how you feel. Momucoo will ask friendly anemia-related questions before your report review.">
    <section className="chat-card full-chat-card">
      <div className="chat-intro"><div className="chat-avatar">M</div><div><strong>Momucoo AI</strong><span>Friendly pregnancy health assistant • Online</span></div></div>
      <div className="chat-history">{messages.map((message, index) => <div className={`chat-bubble ${message.from}`} key={`${message.from}-${index}`}>{message.text}</div>)}{finished && <div className="chat-bubble bot"><strong>Preliminary insight</strong><br />Your symptoms have been recorded. Symptoms alone cannot diagnose anemia, so let’s combine them with your CBC values and optional scan report.</div>}</div>
      {!finished ? <><div className="chat-composer"><input className="chat-input" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && send()} placeholder="Type how you feel..." /><button className="send-chat" onClick={() => send()} aria-label="Send message">➤</button></div><div className="quick-replies">{step === 1 && ["Yes, quite often", "Sometimes", "No, not really"].map((reply) => <button key={reply} onClick={() => send(reply)}>{reply}</button>)}{step === 3 && ["Yes, regularly", "Sometimes", "Not currently"].map((reply) => <button key={reply} onClick={() => send(reply)}>{reply}</button>)}</div></> : <button className="primary-btn chat-next" onClick={() => navigate("/cbc-analysis")}>Continue to Blood & Scan Reports →</button>}
      <div className="chat-safety">Momucoo offers screening support, not a diagnosis. For severe symptoms, use Emergency Help.</div>
    </section>
  </PageLayout>;
}

export default HealthCheck;
