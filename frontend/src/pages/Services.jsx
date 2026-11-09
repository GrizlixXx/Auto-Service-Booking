import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Droplet,
  Disc,
  RotateCw,
  Cpu,
  BatteryCharging,
  Sliders,
  Snowflake,
  ClipboardCheck,
  Cog,
  Wind,
  Wrench,
  Zap,
  ShieldCheck,
  Thermometer,
  Flame,
  CloudRain,
  MapPin,
  Clock,
  Phone,
  Check,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calendar,
  AlertOctagon,
  AlertTriangle
} from 'lucide-react';
import { useLocationsCache } from '../hooks/useLocationsCache';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './Services.css';

const SERVICES_LIST = [
  { id: 1,  name: 'Oil Change', description: 'Engine oil and filter replacement', duration: 60, price: 49.99, icon: Droplet },
  { id: 2,  name: 'Brake Inspection', description: 'Full brake system check and pad thickness test', duration: 60, price: 29.99, icon: Disc },
  { id: 3,  name: 'Tire Rotation', description: 'Tire rotation, pressure balancing & wear analysis', duration: 60, price: 19.99, icon: RotateCw },
  { id: 4,  name: 'Engine Diagnostics', description: 'Comprehensive computer OBD-II scanner diagnostics', duration: 60, price: 79.99, icon: Cpu },
  { id: 5,  name: 'Battery Replacement', description: 'Battery health test and brand new battery install', duration: 60, price: 99.99, icon: BatteryCharging },
  { id: 6,  name: 'Wheel Alignment', description: 'Computerized four-wheel laser alignment', duration: 60, price: 69.99, icon: Sliders },
  { id: 7,  name: 'Air Conditioning Service', description: 'A/C leak check, pressure test and refrigerant refill', duration: 60, price: 89.99, icon: Snowflake },
  { id: 8,  name: 'Full Vehicle Inspection', description: 'Complete 120-point mechanical & safety inspection', duration: 60, price: 119.99, icon: ClipboardCheck },
  { id: 9,  name: 'Transmission Fluid Flush', description: 'Full transmission fluid drain, flush and premium refill', duration: 60, price: 129.99, icon: Cog },
  { id: 10, name: 'Cabin & Air Filter Replacement', description: 'Clean airflow replacement for engine and cabin interior', duration: 30, price: 34.99, icon: Wind },
  { id: 11, name: 'Suspension & Shock Check', description: 'Complete inspection of struts, springs, bushings and shocks', duration: 60, price: 59.99, icon: Wrench },
  { id: 12, name: 'Spark Plugs Replacement', description: 'High-performance iridium spark plugs installation', duration: 60, price: 89.99, icon: Zap },
  { id: 13, name: 'Brake Fluid Flush', description: 'Complete hydraulic brake fluid bleed and system refill', duration: 45, price: 49.99, icon: ShieldCheck },
  { id: 14, name: 'Cooling System & Radiator Flush', description: 'Antifreeze drain, chemical radiator flush and fresh fill', duration: 60, price: 79.99, icon: Thermometer },
  { id: 15, name: 'Exhaust & Muffler Service', description: 'Leak detection, muffler, resonator and catalytic inspection', duration: 60, price: 99.99, icon: Flame },
  { id: 16, name: 'Windshield Wiper & Washer Service', description: 'Premium all-weather wiper blades set & washer alignment', duration: 20, price: 24.99, icon: CloudRain },
];

const STEPS = ['Service', 'Location', 'Date & Time', 'Confirm'];

export default function Services() {
  const { user, isAuthenticated } = useAuth();
  const { locations, loading: locLoading } = useLocationsCache();

  const [step, setStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState([]);
  const [carMark, setCarMark] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const upcomingDays = useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(now.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const weekday = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayMonth = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      list.push({ dateStr, weekday, dayMonth });
    }
    return list;
  }, []);

  useEffect(() => {
    if (step === 2 && !selectedDate && upcomingDays.length > 0) {
      setSelectedDate(upcomingDays[0].dateStr);
    }
  }, [step, selectedDate, upcomingDays]);

  useEffect(() => {
    if (user?.phone && !phone) {
      setPhone(user.phone);
    }
  }, [user, phone]);

  const citySalons = selectedCity
    ? (locations.find(c => String(c.id) === String(selectedCity))?.salons || [])
    : [];

  useEffect(() => {
    if (!selectedSalon || !selectedDate) { setSlots([]); return; }
    setSlotsLoading(true);
    setSelectedSlot('');
    api.get(`/slots?salon_id=${selectedSalon.id}&date=${selectedDate}`)
      .then(r => setSlots(r.data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedSalon, selectedDate]);

  const toggleService = (svc) => {
    setSelectedServices(prev =>
      prev.find(s => s.id === svc.id)
        ? prev.filter(s => s.id !== svc.id)
        : [...prev, svc]
    );
  };

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  const canNext = () => {
    if (step === 0) return selectedServices.length > 0 && carMark.trim();
    if (step === 1) return selectedSalon && phone.trim();
    if (step === 2) return selectedDate && selectedSlot;
    return true;
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setError('Please sign in to confirm your booking.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await api.post('/orders/addOrder', {
        login: user.login,
        phone,
        mark: carMark,
        services: selectedServices.map(s => s.name),
        time: `${selectedDate} ${selectedSlot}:00`,
        salon_id: selectedSalon.id,
        slot_datetime: `${selectedDate} ${selectedSlot}:00`,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="services-page">
        <div className="services-success">
          <CheckCircle2 size={72} color="#10b981" className="services-success__icon" />
          <h2>Booking Confirmed!</h2>
          <p>Your appointment has been scheduled for <strong>{selectedDate}</strong> at <strong>{selectedSlot}</strong>.</p>
          <p className="services-success__salon">
            <MapPin size={18} style={{ display: 'inline', verticalAlign: '-3px', marginRight: 4 }} />
            {selectedSalon?.name}
          </p>
          <p className="services-success__note">We will contact you at <strong>{phone}</strong> to confirm.</p>
          <button className="btn btn-primary" onClick={() => { setSubmitted(false); setStep(0); setSelectedServices([]); setCarMark(''); setSelectedCity(''); setSelectedSalon(null); setSelectedDate(''); setSelectedSlot(''); }}>
            Book Another Service
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="services-page page-content">
      <div className="container">
        <div className="services-header">
          <h1>Book a <span className="gradient-text">Service</span></h1>
          <p>Choose your services, pick a location and choose an available time slot.</p>
        </div>

        {!isAuthenticated && (
          <div className="services-auth-banner glass-card animate-fade-in">
            <div className="services-auth-banner__content">
              <Sparkles size={32} color="#3b82f6" className="services-auth-banner__icon" />
              <div>
                <h3>Planning a service visit? Create an account first</h3>
                <p>Register in under 1 minute to track your booking live, view history, and get service reminders.</p>
              </div>
            </div>
            <div className="services-auth-banner__actions">
              <Link to="/register" className="btn btn-primary btn-sm">Register Now</Link>
              <Link to="/signin" className="btn btn-secondary btn-sm">Sign In</Link>
            </div>
          </div>
        )}

        <div className="wizard-steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`wizard-step ${i === step ? 'wizard-step--active' : ''} ${i < step ? 'wizard-step--done' : ''}`}>
              <div className="wizard-step__circle">{i < step ? <Check size={14} /> : i + 1}</div>
              <span className="wizard-step__label">{s}</span>
            </div>
          ))}
        </div>

        <div className="wizard-body glass-card">
          {step === 0 && (
            <div className="wizard-pane animate-fade-in">
              <h2 className="wizard-pane__title">Choose Your Services ({SERVICES_LIST.length} Available)</h2>
              <div className="services-grid">
                {SERVICES_LIST.map(svc => {
                  const selected = !!selectedServices.find(s => s.id === svc.id);
                  const Icon = svc.icon;
                  return (
                    <button
                      key={svc.id}
                      type="button"
                      className={`service-tile ${selected ? 'service-tile--selected' : ''}`}
                      onClick={() => toggleService(svc)}
                    >
                      <div className="service-tile__icon-box">
                        <Icon size={26} color={selected ? '#3b82f6' : '#60a5fa'} />
                      </div>
                      <span className="service-tile__name">{svc.name}</span>
                      <span className="service-tile__price">${svc.price.toFixed(2)}</span>
                      <span className="service-tile__desc">{svc.description}</span>
                      {selected && (
                        <span className="service-tile__check">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {selectedServices.length > 0 && (
                <div className="services-summary">
                  Selected: <strong>{selectedServices.map(s => s.name).join(', ')}</strong>
                  <span className="services-summary__total">${totalPrice.toFixed(2)}</span>
                </div>
              )}
              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label className="form-label" htmlFor="car-mark">Your Car (make, model, year)</label>
                <input id="car-mark" type="text" className="form-input" placeholder="e.g. Toyota Camry 2021"
                  value={carMark} onChange={e => setCarMark(e.target.value)} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="wizard-pane animate-fade-in">
              <h2 className="wizard-pane__title">Select AutoFix Service Center</h2>
              {locLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><div className="spinner" /></div>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="city-select">Select City</label>
                    <select id="city-select" className="form-input" value={selectedCity}
                      onChange={e => { setSelectedCity(e.target.value); setSelectedSalon(null); }}>
                      <option value="">— Choose a City —</option>
                      {locations.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.salons?.length || 0} centers)</option>
                      ))}
                    </select>
                  </div>

                  {selectedCity && (
                    <div className="salons-list">
                      <label className="form-label">Available Service Centers</label>
                      {citySalons.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No centers in this city.</p>
                      ) : (
                        citySalons.map(s => {
                          const isSel = selectedSalon?.id === s.id;
                          return (
                            <div key={s.id}
                              className={`salon-card glass-card ${isSel ? 'salon-card--selected' : ''}`}
                              onClick={() => setSelectedSalon(s)}>
                              <div className="salon-card__header">
                                <span className="salon-card__name">
                                  <MapPin size={16} color="#3b82f6" style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
                                  {s.name}
                                </span>
                                {isSel && <span className="badge badge-blue">Selected</span>}
                              </div>
                              <p className="salon-card__addr">{s.street}, bldg. {s.building}</p>
                              <div className="salon-card__meta">
                                <span>
                                  <Clock size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 3 }} />
                                  {s.open_time?.slice(0,5)} – {s.close_time?.slice(0,5)}
                                </span>
                                {s.phone && (
                                  <span>
                                    <Phone size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 3 }} />
                                    {s.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  <div className="form-group" style={{ marginTop: '1.5rem' }}>
                    <label className="form-label" htmlFor="phone">Your Contact Phone Number</label>
                    <input id="phone" type="tel" className="form-input" placeholder="+1 555 0101"
                      value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="wizard-pane animate-fade-in">
              <h2 className="wizard-pane__title">Choose Date & Time Slot</h2>
              <p className="wizard-pane__sub">
                <MapPin size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
                Selected Center: <strong>{selectedSalon?.name}</strong>
              </p>

              <div className="form-group">
                <label className="form-label">
                  <Calendar size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
                  Select Date (Quick Menu)
                </label>
                <div className="date-pills-list">
                  {upcomingDays.map((d) => (
                    <button
                      key={d.dateStr}
                      type="button"
                      className={`date-pill ${selectedDate === d.dateStr ? 'date-pill--active' : ''}`}
                      onClick={() => setSelectedDate(d.dateStr)}
                    >
                      <span className="date-pill__weekday">{d.weekday}</span>
                      <span className="date-pill__day">{d.dayMonth}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ maxWidth: 300, marginBottom: '1.5rem' }}>
                <label className="form-label" htmlFor="booking-date" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Or pick a specific calendar date:
                </label>
                <input id="booking-date" type="date" className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)} />
              </div>

              {selectedDate && (
                <div>
                  <label className="form-label">
                    <Clock size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
                    Available Time Slots for {selectedDate}:
                  </label>
                  {slotsLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><div className="spinner" /></div>
                  ) : slots.length === 0 ? (
                    <div className="alert alert-info">No service slots scheduled for this date. Please try another day.</div>
                  ) : (
                    <>
                      {slots.every(s => !s.available) && (
                        <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                          <AlertOctagon size={28} color="#ef4444" style={{ flexShrink: 0 }} />
                          <div>
                            <strong>All Appointment Slots Are Fully Booked!</strong>
                            <div style={{ fontSize: '0.875rem', marginTop: '0.2rem', opacity: 0.9 }}>
                              Every slot for <strong>{selectedDate}</strong> at this center has already been reserved. Please pick another date from the pills above or try another nearby center.
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="slots-grid">
                        {slots.map(slot => (
                          <button
                            key={slot.time}
                            type="button"
                            className={`slot-btn ${slot.available ? '' : 'slot-btn--taken'} ${selectedSlot === slot.time ? 'slot-btn--selected' : ''}`}
                            disabled={!slot.available}
                            onClick={() => setSelectedSlot(slot.time)}
                          >
                            {slot.time}
                            {!slot.available && <span style={{ fontSize: '0.65rem', display: 'block', opacity: 0.6 }}>Taken</span>}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="wizard-pane animate-fade-in">
              <h2 className="wizard-pane__title">Confirm Your Booking</h2>
              {!isAuthenticated && (
                <div className="alert alert-error" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                  <span>
                    You must be signed in to finalize booking.{' '}
                    <Link to="/signin" style={{ color: 'var(--accent-blue)', textDecoration: 'underline', fontWeight: 600 }}>Sign In</Link>
                    {' '}or{' '}
                    <Link to="/register" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline', fontWeight: 600 }}>Create an Account</Link>.
                  </span>
                </div>
              )}
              {error && <div className="alert alert-error">{error}</div>}
              <div className="confirm-summary glass-card">
                <div className="confirm-row"><span>Services</span><span>{selectedServices.map(s => s.name).join(', ')}</span></div>
                <div className="confirm-row"><span>Car</span><span>{carMark}</span></div>
                <div className="confirm-row"><span>Location</span><span>{selectedSalon?.name}</span></div>
                <div className="confirm-row"><span>Date</span><span>{selectedDate}</span></div>
                <div className="confirm-row"><span>Time Slot</span><span>{selectedSlot}</span></div>
                <div className="confirm-row"><span>Contact Phone</span><span>{phone}</span></div>
                <div className="confirm-row confirm-row--total">
                  <span>Total Cost</span>
                  <span className="gradient-text">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="wizard-nav">
            {step > 0 && (
              <button type="button" className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>
                <ArrowLeft size={16} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
                Back
              </button>
            )}
            {step < 3 ? (
              <button type="button" className="btn btn-primary" disabled={!canNext()} onClick={() => setStep(s => s + 1)}>
                Next
                <ArrowRight size={16} style={{ display: 'inline', verticalAlign: '-2px', marginLeft: 4 }} />
              </button>
            ) : (
              <button type="button" className="btn btn-primary" disabled={submitting || !isAuthenticated} onClick={handleSubmit}>
                {submitting ? <span className="spinner" style={{width:20,height:20,borderWidth:2}} /> : (
                  <>
                    <Check size={18} style={{ display: 'inline', verticalAlign: '-3px', marginRight: 6 }} />
                    Confirm Booking
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
