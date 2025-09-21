// Version 2.1 - Adding guard clauses for stability
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

    // --- Calculator & Table Logic (with Null Checks) ---
    const tablesTab = document.getElementById('tables-tab');
    if (tablesTab) {
        let tablesData = null;
        tablesTab.addEventListener('shown.bs.tab', async () => {
            if (!tablesData) {
                const addContainer = document.getElementById('addition-table-container');
                const mulContainer = document.getElementById('multiplication-table-container');
                if(addContainer) addContainer.innerHTML = '<p class="text-center">Loading...</p>';
                const response = await fetch('/get-tables');
                tablesData = await response.json();
                if(addContainer) renderTable(tablesData.header, tablesData.addition, addContainer);
                if(mulContainer) renderTable(tablesData.header, tablesData.multiplication, mulContainer);
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
        tableHTML += '</tbody></table>';
        container.innerHTML = tableHTML;
    }

    const calculateAllBtn = document.getElementById('calculate-all-btn');
    if (calculateAllBtn) {
        const num1Input = document.getElementById('num1');
        const num2Input = document.getElementById('num2');
        const resultArea = document.getElementById('result-area');
        const opsResultsGrid = document.getElementById('ops-results-grid');
        const errorDisplay = document.getElementById('error-display');

        calculateAllBtn.addEventListener('click', () => {
            const num1 = num1Input.value.trim();
            const num2 = num2Input.value.trim();
            clearCalculatorResults();
            let hasError = false;
            if (!num1) { triggerShake(num1Input); hasError = true; }
            if (!num2) { triggerShake(num2Input); hasError = true; }

            setTimeout(async () => {
                if (hasError) {
                    errorDisplay.textContent = 'Please enter both numbers.';
                    resultArea.classList.add('visible');
                    return;
                }
                const response = await fetch('/calculate-all', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ num1, num2 }) });
                const data = await response.json();
                if (data.error) {
                    errorDisplay.textContent = `Error: ${data.error}`;
                } else {
                    displayAllOpsResults(num1, num2, data);
                }
                resultArea.classList.add('visible');
            }, 10);
        });

        function clearCalculatorResults() { if(resultArea) { resultArea.classList.remove('visible'); opsResultsGrid.innerHTML = ''; errorDisplay.innerHTML = ''; } }
        function triggerShake(element) { element.classList.add('shake'); setTimeout(() => { element.classList.remove('shake'); }, 500); }

        function displayAllOpsResults(num1, num2, data) {
            const ops = { addition: '+', subtraction: '-', multiplication: '×', division: '÷' };
            opsResultsGrid.innerHTML = '';
            for (const opName in data.results) {
                const opData = data.results[opName];
                const resultItem = document.createElement('div');
                resultItem.classList.add('col');
                const problemBijective = `${num1} ${ops[opName]} ${num2}`;
                const decimalStep = opData.decimal !== null ? `${data.n1_decimal} ${ops[opName]} ${data.n2_decimal} = ${opData.decimal}` : opData.bijective;
                resultItem.innerHTML = `
                    <div class="op-result-item h-100">
                        <div class="op-title">${opName.charAt(0).toUpperCase() + opName.slice(1)}</div>
                        <div class="op-problem">${problemBijective}</div>
                        <div class="op-step">${decimalStep}</div>
                        <div class="op-answer">${opData.decimal !== null ? opData.bijective : '&nbsp;'}</div>
                    </div>
                `;
                opsResultsGrid.appendChild(resultItem);
            }
        }
    }
});
