document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('background-animation');
    const ctx = canvas.getContext('2d');

    // Set canvas to full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // The characters that will be dropping
    const letters = '123456'.split('');

    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);

    // An array to track the y-position of each dropping letter column
    const drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = 1;
    }

    let animationInterval;

    function draw() {
        // Get the current theme's colors
        const bodyStyles = getComputedStyle(document.body);
        const bgColor = bodyStyles.getPropertyValue('--bg-color');
        const accentColor = bodyStyles.getPropertyValue('--accent-color');

        // Create a semi-transparent background to create the fading trail effect
        ctx.fillStyle = `rgba(${hexToRgb(bgColor)}, 0.1)`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Set the color for the letters
        ctx.fillStyle = accentColor;
        ctx.font = `${fontSize}px Fira Code`;

        // Loop through the columns
        for (let i = 0; i < drops.length; i++) {
            const text = letters[Math.floor(Math.random() * letters.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            // Reset the drop to the top randomly to make the rain uneven
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }

            // Move the drop down
            drops[i]++;
        }
    }

    function hexToRgb(hex) {
        // Helper to convert hex color to rgb for the rgba() background
        let r = 0, g = 0, b = 0;
        if (hex.length == 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length == 7) {
            r = parseInt(hex[1] + hex[2], 16);
            g = parseInt(hex[3] + hex[4], 16);
            b = parseInt(hex[5] + hex[6], 16);
        }
        return `${r},${g},${b}`;
    }

    function startAnimation() {
        if (animationInterval) clearInterval(animationInterval);
        animationInterval = setInterval(draw, 33);
    }

    // Restart animation on window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        startAnimation();
    });

    // Initial start
    startAnimation();
});
