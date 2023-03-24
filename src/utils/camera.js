class Camera {
  constructor(gl) {
    this.gl = gl;
    this.cameraAngle = 0;
    this.cameraRadius = 5;
    this.shadingMode = false;
    this.projectionMatrix = [];
    this.setProjectionMatrix("perspective");
  }

  setDefault() {
    this.cameraAngle = 0;
    this.cameraRadius = 5;
    this.shadingMode = false;
    this.projectionMatrix = [];
    this.setProjectionMatrix("perspective");
  }

  setProjectionMatrix(projection) {
    const left = -2;
    const right = 2;
    const bottom = -2;
    const top = 2;
    const near = -500;
    const far = 500;

    const fov = degToRad(60);
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 1;
    const zFar = 2000;

    const theta = degToRad(60);
    const phi = degToRad(60);

    switch (projection) {
      case "orthographic":
        this.projectionMatrix = m4.orthographic(
          left,
          right,
          bottom,
          top,
          near,
          far
        );
        break;
      case "perspective":
        this.projectionMatrix = m4.perspective(fov, aspect, zNear, zFar);
        break;
      case "oblique":
        const ortho = m4.orthographic(left, right, bottom, top, near, far);
        const oblique = m4.oblique(theta, phi);
        const projection = m4.multiply(ortho, oblique);
        this.projectionMatrix = m4.translate(projection, 0, 0, 5);
        break;
    }
  }

  getProjectionMatrix(){
    return [...this.projectionMatrix]
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
