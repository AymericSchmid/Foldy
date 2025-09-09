export type Style = 'phong' | 'chrome' | 'halftone';
export type EnvMap = { px:string; nx:string; py:string; ny:string; pz:string; nz:string };
export type Vec3 = [number, number, number];
export type RGB = [number, number, number];

export type BloomParams = {
  threshold: number;   // bright pass threshold
  intensity: number;   // composite strength
  passes: number;      // blur passes (ping-pong count)
};

export type HalftoneParams = {
  angle: number;
  cell: number;
  thickness: number;
  colorOn: RGB;
  colorOff: RGB;
};

export type ChromeParams = {
  intensity: number;
  sparkle: number;
};

export type LightParams = {
  colors: RGB[];
  directions: Vec3[];
}

export type BackgroundParams = {
  baseFirst: RGB;
  baseSecond: RGB;
  accent: RGB;
  speed: number;
  noiseStrength: number;
}

export type Params = {
  bloom: BloomParams;
  halftone: HalftoneParams;
  chrome: ChromeParams;
  light: LightParams;
  background: BackgroundParams;
};

export type Options = {
  style?: Style;
  bloom?: boolean;
  fxaa?: boolean;
  background?: 'none' | 'movingGradient';
  dpr?: number;
  envMap?: EnvMap;               // optional for chrome
  camera?: { eye:[number,number,number]; target:[number,number,number] };
  position?: Vec3;
  params?: DeepPartial<Params>;  // initial param overrides
};

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type Viewer = {
  canvas: HTMLCanvasElement;

  setStyle(s: Style): void;
  setBloom(enabled: boolean): void;
  setFxaa(enabled: boolean): void;
  setBackground(kind: Options['background']): void;

  setEnvMap(env: EnvMap): Promise<void>;
  loadPDB(url: string): Promise<void>;

  setCamera(eye:[number,number,number], target:[number,number,number]): void;
  setRotation(x:number,y:number): void;
  setPosition(p: Vec3): void;

  on(event: 'loaded'|'error'|'frame', cb: (...a:any[])=>void): () => void;
  resize(width:number, height:number, dpr?:number): void;
  destroy(): void;

  // Patch any subset of params, e.g. { bloom: { intensity: 8 } } */
  setParams(patch: DeepPartial<Params>): void;
  // update a single key
  setParam<K extends keyof Params, P extends keyof Params[K]>(
    group: K,
    key: P,
    value: Params[K][P]
  ): void;
  getParams(): Readonly<Params>;
};

export { createProteinViewer } from './viewer';