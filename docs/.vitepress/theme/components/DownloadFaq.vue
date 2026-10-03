<script setup>
/**
 * 下载页 FAQ：复用首页那套 `.lp-faq` 折叠（样式已在 custom.css 里），
 * 这里只提供条目与开合状态，保证两处的折叠手感完全一致。
 *
 * 条目只回答「下载这一步」会遇到的事，跟 /support 与 /A-Q 不重复：
 * 那边管使用问题，这里管拿不到、装不上。
 */
import { ref } from 'vue'

const items = [
  {
    q: '下载完 macOS 提示「已损坏」或「无法验证开发者」，打不开。',
    a: '这是系统对未签名应用的标准拦截，不是文件真的坏了。按上面「安装说明 → macOS」的第 3 步执行一次 xattr 命令，再打开就正常了。'
  },
  {
    q: '该下 Apple Silicon 版还是 Intel 版？',
    a: '打开「关于本机」看「芯片」那一行：写着 Apple 芯片或 M1 / M2 / M3 这类型号就下 Apple Silicon，写着 Intel 就下 Intel 版。下错了装不上，但两个包都在这里，换一个重下就行。'
  },
  {
    q: 'Linux 该下 AppImage、deb 还是 rpm？',
    a: 'Debian、Ubuntu 及其衍生版选 deb，Fedora、openSUSE 选 rpm，装好后会出现在应用菜单里、卸载也走包管理器。其它发行版，或者只想先试试，就用 AppImage：一个文件，加上执行权限就能运行。三个包都只支持 x86_64。'
  },
  {
    q: '下载很慢，或者中途断了。',
    a: '「下载」按钮默认走国内镜像（Cloudflare），旁边的「GitHub」是同一版本的同名文件，两条通道互为备份。哪条慢就换另一条；所在网络访问 GitHub 更顺的话，直接点 GitHub 即可。'
  },
  {
    q: 'Windows 提示「Windows 已保护你的电脑」。',
    a: '这是 SmartScreen 对新应用的默认拦截。点「更多信息」，再点「仍要运行」即可继续安装。'
  },
  {
    q: '安装包多大？需要旧版本怎么办？',
    a: '每个平台的版本与体积都写在上面各自的下载行里。需要历史版本的话：',
    link: {
      href: 'https://github.com/helixnow/deep-student/releases',
      text: 'GitHub Releases 发布记录'
    }
  }
]

/** -1 表示全部收起。同时只开一条，读起来不会变成一堵墙 */
const open = ref(-1)

const toggle = (index) => {
  open.value = open.value === index ? -1 : index
}
</script>

<template>
  <div class="lp-faq dl-faq">
    <div
      v-for="(item, index) in items"
      :key="item.q"
      class="lp-faq__item"
      :data-open="open === index"
    >
      <h3>
        <button
          class="lp-faq__btn"
          type="button"
          :aria-expanded="open === index"
          @click="toggle(index)"
        >
          <span>{{ item.q }}</span>
          <svg
            class="lp-faq__chev"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
          >
            <path d="M3.5 6l4.5 4.5L12.5 6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </h3>
      <div class="lp-faq__panel">
        <div class="lp-faq__inner">
          <p class="lp-faq__answer">
            {{ item.a }}<template v-if="item.link"> <a
              :href="item.link.href"
              target="_blank"
              rel="noreferrer"
            >{{ item.link.text }}</a></template>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
