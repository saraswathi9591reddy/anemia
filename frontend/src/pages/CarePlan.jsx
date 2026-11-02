import { Leaf, Apple, Coffee, AlertTriangle } from 'lucide-react';
import PageLayout from './PageLayout';

const IRON_FOODS = [
  { name: 'Spinach & Dark Leafy Greens', desc: 'High in non-heme iron. Pair with vitamin C for better absorption.', icon: '🥬' },
  { name: 'Lentils & Legumes', desc: 'Dal, rajma, chana — excellent plant-based iron sources.', icon: '🫘' },
  { name: 'Fortified Cereals', desc: 'Many breakfast cereals provide 10–18 mg iron per serving.', icon: '🌾' },
  { name: 'Jaggery (Gur)', desc: 'Traditional iron-rich sweetener, 11 mg per 100g.', icon: '🟫' },
  { name: 'Dried Fruits', desc: 'Raisins, apricots, and dates are iron-dense portable snacks.', icon: '🍇' },
  { name: 'Pumpkin Seeds', desc: 'High in iron and zinc. Great as a snack or salad topping.', icon: '🎃' },
  { name: 'Liver & Red Meat', desc: 'Rich in heme iron (most absorbable form). Consult your doctor.', icon: '🥩' },
  { name: 'Tofu & Soy Products', desc: 'Good plant-based iron for vegetarians and vegans.', icon: '🧆' },
];

const VITAMIN_C = [
  { name: 'Amla (Indian Gooseberry)', desc: 'One of the richest natural vitamin C sources.' },
  { name: 'Oranges & Citrus', desc: 'Drink a glass of juice with iron-rich meals.' },
  { name: 'Bell Peppers', desc: 'Red peppers have more vitamin C than oranges.' },
  { name: 'Tomatoes', desc: 'Easy to add to most Indian dishes.' },
  { name: 'Guava', desc: 'Extremely high in vitamin C, affordable and widely available.' },
];

const AVOID = [
  'Tea or coffee with meals (tannins block iron absorption)',
  'Calcium-rich foods at the same time as iron-rich foods',
  'Excessive whole bran without balancing with iron foods',
  'Antacids close to iron supplements (reduces absorption)',
];

const MEALS = [
  { time: 'Morning', desc: 'Fortified cereal with amla juice, or poha with peas and lemon' },
  { time: 'Mid-morning', desc: 'Handful of pumpkin seeds or dried apricots' },
  { time: 'Lunch', desc: 'Dal with palak (spinach), brown rice, tomato salad' },
  { time: 'Afternoon', desc: 'Guava or orange, jaggery with nuts' },
  { time: 'Dinner', desc: 'Rajma curry, roti with green vegetables, lemon water' },
];

function CarePlan() {
  return (
    <PageLayout title="Nutrition Guide" activePath="/care-plan" description="Iron-rich foods and dietary tips to support a healthy pregnancy">
      <div className="alert alert-warning" style={{ marginBottom: 24 }}>
        <AlertTriangle size={16} />
        This is general nutritional information only. It is not a personalized meal plan or treatment advice.
        Always consult a registered dietitian or your doctor before making major dietary changes during pregnancy.
      </div>

      {/* Iron-rich foods */}
      <div className="section-card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, marginBottom: 4 }}><Leaf size={20} /> Iron-Rich Foods</h2>
        <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>WHO recommends 27 mg of iron daily during pregnancy.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {IRON_FOODS.map(f => (
            <div key={f.name} style={{ display: 'flex', gap: 14, padding: '14px 16px', border: '1px solid #E5D4CE', borderRadius: 12, background: '#FFF8F5' }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{f.icon}</span>
              <div>
                <strong style={{ display: 'block', fontSize: 14 }}>{f.name}</strong>
                <span style={{ fontSize: 13, color: '#6B7280' }}>{f.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vitamin C */}
      <div className="section-card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, marginBottom: 4 }}><Apple size={20} /> Enhance Iron Absorption with Vitamin C</h2>
        <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 16 }}>Eating vitamin C alongside iron-rich foods increases absorption by up to 3×.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {VITAMIN_C.map(v => (
            <div key={v.name} style={{ padding: '10px 16px', background: '#D5F5E3', borderRadius: 10, border: '1px solid #A9DFBF' }}>
              <strong style={{ display: 'block', fontSize: 14, color: '#1A5276' }}>{v.name}</strong>
              <span style={{ fontSize: 12, color: '#4A6741' }}>{v.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Meal plan */}
      <div className="section-card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Sample Daily Meal Plan</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {MEALS.map(m => (
            <div key={m.time} style={{ display: 'flex', gap: 16, padding: '12px 16px', background: '#FFF8F5', borderRadius: 10, border: '1px solid #E5D4CE' }}>
              <span style={{ fontWeight: 700, color: '#C0392B', minWidth: 90, fontSize: 14 }}>{m.time}</span>
              <span style={{ fontSize: 14, color: '#374151' }}>{m.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Avoid */}
      <div className="section-card">
        <h2 style={{ fontSize: 18, marginBottom: 16 }}><Coffee size={20} /> What to Avoid with Iron-Rich Meals</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {AVOID.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', background: '#FDE8E6', borderRadius: 8, fontSize: 14, color: '#7B241C' }}>
              <span style={{ color: '#C0392B', fontWeight: 700 }}>✗</span>
              {a}
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}

export default CarePlan;
