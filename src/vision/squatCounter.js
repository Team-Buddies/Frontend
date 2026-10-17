// 목적: 반복 횟수 계산
// BOTTOM 도달 -> 다시 STANDING 복귀 -> 1회 인정
import { SQUAT_PHASE } from "./squatPhase";

export function createSquatCounter() {
  let count = 0;

  let reachedBottom = false;

  function update(phase) {
    if (phase === SQUAT_PHASE.BOTTOM) {
      reachedBottom = true;
    }

    if (
      reachedBottom &&
      phase === SQUAT_PHASE.STANDING
    ) {
      count += 1;

      reachedBottom = false;
    }

    return count;
  }

  function getCount() {
    return count;
  }

  function reset() {
    count = 0;
    reachedBottom = false;
  }

  return {
    update,
    getCount,
    reset,
  };
}