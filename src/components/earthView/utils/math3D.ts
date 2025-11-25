import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  SceneLoader,
  Color4,
  StandardMaterial,
  Color3,
  Mesh,
  MeshBuilder,
} from '@babylonjs/core';

/**
 * Converts geographic coordinates (latitude/longitude) to 3D Cartesian coordinates.
 * 
 * Coordinate System Notes:
 * - Latitude: -90° (South Pole) to +90° (North Pole)
 * - Longitude: -180° (West) to +180° (East), where 0° is Prime Meridian
 * - Phi (φ): Polar angle from North Pole (0° at North Pole, 180° at South Pole)
 * - Theta (θ): Azimuthal angle in the XZ plane
 * 
 * Babylon.js uses Y-up coordinate system:
 * - Y axis points up (North Pole)
 * - X axis points right
 * - Z axis points forward/back
 * 
 * Test Cases for Verification:
 * 1. North Pole (90, 0) should give (0, radius, 0)
 * 2. South Pole (-90, 0) should give (0, -radius, 0)
 * 3. Equator/Prime Meridian (0, 0) should be on equator
 * 4. Equator/90°E (0, 90) should be on equator, 90° rotated
 * 
 * IMPORTANT: The negative X and theta offset may need adjustment based on your
 * model's orientation. If markers appear rotated or mirrored, modify these values.
 */
const latLonToVector3 = (lat: number, lon: number, radius: number,
  modelOrientationLongitudeOffset: number = 180
): Vector3 => {
  // Convert latitude to phi (polar angle from North Pole)
  // At lat=90° (North): phi=0°, at lat=0° (Equator): phi=90°, at lat=-90° (South): phi=180°
  const phi = (90 - lat) * (Math.PI / 180);
  
  // Convert longitude to theta (azimuthal angle)
  // Adding modelOrientationLongitudeOffset° to align with the model's orientation
  const theta = (lon + modelOrientationLongitudeOffset) * (Math.PI / 180);

  // Spherical to Cartesian conversion (ISO physics convention)
  // Note: Negative X might be needed to match the model's coordinate system orientation
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi); // Y is vertical (North/South)

  return new Vector3(x, y, z);
};

export function selectClosestPoint(
  pickedPoint: Vector3,
  possibleSelections: { id: string }[],
  positionsMap: Map<string, Vector3>,
  treasholdDistance: number = 0.3
): { id: string; position: Vector3 } | null{

  let closestPoint: { id: string; position: Vector3 } | null = null;
  let minDistance = Infinity;
  possibleSelections.forEach((entity) => {
    const entityPos = positionsMap.get(entity.id);
    if (entityPos) {
      const distance = Vector3.Distance(pickedPoint, entityPos);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = { id: entity.id, position: entityPos };
      }
    }
  });
  
  // Only select if entity is reasonably close (within 0.3 units)
  if (closestPoint && minDistance < treasholdDistance) {
    return closestPoint;
  } else {
    return null;
  }
  // if (closestPoint && minDistance < 0.3) {
  //   setSelectedCompany(closestPoint);
  // } else {
  //   setSelectedCompany(null);
  // }
}

export { latLonToVector3};