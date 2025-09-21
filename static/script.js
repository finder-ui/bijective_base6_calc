document.addEventListener('DOMContentLoaded', () => {
    const htmlElement = document.documentElement;

    // --- Theme Switcher Logic (with Null Check) ---
    const themeSwitcher = document.getElementById('theme-switcher');
    if (themeSwitcher) {
        const themes = ['light', 'dark', 'dark-green'];
        const themeIcons = { 'light': '🌙', 'dark': '🟢', 'dark-green': '☀️' };

        function setTheme(theme) {
            htmlElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            const currentIndex = themes.indexOf(theme);
            const nextIndex = (currentIndex + 1) % themes.length;
            const nextTheme = themes[nextIndex];
            themeSwitcher.innerHTML = themeIcons[nextTheme] || '🌙';
        }

        themeSwitcher.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
            const currentIndex = themes.indexOf(currentTheme);
            const nextIndex = (currentIndex + 1) % themes.length;
            setTheme(themes[nextIndex]);
        });

        // Set initial theme on load
        const initialTheme = localStorage.getItem('theme') || 'light';
        setTheme(initialTheme);
    }

    // --- Internationalization (i18n) Logic ---
    const supportedLangs = {
        'en': { flag: '🇺🇸', name: 'English' },
        'ru': { flag: '🇷🇺', name: 'Русский' },
        'he': { flag: '🇮🇱', name: 'עברית' },
        'es': { flag: '🇪🇸', name: 'Español' },
        'fr': { flag: '🇫🇷', name: 'Français' },
        'de': { flag: '🇩🇪', name: 'Deutsch' },
        'ar': { flag: '🇸🇦', name: 'العربية' }
    };

    async function setLanguage(lang) {
        if (!supportedLangs[lang]) return;
        try {
            const response = await fetch(`/locales/${lang}.json`);
            if (!response.ok) return;
            const langData = await response.json();
            applyTranslations(langData);
            htmlElement.setAttribute('lang', lang);
            htmlElement.dir = (lang === 'he' || lang === 'ar') ? 'rtl' : 'ltr';
            localStorage.setItem('language', lang);
            updateLangSwitcherUI(lang);
        } catch (error) { console.error(`Error setting language to ${lang}:`, error); }
    }

    function applyTranslations(data) {
        document.querySelectorAll('[data-i18n]').forEach(el => { if (data[el.dataset.i18n]) el.innerHTML = data[el.dataset.i18n]; });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { if (data[el.dataset.i18nPlaceholder]) el.placeholder = data[el.dataset.i18nPlaceholder]; });
        document.querySelectorAll('[data-i18n-aria-label]').forEach(el => { if (data[el.dataset.i18nAriaLabel]) el.setAttribute('aria-label', data[el.dataset.i18nAriaLabel]); });
    }

    function setupLangSwitcher() {
        const container = document.getElementById('lang-switcher-container');
        if (!container) return;
        container.innerHTML = '';
        for (const [code, details] of Object.entries(supportedLangs)) {
            const btn = document.createElement('span');
            btn.className = 'lang-btn';
            btn.textContent = details.flag;
            btn.dataset.lang = code;
            btn.setAttribute('role', 'button');
            btn.setAttribute('aria-label', `Switch to ${details.name}`);
            container.appendChild(btn);
        }
        container.addEventListener('click', (event) => {
            const clickedButton = event.target.closest('.lang-btn');
            if (clickedButton && clickedButton.dataset.lang) {
                setLanguage(clickedButton.dataset.lang);
            }
        });
    }

    function updateLangSwitcherUI(lang) {
        document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
    }

    // --- Initial Load ---
    setupLangSwitcher();
    const initialLang = localStorage.getItem('language') || 'en';
    setLanguage(initialLang);

    // ... (rest of the calculator, table, and other logic remains the same) ...
});
