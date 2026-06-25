import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, FileText, CheckSquare, Users, Plus } from 'lucide-react';
import { meetingAPI } from '../api';
import './Dashboard.css';

const StatCard = ({ label, value, icon: Icon, delay }) => (
  <div className="stat-card animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
    <div className="stat-header">
      <span className="stat-label">{label}</span>
      <Icon size={14} className="stat-icon" />
    </div>
    <div className="stat-value">{value}</div>
  </div>
);

const getSentimentClass = (s) => {
  if (s === null || s === undefined) return '';
  if (s > 0.3) return 'sentiment-pos';
  if (s < -0.3) return 'sentiment-neg';
  return 'sentiment-neu';
};

const getSentimentLabel = (s) => {
  if (s === null || s === undefined) return '—';
  if (s > 0.3) return `+${s.toFixed(2)}`;
  if (s < -0.3) return s.toFixed(2);
  return s.toFixed(2);
};

const Dashboard = () => {
  const [meetings, setMeetings] = useState([]);
  const [stats, setStats] = useState({ totalMeetings: 0, totalTranscripts: 0, totalActions: 0, avgSentiment: '0.00' });
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newMeetingDate, setNewMeetingDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [toast, setToast] = useState(null); // { message, type: 'success'|'error' }
  const userFullName = localStorage.getItem('userFullName') || 'User';
  const firstName = userFullName.split(' ')[0];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const calculateStats = (data) => {
    const totalMeetings = data.length;
    const totalTranscripts = data.reduce((acc, m) => acc + (m.transcript_count || 0), 0);
    const totalActions = data.reduce((acc, m) => acc + (m.total_action_items || 0), 0);
    const valid = data.filter(m => m.overall_sentiment !== null).map(m => m.overall_sentiment);
    const avgSentiment = valid.length
      ? (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2)
      : '0.00';
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

  useEffect(() => { fetchMeetings(); /* eslint-disable-next-line */ }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim() || !newMeetingDate) return;
    setIsCreating(true);
    // Optimistic UI — instantly show project in list
    const optimisticMeeting = {
      id: `temp-${Date.now()}`,
      project_name: newProjectName,
      meeting_date: newMeetingDate,
      transcript_count: 0,
      total_action_items: 0,
      overall_sentiment: null,
      transcripts: [],
    };
    setMeetings(prev => [optimisticMeeting, ...prev]);
    setShowModal(false);
    const nameToCreate = newProjectName;
    const dateToCreate = newMeetingDate;
    setNewProjectName('');
    setNewMeetingDate('');
    try {
      await meetingAPI.create({ project_name: nameToCreate, meeting_date: dateToCreate });
      showToast(`Project "${nameToCreate}" created!`, 'success');
      fetchMeetings(); // sync with real data from server
    } catch {
      // Roll back optimistic update on failure
      setMeetings(prev => prev.filter(m => m.id !== optimisticMeeting.id));
      showToast('Failed to create project. Please try again.', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="dashboard-page animate-fade-in">

      {/* ── Toast ── */}
      {toast && (
        <div className={`dashboard-toast dashboard-toast--${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}

      {/* ── Header ── */}
      <header className="dashboard-header">
        <div className="header-text">
          <p className="header-eyebrow">Dashboard</p>
          <h1>{greeting}, {firstName}</h1>
          <p>{stats.totalActions} open actions · {stats.totalMeetings} projects</p>
        </div>
        <button className="new-project-btn" onClick={() => setShowModal(true)}>
          <Plus size={15} /> New Project
        </button>
      </header>

      {/* ── Stats ── */}
      <section className="stats-grid">
        <StatCard label="Projects" value={stats.totalMeetings} icon={LayoutDashboard} delay={80} />
        <StatCard label="Transcripts" value={stats.totalTranscripts} icon={FileText} delay={160} />
        <StatCard label="Action Items" value={stats.totalActions} icon={CheckSquare} delay={240} />
        <StatCard label="Avg Sentiment" value={stats.avgSentiment} icon={Users} delay={320} />
      </section>

      {/* ── Meetings table ── */}
      <section className="meetings-section">
        <div className="section-header">
          <span className="section-label">Recent Projects</span>
          <span className="section-count">{meetings.length} total</span>
        </div>

        {meetings.length > 0 ? (
          <div className="meetings-list animate-fade-up">
            <div className="meetings-list-header">
              <span className="list-col-label">Project</span>
              <span className="list-col-label">Date</span>
              <span className="list-col-label">Transcripts</span>
              <span className="list-col-label">Actions</span>
              <span className="list-col-label">Sentiment</span>
            </div>
            {meetings.map((m) => (
              <Link to={`/meeting/${m.id}`} className="meeting-row" key={m.id}>
                <span className="row-name">{m.project_name}</span>
                <span className="row-date">
                  {new Date(m.meeting_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="row-badge">
                  <FileText size={12} /> {m.transcript_count}
                </span>
                <span className="row-badge">
                  <CheckSquare size={12} /> {m.total_action_items}
                </span>
                <span className={`row-sentiment ${getSentimentClass(m.overall_sentiment)}`}>
                  {getSentimentLabel(m.overall_sentiment)}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No projects yet. Create your first one to get started.</p>
            <button className="create-first-btn" onClick={() => setShowModal(true)}>
              Create first project →
            </button>
          </div>
        )}
      </section>

      {/* ── Modal ── */}
      {showModal && (
        <div className="modal-overlay animate-fade-in" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content animate-fade-up">
            <h3>New Project</h3>
            <form onSubmit={handleCreateProject}>
              <div className="modal-input-group">
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
              <div className="modal-input-group">
                <label>Meeting Date &amp; Time</label>
                <input
                  type="datetime-local"
                  value={newMeetingDate}
                  onChange={(e) => setNewMeetingDate(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)} disabled={isCreating}>Cancel</button>
                <button type="submit" className="confirm-btn" disabled={isCreating}>
                  {isCreating ? <span className="btn-spinner" /> : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
