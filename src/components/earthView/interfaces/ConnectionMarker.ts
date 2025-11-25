import type { Connection } from '@/types/data';
import type { ColorLegendOption } from '@/types/filters';
import {Color3, Vector3} from '@babylonjs/core';
import { defaultConnectionMarkerSize as defaultSize } from '../utils/styles';

export interface ConnectionMarker {
  flow_id: string;
  id_from: string;
  id_to: string;
  position_from: Vector3;
  position_to: Vector3;
  step_type: string;
  products?: string[];
  size: number;
  color: Color3;
  alpha?: number;
}


export function translateToConnectionMarker(
  connectionInfo: Connection,
  positionsMap: Map<string, Vector3>,
  relativeSizeFactor: number = 1, // to adjust size based on statistics
  alpha: number = 0.5,
  colors: ColorLegendOption[] = [],
  products: string[] = [],
): ConnectionMarker
{
  return {
    flow_id: connectionInfo.Flow_Id,
    id_from: connectionInfo.Id_From,
    id_to: connectionInfo.Id_To,
    position_from: positionsMap.get(connectionInfo.Id_From) || new Vector3(0, 0, 0),
    position_to: positionsMap.get(connectionInfo.Id_To) || new Vector3(0, 0, 0),
    step_type: connectionInfo.step_type,
    products: products,
    size: defaultSize * relativeSizeFactor,
    alpha: alpha,
    color: Color3.FromHexString(colors.find(color => color.label === connectionInfo.step_type)?.color || "#FFFFFF"),
  };
}