import * as fs from 'fs-extra';
import { handleResolution } from './handleResolution';
import { 
  TaskOptions, 
  WMSDownloaderOptions, 
  ProgressObject, 
  ErrorCallback 
} from '../types';

/**
 * It handles a download task of Web Map Services.
 * 
 * @param options Task options
 * @param config See options of the WMSDownloader constructor
 * @param progress Array of the progress of all WMSDownloader tasks
 * @param callback function(err){}
 */
export function handleTask(
  options: TaskOptions,
  config: WMSDownloaderOptions,
  progress: ProgressObject,
  callback: ErrorCallback
): void {
  fs.ensureDir(options.task.workspace, (err) => {
    if (err) {
      // Call callback function with error.
      callback(err);
    } else {
      // Workspace of this task
      const ws = options.task.workspace + '/' + options.task.id;

      // Create directory of task workspace
      fs.ensureDir(ws, (err) => {
        // Error
        if (err) {
          // Directory could not be created.
          callback(err);
        } else {
          // No errors

          // Handle all resolutions
          handleResolution(options, ws, 0, config, progress, (err) => {
            // Error
            if (err) {
              // It could not be handled all resolutions.
              callback(err);
            } else {
              // No errors
              callback(null);
            }
          });
        }
      });
    }
  });
}

export default handleTask;
