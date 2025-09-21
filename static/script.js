document.addEventListener('DOMContentLoaded', () => {
    const supportedLangs = {
        'en': { name: 'English', flag: '🇺🇸' },
        'de': { name: 'Deutsch', flag: '🇩🇪' },
        'es': { name: 'Español', flag: '🇪🇸' },
        'fr': { name: 'Français', flag: '🇫🇷' },
        'he': { name: 'עברית', flag: '🇮🇱' },
        'ru': { name: 'Русский', flag: '🇷🇺' }
    };

    const htmlElement = document.documentElement;

    // --- Language Switcher Logic ---
    const langSwitcherContainer = document.getElementById('lang-switcher-container');
    let langMenu;

    async function setLanguage(lang) {
        const response = await fetch(`/locales/${lang}.json`);
        const langData = await response.json();
        
        applyTranslations(langData);
        
        htmlElement.setAttribute('lang', lang);
        htmlElement.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr');

        localStorage.setItem('language', lang);
        updateLangSwitcher(lang);
    }

    function applyTranslations(data) {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (data[key]) el.innerHTML = data[key];
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (data[key]) el.placeholder = data[key];
        });
        document.title = data.pageTitle;
        document.querySelector('meta[name="description"]').setAttribute('content', data.pageDescription);
    }

    function createLangSwitcher() {
        const switcherBtn = document.createElement('div');
        switcherBtn.className = 'lang-switcher-btn';
        switcherBtn.id = 'lang-switcher-btn';
        switcherBtn.setAttribute('role', 'button');
        switcherBtn.setAttribute('aria-label', 'Select language');
        langSwitcherContainer.appendChild(switcherBtn);

        langMenu = document.createElement('div');
        langMenu.className = 'lang-menu';
        langSwitcherContainer.appendChild(langMenu);

        for (const [code, lang] of Object.entries(supportedLangs)) {
            const option = document.createElement('div');
            option.className = 'lang-option';
            option.dataset.lang = code;
            option.innerHTML = `<span class="flag-icon">${lang.flag}</span> ${lang.name}`;
            option.addEventListener('click', () => {
                setLanguage(code);
                langMenu.classList.remove('show');
            });
            langMenu.appendChild(option);
        }

        switcherBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            langMenu.classList.toggle('show');
        });
    }

    function updateLangSwitcher(lang) {
        const switcherBtn = document.getElementById('lang-switcher-btn');
        if (switcherBtn) {
            switcherBtn.innerHTML = supportedLangs[lang].flag;
        }
    }

    window.addEventListener('click', () => { if (langMenu && langMenu.classList.contains('show')) langMenu.classList.remove('show'); });
    createLangSwitcher();

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

    // --- Initial Load ---
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);

    // --- Calculator & Other Logic ---
    const tablesTab = document.getElementById('tables-tab');
    let tablesData = null;
    tablesTab.addEventListener('shown.bs.tab', async () => {
        if (!tablesData) {
            const addContainer = document.getElementById('addition-table-container');
            const mulContainer = document.getElementById('multiplication-table-container');
            addContainer.innerHTML = '<p class="text-center">Loading tables...</p>';
            mulContainer.innerHTML = '';
            const response = await fetch('/get-tables');
            tablesData = await response.json();
            renderTable(tablesData.header, tablesData.addition, addContainer);
            renderTable(tablesData.header, tablesData.multiplication, mulContainer);
        }
    });

    function renderTable(header, data, container) {
        let tableHTML = '<table class="table table-bordered table-hover"><thead><tr><th scope="col">#</th>';
        header.forEach(h => tableHTML += `<th scope="col">${h}</th>`);
        tableHTML += '</tr></thead><tbody>';
        data.forEach((row, rowIndex) => {
            tableHTML += `<tr><th scope="row">${header[rowIndex]}</th>`;
            row.forEach(cell => tableHTML += `<td>${cell}</td>`);
            tableHTML += '</tr>';
        });
        tableHTML += '</tbody></table>';
        container.innerHTML = tableHTML;
    }

    const decimalInput = document.getElementById('decimal-input');
    const conversionResults = document.getElementById('conversion-results');
    decimalInput.addEventListener('input', async (e) => {
        const decimalValue = parseInt(e.target.value, 10);
        if (!decimalValue || decimalValue <= 0) {
            conversionResults.innerHTML = '';
            return;
        }
        const response = await fetch('/convert-all', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ decimal_value: decimalValue }),
        });
        const data = await response.json();
        if (data.error) {
            conversionResults.innerHTML = `<div class="text-danger">${data.error}</div>`;
        } else {
            conversionResults.innerHTML = `<div class="result-grid"><div><strong>Decimal:</strong> <code>${data.decimal}</code></div><div><strong>Binary:</strong> <code>${data.binary}</code></div><div><strong>Hexadecimal:</strong> <code>${data.hexadecimal}</code></div><div><strong>Bijective Base-6:</strong> <code>${data.bijective_base6}</code></div></div>`;
        }
    });

    const num1Input = document.getElementById('num1');
    const num2Input = document.getElementById('num2');
    const calculateAllBtn = document.getElementById('calculate-all-btn');
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
            const response = await fetch('/calculate-all', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ num1, num2 }),
            });
            const data = await response.json();
            if (data.error) {
                errorDisplay.textContent = `Error: ${data.error}`;
            } else {
                displayAllOpsResults(num1, num2, data);
            }
            resultArea.classList.add('visible');
        }, 10);
    });

    function clearCalculatorResults() { resultArea.classList.remove('visible'); opsResultsGrid.innerHTML = ''; errorDisplay.innerHTML = ''; }
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
                    <div class="op-answer">${opData.decimal !== null ? opData.bijective : '&nbsp;' }</div>
                </div>
            `;
            opsResultsGrid.appendChild(resultItem);
        }
    }
});
