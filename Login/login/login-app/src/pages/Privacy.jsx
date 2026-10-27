import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import "../assets/css/info.css";
import {
  ShieldCheck,
  Lock,
  Eye,
  ExternalLink,
  Mail,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  UserCheck
} from 'lucide-react';

const Privacy = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="info-page">
      <Helmet>
        <title>개인정보처리방침 | 두러닝 (Dorunning)</title>
        <meta
          name="description"
          content="두러닝(Dorunning)의 개인정보처리방침입니다. 이용자의 소중한 개인정보를 안전하게 보호하고 처리하는 원칙과 절차를 투명하게 안내합니다."
        />
        <meta property="og:title" content="두러닝 개인정보처리방침" />
        <meta property="og:description" content="두러닝의 개인정보 수집 목적, 보유 기간, 안전성 확보 조치 및 이용자 권리를 투명하게 공개합니다." />
        <link rel="canonical" href="https://dorunning.app/privacy" />
      </Helmet>

      {/* 1. Header */}
      <motion.header
        className="info-header"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="info-badge">
          <ShieldCheck size={15} /> PRIVACY POLICY
        </div>
        <h1>
          두러닝 <span className="highlight">개인정보처리방침</span>
        </h1>
        <p>
          두러닝(Dorunning)은 이용자의 개인정보를 소중하게 생각하며, 「개인정보 보호법」 및 관련 법령을 철저히 준수하여
          여러분의 데이터를 안전하게 보호하고 있습니다.
        </p>
        <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Clock size={14} /> <span>최종 개정 및 시행일자: 2026년 10월 12일</span>
        </div>
      </motion.header>

      {/* 2. 3대 개인정보 보호 핵심 원칙 (Security Pillars) */}
      <motion.div
        className="security-pillars"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="security-box">
          <div className="security-icon">
            <Lock size={26} />
          </div>
          <h3>최소 정보 수집</h3>
          <p>마라톤 일정 안내 및 계정 관리 등 필수 서비스 운영에 필요한 최소한의 정보만을 수집합니다.</p>
        </div>

        <div className="security-box">
          <div className="security-icon">
            <ShieldCheck size={26} />
          </div>
          <h3>철저한 암호화 보호</h3>
          <p>비밀번호 등 민감 데이터는 단방향 암호화되어 관리자조차 열람할 수 없도록 안전하게 격리됩니다.</p>
        </div>

        <div className="security-box">
          <div className="security-icon">
            <UserCheck size={26} />
          </div>
          <h3>이용자 권리 보장</h3>
          <p>회원은 언제든지 자신의 정보를 열람, 수정, 철회(회원 탈퇴 및 삭제)할 수 있는 완전한 제어권을 가집니다.</p>
        </div>
      </motion.div>

      {/* 3. 빠른 목차 네비게이션 */}
      <div className="policy-nav-wrap">
        <div className="policy-nav-title">
          <FileText size={16} /> 조항 바로가기
        </div>
        <div className="policy-nav-list">
          <button className="policy-nav-btn" onClick={() => scrollToSection('sec-1')}>제1조. 처리 목적</button>
          <button className="policy-nav-btn" onClick={() => scrollToSection('sec-2')}>제2조. 수집 항목</button>
          <button className="policy-nav-btn" onClick={() => scrollToSection('sec-3')}>제3조. 보유 및 이용기간</button>
          <button className="policy-nav-btn" onClick={() => scrollToSection('sec-4')}>제4조. 제3자 제공</button>
          <button className="policy-nav-btn" onClick={() => scrollToSection('sec-5')}>제5조. 이용자 권리행사</button>
          <button className="policy-nav-btn" onClick={() => scrollToSection('sec-6')}>제6조. 파기 절차</button>
          <button className="policy-nav-btn" onClick={() => scrollToSection('sec-7')}>제7조. 쿠키 및 애드센스</button>
          <button className="policy-nav-btn" onClick={() => scrollToSection('sec-8')}>제8조. 안전성 확보조치</button>
          <button className="policy-nav-btn" onClick={() => scrollToSection('sec-9')}>제9조. 보호책임자</button>
        </div>
      </div>

      {/* 4. 본문 조항 카드들 */}

      {/* 제1조 */}
      <article className="policy-article" id="sec-1">
        <div className="article-header">
          <span className="article-num">제 1 조</span>
          <h2 className="article-title">개인정보의 처리 목적</h2>
        </div>
        <div className="article-content">
          <p>두러닝(Dorunning)은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 관련 법률에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
          <ul style={{ paddingLeft: '20px', margin: '12px 0' }}>
            <li><strong>회원 가입 및 관리:</strong> 회원제 서비스 이용에 따른 본인확인, 개인식별, 불량회원의 부정이용 방지와 비인가 사용 방지, 가입의사 확인, 문의사항 처리</li>
            <li><strong>서비스 제공 및 운영:</strong> 마라톤 대회 일정 조회, 코스 맵 정보, 러닝 캘린더 및 개인 기록 관리, 커뮤니티 게시글/댓글 작성 기능 제공</li>
            <li><strong>서비스 개선 및 통계 분석:</strong> 신규 서비스 개발 및 맞춤형 기능 제공, 접속 빈도 파악 및 서비스 이용에 대한 통계 분석</li>
          </ul>
        </div>
      </article>

      {/* 제2조 */}
      <article className="policy-article" id="sec-2">
        <div className="article-header">
          <span className="article-num">제 2 조</span>
          <h2 className="article-title">처리하는 개인정보의 항목</h2>
        </div>
        <div className="article-content">
          <p>두러닝은 원활한 서비스 제공을 위해 회원가입 및 서비스 이용 시 다음과 같은 최소한의 개인정보를 수집하고 있습니다.</p>

          <table className="policy-data-table">
            <thead>
              <tr>
                <th>구분</th>
                <th>수집 항목</th>
                <th>수집 방법</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>일반 회원가입</td>
                <td>아이디(이메일), 비밀번호(암호화), 닉네임, 이름</td>
                <td>회원가입 양식 입력</td>
              </tr>
              <tr>
                <td>소셜 로그인 (카카오)</td>
                <td>소셜 고유 식별자(ID), 프로필 닉네임, 이메일</td>
                <td>OAuth 연동 시 제공 동의</td>
              </tr>
              <tr>
                <td>서비스 이용 과정</td>
                <td>접속 로그, 쿠키(Cookie), 접속 IP 주소, 브라우저 정보</td>
                <td>서비스 이용 중 자동 생성</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      {/* 제3조 */}
      <article className="policy-article" id="sec-3">
        <div className="article-header">
          <span className="article-num">제 3 조</span>
          <h2 className="article-title">개인정보의 보유 및 이용 기간</h2>
        </div>
        <div className="article-content">
          <p>두러닝은 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용 기간 내에서 개인정보를 처리 및 보유합니다.</p>
          <ul style={{ paddingLeft: '20px', margin: '12px 0' }}>
            <li><strong>회원 정보:</strong> 회원 탈퇴 시까지 (단, 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우에는 해당 수사·조사 종료 시까지)</li>
            <li><strong>게시물 및 댓글:</strong> 회원이 직접 삭제하거나 탈퇴 시 일괄 삭제 요청 시까지</li>
          </ul>
          <p>상법 및 전자상거래 등에서의 소비자보호에 관한 법률 등 관계법령의 규정에 의하여 보존할 필요가 있는 경우, 두러닝은 관계법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.</p>
        </div>
      </article>

      {/* 제4조 */}
      <article className="policy-article" id="sec-4">
        <div className="article-header">
          <span className="article-num">제 4 조</span>
          <h2 className="article-title">개인정보의 제3자 제공 및 처리 위탁</h2>
        </div>
        <div className="article-content">
          <p>두러닝은 이용자의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, <strong>이용자의 사전 동의 없이는 본래의 범위를 초과하여 제3자에게 제공하거나 판매하지 않습니다.</strong></p>
          <p>원활한 클라우드 인프라 제공을 위해 다음과 같이 안정성이 검증된 글로벌 플랫폼에 데이터 처리를 위탁하고 있습니다:</p>
          <table className="policy-data-table">
            <thead>
              <tr>
                <th>수탁 업체</th>
                <th>위탁 업무 내용</th>
                <th>보유 및 이용 기간</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Supabase Inc.</td>
                <td>클라우드 데이터베이스 호스팅 및 데이터 안전 보관</td>
                <td>회원 탈퇴 시 또는 서비스 종료 시까지</td>
              </tr>
              <tr>
                <td>Vercel Inc.</td>
                <td>웹 애플리케이션 호스팅 및 트래픽 분산 처리</td>
                <td>서비스 운영 기간 동안</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      {/* 제5조 */}
      <article className="policy-article" id="sec-5">
        <div className="article-header">
          <span className="article-num">제 5 조</span>
          <h2 className="article-title">정보주체와 법정대리인의 권리·의무 및 행사방법</h2>
        </div>
        <div className="article-content">
          <p>이용자는 언제든지 다음과 같은 개인정보 보호 관련 권리를 행사할 수 있습니다:</p>
          <ul style={{ paddingLeft: '20px', margin: '12px 0' }}>
            <li>개인정보 열람 및 정정 요청: [마이페이지] 메뉴를 통해 자신의 개인정보를 직접 열람하고 수정할 수 있습니다.</li>
            <li>개인정보 삭제 및 회원 탈퇴 요청: 서비스 내 회원 탈퇴 메뉴 또는 고객센터를 통해 즉시 계정 삭제 및 데이터 파기를 요청할 수 있습니다.</li>
            <li>개인정보 처리 정지 요구</li>
          </ul>
        </div>
      </article>

      {/* 제6조 */}
      <article className="policy-article" id="sec-6">
        <div className="article-header">
          <span className="article-num">제 6 조</span>
          <h2 className="article-title">개인정보의 파기 절차 및 방법</h2>
        </div>
        <div className="article-content">
          <p>두러닝은 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.</p>
          <ul style={{ paddingLeft: '20px', margin: '12px 0' }}>
            <li><strong>파기 절차:</strong> 이용자가 입력한 정보는 목적 달성 후 즉시 파기되거나, 관련 법령에 따라 별도의 DB에 옮겨져 일정 기간 보관된 후 파기됩니다.</li>
            <li><strong>파기 방법:</strong> 전자적 파일 형태로 기록·저장된 개인정보는 기록을 복구 또는 재생할 수 없는 기술적 방법(영구 삭제)을 사용하여 파기합니다.</li>
          </ul>
        </div>
      </article>

      {/* 제7조 - 구글 애드센스 & 쿠키 (매우 중요) */}
      <article className="policy-article" id="sec-7">
        <div className="article-header">
          <span className="article-num">제 7 조</span>
          <h2 className="article-title">쿠키(Cookie) 및 맞춤형 광고(Google AdSense) 안내</h2>
        </div>
        <div className="article-content">
          <p>
            두러닝은 이용자에게 개별적인 맞춤 서비스를 제공하고 웹사이트의 운영 비용을 충당하기 위해 이용 정보를 저장하고 수시로 불러오는 '쿠키(Cookie)'와 <strong>Google AdSense</strong> 광고 서비스를 사용합니다.
          </p>

          <div className="adsense-box">
            <h4 style={{ margin: '0 0 10px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ExternalLink size={18} color="var(--primary)" /> Google AdSense 광고 및 쿠키 정책 고지
            </h4>
            <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>
              1. Google을 포함한 제3자 공급업체는 쿠키를 사용하여 이용자의 본 사이트 및 인터넷상의 다른 웹사이트 이전 방문 기록을 바탕으로 광고를 게재합니다.<br />
              2. Google의 광고 쿠키를 사용하면 Google 및 파트너는 이용자의 사이트 방문을 바탕으로 관련성 높은 광고를 제공할 수 있습니다.<br />
              3. 이용자는 언제든지 Google의 광고 설정 또는 제3자 공급업체의 쿠키 사용을 해제할 수 있습니다.
            </p>
            <div className="adsense-links">
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="adsense-btn"
              >
                Google 맞춤 광고 설정 해제 <ExternalLink size={14} />
              </a>
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="adsense-btn"
              >
                Google 개인정보 보호 및 광고 약관 <ExternalLink size={14} />
              </a>
            </div>
          </div>

          <p style={{ marginTop: '16px' }}>
            <strong>쿠키 설치 허용/거부 방법:</strong> 이용자는 웹 브라우저의 옵션을 설정함으로써 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다. (단, 쿠키 저장을 거부할 경우 로그인이 필요한 일부 서비스 이용에 어려움이 있을 수 있습니다.)
          </p>
        </div>
      </article>

      {/* 제8조 */}
      <article className="policy-article" id="sec-8">
        <div className="article-header">
          <span className="article-num">제 8 조</span>
          <h2 className="article-title">개인정보의 안전성 확보 조치</h2>
        </div>
        <div className="article-content">
          <p>두러닝은 개인정보의 안전성 확보를 위해 다음과 같은 기술적·관리적 조치를 취하고 있습니다:</p>
          <ul style={{ paddingLeft: '20px', margin: '12px 0' }}>
            <li><strong>비밀번호의 암호화:</strong> 이용자의 비밀번호는 단방향 해시 함수로 암호화되어 저장 및 관리되고 있어, 본인만이 알 수 있습니다.</li>
            <li><strong>해킹 등에 대비한 기술적 대책:</strong> HTTPS/SSL 보안 프로토콜을 적용하여 데이터 전송 구간을 전면 암호화하며, 최신 보안 패치를 주기적으로 적용하고 있습니다.</li>
            <li><strong>개인정보 접근 권한 제한:</strong> 데이터베이스에 접근할 수 있는 관리자 권한을 최소한의 인원으로 엄격히 제한하고 있습니다.</li>
          </ul>
        </div>
      </article>

      {/* 제9조 */}
      <article className="policy-article" id="sec-9">
        <div className="article-header">
          <span className="article-num">제 9 조</span>
          <h2 className="article-title">개인정보 보호책임자 및 권익침해 구제</h2>
        </div>
        <div className="article-content">
          <p>
            두러닝은 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
          </p>

          <div className="officer-card">
            <div className="officer-item">
              <span className="officer-label">서비스명</span>
              <span className="officer-val">두러닝 (Dorunning)</span>
            </div>
            <div className="officer-item">
              <span className="officer-label">개인정보 보호 책임자</span>
              <span className="officer-val">운영 총괄 관리자</span>
            </div>
            <div className="officer-item">
              <span className="officer-label">문의 이메일</span>
              <span className="officer-val">kimdohwan969@gmail.com</span>
            </div>
            <div className="officer-item">
              <span className="officer-label">온라인 고객센터</span>
              <span className="officer-val">
                <Link to="/contact" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>
                  문의하기 페이지 바로가기 &rarr;
                </Link>
              </span>
            </div>
          </div>

          <p style={{ marginTop: '20px' }}>
            서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 민원, 불만, 권리 구제에 관한 사항은 위의 연락처로 문의해 주시면 신속하고 성실하게 답변해 드리겠습니다.
          </p>
        </div>
      </article>

      {/* 5. 하단 고객지원 CTA */}
      <div style={{ textAlign: 'center', marginTop: '48px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '16px' }}>
          개인정보 처리에 대해 추가로 궁금한 점이 있으신가요?
        </p>
        <Link
          to="/contact"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 32px',
            borderRadius: '9999px',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-primary)',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: 'var(--glass-shadow)',
            transition: 'all 0.2s'
          }}
        >
          <Mail size={18} color="var(--primary)" /> 고객센터 1:1 문의하기
        </Link>
      </div>
    </div>
  );
};

export default Privacy;
