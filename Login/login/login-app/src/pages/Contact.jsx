import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
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
    <div className="info-page">
      <Helmet>
        <title>고객 지원 및 문의하기 - Dorunning</title>
        <meta name="description" content="Dorunning 서비스에 대한 궁금한 점이나 제안 사항이 있으신가요? 언제든 메시지를 남겨주세요." />
        <link rel="canonical" href="https://dorunning.vercel.app/contact" />
      </Helmet>
      <header className="info-header">
        <h1>문의<span style={{color: 'var(--primary)'}}>하기</span></h1>
        <p>궁금한 점이 있으신가요? 메시지를 남겨주시면 정성껏 답변해 드리겠습니다.</p>
      </header>

      <div className="info-section">
        <h2><MessageSquare size={24} /> 메시지 보내기</h2>
        {success ? (
          <div className="info-highlight" style={{ textAlign: 'center', borderLeft: 'none', borderRadius: '12px' }}>
            <CheckCircle size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
            <p className="info-text">감사합니다! 문의가 정상적으로 접수되었습니다. 곧 답변 드리겠습니다.</p>
            <button className="btn-auth secondary" onClick={() => setSuccess(false)}>새 메시지 보내기</button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="auth-form" style={{ maxWidth: '600px', margin: '0 auto', gap: '24px' }}>
            <div className="auth-form-group">
               <label className="auth-label"><User size={14} /> 이름</label>
               <input type="text" name="name" className="form-control" placeholder="성함을 입력해주세요" required />
            </div>
            <div className="auth-form-group">
               <label className="auth-label"><AtSign size={14} /> 이메일</label>
               <input type="email" name="email" className="form-control" placeholder="answer@email.com" required />
            </div>
            <div className="auth-form-group">
               <label className="auth-label"><MessageSquare size={14} /> 메시지 ({message.length} / 500)</label>
               <textarea
                 name="message"
                 className="form-control"
                 placeholder="무엇을 도와드릴까요?"
                 rows="5"
                 required
                 maxLength={500}
                 onChange={(e) => setMessage(e.target.value)}
                 style={{ minHeight: '150px' }}
               />
            </div>
            <button className="btn-auth" type="submit" disabled={loading} style={{ padding: '16px', marginTop: '10px', width: 'auto', alignSelf: 'center', minWidth: '200px' }}>
               {loading ? '전송 중...' : <><Send size={18} style={{marginRight: '8px'}} /> 메시지 보내기</>}
            </button>
          </form>
        )}
      </div>

      <div className="contact-info-grid">
        <div className="contact-item">
          <div className="contact-icon-wrapper"><Mail size={24} /></div>
          <div>
            <div className="contact-label">이메일</div>
            <div className="contact-value">kimdohwan969@gmail.com</div>
          </div>
        </div>
        <div className="contact-item">
          <div className="contact-icon-wrapper"><Phone size={24} /></div>
          <div>
            <div className="contact-label">연락처</div>
            <div className="contact-value">010-4426-9958</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
