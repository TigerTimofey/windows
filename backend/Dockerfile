FROM node:18-alpine

# Install Ollama
RUN apk add --no-cache curl && \
    curl -fsSL https://ollama.ai/install.sh | sh

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose ports
EXPOSE 5001

# Start Ollama and the app
CMD ["sh", "-c", "ollama serve & sleep 5 && ollama pull llama3:8b-instruct && npm start"]
