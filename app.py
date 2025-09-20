import os

import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

app = FastAPI()

# --- Mount static files and templates ---
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# --- Bijective Base-6 Core Logic ---

def to_bijective_base6(n: int) -> str:
    """Converts a positive integer to its bijective base-6 string representation."""
    if n <= 0:
        return ""  # This system does not have a zero or negative numbers

    chars = "123456"
    result = []
    while n > 0:
        n, remainder = divmod(n - 1, 6)
        result.append(chars[remainder])
    
    return "".join(reversed(result))

def from_bijective_base6(s: str) -> int:
    """Converts a bijective base-6 string to a positive integer with strict validation."""
    if not s:
        raise ValueError("Input cannot be empty.")

    allowed_chars = "123456"
    for char in s:
        if char not in allowed_chars:
            raise ValueError(f"Input contains invalid character '{char}'. Only digits 1-6 are allowed.")

    value_map = {'1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6}
    n = 0
    for char in s:
        n = n * 6 + value_map[char]
    return n

# --- Pydantic Models for API ---
class MathProblemRequest(BaseModel):
    num1: str
    num2: str
    operation: str

# --- FastAPI Endpoints ---

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    """Serves the main HTML page."""
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/calculate")
async def calculate(problem: MathProblemRequest):
    """API endpoint to perform the calculation."""
    try:
        # Convert bijective strings to decimal integers
        n1 = from_bijective_base6(problem.num1)
        n2 = from_bijective_base6(problem.num2)
        
        result_decimal = 0
        error = None

        # Perform the requested operation
        if problem.operation == 'add':
            result_decimal = n1 + n2
        elif problem.operation == 'subtract':
            result_decimal = n1 - n2
        elif problem.operation == 'multiply':
            result_decimal = n1 * n2
        elif problem.operation == 'divide':
            if n2 == 0: # Should not happen with this system, but good practice
                error = "Division by zero is not possible."
            elif n1 % n2 != 0:
                error = f"Division is not exact. Remainder is {n1 % n2}."
            else:
                result_decimal = n1 // n2
        else:
            return {"error": "Invalid operation."}

        if error:
            return {"error": error}

        # Convert the result back to bijective base-6
        if result_decimal <= 0:
            result_bijective = "(Result is not a positive number in this system)"
        else:
            result_bijective = to_bijective_base6(result_decimal)

        return {
            "num1_decimal": n1,
            "num2_decimal": n2,
            "result_decimal": result_decimal,
            "result_bijective": result_bijective
        }

    except ValueError as e:
        return {"error": str(e)}
    except Exception as e:
        return {"error": f"An unexpected error occurred: {e}"}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
