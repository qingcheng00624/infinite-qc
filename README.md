# Infinite Canvas · 本地独立版

本项目在本地通过 Docker 构建和运行，用于画布编辑、素材管理、对话及自行配置的 AI / ComfyUI 接口调用。

不再连接原项目检查更新或下载源码；不预装 API 渠道，不自动补回上游模型和工作流配置。远程 API 只有在自行配置后才用于相应功能，“本地版”不等于所有 AI 推理都能离线完成。

## 启动与修改

在当前源码目录执行：

```bash
docker compose up -d --build infinite-canvas
```

打开 `http://localhost:3000`。源码修改后执行同一命令重建，不使用上游镜像更新流程。

- 详细说明：[Docker 部署与维护](README-Docker.md)
- 清理范围：[仓库清理记录](docs/REPOSITORY-CLEANUP.md)

## 目录

| 路径 | 用途 |
| --- | --- |
| `main.py` | Python 后端 |
| `static/` | 前端页面、脚本、样式、本地静态依赖 |
| `workflows/` | 本地 ComfyUI 工作流 |
| `tests/` | 后端与浏览器回归测试 |
| `requirements.txt` / `requirements.lock` | 直接依赖清单 / Docker 使用的锁定依赖 |
| `Dockerfile` / `docker-compose.yml` | 本地镜像构建与容器运行 |
| `API/`、`data/`、`assets/`、`output/` | 持久配置和用户数据，不纳入 Git |
| `docs/upstream/` | 保留的上游来源档案 |

## 版本管理

`.git/` 已保留，可以提交本地源码更改。Git 提交不会自动推送，也不要求连接原上游。

当前本地仓库已移除原上游绑定，`origin` 指向自己的仓库 `qingcheng00624/infinite-qc`。SSH 私钥仅保存在服务器的 `.ssh` 目录，不进入项目或 Git。请勿将 API 密钥、运行数据和生成素材加入版本库，提交前检查 `git status` 与暂存区差异。

## 来源与许可

原项目：**hero8152 / Infinite-Canvas**，原作者署名：**wuli大雄**。

来源：`https://github.com/hero8152/Infinite-Canvas`

原许可证完整保留在 [LICENSE](LICENSE)，原始 README 归档在 [docs/upstream/README.original.md](docs/upstream/README.original.md)。本地修改不改变原授权条件，具体以原许可证为准。
