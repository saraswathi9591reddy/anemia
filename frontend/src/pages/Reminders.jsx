import { useState } from 'react';
import { Bell, CheckCircle2, Circle, Clock, Plus, Trash2, Calendar } from 'lucide-react';
import PageLayout from './PageLayout';

const INITIAL_REMINDERS = [
  { id: 1, text: 'Take prescribed iron supplement with fresh orange juice', time: '08:30 AM', category: 'Medication', done: false },
  { id: 2, text: 'Drink hydration water with lemon', time: '11:00 AM', category: 'Hydration', done: true },
  { id: 3, text: 'Mid-day snack: Pumpkin seeds or dried apricots', time: '04:00 PM', category: 'Diet', done: false },
  { id: 4, text: 'Pack recent CBC reports for prenatal doctor visit', time: 'Tomorrow 10:00 AM', category: 'Doctor', done: false },
];

function Reminders() {
  const [reminders, setReminders] = useState(INITIAL_REMINDERS);
  const [newText, setNewText] = useState('');
  const [newTime, setNewTime] = useState('');

  const toggle = (id) => {
    setReminders(items => items.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const remove = (id, e) => {
    e.stopPropagation();
    setReminders(items => items.filter(item => item.id !== id));
  };

  const addReminder = (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    const item = {
      id: Date.now(),
      text: newText.trim(),
      time: newTime.trim() || 'Daily',
      category: 'Care',
      done: false,
    };
    setReminders(prev => [item, ...prev]);
    setNewText('');
    setNewTime('');
  };

  return (
    <PageLayout 
      title="Daily Care Reminders" 
      activePath="/reminders" 
      description="Keep your supplements, hydration, and prenatal checkups on schedule."
    >
      {/* Add Reminder Card */}
      <div className="section-card" style={{ marginBottom: 24, borderRadius: 14 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={18} color="#C0392B" />
          Add New Care Reminder
        </h3>
        <form onSubmit={addReminder} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="e.g. Take prenatal multivitamin after lunch"
            value={newText}
            onChange={e => setNewText(e.target.value)}
            style={{
              flex: '1 1 260px',
              padding: '10px 14px',
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
              width: 160,
              padding: '10px 14px',
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
              padding: '10px 20px',
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
      <div className="section-card" style={{ marginBottom: 0, borderRadius: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={18} color="#C0392B" />
            Your Daily Schedule
          </h3>
          <span style={{ fontSize: 12, color: '#6B7280' }}>
            {reminders.filter(r => r.done).length} of {reminders.length} completed
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              onClick={() => toggle(reminder.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: 10,
                border: '1px solid',
                borderColor: reminder.done ? '#E5E7EB' : '#F5D5CB',
                background: reminder.done ? '#F9FAFB' : '#FFFDFD',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                gap: 12
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {reminder.done ? (
                  <CheckCircle2 size={20} color="#27AE60" style={{ flexShrink: 0 }} />
                ) : (
                  <Circle size={20} color="#9CA3AF" style={{ flexShrink: 0 }} />
                )}
                <div>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: reminder.done ? '#9CA3AF' : '#1F2937',
                    textDecoration: reminder.done ? 'line-through' : 'none'
                  }}>
                    {reminder.text}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, fontSize: 12, color: '#6B7280' }}>
                    <Clock size={12} />
                    <span>{reminder.time}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => remove(reminder.id, e)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 4
                }}
                title="Remove reminder"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}

export default Reminders;
