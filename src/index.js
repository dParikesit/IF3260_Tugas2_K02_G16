"use strict";
import { createProgramFromScripts } from "./utils/initializer.js";
import { m4 } from "./utils/m4.js";
import { degToRad } from "./utils/math.js";
import {
  resizeCanvasToDisplaySize,
  setColors,
  setGeometry,
} from "./utils/tools.js";

const canvas = document.querySelector("#canvas");
const gl = canvas.getContext("webgl");

// setup GLSL program
const program = createProgramFromScripts(gl, [
  "vertex-shader-3d",
  "fragment-shader-3d",
]);

// look up where the vertex data needs to go.
const positionLocation = gl.getAttribLocation(program, "a_position");
const colorLocation = gl.getAttribLocation(program, "a_color");

// lookup uniforms
const matrixLocation = gl.getUniformLocation(program, "u_matrix");

// Create a buffer to put positions in
const positionBuffer = gl.createBuffer();

// Create a buffer to put colors in
const colorBuffer = gl.createBuffer();

const translation = [-150, 0, -360];
const rotation = [degToRad(190), degToRad(40), degToRad(320)];
const scale = [1, 1, 1];
const cameraAngleRadians = degToRad(0);
const fieldOfViewRadians = degToRad(60);

const main = () => {
  if (!gl) {
    console.log("No WebGL");
    alert("WebGL isn't available");
    return;
  }
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Put geometry data into buffer
  setGeometry(gl);

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = colorBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  // Put geometry data into buffer
  setColors(gl);
  drawScene();
};

const drawScene = () => {
  resizeCanvasToDisplaySize(gl.canvas);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas AND the depth buffer.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Turn on culling. By default backfacing triangles
  // will be culled.
  gl.enable(gl.CULL_FACE);

  // Enable the depth buffer
  gl.enable(gl.DEPTH_TEST);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Turn on the position attribute
  gl.enableVertexAttribArray(positionLocation);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 3; // 3 components per iteration
  var type = gl.FLOAT; // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0; // start at the beginning of the buffer
  gl.vertexAttribPointer(
    positionLocation,
    size,
    type,
    normalize,
    stride,
    offset
  );

  // Turn on the color attribute
  gl.enableVertexAttribArray(colorLocation);

  // Bind the color buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

  // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
  var size = 3; // 3 components per iteration
  var type = gl.UNSIGNED_BYTE; // the data is 8bit unsigned values
  var normalize = true; // normalize the data (convert from 0-255 to 0-1)
  var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0; // start at the beginning of the buffer
  gl.vertexAttribPointer(colorLocation, size, type, normalize, stride, offset);

  var numFs = 5;
  var radius = 200;

  // Compute the projection matrix
  var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  var zNear = 1;
  var zFar = 2000;
  var projectionMatrix = m4.perspective(
    fieldOfViewRadians,
    aspect,
    zNear,
    zFar
  );

  // Compute the position of the first F
  var fPosition = [radius, 0, 0];

  // Use matrix math to compute a position on a circle where
  // the camera is
  var cameraMatrix = m4.yRotation(cameraAngleRadians);
  cameraMatrix = m4.translate(cameraMatrix, 0, 0, radius * 1.5);

  // Get the camera's position from the matrix we computed
  var cameraPosition = [cameraMatrix[12], cameraMatrix[13], cameraMatrix[14]];

  var up = [0, 1, 0];

  // Compute the camera's matrix using look at.
  var cameraMatrix = m4.lookAt(cameraPosition, fPosition, up);

  // Make a view matrix from the camera matrix
  var viewMatrix = m4.inverse(cameraMatrix);

  // Compute a view projection matrix
  var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

  for (var ii = 0; ii < numFs; ++ii) {
    var angle = (ii * Math.PI * 2) / numFs;
    var x = Math.cos(angle) * radius;
    var y = Math.sin(angle) * radius;

    // starting with the view projection matrix
    // compute a matrix for the F
    var matrix = m4.translate(viewProjectionMatrix, x, 0, y);

    // Set the matrix.
    gl.uniformMatrix4fv(matrixLocation, false, matrix);

    // Draw the geometry.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 16 * 6;
    gl.drawArrays(primitiveType, offset, count);
  }
};

main();
