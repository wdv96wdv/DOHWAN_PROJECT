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
        <title>개인?�보처리방침 | ?�러??(Dorunning)</title>
        <meta
          name="description"
          content="?�러??Dorunning)??개인?�보처리방침?�니?? ?�용?�의 ?�중??개인?�보�??�전?�게 보호?�고 처리?�는 ?�칙�??�차�??�명?�게 ?�내?�니??"
        />
        <meta property="og:title" content="?�러??개인?�보처리방침" />
        <meta property="og:description" content="?�러?�의 개인?�보 ?�집 목적, 보유 기간, ?�전???�보 조치 �??�용??권리�??�명?�게 공개?�니??" />
        <link rel="canonical" href="https://www.dorunning.app/privacy" />
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
          ?�러??<span className="highlight">개인?�보처리방침</span>
        </h1>
        <p>
          ?�러??Dorunning)?� ?�용?�의 개인?�보�??�중?�게 ?�각?�며, ?�개?�정�?보호법�?�?관??법령??철�???준?�하??          ?�러분의 ?�이?��? ?�전?�게 보호?�고 ?�습?�다.
        </p>
        <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Clock size={14} /> <span>최종 개정 �??�행?�자: 2026??10??12??/span>
        </div>
      </motion.header>

      {/* 2. 3?� 개인?�보 보호 ?�심 ?�칙 (Security Pillars) */}
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
          <h3>최소 ?�보 ?�집</h3>
          <p>마라???�정 ?�내 �?계정 관�????�수 ?�비???�영???�요??최소?�의 ?�보만을 ?�집?�니??</p>
        </div>

        <div className="security-box">
          <div className="security-icon">
            <ShieldCheck size={26} />
          </div>
          <h3>철�????�호??보호</h3>
          <p>비�?번호 ??민감 ?�이?�는 ?�방???�호?�되??관리자조차 ?�람?????�도�??�전?�게 격리?�니??</p>
        </div>

        <div className="security-box">
          <div className="security-icon">
            <UserCheck size={26} />
          </div>
          <h3>?�용??권리 보장</h3>
          <p>?�원?� ?�제?��? ?�신???�보�??�람, ?�정, 철회(?�원 ?�퇴 �???��)?????�는 ?�전???�어권을 가집니??</p>
        </div>
      </motion.div>

      {/* 3. 빠른 목차 ?�비게이??*/}
      <div className="policy-nav-wrap">
        <div className="policy-nav-title">
          <FileText size={16} /> 조항 바로가�?        </div>
        <div className="policy-nav-list">
          <button className="policy-nav-btn" onClick={() => scrollToSection('sec-1')}>??�? 처리 목적</button>
          <button className="policy-nav-btn" onClick={() => scrollToSection('sec-2')}>??�? ?�집 ??��</button>
          <button className="policy-nav-btn" onClick={() => scrollToSection('sec-3')}>??�? 보유 �??�용기간</button>
          <button className="policy-nav-btn" onClick={() => scrollToSection('sec-4')}>??�? ?????�공</button>
          <button className="policy-nav-btn" onClick={() => scrollToSection('sec-5')}>??�? ?�용??권리?�사</button>
          <button className="policy-nav-btn" onClick={() => scrollToSection('sec-6')}>??�? ?�기 ?�차</button>
          <button className="policy-nav-btn" onClick={() => scrollToSection('sec-7')}>??�? 쿠키 �??�드?�스</button>
          <button className="policy-nav-btn" onClick={() => scrollToSection('sec-8')}>??�? ?�전???�보조치</button>
          <button className="policy-nav-btn" onClick={() => scrollToSection('sec-9')}>??�? 보호책임??/button>
        </div>
      </div>

      {/* 4. 본문 조항 카드??*/}

      {/* ??�?*/}
      <article className="policy-article" id="sec-1">
        <div className="article-header">
          <span className="article-num">??1 �?/span>
          <h2 className="article-title">개인?�보??처리 목적</h2>
        </div>
        <div className="article-content">
          <p>?�러??Dorunning)?� ?�음??목적???�하??개인?�보�?처리?�니?? 처리?�고 ?�는 개인?�보???�음??목적 ?�외???�도로는 ?�용?��? ?�으�? ?�용 목적??변경되??경우?�는 관??법률???�라 별도???�의�?받는 ???�요??조치�??�행???�정?�니??</p>
          <ul style={{ paddingLeft: '20px', margin: '12px 0' }}>
            <li><strong>?�원 가??�?관�?</strong> ?�원???�비???�용???�른 본인?�인, 개인?�별, 불량?�원??부?�이??방�??� 비인가 ?�용 방�?, 가?�의???�인, 문의?�항 처리</li>
            <li><strong>?�비???�공 �??�영:</strong> 마라???�???�정 조회, 코스 �??�보, ?�닝 캘린??�?개인 기록 관�? 커�??�티 게시글/?��? ?�성 기능 ?�공</li>
            <li><strong>?�비??개선 �??�계 분석:</strong> ?�규 ?�비??개발 �?맞춤??기능 ?�공, ?�속 빈도 ?�악 �??�비???�용???�???�계 분석</li>
          </ul>
        </div>
      </article>

      {/* ??�?*/}
      <article className="policy-article" id="sec-2">
        <div className="article-header">
          <span className="article-num">??2 �?/span>
          <h2 className="article-title">처리?�는 개인?�보????��</h2>
        </div>
        <div className="article-content">
          <p>?�러?��? ?�활???�비???�공???�해 ?�원가??�??�비???�용 ???�음�?같�? 최소?�의 개인?�보�??�집?�고 ?�습?�다.</p>

          <table className="policy-data-table">
            <thead>
              <tr>
                <th>구분</th>
                <th>?�집 ??��</th>
                <th>?�집 방법</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>?�반 ?�원가??/td>
                <td>?�이???�메??, 비�?번호(?�호??, ?�네?? ?�름</td>
                <td>?�원가???�식 ?�력</td>
              </tr>
              <tr>
                <td>?�셜 로그??(카카??</td>
                <td>?�셜 고유 ?�별??ID), ?�로???�네?? ?�메??/td>
                <td>OAuth ?�동 ???�공 ?�의</td>
              </tr>
              <tr>
                <td>?�비???�용 과정</td>
                <td>?�속 로그, 쿠키(Cookie), ?�속 IP 주소, 브라?��? ?�보</td>
                <td>?�비???�용 �??�동 ?�성</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      {/* ??�?*/}
      <article className="policy-article" id="sec-3">
        <div className="article-header">
          <span className="article-num">??3 �?/span>
          <h2 className="article-title">개인?�보??보유 �??�용 기간</h2>
        </div>
        <div className="article-content">
          <p>?�러?��? 법령???�른 개인?�보 보유·?�용 기간 ?�는 ?�보주체로�???개인?�보�??�집 ?�에 ?�의받�? 개인?�보 보유·?�용 기간 ?�에??개인?�보�?처리 �?보유?�니??</p>
          <ul style={{ paddingLeft: '20px', margin: '12px 0' }}>
            <li><strong>?�원 ?�보:</strong> ?�원 ?�퇴 ?�까지 (?? 관�?법령 ?�반???�른 ?�사·조사 ?�이 진행 중인 경우?�는 ?�당 ?�사·조사 종료 ?�까지)</li>
            <li><strong>게시�?�??��?:</strong> ?�원??직접 ??��?�거???�퇴 ???�괄 ??�� ?�청 ?�까지</li>
          </ul>
          <p>?�법 �??�자?�거???�에?�의 ?�비?�보?�에 관??법률 ??관계법?�의 규정???�하??보존???�요가 ?�는 경우, ?�러?��? 관계법?�에???�한 ?�정??기간 ?�안 ?�원?�보�?보�??�니??</p>
        </div>
      </article>

      {/* ??�?*/}
      <article className="policy-article" id="sec-4">
        <div className="article-header">
          <span className="article-num">??4 �?/span>
          <h2 className="article-title">개인?�보???????�공 �?처리 ?�탁</h2>
        </div>
        <div className="article-content">
          <p>?�러?��? ?�용?�의 개인?�보�???�?개인?�보??처리 목적)?�서 명시??범위 ?�에?�만 처리?�며, <strong>?�용?�의 ?�전 ?�의 ?�이??본래??범위�?초과?�여 ???�에�??�공?�거???�매?��? ?�습?�다.</strong></p>
          <p>?�활???�라?�드 ?�프???�공???�해 ?�음�?같이 ?�정?�이 검증된 글로벌 ?�랫?�에 ?�이??처리�??�탁?�고 ?�습?�다:</p>
          <table className="policy-data-table">
            <thead>
              <tr>
                <th>?�탁 ?�체</th>
                <th>?�탁 ?�무 ?�용</th>
                <th>보유 �??�용 기간</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Supabase Inc.</td>
                <td>?�라?�드 ?�이?�베?�스 ?�스??�??�이???�전 보�?</td>
                <td>?�원 ?�퇴 ???�는 ?�비??종료 ?�까지</td>
              </tr>
              <tr>
                <td>Vercel Inc.</td>
                <td>???�플리�??�션 ?�스??�??�래??분산 처리</td>
                <td>?�비???�영 기간 ?�안</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      {/* ??�?*/}
      <article className="policy-article" id="sec-5">
        <div className="article-header">
          <span className="article-num">??5 �?/span>
          <h2 className="article-title">?�보주체?� 법정?�리인??권리·?�무 �??�사방법</h2>
        </div>
        <div className="article-content">
          <p>?�용?�는 ?�제?��? ?�음�?같�? 개인?�보 보호 관??권리�??�사?????�습?�다:</p>
          <ul style={{ paddingLeft: '20px', margin: '12px 0' }}>
            <li>개인?�보 ?�람 �??�정 ?�청: [마이?�이지] 메뉴�??�해 ?�신??개인?�보�?직접 ?�람?�고 ?�정?????�습?�다.</li>
            <li>개인?�보 ??�� �??�원 ?�퇴 ?�청: ?�비?????�원 ?�퇴 메뉴 ?�는 고객?�터�??�해 즉시 계정 ??�� �??�이???�기�??�청?????�습?�다.</li>
            <li>개인?�보 처리 ?��? ?�구</li>
          </ul>
        </div>
      </article>

      {/* ??�?*/}
      <article className="policy-article" id="sec-6">
        <div className="article-header">
          <span className="article-num">??6 �?/span>
          <h2 className="article-title">개인?�보???�기 ?�차 �?방법</h2>
        </div>
        <div className="article-content">
          <p>?�러?��? 개인?�보 보유기간??경과, 처리목적 ?�성 ??개인?�보가 불필?�하�??�었???�에??지�??�이 ?�당 개인?�보�??�기?�니??</p>
          <ul style={{ paddingLeft: '20px', margin: '12px 0' }}>
            <li><strong>?�기 ?�차:</strong> ?�용?��? ?�력???�보??목적 ?�성 ??즉시 ?�기?�거?? 관??법령???�라 별도??DB????��???�정 기간 보�??????�기?�니??</li>
            <li><strong>?�기 방법:</strong> ?�자???�일 ?�태�?기록·?�?�된 개인?�보??기록??복구 ?�는 ?�생?????�는 기술??방법(?�구 ??��)???�용?�여 ?�기?�니??</li>
          </ul>
        </div>
      </article>

      {/* ??�?- 구�? ?�드?�스 & 쿠키 (매우 중요) */}
      <article className="policy-article" id="sec-7">
        <div className="article-header">
          <span className="article-num">??7 �?/span>
          <h2 className="article-title">쿠키(Cookie) �?맞춤??광고(Google AdSense) ?�내</h2>
        </div>
        <div className="article-content">
          <p>
            ?�러?��? ?�용?�에�?개별?�인 맞춤 ?�비?��? ?�공?�고 ?�사?�트???�영 비용??충당?�기 ?�해 ?�용 ?�보�??�?�하�??�시�?불러?�는 '쿠키(Cookie)'?� <strong>Google AdSense</strong> 광고 ?�비?��? ?�용?�니??
          </p>

          <div className="adsense-box">
            <h4 style={{ margin: '0 0 10px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ExternalLink size={18} color="var(--primary)" /> Google AdSense 광고 �?쿠키 ?�책 고�?
            </h4>
            <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>
              1. Google???�함??????공급?�체??쿠키�??�용?�여 ?�용?�의 �??�이??�??�터?�상???�른 ?�사?�트 ?�전 방문 기록??바탕?�로 광고�?게재?�니??<br />
              2. Google??광고 쿠키�??�용?�면 Google �??�트?�는 ?�용?�의 ?�이??방문??바탕?�로 관?�성 ?��? 광고�??�공?????�습?�다.<br />
              3. ?�용?�는 ?�제?��? Google??광고 ?�정 ?�는 ????공급?�체??쿠키 ?�용???�제?????�습?�다.
            </p>
            <div className="adsense-links">
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="adsense-btn"
              >
                Google 맞춤 광고 ?�정 ?�제 <ExternalLink size={14} />
              </a>
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="adsense-btn"
              >
                Google 개인?�보 보호 �?광고 ?��? <ExternalLink size={14} />
              </a>
            </div>
          </div>

          <p style={{ marginTop: '16px' }}>
            <strong>쿠키 ?�치 ?�용/거�? 방법:</strong> ?�용?�는 ??브라?��????�션???�정?�으로써 모든 쿠키�??�용?�거?? 쿠키가 ?�?�될 ?�마???�인??거치거나, 모든 쿠키???�?�을 거�??????�습?�다. (?? 쿠키 ?�?�을 거�???경우 로그?�이 ?�요???��? ?�비???�용???�려?�???�을 ???�습?�다.)
          </p>
        </div>
      </article>

      {/* ??�?*/}
      <article className="policy-article" id="sec-8">
        <div className="article-header">
          <span className="article-num">??8 �?/span>
          <h2 className="article-title">개인?�보???�전???�보 조치</h2>
        </div>
        <div className="article-content">
          <p>?�러?��? 개인?�보???�전???�보�??�해 ?�음�?같�? 기술?�·�?리적 조치�?취하�??�습?�다:</p>
          <ul style={{ paddingLeft: '20px', margin: '12px 0' }}>
            <li><strong>비�?번호???�호??</strong> ?�용?�의 비�?번호???�방???�시 ?�수�??�호?�되???�??�?관리되�??�어, 본인만이 ?????�습?�다.</li>
            <li><strong>?�킹 ?�에 ?�비한 기술???��?</strong> HTTPS/SSL 보안 ?�로?�콜???�용?�여 ?�이???�송 구간???�면 ?�호?�하�? 최신 보안 ?�치�?주기?�으�??�용?�고 ?�습?�다.</li>
            <li><strong>개인?�보 ?�근 권한 ?�한:</strong> ?�이?�베?�스???�근?????�는 관리자 권한??최소?�의 ?�원?�로 ?�격???�한?�고 ?�습?�다.</li>
          </ul>
        </div>
      </article>

      {/* ??�?*/}
      <article className="policy-article" id="sec-9">
        <div className="article-header">
          <span className="article-num">??9 �?/span>
          <h2 className="article-title">개인?�보 보호책임??�?권익침해 구제</h2>
        </div>
        <div className="article-content">
          <p>
            ?�러?��? 개인?�보 처리??관???�무�?총괄?�서 책임지�? 개인?�보 처리?� 관?�한 ?�보주체??불만처리 �??�해구제 ?�을 ?�하???�래?� 같이 개인?�보 보호책임?��? 지?�하�??�습?�다.
          </p>

          <div className="officer-card">
            <div className="officer-item">
              <span className="officer-label">?�비?�명</span>
              <span className="officer-val">?�러??(Dorunning)</span>
            </div>
            <div className="officer-item">
              <span className="officer-label">개인?�보 보호 책임??/span>
              <span className="officer-val">?�영 총괄 관리자</span>
            </div>
            <div className="officer-item">
              <span className="officer-label">문의 ?�메??/span>
              <span className="officer-val">kimdohwan969@gmail.com</span>
            </div>
            <div className="officer-item">
              <span className="officer-label">?�라??고객?�터</span>
              <span className="officer-val">
                <Link to="/contact" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>
                  문의?�기 ?�이지 바로가�?&rarr;
                </Link>
              </span>
            </div>
          </div>

          <p style={{ marginTop: '20px' }}>
            ?�비?��? ?�용?�시면서 발생??모든 개인?�보 보호 관??민원, 불만, 권리 구제??관???�항?� ?�의 ?�락처로 문의??주시�??�속?�고 ?�실?�게 ?��????�리겠습?�다.
          </p>
        </div>
      </article>

      {/* 5. ?�단 고객지??CTA */}
      <div style={{ textAlign: 'center', marginTop: '48px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '16px' }}>
          개인?�보 처리???�??추�?�?궁금???�이 ?�으?��???
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
          <Mail size={18} color="var(--primary)" /> 고객?�터 1:1 문의?�기
        </Link>
      </div>
    </div>
  );
};

export default Privacy;
