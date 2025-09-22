document.addEventListener('DOMContentLoaded', () => {
    const htmlElement = document.documentElement;
    let i18nData = {};

    // --- Client-Side Bijective Logic ---
    const toBijective = (n) => {
        if (n <= 0) return "(N/A)"; // Not applicable for non-positive numbers
        const chars = "123456";
        let result = '';
        while (n > 0) {
            result = chars[(n - 1) % 6] + result;
            n = Math.floor((n - 1) / 6);
        }
        return result;
    };

    const fromBijective = (s) => {
        if (!s || !/^[1-6]+$/.test(s)) throw new Error("Invalid bijective base-6 input.");
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
        if (themeSwitcher) {
            themeSwitcher.innerHTML = theme === 'dark' ? '☀️' : '🌙';
            // Add RGB version of accent color for box-shadow
            const accentColor = getComputedStyle(htmlElement).getPropertyValue('--accent-color').trim();
            const rgb = accentColor.startsWith('#') ? `${parseInt(accentColor.slice(1, 3), 16)}, ${parseInt(accentColor.slice(3, 5), 16)}, ${parseInt(accentColor.slice(5, 7), 16)}` : '136, 132, 255';
            htmlElement.style.setProperty('--accent-color-rgb', rgb);
        }
    }

    if (themeSwitcher) {
        themeSwitcher.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme') || 'dark';
            setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    // --- Internationalization (i18n) Logic ---
    const supportedLangs = {
        'en': { flag: 'us', name: 'English' }, 'ru': { flag: 'ru', name: 'Русский' }, 'he': { flag: 'il', name: 'עברית' },
        'es': { flag: 'es', name: 'Español' }, 'fr': { flag: 'fr', name: 'Français' }, 'de': { flag: 'de', name: 'Deutsch' },
        'ar': { flag: 'sa', name: 'العربية' }, 'zh': { flag: 'cn', name: '中文' }, 'ja': { flag: 'jp', name: '日本語' }
    };

    async function setLanguage(lang) {
        if (!supportedLangs[lang]) { console.warn(`Language '${lang}' not supported.`); return; }
        try {
            const response = await fetch(`/locales/${lang}.json`);
            if (!response.ok) { console.error(`Failed to fetch locale file for ${lang}.`); return; }
            i18nData = await response.json();
            applyTranslations(i18nData);
            htmlElement.setAttribute('lang', lang);
            htmlElement.dir = (lang === 'he' || lang === 'ar') ? 'rtl' : 'ltr';
            localStorage.setItem('language', lang);
            updateLangSwitcherUI(lang);
        } catch (error) {
            console.error(`Error setting language to ${lang}:`, error);
            // Fallback to English if the selected language fails to load
            if (lang !== 'en') await setLanguage('en');
        }
    }

    function applyTranslations(data) {
        document.title = data.pageTitle || "Bijective Base-6 Calculator";
        document.querySelector('meta[name="description"]').setAttribute('content', data.pageDescription || "");

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (data[key] !== undefined) el.innerHTML = data[key];
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.dataset.i18nPlaceholder;
            if (data[key] !== undefined) el.placeholder = data[key];
        });
        document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
            const key = el.dataset.i18nAriaLabel;
            if (data[key] !== undefined) el.setAttribute('aria-label', data[key]);
        });
        document.querySelectorAll('[data-i18n-list]').forEach(ul => {
            const key = ul.dataset.i18nList;
            if (data[key] && Array.isArray(data[key])) {
                ul.innerHTML = data[key].map(item => `<li class="list-group-item">${item.replace(/<strong>/g, '<strong class="text-success">').replace(/<code>/g, '<code>')}</li>`).join('');
            }
        });
    }

    function setupLangSwitcher() {
        const mainBtn = document.getElementById('lang-switcher-btn');
        const menu = document.getElementById('lang-switcher-menu');
        if (!mainBtn || !menu) { console.warn("Language switcher elements not found."); return; }
        menu.innerHTML = '';
        for (const [code, details] of Object.entries(supportedLangs)) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.className = 'dropdown-item';
            a.href = '#';
            a.dataset.lang = code;
            a.innerHTML = `<span class="fi fi-${details.flag} me-2"></span> ${details.name}`;
            a.addEventListener('click', (e) => { e.preventDefault(); setLanguage(code); });
            li.appendChild(a);
            menu.appendChild(li);
        }
    }

    function updateLangSwitcherUI(lang) {
        const mainBtn = document.getElementById('lang-switcher-btn');
        if (mainBtn && supportedLangs[lang]) mainBtn.innerHTML = `<span class="fi fi-${supportedLangs[lang].flag}"></span>`;
    }

    // --- Tab & Table Logic ---
    const tablesTab = document.getElementById('tables-tab');
    let tablesData = null;
    if (tablesTab) {
        tablesTab.addEventListener('shown.bs.tab', async () => {
            if (!tablesData) {
                const addContainer = document.getElementById('addition-table-container');
                const mulContainer = document.getElementById('multiplication-table-container');
                if(addContainer) addContainer.innerHTML = `<p class="text-center">${i18nData.ui_loading || 'Loading...'}</p>`;
                const response = await fetch('/get-tables');
                tablesData = await response.json();
                if(addContainer) renderTable(tablesData.header, tablesData.addition, addContainer);
                if(mulContainer) renderTable(tablesData.header, tablesData.multiplication, mulContainer);
            }
        });
    }

    function renderTable(header, data, container) {
        let tableHTML = '<table class="table table-bordered table-hover table-sm"><thead><tr><th>#</th>';
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

    // --- Calculator & Converter Logic ---
    function setupCalculator() {
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
                    if (!num1 || !num2) throw new Error(i18nData.errorBothNumbers || "Please enter both numbers.");

                    const n1 = fromBijective(num1);
                    const n2 = fromBijective(num2);

                    const results = {
                        addition: { dec: n1 + n2, op: '+' },
                        subtraction: { dec: n1 - n2, op: '-' },
                        multiplication: { dec: n1 * n2, op: '×' },
                        division: { dec: n2 !== 0 ? (n1 / n2) : null, op: '÷', rem: n2 !== 0 ? (n1 % n2) : null }
                    };

                    displayAllOpsResults(num1, num2, results);
                    errorDisplay.innerHTML = '';
                    resultArea.classList.add('visible');
                } catch (e) {
                    errorDisplay.textContent = `${i18nData.errorGeneric || 'Error:'} ${e.message}`;
                    resultArea.classList.add('visible');
                    opsResultsGrid.innerHTML = '';
                }
            });
        }

        function displayAllOpsResults(num1, num2, data) {
            opsResultsGrid.innerHTML = Object.entries(data).map(([opName, res]) => {
                let bijectiveResult;
                if (opName === 'division') {
                    if (res.dec === null) bijectiveResult = '(N/A)';
                    else if (res.rem !== 0) bijectiveResult = `${toBijective(Math.floor(res.dec))} (Rem: ${toBijective(res.rem)})`;
                    else bijectiveResult = toBijective(res.dec);
                } else {
                    bijectiveResult = toBijective(res.dec);
                }
                const decimalDisplay = res.dec !== null ? (Number.isInteger(res.dec) ? res.dec : res.dec.toFixed(2)) : 'N/A';
                return `
                    <div class="col">
                        <div class="op-result-item h-100">
                            <div class="op-title">${opName.charAt(0).toUpperCase() + opName.slice(1)}</div>
                            <div class="op-problem">${num1} ${res.op} ${num2}</div>
                            <div class="op-answer">${bijectiveResult}</div>
                            <div class="op-step">(Decimal: ${decimalDisplay})</div>
                        </div>
                    </div>`;
            }).join('');
        }
    }

    // --- Practice Mode ---
    function setupPracticeMode() {
        const container = document.getElementById('quiz-container');
        if (!container) return;

        const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
        const conversionCheckbox = document.getElementById('quiz-type-conversions');
        const arithmeticCheckbox = document.getElementById('quiz-type-arithmetic');
        let currentQuestion = null;

        const generateQuestion = () => {
            const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked').value;
            const difficultyMap = { easy: 12, medium: 42, hard: 258 };
            const maxNum = difficultyMap[selectedDifficulty] || 12;

            const types = [];
            if (conversionCheckbox.checked) types.push('conversion');
            if (arithmeticCheckbox.checked) types.push('arithmetic');
            if (types.length === 0) { // Default if none are checked
                conversionCheckbox.checked = true;
                types.push('conversion');
            }

            const type = types[Math.floor(Math.random() * types.length)];
            let questionText = '';
            let answer = '';

            if (type === 'conversion') {
                const num = Math.floor(Math.random() * maxNum) + 1;
                questionText = (i18nData.quizQuestionConversion || "What is {number} in bijective base-6?").replace('{number}', `<code>${num}</code>`);
                answer = toBijective(num);
            } else {
                const num1 = Math.floor(Math.random() * maxNum) + 1;
                const num2 = Math.floor(Math.random() * maxNum) + 1;
                const op = Math.random() > 0.5 ? '+' : '×';
                questionText = (i18nData.quizQuestionArithmetic || "What is {num1} {op} {num2}?").replace('{num1}', `<code>${toBijective(num1)}</code>`).replace('{op}', op).replace('{num2}', `<code>${toBijective(num2)}</code>`);
                answer = toBijective(op === '+' ? num1 + num2 : num1 * num2);
            }
            currentQuestion = { questionText, answer };
            renderQuizUI();
        };

        const renderQuizUI = () => {
            container.innerHTML = `
                <div class="mb-3 fs-4">${currentQuestion.questionText}</div>
                <div class="input-group" style="max-width: 300px; margin: auto;">
                    <input type="text" id="quiz-answer" class="form-control" data-i18n-placeholder="quizAnswerPlaceholder">
                    <button id="quiz-submit" class="btn btn-primary" data-i18n="quizSubmitBtn"></button>
                </div>
                <div id="quiz-feedback" class="mt-3"></div>
            `;
            applyTranslations(i18nData);
            document.getElementById('quiz-submit').addEventListener('click', checkAnswer);
            document.getElementById('quiz-answer').addEventListener('keypress', (e) => { if (e.key === 'Enter') checkAnswer(); });
        };

        const checkAnswer = () => {
            const userAnswer = document.getElementById('quiz-answer').value.trim().toUpperCase();
            const feedbackEl = document.getElementById('quiz-feedback');
            if (userAnswer === currentQuestion.answer) {
                feedbackEl.innerHTML = `<div class="alert alert-success">${i18nData.quizCorrectFeedback || 'Correct!'}</div>`;
                setTimeout(generateQuestion, 1500);
            } else {
                feedbackEl.innerHTML = `<div class="alert alert-danger">${(i18nData.quizIncorrectFeedback || 'Not quite! The correct answer was {answer}.').replace('{answer}', `<strong>${currentQuestion.answer}</strong>`)}</div>`;
            }
        };

        difficultyRadios.forEach(radio => radio.addEventListener('change', generateQuestion));

        [conversionCheckbox, arithmeticCheckbox].forEach(el => {
            el.addEventListener('change', generateQuestion);
        });

        generateQuestion();
    }

    // --- Initial Load ---
    setupLangSwitcher();
    setupCalculator();
    setupPracticeMode();

    const initialLang = localStorage.getItem('language') || 'en';
    setLanguage(initialLang);
    const initialTheme = localStorage.getItem('theme') || 'dark';
    setTheme(initialTheme);
});
