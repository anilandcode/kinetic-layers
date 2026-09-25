"use client";

import { useEffect, useRef } from "react";
import s from "./fx.module.css";

/**
 * A living gradient, dithered into dots.
 *
 * One full-screen quad and a fragment shader: domain-warped noise flows
 * slowly through three colours, then an 8×8 Bayer matrix decides which cells
 * light up, and each lit cell is drawn as a round dot. The result is the
 * dotted, dithered glow of the cinematic references — generated, not an
 * image, so it is ours and costs a few kilobytes.
 *
 * It follows the pointer (a soft bloom), pauses when off screen or when the
 * tab is hidden, and draws one still frame under prefers-reduced-motion. If
 * WebGL is unavailable the CSS fallback gradient behind it stays.
 */

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;
uniform float u_cell;
uniform float u_gain;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.02; a *= 0.5; } return v; }

float bayer2(vec2 a){ a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a){ return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a){ return bayer4(0.5 * a) * 0.25 + bayer2(a); }

void main(){
  vec2 frag = gl_FragCoord.xy;
  vec2 cell = floor(frag / u_cell);
  vec2 uv = ((cell + 0.5) * u_cell) / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * aspect, uv.y) * 1.35;

  float t = u_time * 0.045;
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 0.6), fbm(p + 3.0 * q + vec2(8.3, 2.8) - t * 0.4));
  float f = fbm(p + 2.4 * r);

  vec2 dm = (uv - u_mouse) * vec2(aspect, 1.0);
  float bloom = exp(-dot(dm, dm) * 7.0);

  float lum = clamp((f - 0.28) * 1.9 + bloom * 0.45, 0.0, 1.0) * u_gain;

  vec3 col = mix(u_c3, u_c1, smoothstep(0.25, 0.62, f));
  col = mix(col, u_c2, smoothstep(0.55, 0.92, f + bloom * 0.35));

  float on = step(bayer8(cell), lum);
  vec2 local = fract(frag / u_cell) - 0.5;
  float dotMask = smoothstep(0.46, 0.28, length(local));

  vec3 base = col * lum * 0.32;
  vec3 lit = col * (0.55 + 0.6 * lum) * on * dotMask;
  float alpha = clamp(lum * 0.32 + on * dotMask * (0.35 + 0.65 * lum), 0.0, 1.0);
  gl_FragColor = vec4(base + lit, alpha);
}
`;

type RGB = [number, number, number];

export default function DitherField({
  colors,
  cell = 5,
  gain = 1,
  className,
}: {
  /** Three colours, 0–1 RGB: highlight, glow, shadow. */
  colors: [RGB, RGB, RGB];
  /** Dot pitch in CSS pixels. */
  cell?: number;
  /** Overall brightness, 0–1.2. */
  gain?: number;
  className?: string;
}) {
  const canvas = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const gl = el.getContext("webgl", { premultipliedAlpha: false, antialias: false, alpha: true });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.warn("[DitherField]", gl.getShaderInfoLog(sh));
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    /* A field that cannot compile leaves the CSS behind it showing — say why. */
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("[DitherField]", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const u = (name: string) => gl.getUniformLocation(prog, name);
    const [c1, c2, c3] = colors;
    gl.uniform3f(u("u_c1"), ...c1);
    gl.uniform3f(u("u_c2"), ...c2);
    gl.uniform3f(u("u_c3"), ...c3);
    gl.uniform1f(u("u_gain"), gain);

    /* 1×, not the screen's ratio: the dots are 5px cells, so extra pixels
       only multiply the shader's work. */
    const dpr = 1;
    const resize = () => {
      const w = Math.max(1, Math.floor(el.clientWidth * dpr));
      const h = Math.max(1, Math.floor(el.clientHeight * dpr));
      if (el.width !== w || el.height !== h) {
        el.width = w;
        el.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(u("u_res"), w, h);
      gl.uniform1f(u("u_cell"), cell * dpr);
    };
    resize();

    /* The pointer eases toward where it is, so the bloom drifts rather than jumps. */
    const mouse = { x: 0.62, y: 0.55, tx: 0.62, ty: 0.55 };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / r.width;
      mouse.ty = 1 - (e.clientY - r.top) / r.height;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    /* Thirty frames a second is plenty for a field this slow, and while the
       page scrolls it holds still: its GPU work then stops competing with the
       scroll, and the glass above it stops being re-blurred. Time is
       accumulated rather than read from the clock, so it resumes where it
       paused instead of jumping. */
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = true;
    let scrolling = false;
    let raf = 0;
    let t = 12;
    let last = 0;
    const draw = () => {
      gl.uniform2f(u("u_mouse"), mouse.x, mouse.y);
      gl.uniform1f(u("u_time"), t);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    const frame = (now: number) => {
      raf = 0;
      if (still) {
        draw();
        return;
      }
      if (scrolling || !visible || document.hidden) return;
      if (now - last >= 32) {
        const dt = last ? Math.min(now - last, 50) : 16;
        last = now;
        t += dt / 1000;
        mouse.x += (mouse.tx - mouse.x) * 0.1;
        mouse.y += (mouse.ty - mouse.y) * 0.1;
        draw();
      }
      raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    };
    let settle = 0;
    const onScroll = () => {
      scrolling = true;
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        scrolling = false;
        last = 0;
        kick();
      }, 150);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    /* Resizing a canvas clears it, so every resize also redraws — which a
       still (reduced-motion) field would otherwise never do. */
    const ro = new ResizeObserver(() => {
      resize();
      kick();
    });
    ro.observe(el);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
    });
    io.observe(el);
    const onVis = () => !document.hidden && kick();
    document.addEventListener("visibilitychange", onVis);
    el.dataset.ready = "";
    kick();

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      /* No loseContext() here: a canvas hands back the same context on the
         next getContext(), so forcing it lost would blank the field when an
         effect re-runs (React's dev double-mount did exactly that). The
         context is freed with the canvas. */
    };
    // Colours are fixed for the life of a mounted field.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={canvas} className={`${s.dither} ${className ?? ""}`} aria-hidden="true" />;
}
