import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  X,
  RotateCcw,
  Send,
  Calendar,
  ClipboardList,
  Clock,
  Headphones,
  Info,
  Bot,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './ChatBot.css';

const STATES = {
  IDLE: 'IDLE',
  MENU: 'MENU',
  MY_ORDERS: 'MY_ORDERS',
  AVAILABILITY_CITY: 'AVAILABILITY_CITY',
  AVAILABILITY_SALON: 'AVAILABILITY_SALON',
  AVAILABILITY_DATE: 'AVAILABILITY_DATE',
  OPERATOR_REASON: 'OPERATOR_REASON',
  OPERATOR_SENT: 'OPERATOR_SENT',
};

const MAIN_MENU = [
  { id: 'book',       label: 'Book a Service',      Icon: Calendar },
  { id: 'orders',     label: 'My Bookings',         Icon: ClipboardList },
  { id: 'available',  label: 'Check Availability',  Icon: Clock },
  { id: 'operator',   label: 'Speak to Operator',   Icon: Headphones },
  { id: 'about',      label: 'About AutoFix',       Icon: Info },
];

function BotMessage({ text, isBot = true, time }) {
  if (!text) return null;
  return (
    <div className={`chat-msg ${isBot ? 'chat-msg--bot' : 'chat-msg--user'}`}>
      <div className="chat-msg__avatar">
        {isBot ? <Bot size={15} color="#06b6d4" /> : <User size={15} color="#3b82f6" />}
      </div>
      <div className="chat-msg__bubble">
        <p dangerouslySetInnerHTML={{ __html: text }} />
        {time && <span className="chat-msg__time">{time}</span>}
      </div>
    </div>
  );
}

function OptionButtons({ options = [], onSelect }) {
  const [chosen, setChosen] = useState(null);
  return (
    <div className="chat-options">
      {options.map((opt, idx) => {
        const id = opt?.id || `opt-${idx}`;
        const label = opt?.label || String(opt);
        return (
          <button
            key={id}
            type="button"
            className={`chat-option-btn ${chosen === id ? 'chat-option-btn--selected' : ''}`}
            disabled={chosen !== null}
            onClick={() => {
              setChosen(id);
              if (onSelect) onSelect(opt);
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default function ChatBot() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [state, setState] = useState(STATES.IDLE);
  const [input, setInput] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const messagesEndRef = useRef(null);

  const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const addMessage = (text, isBot = true) => {
    setMessages(prev => [...prev, {
      text,
      isBot,
      time: now(),
      id: `msg-${Date.now()}-${Math.random()}`
    }]);
  };

  const addOptions = (text, options, onSelect) => {
    setMessages(prev => [...prev, {
      text,
      isBot: true,
      time: now(),
      id: `opt-${Date.now()}-${Math.random()}`,
      options,
      onSelect
    }]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const cached = sessionStorage.getItem('autofix_locations');
    if (cached) {
      try { setLocations(JSON.parse(cached)); } catch {}
    } else {
      api.get('/locations').then(r => {
        if (Array.isArray(r.data)) {
          setLocations(r.data);
          sessionStorage.setItem('autofix_locations', JSON.stringify(r.data));
        }
      }).catch(() => {});
    }
  }, []);

  const openChat = () => {
    setOpen(true);
    if (messages.length === 0) {
      setTimeout(() => startConversation(), 250);
    }
  };

  const startConversation = () => {
    if (!isAuthenticated) {
      addMessage("Hello! I'm the <strong>AutoFix Assistant</strong>.<br>Please sign in or register to access full assistance.");
      setMessages(prev => [...prev, {
        isBot: true,
        time: now(),
        id: `prompt-${Date.now()}`,
        isSignInPrompt: true,
      }]);
      return;
    }
    addMessage(`Hello, <strong>${user?.login || 'Driver'}</strong>! How can I help you today?`);
    showMainMenu();
  };

  const showMainMenu = () => {
    setState(STATES.MENU);
    setShowInput(false);
    setMessages(prev => [...prev, {
      isBot: true,
      isMenu: true,
      time: now(),
      id: `menu-${Date.now()}`,
    }]);
  };

  const handleMenuSelect = async (option) => {
    addMessage(option.label, false);
    switch (option.id) {
      case 'book':
        addMessage("Sure! Redirecting you to the booking page...");
        setTimeout(() => { navigate('/services'); setOpen(false); }, 800);
        break;

      case 'orders':
        setState(STATES.MY_ORDERS);
        setLoading(true);
        addMessage("Fetching your bookings...");
        try {
          const res = await api.get(`/orders/${user.login}`);
          if (!res.data || res.data.length === 0) {
            addMessage("You don't have any bookings yet. Would you like to book a service?");
          } else {
            const orderList = res.data.slice(0, 5).map((o, i) =>
              `<strong>${i + 1}. ${o.car_mark}</strong><br>` +
              `&nbsp;&nbsp;Location: ${o.city_name ? `${o.city_name} • ${o.salon_name || ''}` : (o.salon_name || 'Main Center')}<br>` +
              `&nbsp;&nbsp;Services: ${o.services || 'N/A'}<br>` +
              `&nbsp;&nbsp;Date: ${o.order_date ? new Date(o.order_date).toLocaleDateString() : 'N/A'}<br>` +
              `&nbsp;&nbsp;Status: <span style="color:${o.status?.includes('Waiting') || o.status?.includes('очік') ? '#fcd34d' : '#6ee7b7'}">${o.status || 'Pending'}</span>`
            ).join('<br><br>');
            addMessage(`Your recent orders:<br><br>${orderList}`);
          }
        } catch {
          addMessage("Could not load your orders right now. Please try again.");
        } finally {
          setLoading(false);
          setTimeout(() => {
            addMessage("Anything else I can help with?");
            showMainMenu();
          }, 1200);
        }
        break;

      case 'available':
        setState(STATES.AVAILABILITY_CITY);
        if (locations.length === 0) {
          addMessage("Could not load locations right now. Please check again in a moment.");
          setTimeout(() => showMainMenu(), 1500);
          return;
        }
        addOptions(
          "Sure! Let's check available time slots.<br>First, select a <strong>city</strong>:",
          locations.map(c => ({ id: c.id, label: c.name })),
          (city) => handleCitySelect(city)
        );
        break;

      case 'operator':
        setState(STATES.OPERATOR_REASON);
        setShowInput(true);
        addMessage("I'll connect you with an operator right away.<br>Please <strong>describe your issue</strong> in a few words below:");
        break;

      case 'about':
        addMessage(
          "<strong>AutoFix Service</strong><br><br>" +
          "We've been in the auto care business for over 10 years, " +
          "serving 50,000+ satisfied customers across 6 locations.<br><br>" +
          "• <strong>6 Service Centers</strong> across 5 cities<br>" +
          "• <strong>16 Professional Services</strong> available<br>" +
          "• <strong>24/7 Online Booking</strong><br>" +
          "• <strong>Certified Technicians</strong>"
        );
        setTimeout(() => { addMessage("Anything else?"); showMainMenu(); }, 1800);
        break;
    }
  };

  const handleCitySelect = (city) => {
    addMessage(city.label, false);
    const cityData = locations.find(c => String(c.id) === String(city.id));
    const salons = cityData?.salons || [];
    if (salons.length === 0) {
      addMessage("No service centers available in this city.");
      setTimeout(() => showMainMenu(), 1500);
      return;
    }
    setState(STATES.AVAILABILITY_SALON);
    addOptions(
      `Great! Now select a <strong>service center / street</strong> in ${city.label}:`,
      salons.map(s => ({
        id: s.id,
        name: s.name,
        label: `${s.name} — ${s.street_name || ''} ${s.building || ''}`.trim(),
      })),
      (salon) => handleSalonSelect(salon)
    );
  };

  const handleSalonSelect = (salon) => {
    const salonId = salon.id;
    const salonName = salon.name || (salon.label ? salon.label.split('—')[0].trim() : 'Center');
    addMessage(salon.label || salonName, false);
    setState(STATES.AVAILABILITY_DATE);
    setShowInput(false);

    const dateOptions = [];
    const now = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(now.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const label = i === 0 
        ? `Today (${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
        : i === 1 
        ? `Tomorrow (${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
        : `${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;
      dateOptions.push({ id: dateStr, label, dateStr });
    }

    addOptions(
      `Select a date to check available slots at <strong>${salonName}</strong>:`,
      dateOptions,
      (opt) => checkSlotsForDate(salonId, salonName, opt.dateStr, opt.label)
    );
  };

  const checkSlotsForDate = async (salonId, salonName, dateStr, dateLabel) => {
    addMessage(dateLabel, false);
    setLoading(true);
    addMessage(`Checking available slots for <strong>${dateStr}</strong>...`);
    try {
      const res = await api.get(`/slots?salon_id=${salonId}&date=${dateStr}`);
      const slots = res.data?.slots || [];
      const available = slots.filter(s => s.available);
      if (available.length === 0) {
        addMessage(
          `<strong>All Slots Fully Booked!</strong><br>` +
          `Every appointment slot for <strong>${dateStr}</strong> at <em>${salonName}</em> is already taken.<br><br>` +
          `Please choose another date or select a different nearby service center.`
        );
      } else {
        const slotHtml = available.map(s =>
          `<span style="display:inline-block;margin:3px 4px;padding:3px 10px;background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.4);border-radius:6px;font-size:0.85rem">${s.time}</span>`
        ).join('');
        addMessage(`<strong>Available slots on ${dateStr}:</strong><br><br>${slotHtml}`);
      }
    } catch {
      addMessage("Could not fetch slots right now. Please make sure the server is running.");
    } finally {
      setLoading(false);
      setTimeout(() => {
        addOptions(
          "What would you like to do next?",
          [
            { id: 'go_book', label: 'Go to Booking Page' },
            { id: 'other_date', label: 'Check Another Date' },
            { id: 'back', label: 'Back to Menu' },
          ],
          (opt) => {
            addMessage(opt.label, false);
            if (opt.id === 'go_book') {
              navigate('/services');
              setOpen(false);
            } else if (opt.id === 'other_date') {
              handleSalonSelect({ id: salonId, name: salonName, label: salonName });
            } else {
              showMainMenu();
            }
          }
        );
      }, 1000);
    }
  };

  const handleSendInput = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');

    if (state === STATES.OPERATOR_REASON) {
      addMessage(text, false);
      setShowInput(false);
      setLoading(true);
      addMessage("Connecting you to an operator...");
      try {
        await api.post('/operator/request', { login: user?.login || 'guest', reason: text });
        setState(STATES.OPERATOR_SENT);
        addMessage(
          "<strong>An operator has been notified!</strong><br>" +
          "Please expect a response soon. Our team is always ready to help.<br><br>" +
          "You can also chat with our " +
          "<a href='https://t.me/Auto_Service_BookingProject_Bot' target='_blank' rel='noreferrer' style='color:var(--accent-cyan);text-decoration:underline;'>Telegram Bot</a>."
        );
      } catch {
        addMessage("Failed to reach an operator. Please try again later.");
      } finally {
        setLoading(false);
        setTimeout(() => { addMessage("Is there anything else?"); showMainMenu(); }, 2000);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSendInput();
  };

  const resetChat = () => {
    setMessages([]);
    setState(STATES.IDLE);
    setShowInput(false);
    setInput('');
    setTimeout(() => startConversation(), 150);
  };

  return (
    <>
      <button
        id="chatbot-fab"
        type="button"
        className={`chatbot-fab ${open ? 'chatbot-fab--open' : ''}`}
        onClick={() => { if (open) setOpen(false); else openChat(); }}
        aria-label="Open assistant chatbot"
      >
        {open ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      <div className={`chatbot-window ${open ? 'chatbot-window--open' : ''}`}>
        <div className="chatbot-header">
          <div className="chatbot-header__info">
            <div className="chatbot-header__dot" />
            <Bot size={18} color="#3b82f6" />
            <span className="chatbot-header__title">AutoFix Assistant</span>
          </div>
          <button type="button" className="chatbot-header__reset" onClick={resetChat} title="Reset conversation">
            <RotateCcw size={15} />
          </button>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg) => {
            if (msg.isSignInPrompt) {
              return (
                <div key={msg.id} className="chatbot-signin-prompt">
                  <a href="/signin" className="btn btn-primary" style={{ fontSize: '0.875rem', padding: '0.5rem 1.25rem' }}>
                    Sign In
                  </a>
                  <a href="/register" className="btn btn-secondary" style={{ fontSize: '0.875rem', padding: '0.5rem 1.25rem' }}>
                    Register
                  </a>
                </div>
              );
            }
            if (msg.isMenu) {
              return (
                <div key={msg.id} className="chat-options chat-options--menu">
                  {MAIN_MENU.map((opt) => {
                    const MenuIcon = opt.Icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className="chat-option-btn chat-option-btn--menu"
                        onClick={() => handleMenuSelect(opt)}
                      >
                        <MenuIcon size={16} color="#38bdf8" style={{ display: 'inline', verticalAlign: '-2px', marginRight: 8 }} />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              );
            }
            return (
              <div key={msg.id}>
                {msg.text && <BotMessage text={msg.text} isBot={msg.isBot} time={msg.time} />}
                {msg.options && (
                  <OptionButtons options={msg.options} onSelect={msg.onSelect} />
                )}
              </div>
            );
          })}

          {loading && (
            <div className="chat-msg chat-msg--bot">
              <div className="chat-msg__avatar">
                <Bot size={15} color="#06b6d4" />
              </div>
              <div className="chatbot-typing">
                <span /><span /><span />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {showInput && (
          <div className="chatbot-input-area">
            <input
              id="chatbot-input"
              type="text"
              className="form-input chatbot-input"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <button
              id="chatbot-send"
              type="button"
              className="btn btn-primary chatbot-send-btn"
              onClick={handleSendInput}
              disabled={!input.trim()}
            >
              <Send size={15} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
