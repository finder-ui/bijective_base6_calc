const canvas = document.getElementById('background-animation');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

let columns = Math.floor(width / 20);
let drops = [];

for (let x = 0; x < columns; x++) {
    drops[x] = 1;
}

const chars = "123456abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function getRainColor() {
    const styles = getComputedStyle(document.documentElement);
    return styles.getPropertyValue('--accent-color').trim();
}

function draw() {
    // Use a semi-transparent fill to create the fading trail effect
    const theme = document.documentElement.getAttribute('data-theme');
    ctx.fillStyle = theme === 'dark' ? 'rgba(10, 25, 47, 0.05)' : 'rgba(248, 249, 250, 0.05)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = getRainColor();
    ctx.font = '15px Fira Code';

    for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * 20, drops[i] * 20);

        // Reset drop to the top randomly to make the rain effect uneven
        if (drops[i] * 20 > height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    columns = Math.floor(width / 20);
    drops = [];
    for (let x = 0; x < columns; x++) {
        drops[x] = 1;
    }
});

// Start the animation loop
setInterval(draw, 33);
