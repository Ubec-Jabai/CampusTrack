# Django <small>(Micro-Service)</small>

## Project Information

- Python version: latest
- UV version: latest

> This project uses UV

Please refer to official documentation of [Django 6.1.1](https://docs.djangoproject.com/en/6.1/intro/)

## Getting Started

1. Install the necessary packages using UV ``uv sync``
2. Migrate the Django dependencies ``uv run src/manage.py migrate``
3. Install Chromium with `uv run playwright install chromium`.
4. Run the existing ASGI application on port 8001 with Uvicorn.

```powershell
uv run --with uvicorn uvicorn --app-dir src core.asgi:application --port 8001 --loop asyncio --workers 1
```

On Windows, run without `--reload` or extra workers so that Playwright can launch its subprocess.
