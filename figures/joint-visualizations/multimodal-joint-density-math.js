import { normalDensity } from "./bivariate-normal-math.js";

const TWO_PI = 2 * Math.PI;
const X_DOMAIN = Object.freeze([-5, 5]);
const Y_DOMAIN = Object.freeze([-3, 3]);

const COMPONENTS = Object.freeze([
  Object.freeze({ weight: 0.12, meanX: -2.7, meanY: -1.35, varianceX: 0.36, varianceY: 0.2025 }),
  Object.freeze({ weight: 0.17, meanX: -1.4, meanY: 0.55, varianceX: 0.4225, varianceY: 0.25 }),
  Object.freeze({ weight: 0.22, meanX: 0, meanY: -0.45, varianceX: 0.81, varianceY: 0.4225 }),
  Object.freeze({ weight: 0.27, meanX: 1.3, meanY: 1.35, varianceX: 0.36, varianceY: 0.2025 }),
  Object.freeze({ weight: 0.22, meanX: 2.7, meanY: 0.35, varianceX: 0.36, varianceY: 0.3025 })
]);

function range(start, end, count) {
  if (count <= 1) return [start];
  return Array.from({ length: count }, (_value, index) =>
    start + (end - start) * index / (count - 1));
}

function normalLogDensity(value, mean, variance) {
  return -0.5 * (Math.log(TWO_PI * variance) + (value - mean) ** 2 / variance);
}

function weightedMean(key) {
  return COMPONENTS.reduce((total, component) => total + component.weight * component[key], 0);
}

function marginalVariance(meanKey, varianceKey, mean) {
  return COMPONENTS.reduce((total, component) => total + component.weight * (
    component[varianceKey] + (component[meanKey] - mean) ** 2
  ), 0);
}

function normalizedWeights(value, meanKey, varianceKey) {
  const logWeights = COMPONENTS.map((component) =>
    Math.log(component.weight) + normalLogDensity(
      value,
      component[meanKey],
      component[varianceKey]
    ));
  const largestLogWeight = Math.max(...logWeights);
  const relativeWeights = logWeights.map((logWeight) => Math.exp(logWeight - largestLogWeight));
  const total = relativeWeights.reduce((sum, weight) => sum + weight, 0);
  return relativeWeights.map((weight) => weight / total);
}

function sampledMaximum(density, domain, count = 481) {
  return range(domain[0], domain[1], count).reduce(
    (maximum, value) => Math.max(maximum, density(value)),
    0
  );
}

export function createMultimodalJointDensity() {
  const meanX = weightedMean("meanX");
  const meanY = weightedMean("meanY");
  const varianceX = marginalVariance("meanX", "varianceX", meanX);
  const varianceY = marginalVariance("meanY", "varianceY", meanY);
  const covariance = COMPONENTS.reduce((total, component) => total + component.weight * (
    (component.meanX - meanX) * (component.meanY - meanY)
  ), 0);
  const standardDeviationX = Math.sqrt(varianceX);
  const standardDeviationY = Math.sqrt(varianceY);
  const correlation = covariance / (standardDeviationX * standardDeviationY);

  function jointDensity(x, y) {
    return COMPONENTS.reduce((total, component) => total + component.weight *
      normalDensity(x, component.meanX, component.varianceX) *
      normalDensity(y, component.meanY, component.varianceY), 0);
  }

  function marginalDensityX(x) {
    return COMPONENTS.reduce((total, component) => total + component.weight *
      normalDensity(x, component.meanX, component.varianceX), 0);
  }

  function marginalDensityY(y) {
    return COMPONENTS.reduce((total, component) => total + component.weight *
      normalDensity(y, component.meanY, component.varianceY), 0);
  }

  function conditionalDensityY(y, givenX) {
    const weights = normalizedWeights(givenX, "meanX", "varianceX");
    return COMPONENTS.reduce((total, component, index) => total + weights[index] *
      normalDensity(y, component.meanY, component.varianceY), 0);
  }

  function conditionalDensityX(x, givenY) {
    const weights = normalizedWeights(givenY, "meanY", "varianceY");
    return COMPONENTS.reduce((total, component, index) => total + weights[index] *
      normalDensity(x, component.meanX, component.varianceX), 0);
  }

  function conditionalPeakDensityY(givenX) {
    return sampledMaximum((y) => conditionalDensityY(y, givenX), Y_DOMAIN);
  }

  function conditionalPeakDensityX(givenY) {
    return sampledMaximum((x) => conditionalDensityX(x, givenY), X_DOMAIN);
  }

  let peakDensity = 0;
  range(X_DOMAIN[0], X_DOMAIN[1], 241).forEach((x) => {
    range(Y_DOMAIN[0], Y_DOMAIN[1], 181).forEach((y) => {
      peakDensity = Math.max(peakDensity, jointDensity(x, y));
    });
  });

  return Object.freeze({
    meanX,
    meanY,
    varianceX,
    varianceY,
    standardDeviationX,
    standardDeviationY,
    correlation,
    covariance,
    peakDensity,
    xDomain: X_DOMAIN,
    yDomain: Y_DOMAIN,
    displayCenterX: 0,
    displayCenterY: 0,
    initialSliceX: 0.7,
    initialSliceY: 0.5,
    jointDensity,
    marginalDensityX,
    marginalDensityY,
    conditionalDensityX,
    conditionalDensityY,
    conditionalPeakDensityX,
    conditionalPeakDensityY
  });
}
