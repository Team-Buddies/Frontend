// 목적: 웹캠과 MediaPipe를 실행하고 → vision/ 모듈에 Landmark를 전달하고 → 반환된 분석 결과를 테스트 화면에 보여주는 것
import { useEffect, useRef, useState } from "react";

import {
  DrawingUtils,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";

import { createPoseLandmarker } from "./vision/mediapipe";
import { createSquatAnalyzer } from "./vision/analyzeSquat";

import "./App.css";

function App() {
  // HTML video / canvas 접근용
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // MediaPipe Pose 모델
  const poseLandmarkerRef = useRef(null);

  // 스쿼트 분석기
  const squatAnalyzerRef = useRef(null);

  // requestAnimationFrame ID
  const animationFrameRef = useRef(null);

  // 같은 비디오 프레임을 중복 분석하지 않기 위한 값
  const lastVideoTimeRef = useRef(-1);

  // 화면 표시용 상태
  const [status, setStatus] = useState(
    "Loading MediaPipe..."
  );

  const [squatData, setSquatData] = useState(null);

  const [lastCompletedRep, setLastCompletedRep] =
    useState(null);

  useEffect(() => {
    let stream = null;
    let isMounted = true;

    async function initialize() {
      try {
        // -----------------------------------------
        // 1. MediaPipe Pose 모델 초기화
        // -----------------------------------------
        const poseLandmarker =
          await createPoseLandmarker();

        if (!isMounted) {
          poseLandmarker.close();
          return;
        }

        poseLandmarkerRef.current =
          poseLandmarker;

        // -----------------------------------------
        // 2. 스쿼트 분석기 생성
        // -----------------------------------------
        squatAnalyzerRef.current =
          createSquatAnalyzer();

        // -----------------------------------------
        // 3. 웹캠 권한 요청
        // -----------------------------------------
        stream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              width: 640,
              height: 480,
            },
            audio: false,
          });

        const video = videoRef.current;

        if (!video) {
          return;
        }

        // -----------------------------------------
        // 4. 웹캠 영상을 video 태그에 연결
        // -----------------------------------------
        video.srcObject = stream;

        await video.play();

        if (!isMounted) {
          return;
        }

        setStatus("Camera ready");

        // -----------------------------------------
        // 5. 실시간 Pose 분석 시작
        // -----------------------------------------
        predictWebcam();
      } catch (error) {
        console.error(
          "Initialization error:",
          error
        );

        if (isMounted) {
          setStatus(
            "Initialization failed - check console"
          );
        }
      }
    }

    function predictWebcam() {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      const poseLandmarker =
        poseLandmarkerRef.current;

      const squatAnalyzer =
        squatAnalyzerRef.current;

      if (
        !video ||
        !canvas ||
        !poseLandmarker ||
        !squatAnalyzer
      ) {
        return;
      }

      // 웹캠 영상이 아직 준비되지 않은 경우
      if (video.readyState < 2) {
        animationFrameRef.current =
          requestAnimationFrame(predictWebcam);

        return;
      }

      // -----------------------------------------
      // 같은 비디오 프레임 중복 분석 방지
      // -----------------------------------------
      if (
        video.currentTime ===
        lastVideoTimeRef.current
      ) {
        animationFrameRef.current =
          requestAnimationFrame(predictWebcam);

        return;
      }

      lastVideoTimeRef.current =
        video.currentTime;

      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // -----------------------------------------
      // 6. 현재 웹캠 프레임 MediaPipe 분석
      // -----------------------------------------
      const result =
        poseLandmarker.detectForVideo(
          video,
          performance.now()
        );

      // 이전 프레임에 그린 Skeleton 제거
      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      // -----------------------------------------
      // 7. 사람 Pose가 검출된 경우
      // -----------------------------------------
      if (
        result.landmarks &&
        result.landmarks.length > 0
      ) {
        setStatus("Pose detected");

        // 첫 번째 사람의 33개 Landmark
        const landmarks =
          result.landmarks[0];

        // -----------------------------------------
        // 8. Skeleton 시각화
        // -----------------------------------------
        const drawingUtils =
          new DrawingUtils(ctx);

        drawingUtils.drawLandmarks(
          landmarks,
          {
            radius: 3,
          }
        );

        drawingUtils.drawConnectors(
          landmarks,
          PoseLandmarker.POSE_CONNECTIONS
        );

        // -----------------------------------------
        // 9. 스쿼트 분석
        // -----------------------------------------
        const squatResult =
          squatAnalyzer.analyze(
            landmarks
          );

        // Landmark 품질이 충분한 경우
        if (squatResult.valid) {
          setSquatData(squatResult);

          // 개발 확인용 로그
          console.log(
            "Squat Analysis:",
            squatResult
          );

          // -------------------------------------
          // 10. 한 번의 스쿼트가 완료된 경우
          // -------------------------------------
          if (squatResult.completedRep) {
            setLastCompletedRep(
              squatResult.completedRep
            );

            console.log(
              "Completed Rep:",
              squatResult.completedRep
            );
          }
        }
      } else {
        setStatus("No pose detected");
      }

      // -----------------------------------------
      // 다음 브라우저 프레임에서 다시 분석
      // -----------------------------------------
      animationFrameRef.current =
        requestAnimationFrame(
          predictWebcam
        );
    }

    initialize();

    // -------------------------------------------
    // 컴포넌트 종료 시 정리
    // -------------------------------------------
    return () => {
      isMounted = false;

      if (
        animationFrameRef.current !== null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );
      }

      // 웹캠 종료
      if (stream) {
        stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }

      // MediaPipe 종료
      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close();
        poseLandmarkerRef.current = null;
      }

      // 스쿼트 분석기 초기화
      if (squatAnalyzerRef.current) {
        squatAnalyzerRef.current.reset();
        squatAnalyzerRef.current = null;
      }
    };
  }, []);

  // ---------------------------------------------
  // 화면
  // ---------------------------------------------
  return (
    <div className="app">
      <h1>Squat Vision Test</h1>

      <p className="status">
        {status}
      </p>

      {/* 카메라 + Skeleton */}
      <div className="camera-wrapper">
        <video
          ref={videoRef}
          className="camera"
          autoPlay
          playsInline
          muted
        />

        <canvas
          ref={canvasRef}
          className="pose-canvas"
        />
      </div>

      {/* 실시간 스쿼트 분석 결과 */}
      <div className="landmark-panel">
        <h2>Real-time Squat Analysis</h2>

        {squatData ? (
          <>
            <p>
              <strong>Count:</strong>{" "}
              {squatData.count}
            </p>

            <p>
              <strong>Phase:</strong>{" "}
              {squatData.phase}
            </p>

            <hr />

            <h3>Joint Angles</h3>

            <p>
              Left Knee:{" "}
              {squatData.features.leftKneeAngle.toFixed(
                1
              )}
              °
            </p>

            <p>
              Right Knee:{" "}
              {squatData.features.rightKneeAngle.toFixed(
                1
              )}
              °
            </p>

            <p>
              Average Knee:{" "}
              {squatData.features.averageKneeAngle.toFixed(
                1
              )}
              °
            </p>

            <p>
              Left Hip:{" "}
              {squatData.features.leftHipAngle.toFixed(
                1
              )}
              °
            </p>

            <p>
              Right Hip:{" "}
              {squatData.features.rightHipAngle.toFixed(
                1
              )}
              °
            </p>

            <p>
              Left Ankle:{" "}
              {squatData.features.leftAnkleAngle.toFixed(
                1
              )}
              °
            </p>

            <p>
              Right Ankle:{" "}
              {squatData.features.rightAnkleAngle.toFixed(
                1
              )}
              °
            </p>

            <p>
              Torso Angle:{" "}
              {squatData.features.torsoAngle.toFixed(
                1
              )}
              °
            </p>

            <hr />

            <h3>Symmetry</h3>

            <p>
              Knee Difference:{" "}
              {squatData.features.kneeAngleDifference.toFixed(
                1
              )}
              °
            </p>

            <p>
              Hip Difference:{" "}
              {squatData.features.hipAngleDifference.toFixed(
                1
              )}
              °
            </p>

            <hr />

            <h3>Current Posture</h3>

            <p>
              {squatData.currentErrors.length >
              0
                ? squatData.currentErrors.join(
                    ", "
                  )
                : "No error detected"}
            </p>
          </>
        ) : (
          <p>
            Stand in front of the
            camera.
          </p>
        )}
      </div>

      {/* 마지막 완료 Rep 분석 */}
      <div className="landmark-panel">
        <h2>Last Completed Rep</h2>

        {lastCompletedRep ? (
          <>
            <p>
              <strong>Rep:</strong>{" "}
              {
                lastCompletedRep.repNumber
              }
            </p>

            <p>
              Minimum Knee Angle:{" "}
              {lastCompletedRep.stats.minKneeAngle.toFixed(
                1
              )}
              °
            </p>

            <p>
              Maximum Torso Angle:{" "}
              {lastCompletedRep.stats.maxTorsoAngle.toFixed(
                1
              )}
              °
            </p>

            <p>
              Maximum Knee Difference:{" "}
              {lastCompletedRep.stats.maxKneeDifference.toFixed(
                1
              )}
              °
            </p>

            <p>
              <strong>
                Rep Result:
              </strong>{" "}
              {lastCompletedRep.errors.join(
                ", "
              )}
            </p>
          </>
        ) : (
          <p>
            No completed squat yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default App;