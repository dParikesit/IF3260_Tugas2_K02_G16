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

let isShading = false;
let animation = null;
let animDirRight = true;

const main = () => {
  if (!gl) {
    console.log("No WebGL");
    alert("WebGL isn't available");
    return;
  }

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

  let a = [2, 2, 2, 2]
  let b = obj.getModelMatrix();
  a = m4.multiply3(a, b);
    console.log(a)
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

const changeShading = (e) => {
  isShading = e.target.checked;
  console.log(`Changing shading to ${isShading}...`);
  drawScene();
};

const resetView = () => {
  camera.resetView();
  elemCameraAngle.value = 0;
  elemCameraRadius.value = 5;
  console.log("Resetting camera...");
  drawScene();
};

const changeProjection = (e) => {
  camera.setProjectionMatrix(e.target.value);
  console.log(`Changing projection to ${e.target.value}...`);
  drawScene();
};

const changeCameraAngle = (e) => {
  camera.cameraAngle = degToRad(e.target.value);
  console.log(`Changing view angle to ${e.target.value}...`);
  drawScene();
};

const changeCameraRadius = (e) => {
  const radius = e.target.value;
  camera.cameraRadius = radius;
  console.log(`Changing view zoom Y to ${radius}...`);
  drawScene();
};

const changeObjRotationX = (e) => {
  obj.rotation[0] = degToRad(e.target.value);
  console.log(`Changing object rotation X to ${e.target.value}...`);
  drawScene();
};

const changeObjRotationY = (e) => {
  obj.rotation[1] = degToRad(e.target.value);
  console.log(`Changing object rotation Y to ${e.target.value}...`);
  drawScene();
};

const changeObjRotationZ = (e) => {
  obj.rotation[2] = degToRad(e.target.value);
  console.log(`Changing object rotation Z to ${e.target.value}...`);
  drawScene();
};

const changeObjTranslationX = (e) => {
  obj.translation[0] = e.target.value;
  console.log(`Changing object translation X to ${e.target.value}...`);
  drawScene();
};

const changeObjTranslationY = (e) => {
  obj.translation[1] = e.target.value;
  console.log(`Changing object translation Y to ${e.target.value}...`);
  drawScene();
};

const changeObjTranslationZ = (e) => {
  obj.translation[2] = e.target.value;
  console.log(`Changing object translation Z to ${e.target.value}...`);
  drawScene();
};

const changeObjScaleX = (e) => {
  obj.scale[0] = e.target.value;
  console.log(`Changing object scale X to ${e.target.value}...`);
  drawScene();
};

const changeObjScaleY = (e) => {
  obj.scale[1] = e.target.value;
  console.log(`Changing object scale Y to ${e.target.value}...`);
  drawScene();
};

const changeObjScaleZ = (e) => {
  obj.scale[2] = e.target.value;
  console.log(`Changing object scale Z to ${e.target.value}...`);
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

main();
