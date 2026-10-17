// 목적: 실제로 자세 판별에 사용할 Feature를 생성. 무릎/골반/상체 등의 Feature 계산
import {
  calculateAngle,
  calculateTorsoAngle,
  midpoint,
} from "./calculateAngle";

import { extractSquatLandmarks } from "./landmarks";
import { areSquatLandmarksVisible } from "./visibility";

export function calculateSquatFeatures(
  landmarks
) {
  const points =
    extractSquatLandmarks(landmarks);

  if (!points) {
    return {
      valid: false,
      reason: "LANDMARKS_NOT_FOUND",
    };
  }

  if (!areSquatLandmarksVisible(points)) {
    return {
      valid: false,
      reason: "LOW_VISIBILITY",
    };
  }

  // 무릎 각도
  const leftKneeAngle = calculateAngle(
    points.leftHip,
    points.leftKnee,
    points.leftAnkle
  );

  const rightKneeAngle = calculateAngle(
    points.rightHip,
    points.rightKnee,
    points.rightAnkle
  );

  // Hip 각도
  const leftHipAngle = calculateAngle(
    points.leftShoulder,
    points.leftHip,
    points.leftKnee
  );

  const rightHipAngle = calculateAngle(
    points.rightShoulder,
    points.rightHip,
    points.rightKnee
  );

  // 발목 각도
  const leftAnkleAngle = calculateAngle(
    points.leftKnee,
    points.leftAnkle,
    points.leftFootIndex
  );

  const rightAnkleAngle = calculateAngle(
    points.rightKnee,
    points.rightAnkle,
    points.rightFootIndex
  );

  // Shoulder / Hip 중앙점
  const shoulderMid = midpoint(
    points.leftShoulder,
    points.rightShoulder
  );

  const hipMid = midpoint(
    points.leftHip,
    points.rightHip
  );

  // 상체 기울기
  const torsoAngle = calculateTorsoAngle(
    shoulderMid,
    hipMid
  );

  const averageKneeAngle =
    (leftKneeAngle + rightKneeAngle) / 2;

  const averageHipAngle =
    (leftHipAngle + rightHipAngle) / 2;

  const kneeAngleDifference = Math.abs(
    leftKneeAngle - rightKneeAngle
  );

  const hipAngleDifference = Math.abs(
    leftHipAngle - rightHipAngle
  );

  return {
    valid: true,

    points,

    leftKneeAngle,
    rightKneeAngle,
    averageKneeAngle,

    leftHipAngle,
    rightHipAngle,
    averageHipAngle,

    leftAnkleAngle,
    rightAnkleAngle,

    torsoAngle,

    kneeAngleDifference,
    hipAngleDifference,

    hipY: hipMid.y,
  };
}