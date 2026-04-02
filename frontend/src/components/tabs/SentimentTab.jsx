import React, { useState, useEffect, useMemo } from 'react';
import { transcriptAPI, meetingAPI } from '../../services/api';
import { Loader2, Info } from 'lucide-react';

const SentimentTab = ({ meetingId }) => {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredSegment, setHoveredSegment] = useState(null);

  useEffect(() => {
    fetchSentiment();
  }, [meetingId]);

  const fetchSentiment = async () => {
    try {
      const meeting = await meetingAPI.get(meetingId);
      const allSegments = [];
      
      if (meeting.transcripts) {
        const sentimentPromises = meeting.transcripts.map(t => transcriptAPI.getSentiment(t.id));
        const results = await Promise.all(sentimentPromises);
        results.forEach(res => allSegments.push(...res));
      }
      
      setSegments(allSegments.sort((a, b) => a.segment_index - b.segment_index));
    } catch (err) {
      console.error('Failed to fetch sentiment segments', err);
    } finally {
      setLoading(false);
    }
  };

  const sentimentStats = useMemo(() => {
    if (!segments.length) return { avg: 0, positive: 0, neutral: 0, negative: 0 };
    const total = segments.length;
    return {
      avg: (segments.reduce((acc, s) => acc + s.score, 0) / total).toFixed(2),
      positive: Math.round((segments.filter(s => s.sentiment === 'positive').length / total) * 100),
      neutral: Math.round((segments.filter(s => s.sentiment === 'neutral').length / total) * 100),
      negative: Math.round((segments.filter(s => s.sentiment === 'negative' || s.sentiment === 'conflict').length / total) * 100),
    };
  }, [segments]);

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'var(--sentiment-positive)';
      case 'neutral': return 'var(--sentiment-neutral)';
      case 'negative': return 'var(--sentiment-negative)';
      case 'conflict': return 'var(--sentiment-conflict)';
      default: return 'var(--text-tertiary)';
    }
  };

  if (loading) return (
    <div className="tab-loading">
      <Loader2 size={24} className="spinner" />
      <span>Analyzing vocal tones...</span>
    </div>
  );

  return (
    <div className="sentiment-tab animate-fade-in">
      <header className="sentiment-summary">
        <div className="summary-left">
          <h2>Meeting Sentiment</h2>
          <div className="score-pill" style={{ backgroundColor: getSentimentColor(sentimentStats.avg > 0 ? 'positive' : 'neutral') + '20', color: getSentimentColor(sentimentStats.avg > 0 ? 'positive' : 'neutral') }}>
            <span>{sentimentStats.avg} Overall</span>
          </div>
        </div>
        <div className="legend">
           {['positive', 'neutral', 'negative', 'conflict'].map(type => (
             <div key={type} className="legend-item">
               <div className="dot" style={{ background: getSentimentColor(type) }} />
               <span>{type}</span>
             </div>
           ))}
        </div>
      </header>

      <section className="timeline-chart">
        {segments.map((seg, i) => (
          <div 
            key={`${seg.speaker}-${i}`} 
            className="timeline-row"
            onMouseEnter={() => setHoveredSegment(seg)}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            <div className="speaker-name">{seg.speaker}</div>
            <div className="bar-container">
              <div 
                className="bar-fill"
                style={{ 
                  width: `${Math.abs(seg.score * 100) || 50}%`, 
                  backgroundColor: getSentimentColor(seg.sentiment),
                  animationDelay: `${i * 40}ms`
                }}
              />
              {hoveredSegment === seg && (
                <div className="sentiment-tooltip animate-fade-in">
                  <p>{seg.segment_text}</p>
                  <div className="score mono">Score: {seg.score.toFixed(2)}</div>
                </div>
              )}
            </div>
            <div className="score-num mono" style={{ color: getSentimentColor(seg.sentiment) }}>
              {seg.score > 0 ? `+${seg.score.toFixed(1)}` : seg.score.toFixed(1)}
            </div>
          </div>
        ))}
      </section>

      <section className="breakdown-grid">
         <div className="breakdown-card">
           <span className="label">Positive</span>
           <div className="value">{sentimentStats.positive}%</div>
           <div className="mini-bar"><div className="fill" style={{ width: `${sentimentStats.positive}%`, background: 'var(--sentiment-positive)' }} /></div>
         </div>
         <div className="breakdown-card">
           <span className="label">Neutral</span>
           <div className="value">{sentimentStats.neutral}%</div>
           <div className="mini-bar"><div className="fill" style={{ width: `${sentimentStats.neutral}%`, background: 'var(--sentiment-neutral)' }} /></div>
         </div>
         <div className="breakdown-card">
           <span className="label">Negative</span>
           <div className="value">{sentimentStats.negative}%</div>
           <div className="mini-bar"><div className="fill" style={{ width: `${sentimentStats.negative}%`, background: 'var(--sentiment-negative)' }} /></div>
         </div>
      </section>

      <style>{`
        .sentiment-tab {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }
        
        .sentiment-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .summary-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .score-pill {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.85rem;
        }
        
        .legend {
          display: flex;
          gap: 1rem;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 11px;
          text-transform: uppercase;
          color: var(--text-tertiary);
          font-weight: 600;
        }
        
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        
        .timeline-chart {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .timeline-row {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          height: 48px;
          padding: 0 1rem;
          background: var(--bg-surface);
          border-radius: var(--radius-sm);
          position: relative;
        }
        
        .timeline-row:hover {
          background: var(--bg-card-hover);
        }
        
        .speaker-name {
          width: 120px;
          flex-shrink: 0;
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .bar-container {
          flex: 1;
          height: 32px;
          background: rgba(255,255,255,0.03);
          border-radius: 4px;
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .bar-fill {
          height: 100%;
          border-radius: 4px;
          animation: growRight 1s var(--ease-smooth) both;
        }
        
        @keyframes growRight {
          from { transform: scaleX(0); transform-origin: left; }
          to { transform: scaleX(1); transform-origin: left; }
        }
        
        .score-num {
          width: 40px;
          text-align: right;
          font-size: 0.85rem;
        }
        
        .sentiment-tooltip {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%);
          background: var(--bg-card);
          border: 1px solid var(--border);
          padding: 1rem;
          border-radius: var(--radius-md);
          width: 250px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          z-index: 10;
        }
        
        .sentiment-tooltip p {
          font-size: 0.85rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }
        
        .sentiment-tooltip .score {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }
        
        .breakdown-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        
        .breakdown-card {
          background: var(--bg-card);
          padding: 1.25rem;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .breakdown-card .label {
          font-size: 11px;
          text-transform: uppercase;
          color: var(--text-tertiary);
          font-weight: 600;
        }
        
        .breakdown-card .value {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .mini-bar {
          height: 4px;
          background: rgba(255,255,255,0.05);
          border-radius: 2px;
          overflow: hidden;
        }
        
        .mini-bar .fill {
          height: 100%;
        }
      `}</style>
    </div>
  );
};

export default SentimentTab;
