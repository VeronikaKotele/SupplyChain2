import {
  Scene,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  Color3,
} from '@babylonjs/core';
import { latLonToVector3 } from '../components/3dMathUtils';
import type { EntityMarker } from '../components/EntityMarker';

/**
 * Creates entity sphere markers with progressive rendering for better performance
 * @param entities - Array of entity markers to render
 * @param scene - Babylon.js scene
 * @param earthRadius - Radius of the Earth mesh
 * @param onProgress - Optional callback for progress updates
 * @returns Cleanup function to cancel rendering
 */
export const createEntityMarkers = (
  entities: EntityMarker[],
  scene: Scene,
  earthRadius: number,
  onProgress?: (current: number, total: number) => void
): { meshes: Mesh[]; cancel: () => void } => {
  if (entities.length === 0) {
    return { meshes: [], cancel: () => {} };
  }

  const meshes: Mesh[] = [];
  const BATCH_SIZE = 50; // Process 50 entities at a time
  let currentIndex = 0;
  let cancelled = false;

  const processBatch = () => {
    if (cancelled) return;

    const endIndex = Math.min(currentIndex + BATCH_SIZE, entities.length);
    const batch = entities.slice(currentIndex, endIndex);

    // Create markers for this batch
    batch.forEach((entity) => {
      const sphere = MeshBuilder.CreateSphere(
        `entity-${entity.id}`,
        { diameter: entity.size || 0.05 },
        scene
      );

      const position = latLonToVector3(
        entity.latitude,
        entity.longitude,
        earthRadius * 1.05 // Slightly above earth surface
      );
      sphere.position = position;

      const markerMat = new StandardMaterial(`mat-${entity.id}`, scene);
      markerMat.diffuseColor = entity.color || new Color3(1, 0, 0);
      markerMat.emissiveColor = entity.color?.scale(0.3) || new Color3(0.3, 0, 0);
      markerMat.specularColor = new Color3(0, 0, 0);
      sphere.material = markerMat;

      meshes.push(sphere);
    });

    currentIndex = endIndex;

    // Report progress
    if (onProgress) {
      onProgress(currentIndex, entities.length);
    }

    // Continue processing if there are more entities
    if (currentIndex < entities.length) {
      requestAnimationFrame(processBatch);
    } else {
      console.log('Created', meshes.length, 'entity markers');
    }
  };

  // Start processing batches
  processBatch();

  // Return cancel function
  return {
    meshes,
    cancel: () => {
      cancelled = true;
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
