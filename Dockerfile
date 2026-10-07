# CleanCity Tracker — container image
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY static ./static
COPY tests ./tests

# runtime data lives on a volume so it survives restarts
VOLUME ["/app/data", "/app/uploads"]
ENV CCT_SECRET=""

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
