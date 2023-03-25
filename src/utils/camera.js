class Camera {
  constructor(gl) {
    this.gl = gl;
    this.cameraAngle = 0;
    this.cameraRadius = 5;
    this.shadingMode = false;
    this.projectionMatrix = [];
    this.orthoRadius = 0;
    this.setProjectionMatrix("perspective");
  }

  resetView(projection) {
    this.cameraAngle = 0;
    this.cameraRadius = 5;
    this.orthoRadius = 0;
    this.setProjectionMatrix(projection);
  }

  setProjectionMatrix(projection) {
    const left = -3;
    const right = 3;
    const bottom = -3;
    const top = 3;

    const near = -500;
    const far = 500;

    const fov = degToRad(60);
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 1;
    const zFar = 2000;

    const theta = degToRad(60);
    const phi = degToRad(60);

    console.log(left + this.orthoRadius);
    console.log(right - this.orthoRadius);
    console.log(bottom + this.orthoRadius);
    console.log(top - this.orthoRadius);

    switch (projection) {
      case "orthographic":
        this.projectionMatrix = m4.orthographic(
          left + this.orthoRadius,
          right - this.orthoRadius,
          bottom + this.orthoRadius,
          top - this.orthoRadius,
          near,
          far
        );
        break;
      case "perspective":
        this.projectionMatrix = m4.perspective(fov, aspect, zNear, zFar);
        break;
      case "oblique":
        const ortho = m4.orthographic(
          left + this.orthoRadius,
          right - this.orthoRadius,
          bottom + this.orthoRadius,
          top - this.orthoRadius,
          near,
          far
        );
        const oblique = m4.oblique(theta, phi);
        const projection = m4.multiply(ortho, oblique);
        this.projectionMatrix = m4.translate(projection, 0, 0, 5);
        break;
    }
  }

  getProjectionMatrix() {
    return [...this.projectionMatrix];
  }

  getViewMatrix() {
    let cameraMatrix = m4.yRotation(this.cameraAngle);
    cameraMatrix = m4.translate(cameraMatrix, 0, 0, this.cameraRadius);

    let cameraPosition = [cameraMatrix[12], cameraMatrix[13], cameraMatrix[14]];
    const target = [0, 0, 0];
    const up = [0, 1, 0];

    cameraMatrix = m4.lookAt(cameraPosition, target, up);
    return m4.inverse(cameraMatrix);
  }
}
