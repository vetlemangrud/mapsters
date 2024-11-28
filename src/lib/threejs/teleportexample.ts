import * as THREE from "three";

import { VRButton } from "three/addons/webxr/VRButton.js";
import { XRControllerModelFactory } from "three/addons/webxr/XRControllerModelFactory.js";
import { generateTerrainMesh } from "./createTerrainMesh";

let camera: THREE.Camera,
  scene: THREE.Scene,
  raycaster: THREE.Raycaster,
  renderer: THREE.Renderer;
let controller1: THREE.XRTargetRaySpace, controller2: THREE.XRTargetRaySpace;
let controllerGrip1, controllerGrip2;

// let marker;
let compass;
let terrain, baseReferenceSpace;

let INTERSECTION;
const tempMatrix = new THREE.Matrix4();

function getHeightAtPoint(x: number, z: number, terrainMesh: THREE.Mesh) {
  // Thnx Claude
  const raycaster = new THREE.Raycaster();
  const direction = new THREE.Vector3(0, -1, 0); // Ray pointing down
  // Position ray high above the terrain
  const startPosition = new THREE.Vector3(x, 1000, z);
  raycaster.set(startPosition, direction);

  // Check for intersection with terrain
  const intersects = raycaster.intersectObject(terrainMesh);

  if (intersects.length > 0) {
    return intersects[0].point.y;
  }
  return null; // No intersection found
}

export function initTeleportExample(parent: HTMLElement, planetName: string) {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  // Create a glowing sun sphere
  const sunGeometry = new THREE.SphereGeometry(50, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    emissive: 0xffff00,
    emissiveIntensity: 1,
  });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sun.position.set(100, 400, 100); // Position the sun
  scene.add(sun);
  scene.fog = new THREE.Fog(0x87ceeb, 200, 1000);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Lower intensity for better contrast
  scene.add(ambientLight);

  // Complement it with hemisphere light for more natural lighting
  const hemisphereLight = new THREE.HemisphereLight(
    0xffffff, // Sky color
    0xb97a20, // Ground color
    0.5 // Intensity
  );
  scene.add(hemisphereLight);

  // Add directional light for sun rays
  const sunlight = new THREE.DirectionalLight(0xffffff, 1);
  sunlight.position.copy(sun.position);
  scene.add(sunlight);

  // Optional: Add shadows
  sunlight.castShadow = true;
  sunlight.shadow.bias = -0.0001; // Reduce shadow acne
  sunlight.shadow.normalBias = 0.1; // Help with self-shadowing artifacts
  sunlight.shadow.mapSize.width = 2048;
  sunlight.shadow.mapSize.height = 2048;
  sunlight.shadow.camera.near = 0.5;
  sunlight.shadow.camera.far = 500;

  // marker = new THREE.Mesh(
  //   new THREE.CircleGeometry(0.25, 32).rotateX(-Math.PI / 2),
  //   new THREE.MeshBasicMaterial({ color: 0xbcbcbc })
  // );
  // scene.add(marker);
  compass = new THREE.Mesh(
    new THREE.CircleGeometry(0.1, 20).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xbcbcbc })
  );

  const arrowGeometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    0,
    0.08,
    0, // tip of arrow
    -0.02,
    0,
    0, // left base
    0.02,
    0,
    0, // right base
  ]);
  arrowGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(vertices, 3)
  );

  const northMarker = new THREE.Mesh(
    arrowGeometry,
    new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide })
  );

  // Position the marker above the compass base to avoid z-fighting
  northMarker.position.y = 0.001;
  northMarker.rotateX(Math.PI / 2);
  northMarker.rotateZ(Math.PI);

  // Add the marker to the compass
  compass.add(northMarker);
  scene.add(compass);

  terrain = generateTerrainMesh(planetName);
  terrain.position.x = -100;
  terrain.position.z = -100;
  terrain.position.y = -(getHeightAtPoint(0, 0, terrain) ?? 0);
  terrain.receiveShadow = true;

  terrain.castShadow = true;
  scene.add(terrain);

  raycaster = new THREE.Raycaster();
  raycaster.far = 20;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);

  renderer.xr.addEventListener(
    "sessionstart",
    () => (baseReferenceSpace = renderer.xr.getReferenceSpace())
  );
  renderer.xr.enabled = true;

  parent.appendChild(renderer.domElement);
  parent.appendChild(VRButton.createButton(renderer));

  // controllers

  function onSelectStart() {
    this.userData.isSelecting = true;
  }

  function onSelectEnd() {
    this.userData.isSelecting = false;

    if (INTERSECTION) {
      const offsetPosition = {
        x: -INTERSECTION.x,
        y: -INTERSECTION.y,
        z: -INTERSECTION.z,
        w: 1,
      };
      const offsetRotation = new THREE.Quaternion();
      const transform = new XRRigidTransform(offsetPosition, offsetRotation);
      const teleportSpaceOffset =
        baseReferenceSpace.getOffsetReferenceSpace(transform);

      renderer.xr.setReferenceSpace(teleportSpaceOffset);
    }
  }

  controller1 = renderer.xr.getController(0);
  controller1.addEventListener("selectstart", onSelectStart);
  controller1.addEventListener("selectend", onSelectEnd);
  controller1.addEventListener("connected", function (event) {
    this.add(buildController(event.data));
  });
  controller1.addEventListener("disconnected", function () {
    this.remove(this.children[0]);
  });
  scene.add(controller1);

  controller2 = renderer.xr.getController(1);
  controller2.addEventListener("selectstart", onSelectStart);
  controller2.addEventListener("selectend", onSelectEnd);
  controller2.addEventListener("connected", function (event) {
    this.add(buildController(event.data));
  });
  controller2.addEventListener("disconnected", function () {
    this.remove(this.children[0]);
  });
  scene.add(controller2);

  // The XRControllerModelFactory will automatically fetch controller models
  // that match what the user is holding as closely as possible. The models
  // should be attached to the object returned from getControllerGrip in
  // order to match the orientation of the held device.

  const controllerModelFactory = new XRControllerModelFactory();

  controllerGrip1 = renderer.xr.getControllerGrip(0);
  controllerGrip1.add(
    controllerModelFactory.createControllerModel(controllerGrip1)
  );
  scene.add(controllerGrip1);

  controllerGrip2 = renderer.xr.getControllerGrip(1);
  controllerGrip2.add(
    controllerModelFactory.createControllerModel(controllerGrip2)
  );
  scene.add(controllerGrip2);

  //

  window.addEventListener("resize", onWindowResize, false);
  onWindowResize();
}

function buildController(data) {
  let geometry, material;

  switch (data.targetRayMode) {
    case "tracked-pointer":
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3)
      );
      geometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3)
      );

      material = new THREE.LineBasicMaterial({
        vertexColors: true,
        blending: THREE.AdditiveBlending,
      });

      return new THREE.Line(geometry, material);

    case "gaze":
      geometry = new THREE.RingGeometry(0.02, 0.04, 32).translate(0, 0, -1);
      material = new THREE.MeshBasicMaterial({
        opacity: 0.5,
        transparent: true,
      });
      return new THREE.Mesh(geometry, material);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

//

function animate() {
  // Teleport target
  INTERSECTION = undefined;

  if (controller1.userData.isSelecting === true) {
    tempMatrix.identity().extractRotation(controller1.matrixWorld);

    raycaster.ray.origin.setFromMatrixPosition(controller1.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    const intersects = raycaster.intersectObject(terrain);

    if (intersects.length > 0) {
      INTERSECTION = intersects[0].point;
    }
  } else if (controller2.userData.isSelecting === true) {
    tempMatrix.identity().extractRotation(controller2.matrixWorld);

    raycaster.ray.origin.setFromMatrixPosition(controller2.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    const intersects = raycaster.intersectObject(terrain);

    if (intersects.length > 0) {
      INTERSECTION = intersects[0].point;
    }
  }

  // Compass
  const tempPosition = new THREE.Vector3();
  const tempQuaternion = new THREE.Quaternion();
  const tempScale = new THREE.Vector3();
  controller1.matrixWorld.decompose(tempPosition, tempQuaternion, tempScale);

  // Position compass above controller
  compass.position.copy(tempPosition);
  compass.position.y += 0.05; // Adjust this value to change how high above the controller it floats

  // if (INTERSECTION) {
  //   marker.position.copy(INTERSECTION);
  //   // Create a rotation matrix from the normal
  //   const normalMatrix = new THREE.Matrix4();
  //   const up = new THREE.Vector3(0, 1, 0);

  //   // Calculate rotation from up vector to normal
  //   normalMatrix.lookAt(new THREE.Vector3(), intersection.face.normal, up);

  //   // Apply rotation to marker
  //   marker.setRotationFromMatrix(normalMatrix);
  // }

  // marker.visible = INTERSECTION !== undefined;

  renderer.render(scene, camera);
}
