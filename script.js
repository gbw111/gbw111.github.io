const canvas = document.getElementById("point-cloud");
const ctx = canvas.getContext("2d");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let width = 0;
let height = 0;
let deviceRatio = 1;
let points = [];
let frame = 0;
let mouse = { x: 0.5, y: 0.5 };

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  deviceRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(width * deviceRatio);
  canvas.height = Math.floor(height * deviceRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(deviceRatio, 0, 0, deviceRatio, 0, 0);
  buildPointCloud();
}

function buildPointCloud() {
  const count = Math.max(90, Math.min(180, Math.floor((width * height) / 8200)));
  points = Array.from({ length: count }, (_, index) => {
    const band = index / count;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      z: 0.4 + Math.random() * 1.6,
      phase: Math.random() * Math.PI * 2,
      band,
    };
  });
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 1;

  const motion = prefersReducedMotion.matches ? 0 : frame * 0.006;
  const mx = (mouse.x - 0.5) * 34;
  const my = (mouse.y - 0.5) * 24;

  for (let i = 0; i < points.length; i += 1) {
    const p = points[i];
    const wave = Math.sin(motion + p.phase) * 16 * p.z;
    const x = p.x + wave + mx * p.z;
    const y = p.y + Math.cos(motion * 0.85 + p.phase) * 10 * p.z + my * p.z;

    ctx.beginPath();
    ctx.fillStyle = p.band > 0.68 ? "rgba(180, 83, 9, 0.42)" : "rgba(15, 118, 110, 0.38)";
    ctx.arc(x, y, 1.8 + p.z * 0.9, 0, Math.PI * 2);
    ctx.fill();

    for (let j = i + 1; j < points.length; j += 1) {
      const q = points[j];
      const qWave = Math.sin(motion + q.phase) * 16 * q.z;
      const qx = q.x + qWave + mx * q.z;
      const qy = q.y + Math.cos(motion * 0.85 + q.phase) * 10 * q.z + my * q.z;
      const dx = x - qx;
      const dy = y - qy;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 96) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(32, 33, 36, ${0.12 * (1 - distance / 96)})`;
        ctx.moveTo(x, y);
        ctx.lineTo(qx, qy);
        ctx.stroke();
      }
    }
  }

  frame += 1;
  requestAnimationFrame(draw);
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("pointermove", (event) => {
  mouse = {
    x: event.clientX / Math.max(width, 1),
    y: event.clientY / Math.max(height, 1),
  };
});

resizeCanvas();
draw();

if (window.lucide) {
  window.lucide.createIcons({
    attrs: {
      "stroke-width": 2,
    },
  });
}
