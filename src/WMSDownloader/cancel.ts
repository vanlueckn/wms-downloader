import { CancelCallback, ProgressObject, WMSDownloaderOptions } from '../types';

interface WMSDownloaderInstance {
  options: WMSDownloaderOptions;
  progress: ProgressObject;
}

/**
 * Cancels a download task.
 * 
 * @param _this WMSDownloader instance
 * @param id Id of the task
 * @param callback Callback function like function(err, id){}
 */
export function cancel(
  _this: WMSDownloaderInstance,
  id: string,
  callback: CancelCallback
): void {
  if (_this.progress[id]) {
    _this.progress[id].cancel = true;
    _this.progress[id].cancelCallback = callback;
  } else {
    callback(new Error('The download task with id "' + id + '" does not exist.'), id);
  }
}

export default cancel;
