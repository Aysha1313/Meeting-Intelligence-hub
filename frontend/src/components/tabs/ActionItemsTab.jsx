import React, { useState, useEffect } from 'react';
import { transcriptAPI, meetingAPI } from '../../services/api';
import { Loader2, Download, AlertCircle } from 'lucide-react';

const ActionItemsTab = ({ meetingId }) => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActions();
  }, [meetingId]);

  const fetchActions = async () => {
    try {
      const meeting = await meetingAPI.get(meetingId);
      const allActions = [];
      
      if (meeting.transcripts) {
        const actionPromises = meeting.transcripts.map(t => transcriptAPI.getActions(t.id));
        const results = await Promise.all(actionPromises);
        results.forEach(res => allActions.push(...res));
      }
      
      setActions(allActions);
    } catch (err) {
      console.error('Failed to fetch action items', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'done': return 'var(--sentiment-positive)';
      case 'in-progress': return 'var(--sentiment-neutral)';
      default: return 'var(--text-tertiary)';
    }
  };

  const getDueDateColor = (dateStr) => {
    if (!dateStr || dateStr === 'Not specified') return 'var(--text-tertiary)';
    const date = new Date(dateStr);
    const now = new Date();
    if (date < now) return 'var(--sentiment-negative)';
    const diff = (date - now) / (1000 * 60 * 60 * 24);
    if (diff < 3) return 'var(--sentiment-neutral)';
    return 'var(--sentiment-positive)';
  };

  if (loading) return (
    <div className="tab-loading">
      <Loader2 size={24} className="spinner" />
      <span>Loading tasks...</span>
    </div>
  );

  return (
    <div className="actions-tab animate-fade-in">
      <div className="tab-header">
        <span className="count">{actions.length} items found</span>
        <button className="btn-outline-sm">
          <Download size={14} />
          <span>Export CSV</span>
        </button>
      </div>

      {actions.length === 0 ? (
        <div className="empty-tab">
          <AlertCircle size={32} className="text-tertiary" />
          <p>No action items extracted yet</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="actions-table">
            <thead>
              <tr>
                <th>WHO</th>
                <th>WHAT</th>
                <th>BY WHEN</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="who-cell">
                      <div className="avatar-sm">
                        {item.responsible_person?.[0] || '?'}
                      </div>
                      <span className="name">{item.responsible_person}</span>
                    </div>
                  </td>
                  <td className="what-cell">
                    <p title={item.task_description}>{item.task_description}</p>
                  </td>
                  <td className="mono" style={{ color: getDueDateColor(item.due_date) }}>
                    {item.due_date}
                  </td>
                  <td>
                    <span className="status-pill" style={{ borderColor: getStatusColor('pending') }}>
                      Pending
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .actions-tab {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .tab-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .count {
          font-size: 13px;
          color: var(--text-tertiary);
        }
        
        .btn-outline-sm {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.75rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 12px;
          color: var(--text-secondary);
        }
        
        .btn-outline-sm:hover {
          border-color: var(--text-tertiary);
          color: var(--text-primary);
        }
        
        .table-container {
          background: var(--bg-surface);
          border-radius: var(--radius-lg);
          padding: 0.5rem;
          border: 1px solid var(--border);
        }
        
        .actions-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        
        .actions-table th {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-tertiary);
          padding: 1rem 1.5rem;
          font-weight: 600;
        }
        
        .actions-table td {
          padding: 1.25rem 1.5rem;
          border-top: 0.5px solid var(--border);
          font-size: 14px;
        }
        
        .actions-table tr:hover td {
          background: var(--bg-card-hover);
        }
        
        .who-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .avatar-sm {
          width: 28px;
          height: 28px;
          background: var(--accent);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
        }
        
        .name {
          color: var(--text-primary);
          font-weight: 500;
        }
        
        .what-cell p {
          max-width: 400px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        .status-pill {
          font-size: 11px;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          border: 1px solid;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .empty-tab, .tab-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 5rem 0;
          color: var(--text-tertiary);
          gap: 1rem;
        }
      `}</style>
    </div>
  );
};

export default ActionItemsTab;
