# Infinite Canvas 本地 Docker 部署与维护

本目录从源码构建 `infinite-canvas-local:dev`，不使用上游发布镜像。来源与原许可证见根目录 `README.md` 和 `LICENSE`。

## 启动

需要可用的 Docker Engine 和 Docker Compose v2。在**当前完整源码目录**执行：

```bash
docker compose up -d --build infinite-canvas
```

首次构建需要获取 Dockerfile 中锁定的基础镜像与 Python 依赖。不要只复制 Compose 文件到空目录，本地构建还需要源码和依赖锁文件。

页面地址：`http://localhost:3000`；在其他设备使用时，将 localhost 换成服务器地址。

## 修改源码

修改后重新执行：

```bash
docker compose up -d --build infinite-canvas
```

不要使用 `docker compose pull` 更新应用，它不是本地源码的更新方式。

## 数据与备份

下列目录挂载到容器，重建时保持不变：

- `API/`：API 环境配置与密钥。
- `data/`：渠道配置、画布、对话、素材索引及本地化备份。
- `assets/`：上传素材和资产文件。
- `output/`：输出目录。

备份时应一起保存上述目录。它们被 Git 忽略，**提交源码不等于备份运行数据**。不要把含密钥的备份放进公开静态资源目录。

## 日常操作

```bash
# 查看状态
docker compose ps
# 查看日志
docker compose logs --tail 100 infinite-canvas
# 仅重启，不重建源码
docker compose restart infinite-canvas
# 停止容器
docker compose down
```

如果页面显示旧样式，先确认容器重建成功，再刷新或重新打开页面。验证使用现有 3000 端口，不额外启动本地服务。

## 本地独立版

本分支只通过本地源码构建，镜像名为 `infinite-canvas-local:dev`。不再检查、下载或应用原项目的更新，也没有更新回滚接口；后续修改使用 Git 管理，再执行：

```bash
docker compose up -d --build infinite-canvas
```

- 新安装的 API 渠道列表为空；渠道、模型和工作流以用户配置为准，不自动补回内置平台或覆盖配置。
- 已移除推荐渠道、邀请链接、作者社交入口以及默认 ModelScope LoRA、RunningHub 模板和远程 GitHub 模型目录。
- 自行配置的 API 和本地 ComfyUI 仍可使用。这里的“本地”是独立部署与维护，不代表已配置的远程 AI API 能离线运行；协议适配代码仍保留供手动接入。
- 不再默认使用公共图床。确需外传素材时，须自行设置 `LITTERBOX_UPLOAD_URL` 或 `TEMP_SH_UPLOAD_URL`。
- 当前部署清理前的渠道配置备份位于 `data/localization-backup/api_providers.json`，不会通过静态资源接口公开。自行添加的渠道和原有素材、画布未删除。
- Docker 初次构建仍需获取 Python 基础镜像和 requirements 中的依赖；运行时的前端静态资源随项目提供。
- 原许可证及来源署名保留在 `LICENSE`、`README.md`，本地化不改变原授权条件。

回归测试（不启动新端口）：

```bash
docker compose exec -T infinite-canvas python -m unittest discover -s tests -v
```

构建依赖固定在 `requirements.lock`，Python 基础镜像固定 digest，避免重建时自动升级。主动升级依赖后须重新验证并更新锁定文件。

## 移动端使用与验证

- 手机底栏固定为画布、对话、生图、素材、更多；本地工具与 API / 工作流设置在“更多”中。
- 对话页手机回车换行，点击发送按钮发送；桌面保留 Enter 发送，输入法选字不触发发送。
- 普通画布可单指拖动空白区域、双指缩放；快捷工具横滑查看，箭头按钮可折叠。
- 智能画布增加触摸平移、缩放、节点拖动，以及左下角“添加节点”入口；输入区和按钮仍按正常触摸操作处理。
- 素材库默认收起库 / 分组树，点击分组条展开；API 平台列表横滑选择，保存栏随编辑区域置顶。
- 移动样式集中在 `static/css/mobile.css`，共享导航与视口处理在 `static/js/mobile.js`，智能画布触摸适配在 `static/js/smart-canvas-touch.js`。

浏览器回归测试仅访问现有服务，模拟所有 API 写请求，不修改真实数据。需本机已有 Playwright Core 和 Chromium：

```bash
PLAYWRIGHT_MODULE=/path/to/node_modules/playwright-core node tests/mobile-browser.cjs
```

覆盖 320 / 390 / 768 / 1280px、主要页面布局、导航、空白画布触摸平移和缩放、智能画布节点操作。真实 iOS / Android 键盘和浏览器行为仍需真机验收。
