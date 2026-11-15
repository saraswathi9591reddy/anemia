import { useState, useEffect, useRef } from 'react';
import { 
  Bell, BellRing, CheckCircle2, Circle, Clock, Plus, Trash2, 
  Sparkles, Check, X, Volume2, ShieldCheck, PlayCircle, AlertCircle,
  Timer, CalendarClock, Zap
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

    // Chime Note 1 (E5 -> A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.1);
    gain1.gain.setValueAtTime(0.6, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Chime Note 2 (E6 bell harmonic)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1318.5, now + 0.08);
    gain2.gain.setValueAtTime(0.4, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.9);
  } catch (err) {
    console.warn('Audio play note:', err);
  }
}

// Convert any time string ('10:45 PM', '10:45 AM', '22:45', '10.45') to standard 'HH:MM' 24-hour format
function parseTimeTo24h(timeStr) {
  if (!timeStr) return null;
  const cleaned = timeStr.trim().replace('.', ':');
  
  // Format 'HH:MM' (24-hour from <input type="time">)
  const match24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const h = parseInt(match24[1], 10);
    const m = match24[2];
    return `${String(h).padStart(2, '0')}:${m}`;
  }

  // Format 'HH:MM AM/PM'
  const match12 = cleaned.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const m = match12[2];
    const isPm = match12[3].toLowerCase() === 'pm';
    if (isPm && h < 12) h += 12;
    if (!isPm && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${m}`;
  }

  return null;
}

// Helper to format 24h 'HH:MM' to friendly '10:45 PM'
function format12Hour(time24) {
  if (!time24) return '';
  const parts = time24.split(':');
  if (parts.length < 2) return time24;
  let h = parseInt(parts[0], 10);
  const m = parts[1];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${m} ${ampm}`;
}

const INITIAL_REMINDERS = [
  { id: 1, text: '💧 Drink 1 glass of water (Hydration)', time: '10:00', done: true, lastFired: null },
  { id: 2, text: '💊 Take prescribed iron tablet with vitamin C', time: '13:00', done: false, lastFired: null },
  { id: 3, text: '🥗 Healthy iron snack (Pumpkin seeds & apricots)', time: '16:30', done: false, lastFired: null },
  { id: 4, text: '🩺 Check prenatal vitamins & hydration walk', time: '19:00', done: false, lastFired: null },
];

function Reminders() {
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('anemiaai_reminders');
    return saved ? JSON.parse(saved) : INITIAL_REMINDERS;
  });
  const [newText, setNewText] = useState('');
  const [newTime, setNewTime] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [permissionStatus, setPermissionStatus] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  
  // Instagram / Mobile Push style banner notification state
  const [pushBanner, setPushBanner] = useState(null);
  const swRegRef = useRef(null);

  // Save reminders locally
  useEffect(() => {
    localStorage.setItem('anemiaai_reminders', JSON.stringify(reminders));
  }, [reminders]);

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

    // 2. Hardware vibration
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
    if ('Notification' in window && Notification.permission === 'granted') {
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
  };

  // =========================================================================
  // REAL-TIME CLOCK TICKER: CHECKS EXACT CURRENT TIME EVERY 1 SECOND!
  // =========================================================================
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const currentH = String(now.getHours()).padStart(2, '0');
      const currentM = String(now.getMinutes()).padStart(2, '0');
      const currentHHMM = `${currentH}:${currentM}`;
      const todayDateStr = now.toISOString().split('T')[0];

      setReminders(prevReminders => {
        let changed = false;
        const updated = prevReminders.map(item => {
          const item24h = parseTimeTo24h(item.time);
          const alreadyFiredToday = item.lastFired === `${todayDateStr} ${currentHHMM}`;

          // If current clock EXACTLY matches reminder time and hasn't fired yet for this minute
          if (item24h === currentHHMM && !alreadyFiredToday) {
            changed = true;
            triggerPushNotification(
              `⏰ Time Alert (${format12Hour(item24h)})`,
              `Reminder: ${item.text}`
            );
            return {
              ...item,
              lastFired: `${todayDateStr} ${currentHHMM}`
            };
          }
          return item;
        });

        return changed ? updated : prevReminders;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const requestPermissionAndSend = async () => {
    if (!('Notification' in window)) {
      triggerPushNotification('AnemiaAI Reminder', '💧 Time to drink water! Stay hydrated.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission === 'granted') {
        triggerPushNotification(
          '🔔 Notifications Active!',
          'Exact time alerts enabled! When your reminder time arrives, an alert will fire automatically.'
        );
      } else {
        triggerPushNotification(
          '💧 Drink Water Reminder',
          'Remember to drink 1 glass of water now to stay hydrated and support healthy blood circulation!'
        );
      }
    } catch {
      triggerPushNotification('💧 Drink Water Reminder', 'Time to hydrate! Drink a glass of fresh water now.');
    }
  };

  // Quick Helper: Set a reminder for EXACTLY 1 minute from right now
  const setQuickReminderForNextMinute = () => {
    const nextMin = new Date(Date.now() + 65 * 1000); // 1 minute in future
    const h = String(nextMin.getHours()).padStart(2, '0');
    const m = String(nextMin.getMinutes()).padStart(2, '0');
    const time24 = `${h}:${m}`;
    const friendly = format12Hour(time24);

    const item = {
      id: Date.now(),
      text: '💧 Time to drink 1 glass of water!',
      time: time24,
      done: true,
      lastFired: null
    };

    setReminders(prev => [item, ...prev]);
    triggerPushNotification(
      '⏳ Timer Scheduled!',
      `Reminder set for ${friendly} (in ~1 minute). Keep this tab open to watch the alert ring!`
    );
  };

  const toggle = (id) => {
    setReminders(items => items.map(item => {
      if (item.id === id) {
        return { ...item, done: !item.done };
      }
      return item;
    }));
  };

  const remove = (id, e) => {
    e.stopPropagation();
    const item = reminders.find(r => r.id === id);
    setReminders(items => items.filter(item => item.id !== id));
    if (item) {
      triggerPushNotification('🗑️ Task Removed', `"${item.text}" was removed.`);
    }
  };

  const addReminder = (e) => {
    e.preventDefault();
    if (!newText.trim() || !newTime.trim()) {
      triggerPushNotification('Please Enter Time', 'Select an exact time (e.g. 10:45) for your reminder.');
      return;
    }

    const time24 = parseTimeTo24h(newTime) || newTime.trim();
    const friendlyTime = format12Hour(time24);

    const item = {
      id: Date.now(),
      text: newText.trim(),
      time: time24,
      done: true,
      lastFired: null
    };

    setReminders(prev => [item, ...prev]);
    triggerPushNotification(
      '⏰ Exact Reminder Set!',
      `"${item.text}" scheduled for ${friendlyTime}. It will ring at that exact minute!`
    );
    setNewText('');
    setNewTime('');
  };

  const formattedLiveClock = currentTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit', 
    hour12: true 
  });

  return (
    <PageLayout 
      title="Daily Care Reminders" 
      activePath="/reminders" 
      description="Exact-time alarm and push notifications for hydration, medications, and prenatal care."
    >
      {/* ========================================================================= */}
      {/* INSTAGRAM / MOBILE STYLE PUSH NOTIFICATION DROPDOWN BANNER */}
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
                AnemiaAI • Live Alert
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

      {/* Live System Clock Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #FFF5F2 0%, #FFF9F6 100%)',
        border: '1.5px solid #F5D5CB',
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: '0 4px 16px rgba(192, 57, 43, 0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: '#FDEDEC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CalendarClock size={24} color="#C0392B" />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#C0392B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Current System Time (Live Clock)
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1F2937', fontFamily: 'monospace' }}>
              {formattedLiveClock}
            </div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>
              The scheduler checks your clock every second and triggers your alert at the exact minute set.
            </div>
          </div>
        </div>

        {/* Quick Test 1-Minute Button */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={setQuickReminderForNextMinute}
            className="btn-submit"
            style={{
              width: 'auto',
              padding: '11px 20px',
              background: '#C0392B',
              color: '#FFFFFF',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 4px 12px rgba(192, 57, 43, 0.25)'
            }}
          >
            <Zap size={16} />
            <span>Set Test Alert for Next Minute (in ~60s)</span>
          </button>

          {permissionStatus !== 'granted' && (
            <button
              type="button"
              onClick={requestPermissionAndSend}
              style={{
                padding: '11px 18px',
                background: '#FFFFFF',
                border: '1.5px solid #C0392B',
                color: '#C0392B',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Allow Desktop Push
            </button>
          )}
        </div>
      </div>

      {/* Add Reminder Card With Exact Time Picker */}
      <div className="section-card" style={{ marginBottom: 24, borderRadius: 14, padding: '22px 26px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 8, color: '#1F2937' }}>
          <Plus size={18} color="#C0392B" />
          Set Reminder for Specific Time (e.g. 10:45)
        </h3>
        <form onSubmit={addReminder} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="What should we remind you? (e.g. Drink 1 glass of water, Take Iron Tablet)"
            value={newText}
            onChange={e => setNewText(e.target.value)}
            style={{
              flex: '1 1 300px',
              padding: '12px 16px',
              borderRadius: 8,
              border: '1.5px solid #D1D5DB',
              fontSize: 14
            }}
          />

          {/* Native Exact Time Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={16} color="#6B7280" />
            <input
              type="time"
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
              style={{
                padding: '11px 14px',
                borderRadius: 8,
                border: '1.5px solid #D1D5DB',
                fontSize: 15,
                fontWeight: 600,
                background: '#FFFFFF'
              }}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-submit"
            style={{
              width: 'auto',
              padding: '12px 24px',
              borderRadius: 8,
              background: '#C0392B',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              border: 'none'
            }}
          >
            Save Exact Reminder
          </button>
        </form>
        <p style={{ fontSize: 12, color: '#6B7280', marginTop: 8, marginBottom: 0 }}>
          💡 Pick any time (e.g. <strong>10:45</strong>). As soon as the clock reaches that exact minute, the notification bell and drop-down banner will automatically sound and appear.
        </p>
      </div>

      {/* Reminders List */}
      <div className="section-card" style={{ marginBottom: 0, borderRadius: 14, padding: '22px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#1F2937' }}>
              <Bell size={18} color="#C0392B" />
              Active Timed Reminders
            </h3>
            <span style={{ fontSize: 13, color: '#6B7280' }}>
              Each reminder will ring automatically at its scheduled minute. Text has no strike-through.
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
          {reminders.map((reminder) => {
            const time24 = parseTimeTo24h(reminder.time) || reminder.time;
            const friendly = format12Hour(time24);

            return (
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
                    {/* Clear text with strictly NO strike-through line */}
                    <div style={{
                      fontSize: 15,
                      fontWeight: reminder.done ? 700 : 500,
                      color: reminder.done ? '#15803D' : '#1F2937',
                      textDecoration: 'none'
                    }}>
                      {reminder.text}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                      <span style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 5, 
                        fontSize: 12, 
                        fontWeight: 700,
                        color: reminder.done ? '#15803D' : '#4B5563',
                        background: reminder.done ? '#DCFCE7' : '#F3F4F6',
                        padding: '2px 8px',
                        borderRadius: 6
                      }}>
                        <Clock size={12} />
                        Exact Time: {friendly}
                      </span>

                      {reminder.lastFired && (
                        <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>
                          ✓ Alert triggered today
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Instant Test Alert */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerPushNotification(`⏰ Alert (${friendly})`, reminder.text);
                    }}
                    title="Test alert now"
                    style={{
                      background: '#FEF2F2',
                      border: '1px solid #FCA5A5',
                      borderRadius: 8,
                      padding: '8px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      color: '#B91C1C',
                      fontWeight: 700
                    }}
                  >
                    <Bell size={13} />
                    <span>Test Ring</span>
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
                      borderRadius: 6
                    }}
                    title="Remove reminder"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}

export default Reminders;
