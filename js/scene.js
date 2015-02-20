// Scene class
// Array of objects that need to have the draw(gl) function defined
function Scene() {
  this.geometryArray = [];
}

Scene.prototype.add = function(obj) {
  this.geometryArray.push(obj);
}

Scene.prototype.removeById = function(id) {
  for (var i = this.geometryArray.length - 1; i >= 0; i--) {
    if (this.geometryArray[i].id == id)
      this.geometryArray.splice(i, 1);
  }
}

Scene.prototype.getNumObjectsByType = function(myType) {
  var numObjects = 0;
  for (var i = 0; i < this.geometryArray.length; i++) {
    if (this.geometryArray[i].type === myType) {
      numObjects++;
    }
  }
  return numObjects;
}