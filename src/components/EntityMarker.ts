import {Color3} from '@babylonjs/core';

export interface EntityMarker {
  id: string;
  type?: string;
  name?: string;
  location_county?: string;
  location_city?: string;
  latitude: number;
  longitude: number;
  color?: Color3;
  size?: number;
}