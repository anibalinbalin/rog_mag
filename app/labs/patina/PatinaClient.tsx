"use client";

import { useEffect, useRef } from "react";
import { useDialKit } from "dialkit";

import { getPatinaSceneState } from "./patinaMotion";

/* Scroll-driven PBR-ish lighting playground for the Arbitraje cover.
   Maps (public/patina/): albedo (bg removed), normal, height, roughness —
   generated with fal.ai. The cover and table light stay fixed while scroll
   moves the virtual observer used by the material's specular response.
   Dev-only lab route; not linked from the site. */

const VERT = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUV;
uniform sampler2D uHeight;
uniform float uDisp;
uniform mat4 uMVP;
out vec2 vUV;
out vec3 vPos;
void main() {
  // LOD 3 averages roughly 8x8 source texels, matching the 10-texel grid
  // cells — soft displacement height, decoupled from sharp shading detail.
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
uniform float uIntensity;
uniform float uAmbient;
uniform float uSpec;
uniform float uShin;
uniform float uNormStr;
uniform float uHGrad;
uniform float uMask;
uniform float uFlipY;
out vec4 frag;
void main() {
  vec3 albedo = texture(uAlbedo, vUV).rgb;
  float rough = texture(uRough, vUV).r;
  float h = texture(uHeight, vUV).r;
  float mask = smoothstep(uMask * 0.35, uMask, h);

  vec3 nTex = texture(uNormal, vUV).xyz * 2.0 - 1.0;
  if (uFlipY > 0.5) nTex.y = -nTex.y;
  vec3 nm = mix(vec3(0.0, 0.0, 1.0), nTex, uNormStr);

  // Height-gradient relief keeps the embossed surface readable while the
  // geometry itself remains invariant throughout the scroll.
  vec2 texel = vec2(1.0 / 1400.0, 1.0 / 1750.0);
  float hx = texture(uHeight, vUV + vec2(texel.x, 0.0)).r
           - texture(uHeight, vUV - vec2(texel.x, 0.0)).r;
  float hy = texture(uHeight, vUV + vec2(0.0, texel.y)).r
           - texture(uHeight, vUV - vec2(0.0, texel.y)).r;
  float relief = uHGrad;
  vec3 N = normalize(vec3(nm.xy + vec2(-hx, hy) * relief, nm.z));

  vec3 toLight = uLightPos - vPos;
  float dist = length(toLight);
  vec3 L = toLight / dist;
  float atten = 1.0 / (1.0 + 1.2 * dist * dist);

  float diff = max(dot(N, L), 0.0);
  vec3 V = normalize(uViewPos - vPos);
  vec3 H = normalize(L + V);
  float shin = mix(uShin, 8.0, rough);
  float spec = pow(max(dot(N, H), 0.0), shin) * (1.0 - rough * 0.85) * uSpec;

  vec3 col = albedo * (uAmbient + uIntensity * diff * atten)
           + vec3(1.0, 0.96, 0.88) * spec * atten * uIntensity;
  col = col / (col + vec3(0.9)); // soft rolloff instead of hard clip
  frag = vec4(col * 1.55, mask);
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

/** proj * translate(0,0,-eyeZ) * rotateX(rx) * rotateY(ry), column-major. */
function mvp(proj: Float32Array, eyeZ: number, rx: number, ry: number) {
  const cx = Math.cos(rx), sx = Math.sin(rx);
  const cy = Math.cos(ry), sy = Math.sin(ry);
  // model = rotX * rotY (column-major columns of the 3x3)
  const m = [
    cy, sx * sy, -cx * sy,
    0, cx, sx,
    sy, -sx * cy, cx * cy,
  ];
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      let v = 0;
      for (let k = 0; k < 4; k++) {
        const model =
          c < 3 && k < 3 ? m[c * 3 + k] : c === 3 && k === 2 ? -eyeZ : c === k ? 1 : 0;
        v += proj[k * 4 + r] * model;
      }
      out[c * 4 + r] = v;
    }
  }
  return out;
}

export default function PatinaClient() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const dials = useDialKit("Patina cover", {
    lightZ: [0.55, 0.15, 2],
    intensity: [2.4, 0, 6],
    ambient: [0.34, 0, 1],
    specular: [1.3, 0, 4],
    shininess: [110, 8, 240],
    normalStrength: [0.8, 0, 1],
    heightRelief: [6, 0, 20],
    dispBase: [0.008, 0, 0.08],
    viewArc: [0.38, 0, 1],
    maskCut: [0.05, 0, 0.3],
    flipNormalY: [1, 0, 1],
  });
  const dialsRef = useRef(dials);
  dialsRef.current = dials;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
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

    // Subdivided plane, aspect 1400x1750 → width 0.8, height 1.0.
    const COLS = 140, ROWS = 175;
    const verts = new Float32Array((COLS + 1) * (ROWS + 1) * 4);
    let vi = 0;
    for (let r = 0; r <= ROWS; r++) {
      for (let c = 0; c <= COLS; c++) {
        const u = c / COLS, v = r / ROWS;
        verts[vi++] = (u - 0.5) * 0.8;
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
      load("/patina/albedo.png", 0),
      load("/patina/normal.png", 1),
      load("/patina/height.png", 2),
      load("/patina/roughness.png", 3),
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

    // Scroll changes the observer-relative shading, never the book geometry.
    let smoothP = reduced ? 0.5 : 0;
    let prevT = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!ready) return;
      const d = dialsRef.current;
      const dt = Math.min((now - prevT) / 1000, 0.1);
      prevT = now;

      const max = document.documentElement.scrollHeight - window.innerHeight;
      const target = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;

      if (!reduced) {
        // A short, critically-damped-feeling trail keeps wheel/touch input
        // continuous without moving the cover itself.
        smoothP += (target - smoothP) * (1 - Math.exp(-dt / 0.12));
      }
      const scene = getPatinaSceneState(smoothP, reduced, {
        dispBase: d.dispBase,
        lightZ: d.lightZ,
        viewArc: d.viewArc,
      });

      // The projection and geometry are invariant. Only the view vector moves.
      resize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const proj = perspective((32 * Math.PI) / 180, canvas.width / canvas.height, 0.1, 10);
      gl.uniformMatrix4fv(U("uMVP"), false, mvp(proj, 2.1, 0, 0));
      gl.uniform1f(U("uDisp"), scene.displacement);
      gl.uniform3f(U("uLightPos"), scene.light.x, scene.light.y, scene.light.z);
      gl.uniform3f(U("uViewPos"), scene.observer.x, scene.observer.y, scene.observer.z);
      gl.uniform1f(U("uIntensity"), d.intensity);
      gl.uniform1f(U("uAmbient"), d.ambient);
      gl.uniform1f(U("uSpec"), d.specular);
      gl.uniform1f(U("uShin"), d.shininess);
      gl.uniform1f(U("uNormStr"), d.normalStrength);
      gl.uniform1f(U("uHGrad"), d.heightRelief);
      gl.uniform1f(U("uMask"), d.maskCut);
      gl.uniform1f(U("uFlipY"), d.flipNormalY);
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
  }, []);

  return (
    <div ref={wrapRef} className="h-[400vh] bg-white">
      <div className="sticky top-0 flex h-screen items-center justify-center">
        <canvas
          ref={canvasRef}
          className="h-[82vh] w-auto max-w-full"
          style={{ aspectRatio: "0.8" }}
          aria-label="Portada de Arbitraje Comercial y de Inversión con reflejos que responden al recorrido"
        />
        <p className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-widest text-black/55">
          Desplazate — tu mirada recorre la portada
        </p>
      </div>
    </div>
  );
}
