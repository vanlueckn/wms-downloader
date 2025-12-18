/**
 * Creates world file content.
 * 
 * @param x0 X value of start point (top-left)
 * @param y0 Y value of start point (top-left)
 * @param res Ground resolution
 * @returns Content of world file
 */
export function createWorldFile(x0: number, y0: number, res: number): string {
  const halfPxInM = res / 2.0;
  let ret = res + '\n';
  ret += '0.0' + '\n';
  ret += '0.0' + '\n';
  ret += '-' + res + '\n';
  ret += (x0 + halfPxInM) + '\n';
  ret += (y0 - halfPxInM);
  return ret;
}

export default createWorldFile;
