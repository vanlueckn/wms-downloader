import taskSchema from '../schemas/task.json';
import { isValid } from '../helper/isValid';
import { handleTask } from '../helper/handleTask';
import { getNumberOfTiles } from '../helper/getNumberOfTiles';
import { 
  TaskOptions, 
  StartCallback, 
  ProgressObject,
  WMSDownloaderOptions
} from '../types';

interface WMSDownloaderInstance {
  options: WMSDownloaderOptions;
  progress: ProgressObject;
}

/**
 * Starts a download task. Every download task runs always asynchronously.
 * 
 * @param _this WMSDownloader instance
 * @param options Options of the task
 * @param callback Callback function like function(err){}
 */
export function start(
  _this: WMSDownloaderInstance,
  options: TaskOptions,
  callback: StartCallback
): void {
  // validate task options
  const valid = isValid(options, taskSchema);

  // task options are valid
  if (valid === true) {
    // create progress entry for this task
    _this.progress[options.task.id] = {
      tiles: getNumberOfTiles(options),
      tilesCompleted: 0,
      startDate: new Date(),
      lastTileDate: null,
      percent: 0,
      waitingTime: 0,
      cancel: false,
      cancelCallback: null
    };

    try {
      // execute the task
      handleTask(options, _this.options, _this.progress, (err) => {
        // remove progress entry on error or completion
        delete _this.progress[options.task.id];

        if (err) {
          callback(err);
        } else {
          callback(null);
        }
      });
    } catch (err) {
      // remove progress entry on error
      delete _this.progress[options.task.id];
      callback(err as Error);
    }
  } else {
    // options are not valid, throw an error
    let msg = '';
    if (Array.isArray(valid)) {
      valid.forEach((error) => {
        msg += error.stack + '\n';
      });
    }
    callback(new Error(msg));
  }
}

export default start;
