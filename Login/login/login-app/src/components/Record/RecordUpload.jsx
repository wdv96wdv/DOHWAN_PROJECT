import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { Upload, Loader, Image as ImageIcon } from 'lucide-react';

export default function RecordUpload({ onExtracted }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Preview
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setIsProcessing(true);
        setProgress(0);

        try {
            const result = await Tesseract.recognize(
                file,
                'eng+kor', // 한국어와 영어 동시 지원 (단위나 시간 등)
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setProgress(Math.floor(m.progress * 100));
                        }
                    }
                }
            );

            const text = result.data.text;
            console.log("OCR Extracted Text:", text);

            // 간단한 Regex로 거리(km)와 시간(mm:ss) 추출 시도
            let distance = 0;
            let durationSec = 0;

            // 거리 정규식 (예: 5.23 km, 10.0km)
            const distanceMatch = text.match(/(\d+\.\d+)\s*km/i) || text.match(/(\d+)\s*km/i);
            if (distanceMatch) {
                distance = parseFloat(distanceMatch[1]);
            }

            // 시간 정규식 (예: 25:14, 01:25:14)
            const timeMatch = text.match(/(?:(\d{1,2}):)?(\d{1,2}):(\d{2})/);
            if (timeMatch) {
                const hours = timeMatch[1] ? parseInt(timeMatch[1], 10) : 0;
                const minutes = parseInt(timeMatch[2], 10);
                const seconds = parseInt(timeMatch[3], 10);
                durationSec = (hours * 3600) + (minutes * 60) + seconds;
            }

            onExtracted({ distanceKm: distance, durationSec, imageUrl: objectUrl, text });
        } catch (error) {
            console.error("OCR Error:", error);
            alert("이미지 분석 중 오류가 발생했습니다.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="record-upload-container glass-card" style={{ textAlign: 'center', padding: '30px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <ImageIcon size={24} /> 러닝 기록 자동 입력 (OCR)
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
                나이키 런 클럽, 스트라바 등의 러닝 결과 화면을 캡처해서 올려주세요. <br/>
                거리와 시간을 자동으로 인식합니다!
            </p>

            <label className="btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', gap: '8px' }}>
                <Upload size={18} />
                이미지 업로드
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    style={{ display: 'none' }} 
                    disabled={isProcessing}
                />
            </label>

            {previewUrl && (
                <div style={{ marginTop: '20px' }}>
                    <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'contain' }} />
                </div>
            )}

            {isProcessing && (
                <div style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--primary)' }}>
                        <Loader size={18} className="spin" />
                        <span>이미지 분석 중... {progress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#333', borderRadius: '3px', marginTop: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.2s' }}></div>
                    </div>
                </div>
            )}

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
