/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useEffect, useState, useRef } from 'react';
import { Button, Form, Row, Col, Typography, Spin } from '@douyinfe/semi-ui';
const { Text } = Typography;
import {
  API,
  removeTrailingSlash,
  showError,
  showSuccess,
  verifyJSON,
} from '../../../helpers';
import { useTranslation } from 'react-i18next';

export default function SettingsPaymentGateway(props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    PayAddress: '',
    EpayId: '',
    EpayKey: '',
    Price: 7.3,
    MinTopUp: 1,
    TopupGroupRatio: '',
    CustomCallbackAddress: '',
    PayMethods: '',
    AmountOptions: '',
    AmountDiscount: '',
  });
  const [originInputs, setOriginInputs] = useState({});
  const formApiRef = useRef(null);

  useEffect(() => {
    if (props.options && formApiRef.current) {
      const currentInputs = {
        PayAddress: props.options.PayAddress || '',
        EpayId: props.options.EpayId || '',
        EpayKey: props.options.EpayKey || '',
        Price:
          props.options.Price !== undefined
            ? parseFloat(props.options.Price)
            : 7.3,
        MinTopUp:
          props.options.MinTopUp !== undefined
            ? parseFloat(props.options.MinTopUp)
            : 1,
        TopupGroupRatio: props.options.TopupGroupRatio || '',
        CustomCallbackAddress: props.options.CustomCallbackAddress || '',
        PayMethods: props.options.PayMethods || '',
        AmountOptions: props.options.AmountOptions || '',
        AmountDiscount: props.options.AmountDiscount || '',
      };

      // 美化 JSON 展示
      try {
        if (currentInputs.AmountOptions) {
          currentInputs.AmountOptions = JSON.stringify(
            JSON.parse(currentInputs.AmountOptions),
            null,
            2,
          );
        }
      } catch {}
      try {
        if (currentInputs.AmountDiscount) {
          currentInputs.AmountDiscount = JSON.stringify(
            JSON.parse(currentInputs.AmountDiscount),
            null,
            2,
          );
        }
      } catch {}

      setInputs(currentInputs);
      setOriginInputs({ ...currentInputs });
      formApiRef.current.setValues(currentInputs);
    }
  }, [props.options]);

  const handleFormChange = (values) => {
    setInputs(values);
  };

  const submitPayAddress = async () => {
    if (props.options.ServerAddress === '') {
      showError(t('请先填写服务器地址'));
      return;
    }

    if (originInputs['TopupGroupRatio'] !== inputs.TopupGroupRatio) {
      if (!verifyJSON(inputs.TopupGroupRatio)) {
        showError(t('充值分组倍率不是合法的 JSON 字符串'));
        return;
      }
    }

    if (originInputs['PayMethods'] !== inputs.PayMethods) {
      if (inputs.PayMethods.trim() !== '') {
        if (!verifyJSON(inputs.PayMethods)) {
          showError(t('充值方式设置不是合法的 JSON 字符串'));
          return;
        }
        // 验证支付方式配置格式
        try {
          const payMethods = JSON.parse(inputs.PayMethods);
          if (!Array.isArray(payMethods)) {
            showError(t('充值方式设置必须是一个 JSON 数组'));
            return;
          }
          // 验证每个支付方式配置
          for (let i = 0; i < payMethods.length; i++) {
            const method = payMethods[i];
            if (!method.name || !method.type) {
              showError(
                t('支付方式配置第') +
                  (i + 1) +
                  t('项缺少必填字段 name 或 type'),
              );
              return;
            }
            // 验证支付类型
            const validTypes = ['alipay', 'wxpay', 'stripe', 'creem'];
            if (
              !validTypes.includes(method.type) &&
              !method.type.startsWith('custom')
            ) {
              showError(
                t('支付方式配置第') +
                  (i + 1) +
                  t('项的 type 字段值无效，支持的类型：') +
                  validTypes.join(', '),
              );
              return;
            }
            // 验证最小充值金额
            if (method.min_topup !== undefined) {
              const minTopup = Number(method.min_topup);
              if (isNaN(minTopup) || minTopup < 0) {
                showError(
                  t('支付方式配置第') +
                    (i + 1) +
                    t('项的 min_topup 必须是大于等于 0 的数字'),
                );
                return;
              }
            }
          }
        } catch (e) {
          showError(t('解析支付方式配置失败：') + e.message);
          return;
        }
      }
    }

    if (
      originInputs['AmountOptions'] !== inputs.AmountOptions &&
      inputs.AmountOptions.trim() !== ''
    ) {
      if (!verifyJSON(inputs.AmountOptions)) {
        showError(t('自定义充值数量选项不是合法的 JSON 数组'));
        return;
      }
    }

    if (
      originInputs['AmountDiscount'] !== inputs.AmountDiscount &&
      inputs.AmountDiscount.trim() !== ''
    ) {
      if (!verifyJSON(inputs.AmountDiscount)) {
        showError(t('充值金额折扣配置不是合法的 JSON 对象'));
        return;
      }
    }

    setLoading(true);
    try {
      const options = [
        { key: 'PayAddress', value: removeTrailingSlash(inputs.PayAddress) },
      ];

      if (inputs.EpayId !== '') {
        options.push({ key: 'EpayId', value: inputs.EpayId });
      }
      if (inputs.EpayKey !== undefined && inputs.EpayKey !== '') {
        options.push({ key: 'EpayKey', value: inputs.EpayKey });
      }
      if (inputs.Price !== '') {
        options.push({ key: 'Price', value: inputs.Price.toString() });
      }
      if (inputs.MinTopUp !== '') {
        options.push({ key: 'MinTopUp', value: inputs.MinTopUp.toString() });
      }
      if (inputs.CustomCallbackAddress !== '') {
        options.push({
          key: 'CustomCallbackAddress',
          value: inputs.CustomCallbackAddress,
        });
      }
      if (originInputs['TopupGroupRatio'] !== inputs.TopupGroupRatio) {
        options.push({ key: 'TopupGroupRatio', value: inputs.TopupGroupRatio });
      }
      if (originInputs['PayMethods'] !== inputs.PayMethods) {
        options.push({ key: 'PayMethods', value: inputs.PayMethods });
      }
      if (originInputs['AmountOptions'] !== inputs.AmountOptions) {
        options.push({
          key: 'payment_setting.amount_options',
          value: inputs.AmountOptions,
        });
      }
      if (originInputs['AmountDiscount'] !== inputs.AmountDiscount) {
        options.push({
          key: 'payment_setting.amount_discount',
          value: inputs.AmountDiscount,
        });
      }

      // 发送请求
      const requestQueue = options.map((opt) =>
        API.put('/api/option/', {
          key: opt.key,
          value: opt.value,
        }),
      );

      const results = await Promise.all(requestQueue);

      // 检查所有请求是否成功
      const errorResults = results.filter((res) => !res.data.success);
      if (errorResults.length > 0) {
        errorResults.forEach((res) => {
          showError(res.data.message);
        });
      } else {
        showSuccess(t('更新成功'));
        // 更新本地存储的原始值
        setOriginInputs({ ...inputs });
        props.refresh && props.refresh();
      }
    } catch (error) {
      showError(t('更新失败'));
    }
    setLoading(false);
  };

  return (
    <Spin spinning={loading}>
      <Form
        initValues={inputs}
        onValueChange={handleFormChange}
        getFormApi={(api) => (formApiRef.current = api)}
      >
        <Form.Section text={t('支付设置')}>
          <div className='space-y-2 mb-4'>
            <Text>
              {t(
                '（当前仅支持易支付接口，默认使用上方服务器地址作为回调地址！）',
              )}
            </Text>
            <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4'>
              <div className='text-sm text-blue-900 dark:text-blue-100'>
                <div className='font-semibold mb-2'>
                  {t('微信和支付宝支付配置说明')}：
                </div>
                <ul className='list-disc list-inside space-y-1 text-xs'>
                  <li>
                    {t('系统通过易支付网关统一接入微信和支付宝支付')}
                  </li>
                  <li>
                    {t('需要先在易支付服务商处开通支付宝和微信支付通道')}
                  </li>
                  <li>
                    {t('配置易支付网关参数（支付地址、商户ID、商户密钥）后即可使用')}
                  </li>
                  <li>
                    {t('支付回调地址：')}
                    <code className='bg-blue-100 dark:bg-blue-800 px-1 rounded'>
                      {inputs.CustomCallbackAddress || t('服务器地址')}
                      /api/user/epay/notify
                    </code>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 24, xl: 24, xxl: 24 }}>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Form.Input
                field='PayAddress'
                label={t('支付地址')}
                placeholder={t('例如：https://yourdomain.com')}
              />
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Form.Input
                field='EpayId'
                label={t('易支付商户ID')}
                placeholder={t('例如：0001')}
              />
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Form.Input
                field='EpayKey'
                label={t('易支付商户密钥')}
                placeholder={t('敏感信息不会发送到前端显示')}
                type='password'
              />
            </Col>
          </Row>
          <Row
            gutter={{ xs: 8, sm: 16, md: 24, lg: 24, xl: 24, xxl: 24 }}
            style={{ marginTop: 16 }}
          >
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Form.Input
                field='CustomCallbackAddress'
                label={t('回调地址')}
                placeholder={t('例如：https://yourdomain.com')}
              />
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Form.InputNumber
                field='Price'
                precision={2}
                label={t('充值价格（x元/美金）')}
                placeholder={t('例如：7，就是7元/美金')}
              />
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Form.InputNumber
                field='MinTopUp'
                label={t('最低充值美元数量')}
                placeholder={t('例如：2，就是最低充值2$')}
              />
            </Col>
          </Row>
          <Form.TextArea
            field='TopupGroupRatio'
            label={t('充值分组倍率')}
            placeholder={t('为一个 JSON 文本，键为组名称，值为倍率')}
            autosize
          />
          <Form.TextArea
            field='PayMethods'
            label={t('充值方式设置')}
            placeholder={t('为一个 JSON 文本')}
            autosize
            extraText={
              <div className='space-y-2'>
                <div>
                  {t('配置支持的支付方式，支持支付宝和微信支付。示例：')}
                </div>
                <pre className='bg-slate-100 dark:bg-slate-800 p-2 rounded text-xs overflow-x-auto'>
{`[
  {
    "name": "支付宝",
    "type": "alipay",
    "color": "rgba(var(--semi-blue-5), 1)",
    "min_topup": "10"
  },
  {
    "name": "微信",
    "type": "wxpay",
    "color": "rgba(var(--semi-green-5), 1)",
    "min_topup": "10"
  }
]`}
                </pre>
                <div className='text-xs text-slate-500 dark:text-slate-400'>
                  <div>
                    <strong>{t('字段说明')}：</strong>
                  </div>
                  <ul className='list-disc list-inside space-y-1 mt-1'>
                    <li>
                      <strong>name</strong>: {t('支付方式显示名称')}
                    </li>
                    <li>
                      <strong>type</strong>: {t('支付类型，alipay=支付宝，wxpay=微信支付')}
                    </li>
                    <li>
                      <strong>color</strong>: {t('支付按钮颜色（可选）')}
                    </li>
                    <li>
                      <strong>min_topup</strong>: {t('该支付方式的最小充值金额（可选）')}
                    </li>
                  </ul>
                  <div className='mt-2'>
                    <strong>{t('注意事项')}：</strong>
                    <ul className='list-disc list-inside space-y-1 mt-1'>
                      <li>
                        {t('支付类型必须与易支付服务商支持的支付类型一致')}
                      </li>
                      <li>
                        {t('确保易支付服务商已开通对应的支付通道（支付宝/微信）')}
                      </li>
                      <li>
                        {t('如果留空，系统将使用默认配置（支付宝+微信）')}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            }
          />

          <Row
            gutter={{ xs: 8, sm: 16, md: 24, lg: 24, xl: 24, xxl: 24 }}
            style={{ marginTop: 16 }}
          >
            <Col span={24}>
              <Form.TextArea
                field='AmountOptions'
                label={t('自定义充值数量选项')}
                placeholder={t(
                  '为一个 JSON 数组，例如：[10, 20, 50, 100, 200, 500]',
                )}
                autosize
                extraText={t(
                  '设置用户可选择的充值数量选项，例如：[10, 20, 50, 100, 200, 500]',
                )}
              />
            </Col>
          </Row>

          <Row
            gutter={{ xs: 8, sm: 16, md: 24, lg: 24, xl: 24, xxl: 24 }}
            style={{ marginTop: 16 }}
          >
            <Col span={24}>
              <Form.TextArea
                field='AmountDiscount'
                label={t('充值金额折扣配置')}
                placeholder={t(
                  '为一个 JSON 对象，例如：{"100": 0.95, "200": 0.9, "500": 0.85}',
                )}
                autosize
                extraText={t(
                  '设置不同充值金额对应的折扣，键为充值金额，值为折扣率，例如：{"100": 0.95, "200": 0.9, "500": 0.85}',
                )}
              />
            </Col>
          </Row>

          <div className='flex gap-2'>
            <Button onClick={submitPayAddress}>{t('更新支付设置')}</Button>
            <Button
              type='tertiary'
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await API.get('/api/payment/test');
                  if (res.data.success) {
                    const data = res.data.data;
                    const messages = [];
                    if (data.online_topup_enabled) {
                      messages.push(
                        <div key='success' className='text-green-600'>
                          ✓ {t('在线充值已启用')}
                        </div>,
                      );
                    }
                    if (data.epay_configured) {
                      messages.push(
                        <div key='epay' className='text-green-600'>
                          ✓ {t('易支付配置完整')}
                        </div>,
                      );
                    }
                    if (data.epay_client_ok) {
                      messages.push(
                        <div key='client' className='text-green-600'>
                          ✓ {t('易支付客户端连接正常')}
                        </div>,
                      );
                    }
                    if (data.pay_methods && data.pay_methods.length > 0) {
                      messages.push(
                        <div key='methods' className='text-blue-600'>
                          {t('已配置支付方式')}: {data.pay_methods.join(', ')}
                        </div>,
                      );
                    }
                    if (data.errors && data.errors.length > 0) {
                      data.errors.forEach((error, index) => {
                        messages.push(
                          <div key={`error-${index}`} className='text-red-600'>
                            ✗ {error}
                          </div>,
                        );
                      });
                    }
                    if (data.warnings && data.warnings.length > 0) {
                      data.warnings.forEach((warning, index) => {
                        messages.push(
                          <div key={`warning-${index}`} className='text-yellow-600'>
                            ⚠ {warning}
                          </div>,
                        );
                      });
                    }
                    Modal.info({
                      title: t('支付配置测试结果'),
                      content: <div className='space-y-2'>{messages}</div>,
                      width: 500,
                    });
                  } else {
                    showError(res.data.message || t('测试失败'));
                  }
                } catch (error) {
                  showError(t('测试失败：') + error.message);
                } finally {
                  setLoading(false);
                }
              }}
            >
              {t('测试配置')}
            </Button>
          </div>
        </Form.Section>
      </Form>
    </Spin>
  );
}
