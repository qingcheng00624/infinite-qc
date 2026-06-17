# Infinite Canvas Docker 部署说明

上游源码与原作者：hero8152 / Infinite-Canvas
GitHub：https://github.com/hero8152/Infinite-Canvas/tree/main

说明：本 Docker 镜像是基于上述开源项目打包发布的运行镜像，不代表原作者发布或维护了该 Docker 镜像。

## 环境要求

- Docker Engine 20.10+
- Docker Compose v2
- 可以访问 Docker Hub 拉取镜像

检查 Docker 是否可用：

```bash
docker --version
docker compose version
```

## 准备目录

新建一个运行目录，用来保存配置、画布、素材和生成结果：

```bash
mkdir infinite-canvas
cd infinite-canvas
mkdir -p data assets output API
```

在这个目录里创建 `docker-compose.yml`：

```yaml
services:
  infinite-canvas:
    image: qc0624/infinite-canvas:latest
    container_name: infinite-canvas
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
      - ./assets:/app/assets
      - ./output:/app/output
      - ./API:/app/API
    restart: unless-stopped
```

## 启动项目

在 `docker-compose.yml` 所在目录执行：

```bash
docker compose up -d
```

首次启动会自动从 Docker Hub 拉取镜像。后续启动会快很多。

## 打开页面

```text
http://localhost:3000
```

如果是在远程服务器上部署，把 `localhost` 换成服务器 IP 或域名。

## 数据保存位置

上面的 `docker-compose.yml` 会挂载这些目录：

- `data/`：画布、资产库、提示词库、API 配置等持久数据
- `assets/`：上传素材
- `output/`：生成结果
- `API/`：运行时 API 配置目录

这些目录都保存在项目目录下。升级或重建容器时，只要不删除这些目录，数据就会保留。

## 常用命令

查看运行状态：

```bash
docker compose ps
```

查看日志：

```bash
docker compose logs -f infinite-canvas
```

重启：

```bash
docker compose restart infinite-canvas
```

停止：

```bash
docker compose down
```

## 更新到最新镜像

如果要更新到 Docker Hub 上的最新镜像：

```bash
docker compose pull
docker compose up -d
```

然后刷新浏览器页面。

## 修改端口

默认端口是 `3000`。如果本机 3000 端口已被占用，可以修改 `docker-compose.yml`：

```yaml
ports:
  - "8080:3000"
```

修改后访问：

```text
http://localhost:8080
```

## 常见问题

如果页面打不开，先确认容器是否正在运行：

```bash
docker compose ps
```

如果容器没有正常启动，查看日志：

```bash
docker compose logs -f infinite-canvas
```

如果更新后页面还是旧的，重新拉取并启动：

```bash
docker compose pull
docker compose up -d
```

如果浏览器仍然显示旧页面，强制刷新浏览器缓存。

## 卸载容器

```bash
docker compose down
```

这只会停止并删除容器，不会删除项目目录里的 `data/`、`assets/`、`output/` 和 `API/`。
