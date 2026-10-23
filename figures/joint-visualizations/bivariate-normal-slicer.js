import * as THREE from "./vendor/three.module.js";
import { OrbitControls } from "./vendor/OrbitControls.js";
import { createBivariateNormal } from "./bivariate-normal-math.js";
import { createMultimodalJointDensity } from "./multimodal-joint-density-math.js";

const SELECTOR = ".bivariate-normal-slicer";
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const MIN_PLOT_ZOOM = 0.5;
const MAX_PLOT_ZOOM = 4;
const instances = new Map();
const savedStates = new Map();
let instanceCounter = 0;
let reconciliationQueued = false;

function numberFromData(element, name, fallback) {
  const value = Number(element.dataset[name]);
  return Number.isFinite(value) ? value : fallback;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function formatNumber(value, digits = 2) {
  const rounded = Math.abs(value) < 0.5 * 10 ** (-digits) ? 0 : value;
  return rounded.toFixed(digits);
}

function range(start, end, count) {
  if (count <= 1) return [start];
  return Array.from({ length: count }, (_value, index) =>
    start + (end - start) * index / (count - 1));
}

function expandedDomain(domain, factor) {
  const center = (domain[0] + domain[1]) / 2;
  const halfWidth = (domain[1] - domain[0]) * factor / 2;
  return [center - halfWidth, center + halfWidth];
}

function svgElement(name, attributes = {}, text = "") {
  const element = document.createElementNS(SVG_NAMESPACE, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  if (text) element.textContent = text;
  return element;
}

function colorValue(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function savedStateFor(key, defaultValues, defaultZoom) {
  return savedStates.get(key) || {
    mode: "x",
    values: { ...defaultValues },
    zoom: { ...defaultZoom }
  };
}

function finiteStateValue(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

class BivariateNormalSlicer {
  constructor(root) {
    this.root = root;
    this.distribution = root.dataset.distribution === "multimodal" ? "multimodal" : "gaussian";
    this.displayTitle = root.dataset.title?.trim() || "Interactive joint density";
    this.instanceKey = root.dataset.instanceId || `bivariate-normal-${++instanceCounter}`;
    this.showParameterLegend = root.dataset.showParameterLegend !== "false";
    this.model = this.distribution === "multimodal"
      ? createMultimodalJointDensity()
      : createBivariateNormal({
          meanX: numberFromData(root, "meanX", 0),
          meanY: numberFromData(root, "meanY", 0),
          varianceX: numberFromData(root, "varianceX", 4),
          varianceY: numberFromData(root, "varianceY", 1),
          correlation: numberFromData(root, "correlation", 0.5)
        });
    this.domId = `bns-${++instanceCounter}`;
    this.xDomain = this.model.xDomain || [
      this.model.meanX - 3 * this.model.standardDeviationX,
      this.model.meanX + 3 * this.model.standardDeviationX
    ];
    this.yDomain = this.model.yDomain || [
      this.model.meanY - 3 * this.model.standardDeviationY,
      this.model.meanY + 3 * this.model.standardDeviationY
    ];
    this.displayCenterX = finiteStateValue(this.model.displayCenterX, this.model.meanX);
    this.displayCenterY = finiteStateValue(this.model.displayCenterY, this.model.meanY);
    this.gridXDomain = expandedDomain(this.xDomain, 2);
    this.gridYDomain = expandedDomain(this.yDomain, 2);
    this.worldDepthScale = (this.xDomain[1] - this.xDomain[0]) /
      (this.yDomain[1] - this.yDomain[0]) * 0.8;
    this.worldHeight = 4.8;
    this.heightScale = this.worldHeight / (this.model.peakDensity * 1.08);
    const initialSliceX = finiteStateValue(this.model.initialSliceX, this.model.meanX);
    const initialSliceY = finiteStateValue(this.model.initialSliceY, this.model.meanY);
    const requestedJointYMaximum = numberFromData(root, "initialJointYMaximum", NaN);
    const requestedConditionalYMaximum = numberFromData(
      root,
      "initialConditionalYMaximum",
      NaN
    );
    const automaticJointYMaximum = 1.08 * this.model.peakDensity;
    const automaticConditionalYMaximum = 1.08 *
      this.model.conditionalPeakDensityY(initialSliceX);
    const defaultZoom = {
      joint: numberFromData(
        root,
        "initialJointZoom",
        requestedJointYMaximum > 0
          ? automaticJointYMaximum / requestedJointYMaximum
          : 1
      ),
      conditional: requestedConditionalYMaximum > 0
        ? automaticConditionalYMaximum / requestedConditionalYMaximum
        : 1
    };
    this.state = savedStateFor(
      this.instanceKey,
      { x: initialSliceX, y: initialSliceY },
      defaultZoom
    );
    this.state.values = {
      x: clamp(finiteStateValue(this.state.values?.x, initialSliceX), ...this.xDomain),
      y: clamp(finiteStateValue(this.state.values?.y, initialSliceY), ...this.yDomain)
    };
    this.state.mode = this.state.mode === "y" ? "y" : "x";
    this.state.zoom = {
      joint: clamp(Number(this.state.zoom?.joint) || 1, MIN_PLOT_ZOOM, MAX_PLOT_ZOOM),
      conditional: clamp(
        Number(this.state.zoom?.conditional) || 1,
        MIN_PLOT_ZOOM,
        MAX_PLOT_ZOOM
      )
    };
    this.destroyed = false;
    this.pendingFrame = 0;

    this.buildMarkup();
    this.bindControls();
    this.initializeThreeDimensionalPlot();
    this.setMode(this.state.mode, false);
    this.resizeObserver = new ResizeObserver(() => {
      this.resizeThreeDimensionalPlot();
      this.drawSidePlots();
    });
    this.resizeObserver.observe(this.root);
  }

  buildMarkup() {
    this.root.dataset.initialized = "true";
    this.root.innerHTML = `
      <section class="bns-shell" aria-labelledby="${this.domId}-title">
        <div class="bns-heading">
          <div class="bns-title" id="${this.domId}-title" data-component-title role="heading" aria-level="4"></div>
        </div>
        <div class="bns-controls-box">
          <div class="bns-controls" aria-label="Slice controls">
            <div class="bns-mode" role="group" aria-label="Choose which variable to fix">
              <button type="button" data-mode="x" aria-pressed="true">Fix X</button>
              <button type="button" data-mode="y" aria-pressed="false">Fix Y</button>
            </div>
            <label class="bns-range-label" for="${this.domId}-range">
              <span data-range-name>Slice at X</span>
              <output for="${this.domId}-range" data-range-output>0.00</output>
            </label>
            <input class="bns-range" id="${this.domId}-range" type="range" step="0.05" value="0" />
          </div>
        </div>
        <div class="bns-layout">
          <div class="bns-three-panel">
            <div class="bns-three" role="img" aria-label="Rotatable three-dimensional joint density with a movable gray slicing plane"></div>
            ${this.showParameterLegend ? this.parameterLegendMarkup() : ""}
          </div>
          <div class="bns-side-stack">
            ${this.plotPanelMarkup("joint")}
            ${this.plotPanelMarkup("conditional")}
          </div>
        </div>
        <span class="bns-live" aria-live="polite"></span>
      </section>`;

    this.root.querySelector("[data-component-title]").textContent = this.displayTitle;
    this.stage = this.root.querySelector(".bns-three");
    this.rangeInput = this.root.querySelector(".bns-range");
    this.rangeName = this.root.querySelector("[data-range-name]");
    this.rangeOutput = this.root.querySelector("[data-range-output]");
    this.liveRegion = this.root.querySelector(".bns-live");
    this.modeButtons = Array.from(this.root.querySelectorAll("[data-mode]"));
    this.plots = {
      joint: {
        title: this.root.querySelector('[data-plot-title="joint"]'),
        svg: this.root.querySelector('[data-plot="joint"]')
      },
      conditional: {
        title: this.root.querySelector('[data-plot-title="conditional"]'),
        svg: this.root.querySelector('[data-plot="conditional"]')
      }
    };
  }

  plotPanelMarkup(kind) {
    return `
      <section class="bns-side-panel">
        <div class="bns-side-heading">
          <div class="bns-side-title" data-plot-title="${kind}"></div>
        </div>
        <svg class="bns-side-plot" data-plot="${kind}" viewBox="0 0 380 238" role="img"
             aria-labelledby="${this.domId}-${kind}-title" aria-describedby="${this.domId}-${kind}-description"></svg>
      </section>`;
  }

  parameterLegendMarkup() {
    return `
      <div class="bns-parameter-legend" aria-label="Bivariate Gaussian parameters">
        <span><span class="bns-math">𝔼[X]</span> = ${formatNumber(this.model.meanX)}</span>
        <span><span class="bns-math">𝔼[Y]</span> = ${formatNumber(this.model.meanY)}</span>
        <span><span class="bns-math">Var(X)</span> = ${formatNumber(this.model.varianceX)}</span>
        <span><span class="bns-math">Var(Y)</span> = ${formatNumber(this.model.varianceY)}</span>
        <span><span class="bns-math">ρ</span> = ${formatNumber(this.model.correlation)}</span>
      </div>`;
  }

  bindControls() {
    this.onModeClick = (event) => this.setMode(event.currentTarget.dataset.mode, true);
    this.modeButtons.forEach((button) => button.addEventListener("click", this.onModeClick));

    this.onRangeInput = () => {
      this.state.values[this.state.mode] = Number(this.rangeInput.value);
      this.rangeOutput.value = formatNumber(this.state.values[this.state.mode]);
      this.scheduleSliceUpdate(false);
    };
    this.onRangeChange = () => this.announceSelection();
    this.onRangePointerDown = () => this.rangeInput.classList.add("bns-pointer-focus");
    this.onRangeKeyDown = () => this.rangeInput.classList.remove("bns-pointer-focus");
    this.onRangeBlur = () => this.rangeInput.classList.remove("bns-pointer-focus");
    this.rangeInput.addEventListener("input", this.onRangeInput);
    this.rangeInput.addEventListener("change", this.onRangeChange);
    this.rangeInput.addEventListener("pointerdown", this.onRangePointerDown);
    this.rangeInput.addEventListener("keydown", this.onRangeKeyDown);
    this.rangeInput.addEventListener("blur", this.onRangeBlur);

    this.onPlotWheel = (event) => {
      const kind = event.currentTarget.dataset.plot;
      if (!(kind in this.plots) || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const scale = event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? event.currentTarget.clientHeight
          : 1;
      const delta = event.deltaY * scale;
      if (!delta) return;
      const multiplier = Math.exp(-clamp(delta, -100, 100) * 0.003);
      const nextZoom = clamp(
        this.state.zoom[kind] * multiplier,
        MIN_PLOT_ZOOM,
        MAX_PLOT_ZOOM
      );
      if (Math.abs(nextZoom - this.state.zoom[kind]) < 0.001) return;
      event.preventDefault();
      this.state.zoom[kind] = nextZoom;
      this.drawSidePlot(kind);
      this.saveState();
    };
    Object.values(this.plots).forEach((plot) =>
      plot.svg.addEventListener("wheel", this.onPlotWheel, { passive: false }));
  }

  initializeThreeDimensionalPlot() {
    try {
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.domElement.setAttribute("aria-hidden", "true");
      this.stage.replaceChildren(this.renderer.domElement);

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = false;
      this.controls.enablePan = false;
      this.controls.minDistance = 7;
      this.controls.maxDistance = 48;
      this.controls.maxPolarAngle = Math.PI * 0.49;
      this.controls.addEventListener("change", () => this.renderThreeDimensionalPlot());
      this.controls.addEventListener("end", () => this.saveState());

      this.scene.add(new THREE.HemisphereLight(0xffffff, 0x667080, 1.8));
      const directionalLight = new THREE.DirectionalLight(0xffffff, 2.6);
      directionalLight.position.set(7, 10, 9);
      this.scene.add(directionalLight);

      this.createSurface();
      this.createGroundGrid();
      this.createSliceObjects();
      this.createAxisLabels();
      this.restoreCamera();
      this.applyTheme();
      this.resizeThreeDimensionalPlot();
    } catch (error) {
      console.error("The joint-density 3D plot could not start.", error);
      this.stage.innerHTML = '<p class="bns-fallback">The 3D view is unavailable in this browser. The two density plots still work.</p>';
      this.renderer = undefined;
    }
  }

  createSurface() {
    const xValues = range(this.xDomain[0], this.xDomain[1], 61);
    const yValues = range(this.yDomain[0], this.yDomain[1], 61);
    const pointCount = xValues.length * yValues.length;
    const positions = new Float32Array(pointCount * 3);
    const colors = new Float32Array(pointCount * 4);
    const indices = [];

    xValues.forEach((x, xIndex) => {
      yValues.forEach((y, yIndex) => {
        const pointIndex = xIndex * yValues.length + yIndex;
        const density = this.model.jointDensity(x, y);
        const proportion = clamp(density / this.model.peakDensity, 0, 1);
        positions[3 * pointIndex] = this.worldX(x);
        positions[3 * pointIndex + 1] = this.worldDensity(density);
        positions[3 * pointIndex + 2] = this.worldY(y);
        colors[4 * pointIndex] = 1;
        colors[4 * pointIndex + 1] = 1;
        colors[4 * pointIndex + 2] = 1;
        colors[4 * pointIndex + 3] = 0.5145 * Math.sqrt(proportion);
      });
    });

    for (let xIndex = 0; xIndex < xValues.length - 1; xIndex += 1) {
      for (let yIndex = 0; yIndex < yValues.length - 1; yIndex += 1) {
        const first = xIndex * yValues.length + yIndex;
        const second = (xIndex + 1) * yValues.length + yIndex;
        const fourth = first + 1;
        const third = second + 1;
        indices.push(first, fourth, second, second, fourth, third);
      }
    }

    this.surfaceGeometry = new THREE.BufferGeometry();
    this.surfaceGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.surfaceGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 4));
    this.surfaceGeometry.setIndex(indices);
    this.surfaceGeometry.computeVertexNormals();
    this.surfaceMaterial = new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      shininess: 42
    });
    this.surface = new THREE.Mesh(this.surfaceGeometry, this.surfaceMaterial);
    this.surface.renderOrder = 1;
    this.scene.add(this.surface);
  }

  createGroundGrid() {
    const positions = [];
    const colors = [];
    const gridHeight = -0.015;
    const lineSegments = 48;
    range(this.gridXDomain[0], this.gridXDomain[1], 33).forEach((x) => {
      const yValues = range(this.gridYDomain[0], this.gridYDomain[1], lineSegments + 1);
      for (let index = 0; index < lineSegments; index += 1) {
        this.appendGroundSegment(
          positions,
          colors,
          x,
          yValues[index],
          x,
          yValues[index + 1],
          gridHeight,
          0.486
        );
      }
    });
    range(this.gridYDomain[0], this.gridYDomain[1], 33).forEach((y) => {
      const xValues = range(this.gridXDomain[0], this.gridXDomain[1], lineSegments + 1);
      for (let index = 0; index < lineSegments; index += 1) {
        this.appendGroundSegment(
          positions,
          colors,
          xValues[index],
          y,
          xValues[index + 1],
          y,
          gridHeight,
          0.486
        );
      }
    });
    this.gridMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 1,
      depthWrite: false
    });
    const gridGeometry = new THREE.BufferGeometry();
    gridGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    gridGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 4));
    this.grid = new THREE.LineSegments(gridGeometry, this.gridMaterial);
    this.scene.add(this.grid);

    const axisPositions = [];
    const axisColors = [];
    const axisXValues = range(this.gridXDomain[0], this.gridXDomain[1], lineSegments + 1);
    const axisYValues = range(this.gridYDomain[0], this.gridYDomain[1], lineSegments + 1);
    for (let index = 0; index < lineSegments; index += 1) {
      this.appendGroundSegment(
        axisPositions,
        axisColors,
        axisXValues[index],
        this.displayCenterY,
        axisXValues[index + 1],
        this.displayCenterY,
        0.01,
        0.82
      );
      this.appendGroundSegment(
        axisPositions,
        axisColors,
        this.displayCenterX,
        axisYValues[index],
        this.displayCenterX,
        axisYValues[index + 1],
        0.01,
        0.82
      );
    }
    this.axisMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 1,
      depthWrite: false
    });
    const axisGeometry = new THREE.BufferGeometry();
    axisGeometry.setAttribute("position", new THREE.Float32BufferAttribute(axisPositions, 3));
    axisGeometry.setAttribute("color", new THREE.Float32BufferAttribute(axisColors, 4));
    this.axes = new THREE.LineSegments(axisGeometry, this.axisMaterial);
    this.scene.add(this.axes);
  }

  groundFade(x, y) {
    const centerX = (this.gridXDomain[0] + this.gridXDomain[1]) / 2;
    const centerY = (this.gridYDomain[0] + this.gridYDomain[1]) / 2;
    const halfWidth = (this.gridXDomain[1] - this.gridXDomain[0]) / 2;
    const halfDepth = (this.gridYDomain[1] - this.gridYDomain[0]) / 2;
    const rectangularDistance = Math.max(
      Math.abs((x - centerX) / halfWidth),
      Math.abs((y - centerY) / halfDepth)
    );
    return clamp((1 - rectangularDistance) / 0.55, 0, 1);
  }

  appendGroundSegment(positions, colors, x1, y1, x2, y2, height, maximumAlpha) {
    [[x1, y1], [x2, y2]].forEach(([x, y]) => {
      positions.push(this.worldX(x), height, this.worldY(y));
      colors.push(1, 1, 1, maximumAlpha * this.groundFade(x, y));
    });
  }

  createSliceObjects() {
    const width = this.worldX(this.gridXDomain[1]) - this.worldX(this.gridXDomain[0]);
    const depth = this.worldY(this.gridYDomain[1]) - this.worldY(this.gridYDomain[0]);
    const sliceHeight = 1.15 * this.worldHeight;
    this.sliceMaterial = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      depthWrite: false
    });
    this.slicePlaneX = new THREE.Mesh(
      this.createSlicePlaneGeometry(depth, sliceHeight),
      this.sliceMaterial
    );
    this.slicePlaneX.rotation.y = Math.PI / 2;
    this.slicePlaneX.position.y = sliceHeight / 2;
    this.slicePlaneX.renderOrder = 2;
    this.scene.add(this.slicePlaneX);

    this.slicePlaneY = new THREE.Mesh(
      this.createSlicePlaneGeometry(width, sliceHeight),
      this.sliceMaterial
    );
    this.slicePlaneY.position.y = sliceHeight / 2;
    this.slicePlaneY.renderOrder = 2;
    this.scene.add(this.slicePlaneY);

    this.sliceLineMaterial = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.92 });
    this.sliceCurve = new THREE.Line(new THREE.BufferGeometry(), this.sliceLineMaterial);
    this.sliceCurve.renderOrder = 4;
    this.scene.add(this.sliceCurve);
  }

  createSlicePlaneGeometry(width, height) {
    const geometry = new THREE.PlaneGeometry(width, height, 32, 18);
    const positions = geometry.getAttribute("position");
    const colors = new Float32Array(positions.count * 4);
    for (let index = 0; index < positions.count; index += 1) {
      const horizontalPosition = Math.abs(positions.getX(index)) / (width / 2);
      const verticalPosition = clamp((positions.getY(index) + height / 2) / height, 0, 1);
      const horizontalFade = clamp(1 - horizontalPosition, 0, 1);
      const verticalFade = 1 - 0.68 * verticalPosition;
      colors[4 * index] = 1;
      colors[4 * index + 1] = 1;
      colors[4 * index + 2] = 1;
      colors[4 * index + 3] = 0.30 * horizontalFade * verticalFade;
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 4));
    return geometry;
  }

  createAxisLabels() {
    this.labelGroup = new THREE.Group();
    this.scene.add(this.labelGroup);
    this.rebuildAxisLabels();
  }

  rebuildAxisLabels() {
    if (!this.labelGroup) return;
    this.labelGroup.children.forEach((label) => {
      label.material.map.dispose();
      label.material.dispose();
    });
    this.labelGroup.clear();
    const xLabel = this.createTextSprite("x");
    xLabel.position.set(this.worldX(this.xDomain[1]) + 0.45, 0.12, 0);
    const yLabel = this.createTextSprite("y");
    yLabel.position.set(0, 0.12, this.worldY(this.yDomain[1]) + 0.35);
    this.labelGroup.add(xLabel, yLabel);
  }

  createTextSprite(text) {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 96;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = colorValue("--ink", "#1b1b1b");
    context.font = `italic 54px ${getComputedStyle(this.root).fontFamily}`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.premultiplyAlpha = true;
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.05,
      depthWrite: false,
      depthTest: false,
      toneMapped: false
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.82, 0.62, 1);
    return sprite;
  }

  setMode(mode, announce = true) {
    this.state.mode = mode === "y" ? "y" : "x";
    const domain = this.state.mode === "x" ? this.xDomain : this.yDomain;
    const value = clamp(this.state.values[this.state.mode], domain[0], domain[1]);
    this.state.values[this.state.mode] = value;
    this.root.dataset.sliceMode = this.state.mode;
    this.modeButtons.forEach((button) =>
      button.setAttribute("aria-pressed", String(button.dataset.mode === this.state.mode)));
    this.rangeInput.min = String(domain[0]);
    this.rangeInput.max = String(domain[1]);
    this.rangeInput.value = String(value);
    this.rangeName.textContent = this.state.mode === "x" ? "Slice at X" : "Slice at Y";
    this.rangeOutput.value = formatNumber(value);
    this.updateSlice();
    if (announce) this.announceSelection();
    this.saveState();
  }

  scheduleSliceUpdate(announce) {
    if (this.pendingFrame) cancelAnimationFrame(this.pendingFrame);
    this.pendingFrame = requestAnimationFrame(() => {
      this.pendingFrame = 0;
      this.updateSlice();
      if (announce) this.announceSelection();
      this.saveState();
    });
  }

  updateSlice() {
    const mode = this.state.mode;
    const value = this.state.values[mode];
    if (this.renderer) {
      this.slicePlaneX.visible = mode === "x";
      this.slicePlaneY.visible = mode === "y";
      let curvePoints;

      if (mode === "x") {
        const worldValue = this.worldX(value);
        this.slicePlaneX.position.x = worldValue;
        curvePoints = range(this.yDomain[0], this.yDomain[1], 161).map((y) =>
          new THREE.Vector3(
            worldValue,
            this.worldDensity(this.model.jointDensity(value, y)),
            this.worldY(y)
          ));
      } else {
        const worldValue = this.worldY(value);
        this.slicePlaneY.position.z = worldValue;
        curvePoints = range(this.xDomain[0], this.xDomain[1], 161).map((x) =>
          new THREE.Vector3(
            this.worldX(x),
            this.worldDensity(this.model.jointDensity(x, value)),
            worldValue
          ));
      }

      this.replaceLineGeometry(this.sliceCurve, curvePoints);
      this.renderThreeDimensionalPlot();
    }
    this.drawSidePlots();
  }

  replaceLineGeometry(line, points) {
    const previousGeometry = line.geometry;
    line.geometry = new THREE.BufferGeometry().setFromPoints(points);
    previousGeometry.dispose();
  }

  drawSidePlots() {
    this.drawSidePlot("joint");
    this.drawSidePlot("conditional");
  }

  drawSidePlot(kind) {
    const plot = this.plots[kind];
    if (!plot?.svg) return;
    const svg = plot.svg;
    svg.replaceChildren();
    const width = 380;
    const height = 238;
    const margin = { top: 12, right: 16, bottom: 43, left: 58 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const mode = this.state.mode;
    const fixedValue = this.state.values[mode];
    const varyingVariable = mode === "x" ? "Y" : "X";
    const fixedVariable = mode === "x" ? "X" : "Y";
    const unconditionalMean = mode === "x" ? this.model.meanY : this.model.meanX;
    const baseStandardDeviation = mode === "x"
      ? this.model.standardDeviationY
      : this.model.standardDeviationX;
    const halfWidth = 3 * baseStandardDeviation / this.state.zoom[kind];
    const domain = [unconditionalMean - halfWidth, unconditionalMean + halfWidth];
    const values = range(domain[0], domain[1], 201);
    const density = mode === "x"
      ? kind === "joint"
        ? (coordinate) => this.model.jointDensity(fixedValue, coordinate)
        : (coordinate) => this.model.conditionalDensityY(coordinate, fixedValue)
      : kind === "joint"
        ? (coordinate) => this.model.jointDensity(coordinate, fixedValue)
        : (coordinate) => this.model.conditionalDensityX(coordinate, fixedValue);
    const points = values.map((coordinate) => [coordinate, density(coordinate)]);
    const baseYMaximum = kind === "joint"
      ? 1.08 * this.model.peakDensity
      : 1.08 * (mode === "x"
          ? this.model.conditionalPeakDensityY(fixedValue)
          : this.model.conditionalPeakDensityX(fixedValue));
    const yMaximum = baseYMaximum / this.state.zoom[kind];
    const xScale = (value) => margin.left +
      (value - domain[0]) / (domain[1] - domain[0]) * plotWidth;
    const yScale = (value) => margin.top + plotHeight - value / yMaximum * plotHeight;
    const accessibleTitle = kind === "joint"
      ? `Joint Density f X comma Y of x comma y at ${fixedVariable} equals ${formatNumber(fixedValue)}`
      : `Conditional Density f of ${varyingVariable} given ${fixedVariable} equals ${formatNumber(fixedValue)}`;

    const clipId = `${this.domId}-${kind}-clip`;
    const definitions = svgElement("defs");
    const clipPath = svgElement("clipPath", { id: clipId });
    clipPath.appendChild(svgElement("rect", {
      x: margin.left,
      y: margin.top,
      width: plotWidth,
      height: plotHeight
    }));
    definitions.appendChild(clipPath);

    svg.append(
      svgElement("title", { id: `${this.domId}-${kind}-title` }, accessibleTitle),
      svgElement(
        "desc",
        { id: `${this.domId}-${kind}-description` },
        `${kind === "joint" ? "Unscaled joint-density slice" : "Conditional density"} with ${fixedVariable} fixed at ${formatNumber(fixedValue)}.`
      ),
      definitions
    );
    svg.appendChild(svgElement("rect", {
      class: "bns-chart-frame",
      x: margin.left,
      y: margin.top,
      width: plotWidth,
      height: plotHeight
    }));

    range(domain[0], domain[1], 5).forEach((tick) => {
      const x = xScale(tick);
      svg.appendChild(svgElement("line", {
        class: "bns-grid-line",
        x1: x,
        x2: x,
        y1: margin.top,
        y2: margin.top + plotHeight
      }));
      svg.appendChild(svgElement("text", {
        class: "bns-tick-label",
        x,
        y: margin.top + plotHeight + 19,
        "text-anchor": "middle"
      }, formatNumber(tick, this.state.zoom[kind] >= 3 ? 2 : 1)));
    });

    range(0, yMaximum, 4).forEach((tick) => {
      const y = yScale(tick);
      svg.appendChild(svgElement("line", {
        class: "bns-grid-line",
        x1: margin.left,
        x2: margin.left + plotWidth,
        y1: y,
        y2: y
      }));
      svg.appendChild(svgElement("text", {
        class: "bns-tick-label",
        x: margin.left - 8,
        y: y + 4,
        "text-anchor": "end"
      }, tick.toFixed(2)));
    });

    const linePath = points.map(([coordinate, densityValue], index) =>
      `${index ? "L" : "M"}${xScale(coordinate).toFixed(2)},${yScale(densityValue).toFixed(2)}`).join(" ");
    const areaPath = `${linePath} L${xScale(domain[1]).toFixed(2)},${yScale(0).toFixed(2)} ` +
      `L${xScale(domain[0]).toFixed(2)},${yScale(0).toFixed(2)} Z`;
    svg.appendChild(svgElement("path", {
      class: "bns-density-area",
      d: areaPath,
      "clip-path": `url(#${clipId})`
    }));
    svg.appendChild(svgElement("path", {
      class: "bns-density-line",
      d: linePath,
      "clip-path": `url(#${clipId})`
    }));
    svg.appendChild(svgElement("text", {
      class: "bns-axis-title",
      x: margin.left + plotWidth / 2,
      y: height - 7,
      "text-anchor": "middle"
    }, varyingVariable.toLowerCase()));
    svg.appendChild(svgElement("text", {
      class: "bns-axis-title",
      x: 14,
      y: margin.top + plotHeight / 2,
      "text-anchor": "middle",
      transform: `rotate(-90 14 ${margin.top + plotHeight / 2})`
    }, "density"));

    plot.title.innerHTML = kind === "joint"
      ? `Joint Density <span class="bns-math">f<sub>X, Y</sub>(x, y)</span> at <i>${fixedVariable}</i> = ${formatNumber(fixedValue)}`
      : `Conditional Density <span class="bns-math">f(${varyingVariable} | ${fixedVariable} = ${formatNumber(fixedValue)})</span>`;
  }

  announceSelection() {
    const variable = this.state.mode === "x" ? "X" : "Y";
    const value = this.state.values[this.state.mode];
    this.liveRegion.textContent = `${variable} fixed at ${formatNumber(value)}. Joint and conditional density plots updated.`;
  }

  applyTheme() {
    if (!this.renderer) return;
    const densityColor = new THREE.Color(colorValue("--rmk-color", "#2782b7"));
    const neutralColor = new THREE.Color(colorValue("--ink-faint", "#606060"));
    this.gridMaterial.color.copy(neutralColor);
    this.axisMaterial.color.copy(neutralColor);
    this.sliceMaterial.color.copy(neutralColor);
    this.sliceLineMaterial.color.copy(neutralColor);
    this.updateSurfaceColor(densityColor);
    this.rebuildAxisLabels();
    this.updateSlice();
  }

  updateSurfaceColor(color) {
    const colors = this.surfaceGeometry.getAttribute("color");
    for (let index = 0; index < colors.count; index += 1) {
      colors.setXYZW(index, color.r, color.g, color.b, colors.getW(index));
    }
    colors.needsUpdate = true;
  }

  restoreCamera() {
    if (!this.camera || !this.controls) return;
    const saved = this.state.camera;
    if (saved?.position?.length === 3 && saved?.target?.length === 3) {
      this.camera.position.fromArray(saved.position);
      this.controls.target.fromArray(saved.target);
    } else {
      this.controls.target.set(0, 1.7, 0);
      this.camera.position.set(10.5, 8.2, 11.5);
    }
    this.controls.update();
  }

  resizeThreeDimensionalPlot() {
    if (!this.renderer) return;
    const width = this.stage.clientWidth;
    const height = this.stage.clientHeight;
    if (width < 2 || height < 2) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.renderThreeDimensionalPlot();
  }

  renderThreeDimensionalPlot() {
    if (this.renderer && !this.destroyed) this.renderer.render(this.scene, this.camera);
  }

  worldX(x) {
    return x - this.displayCenterX;
  }

  worldY(y) {
    return (y - this.displayCenterY) * this.worldDepthScale;
  }

  worldDensity(density) {
    return density * this.heightScale;
  }

  saveState() {
    const state = {
      mode: this.state.mode,
      values: { ...this.state.values },
      zoom: { ...this.state.zoom }
    };
    if (this.camera && this.controls) {
      state.camera = {
        position: this.camera.position.toArray(),
        target: this.controls.target.toArray()
      };
    }
    savedStates.set(this.instanceKey, state);
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.saveState();
    if (this.pendingFrame) cancelAnimationFrame(this.pendingFrame);
    this.resizeObserver?.disconnect();
    this.modeButtons.forEach((button) => button.removeEventListener("click", this.onModeClick));
    Object.values(this.plots).forEach((plot) =>
      plot.svg.removeEventListener("wheel", this.onPlotWheel));
    this.rangeInput.removeEventListener("input", this.onRangeInput);
    this.rangeInput.removeEventListener("change", this.onRangeChange);
    this.rangeInput.removeEventListener("pointerdown", this.onRangePointerDown);
    this.rangeInput.removeEventListener("keydown", this.onRangeKeyDown);
    this.rangeInput.removeEventListener("blur", this.onRangeBlur);
    if (this.renderer) {
      this.controls.dispose();
      const disposedMaterials = new Set();
      this.scene.traverse((object) => {
        object.geometry?.dispose?.();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.filter(Boolean).forEach((material) => {
          if (disposedMaterials.has(material)) return;
          material.map?.dispose?.();
          material.dispose?.();
          disposedMaterials.add(material);
        });
      });
      this.renderer.dispose();
      this.renderer.forceContextLoss?.();
    }
    this.root.removeAttribute("data-initialized");
  }
}

export function mountAll(root = document) {
  const candidates = [];
  if (root instanceof Element && root.matches(SELECTOR)) candidates.push(root);
  if (typeof root.querySelectorAll === "function") candidates.push(...root.querySelectorAll(SELECTOR));
  candidates.forEach((element) => {
    if (instances.has(element)) return;
    try {
      instances.set(element, new BivariateNormalSlicer(element));
    } catch (error) {
      console.error("The joint-density model could not be created.", error);
      element.innerHTML = '<p class="bns-fallback">The interactive joint-density model could not be loaded.</p>';
    }
  });
}

export function destroyAll(root = document) {
  instances.forEach((instance, element) => {
    if (element === root || root.contains?.(element) || !element.isConnected) {
      instance.destroy();
      instances.delete(element);
    }
  });
}

function sweepDisconnectedInstances() {
  instances.forEach((instance, element) => {
    if (element.isConnected) return;
    instance.destroy();
    instances.delete(element);
  });
}

function reconcile() {
  reconciliationQueued = false;
  sweepDisconnectedInstances();
  mountAll(document);
}

function queueReconciliation() {
  if (reconciliationQueued) return;
  reconciliationQueued = true;
  queueMicrotask(reconcile);
}

function mutationsRequireReconciliation(records) {
  return records.some((record) => {
    const target = record.target instanceof Element
      ? record.target
      : record.target.parentElement;
    return !target?.closest(`${SELECTOR}[data-initialized="true"]`);
  });
}

function start() {
  mountAll(document);
  const contentObserver = new MutationObserver((records) => {
    if (mutationsRequireReconciliation(records)) queueReconciliation();
  });
  contentObserver.observe(document.documentElement, { childList: true, subtree: true });
  const themeObserver = new MutationObserver(() => {
    instances.forEach((instance) => instance.applyTheme());
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}

window.CourseNotesBivariateNormalSlicer = { mountAll, destroyAll };
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
