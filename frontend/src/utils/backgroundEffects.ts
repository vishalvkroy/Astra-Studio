import gsap from 'gsap';

// Inspired by 21st.dev background effects
export const createDynamicBackground = (container: HTMLElement) => {
  // Create gradient mesh
  const canvas = document.createElement('canvas');
  canvas.className = 'dynamic-background-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '-1';
  canvas.style.pointerEvents = 'none';
  
  container.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Gradient animation
  let time = 0;
  const animate = () => {
    time += 0.005;
    
    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    
    const hue1 = (time * 50) % 360;
    const hue2 = (time * 50 + 120) % 360;
    const hue3 = (time * 50 + 240) % 360;
    
    gradient.addColorStop(0, `hsla(${hue1}, 70%, 50%, 0.1)`);
    gradient.addColorStop(0.5, `hsla(${hue2}, 70%, 50%, 0.1)`);
    gradient.addColorStop(1, `hsla(${hue3}, 70%, 50%, 0.1)`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    requestAnimationFrame(animate);
  };
  
  animate();
  
  return () => {
    window.removeEventListener('resize', resizeCanvas);
    canvas.remove();
  };
};

export const createFloatingParticles = (container: HTMLElement, count: number = 50) => {
  const particles: HTMLElement[] = [];
  
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'floating-particle';
    particle.style.position = 'fixed';
    particle.style.width = `${Math.random() * 4 + 2}px`;
    particle.style.height = particle.style.width;
    particle.style.borderRadius = '50%';
    particle.style.background = `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, 255, ${Math.random() * 0.5 + 0.3})`;
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '0';
    
    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * window.innerHeight;
    
    particle.style.left = `${startX}px`;
    particle.style.top = `${startY}px`;
    
    container.appendChild(particle);
    particles.push(particle);
    
    gsap.to(particle, {
      x: `+=${Math.random() * 200 - 100}`,
      y: `+=${Math.random() * 200 - 100}`,
      duration: Math.random() * 10 + 10,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
    
    gsap.to(particle, {
      opacity: Math.random() * 0.5 + 0.3,
      duration: Math.random() * 3 + 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }
  
  return () => {
    particles.forEach(p => p.remove());
  };
};

export const createGridPattern = (container: HTMLElement) => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'grid-pattern');
  svg.style.position = 'fixed';
  svg.style.top = '0';
  svg.style.left = '0';
  svg.style.width = '100%';
  svg.style.height = '100%';
  svg.style.zIndex = '-1';
  svg.style.opacity = '0.1';
  svg.style.pointerEvents = 'none';
  
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
  pattern.setAttribute('id', 'grid');
  pattern.setAttribute('width', '50');
  pattern.setAttribute('height', '50');
  pattern.setAttribute('patternUnits', 'userSpaceOnUse');
  
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M 50 0 L 0 0 0 50');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'rgba(100, 200, 255, 0.3)');
  path.setAttribute('stroke-width', '1');
  
  pattern.appendChild(path);
  defs.appendChild(pattern);
  svg.appendChild(defs);
  
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('width', '100%');
  rect.setAttribute('height', '100%');
  rect.setAttribute('fill', 'url(#grid)');
  
  svg.appendChild(rect);
  container.appendChild(svg);
  
  return () => {
    svg.remove();
  };
};

export const createGlowEffect = (element: HTMLElement, color: string = '#00f0ff') => {
  gsap.to(element, {
    boxShadow: `0 0 20px ${color}, 0 0 40px ${color}, 0 0 60px ${color}`,
    duration: 1.5,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
};

export const createRippleEffect = (container: HTMLElement, x: number, y: number) => {
  const ripple = document.createElement('div');
  ripple.style.position = 'fixed';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.width = '0';
  ripple.style.height = '0';
  ripple.style.borderRadius = '50%';
  ripple.style.border = '2px solid rgba(100, 200, 255, 0.6)';
  ripple.style.pointerEvents = 'none';
  ripple.style.transform = 'translate(-50%, -50%)';
  
  container.appendChild(ripple);
  
  gsap.to(ripple, {
    width: 200,
    height: 200,
    opacity: 0,
    duration: 1,
    ease: 'power2.out',
    onComplete: () => ripple.remove(),
  });
};
