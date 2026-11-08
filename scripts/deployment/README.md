# 静态站部署

生成日期：2026-11-08

概要：独立发布 HubCSCA 静态首页与资源库，固定从 GitHub `main` 拉取，成功构建后原子切换版本。此流程不操作现有小程序、后端、Nginx 或宝塔服务。

## 目录与账号

使用现有 SSH 账号 `dc_provide@124.222.29.242:10022`。

| 用途                                     | Linux 绝对路径                                    |
| ---------------------------------------- | ------------------------------------------------- |
| Git 工作区                               | `/wwwdata/wwwdata/CSCA-website`                   |
| 静态发布版本                             | `/wwwdata/wwwdata/CSCA-website-releases/<commit>` |
| Nginx 站点根目录，指向当前版本的符号链接 | `/wwwdata/wwwdata/CSCA-website-public`            |
| 锁、发布记录与日志                       | `/wwwdata/wwwdata/CSCA-website-state`             |
| ACME 验证文件目录                        | `/wwwdata/wwwdata/CSCA-website-acme`              |

GitHub 地址固定为 `ssh://git@ssh.github.com:443/joeseaer/CSCA-website.git`，远端名称为 `upstream`。服务器直连 GitHub HTTPS 不稳定，SSH 443 已验证可用。仓库本地 `core.sshCommand` 引用该用户已有的 GitHub 密钥及已固定指纹的 known_hosts；密钥不复制、不写入源码。必须启用 `StrictHostKeyChecking=yes`、`IdentitiesOnly=yes` 和 `BatchMode=yes`，不要改成跳过主机验证。

运行环境使用服务器已有 `/www/server/nodejs/v26.4.0/bin`，无需安装 Node 或服务。npm 缓存独立放在 `CSCA-website-state/npm-cache`，不修改服务器全局 npm 缓存权限。

## 宝塔直接建站

已准备好的静态发布目录可直接绑定，无需在宝塔启动 Node 项目或执行构建命令：

1. 新建纯静态网站，域名填写 `www.hubcsca.dcpstudios.top`。
2. 网站根目录填写 `/wwwdata/wwwdata/CSCA-website-public`。
3. 按下一节补齐本服务器的公网入口监听，再由管理员检查并重载 Nginx。
4. 申请并启用该完整域名的 HTTPS 证书，并补齐 HTTPS 入口监听。

`www` 站点与已有的 `hubcsca.dcpstudios.top` 小程序入口分别配置。下面的初始化步骤用于重建环境；已有发布产物时不必重复执行。

## 本服务器的公网入口

2026-11-08 实测：公网 HTTP 进入 `127.0.0.1:18080`，HTTPS 进入 `127.0.0.1:18443`，两者均携带 PROXY protocol。仅添加普通 `80` / `443` 监听会导致本机访问正常，公网请求却落到默认站点。

在域名 `www.hubcsca.dcpstudios.top` 的 HTTP `server` 中保留原监听，并增加：

```nginx
listen 127.0.0.1:18080 proxy_protocol;
```

若已采用「HTML 项目 `127.0.0.1:5540` + 域名反向代理」结构，保留这一结构，将监听加在域名反代的 `server` 中；`5540` 的 HTML 项目无需修改。仓库中的 `.conf` 是直接提供静态文件的另一种配置，不要与已存在的同域名反代配置重复安装。

在宝塔为完整域名配置好 HTTPS 证书后，在对应 HTTPS `server` 中保留 `listen 443 ssl;`，并增加：

```nginx
listen 127.0.0.1:18443 ssl proxy_protocol;
```

管理员保存后先运行 `/www/server/nginx/sbin/nginx -t`，通过后在宝塔重载 Nginx。验收时同时访问公网首页与 `/resources/`，并检查响应正文是网站内容；此前默认站点的首页曾以 HTTP 200 返回写着 404 的页面，仅看状态码不能确认成功。

## 首次准备

先确认这些独立目录没有其他内容。仓库由具备上述 SSH 凭据的用户克隆，再设置相同的 `core.sshCommand`。例如在已配置好用户 GitHub SSH 连接时执行：

```bash
git clone --origin upstream --branch main \
  ssh://git@ssh.github.com:443/joeseaer/CSCA-website.git \
  /wwwdata/wwwdata/CSCA-website
mkdir -p /wwwdata/wwwdata/CSCA-website-state \
  /wwwdata/wwwdata/CSCA-website-acme/.well-known/acme-challenge
bash /wwwdata/wwwdata/CSCA-website/scripts/deployment/pull-build-release.sh
```

脚本拒绝意外远端、非 `main` 分支、工作区修改和历史分歧。每次在独立临时目录执行锁文件安装与静态编译，只有 `dist/index.html` 存在且非空时才发布。构建失败保留正在服务的版本；同时执行时由 `flock` 保证只有一次构建。保留当前版本与两个旧版本。

`release.json` 与 `CSCA-website-state/deployed.json` 记录 Git 提交和首页 SHA-256，可用于验证服务器是否追上 GitHub。

## 域名与 HTTPS

在宝塔新增纯静态站点时，域名填写 `www.hubcsca.dcpstudios.top`，根目录填写 `/wwwdata/wwwdata/CSCA-website-public`，默认文档为 `index.html`。该目录已经包含编译后的文件，不需要配置 Node 项目或反向代理。HTTPS 在站点的 SSL 设置中为这个完整域名单独申请并启用。

`www.hubcsca.dcpstudios.top` 的 A 记录已指向 `124.222.29.242`。`www.hubcsca.dcpstudios.top.conf` 是可直接审查的独立 HTTP vhost，应由管理员安装到 `/www/server/panel/vhost/nginx/www.hubcsca.dcpstudios.top.conf`。保留现有 `hubcsca.dcpstudios.top` 配置。

管理员应先运行 `/www/server/nginx/sbin/nginx -t`，在有本次服务操作授权时应用配置，然后通过上述 ACME 目录为 **`www.hubcsca.dcpstudios.top`** 申请证书。现有其他域名证书不覆盖该域名。

证书成功签发后，管理员将此 vhost 的静态 `location` 复制到同时监听 `443 ssl` 和 `127.0.0.1:18443 ssl proxy_protocol` 的 HTTPS server，设置真实的 `ssl_certificate` 与 `ssl_certificate_key` 路径；HTTP server 保留 ACME location，并将其他请求重定向至 `https://$host$request_uri`。在证书存在之前不要启用带不存在证书路径的 HTTPS 配置。

本脚本不执行 Nginx 配置安装、证书签发或任何服务重载。静态版本切换本身不需要重载 Nginx。

## 每两分钟更新

首次发布验收后，在 `dc_provide` 的用户级 `crontab -e` 中追加以下一行，保留已有任务：

```cron
*/2 * * * * /bin/bash /wwwdata/wwwdata/CSCA-website/scripts/deployment/pull-build-release.sh >> /wwwdata/wwwdata/CSCA-website-state/deploy.log 2>&1
```

不需要重启 cron；不要将此任务加入现有 Qiming 后端自动部署脚本。首次 GitHub 拉取检查无变化时不重建。网络或构建失败会写入日志，下一次自动重试。

## 验证与回滚

```bash
cat /wwwdata/wwwdata/CSCA-website-state/deployed.json
readlink /wwwdata/wwwdata/CSCA-website-public
sha256sum /wwwdata/wwwdata/CSCA-website-public/index.html
curl -fsS https://www.hubcsca.dcpstudios.top/release.json
curl -fsSI https://www.hubcsca.dcpstudios.top/
curl -fsSI https://www.hubcsca.dcpstudios.top/resources/
```

临时回滚前先移除本任务的 cron 行，避免轮询再次发布 GitHub 最新版。确认旧版本 `index.html` 存在后，用同目录临时符号链接和 `mv -Tf` 将 `CSCA-website-public` 指向所选保留版本。永久回滚通过 GitHub 上的正常 revert 提交完成，保留完整历史，不强制推送。
