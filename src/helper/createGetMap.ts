import { WMSConfig } from '../types';

/**
 * Creates a full GetMap request from the following parameters.
 * 
 * @param wms Object with the GetMap base url and necessary key value pairs (kvp)
 * @param bbox BBOX of the GetMap request
 * @param width Width of the GetMap request
 * @param height Height of the GetMap request
 * @returns Complete GetMap request URL
 */
export function createGetMap(wms: WMSConfig, bbox: string, width: number | string, height: number | string): string {
  let getmap = wms.getmap.url;
  for (const key in wms.getmap.kvp) {
    const value = wms.getmap.kvp[key];
    if (value !== undefined) {
      getmap += encodeURIComponent(key) + '=' + encodeURIComponent(String(value)) + '&';
    }
  }

  getmap += 'BBOX=' + encodeURIComponent(bbox) + '&';
  getmap += 'WIDTH=' + encodeURIComponent(String(width)) + '&';
  getmap += 'HEIGHT=' + encodeURIComponent(String(height)) + '&';

  return getmap;
}

export default createGetMap;
