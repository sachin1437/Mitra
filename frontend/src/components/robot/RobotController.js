import * as THREE from 'three';

class RobotController {
  constructor() {
    this.targetPosition = new THREE.Vector3(0, 0, 0);
    this.targetRotation = new THREE.Vector3(0, 0, 0);
    this.targetScale = 1;
    
    this.mouseTarget = new THREE.Vector2(0, 0);
    this.scrollVelocity = 0;
    this.activeSectionId = null;
  }

  setTarget(config, id) {
    if (id) this.activeSectionId = id;
    if (config.position) {
      this.targetPosition.set(config.position[0], config.position[1], config.position[2] || 0);
    }
    if (config.rotation) {
      this.targetRotation.set(config.rotation[0], config.rotation[1], config.rotation[2] || 0);
    }
    if (config.scale !== undefined) {
      this.targetScale = config.scale;
    }
  }

  updateMouse(x, y) {
    this.mouseTarget.set(x, y);
  }
}

export const globalRobotController = new RobotController();
