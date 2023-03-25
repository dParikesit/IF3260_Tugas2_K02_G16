const canvas = document.querySelector("#canvas");
const gl = canvas.getContext("webgl");
const obj = new Model();
const camera = new Camera(gl);
const program = createProgramFromScripts(gl, [
  "vertex-shader-3d",
  "fragment-shader-3d",
]);
// Vertex shader
const a_position = gl.getAttribLocation(program, "a_position");
const a_color = gl.getAttribLocation(program, "a_color");
const a_normal = gl.getAttribLocation(program, "a_normal");
const u_isShading = gl.getUniformLocation(program, "u_isShading");
const u_viewMatrix = gl.getUniformLocation(program, "u_viewMatrix");
const u_modelMatrix = gl.getUniformLocation(program, "u_modelMatrix");
const u_projectionMatrix = gl.getUniformLocation(program, "u_projectionMatrix");
const u_worldInverseTranspose = gl.getUniformLocation(
  program,
  "u_worldInverseTranspose"
);

// Fragment shader
const u_reverseLightDirection = gl.getUniformLocation(
  program,
  "u_reverseLightDirection"
);
const positionBuffer = gl.createBuffer();
const colorBuffer = gl.createBuffer();
const indexBuffer = gl.createBuffer();
const normalBuffer = gl.createBuffer();

// HTML Element
const elemImport = document.getElementById("importButton");
const elemExport = document.getElementById("exportButton");
const elemShading = document.getElementById("shading");
const elemProjection = document.getElementById("projection");
const elemResetView = document.getElementById("reset-view");
const elemResetRotation = document.getElementById("reset-rotation");
const elemResetTranslation = document.getElementById("reset-translation");
const elemResetScale = document.getElementById("reset-scale");
const elemCameraAngle = document.getElementById("camera-angle");
const elemCameraRadius = document.getElementById("camera-radius");
const elemObjRotationX = document.getElementById("obj-x-rotation");
const elemObjRotationY = document.getElementById("obj-y-rotation");
const elemObjRotationZ = document.getElementById("obj-z-rotation");
const elemObjTranslationX = document.getElementById("obj-x-translation");
const elemObjTranslationY = document.getElementById("obj-y-translation");
const elemObjTranslationZ = document.getElementById("obj-z-translation");
const elemObjScaleX = document.getElementById("obj-x-scale");
const elemObjScaleY = document.getElementById("obj-y-scale");
const elemObjScaleZ = document.getElementById("obj-z-scale");
const elemAnimStart = document.getElementById("anim-start");
const elemAnimStop = document.getElementById("anim-stop");
const elemReset = document.getElementById("reset");
const elemModal = document.getElementById("modal");
const elemClose = document.getElementById("close");
const elemZoomProperties = document.getElementById("zoom-properties");

let isShading = true;
let animation = null;
let animDirRight = true;

const main = () => {
  if (!gl) {
    console.log("No WebGL");
    alert("WebGL isn't available");
    return;
  }
  initialize();
  setupListener();
  drawScene();
};

const drawScene = () => {
  resizeCanvasToDisplaySize(gl.canvas);
  gl.useProgram(program);
  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  gl.enableVertexAttribArray(a_position);
  gl.enableVertexAttribArray(a_color);
  gl.enableVertexAttribArray(a_normal);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(obj.vertices),
    gl.STATIC_DRAW
  );
  gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(obj.colors), gl.STATIC_DRAW);
  gl.vertexAttribPointer(a_color, 4, gl.UNSIGNED_BYTE, true, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(obj.indices),
    gl.STATIC_DRAW
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(obj.getNormalVector()),
    gl.STATIC_DRAW
  );
  gl.vertexAttribPointer(a_normal, 3, gl.FLOAT, false, 0, 0);

  gl.uniform1i(u_isShading, isShading);
  gl.uniformMatrix4fv(
    u_projectionMatrix,
    gl.FALSE,
    new Float32Array(camera.getProjectionMatrix())
  );
  gl.uniformMatrix4fv(u_viewMatrix, gl.FALSE, camera.getViewMatrix());
  gl.uniformMatrix4fv(u_modelMatrix, gl.FALSE, obj.getModelMatrix());
  gl.uniformMatrix4fv(
    u_worldInverseTranspose,
    gl.FALSE,
    obj.getInverseTransposeModelMatrix()
  );
  gl.uniform3fv(u_reverseLightDirection, normalize([0.4, 0.5, 1.0]));

  gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0);
};

const importObject = () => {
  console.log("Importing objects...");
  const file = document.getElementById("import").files[0];
  const reader = new FileReader();
  if (!file) {
    alert("There's no file to import!");
    return;
  }
  reader.onload = (e) => {
    const model = JSON.parse(e.target.result);

    obj.setVertices(model.vertices);
    obj.setIndices(model.indices);
    obj.setColors(model.colors);
    obj.calculateCenter();

    drawScene();
  };
  reader.readAsText(file);
};

const exportObject = () => {
  let filename = document.getElementById("export").value;
  if (filename === "") {
    filename = "newObject";
  }

  console.log(obj.getSaveVertices());

  let modelStr = JSON.stringify({
    vertices: obj.getSaveVertices(),
    indices: obj.indices,
    colors: obj.colors,
  });

  let blob = new Blob([modelStr], { type: "application/json" });
  let link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  link.click();

  console.log(`Exporting ${filename}...`);
};

const changeOrthoZoom = (radius) => {
  camera.orthoRadius = parseFloat(radius);
  camera.setProjectionMatrix(elemProjection.value);
  drawScene();
};

const changeShading = (e) => {
  isShading = e.target.checked;
  console.log(`Changing shading to ${isShading}...`);
  drawScene();
};

const resetView = () => {
  camera.resetView(elemProjection.value);
  elemCameraAngle.value = 0;
  elemCameraRadius.value = 5;
  console.log("Resetting camera...");
  drawScene();
};

const changeProjection = (e) => {
  camera.setProjectionMatrix(e.target.value);
  switch (e.target.value) {
    case "perspective":
      elemZoomProperties.innerHTML = "";
      break;
    case "orthographic":
      elemZoomProperties.innerHTML = `
      <label>Orthographic Zoom:</label>
      <div>
        <input
          type="range"
          min="-10"
          max="3"
          step="0.1"
          value= ${camera.orthoRadius}
          oninput="changeOrthoZoom(this.value)"
        />
      </div>
      `;
      break;
    case "oblique":
      elemZoomProperties.innerHTML = `
      <label>Oblique Zoom:</label>
      <div>
        <input
          type="range"
          min="-10"
          max="3"
          step="0.1"
          value= ${camera.orthoRadius}
          oninput="changeOrthoZoom(this.value)"
        />
      </div>
      `;
      break;
  }
  console.log(`Changing projection to ${e.target.value}...`);
  drawScene();
};

const changeCameraAngle = (e) => {
  const angle = parseInt(e.target.value);
  camera.cameraAngle = degToRad(angle);
  console.log(`Changing view angle to ${angle}...`);
  drawScene();
};

const changeCameraRadius = (e) => {
  const radius = parseFloat(e.target.value);
  camera.cameraRadius = radius;
  console.log(`Changing view zoom Y to ${radius}...`);
  drawScene();
};

const changeObjRotationX = (e) => {
  const angle = parseInt(e.target.value);
  obj.rotation[0] = degToRad(angle);
  console.log(`Changing object rotation X to ${angle}...`);
  drawScene();
};

const changeObjRotationY = (e) => {
  const angle = parseInt(e.target.value);
  obj.rotation[1] = degToRad(angle);
  console.log(`Changing object rotation Y to ${angle}...`);
  drawScene();
};

const changeObjRotationZ = (e) => {
  const angle = parseInt(e.target.value);
  obj.rotation[2] = degToRad(angle);
  console.log(`Changing object rotation Z to ${angle}...`);
  drawScene();
};

const changeObjTranslationX = (e) => {
  const distance = parseFloat(e.target.value).toFixed(2);
  obj.translation[0] = distance;
  console.log(`Changing object translation X to ${distance}...`);
  drawScene();
};

const changeObjTranslationY = (e) => {
  const distance = parseFloat(e.target.value).toFixed(2);
  obj.translation[1] = distance;
  console.log(`Changing object translation Y to ${distance}...`);
  drawScene();
};

const changeObjTranslationZ = (e) => {
  const distance = parseFloat(e.target.value).toFixed(2);
  obj.translation[2] = distance;
  console.log(`Changing object translation Z to ${distance}...`);
  drawScene();
};

const changeObjScaleX = (e) => {
  const scale = parseFloat(e.target.value).toFixed(2);
  obj.scale[0] = scale;
  console.log(`Changing object scale X to ${scale}...`);
  drawScene();
};

const changeObjScaleY = (e) => {
  const scale = parseFloat(e.target.value).toFixed(2);
  obj.scale[1] = scale;
  console.log(`Changing object scale Y to ${scale}...`);
  drawScene();
};

const changeObjScaleZ = (e) => {
  const scale = parseFloat(e.target.value).toFixed(2);
  obj.scale[2] = scale;
  console.log(`Changing object scale Z to ${scale}...`);
  drawScene();
};

const animStart = () => {
  console.log("Starting animation...");
  if (animation === null) {
    animation = setInterval(() => {
      console.log("Animating...");

      console.log("x", elemObjRotationX.value);
      console.log("y", elemObjRotationY.value);

      newRotationX = parseInt(elemObjRotationX.value) + 1;
      newRotationY = parseInt(elemObjRotationY.value) + 1;

      elemObjRotationX.value = newRotationX > 180 ? -179 : newRotationX;
      elemObjRotationY.value = newRotationY > 180 ? -179 : newRotationY;

      obj.rotation[0] = degToRad(elemObjRotationX.value);
      obj.rotation[1] = degToRad(elemObjRotationY.value);

      drawScene();
    }, 5);
  }
};

const animStop = () => {
  console.log("Stopping animation...");
  if (animation !== null) {
    clearInterval(animation);
    animation = null;
  }
};

const showModal = (e) => {
  const myModal = document.getElementById("myModal");
  myModal.style.display = "block";
};

const closeModal = () => {
  const myModal = document.getElementById("myModal");
  myModal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == document.getElementById("myModal")) {
    document.getElementById("myModal").style.display = "none";
  }
};

const resetRotation = () => {
  obj.rotation = [0, 0, 0];
  elemObjRotationX.value = 0;
  elemObjRotationY.value = 0;
  elemObjRotationZ.value = 0;
  console.log("Resetting object rotation...");
  drawScene();
};
const resetTranslation = () => {
  obj.translation = [0, 0, 0];
  elemObjTranslationX.value = 0;
  elemObjTranslationY.value = 0;
  elemObjTranslationZ.value = 0;
  console.log("Resetting object translation...");
  drawScene();
};

const resetScale = () => {
  obj.scale = [1, 1, 1];
  elemObjScaleX.value = 1;
  elemObjScaleY.value = 1;
  elemObjScaleZ.value = 1;
  console.log("Resetting object scale...");
  drawScene();
};

const setupListener = () => {
  elemImport.addEventListener("click", () => importObject());
  elemExport.addEventListener("click", () => exportObject());
  elemShading.addEventListener("change", (e) => changeShading(e));
  elemProjection.addEventListener("change", (e) => changeProjection(e));
  elemResetView.addEventListener("click", () => resetView());
  elemResetRotation.addEventListener("click", () => resetRotation());
  elemResetTranslation.addEventListener("click", () => resetTranslation());
  elemResetScale.addEventListener("click", () => resetScale());
  elemCameraAngle.addEventListener("input", (e) => changeCameraAngle(e));
  elemCameraRadius.addEventListener("input", (e) => changeCameraRadius(e));
  elemObjRotationX.addEventListener("input", (e) => changeObjRotationX(e));
  elemObjRotationY.addEventListener("input", (e) => changeObjRotationY(e));
  elemObjRotationZ.addEventListener("input", (e) => changeObjRotationZ(e));
  elemObjTranslationX.addEventListener("input", (e) =>
    changeObjTranslationX(e)
  );
  elemObjTranslationY.addEventListener("input", (e) =>
    changeObjTranslationY(e)
  );
  elemObjTranslationZ.addEventListener("input", (e) =>
    changeObjTranslationZ(e)
  );
  elemObjScaleX.addEventListener("input", (e) => changeObjScaleX(e));
  elemObjScaleY.addEventListener("input", (e) => changeObjScaleY(e));
  elemObjScaleZ.addEventListener("input", (e) => changeObjScaleZ(e));
  elemAnimStart.addEventListener("click", () => animStart());
  elemAnimStop.addEventListener("click", () => animStop());
  elemModal.addEventListener("click", () => showModal());
  elemClose.addEventListener("click", () => closeModal());
};

const initialize = () => {
  obj.vertices = [
    0.75, -0.75, -1.0, -0.75, -0.75, -1.0, -0.75, -0.75, -0.75, 0.75, -0.75,
    -0.75,

    -1.0, -0.75, -0.75, -1.0, -0.75, 0.75, -0.75, -0.75, 0.75, -0.75, -0.75,
    -0.75,

    -0.75, -0.75, 1.0, 0.75, -0.75, 1.0, 0.75, -0.75, 0.75, -0.75, -0.75, 0.75,

    1.0, -0.75, 0.75, 1.0, -0.75, -0.75, 0.75, -0.75, -0.75, 0.75, -0.75, 0.75,

    0.75, -0.75, -1.0, 0.75, -1, -1.0, -0.75, -1, -1.0, -0.75, -0.75, -1.0,

    -0.75, -0.75, -0.75, -0.75, -1, -0.75, 0.75, -1, -0.75, 0.75, -0.75, -0.75,

    -0.75, -1, -1.0, 0.75, -1, -1.0, 0.75, -1, -0.75, -0.75, -1, -0.75,

    -1.0, -0.75, 0.75, -1.0, -0.75, -0.75, -1.0, -1, -0.75, -1.0, -1, 0.75,

    -0.75, -0.75, -0.75, -0.75, -0.75, 0.75, -0.75, -1, 0.75, -0.75, -1, -0.75,

    -1.0, -1, 0.75, -1.0, -1, -0.75, -0.75, -1, -0.75, -0.75, -1, 0.75,

    0.75, -0.75, 1.0, -0.75, -0.75, 1.0, -0.75, -1, 1.0, 0.75, -1, 1.0,

    -0.75, -0.75, 0.75, 0.75, -0.75, 0.75, 0.75, -1, 0.75, -0.75, -1, 0.75,

    0.75, -1, 1.0, -0.75, -1, 1.0, -0.75, -1, 0.75, 0.75, -1, 0.75,

    1.0, -0.75, -0.75, 1.0, -0.75, 0.75, 1.0, -1, 0.75, 1.0, -1, -0.75,

    0.75, -0.75, 0.75, 0.75, -0.75, -0.75, 0.75, -1, -0.75, 0.75, -1, 0.75,

    1.0, -1, -0.75, 1.0, -1, 0.75, 0.75, -1, 0.75, 0.75, -1, -0.75,

    0.75, 1, -1.0, -0.75, 1, -1.0, -0.75, 1, -0.75, 0.75, 1, -0.75,

    -1.0, 1, -0.75, -1.0, 1, 0.75, -0.75, 1, 0.75, -0.75, 1, -0.75,

    -0.75, 1, 1.0, 0.75, 1, 1.0, 0.75, 1, 0.75, -0.75, 1, 0.75,

    1.0, 1, 0.75, 1.0, 1, -0.75, 0.75, 1, -0.75, 0.75, 1, 0.75,

    0.75, 1, -1.0, 0.75, 0.75, -1.0, -0.75, 0.75, -1.0, -0.75, 1, -1.0,

    -0.75, 1, -0.75, -0.75, 0.75, -0.75, 0.75, 0.75, -0.75, 0.75, 1, -0.75,

    -0.75, 0.75, -1.0, 0.75, 0.75, -1.0, 0.75, 0.75, -0.75, -0.75, 0.75, -0.75,

    -1.0, 1, 0.75, -1.0, 1, -0.75, -1.0, 0.75, -0.75, -1.0, 0.75, 0.75,

    -0.75, 1, -0.75, -0.75, 1, 0.75, -0.75, 0.75, 0.75, -0.75, 0.75, -0.75,

    -1.0, 0.75, 0.75, -1.0, 0.75, -0.75, -0.75, 0.75, -0.75, -0.75, 0.75, 0.75,

    0.75, 1, 1.0, -0.75, 1, 1.0, -0.75, 0.75, 1.0, 0.75, 0.75, 1.0,

    -0.75, 1, 0.75, 0.75, 1, 0.75, 0.75, 0.75, 0.75, -0.75, 0.75, 0.75,

    0.75, 0.75, 1.0, -0.75, 0.75, 1.0, -0.75, 0.75, 0.75, 0.75, 0.75, 0.75,

    1.0, 1, -0.75, 1.0, 1, 0.75, 1.0, 0.75, 0.75, 1.0, 0.75, -0.75,

    0.75, 1, 0.75, 0.75, 1, -0.75, 0.75, 0.75, -0.75, 0.75, 0.75, 0.75,

    1.0, 0.75, -0.75, 1.0, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, -0.75,

    -1.0, 1, -1.0, -0.75, 1, -1.0, -0.75, -1, -1.0, -1.0, -1, -1.0,

    -1.0, 1.0, -0.75, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -0.75,

    -0.75, 0.75, -0.75, -1.0, 0.75, -0.75, -1.0, -0.75, -0.75, -0.75, -0.75,
    -0.75,

    -0.75, 0.75, -1.0, -0.75, 0.75, -0.75, -0.75, -0.75, -0.75, -0.75, -0.75,
    -1.0,

    -0.75, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -0.75, -0.75, 1.0, -0.75,

    -1.0, -1.0, -1.0, -0.75, -1.0, -1.0, -0.75, -1.0, -0.75, -1.0, -1.0, -0.75,

    0.75, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 0.75, -1.0, -1.0,

    0.75, 0.75, -0.75, 0.75, 0.75, -1.0, 0.75, -0.75, -1.0, 0.75, -0.75, -0.75,

    1.0, 0.75, -0.75, 0.75, 0.75, -0.75, 0.75, -0.75, -0.75, 1.0, -0.75, -0.75,

    1.0, 1.0, -1.0, 1.0, 1.0, -0.75, 1.0, -1.0, -0.75, 1.0, -1.0, -1.0,

    1.0, 1.0, -1.0, 0.75, 1.0, -1.0, 0.75, 1.0, -0.75, 1.0, 1.0, -0.75,

    0.75, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -0.75, 0.75, -1.0, -0.75,

    -1.0, 0.75, 0.75, -0.75, 0.75, 0.75, -0.75, -0.75, 0.75, -1.0, -0.75, 0.75,

    -1.0, 1.0, 1.0, -1.0, 1.0, 0.75, -1.0, -1.0, 0.75, -1.0, -1.0, 1.0,

    -0.75, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -0.75, -1.0, 1.0,

    -0.75, 0.75, 0.75, -0.75, 0.75, 1.0, -0.75, -0.75, 1.0, -0.75, -0.75, 0.75,

    -1.0, 1.0, 1.0, -0.75, 1.0, 1.0, -0.75, 1.0, 0.75, -1.0, 1.0, 0.75,

    -0.75, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 0.75, -0.75, -1.0, 0.75,

    0.75, 0.75, 0.75, 1.0, 0.75, 0.75, 1.0, -0.75, 0.75, 0.75, -0.75, 0.75,

    0.75, 0.75, 1.0, 0.75, 0.75, 0.75, 0.75, -0.75, 0.75, 0.75, -0.75, 1.0,

    1.0, 1.0, 1.0, 0.75, 1.0, 1.0, 0.75, -1.0, 1.0, 1.0, -1.0, 1.0,

    1.0, 1.0, 0.75, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 0.75,

    1.0, 1.0, 1.0, 1.0, 1.0, 0.75, 0.75, 1.0, 0.75, 0.75, 1.0, 1.0,

    1.0, -1.0, 0.75, 1.0, -1.0, 1.0, 0.75, -1.0, 1.0, 0.75, -1.0, 0.75,
  ];
  obj.indices = [
    0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14,
    15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23, 24, 25, 26, 24, 26, 27,
    28, 29, 30, 28, 30, 31, 32, 33, 34, 32, 34, 35, 36, 37, 38, 36, 38, 39, 40,
    41, 42, 40, 42, 43, 44, 45, 46, 44, 46, 47, 48, 49, 50, 48, 50, 51, 52, 53,
    54, 52, 54, 55, 56, 57, 58, 56, 58, 59, 60, 61, 62, 60, 62, 63, 64, 65, 66,
    64, 66, 67, 68, 69, 70, 68, 70, 71, 72, 73, 74, 72, 74, 75, 76, 77, 78, 76,
    78, 79, 80, 81, 82, 80, 82, 83, 84, 85, 86, 84, 86, 87, 88, 89, 90, 88, 90,
    91, 92, 93, 94, 92, 94, 95, 96, 97, 98, 96, 98, 99, 100, 101, 102, 100, 102,
    103, 104, 105, 106, 104, 106, 107, 108, 109, 110, 108, 110, 111, 112, 113,
    114, 112, 114, 115, 116, 117, 118, 116, 118, 119, 120, 121, 122, 120, 122,
    123, 124, 125, 126, 124, 126, 127, 128, 129, 130, 128, 130, 131, 132, 133,
    134, 132, 134, 135, 136, 137, 138, 136, 138, 139, 140, 141, 142, 140, 142,
    143, 144, 145, 146, 144, 146, 147, 148, 149, 150, 148, 150, 151, 152, 153,
    154, 152, 154, 155, 156, 157, 158, 156, 158, 159, 160, 161, 162, 160, 162,
    163, 164, 165, 166, 164, 166, 167, 168, 169, 170, 168, 170, 171, 172, 173,
    174, 172, 174, 175, 176, 177, 178, 176, 178, 179, 180, 181, 182, 180, 182,
    183, 184, 185, 186, 184, 186, 187, 188, 189, 190, 188, 190, 191, 192, 193,
    194, 192, 194, 195, 196, 197, 198, 196, 198, 199, 200, 201, 202, 200, 202,
    203, 204, 205, 206, 204, 206, 207, 208, 209, 210, 208, 210, 211, 212, 213,
    214, 212, 214, 215, 216, 217, 218, 216, 218, 219, 220, 221, 222, 220, 222,
    223,
  ];

  obj.colors = [
    255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0,
    255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0,
    0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255,
    0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255,
    255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0,
    255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0,
    0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255,
    0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255,
    255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0,
    255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0,
    0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255,
    0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255,
    255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0,
    255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0,
    0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255,
    0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255,
    255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0,
    255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0,
    0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255,
    0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255,
    255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0,
    255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0,
    0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255,
    0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255,
    255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0,
    255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0,
    0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255,
    0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255,
    255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0,
    255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0,
    0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255,
    0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255,
    255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0,
    255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0,
    0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255,
    0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255,
    255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0,
    255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0,
    0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255,
    0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255,
    255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0,
    255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0,
    0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255,
    0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255,
    255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0,
    255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0,
    0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255,
    0, 0, 255,
  ];
};

main();
