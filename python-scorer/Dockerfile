FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the model during build (avoids slow first request at runtime)
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

COPY . .

# HF Spaces requires port 7860
EXPOSE 7860

CMD ["gunicorn", "app:app", "--timeout", "300", "--workers", "1", "--threads", "1", "--bind", "0.0.0.0:7860"]
