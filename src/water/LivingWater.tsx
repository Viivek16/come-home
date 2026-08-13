import { useEffect, useRef, useState } from 'react';
import { breathValue } from '../breath/useBreath';
import { prefersReduced, useReducedMotion } from '../lib/motion';
import { targetParams, type WaterParams } from '../store/water';

/**
 * Living Water (§4) — ONE WebGL fragment-shader layer fixed behind the whole app.
 * Reads route intensity from the water store and the shared breath clock.
 *
 * Fallbacks, all verified:
 *  - prefers-reduced-motion → render ONE still frame, no RAF.
 *  - no WebGL context / context lost → CSS gradient-water layer.
 *  - document.hidden → cancel RAF, resume on focus.
 *  - DPR capped to 2, ~40fps cap; sustained jank (>32ms avg for 2s) → downgrade.
 */

const VERT = `
attribute vec2 a_pos; varying vec2 v_uv;
void main(){ v_uv = a_pos*0.5+0.5; gl_Position = vec4(a_pos,0.0,1.0); }
`;

const FRAG = `
precision highp float;
varying vec2 v_uv;
uniform vec2 u_res; uniform float u_time; uniform float u_breath;
uniform float u_intensity; uniform vec3 u_deep; uniform vec3 u_top; uniform vec3 u_glint;
float hash(vec2 p){ p=fract(p*vec2(123.34,345.45)); p+=dot(p,p+34.345); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p),f=fract(p);
  float a=hash(i),b=hash(i+vec2(1.,0.)),c=hash(i+vec2(0.,1.)),d=hash(i+vec2(1.,1.));
  vec2 u=f*f*(3.-2.*f); return mix(mix(a,b,u.x),mix(c,d,u.x),u.y); }
float fbm(vec2 p){ float v=0.,a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.02+7.0; a*=0.5; } return v; }
void main(){
  vec2 uv=v_uv; float ar=u_res.x/max(u_res.y,1.0); vec2 p=vec2(uv.x*ar,uv.y);
  float t=u_time*0.06;
  vec2 q; q.x=fbm(p*2.5+vec2(0.0,t)); q.y=fbm(p*2.5+vec2(5.2,t*0.8+1.3));
  float bs=1.0+(u_breath-0.5)*0.06;
  float caust=fbm(p*3.0*bs+q*1.6+vec2(t*0.5,-t*0.4));
  float ridge=1.0-abs(caust-0.5)*2.0; ridge=pow(clamp(ridge,0.0,1.0),3.5);
  vec3 col=mix(u_deep,u_top,pow(uv.y,1.2));
  vec2 lp=vec2(0.5+sin(u_time*0.05)*0.05,0.86);
  float light=smoothstep(0.62,0.0,distance(uv,lp));
  col+=u_glint*light*(0.10+0.05*u_breath);
  float glint=ridge*u_intensity*(0.55+0.45*u_breath);
  col+=u_glint*glint*(0.5+light*0.9);
  float vig=smoothstep(1.15,0.35,distance(uv,vec2(0.5,0.55)));
  col*=0.82+0.18*vig;
  gl_FragColor=vec4(col,1.0);
}
`;

const GLINT: [number, number, number] = [0.91, 0.788, 0.608]; // champagne (§4)
const MIN_INTERVAL = 1000 / 40; // ~40fps cap

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export default function LivingWater() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [css, setCss] = useState(false); // true → CSS gradient-water fallback
  const reduced = useReducedMotion(); // re-inits the layer on a runtime toggle

  useEffect(() => {
    if (css) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (canvas.getContext('webgl', {
      antialias: false,
      alpha: false,
      depth: false,
      powerPreference: 'low-power',
    }) || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) {
      setCss(true);
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram()!;
    if (!vs || !fs) return void setCss(true);
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return void setCss(true);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = {
      res: gl.getUniformLocation(prog, 'u_res'),
      time: gl.getUniformLocation(prog, 'u_time'),
      breath: gl.getUniformLocation(prog, 'u_breath'),
      intensity: gl.getUniformLocation(prog, 'u_intensity'),
      deep: gl.getUniformLocation(prog, 'u_deep'),
      top: gl.getUniformLocation(prog, 'u_top'),
      glint: gl.getUniformLocation(prog, 'u_glint'),
    };
    gl.uniform3fv(u.glint, GLINT);

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap DPR to 2 (§4)
      const w = Math.floor(canvas!.clientWidth * dpr);
      const h = Math.floor(canvas!.clientHeight * dpr);
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
      }
      gl!.viewport(0, 0, w, h);
    }
    resize();
    window.addEventListener('resize', resize);

    // Eased-toward-target current params (§4 ~1.2s transition via exp smoothing).
    const t0 = targetParams();
    const cur: WaterParams = { intensity: t0.intensity, deep: [...t0.deep], top: [...t0.top], speed: t0.speed };

    function draw(simTime: number) {
      resize();
      gl!.uniform1f(u.time, simTime);
      gl!.uniform1f(u.breath, breathValue());
      gl!.uniform1f(u.intensity, cur.intensity);
      gl!.uniform3fv(u.deep, cur.deep);
      gl!.uniform3fv(u.top, cur.top);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    }

    // First paint immediately (no black flash), then decide whether to loop.
    draw(0);

    let raf = 0;
    let last = performance.now();
    const startTs = last;
    let simTime = 0;
    let winSum = 0;
    let winCount = 0;
    let winTime = 0;

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      const rafDt = now - last;
      // Watchdog on raw cadence (not inflated by the fps cap). Warm-up grace:
      // skip the first 1.5s so shader-compile / first-paint jank can't
      // permanently downgrade a capable device (§4).
      if (now - startTs > 1500) {
        winSum += rafDt;
        winCount++;
        winTime += rafDt;
        if (winTime >= 2000) {
          // ponytail: 32ms avg (~31fps) downgrade threshold; tune if too eager
          if (winSum / winCount > 32) {
            cancelAnimationFrame(raf);
            setCss(true);
            return;
          }
          winSum = winCount = winTime = 0;
        }
      }
      if (rafDt < MIN_INTERVAL) return; // fps cap
      last = now;
      const dts = Math.min(rafDt, 50) / 1000;
      const target = targetParams();
      const k = 1 - Math.exp(-dts / 0.35);
      cur.intensity += (target.intensity - cur.intensity) * k;
      cur.speed += (target.speed - cur.speed) * k;
      for (let i = 0; i < 3; i++) {
        cur.deep[i] += (target.deep[i] - cur.deep[i]) * k;
        cur.top[i] += (target.top[i] - cur.top[i]) * k;
      }
      simTime += dts * cur.speed;
      draw(simTime);
    }

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!prefersReduced() && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      setCss(true);
    };
    canvas.addEventListener('webglcontextlost', onLost);
    document.addEventListener('visibilitychange', onVisibility);

    if (!prefersReduced()) raf = requestAnimationFrame(frame); // else: single still frame only

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onLost);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [css, reduced]);

  if (css) return <div className="water-fallback" aria-hidden />;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: 'fixed', inset: 0, zIndex: 0, width: '100%', height: '100%', display: 'block' }}
    />
  );
}
