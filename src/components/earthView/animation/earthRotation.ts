import { Animation } from "@babylonjs/core/Animations/animation";
import { Animatable } from "@babylonjs/core/Animations/animatable";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Scene } from "@babylonjs/core/scene";

export function setupAnimationEarthRotation(
  earthParent: TransformNode,
  scene: Scene): Animatable {
    
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

  return animatable;
}