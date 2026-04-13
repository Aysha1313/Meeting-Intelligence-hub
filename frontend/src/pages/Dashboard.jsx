import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, CheckSquare, Plus, ArrowRight } from 'lucide-react';
import { meetingAPI } from '../api';
import './Dashboard.css';

// eslint-disable-next-line no-unused-vars
const StatCard = ({ label, value, icon: IconComponent, delay }) => (
  <div className="stat-card animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
    <div className="stat-header">
      <span className="stat-label">{label}</span>
      <IconComponent size={16} className="stat-icon" />
    </div>
    <div className="stat-value mono">{value}</div>
  </div>
);

const MeetingCard = ({ meeting }) => {
  const getSentimentEmoji = (score) => {
    if (score === null || score === undefined) return '—';
    if (score > 0.3) return '😊';
    if (score < -0.3) return '😟';
    return '😐';
  };

  const getSentimentClass = (score) => {
    if (score > 0.3) return 'sentiment-pos';
    if (score < -0.3) return 'sentiment-neg';
    return 'sentiment-neu';
  };

  return (
    <Link to={`/meeting/${meeting.id}`} className="meeting-card">
      <div className="card-top">
        <h3>{meeting.project_name}</h3>
        <span className="date-chip">{new Date(meeting.meeting_date).toLocaleString()}</span>
      </div>
      <div className="card-stats">
        <span className="badge">
          <FileText size={12} /> {meeting.transcript_count} Transcripts
        </span>
        <span className="badge">
          <CheckSquare size={12} /> {meeting.total_action_items} Actions
        </span>
        <span className={`badge ${getSentimentClass(meeting.overall_sentiment)}`}>
          {getSentimentEmoji(meeting.overall_sentiment)} {Math.abs(meeting.overall_sentiment || 0).toFixed(1)}
        </span>
      </div>
      <div className="card-footer">
        <div className="avatar-stack">
          {['A', 'B', 'C'].map((initial, i) => (
            <div key={i} className="stack-avatar" style={{ backgroundColor: `hsl(${i * 100}, 40%, 40%)` }}>
              {initial}
            </div>
          ))}
          {meeting.transcript_count > 3 && <div className="stack-more">+{meeting.transcript_count - 3}</div>}
        </div>
        <span className="view-link">
          View Meeting <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
};

const Dashboard = () => {
  const [meetings, setMeetings] = useState([]);
  const [stats, setStats] = useState({ totalMeetings: 0, totalTranscripts: 0, totalActions: 0, avgSentiment: '0.0' });
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newMeetingDate, setNewMeetingDate] = useState('');
  const userFullName = localStorage.getItem('userFullName') || 'User';

  const calculateStats = (data) => {
    const totalMeetings = data.length;
    const totalTranscripts = data.reduce((acc, m) => acc + (m.transcript_count || 0), 0);
    const totalActions = data.reduce((acc, m) => acc + (m.total_action_items || 0), 0);
    const validSentiments = data.filter(m => m.overall_sentiment !== null).map(m => m.overall_sentiment);
    const avgSentiment = validSentiments.length ? (validSentiments.reduce((a, b) => a + b, 0) / validSentiments.length).toFixed(1) : '0.0';
    
    setStats({ totalMeetings, totalTranscripts, totalActions, avgSentiment });
  };

  const fetchMeetings = async () => {
    try {
      const res = await meetingAPI.list();
      setMeetings(res.data);
      calculateStats(res.data);
    } catch {
      console.error('Failed to fetch meetings');
    }
  };

  useEffect(() => {
    fetchMeetings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim() || !newMeetingDate) return;
    try {
      await meetingAPI.create({ 
        project_name: newProjectName,
        meeting_date: newMeetingDate
      });
      setNewProjectName('');
      setNewMeetingDate('');
      setShowModal(false);
      fetchMeetings();
    } catch {
      console.error('Failed to create project');
    }
  };

  return (
    <div className="dashboard-page animate-fade-in">
      <header className="dashboard-header">
        <div className="header-text">
          <h1 className="animate-fade-up">Good morning, {userFullName.split(' ')[0]}</h1>
          <p className="animate-fade-up" style={{ animationDelay: '100ms' }}>
            You have {stats.totalActions} action items across {stats.totalMeetings} meetings.
          </p>
        </div>
        <button className="new-project-btn" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Project
        </button>
      </header>

      <section className="stats-grid">
        <StatCard label="Meetings This Month" value={stats.totalMeetings} icon={LayoutDashboard} delay={200} />
        <StatCard label="Total Transcripts" value={stats.totalTranscripts} icon={FileText} delay={300} />
        <StatCard label="Open Action Items" value={stats.totalActions} icon={CheckSquare} delay={400} />
        <StatCard label="Avg Sentiment" value={stats.avgSentiment} icon={Users} delay={500} />
      </section>

      <section className="meetings-section">
        <h2 className="section-label">Recent Projects</h2>
        <div className="meetings-grid">
          {meetings.map((m) => (
            <MeetingCard key={m.id} meeting={m} />
          ))}
          {meetings.length === 0 && (
            <div className="empty-state">
              <div className="empty-illustration">☕</div>
              <p>No meetings yet</p>
              <button className="create-first-btn" onClick={() => setShowModal(true)}>Create your first project</button>
            </div>
          )}
        </div>
      </section>

      {showModal && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content animate-fade-up">
            <h3>Start New Project</h3>
            <form onSubmit={handleCreateProject}>
              <div className="input-group">
                <label>Project Name</label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Q3 Growth Strategy"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label>Meeting Date & Time</label>
                <input
                  type="datetime-local"
                  value={newMeetingDate}
                  onChange={(e) => setNewMeetingDate(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="confirm-btn">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
