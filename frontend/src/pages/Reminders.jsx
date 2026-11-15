import { useState, useEffect } from 'react';
import { 
  Bell, BellRing, CheckCircle2, Circle, Clock, Plus, Trash2, 
  Sparkles, Check, X, Volume2, ShieldCheck
} from 'lucide-react';
import PageLayout from './PageLayout';

const INITIAL_REMINDERS = [
  { id: 1, text: 'Take prescribed iron supplement with fresh orange juice', time: '08:30 AM', category: 'Medication', done: false, notified: false },
  { id: 2, text: 'Drink hydration water with lemon', time: '11:00 AM', category: 'Hydration', done: true, notified: true },
  { id: 3, text: 'Mid-day snack: Pumpkin seeds or dried apricots', time: '04:00 PM', category: 'Diet', done: false, notified: false },
  { id: 4, text: 'Pack recent CBC reports for prenatal doctor visit', time: 'Tomorrow 10:00 AM', category: 'Doctor', done: false, notified: false },
];

function Reminders() {
  const [reminders, setReminders] = useState(INITIAL_REMINDERS);
  const [newText, setNewText] = useState('');
  const [newTime, setNewTime] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [activeToast, setActiveToast] = useState(null);

  // Check if browser supports notifications & existing permission
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  }, []);

  const triggerNotification = (title, body) => {
    // 1. In-App Pop-up Toast
    setActiveToast({ title, body, id: Date.now() });
    setTimeout(() => {
      setActiveToast(null);
    }, 4500);

    // 2. Native System / Browser Notification (if supported & permitted)
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/logo.png',
        });
      } catch {
        // Fallback for browsers with strict SW policies
      }
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      triggerNotification('Notice', 'Web notifications are not supported in this browser.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        triggerNotification('🔔 Notifications Enabled!', 'You will receive reminders for iron supplements, hydration, and doctor visits.');
      } else {
        triggerNotification('Notification Permission', 'Notifications were disabled. In-app alerts will still be shown.');
      }
    } catch {
      setNotificationsEnabled(true);
      triggerNotification('🔔 Notifications Active', 'In-app reminder notifications are now active.');
    }
  };

  const toggle = (id) => {
    setReminders(items => items.map(item => {
      if (item.id === id) {
        const nextState = !item.done;
        if (nextState) {
          triggerNotification('✅ Task Completed & Scheduled', `Reminder: "${item.text}" is active.`);
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
      triggerNotification('🗑️ Reminder Removed', `"${item.text}" was removed from your schedule.`);
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
      done: false,
      notified: false
    };
    setReminders(prev => [item, ...prev]);
    triggerNotification('🔔 New Reminder Added!', `"${item.text}" scheduled for ${reminderTime}.`);
    setNewText('');
    setNewTime('');
  };

  const testNotification = () => {
    triggerNotification(
      '🔔 Iron Supplement Alert',
      'Time to take your iron supplement! Pair it with Vitamin C (lemon/orange) to boost absorption.'
    );
  };

  return (
    <PageLayout 
      title="Daily Care Reminders" 
      activePath="/reminders" 
      description="Keep your supplements, hydration, and prenatal checkups on schedule with live reminders."
    >
      {/* Floating In-App Toast Notification */}
      {activeToast && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 9999,
          background: '#FFFFFF',
          border: '2px solid #C0392B',
          borderRadius: 14,
          padding: '16px 20px',
          boxShadow: '0 12px 32px rgba(192, 57, 43, 0.22)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
          maxWidth: 400,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{
            width: 36,
            height: 36,
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

      {/* Notification Banner Controls */}
      <div style={{
        background: notificationsEnabled 
          ? 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)' 
          : 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
        border: '1px solid',
        borderColor: notificationsEnabled ? '#86EFAC' : '#FDBA74',
        borderRadius: 14,
        padding: '18px 22px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: notificationsEnabled ? '#BBF7D0' : '#FED7AA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {notificationsEnabled ? (
              <BellRing size={22} color="#15803D" />
            ) : (
              <Bell size={22} color="#C2410C" />
            )}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1F2937' }}>
              {notificationsEnabled ? 'Notifications Are Active & On' : 'Enable Real-Time Reminders'}
            </div>
            <div style={{ fontSize: 13, color: '#4B5563' }}>
              {notificationsEnabled 
                ? 'You will receive pop-ups for each scheduled supplement & care task.' 
                : 'Turn on notifications so you never miss your daily iron or clinic visits.'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {!notificationsEnabled ? (
            <button
              type="button"
              onClick={requestNotificationPermission}
              className="btn-submit"
              style={{
                width: 'auto',
                padding: '10px 20px',
                background: '#C0392B',
                color: '#FFFFFF',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <BellRing size={16} />
              <span>Turn On Notifications</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={testNotification}
              style={{
                padding: '9px 18px',
                background: '#FFFFFF',
                border: '1.5px solid #16A34A',
                color: '#15803D',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Volume2 size={16} />
              <span>Send Test Notification</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Reminder Card */}
      <div className="section-card" style={{ marginBottom: 24, borderRadius: 14, padding: '20px 24px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 8, color: '#1F2937' }}>
          <Plus size={18} color="#C0392B" />
          Add Care Reminder
        </h3>
        <form onSubmit={addReminder} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="e.g. Take prenatal iron supplement after lunch"
            value={newText}
            onChange={e => setNewText(e.target.value)}
            style={{
              flex: '1 1 260px',
              padding: '11px 14px',
              borderRadius: 8,
              border: '1px solid #D1D5DB',
              fontSize: 14
            }}
          />
          <input
            type="text"
            placeholder="Time (e.g. 02:00 PM)"
            value={newTime}
            onChange={e => setNewTime(e.target.value)}
            style={{
              width: 170,
              padding: '11px 14px',
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
              padding: '11px 22px',
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
      <div className="section-card" style={{ marginBottom: 0, borderRadius: 14, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#1F2937' }}>
            <Bell size={18} color="#C0392B" />
            Your Daily Schedule
          </h3>
          <span style={{ 
            fontSize: 12, 
            fontWeight: 600, 
            background: '#FEF2F2', 
            color: '#B91C1C', 
            padding: '3px 10px', 
            borderRadius: 12 
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
                padding: '14px 18px',
                borderRadius: 12,
                border: '1.5px solid',
                borderColor: reminder.done ? '#22C55E' : '#E5E7EB',
                background: reminder.done ? '#F0FDF4' : '#FFFFFF',
                boxShadow: reminder.done ? '0 2px 10px rgba(34, 197, 94, 0.1)' : '0 2px 6px rgba(0,0,0,0.02)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                gap: 14
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
                  {/* Clean text without strike-through */}
                  <div style={{
                    fontSize: 14,
                    fontWeight: reminder.done ? 700 : 500,
                    color: reminder.done ? '#15803D' : '#1F2937',
                    textDecoration: 'none' // STRICTLY NO STRIKE-THROUGH
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
                        Selected & Active
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerNotification('🔔 Reminder Triggered', reminder.text);
                  }}
                  title="Notify now"
                  style={{
                    background: '#F3F4F6',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 12,
                    color: '#4B5563',
                    fontWeight: 600
                  }}
                >
                  <Bell size={13} />
                  <span>Notify</span>
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
