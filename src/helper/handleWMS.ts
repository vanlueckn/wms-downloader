import * as fs from 'fs-extra';
import { handleTiles } from './handleTiles';
import { 
  TaskOptions, 
  Resolution, 
  WMSDownloaderOptions, 
  ProgressObject, 
  ErrorCallback,
  TileParams
} from '../types';

/**
 * It handles recursive all Web Map Services of a resolution.
 * 
 * @param options Task options
 * @param ws Resolution workspace
 * @param res Resolution object
 * @param wmsIdx Index of WMS
 * @param config See options of the WMSDownloader constructor
 * @param progress Array of the progress of all WMSDownloader tasks
 * @param callback function(err){}
 */
export function handleWMS(
  options: TaskOptions,
  ws: string,
  res: Resolution,
  wmsIdx: number,
  config: WMSDownloaderOptions,
  progress: ProgressObject,
  callback: ErrorCallback
): void {
  // WMS object
  const wms = options.wms[wmsIdx];

  // Workspace of this WMS
  let wmsWs = ws;
  if (options.wms.length > 1) {
    wmsWs += '/' + wms.id;
  }

  // Create directory of WMS workspace
  fs.ensureDir(wmsWs, (err) => {
    // Error
    if (err) {
      // Directory could not be created.
      callback(err);
    } else {
      // No errors

      // Calculate parameters of bbox
      const bbox = {
        widthM: options.task.area.bbox.xmax - options.task.area.bbox.xmin,
        heightM: options.task.area.bbox.ymax - options.task.area.bbox.ymin,
        widthPx: 0,
        heightPx: 0
      };
      bbox.widthPx = bbox.widthM / (res.groundResolution as number);
      bbox.heightPx = bbox.heightM / (res.groundResolution as number);

      // Calculate parameters of tiles
      const tiles: TileParams = {
        sizePx: options.tiles.maxSizePx - 2 * options.tiles.gutterPx,
        sizeM: 0,
        xCount: 0,
        yCount: 0,
        xSizeOverAllPx: 0,
        ySizeOverAllPx: 0,
        gutterM: 0,
        x0: 0,
        y0: 0
      };
      tiles.sizeM = tiles.sizePx * (res.groundResolution as number);
      tiles.xCount = Math.ceil(bbox.widthPx / tiles.sizePx);
      tiles.yCount = Math.ceil(bbox.heightPx / tiles.sizePx);
      tiles.xSizeOverAllPx = tiles.xCount * tiles.sizePx;
      tiles.ySizeOverAllPx = tiles.yCount * tiles.sizePx;
      tiles.gutterM = options.tiles.gutterPx * (res.groundResolution as number);
      tiles.x0 = options.task.area.bbox.xmin - (((tiles.xSizeOverAllPx - bbox.widthPx) / 2.0) * (res.groundResolution as number));
      tiles.y0 = options.task.area.bbox.ymax + (((tiles.ySizeOverAllPx - bbox.heightPx) / 2.0) * (res.groundResolution as number));

      // Handle all tiles
      handleTiles(options, wms, wmsWs, tiles, 0, 0, res.groundResolution as number, config, progress, (err) => {
        // Error
        if (err) {
          // Could not handle tiles
          callback(err);
        } else {
          // No errors

          // Raise wms index
          wmsIdx++;

          // Handle next WMS
          if (wmsIdx < options.wms.length) {
            handleWMS(options, ws, res, wmsIdx, config, progress, callback);
          } else {
            // All WMS were handled
            callback(null);
          }
        }
      });
    }
  });
}

export default handleWMS;
