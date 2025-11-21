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
import type { LocationMarker } from './LocationMarker';
import type { ConnectionMarker } from './ConnectionMarker';

interface EarthViewerProps {
  modelPath: string;
  materialPath?: string;
  scale?: number;
  locations?: LocationMarker[];
  connections?: ConnectionMarker[];
  earthRadius?: number;
  maxConnectionAmount?: number; // Max amount for scaling line thickness
}

const EarthViewer: React.FC<EarthViewerProps> = ({ 
  modelPath, 
  materialPath,
  scale = 1.0,
  locations = [],
  connections = [],
  earthRadius = 1.0,
  maxConnectionAmount = 100
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const locationMarkersRef = useRef<Mesh[]>([]);
  const connectionLinesRef = useRef<Mesh[]>([]);

  console.log('EarthViewer props:', {locations, connections });

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

              console.log('material configured:', mat.name, 'diffuse:', mat.diffuseColor, 'diffuseTexture:', mat.diffuseTexture);
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
      locationMarkersRef.current.forEach(marker => marker.dispose());
      connectionLinesRef.current.forEach(line => line.dispose());
      scene.dispose();
      engine.dispose();
    };
  }, [modelPath, materialPath, scale, locations, connections, earthRadius, maxConnectionAmount]);

  // Update location markers when locations prop changes
  useEffect(() => {
    if (!sceneRef.current) return;
    if (locations.length === 0) return; // Don't process empty locations array

    const scene = sceneRef.current;

    // Clear existing markers
    locationMarkersRef.current.forEach(marker => marker.dispose());
    locationMarkersRef.current = [];

    // Create new markers
    locations.forEach((location) => {
      const sphere = MeshBuilder.CreateSphere(
        `location-${location.id}`,
        { diameter: location.size || 0.05 },
        scene
      );

      const position = latLonToVector3(
        location.latitude,
        location.longitude,
        earthRadius * 1.05 // Slightly above earth surface
      );
      sphere.position = position;

      const markerMat = new StandardMaterial(`mat-${location.id}`, scene);
      markerMat.diffuseColor = location.color || new Color3(1, 0, 0);
      markerMat.emissiveColor = location.color?.scale(0.3) || new Color3(0.3, 0, 0);
      markerMat.specularColor = new Color3(0, 0, 0);
      sphere.material = markerMat;

      locationMarkersRef.current.push(sphere);
    });

    console.log('Created', locationMarkersRef.current.length, 'location markers');
  }, [locations, earthRadius]);

  // Update connection lines when connections prop changes
  useEffect(() => {
    if (!sceneRef.current) return;
    if (connections.length === 0) return;
    if (locations.length === 0) return; // Need locations to draw connections

    const scene = sceneRef.current;

    // Clear existing connection lines
    connectionLinesRef.current.forEach(line => line.dispose());
    connectionLinesRef.current = [];

    // Create a map of location IDs to their positions
    const locationMap = new Map<string, Vector3>();
    locations.forEach(location => {
      const position = latLonToVector3(
        location.latitude,
        location.longitude,
        earthRadius * 1.05
      );
      locationMap.set(location.id, position);
    });

    // Create connection lines
    connections.forEach((connection) => {
      const fromPos = locationMap.get(connection.id_from);
      const toPos = locationMap.get(connection.id_to);

      if (!fromPos || !toPos) {
        console.warn(`Connection ${connection.order_id}: Missing location ${connection.id_from} or ${connection.id_to}`);
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
        `connection-${connection.order_id}`,
        {
          path: path,
          radius: thickness,
          cap: Mesh.CAP_ALL,
          updatable: false
        },
        scene
      );

      // Create material for the connection line
      const lineMat = new StandardMaterial(`mat-connection-${connection.order_id}`, scene);
      lineMat.diffuseColor = connection.color || new Color3(0, 1, 1); // Cyan by default
      lineMat.emissiveColor = connection.color?.scale(0.5) || new Color3(0, 0.5, 0.5);
      lineMat.specularColor = new Color3(0, 0, 0);
      lineMat.alpha = 0.7; // Slightly transparent
      tube.material = lineMat;

      connectionLinesRef.current.push(tube);
    });

    console.log('Created', connectionLinesRef.current.length, 'connection lines');
  }, [connections, locations, earthRadius, maxConnectionAmount]);

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
