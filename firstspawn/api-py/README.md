# @firstspawn/api-py

FastAPI implementation workspace for the production API.

## Quickstart

```bash
cd firstspawn/api-py
python3 -m venv .venv
source .venv/bin/activate
pip install -e .[dev]
uvicorn app.main:app --reload --port 8000
```

## Contract Sources

- `../../docs/05-api-v1-contract.md`
- `../../docs/06-data-model-v1.md`

## Initial Endpoints

- `GET /healthz`
- `GET /api/v1/health`
