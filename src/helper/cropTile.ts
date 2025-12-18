import * as xml2js from 'xml2js';
import * as fs from 'fs-extra';
import spawn from 'cross-spawn';
import { ErrorCallback } from '../types';

/**
 * Runs an ImageMagick/GraphicsMagick command using cross-spawn.
 * Tries 'magick' (ImageMagick 7), then 'convert' (ImageMagick 6 / GraphicsMagick).
 * 
 * @param args Command arguments for the convert operation
 * @param callback function(err) {}
 */
function runImageCommand(args: string[], callback: ErrorCallback): void {
  // Try ImageMagick 7 first (magick command)
  const magickProcess = spawn('magick', args, { stdio: 'pipe' });
  
  let errorOutput = '';
  
  magickProcess.stderr?.on('data', (data) => {
    errorOutput += data.toString();
  });

  magickProcess.on('error', () => {
    // magick command not found, try convert (ImageMagick 6 / GraphicsMagick)
    const convertProcess = spawn('convert', args, { stdio: 'pipe' });
    
    let convertErrorOutput = '';
    
    convertProcess.stderr?.on('data', (data) => {
      convertErrorOutput += data.toString();
    });

    convertProcess.on('error', (err) => {
      callback(new Error(`Neither 'magick' nor 'convert' command found. Please install ImageMagick or GraphicsMagick. ${err.message}`));
    });

    convertProcess.on('close', (code) => {
      if (code === 0) {
        callback(null);
      } else {
        callback(new Error(`convert command failed with code ${code}: ${convertErrorOutput}`));
      }
    });
  });

  magickProcess.on('close', (code) => {
    if (code === 0) {
      callback(null);
    } else if (code !== null) {
      callback(new Error(`magick command failed with code ${code}: ${errorOutput}`));
    }
    // If code is null, the error handler will have been triggered
  });
}

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

    // Crop geometry: WxH+X+Y
    const cropGeometry = `${tileSizePx}x${tileSizePx}+${gutterSizePx}+${gutterSizePx}`;

    /*
     * The conversion from png to jpg and tif is wrong by default. The
     * transparency will convert to black. It is correct, if the transparency will
     * convert to white.
     * 
     * That will fixed with the following code.
     */
    if ((inExt === 'png' && outExt === 'jpg') || (inExt === 'png' && outExt === 'tif')) {
      // Flatten with white background, then crop
      const args = [
        oldFile,
        '-background', 'white',
        '-flatten',
        '-crop', cropGeometry,
        '+repage',
        newFile
      ];
      runImageCommand(args, callback);
    } else {
      // Simple crop
      const args = [
        oldFile,
        '-crop', cropGeometry,
        '+repage',
        newFile
      ];
      runImageCommand(args, callback);
    }
  }
}

export default cropTile;
