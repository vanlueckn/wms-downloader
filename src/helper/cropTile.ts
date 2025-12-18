import * as xml2js from 'xml2js';
import * as fs from 'fs-extra';
import gm from 'gm';
import { ErrorCallback } from '../types';

/**
 * Crops a tile with the gutter size.
 * 
 * @param oldFile File to be crop
 * @param newFile New cropped file
 * @param tileSizePx Size of the new tile
 * @param gutterSizePx Size of gutter in the old tile
 * @param callback function(err) {}
 */
export function cropTile(
  oldFile: string,
  newFile: string,
  tileSizePx: number,
  gutterSizePx: number,
  callback: ErrorCallback
): void {
  if (oldFile.endsWith('.svg') && newFile.endsWith('.svg')) {
    // vector images
    fs.readFile(oldFile, { encoding: 'utf8' }, (err, content) => {
      if (err) {
        callback(err);
      } else {
        const parser = new xml2js.Parser({ async: false });

        parser.parseString(content, (err: Error | null, result: any) => {
          if (err) {
            callback(err);
          } else {
            const builder = new xml2js.Builder();
            try {
              const viewBox = result.svg['$'].viewBox.split(' ');
              for (let i = 0; i < viewBox.length; i++) {
                viewBox[i] = parseFloat(viewBox[i]);
              }

              viewBox[0] = viewBox[0] + gutterSizePx;
              viewBox[1] = viewBox[1] + gutterSizePx;
              viewBox[2] = viewBox[2] - gutterSizePx * 2;
              viewBox[3] = viewBox[3] - gutterSizePx * 2;

              result.svg['$'].viewBox = viewBox[0] + ' ' + viewBox[1] + ' ' + viewBox[2] + ' ' + viewBox[3];

              const xml = builder.buildObject(result);
              fs.writeFile(newFile, xml, { encoding: 'utf8' }, callback);
            } catch (err) {
              callback(err as Error);
            }
          }
        });
      }
    });
  } else {
    // raster images (and from vector to raster image as well)
    const inExt = oldFile.substring(oldFile.length - 3, oldFile.length);
    const outExt = newFile.substring(newFile.length - 3, newFile.length);

    /*
     * The conversion from png to jpg and tif is wrong by default. The
     * transparency will convert to black. It is correct, if the transparency will
     * convert to white.
     * 
     * That will fixed with the following code.
     */
    if ((inExt === 'png' && outExt === 'jpg') || (inExt === 'png' && outExt === 'tif')) {
      gm(oldFile).flatten().background('white').crop(tileSizePx, tileSizePx, gutterSizePx, gutterSizePx).write(newFile, (err) => {
        callback(err || null);
      });
    } else {
      gm(oldFile).crop(tileSizePx, tileSizePx, gutterSizePx, gutterSizePx).write(newFile, (err) => {
        callback(err || null);
      });
    }
  }
}

export default cropTile;
