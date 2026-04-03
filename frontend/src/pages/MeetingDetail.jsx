import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, FileText, CheckCircle, Brain, MessageSquare, BarChart3, Upload } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('actions');
  const [loading, setLoading] = useState(true);
  const [activeTranscriptId, setActiveTranscriptId] = useState(null);
  const pollingRef = useRef({});

  const startPolling = (tId) => {
    if (pollingRef.current[tId]) return;

    pollingRef.current[tId] = setInterval(async () => {
      try {
        const res = await transcriptAPI.getStatus(tId);
        if (res.status === 'completed') {
          clearInterval(pollingRef.current[tId]);
          delete pollingRef.current[tId];
          addToast('Analysis completed successfully');
          fetchMeetingData();
        } else if (res.status === 'failed') {
          clearInterval(pollingRef.current[tId]);
          delete pollingRef.current[tId];
          addToast('Analysis failed for one transcript', 'error');
        }
      } catch {
        clearInterval(pollingRef.current[tId]);
      }
    }, 5000);
  };

  const fetchMeetingData = async () => {
    try {
      const res = await meetingAPI.get(id);
      setMeeting(res);
      setTranscripts(res.transcripts || []);
      if (res.transcripts?.length > 0) {
        const lastCompleted = [...res.transcripts].reverse().find(t => t.status === 'completed');
        if (lastCompleted) setActiveTranscriptId(lastCompleted.id);
        
        // Start polling for any pending ones
        res.transcripts.forEach(t => {
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
    if (newTranscript.status !== 'completed') {
      startPolling(newTranscript.id);
    } else {
      setActiveTranscriptId(newTranscript.id);
    }
  };

  if (loading) return <div className="detail-loading"><div className="skeleton" style={{height: '300px'}}></div></div>;
  if (!meeting) return <div className="detail-error">Meeting not found</div>;

  const tabs = [
    { id: 'actions', label: 'Action Items', icon: CheckCircle },
    { id: 'decisions', label: 'Decisions', icon: Brain },
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
            <span><Clock size={14} /> Created {new Date(meeting.created_at).toLocaleDateString()}</span>
            <span><FileText size={14} /> {transcripts.length} Transcripts</span>
            <span><CheckCircle size={14} /> {meeting.total_action_items} Actions</span>
          </div>
        </div>
      </header>

      <UploadZone meetingId={id} onUploadComplete={handleUploadComplete} />

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
          {activeTab === 'actions' && <ActionItemsTable transcriptId={activeTranscriptId} />}
          {activeTab === 'decisions' && <ActionItemsTable transcriptId={activeTranscriptId} type="decisions" />}
          {activeTab === 'sentiment' && <SentimentChart transcriptId={activeTranscriptId} />}
          {activeTab === 'chat' && <Chatbot meetingId={id} />}
        </div>
      </div>
    </div>
  );
};

export default MeetingDetail;
