# 仓库清理记录

本目录按本地 Docker 部署用途清理。仅删除旧分发包与独立工具，没有删除运行数据，也没有重写 Git 历史。

## 保留

- `.git/`：原有历史及本地提交能力；已移除原上游远程地址与分支跟踪关系，随后将自己的仓库 `qingcheng00624/infinite-qc` 配置为 `origin`。
- `LICENSE`：原许可证，内容不变。
- `docs/upstream/README.original.md`：清理前的上游 README，包含原作者署名及历史介绍，仅作来源档案，**不作为本地版部署指南**。
- `main.py`、`static/`、`workflows/`：服务、前端及本地工作流依赖。静态依赖库、图片和兼容资源未按“看起来像上游文件”批量删除。
- Docker 配置、依赖清单及锁文件、测试、`AGENTS.md`、本地版文档。
- `API/`、`data/`、`assets/`、`output/`：用户配置、备份、画布、素材、输出，均未清理。
- `.venv/`：被 Git 忽略的本机开发环境，未作自动删除，不进入 Docker 镜像。

## 删除范围

Windows 内置 Python 与离线 wheel 包；旧 Windows/macOS 安装启动脚本；即梦 CLI 的外部安装登录脚本；独立 Chrome 素材采集扩展和 Photoshop 连接扩展；旧教程和赞赏图片；可重建的 Python 编译缓存。

Chrome / Photoshop 扩展源码不再随本地项目分发；服务端相关兼容接口没有因此删除。若以后需要，旧文件仍可从原有 Git 历史中取回。不要对整个工作区执行 `git reset --hard` 来恢复个别文件。

## 已移除文件清单

- `MAC-使用说明.md`
- `get-pip.py`
- `mac-修复权限.command`
- `mac-启动服务.command`
- `mac-启动服务.sh`
- `mac-安装依赖.sh`
- `packages/annotated_doc-0.0.4-py3-none-any.whl`
- `packages/annotated_types-0.7.0-py3-none-any.whl`
- `packages/anyio-4.13.0-py3-none-any.whl`
- `packages/certifi-2026.4.22-py3-none-any.whl`
- `packages/charset_normalizer-3.4.7-cp314-cp314-win_amd64.whl`
- `packages/click-8.3.3-py3-none-any.whl`
- `packages/colorama-0.4.6-py2.py3-none-any.whl`
- `packages/fastapi-0.136.1-py3-none-any.whl`
- `packages/h11-0.16.0-py3-none-any.whl`
- `packages/httpcore-1.0.9-py3-none-any.whl`
- `packages/httpx-0.28.1-py3-none-any.whl`
- `packages/idna-3.13-py3-none-any.whl`
- `packages/pillow-12.2.0-cp314-cp314-win_amd64.whl`
- `packages/pydantic-2.13.4-py3-none-any.whl`
- `packages/pydantic_core-2.46.4-cp314-cp314-win_amd64.whl`
- `packages/python_multipart-0.0.27-py3-none-any.whl`
- `packages/requests-2.33.1-py3-none-any.whl`
- `packages/starlette-1.0.0-py3-none-any.whl`
- `packages/typing_extensions-4.15.0-py3-none-any.whl`
- `packages/typing_inspection-0.4.2-py3-none-any.whl`
- `packages/urllib3-2.7.0-py3-none-any.whl`
- `packages/uvicorn-0.46.0-py3-none-any.whl`
- `python/LICENSE.txt`
- `python/_asyncio.pyd`
- `python/_bz2.pyd`
- `python/_ctypes.pyd`
- `python/_decimal.pyd`
- `python/_elementtree.pyd`
- `python/_hashlib.pyd`
- `python/_lzma.pyd`
- `python/_msi.pyd`
- `python/_multiprocessing.pyd`
- `python/_overlapped.pyd`
- `python/_queue.pyd`
- `python/_socket.pyd`
- `python/_sqlite3.pyd`
- `python/_ssl.pyd`
- `python/_uuid.pyd`
- `python/_zoneinfo.pyd`
- `python/libcrypto-1_1.dll`
- `python/libffi-7.dll`
- `python/libssl-1_1.dll`
- `python/pyexpat.pyd`
- `python/python.cat`
- `python/python.exe`
- `python/python3.dll`
- `python/python310._pth`
- `python/python310.dll`
- `python/python310.zip`
- `python/pythonw.exe`
- `python/select.pyd`
- `python/sqlite3.dll`
- `python/unicodedata.pyd`
- `python/vcruntime140.dll`
- `python/vcruntime140_1.dll`
- `python/winsound.pyd`
- `run.bat`
- `tools/chrome-local-asset-importer/README.md`
- `tools/chrome-local-asset-importer/background.js`
- `tools/chrome-local-asset-importer/icons/icon128.png`
- `tools/chrome-local-asset-importer/icons/icon16.png`
- `tools/chrome-local-asset-importer/icons/icon32.png`
- `tools/chrome-local-asset-importer/icons/icon48.png`
- `tools/chrome-local-asset-importer/manifest.json`
- `tools/chrome-local-asset-importer/popup.css`
- `tools/chrome-local-asset-importer/popup.html`
- `tools/chrome-local-asset-importer/popup.js`
- `tools/chrome-local-asset-importer/sidepanel.html`
- `tools/jimeng_cli_install.ps1`
- `tools/jimeng_cli_login.ps1`
- `tools/photoshop-asset-connector/README.md`
- `tools/photoshop-asset-connector/index.html`
- `tools/photoshop-asset-connector/js/agent.js`
- `tools/photoshop-asset-connector/js/app.js`
- `tools/photoshop-asset-connector/js/generate.js`
- `tools/photoshop-asset-connector/js/net.js`
- `tools/photoshop-asset-connector/js/ps.js`
- `tools/photoshop-asset-connector/js/socket.js`
- `tools/photoshop-asset-connector/js/sources.js`
- `tools/photoshop-asset-connector/js/state.js`
- `tools/photoshop-asset-connector/js/ui.js`
- `tools/photoshop-asset-connector/manifest.json`
- `tools/photoshop-asset-connector/style.css`
- `安装依赖.bat`
- `安装即梦CLI.bat`
- `安装即梦CLI.command`
- `新手运行与使用教程.md`
- `登录即梦CLI.bat`
- `登录即梦CLI.command`
- `赞赏.png`
- `运行说明.txt`
