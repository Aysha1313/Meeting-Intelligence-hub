import React, { useState, useEffect } from 'react';
import { meetingAPI } from '../services/api';
import { Plus, Users, FileText, ClipboardList, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const data = await meetingAPI.list();
      setMeetings(data);
    } catch (err) {
      console.error('Failed to fetch meetings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    
    try {
      const newMeeting = await meetingAPI.create({ project_name: projectName });
      setMeetings([newMeeting, ...meetings]);
      setShowModal(false);
      setProjectName('');
      navigate(`/meeting/${newMeeting.id}`);
    } catch (err) {
      console.error('Failed to create project', err);
    }
  };

  const stats = [
    { label: 'Meetings this month', value: meetings.length, icon: <Users size={16} /> },
    { label: 'Total transcripts', value: meetings.reduce((acc, m) => acc + (m.transcript_count || 0), 0), icon: <FileText size={16} /> },
    { label: 'Open action items', value: meetings.reduce((acc, m) => acc + (m.total_action_items || 0), 0), icon: <ClipboardList size={16} /> },
    { label: 'Average sentiment', value: (meetings.reduce((acc, m) => acc + (m.overall_sentiment || 0), 0) / (meetings.length || 1)).toFixed(2), icon: <TrendingUp size={16} /> },
  ];

  const getSentimentColor = (score) => {
    if (score > 0.3) return 'var(--sentiment-positive)';
    if (score < -0.3) return 'var(--sentiment-negative)';
    return 'var(--sentiment-neutral)';
  };

  return (
    <div className="dashboard-page animate-fade-in">
      <header className="dashboard-header animate-fade-in">
        <h1>Good morning, {localStorage.getItem('userName') || 'Member B'}</h1>
        <p className="subtitle">
          You have {stats[2].value} action items across {meetings.length} meetings.
        </p>
      </header>

      <section className="stats-row">
        {stats.map((stat, i) => (
          <div key={stat.label} className="stat-card animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <span className="stat-label">{stat.label}</span>
            <div className="stat-content">
              <span className="stat-value mono">{stat.value}</span>
              <span className="stat-icon">{stat.icon}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="meetings-grid">
        <div className="grid-header">
          <span className="section-label">Recent Projects</span>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            <span>New Project</span>
          </button>
        </div>

        {loading ? (
          <div className="grid-container">
            {[1, 2, 3, 4].map(i => <div key={i} className="meeting-card skeleton" style={{ height: '180px' }} />)}
          </div>
        ) : meetings.length === 0 ? (
          <div className="empty-state animate-fade-in">
            <div className="empty-illustration">
              <FileText size={48} className="text-tertiary" />
            </div>
            <h2>No meetings yet</h2>
            <p>Create your first project to start analyzing your conversations.</p>
            <button className="btn-accent" onClick={() => setShowModal(true)}>Create your first project</button>
          </div>
        ) : (
          <div className="grid-container">
            {meetings.map((meeting, i) => (
              <div 
                key={meeting.id} 
                className="meeting-card animate-fade-up" 
                style={{ animationDelay: `${i * 100}ms` }}
                onClick={() => navigate(`/meeting/${meeting.id}`)}
              >
                <div className="card-top">
                  <h3 className="project-name">{meeting.project_name}</h3>
                  <span className="date-chip">
                    {new Date(meeting.meeting_date || meeting.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="card-stats">
                  <div className="stat-badge">
                    <FileText size={14} />
                    <span>{meeting.transcript_count || 0} transcripts</span>
                  </div>
                  <div className="stat-badge">
                    <ClipboardList size={14} />
                    <span>{meeting.total_action_items || 0} actions</span>
                  </div>
                  <div className="sentiment-pill" style={{ backgroundColor: getSentimentColor(meeting.overall_sentiment) + '20', color: getSentimentColor(meeting.overall_sentiment) }}>
                    <span>{meeting.overall_sentiment > 0 ? '😊' : meeting.overall_sentiment < 0 ? '😟' : '😐'} {meeting.overall_sentiment || '0.00'}</span>
                  </div>
                </div>

                <div className="card-footer">
                   <div className="avatar-stack">
                     {['A', 'B', 'C'].map((initial, i) => (
                       <div key={i} className="initial-avatar" style={{ left: `${i * -10}px`, zIndex: 3 - i }}>{initial}</div>
                     ))}
                   </div>
                   <span className="view-link">View Meeting <ArrowRight size={14} /></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content animate-fade-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Project</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}><Plus size={24} style={{ transform: 'rotate(45deg)' }} /></button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Project Name</label>
                <input 
                  autoFocus
                  placeholder="e.g. Q1 Architecture Blitz" 
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Meeting Date</label>
                <input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <button type="submit" className="btn-accent block">Create Project</button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .dashboard-header {
          margin-bottom: 2.5rem;
        }
        
        .dashboard-header h1 {
          font-size: 2.25rem;
          margin-bottom: 0.5rem;
          letter-spacing: -0.03em;
        }
        
        .subtitle {
          color: var(--text-secondary);
          font-size: 1rem;
        }
        
        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 4rem;
        }
        
        .stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          position: relative;
        }
        
        .stat-label {
          font-size: 13px;
          color: var(--text-tertiary);
          font-weight: 500;
        }
        
        .stat-content {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
        }
        
        .stat-value {
          font-size: 1.75rem;
          color: var(--text-primary);
        }
        
        .stat-icon {
          color: var(--accent);
          opacity: 0.5;
        }
        
        .meetings-grid {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .grid-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .section-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-tertiary);
          font-weight: 600;
        }
        
        .grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 1.5rem;
        }
        
        @media (max-width: 480px) {
          .grid-container {
            grid-template-columns: 1fr;
          }
        }
        
        .meeting-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          cursor: pointer;
          transition: all var(--duration-normal) var(--ease-smooth);
        }
        
        .meeting-card:hover {
          background: var(--bg-card-hover);
          transform: translateY(-3px);
          border-color: var(--border-hover);
        }
        
        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .project-name {
          font-size: 1rem;
          color: var(--text-primary);
        }
        
        .date-chip {
          font-size: 12px;
          background: var(--bg-surface);
          color: var(--text-secondary);
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
        }
        
        .card-stats {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .stat-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 12px;
          color: var(--text-secondary);
        }
        
        .sentiment-pill {
          padding: 0.25rem 0.6rem;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .card-footer {
          margin-top: 0.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .avatar-stack {
          display: flex;
          align-items: center;
        }
        
        .initial-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--accent);
          color: white;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--bg-card);
          position: relative;
        }
        
        .view-link {
          font-size: 13px;
          color: var(--accent);
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        
        .btn-primary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          padding: 0.6rem 1rem;
          border-radius: var(--radius-md);
          color: var(--text-primary);
        }
        
        .btn-primary:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
        
        .btn-accent {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--accent);
          padding: 0.75rem 1.25rem;
          border-radius: var(--radius-xl);
          color: white;
          font-weight: 600;
        }
        
        .btn-accent:hover {
          background: var(--accent-hover);
          transform: scale(1.03);
          box-shadow: 0 4px 20px var(--accent-glow);
        }
        
        .btn-accent.block {
          width: 100%;
          justify-content: center;
        }
        
        .empty-state {
          text-align: center;
          padding: 5rem 2rem;
          background: var(--bg-surface);
          border-radius: var(--radius-xl);
          border: 2px dashed var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-content {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          width: 100%;
          max-width: 500px;
          padding: 2rem;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-group label {
          display: block;
          font-size: 13px;
          color: var(--text-tertiary);
          margin-bottom: 0.5rem;
        }
        
        .form-group input {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
