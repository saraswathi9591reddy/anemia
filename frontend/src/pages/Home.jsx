import { useNavigate } from "react-router-dom";
import "../App.css";

function Home() {
  const navigate = useNavigate();

  return (
    <main className="momucoo-home">
      <nav className="home-nav">
        <button className="home-brand" onClick={() => navigate("/")}>🩸 Momucoo</button>
        <div className="home-nav-right"><span className="home-online"><i></i> Your pregnancy care space</span><button className="home-login-link" onClick={() => navigate("/login")}>Login ↗</button></div>
      </nav>
      <section className="home-hero">
        <div className="home-copy">
          <span className="home-kicker">FOR THE FIRST TRIMESTER GIRLIES ✨</span>
          <h1>Pregnancy care, but make it simple.</h1>
          <p>Your symptoms deserve a space that listens. Chat with Momucoo, understand your CBC, save scan reports, and get clear next steps without the medical-word overload.</p>
          <div className="home-actions">
            <button className="home-primary" onClick={() => navigate("/register")}>Start my care era →</button>
            <button className="home-secondary" onClick={() => navigate("/login")}>I’m already in</button>
          </div>
        </div>
        <div className="home-visual"><div className="home-orbit orbit-one"></div><div className="home-orbit orbit-two"></div><span>🤰</span><strong>soft care only ♡</strong><em>01<br /><small>check in</small></em></div>
      </section>
      <section className="home-features"><article><span>💬</span><small>01 / TALK IT OUT</small><strong>Friendly AI chat</strong><p>Say what you’re feeling in your own words. No judgement, no weird medical jargon.</p></article><article><span>🩸</span><small>02 / KNOW YOUR NUMBERS</small><strong>CBC made less confusing</strong><p>Keep blood values and optional pregnancy scans together in one clear report.</p></article><article><span>🌱</span><small>03 / FEEL PREPARED</small><strong>Small steps, big calm</strong><p>Get practical nutrition, risk, and emergency guidance for your next move.</p></article></section>
      <div className="home-note">built for early pregnancy • private by design • always learning with you</div>
    </main>
  );
}

export default Home;
