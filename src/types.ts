import { Request, Response } from 'request';
import { ValidationError } from 'jsonschema';

/**
 * Supported image format
 */
export interface SupportedFormat {
  title: string;
  fileExt: string;
  worldFileExt: string;
  mimeType?: string;
  mime_type?: string; // For PNG 8-Bit compatibility
}

/**
 * HTTP Proxy configuration
 */
export interface HttpProxyConfig {
  host: string;
  port: number;
  user?: string;
  password?: string;
  exclude?: string[];
}

/**
 * Proxy configuration
 */
export interface ProxyConfig {
  http: HttpProxyConfig;
}

/**
 * Request configuration
 */
export interface RequestConfig {
  userAgent: string;
  timeout: number;
  proxy?: ProxyConfig;
}

/**
 * WMSDownloader configuration options
 */
export interface WMSDownloaderOptions {
  request: RequestConfig;
}

/**
 * Bounding box
 */
export interface BBox {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
}

/**
 * Task area configuration
 */
export interface TaskArea {
  bbox: BBox;
}

/**
 * Task configuration
 */
export interface TaskConfig {
  id: string;
  title: string;
  format: string;
  workspace: string;
  area: TaskArea;
}

/**
 * Resolution configuration - can be defined by groundResolution or scale+dpi
 */
export interface Resolution {
  id: string;
  groundResolution?: number;
  scale?: number;
  dpi?: number;
}

/**
 * Tiles configuration
 */
export interface TilesConfig {
  maxSizePx: number;
  gutterPx: number;
  resolutions: Resolution[];
}

/**
 * WMS GetMap KVP (Key-Value Pairs)
 */
export interface WMSGetMapKVP {
  SERVICE?: string;
  REQUEST?: string;
  VERSION?: string;
  LAYERS?: string;
  STYLES?: string;
  CRS?: string;
  FORMAT?: string;
  TRANSPARENT?: string;
  MAP_RESOLUTION?: number;
  [key: string]: string | number | boolean | undefined;
}

/**
 * WMS GetMap configuration
 */
export interface WMSGetMapConfig {
  url: string;
  kvp: WMSGetMapKVP;
}

/**
 * WMS configuration
 */
export interface WMSConfig {
  id: string;
  getmap: WMSGetMapConfig;
}

/**
 * Task options for starting a download
 */
export interface TaskOptions {
  task: TaskConfig;
  tiles: TilesConfig;
  wms: WMSConfig[];
}

/**
 * Progress entry for a download task
 */
export interface ProgressEntry {
  tiles: number;
  tilesCompleted: number;
  startDate: Date;
  lastTileDate: Date | null;
  percent: number;
  waitingTime: number;
  cancel: boolean;
  cancelCallback: ((err: Error | null, id: string) => void) | null;
}

/**
 * Progress object containing all tasks
 */
export interface ProgressObject {
  [taskId: string]: ProgressEntry;
}

/**
 * Tile parameters for processing
 */
export interface TileParams {
  sizePx: number;
  sizeM: number;
  xCount: number;
  yCount: number;
  xSizeOverAllPx: number;
  ySizeOverAllPx: number;
  gutterM: number;
  x0: number;
  y0: number;
}

/**
 * Callback type for error-only callbacks
 */
export type ErrorCallback = (err: Error | null) => void;

/**
 * Callback type for cancel operation
 */
export type CancelCallback = (err: Error | null, id: string) => void;

/**
 * Callback type for start operation
 */
export type StartCallback = (err: Error | null) => void;

/**
 * Request module instance type
 */
export type RequestInstance = Request;

/**
 * Validation result - either true or array of validation errors
 */
export type ValidationResult = true | ValidationError[];

/**
 * JSON Schema type
 */
export interface JsonSchema {
  type?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  [key: string]: unknown;
}
