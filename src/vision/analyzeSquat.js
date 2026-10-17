// 목적: 모든 기능 통합
import { calculateSquatFeatures }
  from "./squatFeatures";

import {
  determineSquatPhase,
  SQUAT_PHASE,
} from "./squatPhase";

import { createSquatCounter }
  from "./squatCounter";

import {
  analyzeCurrentPosture,
  analyzeCompletedRep,
} from "./squatAnalyzer";

export function createSquatAnalyzer() {
  let previousFeatures = null;

  let currentPhase = SQUAT_PHASE.STANDING;

  const counter = createSquatCounter();

  let repStats = createEmptyRepStats();

  let previousCount = 0;

  function analyze(landmarks) {
    const features =
      calculateSquatFeatures(landmarks);

    if (!features.valid) {
      return {
        valid: false,
        reason: features.reason,
        count: counter.getCount(),
      };
    }

    if (previousFeatures) {
      currentPhase = determineSquatPhase(
        features,
        previousFeatures,
        currentPhase
      );
    }

    const currentErrors =
      analyzeCurrentPosture(features);

    updateRepStats(repStats, features);

    const count =
      counter.update(currentPhase);

    let completedRep = null;

    // 횟수가 증가했다면 방금 하나의 Rep 완료
    if (count > previousCount) {
      completedRep = {
        repNumber: count,

        stats: {
          ...repStats,
        },

        errors:
          analyzeCompletedRep(repStats),
      };

      repStats = createEmptyRepStats();

      previousCount = count;
    }

    previousFeatures = features;

    return {
      valid: true,

      features,

      phase: currentPhase,

      count,

      currentErrors,

      completedRep,
    };
  }

  function reset() {
    previousFeatures = null;

    currentPhase =
      SQUAT_PHASE.STANDING;

    counter.reset();

    repStats =
      createEmptyRepStats();

    previousCount = 0;
  }

  return {
    analyze,
    reset,
  };
}

function createEmptyRepStats() {
  return {
    minKneeAngle: Infinity,
    maxTorsoAngle: 0,
    maxKneeDifference: 0,
  };
}

function updateRepStats(
  repStats,
  features
) {
  repStats.minKneeAngle =
    Math.min(
      repStats.minKneeAngle,
      features.averageKneeAngle
    );

  repStats.maxTorsoAngle =
    Math.max(
      repStats.maxTorsoAngle,
      features.torsoAngle
    );

  repStats.maxKneeDifference =
    Math.max(
      repStats.maxKneeDifference,
      features.kneeAngleDifference
    );
}