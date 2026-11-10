import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Shield, Mail, AlertTriangle, CheckCircle2, FileText, ExternalLink } from 'lucide-react';
import '../assets/css/copyright.css';

const Copyright = () => {
  return (
    <>
      <Helmet>
        <title>저작권 정책 | DoRunning</title>
        <meta name="description" content="DoRunning의 이미지 저작권 정책 및 콘텐츠 게시 원칙 안내" />
      </Helmet>

      <div className="copyright-page">
        <div className="copyright-container">
          {/* Header */}
          <header className="copyright-header">
            <div className="copyright-icon-wrapper">
              <Shield size={32} />
            </div>
            <h1>저작권 정책 및 이미지 이용 안내</h1>
            <p className="copyright-subtitle">
              DoRunning은 대회 정보의 정확한 전달과 참가자 편의를 위해 운영되는 비영리 마라톤 정보 플랫폼입니다.
            </p>
            <p className="copyright-updated">최종 수정일: 2026년 11월 10일</p>
          </header>

          {/* Section 1: 서비스 목적 */}
          <section className="copyright-section">
            <div className="section-icon"><FileText size={20} /></div>
            <h2>1. 서비스 목적</h2>
            <p>
              두러닝(DoRunning, dorunning.app)은 전국 마라톤·러닝 대회의 일정, 접수 정보, 코스 안내 등을 
              한곳에 모아 러너들에게 제공하는 <strong>정보 제공 및 대회 홍보 목적</strong>의 플랫폼입니다.
            </p>
            <p>
              본 사이트에 게시되는 모든 대회 관련 콘텐츠는 해당 대회의 홍보 및 참가 독려를 위한 것이며, 
              상업적 목적의 무단 도용이 아닌 <strong>공익적 정보 전달</strong>을 목적으로 합니다.
            </p>
          </section>

          {/* Section 2: 이미지 저작권 원칙 */}
          <section className="copyright-section">
            <div className="section-icon"><Shield size={20} /></div>
            <h2>2. 이미지 저작권 원칙</h2>
            <div className="principle-cards">
              <div className="principle-card">
                <CheckCircle2 size={18} className="principle-icon ok" />
                <div>
                  <h4>출처 명시</h4>
                  <p>대회 포스터 및 이미지는 해당 대회 주최/주관 측에서 공개한 자료를 기반으로 게시하며, 가능한 한 출처를 명시합니다.</p>
                </div>
              </div>
              <div className="principle-card">
                <CheckCircle2 size={18} className="principle-icon ok" />
                <div>
                  <h4>홍보 목적 사용</h4>
                  <p>게시된 이미지는 대회 홍보 및 정보 제공 목적으로만 사용되며, 별도의 상업적 이용은 하지 않습니다.</p>
                </div>
              </div>
              <div className="principle-card">
                <CheckCircle2 size={18} className="principle-icon ok" />
                <div>
                  <h4>원작자 권리 존중</h4>
                  <p>모든 이미지의 저작권은 원작자(대회 주최/주관 측)에게 있으며, 두러닝은 이에 대한 소유권을 주장하지 않습니다.</p>
                </div>
              </div>
              <div className="principle-card">
                <CheckCircle2 size={18} className="principle-icon ok" />
                <div>
                  <h4>즉시 삭제 대응</h4>
                  <p>저작권자의 요청이 있을 경우, 해당 콘텐츠를 지체 없이 삭제 또는 수정합니다.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: 삭제/수정 요청 */}
          <section className="copyright-section highlight">
            <div className="section-icon"><AlertTriangle size={20} /></div>
            <h2>3. 이미지 삭제 및 수정 요청</h2>
            <p>
              본 사이트에 게시된 콘텐츠(포스터, 이미지, 대회 정보 등)에 대해 저작권 문제가 있거나 
              삭제·수정을 원하시는 경우, 아래 방법으로 연락해 주시면 <strong>영업일 기준 1~2일 이내</strong>에 조치하겠습니다.
            </p>
            <div className="contact-methods">
              <a href="mailto:wdv96wdv@naver.com?subject=[DoRunning] 이미지 삭제/수정 요청&body=안녕하세요.%0A%0A삭제/수정을 요청드리는 콘텐츠:%0A- 대회명:%0A- 해당 페이지 URL:%0A- 요청 사유:%0A%0A감사합니다." className="contact-method email">
                <Mail size={18} />
                <div>
                  <strong>이메일 문의</strong>
                  <span>wdv96wdv@naver.com</span>
                </div>
                <ExternalLink size={14} />
              </a>
              <Link to="/contact" className="contact-method form">
                <FileText size={18} />
                <div>
                  <strong>문의 폼 작성</strong>
                  <span>사이트 내 문의하기 페이지</span>
                </div>
                <ExternalLink size={14} />
              </Link>
            </div>
            <div className="request-info">
              <h4>삭제/수정 요청 시 포함해 주실 사항</h4>
              <ul>
                <li>요청자 성명 및 소속 (대회 주최/주관 측 여부)</li>
                <li>삭제·수정을 요청하시는 콘텐츠의 대회명 또는 페이지 URL</li>
                <li>요청 사유 (저작권 침해, 정보 오류, 기타)</li>
              </ul>
            </div>
          </section>

          {/* Section 4: 면책 */}
          <section className="copyright-section">
            <div className="section-icon"><AlertTriangle size={20} /></div>
            <h2>4. 면책 고지</h2>
            <ul className="disclaimer-list">
              <li>
                본 사이트의 대회 정보는 각 대회 공식 홈페이지, 보도자료, 공공 데이터 등을 참고하여 작성되었으며, 
                정보의 정확성을 보장하지 않습니다. 최종 확인은 반드시 해당 대회 공식 채널을 통해 진행해 주세요.
              </li>
              <li>
                두러닝은 개별 대회의 주최/주관 기관이 아니며, 대회 참가 신청·환불·변경 등에 대한 직접적인 책임을 지지 않습니다.
              </li>
              <li>
                게시된 포스터 및 이미지의 저작권은 각 원작자(대회 주최·주관 측)에게 있으며, 
                두러닝은 정보 전달 목적으로 이를 인용합니다.
              </li>
            </ul>
          </section>

          {/* Section 5: 제휴/협력 */}
          <section className="copyright-section partnership">
            <h2>5. 대회 주최 측 안내</h2>
            <p>
              두러닝에 귀 대회의 정보를 <strong>공식 등록</strong>하시거나, 포스터·배너 등의 홍보 자료 게재를 
              원하시는 주최/주관 측은 언제든지 연락 주세요. 대회 홍보에 적극 협력하겠습니다.
            </p>
            <Link to="/contact" className="partnership-btn">
              <Mail size={16} />
              대회 등록 및 제휴 문의
            </Link>
          </section>
        </div>
      </div>
    </>
  );
};

export default Copyright;

