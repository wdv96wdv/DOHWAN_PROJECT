import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Footprints, Target, MapPin, DollarSign,
  ChevronRight, ChevronLeft, Sparkles, Zap, Activity, Compass,
  Shield, TrendingUp
} from 'lucide-react';
import "../../assets/css/Recommend.css";
import "../../assets/css/auth.css";

const Recommend = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    gender: "",
    purpose: "",
    surface: "",
    gait: "",
    budget: ""
  });

  const totalSteps = 4;

  const steps = [
    {
      id: 1,
      title: "성별을 선택해주세요",
      field: "gender",
      options: [
        { label: "남성", value: "남성", icon: <User size={24} /> },
        { label: "여성", value: "여성", icon: <User size={24} /> },
        { label: "공용", value: "공용", icon: <Activity size={24} /> }
      ]
    },
    {
      id: 2,
      title: "주로 달리는 장소는 어디인가요?",
      field: "purpose",
      options: [
        { label: "일반 도로", value: "일상 러닝", icon: <MapPin size={24} /> },
        { label: "트레일 / 숲길", value: "트레일", icon: <Compass size={24} /> },
        { label: "마라톤 / 트랙", value: "마라톤", icon: <Zap size={24} /> },
        { label: "워킹 / 실내", value: "워킹", icon: <Footprints size={24} /> }
      ]
    },
    {
      id: 3,
      title: "가장 큰 러닝 목표는 무엇인가요?",
      field: "goal",
      options: [
        { label: "스피드 향상", value: "속도", icon: <Zap size={24} /> },
        { label: "지구력 강화", value: "내구성", icon: <Target size={24} /> },
        { label: "편안함 추구", value: "편안함", icon: <Activity size={24} /> },
        { label: "부상 방지", value: "안정성", icon: <Shield size={24} /> }
      ]
    },
    {
      id: 4,
      title: "예산 범위를 입력해주세요 (KRW)",
      field: "budget",
      isInput: true
    }
  ];

  const handleOptionSelect = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
    else handleSubmit();
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    // Navigate to result with quiz data
    navigate("/recommend/result", {
      state: {
        gender: formData.gender,
        purpose: formData.purpose,
        budget: formData.budget,
        goal: formData.goal
      },
    });
  };

  const currentStepData = steps.find(s => s.id === step);
  const isNextDisabled = !formData[currentStepData.field] && !currentStepData.isInput;

  return (
    <div className="recommend-page">
      <Helmet>
        <title>Dorunning | AI Shoe Guide</title>
      </Helmet>

      <header className="recommend-header">
        <div className="pulse-circle"></div>
        <h1>AI <span style={{ color: 'var(--primary)' }}>SHOE GUIDE</span></h1>
        <p>당신의 러닝 스타일과 목표를 분석하여 완벽한 파트너를 찾아드립니다.</p>
      </header>

      <div className="quiz-container">
        <div className="quiz-step-indicator">
          <div
            className="quiz-progress-bar"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="quiz-step-content"
          >
            <h2>{step === 1 ? "성별을 선택해주세요" :
              step === 2 ? "주로 달리는 장소는 어디인가요?" :
                step === 3 ? "가장 큰 러닝 목표는 무엇인가요?" :
                  "예산 범위를 입력해주세요 (선택)"}</h2>

            {currentStepData.isInput ? (
              <div className="budget-step">
                <input
                  type="number"
                  className="quiz-budget-input"
                  placeholder="예: 150000"
                  value={formData.budget}
                  onChange={(e) => handleOptionSelect("budget", e.target.value)}
                />
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  가격 제한 설정 (선택사항)
                </p>
              </div>
            ) : (
              <div className="quiz-options-grid">
                {currentStepData.options.map((opt) => (
                  <div
                    key={opt.value}
                    className={`quiz-option-card ${formData[currentStepData.field] === opt.value ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(currentStepData.field, opt.value)}
                  >
                    <div className="quiz-option-icon">{opt.icon}</div>
                    <span className="quiz-option-label">{opt.label}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="quiz-navigation">
          {step > 1 && (
            <button className="btn-quiz btn-quiz-prev" onClick={prevStep}>
              <ChevronLeft size={18} style={{ marginRight: '8px' }} /> 이전
            </button>
          )}
          <button
            className="btn-quiz btn-quiz-next"
            onClick={nextStep}
            disabled={isNextDisabled}
            style={{ marginLeft: step === 1 ? 'auto' : '0' }}
          >
            {step === totalSteps ? '결과 보기' : '다음 단계'}
            {step !== totalSteps && <ChevronRight size={18} style={{ marginLeft: '8px' }} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Recommend;