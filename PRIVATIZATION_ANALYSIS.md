# 项目私有化现状分析报告

## 📋 项目概述

本项目是基于 One API 的 LLM 网关和 AI 资产管理系统（New API / 璀璨 API），由 QuantumNous 团队开发。当前需要将其私有化，移除所有广告、外部公司信息和品牌标识。

---

## 🔍 发现的广告和公司信息

### 1. README 文件中的信息

#### 1.1 合作伙伴信息（需要移除）
- **位置**: `README.md`, `README.zh.md`, `README.fr.md`, `README.ja.md`
- **内容**:
  - Cherry Studio (cherry-studio.png)
  - 北京大学 (pku.png)
  - UCloud 优刻得 (ucloud.png)
  - 阿里云 (aliyun.png)
  - IO.NET (io-net.png)
- **图片位置**: `docs/images/` 目录下的所有 PNG 文件

#### 1.2 特别鸣谢（需要移除）
- **位置**: README 文件
- **内容**: JetBrains 的感谢信息和 Logo

#### 1.3 外部链接和徽章（需要移除）
- GitHub 徽章（license, release, docker, GoReportCard）
- Trendshift.io 徽章
- HelloGitHub 徽章
- Product Hunt 徽章
- Star History 图表

#### 1.4 文档链接（需要移除或替换）
- `docs.newapi.pro` 的所有链接
- GitHub 仓库链接（`github.com/QuantumNous/new-api`, `github.com/Calcium-Ion/new-api`）

---

### 2. 前端代码中的信息

#### 2.1 Footer 组件 (`web/src/components/layout/Footer.jsx`)
- **行 66-89**: 链接到 `docs.newapi.pro` 的文档链接
  - 关于项目
  - 联系我们
  - 功能特性
- **行 98-120**: 文档链接（快速开始、安装指南、API 文档）
- **行 146**: `github.com/Calcium-Ion/neko-api-key-tool` 链接
- **行 162**: `github.com/Calcium-Ion/new-api-horizon` 链接
- **行 203, 232**: `github.com/QuantumNous/new-api` 链接和 "璀璨 API" 品牌
- **行 208**: "Powered by 璀璨 API" 文本

#### 2.2 About 页面 (`web/src/pages/About/index.jsx`)
- **行 68**: `github.com/QuantumNous/new-api` 链接
- **行 77-82**: QuantumNous 品牌和链接
- **行 65-102**: 默认关于内容包含多个外部链接和品牌信息

#### 2.3 Home 页面 (`web/src/pages/Home/index.jsx`)
- **行 234**: `github.com/QuantumNous/new-api` 链接（仅在演示模式下显示）

#### 2.4 控制台欢迎信息 (`web/src/index.jsx`)
- **行 40**: 控制台输出 "璀璨 API Powered by New API | https://github.com/QuantumNous/new-api"
- **行 36-37**: 注释说明"二次开发者未经允许不准将此移除"

#### 2.5 版权信息（所有前端文件）
- **所有 JSX/JS 文件头部**: 
  - Copyright (C) 2025 QuantumNous
  - For commercial licensing, please contact support@quantumnous.com

---

### 3. 后端代码中的信息

#### 3.1 主程序 (`main.go`)
- **行 142**: 错误信息中的 GitHub Issue 链接 `https://github.com/Calcium-Ion/new-api`
- **行 196, 218**: 分析代码注释中的 "QuantumNous" 标识

#### 3.2 初始化文件 (`common/init.go`)
- **行 26-27**: 启动时打印的项目信息
  - Original Project: OneAPI by JustSong
  - Maintainer: QuantumNous

#### 3.3 Go 模块路径
- **所有 Go 文件**: 导入路径 `github.com/QuantumNous/new-api/...`
- **注意**: 这需要谨慎处理，可能需要保留以维持代码结构，但可以移除对外部仓库的引用

---

### 4. 图片资源

#### 4.1 Logo 和品牌图片
- `web/public/logo.png` - 可能需要替换
- `docs/images/` 目录下的所有合作伙伴 Logo
  - `aliyun.png`
  - `cherry-studio.png`
  - `io-net.png`
  - `pku.png`
  - `ucloud.png`

### 5. 国际化文件中的信息

#### 5.1 示例链接和域名
- **位置**: `web/src/i18n/locales/*.json` (6个语言文件)
- **内容**:
  - `docs.newapi.pro` - 文档链接示例（多个语言文件）
  - `newapi.pro`, `newapi.com` - 示例域名（多个语言文件）
  - `new-api` - 产品名称在提示文本中（多个语言文件）
  - `new-api-worker` - 相关工具名称

#### 5.2 版权信息
- **位置**: `web/src/i18n/i18n.js`
- **内容**: QuantumNous 版权和商业许可联系信息

### 6. 后端启动信息

#### 6.1 初始化输出 (`common/init.go`)
- **行 25-27**: 启动时打印的项目信息
  - "NewAPI(Based OneAPI)" 版本信息
  - "Original Project: OneAPI by JustSong"
  - "Maintainer: QuantumNous - https://github.com/QuantumNous/new-api"

---

## 📊 需要修改的文件清单

### 高优先级（用户可见）

1. **README 文件** (4个文件)
   - `README.md`
   - `README.zh.md`
   - `README.fr.md`
   - `README.ja.md`

2. **前端组件** (3个核心文件)
   - `web/src/components/layout/Footer.jsx`
   - `web/src/pages/About/index.jsx`
   - `web/src/index.jsx`
   - `web/src/pages/Home/index.jsx`

3. **图片资源**
   - `docs/images/*.png` (5个文件)

### 中优先级（代码注释和版权）

4. **所有前端文件的版权头** (~300+ 个 JSX/JS 文件)
   - 需要批量替换版权信息

5. **国际化文件** (6个语言文件)
   - `web/src/i18n/locales/*.json`
   - `web/src/i18n/i18n.js`
   - 需要替换示例链接中的 `docs.newapi.pro` 和 `newapi.pro`

6. **后端代码**
   - `main.go`
   - `common/init.go`

### 低优先级（内部引用）

6. **Go 模块路径**
   - 需要评估是否修改，可能影响构建

---

## 🎯 私有化方案建议

### 阶段一：移除外部可见信息

1. **移除 README 中的广告和合作伙伴信息**
   - 删除合作伙伴 Logo 部分
   - 删除 JetBrains 鸣谢部分
   - 移除所有外部徽章和链接
   - 简化文档链接部分

2. **清理前端 Footer**
   - 移除所有 `docs.newapi.pro` 链接
   - 移除 GitHub 仓库链接
   - 简化或移除 "Powered by" 信息
   - 保留基本的版权信息（可自定义）

3. **清理 About 页面**
   - 移除默认内容中的外部链接
   - 简化或移除品牌信息

4. **清理控制台输出**
   - 移除或修改欢迎信息

### 阶段二：轻量化页面

1. **简化 Footer**
   - 减少链接数量
   - 移除不必要的分类

2. **优化首页**
   - 移除演示模式下的 GitHub 链接按钮

3. **移除图片资源**
   - 删除合作伙伴 Logo 图片

### 阶段三：代码清理

1. **批量替换版权信息**
   - 使用脚本批量替换所有文件头部的版权信息
   - 移除商业许可联系邮箱

2. **清理国际化文件**
   - 替换所有语言文件中的示例链接
   - 将 `docs.newapi.pro` 替换为通用示例或移除
   - 将 `newapi.pro` 示例域名替换为通用示例

3. **清理后端代码**
   - 移除或修改启动信息中的 QuantumNous 引用
   - 清理错误信息中的外部链接
   - 修改 `common/init.go` 中的帮助信息

---

## ⚠️ 注意事项

1. **许可证合规**
   - 项目基于 AGPL v3.0 许可证
   - 需要保留对 One API 原项目的引用（MIT 许可证要求）
   - 可以移除 QuantumNous 的品牌信息，但需要遵守 AGPL 要求

2. **功能影响**
   - 移除文档链接不会影响核心功能
   - 移除 GitHub 链接不会影响功能
   - 需要确保自定义 Footer 和 About 内容功能正常

3. **构建和部署**
   - Go 模块路径修改可能需要更新 `go.mod`
   - 前端构建不受影响
   - 需要重新构建 Docker 镜像

4. **数据库和配置**
   - Footer HTML 和 About 内容可能存储在数据库中
   - 需要检查数据库中的相关配置

---

## 📝 实施步骤建议

1. **第一步**: 备份当前代码
2. **第二步**: 修改 README 文件，移除所有广告和外部链接
3. **第三步**: 修改前端 Footer 和 About 页面
4. **第四步**: 移除图片资源
5. **第五步**: 批量替换版权信息
6. **第六步**: 清理后端代码中的品牌信息
7. **第七步**: 测试所有功能
8. **第八步**: 重新构建和部署

---

## 🔧 技术实现建议

### 批量替换版权信息

可以使用以下命令批量替换：

```bash
# 替换版权信息
find web/src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' 's/Copyright (C) 2025 QuantumNous/Copyright (C) 2025 Your Company/g' {} \;

# 移除商业许可联系信息
find web/src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' '/For commercial licensing, please contact support@quantumnous.com/d' {} \;

# 替换国际化文件中的示例链接
find web/src/i18n/locales -name "*.json" -exec sed -i '' 's/docs\.newapi\.pro/your-docs.example.com/g' {} \;
find web/src/i18n/locales -name "*.json" -exec sed -i '' 's/newapi\.pro/example.com/g' {} \;
find web/src/i18n/locales -name "*.json" -exec sed -i '' 's/newapi\.com/example.com/g' {} \;
```

### 查找所有需要修改的文件

```bash
# 查找包含 QuantumNous 的文件
grep -r "QuantumNous" --include="*.jsx" --include="*.js" --include="*.md" --include="*.go" .

# 查找包含 docs.newapi.pro 的文件
grep -r "docs.newapi.pro" --include="*.jsx" --include="*.js" --include="*.md" .
```

---

## ✅ 完成标准

私有化完成后，应该：
- ✅ 无任何外部公司 Logo 和品牌信息
- ✅ 无任何外部文档链接（docs.newapi.pro）
- ✅ 无任何 GitHub 仓库链接（QuantumNous/Calcium-Ion）
- ✅ 无任何广告和合作伙伴信息
- ✅ 控制台无品牌输出信息
- ✅ 页面轻量化，无多余的外部链接
- ✅ 保留必要的功能链接（如 One API 原项目，符合许可证要求）

---

**报告生成时间**: 2025-02-15
**分析范围**: 全项目代码和资源文件

