import { useState, useEffect } from 'react';
import { Bot, RotateCw, CheckCircle2, User, Mail, Phone, Check } from 'lucide-react';
import api from '../api/axios';
import './StubPage.css';
import './OperatorPanel.css';

export default function OperatorPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = () => {
    setLoading(true);
    api.get('/operator/requests')
      .then(r => setRequests(r.data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, []);

  const closeRequest = async (id) => {
    try {
      await api.delete(`/operator/request/${id}`);
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch {}
  };

  return (
    <div className="stub-page page-content">
      <div className="container">
        <div className="operator-header">
          <h1>Operator Panel</h1>
          <span className="badge badge-cyan">Operator</span>
          <p>View and manage incoming help requests from users.</p>
        </div>

        <div className="operator-panel-note glass-card">
          <Bot size={28} color="#06b6d4" style={{ flexShrink: 0 }} />
          <div>
            <strong>Telegram Notifications Active</strong>
            <p>All new requests are automatically sent to operator Telegram accounts.</p>
          </div>
        </div>

        <div className="operator-actions">
          <h2>Open Requests ({requests.length})</h2>
          <button className="btn btn-secondary" onClick={fetchRequests} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <RotateCw size={14} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}><div className="spinner" /></div>
        ) : requests.length === 0 ? (
          <div className="stub-card glass-card" style={{ maxWidth:'500px', margin:'0 auto' }}>
            <div className="stub-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <CheckCircle2 size={48} color="#10b981" />
            </div>
            <p>No open requests. All clear!</p>
          </div>
        ) : (
          <div className="requests-list">
            {requests.map(r => (
              <div key={r.id} className="request-card glass-card">
                <div className="request-card__head">
                  <span className="request-card__user" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    {r.avatar_url && !r.avatar_url.includes('default') && !r.avatar_url.includes('profilesPhotos') ? (
                      <img
                        src={r.avatar_url}
                        alt={r.user_login}
                        style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--accent-blue)', flexShrink: 0 }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <User size={16} />
                    )}
                    <span>{r.user_login}</span>
                  </span>
                  <span className="request-card__time">{new Date(r.created_at).toLocaleString()}</span>
                </div>
                <p className="request-card__reason">{r.reason}</p>
                <div className="request-card__contacts">
                  {r.email && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={15} /> {r.email}
                    </span>
                  )}
                  {r.phone_number && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={15} /> {r.phone_number}
                    </span>
                  )}
                </div>
                <button
                  className="btn btn-danger request-card__close"
                  onClick={() => closeRequest(r.id)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Check size={16} /> Close Request
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
