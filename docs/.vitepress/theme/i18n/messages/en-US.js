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
    previewDescription: 'The study agent reads your materials in chat and produces mind maps, practice questions and Anki cards directly.',
    /** Alt text for the real-UI screenshot in the shell; it is the same interface the demo shows */
    posterAlt:
      'The DeepStudent app: navigation and conversations on the left, and on the right the chat “高数错题 → Anki 卡片”, where the agent has generated 5 cards.',
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
      quickStart: 'Quick start (Chinese)'
    },

    /**
     * Study desktop: what the desktop app opens to (desktop.workbenchMode defaults to true in the app).
     * art maps to docs/public/features/<art>-light|dark.webp, a 1440 × 900 full-screen shot
     */
    desktop: {
      title: 'One Study Desktop, apps side by side.',
      lede: 'The desktop app opens to the Study Desktop: launch Chat, Files and your study apps from the Dock, arrange or tile windows side by side, and keep your agenda and AI study briefing on the desktop.',
      more: 'About the Study Desktop (Chinese)',
      link: '/user-guide/workbench',
      art: 'workbench',
      alt: 'Screenshot of the Study Desktop: a chat window with freshly generated Anki cards, today’s flashcard review in the middle, agenda and AI study briefing widgets on the right, and the Dock below',
      /** On wide screens with a mouse the screenshot becomes a live, clickable desktop (DesktopDemo.vue) */
      live: {
        title: 'Live Study Desktop demo',
        hint: 'This desktop is live: open apps from the Dock, drag and resize windows, start a flashcard review. The sample conversation and cards are in Chinese; the data stays on this page and resets when you reload.',
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
          desc: 'Notes, mind maps, exam sets, flashcards, todos, essays and translation all have agent tools, so results land directly in the app.'
        },
        {
          title: 'Long tasks, handed off',
          desc: 'Research, organizing and question writing keep moving: goal mode continues across turns, sub-agents work in parallel, scheduled tasks run on time.'
        },
        {
          title: 'Every step under control',
          desc: 'Actions are approved by risk level, with Ask / Plan / Craft permission modes; edits to notes and the Study Desktop can be undone.'
        },
        {
          title: 'Knows you, grows with you',
          desc: 'Remembers your weak spots and study habits; 56 built-in skills, MCP support and 13 model providers.'
        }
      ]
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
              desc: 'Textbooks, exam papers, PDFs and notes are kept together in Files, instead of scattered across cloud drives and folders.'
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
              desc: 'Save recurring workflows as skills and keep long-term preferences in memory; later answers take them into account.'
            },
            {
              title: 'Reasoning mode',
              desc: 'Switch to deep reasoning for hard derivations; the reasoning is shown alongside the conclusion.'
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
              desc: 'Turn textbooks into exam sets you can drill, with automatic grading and mastery tracked per topic.'
            },
            {
              title: 'Anki cards',
              desc: 'One request makes cards in bulk, and they sync to Anki in one click.'
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
          title: 'Exam sets and practice',
          lead: 'Turn textbooks and exam papers into exam sets you can drill.',
          desc: 'Questions are generated per topic with answers and explanations, and the ones you tick go into a question set; practice is graded automatically and mastery is tracked per topic.',
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
          desc: 'Built-in FSRS spaced repetition queues the cards due today; rate how well you remembered and the next review is rescheduled to match.',
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

    /**
     * Media (its own app since 0.10.2, guide chapter 19). Every feature-carousel scene needs a real screenshot from the
     * demo mirror, which has no media script yet, so it gets its own block laid out like the agent block
     */
    mobile: {
      title: 'Organize on your computer,\nkeep going on your phone.',
      lede: 'The Android app is the same app with a one-handed drawer layout, so you can ask questions, look things up and review flashcards between classes or on the go.',
      more: 'Learn about the mobile app',
      link: '/user-guide/mobile',
      download: 'Download for Android',
      downloadLink: '/download',
      live: 'The phone on the right is a live demo — tap around.',
      items: [
        {
          title: 'Drawer navigation',
          desc: 'Swipe in from the left edge: the top of the drawer holds the current page, the bottom launches apps; the system Back button steps back one level at a time.'
        },
        {
          title: 'Nearly everything is there',
          desc: 'Chat, Files, Media, Todo, Skills and Flashcards all work; only a few computer-only features such as the Study Desktop are left out.'
        },
        {
          title: 'In sync with your computer',
          desc: 'Share data with the desktop app through WebDAV cloud sync (experimental), or move it with a backup file.'
        }
      ]
    },
    media: {
      title: 'Lectures and talks,\nstudied with you.',
      lede: 'Import local audio and video, or paste a Bilibili link, to get timestamped subtitles. Questions, handouts and practice all draw on them and lead back to the exact moment.',
      more: 'Learn about Media',
      link: '/user-guide/media',
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
          desc: 'Subtitles and key frames become an illustrated handout saved as a note; a multi-part collection imports in one go and stays grouped as one course.'
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
      lede: 'All of these live in the desktop app’s Dock and All Apps panel. Open one on its own or side by side on the Study Desktop. Each links to its guide (in Chinese).',
      items: [
        { icon: 'files', name: 'Files', desc: 'Keep textbooks, notes, question sets, documents, audio and video in one place, indexed for AI search.', link: '/user-guide/learning-hub' },
        { icon: 'media', name: 'Media', desc: 'Transcribe lectures and recordings into timestamped subtitles or import them from a Bilibili link; ask as you watch and make illustrated handouts.', link: '/user-guide/media' },
        { icon: 'textbook', name: 'Textbook', desc: 'Read PDF, Word and EPUB in a two-page view, highlight and annotate, and ask AI about the pages you tick.', link: '/user-guide/reading-translation' },
        { icon: 'translation', name: 'Translation', desc: 'Full-text translation with side-by-side paragraphs, 7 domain presets, and quick translation of any selection.', link: '/user-guide/reading-translation' },
        { icon: 'chat', name: 'Chat', desc: 'Ask follow-up questions about your materials and get cited answers; group, search and export chats.', link: '/user-guide/chat' },
        { icon: 'notes', name: 'Notes', desc: 'Markdown notes with backlinks, tags and math; edit with AI and turn them into cards or mind maps.', link: '/user-guide/notes' },
        { icon: 'mindmap', name: 'Mind Map', desc: 'Generate a mind map from one sentence, refine it as an outline or canvas, and quiz yourself in recite mode.', link: '/user-guide/mindmap' },
        { icon: 'exam', name: 'Exam Sets', desc: 'Turn textbooks, exams and mistakes into exam sets with AI entry, nine practice modes and auto grading.', link: '/user-guide/question-bank' },
        { icon: 'essay', name: 'Essay Review', desc: 'Scores across several criteria, inline marks, sentence-by-sentence polishing and model essays.', link: '/user-guide/essay' },
        { icon: 'taskDashboard', name: 'Anki Cards', desc: 'Turn PDFs, images and notes into cards with one request; export APKG or sync to Anki.', link: '/user-guide/anki' },
        { icon: 'flashcards', name: 'Flashcards', desc: 'Review, card making and templates in one place, with built-in FSRS so you can review daily without installing Anki.', link: '/user-guide/flashcards' },
        { icon: 'templates', name: 'Templates', desc: 'Edit Anki card templates visually and reuse them when you generate cards.', link: '/user-guide/anki' },
        { icon: 'todo', name: 'Todo', desc: 'Add tasks in plain words; quadrants, subtasks, reminders and scheduled automations.', link: '/user-guide/productivity' },
        { icon: 'pomodoro', name: 'Pomodoro', desc: 'Strict mode, ambient sounds, a floating mini timer, and charts of your focus time and trends.', link: '/user-guide/productivity' },
        { icon: 'skills', name: 'Skills', desc: 'Let the AI load skills on demand and reach external tools over MCP. Install them or write your own.', link: '/user-guide/skills-mcp' },
        { icon: 'settings', name: 'Settings', desc: 'Connect 13 model providers or local models, and pick which model each feature uses.', link: '/user-guide/models' }
      ],
      more: 'Also:',
      extras: [
        { name: 'Paper search', link: '/user-guide/paper-search' },
        { name: 'Deep research & memory', link: '/user-guide/research-memory' },
        { name: 'Today & weekly report', link: '/user-guide/productivity' },
        { name: 'Study Desktop', link: '/user-guide/workbench' },
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
