document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Switcher Logic ---
    const themeSwitcher = document.getElementById('theme-switcher');
    const htmlElement = document.documentElement;

    // Function to set the theme and update the icon
    function setTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        // Update the icon based on the new theme
        themeSwitcher.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    }

    // Event listener for the button
    themeSwitcher.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            setTheme('light');
        } else {
            setTheme('dark');
        }
    });

    // On page load, check for a saved theme and set it
    const savedTheme = localStorage.getItem('theme') || 'light'; // Default to light
    setTheme(savedTheme);


    // --- Calculator Logic ---
    const num1Input = document.getElementById('num1');
    const num2Input = document.getElementById('num2');
    const operationButtons = document.querySelectorAll('.operation-buttons button');

    const resultArea = document.getElementById('result-area');
    const problemDisplay = document.getElementById('problem-display');
    const stepsDisplay = document.getElementById('steps-display');
    const answerDisplay = document.getElementById('answer-display');
    const errorDisplay = document.getElementById('error-display');

    operationButtons.forEach(button => {
        button.addEventListener('click', () => {
            const num1 = num1Input.value.trim();
            const num2 = num2Input.value.trim();
            const operation = button.dataset.op;

            clearResults();
            let hasError = false;

            if (!num1) {
                triggerShake(num1Input);
                hasError = true;
            }
            if (!num2) {
                triggerShake(num2Input);
                hasError = true;
            }

            setTimeout(async () => {
                if (hasError) {
                    errorDisplay.textContent = 'Please enter both numbers.';
                    resultArea.classList.add('visible');
                    return;
                }

                const response = await fetch('/calculate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ num1, num2, operation }),
                });

                const data = await response.json();

                if (data.error) {
                    errorDisplay.textContent = `Error: ${data.error}`;
                } else {
                    displayProblem(num1, num2, operation, data);
                }
                resultArea.classList.add('visible');
            }, 10);
        });
    });

    function clearResults() {
        resultArea.classList.remove('visible');
        problemDisplay.innerHTML = '';
        stepsDisplay.innerHTML = '';
        answerDisplay.innerHTML = '';
        errorDisplay.innerHTML = '';
    }

    function triggerShake(element) {
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 500);
    }

    function getOperationSymbol(op) {
        switch (op) {
            case 'add': return '+';
            case 'subtract': return '-';
            case 'multiply': return '×';
            case 'divide': return '÷';
            default: return '?';
        }
    }

    function displayProblem(num1, num2, operation, data) {
        const symbol = getOperationSymbol(operation);
        
        problemDisplay.innerHTML = `<strong>Problem:</strong> ${num1} <sub>(base-6)</sub> ${symbol} ${num2} <sub>(base-6)</sub>`;

        stepsDisplay.innerHTML = `
            <h4>Steps:</h4>
            <ol>
                <li>Convert to decimal: <code>${num1}</code> → <code>${data.num1_decimal}</code></li>
                <li>Convert to decimal: <code>${num2}</code> → <code>${data.num2_decimal}</code></li>
                <li>Perform calculation: <code>${data.num1_decimal} ${symbol} ${data.num2_decimal} = ${data.result_decimal}</code></li>
                <li>Convert result back to bijective base-6: <code>${data.result_decimal}</code> → <code>${data.result_bijective}</code></li>
            </ol>
        `;

        answerDisplay.innerHTML = `<strong>Answer:</strong> <span class="final-answer">${data.result_bijective}</span> <sub>(base-6)</sub>`;
    }
});
