import { Projection } from "./enum.js";
import { drawObject, drawScene } from "../index.js";
import { degToRad } from "./math.js";

function importObjects() {
  console.log("Importing objects...");
  document.getElementById("import").click();
  drawScene()
  drawObject()
}

function exportObjects() {
  const text = document.getElementById("export").value;
  console.log(`Exporting ${text}...`);
  drawScene()
  drawObject()
}

function changeProjection(e, obj){
  switch (e.target.value) {
    case "perspective":
      obj.projection = Projection.PERSPECTIVE;
      break;
    case "orthographic":
      obj.projection = Projection.ORTHOGRAPHIC;
      break;
    case "oblique":
      obj.projection = Projection.OBLIQUE;
      break;

    default:
      obj.projection = Projection.PERSPECTIVE;
      break;
  }
  console.log(`Changing projection to ${e.target.value}...`);
  drawScene()
  drawObject()
}

function changeViewAngle(e, cam){
  const angle = parseInt(e.target.value);
  cam.setAngle(angle);
  console.log(`Changing view angle to ${angle}...`);
  drawObject()
}

function changeViewZoom(e, cam){
  const radius = parseInt(e.target.value);
  cam.setRadius(radius);
  console.log(`Changing view zoom Y to ${radius}...`);
  drawObject()
}

function changeObjRotationX(e, obj){
  const dist = parseInt(e.target.value);
  obj.setRotationX(degToRad(dist));
  console.log(`Changing object rotation X to ${dist}...`);
  drawObject()
}

function changeObjRotationY(e, obj){
  const dist = parseInt(e.target.value);
  obj.setRotationY(degToRad(dist));
  console.log(`Changing object rotation Y to ${dist}...`);
  drawObject()
}

function changeObjRotationZ(e, obj){
  const dist = parseInt(e.target.value);
  obj.setRotationZ(degToRad(dist));
  console.log(`Changing object rotation Z to ${dist}...`);
  drawObject()
}

function changeObjTranslationX(e, obj){
  const dist = parseFloat(parseFloat(e.target.value).toFixed(2));
  obj.setTranslationX(dist*100);
  console.log(`Changing object translation X to ${dist}...`);
  drawObject()
}

function changeObjTranslationY(e, obj){
  const dist = parseFloat(parseFloat(e.target.value).toFixed(2));
  obj.setTranslationY(dist*100);
  console.log(`Changing object translation Y to ${dist}...`);
  drawObject()
}

function changeObjTranslationZ(e, obj){
  const dist = parseFloat(parseFloat(e.target.value).toFixed(2));
  obj.setTranslationZ(dist*100);
  console.log(`Changing object translation Z to ${dist}...`);
  drawObject()
}

function changeObjScaleX(e, obj){
  const dist = parseFloat(parseFloat(e.target.value).toFixed(2));
  obj.setScaleX(dist);
  console.log(`Changing object scale X to ${dist}...`);
  drawObject()
}

function changeObjScaleY(e, obj){
  const dist = parseFloat(parseFloat(e.target.value).toFixed(2));
  obj.setScaleY(dist);
  console.log(`Changing object scale Y to ${dist}...`);
  drawObject()
}

function changeObjScaleZ(e, obj){
  const dist = parseFloat(parseFloat(e.target.value).toFixed(2));
  obj.setScaleZ(dist);
  console.log(`Changing object scale Z to ${dist}...`);
  drawObject()
}

export function setupListener(obj, cam) {
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

  elemImport.addEventListener("click", importObjects);
  elemExport.addEventListener("click", exportObjects);
  elemProjection.addEventListener("change", (e) => changeProjection(e, obj));
  elemViewAngle.addEventListener("input", (e) => changeViewAngle(e, cam));
  elemViewZoom.addEventListener("input", (e) => changeViewZoom(e, cam));
  elemObjRotationX.addEventListener("input", (e) => changeObjRotationX(e, obj));
  elemObjRotationY.addEventListener("input", (e) => changeObjRotationY(e, obj));
  elemObjRotationZ.addEventListener("input", (e) => changeObjRotationZ(e, obj));
  elemObjTranslationX.addEventListener("input", (e) => changeObjTranslationX(e, obj));
  elemObjTranslationY.addEventListener("input", (e) => changeObjTranslationY(e, obj));
  elemObjTranslationZ.addEventListener("input", (e) => changeObjTranslationZ(e, obj));
  elemObjScaleX.addEventListener("input", (e) => changeObjScaleX(e, obj));
  elemObjScaleY.addEventListener("input", (e) => changeObjScaleY(e, obj));
  elemObjScaleZ.addEventListener("input", (e) => changeObjScaleZ(e, obj));
}
