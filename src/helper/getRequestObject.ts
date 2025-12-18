import axios, { AxiosInstance } from 'axios';
import * as https from 'https';
import { WMSDownloaderOptions } from '../types';

// Axios instances
let axiosInstance: AxiosInstance | null = null;
let axiosProxyInstance: AxiosInstance | null = null;

/**
 * Creates axios configuration based on WMSDownloader options.
 * 
 * @param config WMSDownloader options
 * @param url URL of tile
 * @returns Axios instance configured with appropriate settings
 */
export function getAxiosInstance(
  config: WMSDownloaderOptions,
  url: string
): AxiosInstance {
  if (!axiosInstance) {
    // Init axios instance
    axiosInstance = axios.create({
      headers: {
        'User-Agent': config.request.userAgent
      },
      timeout: config.request.timeout,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      }),
      responseType: 'stream'
    });
  }

  if (!axiosProxyInstance && config.request.proxy) {
    // Proxy auth configuration
    let proxyAuth: { username: string; password: string } | undefined;
    if (config.request.proxy.http.user && config.request.proxy.http.password) {
      proxyAuth = {
        username: config.request.proxy.http.user,
        password: config.request.proxy.http.password
      };
    }

    // Init axios instance with internet proxy
    axiosProxyInstance = axios.create({
      headers: {
        'User-Agent': config.request.userAgent
      },
      timeout: config.request.timeout,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      }),
      responseType: 'stream',
      proxy: {
        host: config.request.proxy.http.host,
        port: config.request.proxy.http.port,
        auth: proxyAuth
      }
    });
  }

  let ret = axiosInstance;

  if (config.request.proxy && axiosProxyInstance) {
    ret = axiosProxyInstance;
    const excludeList = config.request.proxy.http.exclude || [];
    for (let int = 0; int < excludeList.length; int++) {
      if (url.includes(excludeList[int])) {
        ret = axiosInstance;
        break;
      }
    }
  }

  return ret;
}

/**
 * @deprecated Use getAxiosInstance instead
 * Returns the axios instance (kept for API compatibility).
 */
export function getRequestObject(
  config: WMSDownloaderOptions,
  url: string
): AxiosInstance {
  return getAxiosInstance(config, url);
}

export default getAxiosInstance;
