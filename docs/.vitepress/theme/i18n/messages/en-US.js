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
   * The download and support pages are Chinese-only, so English visitors go to places
   * with an English UI instead: GitHub Releases lists every installer, Discussions takes
   * questions. Docs have no English counterpart; those links say "(Chinese)" in their label.
   */
  links: {
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
    previewDescription: 'Discuss your study materials, then turn your understanding into mind maps, practice questions and Anki cards.',
    /** Alt text for the real-UI screenshot in the shell; it is the same interface the demo shows */
    posterAlt:
      'The DeepStudent app: resources and conversations on the left, a material-grounded Q&A with citations on the right, already turned into 5 Anki cards.',
    waiting: 'The live demo loads automatically. Start it here instead.',
    loading: 'Loading the interactive live demo…',
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
      title: 'An open-source space for lifelong learning',
      /* 第二行前面靠这个尾随空格和第一行断开；移动端 <br> 生效时它会被折叠掉 */
      lede: ['Open source and local-first — ', 'your material and data stay with you'],
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
      quickStart: 'Quick start (Chinese)'
    },

    /**
     * Study desktop: what the desktop app opens to (desktop.workbenchMode defaults to true in the app).
     * art maps to docs/public/features/<art>-light|dark.webp, a 1440 × 900 full-screen shot
     */
    desktop: {
      title: 'One study desktop, apps side by side.',
      lede: 'The desktop app opens to a study desktop: launch Chat, Library and your study apps from the Dock, arrange or tile windows side by side, and keep your agenda and AI study briefing on the desktop.',
      more: 'About the study desktop (Chinese)',
      link: '/user-guide/workbench',
      art: 'workbench',
      alt: 'Screenshot of the study desktop: a chat window with freshly generated Anki cards, today’s flashcard review in the middle, agenda and AI study briefing widgets on the right, and the Dock below',
      /** On wide screens with a mouse the screenshot becomes a live, clickable desktop (DesktopDemo.vue) */
      live: {
        title: 'Live study desktop demo',
        hint: 'This desktop is live: open apps from the Dock, drag and resize windows, start a flashcard review. The demo interface is in Chinese; its data stays on this page and resets when you reload.',
        narrow: 'Widen your browser window to at least 1024 pixels to try this desktop live, or tap the picture to see it full size.',
        touch: 'Tap the picture to see it full size and swipe across the desktop. Open this page on a computer to try it live, or scroll up to the demo at the top to try the app on your phone.',
        zoom: 'View full size',
        pan: 'Swipe to see the whole desktop',
        close: 'Close',
        waiting: 'It loads when you scroll here. You can also start it now.',
        loading: 'Opening the study desktop…',
        delayed: 'The study desktop is not ready yet. You can retry.',
        start: 'Load now'
      }
    },

    /**
     * How it works: the block has no heading at all — eyebrow, lede and `title`
     * are gone. The three `label`s on the segmented control are the step headings
     * (see StepFlow.vue), so `label` has no other consumer; don't render it again
     * inside the panel. Step numbering is gone too, so the progress readout falls
     * back to plain 1-based numbers — see progressLabel.
     */
    flow: {
      segLabel: 'How-it-works steps',
      hint: 'Keep scrolling for the next step',
      progress: '{current} / {total}',
      close: 'Close',
      steps: [
        {
          label: 'Bring it in',
          statement: 'Start by bringing your material in.',
          items: [
            {
              title: 'One place for everything',
              desc: 'Textbooks, exam papers, PDFs and notes all land in one library — no more digging through cloud drives.'
            },
            {
              title: 'Scans work too',
              desc: 'Scanned PDFs are read automatically, so you can still search them, cite them and turn them into questions.'
            },
            {
              title: 'The index stays local',
              desc: 'The search index is built on your own machine and can be rebuilt or deleted whenever you want.'
            }
          ]
        },
        {
          label: 'Think it through',
          statement: 'Converse around your own material.',
          art: 'flow-think',
          alt: 'Screenshot of an answer: a short heading, a paragraph citing two entries from your learning profile, and an “AI generated” tag at the end',
          items: [
            {
              title: 'Answers with sources',
              desc: 'Every answer marks the passage it used, so one click takes you back to the original.'
            },
            {
              title: 'Skills and memory',
              desc: 'Save recurring workflows as skills and let long-term preferences go into memory — it fits your habits the more you use it.'
            },
            {
              title: 'Reasoning mode',
              desc: 'Switch to deep reasoning for hard derivations and watch the process, not just the conclusion.'
            }
          ]
        },
        {
          label: 'Make it stick',
          statement: 'Turn it into something you can review.',
          art: 'flow-review',
          alt: "Screenshot of today's flashcard review: a 90% progress ring, 2 due, 12 new, 4 learning, and a Start review button",
          items: [
            {
              title: 'Mind maps',
              desc: 'Generate a full knowledge structure from one sentence, edit it as you chat, and hide nodes to test yourself.'
            },
            {
              title: 'Practice questions',
              desc: 'Turn textbooks into a drillable question bank with automatic grading and visible mastery.'
            },
            {
              title: 'Anki cards',
              desc: 'Say the word and cards get made — in bulk, and synced to Anki in one click.'
            }
          ]
        }
      ]
    },

    features: {
      title: 'From reading to remembering, in one window.',
      lede: 'Material chat, mind maps, practice, cards, review and reading share a single dataset — no shuttling between apps.',
      tabsLabel: 'Feature scenes',
      more: 'Learn more (Chinese)',
      prev: 'Previous scene',
      next: 'Next scene',
      dot: 'Scene {index}: {name}',
      scenes: [
        {
          tab: 'Material chat',
          title: 'Learning from your own material',
          lead: 'Learn around your own material, not just generic chat.',
          desc: 'Images, voice and files in; answers cite your sources down to the page; deep reasoning for hard questions.',
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
          title: 'Question banks and practice',
          lead: 'Turn textbooks and exam papers into a drillable bank.',
          desc: 'Questions are generated per topic with answers and explanations, and the ones you tick go into a question set; practice is graded automatically and mastery is tracked per topic.',
          link: '/user-guide/question-bank',
          art: 'quiz',
          alt: 'Screenshot of AI-generated questions: two tagged multiple-choice drafts with options and answers'
        },
        {
          tab: 'Anki cards',
          title: 'Anki card generation',
          lead: 'Turn understanding into cards.',
          desc: 'Say the word and cards get made, in bulk; flip to check, edit, then add them to your library or sync to Anki in one click.',
          link: '/user-guide/anki',
          art: 'anki',
          alt: 'Screenshot of card generation: a Q&A card with page dots, above “5 cards generated” and the route, generate and done steps'
        },
        {
          tab: 'Flashcard review',
          title: 'Flashcard review',
          lead: 'Review without leaving the app.',
          desc: 'Built-in FSRS spaced repetition queues the cards due today; rate how well you remembered and the next review is rescheduled to match.',
          link: '/user-guide/flashcards',
          art: 'review',
          alt: 'Screenshot of a review session: the answer side of a card above Again, Hard, Good and Easy with their intervals'
        },
        {
          tab: 'Reading',
          title: 'Reading and translation',
          lead: 'Read the original, and understand it.',
          desc: 'Open PDF, Word and EPUB files; select text to explain, translate, save as a note or make a card; turn a passage into a sentence-by-sentence bilingual table.',
          link: '/user-guide/reading-translation',
          art: 'reading',
          alt: 'Screenshot of bilingual reading: an English source table aligned sentence by sentence with its Chinese translation'
        }
      ]
    },

    /**
     * All apps (HomeApps.vue): the apps in the desktop Dock and All Apps panel, in the order you collect, read, ask, organise,
     * practise, remember, plan and extend. icon maps to docs/public/apps/<icon>.svg (the app's own illustrations),
     * link is its guide chapter (in Chinese). extras are capabilities without an app of their own
     */
    apps: {
      title: 'An app for every step, from collecting to reviewing.',
      lede: 'All of these live in the desktop app’s Dock and All Apps panel. Open one on its own or side by side on the study desktop. Each links to its guide (in Chinese).',
      items: [
        { icon: 'files', name: 'Library', desc: 'Keep textbooks, notes, question sets and documents in one place, indexed for AI search.', link: '/user-guide/learning-hub' },
        { icon: 'textbook', name: 'Reader', desc: 'Read PDF, Word and EPUB in a two-page view, highlight and annotate, and ask AI about the pages you tick.', link: '/user-guide/reading-translation' },
        { icon: 'translation', name: 'Translation', desc: 'Full-text translation with side-by-side paragraphs, 7 domain presets, and quick translation of any selection.', link: '/user-guide/reading-translation' },
        { icon: 'chat', name: 'Chat', desc: 'Ask follow-up questions about your materials and get cited answers; group, search and export chats.', link: '/user-guide/chat' },
        { icon: 'notes', name: 'Notes', desc: 'Markdown notes with backlinks, tags and math; edit with AI and turn them into cards or mind maps.', link: '/user-guide/notes' },
        { icon: 'mindmap', name: 'Mind Maps', desc: 'Generate a mind map from one sentence, refine it as an outline or canvas, and quiz yourself in recite mode.', link: '/user-guide/mindmap' },
        { icon: 'exam', name: 'Question Sets', desc: 'Turn textbooks, exams and mistakes into a question bank with AI entry, nine practice modes and auto grading.', link: '/user-guide/question-bank' },
        { icon: 'essay', name: 'Essay Review', desc: 'Scores across several criteria, inline marks, sentence-by-sentence polishing and model essays.', link: '/user-guide/essay' },
        { icon: 'taskDashboard', name: 'Anki Cards', desc: 'Turn PDFs, images and notes into cards with one request; export APKG or sync to Anki.', link: '/user-guide/anki' },
        { icon: 'flashcards', name: 'Flashcards', desc: 'Built-in FSRS spaced repetition with a card library, so you can review daily without installing Anki.', link: '/user-guide/flashcards' },
        { icon: 'templates', name: 'Card Templates', desc: 'Edit Anki card templates visually and reuse them when you generate cards.', link: '/user-guide/anki' },
        { icon: 'todo', name: 'To-do', desc: 'Add tasks in plain words; quadrants, subtasks, reminders and scheduled automations.', link: '/user-guide/productivity' },
        { icon: 'pomodoro', name: 'Pomodoro', desc: 'Strict mode, ambient sounds, a floating mini timer, and your focus time and trends at a glance.', link: '/user-guide/productivity' },
        { icon: 'skills', name: 'Skills & MCP', desc: 'Let the AI load skills on demand and reach external tools over MCP. Install them or write your own.', link: '/user-guide/skills-mcp' },
        { icon: 'settings', name: 'Settings', desc: 'Connect 13 model providers or local models, and pick which model each feature uses.', link: '/user-guide/models' }
      ],
      more: 'Also:',
      extras: [
        { name: 'Paper search', link: '/user-guide/paper-search' },
        { name: 'Deep research & memory', link: '/user-guide/research-memory' },
        { name: 'Today & weekly report', link: '/user-guide/productivity' },
        { name: 'Study desktop', link: '/user-guide/workbench' },
        { name: 'Backup & sync', link: '/user-guide/data-sync' },
        { name: 'Android app', link: '/user-guide/mobile' }
      ]
    },

    privacy: {
      title: 'Data is stored on your machine by default.',
      lede: 'Study materials are stored locally by default; AI, search and sync access services according to your configuration.',
      items: [
        {
          title: 'Local storage',
          desc: 'Materials, notes and chat history are stored on your machine by default. Use Settings → Data governance to back them up or move them to another device.'
        },
        {
          title: 'When data leaves your machine',
          desc: 'Model calls, external search and MCP send relevant requests to the corresponding services. Enabling cloud sync or Sentry error reporting also sends the relevant data to those services.'
        },
        {
          title: 'Open source, verifiable',
          desc: 'AGPL-3.0 licensed. The privacy-related implementation lives in the source and can be checked by anyone.'
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
          q: 'Is DeepStudent free?',
          a: 'The software is free and open source (AGPL-3.0). AI features use your own key, so you pay the model provider directly — or point it at a local model and pay nothing extra.'
        },
        {
          q: 'Does my data get uploaded to the cloud?',
          a: 'Study materials are stored locally by default, but local-first does not mean every feature is offline. AI sends the necessary content to your configured model provider. External search, MCP, and cloud sync or error reporting that you enable may also send relevant requests or data. Desktop apps also check for updates according to your settings.'
        },
        {
          q: 'Where is my data stored?',
          a: 'macOS: ~/Library/Application Support/com.deepstudent.app/, Windows: %APPDATA%\\com.deepstudent.app\\, Linux: ~/.local/share/com.deepstudent.app/. Export a backup from Settings → Data governance rather than copying the directory by hand.'
        },
        {
          q: 'Which platforms are supported?',
          a: 'Installers are available for macOS (Apple Silicon / Intel), Windows, Linux and Android. iOS needs to be built from source with Xcode.'
        },
        {
          q: 'macOS says the app is damaged and cannot be opened. What now?',
          a: "That is macOS quarantining an app that didn't come from the App Store. Run sudo xattr -r -d com.apple.quarantine \"/Applications/Deep Student.app\" in Terminal. The app name contains a space, so keep the quotes; replace the path if you installed it elsewhere."
        }
      ]
    }
  }
}
