import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, FileText, CheckCircle, Brain, MessageSquare, BarChart3, Upload, AlertCircle } from 'lucide-react';
import { meetingAPI, transcriptAPI } from '../api';
import { useToast } from '../components/Toast';
import UploadZone from '../components/UploadZone';
import ActionItemsTable from '../components/ActionItemsTable';
import SentimentChart from '../components/SentimentChart';
import Chatbot from '../components/Chatbot';
import './MeetingDetail.css';

const MeetingDetail = () => {
  const { id } = useParams();
  const { addToast } = useToast();
  const [meeting, setMeeting] = useState(null);
  const [transcripts, setTranscripts] = useState([]);
  const [activeTab, setActiveTab] = useState('outcomes');
  const [loading, setLoading] = useState(true);
  const [activeTranscriptId, setActiveTranscriptId] = useState(null);
  const pollingRef = useRef({});

  const startPolling = (tId) => {
    if (pollingRef.current[tId]) return;

    pollingRef.current[tId] = setInterval(async () => {
      try {
        const res = await transcriptAPI.getStatus(tId);
        const transcriptStatus = res.data?.status;
        if (transcriptStatus === 'completed' || transcriptStatus === 'done') {
          clearInterval(pollingRef.current[tId]);
          delete pollingRef.current[tId];
          addToast('Analysis completed successfully');
          fetchMeetingData();
        } else if (transcriptStatus === 'failed') {
          clearInterval(pollingRef.current[tId]);
          delete pollingRef.current[tId];
          addToast('Analysis failed for one transcript', 'error');
          fetchMeetingData();
        }
      } catch {
        clearInterval(pollingRef.current[tId]);
      }
    }, 5000);
  };

  const fetchMeetingData = async () => {
    try {
      const res = await meetingAPI.get(id);
      const data = res.data;
      setMeeting(data);
      setTranscripts(data.transcripts || []);
      if (data.transcripts?.length > 0) {
        const lastCompleted = [...data.transcripts].reverse().find(t => t.status === 'completed' || t.status === 'done');
        if (lastCompleted) setActiveTranscriptId(lastCompleted.id);
        
        // Start polling for any pending ones
        data.transcripts.forEach(t => {
          if (t.status === 'processing' || t.status === 'pending') {
            startPolling(t.id);
          }
        });
      }
      setLoading(false);
    } catch {
      addToast('Failed to load meeting details', 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetingData();
    
    // Capture the current value of the ref
    const activeIntervals = { ...pollingRef.current };
    
    return () => {
      // Clear all polling on unmount
      Object.values(activeIntervals).forEach(clearInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUploadComplete = (newTranscript) => {
    setTranscripts(prev => [newTranscript, ...prev]);
    if (newTranscript.status !== 'completed' && newTranscript.status !== 'done') {
      startPolling(newTranscript.id);
    } else {
      setActiveTranscriptId(newTranscript.id);
    }
  };

  if (loading) return <div className="detail-loading"><div className="skeleton" style={{height: '300px'}}></div></div>;
  if (!meeting) return <div className="detail-error">Meeting not found</div>;

  const tabs = [
    { id: 'outcomes', label: 'Actions & Decisions', icon: CheckCircle },
    { id: 'sentiment', label: 'Sentiment', icon: BarChart3 },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare }
  ];

  return (
    <div className="meeting-detail-page animate-fade-in">
      <nav className="breadcrumb">
        <Link to="/" className="back-link"><ArrowLeft size={16} /> Dashboard</Link>
      </nav>

      <header className="detail-header">
        <div className="header-info">
          <h1>{meeting.project_name}</h1>
          <div className="metadata">
            <span><Clock size={14} /> Created {new Date(meeting.created_at).toLocaleString()}</span>
            <span><FileText size={14} /> {transcripts.length} Transcripts</span>
            <span><CheckCircle size={14} /> {meeting.total_action_items} Actions</span>
          </div>
        </div>
      </header>

      <UploadZone meetingId={id} onUploadComplete={handleUploadComplete} />

      {transcripts.length > 0 && (
        <div className="transcripts-summary-section animate-fade-in">
          <h2 className="section-title">Uploaded Transcripts Summary</h2>
          <div className="transcripts-grid">
            {transcripts.map((t) => (
              <div 
                key={t.id} 
                className={`transcript-card ${activeTranscriptId === t.id ? 'active' : ''}`}
                onClick={() => setActiveTranscriptId(t.id)}
              >
                <div className="card-header">
                  <FileText size={18} className="card-icon" />
                  <span className="card-filename" title={t.filename}>{t.filename}</span>
                  {t.status === 'completed' || t.status === 'done' ? (
                    <CheckCircle size={14} className="status-icon success" />
                  ) : t.status === 'failed' ? (
                    <AlertCircle size={14} className="status-icon error" />
                  ) : (
                    <div className="spinner-small" title="Processing..."></div>
                  )}
                </div>
                <div className="card-body">
                  <div className="summary-item">
                    <span className="summary-label">Uploaded Date:</span>
                    <span className="summary-value">{new Date(t.uploaded_at).toLocaleString()}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Speakers Identified:</span>
                    <span className="summary-value">{t.speakers?.length || 0}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Total Words:</span>
                    <span className="summary-value">{t.word_count?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="analysis-tabs">
        <div className="tabs-header">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="tab-content animate-fade-in" key={activeTab}>
          {activeTab === 'outcomes' && (
            <ActionItemsTable 
              key={`actions-${activeTranscriptId}-${transcripts.find(t => t.id === activeTranscriptId)?.status}`}
              transcriptId={activeTranscriptId} 
              status={transcripts.find(t => t.id === activeTranscriptId)?.status}
            />
          )}
          {activeTab === 'sentiment' && (
            <SentimentChart 
              key={`sentiment-${activeTranscriptId}-${transcripts.find(t => t.id === activeTranscriptId)?.status}`}
              transcriptId={activeTranscriptId} 
            />
          )}
          {activeTab === 'chat' && <Chatbot meetingId={id} />}
        </div>
      </div>
    </div>
  );
};

export default MeetingDetail;
