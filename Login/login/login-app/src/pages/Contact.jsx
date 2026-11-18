import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
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
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${API_BASE_URL}/contact`, {
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
    <motion.div
      className="info-page"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        background: "linear-gradient(135deg, var(--bg-gradient-start), var(--bg-gradient-end))",
        padding: "2rem",
        borderRadius: "1rem",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)"
      }}
    >
      <Helmet>
        <title>Dorunning | ê³ ê°ì§€??/title>
        <meta name="description" content="Dorunning ?œë¹„?¤ì— ?€??ê¶ê¸ˆ???ì´???œì•ˆ ?¬í•­???ˆìœ¼? ê??? ?¸ì œ??ë©”ì‹œì§€ë¥??¨ê²¨ì£¼ì„¸??" />
        <meta property="og:title" content="Dorunning | ê³ ê°ì§€?? />
        <meta property="og:description" content="Dorunning ?œë¹„?¤ì— ê¶ê¸ˆ???ì´???œì•ˆ ?¬í•­???ˆìœ¼? ê???" />
        <link rel="canonical" href="https://www.dorunning.app/contact" />
      </Helmet>
      <header className="info-header">
        <h1>ë¬¸ì˜<span style={{ color: 'var(--primary)' }}>?˜ê¸°</span></h1>
        <p>ê¶ê¸ˆ???ì´ ?ˆìœ¼? ê??? ë©”ì‹œì§€ë¥??¨ê²¨ì£¼ì‹œë©??•ì„±ê»??µë????œë¦¬ê² ìŠµ?ˆë‹¤.</p>
      </header>

      <div className="info-section">
        <h2><MessageSquare size={24} /> ë©”ì‹œì§€ ë³´ë‚´ê¸?/h2>
        {success ? (
          <motion.div
            className="info-highlight"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{ textAlign: 'center', borderLeft: 'none', borderRadius: '12px' }}
          >
            <CheckCircle size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
            <p className="info-text">ê°ì‚¬?©ë‹ˆ?? ë¬¸ì˜ê°€ ?•ìƒ?ìœ¼ë¡??‘ìˆ˜?˜ì—ˆ?µë‹ˆ?? ê³??µë? ?œë¦¬ê² ìŠµ?ˆë‹¤.</p>
            <button className="btn-auth secondary" onClick={() => setSuccess(false)}>??ë©”ì‹œì§€ ë³´ë‚´ê¸?/button>
          </motion.div>
        ) : (
          <form onSubmit={onSubmit} className="auth-form" style={{ maxWidth: '600px', margin: '0 auto', gap: '24px' }}>
            <div className="auth-form-group">
               <label className="auth-label"><User size={14} /> ?´ë¦„</label>
               <input type="text" name="name" className="form-control" placeholder="?±í•¨???…ë ¥?´ì£¼?¸ìš”" required />
            </div>
            <div className="auth-form-group">
               <label className="auth-label"><AtSign size={14} /> ?´ë©”??/label>
               <input type="email" name="email" className="form-control" placeholder="answer@email.com" required />
            </div>
            <div className="auth-form-group">
               <label className="auth-label"><MessageSquare size={14} /> ë©”ì‹œì§€ ({message.length} / 500)</label>
               <textarea
                 name="message"
                 className="form-control"
                 placeholder="ë¬´ì—‡???„ì??œë¦´ê¹Œìš”?"
                 rows="5"
                 required
                 maxLength={500}
                 onChange={(e) => setMessage(e.target.value)}
                 style={{ minHeight: '150px' }}
               />
            </div>
            <button className="btn-auth" type="submit" disabled={loading} style={{ padding: '16px', marginTop: '10px', width: 'auto', alignSelf: 'center', minWidth: '200px' }}>
               {loading ? '?„ì†¡ ì¤?..' : <><Send size={18} style={{ marginRight: '8px' }} /> ë©”ì‹œì§€ ë³´ë‚´ê¸?/>}
            </button>
          </form>
        )}
      </div>

      <div className="contact-info-grid">
        <div className="contact-item">
          <div className="contact-icon-wrapper"><Mail size={24} /></div>
          <div>
            <div className="contact-label">?´ë©”??/div>
            <div className="contact-value">kimdohwan969@gmail.com</div>
          </div>
        </div>
        <div className="contact-item">
          <div className="contact-icon-wrapper"><Phone size={24} /></div>
          <div>
            <div className="contact-label">?°ë½ì²?/div>
            <div className="contact-value">010-4426-9958</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Contact;
