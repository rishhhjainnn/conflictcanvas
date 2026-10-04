// 3D Collaboration Visualization
class Collaboration3D {
  constructor(scene) {
    this.scene = scene;
    this.activeUsers = [];
    this.userNodes = new Map();
  }

  addUser(user) {
    if (this.userNodes.has(user.id)) return;
    
    const node = this.scene.createNode(
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 30,
      0,
      1.2,
      '#22c55e'
    );
    
    this.userNodes.set(user.id, node);
    this.activeUsers.push(user);
  }

  removeUser(userId) {
    const node = this.userNodes.get(userId);
    if (node) {
      this.scene.remove(node);
      this.userNodes.delete(userId);
    }
    
    this.activeUsers = this.activeUsers.filter(u => u.id !== userId);
  }

  updateUserActivity(userId, active) {
    const node = this.userNodes.get(userId);
    if (node) {
      node.material.color.setHex(active ? 0x22c55e : 0x64748b);
    }
  }
}
