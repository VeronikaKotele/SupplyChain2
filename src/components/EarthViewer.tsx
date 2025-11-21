import { useEffect, useRef } from 'react';
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
  DirectionalLight,
} from '@babylonjs/core';
import '@babylonjs/loaders/OBJ';
import { latLonToVector3 } from './3dMathUtils';
import type { EntityMarker } from './EntityMarker';
import type { ConnectionMarker } from './ConnectionMarker';

interface EarthViewerProps {
  modelPath: string;
  materialPath?: string;
  scale?: number;
  entities?: EntityMarker[];
  connections?: ConnectionMarker[];
  earthRadius?: number;
  maxConnectionAmount?: number; // Max amount for scaling line thickness
}

const EarthViewer: React.FC<EarthViewerProps> = ({ 
  modelPath, 
  materialPath,
  scale = 1.0,
  entities = [],
  connections = [],
  earthRadius = 1.0,
  maxConnectionAmount = 100
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const entityMarkersRef = useRef<Mesh[]>([]);
  const connectionLinesRef = useRef<Mesh[]>([]);

  console.log('EarthViewer props:', {entities, connections });

  // create the earth mesh and scene
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create engine
    const engine = new Engine(canvasRef.current, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });
    engineRef.current = engine;

    // Create scene
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.2, 0.2, 0.2, 1);
    sceneRef.current = scene;

    // Camera
    const camera = new ArcRotateCamera(
        "camera",
        -Math.PI / 2,
        Math.PI / 4,
        5,
        Vector3.Zero(),
        scene
    );
    camera.attachControl(canvasRef.current, true);
    camera.lowerRadiusLimit = 2.1;
    camera.upperRadiusLimit = 5;
    camera.wheelPrecision = 50;
    camera.panningSensibility = 0;

    const light1 = new HemisphericLight(
        "light1",
        new Vector3(5, 0, -5),
        scene
    );
    light1.intensity = 2;

    const light2 = new DirectionalLight(
        "light2",
        new Vector3(-1, -2, -1),
        scene
    );
    light2.intensity = 1.5;

    // Load the model
    const loadModel = async () => {
      try {
        const result = await SceneLoader.ImportMeshAsync(
          '',
          '',
          modelPath,
          scene,
          undefined,
          '.obj'
        );

        if (result.meshes.length > 0) {
          result.meshes.forEach((mesh) => {

            if (mesh instanceof Mesh) {
                mesh.flipFaces(true); // Actually invert the geometry normals
            }

            // Apply scale to the mesh
            if (!mesh.scaling)
                mesh.scaling = new Vector3(scale, scale, scale);
            else
                mesh.scaling = mesh.scaling.scale(scale);

            if (mesh.material) {
              const mat = mesh.material as StandardMaterial;
              
              // Remove emissive color - this makes material ignore lighting!
              mat.emissiveColor = new Color3(0, 0, 0);
              
              // Set specular to low/zero for matte appearance
              mat.specularColor = new Color3(0.1, 0.1, 0.1);
              mat.specularPower = 2;
              
              // Ambient should be subtle - too high will wash out lighting
              mat.ambientColor = new Color3(0.2, 0.2, 0.2);
              
              mat.cullBackFaces = false; // Disable back-face culling
              
              // mat.transparencyMode = StandardMaterial.MATERIAL_ALPHABLEND;
              // mat.alpha = 0.8; // Set transparency level
            }
          });

          console.log('Model loaded successfully');
        }
      } catch (error) {
        console.error('Error loading model:', error);
      }
    };

    loadModel();

    // Render loop
    engine.runRenderLoop(() => {
      // Update light direction to point FROM camera TO target (toward Earth)
      const cameraDirection = camera.target.subtract(camera.position).normalize();
      light1.direction = cameraDirection;
      scene.render();
    });

    // Handle window resize
    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      entityMarkersRef.current.forEach(marker => marker.dispose());
      connectionLinesRef.current.forEach(line => line.dispose());
      scene.dispose();
      engine.dispose();
    };
  }, [modelPath, materialPath, scale, entities, connections, earthRadius, maxConnectionAmount]);

  // Update entity markers when entities prop changes - with progressive rendering
  useEffect(() => {
    if (!sceneRef.current) return;
    if (entities.length === 0) return; // Don't process empty entities array

    const scene = sceneRef.current;

    // Clear existing markers
    entityMarkersRef.current.forEach(marker => marker.dispose());
    entityMarkersRef.current = [];

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

        entityMarkersRef.current.push(sphere);
      });

      currentIndex = endIndex;

      // Continue processing if there are more entities
      if (currentIndex < entities.length) {
        requestAnimationFrame(processBatch);
      } else {
        console.log('Created', entityMarkersRef.current.length, 'entity markers');
      }
    };

    // Start processing batches
    processBatch();

    // Cleanup function to cancel processing if component unmounts or dependencies change
    return () => {
      cancelled = true;
    };
  }, [entities, earthRadius]);

  // Update connection lines when connections prop changes - with progressive rendering
  useEffect(() => {
    if (!sceneRef.current) return;
    if (connections.length === 0) return;
    if (entities.length === 0) return; // Need entities to draw connections

    const scene = sceneRef.current;

    // Clear existing connection lines
    connectionLinesRef.current.forEach(line => line.dispose());
    connectionLinesRef.current = [];

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

    const BATCH_SIZE = 20; // Process 20 connections at a time (connections are more complex than entities)
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
          if (!fromPos) {
            //console.warn(`Connection ${connection.flow_id}: Missing entity 'id_from': ${connection.id_from}`);
          }
          if (!toPos) {
            //console.warn(`Connection ${connection.flow_id}: Missing entity 'id_to': ${connection.id_to}`);
          }
          return;
        }

        // Calculate line thickness based on amount (normalized to 0.001 - 0.02 range)
        const normalizedAmount = connection.amount / maxConnectionAmount;
        const thickness = 0.001 + (normalizedAmount * 0.019); // Min 0.001, max 0.02

        // Create a tube connecting the two points with a curved arc
        // Calculate midpoint and add height for arc effect
        const midPoint = Vector3.Lerp(fromPos, toPos, 0.5);
        const distance = Vector3.Distance(fromPos, toPos);
        const arcHeight = distance * 0.35; // Arc height is 35% of distance (increased for more curve)
        const arcPoint = midPoint.add(midPoint.normalize().scale(arcHeight));

        // Create path for the tube (bezier curve approximation)
        const path: Vector3[] = [];
        const segments = 40; // More segments for smoother curve
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          // Quadratic bezier: (1-t)²P0 + 2(1-t)tP1 + t²P2
          const pos = fromPos.scale((1 - t) * (1 - t))
            .add(arcPoint.scale(2 * (1 - t) * t))
            .add(toPos.scale(t * t));
          path.push(pos);
        }

        // Create tube mesh
        const tube = MeshBuilder.CreateTube(
          `connection-${connection.flow_id}`,
          {
            path: path,
            radius: thickness,
            cap: Mesh.CAP_ALL,
            updatable: false
          },
          scene
        );

        // Create material for the connection line
        const lineMat = new StandardMaterial(`mat-connection-${connection.flow_id}`, scene);
        lineMat.diffuseColor = connection.color || new Color3(0, 1, 1); // Cyan by default
        lineMat.emissiveColor = connection.color?.scale(0.5) || new Color3(0, 0.5, 0.5);
        lineMat.specularColor = new Color3(0, 0, 0);
        lineMat.alpha = 0.7; // Slightly transparent
        tube.material = lineMat;

        connectionLinesRef.current.push(tube);
      });

      currentIndex = endIndex;

      // Continue processing if there are more connections
      if (currentIndex < connections.length) {
        requestAnimationFrame(processBatch);
      } else {
        console.log('Created', connectionLinesRef.current.length, 'connection lines');
      }
    };

    // Start processing batches
    processBatch();

    // Cleanup function to cancel processing if component unmounts or dependencies change
    return () => {
      cancelled = true;
    };
  }, [connections, entities, earthRadius, maxConnectionAmount]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        outline: 'none',
      }}
    />
  );
};

export default EarthViewer;
