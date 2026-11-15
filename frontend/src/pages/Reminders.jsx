import { useState, useEffect, useRef } from 'react';
import { 
  Bell, BellRing, CheckCircle2, Circle, Clock, Plus, Trash2, 
  Sparkles, Check, X, Volume2, ShieldCheck, PlayCircle, AlertCircle,
  Droplets, Pill, Utensils, HeartPulse, Send
} from 'lucide-react';
import PageLayout from './PageLayout';

// Synthesize pleasant, crisp Instagram/iOS style notification chime
function playChimeSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Chime Note 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5
    gain1.gain.setValueAtTime(0.5, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Chime Note 2 (High bell harmonic)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1318.5, now + 0.08); // E6
    gain2.gain.setValueAtTime(0.35, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.8);
  } catch (err) {
    console.warn('Audio play note:', err);
  }
}

const INITIAL_REMINDERS = [
  { id: 1, text: '💧 Time to drink 1 glass of fresh water (Hydration)', time: '10:00 AM', category: 'Hydration', done: true },
  { id: 2, text: '💊 Take prescribed iron tablet with orange juice', time: '01:00 PM', category: 'Medication', done: false },
  { id: 3, text: '🥗 Healthy snack: Pumpkin seeds or dried apricots', time: '04:30 PM', category: 'Diet', done: false },
  { id: 4, text: '🩺 Check fetal kicks and take a light prenatal walk', time: '07:00 PM', category: 'Activity', done: false },
];

function Reminders() {
  const [reminders, setReminders] = useState(INITIAL_REMINDERS);
  const [newText, setNewText] = useState('');
  const [newTime, setNewTime] = useState('');
  const [permissionStatus, setPermissionStatus] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  
  // Instagram / Mobile Push style banner notification state
  const [pushBanner, setPushBanner] = useState(null);
  const swRegRef = useRef(null);

  // Register Service Worker for true Windows background push
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        swRegRef.current = reg;
      }).catch(() => {});
    }

    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // Main Notification Trigger
  const triggerPushNotification = async (title, body) => {
    // 1. Play crystal bell chime sound
    playChimeSound();

    // 2. Hardware vibration (if on mobile or supported laptop)
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200]);
      } catch {}
    }

    // 3. Instagram / iOS style top drop-down push notification banner
    setPushBanner({
      title,
      body,
      time: 'Just now',
      id: Date.now()
    });

    // 4. Send true OS Desktop Notification
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          if (swRegRef.current && swRegRef.current.showNotification) {
            await swRegRef.current.showNotification(title, {
              body,
              icon: '/logo.png',
              badge: '/logo.png',
              tag: 'reminder-' + Date.now(),
              requireInteraction: true,
              vibrate: [200, 100, 200]
            });
          } else {
            const notif = new Notification(title, {
              body,
              icon: '/logo.png',
              requireInteraction: true
            });
            notif.onclick = () => {
              window.focus();
              notif.close();
            };
          }
        } catch (e) {
          console.warn('System notification delivery:', e);
        }
      }
    }
  };

  const requestPermissionAndSend = async () => {
    if (!('Notification' in window)) {
      triggerPushNotification('AnemiaAI Reminder', '💧 Time to drink water! Keep your hydration on track.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission === 'granted') {
        triggerPushNotification(
          '🔔 Notifications Activated!',
          '💧 Time to drink water! You will now receive alerts for all your daily care tasks.'
        );
      } else {
        // Fallback: In-app Instagram-style banner always fires!
        triggerPushNotification(
          '💧 Drink Water Reminder',
          'Remember to drink 1 glass of water now to stay hydrated and support healthy blood circulation!'
        );
      }
    } catch {
      triggerPushNotification('💧 Drink Water Reminder', 'Time to hydrate! Drink a glass of fresh water now.');
    }
  };

  const toggle = (id) => {
    setReminders(items => items.map(item => {
      if (item.id === id) {
        const nextState = !item.done;
        if (nextState) {
          triggerPushNotification('✅ Reminder Completed & Scheduled', item.text);
        }
        return { ...item, done: nextState };
      }
      return item;
    }));
  };

  const remove = (id, e) => {
    e.stopPropagation();
    const item = reminders.find(r => r.id === id);
    setReminders(items => items.filter(item => item.id !== id));
    if (item) {
      triggerPushNotification('🗑️ Task Removed', `"${item.text}" removed from your schedule.`);
    }
  };

  const addReminder = (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    const reminderTime = newTime.trim() || 'Daily';
    const item = {
      id: Date.now(),
      text: newText.trim(),
      time: reminderTime,
      category: 'Care',
      done: true
    };
    setReminders(prev => [item, ...prev]);
    triggerPushNotification('🔔 New Care Alert Added', `"${item.text}" scheduled for ${reminderTime}.`);
    setNewText('');
    setNewTime('');
  };

  return (
    <PageLayout 
      title="Daily Care Reminders" 
      activePath="/reminders" 
      description="Live push notifications for hydration, iron supplements, and pregnancy health."
    >
      {/* ========================================================================= */}
      {/* INSTAGRAM / MOBILE STYLE PUSH NOTIFICATION DROPDOWN BANNER (TOP OF SCREEN) */}
      {/* ========================================================================= */}
      {pushBanner && (
        <div style={{
          position: 'fixed',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999999,
          width: '90%',
          maxWidth: 480,
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid #E5E7EB',
          borderRadius: 20,
          padding: '14px 18px',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.22), 0 4px 12px rgba(192, 57, 43, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          animation: 'slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'pointer'
        }}
        onClick={() => setPushBanner(null)}
        >
          {/* App Icon */}
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #C0392B 0%, #E74C3C 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 10px rgba(192, 57, 43, 0.3)'
          }}>
            <BellRing size={22} color="#FFFFFF" />
          </div>

          {/* Notification Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#C0392B', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                AnemiaAI • Reminder
              </span>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>{pushBanner.time}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', margin: '1px 0' }}>
              {pushBanner.title}
            </div>
            <div style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.35 }}>
              {pushBanner.body}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={(e) => { e.stopPropagation(); setPushBanner(null); }}
            style={{
              background: '#F3F4F6',
              border: 'none',
              borderRadius: '50%',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#6B7280',
              flexShrink: 0
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Hero Notification Trigger Box */}
      <div style={{
        background: 'linear-gradient(135deg, #FFF5F2 0%, #FFF9F6 100%)',
        border: '1.5px solid #F5D5CB',
        borderRadius: 16,
        padding: '24px 28px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: '0 4px 16px rgba(192, 57, 43, 0.06)'
      }}>
        <div style={{ maxWidth: 560 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#C0392B', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>
            <Sparkles size={16} />
            Instant Care Push Alerts
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1F2937', margin: '0 0 6px 0' }}>
            Instant Notification Center (Instagram Style)
          </h2>
          <p style={{ fontSize: 13, color: '#4B5563', margin: 0, lineHeight: 1.5 }}>
            Click the button below to test a live notification alert with sound and top push banner!
          </p>
        </div>

        {/* Big Clickable Action Button */}
        <button
          type="button"
          onClick={requestPermissionAndSend}
          className="btn-submit"
          style={{
            width: 'auto',
            padding: '14px 26px',
            background: '#C0392B',
            color: '#FFFFFF',
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(192, 57, 43, 0.28)',
            border: 'none'
          }}
        >
          <BellRing size={20} />
          <span>Send "Drink Water" Notification Now!</span>
        </button>
      </div>

      {/* Permission Status Indicator */}
      {permissionStatus === 'denied' && (
        <div className="alert alert-error" style={{ marginBottom: 20 }}>
          <AlertCircle size={18} />
          <div>
            <strong>Desktop Notifications Blocked in Chrome/Edge:</strong> In your browser address bar next to <code>localhost:5173</code>, click the <strong>🔒 Lock icon</strong>, set <strong>Notifications</strong> to <strong>Allow</strong>, and refresh the page.
          </div>
        </div>
      )}

      {/* Add Reminder Card */}
      <div className="section-card" style={{ marginBottom: 24, borderRadius: 14, padding: '22px 26px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 8, color: '#1F2937' }}>
          <Plus size={18} color="#C0392B" />
          Add Custom Care Reminder
        </h3>
        <form onSubmit={addReminder} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="e.g. Drink 1 glass of water with electrolytes"
            value={newText}
            onChange={e => setNewText(e.target.value)}
            style={{
              flex: '1 1 280px',
              padding: '12px 16px',
              borderRadius: 8,
              border: '1px solid #D1D5DB',
              fontSize: 14
            }}
          />
          <input
            type="text"
            placeholder="Time (e.g. 11:30 AM)"
            value={newTime}
            onChange={e => setNewTime(e.target.value)}
            style={{
              width: 170,
              padding: '12px 16px',
              borderRadius: 8,
              border: '1px solid #D1D5DB',
              fontSize: 14
            }}
          />
          <button
            type="submit"
            className="btn-submit"
            style={{
              width: 'auto',
              padding: '12px 24px',
              borderRadius: 8,
              background: '#C0392B',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            Add & Notify
          </button>
        </form>
      </div>

      {/* Reminders List */}
      <div className="section-card" style={{ marginBottom: 0, borderRadius: 14, padding: '22px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#1F2937' }}>
              <Bell size={18} color="#C0392B" />
              Scheduled Care Tasks
            </h3>
            <span style={{ fontSize: 13, color: '#6B7280' }}>
              Click on any reminder to select it, or click "Send Notification" to trigger its alert right now.
            </span>
          </div>

          <span style={{ 
            fontSize: 12, 
            fontWeight: 700, 
            background: '#FEF2F2', 
            color: '#B91C1C', 
            padding: '4px 12px', 
            borderRadius: 14 
          }}>
            {reminders.filter(r => r.done).length} active of {reminders.length} total
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              onClick={() => toggle(reminder.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderRadius: 12,
                border: '1.5px solid',
                borderColor: reminder.done ? '#22C55E' : '#E5E7EB',
                background: reminder.done ? '#F0FDF4' : '#FFFFFF',
                boxShadow: reminder.done ? '0 4px 12px rgba(34, 197, 94, 0.08)' : '0 2px 6px rgba(0,0,0,0.02)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                gap: 16
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {reminder.done ? (
                  <div style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: '#22C55E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Check size={16} color="#FFFFFF" strokeWidth={3} />
                  </div>
                ) : (
                  <div style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    border: '2px solid #CBD5E1',
                    background: '#FFFFFF',
                    flexShrink: 0
                  }} />
                )}

                <div>
                  {/* Clean text strictly with NO strike-through line */}
                  <div style={{
                    fontSize: 15,
                    fontWeight: reminder.done ? 700 : 500,
                    color: reminder.done ? '#15803D' : '#1F2937',
                    textDecoration: 'none'
                  }}>
                    {reminder.text}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6B7280' }}>
                      <Clock size={13} />
                      {reminder.time}
                    </span>

                    {reminder.done && (
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#15803D',
                        background: '#DCFCE7',
                        padding: '2px 8px',
                        borderRadius: 10
                      }}>
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Instant Notify Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerPushNotification('⏰ AnemiaAI Care Alert', reminder.text);
                  }}
                  title="Notify now"
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    borderRadius: 8,
                    padding: '8px 14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13,
                    color: '#B91C1C',
                    fontWeight: 700
                  }}
                >
                  <Send size={13} />
                  <span>Notify Now</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => remove(reminder.id, e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9CA3AF',
                    cursor: 'pointer',
                    padding: 6,
                    borderRadius: 6,
                    transition: 'color 0.2s ease'
                  }}
                  title="Remove reminder"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}

export default Reminders;
