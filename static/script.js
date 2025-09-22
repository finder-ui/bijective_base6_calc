document.addEventListener('DOMContentLoaded', () => {
    const htmlElement = document.documentElement;

    // --- Client-Side Bijective Logic ---
    const toBijective = (n) => {
        if (n <= 0) return "(N/A)";
        const chars = "123456";
        let result = '';
        while (n > 0) {
            result = chars[(n - 1) % 6] + result;
            n = Math.floor((n - 1) / 6);
        }
        return result;
    };

    const fromBijective = (s) => {
        if (!s || !/^[1-6]+$/.test(s)) {
            throw new Error("Invalid bijective base-6 input.");
        }
        let n = 0;
        for (let char of s) {
            n = n * 6 + parseInt(char, 10);
        }
        return n;
    };

    // --- Theme Switcher Logic ---
    const themeSwitcher = document.getElementById('theme-switcher');
    function setTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (themeSwitcher) themeSwitcher.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    }
    if (themeSwitcher) {
        themeSwitcher.addEventListener('click', () => {
            const newTheme = htmlElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }

    // --- Internationalization (i18n) Logic ---
    const supportedLangs = {
        'en': { flag: '🇺🇸', name: 'English' }, 'ru': { flag: '🇷🇺', name: 'Русский' }, 'he': { flag: '🇮🇱', name: 'עברית' },
        'es': { flag: '🇪🇸', name: 'Español' }, 'fr': { flag: '🇫🇷', name: 'Français' }, 'de': { flag: '🇩🇪', name: 'Deutsch' },
        'ar': { flag: '🇸🇦', name: 'العربية' }, 'zh': { flag: '🇨🇳', name: '中文' }, 'ja': { flag: '🇯🇵', name: '日本語' }
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
        document.querySelectorAll('[data-i18n]').forEach(el => { if (data[el.dataset.i18n] !== undefined) el.innerHTML = data[el.dataset.i18n]; });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { if (data[el.dataset.i18nPlaceholder] !== undefined) el.placeholder = data[el.dataset.i18nPlaceholder]; });
        document.querySelectorAll('[data-i18n-aria-label]').forEach(el => { if (data[el.dataset.i18nAriaLabel] !== undefined) el.setAttribute('aria-label', data[el.dataset.i18nAriaLabel]); });
        document.querySelectorAll('[data-i18n-list]').forEach(ul => {
            const key = ul.dataset.i18nList;
            if (data[key] && Array.isArray(data[key])) {
                ul.innerHTML = data[key].map(item => `<li class="list-group-item">${item}</li>`).join('');
            }
        });
    }

    function setupLangSwitcher() {
        const mainBtn = document.getElementById('lang-switcher-btn');
        const menu = document.getElementById('lang-switcher-menu');
        if (!mainBtn || !menu) return;
        menu.innerHTML = '';
        for (const [code, details] of Object.entries(supportedLangs)) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.className = 'dropdown-item';
            a.href = '#';
            a.innerHTML = `<span class="flag">${details.flag}</span> ${details.name}`;
            a.addEventListener('click', (e) => { e.preventDefault(); setLanguage(code); });
            li.appendChild(a);
            menu.appendChild(li);
        }
    }

    function updateLangSwitcherUI(lang) {
        const mainBtn = document.getElementById('lang-switcher-btn');
        if (mainBtn && supportedLangs[lang]) mainBtn.innerHTML = supportedLangs[lang].flag;
    }

    // --- Live Conversion Explorer Logic ---
    const decimalInput = document.getElementById('decimal-input');
    const conversionResults = document.getElementById('conversion-results');
    if (decimalInput) {
        decimalInput.addEventListener('input', () => {
            const decimalValue = parseInt(decimalInput.value, 10);
            if (!decimalValue || decimalValue <= 0) {
                conversionResults.innerHTML = '';
                return;
            }
            conversionResults.innerHTML = `
                <div class="result-grid">
                    <div><strong>Decimal:</strong> <code>${decimalValue}</code></div>
                    <div><strong>Binary:</strong> <code>${decimalValue.toString(2)}</code></div>
                    <div><strong>Hexadecimal:</strong> <code>${decimalValue.toString(16).toUpperCase()}</code></div>
                    <div><strong>Bijective Base-6:</strong> <code>${toBijective(decimalValue)}</code></div>
                </div>`;
        });
    }

    // --- Calculator Logic ---
    const num1Input = document.getElementById('num1');
    const num2Input = document.getElementById('num2');
    const calculateAllBtn = document.getElementById('calculate-all-btn');
    const resultArea = document.getElementById('result-area');
    const opsResultsGrid = document.getElementById('ops-results-grid');
    const errorDisplay = document.getElementById('error-display');

    if (calculateAllBtn) {
        calculateAllBtn.addEventListener('click', () => {
            try {
                const num1 = num1Input.value.trim();
                const num2 = num2Input.value.trim();
                if (!num1 || !num2) throw new Error('Please enter both numbers.');

                const n1 = fromBijective(num1);
                const n2 = fromBijective(num2);

                const results = {
                    addition: { dec: n1 + n2, op: '+' },
                    subtraction: { dec: n1 - n2, op: '-' },
                    multiplication: { dec: n1 * n2, op: '×' },
                    division: { dec: n2 !== 0 ? (n1 / n2) : null, op: '÷', rem: n2 !== 0 ? n1 % n2 : null }
                };

                opsResultsGrid.innerHTML = Object.entries(results).map(([opName, res]) => {
                    let bijectiveResult;
                    if (opName === 'division') {
                        bijectiveResult = res.dec === null ? '(N/A)' : (res.rem !== 0 ? `(Rem: ${res.rem})` : toBijective(res.dec));
                    } else {
                        bijectiveResult = toBijective(res.dec);
                    }
                    return `
                        <div class="col">
                            <div class="op-result-item h-100">
                                <div class="op-title">${opName.charAt(0).toUpperCase() + opName.slice(1)}</div>
                                <div class="op-problem">${num1} ${res.op} ${num2}</div>
                                <div class="op-step">${n1} ${res.op} ${n2} = ${res.dec !== null ? (Number.isInteger(res.dec) ? res.dec : res.dec.toFixed(2)) : 'N/A'}</div>
                                <div class="op-answer">${bijectiveResult}</div>
                            </div>
                        </div>`;
                }).join('');

                errorDisplay.textContent = '';
                resultArea.classList.add('visible');

            } catch (error) {
                errorDisplay.textContent = `Error: ${error.message}`;
                resultArea.classList.add('visible');
                opsResultsGrid.innerHTML = '';
            }
        });
    }

    // --- Practice Mode Logic ---
    const quizContainer = document.getElementById('quiz-container');
    if(quizContainer) {
        // ... (Practice mode logic will be added here in a subsequent step)
    }

    // --- Initial Load ---
    setupLangSwitcher();
    const initialLang = localStorage.getItem('language') || 'en';
    setLanguage(initialLang);
    const initialTheme = localStorage.getItem('theme') || 'light';
    setTheme(initialTheme);
});
