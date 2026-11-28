/**
 * English copy.
 *
 * Keys mirror zh-CN.js one-to-one; anything missing here falls back to Chinese.
 * Entries carrying href / match / link / img are routing and asset data — when
 * translating, only text / title / desc / alt normally need to change.
 * Docs pages are still Chinese-only, so links into the docs point at the Chinese
 * documentation and say "(Chinese)"; download and support go to GitHub (see `links`).
 *
 * House style for this page: one idea per sentence, main clause first, keep each
 * block to about two lines so it can be skimmed.
 */
export default {
  nav: {
    landing: {
      docs: 'Docs (Chinese)',
      support: 'Support'
    },
    docPage: {
      docs: 'Docs',
      roadmap: 'Roadmap',
      qa: 'QA',
      support: 'Support'
    },
    download: 'Download',
    search: 'Search docs',
    theme: 'Toggle appearance',
    menu: 'Menu',
    switchLanguage: 'Switch language',
    primary: 'Primary navigation'
  },

  /**
   * Home and Quick Start have English pages (`/en/`, `/en/start`). Download and support
   * remain Chinese-only, so English visitors go to GitHub Releases and Discussions instead.
   * User-guide chapters have no English counterpart yet and say "(Chinese)" in their labels.
   */
  links: {
    home: '/en/',
    quickStart: '/en/start',
    download: 'https://github.com/helixnow/deep-student/releases/latest',
    support: 'https://github.com/helixnow/deep-student/discussions'
  },

  copyLine: {
    copy: 'Copy',
    copied: 'Copied',
    label: 'Copy command',
    failed: 'Copy failed. Please select and copy the command manually.'
  },

  footer: {
    /** Accessible name and tooltip. The corner shows icons only */
    social: {
      github: 'GitHub repository',
      qq: 'QQ group 310134919',
      xiaohongshu: 'Xiaohongshu profile',
      email: 'Email support@deepstudent.cn'
    },
    /** Alt text for the QR popovers. "QR code" alone is useless to a screen
     *  reader hearing two of them in a row — say which is which. */
    qrAlt: {
      qq: 'QR code for QQ group 310134919',
      xiaohongshu: 'QR code for the Xiaohongshu profile'
    },
    /** The line under the code. State the action, not the object. */
    qrHint: {
      qq: 'Scan to join the QQ group',
      xiaohongshu: 'Scan to follow on Xiaohongshu'
    },
    /** Touch-only exit: the first tap is intercepted to reveal the code */
    qrOpen: 'Open link',
    /** Legal notice: kept in English across locales, not translated */
    copyright: 'Copyright © 2026 DeepStudent Team. All rights reserved.'
  },

  lastAuthor: {
    label: 'Editors: ',
    separator: ', '
  },

  appShell: {
    title: 'DeepStudent live demo',
    previewTitle: 'DeepStudent interface preview',
    previewDescription: 'The study agent reads your materials in chat and produces mind maps, practice questions and Anki cards directly.',
    /** Alt text for the real-UI screenshot in the shell; it is the same interface the demo shows */
    posterAlt:
      'The DeepStudent app: navigation and conversations on the left, and on the right the chat “Calculus Mistakes → Anki Cards”, where the agent has generated 5 cards.',
    /**
     * These three only surface when the picture will not move again: not started yet,
     * timed out, or not embeddable. Loading is deliberately silent — the shell is
     * already showing this screenshot; see AppShell.vue.
     */
    waiting: 'The live demo loads automatically. Start it here instead.',
    delayed: 'The live demo is not ready yet. Retry or explore the features below.',
    unavailable: 'The live demo cannot be embedded here. This is a screenshot of the interface.',
    start: 'Try it now',
    retry: 'Reload demo'
  },

  home: {
    stars: {
      idle: 'Star on GitHub',
      count: '{count} stars on GitHub'
    },

    hero: {
      title: 'Just focus on learning.\nLeave the rest to me.',
      /* 第二行前面靠这个尾随空格和第一行断开；移动端 <br> 生效时它会被折叠掉 */
      lede: ['An open-source, local-first AI learning workbench. ', 'Its study agent works directly in every app on your Study Desktop.'],
      download: 'Download',
      downloadMac: 'Download for macOS',
      downloadWin: 'Download for Windows',
      downloadLinux: 'Download for Linux',
      downloadAndroid: 'Download for Android',
      downloadOnComputer: 'Get it on your computer',
      chooseDownload: 'Choose a download',
      switchDownload: 'Switch download version',
      downloadOptions: {
        'mac-arm': 'macOS · Apple Silicon',
        'mac-x64': 'macOS · Intel',
        'win-x64': 'Windows · x64',
        'linux-appimage': 'Linux · AppImage',
        'linux-deb': 'Linux · deb',
        'linux-rpm': 'Linux · rpm',
        'android-arm64': 'Android · ARM64'
      },
      quickStart: 'Quick start',
      note: 'Free & open source (AGPL-3.0) · No sign-up · 1-minute API key setup or local Ollama · Data stays on your device'
    },

    /**
     * Study desktop: what the desktop app opens to (desktop.workbenchMode defaults to true in the app).
     * art maps to docs/public/features/<art>-light|dark.webp, a 1440 × 900 full-screen shot
     */
    desktop: {
      title: 'One Study Desktop, apps side by side.',
      lede: 'The desktop app opens straight into the Study Desktop: launch apps from the Dock, arrange windows freely or switch study-flow presets in one click; the status bar tracks today’s rhythm and AI desktop control (with an emergency kill switch), and Study Spaces restore their own window layouts.',
      more: 'About the Study Desktop (Chinese)',
      link: '/user-guide/workbench',
      art: 'workbench',
      alt: 'Screenshot of the Study Desktop: a chat window with freshly generated Anki cards, today’s flashcard review in the middle, agenda and AI study briefing widgets on the right, and the Dock below',
      /** On wide screens with a mouse the screenshot becomes a live, clickable desktop (DesktopDemo.vue) */
      live: {
        title: 'Live Study Desktop demo',
        narrow: 'Widen your browser window to at least 1024 pixels to try this desktop live, or tap the picture to see it full size.',
        touch: 'Tap the picture to see it full size and swipe across the desktop. Open this page on a computer to try it live, or scroll up to the demo at the top to try the app on your phone.',
        zoom: 'View full size',
        pan: 'Swipe to see the whole desktop',
        close: 'Close',
        waiting: 'It loads when you scroll here. You can also start it now.',
        loading: 'Opening the Study Desktop…',
        delayed: 'The Study Desktop is not ready yet. You can retry.',
        start: 'Load now'
      }
    },

    agent: {
      title: 'A study agent that works in every app.',
      lede: 'One sentence is enough: it opens the right app and produces the notes, mind maps, questions, cards and review plan. Longer tasks it can carry through on its own.',
      items: [
        {
          title: 'It does the work',
          desc: 'Notes, mind maps, exam sets, flashcards, todos, essays and translation all have agent tools, so results land directly in each app; it also renders interactive explanations and sandbox demos right in chat.'
        },
        {
          title: 'Long tasks, handed off',
          desc: 'Research, organizing and question writing keep moving: goal mode continues across turns, sub-agents and Super sessions (experimental) work in parallel, and scheduled automations run on time.'
        },
        {
          title: 'Every step under control',
          desc: 'Actions are approved by execution tier and risk level before running; supports a Study Desktop emergency kill switch, diff review for note edits and per-turn conversation rollback.'
        },
        {
          title: 'Knows you, grows with you',
          desc: 'Remembers your weak spots and study habits; 58 built-in skills, 15 model providers, MCP support and the AI Plugin Workshop for hot-loadable extensions.'
        }
      ]
    },

    /**
     * Core learning loop pair (Think it through / Make it stick): StepFlow.vue renders
     * both cards directly, each opening a sheet with its screenshot and three points.
     */
    flow: {
      close: 'Close',
      steps: [
        {
          label: 'Think it through',
          statement: 'Have it work through your own materials.',
          art: 'flow-think',
          alt: 'Screenshot of an answer: a short heading, a paragraph citing two entries from your learning profile, and an “AI generated” tag at the end',
          items: [
            {
              title: 'Sources back to the original',
              desc: 'PDF page backlinks and audio/video timestamps jump straight back to the source so you can verify every claim.'
            },
            {
              title: 'Interactive explanations',
              desc: 'Streamed interactive cards, charts and isolated sandbox demos render right in chat so you can explore hard concepts hands-on.'
            },
            {
              title: 'Study Spaces and memory',
              desc: 'Isolate materials and long-term memory by subject space, and choose from five reasoning levels for tough derivations.'
            }
          ]
        },
        {
          label: 'Make it stick',
          statement: 'Turn understanding into scheduled review.',
          art: 'flow-review',
          alt: "Screenshot of today's flashcard review: a 90% progress ring, 2 due, 12 new, 4 learning, and a Start review button",
          items: [
            {
              title: 'FSRS-6 flashcard review',
              desc: 'Due cards queue automatically into today’s progress ring and adjust intervals to how well you remember — no Anki required.'
            },
            {
              title: 'Mistake book and daily sprint',
              desc: 'Cross-set mistakes feed into your FSRS review schedule and merge with flashcards and weak mind-map nodes for pre-exam sprints.'
            },
            {
              title: 'Mind-map cloze recall',
              desc: 'Hide key points on any mind map to quiz yourself, and turn any node you miss straight into a flashcard.'
            }
          ]
        }
      ]
    },

    features: {
      title: 'From reading to remembering, in one window.',
      lede: 'Chat, mind maps, practice, card making, review and reading all happen in one app, and the mind maps, questions and cards the agent creates are saved straight into the right app.',
      tabsLabel: 'Feature scenes',
      more: 'Learn more (Chinese)',
      prev: 'Previous scene',
      next: 'Next scene',
      dot: 'Scene {index}: {name}',
      scenes: [
        {
          tab: 'Material chat',
          title: 'Learning from your own material',
          lead: 'Answers grounded in your own materials.',
          desc: 'Images, voice and files in; answers cite page numbers with document-first reading, render interactive visuals and generative cards, and support deep reasoning.',
          link: '/user-guide/chat',
          art: 'chat',
          alt: 'Screenshot of the chat view: an answer citing textbook pages 45, 47 and 52'
        },
        {
          tab: 'Mind maps',
          title: 'Mind maps',
          lead: 'Organise knowledge into structure.',
          desc: 'Generate a full knowledge structure from one sentence and edit it as you chat; recitation mode hides the key points so you can test yourself.',
          link: '/user-guide/mindmap',
          art: 'mindmap',
          alt: 'Screenshot of a mind map: “Data-parallel training” branching into optimisation, the basic paradigm and the cost of synchronisation'
        },
        {
          tab: 'Practice',
          title: 'Exam sets and practice',
          lead: 'Turn textbooks and exam papers into exam sets you can drill.',
          desc: 'Questions are generated per topic with answers and explanations, and the ones you tick go into an exam set; practice is graded automatically and mastery is tracked per topic.',
          link: '/user-guide/question-bank',
          art: 'quiz',
          alt: 'Screenshot of AI-generated questions: two tagged multiple-choice drafts with options and answers'
        },
        {
          tab: 'Anki cards',
          title: 'Anki card generation',
          lead: 'Turn understanding into cards.',
          desc: 'One request makes cards in bulk; flip to check and edit them, then add them to your card library or sync to Anki in one click.',
          link: '/user-guide/anki',
          art: 'anki',
          alt: 'Screenshot of card generation: a Q&A card with page dots, above “5 cards generated” and the route, generate and done steps'
        },
        {
          tab: 'Flashcard review',
          title: 'Flashcard review',
          lead: 'Reviews happen in the same app.',
          desc: 'Built-in FSRS-6 spaced repetition queues the cards due today; rate how well you remembered and the next review is rescheduled to match.',
          link: '/user-guide/flashcards',
          art: 'review',
          alt: 'Screenshot of a review session: the answer side of a card above Again, Hard, Good and Easy with their intervals'
        },
        {
          tab: 'Reading',
          title: 'Reading and translation',
          lead: 'Read the original, translate as you go.',
          desc: 'Open PDF, Word and EPUB files; select text to explain, translate, save as a note or make a card; turn a passage into a sentence-by-sentence bilingual table.',
          link: '/user-guide/reading-translation',
          art: 'reading',
          alt: 'Screenshot of bilingual reading: an English source table aligned sentence by sentence with its Chinese translation'
        }
      ]
    },

    /** Mobile app: live Android demo and cross-device sync */
    mobile: {
      title: 'Organize on your computer,\nkeep going on your phone.',
      lede: 'The Android app is the same app with a one-handed drawer layout, so you can ask questions, look things up and review flashcards between classes or on the go.',
      more: 'Learn about the mobile app (Chinese)',
      link: '/user-guide/mobile',
      frameTitle: 'Live demo of the DeepStudent Android interface',
      items: [
        {
          title: 'Drawer navigation',
          desc: 'Swipe in from the left edge: the top of the drawer holds the current page, the bottom launches apps; the system Back button steps back one level at a time.'
        },
        {
          title: 'Full-featured, easy to share',
          desc: 'Chat, Files, Media, Todo, Skills and Flashcards all work, with Android system “Share to DeepStudent” import and direct file export.'
        },
        {
          title: 'Cross-device sync & iOS access',
          desc: 'Sync with the desktop app via WebDAV cloud sync (experimental), QR-code pairing or encrypted backups; iPhone and iPad can connect via self-hosted WebUI & PWA.'
        }
      ]
    },

    /** Media (standalone app, guide chapter 19), backed by real light and dark UI posters */
    media: {
      title: 'Lectures and talks,\nstudied with you.',
      lede: 'Import local audio and video, or paste a Bilibili link, to get timestamped subtitles. Questions, handouts and practice all draw on them and lead back to the exact moment.',
      more: 'Learn about Media (Chinese)',
      link: '/user-guide/media',
      posterAlt: 'Screenshot of Media: course-grouped online lectures and local recordings with subtitle status, watch progress and linked flashcards and questions',
      items: [
        {
          title: 'Transcribed subtitles',
          desc: 'A speech recognition model turns local audio and video into timestamped subtitles you can search; click any line to jump there. Existing subtitle files can be imported instead.'
        },
        {
          title: 'Paste a Bilibili link',
          desc: 'A Bilibili link brings in its subtitles without downloading the video, and the video plays right in the app. Signing in to Bilibili by QR code is optional and gives fuller AI subtitles.'
        },
        {
          title: 'Answers cite the moment',
          desc: 'Ask about the lecture and each timestamp in the answer opens the player at that moment; subtitles highlight line by line as it plays.'
        },
        {
          title: 'Handouts and whole courses',
          desc: 'Check understanding with in-lesson checkpoints, turn subtitles and key frames into lesson ledgers and illustrated handouts, and import multi-part series as grouped courses.'
        }
      ]
    },

    /** Extensions and self-hosting: AI Plugin Workshop and WebUI / PWA */
    extend: {
      title: 'Need a custom study tool?\nBuild one in a sentence.',
      lede: 'With the built-in AI Plugin Workshop and self-hosted WebUI, you can hot-load extensions tailored to your subjects and keep studying from any browser or phone home screen.',
      more: 'Learn about AI Plugin Workshop (Chinese)',
      link: '/user-guide/plugin-workshop',
      secondaryMore: 'Learn about WebUI & PWA (Chinese)',
      secondaryLink: '/user-guide/webui-pwa',
      items: [
        {
          title: 'AI Plugin Workshop',
          desc: 'Describe a mini app, selection button or AI tool in plain language; the system compiles, tests it in isolation and hot-loads it in one click, with rollback and export anytime.'
        },
        {
          title: 'Clear permissions and safe mode',
          desc: 'Every extension asks you to review permissions before enabling; repeated UI errors trigger automatic isolation, and safe mode restores a clean state in one click.'
        },
        {
          title: 'Self-hosted WebUI & PWA',
          desc: 'Run the server on any computer or host with Node.js 24+, and access your full study library from any browser or phone home-screen PWA.'
        }
      ]
    },

    /**
     * All apps (HomeApps.vue): ordered by collect, read, ask, organise, practise, remember, plan and extend.
     * icon maps to docs/public/apps/<icon>.svg (the app's own illustrations),
     * link is its guide chapter (in Chinese). extras are capabilities without their own grid tile
     */
    apps: {
      title: 'An app for every step, from collecting to reviewing.',
      lede: 'Open any of these study apps on its own or side by side on the Study Desktop. Each links to its guide (in Chinese).',
      items: [
        { icon: 'files', name: 'Files', desc: 'Keep textbooks, notes, exam sets, documents, audio and video in one place, indexed for AI search.', link: '/user-guide/learning-hub' },
        { icon: 'media', name: 'Media', desc: 'Transcribe lectures and recordings into timestamped subtitles or import them from a Bilibili link; ask as you watch and make illustrated handouts.', link: '/user-guide/media' },
        { icon: 'textbook', name: 'Textbook', desc: 'Read PDF, Word and EPUB in a two-page view, highlight and annotate, and ask AI about the pages you tick.', link: '/user-guide/reading-translation' },
        { icon: 'translation', name: 'Translation', desc: 'Full-text translation with side-by-side paragraphs, 7 domain presets, and quick translation of any selection.', link: '/user-guide/reading-translation' },
        { icon: 'chat', name: 'Chat', desc: 'Ask follow-up questions about your materials and get cited answers; group, search and export chats.', link: '/user-guide/chat' },
        { icon: 'notes', name: 'Notes', desc: 'Markdown notes with backlinks, tags and math; edit with AI and turn them into cards or mind maps.', link: '/user-guide/notes' },
        { icon: 'mindmap', name: 'Mind Map', desc: 'Generate a mind map from one sentence, refine it as an outline or canvas, and quiz yourself in recite mode.', link: '/user-guide/mindmap' },
        { icon: 'exam', name: 'Exam Sets', desc: 'Turn textbooks, exams and mistakes into exam sets with AI entry, nine practice modes and auto grading.', link: '/user-guide/question-bank' },
        { icon: 'essay', name: 'Essay Review', desc: 'Scores across several criteria, inline marks, sentence-by-sentence polishing and model essays.', link: '/user-guide/essay' },
        { icon: 'taskDashboard', name: 'Anki Cards', desc: 'Turn PDFs, images and notes into cards with one request; export APKG or sync to Anki.', link: '/user-guide/anki' },
        { icon: 'flashcards', name: 'Flashcards', desc: 'Review, card making and templates in one place, with built-in FSRS-6 spaced repetition so you can review daily without installing Anki.', link: '/user-guide/flashcards' },
        { icon: 'pluginWorkshop', name: 'Plugin Workshop', desc: 'Generate mini apps, selection buttons or AI tools in plain language, test and hot-load automatically, and roll back or export anytime.', link: '/user-guide/plugin-workshop' },
        { icon: 'todo', name: 'Todo', desc: 'Add tasks in plain words; quadrants, subtasks, reminders and scheduled automations.', link: '/user-guide/productivity' },
        { icon: 'pomodoro', name: 'Pomodoro', desc: 'Strict mode, ambient sounds, a floating mini timer, and charts of your focus time and trends.', link: '/user-guide/productivity' },
        { icon: 'skills', name: 'Skills', desc: 'Manage built-in and custom skills, connect external tools over MCP, and extend capabilities with the AI Plugin Workshop.', link: '/user-guide/skills-mcp' },
        { icon: 'settings', name: 'Settings', desc: 'Connect 15 model providers or local models with one-click API key auto-setup, and pick which model each feature uses.', link: '/user-guide/models' }
      ],
      more: 'Also (Chinese guides):',
      extras: [
        { name: 'Paper search', link: '/user-guide/paper-search' },
        { name: 'Deep research & memory', link: '/user-guide/research-memory' },
        { name: 'Today & weekly report', link: '/user-guide/productivity' },
        { name: 'Study Desktop', link: '/user-guide/workbench' },
        { name: 'Backup & sync', link: '/user-guide/data-sync' },
        { name: 'Android app', link: '/user-guide/mobile' },
        { name: 'Card templates', link: '/user-guide/anki' },
        { name: 'WebUI & PWA', link: '/user-guide/webui-pwa' }
      ]
    },

    privacy: {
      title: 'Data is stored on your machine by default.',
      lede: 'Study materials are stored locally by default; AI, search and sync access services according to your configuration.',
      items: [
        {
          title: 'Local storage',
          desc: 'No sign-up required. Materials, notes and chat history are stored on your machine by default. Use Settings → Data & System → Data governance to back them up or move them to another device.'
        },
        {
          title: 'When data leaves your machine',
          desc: 'Model calls, external search and MCP send relevant requests to the corresponding services. Cloud sync (with AES-256-GCM end-to-end encryption) and Sentry error reporting (off by default) only send data if you turn them on.'
        },
        {
          title: 'Open source, verifiable',
          desc: 'AGPL-3.0-or-later licensed. The privacy-related implementation lives in the source and can be checked by anyone.'
        }
      ]
    },

    /** TODO: replace with real user quotes (suggested sources: GitHub Discussions, QQ group, social posts) */
    voices: {
      title: 'From the people who use it.',
      items: [
        { handle: '@TBD', text: '(real user quote to be added)' },
        { handle: '@TBD', text: '(real user quote to be added)' },
        { handle: '@TBD', text: '(real user quote to be added)' },
        { handle: '@TBD', text: '(real user quote to be added)' }
      ]
    },

    faq: {
      title: 'Frequently asked questions',
      more: 'Still have questions?',
      moreLink: 'Ask on GitHub Discussions',
      items: [
        {
          q: 'Is DeepStudent free? How do I set up AI models?',
          a: 'The software is free and open source (AGPL-3.0-or-later) with no sign-up required. Paste an API key in the welcome dialog for 1-minute auto-setup across 15 built-in providers (you pay the provider directly), or connect a local Ollama model with no key needed.'
        },
        {
          q: 'Does my data get uploaded to the cloud?',
          a: 'Local-first does not mean every feature is offline: your files stay on your device by default, and network requests only happen for your configured model, external search, MCP, update checks, or opt-in encrypted sync and error reporting (off by default).'
        },
        {
          q: 'Where is my data stored?',
          a: 'macOS: ~/Library/Application Support/com.deepstudent.app/, Windows: %APPDATA%\\com.deepstudent.app\\, Linux: ~/.local/share/com.deepstudent.app/. Export a backup from Settings → Data & System → Data governance rather than copying the directory by hand.'
        },
        {
          q: 'Which platforms are supported?',
          a: 'Installers are available for macOS (Apple Silicon / Intel), Windows, Linux and Android. You can also self-host WebUI & PWA to study from any browser or phone home screen. iOS can be built from source with Xcode.'
        },
        {
          q: 'Will upgrading from 0.11.x to 0.20.x lose my data?',
          a: 'No. The new release mounts your existing SQLite and LanceDB data in place, migrates settings automatically and keeps installed plugins. Exporting a backup from Settings → Data & System → Data governance before a major upgrade is still recommended.'
        },
        {
          q: 'macOS says the app is damaged and cannot be opened. What now?',
          a: 'Official release builds are Apple-signed and notarized, so this warning normally does not appear. Only if you install an unnotarized preview or self-built app, run sudo xattr -r -d com.apple.quarantine "/Applications/Deep Student.app" in Terminal — keep the quotes for the space in the app name, and adjust the path if installed elsewhere.'
        }
      ]
    },

    cta: {
      title: 'Ready to focus on learning?',
      lede: 'Free, open source, no sign-up required — your study data stays on your device by default.'
    }
  }
}
