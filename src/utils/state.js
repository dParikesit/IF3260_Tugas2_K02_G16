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

    this.view = {
      rotation: degToRad(60),
      radius: 0.1,
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
}

class StateCamera {
  constructor(gl, projectionType) {
    this.angle = degToRad(0);
    this.fieldOfView = degToRad(60);
    this.radius = 200;

    this.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    this.zNear = 1;
    this.zFar = 2000;

    this.objPosition = [this.radius, 0, 0];

    this.cameraMatrix = m4.yRotation(this.angle);
    this.cameraMatrix = m4.translate(
      this.cameraMatrix,
      0,
      0,
      this.radius * 1.5
    );
    this.cameraPosition = [
      this.cameraMatrix[12],
      this.cameraMatrix[13],
      this.cameraMatrix[14],
    ];

    this.up = [0, 1, 0];

    this.cameraMatrix = m4.lookAt(
      this.cameraPosition,
      this.objPosition,
      this.up
    );

    this.viewMatrix = m4.inverse(this.cameraMatrix);

    this.viewProjectionMatrix = m4.multiply(
      this.getProjectionMatrix(projectionType),
      this.viewMatrix
    );
  }

  getProjectionMatrix(projectionType) {
    if (projectionType === Projection.PERSPECTIVE) {
      return m4.perspective(
        this.fieldOfView,
        this.aspect,
        this.zNear,
        this.zFar
      );
    }
  }
}

export { StateObj, StateCamera };
