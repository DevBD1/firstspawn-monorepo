from fastapi import FastAPI

from app.api.v1.router import api_v1_router

app = FastAPI(title="FirstSpawn API", version="0.1.0")
app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}
