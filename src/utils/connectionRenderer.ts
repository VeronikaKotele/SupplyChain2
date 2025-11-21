import {
  Scene,
  Mesh,
  MeshBuilder,
  Color3,
  Vector3,
  TransformNode,
  LinesMesh,
} from '@babylonjs/core';
import { latLonToVector3 } from '../components/3dMathUtils';
import type { EntityMarker } from '../components/EntityMarker';
import type { ConnectionMarker } from '../components/ConnectionMarker';

/**
 * Creates connection line meshes with curved arcs and progressive rendering
 * @param connections - Array of connection markers to render
 * @param entities - Array of entity markers (needed for position mapping)
 * @param scene - Babylon.js scene
 * @param earthRadius - Radius of the Earth mesh
 * @param maxConnectionAmount - Maximum connection amount for thickness scaling
 * @param parentNode - Optional parent node to attach connection lines to
 * @param onProgress - Optional callback for progress updates
 * @returns Cleanup function to cancel rendering
 */
export const createConnectionLines = (
  connections: ConnectionMarker[],
  entities: EntityMarker[],
  scene: Scene,
  earthRadius: number,
  maxConnectionAmount: number,
  parentNode?: TransformNode | Mesh,
  onProgress?: (current: number, total: number) => void
): { meshes: LinesMesh[]; cancel: () => void } => {
  if (connections.length === 0 || entities.length === 0) {
    return { meshes: [], cancel: () => {} };
  }

  const meshes: LinesMesh[] = [];

  // Create a map of entity IDs to their positions
  const entityMap = new Map<string, Vector3>();
  entities.forEach(entity => {
    const position = latLonToVector3(
      entity.latitude,
      entity.longitude,
      earthRadius * 1.05
    );
    entityMap.set(entity.id, position);
  });

  const BATCH_SIZE = 50; // Lines are simpler than tubes, can process more at once
  let currentIndex = 0;
  let cancelled = false;

  const processBatch = () => {
    if (cancelled) return;

    const endIndex = Math.min(currentIndex + BATCH_SIZE, connections.length);
    const batch = connections.slice(currentIndex, endIndex);

    // Create connection lines for this batch
    batch.forEach((connection) => {
      const fromPos = entityMap.get(connection.id_from);
      const toPos = entityMap.get(connection.id_to);

      if (!fromPos || !toPos) {
        return;
      }

      // Create a curved arc path
      // Calculate midpoint and add height for arc effect
      const midPoint = Vector3.Lerp(fromPos, toPos, 0.5);
      const distance = Vector3.Distance(fromPos, toPos);
      const arcHeight = distance * 0.35; // Arc height is 35% of distance
      const arcPoint = midPoint.add(midPoint.normalize().scale(arcHeight));

      // Create path for the line (bezier curve approximation)
      const path: Vector3[] = [];
      const segments = 30; // Segments for smooth curve
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        // Quadratic bezier: (1-t)²P0 + 2(1-t)tP1 + t²P2
        const pos = fromPos.scale((1 - t) * (1 - t))
          .add(arcPoint.scale(2 * (1 - t) * t))
          .add(toPos.scale(t * t));
        path.push(pos);
      }

      // Create line mesh using CreateLines
      const line = MeshBuilder.CreateLines(
        `connection-${connection.flow_id}`,
        {
          points: path,
          updatable: false
        },
        scene
      );

      // Parent the line if parent node is provided
      if (parentNode) {
        line.parent = parentNode;
      }

      // Set line color and alpha based on connection amount
      const lineColor = connection.color || new Color3(0, 1, 1); // Cyan by default
      line.color = lineColor;
      
      // Vary alpha based on connection amount (0.3 to 0.9 range)
      const normalizedAmount = connection.amount / maxConnectionAmount;
      line.alpha = 0.3 + (normalizedAmount * 0.6); // More prominent for higher amounts

      meshes.push(line);
    });

    currentIndex = endIndex;

    // Report progress
    if (onProgress) {
      onProgress(currentIndex, connections.length);
    }

    // Continue processing if there are more connections
    if (currentIndex < connections.length) {
      requestAnimationFrame(processBatch);
    } else {
      console.log('Created', meshes.length, 'connection lines');
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
 * Disposes all connection line meshes
 * @param meshes - Array of line meshes to dispose
 */
export const disposeConnectionLines = (meshes: LinesMesh[]): void => {
  meshes.forEach(line => line.dispose());
};
