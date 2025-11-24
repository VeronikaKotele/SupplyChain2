import {Color3} from '@babylonjs/core';

export interface ConnectionMarker {
  flow_id: string;
  id_from: string;
  id_to: string;
  step_type: string;
  product?: string;
  amount: number;
  color: Color3;
}