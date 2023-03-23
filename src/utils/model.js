class Model {
  constructor() {
    this.vertices = []
    this.indices = []
    this.color = [0.5, 0, 0, 1];
    this.translation = [0, 0, 0];
    this.rotation = [0, 0, 0];
    this.scale = [1, 1, 1];
  }

  getColors() {
    const result = [];
    for (let i = 0; i < this.vertices.length / 3; i++) {
      result.push(...this.color);
    }
    return result;
  }

  setVertices(vertices) {
    this.vertices = [...vertices]
  }

  setIndices(indices) {
    this.indices = [...indices]
  }

  setDefault() {
    this.vertices = []
    this.indices = []
    this.color = [1, 0, 0, 1];
    this.translation = [0, 0, 0];
    this.rotation = [0, 0, 0];
    this.scale = [1, 1, 1];
  }

  getModelMatrix() {
    let modelMatrix = m4.identity();
    modelMatrix = m4.translate(modelMatrix, this.translation[0], this.translation[1], this.translation[2]);
    modelMatrix = m4.xRotate(modelMatrix, this.rotation[0]);
    modelMatrix = m4.yRotate(modelMatrix, this.rotation[1]);
    modelMatrix = m4.zRotate(modelMatrix, this.rotation[2]);
    modelMatrix = m4.scale(modelMatrix, this.scale[0], this.scale[1], this.scale[2]);
    return modelMatrix;
  }
}