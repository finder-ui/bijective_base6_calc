document.addEventListener('DOMContentLoaded', () => {
    const htmlElement = document.documentElement;
    let i18nData = {};

    // --- Client-Side Bijective Logic ---
    const toBijective = (n) => {
        try {
            if (n <= 0) return "(N/A)";
            const chars = "123456";
            let result = '';
            while (n > 0) {
                result = chars[(n - 1) % 6] + result;
                n = Math.floor((n - 1) / 6);
            }
            return result;
        } catch (err) {
            console.error("Error in toBijective:", err);
            return "(Error)";
        }
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
        try {
            htmlElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            if (themeSwitcher) {
                themeSwitcher.innerHTML = theme === 'dark' ? '☀️' : '🌙';
                const accentColor = getComputedStyle(htmlElement).getPropertyValue('--accent-color').trim();
                const rgb = accentColor.startsWith('#')
                    ? `${parseInt(accentColor.slice(1, 3), 16)}, ${parseInt(accentColor.slice(3, 5), 16)}, ${parseInt(accentColor.slice(5, 7), 16)}`
                    : '136, 132, 255';
                htmlElement.style.setProperty('--accent-color-rgb', rgb);
            }
        } catch (err) {
            console.error("Error setting theme:", err);
        }
    }

    if (themeSwitcher) {
        themeSwitcher.addEventListener('click', () => {
            try {
                const currentTheme = htmlElement.getAttribute('data-theme') || 'dark';
                setTheme(currentTheme === 'dark' ? 'light' : 'dark');
            } catch (err) {
                console.error("Theme switch error:", err);
            }
        });
    }

    // --- i18n (unchanged, but safe fetch already) ---

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
                try {
                    const decimalValue = parseInt(e.target.value, 10);
                    if (!decimalValue || decimalValue <= 0) {
                        if (conversionResults) conversionResults.innerHTML = '';
                        return;
                    }
                    if (conversionResults) {
                        conversionResults.innerHTML = `
                            <div class="result-grid">
                                <div><strong>Decimal:</strong> <code>${decimalValue}</code></div>
                                <div><strong>Binary:</strong> <code>${decimalValue.toString(2)}</code></div>
                                <div><strong>Hexadecimal:</strong> <code>${decimalValue.toString(16).toUpperCase()}</code></div>
                                <div><strong>Bijective Base-6:</strong> <code>${toBijective(decimalValue)}</code></div>
                            </div>`;
                    }
                } catch (err) {
                    console.error("Conversion error:", err);
                }
            });
        }

        if (calculateAllBtn) {
            calculateAllBtn.addEventListener('click', () => {
                try {
                    if (!num1Input || !num2Input) throw new Error("Number inputs not found.");
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
                    if (errorDisplay) errorDisplay.innerHTML = '';
                    resultArea?.classList.add('visible');
                } catch (e) {
                    console.warn("Calculator error:", e);
                    if (errorDisplay) errorDisplay.textContent = `${i18nData.errorGeneric || 'Error:'} ${e.message}`;
                    resultArea?.classList.add('visible');
                    if (opsResultsGrid) opsResultsGrid.innerHTML = '';
                }
            });
        }

        function displayAllOpsResults(num1, num2, data) {
            if (!opsResultsGrid) return;
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

        const conversionCheckbox = document.getElementById('quiz-type-conversions');
        const arithmeticCheckbox = document.getElementById('quiz-type-arithmetic');
        let currentQuestion = null;

        const generateQuestion = () => {
            try {
                const checkedRadio = document.querySelector('input[name="difficulty"]:checked');
                const selectedDifficulty = checkedRadio ? checkedRadio.value : 'easy';
                const difficultyMap = { easy: 12, medium: 42, hard: 258 };
                const maxNum = difficultyMap[selectedDifficulty] || 12;

                const types = [];
                if (conversionCheckbox?.checked) types.push('conversion');
                if (arithmeticCheckbox?.checked) types.push('arithmetic');
                if (types.length === 0) {
                    if (conversionCheckbox) conversionCheckbox.checked = true;
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
                    questionText = (i18nData.quizQuestionArithmetic || "What is {num1} {op} {num2}?")
                        .replace('{num1}', `<code>${toBijective(num1)}</code>`)
                        .replace('{op}', op)
                        .replace('{num2}', `<code>${toBijective(num2)}</code>`);
                    answer = toBijective(op === '+' ? num1 + num2 : num1 * num2);
                }
                currentQuestion = { questionText, answer };
                renderQuizUI();
            } catch (err) {
                console.error("Error generating quiz question:", err);
            }
        };

        const renderQuizUI = () => {
            if (!container || !currentQuestion) return;
            container.innerHTML = `
                <div class="mb-3 fs-4">${currentQuestion.questionText}</div>
                <div class="input-group" style="max-width: 300px; margin: auto;">
                    <input type="text" id="quiz-answer" class="form-control" data-i18n-placeholder="quizAnswerPlaceholder">
                    <button id="quiz-submit" class="btn btn-primary" data-i18n="quizSubmitBtn"></button>
                </div>
                <div id="quiz-feedback" class="mt-3"></div>
            `;
            applyTranslations(i18nData);
            document.getElementById('quiz-submit')?.addEventListener('click', checkAnswer);
            document.getElementById('quiz-answer')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkAnswer(); });
        };

        const checkAnswer = () => {
            try {
                const answerEl = document.getElementById('quiz-answer');
                const feedbackEl = document.getElementById('quiz-feedback');
                if (!answerEl || !feedbackEl) return;
                const userAnswer = answerEl.value.trim().toUpperCase();
                if (userAnswer === currentQuestion.answer) {
                    feedbackEl.innerHTML = `<div class="alert alert-success">${i18nData.quizCorrectFeedback || 'Correct!'}</div>`;
                    setTimeout(generateQuestion, 1500);
                } else {
                    feedbackEl.innerHTML = `<div class="alert alert-danger">${(i18nData.quizIncorrectFeedback || 'Not quite! The correct answer was {answer}.').replace('{answer}', `<strong>${currentQuestion.answer}</strong>`)}</div>`;
                }
            } catch (err) {
                console.error("Error checking quiz answer:", err);
            }
        };

        document.querySelectorAll('input[name="difficulty"]').forEach(radio =>
            radio.addEventListener('change', generateQuestion)
        );
        conversionCheckbox?.addEventListener('change', generateQuestion);
        arithmeticCheckbox?.addEventListener('change', generateQuestion);

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
