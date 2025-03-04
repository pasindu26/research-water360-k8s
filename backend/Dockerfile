# Stage 1: Build dependencies
FROM python:3.9-slim AS builder

# Set working directory
WORKDIR /app

# Install temporary dependencies for building MySQLdb
RUN apt-get update && apt-get install -y \
    gcc \
    libmariadb-dev \
    libmariadb-dev-compat \
    pkg-config \
    python3-dev \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Copy the requirements file
COPY requirements.txt .

# Install Python dependencies inside a virtual environment
RUN python -m venv /app/.venv && \
    /app/.venv/bin/pip install --no-cache-dir -r requirements.txt && \
    /app/.venv/bin/pip install --no-cache-dir gunicorn  # ✅ Ensure Gunicorn is installed

# Stage 2: Final Image (Minimal Size)
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# ✅ Install only the necessary MySQL client library (not full dev tools)
RUN apt-get update && apt-get install -y \
    libmariadb3 \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# ✅ Copy only the virtual environment and app files from the builder stage
COPY --from=builder /app/.venv /app/.venv
COPY . .

# ✅ Set the virtual environment as the default Python environment
ENV PATH="/app/.venv/bin:$PATH"

# Expose port
EXPOSE 5000

# ✅ Run Gunicorn using the correct Flask app location
CMD ["/app/.venv/bin/gunicorn", "--bind", "0.0.0.0:5000", "app.__init__:app"]