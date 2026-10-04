// 3D Conflict Visualization
class ConflictVisual {
  constructor(scene) {
    this.scene = scene;
    this.conflictActive = false;
    this.conflictNodes = [];
    this.streamLines = [];
  }

  showConflict() {
    if (this.conflictActive) return;
    
    this.conflictActive = true;
    
    // Create two user nodes approaching a task
    const userANode = this.scene.createNode(-10, 0, 0, 1.5, '#6366f1');
    const userBNode = this.scene.createNode(10, 0, 0, 1.5, '#8b5cf6');
    const taskNode = this.scene.createNode(0, 0, 0, 2, '#ef4444');
    
    this.conflictNodes = [userANode, userBNode, taskNode];
    
    // Animate nodes moving toward center
    gsap.to(userANode.position, {
      x: -3,
      duration: 1.5,
      ease: 'power2.inOut'
    });
    
    gsap.to(userBNode.position, {
      x: 3,
      duration: 1.5,
      ease: 'power2.inOut'
    });
    
    // Create data stream lines
    this.createStreamLines(userANode, taskNode, '#6366f1');
    this.createStreamLines(userBNode, taskNode, '#8b5cf6');
    
    // Pulse task node
    gsap.to(taskNode.scale, {
      x: 1.5,
      y: 1.5,
      z: 1.5,
      duration: 0.5,
      yoyo: true,
      repeat: 3
    });
  }

  createStreamLines(fromNode, toNode, color) {
    const material = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.8
    });
    
    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(6);
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      const line = new THREE.Line(geometry, material);
      line.userData = { fromNode, toNode, offset: i * 0.2 };
      
      this.streamLines.push(line);
      this.scene.scene.add(line);
    }
  }

  animateStreams() {
    this.streamLines.forEach(line => {
      const positions = line.geometry.attributes.position.array;
      const fromNode = line.userData.fromNode;
      const toNode = line.userData.toNode;
      const offset = line.userData.offset;
      
      const time = Date.now() * 0.001 + offset;
      const progress = (Math.sin(time) + 1) / 2;
      
      positions[0] = fromNode.position.x;
      positions[1] = fromNode.position.y;
      positions[2] = fromNode.position.z;
      positions[3] = fromNode.position.x + (toNode.position.x - fromNode.position.x) * progress;
      positions[4] = fromNode.position.y + (toNode.position.y - fromNode.position.y) * progress;
      positions[5] = fromNode.position.z + (toNode.position.z - fromNode.position.z) * progress;
      
      line.geometry.attributes.position.needsUpdate = true;
    });
  }

  showResolution() {
    // Clear conflict visualization
    this.conflictNodes.forEach(node => {
      this.scene.scene.remove(node);
    });
    
    this.streamLines.forEach(line => {
      this.scene.scene.remove(line);
    });
    
    this.conflictNodes = [];
    this.streamLines = [];
    this.conflictActive = false;
    
    // Show success pulse
    const successNode = this.scene.createNode(0, 0, 0, 2.5, '#22c55e');
    
    gsap.to(successNode.scale, {
      x: 2,
      y: 2,
      z: 2,
      duration: 0.3,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        this.scene.scene.remove(successNode);
      }
    });
  }
}

// Initialize when scene is ready
let conflictVisual;
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (window.scene3D) {
      conflictVisual = new ConflictVisual(window.scene3D);
      window.conflictVisual = conflictVisual;
    }
  }, 1000);
});
