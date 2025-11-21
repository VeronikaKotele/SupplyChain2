import {
  Scene,
  Mesh,
  TransformNode,
  PointsCloudSystem,
  Color3,
  Color4,
  Vector3,
  CloudPoint,
} from '@babylonjs/core';
import { latLonToVector3 } from '../components/3dMathUtils';
import type { EntityMarker } from '../components/EntityMarker';

/**
 * Creates entity point markers with constant pixel size (zoom-independent)
 * @param entities - Array of entity markers to render
 * @param scene - Babylon.js scene
 * @param earthRadius - Radius of the Earth mesh
 * @param parentNode - Optional parent node to attach markers to
 * @returns Cleanup function to cancel rendering
 */
export const createEntityMarkers = (
  entities: EntityMarker[],
  scene: Scene,
  earthRadius: number,
  parentNode?: TransformNode | Mesh
): { meshes: Mesh[]; positionsMap: Map<string, Vector3>; cancel: () => void } => {
  if (entities.length === 0) {
    return { meshes: [], positionsMap: new Map(), cancel: () => {} };
  }

  const meshes: Mesh[] = [];
  const positionsMap: Map<string, Vector3> = new Map();

  // Create a point cloud system for all entities
  const pcs = new PointsCloudSystem('entityPoints', 5, scene); // 5 is point size in pixels
  
  const positions: Vector3[] = [];
  const colors: Color3[] = [];

  // Prepare all entity positions and colors
  entities.forEach((entity) => {
    const position = latLonToVector3(
      entity.latitude,
      entity.longitude,
      earthRadius * 1.07 // Slightly above earth surface
    );
    positions.push(position);
    colors.push(entity.color || new Color3(0.1, 0.1, 0.1));
    positionsMap.set(entity.id, position);
  });

  // Add points to the system
  pcs.addPoints(positions.length, (particle: CloudPoint, i: number) => {
    particle.position = positions[i];
    particle.color = new Color4(colors[i].r, colors[i].g, colors[i].b, 1.0);
  });

  // Build the mesh asynchronously
  pcs.buildMeshAsync().then((mesh) => {
    // Parent the points mesh if parent node is provided
    if (parentNode) {
      mesh.parent = parentNode;
    }
    meshes.push(mesh);
    console.log('Created', entities.length, 'entity point markers');
  });

  // Return immediately - points will be created asynchronously
  return {
    meshes,
    positionsMap: positionsMap,
    cancel: () => {
      // Cancel is not applicable for point cloud system
    },
  };
};

/**
 * Disposes all entity marker meshes
 * @param meshes - Array of meshes to dispose
 */
export const disposeEntityMarkers = (meshes: Mesh[]): void => {
  meshes.forEach(marker => marker.dispose());
};
