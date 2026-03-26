import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Swal from 'sweetalert2';
import { Save, List as ListIcon, Image as ImageIcon, FilePlus, X, Plus, Pencil, Type, User, Camera } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import * as fileApi from '../../apis/files';
import "../../assets/css/board.css";
import "../../assets/css/auth.css";

const MAX_LENGTH = 3000;

const Insert = ({ onInsert }) => {
  const navigate = useNavigate();
  const userInfo = useAuthStore(state => state.userInfo);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 파일 관련 상태 통합 관리
  const [mainFile, setMainFile] = useState({ file: null, preview: null });
  const [subFiles, setSubFiles] = useState([]); // [{file, preview}] 형태

  // 작성자 정보 자동 설정
  const writer = userInfo?.nickname || userInfo?.name || '익명';

  // 메모리 누수 방지를 위한 Preview 해제
  useEffect(() => {
    return () => {
      if (mainFile.preview) URL.revokeObjectURL(mainFile.preview);
      subFiles.forEach(f => URL.revokeObjectURL(f.preview));
    };
  }, [mainFile.preview, subFiles]);

  const handleMainFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (mainFile.preview) URL.revokeObjectURL(mainFile.preview);
      setMainFile({ file, preview: URL.createObjectURL(file) });
    }
  };

  const handleSubFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newFiles = selectedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setSubFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index, isMain = false) => {
    if (isMain) {
      URL.revokeObjectURL(mainFile.preview);
      setMainFile({ file: null, preview: null });
    } else {
      setSubFiles(prev => {
        const target = prev[index];
        if (target) URL.revokeObjectURL(target.preview);
        return prev.filter((_, i) => i !== index);
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    // 유효성 검사
    if (!userInfo?.no) return Swal.fire('인증 오류', '로그인 세션이 만료되었습니다.', 'error');
    if (!title.trim()) return Swal.fire('입력 오류', '제목을 입력해주세요.', 'warning');
    if (content.length > MAX_LENGTH) return Swal.fire('입력 초과', '내용이 너무 깁니다.', 'warning');

    setSubmitting(true);
    try {
      // 1. 대표 이미지 업로드
      let mainFileInfo = null;
      if (mainFile.file) {
        const { fileUrl, sanitizedName } = await fileApi.uploadFileToSupabase(mainFile.file, 'MAIN');
        mainFileInfo = { url: fileUrl, name: sanitizedName, originName: mainFile.file.name, size: mainFile.file.size };
      }

      // 2. 추가 파일들 업로드 (병렬 처리로 속도 개선)
      const filesInfo = await Promise.all(
        subFiles.map(async ({ file }) => {
          const { fileUrl, sanitizedName } = await fileApi.uploadFileToSupabase(file, 'SUB');
          return { url: fileUrl, name: sanitizedName, originName: file.name, size: file.size };
        })
      );

      // 3. 최종 데이터 전송
      const payload = {
        title,
        writer,
        content,
        mainFile: mainFileInfo,
        files: filesInfo,
        userNo: userInfo.no
      };

      await onInsert(payload);
      await Swal.fire('성공', '게시글이 성공적으로 등록되었습니다.', 'success');
      navigate('/boards');
    } catch (err) {
      console.error(err);
      Swal.fire('오류', '등록 중 문제가 발생했습니다.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="board-page trendy-board">
      <style>{`
        .trendy-board .read-container {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.03);
          padding: 56px;
        }
        .trendy-board .read-title {
          font-size: 2.4rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--primary, #007bff) 0%, #8a2be2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 8px;
        }
        .trendy-board .board-form-label {
          font-weight: 700;
          color: #475569;
          font-size: 0.95rem;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
        }
        .trendy-board .form-control {
          background: #f8fafc;
          border: 2px solid transparent;
          border-radius: 16px;
          padding: 18px 20px;
          font-size: 1.05rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
          width: 100%;
          color: #1e293b;
        }
        .trendy-board .form-control:focus {
          background: #fff;
          border-color: var(--primary, #007bff);
          box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.15), inset 0 2px 4px rgba(0,0,0,0.01);
          outline: none;
        }
        .trendy-board .preview-item {
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          border: 2px dashed #cbd5e1;
          background: #f8fafc;
        }
        .trendy-board .preview-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.1);
          border-color: var(--primary, #007bff);
          background: rgba(0, 123, 255, 0.02);
        }
        .trendy-board .preview-img {
          border-radius: 14px;
        }
        .trendy-board .btn-auth {
          border-radius: 16px;
          font-weight: 700;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }
        .trendy-board .btn-auth[type="submit"] {
          background: linear-gradient(135deg, var(--primary, #007bff) 0%, #8a2be2 100%);
          border: none;
          box-shadow: 0 8px 16px rgba(0, 123, 255, 0.25);
          color: white;
        }
        .trendy-board .btn-auth[type="submit"]:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 12px 24px rgba(0, 123, 255, 0.35);
        }
        .trendy-board .btn-auth.secondary {
          background: #f1f5f9;
          color: #475569;
          border: 2px solid transparent;
        }
        .trendy-board .btn-auth.secondary:hover {
          background: #e2e8f0;
          color: #1e293b;
          transform: translateY(-2px);
        }
        .trendy-board .ck-editor__editable {
          border-radius: 0 0 16px 16px !important;
          border: 2px solid #cbd5e1 !important;
          border-top: none !important;
          transition: border-color 0.3s ease;
          min-height: 480px;
          font-size: 1.05rem;
          color: #334155 !important;
        }
        .trendy-board .ck-editor__editable.ck-focused {
          border-color: var(--primary, #007bff) !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.05) !important;
        }
        .trendy-board .ck-toolbar {
          border-radius: 16px 16px 0 0 !important;
          border: 2px solid #cbd5e1 !important;
          background: #f8fafc !important;
          padding: 8px !important;
        }
        .trendy-board .board-header-actions {
          border-top: none !important;
          margin-top: 48px !important;
          padding-top: 0 !important;
          display: flex;
          justify-content: center;
          gap: 20px;
        }
        /* 다크모드 대응 */
        @media (prefers-color-scheme: dark) {
          .trendy-board .read-container {
            background: rgba(30, 41, 59, 0.85);
            border-color: rgba(255, 255, 255, 0.1);
          }
          .trendy-board .board-form-label { color: #e2e8f0; }
          .trendy-board .form-control { background: #0f172a; color: #f8fafc; border-color: rgba(255,255,255,0.05); }
          .trendy-board .form-control:focus { background: #1e293b; }
          .trendy-board .preview-item { background: #0f172a; border-color: rgba(255,255,255,0.1); }
          .trendy-board .ck-editor__editable { color: #f8fafc !important; border-color: rgba(255,255,255,0.1) !important; background: #0f172a !important; }
          .trendy-board .ck-toolbar { background: #1e293b !important; border-color: rgba(255,255,255,0.1) !important; }
          .trendy-board .btn-auth.secondary { background: rgba(255,255,255,0.1); color: #f8fafc; }
          .trendy-board .btn-auth.secondary:hover { background: rgba(255,255,255,0.15); }
        }
      `}</style>
      <div className="read-container" style={{ maxWidth: '850px', margin: '0 auto' }}>
        <header className="read-header" style={{ borderBottom: 'none', textAlign: 'center', paddingBottom: '16px', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 123, 255, 0.1)', padding: '10px 20px', borderRadius: '30px', marginBottom: '20px' }}>
            <Pencil size={18} style={{ color: 'var(--primary, #007bff)', marginRight: '8px' }} />
            <span style={{ color: 'var(--primary, #007bff)', fontWeight: 800, letterSpacing: '1px', fontSize: '0.9rem' }}>CREATE POST</span>
          </div>
          <h1 className="read-title">새로운 이야기 작성</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '12px', fontWeight: 500 }}>여러분의 다이나믹한 경험을 멋지게 공유해보세요!</p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form" style={{ maxWidth: '100%', gap: '32px' }}>
          <div className="board-form-group" style={{ marginBottom: 0 }}>
            <label className="board-form-label"><Type size={18} style={{marginRight: '8px', color: 'var(--primary, #007bff)'}}/> 제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-control"
              placeholder="제목을 입력하세요"
              required
            />
          </div>

          <div className="board-form-group" style={{ marginBottom: 0 }}>
            <label className="board-form-label"><User size={18} style={{marginRight: '8px', color: 'var(--primary, #007bff)'}}/> 작성자</label>
            <input type="text" value={writer} className="form-control" readOnly style={{ opacity: 0.7, pointerEvents: 'none', userSelect: 'none', background: 'transparent' }} tabIndex={-1} />
          </div>

          <div className="board-form-group" style={{ marginBottom: 0 }}>
            <label className="board-form-label" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span><FilePlus size={18} style={{marginRight: '8px', color: 'var(--primary, #007bff)'}}/> 내용</span>
              <span style={{ color: content.length > MAX_LENGTH ? '#ef4444' : '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>
                {content.length} / {MAX_LENGTH}
              </span>
            </label>
            <div className="ck-editor-wrapper">
              <CKEditor
                editor={ClassicEditor}
                data={content}
                onChange={(event, editor) => setContent(editor.getData())}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '16px' }}>
            {/* 대표 이미지 섹션 */}
            <div className="board-form-group" style={{ marginBottom: 0 }}>
              <label className="board-form-label"><Camera size={18} style={{marginRight: '8px', color: 'var(--primary, #007bff)'}} /> 대표 썸네일</label>
              <div className="file-preview-grid">
                {mainFile.preview ? (
                  <div className="preview-item">
                    <span className="preview-badge">MAIN</span>
                    <img src={mainFile.preview} className="preview-img" alt="main-preview" />
                    <button type="button" onClick={() => removeFile(0, true)} className="btn-icon" style={{ position: 'absolute', top: '4px', right: '4px' }}>
                      <X size={12} color="red" />
                    </button>
                  </div>
                ) : (
                  <label className="preview-item" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--glass-border)', background: 'transparent' }}>
                    <Plus size={24} color="var(--text-muted)" />
                    <input type="file" onChange={handleMainFileChange} style={{ display: 'none' }} accept="image/*" />
                  </label>
                )}
              </div>
            </div>

            {/* 추가 첨부 파일 섹션 */}
            <div className="board-form-group" style={{ marginBottom: 0 }}>
              <label className="board-form-label"><ImageIcon size={18} style={{marginRight: '8px', color: 'var(--primary, #007bff)'}} /> 추가 첨부</label>
              <div className="file-preview-grid">
                {subFiles.map((item, idx) => (
                  <div key={idx} className="preview-item">
                    <img src={item.preview} className="preview-img" alt={`sub-${idx}`} />
                    <button type="button" onClick={() => removeFile(idx)} className="btn-icon" style={{ position: 'absolute', top: '4px', right: '4px' }}>
                      <X size={12} color="red" />
                    </button>
                  </div>
                ))}
                <label className="preview-item" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--glass-border)', background: 'transparent' }}>
                  <Plus size={24} color="var(--text-muted)" />
                  <input type="file" multiple onChange={handleSubFilesChange} style={{ display: 'none' }} accept="image/*" />
                </label>
              </div>
            </div>
          </div>

          <div className="board-header-actions">
            <Link to="/boards" className="btn-auth secondary" style={{ padding: '16px 32px', minWidth: '140px', fontSize: '1.05rem' }}>
              <ListIcon size={20} style={{marginRight: '10px'}} /> 취소
            </Link>
            <button type="submit" className="btn-auth" disabled={submitting || content.length > MAX_LENGTH} style={{ padding: '16px 40px', minWidth: '180px', fontSize: '1.05rem' }}>
              <Save size={20} style={{marginRight: '10px'}} /> {submitting ? '등록 중...' : '게시글 등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Insert;