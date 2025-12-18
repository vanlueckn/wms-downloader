import { Resolution } from '../types';

/**
 * Calculates the ground resolution from scale and dpi.
 * If `groundResolution` is not set, it will be calculated and set into the array.
 * 
 * @param res Resolutions defined with scales
 */
export function determineGroundResolution(res: Resolution[]): void {
  // iterate over all resolutions
  for (let int = 0; int < res.length; int++) {
    const r = res[int];

    // calculate the resolution if not available
    if (!r.groundResolution && r.scale && r.dpi) {
      r.groundResolution = (0.0254 * r.scale) / r.dpi;
    }
  }
}

export default determineGroundResolution;
