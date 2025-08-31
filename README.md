# 🎯 Ghostwriter (Ollama Local Branch)

<div align="center">

**Windows 2000 Desktop with AI Writing Assistants**

*Powered by Local Ollama Models • Privacy-Focused & Offline*

[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![Ollama](https://img.shields.io/badge/Ollama-Local-orange.svg)](https://ollama.ai/)
[![License](https://img.shields.io/badge/License-Private-red.svg)]()

</div>

<br/>

## 📖 About

Ghostwriter is a nostalgic Windows 2000 desktop simulator featuring AI-powered writing assistants. This branch uses local Ollama models for offline AI generation - complete privacy with no external API calls!

### ✨ Features
- **Windows 2000 Desktop**: Authentic retro interface
- **AI Writing Assistants**: Email, Blog, Social Media, and Story generators
- **Local AI**: Powered by Ollama models running on your machine
- **Offline Ready**: No internet required for AI features
- **Privacy First**: All processing happens locally

<br/>

## 🏠 Setting Up Ollama

### Step 1: Install Ollama
Visit [ollama.ai](https://ollama.ai/) and download the installer for your operating system:

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download from the official website and run the installer.

### Step 2: Start Ollama Service
```bash
# Start Ollama in the background
ollama serve
```

### Step 3: Pull Required Model
```bash
# Pull the tinyllama model (recommended for this project)
ollama pull tinyllama:latest

```

### Step 4: Verify Installation
```bash
# Check if Ollama is running
ollama list

# Test the model
ollama run tinyllama:latest
```

<br/>

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Ollama installed and running
- tinyllama model downloaded

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/TigerTimofey/windows.git
cd ghostwriter

# Switch to ollama-local branch
git checkout ollama-local

# Install frontend dependencies
npm install

# Ensure Ollama is running with the model
# (see setup instructions above)

# Start the backend server (in a separate terminal)
cd ghostwriter/backend/src
node server.js

# Start the frontend (in the main ghostwriter directory)
cd ghostwriter
npm run dev
```

### Open Your Browser
Navigate to: `http://localhost:5173`

<br/>

## 🎮 How to Use

1. **Login**: Enter the Windows 2000 login screen
2. **Desktop**: Double-click AI assistant icons (Email, Blog, Social, Story)
3. **Generate**: Fill out the form and click generate
4. **Export**: Save your content in various formats

### Available AI Assistants
- **📧 Email Assistant**: Professional email generation
- **📝 Blog Assistant**: SEO-optimized blog posts
- **📱 Social Media**: Platform-specific content
- **📖 Story Assistant**: Creative writing help

<br/>

## 📊 Model Performance & Requirements

### tinyllama:latest (Recommended)
- **Size**: ~637 MB
- **RAM Usage**: 1-2 GB
- **Performance**: Fast responses, good quality
- **Use Case**: General writing assistance

### System Requirements by Model

**Minimum (tinyllama):**
- RAM: 4 GB
- Storage: 2 GB free
- CPU: Any modern processor

**Recommended (llama2/mistral):**
- RAM: 8 GB+
- Storage: 10 GB free
- CPU: Multi-core recommended
- GPU: Optional (for faster inference)

<br/>

## 🔧 Development

### Project Structure
```
src/
├── components/     # React components
├── hooks/         # Custom hooks
├── utils/         # Helper functions
└── assets/        # Images & sounds
```

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Ollama Integration
The app connects to a local backend server that interfaces with Ollama. The backend runs on port 5001 by default.

**Environment Configuration:**
```env
VITE_BACKEND_URL=http://localhost
VITE_BACKEND_PORT=port
VITE_BACKEND_ORIGIN=http://youBackendUrl:port
```

The backend server handles communication with Ollama running on `http://localhost:11434`.

<br/>



## 🔒 Privacy & Security

### Local Processing Benefits
- **No Data Transmission**: All processing happens on your machine
- **Complete Privacy**: Your prompts and generated content stay local
- **Offline Capability**: Works without internet connection
- **Data Security**: No risk of data leaks or external monitoring

### Security Considerations
- Models are stored locally in Ollama's data directory
- Generated content is processed entirely offline
- No external API calls or data transmission
- Full control over your AI interactions

<br/>

<div align="center">

**Enjoy the nostalgia with complete privacy! 🖥️🔒**

*Made with ❤️ for the Windows 2000 generation*

</div>
