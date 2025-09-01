# 🎯 Ghostwriter (Hugging Face Branch)

<div align="center">

**Windows 2000 Desktop with AI Writing Assistants**

*Powered by Hugging Face APIs • No Backend Required*

[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![Hugging Face](https://img.shields.io/badge/Hugging%20Face-API-yellow.svg)](https://huggingface.co/)
[![License](https://img.shields.io/badge/License-Private-red.svg)]()

[🚀 Live Demo](https://windows-mu-plum.vercel.app/) • [🐛 Report Issues](https://github.com/TigerTimofey/windows/issues)

</div>


<br/>

## 📖 About

Ghostwriter is a nostalgic Windows 2000 desktop simulator featuring AI-powered writing assistants. This branch uses Hugging Face APIs for cloud-based AI generation - no backend server required!

### ✨ Features
- **Windows 2000 Desktop**: Authentic retro interface
- **AI Writing Assistants**: Email, Blog, Social Media, and Story generators
- **Cloud AI**: Powered by Hugging Face Inference API
- **No Backend**: Direct frontend integration
- **Easy Setup**: Just add your API key and run

<br/>

## 🔑 Getting Your Hugging Face API Key

### Step 1: Create Account
1. Visit [Hugging Face](https://huggingface.co/)
2. Click **"Sign Up"** and create your account
3. Verify your email address

### Step 2: Generate API Key
1. Go to your [Settings → API Tokens](https://huggingface.co/settings/tokens)
2. Click **"New Token"**
3. Choose **"Read"** permissions (sufficient for inference)
4. Give it a name like "Ghostwriter"
5. Click **"Generate"**
6. **Copy the token immediately** (you won't see it again!)

### Step 3: Configure Environment
Create a `.env` file in the project root:

```env
VITE_HF_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_HF_API_URL=https://router.huggingface.co/v1/chat/completions
```

Replace `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` with your actual API key. The API URL is already set to the default Hugging Face endpoint.

<br/>

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Internet connection (for Hugging Face API)

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/TigerTimofey/windows.git
cd ghostwriter

# Switch to huggin branch
git checkout huggin

# Install dependencies
npm install

# Add your Hugging Face API key to .env file
# (see instructions above)

# Start the application
npm run dev
```

### Open Your Browser
Navigate to: `http://localhost:5173`

<br/>

## � How to Use

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

## 🔧 Development

### Project Structure
```
src/
├── components/     # React components
├── hooks/         # Custom hooks
├── utils/         # Helper functions
└── assets/        # Images & sounds
```

<br/>

<div align="center">

**Enjoy the nostalgia! 🖥️✨**

*Made with ❤️ for the Windows 2000 generation*

</div>
