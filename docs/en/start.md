---
title: Quick Start
description: Install DeepStudent and get running in 10 minutes — one-click API key setup or local Ollama, import study materials, ask cited questions, and generate mind maps, flashcards or exam sets.
---

# Quick Start

> Go from installation to a complete study workflow — connect a model, import study material, ask cited questions, and generate mind maps, flashcards, or exam sets — in about 10 minutes.

## Step 0: Install & Open

Download the installer for your platform from [GitHub Releases](https://github.com/helixnow/deep-student/releases/latest) (or the [Chinese download page](/download) with a China mainland mirror):

| Platform | Package | Notes |
|---|---|---|
| macOS | `.dmg` (Apple Silicon / Intel) | Separate builds for M-series and Intel |
| Windows | `.exe` installer | x64 desktop installer |
| Linux | `.AppImage` or `.deb` (x86_64) | Electron-based in v0.20; no WebKitGTK required |
| Android | `.apk` (ARM64) | Native mobile app with one-handed drawer navigation |
| Web / iOS / iPadOS | Self-hosted WebUI & PWA | Requires `Node.js 24+`; installable to phone/tablet home screen — see [WebUI & PWA Self-Hosting](/user-guide/webui-pwa) (Chinese) |

> **macOS says the app is "damaged and can't be opened"?** Official releases are signed and notarized by Apple. If you are running an unnotarized preview or self-built package, clear the quarantine flag in Terminal and reopen the app:
>
> ```bash
> sudo xattr -r -d com.apple.quarantine "/Applications/Deep Student.app"
> ```

On first launch, you will see a brief two-step onboarding:

1. **Terms & Privacy Policy**: Review and accept to continue.
2. **Welcome Dialog**: Pick your interface language, then paste any supported API key into the **One-Click API Key Auto-Setup** card to detect the provider, probe available models, and fill capability slots automatically. You can also skip to **Advanced Settings** or explore the app first.

![Welcome dialog with 1-Key Auto-Provisioner on first launch](/img/guide/start-welcome-setup-en.webp)

No DeepStudent account is required — your study materials, notes, and chat history stay on your device by default.

## Meet the Study Desktop

On desktop, DeepStudent opens directly into the **Study Desktop**:

![DeepStudent Study Desktop with Chat, Mind Map, Exam Set, and Flashcards side by side](/img/guide/study-desktop-hero-en.webp)

- **Bottom Dock**: Pins **Chat**, **Files**, **Settings**, and **Todo** by default. Click **All Apps** on the right to open Flashcards, Media, Anki Cards, Mind Map, Exam Sets, Plugin Workshop, Pomodoro, and more.
- **Side-by-Side Tiling Windows**: Every app and document opens in its own window. Drag a window to the left or right edge of the screen to snap it into a split view — ideal for reading a textbook alongside Chat.
- **Status Bar & Command Search**: The top bar summarizes due flashcards, mistakes, card generation tasks, Pomodoro focus time, and layout presets. Press `Cmd + K` (macOS) or `Ctrl + K` (Windows / Linux) anywhere to search apps, files, and commands.

Prefer a traditional single-pane sidebar? Click the DeepStudent icon at the far left of the status bar and choose **Exit Study Desktop**. You can switch back anytime under **Settings → Study Desktop**.

## Step 1: Connect an AI Model (Required)

DeepStudent does not bundle a hosted cloud model; you bring your own API key or connect a local model server. If you already configured a key in the welcome dialog, skip ahead to Step 2. Otherwise, open **Settings → Model Providers** from the Dock.

| Your setup | Recommended path | How to configure |
|---|---|---|
| Already have an API key | **One-Click API Key Auto-Setup** | Paste your key at the top of **Settings → Model Providers** (or the welcome dialog) to auto-detect the provider and fill major capability slots |
| Want fully local, zero-cost AI | **Local models (Ollama / vLLM / llama.cpp)** | Click **Add Provider**, choose Ollama (default `http://localhost:11434/v1`) or a generic adapter, and check **No API Key Required** |
| Want fine-grained model control | **Manual per-feature assignment** | Save keys for any preset or custom provider, then assign specific models under **Settings → Model Assignment** |

- **15 Preset Providers**: Includes **OpenAI**, **Anthropic**, **Google Gemini**, **DeepSeek**, **Mistral**, **OpenCode Go**, **Codex** (sign in with a ChatGPT account via browser or device code), **SiliconFlow**, **NVIDIA**, **Qwen**, **Zhipu AI**, **Doubao**, **MiniMax**, **Moonshot**, and **Xiaomi MiMo**.

![Settings → Models & AI → Model Service with 1-Key Auto-Provisioner and 15 preset providers](/img/guide/models-providers-en.webp)
- **Per-Feature Slots**: Under **Settings → Model Assignment**, you can assign dedicated models for chat, flashcards, OCR, embeddings (with embedding dimension management), reranking, translation, and speech recognition. If a provider does not expose an embeddings endpoint, DeepStudent automatically falls back to keyword retrieval without overwriting existing vector settings.

## Step 2: Import Your First Study Material

1. Open **Files** (`资源库`) from the Dock.
2. Drag a **PDF**, **Word (`.docx`)**, **EPUB**, or **Markdown** file straight into the window — or click **New → Import...** in the toolbar.
3. DeepStudent automatically queues indexing (text extraction → chunking → embeddings). Once the status in **Knowledge Index** shows indexed, the Study Agent can search and cite the document across conversations.

## Step 3: Ask Cited Questions & Generate Study Outputs

### Ask with Grounded Citations

- **Read-Along PDF Questioning**: Double-click an imported PDF in **Files**, tick the checkboxes on the pages you want to focus on (up to 10 pages at once), and ask your question in **Chat**. Selected pages appear as tags above the input box, and answers include clickable page citations that jump straight back to the source.
- **Cite Files in Chat**: Click **`+` → Add File → Files** in the Chat input bar to attach textbooks, notes, or whole folders — or drag images and PDFs directly into the conversation.

### Generate Study Outputs in One Sentence

Ask the Study Agent to turn your materials into active study tools that land directly inside each app:

- **Mind Maps**: Ask *"Create a mind map for Chapter 3 of this PDF."* Open the returned card to refine in canvas or outline view, or toggle recite mode to hide key points and test yourself.
- **FSRS-6 Flashcards & Anki**: Ask *"Turn these pages into 10 flashcards."* Review and edit each card, add them to your library, and review daily in **Flashcards** using built-in **FSRS-6** spaced repetition — or export `.apkg` files and sync directly to desktop [Anki](https://apps.ankiweb.net/) via **AnkiConnect** (add-on code `2055492159`).
- **Exam Sets**: Ask *"Generate 10 multiple-choice questions from this chapter."* Practice with automatic grading, explanations, and topic-level mastery tracking.
- **Media & Lectures**: Open **Media** to transcribe local recordings into timestamped subtitles, or paste a Bilibili lecture link to import subtitles without downloading the video, ask timestamp-cited questions, and compile illustrated handouts.
- **AI Plugin Workshop**: Need a custom workflow? Describe it in **Plugin Workshop** and let the Study Agent build, debug, and hot-load a `.dstuplugin` extension right inside the app.

### Optional: Web Search & Android Quick Tips

- **Web Search**: Built-in **Bing RSS** works out of the box with no configuration. For richer results, switch under **Settings → Web Search** to any of 9 supported engines (including Google CSE, SerpAPI, Tavily, Brave, SearXNG, Zhipu AI Search, Bocha AI Search, or DeepSeek Official Search).
- **Android Navigation**: The Android app follows the same workflow with a one-handed drawer — swipe from the left edge (or tap the menu button) to access conversations at the top and the 4×2 app launcher below. In Chat, **`+` → Add File** also includes **Camera** to snap textbook pages or exam questions directly. See the [Mobile Guide](/user-guide/mobile) (Chinese).

## Data, Privacy & Safety

### Default Local Data Paths

| Platform | Default Directory |
|---|---|
| macOS | `~/Library/Application Support/com.deepstudent.app/` |
| Windows | `%APPDATA%\com.deepstudent.app\` |
| Linux | `~/.local/share/com.deepstudent.app/` |

### Privacy, Permissions & Recovery

- **Local-First & Encrypted Keys**: Study materials, notes, chats, and search indexes live on your machine by default. API keys are protected with OS secure storage or **AES-256-GCM** encryption. AI requests are sent only to the model providers you configure; cloud sync (WebDAV / S3 / experimental FTP) is off by default, and AI memory can be toggled off anytime in **Settings → Memory**.
- **Execution Permission Tiers**: Click **`+` → Mode** in Chat to switch among four permission tiers (**Cautious**, **Relaxed**, **Full Access**, **Dangerous Full Access**). The default **Relaxed** tier runs everyday reads smoothly while showing an approval card before high-risk changes.
- **Automatic Local Backups**: Open **Settings → Data & System → Data Governance → Backup** to run a full backup and enable automatic local backups before making major changes or switching devices.
- **Safe Mode Recovery**: User plugins run in-process, so only install trusted plugins. If a plugin ever prevents startup, launch with `--safe-mode` (or use the automatic recovery prompt after repeated startup failures) to disable third-party plugins cleanly.

## Next Steps

- **Download & Updates**: [GitHub Releases](https://github.com/helixnow/deep-student/releases/latest)
- **Community & Help**: [GitHub Discussions](https://github.com/helixnow/deep-student/discussions)
- **Full Documentation (Simplified Chinese)**:
  - [User Guide Overview](/user-guide/)
  - [Study Desktop](/user-guide/workbench)
  - [Models & Providers](/user-guide/models)
  - [AI Plugin Workshop](/user-guide/plugin-workshop)
  - [WebUI & PWA Self-Hosting](/user-guide/webui-pwa)
  - [Architecture & Developers](/developers)
