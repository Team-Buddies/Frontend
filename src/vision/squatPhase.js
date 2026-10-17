// 목적: 스쿼트 단계 판별
export const SQUAT_PHASE = {
  STANDING: "STANDING",
  DESCENDING: "DESCENDING",
  BOTTOM: "BOTTOM",
  ASCENDING: "ASCENDING",
};

const STANDING_ANGLE = 160;
const BOTTOM_ANGLE = 100;
const MOVEMENT_THRESHOLD = 1.5;

export function determineSquatPhase(
  currentFeatures,
  previousFeatures,
  previousPhase = SQUAT_PHASE.STANDING
) {
  if (
    !currentFeatures?.valid ||
    !previousFeatures?.valid
  ) {
    return previousPhase;
  }

  const currentAngle =
    currentFeatures.averageKneeAngle;

  const previousAngle =
    previousFeatures.averageKneeAngle;

  const difference =
    currentAngle - previousAngle;

  // 거의 다 펴진 상태
  if (currentAngle >= STANDING_ANGLE) {
    return SQUAT_PHASE.STANDING;
  }

  // 충분히 내려간 상태
  if (currentAngle <= BOTTOM_ANGLE) {
    return SQUAT_PHASE.BOTTOM;
  }

  // 무릎 각도가 감소 = 내려가는 중
  if (difference < -MOVEMENT_THRESHOLD) {
    return SQUAT_PHASE.DESCENDING;
  }

  // 무릎 각도가 증가 = 올라오는 중
  if (difference > MOVEMENT_THRESHOLD) {
    return SQUAT_PHASE.ASCENDING;
  }

  return previousPhase;
}