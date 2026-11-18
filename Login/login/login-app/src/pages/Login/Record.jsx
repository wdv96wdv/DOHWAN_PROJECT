import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; // ???òÏù¥ÏßÄ ?¥Îèô???ÑÌï¥ Ï∂îÍ?
import Swal from "sweetalert2";
import api from "../../apis/api";
import useAuthStore from "../../store/useAuthStore";
import RecordForm from "../../components/Record/RecordForm";
import RecordList from "../../components/Record/RecordList";
import "../../assets/css/record.css";
import { v4 as uuidv4 } from "uuid";
import { Activity } from "lucide-react";
import { Helmet } from 'react-helmet-async';

const parsePaceToSeconds = (paceStr) => {
  if (!paceStr) return 0;
  const str = String(paceStr);
  if (str.length <= 2) return Number(str);
  const mins = Number(str.slice(0, str.length - 2));
  const secs = Number(str.slice(-2));
  return mins * 60 + secs;
};

const calculatePaceNum = (dist, sec) => {
  if (!dist || !sec || dist <= 0 || sec <= 0) return null;
  const secsPerKm = sec / dist;
  const pMins = Math.floor(secsPerKm / 60);
  const pSecs = Math.floor(secsPerKm % 60);
  return parseInt(`${pMins}${pSecs.toString().padStart(2, '0')}`, 10);
};

const calculateDistance = (paceStr, sec) => {
  if (!paceStr || !sec || sec <= 0) return null;
  const pSecs = parsePaceToSeconds(paceStr);
  if (pSecs <= 0) return null;
  return (sec / pSecs).toFixed(2);
};

const calculateDuration = (dist, paceStr) => {
  if (!dist || dist <= 0 || !paceStr) return null;
  const pSecs = parsePaceToSeconds(paceStr);
  if (pSecs <= 0) return null;
  return Math.round(dist * pSecs);
};

const calculateCalories = (dist) => {
  if (!dist || dist <= 0) return null;
  return Math.round(dist * 65);
};

const getUserNoFromJWT = () => {
  const token = localStorage.getItem("jwt");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.no;
  } catch (err) {
    console.error("JWT ?åÏã± ?§Ìå®:", err);
    return null;
  }
};

export default function RecordPage() {
  const navigate = useNavigate(); // ???§ÎπÑÍ≤åÏù¥?????†Ïñ∏
  const isLogin = useAuthStore(state => state.isLogin);
  const hasAlerted = useRef(false);

  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState({
    running_name: "",
    distance_km: "",
    duration_sec: "",
    pace_min_per_km: "",
    cadence: "",
    calories: "",
    note: "",
    record_date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
  });
  const [editingId, setEditingId] = useState(null);
  const user_no = getUserNoFromJWT();

  // ÎπÑÎ°úÍ∑∏Ïù∏ ?ëÍ∑º Ï∞®Îã® (URL ÏßÅÏ†ë ?ëÍ∑º Î∞©Ï?)
  useEffect(() => {
    if (!isLogin && !hasAlerted.current) {
      hasAlerted.current = true;
      Swal.fire({
        icon: 'warning',
        title: 'Î°úÍ∑∏?∏Ïù¥ ?ÑÏöî?©Îãà??,
        text: 'Í∏∞Î°ù ?òÏù¥ÏßÄ??Î°úÍ∑∏?????¥Ïö© Í∞Ä?•Ìï©?àÎã§.',
        confirmButtonColor: 'var(--primary)',
        confirmButtonText: '?ïÏù∏'
      }).then(() => {
        navigate('/', { replace: true });
      });
    }
  }, [isLogin, navigate]);

  useEffect(() => {
    if (isLogin && user_no) fetchRecords();
  }, [isLogin, user_no]);

  const fetchRecords = async () => {
    try {
      const response = await api.get("/records");
      const list = (response.data.data || []).map(item => ({
        ...item,
        running_name: item.runningName || item.running_name,
        distance_km: item.distanceKm || item.distance_km,
        duration_sec: item.durationSec || item.duration_sec,
        pace_min_per_km: item.paceMinPerKm || item.pace_min_per_km,
        speed_kmh: item.speedKmh || item.speed_kmh,
        record_date: item.recordDate || item.record_date
      }));
      setRecords(list);
    } catch (error) {
      console.error("Î∂àÎü¨?§Í∏∞ ?§Î•ò:", error);
      Swal.fire("?§Î•ò", "Í∏∞Î°ù??Î∂àÎü¨?§Ï? Î™ªÌñà?µÎãà??", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.running_name.trim()) {
      Swal.fire("Í≤ΩÍ≥†", "?úÎèô ?úÎ™©???ÖÎ†•?¥Ï£º?∏Ïöî.", "warning"); // ???úÍ???      return;
    }
    if (!user_no) {
      Swal.fire("?êÎü¨", "Î°úÍ∑∏?∏Ïù¥ ?ÑÏöî???úÎπÑ?§ÏûÖ?àÎã§.", "error"); // ???úÍ???      return;
    }

    try {
      const submitData = { ...formData };
      if (!submitData.record_date) submitData.record_date = new Date().toISOString();

      // ?∞Ïù¥???ïÏ†ú Î°úÏßÅ?Ä Í∑∏Î?Î°??†Ï?
      submitData.pace_min_per_km = submitData.pace_min_per_km
        ? parseInt(String(submitData.pace_min_per_km).replace(/[^0-9]/g, ""), 10)
        : null;
      submitData.distance_km = submitData.distance_km ? parseFloat(submitData.distance_km) : null;
      submitData.duration_sec = submitData.duration_sec ? parseInt(submitData.duration_sec, 10) : null;
      submitData.cadence = submitData.cadence ? parseInt(submitData.cadence, 10) : null;
      submitData.calories = submitData.calories ? parseInt(submitData.calories, 10) : null;

      // ?ÑÎùΩ???∞Ïù¥???êÎèô Í≥ÑÏÇ∞ Î°úÏßÅ (Í±∞Î¶¨, ?úÍ∞Ñ, ?òÏù¥??Ï§?2Í∞úÍ? ?àÏúºÎ©??òÎ®∏ÏßÄ 1Í∞?Í≥ÑÏÇ∞)
      if (submitData.distance_km > 0 && submitData.duration_sec > 0 && !submitData.pace_min_per_km) {
        submitData.pace_min_per_km = calculatePaceNum(submitData.distance_km, submitData.duration_sec);
      } else if (submitData.pace_min_per_km > 0 && submitData.duration_sec > 0 && !submitData.distance_km) {
        submitData.distance_km = parseFloat(calculateDistance(String(submitData.pace_min_per_km), submitData.duration_sec));
      } else if (submitData.distance_km > 0 && submitData.pace_min_per_km > 0 && !submitData.duration_sec) {
        submitData.duration_sec = calculateDuration(submitData.distance_km, String(submitData.pace_min_per_km));
      }

      if (submitData.distance_km > 0 && !submitData.calories) {
        submitData.calories = calculateCalories(submitData.distance_km);
      }

      if (submitData.distance_km && submitData.duration_sec) {
        submitData.speed_kmh = submitData.distance_km / (submitData.duration_sec / 3600);
      }

      const backendPayload = {
        runningName: submitData.running_name,
        distanceKm: submitData.distance_km,
        durationSec: submitData.duration_sec,
        paceMinPerKm: submitData.pace_min_per_km,
        speedKmh: submitData.speed_kmh,
        cadence: submitData.cadence,
        calories: submitData.calories,
        note: submitData.note,
        recordDate: submitData.record_date.length === 10 ? `${submitData.record_date}T00:00:00` :
          submitData.record_date.length === 16 ? `${submitData.record_date}:00` : submitData.record_date
      };

      if (editingId) {
        // ?òÏ†ï Î™®Îìú
        const response = await api.put(`/records/${editingId}`, backendPayload);
        const saved = response.data.data;
        const normalized = {
          ...saved,
          running_name: saved.runningName, distance_km: saved.distanceKm,
          duration_sec: saved.durationSec, pace_min_per_km: saved.paceMinPerKm,
          speed_kmh: saved.speedKmh, record_date: saved.recordDate
        };

        Swal.fire({
          title: "?òÏ†ï ?ÑÎ£å",
          text: "?úÎèô Í∏∞Î°ù???ïÏÉÅ?ÅÏúºÎ°??òÏ†ï?òÏóà?µÎãà??",
          icon: "success",
          confirmButtonText: "?ïÏù∏"
        }).then(() => {
          setRecords(prev => prev.map(r => r.id === editingId ? { ...r, ...normalized } : r));
        });

      } else {
        // ?±Î°ù Î™®Îìú
        const response = await api.post(`/records`, backendPayload);
        const saved = response.data.data;
        const normalized = {
          ...saved,
          running_name: saved.runningName, distance_km: saved.distanceKm,
          duration_sec: saved.durationSec, pace_min_per_km: saved.paceMinPerKm,
          speed_kmh: saved.speedKmh, record_date: saved.recordDate
        };

        Swal.fire({
          title: "?±Î°ù ?ÑÎ£å",
          text: "?§Îäò???¨Îãù Í∏∞Î°ù???Ä?•Ìñà?µÎãà?? ?òÍ≥†?òÏÖ®?¥Ïöî! ?èÉ?ç‚ôÇÔ∏?,
          icon: "success",
          confirmButtonText: "?ïÏù∏"
        }).then(() => {
          setRecords(prev => [normalized, ...prev]);
        });
      }

      // ??Ï¥àÍ∏∞??      setFormData({
        running_name: "", distance_km: "", duration_sec: "", pace_min_per_km: "",
        cadence: "", calories: "", note: "", record_date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
      });
      setEditingId(null);
    } catch (err) {
      console.error(err);
      Swal.fire("?§Ìå®", "?∞Ïù¥???Ä??Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.", "error");
    }
  };

  const handleEdit = (record) => {
    setFormData({
      running_name: record.running_name || "",
      distance_km: record.distance_km || "",
      duration_sec: record.duration_sec || "",
      pace_min_per_km: record.pace_min_per_km || "",
      cadence: record.cadence || "",
      calories: record.calories || "",
      note: record.note || "",
      record_date: record.record_date?.slice(0, 16) || "",
    });
    setEditingId(record.id);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // ?òÏ†ï ???ºÏù¥ ?àÎäî ?ÅÎã®?ºÎ°ú ?¥Îèô
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Í∏∞Î°ù ??†ú",
      text: "?ïÎßêÎ°????úÎèô Í∏∞Î°ù????†ú?òÏãúÍ≤†Ïäµ?àÍπå? Î≥µÍµ¨?????ÜÏäµ?àÎã§.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "??†ú",
      cancelButtonText: "Ï∑®ÏÜå"
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/records/${id}`);
      Swal.fire("??†ú ?ÑÎ£å", "Í∏∞Î°ù????†ú?òÏóà?µÎãà??", "success");
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      Swal.fire("?§Î•ò", "??†ú???§Ìå®?àÏäµ?àÎã§.", "error");
    }
  };

  if (!isLogin) {
    return null;
  }

  return (
    <div className="record-page">
      <Helmet>
        <title>Dorunning | Í∏∞Î°ù</title>
        <meta name="description" content="?òÏùò Îß§ÏùºÎß§Ïùº ?¨Îãù Í∏∞Î°ù??Ï≤¥Í≥Ñ?ÅÏúºÎ°??Ä?•ÌïòÍ≥?Î∂ÑÏÑù?òÏÑ∏?? Í±∞Î¶¨, ?úÍ∞Ñ, ?òÏù¥???µÍ≥ÑÎ•??úÎàà???ïÏù∏?òÎ©∞ ?±Ïû•??Ï¶êÍ±∞?Ä???êÍª¥Î≥¥ÏÑ∏??" />
        <meta property="og:title" content="Dorunning | ?¨ÎãùÍ∏∞Î°ù" />
        <meta property="og:description" content="?òÏùò Îß§ÏùºÎß§Ïùº ?¨Îãù Í∏∞Î°ù??Ï≤¥Í≥Ñ?ÅÏúºÎ°??Ä?•ÌïòÍ≥?Î∂ÑÏÑù?òÏÑ∏??" />
        <link rel="canonical" href="https://www.dorunning.app/record" />
      </Helmet>
      <header className="record-header">
        <h1><Activity size={40} style={{ verticalAlign: 'middle', marginRight: '16px', color: 'var(--primary)' }} /> RECORD</h1>
      </header>

      <RecordForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        submitText={editingId ? "Í∏∞Î°ù ?òÏ†ï?òÍ∏∞" : "?úÎèô ?Ä?•ÌïòÍ∏?}
      />

      <RecordList
        records={records}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}