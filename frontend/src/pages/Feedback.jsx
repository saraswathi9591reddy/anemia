import { useState } from 'react';
import { MessageSquare, Star, Send, CheckCircle2, Heart } from 'lucide-react';
import PageLayout from './PageLayout';

function Feedback() {
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('General Experience');
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageLayout 
      title="Feedback & Suggestions" 
      activePath="/feedback" 
      description="Help us make pregnancy anemia screening simpler and more supportive for mothers everywhere."
    >
      <div className="section-card" style={{ maxWidth: 640, margin: '0 auto', borderRadius: 16, padding: '28px 32px' }}>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#D4EDDA', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={32} color="#155724" />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: '#1F2937', marginBottom: 8 }}>
              Thank You for Your Feedback!
            </h3>
            <p style={{ fontSize: 14, color: '#6B7280', maxWidth: 440, margin: '0 auto 20px', lineHeight: 1.5 }}>
              Your suggestions help us refine our screening flow and educational guidance for expectant mothers.
            </p>
            <button
              type="button"
              onClick={() => { setSubmitted(false); setComments(''); }}
              style={{
                padding: '10px 22px',
                borderRadius: 8,
                border: '1px solid #D1D5DB',
                background: '#FFFFFF',
                color: '#1F2937',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Submit Another Response
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FDEDEC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={20} color="#C0392B" />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1F2937' }}>
                  Share Your Experience
                </h3>
                <span style={{ fontSize: 12, color: '#6B7280' }}>Takes less than 1 minute</span>
              </div>
            </div>

            {/* Rating Stars */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                Overall App Rating:
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 4
                    }}
                  >
                    <Star
                      size={28}
                      color={star <= rating ? '#F59E0B' : '#D1D5DB'}
                      fill={star <= rating ? '#F59E0B' : 'none'}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                What is this about?
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #D1D5DB',
                  fontSize: 14,
                  background: '#FFFFFF'
                }}
              >
                <option>General Experience</option>
                <option>CBC Report OCR Scanning</option>
                <option>Risk Level & Recommendations</option>
                <option>Knowledge Hub & Educational Guides</option>
                <option>Other / Feature Request</option>
              </select>
            </div>

            {/* Text details */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Your Comments or Suggestions:
              </label>
              <textarea
                rows={4}
                placeholder="Tell us what you liked or what we can improve..."
                value={comments}
                onChange={e => setComments(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '1px solid #D1D5DB',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-submit"
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: 10,
                background: '#C0392B',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(192, 57, 43, 0.2)'
              }}
            >
              <Send size={16} />
              <span>Submit Feedback</span>
            </button>
          </form>
        )}
      </div>
    </PageLayout>
  );
}

export default Feedback;
