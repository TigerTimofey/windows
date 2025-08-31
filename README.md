# 🎯 Ghostwriter

<div align="center">

**A Nostalgic Windows 2000 Desktop Experience Enhanced with Modern AI Writing Tools**

[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-Private-red.svg)]()
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)

*Experience the classic Windows 2000 interface while leveraging cutting-edge AI technology for professional content creation.*

[🚀 Live Demo](https://windows-mu-plum.vercel.app/) • [📖 Documentation](#) • [🐛 Report Issues](https://github.com/TigerTimofey/windows/issues)

</div>

---

## 📋 Table of Contents

 [🎯 Overview](#-overview)
[✨ Key Features](#-key-features)<br/>
[🌿 Branch Strategy](#-branch-strategy)<br/>
[⚡ Quick Start](#-quick-start)<br/>
[🔧 System Requirements](#-system-requirements)<br/>
[📦 Installation](#-installation)<br/>
[🚀 Usage](#-usage)<br/>
[🙏 Acknowledgments](#-acknowledgments)<br/>
[📞 Contact](#-contact)<br/>


<br/>

## 🎯 Overview

Ghostwriter represents a unique fusion of retro computing aesthetics and modern artificial intelligence. This application recreates the iconic Windows 2000 desktop environment while integrating sophisticated AI-powered writing assistants, enabling users to produce high-quality content through an intuitive, nostalgic interface.

### 🎨 Design Philosophy

- **Authentic Experience**: Pixel-perfect recreation of Windows 2000 UI/UX
- **Modern Functionality**: Integration of cutting-edge AI technologies
- **User-Centric Design**: Intuitive workflows that enhance productivity
- **Performance Optimized**: Efficient resource utilization and fast response times

<br/>

## ✨ Key Features

### 🖥️ Windows 2000 Desktop Simulation

| Feature | Description |
|---------|-------------|
| **Authentic UI** | Complete recreation of Windows 2000 interface with original styling |
| **Drag & Drop** | Intuitive desktop interactions and file management |
| **Context Menus** | Right-click functionality with Windows-standard options |
| **Desktop Icons** | Customizable desktop shortcuts and application launchers |
| **Taskbar** | Classic Windows taskbar with start menu integration |


<br/>

## 🤖 AI Writing Assistants

#### 📧 Email Assistant
- **Professional Templates**: Industry-standard email formats
- **Tone Customization**: Adaptable communication styles
- **Smart Suggestions**: Context-aware content recommendations
- **Multi-language Support**: Global communication capabilities

#### 📝 Blog Assistant
- **SEO Optimization**: Search engine friendly content generation
- **Structured Formatting**: Proper heading hierarchy and readability
- **Topic Research**: Automated content ideation and outlining
- **Publishing Ready**: Export formats for major blogging platforms

#### 📱 Social Media Assistant
- **Platform Optimization**: Tailored content for Twitter, LinkedIn, Instagram
- **Engagement Analytics**: Performance prediction and optimization
- **Hashtag Generation**: Trend-aware hashtag suggestions
- **Scheduling Integration**: Automated posting capabilities

#### 📖 Story Assistant
- **Genre Flexibility**: Support for fiction, non-fiction, and technical writing
- **Narrative Structure**: Professional story arc development
- **Character Development**: Consistent character portrayal
- **Plot Enhancement**: Creative writing assistance and editing

### 🎮 Entertainment & Utilities

- **🕹️ Minesweeper**: Classic Windows game with authentic gameplay
- **🌐 Browser Simulation**: Mock internet browsing experience
- **🔊 Sound System**: Original Windows 2000 audio cues
- **📁 File Management**: Complete folder and file system simulation

<br/>

## 🧠  Core Components

- **Desktop Environment**: Main application container
- **Window Management**: Z-index layering and focus management
- **AI Integration Layer**: Unified interface for different AI providers
- **File System Simulation**: Virtual file management system
- **Audio System**: Sound effect management and playback

<br/>

## 🌿 Branch Strategy

This project utilizes a multi-branch strategy to accommodate different deployment scenarios and user requirements.

<strong>🏆 `main` -(Recommended for Production Use One of the following branches:</strong>

<details>
<summary><strong>☁️ `huggin` - Cloud AI Branch (Recommended for Quick Setup)</strong></summary>

- **Zero Backend**: Direct integration with Hugging Face Inference API
- **Cloud Processing**: Leverages Hugging Face's infrastructure
- **API Key Required**: Simple authentication setup
- **Global Access**: Available worldwide with internet connection
</details>

<details>
<summary><strong>🏠 `ollama-local` - Local AI Branch (Recommended for Privacy & Offline Use)</strong></summary>

- **Local Processing**: Complete offline AI capabilities
- **Privacy Focused**: No data transmission to external services
- **Customizable Models**: Support for various local AI models
- **Resource Efficient**: Optimized for local hardware
</details>

<br/>

## ⚡ Quick Start

```bash
# Clone the repository
git clone https://github.com/TigerTimofey/windows.git
cd ghostwriter

# Choose your preferred branch
git checkout huggin  # or ollama-local

# Install dependencies
npm install

# Configure environment (branch-specific)
# For huggin: Add VITE_HF_API_KEY to .env
# For ollama-local: Ensure Ollama is running

# Start development server
npm run dev

# Open http://localhost:5173
```

<br/>

## 🔧 System Requirements

### Minimum Requirements
- **Node.js**: v16.0.0 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 1GB free space
- **Operating System**: Windows 10+, macOS 10.15+, Linux (Ubuntu 18.04+)

### Recommended Specifications
- **Node.js**: v18.0.0 or higher
- **RAM**: 8GB or higher
- **Storage**: 2GB free space
- **CPU**: Multi-core processor (4+ cores)
- **GPU**: Optional, for enhanced AI processing

### Branch-Specific Requirements

| Branch | Internet | Backend | Local Storage |
|--------|----------|---------|---------------|
| `main` | Required | Required | Minimal |
| `huggin` | Required | Not Required | Minimal |
| `ollama-local` | Not Required | Not Required | ~2GB (model) |

<br/>

## 📦 Installation

### 1. Repository Setup

```bash
# Clone the repository
git clone https://github.com/TigerTimofey/windows.git

# Navigate to project directory
cd ghostwriter

# Select appropriate branch
git checkout <branch-name>
```

### 2. Dependency Installation

```bash
# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

### 3. Environment Configuration

#### For `huggin` Branch
```bash
# Create environment file
touch .env

# Add your Hugging Face API key
echo "VITE_HF_API_KEY=your_api_key_here" >> .env
```

#### For `ollama-local` Branch
```bash
# Install Ollama (if not already installed)
# Visit: https://ollama.ai/

# Pull required model
ollama pull tinyllama:latest

# Verify model installation
ollama list
```

### 4. Development Server

```bash
# Start development server
npm run dev

# Server will be available at:
# http://localhost:5173
```

<br/>

## 🚀 Usage

### Desktop Navigation

1. **Login Screen**: Enter the classic Windows 2000 login experience
2. **Desktop Environment**: Interact with desktop icons and folders
3. **Application Launch**: Double-click icons to open AI assistants
4. **Window Management**: Drag windows, use taskbar, access start menu

### AI Assistant Workflow

1. **Select Assistant**: Choose appropriate AI writing tool
2. **Configure Parameters**: Set tone, style, and requirements
3. **Generate Content**: AI processes request and generates content
4. **Review & Edit**: Modify generated content as needed
5. **Export Results**: Save in various formats (PDF, Markdown, etc.)

### Advanced Features

- **Context Menus**: Right-click for additional options
- **Drag & Drop**: Move files and folders intuitively
- **Keyboard Shortcuts**: Standard Windows keyboard navigation
- **Sound Effects**: Authentic Windows 2000 audio feedback

<br/>

## 🙏 Acknowledgments

### Core Technologies
- **React**: UI framework powering the desktop experience
- **Vite**: Lightning-fast build tool and development server
- **Hugging Face**: AI model hosting and inference platform
- **Ollama**: Local AI model management system

### Inspiration
- **Windows 2000**: The iconic operating system that inspired this project
- **Classic Computing**: Nostalgia for early 2000s user interfaces
- **Modern AI**: Cutting-edge language models and AI technologies

### Contributors
Special thanks to all contributors who have helped shape this unique project.

---

## 📞 Contact

### Project Maintainers

- **Timofey Babisashvili** - *Project Lead*
  - Email: [timofey@example.com](mailto:timofey@example.com)
  - GitHub: [@TigerTimofey](https://github.com/TigerTimofey)

### Support

- **Issues**: [GitHub Issues](https://github.com/TigerTimofey/windows/issues)
- **Discussions**: [GitHub Discussions](https://github.com/TigerTimofey/windows/discussions)
- **Documentation**: [Project Wiki](https://github.com/TigerTimofey/windows/wiki)

### Community

- **Discord**: [Join our community](https://discord.gg/ghostwriter)
- **Twitter**: [@GhostwriterApp](https://twitter.com/GhostwriterApp)
- **LinkedIn**: [Ghostwriter Project](https://linkedin.com/company/ghostwriter)

---

<div align="center">

**Made with ❤️ and nostalgia for the golden age of computing**

⭐ Star this repository if you find it interesting!

</div>
