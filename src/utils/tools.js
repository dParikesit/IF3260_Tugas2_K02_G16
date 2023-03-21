import { m4 } from "./m4.js";

function resizeCanvasToDisplaySize(canvas) {
  // Lookup the size the browser is displaying the canvas in CSS pixels.
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  const needResize =
    canvas.width !== displayWidth || canvas.height !== displayHeight;

  if (needResize) {
    // Make the canvas the same size
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }

  return needResize;
}

// Fill the buffer with the values that define a letter 'F'.
function setGeometry(gl, obj) {
  // Center the F around the origin and Flip it around. We do this because
  // we're in 3D now with and +Y is up where as before when we started with 2D
  // we had +Y as down.

  // We could do by changing all the values above but I'm lazy.
  // We could also do it with a matrix at draw time but you should
  // never do stuff at draw time if you can do it at init time.
  // var matrix = m4.xRotation(Math. PI);
  // matrix = m4.translate(matrix, -50, -75, -15);
  // matrix = m4.xRotate(matrix, 0.3);
  
  const positions = obj.getModel();

  var matrix = m4.xRotation(obj.transformation.rotation[0]);
  setPositions(positions, matrix);
  
  matrix = m4.yRotation(obj.transformation.rotation[1]);
  setPositions(positions, matrix);

  matrix = m4.zRotation(obj.transformation.rotation[2]);
  setPositions(positions, matrix);

  matrix = m4.translate(matrix, obj.transformation.translation[0], obj.transformation.translation[1], obj.transformation.translation[2]);
  setPositions(positions, matrix);
  
  matrix = m4.scale(matrix, obj.transformation.scale[0], obj.transformation.scale[1], obj.transformation.scale[2]);
  setPositions(positions, matrix);

  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

function setPositions(positions, matrix) {
  for (var ii = 0; ii < positions.length; ii += 3) {
    var vector = m4.vectorMultiply(
      [positions[ii + 0], positions[ii + 1], positions[ii + 2], 1],
      matrix
    );
    positions[ii + 0] = vector[0];
    positions[ii + 1] = vector[1];
    positions[ii + 2] = vector[2];
  }
}

// Fill the buffer with colors for the 'F'.
function setColors(gl, colors) {
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
}

export { resizeCanvasToDisplaySize, setGeometry, setColors };
