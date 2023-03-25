class Model {
  constructor() {
    this.vertices = []
    this.indices = []
    this.color = [];
    this.translation = [0, 0, 0];
    this.rotation = [0, 0, 0];
    this.scale = [1, 1, 1];
    this.center = [0, 0, 0]
  }

  getUniqueVertices() {
    let uniqueVertices = new Set();
    let vertice = [];
    for(let i = 0; i < this.vertices.length; i += 3) {
      vertice = [this.vertices[i], this.vertices[i + 1], this.vertices[i + 2]];
      uniqueVertices.add(vertice);
    }
    return uniqueVertices;
  }

  getSaveVertices() {
    let saveVertices = new Array(this.vertices.length).fill(0);
    let position = [];
    
    for (let i = 0; i < this.vertices.length; i += 3) {
      position = [this.vertices[i], this.vertices[i + 1], this.vertices[i + 2], 1];
      position = m4.multiply3(position, this.getModelMatrix());
      saveVertices[i] = position[0];
      saveVertices[i + 1] = position[1];
      saveVertices[i + 2] = position[2];
    }
    return saveVertices;
  }

  calculateCenter() {
    let uniqueVertices = this.getUniqueVertices();
    let center = [0, 0, 0];
    for(let vertice of uniqueVertices) {
      center[0] += vertice[0];
      center[1] += vertice[1];
      center[2] += vertice[2];
    }
    center[0] /= uniqueVertices.size;
    center[1] /= uniqueVertices.size;
    center[2] /= uniqueVertices.size;
    this.center = center;
  }

  setVertices(vertices) {
    this.vertices = [...vertices]
  }

  setIndices(indices) {
    this.indices = [...indices]
  }

  setColors(colors) {
    this.colors = [...colors]
  }

  setTranslation(translation) {
    this.translation = [...translation]
  }

  setRotation(rotation) {
    this.rotation = [...rotation]
  }

  setScale(scale) {
    this.scale = [...scale]
  }

  getModelMatrix() {
    let modelMatrix = m4.identity();
    modelMatrix = m4.scale(modelMatrix, this.scale[0], this.scale[1], this.scale[2]);
    modelMatrix = m4.translate(modelMatrix, this.translation[0], this.translation[1], this.translation[2]);
    modelMatrix = m4.translate(modelMatrix, this.center[0], this.center[1], this.center[2]);
    modelMatrix = m4.xRotate(modelMatrix, this.rotation[0]);
    modelMatrix = m4.yRotate(modelMatrix, this.rotation[1]);
    modelMatrix = m4.zRotate(modelMatrix, this.rotation[2]);
    modelMatrix = m4.translate(modelMatrix, -this.center[0], -this.center[1], -this.center[2]);

    return modelMatrix;
  }

  getInverseTransposeModelMatrix() {
    let modelMatrix = this.getModelMatrix();
    modelMatrix = m4.inverse(modelMatrix);
    modelMatrix = m4.transpose(modelMatrix);
    return modelMatrix;
  }

  getNormalVector() {
    let normalVector = new Array(this.vertices.length).fill(0);
    for(let i = 0; i < this.indices.length; i += 3) {
      const i1 = this.indices[i];
      const i2 = this.indices[i + 1];
      const i3 = this.indices[i + 2];

      const p1 = [this.vertices[i1 * 3], this.vertices[i1 * 3 + 1], this.vertices[i1 * 3 + 2]];
      const p2 = [this.vertices[i2 * 3], this.vertices[i2 * 3 + 1], this.vertices[i2 * 3 + 2]];
      const p3 = [this.vertices[i3 * 3], this.vertices[i3 * 3 + 1], this.vertices[i3 * 3 + 2]];

      const v1 = subtractVectors(p2, p1);
      const v2 = subtractVectors(p3, p1);
      const normal = normalize(cross(v1, v2));

      normalVector[i1 * 3] += normal[0];
      normalVector[i1 * 3 + 1] += normal[1];
      normalVector[i1 * 3 + 2] += normal[2];
      normalVector[i2 * 3] += normal[0];
      normalVector[i2 * 3 + 1] += normal[1];
      normalVector[i2 * 3 + 2] += normal[2];
      normalVector[i3 * 3] += normal[0];
      normalVector[i3 * 3 + 1] += normal[1];
      normalVector[i3 * 3 + 2] += normal[2];
    } 
    return normalVector;
  }
}