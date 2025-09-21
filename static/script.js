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
        'ar': { flag: '🇸🇦', name: 'العربية' },
        'zh': { flag: '🇨🇳', name: '中文' },
        'ja': { flag: '🇯🇵', name: '日本語' }
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

    // --- Calculator Logic ---
    const num1Input = document.getElementById('num1');
    const num2Input = document.getElementById('num2');
    const calculateAllBtn = document.getElementById('calculate-all-btn');
    const resultArea = document.getElementById('result-area');
    const opsResultsGrid = document.getElementById('ops-results-grid');
    const errorDisplay = document.getElementById('error-display');

    if (calculateAllBtn) {
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
    }

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

    // --- Initial Load ---
    setupLangSwitcher();
    const initialLang = localStorage.getItem('language') || 'en';
    setLanguage(initialLang);
    const initialTheme = localStorage.getItem('theme') || 'light';
    setTheme(initialTheme);
});
