import { useEffect, useRef, useState } from 'react';
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  Color4,
  Mesh,
  DirectionalLight,
  TransformNode,
  Animation,
  LinesMesh,
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
  maxConnectionAmount?: number; // Max amount for scaling line alpha
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
  const earthParentRef = useRef<TransformNode | null>(null);
  const entityMarkersRef = useRef<Mesh[]>([]);
  const entityPositionsRef = useRef<Map<string, Vector3>>(new Map());
  const connectionLinesRef = useRef<LinesMesh[]>([]);
  const animationRef = useRef<any>(null);
  const pauseTimeoutRef = useRef<number | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<EntityMarker | null>(null);

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

    // Create parent node for Earth and all its children (entities, connections)
    const earthParent = new TransformNode('earthParent', scene);
    earthParentRef.current = earthParent;

    // Set up rotation animation for the Earth
    const animFrameRate = 30; // frames per second
    
    const rotationAnimation = new Animation(
      'earthRotation',
      'rotation.y',
      animFrameRate,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const rotationKeys = [
      { frame: 0, value: 0 },
      { frame: animFrameRate * 60, value: Math.PI * 2 } // Full rotation in 60 seconds
    ];

    rotationAnimation.setKeys(rotationKeys);
    earthParent.animations = [rotationAnimation];

    // Start the animation
    const animatable = scene.beginAnimation(earthParent, 0, animFrameRate * 60, true);
    animationRef.current = animatable;

    // Pause animation on camera interaction
    const handleCameraInput = () => {
      if (animationRef.current) {
        animationRef.current.pause();
        
        // Clear any existing timeout
        if (pauseTimeoutRef.current) {
          clearTimeout(pauseTimeoutRef.current);
        }
        
        // Resume animation after 5 seconds
        pauseTimeoutRef.current = window.setTimeout(() => {
          if (animationRef.current) {
            animationRef.current.restart();
          }
        }, 5000);
      }
    };

    camera.onViewMatrixChangedObservable.add(handleCameraInput);

    // Handle clicks on the Earth to select entities
    scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type === 2) { // POINTERDOWN
        const pickResult = scene.pick(scene.pointerX, scene.pointerY);
        
        if (pickResult?.hit && pickResult.pickedPoint) {
          // Find the closest entity to the clicked point
          let closestEntity: EntityMarker | null = null;
          let minDistance = Infinity;
          
          entities.forEach((entity) => {
            const entityPos = entityPositionsRef.current.get(entity.id);
            if (entityPos) {
              const distance = Vector3.Distance(pickResult.pickedPoint!, entityPos);
              if (distance < minDistance) {
                minDistance = distance;
                closestEntity = entity;
              }
            }
          });
          
          // Only select if entity is reasonably close (within 0.3 units)
          if (closestEntity && minDistance < 0.3) {
            setSelectedEntity(closestEntity);
          } else {
            setSelectedEntity(null);
          }
        }
      }
    });

    // Load the Earth model and parent it to earthParent
    loadEarthModel(modelPath, scene, scale, earthParent);

    // Render loop
    engine.runRenderLoop(() => {
      // Update light direction to point FROM camera TO target (toward Earth)
      const cameraDirection = camera.target.subtract(camera.position).normalizeToNew();
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
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
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
    const earthParent = earthParentRef.current;

    // Clear existing markers
    disposeEntityMarkers(entityMarkersRef.current);
    entityMarkersRef.current = [];

    // Create new markers using the utility
    const { meshes, positionsMap, cancel } = createEntityMarkers(
      entities,
      scene,
      earthRadius,
      earthParent || undefined
    );
    
    entityMarkersRef.current = meshes;
    entityPositionsRef.current = positionsMap;

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
    const earthParent = earthParentRef.current;

    // Clear existing connection lines
    disposeConnectionLines(connectionLinesRef.current);
    connectionLinesRef.current = [];

    // Create new connection lines using the utility
    const { meshes, cancel } = createConnectionLines(
      connections,
      entities,
      entityPositionsRef.current,
      scene,
      maxConnectionAmount,
      earthParent || undefined
    );
    
    connectionLinesRef.current = meshes;

    // Cleanup function to cancel processing if component unmounts or dependencies change
    return () => {
      cancel();
    };
  }, [connections, entities, earthRadius, maxConnectionAmount]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          outline: 'none',
        }}
      />
      {selectedEntity && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0, 0, 0, 0.85)',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            minWidth: '250px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Entity Details</h3>
            <button
              onClick={() => setSelectedEntity(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <div><strong>Name:</strong> {selectedEntity.name || 'N/A'}</div>
            {selectedEntity.type && <div><strong>Type:</strong> {selectedEntity.type}</div>}
            {selectedEntity.location_county && <div><strong>Country:</strong> {selectedEntity.location_county}</div>}
            {selectedEntity.location_city && <div><strong>City:</strong> {selectedEntity.location_city}</div>}
            <div><strong>ID:</strong> {selectedEntity.id}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default EarthViewer;
