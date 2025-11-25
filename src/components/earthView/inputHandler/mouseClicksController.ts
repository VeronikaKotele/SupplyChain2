import { useEffect, useRef } from 'react';
import { Scene, Vector3 } from '@babylonjs/core';

export function useScenePickerWhenNoDragging(
  sceneRef: React.RefObject<Scene | null>,
  selectionHandler: (pickedPoint: Vector3) => void
) {
  const pointerDownRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const hasDraggedRef = useRef(false);
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Handle clicks on the Earth to select entities
    // Track pointer down/move/up to distinguish clicks from drags
    scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type === 1) { // POINTERDOWN
        pointerDownRef.current = {
          x: scene.pointerX,
          y: scene.pointerY,
          time: Date.now()
        };
        hasDraggedRef.current = false;
      } else if (pointerInfo.type === 4) { // POINTERMOVE
        if (pointerDownRef.current) {
          const dx = scene.pointerX - pointerDownRef.current.x;
          const dy = scene.pointerY - pointerDownRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          // If moved more than 5 pixels, consider it a drag
          if (distance > 5) {
            hasDraggedRef.current = true;
          }
        }
      } else if (pointerInfo.type === 2) { // POINTERUP
        // Only process click if there was no drag
        if (pointerDownRef.current && !hasDraggedRef.current) {
          const pickResult = scene.pick(scene.pointerX, scene.pointerY);
          
          if (pickResult?.hit && pickResult.pickedPoint) {
            selectionHandler(pickResult.pickedPoint);
          }
        }
        pointerDownRef.current = null;
        hasDraggedRef.current = false;
      }
    });
  }, [sceneRef, selectionHandler]);
}