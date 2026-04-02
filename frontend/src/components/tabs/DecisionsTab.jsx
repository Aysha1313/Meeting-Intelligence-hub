import React, { useState, useEffect } from 'react';
import { transcriptAPI, meetingAPI } from '../../services/api';
import { Loader2, CheckCircle2, History } from 'lucide-react';

const DecisionsTab = ({ meetingId }) => {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDecisions();
  }, [meetingId]);

  const fetchDecisions = async () => {
    try {
      const meeting = await meetingAPI.get(meetingId);
      const allDecisions = [];
      
      if (meeting.transcripts) {
        const decisionPromises = meeting.transcripts.map(t => transcriptAPI.getDecisions(t.id));
        const results = await Promise.all(decisionPromises);
        results.forEach(res => allDecisions.push(...res));
      }
      
      setDecisions(allDecisions);
    } catch (err) {
      console.error('Failed to fetch decisions', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="tab-loading">
      <Loader2 size={24} className="spinner" />
      <span>Fetching group outcomes...</span>
    </div>
  );

  return (
    <div className="decisions-tab animate-fade-in">
      <div className="tab-header">
        <span className="count">{decisions.length} decisions recorded</span>
      </div>

      {decisions.length === 0 ? (
        <div className="empty-tab">
          <History size={32} className="text-tertiary" />
          <p>No explicit decisions found yet</p>
        </div>
      ) : (
        <div className="decisions-list">
          {decisions.map((decision, i) => (
            <div 
              key={decision.id} 
              className="decision-card animate-fade-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="decision-accent" />
              <div className="decision-body">
                <div className="decision-top">
                  <CheckCircle2 size={16} className="text-accent" />
                  <h3>{decision.decision_text}</h3>
                </div>
                {decision.context && (
                  <div className="decision-context">
                    <span className="label">Context:</span>
                    <p>{decision.context}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .decisions-tab {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .decisions-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .decision-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          display: flex;
          overflow: hidden;
          transition: border-color 0.3s ease;
        }
        
        .decision-card:hover {
          border-color: var(--border-hover);
        }
        
        .decision-accent {
          width: 4px;
          background: var(--accent);
        }
        
        .decision-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          flex: 1;
        }
        
        .decision-top {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }
        
        .decision-top h3 {
          font-family: 'DM Sans', sans-serif;
          font-size: 1.05rem;
          font-weight: 500;
          color: var(--text-primary);
          line-height: 1.4;
        }
        
        .decision-context {
          padding-left: 2.1rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .decision-context .label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-tertiary);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default DecisionsTab;
