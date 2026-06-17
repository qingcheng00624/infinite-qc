# 项目协作提示

- 始终用中文与用户交流。
- 这个项目由用户通过 Docker 运行，服务定义在 `docker-compose.yml`。
- 修改源码后，需要重建镜像并重启容器，优先执行：`docker compose up -d --build infinite-canvas`。
- 不要为了验证临时启动新的本地端口；需要验证时使用现有 Docker 容器暴露的 `3000` 端口。
