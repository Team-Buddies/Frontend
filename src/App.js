import React, { useEffect, useRef, useState } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('초기화 중...');

  useEffect(() => {
    let poseLandmarker;
    let animationId;

    const init = async () => {
      try {
        setStatus('MediaPipe 로딩 중...');
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
        );
        poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        });

        setStatus('웹캠 연결 중...');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        videoRef.current.onloadeddata = () => {
          setStatus('✅ 연동 성공! 관절을 인식 중...');
          detect();
        };
      } catch (e) {
        setStatus('❌ 오류: ' + e.message);
      }
    };

    const detect = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;
      const ctx = canvas.getContext('2d');
      const drawUtils = new DrawingUtils(ctx);

      const loop = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const result = poseLandmarker.detectForVideo(video, performance.now());
        if (result.landmarks.length > 0) {
          drawUtils.drawLandmarks(result.landmarks[0], { color: '#00FF00', radius: 5 });
          drawUtils.drawConnectors(result.landmarks[0], PoseLandmarker.POSE_CONNECTIONS, { color: '#FF0000' });
        }
        animationId = requestAnimationFrame(loop);
      };
      loop();
    };

    init();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>BodyBuddy - 자세 인식 테스트</h1>
      <p>{status}</p>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <video ref={videoRef} autoPlay playsInline style={{ width: '640px' }} />
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      </div>
    </div>
  );
}

export default App;