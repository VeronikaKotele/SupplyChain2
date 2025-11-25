import { useEffect } from 'react';
import { Vector3, Scene, ArcRotateCamera } from '@babylonjs/core';
import { Animatable } from "@babylonjs/core/Animations/animatable";

export function createCamera(scene: Scene): ArcRotateCamera {
    const camera = new ArcRotateCamera(
        "camera",
        -Math.PI / 2,
        Math.PI / 4,
        5,
        Vector3.Zero(),
        scene
    );    
    camera.lowerRadiusLimit = 1.1;
    camera.upperRadiusLimit = 5;
    camera.wheelPrecision = 50;
    camera.panningSensibility = 0;
    
    // Adjust near clipping plane to allow closer zoom without clipping
    camera.minZ = 0.01; // Default is 0.1, reducing allows closer view
    camera.zoomOnFactor = 0.1; // Zoom speed factor
    
    // Disable camera inertia for zoom
    camera.inertialRadiusOffset = 0;
    camera.useInputToRestoreState = false; // Disable animation when restoring camera state

    return camera;
}

export function setupAnimationPauseOnCameraInput(
    animation: Animatable | null,
    camera: ArcRotateCamera,
    pauseTimeoutRef: React.RefObject<number | null>
) {
    // Pause animation on camera interaction
    camera.onViewMatrixChangedObservable.add(() => {
        if (animation) {
            animation.pause();
            
            // Clear any existing timeout
            if (pauseTimeoutRef.current) {
                clearTimeout(pauseTimeoutRef.current);
            }
            
            // Resume animation after 5 seconds
            pauseTimeoutRef.current = window.setTimeout(() => {
                if (animation) {
                    animation.restart();
                }
            }, 5000);
        }
    });
}