import { Projection } from "./enum.js";
import { m4 } from "./m4.js";
import { degToRad } from "./math.js";
import { F } from "./model.js";

class StateObj {
  constructor() {
    this.model = F;

    this.vertCount = this.model.length / 3;

    this.color = [200, 70, 120];

    this.transformation = {
      translation: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    };

    this.projection = Projection.PERSPECTIVE;
  }

  getModel() {
    return new Float32Array(this.model);
  }

  getColor() {
    const result = [];
    for (let i = 0; i < this.vertCount; i++) {
      result.push(...this.color);
    }
    return new Uint8Array(result);
  }

  setDefault() {
    this.color = [200, 70, 120];

    this.transformation = {
      translation: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    };

    this.projection = Projection.PERSPECTIVE;
  }

  setTranslationX(dist) {
    this.transformation.translation[0] = dist;
  }

  setTranslationY(dist) {
    this.transformation.translation[1] = dist;
  }

  setTranslationZ(dist) {
    this.transformation.translation[2] = dist;
  }

  setRotationX(dist) {
    this.transformation.rotation[0] = dist;
  }

  setRotationY(dist) {
    this.transformation.rotation[1] = dist;
  }

  setRotationZ(dist) {
    this.transformation.rotation[2] = dist;
  }

  setScaleX(dist) {
    this.transformation.scale[0] = dist;
  }

  setScaleY(dist) {
    this.transformation.scale[1] = dist;
  }

  setScaleZ(dist) {
    this.transformation.scale[2] = dist;
  }
}

class StateCamera {
  constructor(gl) {
    this.angle = degToRad(0);
    this.fieldOfView = degToRad(60);
    this.radius = 200;

    this.gl = gl

    this.objPosition = [this.radius, 0, 0];
    this.up = [0, 1, 0];
  }

  setDefault() {
    this.angle = degToRad(0);
    this.fieldOfView = degToRad(60);
    this.radius = 200;

    this.objPosition = [this.radius, 0, 0];
    this.up = [0, 1, 0];
  }

  getViewProjectionMatrix(projectionType) {
    let cameraMatrix = m4.yRotation(this.angle);
    cameraMatrix = m4.translate(cameraMatrix, 0, 0, this.radius * 1.5);

    let cameraPosition = [cameraMatrix[12], cameraMatrix[13], cameraMatrix[14]];

    cameraMatrix = m4.lookAt(cameraPosition, this.objPosition, this.up);

    let viewMatrix = m4.inverse(cameraMatrix);

    let viewProjectionMatrix = m4.multiply(
      this.getProjectionMatrix(projectionType),
      viewMatrix
    );

    return viewProjectionMatrix;
  }

  getProjectionMatrix(projectionType) {
    if (projectionType === Projection.PERSPECTIVE) {
      let aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
      return m4.perspective( this.fieldOfView, aspect, 1, 2000);
    } else if (projectionType === Projection.ORTHOGRAPHIC) {
      return m4.orthographic(this.gl.canvas.clientWidth, this.gl.canvas.clientHeight, 1, 2000);
    } else {
      return m4.oblique(this.gl.canvas.clientWidth, this.gl.canvas.clientHeight, 1, 2000);
    }
  }

  setAngle(angle) {
    this.angle = degToRad(angle);
  }

  setFoV(fov) {
    this.fieldOfView = degToRad(fov);
  }

  setRadius(radius) {
    this.radius = radius;
  }
}

export { StateObj, StateCamera };
