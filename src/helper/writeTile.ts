import * as fs from 'fs-extra';
import * as request from 'request';
import { ErrorCallback } from '../types';

/**
 * Downloads and writes a tile.
 * 
 * @param file Path where the tile is to be stored.
 * @param url URL of tile
 * @param requestObj Object from request module
 * @param callback function(err, res){}
 */
export function writeTile(
  file: string,
  url: string,
  requestObj: request.RequestAPI<request.Request, request.CoreOptions, request.RequiredUriUrl>,
  callback: (err: Error | null, res: request.Response | null) => void
): void {
  // Result of request
  let res: request.Response | null = null;

  // FileWriteStream
  const fileStream = fs.createWriteStream(file);

  // Register finish callback of FileWriteStream
  fileStream.on('finish', () => {
    callback(null, res);
  });

  // Register error callback of FileWriteStream
  fileStream.on('error', (err: Error) => {
    callback(err, res);
  });

  // Request object
  const req = requestObj.get(url);

  // Register error callback of request
  req.on('error', (err: Error) => {
    callback(err, res);
  });

  // Register response callback of request
  req.on('response', (response: request.Response) => {
    res = response;
  });

  // Start download
  req.pipe(fileStream);
}

export default writeTile;
