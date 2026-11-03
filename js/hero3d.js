/* =========================================================
   BEE LÁSER REMOVE — abeja escultórica 3D del hero
   Three.js · abeja vectorial extruida + marco hexagonal
   ========================================================= */

import * as THREE from "three";
import { BEE_PATH } from "./bee-shape.js";

/* Trazado exacto del hexágono del logotipo (assets/bee-mark.svg). */
const FRAME_OUTER_PATH =
  "M65.2 233.8C54.9 216.7 -0.0 118.6 0.2 117.6C0.4 117.0 15.4 90.2 33.5 58.2L66.5 0.1L134.0 0.1L201.5 0.1L234.2 57.9C253.9 92.4 267.0 116.7 267.0 118.2C267.0 119.8 253.8 144.0 234.1 178.6L201.3 236.5L134.2 236.8L67.2 237.0L65.2 233.8Z";
const FRAME_INNER_PATH =
  "M230.3 175.5C247.9 144.7 262.3 119.0 262.3 118.4C262.3 117.9 248.0 92.1 230.4 61.2L198.5 5.0L134.0 5.0L69.5 5.0L37.6 61.2C20.0 92.1 5.7 117.8 5.7 118.4C5.8 119.3 64.4 223.1 68.6 229.8L70.1 232.0L134.2 231.8L198.4 231.5L230.3 175.5Z";

/* La abeja y el marco comparten escala para conservar la proporción del logo. */
const MODEL_SCALE = 0.0142;

/* Límites de giro calculados para que ninguna esquina salga del lienzo. */
const MAX_YAW = 0.38;
const MAX_PITCH = 0.34;

const canvas = document.querySelector("#hero-canvas");
const orbWrap = document.querySelector("[data-orb]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas && orbWrap) {
  initHero();
}

function initHero() {
  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
  } catch (error) {
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
  camera.position.set(0, 0.04, 8.9);
  camera.lookAt(0, 0.01, 0);

  scene.environment = createEnvironment(renderer);

  const world = new THREE.Group();
  scene.add(world);

  /* ---------- Materials ---------- */

  const beeMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x152d1a),
    metalness: 0.07,
    roughness: 0.42,
    clearcoat: 0.28,
    clearcoatRoughness: 0.3,
    sheen: 0.2,
    sheenColor: new THREE.Color(0xf3e5c9),
    sheenRoughness: 0.7,
    envMapIntensity: 1.05
  });

  const beeEdgeMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xa98a58),
    metalness: 0.62,
    roughness: 0.42,
    clearcoat: 0.35,
    clearcoatRoughness: 0.28,
    envMapIntensity: 1.05
  });

  const creamMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xefe0c1),
    metalness: 0.18,
    roughness: 0.4,
    clearcoat: 0.35,
    clearcoatRoughness: 0.24,
    envMapIntensity: 1.15
  });

  /* ---------- Logo sculpture ----------
     Abeja y hexágono viven en el mismo grupo: se mueven y giran juntos. */

  const logo = new THREE.Group();
  logo.rotation.z = -0.03;
  world.add(logo);

  /* ---------- Bee ---------- */

  const bee = new THREE.Group();
  logo.add(bee);

  const beeModel = createBeeModel(beeMaterial, beeEdgeMaterial, MODEL_SCALE);
  bee.add(beeModel);

  /* ---------- Hexagonal frame (trazado del logo) ---------- */

  const frameGroup = new THREE.Group();
  frameGroup.position.set(0, 0, -0.65);
  logo.add(frameGroup);

  const frameShape = createLogoFrameShape(MODEL_SCALE);
  const frameGeometry = new THREE.ExtrudeGeometry(frameShape, {
    depth: 0.05,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.006,
    bevelThickness: 0.008,
    curveSegments: 24
  });

  frameGeometry.computeBoundingBox();
  const frameCenter = new THREE.Vector3();
  frameGeometry.boundingBox.getCenter(frameCenter);
  frameGeometry.translate(-frameCenter.x, -frameCenter.y, 0);

  const frame = new THREE.Mesh(frameGeometry, creamMaterial);
  frameGroup.add(frame);

  // A soft circular orbit, echoing the diagram language of the site.
  const orbitLine = new THREE.LineLoop(
    createCircleGeometry(2.62),
    new THREE.LineBasicMaterial({
      color: 0x35573b,
      transparent: true,
      opacity: 0.13
    })
  );
  orbitLine.position.set(0, 0, -1.55);
  orbitLine.rotation.z = 0.16;
  world.add(orbitLine);

  /* ---------- Lighting ---------- */

  const hemisphere = new THREE.HemisphereLight(0xfff1d5, 0x08150b, 1.6);
  scene.add(hemisphere);

  const keyLight = new THREE.DirectionalLight(0xffe8c1, 3.6);
  keyLight.position.set(4.6, 6.2, 5.6);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xa4cba6, 2.2);
  rimLight.position.set(-5.4, 1.4, -3.4);
  scene.add(rimLight);

  const greenLight = new THREE.PointLight(0x35663e, 9, 12, 2);
  greenLight.position.set(2.6, -2.8, 2.4);
  scene.add(greenLight);

  const frontLight = new THREE.PointLight(0xfff0d7, 9, 12, 2);
  frontLight.position.set(-2.6, 2.8, 5.4);
  scene.add(frontLight);

  /* ---------- Motion state ---------- */

  const pointerTarget = { x: 0, y: 0 };
  const pointerCurrent = { x: 0, y: 0 };
  let spinY = 0;
  let spinX = 0;
  let dragging = false;
  let returnAt = 0;
  let lastPointerX = 0;
  let lastPointerY = 0;
  let isRunning = false;
  let isVisible = true;
  let animationFrame = 0;
  let resizeObserver;

  const damp = (current, target, ease) => current + (target - current) * ease;

  const updateSize = () => {
    const rect = orbWrap.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 600 ? 1.6 : 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  updateSize();
  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(orbWrap);
  } else {
    window.addEventListener("resize", updateSize);
  }

  const renderFrame = (time) => {
    if (!isRunning) return;

    const seconds = time * 0.001;

    if (!reduceMotion) {
      pointerCurrent.x = damp(pointerCurrent.x, pointerTarget.x, 0.035);
      pointerCurrent.y = damp(pointerCurrent.y, pointerTarget.y, 0.035);

      // Tras soltar, el giro vuelve poco a poco a su posición de reposo.
      if (!dragging && returnAt && time >= returnAt) {
        spinY = damp(spinY, 0, 0.028);
        spinX = damp(spinX, 0, 0.028);

        if (Math.abs(spinY) < 0.0005 && Math.abs(spinX) < 0.0005) {
          spinY = 0;
          spinX = 0;
          returnAt = 0;
        }
      }

      // The whole logo breathes and floats as one connected piece.
      logo.position.y = Math.sin(seconds * 0.82) * 0.04;
      logo.position.x = Math.sin(seconds * 0.41 + 0.7) * 0.015;

      // Un balanceo continuo mantiene viva la pieza sin perder el encuadre.
      const idleY = dragging ? 0 : Math.sin(seconds * 0.34) * 0.09;
      const idleX = dragging ? 0 : Math.sin(seconds * 0.27 + 0.8) * 0.04;

      // The circular orbit drifts very slowly.
      orbitLine.rotation.z = 0.16 + seconds * 0.003;

      logo.rotation.z = -0.03 + Math.sin(seconds * 0.21) * 0.006;
      logo.rotation.y = THREE.MathUtils.clamp(
        spinY + pointerCurrent.x * 0.14 + idleY,
        -MAX_YAW,
        MAX_YAW
      );
      logo.rotation.x = THREE.MathUtils.clamp(
        spinX + pointerCurrent.y * 0.1 + idleX,
        -MAX_PITCH,
        MAX_PITCH
      );
    } else {
      logo.rotation.y = spinY;
      logo.rotation.x = spinX;
    }

    renderer.render(scene, camera);
    animationFrame = window.requestAnimationFrame(renderFrame);
  };

  const start = () => {
    if (isRunning || !isVisible || document.hidden) return;
    isRunning = true;
    animationFrame = window.requestAnimationFrame(renderFrame);
  };

  const stop = () => {
    isRunning = false;
    window.cancelAnimationFrame(animationFrame);
  };

  const onPointerMove = (event) => {
    if (reduceMotion) return;

    if (dragging) {
      const deltaX = event.clientX - lastPointerX;
      const deltaY = event.clientY - lastPointerY;

      spinY = THREE.MathUtils.clamp(
        spinY + deltaX * 0.0048,
        -MAX_YAW,
        MAX_YAW
      );
      spinX = THREE.MathUtils.clamp(
        spinX + deltaY * 0.0048,
        -MAX_PITCH,
        MAX_PITCH
      );

      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      pointerTarget.x = 0;
      pointerTarget.y = 0;
      returnAt = 0;
      return;
    }

    const rect = orbWrap.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    pointerTarget.x = THREE.MathUtils.clamp(x * 1.7, -1, 1);
    pointerTarget.y = THREE.MathUtils.clamp(y * 1.4, -1, 1);
  };

  const onPointerDown = (event) => {
    if (reduceMotion || (event.pointerType === "mouse" && event.button !== 0)) return;
    dragging = true;
    returnAt = 0;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    orbWrap.classList.add("is-dragging");
    orbWrap.setPointerCapture?.(event.pointerId);
  };

  const endDrag = () => {
    if (dragging) {
      returnAt = performance.now() + 1400;
    }
    dragging = false;
    orbWrap.classList.remove("is-dragging");
  };

  orbWrap.addEventListener("pointermove", onPointerMove, { passive: true });
  orbWrap.addEventListener("pointerdown", onPointerDown);
  orbWrap.addEventListener("pointerup", endDrag);
  orbWrap.addEventListener("pointercancel", endDrag);
  orbWrap.addEventListener("pointerleave", () => {
    endDrag();
    if (!reduceMotion) {
      pointerTarget.x = 0;
      pointerTarget.y = 0;
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });

  if ("IntersectionObserver" in window) {
    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            start();
          } else {
            stop();
          }
        });
      },
      { threshold: 0.02 }
    );
    visibilityObserver.observe(orbWrap);
  }

  document.body.classList.add("webgl-ready");
  renderer.render(scene, camera);
  start();
}

/* ---------- Bee geometry ---------- */

function createBeeModel(frontMaterial, edgeMaterial, scale) {
  const bee = new THREE.Group();

  const shapes = parseSvgPath(BEE_PATH);

  shapes.forEach((shape) => {
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 10,
      bevelEnabled: true,
      bevelThickness: 1.8,
      bevelSize: 0.8,
      bevelSegments: 4,
      curveSegments: 18
    });

    geometry.scale(scale, scale, scale);

    const mesh = new THREE.Mesh(geometry, [frontMaterial, edgeMaterial]);
    bee.add(mesh);
  });

  const box = new THREE.Box3().setFromObject(bee);
  const center = box.getCenter(new THREE.Vector3());
  bee.position.sub(center);

  return bee;
}

function parseSvgPath(d) {
  const tokens = d.match(/[MLCZ]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || [];
  const shapes = [];
  let shape = null;
  let index = 0;

  while (index < tokens.length) {
    const command = tokens[index++];

    if (command === "M") {
      const x = Number(tokens[index++]);
      const y = Number(tokens[index++]);
      shape = new THREE.Shape();
      shape.moveTo(x, -y);
      shapes.push(shape);
    } else if (command === "L" && shape) {
      const x = Number(tokens[index++]);
      const y = Number(tokens[index++]);
      shape.lineTo(x, -y);
    } else if (command === "C" && shape) {
      const c1x = Number(tokens[index++]);
      const c1y = Number(tokens[index++]);
      const c2x = Number(tokens[index++]);
      const c2y = Number(tokens[index++]);
      const x = Number(tokens[index++]);
      const y = Number(tokens[index++]);
      shape.bezierCurveTo(c1x, -c1y, c2x, -c2y, x, -y);
    } else if (command === "Z" && shape) {
      shape.closePath();
    }
  }

  return shapes;
}

/* ---------- Geometry helpers ---------- */

function createLogoFrameShape(scale) {
  const shape = new THREE.Shape();
  drawSvgPath(shape, FRAME_OUTER_PATH, scale);

  const hole = new THREE.Path();
  drawSvgPath(hole, FRAME_INNER_PATH, scale);

  shape.holes.push(hole);
  return shape;
}

function drawSvgPath(path, d, scale = 1) {
  const tokens = d.match(/[MLCZ]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || [];
  let index = 0;

  while (index < tokens.length) {
    const command = tokens[index++];

    if (command === "M") {
      const x = Number(tokens[index++]) * scale;
      const y = -Number(tokens[index++]) * scale;
      path.moveTo(x, y);
    } else if (command === "L") {
      const x = Number(tokens[index++]) * scale;
      const y = -Number(tokens[index++]) * scale;
      path.lineTo(x, y);
    } else if (command === "C") {
      const c1x = Number(tokens[index++]) * scale;
      const c1y = -Number(tokens[index++]) * scale;
      const c2x = Number(tokens[index++]) * scale;
      const c2y = -Number(tokens[index++]) * scale;
      const x = Number(tokens[index++]) * scale;
      const y = -Number(tokens[index++]) * scale;
      path.bezierCurveTo(c1x, c1y, c2x, c2y, x, y);
    } else if (command === "Z") {
      path.closePath();
    }
  }

  return path;
}

function createCircleGeometry(radius) {
  const points = [];
  const segments = 160;
  for (let i = 0; i < segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
  }
  return new THREE.BufferGeometry().setFromPoints(points);
}

function createEnvironment(renderer) {
  const environmentScene = new THREE.Scene();

  const backdropGeometry = new THREE.SphereGeometry(30, 32, 32);
  const backdropMaterial = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      topColor: { value: new THREE.Color(0x46644a) },
      bottomColor: { value: new THREE.Color(0x07130a) }
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition).y;
        vec3 color = mix(bottomColor, topColor, smoothstep(-0.65, 0.85, h));
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
  environmentScene.add(new THREE.Mesh(backdropGeometry, backdropMaterial));

  const panelGeometry = new THREE.PlaneGeometry(7.5, 2.1);
  const warmPanelMaterial = new THREE.MeshBasicMaterial({ color: 0xffefd2 });
  warmPanelMaterial.color.setRGB(3.2, 2.85, 2.3);

  const topPanel = new THREE.Mesh(panelGeometry, warmPanelMaterial);
  topPanel.position.set(2.8, 5.6, -3.5);
  topPanel.lookAt(0, 0, 0);
  environmentScene.add(topPanel);

  const sidePanel = new THREE.Mesh(panelGeometry, warmPanelMaterial);
  sidePanel.position.set(-5.8, 1.5, 2.2);
  sidePanel.scale.set(0.55, 1.5, 1);
  sidePanel.lookAt(0, 0, 0);
  environmentScene.add(sidePanel);

  const greenPanelMaterial = new THREE.MeshBasicMaterial({ color: 0x58775a });
  greenPanelMaterial.color.multiplyScalar(1.2);
  const greenPanel = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 4.4), greenPanelMaterial);
  greenPanel.position.set(3.2, -3.1, 4.2);
  greenPanel.lookAt(0, 0, 0);
  environmentScene.add(greenPanel);

  const narrowPanelMaterial = new THREE.MeshBasicMaterial({ color: 0xfff7e8 });
  narrowPanelMaterial.color.setRGB(4.6, 4.2, 3.5);
  const narrowPanel = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 6.2), narrowPanelMaterial);
  narrowPanel.position.set(4.2, 0.7, 4.8);
  narrowPanel.lookAt(0, 0, 0);
  environmentScene.add(narrowPanel);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const renderTarget = pmremGenerator.fromScene(environmentScene, 0.035);
  pmremGenerator.dispose();

  environmentScene.traverse((object) => {
    if (object.geometry) object.geometry.dispose();
    if (object.material) object.material.dispose();
  });

  return renderTarget.texture;
}
