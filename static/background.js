document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('background-animation');
    if (!canvas) {
        console.error("Background canvas not found!");
        return;
    }
    const ctx = canvas.getContext('2d');

    // Set canvas to full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const letters = '123456'.split('');
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = [];

    for (let i = 0; i < columns; i++) {
        drops[i] = 1;
    }

    function draw() {
        const bodyStyles = getComputedStyle(document.body);
        const accentColor = bodyStyles.getPropertyValue('--accent-color').trim();

        // Create a semi-transparent black background to create the fading trail effect.
        // A higher alpha value (e.g., 0.15) makes the trails fade faster, resulting in a dimmer background.
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Set the color for the letters
        ctx.fillStyle = accentColor;

        // Add a softer glow effect to the letters
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 10; // Reduced from 15 for a less intense glow

        ctx.font = `${fontSize}px 'Roboto Mono', monospace`;

        for (let i = 0; i < drops.length; i++) {
            const text = letters[Math.floor(Math.random() * letters.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
        // Reset shadow for the next frame to avoid affecting other elements
        ctx.shadowBlur = 0;
    }

    let animationInterval;
    function startAnimation() {
        if (animationInterval) {
            clearInterval(animationInterval);
        }
        // Redraw the animation at a consistent frame rate
        animationInterval = setInterval(draw, 50);
    }

    // Resize the canvas to fill browser window dynamically
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        startAnimation();
    });

    // Initial start
    startAnimation();
});