import * as os from 'os';
import * as request from 'request';
import packageJson from '../package.json';
import { start as startFn } from './WMSDownloader/start';
import { cancel as cancelFn } from './WMSDownloader/cancel';
import { getProgress as getProgressFn } from './WMSDownloader/getProgress';
import { isValid } from './helper/isValid';
import { getSupportedFormats } from './helper/getSupportedFormats';
import { getRequestObject } from './helper/getRequestObject';
import configSchema from './schemas/config.json';
import {
  WMSDownloaderOptions,
  TaskOptions,
  StartCallback,
  CancelCallback,
  ProgressEntry,
  ProgressObject,
  SupportedFormat
} from './types';

const defaultOptions: WMSDownloaderOptions = {
  request: {
    userAgent: packageJson.name + '/' + packageJson.version + ' (' + os.platform() + ')',
    timeout: 30000
  }
};

/**
 * This is the main class of this module.
 * It allows you to download tiles of a Web Map Service (WMS).
 */
class WMSDownloader {
  public options: WMSDownloaderOptions;
  public progress: ProgressObject;

  /**
   * Returns all supported formats.
   */
  static get SUPPORTED_FORMATS(): SupportedFormat[] {
    return getSupportedFormats();
  }

  /**
   * @param options Config options of the WMSDownloader instance.
   */
  constructor(options?: WMSDownloaderOptions) {
    // options are set
    if (options) {
      // validate the user options
      const valid = isValid(options, configSchema);

      // options are valid
      if (valid === true) {
        this.options = Object.assign({}, defaultOptions, options);
      } else {
        // options are not valid, throw an error
        let msg = '\n';
        if (Array.isArray(valid)) {
          valid.forEach((error) => {
            msg += error.stack + '\n';
          });
        }
        throw new Error(msg);
      }
    } else {
      // options are not set, set default options
      this.options = defaultOptions;
    }

    // set a empty progress object for all new tasks
    this.progress = {};
  }

  /**
   * Returns the object of the request module.
   * @param url Url for request
   * @returns object of the request module.
   */
  getRequestObject(url: string): request.RequestAPI<request.Request, request.CoreOptions, request.RequiredUriUrl> {
    return getRequestObject(this.options, url);
  }

  /**
   * Starts a download task. Every download task runs always asynchronously.
   * @param options Options of the task.
   * @param callback Callback function like function(err){}
   */
  start(options: TaskOptions, callback: StartCallback): void {
    startFn(this, options, callback);
  }

  /**
   * Cancels a download task.
   * @param id Id of the task
   * @param callback Callback function like function(err, id){}
   */
  cancel(id: string, callback: CancelCallback): void {
    cancelFn(this, id, callback);
  }

  /**
   * Returns the progress of a download task.
   * @param id Id of the task
   * @returns Progress object or null if task doesn't exist
   */
  getProgress(id: string): ProgressEntry | null {
    return getProgressFn(this, id);
  }

  // TODO: Remove deprecated functions --------------------------------------------------------------

  /**
   * This function is deprecated please use the constructor (new WMSDownloader()).
   * @param options
   * @deprecated
   */
  init(options?: WMSDownloaderOptions): void {
    console.log('The function init() is deprecated please use the constructor (new WMSDownloader())');

    // options are set
    if (options) {
      // validate the user options
      const valid = isValid(options, configSchema);

      // options are valid
      if (valid === true) {
        this.options = Object.assign({}, defaultOptions, options);
      } else {
        // options are not valid, throw an error
        let msg = '';
        if (Array.isArray(valid)) {
          valid.forEach((error) => {
            msg += error.stack + '\n';
          });
        }
        throw new Error(msg);
      }
    } else {
      // options are not set, set default options
      this.options = defaultOptions;
    }

    // set a empty progress object for all new tasks
    this.progress = {};
  }

  /**
   * This function is deprecated please use start().
   * @param options
   * @param callback Callback function like function(err){}
   * @deprecated
   */
  startDownload(options: TaskOptions, callback: StartCallback): void {
    console.log('The function startDownload() is deprecated please use start()');
    this.start(options, callback);
  }

  /**
   * This function is deprecated please use cancel().
   * @param id ID of the task
   * @param callback Callback function like function(err){}
   * @deprecated
   */
  cancelDownload(id: string, callback: CancelCallback): void {
    console.log('The function cancelDownload() is deprecated please use cancel()');
    this.cancel(id, callback);
  }
  // TODO: Remove deprecated functions --------------------------------------------------------------
}

export = WMSDownloader;
