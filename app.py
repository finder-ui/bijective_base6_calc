
import uvicorn
import os
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# This function is kept ONLY for generating the reference tables on the server.
# All other calculations are now handled on the client-side.
def to_bijective_base6(n: int) -> str:
    if n <= 0: return "(N/A)"
    chars = "123456"
    result = []
    while n > 0:
        n, remainder = divmod(n - 1, 6)
        result.append(chars[remainder])
    return "".join(reversed(result))

@app.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/locales/{lang}.json")
async def get_locale(lang: str):
    file_path = os.path.join("locales", f"{lang}.json")
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return {"error": "Language not found"}, 404

@app.get("/get-tables")
async def get_tables():
    table_size = 12
    header = [to_bijective_base6(i) for i in range(1, table_size + 1)]
    add_table = [[to_bijective_base6(i + j) for j in range(1, table_size + 1)] for i in range(1, table_size + 1)]
    mul_table = [[to_bijective_base6(i * j) for j in range(1, table_size + 1)] for i in range(1, table_size + 1)]
    return {"header": header, "addition": add_table, "multiplication": mul_table}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
