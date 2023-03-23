const loadShader = (gl, shaderSource, shaderType) => {
  // Create the shader object
  const shader = gl.createShader(shaderType);

  // Load the shader source
  gl.shaderSource(shader, shaderSource);

  // Compile the shader
  gl.compileShader(shader);

  // Check the compile status
  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    // Something went wrong during compilation; get the error
    const lastError = gl.getShaderInfoLog(shader);
    console.error("Error compiling shader '" + shader + "':" + lastError);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
};

const createProgram = (gl, shaders, opt_attribs) => {
  const program = gl.createProgram();

  shaders.forEach(function (shader) {
    gl.attachShader(program, shader);
  });

  if (opt_attribs) {
    opt_attribs.forEach(function (attrib, idx) {
      gl.bindAttribLocation(program, idx, attrib);
    });
  }

  gl.linkProgram(program);

  // Check the link status
  const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    // something went wrong with the link
    const lastError = gl.getProgramInfoLog(program);
    console.error("Error in program linking:" + lastError);

    gl.deleteProgram(program);
    return null;
  }
  return program;
};

const createShaderFromScript = (gl, scriptId) => {
  let shaderSource = "";
  let shaderType;

  const shaderScript = document.getElementById(scriptId);
  if (!shaderScript) {
    throw "Error: unknown script element" + scriptId;
  }
  shaderSource = shaderScript.text;

  if (shaderScript.type === "x-shader/x-vertex") {
    shaderType = gl.VERTEX_SHADER;
  } else if (shaderScript.type === "x-shader/x-fragment") {
    shaderType = gl.FRAGMENT_SHADER;
  } else if (
    shaderType !== gl.VERTEX_SHADER &&
    shaderType !== gl.FRAGMENT_SHADER
  ) {
    throw "Error: unknown shader type";
  }

  return loadShader(gl, shaderSource, shaderType);
};

const createProgramFromScripts = (gl, shaderList) => {
  const shaders = [];
  for (let i = 0; i < shaderList.length; ++i) {
    shaders.push(createShaderFromScript(gl, shaderList[i]));
  }
  return createProgram(gl, shaders);
};

const resizeCanvasToDisplaySize = (canvas) => {
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
};
