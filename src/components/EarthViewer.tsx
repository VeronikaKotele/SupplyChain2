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
} from '@babylonjs/core';
import '@babylonjs/loaders/OBJ';

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
  locations?: LocationMarker[];
  earthRadius?: number;
}

const EarthViewer: React.FC<EarthViewerProps> = ({ 
  modelPath, 
  materialPath, 
  locations = [],
  earthRadius = 1.0
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const locationMarkersRef = useRef<Mesh[]>([]);

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
    //camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = 10;
    camera.wheelPrecision = 50;
    camera.panningSensibility = 0;

    const light1 = new HemisphericLight(
        "light1",
        new Vector3(5, 0, 5),
        scene
    );
    light1.intensity = 1.5;

    const light2 = new HemisphericLight(
        "light2",
        new Vector3(0, 5, 0),
        scene
    );
    light2.intensity = 1.5;

    // Load the model
    const loadModel = async () => {
      let modelSize;
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
            console.log('mesh:', mesh.name);

            // Modify material to reduce specular highlights (make it matte/opaque)
            if (mesh.material) {
              const mat = mesh.material as StandardMaterial;

              // Remove specular highlights (shiny reflections)
              mat.specularColor = new Color3(0, 0, 0); // No specular reflection
              mat.specularPower = 0; // No shininess
              
              // Remove reflections
              mat.reflectionTexture = null;
              
              // Increase ambient to brighten without reflections
              if (mat.diffuseColor) {
                mat.ambientColor = mat.diffuseColor.clone();
              }

              // Flip normals for specific mesh with wrong orientation
              if (mesh.name !== "Icosphere" && mesh instanceof Mesh) {
                mesh.scaling = new Vector3(0.99, 0.99, 0.99);
                mesh.flipFaces(true); // Actually invert the geometry normals
              }
              if (mesh.name === "mesh_mm1" && mesh instanceof Mesh) {
                mat.diffuseColor = mat.diffuseColor.multiplyByFloats(0.3, 0.3, 0.3); // Make this mesh darker
              }
            }
          });

          console.log('Model loaded successfully');
        }
      } catch (error) {
        console.error('Error loading model:', error);
      }

      return modelSize;
    };

    loadModel();

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
    const latLonToVector3 = (lat: number, lon: number, radius: number): Vector3 => {
      // Convert latitude to phi (polar angle from North Pole)
      // At lat=90° (North): phi=0°, at lat=0° (Equator): phi=90°, at lat=-90° (South): phi=180°
      const phi = (90 - lat) * (Math.PI / 180);
      
      // Convert longitude to theta (azimuthal angle)
      // Adding 90° to align with the model's orientation (adjust if markers still misaligned)
      // Original formula used +180°, but model requires +90° for correct alignment
      const theta = (lon - 90) * (Math.PI / 180);

      // Spherical to Cartesian conversion (ISO physics convention)
      // Note: Negative X might be needed to match the model's coordinate system orientation
      const x = +(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi); // Y is vertical (North/South)

      return new Vector3(x, y, z);
    };

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

    // Same conversion function as above - see detailed comments in main useEffect
    const latLonToVector3 = (lat: number, lon: number, radius: number): Vector3 => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 90) * (Math.PI / 180);

      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);

      return new Vector3(x, y, z);
    };

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
