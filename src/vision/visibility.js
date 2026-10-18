// 목적: 주요 관절 visibility 확인, 특정 기준보다 낮으면 해당 프레임 분석하지 않도록 할 수 있음
const DEFAULT_VISIBILITY_THRESHOLD = 0.5;

export function isLandmarkVisible(
  landmark,
  threshold = DEFAULT_VISIBILITY_THRESHOLD
) {
  if (!landmark) {
    return false;
  }

  if (landmark.visibility === undefined) {
    return true;
  }

  return landmark.visibility >= threshold;
}

export function areSquatLandmarksVisible(
  points,
  threshold = DEFAULT_VISIBILITY_THRESHOLD
) {
  if (!points) {
    return false;
  }

  const requiredLandmarks = [
    points.leftShoulder,
    points.rightShoulder,

    points.leftHip,
    points.rightHip,

    points.leftKnee,
    points.rightKnee,

    points.leftAnkle,
    points.rightAnkle,
  ];

  return requiredLandmarks.every((landmark) =>
    isLandmarkVisible(landmark, threshold)
  );
}