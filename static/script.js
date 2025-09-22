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
        } catch (error) { console.error(`Error setting language: ${error}`); }
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
            const a = document.createElement('a');
            a.className = 'dropdown-item';
            a.href = '#';
            a.dataset.lang = code;
            a.innerHTML = `<span class="flag">${details.flag}</span> ${details.name}`;
            a.addEventListener('click', (e) => { e.preventDefault(); setLanguage(code); });
            menu.appendChild(document.createElement('li')).appendChild(a);
        }
    }

    function updateLangSwitcherUI(lang) {
        const mainBtn = document.getElementById('lang-switcher-btn');
        if (mainBtn && supportedLangs[lang]) mainBtn.innerHTML = supportedLangs[lang].flag;
    }

    // --- Tab & Table Logic ---
    const tablesTab = document.getElementById('tables-tab');
    let tablesData = null;
    if (tablesTab) {
        tablesTab.addEventListener('shown.bs.tab', async () => {
            if (!tablesData) {
                const addContainer = document.getElementById('addition-table-container');
                const mulContainer = document.getElementById('multiplication-table-container');
                addContainer.innerHTML = '<p class="text-center">Loading...</p>';
                const response = await fetch('/get-tables');
                tablesData = await response.json();
                renderTable(tablesData.header, tablesData.addition, addContainer);
                renderTable(tablesData.header, tablesData.multiplication, mulContainer);
            }
        });
    }

    function renderTable(header, data, container) {
        let tableHTML = '<table class="table table-bordered table-hover"><thead><tr><th>#</th>';
        header.forEach(h => tableHTML += `<th>${h}</th>`);
        tableHTML += '</tr></thead><tbody>';
        data.forEach((row, rowIndex) => {
            tableHTML += `<tr><th>${header[rowIndex]}</th>`;
            row.forEach(cell => tableHTML += `<td>${cell}</td>`);
            tableHTML += '</tr>';
        });
        container.innerHTML = tableHTML;
    }

    // --- Calculator & Converter Logic (Now Client-Side) ---
    const num1Input = document.getElementById('num1');
    const num2Input = document.getElementById('num2');
    const calculateAllBtn = document.getElementById('calculate-all-btn');
    const resultArea = document.getElementById('result-area');
    const opsResultsGrid = document.getElementById('ops-results-grid');
    const errorDisplay = document.getElementById('error-display');
    const decimalInput = document.getElementById('decimal-input');
    const conversionResults = document.getElementById('conversion-results');

    if (decimalInput) {
        decimalInput.addEventListener('input', (e) => {
            const decimalValue = parseInt(e.target.value, 10);
            if (!decimalValue || decimalValue <= 0) { conversionResults.innerHTML = ''; return; }
            conversionResults.innerHTML = `
                <div class="result-grid">
                    <div><strong>Decimal:</strong> <code>${decimalValue}</code></div>
                    <div><strong>Binary:</strong> <code>${decimalValue.toString(2)}</code></div>
                    <div><strong>Hexadecimal:</strong> <code>${decimalValue.toString(16).toUpperCase()}</code></div>
                    <div><strong>Bijective Base-6:</strong> <code>${toBijective(decimalValue)}</code></div>
                </div>`;
        });
    }

    if (calculateAllBtn) {
        calculateAllBtn.addEventListener('click', () => {
            try {
                const num1 = num1Input.value.trim();
                const num2 = num2Input.value.trim();
                if (!num1 || !num2) throw new Error("Please enter both numbers.");

                const n1 = fromBijective(num1);
                const n2 = fromBijective(num2);

                const results = {
                    addition: toBijective(n1 + n2),
                    subtraction: toBijective(n1 - n2),
                    multiplication: toBijective(n1 * n2),
                    division: n2 === 0 ? '(N/A)' : (n1 % n2 === 0 ? toBijective(n1 / n2) : `(Rem: ${n1 % n2})`)
                };

                displayAllOpsResults(num1, num2, results);
                errorDisplay.innerHTML = '';
                resultArea.classList.add('visible');
            } catch (e) {
                errorDisplay.textContent = `Error: ${e.message}`;
                resultArea.classList.add('visible');
            }
        });
    }

    function clearCalculatorResults() { if(resultArea) { resultArea.classList.remove('visible'); opsResultsGrid.innerHTML = ''; errorDisplay.innerHTML = ''; } }
    function triggerShake(element) { element.classList.add('shake'); setTimeout(() => { element.classList.remove('shake'); }, 500); }

    function displayAllOpsResults(num1, num2, data) {
        const ops = { addition: '+', subtraction: '-', multiplication: '×', division: '÷' };
        opsResultsGrid.innerHTML = '';
        for (const opName in data) {
            const resultItem = document.createElement('div');
            resultItem.classList.add('col');
            resultItem.innerHTML = `
                <div class="op-result-item h-100">
                    <div class="op-title">${opName.charAt(0).toUpperCase() + opName.slice(1)}</div>
                    <div class="op-problem">${num1} ${ops[opName]} ${num2}</div>
                    <div class="op-answer">${data[opName]}</div>
                </div>
            `;
            opsResultsGrid.appendChild(resultItem);
        }
    }
    
    // --- Initial Load ---
    setupLangSwitcher();
    const initialLang = localStorage.getItem('language') || 'en';
    setLanguage(initialLang);
    const initialTheme = localStorage.getItem('theme') || 'light';
    setTheme(initialTheme);
});
