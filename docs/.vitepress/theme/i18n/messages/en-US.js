/**
 * English copy.
 *
 * Keys mirror zh-CN.js one-to-one; anything missing here falls back to Chinese.
 * Entries carrying href / match / link / img are routing and asset data — when
 * translating, only text / title / desc / alt normally need to change.
 * Docs pages are still Chinese-only, so links out of this landing page point at
 * the Chinese documentation on purpose.
 *
 * House style for this page: one idea per sentence, main clause first, keep each
 * block to about two lines so it can be skimmed.
 */
export default {
  nav: {
    landing: {
      docs: 'Docs',
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
    loading: 'Loading live demo…'
  },

  demo: {
    tabsLabel: 'Feature demo',
    sideLabel: 'Switch demo section',
    views: [
      { id: 'chat', label: 'Chat' },
      { id: 'library', label: 'Library' },
      { id: 'mindmap', label: 'Mind map' },
      { id: 'quiz', label: 'Practice' },
      { id: 'anki', label: 'Anki cards' }
    ],
    branches: ['Definitions', 'Key derivations', 'Worked examples', 'Common pitfalls'],
    chips: ['Material · Ch. 3', 'Notes · Review outline'],
    mindRoot: 'Core concepts',
    caption: 'Layout sketch · click a section on the left to switch'
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
      quickStart: 'Quick start'
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
          img: '/flow-think-dither.svg',
          alt: 'A single dithered question bubble',
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
          img: '/flow-review-dither.svg',
          alt: 'A single dithered review loop symbol',
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
      title: 'Four tools, one window.',
      lede: 'Material chat, mind maps, practice questions and Anki cards share a single dataset — no shuttling between apps.',
      tabsLabel: 'Feature scenes',
      more: 'Learn more',
      prev: 'Previous scene',
      next: 'Next scene',
      dot: 'Scene {index}: {name}',
      scenes: [
        {
          tab: 'Material chat',
          title: 'Learning from your own material',
          lead: 'Learn around your own material, not just generic chat.',
          desc: 'Images, voice and files in; a citation panel that pulls from your sources; deep reasoning for hard questions.',
          link: '/user-guide/01-chat-v2',
          img: '/feature-chat-dither.svg',
          alt: 'Dithered artwork of a material page linked to a chat bubble'
        },
        {
          tab: 'Mind maps',
          title: 'Mind maps',
          lead: 'Organise knowledge into structure.',
          desc: 'Generate a full knowledge structure from one sentence, edit it as you chat, and hide nodes to test yourself.',
          link: '/user-guide/02-learning-hub-assets/05-mindmap',
          img: '/feature-mindmap-dither.svg',
          alt: 'Dithered artwork of a mind map with node levels'
        },
        {
          tab: 'Practice',
          title: 'Question banks and practice',
          lead: 'Turn textbooks and exam papers into a drillable bank.',
          desc: 'Questions are pulled from your material or generated, graded automatically, and tracked per topic.',
          link: '/user-guide/02-learning-hub-assets/03-question-bank',
          img: '/feature-quiz-dither.svg',
          alt: 'Dithered artwork of a quiz sheet with a grading badge'
        },
        {
          tab: 'Anki cards',
          title: 'Anki card generation',
          lead: 'Turn understanding into long-term memory.',
          desc: 'Say the word and cards get made — in bulk, and synced to Anki in one click.',
          link: '/user-guide/03-chatanki',
          img: '/feature-anki-dither.svg',
          alt: 'Dithered artwork of a card stack with a forgetting curve'
        }
      ]
    },

    privacy: {
      title: 'Data is stored on your machine by default.',
      lede: 'No network access and no uploads by default; AI calls use the key you configure yourself.',
      items: [
        {
          title: 'Local storage',
          desc: 'Material, notes and chat history are written to your own machine by default. Nothing is uploaded and no statistics are collected.'
        },
        {
          title: 'When data leaves your machine',
          desc: 'When you call an AI model, the relevant context is sent to the provider you configured. If you enable WebDAV or S3 sync, data inside the sync scope is written to that cloud storage.'
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
      moreLink: 'Go to the support centre',
      items: [
        {
          q: 'Is DeepStudent free?',
          a: 'The software is free and open source (AGPL-3.0). AI features use your own key, so you pay the model provider directly — or point it at a local model and pay nothing extra.'
        },
        {
          q: 'Does my data get uploaded to the cloud?',
          a: 'No. Material, notes and chat history stay on your own machine by default. Data only leaves your device in two cases: when you use AI, where the relevant content goes to the model provider you configured, or when you set up WebDAV / S3 sync yourself.'
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
          a: "That is macOS quarantining an app that didn't come from the App Store. Run sudo xattr -r -d com.apple.quarantine /Applications/DeepStudent.app in Terminal, replacing the path with your real install location."
        }
      ]
    }
  }
}
