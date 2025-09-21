document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('background-animation');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const letters = '123456'.split('');
    const fontSize = 16;
    const columns = Math.floor(width / fontSize);

    const drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = 1;
    }

    function getThemeColor() {
        const styles = getComputedStyle(document.documentElement);
        return styles.getPropertyValue('--accent-color').trim() || '#007bff';
    }

    function draw() {
        ctx.fillStyle = 'rgba(10, 25, 47, 0.1)'; // Fading effect for dark theme
        if (document.documentElement.getAttribute('data-theme') === 'light') {
            ctx.fillStyle = 'rgba(248, 249, 250, 0.1)'; // Fading effect for light theme
        }
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = getThemeColor();
        ctx.font = `${fontSize}px Fira Code`;

        for (let i = 0; i < drops.length; i++) {
            const text = letters[Math.floor(Math.random() * letters.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    let animationInterval = setInterval(draw, 50);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        const newColumns = Math.floor(width / fontSize);
        while(drops.length < newColumns) drops.push(1);
        while(drops.length > newColumns) drops.pop();
    });

    // Re-initialize colors when theme changes
    const themeSwitcher = document.getElementById('theme-switcher');
    if(themeSwitcher) {
        themeSwitcher.addEventListener('click', () => {
            // We need a small delay for the CSS variables to update
            setTimeout(() => {
                // No need to do anything here, getThemeColor() will pick up the new color on the next draw call
            }, 50);
        });
    }
});
