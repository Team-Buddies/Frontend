// 목적: 자세 오류 판별
// DEPTH_INSUFFICIENT는 한 Rep 전체르 보며 가잘 작은 무릎각은 확인한 후 깊이 부족을 판정함
const FORWARD_LEAN_THRESHOLD = 35;
const ASYMMETRY_THRESHOLD = 15;

export function analyzeCurrentPosture(
  features
) {
  if (!features?.valid) {
    return [];
  }

  const errors = [];

  if (
    features.torsoAngle >
    FORWARD_LEAN_THRESHOLD
  ) {
    errors.push("FORWARD_LEAN");
  }

  if (
    features.kneeAngleDifference >
    ASYMMETRY_THRESHOLD
  ) {
    errors.push("KNEE_ANGLE_ASYMMETRY");
  }

  if (
    features.hipAngleDifference >
    ASYMMETRY_THRESHOLD
  ) {
    errors.push("HIP_ANGLE_ASYMMETRY");
  }

  return errors;
}

export function analyzeCompletedRep(
  repStats
) {
  const errors = [];

  if (!repStats) {
    return errors;
  }

  // 충분히 깊게 내려가지 못함
  if (repStats.minKneeAngle > 110) {
    errors.push("DEPTH_INSUFFICIENT");
  }

  if (repStats.maxTorsoAngle > 35) {
    errors.push("FORWARD_LEAN");
  }

  if (repStats.maxKneeDifference > 15) {
    errors.push("KNEE_ANGLE_ASYMMETRY");
  }

  if (errors.length === 0) {
    errors.push("PERFECT");
  }

  return errors;
}