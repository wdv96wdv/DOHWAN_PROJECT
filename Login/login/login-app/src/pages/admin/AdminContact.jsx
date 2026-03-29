import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../assets/css/board.css";
import "../../assets/css/auth.css";
import Swal from "sweetalert2"; 
import { ShieldAlert, Trash2, Mail, User, MessageSquare } from 'lucide-react';
import Loading from "../../components/Common/Loading";

const AdminContact = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("jwt");

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/contact`, { 
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      setContacts(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch contact inquiries.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this inquiry?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "DELETE",
      cancelButtonText: "CANCEL",
      confirmButtonColor: '#f44336',
      background: 'var(--glass-bg)',
      color: 'var(--text-primary)'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/admin/contact/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContacts(contacts.filter((c) => c.id !== id));
        Swal.fire("Deleted", "Inquiry has been removed.", "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Deletion failed.", "error");
      }
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  if (loading) return (
    <div style={{ padding: '100px 0' }}>
      <Loading inline={true} text="문의 내역을 불러오는 중..." />
    </div>
  );
  
  if (error) return (
    <div className="board-page">
       <div className="info-highlight" style={{ textAlign: 'center', borderColor: 'red' }}>{error}</div>
    </div>
  );

  return (
    <div className="board-page">
      <header className="board-header">
        <h1><ShieldAlert size={32} style={{verticalAlign: 'middle', marginRight: '16px', color: 'var(--primary)'}} /> ADMIN DASHBOARD</h1>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          CONTACT MANAGEMENT
        </div>
      </header>

      <div className="board-table-container">
        <table className="board-table">
          <thead>
            <tr>
              <th style={{ width: '80px', textAlign: 'center' }}>ID</th>
              <th style={{ width: '150px' }}><User size={14} style={{marginRight: '6px'}} /> NAME</th>
              <th style={{ width: '200px' }}><Mail size={14} style={{marginRight: '6px'}} /> EMAIL</th>
              <th><MessageSquare size={14} style={{marginRight: '6px'}} /> MESSAGE</th>
              <th style={{ width: '100px', textAlign: 'center' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '100px 0', textAlign: 'center', opacity: 0.5 }}>
                  No ongoing inquiries.
                </td>
              </tr>
            ) : (
              contacts.map((c) => (
                <tr key={c.id}>
                  <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.id}</td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.email}</td>
                  <td style={{ textAlign: "left", fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{c.message}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn-icon delete"
                      onClick={() => handleDelete(c.id)}
                      title="Delete inquiry"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminContact;
