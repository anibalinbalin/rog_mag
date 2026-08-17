"use client";

import { useEffect, useRef } from "react";
import { useDialKit, useDialTimeline, type EasingConfig } from "dialkit";

import { getPatinaSceneState } from "@/app/labs/patina/patinaMotion";

/* Embeddable version of the /labs/patina technique: fixed cover geometry and
   table light, scroll moves only the virtual observer used for the specular
   response. Progress comes from the element's own position in the viewport
   (bottom → top = 0 → 1), so the effect works inside a normal page flow
   instead of the lab's 400vh scroll track. Maps live under `basePath`
   ({albedo,normal,height,roughness}.png); the height map doubles as the
   silhouette mask. */

const VERT = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUV;
uniform sampler2D uHeight;
uniform float uDisp;
uniform mat4 uMVP;
out vec2 vUV;
out vec3 vPos;
void main() {
  // LOD 3 keeps displacement height soft (≈8x8-texel average) while the
  // fragment stage samples sharp base-level detail.
  float h = textureLod(uHeight, aUV, 3.0).r;
  vec3 p = vec3(aPos, h * uDisp);
  vUV = aUV;
  vPos = p;
  gl_Position = uMVP * vec4(p, 1.0);
}`;

const FRAG = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUV;
in vec3 vPos;
uniform sampler2D uAlbedo;
uniform sampler2D uNormal;
uniform sampler2D uRough;
uniform sampler2D uHeight;
uniform vec3 uLightPos;
uniform vec3 uViewPos;
uniform vec2 uTexel;
uniform float uIntensity;
uniform float uAmbient;
uniform float uSpec;
uniform float uShin;
uniform float uNormStr;
uniform float uHGrad;
uniform float uMask;
uniform float uFlipY;
uniform float uExposure;
uniform float uRoughFloor;
uniform float uVignette;
uniform float uWarmth;
uniform float uConeAngle;
uniform float uConeSoft;
uniform float uConeFocus;
uniform float uConeAim;
uniform float uFalloff;
uniform float uSheen;
uniform float uSheenFocus;
uniform float uKick;
out vec4 frag;
void main() {
  vec3 albedo = texture(uAlbedo, vUV).rgb;
  // The map marks the label bands near-glossy; the floor keeps the highlight
  // on the embossed letters without turning paper into plastic.
  float rough = max(texture(uRough, vUV).r, uRoughFloor);
  float h = texture(uHeight, vUV).r;
  float mask = smoothstep(uMask * 0.35, uMask, h);

  vec3 nTex = texture(uNormal, vUV).xyz * 2.0 - 1.0;
  if (uFlipY > 0.5) nTex.y = -nTex.y;
  vec3 nm = mix(vec3(0.0, 0.0, 1.0), nTex, uNormStr);

  // Height-gradient relief keeps embossing readable while geometry stays
  // invariant across the whole scroll.
  float hx = texture(uHeight, vUV + vec2(uTexel.x, 0.0)).r
           - texture(uHeight, vUV - vec2(uTexel.x, 0.0)).r;
  float hy = texture(uHeight, vUV + vec2(0.0, uTexel.y)).r
           - texture(uHeight, vUV - vec2(0.0, uTexel.y)).r;
  vec3 N = normalize(vec3(nm.xy + vec2(-hx, hy) * uHGrad, nm.z));

  vec3 toLight = uLightPos - vPos;
  float dist = length(toLight);
  vec3 L = toLight / dist;
  float atten = 1.0 / (1.0 + uFalloff * dist * dist);

  // Spotlight cone. uConeAim blends the axis from straight-down -Z (0, pool
  // follows the lamp) to aimed-at-the-book (1, boom-arm key: the pool stays
  // on the cover and moving the lamp changes the angle of incidence instead).
  vec3 axis = normalize(mix(vec3(0.0, 0.0, -1.0), normalize(-uLightPos), uConeAim));
  float cosT = dot(-L, axis);
  float outerC = cos(uConeAngle);
  float innerC = cos(uConeAngle * (1.0 - uConeSoft));
  float spot = smoothstep(outerC, innerC + 1e-4, cosT);
  // Focus shapes the pool's gradient: >1 concentrates a hot core with a
  // softly darkening rim, the way a fresnel-lens spot falls off — a flat
  // disc of light is what reads as "stage wash" instead of spotlight.
  spot = pow(spot, uConeFocus);

  float diff = max(dot(N, L), 0.0);
  vec3 V = normalize(uViewPos - vPos);
  vec3 H = normalize(L + V);
  float shin = mix(uShin, 8.0, rough);
  float spec = pow(max(dot(N, H), 0.0), shin) * (1.0 - rough * 0.85) * uSpec;
  // Softbox lobe: a second, broad specular term — the smooth gradient of
  // light that sweeps a glossy cover in product shots, vs the tight emboss
  // glints of the lobe above. uSheenFocus is its exponent (lower = broader).
  float sheen = pow(max(dot(N, H), 0.0), uSheenFocus) * (1.0 - rough * 0.3) * uSheen;

  // Tungsten-ish key: warm the direct light, keep ambient neutral so the
  // shadow side cools off the way the reference photograph does.
  vec3 lightCol = mix(vec3(1.0), vec3(1.0, 0.9, 0.78), uWarmth);
  vec3 col = albedo * (uAmbient + uIntensity * diff * atten * spot) * mix(vec3(1.0), lightCol, 0.6)
           + lightCol * (spec + sheen) * atten * spot * uIntensity;

  // Kicker: fixed cool directional light grazing in from the right — catches
  // emboss edges and cloth texture for separation, and the warm-key/cool-rim
  // split is standard product-shot grammar.
  vec3 Lk = normalize(vec3(0.9, 0.15, 0.3));
  float kd = max(dot(N, Lk), 0.0);
  vec3 Hk = normalize(Lk + V);
  float ks = pow(max(dot(N, Hk), 0.0), shin) * (1.0 - rough * 0.85);
  col += vec3(0.85, 0.92, 1.0) * (albedo * kd * 0.6 + ks) * uKick;
  // Corner falloff sells a single key light instead of an even wash.
  float vig = 1.0 - uVignette * smoothstep(0.35, 0.9, distance(vUV, vec2(0.5, 0.6)));
  col *= vig;
  col = col / (col + vec3(0.9)); // soft rolloff instead of hard clip
  frag = vec4(col * uExposure, mask);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(s) ?? "shader compile failed");
  }
  return s;
}

function perspective(fovY: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan(fovY / 2);
  const nf = 1 / (near - far);
  // prettier-ignore
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ]);
}

/** proj * translate(0,0,-eyeZ), column-major (no model rotation — the cover
    never tilts). */
function mvp(proj: Float32Array, eyeZ: number) {
  const out = new Float32Array(proj);
  for (let r = 0; r < 4; r++) {
    out[12 + r] = proj[8 + r] * -eyeZ + proj[12 + r];
  }
  return out;
}

// Material/look values — tuned 2026-08-16 and baked. The light-quality
// entries (intensity/ambient/warmth, plus the new cone/falloff) moved back
// into the dial config 2026-08-17 for the current tuning round; re-bake them
// here when it closes.
const TUNED = {
  specular: 1.5,
  shininess: 160,
  normalStrength: 0.4,
  heightRelief: 6,
  dispBase: 0.01,
  maskCut: 0.05,
  flipNormalY: 1,
  roughFloor: 0.4,
  vignette: 0.05,
};

// Start of the authored light route (scene units). The light's dialled
// position is exact here; `lightFollow` applies the route's offset from this
// origin to the light as the sweep progresses.
const LIGHT_PATH_ORIGIN = { x: 0, y: 0.72 } as const;

type PatinaCoverProps = {
  /** Folder under /public holding albedo/normal/height/roughness .png maps. */
  basePath: string;
  /** Source map pixel size — drives the relief texel step and plane aspect. */
  textureWidth: number;
  textureHeight: number;
  /** DialKit panel label (dev only). */
  dialLabel?: string;
  className?: string;
  alt?: string;
};

export default function PatinaCover({
  basePath,
  textureWidth,
  textureHeight,
  dialLabel = "Patina cover (embed)",
  className,
  alt,
}: PatinaCoverProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hudRef = useRef<HTMLDivElement | null>(null);
  const aspect = textureWidth / textureHeight;

  const dials = useDialKit(dialLabel, {
    lightZ: [0.6, 0.15, 2],
    lightX: [0.4, -1, 1],
    lightY: [0.4, -1, 1],
    lightFollow: [0.79, 0, 1],
    travel: [1, 0.5, 3],
    trail: [0.03, 0.03, 0.5],
    manualScrub: [0, 0, 1],
    // Light quality — cone is the lamp's spotlight (degrees; soft = penumbra
    // fraction of the angle), falloff the distance attenuation coefficient.
    // Defaults re-baked from Anibal's 2026-08-17 studio tuning session.
    coneAngle: [74, 5, 90],
    coneSoft: [0.86, 0, 1],
    coneFocus: [2.7, 0.5, 4],
    // 0 = pool follows the lamp (straight-down cone); 1 = boom-arm key aimed
    // at the book, so lamp motion changes the light's angle instead.
    coneAim: [0.57, 0, 1],
    falloff: [0.9, 0, 4],
    intensity: [0.5, 0, 6],
    ambient: [0.81, 0, 1],
    warmth: [0.6, 0, 1],
    // Output brightness after tone mapping — the lever for "the resting
    // book looks pale" (at scroll 0 the lamp can be off-stage, leaving
    // ambient-only light that the tone map compresses).
    exposure: [1.5, 0.5, 2.5],
    // Studio extras — sheen is the softbox gradient (focus = breadth, lower
    // is broader), kick the cool rim/kicker, glow the backdrop light (CSS).
    sheen: [0.5, 0, 1.5],
    sheenFocus: [25, 4, 60],
    kick: [0.8, 0, 1.5],
    glow: [0.72, 0, 1],
    // Idle drift — a lamp is never perfectly still. Slow Lissajous wander
    // (scene units) keeps the sheen alive while the scroll is parked.
    wobble: [0.04, 0, 0.08],
    wobbleSpeed: [0.25, 0.05, 1],
  });
  const dialsRef = useRef(dials);
  dialsRef.current = dials;

  // TODO(production): DialKit's clip.current values are the scrubbable authoring preview.
  // Replace them with equivalent real Motion animations using the tuned timeline
  // timings and transitions, then remove useDialTimeline and <DialTimeline />.
  //
  // The observer's route over the scroll, one clip per leg. Scroll drives the
  // playhead (seek): 0s = scroll start, timeline end = scroll end. Drag the
  // leg bars in the dock to re-pace the sweep and edit their from/to to
  // re-shape it. Set the `manualScrub` dial to 1 to detach from scroll and
  // scrub/play freely. Tuned by Anibal 2026-08-17 (fast opening sweep, long
  // finishing swing across the bottom).
  //
  // CONTINUITY RULE: each leg's `from` must equal the previous leg's `to`,
  // and legs must not overlap in time — the rendered position is the active
  // leg's value, so any mismatch teleports the light at the boundary.
  //
  // UNITS: percent of scene scale (÷100 when consumed). DialKit's from/to
  // presets treat props named x/y as pixel-ish dials with step 1 and QUANTIZE
  // to that step — unit-scale values like 0.18 collapse to 0. Percent units
  // keep step-1 dock dragging meaningful (1% precision).
  const lin = (duration: number): EasingConfig => ({ type: "easing", duration, ease: [0.25, 0.25, 0.75, 0.75] });
  const path = useDialTimeline(
    "Luz portada",
    {
      leg1: { at: 0, duration: 0.42, from: { x: 0, y: 72 }, to: { x: 18, y: 36 }, transition: { type: "spring", stiffness: 200, damping: 25, mass: 1 } },
      // Legs 2-4 disabled 2026-08-17 (Anibal) — sweep is leg1 only for now.
      // Restore by uncommenting and adding them back to the `legs` array below.
      // leg2: { at: 0.42, duration: 0.08, from: { x: 18, y: 36 }, to: { x: 0, y: 0 }, transition: lin(0.08) },
      // leg3: { at: 0.5, duration: 0.16, from: { x: 0, y: 0 }, to: { x: -18, y: -35 }, transition: lin(0.16) },
      // leg4: { at: 0.66, duration: 0.25, from: { x: -18, y: -35 }, to: { x: 35, y: -100 }, transition: lin(0.25) },
    },
    {
      id: "patina-light-path-v6",
      persist: process.env.NODE_ENV === "development",
      autoplay: false,
    },
  );
  const pathRef = useRef(path);
  pathRef.current = path;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { alpha: true, antialias: true });
    if (!gl) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);
    const U = (n: string) => gl.getUniformLocation(prog, n);

    // Subdivided plane: height 1.0, width = texture aspect.
    const COLS = 140;
    const ROWS = Math.round(COLS / aspect);
    const verts = new Float32Array((COLS + 1) * (ROWS + 1) * 4);
    let vi = 0;
    for (let r = 0; r <= ROWS; r++) {
      for (let c = 0; c <= COLS; c++) {
        const u = c / COLS, v = r / ROWS;
        verts[vi++] = (u - 0.5) * aspect;
        verts[vi++] = v - 0.5;
        verts[vi++] = u;
        verts[vi++] = v;
      }
    }
    const idx = new Uint32Array(COLS * ROWS * 6);
    let ii = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const a = r * (COLS + 1) + c;
        const b = a + COLS + 1;
        idx[ii++] = a; idx[ii++] = a + 1; idx[ii++] = b;
        idx[ii++] = a + 1; idx[ii++] = b + 1; idx[ii++] = b;
      }
    }
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);

    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    const texUnit = (name: string, unit: number) => gl.uniform1i(U(name), unit);
    texUnit("uAlbedo", 0);
    texUnit("uNormal", 1);
    texUnit("uHeight", 2);
    texUnit("uRough", 3);
    gl.uniform2f(U("uTexel"), 1 / textureWidth, 1 / textureHeight);

    let ready = false;
    const textures: WebGLTexture[] = [];
    const load = (src: string, unit: number) =>
      new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const t = gl.createTexture()!;
          textures.push(t);
          gl.activeTexture(gl.TEXTURE0 + unit);
          gl.bindTexture(gl.TEXTURE_2D, t);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          gl.generateMipmap(gl.TEXTURE_2D);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          resolve();
        };
        img.onerror = () => reject(new Error(`failed to load ${src}`));
        img.src = src;
      });
    Promise.all([
      load(`${basePath}/albedo.png`, 0),
      load(`${basePath}/normal.png`, 1),
      load(`${basePath}/height.png`, 2),
      load(`${basePath}/roughness.png`, 3),
    ]).then(() => { ready = true; });

    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // Scroll changes the observer-relative shading, never the cover geometry.
    let smoothP = 0.5;
    let prevT = performance.now();
    let raf = 0;
    let lastSeek = -1;
    let lastHudText = "";

    // Progress over the cover's scroll life: 0 the moment it first becomes
    // visible (page top, if it starts above the fold — so the timeline always
    // begins at 0:00 on load, regardless of viewport height), 1 when its
    // bottom edge finishes leaving the viewport.
    const elementProgress = () => {
      const rect = canvas.getBoundingClientRect();
      const scrollY = window.scrollY;
      const docTop = rect.top + scrollY;
      const start = Math.max(0, docTop - window.innerHeight);
      const end = docTop + rect.height;
      if (end <= start) return 0.5;
      return Math.min(Math.max((scrollY - start) / (end - start), 0), 1);
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!ready) return;
      const d = dialsRef.current;
      const dt = Math.min((now - prevT) / 1000, 0.1);
      prevT = now;

      if (!reduced) {
        smoothP += (elementProgress() - smoothP) * (1 - Math.exp(-dt / d.trail));
      }
      // `travel` is the sweep speed relative to the cover's scroll life:
      // 1 spreads the timeline over the whole life (its finale then plays
      // after the cover has mostly scrolled away); 1.5 completes it while
      // the cover is still ~2/3 in view.
      const pEff = Math.min(smoothP * d.travel, 1);
      // Light + displacement (the fixed parts) still come from the scene
      // helper; the observer's x/y follow the authored timeline path instead.
      // Scroll drives the playhead unless `manualScrub` detaches it.
      const scene = getPatinaSceneState(pEff, reduced, {
        dispBase: TUNED.dispBase,
        lightZ: d.lightZ,
        viewArc: 0,
        lightX: d.lightX,
        lightY: d.lightY,
      });
      const tl = pathRef.current;
      // Seek only when scroll moved, so the dock transport stays usable while the page is still.
      if (reduced) {
        const target = 0.5 * tl.duration;
        if (Math.abs(target - lastSeek) > 0.0005) {
          tl.seek(target);
          lastSeek = target;
        }
      } else if (d.manualScrub < 0.5) {
        const target = pEff * tl.duration;
        if (Math.abs(target - lastSeek) > 0.0005) {
          tl.seek(target);
          lastSeek = target;
        }
      }
      // Latest-started leg wins: before its window a clip holds `from`, after
      // it holds `to`, so this composition equals the authored path and stays
      // deterministic under scrubbing (and tolerant of dragged/overlapping
      // bars in the dock).
      const legs = [tl.leg1];
      let sweep = legs[0].current;
      for (const leg of legs) if (leg.started) sweep = leg.current;
      const obsX = Number(sweep.x) / 100;
      const obsY = Number(sweep.y) / 100;
      // The perceived brightness is dominated by the diffuse term, and only
      // ~22% of observer XY motion reaches the specular center (viewZ 2.1 vs
      // lightZ 0.6) — so the key light partially follows the route too.
      // lightFollow 0 restores the fixed-light behavior; 1 = full path offset.
      let lightX = scene.light.x + (obsX - LIGHT_PATH_ORIGIN.x) * d.lightFollow;
      let lightY = scene.light.y + (obsY - LIGHT_PATH_ORIGIN.y) * d.lightFollow;
      // Idle drift (see wobble dials): mismatched sin/cos frequencies trace a
      // slow non-repeating wander instead of a visible circle.
      if (!reduced && d.wobble > 0) {
        const wt = now * 0.001 * d.wobbleSpeed * Math.PI * 2;
        lightX += Math.sin(wt) * d.wobble;
        lightY += Math.cos(wt * 0.77) * d.wobble;
      }
      // Live readout so light-path tuning isn't blind — DialKit's dock shows only leg endpoints, never the interpolated position.
      if (process.env.NODE_ENV === "development") {
        let activeLegIndex = 0;
        for (let i = 0; i < legs.length; i++) {
          if (legs[i].started === true) activeLegIndex = i;
        }
        const legName = `leg${activeLegIndex + 1}`;
        const hudText = `p ${pEff.toFixed(2)}  t ${tl.time.toFixed(2)}/${tl.duration.toFixed(2)}s  ${legName}  xy ${Number(sweep.x).toFixed(0)} ${Number(sweep.y).toFixed(0)}  L ${lightX.toFixed(2)},${lightY.toFixed(2)}`;
        if (hudText !== lastHudText) {
          if (hudRef.current) hudRef.current.textContent = hudText;
          lastHudText = hudText;
        }
      }

      resize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      // Camera at 1.82 fills ~97% of the canvas with the plane (2.1 left an
      // 8% dead margin all round, shrinking the book vs the old <Image>).
      // Constant across scroll — the fixed-geometry invariant holds.
      const proj = perspective((32 * Math.PI) / 180, canvas.width / canvas.height, 0.1, 10);
      gl.uniformMatrix4fv(U("uMVP"), false, mvp(proj, 1.82));
      gl.uniform1f(U("uDisp"), scene.displacement);
      gl.uniform3f(U("uLightPos"), lightX, lightY, scene.light.z);
      gl.uniform3f(U("uViewPos"), obsX, obsY, scene.observer.z);
      gl.uniform1f(U("uIntensity"), d.intensity);
      gl.uniform1f(U("uAmbient"), d.ambient);
      gl.uniform1f(U("uSpec"), TUNED.specular);
      gl.uniform1f(U("uShin"), TUNED.shininess);
      gl.uniform1f(U("uNormStr"), TUNED.normalStrength);
      gl.uniform1f(U("uHGrad"), TUNED.heightRelief);
      gl.uniform1f(U("uMask"), TUNED.maskCut);
      gl.uniform1f(U("uFlipY"), TUNED.flipNormalY);
      gl.uniform1f(U("uExposure"), d.exposure);
      gl.uniform1f(U("uRoughFloor"), TUNED.roughFloor);
      gl.uniform1f(U("uVignette"), TUNED.vignette);
      gl.uniform1f(U("uWarmth"), d.warmth);
      gl.uniform1f(U("uConeAngle"), (d.coneAngle * Math.PI) / 180);
      gl.uniform1f(U("uConeSoft"), d.coneSoft);
      gl.uniform1f(U("uConeFocus"), d.coneFocus);
      gl.uniform1f(U("uConeAim"), d.coneAim);
      gl.uniform1f(U("uFalloff"), d.falloff);
      gl.uniform1f(U("uSheen"), d.sheen);
      gl.uniform1f(U("uSheenFocus"), d.sheenFocus);
      gl.uniform1f(U("uKick"), d.kick);
      gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_INT, 0);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      textures.forEach((t) => gl.deleteTexture(t));
      gl.deleteBuffer(vbo);
      gl.deleteBuffer(ibo);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(prog);
    };
  }, [basePath, textureWidth, textureHeight, aspect]);

  return (
    <div className={`relative ${className ?? ""}`}>
      {/* Backdrop glow — the lit studio wall behind the product. Warm to
          match the key; the `glow` dial scales its strength. */}
      <div
        aria-hidden
        className="absolute left-1/2 top-[42%] h-[110%] w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(ellipse closest-side, rgba(255, 231, 196, ${(0.55 * dials.glow).toFixed(3)}), rgba(255, 231, 196, 0) 72%)`,
          filter: "blur(18px)",
        }}
      />
      {/* Contact shadow grounds the book on the page — without it the masked
          render reads as a floating cutout. Position derives from the plane:
          book bottom = 0.5 + (0.935 − 0.5) × planeFill(0.97) ≈ 92% of canvas
          (texture cut row 996/1065 = 0.935 of the plane). */}
      <div
        aria-hidden
        className="absolute left-1/2 top-[91.5%] h-[3.5%] w-[86%] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse closest-side, rgba(46, 18, 28, 0.38), rgba(46, 18, 28, 0) 78%)",
          filter: "blur(5px)",
        }}
      />
      {process.env.NODE_ENV === "development" && (
        <div ref={hudRef} aria-hidden className="pointer-events-none absolute left-1 top-1 z-10 rounded-sm bg-black/60 px-2 py-1 font-mono text-[10px] leading-tight text-white" />
      )}
      <canvas
        ref={canvasRef}
        className="relative h-auto w-full"
        style={{ aspectRatio: String(aspect) }}
        aria-label={alt}
      />
    </div>
  );
}
