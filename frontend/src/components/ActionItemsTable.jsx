import React, { useState, useEffect } from 'react';
import { transcriptAPI } from '../api';
import './ActionItemsTable.css';
import { useToast } from './Toast';

const ActionItemsTable = ({ transcriptId, type = 'actions' }) => {
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
      const response = type === 'decisions' 
        ? await transcriptAPI.getDecisions(transcriptId) 
        : await transcriptAPI.getActions(transcriptId);
      
      // Ensure we extract the array properly. API might return { items: [...] } or just [...]
      const data = response.data.items || response.data || [];
      setItems(data);
    } catch {
      addToast(`Failed to load ${type}`, 'error');
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

  if (!items || items.length === 0) {
    return (
      <div className="items-empty">
        <p>No {type} found for this transcript.</p>
      </div>
    );
  }

  return (
    <div className="items-table-container">
      <table className="items-table">
        <thead>
          <tr>
            <th>Description</th>
            {type === 'actions' && <th>Assignee</th>}
            {type === 'actions' && <th>Deadline</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="animate-fade-up" style={{ animationDelay: `${index * 50}ms` }}>
              <td className="item-description">
                <span className="item-text">{item.description || item.decision || item.content}</span>
              </td>
              {type === 'actions' && (
                <td className="item-assignee">
                  {item.assignee && item.assignee !== 'Unassigned' ? (
                    <div className="assignee-capsule">
                      <div 
                        className="assignee-avatar" 
                        style={{ backgroundColor: stringToColour(item.assignee) }}
                      >
                        {getInitials(item.assignee)}
                      </div>
                      <span className="assignee-name">{item.assignee}</span>
                    </div>
                  ) : (
                    <span className="unassigned">Unassigned</span>
                  )}
                </td>
              )}
              {type === 'actions' && (
                <td className="item-deadline">
                  {item.deadline ? (
                    <span className="deadline-pill">{item.deadline}</span>
                  ) : (
                    <span className="no-deadline">-</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActionItemsTable;
