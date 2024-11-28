import * as THREE from "three";
import { generateTerrainFunction, HEIGHT, WIDTH } from "$lib/terraingen";

const MESH_RESOLUTION = 200;
const coordToIndex = (x: number, z: number) => {
  return z * MESH_RESOLUTION + x;
};
export const generateTerrainMesh = (planetName: string) => {
  const terrainFunction = generateTerrainFunction(planetName);

  const vertices: number[] = [];
  for (let z = 0; z < MESH_RESOLUTION; z++) {
    for (let x = 0; x < MESH_RESOLUTION; x++) {
      vertices.push(x);
      vertices.push(
        terrainFunction(
          (x * WIDTH) / MESH_RESOLUTION,
          (z * HEIGHT) / MESH_RESOLUTION
        )
      );
      vertices.push(z);
    }
  }
  const indices: number[] = [];

  for (let z = 0; z < MESH_RESOLUTION - 1; z++) {
    for (let x = 0; x < MESH_RESOLUTION - 1; x++) {
      // First triangle
      indices.push(coordToIndex(x, z));
      indices.push(coordToIndex(x, z + 1));
      indices.push(coordToIndex(x + 1, z));
      // Second triangle
      indices.push(coordToIndex(x, z + 1));
      indices.push(coordToIndex(x + 1, z + 1));
      indices.push(coordToIndex(x + 1, z));
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(vertices), 3)
  );
  geometry.computeVertexNormals();

  const material = new THREE.MeshPhongMaterial({
    color: 0xa2a2a2,
    shininess: 0,
  });
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
};
