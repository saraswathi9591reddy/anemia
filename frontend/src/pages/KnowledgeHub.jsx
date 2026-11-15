import { useState } from 'react';
import { 
  BookOpen, Droplets, ShieldAlert, Utensils, PhoneCall, 
  FileSpreadsheet, ChevronDown, ChevronUp, Sparkles, CheckCircle2, 
  Heart, ArrowRight, HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from './PageLayout';

const TOPICS = [
  {
    id: 'anemia-basics',
    category: 'Basics',
    icon: Droplets,
    iconColor: '#E74C3C',
    bgColor: '#FDEDEC',
    title: 'Anemia During Pregnancy: What It Means',
    summary: 'During pregnancy, your body produces more blood to support your baby. When iron levels are low, oxygen delivery drops.',
    keyPoints: [
      'Blood volume increases by ~40–50% during pregnancy',
      'Iron requirements jump from 18 mg to 27 mg daily',
      'Normal WHO threshold for pregnant women is Hb ≥ 11.0 g/dL',
      'Early screening prevents maternal exhaustion and preterm complications'
    ],
    fullText: 'Anemia occurs when your blood does not have enough healthy red blood cells or hemoglobin to carry adequate oxygen throughout your tissues and to your growing baby. During pregnancy, mild iron depletion is very common, but moderate or severe anemia can increase the risk of fatigue, low birth weight, and postpartum complications. Regular CBC blood tests catch changes early so simple dietary steps or physician-approved iron supplements can restore balance.'
  },
  {
    id: 'warning-signs',
    category: 'Precautions',
    icon: ShieldAlert,
    iconColor: '#E67E22',
    bgColor: '#FEF9E7',
    title: 'Warning Signs & When to Call Your Doctor',
    summary: 'Recognize typical pregnancy tiredness versus symptoms that warrant urgent clinical attention.',
    keyPoints: [
      'Normal: mild fatigue improved by rest and hydration',
      'Requires checkup: severe dizziness, pale skin/gums, rapid heartbeat',
      'Emergency red flags: chest pain, extreme breathlessness, or fainting',
      'Never start high-dose iron pills without your doctor’s confirmation'
    ],
    fullText: 'While fatigue is a frequent pregnancy companion, severe or worsening exhaustion should never be ignored. If you notice unusual shortness of breath during light walks, cold hands and feet, brittle nails, or pale inner eyelids, consult your healthcare provider promptly. For emergency signs like sudden chest pressure, acute breathlessness at rest, or fainting spells, seek hospital emergency care immediately.'
  },
  {
    id: 'nutrition-guide',
    category: 'Diet',
    icon: Utensils,
    iconColor: '#27AE60',
    bgColor: '#EAFAF1',
    title: 'Iron-Rich Foods & Smart Absorption',
    summary: 'How to maximize natural iron intake through balanced daily meals and vitamin C pairings.',
    keyPoints: [
      'Plant iron: Spinach, lentils (dal), chickpeas, beans, jaggery',
      'Animal iron: Lean poultry, eggs, fish (highly absorbable)',
      'Booster: Pair with Vitamin C (oranges, amla, guava, lemon, tomatoes)',
      'Blockers: Avoid tea, coffee, or calcium pills within 1 hour of meals'
    ],
    fullText: 'Dietary iron comes in two forms: heme (from eggs and meats) and non-heme (from plant sources like lentils, leafy greens, fortified cereals, and jaggery). Because non-heme iron is absorbed less efficiently, pairing meals with vitamin C rich foods (like a squeeze of fresh lemon on dal or an orange slice) multiplies absorption up to three times. Keep tannins in tea and coffee away from your main meals as they bind to iron and block absorption.'
  },
  {
    id: 'understanding-cbc',
    category: 'Tests',
    icon: FileSpreadsheet,
    iconColor: '#2980B9',
    bgColor: '#EBF5FB',
    title: 'Understanding Your Complete Blood Count (CBC)',
    summary: 'Decode hemoglobin (Hb), RBC, MCV, and hematocrit values from your lab printout.',
    keyPoints: [
      'Hb (Haemoglobin): Main screening marker (WHO standard: ≥ 11.0 g/dL)',
      'MCV (Mean Corpuscular Volume): Size of red blood cells',
      'MCH & MCHC: Density of hemoglobin per cell',
      'RDW (Red Cell Distribution): Variation in cell size'
    ],
    fullText: 'Your laboratory CBC report contains several key indicators. Hemoglobin (Hb) reflects the oxygen-carrying capacity of your blood and is the gold standard for anemia screening. Low MCV alongside low Hb often points toward microcytic iron deficiency anemia, whereas elevated MCV can suggest folate or Vitamin B12 deficiency. Your doctor analyzes these values together along with your gestational age.'
  },
  {
    id: 'doctor-prep',
    category: 'Checkup',
    icon: PhoneCall,
    iconColor: '#8E44AD',
    bgColor: '#F5EEF8',
    title: 'Preparing for Your Doctor Checkup',
    summary: 'How to make the most of your prenatal consultations with organized reports and symptom notes.',
    keyPoints: [
      'Bring recent CBC reports and ultrasound gestational age notes',
      'Note any dizziness, restless legs, or palpitations',
      'List all current prenatal vitamins and supplements',
      'Ask about follow-up blood retests in the second & third trimesters'
    ],
    fullText: 'Having your latest blood reports and scan results ready makes doctor visits much more productive. You can download and print your AnemiaAI Screening PDF report to share with your obstetrician. Always let your doctor know about any supplements you are taking, and discuss whether an oral iron supplement or adjustment to your prenatal vitamin regimen is appropriate.'
  }
];

const CATEGORIES = ['All', 'Basics', 'Precautions', 'Diet', 'Tests', 'Checkup'];

function KnowledgeHub() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const filteredTopics = selectedCategory === 'All'
    ? TOPICS
    : TOPICS.filter(t => t.category === selectedCategory);

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <PageLayout 
      title="Knowledge Hub" 
      activePath="/knowledge-hub" 
      description="Clear, evidence-based guidance for understanding anemia, nutrition, and maternal wellness during pregnancy."
    >
      {/* Hero Welcome Card */}
      <div style={{
        background: 'linear-gradient(135deg, #FFF5F2 0%, #FFF9F5 100%)',
        border: '1px solid #F5D5CB',
        borderRadius: 16,
        padding: '24px 28px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ maxWidth: 620 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#C0392B', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>
            <Sparkles size={16} />
            Evidence-Based Maternal Education
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1F2937', margin: '0 0 8px 0' }}>
            Practical guides to care for yourself and your baby
          </h2>
          <p style={{ fontSize: 14, color: '#4B5563', margin: 0, lineHeight: 1.5 }}>
            Learn how hemoglobin affects pregnancy, what your CBC report means, and how simple dietary steps help maintain healthy iron levels.
          </p>
        </div>

        <Link to="/cbc-analysis" style={{ textDecoration: 'none' }}>
          <button 
            className="btn-submit" 
            style={{ 
              width: 'auto', 
              padding: '12px 24px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              background: '#C0392B', 
              color: '#fff', 
              borderRadius: 10,
              fontSize: 14,
              boxShadow: '0 4px 12px rgba(192, 57, 43, 0.2)'
            }}
          >
            <span>Start CBC Screening</span>
            <ArrowRight size={16} />
          </button>
        </Link>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '8px 18px',
              borderRadius: 24,
              border: selectedCategory === cat ? '1px solid #C0392B' : '1px solid #E5E7EB',
              background: selectedCategory === cat ? '#C0392B' : '#FFFFFF',
              color: selectedCategory === cat ? '#FFFFFF' : '#4B5563',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: selectedCategory === cat ? '0 2px 6px rgba(192, 57, 43, 0.2)' : 'none'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Topics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {filteredTopics.map((topic) => {
          const IconComp = topic.icon;
          const isExpanded = expandedId === topic.id;

          return (
            <div 
              key={topic.id}
              className="section-card"
              style={{
                marginBottom: 0,
                borderRadius: 14,
                border: isExpanded ? `1.5px solid ${topic.iconColor}` : '1px solid #E5E7EB',
                background: '#FFFFFF',
                boxShadow: isExpanded ? '0 8px 24px rgba(0,0,0,0.06)' : '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.25s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: topic.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <IconComp size={22} color={topic.iconColor} />
                  </div>
                  <div>
                    <span style={{ 
                      fontSize: 11, 
                      fontWeight: 700, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.6px',
                      color: topic.iconColor 
                    }}>
                      {topic.category}
                    </span>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', margin: '4px 0 0 0', lineHeight: 1.3 }}>
                      {topic.title}
                    </h3>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.5, marginBottom: 14 }}>
                  {topic.summary}
                </p>

                {/* Key Takeaways */}
                <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 }}>
                    Key Facts:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#374151', lineHeight: 1.6 }}>
                    {topic.keyPoints.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>

                {/* Expanded Detailed Text */}
                {isExpanded && (
                  <div style={{ 
                    paddingTop: 12, 
                    borderTop: '1px solid #F3F4F6', 
                    fontSize: 13, 
                    color: '#374151', 
                    lineHeight: 1.6,
                    marginBottom: 12
                  }}>
                    {topic.fullText}
                  </div>
                )}
              </div>

              {/* Read / Close Guide Button */}
              <button
                type="button"
                onClick={() => toggleExpand(topic.id)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  background: isExpanded ? '#F3F4F6' : '#FFFFFF',
                  color: isExpanded ? '#374151' : topic.iconColor,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'background 0.2s ease'
                }}
              >
                <span>{isExpanded ? 'Collapse guide' : 'Read full guide'}</span>
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          );
        })}
      </div>

      {/* WHO Guideline Note */}
      <div style={{
        marginTop: 28,
        padding: '16px 20px',
        background: '#F8F9FA',
        border: '1px solid #E9ECEF',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: 13,
        color: '#6C757D'
      }}>
        <HelpCircle size={18} color="#6C757D" style={{ flexShrink: 0 }} />
        <div>
          Information is sourced from World Health Organization (WHO 2011) Guidelines (WHO/NMH/NHD/MNM/11.1). This educational content is not a replacement for formal prenatal medical consultation.
        </div>
      </div>
    </PageLayout>
  );
}

export default KnowledgeHub;
