import { useState, useEffect, useRef } from 'react';
import { 
  Bell, BellRing, CheckCircle2, Circle, Clock, Plus, Trash2, 
  Sparkles, Check, X, Volume2, ShieldCheck, PlayCircle, AlertCircle
} from 'lucide-react';
import PageLayout from './PageLayout';

// Synthesize pleasant notification chime using Web Audio API (no external file needed)
function playChimeSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // First tone (pleasant high ding)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // A5
    osc1.frequency.exponentialRampToValueAtTime(1318.5, now + 0.12); // E6
    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);

    // Second bell tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1760, now + 0.15); // A6
    gain2.gain.setValueAtTime(0.2, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.8);
  } catch (err) {
    console.warn('Audio chime note:', err);
  }
}

const INITIAL_REMINDERS = [
  { id: 1, text: 'Drink hydration water with lemon & mint', time: '10:00 AM', category: 'Hydration', done: true },
  { id: 2, text: 'Take prescribed iron supplement with fresh orange juice', time: '01:00 PM', category: 'Medication', done: false },
  { id: 3, text: 'Mid-day healthy snack: Pumpkin seeds or dried apricots', time: '04:30 PM', category: 'Diet', done: false },
  { id: 4, text: 'Evening reminder: 1 glass of water & light prenatal walk', time: '07:00 PM', category: 'Activity', done: false },
];

function Reminders() {
  const [reminders, setReminders] = useState(INITIAL_REMINDERS);
  const [newText, setNewText] = useState('');
  const [newTime, setNewTime] = useState('');
  const [permissionStatus, setPermissionStatus] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [activeToast, setActiveToast] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const countdownTimerRef = useRef(null);

  // Sync notification permission state
  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // System Notification Fire Function
  const sendRealNotification = (title, body) => {
    // 1. Play auditory chime sound
    playChimeSound();

    // 2. In-App Visual Alert Toast
    setActiveToast({ title, body, id: Date.now() });
    setTimeout(() => {
      setActiveToast(null);
    }, 5000);

    // 3. Real OS / Windows / Browser Desktop Notification Banner (like Instagram/WhatsApp)
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: '/logo.png',
          badge: '/logo.png',
          tag: 'anemiaai-reminder-' + Date.now(),
          requireInteraction: true, // Keeps it visible in Windows notification tray!
          silent: false
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (e) {
        console.warn('Browser notification error:', e);
      }
    }
  };

  const handleRequestPermission = async () => {
    if (!('Notification' in window)) {
      sendRealNotification('Notice', 'Desktop notifications are not supported in this browser.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission === 'granted') {
        sendRealNotification(
          '🔔 Notifications Activated!',
          'You will now get real desktop notifications for hydration, iron supplements, and appointments.'
        );
      } else if (permission === 'denied') {
        setActiveToast({
          title: '⚠️ Notifications Blocked',
          body: 'Notifications are blocked in your browser. Click the lock / tune icon in your address bar to Allow notifications.',
          id: Date.now()
        });
      }
    } catch (e) {
      console.warn('Permission request error:', e);
    }
  };

  // Instant 3-Second Test Countdown (lets user switch tabs to verify desktop popup)
  const startDemoCountdown = (reminderText, reminderTime) => {
    if (permissionStatus !== 'granted') {
      handleRequestPermission();
    }

    setCountdown(3);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    let left = 3;
    countdownTimerRef.current = setInterval(() => {
      left -= 1;
      setCountdown(left);
      if (left <= 0) {
        clearInterval(countdownTimerRef.current);
        setCountdown(null);
        sendRealNotification(
          `🔔 AnemiaAI: Time to ${reminderText || 'Drink Water'}!`,
          `Scheduled for ${reminderTime || 'Now'}. Stay hydrated and take your prenatal care on time.`
        );
      }
    }, 1000);
  };

  const toggle = (id) => {
    setReminders(items => items.map(item => {
      if (item.id === id) {
        const nextState = !item.done;
        if (nextState) {
          sendRealNotification(
            '✅ Reminder Scheduled & Active',
            `"${item.text}" is active for ${item.time}.`
          );
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
      sendRealNotification('🗑️ Reminder Removed', `"${item.text}" removed from schedule.`);
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
    sendRealNotification('🔔 New Reminder Set!', `"${item.text}" scheduled for ${reminderTime}.`);
    setNewText('');
    setNewTime('');
  };

  return (
    <PageLayout 
      title="Daily Care Reminders" 
      activePath="/reminders" 
      description="Real-time push notifications and alerts for hydration, iron supplements, and pregnancy health."
    >
      {/* Pop-up In-App Toast */}
      {activeToast && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 99999,
          background: '#FFFFFF',
          border: '2px solid #C0392B',
          borderRadius: 14,
          padding: '16px 20px',
          boxShadow: '0 14px 38px rgba(192, 57, 43, 0.25)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
          maxWidth: 420,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: '#FDEDEC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <BellRing size={20} color="#C0392B" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1F2937', marginBottom: 2 }}>
              {activeToast.title}
            </div>
            <div style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.4 }}>
              {activeToast.body}
            </div>
          </div>
          <button
            onClick={() => setActiveToast(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              padding: 2
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Permission & Instagram-Style Notification Banner */}
      <div style={{
        background: permissionStatus === 'granted'
          ? 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)' 
          : 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
        border: '1.5px solid',
        borderColor: permissionStatus === 'granted' ? '#86EFAC' : '#FDBA74',
        borderRadius: 16,
        padding: '22px 26px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, maxWidth: 600 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: permissionStatus === 'granted' ? '#BBF7D0' : '#FED7AA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {permissionStatus === 'granted' ? (
              <BellRing size={26} color="#15803D" />
            ) : (
              <Bell size={26} color="#C2410C" />
            )}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#1F2937', marginBottom: 3 }}>
              {permissionStatus === 'granted'
                ? 'Desktop & System Notifications Enabled'
                : 'Turn On System Notifications (Like Instagram/WhatsApp)'}
            </div>
            <div style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.5 }}>
              {permissionStatus === 'granted'
                ? 'Your browser will sound a chime and show a Windows desktop banner when it is time to drink water or take iron.'
                : 'Click "Enable Push Notifications" so alerts pop up in your Windows screen corner even if you are on another app!'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {permissionStatus !== 'granted' ? (
            <button
              type="button"
              onClick={handleRequestPermission}
              className="btn-submit"
              style={{
                width: 'auto',
                padding: '12px 24px',
                background: '#C0392B',
                color: '#FFFFFF',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(192, 57, 43, 0.25)'
              }}
            >
              <BellRing size={18} />
              <span>Enable Push Notifications</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => startDemoCountdown('Drink 1 glass of water now', 'Now')}
              disabled={countdown !== null}
              style={{
                padding: '11px 22px',
                background: '#FFFFFF',
                border: '2px solid #16A34A',
                color: '#15803D',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: countdown !== null ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 2px 8px rgba(22, 163, 74, 0.15)'
              }}
            >
              <Volume2 size={18} />
              <span>
                {countdown !== null 
                  ? `Triggering in ${countdown}s (switch tabs to test!)...` 
                  : 'Test Desktop Alert (3s Countdown)'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Permission Denied Guide (if user blocked notifications) */}
      {permissionStatus === 'denied' && (
        <div className="alert alert-error" style={{ marginBottom: 20 }}>
          <AlertCircle size={18} />
          <div>
            <strong>Browser Blocked Notifications:</strong> Look at your browser address bar next to <code>localhost:5173</code>, click the <strong>🔒 View Site Information</strong> icon, and change <strong>Notifications</strong> to <strong>Allow</strong>, then refresh.
          </div>
        </div>
      )}

      {/* Add Reminder Card */}
      <div className="section-card" style={{ marginBottom: 24, borderRadius: 14, padding: '22px 26px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 8, color: '#1F2937' }}>
          <Plus size={18} color="#C0392B" />
          Add Care or Hydration Reminder
        </h3>
        <form onSubmit={addReminder} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="e.g. Drink 250ml water or take iron tablet"
            value={newText}
            onChange={e => setNewText(e.target.value)}
            style={{
              flex: '1 1 280px',
              padding: '11px 16px',
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
              width: 180,
              padding: '11px 16px',
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
              padding: '11px 24px',
              borderRadius: 8,
              background: '#C0392B',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            Add Reminder
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
              Click any task to select/toggle. Text remains clear with no strike-through.
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
                        Active & Monitored
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Send Alert Now Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startDemoCountdown(reminder.text, reminder.time);
                  }}
                  title="Notify now"
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    borderRadius: 8,
                    padding: '7px 12px',
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
