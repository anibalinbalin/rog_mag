"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useDialKit } from "dialkit";

/* Scroll-lit render of the bound-volumes shelf on /80-años. A warm key light
   sweeps left → right across the spines as the section crosses the viewport,
   so the gilt lettering catches the sheen the way it does when you walk past
   the real shelf with a lamp. Flat quad — all relief comes from the normal
   map + height gradient; the roughness map marks the lettering near-glossy,
   which is what makes it flash while the cloth stays matte.

   Maps live in /public/patina-shelf/{albedo,normal,height,roughness}.webp
   (fal-ai patina set, 2048×949). The albedo also renders as a plain <Image>
   underneath, so no-WebGL/reduced-data visitors still get the photo. */

const TEX_W = 2048;
const TEX_H = 949;

const VERT = /* glsl */ `#version 300 es
in vec2 aPos;
uniform vec2 uUVScale;
uniform vec2 uUVOffset;
out vec2 vUV;
void main() {
  // Fullscreen quad; UV cover-crop happens here so the canvas behaves like
  // object-cover regardless of the container's aspect.
  vec2 uv01 = aPos * 0.5 + 0.5;
  vUV = uv01 * uUVScale + uUVOffset;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUV;
uniform sampler2D uAlbedo;
uniform sampler2D uNormal;
uniform sampler2D uHeight;
uniform sampler2D uRough;
uniform vec3 uLightPos;
uniform vec2 uTexel;
uniform float uIntensity;
uniform float uAmbient;
uniform float uSpec;
uniform float uShin;
uniform float uSheen;
uniform float uSheenFocus;
uniform float uNormStr;
uniform float uHGrad;
uniform float uWarmth;
uniform float uFalloff;
uniform float uExposure;
uniform float uRoughFloor;
uniform float uRoughLo;
uniform float uRoughHi;
uniform float uRoughLeather;
uniform float uFlipY;
out vec4 frag;

const float ASPECT = ${(TEX_W / TEX_H).toFixed(4)};

void main() {
  vec3 albedo = texture(uAlbedo, vUV).rgb;
  // Binarizing curve: the fal roughness map leaves semi-glossy rectangles
  // where it repainted lettering, and those boxes smudge under the sheen.
  // Everything above uRoughHi snaps to the leather's matte value; only the
  // truly dark letter pixels keep the gloss (uRoughFloor).
  float tRough = smoothstep(uRoughLo, uRoughHi, texture(uRough, vUV).r);
  float rough = mix(uRoughFloor, uRoughLeather, tRough);

  vec3 nTex = texture(uNormal, vUV).xyz * 2.0 - 1.0;
  if (uFlipY > 0.5) nTex.y = -nTex.y;
  vec3 nm = mix(vec3(0.0, 0.0, 1.0), nTex, uNormStr);

  // Height-gradient relief sharpens the embossed lettering beyond what the
  // (lossy-compressed) normal map carries on its own.
  float hx = texture(uHeight, vUV + vec2(uTexel.x, 0.0)).r
           - texture(uHeight, vUV - vec2(uTexel.x, 0.0)).r;
  float hy = texture(uHeight, vUV + vec2(0.0, uTexel.y)).r
           - texture(uHeight, vUV - vec2(0.0, uTexel.y)).r;
  vec3 N = normalize(vec3(nm.xy + vec2(-hx, hy) * uHGrad, nm.z));

  // Texture-space position: x spans ±ASPECT/2, y ±0.5, shelf plane at z=0.
  vec3 P = vec3((vUV.x - 0.5) * ASPECT, vUV.y - 0.5, 0.0);

  vec3 toLight = uLightPos - P;
  float dist = length(toLight);
  vec3 L = toLight / dist;
  float atten = 1.0 / (1.0 + uFalloff * dist * dist);

  float diff = max(dot(N, L), 0.0);
  vec3 V = vec3(0.0, 0.0, 1.0); // viewer straight-on
  vec3 H = normalize(L + V);
  float shin = mix(uShin, 8.0, rough);
  float spec = pow(max(dot(N, H), 0.0), shin) * (1.0 - rough * 0.85) * uSpec;
  // Broad softbox lobe — the smooth gradient that travels the leather while
  // the tight lobe above does the letter glints.
  float sheen = pow(max(dot(N, H), 0.0), uSheenFocus) * (1.0 - rough * 0.3) * uSheen;

  vec3 lightCol = mix(vec3(1.0), vec3(1.0, 0.88, 0.72), uWarmth);
  vec3 col = albedo * (uAmbient + uIntensity * diff * atten) * mix(vec3(1.0), lightCol, 0.5)
           + lightCol * (spec + sheen) * atten * uIntensity;

  col = col / (col + vec3(0.9));
  frag = vec4(col * uExposure, 1.0);
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

export default function PatinaShelf({
  alt,
  className,
}: {
  alt: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [glReady, setGlReady] = useState(false);

  const dials = useDialKit("Patina estantería", {
    // Sweep geometry — the light's x runs sweepStartX → sweepEndX (scene
    // units: shelf spans ±1.08) as section scroll progress runs 0 → 1.
    sweepStartX: [-1.4, -2, 0],
    sweepEndX: [1.4, 0, 2],
    lightY: [0.1, -0.5, 0.5],
    lightZ: [0.55, 0.15, 2],
    travel: [1, 0.5, 2],
    trail: [0.09, 0.03, 0.5],
    // Light quality.
    intensity: [1.6, 0, 6],
    ambient: [0.32, 0, 1],
    warmth: [0.65, 0, 1],
    falloff: [1.6, 0, 6],
    exposure: [1.45, 0.5, 2.5],
    // Material response. Calmer than the /revistas cover: the fal maps carry
    // upscaler ringing around the lettering, and hot spec + strong relief
    // turn that noise into crusty speckle at large canvas sizes.
    specular: [1.1, 0, 4],
    shininess: [110, 8, 400],
    sheen: [0.35, 0, 1.5],
    sheenFocus: [22, 4, 60],
    normalStrength: [0.35, 0, 1],
    heightRelief: [2.5, 0, 12],
    // Roughness curve — floor is the letters' gloss, leather the matte value,
    // lo/hi the smoothstep window separating them (map histogram: leather
    // mass sits at 0.56-0.69, lettering below ~0.5).
    roughFloor: [0.32, 0, 1],
    roughLo: [0.3, 0, 1],
    roughHi: [0.52, 0, 1],
    roughLeather: [0.72, 0, 1],
    flipNormalY: [1, 0, 1],
  });
  const dialsRef = useRef(dials);
  dialsRef.current = dials;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { alpha: true, antialias: false });
    if (!gl) return; // <Image> fallback stays visible

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let prog: WebGLProgram;
    try {
      prog = gl.createProgram()!;
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(prog));
        return;
      }
    } catch (e) {
      console.error(e);
      return;
    }
    gl.useProgram(prog);
    const U = (n: string) => gl.getUniformLocation(prog, n);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]), // oversized tri = fullscreen quad
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);

    (["uAlbedo", "uNormal", "uHeight", "uRough"] as const).forEach((n, i) =>
      gl.uniform1i(U(n), i),
    );
    gl.uniform2f(U("uTexel"), 1 / TEX_W, 1 / TEX_H);

    let ready = false;
    const textures: WebGLTexture[] = [];
    const load = (src: string, unit: number) =>
      new Promise<void>((resolve, reject) => {
        const img = new window.Image();
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
      load("/patina-shelf/albedo.webp", 0),
      load("/patina-shelf/normal.webp", 1),
      load("/patina-shelf/height.webp", 2),
      load("/patina-shelf/roughness.webp", 3),
    ])
      .then(() => {
        ready = true;
        setGlReady(true);
      })
      .catch((e) => console.error(e));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth,
        h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      // object-cover in UV space: crop whichever texture axis overflows.
      const canvasAr = w / h;
      const texAr = TEX_W / TEX_H;
      let sx = 1,
        sy = 1;
      if (canvasAr < texAr) sx = canvasAr / texAr;
      else sy = texAr / canvasAr;
      gl.uniform2f(U("uUVScale"), sx, sy);
      gl.uniform2f(U("uUVOffset"), (1 - sx) / 2, (1 - sy) / 2);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // Only render while the section is on screen.
    let visible = false;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);

    // Progress over the section's scroll life: 0 when its top enters the
    // viewport bottom, 1 when its bottom leaves the top.
    const elementProgress = () => {
      const rect = canvas.getBoundingClientRect();
      const total = window.innerHeight + rect.height;
      if (total <= 0) return 0.5;
      return Math.min(Math.max((window.innerHeight - rect.top) / total, 0), 1);
    };

    let smoothP = reduced ? 0.5 : elementProgress();
    let prevT = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!ready || !visible) {
        prevT = now;
        return;
      }
      const d = dialsRef.current;
      const dt = Math.min((now - prevT) / 1000, 0.1);
      prevT = now;

      if (!reduced) {
        smoothP += (elementProgress() - smoothP) * (1 - Math.exp(-dt / d.trail));
      }
      const p = reduced ? 0.5 : Math.min(smoothP * d.travel, 1);
      const lightX = d.sweepStartX + (d.sweepEndX - d.sweepStartX) * p;

      gl.uniform3f(U("uLightPos"), lightX, d.lightY, d.lightZ);
      gl.uniform1f(U("uIntensity"), d.intensity);
      gl.uniform1f(U("uAmbient"), d.ambient);
      gl.uniform1f(U("uWarmth"), d.warmth);
      gl.uniform1f(U("uFalloff"), d.falloff);
      gl.uniform1f(U("uExposure"), d.exposure);
      gl.uniform1f(U("uSpec"), d.specular);
      gl.uniform1f(U("uShin"), d.shininess);
      gl.uniform1f(U("uSheen"), d.sheen);
      gl.uniform1f(U("uSheenFocus"), d.sheenFocus);
      gl.uniform1f(U("uNormStr"), d.normalStrength);
      gl.uniform1f(U("uHGrad"), d.heightRelief);
      gl.uniform1f(U("uRoughFloor"), d.roughFloor);
      gl.uniform1f(U("uRoughLo"), d.roughLo);
      gl.uniform1f(U("uRoughHi"), d.roughHi);
      gl.uniform1f(U("uRoughLeather"), d.roughLeather);
      gl.uniform1f(U("uFlipY"), d.flipNormalY);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      textures.forEach((t) => gl.deleteTexture(t));
      gl.deleteProgram(prog);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={className} role="img" aria-label={alt}>
      {/* Plain photo underneath: instant paint, and the fallback when WebGL
          is unavailable. The canvas fades over it once textures are live. */}
      <Image
        src="/patina-shelf/albedo.webp"
        alt=""
        aria-hidden
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover"
      />
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${
          glReady ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
