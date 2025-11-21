import { useEffect, useRef } from 'react';
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  Color4,
  Mesh,
  DirectionalLight,
} from '@babylonjs/core';
import type { EntityMarker } from './EntityMarker';
import type { ConnectionMarker } from './ConnectionMarker';
import { loadEarthModel } from '../utils/meshLoader';
import { createEntityMarkers, disposeEntityMarkers } from '../utils/entityRenderer';
import { createConnectionLines, disposeConnectionLines } from '../utils/connectionRenderer';

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

    // Load the Earth model
    loadEarthModel(modelPath, scene, scale);

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
      disposeEntityMarkers(entityMarkersRef.current);
      disposeConnectionLines(connectionLinesRef.current);
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
    disposeEntityMarkers(entityMarkersRef.current);
    entityMarkersRef.current = [];

    // Create new markers using the utility
    const { meshes, cancel } = createEntityMarkers(
      entities,
      scene,
      earthRadius
    );
    
    entityMarkersRef.current = meshes;

    // Cleanup function to cancel processing if component unmounts or dependencies change
    return () => {
      cancel();
    };
  }, [entities, earthRadius]);

  // Update connection lines when connections prop changes - with progressive rendering
  useEffect(() => {
    if (!sceneRef.current) return;
    if (connections.length === 0) return;
    if (entities.length === 0) return; // Need entities to draw connections

    const scene = sceneRef.current;

    // Clear existing connection lines
    disposeConnectionLines(connectionLinesRef.current);
    connectionLinesRef.current = [];

    // Create new connection lines using the utility
    const { meshes, cancel } = createConnectionLines(
      connections,
      entities,
      scene,
      earthRadius,
      maxConnectionAmount
    );
    
    connectionLinesRef.current = meshes;

    // Cleanup function to cancel processing if component unmounts or dependencies change
    return () => {
      cancel();
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
