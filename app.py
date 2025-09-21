
import uvicorn
import os
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from starlette.staticfiles import StaticFiles

app = FastAPI()

# --- Mount static files and templates ---
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# --- Bijective Base-6 Core Logic ---

def to_bijective_base6(n: int) -> str:
    if n <= 0: return "(N/A)"
    chars = "123456"
    result = []
    while n > 0:
        n, remainder = divmod(n - 1, 6)
        result.append(chars[remainder])
    return "".join(reversed(result))

def from_bijective_base6(s: str) -> int:
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
class AllOpsRequest(BaseModel):
    num1: str
    num2: str

class ConversionRequest(BaseModel):
    decimal_value: int

# --- FastAPI Endpoints ---

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/locales/{lang}.json")
async def get_locale(lang: str):
    file_path = os.path.join("locales", f"{lang}.json")
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return {"error": "Language not found"}, 404


@app.post("/calculate-all")
async def calculate_all_ops(problem: AllOpsRequest):
    try:
        n1 = from_bijective_base6(problem.num1)
        n2 = from_bijective_base6(problem.num2)

        add_res_dec = n1 + n2
        sub_res_dec = n1 - n2
        mul_res_dec = n1 * n2
        
        div_res_dec = None
        div_err = None
        if n2 == 0: div_err = "(Division by zero)"
        elif n1 % n2 != 0: div_err = f"(Rem: {n1 % n2})"
        else: div_res_dec = n1 // n2

        results = {
            "addition": {"decimal": add_res_dec, "bijective": to_bijective_base6(add_res_dec)},
            "subtraction": {"decimal": sub_res_dec, "bijective": to_bijective_base6(sub_res_dec)},
            "multiplication": {"decimal": mul_res_dec, "bijective": to_bijective_base6(mul_res_dec)},
            "division": {"decimal": div_res_dec, "bijective": to_bijective_base6(div_res_dec) if div_res_dec is not None else div_err}
        }
        
        return {"n1_decimal": n1, "n2_decimal": n2, "results": results}

    except ValueError as e: return {"error": str(e)}
    except Exception as e: return {"error": f"An unexpected error occurred: {e}"}


@app.post("/convert")
async def convert_live(req: ConversionRequest):
    if req.decimal_value <= 0: return {"error": "Please enter a positive whole number."}
    try:
        decimal_val = req.decimal_value
        return {
            "decimal": str(decimal_val),
            "binary": bin(decimal_val)[2:],
            "hexadecimal": hex(decimal_val)[2:].upper(),
            "bijective_base6": to_bijective_base6(decimal_val)
        }
    except Exception as e: return {"error": f"An error occurred during conversion: {e}"}


@app.get("/get-tables")
async def get_tables():
    table_size = 24 # Expanded from 12 to 24
    header = [to_bijective_base6(i) for i in range(1, table_size + 1)]
    add_table = [[to_bijective_base6(i + j) for j in range(1, table_size + 1)] for i in range(1, table_size + 1)]
    mul_table = [[to_bijective_base6(i * j) for j in range(1, table_size + 1)] for i in range(1, table_size + 1)]
    return {"header": header, "addition": add_table, "multiplication": mul_table}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
