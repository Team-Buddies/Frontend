//이 파일의 목적: 33개 Landmark 중 스쿼트에 필요한 주요 관절만 정리해서 이후 모든 알고리즘에서 같은 데이터를 재사용하기 위함
export const POSE_INDEX = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,

  LEFT_HIP: 23,
  RIGHT_HIP: 24,

  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,

  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,

  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,

  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
};

export function extractSquatLandmarks(landmarks) {
  if (!landmarks || landmarks.length < 33) {
    return null;
  }

  return {
    leftShoulder: landmarks[POSE_INDEX.LEFT_SHOULDER],
    rightShoulder: landmarks[POSE_INDEX.RIGHT_SHOULDER],

    leftHip: landmarks[POSE_INDEX.LEFT_HIP],
    rightHip: landmarks[POSE_INDEX.RIGHT_HIP],

    leftKnee: landmarks[POSE_INDEX.LEFT_KNEE],
    rightKnee: landmarks[POSE_INDEX.RIGHT_KNEE],

    leftAnkle: landmarks[POSE_INDEX.LEFT_ANKLE],
    rightAnkle: landmarks[POSE_INDEX.RIGHT_ANKLE],

    leftHeel: landmarks[POSE_INDEX.LEFT_HEEL],
    rightHeel: landmarks[POSE_INDEX.RIGHT_HEEL],

    leftFootIndex: landmarks[POSE_INDEX.LEFT_FOOT_INDEX],
    rightFootIndex: landmarks[POSE_INDEX.RIGHT_FOOT_INDEX],
  };
}