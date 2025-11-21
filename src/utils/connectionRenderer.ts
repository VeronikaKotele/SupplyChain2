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
  positionsMap: Map<string, Vector3>,
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

  const BATCH_SIZE = 50;
  let currentIndex = 0;
  let cancelled = false;

  const processBatch = () => {
    if (cancelled) return;

    const endIndex = Math.min(currentIndex + BATCH_SIZE, connections.length);
    const batch = connections.slice(currentIndex, endIndex);

    // Create connection lines for this batch
    batch.forEach((connection) => {
      const fromPos = positionsMap.get(connection.id_from);
      const toPos = positionsMap.get(connection.id_to);

      if (!fromPos || !toPos) {
        return;
      }

      // Start from entity positions directly (points have no physical size)
      const fromPeak = fromPos;
      const toPeak = toPos;

      // Create a curved arc path that follows the sphere's surface
      // Use great circle interpolation with extra height for visibility
      const path: Vector3[] = [];
      const segments = 30; // Segments for smooth curve
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        
        // Spherical linear interpolation (slerp) for points on sphere surface
        // This naturally follows the Earth's curvature
        const angle = Math.acos(Vector3.Dot(fromPeak.normalizeToNew(), toPeak.normalizeToNew()));
        const sinAngle = Math.sin(angle);
        
        let pos: Vector3;
        if (sinAngle > 0.001) {
          // Use slerp for proper spherical interpolation
          const ratioA = Math.sin((1 - t) * angle) / sinAngle;
          const ratioB = Math.sin(t * angle) / sinAngle;
          pos = fromPeak.scale(ratioA).add(toPeak.scale(ratioB));
        } else {
          // Points are very close or opposite, use linear interpolation
          pos = Vector3.Lerp(fromPeak, toPeak, t);
        }
        
        // Add extra height for visibility (slightly above the natural curve)
        const distance = Vector3.Distance(fromPeak, toPeak);
        const heightBoost = distance * 0.08; // 8% of distance as extra height
        const heightFactor = Math.sin(t * Math.PI); // Peaks at middle (t=0.5)
        pos = pos.normalizeToNew().scale(pos.length() + heightBoost * heightFactor);
        
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
