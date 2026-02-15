# 支付方式配置指南

## 概述

本系统支持多种支付方式，包括：
- **支付宝** (Alipay)
- **微信支付** (WeChat Pay / WxPay)
- **Stripe** (国际信用卡支付)
- **Creem** (第三方支付网关)
- **其他易支付支持的支付方式**

## 支付宝和微信支付配置

### 前置条件

1. 确保已配置易支付（EPay）网关：
   - 支付地址（PayAddress）
   - 易支付商户ID（EpayId）
   - 易支付商户密钥（EpayKey）

2. 确保您的易支付服务商已开通支付宝和微信支付通道

### 配置步骤

#### 方法一：通过管理后台配置（推荐）

1. 登录管理后台
2. 进入 **设置** → **支付设置** → **支付网关设置**
3. 找到 **"充值方式设置"** (PayMethods) 字段
4. 输入以下 JSON 配置：

```json
[
  {
    "name": "支付宝",
    "type": "alipay",
    "color": "rgba(var(--semi-blue-5), 1)"
  },
  {
    "name": "微信",
    "type": "wxpay",
    "color": "rgba(var(--semi-green-5), 1)"
  }
]
```

5. 点击 **"更新支付设置"** 保存配置

#### 方法二：通过数据库配置

如果通过管理后台无法配置，可以直接在数据库中更新 `options` 表：

```sql
UPDATE options 
SET value = '[{"name":"支付宝","type":"alipay","color":"rgba(var(--semi-blue-5), 1)"},{"name":"微信","type":"wxpay","color":"rgba(var(--semi-green-5), 1)"}]' 
WHERE `key` = 'PayMethods';
```

### 配置参数说明

每个支付方式包含以下字段：

- **name**: 支付方式显示名称（如："支付宝"、"微信"）
- **type**: 支付方式类型（必须与易支付支持的支付类型一致）
  - `alipay`: 支付宝
  - `wxpay`: 微信支付
  - `stripe`: Stripe（需要单独配置）
  - `creem`: Creem（需要单独配置）
  - 其他易支付支持的支付类型
- **color**: 支付方式按钮颜色（可选）
- **min_topup**: 该支付方式的最小充值金额（可选）

### 支持的易支付支付类型

易支付通常支持以下支付类型（具体取决于您的服务商）：

- `alipay` - 支付宝
- `wxpay` - 微信支付
- `qqpay` - QQ钱包
- `bank` - 网银支付
- `usdt` - USDT支付
- 其他自定义支付类型

### 验证配置

配置完成后：

1. 刷新前端页面
2. 进入充值页面
3. 应该能看到支付宝和微信支付的选项
4. 点击支付按钮，应该能正常跳转到支付页面

### 常见问题

#### Q: 配置后看不到支付选项？

A: 请检查：
1. 易支付网关配置是否正确（PayAddress、EpayId、EpayKey）
2. PayMethods JSON 格式是否正确
3. 浏览器控制台是否有错误信息
4. 后端日志是否有相关错误

#### Q: 支付跳转失败？

A: 请检查：
1. 易支付服务商是否已开通对应的支付通道
2. 回调地址是否正确配置
3. 服务器是否能正常访问易支付网关

#### Q: 如何添加更多支付方式？

A: 在 PayMethods JSON 数组中添加新的支付方式配置即可，例如：

```json
[
  {
    "name": "支付宝",
    "type": "alipay",
    "color": "rgba(var(--semi-blue-5), 1)"
  },
  {
    "name": "微信",
    "type": "wxpay",
    "color": "rgba(var(--semi-green-5), 1)"
  },
  {
    "name": "QQ钱包",
    "type": "qqpay",
    "color": "rgba(var(--semi-primary-5), 1)"
  }
]
```

### 默认配置

如果未配置 PayMethods，系统会使用以下默认配置：

- 支付宝 (alipay)
- 微信支付 (wxpay)
- 自定义1 (custom1)

### 注意事项

1. **支付类型必须与易支付服务商支持的支付类型一致**
2. **确保易支付服务商已开通对应的支付通道**
3. **回调地址必须可公网访问**
4. **建议在生产环境使用 HTTPS**

## 其他支付方式

### Stripe 配置

Stripe 需要单独配置，不通过易支付网关。配置方法请参考 Stripe 相关文档。

### Creem 配置

Creem 需要单独配置，不通过易支付网关。配置方法请参考 Creem 相关文档。

