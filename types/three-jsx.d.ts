import { MeshLineGeometry, MeshLineMaterial } from 'meshline';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: any;
      meshLineMaterial: any;
    }
  }
}

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: object;
    meshLineMaterial: {
      color?: string;
      depthTest?: boolean;
      resolution?: number[];
      useMap?: boolean;
      map?: any;
      repeat?: number[];
      lineWidth?: number;
      [key: string]: any;
    };
  }
}

export { };
