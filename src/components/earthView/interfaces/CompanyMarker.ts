import {Color3, Vector3} from '@babylonjs/core';
import type { ColorLegendOption, Company } from '@app/types';
import { latLonToVector3 } from '../utils/math3D';

export interface CompanyMarker {
  id: string;
  type?: string;
  name?: string;
  location_county?: string;
  location_city?: string;
  position: Vector3;
  color?: Color3;
}

export function translateToCompanyMarker(
  companyInfo: Company,
  earthRadius: number,
  colors: ColorLegendOption[],
): CompanyMarker
{
  return {
    id: companyInfo.id,
    type: companyInfo.type,
    name: companyInfo.name,
    location_county: companyInfo.country,
    position: latLonToVector3(parseFloat(companyInfo.lat), parseFloat(companyInfo.lon), earthRadius),
    color: Color3.FromHexString(colors.find(c => c.label === companyInfo.type)?.color || "#FFFFFF"),
  };
}