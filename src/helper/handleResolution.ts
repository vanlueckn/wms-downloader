import * as fs from 'fs-extra';
import { handleWMS } from './handleWMS';
import { 
  TaskOptions, 
  WMSDownloaderOptions, 
  ProgressObject, 
  ErrorCallback 
} from '../types';

/**
 * It handles recursive all resolutions of a task.
 * 
 * @param options Task options
 * @param ws Task workspace
 * @param resIdx Index of resolution
 * @param config See options of the WMSDownloader constructor
 * @param progress Array of the progress of all WMSDownloader tasks
 * @param callback function(err){}
 */
export function handleResolution(
  options: TaskOptions,
  ws: string,
  resIdx: number,
  config: WMSDownloaderOptions,
  progress: ProgressObject,
  callback: ErrorCallback
): void {
  // Resolution object
  const res = options.tiles.resolutions[resIdx];

  // Workspace of this resolutions
  let resWs: string;

  if (options.tiles.resolutions.length === 1) {
    resWs = ws;
  } else {
    resWs = ws + '/' + res.id;
  }

  // Create directory of resolution workspace
  fs.ensureDir(resWs, (err) => {
    // Error
    if (err) {
      // Directory could not be created.
      callback(err);
    } else {
      // No errors

      // Handle all wms
      handleWMS(options, resWs, res, 0, config, progress, (err) => {
        // Error
        if (err) {
          // It could not be handled all wms.
          callback(err);
        } else {
          // No errors

          // Raise resolution index
          resIdx++;

          // New resolution index exists
          if (resIdx < options.tiles.resolutions.length) {
            handleResolution(options, ws, resIdx, config, progress, callback);
          } else {
            // New resolution index does not exists
            // Call callback function without errors.
            callback(null);
          }
        }
      });
    }
  });
}

export default handleResolution;
