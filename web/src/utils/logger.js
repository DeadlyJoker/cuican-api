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

/**
 * 统一的日志工具
 * 在开发环境输出日志，生产环境可配置是否输出或发送到日志服务
 */

const isDevelopment = process.env.NODE_ENV === 'development';

// 日志级别
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// 当前日志级别（可在配置中修改）
let currentLogLevel = isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR;

/**
 * 设置日志级别
 * @param {number} level - 日志级别
 */
export const setLogLevel = (level) => {
  currentLogLevel = level;
};

/**
 * 格式化日志消息
 */
const formatMessage = (level, ...args) => {
  const timestamp = new Date().toISOString();
  const levelName = Object.keys(LogLevel).find(
    (key) => LogLevel[key] === level,
  );
  return [`[${timestamp}] [${levelName}]`, ...args];
};

/**
 * 日志工具对象
 */
export const logger = {
  /**
   * Debug 日志（仅在开发环境）
   */
  debug: (...args) => {
    if (isDevelopment && currentLogLevel <= LogLevel.DEBUG) {
      console.debug(...formatMessage(LogLevel.DEBUG, ...args));
    }
  },

  /**
   * Info 日志
   */
  info: (...args) => {
    if (currentLogLevel <= LogLevel.INFO) {
      console.info(...formatMessage(LogLevel.INFO, ...args));
    }
  },

  /**
   * Warning 日志
   */
  warn: (...args) => {
    if (currentLogLevel <= LogLevel.WARN) {
      console.warn(...formatMessage(LogLevel.WARN, ...args));
    }
  },

  /**
   * Error 日志（始终输出，并可发送到错误追踪服务）
   */
  error: (...args) => {
    if (currentLogLevel <= LogLevel.ERROR) {
      console.error(...formatMessage(LogLevel.ERROR, ...args));
      
      // 在生产环境，可以发送到错误追踪服务
      // if (!isDevelopment) {
      //   sendToErrorTrackingService(...args);
      // }
    }
  },

  /**
   * 分组日志（仅在开发环境）
   */
  group: (label, ...args) => {
    if (isDevelopment) {
      console.group(label);
      args.forEach((arg) => console.log(arg));
      console.groupEnd();
    }
  },

  /**
   * 表格日志（仅在开发环境）
   */
  table: (data) => {
    if (isDevelopment) {
      console.table(data);
    }
  },
};

// 向后兼容：导出常用的日志方法
export const log = logger.debug;
export const info = logger.info;
export const warn = logger.warn;
export const error = logger.error;

export default logger;

