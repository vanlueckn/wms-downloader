import * as fs from 'fs-extra';
import { AxiosInstance, AxiosResponse } from 'axios';

/**
 * Downloads and writes a tile using axios.
 * 
 * @param file Path where the tile is to be stored.
 * @param url URL of tile
 * @param axiosInstance Axios instance configured for the request
 * @param callback function(err, res){}
 */
export function writeTile(
  file: string,
  url: string,
  axiosInstance: AxiosInstance,
  callback: (err: Error | null, res: AxiosResponse | null) => void
): void {
  axiosInstance.get(url)
    .then((response: AxiosResponse) => {
      // Create write stream
      const fileStream = fs.createWriteStream(file);

      // Register finish callback of FileWriteStream
      fileStream.on('finish', () => {
        callback(null, response);
      });

      // Register error callback of FileWriteStream
      fileStream.on('error', (err: Error) => {
        callback(err, response);
      });

      // Pipe the response data to the file
      response.data.pipe(fileStream);
    })
    .catch((err: Error) => {
      callback(err, null);
    });
}

export default writeTile;
