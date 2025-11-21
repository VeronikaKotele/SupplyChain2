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
import {latLonToVector3} from './3dMathUtils';

export interface LocationMarker {
  id: string;
  latitude: number;
  longitude: number;
  name?: string;
  color?: Color3;
  size?: number;
}

interface EarthViewerProps {
  modelPath: string;
  materialPath?: string;
  scale?: number;
  locations?: LocationMarker[];
  earthRadius?: number;
}

const EarthViewer: React.FC<EarthViewerProps> = ({ 
  modelPath, 
  materialPath,
  scale = 1.0,
  locations = [],
  earthRadius = 1.0
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const locationMarkersRef = useRef<Mesh[]>([]);

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

    // Create location markers
    const createLocationMarkers = () => {
      // Clear existing markers
      locationMarkersRef.current.forEach(marker => marker.dispose());
      locationMarkersRef.current = [];

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

        // Create material for the marker
        const markerMat = new StandardMaterial(`mat-${location.id}`, scene);
        markerMat.diffuseColor = location.color || new Color3(1, 0, 0);
        markerMat.emissiveColor = location.color?.scale(0.3) || new Color3(0.3, 0, 0);
        markerMat.specularColor = new Color3(0, 0, 0);
        sphere.material = markerMat;

        locationMarkersRef.current.push(sphere);
      });
    };

    // Create markers after a short delay to ensure earth is loaded
    setTimeout(createLocationMarkers, 500);

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
      scene.dispose();
      engine.dispose();
    };
  }, [modelPath, materialPath]);

  // Update location markers when locations prop changes
  useEffect(() => {
    if (!sceneRef.current) return;

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
        earthRadius * 1.02 // Slightly above earth surface
      );
      sphere.position = position;

      const markerMat = new StandardMaterial(`mat-${location.id}`, scene);
      markerMat.diffuseColor = location.color || new Color3(1, 0, 0);
      markerMat.emissiveColor = location.color?.scale(0.3) || new Color3(0.3, 0, 0);
      markerMat.specularColor = new Color3(0, 0, 0);
      sphere.material = markerMat;

      locationMarkersRef.current.push(sphere);
    });
  }, [locations, earthRadius]);

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
