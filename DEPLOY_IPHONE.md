# iPhone 部署与神经语音

## 1. 上传网页

1. 在 Cloudflare Pages 新建 **Direct Upload** 项目。
2. 直接上传 `GRE-IELTS-PWA-v57.zip` 或 `iphone-pwa-v57` 文件夹。
3. 等待 Cloudflare 生成 HTTPS 网址。
4. 用 iPhone Safari 打开该网址，点“分享”→“添加到主屏幕”→开启“作为 Web App 打开”。

## 2. 保留高质量神经语音

部署包已附带现有神经语音缓存；这些音频无需配置即可播放。要让从未播放过的任意例句也能按需生成同等质量的神经语音，需在 Cloudflare Pages 项目中配置两个加密环境变量：

- `AZURE_SPEECH_KEY`：Azure AI Speech 资源密钥
- `AZURE_SPEECH_REGION`：该资源的区域，例如 `eastasia`

请将密钥设为 Cloudflare 的 Secret，不要写入网页文件。服务端会继续使用：

- 英语：`en-US-AvaMultilingualNeural`
- 中文：`zh-CN-XiaoxiaoNeural`

新音频生成后会同时缓存在 Cloudflare 边缘和当前 iPhone，后续播放不会重复生成。

## 3. 断网行为

- 已缓存网页内容和音频：可离线使用。
- 从未生成的音频：需等恢复网络后首次生成。
- 只有在神经语音和真人词典录音都不可用时，网页才会使用系统语音兜底。
