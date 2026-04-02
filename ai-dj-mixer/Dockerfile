FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including Liquidsoap and Icecast2
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    liquidsoap \
    icecast2 \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create directories
RUN mkdir -p /app/voices /app/output/voice /var/log/icecast2 /var/run/icecast2 && \
    chown -R icecast2:icecast /var/log/icecast2 /var/run/icecast2

# Copy configs
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY icecast.xml /etc/icecast2/icecast.xml

# Expose ports (3001=DJ server, 8001=Icecast stream)
EXPOSE 3001 8001

# Run Icecast, Liquidsoap, and DJ server via supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
