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
import { latLonToVector3 } from '../utils/math3D';
import type { CompanyMarker } from '../interfaces/CompanyMarker';
import { defaultLocationMarkerSize as defaultSize } from '../utils/styles';

/**
 * Creates entity point markers with constant pixel size (zoom-independent)
 * @param companyMarkers - Array of entity markers to render
 * @param scene - Babylon.js scene
 * @param parentNode - Optional parent node to attach markers to
 * @returns Cleanup function to cancel rendering
 */
export const createCompanyMarkers = (
  companyMarkers: CompanyMarker[],
  scene: Scene,
  parentNode?: TransformNode | Mesh
): { meshes: Mesh[]; cancel: () => void } => {
  if (companyMarkers.length === 0) {
    return { meshes: [], cancel: () => {} };
  }

  const meshes: Mesh[] = [];

  // Create a point cloud system for all companyMarkers
  const pcs = new PointsCloudSystem('entityPoints', defaultSize, scene);
  
  const positions: Vector3[] = [];
  const colors: Color3[] = [];

  // Prepare all entity positions and colors
  companyMarkers.forEach((entity) => {
    positions.push(entity.position);
    colors.push(entity.color || new Color3(0.1, 0.1, 0.1));
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
    console.log('Created', companyMarkers.length, 'entity point markers');
  });

  // Return immediately - points will be created asynchronously
  return {
    meshes,
    cancel: () => {
      // Cancel is not applicable for point cloud system
    },
  };
};

/**
 * Disposes all entity marker meshes
 * @param meshes - Array of meshes to dispose
 */
export const disposeCompanyMarkers = (meshes: Mesh[]): void => {
  meshes.forEach(marker => marker.dispose());
};
