# 网站自定义指南

本文档梳理了将 new-api 项目部署为自己网站时，所有可自定义修改的部分。按改动难度从低到高排列。

> **协议提醒**：本项目采用 AGPLv3 协议，你可以自由修改品牌和功能，但需要：
> 1. 在网站上提供修改后源码的下载链接（或公开仓库）
> 2. 保留 LICENSE 文件
> 3. 在 README 或关于页面注明基于本项目修改

---

## 一、后台管理面板直接配置（零代码）

部署后在 `/system-settings/` 管理后台即可修改，无需改动任何代码。

### 1.1 品牌 & 内容

| 配置项 | 路径 | 效果 |
|--------|------|------|
| SystemName | 系统设置 → 通用 → 系统信息 | 全站名称（标题栏、邮件、2FA issuer） |
| Logo | 系统设置 → 通用 → 系统信息 | 全站 Logo URL |
| Footer | 系统设置 → 通用 → 系统信息 | 自定义页脚 HTML（备案号、联系方式等） |
| About | 系统设置 → 通用 → 系统信息 | 关于页面，支持 Markdown/HTML/外链 iframe |
| HomePageContent | 系统设置 → 通用 → 系统信息 | 完全替换默认首页（Markdown 或嵌入外部 URL） |
| Notice | 系统设置 → 维护 → 公告 | 全站公告，支持 Markdown |
| ServerAddress | 系统设置 → 通用 → 系统信息 | 服务器地址 |
| 用户协议 | 系统设置 → 通用 → 系统信息 | 支持 Markdown/HTML/外链跳转 |
| 隐私政策 | 系统设置 → 通用 → 系统信息 | 支持 Markdown/HTML/外链跳转 |

### 1.2 导航结构

| 配置项 | 路径 | 效果 |
|--------|------|------|
| HeaderNavModules | 系统设置 → 维护 → 顶部导航 | 控制顶部导航入口（home/console/pricing/docs/about） |
| SidebarModulesAdmin | 系统设置 → 维护 → 侧边栏模块 | 控制侧边栏模块（playground/chat/token/log/topup 等） |

### 1.3 Dashboard 面板

| 面板 | 说明 |
|------|------|
| Announcements | 公告面板，JSON 数组配置多条公告 |
| API Info | API 地址信息面板 |
| FAQ | 常见问题面板 |
| Uptime Kuma | 接入 Uptime Kuma 监控状态展示 |

每个面板都有独立的 `enabled` 开关和内容配置，在 系统设置 → 内容 中管理。

### 1.4 功能开关

| 功能 | 配置键 | 说明 |
|------|--------|------|
| Demo Site Mode | `DemoSiteEnabled` | 演示模式，展示更多信息 |
| Self-Use Mode | `SelfUseModeEnabled` | 单人自用模式，简化界面 |
| 签到系统 | `checkin_setting.enabled` | 每日签到送额度，可配最小/最大奖励 |
| Token 统计展示 | `DisplayTokenStatEnabled` | 是否展示 Token 用量统计 |
| 货币展示 | `DisplayInCurrencyEnabled` | 是否以货币形式展示额度 |
| 自定义货币 | `general_setting.quota_display_type` | USD/CNY/TOKENS/自定义符号+汇率 |
| Channel Affinity | `channel_affinity_setting.enabled` | 渠道亲和性路由 |
| 默认折叠侧边栏 | `DefaultCollapseSidebar` | 新用户默认折叠侧边栏 |
| 重试次数 | `RetryTimes` | 失败请求重试次数（0-10） |

### 1.5 认证方式

| 方式 | 说明 |
|------|------|
| 密码登录/注册 | 可分别开关 |
| GitHub OAuth | Client ID + Secret |
| Discord OAuth | Client ID + Secret |
| OIDC | 通用 OpenID Connect（支持任意 IdP） |
| LinuxDO OAuth | Client ID + Secret |
| 微信登录 | Server Address + Token |
| Telegram Bot | Bot Token + Name |
| Passkey/WebAuthn | 无密码登录 |
| Turnstile | Cloudflare 人机验证 |
| 自定义 OAuth | 后台动态添加任意 OAuth Provider |

### 1.6 支付集成

| 支付方式 | 配置项 |
|----------|--------|
| EPay（易支付） | 地址、商户ID、密钥、最低充值、支付方式 |
| Stripe | API Secret、Webhook Secret、Price ID、最低充值 |
| Creem | API Key、Webhook Secret、测试模式、产品列表 |
| Waffo | API Key、商户ID、回调URL |

可配置充值金额选项（`payment_setting.amount_options`）和折扣率。

---

## 二、简单代码修改（高性价比差异化）

### 2.1 主题色 & 视觉风格

**文件：** `web/default/src/styles/theme.css`

```css
:root {
  --primary: ...;      /* 主色调 */
  --accent: ...;       /* 强调色 */
  --background: ...;   /* 背景色 */
  --foreground: ...;   /* 前景色 */
  --card: ...;         /* 卡片背景 */
  --border: ...;       /* 边框色 */
  --radius: ...;       /* 圆角大小 */
}
.dark { /* 暗色模式覆盖 */ }
```

修改这些 CSS 变量即可全局换肤。

### 2.2 默认品牌值

| 文件 | 内容 |
|------|------|
| `web/default/index.html` | `<title>`、meta description、favicon 引用 |
| `web/default/src/lib/constants.ts` | `DEFAULT_SYSTEM_NAME`、`DEFAULT_LOGO` |
| `web/default/src/assets/logo.tsx` | 内联 SVG Logo 组件 |
| `web/default/public/logo.png` | Logo 图片文件 |
| `web/default/public/favicon.ico` | Favicon 文件 |
| `common/constants.go` | 后端默认 `SystemName`、`Footer`、`Logo` |

### 2.3 首页区块

**目录：** `web/default/src/features/home/`

| 区块 | 文件 | 内容 |
|------|------|------|
| Hero | `components/sections/hero.tsx` | 主标语 + 终端动画 + CTA 按钮 |
| Stats | `components/sections/stats.tsx` | 4 个数据统计卡片 |
| Features | `components/sections/features.tsx` | 8 个功能特性卡片 |
| How It Works | `components/sections/how-it-works.tsx` | 3 步使用流程 |
| CTA | `components/sections/cta.tsx` | 底部行动号召 |
| 终端演示 | `components/hero-terminal-demo.tsx` | 动画终端演示内容 |
| 常量定义 | `constants.ts` | 统计数字、功能描述、AI 模型列表 |

### 2.4 登录/注册页

| 文件 | 可改内容 |
|------|----------|
| `features/auth/auth-layout.tsx` | 布局结构（可加背景图、slogan） |
| `features/auth/components/oauth-providers.tsx` | OAuth 按钮顺序和样式 |
| `features/auth/components/terms-footer.tsx` | 底部法律声明 |
| `features/auth/components/legal-consent.tsx` | 注册时的协议勾选框 |

### 2.5 页脚

**文件：** `web/default/src/components/layout/components/footer.tsx`

- 设置了自定义 `Footer` HTML 时会替换默认页脚
- 默认页脚在 Demo 模式下显示品牌列（关于、文档、相关项目）

### 2.6 Docker / 部署配置

| 文件 | 可改内容 |
|------|----------|
| `docker-compose.yml` | 镜像名、容器名、节点名、数据库名 |
| `.env.example` | 环境变量模板（端口、数据库、Redis、Session Secret） |

---

## 三、中等改动（功能差异化）

### 3.1 新增自定义页面

路由系统在 `web/default/src/router/` 下，可添加新路由：
- 使用教程页
- 自定义 API 文档
- 社区/论坛入口
- 状态监控大屏

### 3.2 通知渠道扩展

已支持：Email / Telegram / Bark / Webhook / Gotify

可扩展：
- 企业微信
- 钉钉
- Discord Webhook
- 飞书

**相关文件：** `service/user_notify.go`

### 3.3 Workspace 扩展

**文件：** `web/default/src/components/layout/lib/workspace-registry.ts`

注册表模式，可注册新的工作区（带独立侧边栏导航），例如：
- 知识库管理
- 应用市场
- 使用统计大屏

### 3.4 Playground 定制

**目录：** `web/default/src/features/playground/`

可定制：
- 默认模型和参数
- 预设 System Prompt
- UI 布局和交互
- 对话历史管理

### 3.5 定价页

**目录：** `web/default/src/features/pricing/`

支持：
- 表格/卡片视图切换
- 按厂商/分组/标签筛选
- Token 单位切换
- 充值价格展示

---

## 四、深度定制（打造独特产品）

| 方向 | 说明 | 相关代码 |
|------|------|----------|
| 智能模型路由 | 按成本/延迟/可用性自动选择渠道 | `relay/` |
| 用量分析大屏 | 扩展可视化图表 | `features/dashboard/` |
| 多租户/团队 | 基于 Group 机制扩展 | `model/group.go` |
| API 文档自动生成 | 根据已配置模型生成 OpenAPI 文档 | 新增功能 |
| 阶梯计费 | 利用表达式引擎做动态定价 | `pkg/billingexpr/` |
| 订阅套餐 | 按月/按量/按功能分级 | `features/wallet/` |
| 邀请推广体系 | 扩展现有 Inviter/Invitee 额度机制 | `model/user.go` |
| 白标 SaaS | 结合以上做成可售卖的多租户平台 | 全局 |

---

## 五、快速行动清单

如果想最快让网站看起来"不一样"，按以下顺序操作：

1. **换主题色** — 改 `web/default/src/styles/theme.css`，5 分钟见效
2. **换 Logo & Favicon** — 替换 `web/default/public/` 下的图片文件
3. **设置首页** — 后台用 `HomePageContent` 嵌入自己设计的页面
4. **配置导航** — 后台隐藏不需要的模块，只保留核心功能
5. **开启签到** — 后台开启签到系统，增加用户粘性
6. **配置 Dashboard** — 加公告、FAQ、监控面板
7. **自定义货币** — 面向国内用户改成人民币显示
8. **配置支付** — 接入 EPay 或 Stripe

---

## 六、文件速查表

| 类别 | 关键文件 |
|------|----------|
| 前端入口 | `web/default/index.html` |
| 前端常量 | `web/default/src/lib/constants.ts` |
| 主题样式 | `web/default/src/styles/theme.css` |
| Logo SVG | `web/default/src/assets/logo.tsx` |
| 首页 | `web/default/src/features/home/` |
| 登录页 | `web/default/src/features/auth/` |
| Dashboard | `web/default/src/features/dashboard/` |
| 定价页 | `web/default/src/features/pricing/` |
| Playground | `web/default/src/features/playground/` |
| 页脚 | `web/default/src/components/layout/components/footer.tsx` |
| 导航配置 | `web/default/src/hooks/use-top-nav-links.ts` |
| 侧边栏配置 | `web/default/src/hooks/use-sidebar-data.ts` |
| 系统设置 UI | `web/default/src/features/system-settings/` |
| 后端常量 | `common/constants.go` |
| 后端选项 | `model/option.go` |
| 后端设置 | `setting/` |
| i18n 翻译 | `web/default/src/i18n/locales/` |
| Docker | `docker-compose.yml` |
| 环境变量 | `.env.example` |

---

## 七、国际化（i18n）定制

### 前端

- **配置文件：** `web/default/src/i18n/config.ts`
- **翻译文件：** `web/default/src/i18n/locales/{lang}.json`（flat JSON，key 为英文原文）
- **已支持语言：** en（基础）、zh（回退）、fr、ru、ja、vi
- **语言检测优先级：** localStorage → 浏览器语言 → 默认 en

#### 添加新语言

1. 在 `web/default/src/i18n/locales/` 下创建新的 JSON 文件（如 `ko.json`）
2. 在 `config.ts` 中 import 并添加到 `resources` 和 `supportedLngs`
3. 运行 `bun run i18n:sync` 同步缺失的 key

#### 修改默认语言

修改 `config.ts` 中的 `fallbackLng` 值。

### 后端

- **配置文件：** `i18n/i18n.go`
- **翻译文件：** `i18n/locales/` 下的 YAML 文件
- **已支持语言：** en、zh-CN、zh-TW
- **检测优先级：** 用户设置 → Accept-Language 头 → 默认 en

#### 翻译完成度检查

`_reports/` 目录下有 `*.untranslated.json` 文件，显示各语言缺失的翻译条目。

---

## 八、错误页面 & 加载状态

### 错误页面

**路由目录：** `web/default/src/routes/(errors)/`

| 状态码 | 组件文件 | 说明 |
|--------|----------|------|
| 401 | `features/errors/unauthorized-error.tsx` | 未授权 |
| 403 | `features/errors/forbidden.tsx` | 禁止访问 |
| 404 | `features/errors/not-found-error.tsx` | 页面不存在 |
| 500 | `features/errors/general-error.tsx` | 服务器错误 |
| 503 | `features/errors/maintenance-error.tsx` | 维护中 |

所有错误页面支持 i18n，可自定义图标、标题、描述文案和重试按钮。

### 通用状态组件

| 组件 | 文件 | 说明 |
|------|------|------|
| ErrorState | `components/error-state.tsx` | 可配置图标、标题、描述、重试动作 |
| LoadingState | `components/loading-state.tsx` | 支持 sm/md/lg 尺寸和 inline 模式 |

---

## 九、移动端适配

- **断点 Hook：** `web/default/src/hooks/use-mobile.tsx` — 768px 为分界
- **移动端导航：** `components/layout/components/mobile-drawer.tsx` — 抽屉式导航
- **移动端表格：** `components/data-table/mobile-card-list.tsx` — 表格自动切换为卡片布局

20+ 个页面（模型、渠道、密钥、日志、订阅等）已适配移动端。可调整断点或自定义移动端布局。

---

## 十、模型图标 & 品牌图标

### Lobe Icons

**文件：** `web/default/src/lib/lobe-icon.tsx`

使用 `@lobehub/icons` 包动态加载模型提供商图标（OpenAI、Claude、Gemini 等），在 15+ 个组件中使用。

### 品牌图标

**目录：** `web/default/src/assets/brand-icons/`

包含 18 个 SVG 图标组件：Discord、GitHub、Telegram、WeChat、Stripe 等。

### 添加自定义模型图标

如果接入了自定义模型，需要在 `features/usage-logs/components/model-badge.tsx` 中注册模型名到图标的映射。

---

## 十一、Toast & 通知样式

### Toast 提示

- **组件：** `web/default/src/components/ui/sonner.tsx`（基于 sonner 库）
- 自动跟随亮/暗主题
- 可通过 CSS 变量自定义：`--normal-bg`、`--normal-text`、`--normal-border`

### 站内通知

| 文件 | 说明 |
|------|------|
| `components/notification-button.tsx` | 通知铃铛按钮 |
| `components/notification-dialog.tsx` | 通知弹窗 |
| `stores/notification-store.ts` | 通知状态管理 |
| `features/profile/components/tabs/notification-tab.tsx` | 用户通知偏好设置 |

---

## 十二、速率限制

### 后端配置

**文件：** `middleware/rate-limit.go`、`middleware/model-rate-limit.go`

| 限制类型 | 配置键 | 说明 |
|----------|--------|------|
| 全局 API | `GlobalApiRateLimitNum/Duration/Enable` | API 接口全局限流 |
| 全局 Web | `GlobalWebRateLimitNum/Duration/Enable` | Web 页面全局限流 |
| 关键接口 | `CriticalRateLimitNum/Duration` | 登录/注册等关键接口 |
| 模型级别 | 管理后台配置 | 按模型/分组限流 |

### 管理 UI

**目录：** `web/default/src/features/system-settings/request-limits/`

可视化编辑器，支持配置限流规则、敏感词过滤、SSRF 防护。

触发限流时返回 HTTP 429，可在中间件中自定义返回消息。

---

## 十三、Midjourney / 绘图功能

### 后端设置

**文件：** `setting/midjourney.go`

| 配置项 | 说明 |
|--------|------|
| `MjNotifyEnabled` | 绘图完成通知 |
| `MjAccountFilterEnabled` | 账号过滤 |
| `MjModeClearEnabled` | 模式清除 |
| `MjForwardUrlEnabled` | 转发 URL |
| `MjActionCheckSuccessEnabled` | 动作成功检查 |

### 管理 UI

**文件：** `web/default/src/features/system-settings/content/drawing-settings-section.tsx`

### 任务日志

使用日志页面支持图片预览、音频预览、失败原因查看。

---

## 十四、Webhook 集成

**文件：** `service/webhook.go`

- 支持签名验证（HMAC-SHA256），签名在 `X-Webhook-Signature` 头中
- Payload 包含：type、title、content、values、timestamp
- 支持 Worker 代理模式
- 用户可在个人设置中配置 Webhook URL

---

## 十五、用户个人中心

**目录：** `web/default/src/features/profile/`

| 卡片/功能 | 说明 |
|-----------|------|
| profile-header | 用户头像、名称 |
| profile-settings-card | 基本设置 |
| profile-security-card | 安全设置 |
| language-preferences-card | 语言偏好 |
| checkin-calendar-card | 签到日历 |
| passkey-card | Passkey 管理 |
| two-fa-card | 2FA 设置 |
| sidebar-modules-card | 侧边栏模块偏好 |
| notification-tab | 通知渠道设置 |
| account-bindings-tab | 第三方账号绑定 |

可根据启用的功能隐藏/显示对应卡片。

---

## 十六、钱包 & 订阅系统

### 钱包页面

**目录：** `web/default/src/features/wallet/`

组件：余额统计卡片、充值表单、订阅计划、推广奖励、账单历史、转账对话框。

### 订阅管理

**目录：** `web/default/src/features/subscriptions/`

支持：订阅计划 CRUD、购买对话框、状态切换。

### 推广系统

- `features/wallet/components/affiliate-rewards-card.tsx` — 推广奖励卡片
- `hooks/use-affiliate.ts` — 推广逻辑
- 配置键：`QuotaForInviter`、`QuotaForInvitee`

---

## 十七、安全 & 生产部署建议

### CORS 现状

**文件：** `middleware/cors.go`

当前配置为 `AllowAllOrigins = true`（允许所有来源），适合开发但不适合生产。

### 安全头缺失

项目未设置以下安全头，建议通过反向代理（Nginx/Caddy）添加：

```nginx
# Nginx 示例
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'" always;
```

### 反向代理示例

项目未提供 Nginx/Caddy 配置模板，建议自行配置：
- HTTPS 终止
- WebSocket 代理（Playground 流式响应）
- 静态资源缓存
- 安全头注入
- 限制上传大小

---

## 十八、SEO & PWA

### 当前状态

- `web/default/index.html` 仅有基础 meta 标签
- **缺失：** Open Graph 标签、Twitter Card、`robots.txt`、`sitemap.xml`、PWA `manifest.json`

### 建议补充

在 `web/default/index.html` 中添加：

```html
<meta property="og:title" content="你的网站名" />
<meta property="og:description" content="你的网站描述" />
<meta property="og:image" content="https://你的域名/og-image.png" />
<meta property="og:url" content="https://你的域名" />
<meta name="twitter:card" content="summary_large_image" />
```

在 `web/default/public/` 下添加 `robots.txt` 和 `sitemap.xml`。

---

## 十九、数据分析 & 监控

### 分析埋点

项目未内置任何分析代码。如需接入，可在 `web/default/index.html` 的 `<head>` 中注入：
- Google Analytics
- Umami（自托管）
- Plausible
- PostHog

### 运行监控

- 后端支持 Pyroscope 性能分析（`.env.example` 中的 `PYROSCOPE_APP_NAME`）
- Dashboard 可接入 Uptime Kuma 展示服务状态

---

## 二十、备份 & 迁移

项目未内置备份/导出功能，建议：

- **SQLite：** 定期复制 `*.db` 文件
- **MySQL/PostgreSQL：** 使用 `mysqldump` / `pg_dump` 定期备份
- **Redis：** 配置 RDB/AOF 持久化
- **配置迁移：** 所有系统设置存储在 `options` 表中，导出该表即可迁移配置
