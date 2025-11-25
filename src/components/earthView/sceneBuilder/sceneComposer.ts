import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  Color4,
  DirectionalLight,
  TransformNode,
} from '@babylonjs/core';
import { createCamera, setupAnimationPauseOnCameraInput } from './../inputHandler/cameraController';
import { setupAnimationEarthRotation } from './../animation/earthRotation';
import { loadEarthModel } from '../utils/meshLoader';

// create the earth mesh and scene
export function useSceneComposer(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  engineRef: React.RefObject<Engine | null>,
  sceneRef: React.RefObject<Scene | null>,
  cameraRef: React.RefObject<ArcRotateCamera | null>,
  earthParentRef: React.RefObject<TransformNode | null>,
  animationRef: React.RefObject<any>,
  pauseTimeoutRef: React.RefObject<number | null>,
  earthModelProps: {
    modelPath: string;
    applyScale: number;
  }
) {
  if (!canvasRef.current) return;

  // Create engine
  const engine = new Engine(canvasRef.current, true, {
    preserveDrawingBuffer: true,
    stencil: true,
  });
  engineRef.current = engine;

  // Create scene
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0, 0, 0, 0.1);
  sceneRef.current = scene;

  // Create camera
  const camera = createCamera(scene);
  camera.attachControl(canvasRef.current, true);
  cameraRef.current = camera;

  // Create lights
  const hemisphericLight = new HemisphericLight(
    "light1",
    new Vector3(5, 0, -5),
    scene
  );
  hemisphericLight.intensity = 2;

  const directionalLight = new DirectionalLight(
    "light2",
    new Vector3(-1, -2, -1),
    scene
  );
  directionalLight.intensity = 5;
  const updateDirectionByCamera = () => {
    // Update light direction to point FROM camera TO target (toward Earth)
    const cameraDirection = camera.target.subtract(camera.position).normalizeToNew();
    directionalLight.direction = cameraDirection;
  }
  
  // Create parent node for Earth and all its children (entities, connections)
  const earthParent = new TransformNode('earthParent', scene);
  earthParentRef.current = earthParent;

  const animation = setupAnimationEarthRotation(earthParent, scene);
  animationRef.current = animation;
  setupAnimationPauseOnCameraInput(animation, camera, pauseTimeoutRef);

  // Load the Earth model and parent it to earthParent
  loadEarthModel(earthModelProps.modelPath, scene, earthModelProps.applyScale, earthParent);

  // Render loop
  engine.runRenderLoop(() => {
    updateDirectionByCamera();
    scene.render();
  });

  // Handle window resize
  const handleResize = () => {
    engine.resize();
  };
  window.addEventListener('resize', handleResize);

  // Cleanup
  return () => {
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    window.removeEventListener('resize', handleResize);
    scene.dispose();
    engine.dispose();
  };
}

export function createLights(scene: Scene) {
  // Create lights
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
    light2.intensity = 5;

    return { hemisphericLight: light1, directionalLight: light2 };
}