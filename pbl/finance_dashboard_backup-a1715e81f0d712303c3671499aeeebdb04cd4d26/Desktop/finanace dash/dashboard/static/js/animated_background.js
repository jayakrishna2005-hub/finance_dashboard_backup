// Animated floating financial icons with random movement and opacity changes

document.addEventListener('DOMContentLoaded', () => {
  const container = document.createElement('div');
  container.classList.add('animated-floating-icons');
  document.body.appendChild(container);

  const icons = [
    '💰', '📈', '📉', '💹', '🏦', '💳', '📊', '💵', '🪙', '💸'
  ];

  const iconElements = [];

  // Create icon elements
  for (let i = 0; i < 20; i++) {
    const icon = document.createElement('div');
    icon.classList.add('animated-icon');
    icon.textContent = icons[Math.floor(Math.random() * icons.length)];
    icon.style.left = Math.random() * 100 + 'vw';
    icon.style.top = Math.random() * 100 + 'vh';
    icon.style.fontSize = (Math.random() * 24 + 16) + 'px';
    icon.style.opacity = Math.random() * 0.5 + 0.3;
    container.appendChild(icon);
    iconElements.push(icon);
  }

  // Animate icons with random floating movement
  function animate() {
    iconElements.forEach(icon => {
      let left = parseFloat(icon.style.left);
      let top = parseFloat(icon.style.top);
      let dx = (Math.random() - 0.5) * 0.5;
      let dy = (Math.random() - 0.5) * 0.5;

      left += dx;
      top += dy;

      if (left < 0) left = 0;
      if (left > 100) left = 100;
      if (top < 0) top = 0;
      if (top > 100) top = 100;

      icon.style.left = left + 'vw';
      icon.style.top = top + 'vh';

      // Randomly change opacity
      let opacity = parseFloat(icon.style.opacity);
      opacity += (Math.random() - 0.5) * 0.05;
      if (opacity < 0.3) opacity = 0.3;
      if (opacity > 0.8) opacity = 0.8;
      icon.style.opacity = opacity;
    });

    requestAnimationFrame(animate);
  }

  animate();
});
