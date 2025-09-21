const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let columns;
let drops = [];
let animationId = null;

// Characters to be used in the animation
const chars = '123456';
const charArray = chars.split('');

function setupMatrix() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const fontSize = 16;
    columns = Math.floor(canvas.width / fontSize);
    drops = [];
    for (let x = 0; x < columns; x++) {
        drops[x] = 1;
    }
}

function draw() {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    let bgColor, textColor;

    if (theme === 'dark') {
        bgColor = 'rgba(10, 25, 47, 0.05)'; // Fading background for dark theme
        textColor = '#64ffda'; // Neon green for dark theme
    } else {
        bgColor = 'rgba(248, 249, 250, 0.05)'; // Fading background for light theme
        textColor = '#007bff'; // Blue for light theme
    }

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = textColor;
    ctx.font = '16px Fira Code';

    for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        ctx.fillText(text, i * 16, drops[i] * 16);

        if (drops[i] * 16 > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

function startMatrix() {
    if (animationId) cancelAnimationFrame(animationId);
    setupMatrix();
    function animate() {
        draw();
        animationId = requestAnimationFrame(animate);
    }
    animate();
}

// Initial setup
startMatrix();

// Adjust canvas on window resize
window.addEventListener('resize', startMatrix);

// Listen for a custom event that the main script will fire on theme change
document.addEventListener('themeChanged', () => {
    // No need to do anything here, the draw() function automatically picks up the new theme
});
