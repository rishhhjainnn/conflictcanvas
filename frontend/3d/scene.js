// Three.js Scene Manager
class Scene3D {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = null;
    this.nodes = [];
    this.connections = [];
    this.animationId = null;
    this.mouse = { x: 0, y: 0 };
    this.targetRotation = { x: 0, y: 0 };
    this.isVisible = true;
    
    this.init();
  }

  init() {
    if (!CONFIG.THREE.enabled || !CONFIG.ANIMATION.enabled) {
      return;
    }

    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    // Scene
    this.scene = new THREE.Scene();
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 50;
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: CONFIG.THREE.antialias,
      alpha: CONFIG.THREE.alpha,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(CONFIG.THREE.pixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Create particles
    this.createParticles();
    
    // Create collaboration network
    this.createCollaborationNetwork();
    
    // Event listeners
    window.addEventListener('resize', () => this.onResize());
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('visibilitychange', () => this.onVisibilityChange());
    
    // Start animation
    this.animate();
  }

  createParticles() {
    const particleCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      
      // Color gradient from primary to secondary
      const color = new THREE.Color();
      color.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  createCollaborationNetwork() {
    // Create project node (center)
    const projectNode = this.createNode(0, 0, 0, 2, '#6366f1');
    this.nodes.push(projectNode);
    
    // Create task nodes around project
    const taskCount = 5;
    for (let i = 0; i < taskCount; i++) {
      const angle = (i / taskCount) * Math.PI * 2;
      const radius = 15;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const taskNode = this.createNode(x, y, 0, 1.5, '#06b6d4');
      this.nodes.push(taskNode);
      
      // Connect to project
      this.createConnection(projectNode, taskNode);
    }
    
    // Create user nodes
    const userCount = 4;
    for (let i = 0; i < userCount; i++) {
      const angle = (i / userCount) * Math.PI * 2 + Math.PI / 4;
      const radius = 25;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const userNode = this.createNode(x, y, 0, 1, '#8b5cf6');
      this.nodes.push(userNode);
      
      // Connect to random task
      const taskIndex = i % taskCount;
      this.createConnection(userNode, this.nodes[taskIndex + 1]);
    }
  }

  createNode(x, y, z, size, color) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.8
    });
    
    const node = new THREE.Mesh(geometry, material);
    node.position.set(x, y, z);
    
    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(size * 1.5, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    node.add(glow);
    
    this.scene.add(node);
    return node;
  }

  createConnection(nodeA, nodeB) {
    const material = new THREE.LineBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.3
    });
    
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(6);
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const line = new THREE.Line(geometry, material);
    line.userData = { nodeA, nodeB };
    
    this.connections.push(line);
    this.scene.add(line);
  }

  updateConnections() {
    this.connections.forEach(line => {
      const positions = line.geometry.attributes.position.array;
      const nodeA = line.userData.nodeA;
      const nodeB = line.userData.nodeB;
      
      positions[0] = nodeA.position.x;
      positions[1] = nodeA.position.y;
      positions[2] = nodeA.position.z;
      positions[3] = nodeB.position.x;
      positions[4] = nodeB.position.y;
      positions[5] = nodeB.position.z;
      
      line.geometry.attributes.position.needsUpdate = true;
    });
  }

  animate() {
    if (!this.isVisible) return;
    
    this.animationId = requestAnimationFrame(() => this.animate());
    
    // Rotate particles slowly
    if (this.particles) {
      this.particles.rotation.x += 0.0001;
      this.particles.rotation.y += 0.0002;
    }
    
    // Animate nodes
    this.nodes.forEach((node, index) => {
      node.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01;
    });
    
    // Update connections
    this.updateConnections();
    
    // Camera movement based on mouse
    this.targetRotation.x += (this.mouse.y * 0.0001 - this.targetRotation.x) * 0.05;
    this.targetRotation.y += (this.mouse.x * 0.0001 - this.targetRotation.y) * 0.05;
    
    this.scene.rotation.x = this.targetRotation.x;
    this.scene.rotation.y = this.targetRotation.y;
    
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    if (!this.camera || !this.renderer) return;
    
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onMouseMove(event) {
    this.mouse.x = event.clientX - window.innerWidth / 2;
    this.mouse.y = event.clientY - window.innerHeight / 2;
  }

  onVisibilityChange() {
    this.isVisible = !document.hidden;
    
    if (this.isVisible) {
      this.animate();
    } else if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    window.removeEventListener('resize', () => this.onResize());
    document.removeEventListener('mousemove', (e) => this.onMouseMove(e));
    document.removeEventListener('visibilitychange', () => this.onVisibilityChange());
  }
}

// Initialize scene when DOM is ready
let scene3D;
document.addEventListener('DOMContentLoaded', () => {
  scene3D = new Scene3D();
});
