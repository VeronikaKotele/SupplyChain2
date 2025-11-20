import { useEffect, useRef } from 'react';
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  SceneLoader,
  Color4,
} from '@babylonjs/core';
import '@babylonjs/loaders/OBJ';

interface EarthViewerProps {
  modelPath: string;
  materialPath?: string;
}

const EarthViewer: React.FC<EarthViewerProps> = ({ modelPath, materialPath }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);

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
    scene.clearColor = new Color4(0.2, 0.25, 0.3, 1.0);
    sceneRef.current = scene;

    // Create camera
    const camera = new ArcRotateCamera(
      'camera',
      Math.PI / 2,
      Math.PI / 2,
      5,
      Vector3.Zero(),
      scene
    );
    camera.attachControl(canvasRef.current, true);
    camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = 10;
    camera.wheelPrecision = 50;

    // Create bright ambient light
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 1.5;

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
          const rootMesh = result.meshes[0];
          
          // Center the model
          const boundingInfo = rootMesh.getHierarchyBoundingVectors();
          const center = boundingInfo.max.add(boundingInfo.min).scale(0.5);
          
          result.meshes.forEach((mesh) => {
            mesh.position.subtractInPlace(center);
          });

          // Scale the model to fit the view
          const size = boundingInfo.max.subtract(boundingInfo.min);
          const maxDimension = Math.max(size.x, size.y, size.z);
          const scaleFactor = 2 / maxDimension;
          
          result.meshes.forEach((mesh) => {
            mesh.scaling = new Vector3(scaleFactor, scaleFactor, scaleFactor);
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
      scene.dispose();
      engine.dispose();
    };
  }, [modelPath, materialPath]);

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
