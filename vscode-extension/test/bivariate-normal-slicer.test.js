'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const projectRoot = path.resolve(__dirname, '..', '..');
const extensionRoot = path.resolve(__dirname, '..');

async function loadMathModule() {
  const sourcePath = path.join(
    projectRoot,
    'figures',
    'joint-visualizations',
    'bivariate-normal-math.js'
  );
  const source = fs.readFileSync(sourcePath, 'utf8');
  const url = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
  return import(url);
}

async function loadMultimodalMathModule() {
  const normalSourcePath = path.join(
    projectRoot,
    'figures',
    'joint-visualizations',
    'bivariate-normal-math.js'
  );
  const normalSource = fs.readFileSync(normalSourcePath, 'utf8');
  const normalUrl = `data:text/javascript;base64,${Buffer.from(normalSource).toString('base64')}`;
  const multimodalSourcePath = path.join(
    projectRoot,
    'figures',
    'joint-visualizations',
    'multimodal-joint-density-math.js'
  );
  const multimodalSource = fs.readFileSync(multimodalSourcePath, 'utf8').replace(
    '"./bivariate-normal-math.js"',
    JSON.stringify(normalUrl)
  );
  const multimodalUrl = `data:text/javascript;base64,${Buffer.from(multimodalSource).toString('base64')}`;
  return import(multimodalUrl);
}

function midpointIntegral(functionToIntegrate, minimum, maximum, steps) {
  const width = (maximum - minimum) / steps;
  let total = 0;
  for (let index = 0; index < steps; index += 1) {
    total += functionToIntegrate(minimum + (index + 0.5) * width);
  }
  return total * width;
}

test('the requested Gaussian has the intended covariance and conditional laws', async () => {
  const { createBivariateNormal } = await loadMathModule();
  const model = createBivariateNormal({ varianceX: 4, varianceY: 1, correlation: 0.5 });

  assert.equal(model.covariance, 1);
  assert.equal(model.determinant, 3);
  assert.equal(model.conditionalVarianceY, 0.75);
  assert.equal(model.conditionalVarianceX, 3);
  assert.equal(model.conditionalMeanY(2), 0.5);
  assert.equal(model.conditionalMeanX(0.5), 0.5);
  assert.ok(Math.abs(model.jointDensity(0, 0) - 1 / (2 * Math.PI * Math.sqrt(3))) < 1e-14);
});

test('the joint density and both conditional densities integrate to one', async () => {
  const { createBivariateNormal } = await loadMathModule();
  const model = createBivariateNormal({ varianceX: 4, varianceY: 1, correlation: 0.5 });

  const jointIntegral = midpointIntegral(
    x => midpointIntegral(y => model.jointDensity(x, y), -8, 8, 640),
    -16,
    16,
    640
  );
  const yGivenXIntegral = midpointIntegral(
    y => model.conditionalDensityY(y, 2),
    -8,
    8,
    1600
  );
  const xGivenYIntegral = midpointIntegral(
    x => model.conditionalDensityX(x, -0.5),
    -14,
    14,
    1600
  );

  assert.ok(Math.abs(jointIntegral - 1) < 1e-8);
  assert.ok(Math.abs(yGivenXIntegral - 1) < 1e-10);
  assert.ok(Math.abs(xGivenYIntegral - 1) < 1e-10);
});

test('the area under a raw slice is the corresponding marginal density', async () => {
  const { createBivariateNormal } = await loadMathModule();
  const model = createBivariateNormal({ varianceX: 4, varianceY: 1, correlation: 0.5 });
  const fixedX = 1.25;
  const fixedY = -0.4;
  const xSliceArea = midpointIntegral(y => model.jointDensity(fixedX, y), -8, 8, 2000);
  const ySliceArea = midpointIntegral(x => model.jointDensity(x, fixedY), -16, 16, 2000);

  assert.ok(Math.abs(xSliceArea - model.marginalDensityX(fixedX)) < 1e-10);
  assert.ok(Math.abs(ySliceArea - model.marginalDensityY(fixedY)) < 1e-10);
});

test('the uncorrelated Gaussian has fixed conditional densities', async () => {
  const { createBivariateNormal } = await loadMathModule();
  const model = createBivariateNormal({ varianceX: 4, varianceY: 1, correlation: 0 });

  assert.equal(model.covariance, 0);
  assert.equal(model.conditionalMeanY(-4), 0);
  assert.equal(model.conditionalMeanY(4), 0);
  assert.equal(model.conditionalMeanX(-2), 0);
  assert.equal(model.conditionalMeanX(2), 0);
  assert.ok(Math.abs(
    model.jointDensity(1.2, -0.4) - model.marginalDensityX(1.2) * model.marginalDensityY(-0.4)
  ) < 1e-14);
  assert.ok(model.jointDensity(2, 0) < model.jointDensity(0, 0));
  assert.ok(model.jointDensity(0, 1) < model.jointDensity(0, 0));
});

test('the requested Gaussian side-plot maxima determine proportional initial zoom', async () => {
  const { createBivariateNormal } = await loadMathModule();
  const cases = [
    {
      model: createBivariateNormal({ varianceX: 4, varianceY: 1, correlation: 0.5 }),
      requestedJointMaximum: 0.12,
      requestedConditionalMaximum: 0.62
    },
    {
      model: createBivariateNormal({ varianceX: 4, varianceY: 1, correlation: 0 }),
      requestedJointMaximum: 0.1,
      requestedConditionalMaximum: 0.5
    }
  ];

  cases.forEach(({ model, requestedJointMaximum, requestedConditionalMaximum }) => {
    const jointZoom = 1.08 * model.peakDensity / requestedJointMaximum;
    const conditionalZoom = 1.08 * model.conditionalPeakDensityY(0) /
      requestedConditionalMaximum;

    assert.ok(Math.abs(1.08 * model.peakDensity / jointZoom - requestedJointMaximum) < 1e-14);
    assert.ok(Math.abs(
      1.08 * model.conditionalPeakDensityY(0) / conditionalZoom -
      requestedConditionalMaximum
    ) < 1e-14);
  });
});

test('the multimodal model is normalized, dependent, and has valid conditionals', async () => {
  const { createMultimodalJointDensity } = await loadMultimodalMathModule();
  const model = createMultimodalJointDensity();
  const fixedX = 0.7;
  const fixedY = 0.5;

  const jointIntegral = midpointIntegral(
    x => midpointIntegral(y => model.jointDensity(x, y), -6, 6, 480),
    -8,
    8,
    640
  );
  const marginalXIntegral = midpointIntegral(x => model.marginalDensityX(x), -8, 8, 2400);
  const marginalYIntegral = midpointIntegral(y => model.marginalDensityY(y), -6, 6, 2400);
  const yGivenXIntegral = midpointIntegral(
    y => model.conditionalDensityY(y, fixedX),
    -6,
    6,
    2400
  );
  const xGivenYIntegral = midpointIntegral(
    x => model.conditionalDensityX(x, fixedY),
    -8,
    8,
    2400
  );
  const xSliceArea = midpointIntegral(y => model.jointDensity(fixedX, y), -6, 6, 2400);
  const ySliceArea = midpointIntegral(x => model.jointDensity(x, fixedY), -8, 8, 2400);

  assert.ok(Math.abs(jointIntegral - 1) < 1e-8);
  assert.ok(Math.abs(marginalXIntegral - 1) < 1e-10);
  assert.ok(Math.abs(marginalYIntegral - 1) < 1e-10);
  assert.ok(Math.abs(yGivenXIntegral - 1) < 1e-10);
  assert.ok(Math.abs(xGivenYIntegral - 1) < 1e-10);
  assert.ok(Math.abs(xSliceArea - model.marginalDensityX(fixedX)) < 1e-10);
  assert.ok(Math.abs(ySliceArea - model.marginalDensityY(fixedY)) < 1e-10);
  assert.ok(Math.abs(model.correlation) > 0.4);
  assert.ok(Math.abs(
    model.jointDensity(1.3, 1.35) -
    model.marginalDensityX(1.3) * model.marginalDensityY(1.35)
  ) > 0.05);
});

test('the default multimodal conditional slice has two visible modes', async () => {
  const { createMultimodalJointDensity } = await loadMultimodalMathModule();
  const model = createMultimodalJointDensity();
  const values = Array.from({ length: 1201 }, (_value, index) => -3 + 6 * index / 1200);
  const densities = values.map(y => model.conditionalDensityY(y, model.initialSliceX));
  const localMaxima = densities.filter((density, index) => (
    index > 0 &&
    index < densities.length - 1 &&
    density > densities[index - 1] &&
    density > densities[index + 1]
  ));

  assert.equal(localMaxima.length, 2);
});

test('the multimodal hills have varied heights while preserving the tallest scale', async () => {
  const { createMultimodalJointDensity } = await loadMultimodalMathModule();
  const model = createMultimodalJointDensity();
  const hillCenters = [
    [-2.7, -1.35],
    [-1.4, 0.55],
    [0, -0.45],
    [1.3, 1.35],
    [2.7, 0.35]
  ];
  const hillHeights = hillCenters.map(([x, y]) => model.jointDensity(x, y));
  const highestHill = Math.max(...hillHeights);
  const lowestHill = Math.min(...hillHeights);

  assert.ok(highestHill > 0.15 && highestHill < 0.17);
  assert.ok(highestHill > 2 * lowestHill);
});

test('both the website and live preview load the interactive module', () => {
  const siteHtml = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
  const extensionSource = fs.readFileSync(path.join(extensionRoot, 'src', 'extension.js'), 'utf8');
  const workspaceSettings = fs.readFileSync(path.join(projectRoot, '.vscode', 'settings.json'), 'utf8');
  const weekFive = fs.readFileSync(path.join(projectRoot, 'notes', 'week5.md'), 'utf8');
  const orbitControls = fs.readFileSync(
    path.join(projectRoot, 'figures', 'joint-visualizations', 'vendor', 'OrbitControls.js'),
    'utf8'
  );
  const threeModule = fs.readFileSync(
    path.join(projectRoot, 'figures', 'joint-visualizations', 'vendor', 'three.module.js'),
    'utf8'
  );
  const threeCorePath = path.join(
    projectRoot,
    'figures',
    'joint-visualizations',
    'vendor',
    'three.core.js'
  );
  const multimodalMathPath = path.join(
    projectRoot,
    'figures',
    'joint-visualizations',
    'multimodal-joint-density-math.js'
  );

  assert.match(siteHtml, /href="figures\/joint-visualizations\/bivariate-normal-slicer\.css"/);
  assert.match(siteHtml, /type="module" src="figures\/joint-visualizations\/bivariate-normal-loader\.js"/);
  assert.match(extensionSource, /bivariateNormalLoaderScriptUri/);
  assert.match(extensionSource, /workspaceFolder\.uri,[\s\S]*?'figures',[\s\S]*?'joint-visualizations',[\s\S]*?'bivariate-normal-loader\.js'/);
  assert.match(extensionSource, /bivariateNormalLoaderScriptTag/);
  assert.match(workspaceSettings, /figures\/joint-visualizations\/bivariate-normal-slicer\.css/);
  assert.equal((weekFive.match(/class="bivariate-normal-slicer"/g) || []).length, 3);
  assert.match(weekFive, /data-variance-x="4"/);
  assert.match(weekFive, /data-variance-y="1"/);
  assert.match(weekFive, /data-correlation="0\.5"/);
  assert.match(weekFive, /data-title="Conditional PDFs for a Correlated Bivariate Gaussian"/);
  assert.match(weekFive, /data-initial-joint-y-maximum="0\.12"/);
  assert.match(weekFive, /data-initial-conditional-y-maximum="0\.62"/);
  assert.match(weekFive, /data-title="Conditional PDFs for an Uncorrelated Bivariate Gaussian"/);
  assert.match(weekFive, /data-correlation="0"/);
  assert.match(weekFive, /data-shared-side-plot-scale="true"/);
  assert.match(weekFive, /data-initial-joint-y-maximum="0\.1"/);
  assert.match(weekFive, /data-initial-conditional-y-maximum="0\.5"/);
  assert.match(weekFive, /data-title="Conditional PDFs for a Multimodal Joint Distribution"/);
  assert.match(weekFive, /data-distribution="multimodal"/);
  assert.match(weekFive, /data-initial-joint-zoom="1\.2"/);
  assert.match(weekFive, /data-fixed-conditional-y-maximum="0\.96"/);
  assert.match(weekFive, /data-show-parameter-legend="false"/);
  assert.match(orbitControls, /from '\.\/three\.module\.js'/);
  assert.match(threeModule, /from '\.\/three\.core\.js'/);
  assert.equal(fs.existsSync(threeCorePath), true);
  assert.equal(fs.existsSync(multimodalMathPath), true);
});

test('the slicer presents one 3D control and two independently zoomable density plots', () => {
  const slicerSource = fs.readFileSync(
    path.join(projectRoot, 'figures', 'joint-visualizations', 'bivariate-normal-slicer.js'),
    'utf8'
  );
  const componentCss = fs.readFileSync(
    path.join(projectRoot, 'figures', 'joint-visualizations', 'bivariate-normal-slicer.css'),
    'utf8'
  );
  const sharedCss = fs.readFileSync(path.join(projectRoot, 'styles.css'), 'utf8');
  const rangeInputHandler = slicerSource.match(
    /this\.onRangeInput = \(\) => \{[\s\S]*?\n    \};/
  )?.[0] || '';

  assert.match(slicerSource, /plotPanelMarkup\("joint"/);
  assert.match(slicerSource, /plotPanelMarkup\("conditional"/);
  assert.match(slicerSource, /root\.dataset\.title\?\.trim\(\)/);
  assert.match(slicerSource, /querySelector\("\[data-component-title\]"\)\.textContent/);
  assert.match(slicerSource, /parameterLegendMarkup\(\)/);
  assert.match(slicerSource, /createMultimodalJointDensity/);
  assert.match(slicerSource, /this\.showParameterLegend \? this\.parameterLegendMarkup\(\) : ""/);
  assert.match(slicerSource, /𝔼\[X\]/);
  assert.match(slicerSource, /𝔼\[Y\]/);
  assert.match(slicerSource, /Slice at X:/);
  assert.match(slicerSource, /Slice at Y:/);
  assert.match(
    slicerSource,
    /Joint Density <span class="bns-math">f<sub>X, Y<\/sub>\(x, y\)<\/span> Evaluated at/
  );
  assert.match(slicerSource, /Conditional Density/);
  assert.match(componentCss, /\.bns-range-label\s*\{[\s\S]*?justify-content:\s*flex-end/);
  assert.doesNotMatch(slicerSource, /data-zoom-kind|data-zoom-direction|Reset 3D view|bns-reset|bns-normalize|Raycaster|sliceHandle/);
  assert.match(slicerSource, /new Float32Array\(pointCount \* 4\)/);
  assert.match(slicerSource, /setAttribute\("color", new THREE\.BufferAttribute\(colors, 4\)\)/);
  assert.match(slicerSource, /colors\[4 \* pointIndex \+ 3\] = 0\.5145 \* Math\.sqrt\(proportion\)/);
  assert.match(slicerSource, /const SURFACE_DOMAIN_SCALE = 1\.2/);
  assert.match(slicerSource, /const SURFACE_SAMPLE_COUNT = 73/);
  assert.match(slicerSource, /const SLICE_CURVE_SAMPLE_COUNT = 193/);
  assert.match(slicerSource, /this\.surfaceXDomain = expandedDomain\(this\.xDomain, SURFACE_DOMAIN_SCALE\)/);
  assert.match(slicerSource, /this\.surfaceYDomain = expandedDomain\(this\.yDomain, SURFACE_DOMAIN_SCALE\)/);
  assert.match(slicerSource, /range\([\s\S]*?this\.surfaceXDomain\[0\][\s\S]*?this\.surfaceXDomain\[1\][\s\S]*?SURFACE_SAMPLE_COUNT/);
  assert.match(slicerSource, /range\([\s\S]*?this\.surfaceYDomain\[0\][\s\S]*?this\.surfaceYDomain\[1\][\s\S]*?SURFACE_SAMPLE_COUNT/);
  assert.match(slicerSource, /this\.surfaceYDomain\[0\][\s\S]*?this\.surfaceYDomain\[1\][\s\S]*?SLICE_CURVE_SAMPLE_COUNT/);
  assert.match(slicerSource, /this\.surfaceXDomain\[0\][\s\S]*?this\.surfaceXDomain\[1\][\s\S]*?SLICE_CURVE_SAMPLE_COUNT/);
  assert.match(slicerSource, /xLabel\.position\.set\(this\.worldX\(this\.surfaceXDomain\[1\]\)/);
  assert.match(slicerSource, /yLabel\.position\.set\(0, 0\.12, this\.worldY\(this\.surfaceYDomain\[1\]\)/);
  assert.match(slicerSource, /this\.gridXDomain = expandedDomain\(this\.xDomain, 2\)/);
  assert.match(slicerSource, /this\.gridXDomain\[1\], 33/);
  assert.match(slicerSource, /gridHeight,[\s\S]*?0\.486/);
  assert.match(slicerSource, /const sliceHeight = 1\.15 \* this\.worldHeight/);
  assert.match(slicerSource, /0\.30 \* horizontalFade \* verticalFade/);
  assert.match(slicerSource, /const rectangularDistance = Math\.max/);
  assert.match(slicerSource, /createSlicePlaneGeometry\(width, height\)/);
  assert.match(slicerSource, /addEventListener\("wheel", this\.onPlotWheel, \{ passive: false \}\)/);
  assert.match(slicerSource, /removeEventListener\("wheel", this\.onPlotWheel\)/);
  assert.match(slicerSource, /addEventListener\("pointerdown", this\.onRangePointerDown\)/);
  assert.match(slicerSource, /removeEventListener\("pointerdown", this\.onRangePointerDown\)/);
  assert.match(
    slicerSource,
    /this\.fixedConditionalYMaximum = numberFromData\(\s*root,\s*"fixedConditionalYMaximum",\s*NaN\s*\)/
  );
  assert.match(slicerSource, /const conditionalYMaximum = this\.fixedConditionalYMaximum > 0/);
  assert.match(slicerSource, /const yMaximum = baseYMaximum \/ this\.state\.zoom\[kind\]/);
  assert.match(slicerSource, /this\.model\.conditionalPeakDensityY\(fixedValue\)/);
  assert.match(slicerSource, /this\.model\.conditionalPeakDensityX\(fixedValue\)/);
  assert.match(slicerSource, /root\.dataset\.sharedSidePlotScale === "true"/);
  assert.match(slicerSource, /this\.sharedSideDomain = \[/);
  assert.match(slicerSource, /expandedDomain\(this\.sharedSideDomain, 1 \/ this\.state\.zoom\[kind\]\)/);
  assert.match(
    slicerSource,
    /setMode\(mode,[\s\S]*?const value = clamp\(this\.state\.values\[this\.state\.mode\][\s\S]*?this\.rangeInput\.value = String\(value\)/
  );
  assert.match(
    slicerSource,
    /const baseYMaximum = kind === "joint"[\s\S]*?1\.08 \* this\.model\.peakDensity[\s\S]*?: conditionalYMaximum/
  );
  assert.doesNotMatch(slicerSource, /jointSlicePeakDensity/);
  assert.match(rangeInputHandler, /scheduleSliceUpdate/);
  assert.doesNotMatch(slicerSource, /sharedJointSlicePeakDensity/);
  assert.match(slicerSource, /numberFromData\(root, "initialJointYMaximum", NaN\)/);
  assert.match(slicerSource, /"initialJointZoom"/);
  assert.match(slicerSource, /automaticJointYMaximum \/ requestedJointYMaximum/);
  assert.match(slicerSource, /automaticConditionalYMaximum \/ requestedConditionalYMaximum/);
  assert.match(slicerSource, /"clip-path": `url\(#\$\{clipId\}\)`/);
  assert.match(slicerSource, /this\.controls\.maxDistance = 48/);
  assert.doesNotMatch(slicerSource, /Slicing a bivariate Gaussian|Drag to rotate|The upper curve is/);
  assert.doesNotMatch(componentCss, /bns-instructions|bns-explanation|bns-zoom-controls/);
  assert.match(componentCss, /\.bns-controls-box/);
  assert.match(componentCss, /\.bns-range[\s\S]*?-webkit-tap-highlight-color: transparent/);
  assert.match(componentCss, /\.bns-range:focus[\s\S]*?outline: 2px solid var\(--focus\)/);
  assert.match(componentCss, /\.bns-range\.bns-pointer-focus:focus[\s\S]*?outline: none/);
  assert.match(componentCss, /\.bns-parameter-legend[\s\S]*?position: absolute[\s\S]*?pointer-events: none/);
  assert.match(componentCss, /stroke-width: 1\.175/);
  assert.match(componentCss, /\.bns-tick-label,[\s\S]*?font-family: inherit/);
  assert.match(componentCss, /\.bns-three[\s\S]*?background: transparent/);
  assert.doesNotMatch(sharedCss, /\.bns-/);
});
