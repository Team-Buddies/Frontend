// 목적: 3개의 점을 받아 가운데 점의 각도 계산 (관절각 계산)
export function calculateAngle(pointA, pointB, pointC) {
  if (!pointA || !pointB || !pointC) {
    return null;
  }

  const radians =
    Math.atan2(
      pointC.y - pointB.y,
      pointC.x - pointB.x
    ) -
    Math.atan2(
      pointA.y - pointB.y,
      pointA.x - pointB.x
    );

  let angle = Math.abs(
    (radians * 180) / Math.PI
  );

  if (angle > 180) {
    angle = 360 - angle;
  }

  return angle;
}

export function midpoint(pointA, pointB) {
  return {
    x: (pointA.x + pointB.x) / 2,
    y: (pointA.y + pointB.y) / 2,
    z: ((pointA.z ?? 0) + (pointB.z ?? 0)) / 2,
  };
}

export function calculateTorsoAngle(
  shoulderMid,
  hipMid
) {
  if (!shoulderMid || !hipMid) {
    return null;
  }

  const dx = shoulderMid.x - hipMid.x;
  const dy = shoulderMid.y - hipMid.y;

  // 수직선 대비 상체가 얼마나 기울었는지 계산
  const angle =
    Math.atan2(Math.abs(dx), Math.abs(dy)) *
    (180 / Math.PI);

  return angle;
}