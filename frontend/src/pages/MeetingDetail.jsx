import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { meetingAPI, transcriptAPI } from '../services/api';
import { ArrowLeft, Upload, ClipboardList, CheckCircle, BarChart3, MessageSquare, Plus } from 'lucide-react';
import ActionItemsTab from '../components/tabs/ActionItemsTab';
import DecisionsTab from '../components/tabs/DecisionsTab';
import SentimentTab from '../components/tabs/SentimentTab';
import ChatTab from '../components/tabs/ChatTab';
import UploadZone from '../components/UploadZone';

const MeetingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [activeTab, setActiveTab] = useState('actions');
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    fetchMeetingData();
  }, [id]);

  const fetchMeetingData = async () => {
    try {
      const data = await meetingAPI.get(id);
      setMeeting(data);
    } catch (err) {
      console.error('Failed to fetch meeting detail', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'actions', label: 'Action Items', icon: <ClipboardList size={18} /> },
    { id: 'decisions', label: 'Decisions', icon: <CheckCircle size={18} /> },
    { id: 'sentiment', label: 'Sentiment', icon: <BarChart3 size={18} /> },
    { id: 'chat', label: 'Chat', icon: <MessageSquare size={18} /> },
  ];

  if (loading) return <div className="skeleton-page animate-fade-in" />;
  if (!meeting) return <div className="error-state">Meeting not found</div>;

  return (
    <div className="detail-page animate-fade-in">
      <header className="detail-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
          </button>
          <div className="header-info">
            <h1>{meeting.project_name}</h1>
            <p className="subtitle">
              {new Date(meeting.meeting_date || meeting.created_at).toLocaleDateString()} &middot; {meeting.transcript_count || 0} transcripts &middot; {meeting.total_action_items || 0} action items
            </p>
          </div>
        </div>
        <button className="btn-outline" onClick={() => setShowUpload(true)}>
          <Upload size={18} />
          <span>Upload Transcript</span>
        </button>
      </header>

      {showUpload && (
        <div className="upload-container animate-fade-up">
          <UploadZone 
            meetingId={id} 
            onSuccess={() => {
              setShowUpload(false);
              fetchMeetingData();
            }} 
            onClose={() => setShowUpload(false)}
          />
        </div>
      )}

      <nav className="tab-nav">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {activeTab === tab.id && <div className="tab-indicator" />}
          </button>
        ))}
      </nav>

      <div className="tab-content">
        {activeTab === 'actions' && <ActionItemsTab meetingId={id} />}
        {activeTab === 'decisions' && <DecisionsTab meetingId={id} />}
        {activeTab === 'sentiment' && <SentimentTab meetingId={id} />}
        {activeTab === 'chat' && <ChatTab meetingId={id} />}
      </div>

      <style>{`
        .detail-page {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        
        .btn-back {
          color: var(--text-secondary);
        }
        
        .btn-back:hover {
          color: var(--text-primary);
          transform: translateX(-3px);
        }
        
        .header-info h1 {
          font-size: 1.75rem;
          margin-bottom: 0.25rem;
          letter-spacing: -0.02em;
        }
        
        .btn-outline {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.25rem;
          border: 1px solid var(--accent);
          color: var(--accent);
          border-radius: var(--radius-md);
          font-weight: 500;
        }
        
        .btn-outline:hover {
          background: var(--accent-glow);
          border-color: var(--accent-hover);
          color: var(--accent-hover);
        }
        
        .tab-nav {
          display: flex;
          gap: 2rem;
          border-bottom: 1px solid var(--border);
          margin-bottom: 2.5rem;
          position: relative;
        }
        
        .tab-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 1rem 0;
          color: var(--text-tertiary);
          font-size: 0.95rem;
          font-weight: 500;
          position: relative;
        }
        
        .tab-item:hover {
          color: var(--text-secondary);
        }
        
        .tab-item.active {
          color: var(--text-primary);
        }
        
        .tab-indicator {
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--accent);
          z-index: 2;
          animation: slideIn var(--duration-normal) var(--ease-smooth);
        }
        
        @keyframes slideIn {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        
        .tab-content {
          min-height: 400px;
          transition: opacity var(--duration-normal) var(--ease-smooth);
        }
        
        .upload-container {
          margin-bottom: 2.5rem;
        }
        
        .skeleton-page {
          height: 100vh;
          width: 100%;
          background: var(--bg-canvas);
        }
      `}</style>
    </div>
  );
};

export default MeetingDetail;
