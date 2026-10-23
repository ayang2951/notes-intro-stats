const TWO_PI = 2 * Math.PI;

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function positiveNumber(value, fallback) {
  const number = finiteNumber(value, fallback);
  return number > 0 ? number : fallback;
}

export function normalDensity(value, mean, variance) {
  return Math.exp(-((value - mean) ** 2) / (2 * variance)) /
    Math.sqrt(TWO_PI * variance);
}

export function createBivariateNormal(parameters = {}) {
  const meanX = finiteNumber(parameters.meanX, 0);
  const meanY = finiteNumber(parameters.meanY, 0);
  const varianceX = positiveNumber(parameters.varianceX, 4);
  const varianceY = positiveNumber(parameters.varianceY, 1);
  const requestedCorrelation = finiteNumber(parameters.correlation, 0.5);
  const correlation = Math.max(-0.999, Math.min(0.999, requestedCorrelation));
  const standardDeviationX = Math.sqrt(varianceX);
  const standardDeviationY = Math.sqrt(varianceY);
  const covariance = correlation * standardDeviationX * standardDeviationY;
  const determinant = varianceX * varianceY - covariance ** 2;
  const conditionalVarianceY = varianceY * (1 - correlation ** 2);
  const conditionalVarianceX = varianceX * (1 - correlation ** 2);
  const normalizingConstant = 1 / (TWO_PI * Math.sqrt(determinant));

  function jointDensity(x, y) {
    const centeredX = x - meanX;
    const centeredY = y - meanY;
    const quadratic = (
      varianceY * centeredX ** 2 -
      2 * covariance * centeredX * centeredY +
      varianceX * centeredY ** 2
    ) / determinant;
    return normalizingConstant * Math.exp(-quadratic / 2);
  }

  function marginalDensityX(x) {
    return normalDensity(x, meanX, varianceX);
  }

  function marginalDensityY(y) {
    return normalDensity(y, meanY, varianceY);
  }

  function conditionalMeanY(x) {
    return meanY + (covariance / varianceX) * (x - meanX);
  }

  function conditionalMeanX(y) {
    return meanX + (covariance / varianceY) * (y - meanY);
  }

  function conditionalDensityY(y, givenX) {
    return normalDensity(y, conditionalMeanY(givenX), conditionalVarianceY);
  }

  function conditionalDensityX(x, givenY) {
    return normalDensity(x, conditionalMeanX(givenY), conditionalVarianceX);
  }

  function conditionalPeakDensityY() {
    return 1 / Math.sqrt(TWO_PI * conditionalVarianceY);
  }

  function conditionalPeakDensityX() {
    return 1 / Math.sqrt(TWO_PI * conditionalVarianceX);
  }

  return Object.freeze({
    meanX,
    meanY,
    varianceX,
    varianceY,
    standardDeviationX,
    standardDeviationY,
    correlation,
    covariance,
    determinant,
    conditionalVarianceX,
    conditionalVarianceY,
    peakDensity: normalizingConstant,
    jointDensity,
    marginalDensityX,
    marginalDensityY,
    conditionalMeanX,
    conditionalMeanY,
    conditionalDensityX,
    conditionalDensityY,
    conditionalPeakDensityX,
    conditionalPeakDensityY
  });
}
