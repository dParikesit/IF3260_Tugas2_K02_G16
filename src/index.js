const canvas = document.querySelector("#canvas");
const gl = canvas.getContext("webgl");
const obj = new Model();
const camera = new Camera(gl);
const program = createProgramFromScripts(gl, [
  "vertex-shader-3d",
  "fragment-shader-3d",
]);
const a_position = gl.getAttribLocation(program, "a_position");
const a_color = gl.getAttribLocation(program, "a_color");
const u_viewMatrix = gl.getUniformLocation(program, "u_viewMatrix");
const u_modelMatrix = gl.getUniformLocation(program, "u_modelMatrix");
const u_projectionMatrix = gl.getUniformLocation(program, "u_projectionMatrix");
const positionBuffer = gl.createBuffer();
const colorBuffer = gl.createBuffer();
const indexBuffer = gl.createBuffer();

let animation = null;
let animDirRight = true;

const main = () => {
  if (!gl) {
    console.log("No WebGL");
    alert("WebGL isn't available");
    return;
  }
  setupListener(obj, camera);
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

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.vertices), gl.STATIC_DRAW);   
  gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.colors), gl.STATIC_DRAW);
  gl.vertexAttribPointer(a_color, 4, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj.indices), gl.STATIC_DRAW);

  gl.uniformMatrix4fv(u_projectionMatrix, gl.FALSE, new Float32Array(camera.getProjectionMatrix()));
  gl.uniformMatrix4fv(u_viewMatrix, gl.FALSE, camera.getViewMatrix());
  gl.uniformMatrix4fv(u_modelMatrix, gl.FALSE, obj.getModelMatrix());

  gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0);
};

const importObject = (e, obj) => {
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
    obj.setColors(model.color);
    drawScene();
  };
  reader.readAsText(file);
};

const exportObject = () => {
  const text = document.getElementById("export").value;
  console.log(`Exporting ${text}...`);
  drawScene();
};

const changeProjection = (e, cam) => {
  cam.setProjectionMatrix(e.target.value);
  console.log(`Changing projection to ${e.target.value}...`);
  drawScene();
};

const changeViewAngle = (e, cam) => {
  const angle = parseInt(e.target.value);
  cam.cameraAngle = degToRad(angle);
  console.log(`Changing view angle to ${angle}...`);
  drawScene();
};

const changeViewZoom = (e, cam) => {
  const radius = e.target.value;
  cam.cameraRadius = radius;
  console.log(`Changing view zoom Y to ${radius}...`);
  drawScene();
};

const changeObjRotationX = (e, obj) => {
  const dist = parseInt(e.target.value);
  obj.rotation[0] = degToRad(dist);
  console.log(`Changing object rotation X to ${dist}...`);
  drawScene();
};

const changeObjRotationY = (e, obj) => {
  const dist = parseInt(e.target.value);
  obj.rotation[1] = degToRad(dist);
  console.log(`Changing object rotation Y to ${dist}...`);
  drawScene();
};

const changeObjRotationZ = (e, obj) => {
  const dist = parseInt(e.target.value);
  obj.rotation[2] = degToRad(dist);
  console.log(`Changing object rotation Z to ${dist}...`);
  drawScene();
};

const changeObjTranslationX = (e, obj) => {
  const dist = parseFloat(parseFloat(e.target.value).toFixed(2));
  obj.translation[0] = dist;
  console.log(`Changing object translation X to ${dist}...`);
  drawScene();
};

const changeObjTranslationY = (e, obj) => {
  const dist = parseFloat(parseFloat(e.target.value).toFixed(2));
  obj.translation[1] = dist;
  console.log(`Changing object translation Y to ${dist}...`);
  drawScene();
};

const changeObjTranslationZ = (e, obj) => {
  const dist = parseFloat(parseFloat(e.target.value).toFixed(2));
  obj.translation[2] = dist;
  console.log(`Changing object translation Z to ${dist}...`);
  drawScene();
};

const changeObjScaleX = (e, obj) => {
  const dist = parseFloat(parseFloat(e.target.value).toFixed(2));
  obj.scale[0] = dist;
  console.log(`Changing object scale X to ${dist}...`);
  drawScene();
};

const changeObjScaleY = (e, obj) => {
  const dist = parseFloat(parseFloat(e.target.value).toFixed(2));
  obj.scale[1] = dist;
  console.log(`Changing object scale Y to ${dist}...`);
  drawScene();
};

const changeObjScaleZ = (e, obj) => {
  const dist = parseFloat(parseFloat(e.target.value).toFixed(2));
  obj.scale[2] = dist;
  console.log(`Changing object scale Z to ${dist}...`);
  drawScene();
};

const animStart = (obj) => {
  console.log("Starting animation...");
  if(animation === null){
    animation = setInterval(() => {
      if (animDirRight === true) {
        obj.rotation[1] += degToRad(1.8);
      } else {
        obj.rotation[1] -= degToRad(1.8);
      }

      if (obj.rotation[1] >= degToRad(360)) {
        animDirRight = false;
      } else if (obj.rotation[1] <= degToRad(-360)) {
        animDirRight = true;
      }
      drawScene();
    }, 5);
  }
}

const animStop = () => {
  console.log("Stopping animation...");
  if (animation !== null) {
    clearInterval(animation);
    animation = null;
  }
}

const setupListener = (obj, cam) => {
  const elemImport = document.getElementById("importButton");
  const elemExport = document.getElementById("exportButton");
  const elemProjection = document.getElementById("projection");
  const elemViewAngle = document.getElementById("view-angle");
  const elemViewZoom = document.getElementById("view-zoom");
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

  elemImport.addEventListener("click", (e) => importObject(e, obj));
  elemExport.addEventListener("click", (e) => exportObject());
  elemProjection.addEventListener("change", (e) => changeProjection(e, cam));
  elemViewAngle.addEventListener("input", (e) => changeViewAngle(e, cam));
  elemViewZoom.addEventListener("input", (e) => changeViewZoom(e, cam));
  elemObjRotationX.addEventListener("input", (e) => changeObjRotationX(e, obj));
  elemObjRotationY.addEventListener("input", (e) => changeObjRotationY(e, obj));
  elemObjRotationZ.addEventListener("input", (e) => changeObjRotationZ(e, obj));
  elemObjTranslationX.addEventListener("input", (e) =>
    changeObjTranslationX(e, obj)
  );
  elemObjTranslationY.addEventListener("input", (e) =>
    changeObjTranslationY(e, obj)
  );
  elemObjTranslationZ.addEventListener("input", (e) =>
    changeObjTranslationZ(e, obj)
  );
  elemObjScaleX.addEventListener("input", (e) => changeObjScaleX(e, obj));
  elemObjScaleY.addEventListener("input", (e) => changeObjScaleY(e, obj));
  elemObjScaleZ.addEventListener("input", (e) => changeObjScaleZ(e, obj));
  elemAnimStart.addEventListener("click", () => animStart(obj));
  elemAnimStop.addEventListener("click", () => animStop());
};

main();
