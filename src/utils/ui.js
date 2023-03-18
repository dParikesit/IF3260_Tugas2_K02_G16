function importObjects() {
  console.log("Importing objects...");
  document.getElementById("import").click();
}

function exportObjects() {
  const text = document.getElementById("export").value;
  console.log(`Exporting ${text}...`);
}

function changeProjection(e){
  console.log(`Changing projection to ${e.target.value}...`);
}

function changeViewRotationX(e){
  console.log(`Changing view rotation X to ${e.target.value}...`);
}

function changeViewRotationY(e){
  console.log(`Changing view rotation Y to ${e.target.value}...`);
}

function changeObjRotationX(e){
  console.log(`Changing object rotation X to ${e.target.value}...`);
}

function changeObjRotationY(e){
  console.log(`Changing object rotation Y to ${e.target.value}...`);
}

function changeObjRotationZ(e){
  console.log(`Changing object rotation Z to ${e.target.value}...`);
}

function changeObjTranslationX(e){
  console.log(`Changing object translation X to ${e.target.value}...`);
}

function changeObjTranslationY(e){
  console.log(`Changing object translation Y to ${e.target.value}...`);
}

function changeObjTranslationZ(e){
  console.log(`Changing object translation Z to ${e.target.value}...`);
}

function changeObjScaleX(e){
  console.log(`Changing object scale X to ${e.target.value}...`);
}

function changeObjScaleY(e){
  console.log(`Changing object scale Y to ${e.target.value}...`);
}

function changeObjScaleZ(e){
  console.log(`Changing object scale Z to ${e.target.value}...`);
}

export function setupListener() {
  const elemImport = document.getElementById("importButton");
  const elemExport = document.getElementById("exportButton");
  const elemProjection = document.getElementById("projection");
  const elemViewRotationX = document.getElementById("view-x-rotation");
  const elemViewRotationY = document.getElementById("view-y-rotation");
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
  elemProjection.addEventListener("change", (e) => changeProjection(e));
  elemViewRotationX.addEventListener("input", (e) => changeViewRotationX(e));
  elemViewRotationY.addEventListener("input", (e) => changeViewRotationY(e));
  elemObjRotationX.addEventListener("input", (e) => changeObjRotationX(e));
  elemObjRotationY.addEventListener("input", (e) => changeObjRotationY(e));
  elemObjRotationZ.addEventListener("input", (e) => changeObjRotationZ(e));
  elemObjTranslationX.addEventListener("input", (e) => changeObjTranslationX(e));
  elemObjTranslationY.addEventListener("input", (e) => changeObjTranslationY(e));
  elemObjTranslationZ.addEventListener("input", (e) => changeObjTranslationZ(e));
  elemObjScaleX.addEventListener("input", (e) => changeObjScaleX(e));
  elemObjScaleY.addEventListener("input", (e) => changeObjScaleY(e));
  elemObjScaleZ.addEventListener("input", (e) => changeObjScaleZ(e));
}
