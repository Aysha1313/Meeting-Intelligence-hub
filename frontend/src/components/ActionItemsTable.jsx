import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { transcriptAPI } from '../api';
import './ActionItemsTable.css';
import { useToast } from './Toast';

const ActionItemsTable = ({ transcriptId, status, type = 'actions' }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    if (transcriptId) {
      fetchData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcriptId, type]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [actionsRes, decisionsRes] = await Promise.all([
        transcriptAPI.getActions(transcriptId),
        transcriptAPI.getDecisions(transcriptId)
      ]);

      const actionsData = (actionsRes.data?.items || actionsRes.data || []).map(a => ({ ...a, itemType: 'Action Item' }));
      const decisionsData = (decisionsRes.data?.items || decisionsRes.data || []).map(d => ({ ...d, itemType: 'Decision' }));

      setItems([...actionsData, ...decisionsData]);
    } catch {
      addToast(`Failed to load items`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (assignee) => {
    if (!assignee) return '?';
    return assignee.substring(0, 2).toUpperCase();
  };

  const stringToColour = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#3B82F6'];
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) {
    return (
      <div className="items-table-loading">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton items-row-skeleton"></div>
        ))}
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="items-empty error-state">
        <div className="error-icon" style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
        <p style={{ color: 'var(--error)', fontWeight: '600' }}>AI Processing Failed</p>
        <p className="items-empty-sub">
          The AI was unable to reach the service to extract data. 
          This usually happens due to <strong>Network or DNS issues</strong>.
        </p>
        <p className="items-empty-sub" style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.8 }}>
          Please check your internet connection or try a different network.
        </p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    if (status === 'processing' || status === 'pending') {
      return (
        <div className="items-empty" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.65rem',
            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: '12px', padding: '0.75rem 1.25rem', marginBottom: '1.25rem',
            color: '#6366F1', fontWeight: '600', fontSize: '0.95rem'
          }}>
            <span style={{
              width: '14px', height: '14px', borderRadius: '50%',
              border: '2.5px solid #6366F1', borderTopColor: 'transparent',
              display: 'inline-block', animation: 'spin 0.9s linear infinite'
            }} />
            AI is analysing your transcript…
          </div>
          <div style={{
            width: '100%', maxWidth: '360px', margin: '0 auto 1rem',
            height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden'
          }}>
            <div style={{
              height: '100%', width: '45%', background: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
              borderRadius: '99px', animation: 'progressSlide 1.6s ease-in-out infinite alternate'
            }} />
          </div>
          <p className="items-empty-sub">
            Actions &amp; Decisions will appear here once processing is complete. This usually takes 15–30 seconds.
          </p>
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes progressSlide { from { margin-left: 0%; } to { margin-left: 55%; } }
          `}</style>
        </div>
      );
    }

    return (
      <div className="items-empty">
        <p>No Action Items or Decisions were extracted from this transcript yet.</p>
        <p className="items-empty-sub">
          No relevant outcomes were found by the AI in this transcript.
        </p>
      </div>
    );
  }

  const handleExportCSV = () => {
    if (!items || items.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Type,Description,Assignee,Deadline\n";

    items.forEach(item => {
      const typeStr = `"${item.itemType}"`;
      const descText = item.itemType === 'Decision' ? (item.decision_text || item.decision || '') : (item.task_description || item.description || item.content || '');
      const desc = `"${descText.replace(/"/g, '""')}"`;
      const assignee = item.itemType === 'Action Item' ? `"${(item.responsible_person || item.assignee || 'Unassigned').replace(/"/g, '""')}"` : '"-"';
      const deadline = item.itemType === 'Action Item' ? `"${(item.due_date || item.deadline || '-').replace(/"/g, '""')}"` : '"-"';

      csvContent += `${typeStr},${desc},${assignee},${deadline}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Meeting_Outcomes.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="items-table-container">
      <div className="table-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          onClick={handleExportCSV}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontSize: '0.9rem', fontWeight: '500' }}
        >
          <Download size={16} /> Export to CSV
        </button>
      </div>
      <table className="items-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Description</th>
            <th>Assignee</th>
            <th>Deadline</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="animate-fade-up" style={{ animationDelay: `${index * 50}ms` }}>
              <td className="item-badge-cell">
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  backgroundColor: item.itemType === 'Decision' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: item.itemType === 'Decision' ? '#6366F1' : '#10B981',
                  whiteSpace: 'nowrap'
                }}>
                  {item.itemType}
                </span>
              </td>
              <td className="item-description">
                <span className="item-text">{item.task_description || item.decision_text || item.description || item.decision || item.content}</span>
              </td>
              <td className="item-assignee">
                {item.itemType === 'Action Item' ? (
                  (item.responsible_person || item.assignee) && (item.responsible_person || item.assignee) !== 'Unassigned' ? (
                    <div className="assignee-capsule">
                      <div
                        className="assignee-avatar"
                        style={{ backgroundColor: stringToColour(item.responsible_person || item.assignee) }}
                      >
                        {getInitials(item.responsible_person || item.assignee)}
                      </div>
                      <span className="assignee-name">{item.responsible_person || item.assignee}</span>
                    </div>
                  ) : (
                    <span className="unassigned">Unassigned</span>
                  )
                ) : (
                  <span className="unassigned">-</span>
                )}
              </td>
              <td className="item-deadline">
                {item.itemType === 'Action Item' ? (
                  item.due_date || item.deadline ? (
                    <span className="deadline-pill">{item.due_date || item.deadline}</span>
                  ) : (
                    <span className="no-deadline">-</span>
                  )
                ) : (
                  <span className="no-deadline">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActionItemsTable;
