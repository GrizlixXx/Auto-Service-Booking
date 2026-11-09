import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  User,
  LogOut,
  Car,
  MapPin,
  Calendar,
  Edit3,
  ArrowRight,
  Upload,
  Trash2,
  Download,
  UserRound
} from 'lucide-react';
import api from '../api/axios';
import './UserAccount.css';

const STATUS_COLORS = {
  'Pending': 'badge-orange',
  'В очікуванні': 'badge-orange',
  'In Progress': 'badge-blue',
  'Completed': 'badge-green',
  'Cancelled': 'badge-red',
};

export default function UserAccount() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [avatarError, setAvatarError] = useState(false);

  const rawAvatarUrl = user?.avatar_url || user?.profilePhoto;
  const hasAvatar = Boolean(
    rawAvatarUrl &&
    !avatarError &&
    !rawAvatarUrl.includes('default') &&
    !rawAvatarUrl.includes('profilesPhotos')
  );

  useEffect(() => {
    setAvatarError(false);
  }, [rawAvatarUrl]);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState({ type: '', text: '' });

  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ login: user?.login || '', email: user?.email || '' });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get(`/orders/${user.login}`)
      .then(r => setOrders(r.data))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarMsg({ type: 'error', text: 'Please select a valid image file (JPEG, PNG, WebP).' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setAvatarMsg({ type: 'error', text: 'Image file size exceeds 10MB limit.' });
      return;
    }

    setAvatarLoading(true);
    setAvatarMsg({ type: '', text: '' });

    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('login', user.login);

    try {
      const res = await api.post('/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newUrl = res.data.avatarUrl;
      updateUser({ avatar_url: newUrl, profilePhoto: newUrl });
      const sizeKb = res.data.sizeBytes ? Math.round(res.data.sizeBytes / 1024) : null;
      setAvatarMsg({
        type: 'success',
        text: `Avatar converted to WebP & updated!${sizeKb ? ` (Size: ${sizeKb} KB)` : ''}`
      });
    } catch (err) {
      setAvatarMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to upload and convert avatar.'
      });
    } finally {
      setAvatarLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAvatarRemove = async () => {
    if (!window.confirm('Are you sure you want to remove your avatar?')) return;
    setAvatarLoading(true);
    setAvatarMsg({ type: '', text: '' });
    try {
      await api.delete(`/avatar/${user.login}`);
      updateUser({ avatar_url: null, profilePhoto: null });
      setAvatarMsg({ type: 'success', text: 'Avatar removed.' });
    } catch (err) {
      setAvatarMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to remove avatar.'
      });
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleProfileSave = async () => {
    setProfileLoading(true);
    setProfileMsg({ type: '', text: '' });
    try {
      await api.put('/update-profile', {
        currentLogin: user.login,
        newLogin: profileForm.login,
        newEmail: profileForm.email,
      });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setEditMode(false);
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const roleBadgeClass = {
    admin: 'badge-red',
    operator: 'badge-cyan',
    manager: 'badge-orange',
    client: 'badge-blue',
  }[user?.role] || 'badge-gray';

  return (
    <div className="account-page page-content">
      <div className="container account-container">
        <aside className="account-sidebar glass-card">
          <div className="account-avatar">
            {hasAvatar ? (
              <img
                src={rawAvatarUrl}
                alt={user?.login}
                className="account-avatar__img"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className="account-avatar__circle">
                <UserRound size={36} strokeWidth={1.5} />
              </div>
            )}
            <div className="account-avatar__info">
              <span className="account-avatar__name">{user?.login}</span>
              <span className={`badge ${roleBadgeClass}`}>{user?.role}</span>
            </div>
          </div>
          <div className="divider" />
          <nav className="account-nav">
            {[
              { id: 'orders', icon: <ClipboardList size={18} />, label: 'My Orders' },
              { id: 'profile', icon: <User size={18} />, label: 'Profile' },
            ].map(tab => (
              <button
                key={tab.id}
                className={`account-nav__btn ${activeTab === tab.id ? 'account-nav__btn--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </nav>
          <div className="divider" />
          <button className="btn btn-danger account-logout" onClick={handleLogout} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </aside>

        <main className="account-main">
          {activeTab === 'orders' && (
            <div className="animate-fade-in">
              <h2 className="account-section-title">My Bookings</h2>
              {ordersLoading ? (
                <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}><div className="spinner" /></div>
              ) : orders.length === 0 ? (
                <div className="account-empty glass-card">
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <Car size={48} color="#3b82f6" />
                  </div>
                  <p>No bookings yet.</p>
                  <a href="/services" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    Book a Service <ArrowRight size={16} />
                  </a>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order, i) => (
                    <div key={i} className="order-card glass-card">
                      <div className="order-card__head">
                        <span className="order-card__car" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <Car size={18} color="#3b82f6" />
                          <span>{order.car_mark}</span>
                        </span>
                        <span className={`badge ${STATUS_COLORS[order.status] || 'badge-gray'}`}>
                          {order.status || 'Pending'}
                        </span>
                      </div>
                      <div className="order-card__body">
                        <div className="order-detail">
                          <span className="order-detail__label">Services</span>
                          <span className="order-detail__value">{order.services || '—'}</span>
                        </div>
                        <div className="order-detail">
                          <span className="order-detail__label">Location</span>
                          <span className="order-detail__value" style={{ color: 'var(--accent-blue)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={15} style={{ flexShrink: 0 }} />
                            <span>
                              {order.city_name ? order.city_name : ''}
                              {order.salon_name ? ` • ${order.salon_name}` : ''}
                              {order.street_name ? ` (${order.street_name} ${order.building || ''})` : ''}
                              {!order.city_name && !order.salon_name && 'Main Service Hub'}
                            </span>
                          </span>
                        </div>
                        <div className="order-detail">
                          <span className="order-detail__label">Date & Time</span>
                          <span className="order-detail__value" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={15} style={{ flexShrink: 0 }} />
                            <span>
                              {order.order_date ? new Date(order.order_date).toLocaleDateString('en-US', {
                                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                              }) : '—'}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="animate-fade-in">
              <h2 className="account-section-title">My Profile</h2>

              <div className="avatar-manager glass-card">
                <div className="avatar-manager__left">
                  {hasAvatar ? (
                    <img
                      src={rawAvatarUrl}
                      alt={user?.login}
                      className="avatar-manager__preview"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div className="avatar-manager__circle">
                      <UserRound size={48} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                <div className="avatar-manager__right">
                  <div className="avatar-manager__header">
                    <h3 className="avatar-manager__title">Profile Avatar</h3>
                    <span className="badge badge-blue">Auto-WebP</span>
                  </div>
                  <p className="avatar-manager__sub">
                    Upload your profile photo. It will automatically be compressed, converted to a lightweight <strong>WebP</strong> format, and displayed publicly to other users and operators.
                  </p>

                  {avatarMsg.text && (
                    <div className={`alert alert-${avatarMsg.type}`} style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                      {avatarMsg.text}
                    </div>
                  )}

                  <div className="avatar-manager__actions">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarLoading}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      {avatarLoading ? (
                        <span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} />
                      ) : (
                        <Upload size={15} />
                      )}
                      {user?.avatar_url || user?.profilePhoto ? 'Change Photo' : 'Upload Photo'}
                    </button>

                    {(user?.avatar_url || user?.profilePhoto) && (
                      <>
                        <button
                          className="btn btn-secondary"
                          onClick={handleAvatarRemove}
                          disabled={avatarLoading}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Trash2 size={15} color="#ef4444" /> Remove
                        </button>
                        <a
                          href={user.avatar_url || user.profilePhoto}
                          download={`avatar-${user.login}.webp`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-ghost"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                          title="Download or inspect converted WebP file"
                        >
                          <Download size={15} /> Download WebP
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="profile-card glass-card">
                {profileMsg.text && (
                  <div className={`alert alert-${profileMsg.type} mb`}>{profileMsg.text}</div>
                )}
                <div className="profile-fields">
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    {editMode
                      ? <input className="form-input" value={profileForm.login}
                          onChange={e => setProfileForm(p => ({ ...p, login: e.target.value }))} />
                      : <div className="profile-value">{user?.login}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    {editMode
                      ? <input className="form-input" type="email" value={profileForm.email}
                          onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))} />
                      : <div className="profile-value">{user?.email}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <div className="profile-value">{user?.phone || '—'}</div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <div className="profile-value">
                      <span className={`badge ${roleBadgeClass}`}>{user?.role}</span>
                    </div>
                  </div>
                </div>
                <div className="profile-actions">
                  {editMode ? (
                    <>
                      <button className="btn btn-primary" onClick={handleProfileSave} disabled={profileLoading}>
                        {profileLoading ? <span className="spinner" style={{width:18,height:18,borderWidth:2}}/> : 'Save Changes'}
                      </button>
                      <button className="btn btn-secondary" onClick={() => { setEditMode(false); setProfileMsg({ type:'', text:'' }); }}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button className="btn btn-secondary" onClick={() => setEditMode(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Edit3 size={16} /> Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
