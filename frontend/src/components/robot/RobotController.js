import * as THREE from 'three';

class RobotController {
  constructor() {
    // Initialize with Hero configuration so it doesn't flash in the middle of the screen
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    
    if (isMobile) {
      this.targetPosition = new THREE.Vector3(0, 1.8, 0);
      this.targetRotation = new THREE.Vector3(0, 0, 0);
      this.targetScale = 1.2;
    } else {
      this.targetPosition = new THREE.Vector3(6.0, 1, 0);
      this.targetRotation = new THREE.Vector3(0.1, -0.2, 0);
      this.targetScale = 2.0; 
    }
    
    this.mouseTarget = new THREE.Vector2(0, 0);
    this.scrollVelocity = 0;
    this.activeSectionId = 'hero';
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
