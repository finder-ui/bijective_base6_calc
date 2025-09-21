document.addEventListener('DOMContentLoaded', () => {
    const supportedLangs = {
        'en': { flag: '🇺🇸', name: 'English' },
        'ru': { flag: '🇷🇺', name: 'Русский' },
        'he': { flag: '🇮🇱', name: 'עברית' },
        'es': { flag: '🇪🇸', name: 'Español' },
        'fr': { flag: '🇫🇷', name: 'Français' },
        'de': { flag: '🇩🇪', name: 'Deutsch' },
        'ar': { flag: '🇸🇦', name: 'العربية' }
    };

    const htmlElement = document.documentElement;

    // --- Utility Functions ---
    /**
     * Debounce function to limit the rate at which a function gets called.
     * @param {Function} func The function to debounce.
     * @param {number} delay The delay in milliseconds.
     * @returns {Function} The debounced function.
     */
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // --- Internationalization (i18n) Logic ---
    async function setLanguage(lang) {
        if (!supportedLangs[lang]) {
            console.error(`Language ${lang} not supported.`);
            return;
        }

        try {
            const response = await fetch(`/locales/${lang}.json`);
            if (!response.ok) {
                console.error(`Failed to load locale file for ${lang}. Status: ${response.status}`);
                return;
            }
            const langData = await response.json();

            applyTranslations(langData);

            htmlElement.setAttribute('lang', lang);
            htmlElement.dir = (lang === 'he' || lang === 'ar') ? 'rtl' : 'ltr';

            localStorage.setItem('language', lang);
            updateLangSwitcherUI(lang);
        } catch (error) {
            console.error(`Error processing language file for ${lang}:`, error);
        }
    }

    function applyTranslations(data) {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (data[key] !== undefined) el.innerHTML = data[key];
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (data[key] !== undefined) el.placeholder = data[key];
        });
        document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria-label');
            if (data[key] !== undefined) el.setAttribute('aria-label', data[key]);
        });
    }

    function setupLangSwitcher() {
        const langSwitcherContainer = document.getElementById('lang-switcher-container');
        if (!langSwitcherContainer) return;
        langSwitcherContainer.innerHTML = ''; // Clear previous buttons

        for (const [code, details] of Object.entries(supportedLangs)) {
            // ENHANCEMENT: Use a <button> for better semantics and accessibility.
            const btn = document.createElement('button');
            btn.className = 'lang-btn';
            btn.textContent = details.flag;
            btn.dataset.lang = code;
            btn.setAttribute('aria-label', `Switch to ${details.name}`);
            langSwitcherContainer.appendChild(btn);
        }

        langSwitcherContainer.addEventListener('click', (event) => {
            const clickedButton = event.target.closest('.lang-btn');
            if (clickedButton && clickedButton.dataset.lang) {
                setLanguage(clickedButton.dataset.lang);
            }
        });
    }

    function updateLangSwitcherUI(lang) {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
    }

    // --- Theme Switcher Logic ---
    const themeSwitcher = document.getElementById('theme-switcher');
    function setTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        themeSwitcher.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    }
    themeSwitcher.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

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
        // NOTE: Using innerHTML is safe here because the data is coming from a trusted
        // server endpoint. Avoid this method when rendering user-generated content
        // to prevent Cross-Site Scripting (XSS) vulnerabilities.
        container.innerHTML = tableHTML;
    }

    // --- Calculator & Converter Logic ---
    const decimalInput = document.getElementById('decimal-input');
    const conversionResults = document.getElementById('conversion-results');
    if (decimalInput) {
        const handleConversion = async (e) => {
            const decimalValue = parseInt(e.target.value, 10);
            if (!decimalValue || decimalValue <= 0) { conversionResults.innerHTML = ''; return; }
            const response = await fetch('/convert-all', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ decimal_value: decimalValue }) });
            const data = await response.json();
            conversionResults.innerHTML = data.error ? `<div class="text-danger">${data.error}</div>` : `<div class="result-grid"><div><strong>Decimal:</strong> <code>${data.decimal}</code></div><div><strong>Binary:</strong> <code>${data.binary}</code></div><div><strong>Hexadecimal:</strong> <code>${data.hexadecimal}</code></div><div><strong>Bijective Base-6:</strong> <code>${data.bijective_base6}</code></div></div>`;
        };
        // ENHANCEMENT: Debounce the input to avoid sending too many requests.
        decimalInput.addEventListener('input', debounce(handleConversion, 300));
    }

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
    const initialLang = localStorage.getItem('language') || navigator.language.split('-')[0] || 'en';
    setLanguage(initialLang);
    const initialTheme = localStorage.getItem('theme') || 'light';
    setTheme(initialTheme);
});