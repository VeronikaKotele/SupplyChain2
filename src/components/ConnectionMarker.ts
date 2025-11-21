import {Color3} from '@babylonjs/core';

export interface ConnectionMarker {
  id_from: string;
  id_to: string;
  order_id: string;
  product: string;
  amount: string;
  color?: Color3;
}