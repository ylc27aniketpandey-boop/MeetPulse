import React, { useEffect, useRef } from 'react';

const PlasmaBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // Vertex shader
    const vsSource = `
      attribute vec4 aVertexPosition;
      void main() {
        gl_Position = aVertexPosition;
      }
    `;

    // Fragment shader: Fluid Plasma Effect
    const fsSource = `
      precision highp float;
      uniform float uTime;
      uniform vec2 uResolution;

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution.xy;
        float t = uTime * 0.5;

        // Fluid distortion loop
        for(float i = 1.0; i < 4.0; i++) {
          uv.x += 0.6 / i * sin(i * 2.5 * uv.y + t);
          uv.y += 0.6 / i * cos(i * 1.5 * uv.x + t);
        }

        // Color Palette
        vec3 colorBg = vec3(0.059, 0.090, 0.165); // Slate 900
        vec3 colorPrimary = vec3(0.055, 0.647, 0.914); // Primary 500 (Sky)
        vec3 colorAccent = vec3(0.545, 0.361, 0.965); // Accent 500 (Violet)

        // Calculate intensity based on distorted UVs
        float val = 0.5 + 0.5 * sin(uv.x + uv.y + t);
        
        // Mix colors subtly to keep it dark
        vec3 col = mix(colorBg, colorPrimary, val * 0.3); 
        col = mix(col, colorAccent, smoothstep(0.4, 0.8, val) * 0.3);

        // Add a slight noise/grain if needed, or just output
        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fsSource);

    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const vertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
    gl.enableVertexAttribArray(vertexPosition);
    gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);

    gl.useProgram(program);

    const uTime = gl.getUniformLocation(program, 'uTime');
    const uResolution = gl.getUniformLocation(program, 'uResolution');

    let animationId: number;
    let startTime = performance.now();

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }

      gl.uniform1f(uTime, (performance.now() - startTime) / 1000);
      gl.uniform2f(uResolution, width, height);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      gl.deleteProgram(program);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none" />;
};

export default PlasmaBackground;