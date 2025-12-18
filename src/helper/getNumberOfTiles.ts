import { determineGroundResolution } from './determineGroundResolution';
import { TaskOptions } from '../types';

/**
 * Calculates the number of tiles of a task.
 * 
 * @param options Task options
 * @returns Number of all tiles of this task
 */
export function getNumberOfTiles(options: TaskOptions): number {
  // Determine ground resolution if scale is only set
  determineGroundResolution(options.tiles.resolutions);

  // Counter of all tiles
  let countOfAllTiles = 0;

  // Calculate parameters of bbox
  const widthM = options.task.area.bbox.xmax - options.task.area.bbox.xmin;
  const heightM = options.task.area.bbox.ymax - options.task.area.bbox.ymin;

  // Iterate over all resolutions
  for (let int = 0; int < options.tiles.resolutions.length; int++) {
    // Current resolution
    const res = options.tiles.resolutions[int];

    // Size of all tiles in sum
    const widthPx = widthM / (res.groundResolution as number);
    const heightPx = heightM / (res.groundResolution as number);

    // Calculate tiles count of the current resolution
    const tiles = {
      sizePx: options.tiles.maxSizePx - 2 * options.tiles.gutterPx,
      xCount: 0,
      yCount: 0
    };
    tiles.xCount = Math.ceil(widthPx / tiles.sizePx);
    tiles.yCount = Math.ceil(heightPx / tiles.sizePx);

    // Note tiles count of current resolution
    countOfAllTiles += tiles.xCount * tiles.yCount * options.wms.length;
  }

  return countOfAllTiles;
}

export default getNumberOfTiles;
