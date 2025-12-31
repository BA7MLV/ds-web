# A&Q
::: warning macOS 安装显示显示“已损坏，无法打开。 您应该将它移到废纸篓”
:::

出现此问题，可以使用接下来用这种方法：
在终端粘贴复制输入命令（注意最后有一个空格）：

  ```shell
sudo xattr -r -d com.apple.quarantine 
  ```

！请先不要按回车 ！请先不要按回车

1.打开 “访达”（Finder）进入 “应用程序” 目录，找到该软件图标，将图标拖到刚才的终端窗口里面，会得到如下组合：

sudo xattr -r -d com.apple.quarantine /Applications/WebStrom.app

2.回到终端窗口按回车，输入系统密码回车即可。
3.打开软件。