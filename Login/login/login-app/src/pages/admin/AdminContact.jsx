import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../../assets/css/common.module.css";
import Swal from "sweetalert2"; 


const AdminContact = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ 관리자 JWT 토큰 가져오기
  const token = localStorage.getItem("jwt");
  console.log("token =" + token);

  // ✅ 문의 목록 불러오기
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("admin/contact", {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      setContacts(res.data);
    } catch (err) {
      console.error(err);
      setError("문의 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 문의 삭제
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "정말 이 문의를 삭제하시겠습니까?",
      text: "삭제한 내용은 복구할 수 없습니다.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/admin/contact/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContacts(contacts.filter((c) => c.id !== id));
        Swal.fire("삭제 완료", "문의가 삭제되었습니다.", "success");
      } catch (err) {
        console.error(err);
        Swal.fire("삭제 실패", "삭제 중 오류가 발생했습니다.", "error");
      }
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  if (loading) return <div className={styles.container}>로딩 중...</div>;
  if (error) return <div className={styles.container}>{error}</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>📬 문의 관리</h2>

      {contacts.length === 0 ? (
        <p>등록된 문의가 없습니다.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>이름</th>
              <th>이메일</th>
              <th>메시지</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td style={{ textAlign: "left" }}>{c.message}</td>
                <td>
                  <button
                    className={styles.btnGray}
                    onClick={() => handleDelete(c.id)}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminContact;
