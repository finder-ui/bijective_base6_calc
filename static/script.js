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
    let i18nData = {};

    // --- Utility Functions ---
    const toBijective = (n) => {
        if (n <= 0) return '';
        let result = '';
        while (n > 0) {
            result = '123456'[(n - 1) % 6] + result;
            n = Math.floor((n - 1) / 6);
        }
        return result;
    };
    
    const safeFetch = async (url, options) => {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Fetch failed: ${url}`, error);
            return { error: error.message };
        }
    };

    // --- Internationalization (i18n) Logic ---
    async function setLanguage(lang) {
        if (!supportedLangs[lang]) lang = 'en';
        try {
            const response = await fetch(`/locales/${lang}.json`);
            i18nData = await response.json();
            applyTranslations(i18nData);
            htmlElement.setAttribute('lang', lang);
            htmlElement.dir = (lang === 'he' || lang === 'ar') ? 'rtl' : 'ltr';
            localStorage.setItem('language', lang);
            updateSeoTags(lang);
            updateLangSwitcher(lang);
        } catch (error) {
            console.error(`Fatal error loading language file for ${lang}:`, error);
        }
    }

    function updateSeoTags(currentLang) {
        // Remove any existing hreflang tags to prevent duplicates
        document.querySelectorAll('link[rel="alternate"]').forEach(el => el.remove());

        // Add new hreflang tags for all supported languages
        const head = document.head;
        const baseUrl = window.location.origin + window.location.pathname;

        for (const langCode in supportedLangs) {
            const link = document.createElement('link');
            link.rel = 'alternate';
            link.hreflang = langCode;
            link.href = `${baseUrl}?lang=${langCode}`; // See note on URL structure
            head.appendChild(link);
        }
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
        document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria-label');
            if (data[key]) el.setAttribute('aria-label', data[key]);
        });
    }

    function createLangSwitcher() {
        const menu = document.getElementById('lang-switcher-menu');
        if (!menu) {
            console.warn('Language switcher menu element not found. Skipping population.');
            return;
        }
        for (const [code, details] of Object.entries(supportedLangs)) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.className = 'dropdown-item';
            a.href = '#';
            a.dataset.lang = code;
            a.innerHTML = `<span class="flag">${details.flag}</span> ${details.name}`;
            a.addEventListener('click', (e) => { e.preventDefault(); setLanguage(code); });
            li.appendChild(a);
            menu.appendChild(li);
        }
    }

    function updateLangSwitcher(lang) {
        const mainBtn = document.getElementById('lang-switcher-btn');
        if (mainBtn && supportedLangs[lang]) mainBtn.innerHTML = supportedLangs[lang].flag;
    }

    // --- Tab & Table Logic ---
    const tablesTab = document.getElementById('tables-tab');
    let tablesData = null;
    tablesTab.addEventListener('shown.bs.tab', async () => {
        if (!tablesData) {
            const addContainer = document.getElementById('addition-table-container');
            const mulContainer = document.getElementById('multiplication-table-container');
            addContainer.innerHTML = `<p class="text-center">${i18nData.ui_loading || 'Loading...'}</p>`;
            const response = await fetch('/get-tables');
            tablesData = await response.json();
            renderTable(tablesData.header, tablesData.addition, addContainer);
            renderTable(tablesData.header, tablesData.multiplication, mulContainer);
        }
    });

    function renderTable(header, data, container) {
        let tableHTML = '<table class="table table-bordered table-hover table-sm"><thead><tr><th>#</th>';
        header.forEach(h => tableHTML += `<th>${h}</th>`);
        tableHTML += '</tr></thead><tbody>';
        data.forEach((row, rowIndex) => {
            tableHTML += `<tr><th>${header[rowIndex]}</th>`;
            row.forEach(cell => tableHTML += `<td>${cell}</td>`);
            tableHTML += '</tr>';
        });
        container.innerHTML = tableHTML + '</tbody></table>';
    }

    // --- Calculator Logic ---
    const num1Input = document.getElementById('num1');
    const num2Input = document.getElementById('num2');
    const calculateAllBtn = document.getElementById('calculate-all-btn');
    const resultArea = document.getElementById('result-area');
    const opsResultsGrid = document.getElementById('ops-results-grid');
    const errorDisplay = document.getElementById('error-display');

    calculateAllBtn.addEventListener('click', () => {
        const num1 = num1Input.value.trim().toUpperCase();
        const num2 = num2Input.value.trim();
        clearCalculatorResults();
        let hasError = false;
        if (!num1) { triggerShake(num1Input); hasError = true; }
        if (!num2) { triggerShake(num2Input); hasError = true; }

        setTimeout(async () => {
            if (hasError) {
                errorDisplay.textContent = i18nData.errorBothNumbers || 'Please enter both numbers.';
                resultArea.style.display = 'block';
                setTimeout(() => resultArea.classList.add('visible'), 10);
                return;
            }
            const response = await fetch('/calculate-all', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ num1, num2 }) });
            const data = await response.json();
            if (data.error) {
                errorDisplay.textContent = `${i18nData.errorGeneric || 'Error:'} ${data.error}`;
            } else {
                displayAllOpsResults(num1, num2, data);
            }
            resultArea.style.display = 'block';
            setTimeout(() => resultArea.classList.add('visible'), 10);
        }, 10);
    });

    function clearCalculatorResults() { resultArea.classList.remove('visible'); resultArea.style.display = 'none'; opsResultsGrid.innerHTML = ''; errorDisplay.innerHTML = ''; }
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
            resultItem.innerHTML = `<div class="op-result-item h-100"><div class="op-title">${opName.charAt(0).toUpperCase() + opName.slice(1)}</div><div class="op-problem">${problemBijective}</div><div class="op-step">${decimalStep}</div><div class="op-answer">${opData.decimal !== null ? opData.bijective : '&nbsp;'}</div></div>`;
            opsResultsGrid.appendChild(resultItem);
        }
    }

    // --- Algorithm Visualizer & Quiz Logic ---
    function setupLiveConverter() {
        const container = document.getElementById('live-converter-container');
        if (!container) return;
        container.innerHTML = `
            <div class="mb-3">
                <label for="decimal-input" class="form-label" data-i18n="decimalInputLabel"></label>
                <input type="number" class="form-control" id="decimal-input" data-i18n-placeholder="decimalInputPlaceholder" min="1">
            </div>
            <div id="live-converter-results" class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3"></div>
        `;

        const input = document.getElementById('decimal-input');
        const resultsContainer = document.getElementById('live-converter-results');
        let debounceTimer;

        input.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                const val = parseInt(input.value, 10);
                if (!val || val <= 0) {
                    resultsContainer.innerHTML = '';
                    return;
                }
                const data = await safeFetch("/convert", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decimal_value: val }) });
                if (data.error) {
                    resultsContainer.innerHTML = `<div class="col"><div class="op-result-item h-100"><div class="op-answer text-danger">${data.error}</div></div></div>`;
                } else {
                    resultsContainer.innerHTML = `
                        <div class="col"><div class="op-result-item h-100"><div class="op-title">Decimal</div><div class="op-answer">${data.decimal}</div></div></div>
                        <div class="col"><div class="op-result-item h-100"><div class="op-title">Binary</div><div class="op-answer">${data.binary}</div></div></div>
                        <div class="col"><div class="op-result-item h-100"><div class="op-title">Hexadecimal</div><div class="op-answer">${data.hexadecimal}</div></div></div>
                        <div class="col"><div class="op-result-item h-100"><div class="op-title">Bijective Base-6</div><div class="op-answer">${data.bijective_base6}</div></div></div>`;
                }
            }, 300);
        });
    }
    function setupVisualizer() {
        const container = document.getElementById('visualizer-container');
        if (!container) return;
        container.innerHTML = `<h4 data-i18n="visualizerTitle"></h4><p data-i18n="visualizerDesc"></p><div class="input-group mb-3"><input type="number" id="visualizer-input" class="form-control" data-i18n-placeholder="visualizerInputPlaceholder" min="1"><button id="visualize-btn" class="btn btn-primary" data-i18n="visualizeBtn"></button></div><div id="visualizer-steps"></div>`;
        const input = document.getElementById('visualizer-input');
        const button = document.getElementById('visualize-btn');
        const stepsContainer = document.getElementById('visualizer-steps');
        button.addEventListener('click', () => {
            const n = parseInt(input.value, 10);
            if (!n || n <= 0) return;
            stepsContainer.innerHTML = '';
            let steps = [];
            let currentN = n;
            let result = '';
            while (currentN > 0) {
                const nMinus1 = currentN - 1;
                const remainder = nMinus1 % 6;
                const digit = '123456'[remainder];
                result = digit + result;
                const nextN = Math.floor(nMinus1 / 6);
                steps.push(`Start: <strong>${currentN}</strong>. <code>(${currentN}-1)%6 = ${remainder}</code> → <strong>${digit}</strong>`);
                currentN = nextN;
            }
            steps.push(`Result: <strong>${result}</strong>`);
            steps.forEach((step, i) => {
                setTimeout(() => {
                    const stepDiv = document.createElement('div');
                    stepDiv.className = 'vis-step';
                    stepDiv.innerHTML = step;
                    stepsContainer.appendChild(stepDiv);
                    setTimeout(() => stepDiv.classList.add('visible'), 50);
                }, i * 1200);
            });
        });
    }

    function setupQuiz() {
        const container = document.getElementById('quiz-container');
        if (!container) return;
        const difficultySelector = document.getElementById('difficulty-range');
        let correctAnswer = '';
        let autoNextTimer = null;

        function generateQuestion() {
            const maxNum = parseInt(difficultySelector.value, 10) || 12;
            let questionHTML = '';

            // Randomly choose between a math problem and a conversion problem
            if (Math.random() > 0.5) {
                const num1 = (Math.floor(Math.random() * 1000) % maxNum);
                const num2 = (Math.floor(Math.random() * 1000) % maxNum);

                const op = Math.random() > 0.5 ? '+' : '×';
                correctAnswer = (op === '+') ? toBijective(num1 + num2) : toBijective(num1 * num2);
                questionHTML = `${i18nData.quizQuestion || 'What is'} <code>${toBijective(num1)} ${op} ${toBijective(num2)}</code>?`;
            } else {
                const decimalToConvert = (Math.floor(Math.random() * 1000) % maxNum) + 1;
                correctAnswer = toBijective(decimalToConvert);
                questionHTML = `${i18nData.quizQuestion || 'What is'} <code>${decimalToConvert}</code> in bijective base-6?`;
            }

            container.innerHTML = `<div id="quiz-question">${questionHTML}</div><div class="input-group mt-3 mx-auto" style="max-width: 300px;"><input type="text" id="quiz-answer" class="form-control" placeholder="Answer..."><button id="quiz-submit" class="btn btn-primary">${i18nData.quizSubmitBtn || 'Submit'}</button></div><div id="quiz-feedback" class="mt-3 text-center"></div>`;
            document.getElementById('quiz-submit').addEventListener('click', checkAnswer);
            document.getElementById('quiz-answer').addEventListener('keypress', e => { if (e.key === 'Enter') checkAnswer(); });
        }
        function checkAnswer() {
            const userAnswer = document.getElementById('quiz-answer').value.trim();
            const feedbackEl = document.getElementById('quiz-feedback');
            document.getElementById('quiz-submit').disabled = true;

            const nextBtn = document.createElement('button');
            nextBtn.className = 'btn btn-secondary mt-3';
            nextBtn.textContent = i18nData.quizNextBtn || 'Next Question';
            nextBtn.onclick = () => {
                clearTimeout(autoNextTimer);
                generateQuestion();
            };

            if (userAnswer.toUpperCase() === correctAnswer) {
                feedbackEl.innerHTML = `<span class="feedback-correct">${i18nData.quizCorrectFeedback || 'Correct! 🎉'}</span>`;
                autoNextTimer = setTimeout(generateQuestion, 5000); // Auto-advance after 5s
            } else {
                feedbackEl.innerHTML = `<span class="feedback-incorrect">${i18nData.quizIncorrectFeedback || 'Not quite! The correct answer was'} <strong>${correctAnswer}</strong>.</span>`;
            }
            feedbackEl.appendChild(document.createElement('br'));
            feedbackEl.appendChild(nextBtn);
        }

        difficultySelector.addEventListener('change', () => { clearTimeout(autoNextTimer); generateQuestion(); });
        generateQuestion();
    }

    // --- Initial Load ---
    async function initialize() {
        createLangSwitcher();
        setupLiveConverter();
        setupVisualizer();
        setupQuiz();
        const initialLang = localStorage.getItem('language') || 'en';
        await setLanguage(initialLang);
    }

    initialize();
});
