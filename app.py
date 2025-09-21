
import uvicorn
import os
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

def to_bijective_base6(n: int) -> str:
    if n <= 0: return "(N/A)"
    chars = "123456"
    result = []
    while n > 0:
        n, remainder = divmod(n - 1, 6)
        result.append(chars[remainder])
    return "".join(reversed(result))

def from_bijective_base6(s: str) -> int:
    if not s: raise ValueError("Input cannot be empty.")
    for char in s:
        if char not in "123456": raise ValueError(f"Input contains invalid character '{char}'.")
    n = 0
    for char in s:
        n = n * 6 + int(char)
    return n

class AllOpsRequest(BaseModel):
    num1: str
    num2: str

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
        
        div_bijective = "(N/A)"
        if n2 != 0:
            if n1 % n2 == 0:
                div_bijective = to_bijective_base6(n1 // n2)
            else:
                div_bijective = f"(Rem: {n1 % n2})"

        results = {
            "addition": {"bijective": to_bijective_base6(add_res_dec)},
            "subtraction": {"bijective": to_bijective_base6(sub_res_dec)},
            "multiplication": {"bijective": to_bijective_base6(mul_res_dec)},
            "division": {"bijective": div_bijective}
        }
        
        return {"results": results}

    except ValueError as e: return {"error": str(e)}
    except Exception as e: return {"error": f"An unexpected error occurred: {e}"}

@app.get("/get-tables")
async def get_tables():
    table_size = 12
    header = [to_bijective_base6(i) for i in range(1, table_size + 1)]
    add_table = [[to_bijective_base6(i + j) for j in range(1, table_size + 1)] for i in range(1, table_size + 1)]
    mul_table = [[to_bijective_base6(i * j) for j in range(1, table_size + 1)] for i in range(1, table_size + 1)]
    return {"header": header, "addition": add_table, "multiplication": mul_table}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
