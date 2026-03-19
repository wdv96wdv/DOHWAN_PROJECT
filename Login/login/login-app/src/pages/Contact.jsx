import React, { useState } from 'react';
import "../assets/css/info.css";
import "../assets/css/auth.css";
import { Mail, Phone, Send, CheckCircle, MessageSquare, User, AtSign } from 'lucide-react';
import Swal from 'sweetalert2';

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      message: e.target.message.value
    };

    try {
      const response = await fetch('http://localhost:8080/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess(true);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Your message has been sent.',
          background: 'var(--glass-bg)',
          color: 'var(--text-primary)',
          confirmButtonColor: 'var(--primary)'
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to send message. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="info-page">
      <header className="info-header">
        <h1>CONTACT <span style={{color: 'var(--primary)'}}>US</span></h1>
        <p>We'd love to hear from you. Send us a message!</p>
      </header>

      <div className="info-section">
        <h2><MessageSquare size={24} /> SEND A MESSAGE</h2>
        {success ? (
          <div className="info-highlight" style={{ textAlign: 'center', borderLeft: 'none', borderRadius: '12px' }}>
            <CheckCircle size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
            <p className="info-text">Thank you! Your inquiry has been received. We'll get back to you shortly.</p>
            <button className="btn-auth secondary" onClick={() => setSuccess(false)}>SEND ANOTHER ONE</button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="auth-form" style={{ maxWidth: '100%', gap: '20px' }}>
            <div className="auth-form-group">
               <label className="auth-label"><User size={14} /> NAME</label>
               <input type="text" name="name" className="form-control" placeholder="Your full name" required />
            </div>
            <div className="auth-form-group">
               <label className="auth-label"><AtSign size={14} /> EMAIL</label>
               <input type="email" name="email" className="form-control" placeholder="your@email.com" required />
            </div>
            <div className="auth-form-group">
               <label className="auth-label"><MessageSquare size={14} /> MESSAGE ({message.length} / 500)</label>
               <textarea
                 name="message"
                 className="form-control"
                 placeholder="How can we help you?"
                 rows="5"
                 required
                 maxLength={500}
                 onChange={(e) => setMessage(e.target.value)}
                 style={{ minHeight: '150px' }}
               />
            </div>
            <button className="btn-auth" type="submit" disabled={loading} style={{ padding: '14px', marginTop: '10px' }}>
               {loading ? 'SENDING...' : <><Send size={18} style={{marginRight: '8px'}} /> SEND MESSAGE</>}
            </button>
          </form>
        )}
      </div>

      <div className="contact-info-grid">
        <div className="contact-item">
          <div className="contact-icon-wrapper"><Mail size={24} /></div>
          <div>
            <div className="contact-label">Email</div>
            <div className="contact-value">kimdohwan969@gmail.com</div>
          </div>
        </div>
        <div className="contact-item">
          <div className="contact-icon-wrapper"><Phone size={24} /></div>
          <div>
            <div className="contact-label">Phone</div>
            <div className="contact-value">010-4426-9958</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
