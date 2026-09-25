---
description: DeepStudent 支持中心：微信与 QQ 技术交流群二维码、一般支持与合作交流邮箱、Bug 报告与功能建议的提问方式、修复进度跟踪入口，以及更新日志与下载页面指引。
---

# 支持

遇到问题、想提建议，或者想聊聊合作，都可以直接找我们。

## 扫码联系

<!--
  两张码排在最上面，先于邮箱：扫码是零门槛路径，写邮件得先组织语言。
  标题下不再写引导句 —— 卡面标题（微信 / 技术交流群）已经说清是什么，
  再来一句引导语只是把标题又重复一遍。
  两张码直接铺开，不做 hover 浮层 —— 这一页就是「怎么找到我们」，
  把码藏起来等于没有（页脚那种浮层是因为页脚只有图标的位置）。

  码图恒为白底，不跟主题反色 —— 反色码多数扫码器认不出，
  所以卡面用 --lp-tile 跟随主题，码图自己留一块白盘。

  桌面端没法扫自己屏幕上的码，所以每张卡都留一条可点的出口：
  技术交流群指向 QQ 的加群链接（qm.qq.com，长期有效）。
  微信没有对应的链接可给，只能扫。

  维护提示：/qr-wechat.png 是微信客户端导出的截图，不是算出来的。
  截图是竖图（头像 + 昵称 + 码 + 一句英文提示），整张塞进卡位会被压扁，
  所以换码时把新截图交给 scripts/prepare-wechat-qr.py：它按暗像素跨度找码、
  补够静区、压成 480×480，并顺手扫一遍验证能解出。
  当前这张码指向 https://u.wechat.com/MGC7m6Omi7zfb0S3BR7UgWA?s=2。
  另：微信群的二维码 7 天过期，所以群里放的是不过期的 QQ 群，别顺手换成微信群的图。
-->
<ul class="sp-qr">
  <li class="sp-qr__item">
    <img
      class="sp-qr__img"
      src="/qr-wechat.png"
      alt="微信二维码，扫码添加好友"
      width="480"
      height="480"
    />
    <p class="sp-qr__title">微信</p>
    <p class="sp-qr__desc">扫码添加微信，直接聊合作</p>
  </li>
  <li class="sp-qr__item">
    <img
      class="sp-qr__img"
      src="/qr-qq-group.png"
      alt="DeepStudent 技术交流群（QQ 群 310134919）的二维码"
      width="480"
      height="480"
    />
    <p class="sp-qr__title">DeepStudent 技术交流群</p>
    <p class="sp-qr__desc">
      扫码加入 QQ 群 310134919<br />
      在电脑上打开：<a
        href="https://qm.qq.com/q/1lTUkKSaB6"
        target="_blank"
        rel="noopener noreferrer"
        >加群链接</a
      >
    </p>
  </li>
</ul>

## 直接联系我们

| 事项 | 邮箱 | 适合的问题 |
| --- | --- | --- |
| 一般支持 | [support@deepstudent.cn](mailto:support@deepstudent.cn) | 使用问题、Bug 反馈、文档纠错、安装与更新疑难 |
| 合作交流 | [contact@deepstudent.cn](mailto:contact@deepstudent.cn) | 商务合作、内容共建、课程与社区联动 |

邮件里附上版本号、系统环境与截图，通常能让问题一次说清。

## 支持常见问题

### 怎样的 bug 报告才管用？

写清版本、环境、确切输出和最小复现步骤。报告越清晰，分类和修复就越快。

### 我可以许愿新功能吗？

当然可以！您在 GitHub 上开一个 issue 或者在开发者群，说清你的工作流背景、眼下的临时做法，以及你想要的结果。场景越具体，越有助于我们排优先级。

### 我在哪里可以跟踪已发布的修复？

已发布的更新看更新日志，发布前的实现进度看对应的 issue 讨论串。

## 常用入口

- 需要版本详情？请查看[更新日志](https://github.com/helixnow/deep-student/releases)。
- 需要二进制文件或安装命令？请前往[下载页面](download.md)。
- 想先自己排查一遍？请查看[常见问题（FAQ）](A-Q.md)。
- 还没装好？请从[快速上手](start.md)开始。
- 想反馈问题？请前往 [GitHub Issues](https://github.com/helixnow/deep-student/issues)。
