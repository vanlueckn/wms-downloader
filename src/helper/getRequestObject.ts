import * as request from 'request';
import { WMSDownloaderOptions } from '../types';

// Request object from request module.
let requestInstance: request.RequestAPI<request.Request, request.CoreOptions, request.RequiredUriUrl> | null = null;
let requestProxyInstance: request.RequestAPI<request.Request, request.CoreOptions, request.RequiredUriUrl> | null = null;

/**
 * Returns the correct request object with the right proxy settings.
 * 
 * @param config WMSDownloader options
 * @param url URL of tile
 * @returns Object from request module
 */
export function getRequestObject(
  config: WMSDownloaderOptions,
  url: string
): request.RequestAPI<request.Request, request.CoreOptions, request.RequiredUriUrl> {
  if (!requestInstance) {
    // Init request object
    requestInstance = request.defaults({
      headers: {
        'User-Agent': config.request.userAgent
      },
      strictSSL: false,
      timeout: config.request.timeout
    });
  }

  if (!requestProxyInstance) {
    // If internet proxy is set
    if (config.request.proxy) {
      // String of username and password
      let userPass = '';
      if (config.request.proxy.http.user) {
        if (config.request.proxy.http.password) {
          userPass = encodeURIComponent(config.request.proxy.http.user) + ':' + encodeURIComponent(config.request.proxy.http.password) + '@';
        }
      }

      // Init request object with internet proxy
      requestProxyInstance = request.defaults({
        headers: {
          'User-Agent': config.request.userAgent
        },
        strictSSL: false,
        timeout: config.request.timeout,
        proxy: 'http://' + userPass + config.request.proxy.http.host + ':' + config.request.proxy.http.port
      });
    }
  }

  let ret = requestInstance;

  if (config.request.proxy && requestProxyInstance) {
    ret = requestProxyInstance;
    const excludeList = config.request.proxy.http.exclude || [];
    for (let int = 0; int < excludeList.length; int++) {
      if (url.includes(excludeList[int])) {
        ret = requestInstance;
        break;
      }
    }
  }

  return ret;
}

export default getRequestObject;
