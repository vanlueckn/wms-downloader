import * as fs from 'fs-extra';
import { getFormatDetails } from './getFormatDetails';
import { createWorldFile } from './createWorldFile';
import { createGetMap } from './createGetMap';
import { getAxiosInstance } from './getRequestObject';
import { cropTile } from './cropTile';
import { writeTile } from './writeTile';
import { 
  TaskOptions, 
  WMSConfig, 
  TileParams, 
  WMSDownloaderOptions, 
  ProgressObject, 
  ErrorCallback 
} from '../types';

/**
 * It handles recursive all tiles of a resolution of a Web Map Service.
 * 
 * @param options Task options
 * @param wms WMS object
 * @param ws WMS workspace
 * @param tiles Object with tile parameters
 * @param xIdx X-Index of tile
 * @param yIdx Y-Index of tile
 * @param res Ground resolution
 * @param config See options of the WMSDownloader constructor
 * @param progress Array of the progress of all WMSDownloader tasks
 * @param callback function(err){}
 */
export function handleTiles(
  options: TaskOptions,
  wms: WMSConfig,
  ws: string,
  tiles: TileParams,
  xIdx: number,
  yIdx: number,
  res: number,
  config: WMSDownloaderOptions,
  progress: ProgressObject,
  callback: ErrorCallback
): void {
  // ID of tile (filename)
  const idOfTile = 'x' + xIdx + '_y' + yIdx;

  // Startpoint (top-left) of world file
  const tX0 = tiles.x0 + xIdx * tiles.sizeM;
  const tY0 = tiles.y0 - yIdx * tiles.sizeM;

  // MIN-Point (bottom-left) of gutter getmap
  const tX0Gutter = tX0 - tiles.gutterM;
  const tY0Gutter = (tY0 - tiles.sizeM) - tiles.gutterM;

  // MAX-Point (top-right) of gutter getmap
  const tXNGutter = (tX0 + tiles.sizeM) + tiles.gutterM;
  const tYNGutter = tY0 + tiles.gutterM;

  // GetMap parameters
  const bboxGetMap = tX0Gutter + ',' + tY0Gutter + ',' + tXNGutter + ',' + tYNGutter;
  const widthGetMap = options.tiles.maxSizePx;
  const heightGetMap = options.tiles.maxSizePx;

  // GetMap url
  const getMap = createGetMap(wms, bboxGetMap, widthGetMap, heightGetMap);

  // World file content
  const worldFile = createWorldFile(tX0, tY0, res);

  // Input format of WMS
  const inputFormatDetails = getFormatDetails(wms.getmap.kvp.FORMAT as string);

  // Output format of tile
  const outputFormatDetails = getFormatDetails(options.task.format);

  if (!inputFormatDetails || !outputFormatDetails) {
    callback(new Error('Unsupported format'));
    return;
  }

  // Filename of gutter tile
  const fileGutterTile = ws + '/' + idOfTile + '_gutter.' + inputFormatDetails.fileExt;

  // Filename of tile
  const fileTile = ws + '/' + idOfTile + '.' + outputFormatDetails.fileExt;

  // Write gutter tile
  writeTile(
    ws + '/' + idOfTile + '_gutter.' + inputFormatDetails.fileExt,
    getMap,
    getAxiosInstance(config, getMap),
    (err, _result) => {
      // Error
      if (err) {
        // Tile could not be downloaded.
        callback(err);
      } else {
        // No errors, Tile was downloaded

        // Crop tile
        cropTile(fileGutterTile, fileTile, tiles.sizePx, options.tiles.gutterPx, (err) => {
          // Error
          if (err) {
            // Tile could not be cropped
            callback(err);
          } else {
            // No errors, File cropped

            // Delete old gutter tile
            fs.remove(fileGutterTile, (err) => {
              // Error
              if (err) {
                // File could not be deleted
                callback(err);
              } else {
                // No errors, File was deleted

                // Write world file
                fs.writeFile(ws + '/' + idOfTile + '.' + outputFormatDetails.worldFileExt, worldFile, (err) => {
                  // Error
                  if (err) {
                    // File could not be written.
                    callback(err);
                  } else {
                    // No errors, World file was written

                    try {
                      if (progress[options.task.id]) {
                        progress[options.task.id].tilesCompleted++;
                        progress[options.task.id].lastTileDate = new Date();

                        if (progress[options.task.id].cancel) {
                          const cancelCb = progress[options.task.id].cancelCallback;
                          if (cancelCb) {
                            cancelCb(null, options.task.id);
                          }
                          callback(new Error('The download task "' + options.task.id + '" was canceled.'));
                          return;
                        }
                      }

                      // NEXT TILE Raise x tile index
                      xIdx++;
                      if (xIdx < tiles.xCount) {
                        // Handle next tile in x direction
                        handleTiles(options, wms, ws, tiles, xIdx, yIdx, res, config, progress, callback);
                      } else {
                        // Raise y tile index
                        yIdx++;
                        if (yIdx < tiles.yCount) {
                          // Set x tile index back to zero
                          xIdx = 0;

                          // Handle next tile in y direction
                          handleTiles(options, wms, ws, tiles, xIdx, yIdx, res, config, progress, callback);
                        } else {
                          // All tiles were written.
                          callback(null);
                        }
                      }
                    } catch (err) {
                      callback(err as Error);
                    }
                  }
                });
              }
            });
          }
        });
      }
    }
  );
}

export default handleTiles;
