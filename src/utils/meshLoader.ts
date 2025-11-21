import {
  Scene,
  SceneLoader,
  Vector3,
  StandardMaterial,
  Color3,
  Mesh,
} from '@babylonjs/core';
import '@babylonjs/loaders/OBJ';

/**
 * Loads the Earth model from an OBJ file
 * @param modelPath - Path to the OBJ model file
 * @param scene - Babylon.js scene
 * @param scale - Scale factor for the model (default: 1.0)
 */
export const loadEarthModel = async (
  modelPath: string,
  scene: Scene,
  scale: number = 1.0
): Promise<void> => {
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
        if (!mesh.scaling) {
          mesh.scaling = new Vector3(scale, scale, scale);
        } else {
          mesh.scaling = mesh.scaling.scale(scale);
        }

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
        }
      });

      console.log('Model loaded successfully');
    }
  } catch (error) {
    console.error('Error loading model:', error);
  }
};
