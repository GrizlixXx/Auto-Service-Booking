import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import './StubPage.css';

export default function AdminPanel() {
  return (
    <div className="stub-page page-content">
      <div className="container stub-container">
        <div className="stub-card glass-card">
          <div className="stub-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <ShieldCheck size={48} color="#ef4444" />
          </div>
          <h1>Admin Panel</h1>
          <span className="badge badge-red">Admin Only</span>
          <p>The admin dashboard is currently under development.</p>
          <p className="stub-sub">Full management features including user management, analytics, and system configuration will be available soon.</p>
          <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
