import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { transcriptAPI } from '../api';
import './SentimentChart.css';
import { useToast } from './Toast';

const SentimentChart = ({ transcriptId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    if (transcriptId) {
      fetchSentiment();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcriptId]);

  const fetchSentiment = async () => {
    setLoading(true);
    try {
      const response = await transcriptAPI.getSentiment(transcriptId);
      // Format data for Recharts
      const rawData = response.data.sentiment_timeline || response.data || [];
      const formattedData = rawData.map(item => ({
        time: item.timestamp,
        sentiment: item.sentiment,
        score: item.sentiment === 'positive' ? 1 
             : item.sentiment === 'negative' ? -1 
             : item.sentiment === 'conflict' ? -1.5 
             : 0,
        text: item.text
      }));
      setData(formattedData);
    } catch {
      addToast('Failed to load sentiment analysis', 'error');
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <div className="tooltip-header">
            <span className={`sentiment-indicator sentiment-${data.sentiment}`}></span>
            <span className="tooltip-time">{data.time}</span>
          </div>
          <p className="tooltip-text">"{data.text}"</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="chart-loading">
        <div className="skeleton" style={{ height: '300px' }}></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="chart-empty">
        <p>No sentiment data available for this transcript.</p>
      </div>
    );
  }

  return (
    <div className="sentiment-chart-container animate-fade-in">
      <div className="chart-header">
        <h3>Sentiment Timeline</h3>
        <div className="sentiment-legend">
          <div className="legend-item"><span className="indicator sentiment-positive"></span> Positive</div>
          <div className="legend-item"><span className="indicator sentiment-neutral"></span> Neutral</div>
          <div className="legend-item"><span className="indicator sentiment-negative"></span> Negative</div>
          <div className="legend-item"><span className="indicator sentiment-conflict"></span> Conflict</div>
        </div>
      </div>
      
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              hide={true} 
              domain={[-2, 2]} 
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ fill: 'rgba(255,255,255,0.02)' }} 
            />
            <Bar 
              dataKey="score" 
              radius={[4, 4, 4, 4]}
              shape={(props) => {
                const { x, y, width, height, payload } = props;
                let color = '#F59E0B'; // Neutral
                if (payload.sentiment === 'positive') color = '#22C55E';
                if (payload.sentiment === 'negative') color = '#EF4444';
                if (payload.sentiment === 'conflict') color = '#F97316';
                
                // For negative scores, height is usually negative in normal bar chart, 
                // but recharts handles it by setting y correctly and making height positive.
                // We just need to render a rect.
                return (
                  <rect 
                    x={x} 
                    y={y} 
                    width={width} 
                    height={Math.max(10, Math.abs(height))} 
                    fill={color} 
                    rx={4} 
                    ry={4} 
                  />
                );
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SentimentChart;
