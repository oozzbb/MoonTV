/* eslint-disable @typescript-eslint/no-explicit-any, no-console */

import runtimeConfig from './runtime';

export interface ApiSite {
  key: string;
  api: string;
  name: string;
  detail?: string;
}

export interface StorageConfig {
  type: 'localstorage' | 'database';
  database?: {
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    database?: string;
  };
}

export interface Config {
  cache_time?: number;
  api_site: {
    [key: string]: ApiSite;
  };
  storage?: StorageConfig;
}

export const API_CONFIG = {
  search: {
    path: '?ac=videolist&wd=',
    pagePath: '?ac=videolist&wd={query}&pg={page}',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
  },
  detail: {
    path: '?ac=videolist&ids=',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
  },
};

// 在模块加载时根据环境决定配置来源
let cachedConfig: Config;

if (process.env.DOCKER_ENV === 'true') {
  // 这里用 eval("require") 避开静态分析，防止 Edge Runtime 打包时报 "Can't resolve 'fs'"
  // 在实际 Node.js 运行时才会执行到，因此不会影响 Edge 环境。
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const _require = eval('require') as NodeRequire;
  const fs = _require('fs') as typeof import('fs');
  const path = _require('path') as typeof import('path');

  const configPath = path.join(process.cwd(), 'config.json');
  const raw = fs.readFileSync(configPath, 'utf-8');
  cachedConfig = JSON.parse(raw) as Config;
  console.log('load dynamic config success');
} else {
  // 默认使用编译时生成的配置
  cachedConfig = runtimeConfig as unknown as Config;
}

export function getConfig(): Config {
  return cachedConfig;
}

export function getCacheTime(): number {
  const config = getConfig();
  return config.cache_time || 300; // 默认5分钟缓存
}

export function getApiSites(): ApiSite[] {
  const config = getConfig();
  return Object.entries(config.api_site).map(([key, site]) => ({
    ...site,
    key,
  }));
}
