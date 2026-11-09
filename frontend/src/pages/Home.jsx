import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Headset,
  MapPin,
  Wrench,
  Calendar,
  Droplet,
  Disc,
  Cpu,
  Cog,
  RotateCw,
  BatteryCharging,
  Sliders,
  Snowflake,
  Thermometer,
  ClipboardCheck,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import './Home.css';

const FEATURES = [
  { icon: Headset, title: '24/7 Support', desc: 'Our operators are always available to assist you with any issue, day or night.' },
  { icon: MapPin, title: '6 Locations', desc: 'Service centers across 5 cities in the region. Always close to you.' },
  { icon: Wrench, title: '16 Services', desc: 'From oil changes to full diagnostics and transmission flush — comprehensive car care.' },
  { icon: Calendar, title: 'Easy Booking', desc: 'Register, pick your service and location, choose a time slot. Done in minutes.' },
];

const SERVICES_PREVIEW = [
  { name: 'Oil Change',                      price: '$49.99',  icon: Droplet, duration: '60 min' },
  { name: 'Brake Inspection',                price: '$29.99',  icon: Disc, duration: '60 min' },
  { name: 'Engine Diagnostics',              price: '$79.99',  icon: Cpu, duration: '60 min' },
  { name: 'Transmission Fluid Flush',        price: '$129.99', icon: Cog, duration: '60 min' },
  { name: 'Tire Rotation & Balance',         price: '$19.99',  icon: RotateCw, duration: '60 min' },
  { name: 'Battery Replacement',             price: '$99.99',  icon: BatteryCharging, duration: '60 min' },
  { name: 'Wheel Alignment',                 price: '$69.99',  icon: Sliders, duration: '60 min' },
  { name: 'A/C Refrigerant Service',         price: '$89.99',  icon: Snowflake, duration: '60 min' },
  { name: 'Cooling System & Radiator Flush', price: '$79.99',  icon: Thermometer, duration: '60 min' },
  { name: 'Full 120-Point Inspection',       price: '$119.99', icon: ClipboardCheck, duration: '60 min' },
];

const STATS = [
  { value: '50K+', label: 'Happy Clients' },
  { value: '10+',  label: 'Years Experience' },
  { value: '6',    label: 'Service Centers' },
  { value: '99%',  label: 'Satisfaction Rate' },
];

export default function Home() {
  const sectionsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    sectionsRef.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const addRef = (el) => { if (el && !sectionsRef.current.includes(el)) sectionsRef.current.push(el); };

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__bg" />
        <div className="hero__particles">
          {[...Array(8)].map((_, i) => <div key={i} className={`hero__particle hero__particle--${i+1}`} />)}
        </div>
        <div className="container hero__content">
          <div className="hero__badge badge badge-blue">
            <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 5 }} />
            Premium Auto Service
          </div>
          <h1 className="hero__title">
            Your Car Deserves<br />
            <span className="gradient-text">The Best Care</span>
          </h1>
          <p className="hero__subtitle">
            Book your auto service appointment online in minutes.
            Trusted by 50,000+ customers across 6 premium locations.
          </p>
          <div className="hero__steps">
            {['Register', 'Choose Service', 'Pick Location', 'Get Served'].map((s, i) => (
              <div key={i} className="hero__step">
                <span className="hero__step-num">{i+1}</span>
                <span className="hero__step-text">{s}</span>
              </div>
            ))}
          </div>
          <div className="hero__actions">
            <Link to="/register" className="btn btn-primary hero__cta">
              Get Started Free
              <ArrowRight size={18} style={{ display: 'inline', verticalAlign: '-3px', marginLeft: 6 }} />
            </Link>
            <Link to="/services" className="btn btn-secondary">View 16 Services</Link>
          </div>
        </div>
      </section>

      <section className="stats-bar">
        <div className="container stats-bar__inner reveal" ref={addRef}>
          {STATS.map(s => (
            <div key={s.label} className="stat-item">
              <span className="stat-item__value gradient-text">{s.value}</span>
              <span className="stat-item__label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="features section-pad" id="about">
        <div className="container">
          <div className="section-header reveal" ref={addRef}>
            <span className="section-header__eyebrow">Why AutoFix?</span>
            <h2 className="section-header__title">Built Around Your <span className="gradient-text">Convenience</span></h2>
            <p className="section-header__sub">We reimagined auto service from the ground up — fast, transparent, and stress-free.</p>
          </div>
          <div className="features__grid">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="feature-card glass-card reveal" ref={addRef} style={{ transitionDelay: `${i*0.1}s` }}>
                  <div className="feature-card__icon">
                    <Icon size={34} color="#3b82f6" />
                  </div>
                  <h3 className="feature-card__title">{f.title}</h3>
                  <p className="feature-card__desc">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="services-preview section-pad">
        <div className="container">
          <div className="section-header reveal" ref={addRef}>
            <span className="section-header__eyebrow">Our Services</span>
            <h2 className="section-header__title">What We <span className="gradient-text">Offer</span></h2>
            <p className="section-header__sub">Professional car care services performed by certified technicians across 16 categories.</p>
          </div>
          <div className="services-preview__grid">
            {SERVICES_PREVIEW.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.name} className="service-card glass-card reveal" ref={addRef} style={{ transitionDelay: `${i*0.06}s` }}>
                  <div className="service-card__icon">
                    <Icon size={24} color="#38bdf8" />
                  </div>
                  <div className="service-card__info">
                    <h3 className="service-card__name">{s.name}</h3>
                    <span className="service-card__duration">{s.duration}</span>
                  </div>
                  <span className="service-card__price">{s.price}</span>
                </div>
              );
            })}
          </div>
          <div className="services-preview__cta">
            <Link to="/services" className="btn btn-primary">
              Browse All 16 Services
              <ArrowRight size={18} style={{ display: 'inline', verticalAlign: '-3px', marginLeft: 6 }} />
            </Link>
          </div>
        </div>
      </section>

      <section className="how-it-works section-pad">
        <div className="container">
          <div className="section-header reveal" ref={addRef}>
            <span className="section-header__eyebrow">Process</span>
            <h2 className="section-header__title">How It <span className="gradient-text">Works</span></h2>
          </div>
          <div className="steps-timeline">
            {[
              { n:1, t:'Create Account', d:'Register with your email and set up your profile in under a minute.' },
              { n:2, t:'Choose a Service', d:'Browse our 16 available services and select what your car needs.' },
              { n:3, t:'Pick a Location & Slot', d:'Select the nearest AutoFix center and an available time slot.' },
              { n:4, t:'Get Your Car Serviced', d:'Arrive at the center and let our certified team take care of the rest.' },
            ].map((step) => (
              <div key={step.n} className="timeline-step reveal" ref={addRef}>
                <div className="timeline-step__num">{step.n}</div>
                <div className="timeline-step__content glass-card">
                  <h3>{step.t}</h3>
                  <p>{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <div className="container cta-banner__inner">
          <h2>Ready to book your service?</h2>
          <p>Join thousands of satisfied customers. It takes less than 2 minutes.</p>
          <Link to="/register" className="btn btn-primary cta-banner__btn">
            Register Now — It's Free
            <ArrowRight size={18} style={{ display: 'inline', verticalAlign: '-3px', marginLeft: 6 }} />
          </Link>
        </div>
      </section>
    </div>
  );
}
