document.addEventListener('DOMContentLoaded', () => {
    const num1Input = document.getElementById('num1');
    const num2Input = document.getElementById('num2');
    const operationButtons = document.querySelectorAll('.operation-buttons button');

    const problemDisplay = document.getElementById('problem-display');
    const stepsDisplay = document.getElementById('steps-display');
    const answerDisplay = document.getElementById('answer-display');
    const errorDisplay = document.getElementById('error-display');

    operationButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const num1 = num1Input.value.trim();
            const num2 = num2Input.value.trim();
            const operation = button.dataset.op;

            // Clear previous results
            problemDisplay.innerHTML = '';
            stepsDisplay.innerHTML = '';
            answerDisplay.innerHTML = '';
            errorDisplay.innerHTML = '';

            if (!num1 || !num2) {
                errorDisplay.textContent = 'Please enter both numbers.';
                return;
            }

            const response = await fetch('/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ num1, num2, operation }),
            });

            const data = await response.json();

            if (data.error) {
                errorDisplay.textContent = `Error: ${data.error}`;
            } else {
                displayProblem(num1, num2, operation, data);
            }
        });
    });

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
        
        // 1. Display the original problem
        problemDisplay.innerHTML = `<strong>Problem:</strong> ${num1} <sub>(base-6)</sub> ${symbol} ${num2} <sub>(base-6)</sub>`;

        // 2. Display the conversion steps
        stepsDisplay.innerHTML = `
            <h4>Steps:</h4>
            <ol>
                <li>Convert to decimal: <code>${num1}</code> → <code>${data.num1_decimal}</code></li>
                <li>Convert to decimal: <code>${num2}</code> → <code>${data.num2_decimal}</code></li>
                <li>Perform calculation: <code>${data.num1_decimal} ${symbol} ${data.num2_decimal} = ${data.result_decimal}</code></li>
                <li>Convert result back to bijective base-6: <code>${data.result_decimal}</code> → <code>${data.result_bijective}</code></li>
            </ol>
        `;

        // 3. Display the final answer
        answerDisplay.innerHTML = `<strong>Answer:</strong> <span class="final-answer">${data.result_bijective}</span> <sub>(base-6)</sub>`;
    }
});
