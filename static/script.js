document.addEventListener('DOMContentLoaded', () => {
    const htmlElement = document.documentElement;

    // --- Theme Switcher Logic (Simplified 2-State Toggle) ---
    const themeSwitcher = document.getElementById('theme-switcher');
    
    function setTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (themeSwitcher) {
            themeSwitcher.innerHTML = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    if (themeSwitcher) {
        themeSwitcher.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
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
        const mainBtn = document.getElementById('lang-switcher-btn');
        const menu = document.getElementById('lang-switcher-menu');
        if (!mainBtn || !menu) return;

        menu.innerHTML = ''; // Clear any existing options
        for (const [code, details] of Object.entries(supportedLangs)) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.className = 'dropdown-item';
            a.href = '#';
            a.dataset.lang = code;
            a.innerHTML = `<span class="flag">${details.flag}</span> ${details.name}`;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                setLanguage(code);
            });
            li.appendChild(a);
            menu.appendChild(li);
        }
    }

    function updateLangSwitcherUI(lang) {
        const mainBtn = document.getElementById('lang-switcher-btn');
        if (mainBtn && supportedLangs[lang]) {
            mainBtn.innerHTML = supportedLangs[lang].flag;
        }
    }

    // --- Initial Load ---
    setupLangSwitcher();
    const initialLang = localStorage.getItem('language') || 'en';
    setLanguage(initialLang);
    const initialTheme = localStorage.getItem('theme') || 'light';
    setTheme(initialTheme);

    // --- Tab Content Population (Example for Calculator Tab) ---
    const calculatorTab = document.getElementById('tab-calculator');
    if(calculatorTab) {
        calculatorTab.innerHTML = `
            <section>
                <div class="row g-5">
                    <div class="col-lg-6">
                        <h2 data-i18n="liveConverterTitle"></h2>
                        <p data-i18n="liveConverterDesc"></p>
                        <div class="mb-3">
                            <label for="decimal-input" class="form-label" data-i18n="decimalInputLabel"></label>
                            <input type="number" class="form-control" id="decimal-input" data-i18n-placeholder="decimalInputPlaceholder" min="1">
                        </div>
                        <div id="conversion-results"></div>
                    </div>
                    <div class="col-lg-6">
                        <h2 data-i18n="calculatorTitle"></h2>
                        <p data-i18n="calculatorDesc"></p>
                        <div class="row g-2 mb-3">
                            <div class="col-sm-6"><input type="text" class="form-control" id="num1" data-i18n-placeholder="num1Placeholder"></div>
                            <div class="col-sm-6"><input type="text" class="form-control" id="num2" data-i18n-placeholder="num2Placeholder"></div>
                        </div>
                        <div class="d-grid">
                            <button id="calculate-all-btn" class="btn btn-primary" data-i18n="calculateBtn"></button>
                        </div>
                    </div>
                </div>
            </section>
            <section id="result-area" class="mt-4">
                <h3 data-i18n="resultsTitle"></h3>
                <div id="ops-results-grid" class="row row-cols-1 row-cols-md-2 g-3"></div>
                <div id="error-display" class="mt-3 text-center"></div>
            </section>
        `;
    }
    // NOTE: Similar population logic would be needed for other tabs if they were not static
});
