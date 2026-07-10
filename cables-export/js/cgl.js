/******/ (() => { // webpackBootstrap
/******/ 	// runtime can't be in strict mode because a global variable is assign and maybe created.
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  Framebuffer2: () => (/* reexport */ Framebuffer2),
  Geometry: () => (/* reexport */ Geometry),
  Mesh: () => (/* reexport */ Mesh),
  Shader: () => (/* reexport */ CglShader),
  Texture: () => (/* reexport */ Texture),
  Uniform: () => (/* reexport */ Uniform),
  initCGL: () => (/* binding */ initCGL)
});

// NAMESPACE OBJECT: ./src/corelibs/node_modules/gl-matrix/esm/common.js
var common_namespaceObject = {};
__webpack_require__.r(common_namespaceObject);
__webpack_require__.d(common_namespaceObject, {
  ANGLE_ORDER: () => (ANGLE_ORDER),
  ARRAY_TYPE: () => (ARRAY_TYPE),
  EPSILON: () => (EPSILON),
  RANDOM: () => (RANDOM),
  equals: () => (equals),
  round: () => (round),
  setMatrixArrayType: () => (setMatrixArrayType),
  toDegree: () => (toDegree),
  toRadian: () => (toRadian)
});

// NAMESPACE OBJECT: ./src/corelibs/node_modules/gl-matrix/esm/mat2.js
var mat2_namespaceObject = {};
__webpack_require__.r(mat2_namespaceObject);
__webpack_require__.d(mat2_namespaceObject, {
  LDU: () => (LDU),
  add: () => (add),
  adjoint: () => (adjoint),
  clone: () => (clone),
  copy: () => (copy),
  create: () => (create),
  determinant: () => (determinant),
  equals: () => (mat2_equals),
  exactEquals: () => (exactEquals),
  frob: () => (frob),
  fromRotation: () => (fromRotation),
  fromScaling: () => (fromScaling),
  fromValues: () => (fromValues),
  identity: () => (identity),
  invert: () => (invert),
  mul: () => (mul),
  multiply: () => (multiply),
  multiplyScalar: () => (multiplyScalar),
  multiplyScalarAndAdd: () => (multiplyScalarAndAdd),
  rotate: () => (rotate),
  scale: () => (scale),
  set: () => (set),
  str: () => (str),
  sub: () => (sub),
  subtract: () => (subtract),
  transpose: () => (transpose)
});

// NAMESPACE OBJECT: ./src/corelibs/node_modules/gl-matrix/esm/mat2d.js
var mat2d_namespaceObject = {};
__webpack_require__.r(mat2d_namespaceObject);
__webpack_require__.d(mat2d_namespaceObject, {
  add: () => (mat2d_add),
  clone: () => (mat2d_clone),
  copy: () => (mat2d_copy),
  create: () => (mat2d_create),
  determinant: () => (mat2d_determinant),
  equals: () => (mat2d_equals),
  exactEquals: () => (mat2d_exactEquals),
  frob: () => (mat2d_frob),
  fromRotation: () => (mat2d_fromRotation),
  fromScaling: () => (mat2d_fromScaling),
  fromTranslation: () => (fromTranslation),
  fromValues: () => (mat2d_fromValues),
  identity: () => (mat2d_identity),
  invert: () => (mat2d_invert),
  mul: () => (mat2d_mul),
  multiply: () => (mat2d_multiply),
  multiplyScalar: () => (mat2d_multiplyScalar),
  multiplyScalarAndAdd: () => (mat2d_multiplyScalarAndAdd),
  rotate: () => (mat2d_rotate),
  scale: () => (mat2d_scale),
  set: () => (mat2d_set),
  str: () => (mat2d_str),
  sub: () => (mat2d_sub),
  subtract: () => (mat2d_subtract),
  translate: () => (translate)
});

// NAMESPACE OBJECT: ./src/corelibs/node_modules/gl-matrix/esm/mat3.js
var mat3_namespaceObject = {};
__webpack_require__.r(mat3_namespaceObject);
__webpack_require__.d(mat3_namespaceObject, {
  add: () => (mat3_add),
  adjoint: () => (mat3_adjoint),
  clone: () => (mat3_clone),
  copy: () => (mat3_copy),
  create: () => (mat3_create),
  determinant: () => (mat3_determinant),
  equals: () => (mat3_equals),
  exactEquals: () => (mat3_exactEquals),
  frob: () => (mat3_frob),
  fromMat2d: () => (fromMat2d),
  fromMat4: () => (fromMat4),
  fromQuat: () => (fromQuat),
  fromRotation: () => (mat3_fromRotation),
  fromScaling: () => (mat3_fromScaling),
  fromTranslation: () => (mat3_fromTranslation),
  fromValues: () => (mat3_fromValues),
  identity: () => (mat3_identity),
  invert: () => (mat3_invert),
  mul: () => (mat3_mul),
  multiply: () => (mat3_multiply),
  multiplyScalar: () => (mat3_multiplyScalar),
  multiplyScalarAndAdd: () => (mat3_multiplyScalarAndAdd),
  normalFromMat4: () => (normalFromMat4),
  projection: () => (projection),
  rotate: () => (mat3_rotate),
  scale: () => (mat3_scale),
  set: () => (mat3_set),
  str: () => (mat3_str),
  sub: () => (mat3_sub),
  subtract: () => (mat3_subtract),
  translate: () => (mat3_translate),
  transpose: () => (mat3_transpose)
});

// NAMESPACE OBJECT: ./src/corelibs/node_modules/gl-matrix/esm/mat4.js
var mat4_namespaceObject = {};
__webpack_require__.r(mat4_namespaceObject);
__webpack_require__.d(mat4_namespaceObject, {
  add: () => (mat4_add),
  adjoint: () => (mat4_adjoint),
  clone: () => (mat4_clone),
  copy: () => (mat4_copy),
  create: () => (mat4_create),
  decompose: () => (decompose),
  determinant: () => (mat4_determinant),
  equals: () => (mat4_equals),
  exactEquals: () => (mat4_exactEquals),
  frob: () => (mat4_frob),
  fromQuat: () => (mat4_fromQuat),
  fromQuat2: () => (fromQuat2),
  fromRotation: () => (mat4_fromRotation),
  fromRotationTranslation: () => (fromRotationTranslation),
  fromRotationTranslationScale: () => (fromRotationTranslationScale),
  fromRotationTranslationScaleOrigin: () => (fromRotationTranslationScaleOrigin),
  fromScaling: () => (mat4_fromScaling),
  fromTranslation: () => (mat4_fromTranslation),
  fromValues: () => (mat4_fromValues),
  fromXRotation: () => (fromXRotation),
  fromYRotation: () => (fromYRotation),
  fromZRotation: () => (fromZRotation),
  frustum: () => (frustum),
  getRotation: () => (getRotation),
  getScaling: () => (getScaling),
  getTranslation: () => (getTranslation),
  identity: () => (mat4_identity),
  invert: () => (mat4_invert),
  lookAt: () => (lookAt),
  mul: () => (mat4_mul),
  multiply: () => (mat4_multiply),
  multiplyScalar: () => (mat4_multiplyScalar),
  multiplyScalarAndAdd: () => (mat4_multiplyScalarAndAdd),
  ortho: () => (ortho),
  orthoNO: () => (orthoNO),
  orthoZO: () => (orthoZO),
  perspective: () => (perspective),
  perspectiveFromFieldOfView: () => (perspectiveFromFieldOfView),
  perspectiveNO: () => (perspectiveNO),
  perspectiveZO: () => (perspectiveZO),
  rotate: () => (mat4_rotate),
  rotateX: () => (rotateX),
  rotateY: () => (rotateY),
  rotateZ: () => (rotateZ),
  scale: () => (mat4_scale),
  set: () => (mat4_set),
  str: () => (mat4_str),
  sub: () => (mat4_sub),
  subtract: () => (mat4_subtract),
  targetTo: () => (targetTo),
  translate: () => (mat4_translate),
  transpose: () => (mat4_transpose)
});

// NAMESPACE OBJECT: ./src/corelibs/node_modules/gl-matrix/esm/vec3.js
var vec3_namespaceObject = {};
__webpack_require__.r(vec3_namespaceObject);
__webpack_require__.d(vec3_namespaceObject, {
  add: () => (vec3_add),
  angle: () => (angle),
  bezier: () => (bezier),
  ceil: () => (ceil),
  clone: () => (vec3_clone),
  copy: () => (vec3_copy),
  create: () => (vec3_create),
  cross: () => (cross),
  dist: () => (dist),
  distance: () => (distance),
  div: () => (div),
  divide: () => (divide),
  dot: () => (vec3_dot),
  equals: () => (vec3_equals),
  exactEquals: () => (vec3_exactEquals),
  floor: () => (floor),
  forEach: () => (forEach),
  fromValues: () => (vec3_fromValues),
  hermite: () => (hermite),
  inverse: () => (inverse),
  len: () => (len),
  length: () => (vec3_length),
  lerp: () => (lerp),
  max: () => (max),
  min: () => (min),
  mul: () => (vec3_mul),
  multiply: () => (vec3_multiply),
  negate: () => (negate),
  normalize: () => (normalize),
  random: () => (random),
  rotateX: () => (vec3_rotateX),
  rotateY: () => (vec3_rotateY),
  rotateZ: () => (vec3_rotateZ),
  round: () => (vec3_round),
  scale: () => (vec3_scale),
  scaleAndAdd: () => (scaleAndAdd),
  set: () => (vec3_set),
  slerp: () => (slerp),
  sqrDist: () => (sqrDist),
  sqrLen: () => (sqrLen),
  squaredDistance: () => (squaredDistance),
  squaredLength: () => (squaredLength),
  str: () => (vec3_str),
  sub: () => (vec3_sub),
  subtract: () => (vec3_subtract),
  transformMat3: () => (transformMat3),
  transformMat4: () => (transformMat4),
  transformQuat: () => (transformQuat),
  zero: () => (zero)
});

// NAMESPACE OBJECT: ./src/corelibs/node_modules/gl-matrix/esm/vec4.js
var vec4_namespaceObject = {};
__webpack_require__.r(vec4_namespaceObject);
__webpack_require__.d(vec4_namespaceObject, {
  add: () => (vec4_add),
  ceil: () => (vec4_ceil),
  clone: () => (vec4_clone),
  copy: () => (vec4_copy),
  create: () => (vec4_create),
  cross: () => (vec4_cross),
  dist: () => (vec4_dist),
  distance: () => (vec4_distance),
  div: () => (vec4_div),
  divide: () => (vec4_divide),
  dot: () => (dot),
  equals: () => (vec4_equals),
  exactEquals: () => (vec4_exactEquals),
  floor: () => (vec4_floor),
  forEach: () => (vec4_forEach),
  fromValues: () => (vec4_fromValues),
  inverse: () => (vec4_inverse),
  len: () => (vec4_len),
  length: () => (vec4_length),
  lerp: () => (vec4_lerp),
  max: () => (vec4_max),
  min: () => (vec4_min),
  mul: () => (vec4_mul),
  multiply: () => (vec4_multiply),
  negate: () => (vec4_negate),
  normalize: () => (vec4_normalize),
  random: () => (vec4_random),
  round: () => (vec4_round),
  scale: () => (vec4_scale),
  scaleAndAdd: () => (vec4_scaleAndAdd),
  set: () => (vec4_set),
  sqrDist: () => (vec4_sqrDist),
  sqrLen: () => (vec4_sqrLen),
  squaredDistance: () => (vec4_squaredDistance),
  squaredLength: () => (vec4_squaredLength),
  str: () => (vec4_str),
  sub: () => (vec4_sub),
  subtract: () => (vec4_subtract),
  transformMat4: () => (vec4_transformMat4),
  transformQuat: () => (vec4_transformQuat),
  zero: () => (vec4_zero)
});

// NAMESPACE OBJECT: ./src/corelibs/node_modules/gl-matrix/esm/quat.js
var quat_namespaceObject = {};
__webpack_require__.r(quat_namespaceObject);
__webpack_require__.d(quat_namespaceObject, {
  add: () => (quat_add),
  calculateW: () => (calculateW),
  clone: () => (quat_clone),
  conjugate: () => (conjugate),
  copy: () => (quat_copy),
  create: () => (quat_create),
  dot: () => (quat_dot),
  equals: () => (quat_equals),
  exactEquals: () => (quat_exactEquals),
  exp: () => (exp),
  fromEuler: () => (fromEuler),
  fromMat3: () => (fromMat3),
  fromValues: () => (quat_fromValues),
  getAngle: () => (getAngle),
  getAxisAngle: () => (getAxisAngle),
  identity: () => (quat_identity),
  invert: () => (quat_invert),
  len: () => (quat_len),
  length: () => (quat_length),
  lerp: () => (quat_lerp),
  ln: () => (ln),
  mul: () => (quat_mul),
  multiply: () => (quat_multiply),
  normalize: () => (quat_normalize),
  pow: () => (pow),
  random: () => (quat_random),
  rotateX: () => (quat_rotateX),
  rotateY: () => (quat_rotateY),
  rotateZ: () => (quat_rotateZ),
  rotationTo: () => (rotationTo),
  scale: () => (quat_scale),
  set: () => (quat_set),
  setAxes: () => (setAxes),
  setAxisAngle: () => (setAxisAngle),
  slerp: () => (quat_slerp),
  sqlerp: () => (sqlerp),
  sqrLen: () => (quat_sqrLen),
  squaredLength: () => (quat_squaredLength),
  str: () => (quat_str)
});

// NAMESPACE OBJECT: ./src/corelibs/node_modules/gl-matrix/esm/quat2.js
var quat2_namespaceObject = {};
__webpack_require__.r(quat2_namespaceObject);
__webpack_require__.d(quat2_namespaceObject, {
  add: () => (quat2_add),
  clone: () => (quat2_clone),
  conjugate: () => (quat2_conjugate),
  copy: () => (quat2_copy),
  create: () => (quat2_create),
  dot: () => (quat2_dot),
  equals: () => (quat2_equals),
  exactEquals: () => (quat2_exactEquals),
  fromMat4: () => (quat2_fromMat4),
  fromRotation: () => (quat2_fromRotation),
  fromRotationTranslation: () => (quat2_fromRotationTranslation),
  fromRotationTranslationValues: () => (fromRotationTranslationValues),
  fromTranslation: () => (quat2_fromTranslation),
  fromValues: () => (quat2_fromValues),
  getDual: () => (getDual),
  getReal: () => (getReal),
  getTranslation: () => (quat2_getTranslation),
  identity: () => (quat2_identity),
  invert: () => (quat2_invert),
  len: () => (quat2_len),
  length: () => (quat2_length),
  lerp: () => (quat2_lerp),
  mul: () => (quat2_mul),
  multiply: () => (quat2_multiply),
  normalize: () => (quat2_normalize),
  rotateAroundAxis: () => (rotateAroundAxis),
  rotateByQuatAppend: () => (rotateByQuatAppend),
  rotateByQuatPrepend: () => (rotateByQuatPrepend),
  rotateX: () => (quat2_rotateX),
  rotateY: () => (quat2_rotateY),
  rotateZ: () => (quat2_rotateZ),
  scale: () => (quat2_scale),
  set: () => (quat2_set),
  setDual: () => (setDual),
  setReal: () => (setReal),
  sqrLen: () => (quat2_sqrLen),
  squaredLength: () => (quat2_squaredLength),
  str: () => (quat2_str),
  translate: () => (quat2_translate)
});

// NAMESPACE OBJECT: ./src/corelibs/node_modules/gl-matrix/esm/vec2.js
var vec2_namespaceObject = {};
__webpack_require__.r(vec2_namespaceObject);
__webpack_require__.d(vec2_namespaceObject, {
  add: () => (vec2_add),
  angle: () => (vec2_angle),
  ceil: () => (vec2_ceil),
  clone: () => (vec2_clone),
  copy: () => (vec2_copy),
  create: () => (vec2_create),
  cross: () => (vec2_cross),
  dist: () => (vec2_dist),
  distance: () => (vec2_distance),
  div: () => (vec2_div),
  divide: () => (vec2_divide),
  dot: () => (vec2_dot),
  equals: () => (vec2_equals),
  exactEquals: () => (vec2_exactEquals),
  floor: () => (vec2_floor),
  forEach: () => (vec2_forEach),
  fromValues: () => (vec2_fromValues),
  inverse: () => (vec2_inverse),
  len: () => (vec2_len),
  length: () => (vec2_length),
  lerp: () => (vec2_lerp),
  max: () => (vec2_max),
  min: () => (vec2_min),
  mul: () => (vec2_mul),
  multiply: () => (vec2_multiply),
  negate: () => (vec2_negate),
  normalize: () => (vec2_normalize),
  random: () => (vec2_random),
  rotate: () => (vec2_rotate),
  round: () => (vec2_round),
  scale: () => (vec2_scale),
  scaleAndAdd: () => (vec2_scaleAndAdd),
  set: () => (vec2_set),
  signedAngle: () => (signedAngle),
  sqrDist: () => (vec2_sqrDist),
  sqrLen: () => (vec2_sqrLen),
  squaredDistance: () => (vec2_squaredDistance),
  squaredLength: () => (vec2_squaredLength),
  str: () => (vec2_str),
  sub: () => (vec2_sub),
  subtract: () => (vec2_subtract),
  transformMat2: () => (transformMat2),
  transformMat2d: () => (transformMat2d),
  transformMat3: () => (vec2_transformMat3),
  transformMat4: () => (vec2_transformMat4),
  zero: () => (vec2_zero)
});

;// CONCATENATED MODULE: external "CABLES"
const external_CABLES_namespaceObject = CABLES;
;// CONCATENATED MODULE: external "CABLES.SHARED"
const external_CABLES_SHARED_namespaceObject = CABLES.SHARED;
;// CONCATENATED MODULE: ./src/corelibs/node_modules/gl-matrix/esm/common.js
/**
 * Common utilities
 * @module glMatrix
 */

// Configuration Constants
var EPSILON = 0.000001;
var ARRAY_TYPE = typeof Float32Array !== "undefined" ? Float32Array : Array;
var RANDOM = Math.random;
var ANGLE_ORDER = "zyx";

/**
 * Symmetric round
 * see https://www.npmjs.com/package/round-half-up-symmetric#user-content-detailed-background
 *
 * @param {Number} a value to round
 */
function round(a) {
  if (a >= 0) return Math.round(a);
  return a % 0.5 === 0 ? Math.floor(a) : Math.round(a);
}

/**
 * Sets the type of array used when creating new vectors and matrices
 *
 * @param {Float32ArrayConstructor | ArrayConstructor} type Array type, such as Float32Array or Array
 */
function setMatrixArrayType(type) {
  ARRAY_TYPE = type;
}
var degree = Math.PI / 180;
var radian = 180 / Math.PI;

/**
 * Convert Degree To Radian
 *
 * @param {Number} a Angle in Degrees
 */
function toRadian(a) {
  return a * degree;
}

/**
 * Convert Radian To Degree
 *
 * @param {Number} a Angle in Radians
 */
function toDegree(a) {
  return a * radian;
}

/**
 * Tests whether or not the arguments have approximately the same value, within an absolute
 * or relative tolerance of glMatrix.EPSILON (an absolute tolerance is used for values less
 * than or equal to 1.0, and a relative tolerance is used for larger values)
 *
 * @param {Number} a          The first number to test.
 * @param {Number} b          The second number to test.
 * @param {Number} tolerance  Absolute or relative tolerance (default glMatrix.EPSILON)
 * @returns {Boolean} True if the numbers are approximately equal, false otherwise.
 */
function equals(a, b) {
  var tolerance = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : EPSILON;
  return Math.abs(a - b) <= tolerance * Math.max(1, Math.abs(a), Math.abs(b));
}
;// CONCATENATED MODULE: ./src/corelibs/node_modules/gl-matrix/esm/mat2.js


/**
 * 2x2 Matrix
 * @module mat2
 */

/**
 * Creates a new identity mat2
 *
 * @returns {mat2} a new 2x2 matrix
 */
function create() {
  var out = new ARRAY_TYPE(4);
  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
  }
  out[0] = 1;
  out[3] = 1;
  return out;
}

/**
 * Creates a new mat2 initialized with values from an existing matrix
 *
 * @param {ReadonlyMat2} a matrix to clone
 * @returns {mat2} a new 2x2 matrix
 */
function clone(a) {
  var out = new ARRAY_TYPE(4);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}

/**
 * Copy the values from one mat2 to another
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the source matrix
 * @returns {mat2} out
 */
function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}

/**
 * Set a mat2 to the identity matrix
 *
 * @param {mat2} out the receiving matrix
 * @returns {mat2} out
 */
function identity(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  return out;
}

/**
 * Create a new mat2 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m10 Component in column 1, row 0 position (index 2)
 * @param {Number} m11 Component in column 1, row 1 position (index 3)
 * @returns {mat2} out A new 2x2 matrix
 */
function fromValues(m00, m01, m10, m11) {
  var out = new ARRAY_TYPE(4);
  out[0] = m00;
  out[1] = m01;
  out[2] = m10;
  out[3] = m11;
  return out;
}

/**
 * Set the components of a mat2 to the given values
 *
 * @param {mat2} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m10 Component in column 1, row 0 position (index 2)
 * @param {Number} m11 Component in column 1, row 1 position (index 3)
 * @returns {mat2} out
 */
function set(out, m00, m01, m10, m11) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m10;
  out[3] = m11;
  return out;
}

/**
 * Transpose the values of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the source matrix
 * @returns {mat2} out
 */
function transpose(out, a) {
  // If we are transposing ourselves we can skip a few steps but have to cache
  // some values
  if (out === a) {
    var a1 = a[1];
    out[1] = a[2];
    out[2] = a1;
  } else {
    out[0] = a[0];
    out[1] = a[2];
    out[2] = a[1];
    out[3] = a[3];
  }
  return out;
}

/**
 * Inverts a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the source matrix
 * @returns {mat2 | null} out, or null if source matrix is not invertible
 */
function invert(out, a) {
  var a0 = a[0],
    a1 = a[1],
    a2 = a[2],
    a3 = a[3];

  // Calculate the determinant
  var det = a0 * a3 - a2 * a1;
  if (!det) {
    return null;
  }
  det = 1.0 / det;
  out[0] = a3 * det;
  out[1] = -a1 * det;
  out[2] = -a2 * det;
  out[3] = a0 * det;
  return out;
}

/**
 * Calculates the adjugate of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the source matrix
 * @returns {mat2} out
 */
function adjoint(out, a) {
  // Caching this value is necessary if out == a
  var a0 = a[0];
  out[0] = a[3];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a0;
  return out;
}

/**
 * Calculates the determinant of a mat2
 *
 * @param {ReadonlyMat2} a the source matrix
 * @returns {Number} determinant of a
 */
function determinant(a) {
  return a[0] * a[3] - a[2] * a[1];
}

/**
 * Multiplies two mat2's
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the first operand
 * @param {ReadonlyMat2} b the second operand
 * @returns {mat2} out
 */
function multiply(out, a, b) {
  var a0 = a[0],
    a1 = a[1],
    a2 = a[2],
    a3 = a[3];
  var b0 = b[0],
    b1 = b[1],
    b2 = b[2],
    b3 = b[3];
  out[0] = a0 * b0 + a2 * b1;
  out[1] = a1 * b0 + a3 * b1;
  out[2] = a0 * b2 + a2 * b3;
  out[3] = a1 * b2 + a3 * b3;
  return out;
}

/**
 * Rotates a mat2 by the given angle
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2} out
 */
function rotate(out, a, rad) {
  var a0 = a[0],
    a1 = a[1],
    a2 = a[2],
    a3 = a[3];
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = a0 * c + a2 * s;
  out[1] = a1 * c + a3 * s;
  out[2] = a0 * -s + a2 * c;
  out[3] = a1 * -s + a3 * c;
  return out;
}

/**
 * Scales the mat2 by the dimensions in the given vec2
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the matrix to rotate
 * @param {ReadonlyVec2} v the vec2 to scale the matrix by
 * @returns {mat2} out
 **/
function scale(out, a, v) {
  var a0 = a[0],
    a1 = a[1],
    a2 = a[2],
    a3 = a[3];
  var v0 = v[0],
    v1 = v[1];
  out[0] = a0 * v0;
  out[1] = a1 * v0;
  out[2] = a2 * v1;
  out[3] = a3 * v1;
  return out;
}

/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat2.identity(dest);
 *     mat2.rotate(dest, dest, rad);
 *
 * @param {mat2} out mat2 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2} out
 */
function fromRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = c;
  out[1] = s;
  out[2] = -s;
  out[3] = c;
  return out;
}

/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat2.identity(dest);
 *     mat2.scale(dest, dest, vec);
 *
 * @param {mat2} out mat2 receiving operation result
 * @param {ReadonlyVec2} v Scaling vector
 * @returns {mat2} out
 */
function fromScaling(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = v[1];
  return out;
}

/**
 * Returns a string representation of a mat2
 *
 * @param {ReadonlyMat2} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
function str(a) {
  return "mat2(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
}

/**
 * Returns Frobenius norm of a mat2
 *
 * @param {ReadonlyMat2} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
function frob(a) {
  return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2] + a[3] * a[3]);
}

/**
 * Returns L, D and U matrices (Lower triangular, Diagonal and Upper triangular) by factorizing the input matrix
 * @param {ReadonlyMat2} L the lower triangular matrix
 * @param {ReadonlyMat2} D the diagonal matrix
 * @param {ReadonlyMat2} U the upper triangular matrix
 * @param {ReadonlyMat2} a the input matrix to factorize
 */

function LDU(L, D, U, a) {
  L[2] = a[2] / a[0];
  U[0] = a[0];
  U[1] = a[1];
  U[3] = a[3] - L[2] * U[1];
  return [L, D, U];
}

/**
 * Adds two mat2's
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the first operand
 * @param {ReadonlyMat2} b the second operand
 * @returns {mat2} out
 */
function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  return out;
}

/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the first operand
 * @param {ReadonlyMat2} b the second operand
 * @returns {mat2} out
 */
function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  return out;
}

/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyMat2} a The first matrix.
 * @param {ReadonlyMat2} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {ReadonlyMat2} a The first matrix.
 * @param {ReadonlyMat2} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
function mat2_equals(a, b) {
  var a0 = a[0],
    a1 = a[1],
    a2 = a[2],
    a3 = a[3];
  var b0 = b[0],
    b1 = b[1],
    b2 = b[2],
    b3 = b[3];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3));
}

/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat2} out
 */
function multiplyScalar(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  return out;
}

/**
 * Adds two mat2's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat2} out the receiving vector
 * @param {ReadonlyMat2} a the first operand
 * @param {ReadonlyMat2} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat2} out
 */
function multiplyScalarAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  return out;
}

/**
 * Alias for {@link mat2.multiply}
 * @function
 */
var mul = multiply;

/**
 * Alias for {@link mat2.subtract}
 * @function
 */
var sub = subtract;
;// CONCATENATED MODULE: ./src/corelibs/node_modules/gl-matrix/esm/mat2d.js


/**
 * 2x3 Matrix
 * @module mat2d
 * @description
 * A mat2d contains six elements defined as:
 * <pre>
 * [a, b,
 *  c, d,
 *  tx, ty]
 * </pre>
 * This is a short form for the 3x3 matrix:
 * <pre>
 * [a, b, 0,
 *  c, d, 0,
 *  tx, ty, 1]
 * </pre>
 * The last column is ignored so the array is shorter and operations are faster.
 */

/**
 * Creates a new identity mat2d
 *
 * @returns {mat2d} a new 2x3 matrix
 */
function mat2d_create() {
  var out = new ARRAY_TYPE(6);
  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[4] = 0;
    out[5] = 0;
  }
  out[0] = 1;
  out[3] = 1;
  return out;
}

/**
 * Creates a new mat2d initialized with values from an existing matrix
 *
 * @param {ReadonlyMat2d} a matrix to clone
 * @returns {mat2d} a new 2x3 matrix
 */
function mat2d_clone(a) {
  var out = new ARRAY_TYPE(6);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  return out;
}

/**
 * Copy the values from one mat2d to another
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the source matrix
 * @returns {mat2d} out
 */
function mat2d_copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  return out;
}

/**
 * Set a mat2d to the identity matrix
 *
 * @param {mat2d} out the receiving matrix
 * @returns {mat2d} out
 */
function mat2d_identity(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = 0;
  out[5] = 0;
  return out;
}

/**
 * Create a new mat2d with the given values
 *
 * @param {Number} a Component A (index 0)
 * @param {Number} b Component B (index 1)
 * @param {Number} c Component C (index 2)
 * @param {Number} d Component D (index 3)
 * @param {Number} tx Component TX (index 4)
 * @param {Number} ty Component TY (index 5)
 * @returns {mat2d} A new mat2d
 */
function mat2d_fromValues(a, b, c, d, tx, ty) {
  var out = new ARRAY_TYPE(6);
  out[0] = a;
  out[1] = b;
  out[2] = c;
  out[3] = d;
  out[4] = tx;
  out[5] = ty;
  return out;
}

/**
 * Set the components of a mat2d to the given values
 *
 * @param {mat2d} out the receiving matrix
 * @param {Number} a Component A (index 0)
 * @param {Number} b Component B (index 1)
 * @param {Number} c Component C (index 2)
 * @param {Number} d Component D (index 3)
 * @param {Number} tx Component TX (index 4)
 * @param {Number} ty Component TY (index 5)
 * @returns {mat2d} out
 */
function mat2d_set(out, a, b, c, d, tx, ty) {
  out[0] = a;
  out[1] = b;
  out[2] = c;
  out[3] = d;
  out[4] = tx;
  out[5] = ty;
  return out;
}

/**
 * Inverts a mat2d
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the source matrix
 * @returns {mat2d | null} out, or null if source matrix is not invertible
 */
function mat2d_invert(out, a) {
  var aa = a[0],
    ab = a[1],
    ac = a[2],
    ad = a[3];
  var atx = a[4],
    aty = a[5];
  var det = aa * ad - ab * ac;
  if (!det) {
    return null;
  }
  det = 1.0 / det;
  out[0] = ad * det;
  out[1] = -ab * det;
  out[2] = -ac * det;
  out[3] = aa * det;
  out[4] = (ac * aty - ad * atx) * det;
  out[5] = (ab * atx - aa * aty) * det;
  return out;
}

/**
 * Calculates the determinant of a mat2d
 *
 * @param {ReadonlyMat2d} a the source matrix
 * @returns {Number} determinant of a
 */
function mat2d_determinant(a) {
  return a[0] * a[3] - a[1] * a[2];
}

/**
 * Multiplies two mat2d's
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the first operand
 * @param {ReadonlyMat2d} b the second operand
 * @returns {mat2d} out
 */
function mat2d_multiply(out, a, b) {
  var a0 = a[0],
    a1 = a[1],
    a2 = a[2],
    a3 = a[3],
    a4 = a[4],
    a5 = a[5];
  var b0 = b[0],
    b1 = b[1],
    b2 = b[2],
    b3 = b[3],
    b4 = b[4],
    b5 = b[5];
  out[0] = a0 * b0 + a2 * b1;
  out[1] = a1 * b0 + a3 * b1;
  out[2] = a0 * b2 + a2 * b3;
  out[3] = a1 * b2 + a3 * b3;
  out[4] = a0 * b4 + a2 * b5 + a4;
  out[5] = a1 * b4 + a3 * b5 + a5;
  return out;
}

/**
 * Rotates a mat2d by the given angle
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2d} out
 */
function mat2d_rotate(out, a, rad) {
  var a0 = a[0],
    a1 = a[1],
    a2 = a[2],
    a3 = a[3],
    a4 = a[4],
    a5 = a[5];
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = a0 * c + a2 * s;
  out[1] = a1 * c + a3 * s;
  out[2] = a0 * -s + a2 * c;
  out[3] = a1 * -s + a3 * c;
  out[4] = a4;
  out[5] = a5;
  return out;
}

/**
 * Scales the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the matrix to translate
 * @param {ReadonlyVec2} v the vec2 to scale the matrix by
 * @returns {mat2d} out
 **/
function mat2d_scale(out, a, v) {
  var a0 = a[0],
    a1 = a[1],
    a2 = a[2],
    a3 = a[3],
    a4 = a[4],
    a5 = a[5];
  var v0 = v[0],
    v1 = v[1];
  out[0] = a0 * v0;
  out[1] = a1 * v0;
  out[2] = a2 * v1;
  out[3] = a3 * v1;
  out[4] = a4;
  out[5] = a5;
  return out;
}

/**
 * Translates the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the matrix to translate
 * @param {ReadonlyVec2} v the vec2 to translate the matrix by
 * @returns {mat2d} out
 **/
function translate(out, a, v) {
  var a0 = a[0],
    a1 = a[1],
    a2 = a[2],
    a3 = a[3],
    a4 = a[4],
    a5 = a[5];
  var v0 = v[0],
    v1 = v[1];
  out[0] = a0;
  out[1] = a1;
  out[2] = a2;
  out[3] = a3;
  out[4] = a0 * v0 + a2 * v1 + a4;
  out[5] = a1 * v0 + a3 * v1 + a5;
  return out;
}

/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.rotate(dest, dest, rad);
 *
 * @param {mat2d} out mat2d receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2d} out
 */
function mat2d_fromRotation(out, rad) {
  var s = Math.sin(rad),
    c = Math.cos(rad);
  out[0] = c;
  out[1] = s;
  out[2] = -s;
  out[3] = c;
  out[4] = 0;
  out[5] = 0;
  return out;
}

/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.scale(dest, dest, vec);
 *
 * @param {mat2d} out mat2d receiving operation result
 * @param {ReadonlyVec2} v Scaling vector
 * @returns {mat2d} out
 */
function mat2d_fromScaling(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = v[1];
  out[4] = 0;
  out[5] = 0;
  return out;
}

/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.translate(dest, dest, vec);
 *
 * @param {mat2d} out mat2d receiving operation result
 * @param {ReadonlyVec2} v Translation vector
 * @returns {mat2d} out
 */
function fromTranslation(out, v) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = v[0];
  out[5] = v[1];
  return out;
}

/**
 * Returns a string representation of a mat2d
 *
 * @param {ReadonlyMat2d} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
function mat2d_str(a) {
  return "mat2d(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ")";
}

/**
 * Returns Frobenius norm of a mat2d
 *
 * @param {ReadonlyMat2d} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
function mat2d_frob(a) {
  return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2] + a[3] * a[3] + a[4] * a[4] + a[5] * a[5] + 1);
}

/**
 * Adds two mat2d's
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the first operand
 * @param {ReadonlyMat2d} b the second operand
 * @returns {mat2d} out
 */
function mat2d_add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  return out;
}

/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the first operand
 * @param {ReadonlyMat2d} b the second operand
 * @returns {mat2d} out
 */
function mat2d_subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  return out;
}

/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat2d} out
 */
function mat2d_multiplyScalar(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  return out;
}

/**
 * Adds two mat2d's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat2d} out the receiving vector
 * @param {ReadonlyMat2d} a the first operand
 * @param {ReadonlyMat2d} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat2d} out
 */
function mat2d_multiplyScalarAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  out[4] = a[4] + b[4] * scale;
  out[5] = a[5] + b[5] * scale;
  return out;
}

/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyMat2d} a The first matrix.
 * @param {ReadonlyMat2d} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
function mat2d_exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5];
}

/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {ReadonlyMat2d} a The first matrix.
 * @param {ReadonlyMat2d} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
function mat2d_equals(a, b) {
  var a0 = a[0],
    a1 = a[1],
    a2 = a[2],
    a3 = a[3],
    a4 = a[4],
    a5 = a[5];
  var b0 = b[0],
    b1 = b[1],
    b2 = b[2],
    b3 = b[3],
    b4 = b[4],
    b5 = b[5];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5));
}

/**
 * Alias for {@link mat2d.multiply}
 * @function
 */
var mat2d_mul = mat2d_multiply;

/**
 * Alias for {@link mat2d.subtract}
 * @function
 */
var mat2d_sub = mat2d_subtract;
;// CONCATENATED MODULE: ./src/corelibs/node_modules/gl-matrix/esm/mat3.js


/**
 * 3x3 Matrix
 * @module mat3
 */

/**
 * Creates a new identity mat3
 *
 * @returns {mat3} a new 3x3 matrix
 */
function mat3_create() {
  var out = new ARRAY_TYPE(9);
  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
  }
  out[0] = 1;
  out[4] = 1;
  out[8] = 1;
  return out;
}

/**
 * Copies the upper-left 3x3 values into the given mat3.
 *
 * @param {mat3} out the receiving 3x3 matrix
 * @param {ReadonlyMat4} a   the source 4x4 matrix
 * @returns {mat3} out
 */
function fromMat4(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[4];
  out[4] = a[5];
  out[5] = a[6];
  out[6] = a[8];
  out[7] = a[9];
  out[8] = a[10];
  return out;
}

/**
 * Creates a new mat3 initialized with values from an existing matrix
 *
 * @param {ReadonlyMat3} a matrix to clone
 * @returns {mat3} a new 3x3 matrix
 */
function mat3_clone(a) {
  var out = new ARRAY_TYPE(9);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  return out;
}

/**
 * Copy the values from one mat3 to another
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the source matrix
 * @returns {mat3} out
 */
function mat3_copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  return out;
}

/**
 * Create a new mat3 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m10 Component in column 1, row 0 position (index 3)
 * @param {Number} m11 Component in column 1, row 1 position (index 4)
 * @param {Number} m12 Component in column 1, row 2 position (index 5)
 * @param {Number} m20 Component in column 2, row 0 position (index 6)
 * @param {Number} m21 Component in column 2, row 1 position (index 7)
 * @param {Number} m22 Component in column 2, row 2 position (index 8)
 * @returns {mat3} A new mat3
 */
function mat3_fromValues(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
  var out = new ARRAY_TYPE(9);
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m10;
  out[4] = m11;
  out[5] = m12;
  out[6] = m20;
  out[7] = m21;
  out[8] = m22;
  return out;
}

/**
 * Set the components of a mat3 to the given values
 *
 * @param {mat3} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m10 Component in column 1, row 0 position (index 3)
 * @param {Number} m11 Component in column 1, row 1 position (index 4)
 * @param {Number} m12 Component in column 1, row 2 position (index 5)
 * @param {Number} m20 Component in column 2, row 0 position (index 6)
 * @param {Number} m21 Component in column 2, row 1 position (index 7)
 * @param {Number} m22 Component in column 2, row 2 position (index 8)
 * @returns {mat3} out
 */
function mat3_set(out, m00, m01, m02, m10, m11, m12, m20, m21, m22) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m10;
  out[4] = m11;
  out[5] = m12;
  out[6] = m20;
  out[7] = m21;
  out[8] = m22;
  return out;
}

/**
 * Set a mat3 to the identity matrix
 *
 * @param {mat3} out the receiving matrix
 * @returns {mat3} out
 */
function mat3_identity(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 1;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  out[8] = 1;
  return out;
}

/**
 * Transpose the values of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the source matrix
 * @returns {mat3} out
 */
function mat3_transpose(out, a) {
  // If we are transposing ourselves we can skip a few steps but have to cache some values
  if (out === a) {
    var a01 = a[1],
      a02 = a[2],
      a12 = a[5];
    out[1] = a[3];
    out[2] = a[6];
    out[3] = a01;
    out[5] = a[7];
    out[6] = a02;
    out[7] = a12;
  } else {
    out[0] = a[0];
    out[1] = a[3];
    out[2] = a[6];
    out[3] = a[1];
    out[4] = a[4];
    out[5] = a[7];
    out[6] = a[2];
    out[7] = a[5];
    out[8] = a[8];
  }
  return out;
}

/**
 * Inverts a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the source matrix
 * @returns {mat3 | null} out, or null if source matrix is not invertible
 */
function mat3_invert(out, a) {
  var a00 = a[0],
    a01 = a[1],
    a02 = a[2];
  var a10 = a[3],
    a11 = a[4],
    a12 = a[5];
  var a20 = a[6],
    a21 = a[7],
    a22 = a[8];
  var b01 = a22 * a11 - a12 * a21;
  var b11 = -a22 * a10 + a12 * a20;
  var b21 = a21 * a10 - a11 * a20;

  // Calculate the determinant
  var det = a00 * b01 + a01 * b11 + a02 * b21;
  if (!det) {
    return null;
  }
  det = 1.0 / det;
  out[0] = b01 * det;
  out[1] = (-a22 * a01 + a02 * a21) * det;
  out[2] = (a12 * a01 - a02 * a11) * det;
  out[3] = b11 * det;
  out[4] = (a22 * a00 - a02 * a20) * det;
  out[5] = (-a12 * a00 + a02 * a10) * det;
  out[6] = b21 * det;
  out[7] = (-a21 * a00 + a01 * a20) * det;
  out[8] = (a11 * a00 - a01 * a10) * det;
  return out;
}

/**
 * Calculates the adjugate of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the source matrix
 * @returns {mat3} out
 */
function mat3_adjoint(out, a) {
  var a00 = a[0],
    a01 = a[1],
    a02 = a[2];
  var a10 = a[3],
    a11 = a[4],
    a12 = a[5];
  var a20 = a[6],
    a21 = a[7],
    a22 = a[8];
  out[0] = a11 * a22 - a12 * a21;
  out[1] = a02 * a21 - a01 * a22;
  out[2] = a01 * a12 - a02 * a11;
  out[3] = a12 * a20 - a10 * a22;
  out[4] = a00 * a22 - a02 * a20;
  out[5] = a02 * a10 - a00 * a12;
  out[6] = a10 * a21 - a11 * a20;
  out[7] = a01 * a20 - a00 * a21;
  out[8] = a00 * a11 - a01 * a10;
  return out;
}

/**
 * Calculates the determinant of a mat3
 *
 * @param {ReadonlyMat3} a the source matrix
 * @returns {Number} determinant of a
 */
function mat3_determinant(a) {
  var a00 = a[0],
    a01 = a[1],
    a02 = a[2];
  var a10 = a[3],
    a11 = a[4],
    a12 = a[5];
  var a20 = a[6],
    a21 = a[7],
    a22 = a[8];
  return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
}

/**
 * Multiplies two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the first operand
 * @param {ReadonlyMat3} b the second operand
 * @returns {mat3} out
 */
function mat3_multiply(out, a, b) {
  var a00 = a[0],
    a01 = a[1],
    a02 = a[2];
  var a10 = a[3],
    a11 = a[4],
    a12 = a[5];
  var a20 = a[6],
    a21 = a[7],
    a22 = a[8];
  var b00 = b[0],
    b01 = b[1],
    b02 = b[2];
  var b10 = b[3],
    b11 = b[4],
    b12 = b[5];
  var b20 = b[6],
    b21 = b[7],
    b22 = b[8];
  out[0] = b00 * a00 + b01 * a10 + b02 * a20;
  out[1] = b00 * a01 + b01 * a11 + b02 * a21;
  out[2] = b00 * a02 + b01 * a12 + b02 * a22;
  out[3] = b10 * a00 + b11 * a10 + b12 * a20;
  out[4] = b10 * a01 + b11 * a11 + b12 * a21;
  out[5] = b10 * a02 + b11 * a12 + b12 * a22;
  out[6] = b20 * a00 + b21 * a10 + b22 * a20;
  out[7] = b20 * a01 + b21 * a11 + b22 * a21;
  out[8] = b20 * a02 + b21 * a12 + b22 * a22;
  return out;
}

/**
 * Translate a mat3 by the given vector
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the matrix to translate
 * @param {ReadonlyVec2} v vector to translate by
 * @returns {mat3} out
 */
function mat3_translate(out, a, v) {
  var a00 = a[0],
    a01 = a[1],
    a02 = a[2],
    a10 = a[3],
    a11 = a[4],
    a12 = a[5],
    a20 = a[6],
    a21 = a[7],
    a22 = a[8],
    x = v[0],
    y = v[1];
  out[0] = a00;
  out[1] = a01;
  out[2] = a02;
  out[3] = a10;
  out[4] = a11;
  out[5] = a12;
  out[6] = x * a00 + y * a10 + a20;
  out[7] = x * a01 + y * a11 + a21;
  out[8] = x * a02 + y * a12 + a22;
  return out;
}

/**
 * Rotates a mat3 by the given angle
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */
function mat3_rotate(out, a, rad) {
  var a00 = a[0],
    a01 = a[1],
    a02 = a[2],
    a10 = a[3],
    a11 = a[4],
    a12 = a[5],
    a20 = a[6],
    a21 = a[7],
    a22 = a[8],
    s = Math.sin(rad),
    c = Math.cos(rad);
  out[0] = c * a00 + s * a10;
  out[1] = c * a01 + s * a11;
  out[2] = c * a02 + s * a12;
  out[3] = c * a10 - s * a00;
  out[4] = c * a11 - s * a01;
  out[5] = c * a12 - s * a02;
  out[6] = a20;
  out[7] = a21;
  out[8] = a22;
  return out;
}

/**
 * Scales the mat3 by the dimensions in the given vec2
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the matrix to scale
 * @param {ReadonlyVec2} v the vec2 to scale the matrix by
 * @returns {mat3} out
 **/
function mat3_scale(out, a, v) {
  var x = v[0],
    y = v[1];
  out[0] = x * a[0];
  out[1] = x * a[1];
  out[2] = x * a[2];
  out[3] = y * a[3];
  out[4] = y * a[4];
  out[5] = y * a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  return out;
}

/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.translate(dest, dest, vec);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {ReadonlyVec2} v Translation vector
 * @returns {mat3} out
 */
function mat3_fromTranslation(out, v) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 1;
  out[5] = 0;
  out[6] = v[0];
  out[7] = v[1];
  out[8] = 1;
  return out;
}

/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.rotate(dest, dest, rad);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */
function mat3_fromRotation(out, rad) {
  var s = Math.sin(rad),
    c = Math.cos(rad);
  out[0] = c;
  out[1] = s;
  out[2] = 0;
  out[3] = -s;
  out[4] = c;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  out[8] = 1;
  return out;
}

/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.scale(dest, dest, vec);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {ReadonlyVec2} v Scaling vector
 * @returns {mat3} out
 */
function mat3_fromScaling(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = v[1];
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  out[8] = 1;
  return out;
}

/**
 * Copies the values from a mat2d into a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat2d} a the matrix to copy
 * @returns {mat3} out
 **/
function fromMat2d(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = 0;
  out[3] = a[2];
  out[4] = a[3];
  out[5] = 0;
  out[6] = a[4];
  out[7] = a[5];
  out[8] = 1;
  return out;
}

/**
 * Calculates a 3x3 matrix from the given quaternion
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {ReadonlyQuat} q Quaternion to create matrix from
 *
 * @returns {mat3} out
 */
function fromQuat(out, q) {
  var x = q[0],
    y = q[1],
    z = q[2],
    w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var yx = y * x2;
  var yy = y * y2;
  var zx = z * x2;
  var zy = z * y2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - yy - zz;
  out[3] = yx - wz;
  out[6] = zx + wy;
  out[1] = yx + wz;
  out[4] = 1 - xx - zz;
  out[7] = zy - wx;
  out[2] = zx - wy;
  out[5] = zy + wx;
  out[8] = 1 - xx - yy;
  return out;
}

/**
 * Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {ReadonlyMat4} a Mat4 to derive the normal matrix from
 *
 * @returns {mat3} out
 */
function normalFromMat4(out, a) {
  var a00 = a[0],
    a01 = a[1],
    a02 = a[2],
    a03 = a[3];
  var a10 = a[4],
    a11 = a[5],
    a12 = a[6],
    a13 = a[7];
  var a20 = a[8],
    a21 = a[9],
    a22 = a[10],
    a23 = a[11];
  var a30 = a[12],
    a31 = a[13],
    a32 = a[14],
    a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32;

  // Calculate the determinant
  var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det) {
    return null;
  }
  det = 1.0 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  return out;
}

/**
 * Generates a 2D projection matrix with the given bounds
 *
 * @param {mat3} out mat3 frustum matrix will be written into
 * @param {number} width Width of your gl context
 * @param {number} height Height of gl context
 * @returns {mat3} out
 */
function projection(out, width, height) {
  out[0] = 2 / width;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = -2 / height;
  out[5] = 0;
  out[6] = -1;
  out[7] = 1;
  out[8] = 1;
  return out;
}

/**
 * Returns a string representation of a mat3
 *
 * @param {ReadonlyMat3} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
function mat3_str(a) {
  return "mat3(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + ")";
}

/**
 * Returns Frobenius norm of a mat3
 *
 * @param {ReadonlyMat3} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
function mat3_frob(a) {
  return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2] + a[3] * a[3] + a[4] * a[4] + a[5] * a[5] + a[6] * a[6] + a[7] * a[7] + a[8] * a[8]);
}

/**
 * Adds two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the first operand
 * @param {ReadonlyMat3} b the second operand
 * @returns {mat3} out
 */
function mat3_add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  out[8] = a[8] + b[8];
  return out;
}

/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the first operand
 * @param {ReadonlyMat3} b the second operand
 * @returns {mat3} out
 */
function mat3_subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  out[6] = a[6] - b[6];
  out[7] = a[7] - b[7];
  out[8] = a[8] - b[8];
  return out;
}

/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat3} out
 */
function mat3_multiplyScalar(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  out[8] = a[8] * b;
  return out;
}

/**
 * Adds two mat3's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat3} out the receiving vector
 * @param {ReadonlyMat3} a the first operand
 * @param {ReadonlyMat3} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat3} out
 */
function mat3_multiplyScalarAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  out[4] = a[4] + b[4] * scale;
  out[5] = a[5] + b[5] * scale;
  out[6] = a[6] + b[6] * scale;
  out[7] = a[7] + b[7] * scale;
  out[8] = a[8] + b[8] * scale;
  return out;
}

/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyMat3} a The first matrix.
 * @param {ReadonlyMat3} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
function mat3_exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8];
}

/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {ReadonlyMat3} a The first matrix.
 * @param {ReadonlyMat3} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
function mat3_equals(a, b) {
  var a0 = a[0],
    a1 = a[1],
    a2 = a[2],
    a3 = a[3],
    a4 = a[4],
    a5 = a[5],
    a6 = a[6],
    a7 = a[7],
    a8 = a[8];
  var b0 = b[0],
    b1 = b[1],
    b2 = b[2],
    b3 = b[3],
    b4 = b[4],
    b5 = b[5],
    b6 = b[6],
    b7 = b[7],
    b8 = b[8];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8));
}

/**
 * Alias for {@link mat3.multiply}
 * @function
 */
var mat3_mul = mat3_multiply;

/**
 * Alias for {@link mat3.subtract}
 * @function
 */
var mat3_sub = mat3_subtract;
;// CONCATENATED MODULE: ./src/corelibs/node_modules/gl-matrix/esm/mat4.js


/**
 * 4x4 Matrix<br>Format: column-major, when typed out it looks like row-major<br>The matrices are being post multiplied.
 * @module mat4
 */

/**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */
function mat4_create() {
  var out = new ARRAY_TYPE(16);
  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
  }
  out[0] = 1;
  out[5] = 1;
  out[10] = 1;
  out[15] = 1;
  return out;
}

/**
 * Creates a new mat4 initialized with values from an existing matrix
 *
 * @param {ReadonlyMat4} a matrix to clone
 * @returns {mat4} a new 4x4 matrix
 */
function mat4_clone(a) {
  var out = new ARRAY_TYPE(16);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}

/**
 * Copy the values from one mat4 to another
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the source matrix
 * @returns {mat4} out
 */
function mat4_copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}

/**
 * Create a new mat4 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m03 Component in column 0, row 3 position (index 3)
 * @param {Number} m10 Component in column 1, row 0 position (index 4)
 * @param {Number} m11 Component in column 1, row 1 position (index 5)
 * @param {Number} m12 Component in column 1, row 2 position (index 6)
 * @param {Number} m13 Component in column 1, row 3 position (index 7)
 * @param {Number} m20 Component in column 2, row 0 position (index 8)
 * @param {Number} m21 Component in column 2, row 1 position (index 9)
 * @param {Number} m22 Component in column 2, row 2 position (index 10)
 * @param {Number} m23 Component in column 2, row 3 position (index 11)
 * @param {Number} m30 Component in column 3, row 0 position (index 12)
 * @param {Number} m31 Component in column 3, row 1 position (index 13)
 * @param {Number} m32 Component in column 3, row 2 position (index 14)
 * @param {Number} m33 Component in column 3, row 3 position (index 15)
 * @returns {mat4} A new mat4
 */
function mat4_fromValues(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  var out = new ARRAY_TYPE(16);
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}

/**
 * Set the components of a mat4 to the given values
 *
 * @param {mat4} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m03 Component in column 0, row 3 position (index 3)
 * @param {Number} m10 Component in column 1, row 0 position (index 4)
 * @param {Number} m11 Component in column 1, row 1 position (index 5)
 * @param {Number} m12 Component in column 1, row 2 position (index 6)
 * @param {Number} m13 Component in column 1, row 3 position (index 7)
 * @param {Number} m20 Component in column 2, row 0 position (index 8)
 * @param {Number} m21 Component in column 2, row 1 position (index 9)
 * @param {Number} m22 Component in column 2, row 2 position (index 10)
 * @param {Number} m23 Component in column 2, row 3 position (index 11)
 * @param {Number} m30 Component in column 3, row 0 position (index 12)
 * @param {Number} m31 Component in column 3, row 1 position (index 13)
 * @param {Number} m32 Component in column 3, row 2 position (index 14)
 * @param {Number} m33 Component in column 3, row 3 position (index 15)
 * @returns {mat4} out
 */
function mat4_set(out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}

/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */
function mat4_identity(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}

/**
 * Transpose the values of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the source matrix
 * @returns {mat4} out
 */
function mat4_transpose(out, a) {
  // If we are transposing ourselves we can skip a few steps but have to cache some values
  if (out === a) {
    var a01 = a[1],
      a02 = a[2],
      a03 = a[3];
    var a12 = a[6],
      a13 = a[7];
    var a23 = a[11];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a01;
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a02;
    out[9] = a12;
    out[11] = a[14];
    out[12] = a03;
    out[13] = a13;
    out[14] = a23;
  } else {
    out[0] = a[0];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a[1];
    out[5] = a[5];
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a[2];
    out[9] = a[6];
    out[10] = a[10];
    out[11] = a[14];
    out[12] = a[3];
    out[13] = a[7];
    out[14] = a[11];
    out[15] = a[15];
  }
  return out;
}

/**
 * Inverts a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the source matrix
 * @returns {mat4 | null} out, or null if source matrix is not invertible
 */
function mat4_invert(out, a) {
  var a00 = a[0],
    a01 = a[1],
    a02 = a[2],
    a03 = a[3];
  var a10 = a[4],
    a11 = a[5],
    a12 = a[6],
    a13 = a[7];
  var a20 = a[8],
    a21 = a[9],
    a22 = a[10],
    a23 = a[11];
  var a30 = a[12],
    a31 = a[13],
    a32 = a[14],
    a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32;

  // Calculate the determinant
  var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det) {
    return null;
  }
  det = 1.0 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return out;
}

/**
 * Calculates the adjugate of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the source matrix
 * @returns {mat4} out
 */
function mat4_adjoint(out, a) {
  var a00 = a[0],
    a01 = a[1],
    a02 = a[2],
    a03 = a[3];
  var a10 = a[4],
    a11 = a[5],
    a12 = a[6],
    a13 = a[7];
  var a20 = a[8],
    a21 = a[9],
    a22 = a[10],
    a23 = a[11];
  var a30 = a[12],
    a31 = a[13],
    a32 = a[14],
    a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32;
  out[0] = a11 * b11 - a12 * b10 + a13 * b09;
  out[1] = a02 * b10 - a01 * b11 - a03 * b09;
  out[2] = a31 * b05 - a32 * b04 + a33 * b03;
  out[3] = a22 * b04 - a21 * b05 - a23 * b03;
  out[4] = a12 * b08 - a10 * b11 - a13 * b07;
  out[5] = a00 * b11 - a02 * b08 + a03 * b07;
  out[6] = a32 * b02 - a30 * b05 - a33 * b01;
  out[7] = a20 * b05 - a22 * b02 + a23 * b01;
  out[8] = a10 * b10 - a11 * b08 + a13 * b06;
  out[9] = a01 * b08 - a00 * b10 - a03 * b06;
  out[10] = a30 * b04 - a31 * b02 + a33 * b00;
  out[11] = a21 * b02 - a20 * b04 - a23 * b00;
  out[12] = a11 * b07 - a10 * b09 - a12 * b06;
  out[13] = a00 * b09 - a01 * b07 + a02 * b06;
  out[14] = a31 * b01 - a30 * b03 - a32 * b00;
  out[15] = a20 * b03 - a21 * b01 + a22 * b00;
  return out;
}

/**
 * Calculates the determinant of a mat4
 *
 * @param {ReadonlyMat4} a the source matrix
 * @returns {Number} determinant of a
 */
function mat4_determinant(a) {
  var a00 = a[0],
    a01 = a[1],
    a02 = a[2],
    a03 = a[3];
  var a10 = a[4],
    a11 = a[5],
    a12 = a[6],
    a13 = a[7];
  var a20 = a[8],
    a21 = a[9],
    a22 = a[10],
    a23 = a[11];
  var a30 = a[12],
    a31 = a[13],
    a32 = a[14],
    a33 = a[15];
  var b0 = a00 * a11 - a01 * a10;
  var b1 = a00 * a12 - a02 * a10;
  var b2 = a01 * a12 - a02 * a11;
  var b3 = a20 * a31 - a21 * a30;
  var b4 = a20 * a32 - a22 * a30;
  var b5 = a21 * a32 - a22 * a31;
  var b6 = a00 * b5 - a01 * b4 + a02 * b3;
  var b7 = a10 * b5 - a11 * b4 + a12 * b3;
  var b8 = a20 * b2 - a21 * b1 + a22 * b0;
  var b9 = a30 * b2 - a31 * b1 + a32 * b0;

  // Calculate the determinant
  return a13 * b6 - a03 * b7 + a33 * b8 - a23 * b9;
}

/**
 * Multiplies two mat4s
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the first operand
 * @param {ReadonlyMat4} b the second operand
 * @returns {mat4} out
 */
function mat4_multiply(out, a, b) {
  var a00 = a[0],
    a01 = a[1],
    a02 = a[2],
    a03 = a[3];
  var a10 = a[4],
    a11 = a[5],
    a12 = a[6],
    a13 = a[7];
  var a20 = a[8],
    a21 = a[9],
    a22 = a[10],
    a23 = a[11];
  var a30 = a[12],
    a31 = a[13],
    a32 = a[14],
    a33 = a[15];

  // Cache only the current line of the second matrix
  var b0 = b[0],
    b1 = b[1],
    b2 = b[2],
    b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[4];
  b1 = b[5];
  b2 = b[6];
  b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[8];
  b1 = b[9];
  b2 = b[10];
  b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[12];
  b1 = b[13];
  b2 = b[14];
  b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return out;
}

/**
 * Translate a mat4 by the given vector
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to translate
 * @param {ReadonlyVec3} v vector to translate by
 * @returns {mat4} out
 */
function mat4_translate(out, a, v) {
  var x = v[0],
    y = v[1],
    z = v[2];
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;
  if (a === out) {
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
  } else {
    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];
    out[0] = a00;
    out[1] = a01;
    out[2] = a02;
    out[3] = a03;
    out[4] = a10;
    out[5] = a11;
    out[6] = a12;
    out[7] = a13;
    out[8] = a20;
    out[9] = a21;
    out[10] = a22;
    out[11] = a23;
    out[12] = a00 * x + a10 * y + a20 * z + a[12];
    out[13] = a01 * x + a11 * y + a21 * z + a[13];
    out[14] = a02 * x + a12 * y + a22 * z + a[14];
    out[15] = a03 * x + a13 * y + a23 * z + a[15];
  }
  return out;
}

/**
 * Scales the mat4 by the dimensions in the given vec3 not using vectorization
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to scale
 * @param {ReadonlyVec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/
function mat4_scale(out, a, v) {
  var x = v[0],
    y = v[1],
    z = v[2];
  out[0] = a[0] * x;
  out[1] = a[1] * x;
  out[2] = a[2] * x;
  out[3] = a[3] * x;
  out[4] = a[4] * y;
  out[5] = a[5] * y;
  out[6] = a[6] * y;
  out[7] = a[7] * y;
  out[8] = a[8] * z;
  out[9] = a[9] * z;
  out[10] = a[10] * z;
  out[11] = a[11] * z;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}

/**
 * Rotates a mat4 by the given angle around the given axis
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {ReadonlyVec3} axis the axis to rotate around
 * @returns {mat4} out
 */
function mat4_rotate(out, a, rad, axis) {
  var x = axis[0],
    y = axis[1],
    z = axis[2];
  var len = Math.sqrt(x * x + y * y + z * z);
  var s, c, t;
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;
  var b00, b01, b02;
  var b10, b11, b12;
  var b20, b21, b22;
  if (len < EPSILON) {
    return null;
  }
  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;
  a00 = a[0];
  a01 = a[1];
  a02 = a[2];
  a03 = a[3];
  a10 = a[4];
  a11 = a[5];
  a12 = a[6];
  a13 = a[7];
  a20 = a[8];
  a21 = a[9];
  a22 = a[10];
  a23 = a[11];

  // Construct the elements of the rotation matrix
  b00 = x * x * t + c;
  b01 = y * x * t + z * s;
  b02 = z * x * t - y * s;
  b10 = x * y * t - z * s;
  b11 = y * y * t + c;
  b12 = z * y * t + x * s;
  b20 = x * z * t + y * s;
  b21 = y * z * t - x * s;
  b22 = z * z * t + c;

  // Perform rotation-specific matrix multiplication
  out[0] = a00 * b00 + a10 * b01 + a20 * b02;
  out[1] = a01 * b00 + a11 * b01 + a21 * b02;
  out[2] = a02 * b00 + a12 * b01 + a22 * b02;
  out[3] = a03 * b00 + a13 * b01 + a23 * b02;
  out[4] = a00 * b10 + a10 * b11 + a20 * b12;
  out[5] = a01 * b10 + a11 * b11 + a21 * b12;
  out[6] = a02 * b10 + a12 * b11 + a22 * b12;
  out[7] = a03 * b10 + a13 * b11 + a23 * b12;
  out[8] = a00 * b20 + a10 * b21 + a20 * b22;
  out[9] = a01 * b20 + a11 * b21 + a21 * b22;
  out[10] = a02 * b20 + a12 * b21 + a22 * b22;
  out[11] = a03 * b20 + a13 * b21 + a23 * b22;
  if (a !== out) {
    // If the source and destination differ, copy the unchanged last row
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  return out;
}

/**
 * Rotates a matrix by the given angle around the X axis
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
function rotateX(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];
  if (a !== out) {
    // If the source and destination differ, copy the unchanged rows
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }

  // Perform axis-specific matrix multiplication
  out[4] = a10 * c + a20 * s;
  out[5] = a11 * c + a21 * s;
  out[6] = a12 * c + a22 * s;
  out[7] = a13 * c + a23 * s;
  out[8] = a20 * c - a10 * s;
  out[9] = a21 * c - a11 * s;
  out[10] = a22 * c - a12 * s;
  out[11] = a23 * c - a13 * s;
  return out;
}

/**
 * Rotates a matrix by the given angle around the Y axis
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
function rotateY(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];
  if (a !== out) {
    // If the source and destination differ, copy the unchanged rows
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }

  // Perform axis-specific matrix multiplication
  out[0] = a00 * c - a20 * s;
  out[1] = a01 * c - a21 * s;
  out[2] = a02 * c - a22 * s;
  out[3] = a03 * c - a23 * s;
  out[8] = a00 * s + a20 * c;
  out[9] = a01 * s + a21 * c;
  out[10] = a02 * s + a22 * c;
  out[11] = a03 * s + a23 * c;
  return out;
}

/**
 * Rotates a matrix by the given angle around the Z axis
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
function rotateZ(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];
  if (a !== out) {
    // If the source and destination differ, copy the unchanged last row
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }

  // Perform axis-specific matrix multiplication
  out[0] = a00 * c + a10 * s;
  out[1] = a01 * c + a11 * s;
  out[2] = a02 * c + a12 * s;
  out[3] = a03 * c + a13 * s;
  out[4] = a10 * c - a00 * s;
  out[5] = a11 * c - a01 * s;
  out[6] = a12 * c - a02 * s;
  out[7] = a13 * c - a03 * s;
  return out;
}

/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, dest, vec);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {ReadonlyVec3} v Translation vector
 * @returns {mat4} out
 */
function mat4_fromTranslation(out, v) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}

/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.scale(dest, dest, vec);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {ReadonlyVec3} v Scaling vector
 * @returns {mat4} out
 */
function mat4_fromScaling(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = v[1];
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = v[2];
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}

/**
 * Creates a matrix from a given angle around a given axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotate(dest, dest, rad, axis);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @param {ReadonlyVec3} axis the axis to rotate around
 * @returns {mat4} out
 */
function mat4_fromRotation(out, rad, axis) {
  var x = axis[0],
    y = axis[1],
    z = axis[2];
  var len = Math.sqrt(x * x + y * y + z * z);
  var s, c, t;
  if (len < EPSILON) {
    return null;
  }
  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;

  // Perform rotation-specific matrix multiplication
  out[0] = x * x * t + c;
  out[1] = y * x * t + z * s;
  out[2] = z * x * t - y * s;
  out[3] = 0;
  out[4] = x * y * t - z * s;
  out[5] = y * y * t + c;
  out[6] = z * y * t + x * s;
  out[7] = 0;
  out[8] = x * z * t + y * s;
  out[9] = y * z * t - x * s;
  out[10] = z * z * t + c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}

/**
 * Creates a matrix from the given angle around the X axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateX(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
function fromXRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);

  // Perform axis-specific matrix multiplication
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = c;
  out[6] = s;
  out[7] = 0;
  out[8] = 0;
  out[9] = -s;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}

/**
 * Creates a matrix from the given angle around the Y axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateY(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
function fromYRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);

  // Perform axis-specific matrix multiplication
  out[0] = c;
  out[1] = 0;
  out[2] = -s;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = s;
  out[9] = 0;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}

/**
 * Creates a matrix from the given angle around the Z axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateZ(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
function fromZRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);

  // Perform axis-specific matrix multiplication
  out[0] = c;
  out[1] = s;
  out[2] = 0;
  out[3] = 0;
  out[4] = -s;
  out[5] = c;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}

/**
 * Creates a matrix from a quaternion rotation and vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, dest, vec);
 *     let quatMat = mat4.create();
 *     mat4.fromQuat(quatMat, quat);
 *     mat4.multiply(dest, dest, quatMat);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat} q Rotation quaternion
 * @param {ReadonlyVec3} v Translation vector
 * @returns {mat4} out
 */
function fromRotationTranslation(out, q, v) {
  // Quaternion math
  var x = q[0],
    y = q[1],
    z = q[2],
    w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - (yy + zz);
  out[1] = xy + wz;
  out[2] = xz - wy;
  out[3] = 0;
  out[4] = xy - wz;
  out[5] = 1 - (xx + zz);
  out[6] = yz + wx;
  out[7] = 0;
  out[8] = xz + wy;
  out[9] = yz - wx;
  out[10] = 1 - (xx + yy);
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}

/**
 * Creates a new mat4 from a dual quat.
 *
 * @param {mat4} out Matrix
 * @param {ReadonlyQuat2} a Dual Quaternion
 * @returns {mat4} mat4 receiving operation result
 */
function fromQuat2(out, a) {
  var translation = new ARRAY_TYPE(3);
  var bx = -a[0],
    by = -a[1],
    bz = -a[2],
    bw = a[3],
    ax = a[4],
    ay = a[5],
    az = a[6],
    aw = a[7];
  var magnitude = bx * bx + by * by + bz * bz + bw * bw;
  //Only scale if it makes sense
  if (magnitude > 0) {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2 / magnitude;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2 / magnitude;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2 / magnitude;
  } else {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
  }
  fromRotationTranslation(out, a, translation);
  return out;
}

/**
 * Returns the translation vector component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslation,
 *  the returned vector will be the same as the translation vector
 *  originally supplied.
 * @param  {vec3} out Vector to receive translation component
 * @param  {ReadonlyMat4} mat Matrix to be decomposed (input)
 * @return {vec3} out
 */
function getTranslation(out, mat) {
  out[0] = mat[12];
  out[1] = mat[13];
  out[2] = mat[14];
  return out;
}

/**
 * Returns the scaling factor component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslationScale
 *  with a normalized Quaternion parameter, the returned vector will be
 *  the same as the scaling vector
 *  originally supplied.
 * @param  {vec3} out Vector to receive scaling factor component
 * @param  {ReadonlyMat4} mat Matrix to be decomposed (input)
 * @return {vec3} out
 */
function getScaling(out, mat) {
  var m11 = mat[0];
  var m12 = mat[1];
  var m13 = mat[2];
  var m21 = mat[4];
  var m22 = mat[5];
  var m23 = mat[6];
  var m31 = mat[8];
  var m32 = mat[9];
  var m33 = mat[10];
  out[0] = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
  out[1] = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
  out[2] = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);
  return out;
}

/**
 * Returns a quaternion representing the rotational component
 *  of a transformation matrix. If a matrix is built with
 *  fromRotationTranslation, the returned quaternion will be the
 *  same as the quaternion originally supplied.
 * @param {quat} out Quaternion to receive the rotation component
 * @param {ReadonlyMat4} mat Matrix to be decomposed (input)
 * @return {quat} out
 */
function getRotation(out, mat) {
  var scaling = new ARRAY_TYPE(3);
  getScaling(scaling, mat);
  var is1 = 1 / scaling[0];
  var is2 = 1 / scaling[1];
  var is3 = 1 / scaling[2];
  var sm11 = mat[0] * is1;
  var sm12 = mat[1] * is2;
  var sm13 = mat[2] * is3;
  var sm21 = mat[4] * is1;
  var sm22 = mat[5] * is2;
  var sm23 = mat[6] * is3;
  var sm31 = mat[8] * is1;
  var sm32 = mat[9] * is2;
  var sm33 = mat[10] * is3;
  var trace = sm11 + sm22 + sm33;
  var S = 0;
  if (trace > 0) {
    S = Math.sqrt(trace + 1.0) * 2;
    out[3] = 0.25 * S;
    out[0] = (sm23 - sm32) / S;
    out[1] = (sm31 - sm13) / S;
    out[2] = (sm12 - sm21) / S;
  } else if (sm11 > sm22 && sm11 > sm33) {
    S = Math.sqrt(1.0 + sm11 - sm22 - sm33) * 2;
    out[3] = (sm23 - sm32) / S;
    out[0] = 0.25 * S;
    out[1] = (sm12 + sm21) / S;
    out[2] = (sm31 + sm13) / S;
  } else if (sm22 > sm33) {
    S = Math.sqrt(1.0 + sm22 - sm11 - sm33) * 2;
    out[3] = (sm31 - sm13) / S;
    out[0] = (sm12 + sm21) / S;
    out[1] = 0.25 * S;
    out[2] = (sm23 + sm32) / S;
  } else {
    S = Math.sqrt(1.0 + sm33 - sm11 - sm22) * 2;
    out[3] = (sm12 - sm21) / S;
    out[0] = (sm31 + sm13) / S;
    out[1] = (sm23 + sm32) / S;
    out[2] = 0.25 * S;
  }
  return out;
}

/**
 * Decomposes a transformation matrix into its rotation, translation
 * and scale components. Returns only the rotation component
 * @param  {quat} out_r Quaternion to receive the rotation component
 * @param  {vec3} out_t Vector to receive the translation vector
 * @param  {vec3} out_s Vector to receive the scaling factor
 * @param  {ReadonlyMat4} mat Matrix to be decomposed (input)
 * @returns {quat} out_r
 */
function decompose(out_r, out_t, out_s, mat) {
  out_t[0] = mat[12];
  out_t[1] = mat[13];
  out_t[2] = mat[14];
  var m11 = mat[0];
  var m12 = mat[1];
  var m13 = mat[2];
  var m21 = mat[4];
  var m22 = mat[5];
  var m23 = mat[6];
  var m31 = mat[8];
  var m32 = mat[9];
  var m33 = mat[10];
  out_s[0] = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
  out_s[1] = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
  out_s[2] = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);
  var is1 = 1 / out_s[0];
  var is2 = 1 / out_s[1];
  var is3 = 1 / out_s[2];
  var sm11 = m11 * is1;
  var sm12 = m12 * is2;
  var sm13 = m13 * is3;
  var sm21 = m21 * is1;
  var sm22 = m22 * is2;
  var sm23 = m23 * is3;
  var sm31 = m31 * is1;
  var sm32 = m32 * is2;
  var sm33 = m33 * is3;
  var trace = sm11 + sm22 + sm33;
  var S = 0;
  if (trace > 0) {
    S = Math.sqrt(trace + 1.0) * 2;
    out_r[3] = 0.25 * S;
    out_r[0] = (sm23 - sm32) / S;
    out_r[1] = (sm31 - sm13) / S;
    out_r[2] = (sm12 - sm21) / S;
  } else if (sm11 > sm22 && sm11 > sm33) {
    S = Math.sqrt(1.0 + sm11 - sm22 - sm33) * 2;
    out_r[3] = (sm23 - sm32) / S;
    out_r[0] = 0.25 * S;
    out_r[1] = (sm12 + sm21) / S;
    out_r[2] = (sm31 + sm13) / S;
  } else if (sm22 > sm33) {
    S = Math.sqrt(1.0 + sm22 - sm11 - sm33) * 2;
    out_r[3] = (sm31 - sm13) / S;
    out_r[0] = (sm12 + sm21) / S;
    out_r[1] = 0.25 * S;
    out_r[2] = (sm23 + sm32) / S;
  } else {
    S = Math.sqrt(1.0 + sm33 - sm11 - sm22) * 2;
    out_r[3] = (sm12 - sm21) / S;
    out_r[0] = (sm31 + sm13) / S;
    out_r[1] = (sm23 + sm32) / S;
    out_r[2] = 0.25 * S;
  }
  return out_r;
}

/**
 * Creates a matrix from a quaternion rotation, vector translation and vector scale
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, dest, vec);
 *     let quatMat = mat4.create();
 *     mat4.fromQuat(quatMat, quat);
 *     mat4.multiply(dest, dest, quatMat);
 *     mat4.scale(dest, dest, scale)
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat} q Rotation quaternion
 * @param {ReadonlyVec3} v Translation vector
 * @param {ReadonlyVec3} s Scaling vector
 * @returns {mat4} out
 */
function fromRotationTranslationScale(out, q, v, s) {
  // Quaternion math
  var x = q[0],
    y = q[1],
    z = q[2],
    w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = s[0];
  var sy = s[1];
  var sz = s[2];
  out[0] = (1 - (yy + zz)) * sx;
  out[1] = (xy + wz) * sx;
  out[2] = (xz - wy) * sx;
  out[3] = 0;
  out[4] = (xy - wz) * sy;
  out[5] = (1 - (xx + zz)) * sy;
  out[6] = (yz + wx) * sy;
  out[7] = 0;
  out[8] = (xz + wy) * sz;
  out[9] = (yz - wx) * sz;
  out[10] = (1 - (xx + yy)) * sz;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}

/**
 * Creates a matrix from a quaternion rotation, vector translation and vector scale, rotating and scaling around the given origin
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, dest, vec);
 *     mat4.translate(dest, dest, origin);
 *     let quatMat = mat4.create();
 *     mat4.fromQuat(quatMat, quat);
 *     mat4.multiply(dest, dest, quatMat);
 *     mat4.scale(dest, dest, scale)
 *     mat4.translate(dest, dest, negativeOrigin);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat} q Rotation quaternion
 * @param {ReadonlyVec3} v Translation vector
 * @param {ReadonlyVec3} s Scaling vector
 * @param {ReadonlyVec3} o The origin vector around which to scale and rotate
 * @returns {mat4} out
 */
function fromRotationTranslationScaleOrigin(out, q, v, s, o) {
  // Quaternion math
  var x = q[0],
    y = q[1],
    z = q[2],
    w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = s[0];
  var sy = s[1];
  var sz = s[2];
  var ox = o[0];
  var oy = o[1];
  var oz = o[2];
  var out0 = (1 - (yy + zz)) * sx;
  var out1 = (xy + wz) * sx;
  var out2 = (xz - wy) * sx;
  var out4 = (xy - wz) * sy;
  var out5 = (1 - (xx + zz)) * sy;
  var out6 = (yz + wx) * sy;
  var out8 = (xz + wy) * sz;
  var out9 = (yz - wx) * sz;
  var out10 = (1 - (xx + yy)) * sz;
  out[0] = out0;
  out[1] = out1;
  out[2] = out2;
  out[3] = 0;
  out[4] = out4;
  out[5] = out5;
  out[6] = out6;
  out[7] = 0;
  out[8] = out8;
  out[9] = out9;
  out[10] = out10;
  out[11] = 0;
  out[12] = v[0] + ox - (out0 * ox + out4 * oy + out8 * oz);
  out[13] = v[1] + oy - (out1 * ox + out5 * oy + out9 * oz);
  out[14] = v[2] + oz - (out2 * ox + out6 * oy + out10 * oz);
  out[15] = 1;
  return out;
}

/**
 * Calculates a 4x4 matrix from the given quaternion
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {ReadonlyQuat} q Quaternion to create matrix from
 *
 * @returns {mat4} out
 */
function mat4_fromQuat(out, q) {
  var x = q[0],
    y = q[1],
    z = q[2],
    w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var yx = y * x2;
  var yy = y * y2;
  var zx = z * x2;
  var zy = z * y2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - yy - zz;
  out[1] = yx + wz;
  out[2] = zx - wy;
  out[3] = 0;
  out[4] = yx - wz;
  out[5] = 1 - xx - zz;
  out[6] = zy + wx;
  out[7] = 0;
  out[8] = zx + wy;
  out[9] = zy - wx;
  out[10] = 1 - xx - yy;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}

/**
 * Generates a frustum matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Number} left Left bound of the frustum
 * @param {Number} right Right bound of the frustum
 * @param {Number} bottom Bottom bound of the frustum
 * @param {Number} top Top bound of the frustum
 * @param {Number} near Near bound of the frustum
 * @param {Number} far Far bound of the frustum
 * @returns {mat4} out
 */
function frustum(out, left, right, bottom, top, near, far) {
  var rl = 1 / (right - left);
  var tb = 1 / (top - bottom);
  var nf = 1 / (near - far);
  out[0] = near * 2 * rl;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = near * 2 * tb;
  out[6] = 0;
  out[7] = 0;
  out[8] = (right + left) * rl;
  out[9] = (top + bottom) * tb;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = far * near * 2 * nf;
  out[15] = 0;
  return out;
}

/**
 * Generates a perspective projection matrix with the given bounds.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [-1, 1],
 * which matches WebGL/OpenGL's clip volume.
 * Passing null/undefined/no value for far will generate infinite projection matrix.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum, can be null or Infinity
 * @returns {mat4} out
 */
function perspectiveNO(out, fovy, aspect, near, far) {
  var f = 1.0 / Math.tan(fovy / 2);
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;
  if (far != null && far !== Infinity) {
    var nf = 1 / (near - far);
    out[10] = (far + near) * nf;
    out[14] = 2 * far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -2 * near;
  }
  return out;
}

/**
 * Alias for {@link mat4.perspectiveNO}
 * @function
 */
var perspective = perspectiveNO;

/**
 * Generates a perspective projection matrix suitable for WebGPU with the given bounds.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [0, 1],
 * which matches WebGPU/Vulkan/DirectX/Metal's clip volume.
 * Passing null/undefined/no value for far will generate infinite projection matrix.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum, can be null or Infinity
 * @returns {mat4} out
 */
function perspectiveZO(out, fovy, aspect, near, far) {
  var f = 1.0 / Math.tan(fovy / 2);
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;
  if (far != null && far !== Infinity) {
    var nf = 1 / (near - far);
    out[10] = far * nf;
    out[14] = far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -near;
  }
  return out;
}

/**
 * Generates a perspective projection matrix with the given field of view.
 * This is primarily useful for generating projection matrices to be used
 * with the still experiemental WebVR API.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Object} fov Object containing the following values: upDegrees, downDegrees, leftDegrees, rightDegrees
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
function perspectiveFromFieldOfView(out, fov, near, far) {
  var upTan = Math.tan(fov.upDegrees * Math.PI / 180.0);
  var downTan = Math.tan(fov.downDegrees * Math.PI / 180.0);
  var leftTan = Math.tan(fov.leftDegrees * Math.PI / 180.0);
  var rightTan = Math.tan(fov.rightDegrees * Math.PI / 180.0);
  var xScale = 2.0 / (leftTan + rightTan);
  var yScale = 2.0 / (upTan + downTan);
  out[0] = xScale;
  out[1] = 0.0;
  out[2] = 0.0;
  out[3] = 0.0;
  out[4] = 0.0;
  out[5] = yScale;
  out[6] = 0.0;
  out[7] = 0.0;
  out[8] = -((leftTan - rightTan) * xScale * 0.5);
  out[9] = (upTan - downTan) * yScale * 0.5;
  out[10] = far / (near - far);
  out[11] = -1.0;
  out[12] = 0.0;
  out[13] = 0.0;
  out[14] = far * near / (near - far);
  out[15] = 0.0;
  return out;
}

/**
 * Generates a orthogonal projection matrix with the given bounds.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [-1, 1],
 * which matches WebGL/OpenGL's clip volume.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
function orthoNO(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 2 * nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;
  return out;
}

/**
 * Alias for {@link mat4.orthoNO}
 * @function
 */
var ortho = orthoNO;

/**
 * Generates a orthogonal projection matrix with the given bounds.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [0, 1],
 * which matches WebGPU/Vulkan/DirectX/Metal's clip volume.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
function orthoZO(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = near * nf;
  out[15] = 1;
  return out;
}

/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis.
 * If you want a matrix that actually makes an object look at another object, you should use targetTo instead.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {ReadonlyVec3} eye Position of the viewer
 * @param {ReadonlyVec3} center Point the viewer is looking at
 * @param {ReadonlyVec3} up vec3 pointing up
 * @returns {mat4} out
 */
function lookAt(out, eye, center, up) {
  var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
  var eyex = eye[0];
  var eyey = eye[1];
  var eyez = eye[2];
  var upx = up[0];
  var upy = up[1];
  var upz = up[2];
  var centerx = center[0];
  var centery = center[1];
  var centerz = center[2];
  if (Math.abs(eyex - centerx) < EPSILON && Math.abs(eyey - centery) < EPSILON && Math.abs(eyez - centerz) < EPSILON) {
    return mat4_identity(out);
  }
  z0 = eyex - centerx;
  z1 = eyey - centery;
  z2 = eyez - centerz;
  len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
  z0 *= len;
  z1 *= len;
  z2 *= len;
  x0 = upy * z2 - upz * z1;
  x1 = upz * z0 - upx * z2;
  x2 = upx * z1 - upy * z0;
  len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
  if (!len) {
    x0 = 0;
    x1 = 0;
    x2 = 0;
  } else {
    len = 1 / len;
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }
  y0 = z1 * x2 - z2 * x1;
  y1 = z2 * x0 - z0 * x2;
  y2 = z0 * x1 - z1 * x0;
  len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
  if (!len) {
    y0 = 0;
    y1 = 0;
    y2 = 0;
  } else {
    len = 1 / len;
    y0 *= len;
    y1 *= len;
    y2 *= len;
  }
  out[0] = x0;
  out[1] = y0;
  out[2] = z0;
  out[3] = 0;
  out[4] = x1;
  out[5] = y1;
  out[6] = z1;
  out[7] = 0;
  out[8] = x2;
  out[9] = y2;
  out[10] = z2;
  out[11] = 0;
  out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
  out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
  out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
  out[15] = 1;
  return out;
}

/**
 * Generates a matrix that makes something look at something else.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {ReadonlyVec3} eye Position of the viewer
 * @param {ReadonlyVec3} target Point the viewer is looking at
 * @param {ReadonlyVec3} up vec3 pointing up
 * @returns {mat4} out
 */
function targetTo(out, eye, target, up) {
  var eyex = eye[0],
    eyey = eye[1],
    eyez = eye[2],
    upx = up[0],
    upy = up[1],
    upz = up[2];
  var z0 = eyex - target[0],
    z1 = eyey - target[1],
    z2 = eyez - target[2];
  var len = z0 * z0 + z1 * z1 + z2 * z2;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
    z0 *= len;
    z1 *= len;
    z2 *= len;
  }
  var x0 = upy * z2 - upz * z1,
    x1 = upz * z0 - upx * z2,
    x2 = upx * z1 - upy * z0;
  len = x0 * x0 + x1 * x1 + x2 * x2;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }
  out[0] = x0;
  out[1] = x1;
  out[2] = x2;
  out[3] = 0;
  out[4] = z1 * x2 - z2 * x1;
  out[5] = z2 * x0 - z0 * x2;
  out[6] = z0 * x1 - z1 * x0;
  out[7] = 0;
  out[8] = z0;
  out[9] = z1;
  out[10] = z2;
  out[11] = 0;
  out[12] = eyex;
  out[13] = eyey;
  out[14] = eyez;
  out[15] = 1;
  return out;
}

/**
 * Returns a string representation of a mat4
 *
 * @param {ReadonlyMat4} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
function mat4_str(a) {
  return "mat4(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + ", " + a[9] + ", " + a[10] + ", " + a[11] + ", " + a[12] + ", " + a[13] + ", " + a[14] + ", " + a[15] + ")";
}

/**
 * Returns Frobenius norm of a mat4
 *
 * @param {ReadonlyMat4} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
function mat4_frob(a) {
  return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2] + a[3] * a[3] + a[4] * a[4] + a[5] * a[5] + a[6] * a[6] + a[7] * a[7] + a[8] * a[8] + a[9] * a[9] + a[10] * a[10] + a[11] * a[11] + a[12] * a[12] + a[13] * a[13] + a[14] * a[14] + a[15] * a[15]);
}

/**
 * Adds two mat4's
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the first operand
 * @param {ReadonlyMat4} b the second operand
 * @returns {mat4} out
 */
function mat4_add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  out[8] = a[8] + b[8];
  out[9] = a[9] + b[9];
  out[10] = a[10] + b[10];
  out[11] = a[11] + b[11];
  out[12] = a[12] + b[12];
  out[13] = a[13] + b[13];
  out[14] = a[14] + b[14];
  out[15] = a[15] + b[15];
  return out;
}

/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the first operand
 * @param {ReadonlyMat4} b the second operand
 * @returns {mat4} out
 */
function mat4_subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  out[6] = a[6] - b[6];
  out[7] = a[7] - b[7];
  out[8] = a[8] - b[8];
  out[9] = a[9] - b[9];
  out[10] = a[10] - b[10];
  out[11] = a[11] - b[11];
  out[12] = a[12] - b[12];
  out[13] = a[13] - b[13];
  out[14] = a[14] - b[14];
  out[15] = a[15] - b[15];
  return out;
}

/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat4} out
 */
function mat4_multiplyScalar(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  out[8] = a[8] * b;
  out[9] = a[9] * b;
  out[10] = a[10] * b;
  out[11] = a[11] * b;
  out[12] = a[12] * b;
  out[13] = a[13] * b;
  out[14] = a[14] * b;
  out[15] = a[15] * b;
  return out;
}

/**
 * Adds two mat4's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat4} out the receiving vector
 * @param {ReadonlyMat4} a the first operand
 * @param {ReadonlyMat4} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat4} out
 */
function mat4_multiplyScalarAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  out[4] = a[4] + b[4] * scale;
  out[5] = a[5] + b[5] * scale;
  out[6] = a[6] + b[6] * scale;
  out[7] = a[7] + b[7] * scale;
  out[8] = a[8] + b[8] * scale;
  out[9] = a[9] + b[9] * scale;
  out[10] = a[10] + b[10] * scale;
  out[11] = a[11] + b[11] * scale;
  out[12] = a[12] + b[12] * scale;
  out[13] = a[13] + b[13] * scale;
  out[14] = a[14] + b[14] * scale;
  out[15] = a[15] + b[15] * scale;
  return out;
}

/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyMat4} a The first matrix.
 * @param {ReadonlyMat4} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
function mat4_exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] && a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
}

/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {ReadonlyMat4} a The first matrix.
 * @param {ReadonlyMat4} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
function mat4_equals(a, b) {
  var a0 = a[0],
    a1 = a[1],
    a2 = a[2],
    a3 = a[3];
  var a4 = a[4],
    a5 = a[5],
    a6 = a[6],
    a7 = a[7];
  var a8 = a[8],
    a9 = a[9],
    a10 = a[10],
    a11 = a[11];
  var a12 = a[12],
    a13 = a[13],
    a14 = a[14],
    a15 = a[15];
  var b0 = b[0],
    b1 = b[1],
    b2 = b[2],
    b3 = b[3];
  var b4 = b[4],
    b5 = b[5],
    b6 = b[6],
    b7 = b[7];
  var b8 = b[8],
    b9 = b[9],
    b10 = b[10],
    b11 = b[11];
  var b12 = b[12],
    b13 = b[13],
    b14 = b[14],
    b15 = b[15];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8)) && Math.abs(a9 - b9) <= EPSILON * Math.max(1.0, Math.abs(a9), Math.abs(b9)) && Math.abs(a10 - b10) <= EPSILON * Math.max(1.0, Math.abs(a10), Math.abs(b10)) && Math.abs(a11 - b11) <= EPSILON * Math.max(1.0, Math.abs(a11), Math.abs(b11)) && Math.abs(a12 - b12) <= EPSILON * Math.max(1.0, Math.abs(a12), Math.abs(b12)) && Math.abs(a13 - b13) <= EPSILON * Math.max(1.0, Math.abs(a13), Math.abs(b13)) && Math.abs(a14 - b14) <= EPSILON * Math.max(1.0, Math.abs(a14), Math.abs(b14)) && Math.abs(a15 - b15) <= EPSILON * Math.max(1.0, Math.abs(a15), Math.abs(b15));
}

/**
 * Alias for {@link mat4.multiply}
 * @function
 */
var mat4_mul = mat4_multiply;

/**
 * Alias for {@link mat4.subtract}
 * @function
 */
var mat4_sub = mat4_subtract;
;// CONCATENATED MODULE: ./src/corelibs/node_modules/gl-matrix/esm/vec3.js


/**
 * 3 Dimensional Vector
 * @module vec3
 */

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */
function vec3_create() {
  var out = new ARRAY_TYPE(3);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }
  return out;
}

/**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param {ReadonlyVec3} a vector to clone
 * @returns {vec3} a new 3D vector
 */
function vec3_clone(a) {
  var out = new ARRAY_TYPE(3);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}

/**
 * Calculates the length of a vec3
 *
 * @param {ReadonlyVec3} a vector to calculate length of
 * @returns {Number} length of a
 */
function vec3_length(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return Math.sqrt(x * x + y * y + z * z);
}

/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */
function vec3_fromValues(x, y, z) {
  var out = new ARRAY_TYPE(3);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}

/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the source vector
 * @returns {vec3} out
 */
function vec3_copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}

/**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */
function vec3_set(out, x, y, z) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}

/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */
function vec3_add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  return out;
}

/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */
function vec3_subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  return out;
}

/**
 * Multiplies two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */
function vec3_multiply(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  out[2] = a[2] * b[2];
  return out;
}

/**
 * Divides two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */
function divide(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  out[2] = a[2] / b[2];
  return out;
}

/**
 * Math.ceil the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to ceil
 * @returns {vec3} out
 */
function ceil(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  out[2] = Math.ceil(a[2]);
  return out;
}

/**
 * Math.floor the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to floor
 * @returns {vec3} out
 */
function floor(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  out[2] = Math.floor(a[2]);
  return out;
}

/**
 * Returns the minimum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */
function min(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  out[2] = Math.min(a[2], b[2]);
  return out;
}

/**
 * Returns the maximum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */
function max(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  out[2] = Math.max(a[2], b[2]);
  return out;
}

/**
 * symmetric round the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to round
 * @returns {vec3} out
 */
function vec3_round(out, a) {
  out[0] = round(a[0]);
  out[1] = round(a[1]);
  out[2] = round(a[2]);
  return out;
}

/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */
function vec3_scale(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  return out;
}

/**
 * Adds two vec3's after scaling the second operand by a scalar value
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec3} out
 */
function scaleAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  return out;
}

/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {Number} distance between a and b
 */
function distance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  return Math.sqrt(x * x + y * y + z * z);
}

/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
function squaredDistance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  return x * x + y * y + z * z;
}

/**
 * Calculates the squared length of a vec3
 *
 * @param {ReadonlyVec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
function squaredLength(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return x * x + y * y + z * z;
}

/**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to negate
 * @returns {vec3} out
 */
function negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  return out;
}

/**
 * Returns the inverse of the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to invert
 * @returns {vec3} out
 */
function inverse(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  out[2] = 1.0 / a[2];
  return out;
}

/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to normalize
 * @returns {vec3} out
 */
function normalize(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var len = x * x + y * y + z * z;
  if (len > 0) {
    //TODO: evaluate use of glm_invsqrt here?
    len = 1 / Math.sqrt(len);
  }
  out[0] = a[0] * len;
  out[1] = a[1] * len;
  out[2] = a[2] * len;
  return out;
}

/**
 * Calculates the dot product of two vec3's
 *
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {Number} dot product of a and b
 */
function vec3_dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */
function cross(out, a, b) {
  var ax = a[0],
    ay = a[1],
    az = a[2];
  var bx = b[0],
    by = b[1],
    bz = b[2];
  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}

/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec3} out
 */
function lerp(out, a, b, t) {
  var ax = a[0];
  var ay = a[1];
  var az = a[2];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  out[2] = az + t * (b[2] - az);
  return out;
}

/**
 * Performs a spherical linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec3} out
 */
function slerp(out, a, b, t) {
  var angle = Math.acos(Math.min(Math.max(vec3_dot(a, b), -1), 1));
  var sinTotal = Math.sin(angle);
  var ratioA = Math.sin((1 - t) * angle) / sinTotal;
  var ratioB = Math.sin(t * angle) / sinTotal;
  out[0] = ratioA * a[0] + ratioB * b[0];
  out[1] = ratioA * a[1] + ratioB * b[1];
  out[2] = ratioA * a[2] + ratioB * b[2];
  return out;
}

/**
 * Performs a hermite interpolation with two control points
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @param {ReadonlyVec3} c the third operand
 * @param {ReadonlyVec3} d the fourth operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec3} out
 */
function hermite(out, a, b, c, d, t) {
  var factorTimes2 = t * t;
  var factor1 = factorTimes2 * (2 * t - 3) + 1;
  var factor2 = factorTimes2 * (t - 2) + t;
  var factor3 = factorTimes2 * (t - 1);
  var factor4 = factorTimes2 * (3 - 2 * t);
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  return out;
}

/**
 * Performs a bezier interpolation with two control points
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @param {ReadonlyVec3} c the third operand
 * @param {ReadonlyVec3} d the fourth operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec3} out
 */
function bezier(out, a, b, c, d, t) {
  var inverseFactor = 1 - t;
  var inverseFactorTimesTwo = inverseFactor * inverseFactor;
  var factorTimes2 = t * t;
  var factor1 = inverseFactorTimesTwo * inverseFactor;
  var factor2 = 3 * t * inverseFactorTimesTwo;
  var factor3 = 3 * factorTimes2 * inverseFactor;
  var factor4 = factorTimes2 * t;
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  return out;
}

/**
 * Generates a random vector with the given scale
 *
 * @param {vec3} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If omitted, a unit vector will be returned
 * @returns {vec3} out
 */
function random(out, scale) {
  scale = scale === undefined ? 1.0 : scale;
  var r = RANDOM() * 2.0 * Math.PI;
  var z = RANDOM() * 2.0 - 1.0;
  var zScale = Math.sqrt(1.0 - z * z) * scale;
  out[0] = Math.cos(r) * zScale;
  out[1] = Math.sin(r) * zScale;
  out[2] = z * scale;
  return out;
}

/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the vector to transform
 * @param {ReadonlyMat4} m matrix to transform with
 * @returns {vec3} out
 */
function transformMat4(out, a, m) {
  var x = a[0],
    y = a[1],
    z = a[2];
  var w = m[3] * x + m[7] * y + m[11] * z + m[15];
  w = w || 1.0;
  out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
  out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
  out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
  return out;
}

/**
 * Transforms the vec3 with a mat3.
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the vector to transform
 * @param {ReadonlyMat3} m the 3x3 matrix to transform with
 * @returns {vec3} out
 */
function transformMat3(out, a, m) {
  var x = a[0],
    y = a[1],
    z = a[2];
  out[0] = x * m[0] + y * m[3] + z * m[6];
  out[1] = x * m[1] + y * m[4] + z * m[7];
  out[2] = x * m[2] + y * m[5] + z * m[8];
  return out;
}

/**
 * Transforms the vec3 with a quat
 * Can also be used for dual quaternions. (Multiply it with the real part)
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the vector to transform
 * @param {ReadonlyQuat} q normalized quaternion to transform with
 * @returns {vec3} out
 */
function transformQuat(out, a, q) {
  // Fast Vector Rotation using Quaternions by Robert Eisele
  // https://raw.org/proof/vector-rotation-using-quaternions/

  var qx = q[0],
    qy = q[1],
    qz = q[2],
    qw = q[3];
  var vx = a[0],
    vy = a[1],
    vz = a[2];

  // t = q x v
  var tx = qy * vz - qz * vy;
  var ty = qz * vx - qx * vz;
  var tz = qx * vy - qy * vx;

  // t = 2t
  tx = tx + tx;
  ty = ty + ty;
  tz = tz + tz;

  // v + w t + q x t
  out[0] = vx + qw * tx + qy * tz - qz * ty;
  out[1] = vy + qw * ty + qz * tx - qx * tz;
  out[2] = vz + qw * tz + qx * ty - qy * tx;
  return out;
}

/**
 * Rotate a 3D vector around the x-axis
 * @param {vec3} out The receiving vec3
 * @param {ReadonlyVec3} a The vec3 point to rotate
 * @param {ReadonlyVec3} b The origin of the rotation
 * @param {Number} rad The angle of rotation in radians
 * @returns {vec3} out
 */
function vec3_rotateX(out, a, b, rad) {
  var p = [],
    r = [];
  //Translate point to the origin
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];

  //perform rotation
  r[0] = p[0];
  r[1] = p[1] * Math.cos(rad) - p[2] * Math.sin(rad);
  r[2] = p[1] * Math.sin(rad) + p[2] * Math.cos(rad);

  //translate to correct position
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}

/**
 * Rotate a 3D vector around the y-axis
 * @param {vec3} out The receiving vec3
 * @param {ReadonlyVec3} a The vec3 point to rotate
 * @param {ReadonlyVec3} b The origin of the rotation
 * @param {Number} rad The angle of rotation in radians
 * @returns {vec3} out
 */
function vec3_rotateY(out, a, b, rad) {
  var p = [],
    r = [];
  //Translate point to the origin
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];

  //perform rotation
  r[0] = p[2] * Math.sin(rad) + p[0] * Math.cos(rad);
  r[1] = p[1];
  r[2] = p[2] * Math.cos(rad) - p[0] * Math.sin(rad);

  //translate to correct position
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}

/**
 * Rotate a 3D vector around the z-axis
 * @param {vec3} out The receiving vec3
 * @param {ReadonlyVec3} a The vec3 point to rotate
 * @param {ReadonlyVec3} b The origin of the rotation
 * @param {Number} rad The angle of rotation in radians
 * @returns {vec3} out
 */
function vec3_rotateZ(out, a, b, rad) {
  var p = [],
    r = [];
  //Translate point to the origin
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];

  //perform rotation
  r[0] = p[0] * Math.cos(rad) - p[1] * Math.sin(rad);
  r[1] = p[0] * Math.sin(rad) + p[1] * Math.cos(rad);
  r[2] = p[2];

  //translate to correct position
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}

/**
 * Get the angle between two 3D vectors
 * @param {ReadonlyVec3} a The first operand
 * @param {ReadonlyVec3} b The second operand
 * @returns {Number} The angle in radians
 */
function angle(a, b) {
  var ax = a[0],
    ay = a[1],
    az = a[2],
    bx = b[0],
    by = b[1],
    bz = b[2],
    mag = Math.sqrt((ax * ax + ay * ay + az * az) * (bx * bx + by * by + bz * bz)),
    cosine = mag && vec3_dot(a, b) / mag;
  return Math.acos(Math.min(Math.max(cosine, -1), 1));
}

/**
 * Set the components of a vec3 to zero
 *
 * @param {vec3} out the receiving vector
 * @returns {vec3} out
 */
function zero(out) {
  out[0] = 0.0;
  out[1] = 0.0;
  out[2] = 0.0;
  return out;
}

/**
 * Returns a string representation of a vector
 *
 * @param {ReadonlyVec3} a vector to represent as a string
 * @returns {String} string representation of the vector
 */
function vec3_str(a) {
  return "vec3(" + a[0] + ", " + a[1] + ", " + a[2] + ")";
}

/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyVec3} a The first vector.
 * @param {ReadonlyVec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
function vec3_exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {ReadonlyVec3} a The first vector.
 * @param {ReadonlyVec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
function vec3_equals(a, b) {
  var a0 = a[0],
    a1 = a[1],
    a2 = a[2];
  var b0 = b[0],
    b1 = b[1],
    b2 = b[2];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2));
}

/**
 * Alias for {@link vec3.subtract}
 * @function
 */
var vec3_sub = vec3_subtract;

/**
 * Alias for {@link vec3.multiply}
 * @function
 */
var vec3_mul = vec3_multiply;

/**
 * Alias for {@link vec3.divide}
 * @function
 */
var div = divide;

/**
 * Alias for {@link vec3.distance}
 * @function
 */
var dist = distance;

/**
 * Alias for {@link vec3.squaredDistance}
 * @function
 */
var sqrDist = squaredDistance;

/**
 * Alias for {@link vec3.length}
 * @function
 */
var len = vec3_length;

/**
 * Alias for {@link vec3.squaredLength}
 * @function
 */
var sqrLen = squaredLength;

/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
var forEach = function () {
  var vec = vec3_create();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;
    if (!stride) {
      stride = 3;
    }
    if (!offset) {
      offset = 0;
    }
    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }
    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
    }
    return a;
  };
}();
;// CONCATENATED MODULE: ./src/corelibs/node_modules/gl-matrix/esm/vec4.js


/**
 * 4 Dimensional Vector
 * @module vec4
 */

/**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */
function vec4_create() {
  var out = new ARRAY_TYPE(4);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
  }
  return out;
}

/**
 * Creates a new vec4 initialized with values from an existing vector
 *
 * @param {ReadonlyVec4} a vector to clone
 * @returns {vec4} a new 4D vector
 */
function vec4_clone(a) {
  var out = new ARRAY_TYPE(4);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}

/**
 * Creates a new vec4 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} a new 4D vector
 */
function vec4_fromValues(x, y, z, w) {
  var out = new ARRAY_TYPE(4);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}

/**
 * Copy the values from one vec4 to another
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the source vector
 * @returns {vec4} out
 */
function vec4_copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}

/**
 * Set the components of a vec4 to the given values
 *
 * @param {vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} out
 */
function vec4_set(out, x, y, z, w) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}

/**
 * Adds two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */
function vec4_add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  return out;
}

/**
 * Subtracts vector b from vector a
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */
function vec4_subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  return out;
}

/**
 * Multiplies two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */
function vec4_multiply(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  out[2] = a[2] * b[2];
  out[3] = a[3] * b[3];
  return out;
}

/**
 * Divides two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */
function vec4_divide(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  out[2] = a[2] / b[2];
  out[3] = a[3] / b[3];
  return out;
}

/**
 * Math.ceil the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to ceil
 * @returns {vec4} out
 */
function vec4_ceil(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  out[2] = Math.ceil(a[2]);
  out[3] = Math.ceil(a[3]);
  return out;
}

/**
 * Math.floor the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to floor
 * @returns {vec4} out
 */
function vec4_floor(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  out[2] = Math.floor(a[2]);
  out[3] = Math.floor(a[3]);
  return out;
}

/**
 * Returns the minimum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */
function vec4_min(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  out[2] = Math.min(a[2], b[2]);
  out[3] = Math.min(a[3], b[3]);
  return out;
}

/**
 * Returns the maximum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */
function vec4_max(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  out[2] = Math.max(a[2], b[2]);
  out[3] = Math.max(a[3], b[3]);
  return out;
}

/**
 * symmetric round the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to round
 * @returns {vec4} out
 */
function vec4_round(out, a) {
  out[0] = round(a[0]);
  out[1] = round(a[1]);
  out[2] = round(a[2]);
  out[3] = round(a[3]);
  return out;
}

/**
 * Scales a vec4 by a scalar number
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec4} out
 */
function vec4_scale(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  return out;
}

/**
 * Adds two vec4's after scaling the second operand by a scalar value
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec4} out
 */
function vec4_scaleAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  return out;
}

/**
 * Calculates the euclidian distance between two vec4's
 *
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {Number} distance between a and b
 */
function vec4_distance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  var w = b[3] - a[3];
  return Math.sqrt(x * x + y * y + z * z + w * w);
}

/**
 * Calculates the squared euclidian distance between two vec4's
 *
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {Number} squared distance between a and b
 */
function vec4_squaredDistance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  var w = b[3] - a[3];
  return x * x + y * y + z * z + w * w;
}

/**
 * Calculates the length of a vec4
 *
 * @param {ReadonlyVec4} a vector to calculate length of
 * @returns {Number} length of a
 */
function vec4_length(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  return Math.sqrt(x * x + y * y + z * z + w * w);
}

/**
 * Calculates the squared length of a vec4
 *
 * @param {ReadonlyVec4} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
function vec4_squaredLength(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  return x * x + y * y + z * z + w * w;
}

/**
 * Negates the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to negate
 * @returns {vec4} out
 */
function vec4_negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = -a[3];
  return out;
}

/**
 * Returns the inverse of the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to invert
 * @returns {vec4} out
 */
function vec4_inverse(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  out[2] = 1.0 / a[2];
  out[3] = 1.0 / a[3];
  return out;
}

/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to normalize
 * @returns {vec4} out
 */
function vec4_normalize(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  var len = x * x + y * y + z * z + w * w;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }
  out[0] = x * len;
  out[1] = y * len;
  out[2] = z * len;
  out[3] = w * len;
  return out;
}

/**
 * Calculates the dot product of two vec4's
 *
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {Number} dot product of a and b
 */
function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}

/**
 * Returns the cross-product of three vectors in a 4-dimensional space
 *
 * @param {ReadonlyVec4} out the receiving vector
 * @param {ReadonlyVec4} u the first vector
 * @param {ReadonlyVec4} v the second vector
 * @param {ReadonlyVec4} w the third vector
 * @returns {vec4} result
 */
function vec4_cross(out, u, v, w) {
  var A = v[0] * w[1] - v[1] * w[0],
    B = v[0] * w[2] - v[2] * w[0],
    C = v[0] * w[3] - v[3] * w[0],
    D = v[1] * w[2] - v[2] * w[1],
    E = v[1] * w[3] - v[3] * w[1],
    F = v[2] * w[3] - v[3] * w[2];
  var G = u[0];
  var H = u[1];
  var I = u[2];
  var J = u[3];
  out[0] = H * F - I * E + J * D;
  out[1] = -(G * F) + I * C - J * B;
  out[2] = G * E - H * C + J * A;
  out[3] = -(G * D) + H * B - I * A;
  return out;
}

/**
 * Performs a linear interpolation between two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec4} out
 */
function vec4_lerp(out, a, b, t) {
  var ax = a[0];
  var ay = a[1];
  var az = a[2];
  var aw = a[3];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  out[2] = az + t * (b[2] - az);
  out[3] = aw + t * (b[3] - aw);
  return out;
}

/**
 * Generates a random vector with the given scale
 *
 * @param {vec4} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If omitted, a unit vector will be returned
 * @returns {vec4} out
 */
function vec4_random(out, scale) {
  scale = scale === undefined ? 1.0 : scale;

  // Marsaglia, George. Choosing a Point from the Surface of a
  // Sphere. Ann. Math. Statist. 43 (1972), no. 2, 645--646.
  // http://projecteuclid.org/euclid.aoms/1177692644;
  var v1, v2, v3, v4;
  var s1, s2;
  var rand;
  rand = RANDOM();
  v1 = rand * 2 - 1;
  v2 = (4 * RANDOM() - 2) * Math.sqrt(rand * -rand + rand);
  s1 = v1 * v1 + v2 * v2;
  rand = RANDOM();
  v3 = rand * 2 - 1;
  v4 = (4 * RANDOM() - 2) * Math.sqrt(rand * -rand + rand);
  s2 = v3 * v3 + v4 * v4;
  var d = Math.sqrt((1 - s1) / s2);
  out[0] = scale * v1;
  out[1] = scale * v2;
  out[2] = scale * v3 * d;
  out[3] = scale * v4 * d;
  return out;
}

/**
 * Transforms the vec4 with a mat4.
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the vector to transform
 * @param {ReadonlyMat4} m matrix to transform with
 * @returns {vec4} out
 */
function vec4_transformMat4(out, a, m) {
  var x = a[0],
    y = a[1],
    z = a[2],
    w = a[3];
  out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
  out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
  out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
  out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
  return out;
}

/**
 * Transforms the vec4 with a quat
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the vector to transform
 * @param {ReadonlyQuat} q normalized quaternion to transform with
 * @returns {vec4} out
 */
function vec4_transformQuat(out, a, q) {
  // Fast Vector Rotation using Quaternions by Robert Eisele
  // https://raw.org/proof/vector-rotation-using-quaternions/

  var qx = q[0],
    qy = q[1],
    qz = q[2],
    qw = q[3];
  var vx = a[0],
    vy = a[1],
    vz = a[2];

  // t = q x v
  var tx = qy * vz - qz * vy;
  var ty = qz * vx - qx * vz;
  var tz = qx * vy - qy * vx;

  // t = 2t
  tx = tx + tx;
  ty = ty + ty;
  tz = tz + tz;

  // v + w t + q x t
  out[0] = vx + qw * tx + qy * tz - qz * ty;
  out[1] = vy + qw * ty + qz * tx - qx * tz;
  out[2] = vz + qw * tz + qx * ty - qy * tx;
  out[3] = a[3];
  return out;
}

/**
 * Set the components of a vec4 to zero
 *
 * @param {vec4} out the receiving vector
 * @returns {vec4} out
 */
function vec4_zero(out) {
  out[0] = 0.0;
  out[1] = 0.0;
  out[2] = 0.0;
  out[3] = 0.0;
  return out;
}

/**
 * Returns a string representation of a vector
 *
 * @param {ReadonlyVec4} a vector to represent as a string
 * @returns {String} string representation of the vector
 */
function vec4_str(a) {
  return "vec4(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
}

/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyVec4} a The first vector.
 * @param {ReadonlyVec4} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
function vec4_exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {ReadonlyVec4} a The first vector.
 * @param {ReadonlyVec4} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
function vec4_equals(a, b) {
  var a0 = a[0],
    a1 = a[1],
    a2 = a[2],
    a3 = a[3];
  var b0 = b[0],
    b1 = b[1],
    b2 = b[2],
    b3 = b[3];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3));
}

/**
 * Alias for {@link vec4.subtract}
 * @function
 */
var vec4_sub = vec4_subtract;

/**
 * Alias for {@link vec4.multiply}
 * @function
 */
var vec4_mul = vec4_multiply;

/**
 * Alias for {@link vec4.divide}
 * @function
 */
var vec4_div = vec4_divide;

/**
 * Alias for {@link vec4.distance}
 * @function
 */
var vec4_dist = vec4_distance;

/**
 * Alias for {@link vec4.squaredDistance}
 * @function
 */
var vec4_sqrDist = vec4_squaredDistance;

/**
 * Alias for {@link vec4.length}
 * @function
 */
var vec4_len = vec4_length;

/**
 * Alias for {@link vec4.squaredLength}
 * @function
 */
var vec4_sqrLen = vec4_squaredLength;

/**
 * Perform some operation over an array of vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
var vec4_forEach = function () {
  var vec = vec4_create();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;
    if (!stride) {
      stride = 4;
    }
    if (!offset) {
      offset = 0;
    }
    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }
    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      vec[3] = a[i + 3];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
      a[i + 3] = vec[3];
    }
    return a;
  };
}();
;// CONCATENATED MODULE: ./src/corelibs/node_modules/gl-matrix/esm/quat.js





/**
 * Quaternion in the format XYZW
 * @module quat
 */

/**
 * Creates a new identity quat
 *
 * @returns {quat} a new quaternion
 */
function quat_create() {
  var out = new ARRAY_TYPE(4);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }
  out[3] = 1;
  return out;
}

/**
 * Set a quat to the identity quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */
function quat_identity(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  return out;
}

/**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyVec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {quat} out
 **/
function setAxisAngle(out, axis, rad) {
  rad = rad * 0.5;
  var s = Math.sin(rad);
  out[0] = s * axis[0];
  out[1] = s * axis[1];
  out[2] = s * axis[2];
  out[3] = Math.cos(rad);
  return out;
}

/**
 * Gets the rotation axis and angle for a given
 *  quaternion. If a quaternion is created with
 *  setAxisAngle, this method will return the same
 *  values as providied in the original parameter list
 *  OR functionally equivalent values.
 * Example: The quaternion formed by axis [0, 0, 1] and
 *  angle -90 is the same as the quaternion formed by
 *  [0, 0, 1] and 270. This method favors the latter.
 * @param  {vec3} out_axis  Vector receiving the axis of rotation
 * @param  {ReadonlyQuat} q     Quaternion to be decomposed
 * @return {Number}     Angle, in radians, of the rotation
 */
function getAxisAngle(out_axis, q) {
  var rad = Math.acos(q[3]) * 2.0;
  var s = Math.sin(rad / 2.0);
  if (s > EPSILON) {
    out_axis[0] = q[0] / s;
    out_axis[1] = q[1] / s;
    out_axis[2] = q[2] / s;
  } else {
    // If s is zero, return any axis (no rotation - axis does not matter)
    out_axis[0] = 1;
    out_axis[1] = 0;
    out_axis[2] = 0;
  }
  return rad;
}

/**
 * Gets the angular distance between two unit quaternions
 *
 * @param  {ReadonlyQuat} a     Origin unit quaternion
 * @param  {ReadonlyQuat} b     Destination unit quaternion
 * @return {Number}     Angle, in radians, between the two quaternions
 */
function getAngle(a, b) {
  var dotproduct = quat_dot(a, b);
  return Math.acos(2 * dotproduct * dotproduct - 1);
}

/**
 * Multiplies two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @returns {quat} out
 */
function quat_multiply(out, a, b) {
  var ax = a[0],
    ay = a[1],
    az = a[2],
    aw = a[3];
  var bx = b[0],
    by = b[1],
    bz = b[2],
    bw = b[3];
  out[0] = ax * bw + aw * bx + ay * bz - az * by;
  out[1] = ay * bw + aw * by + az * bx - ax * bz;
  out[2] = az * bw + aw * bz + ax * by - ay * bx;
  out[3] = aw * bw - ax * bx - ay * by - az * bz;
  return out;
}

/**
 * Rotates a quaternion by the given angle about the X axis
 *
 * @param {quat} out quat receiving operation result
 * @param {ReadonlyQuat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
function quat_rotateX(out, a, rad) {
  rad *= 0.5;
  var ax = a[0],
    ay = a[1],
    az = a[2],
    aw = a[3];
  var bx = Math.sin(rad),
    bw = Math.cos(rad);
  out[0] = ax * bw + aw * bx;
  out[1] = ay * bw + az * bx;
  out[2] = az * bw - ay * bx;
  out[3] = aw * bw - ax * bx;
  return out;
}

/**
 * Rotates a quaternion by the given angle about the Y axis
 *
 * @param {quat} out quat receiving operation result
 * @param {ReadonlyQuat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
function quat_rotateY(out, a, rad) {
  rad *= 0.5;
  var ax = a[0],
    ay = a[1],
    az = a[2],
    aw = a[3];
  var by = Math.sin(rad),
    bw = Math.cos(rad);
  out[0] = ax * bw - az * by;
  out[1] = ay * bw + aw * by;
  out[2] = az * bw + ax * by;
  out[3] = aw * bw - ay * by;
  return out;
}

/**
 * Rotates a quaternion by the given angle about the Z axis
 *
 * @param {quat} out quat receiving operation result
 * @param {ReadonlyQuat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
function quat_rotateZ(out, a, rad) {
  rad *= 0.5;
  var ax = a[0],
    ay = a[1],
    az = a[2],
    aw = a[3];
  var bz = Math.sin(rad),
    bw = Math.cos(rad);
  out[0] = ax * bw + ay * bz;
  out[1] = ay * bw - ax * bz;
  out[2] = az * bw + aw * bz;
  out[3] = aw * bw - az * bz;
  return out;
}

/**
 * Calculates the W component of a quat from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length.
 * Any existing W component will be ignored.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quat to calculate W component of
 * @returns {quat} out
 */
function calculateW(out, a) {
  var x = a[0],
    y = a[1],
    z = a[2];
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
  return out;
}

/**
 * Calculate the exponential of a unit quaternion.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quat to calculate the exponential of
 * @returns {quat} out
 */
function exp(out, a) {
  var x = a[0],
    y = a[1],
    z = a[2],
    w = a[3];
  var r = Math.sqrt(x * x + y * y + z * z);
  var et = Math.exp(w);
  var s = r > 0 ? et * Math.sin(r) / r : 0;
  out[0] = x * s;
  out[1] = y * s;
  out[2] = z * s;
  out[3] = et * Math.cos(r);
  return out;
}

/**
 * Calculate the natural logarithm of a unit quaternion.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quat to calculate the exponential of
 * @returns {quat} out
 */
function ln(out, a) {
  var x = a[0],
    y = a[1],
    z = a[2],
    w = a[3];
  var r = Math.sqrt(x * x + y * y + z * z);
  var t = r > 0 ? Math.atan2(r, w) / r : 0;
  out[0] = x * t;
  out[1] = y * t;
  out[2] = z * t;
  out[3] = 0.5 * Math.log(x * x + y * y + z * z + w * w);
  return out;
}

/**
 * Calculate the scalar power of a unit quaternion.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quat to calculate the exponential of
 * @param {Number} b amount to scale the quaternion by
 * @returns {quat} out
 */
function pow(out, a, b) {
  ln(out, a);
  quat_scale(out, out, b);
  exp(out, out);
  return out;
}

/**
 * Performs a spherical linear interpolation between two quat
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 */
function quat_slerp(out, a, b, t) {
  // benchmarks:
  //    http://jsperf.com/quaternion-slerp-implementations
  var ax = a[0],
    ay = a[1],
    az = a[2],
    aw = a[3];
  var bx = b[0],
    by = b[1],
    bz = b[2],
    bw = b[3];
  var omega, cosom, sinom, scale0, scale1;

  // calc cosine
  cosom = ax * bx + ay * by + az * bz + aw * bw;
  // adjust signs (if necessary)
  if (cosom < 0.0) {
    cosom = -cosom;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  }
  // calculate coefficients
  if (1.0 - cosom > EPSILON) {
    // standard case (slerp)
    omega = Math.acos(cosom);
    sinom = Math.sin(omega);
    scale0 = Math.sin((1.0 - t) * omega) / sinom;
    scale1 = Math.sin(t * omega) / sinom;
  } else {
    // "from" and "to" quaternions are very close
    //  ... so we can do a linear interpolation
    scale0 = 1.0 - t;
    scale1 = t;
  }
  // calculate final values
  out[0] = scale0 * ax + scale1 * bx;
  out[1] = scale0 * ay + scale1 * by;
  out[2] = scale0 * az + scale1 * bz;
  out[3] = scale0 * aw + scale1 * bw;
  return out;
}

/**
 * Generates a random unit quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */
function quat_random(out) {
  // Implementation of http://planning.cs.uiuc.edu/node198.html
  // TODO: Calling random 3 times is probably not the fastest solution
  var u1 = RANDOM();
  var u2 = RANDOM();
  var u3 = RANDOM();
  var sqrt1MinusU1 = Math.sqrt(1 - u1);
  var sqrtU1 = Math.sqrt(u1);
  out[0] = sqrt1MinusU1 * Math.sin(2.0 * Math.PI * u2);
  out[1] = sqrt1MinusU1 * Math.cos(2.0 * Math.PI * u2);
  out[2] = sqrtU1 * Math.sin(2.0 * Math.PI * u3);
  out[3] = sqrtU1 * Math.cos(2.0 * Math.PI * u3);
  return out;
}

/**
 * Calculates the inverse of a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quat to calculate inverse of
 * @returns {quat} out
 */
function quat_invert(out, a) {
  var a0 = a[0],
    a1 = a[1],
    a2 = a[2],
    a3 = a[3];
  var dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
  var invDot = dot ? 1.0 / dot : 0;

  // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

  out[0] = -a0 * invDot;
  out[1] = -a1 * invDot;
  out[2] = -a2 * invDot;
  out[3] = a3 * invDot;
  return out;
}

/**
 * Calculates the conjugate of a quat
 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quat to calculate conjugate of
 * @returns {quat} out
 */
function conjugate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a[3];
  return out;
}

/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * NOTE: The resultant quaternion is not normalized, so you should be sure
 * to renormalize the quaternion yourself where necessary.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyMat3} m rotation matrix
 * @returns {quat} out
 * @function
 */
function fromMat3(out, m) {
  // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
  // article "Quaternion Calculus and Fast Animation".
  var fTrace = m[0] + m[4] + m[8];
  var fRoot;
  if (fTrace > 0.0) {
    // |w| > 1/2, may as well choose w > 1/2
    fRoot = Math.sqrt(fTrace + 1.0); // 2w
    out[3] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot; // 1/(4w)
    out[0] = (m[5] - m[7]) * fRoot;
    out[1] = (m[6] - m[2]) * fRoot;
    out[2] = (m[1] - m[3]) * fRoot;
  } else {
    // |w| <= 1/2
    var i = 0;
    if (m[4] > m[0]) i = 1;
    if (m[8] > m[i * 3 + i]) i = 2;
    var j = (i + 1) % 3;
    var k = (i + 2) % 3;
    fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
    out[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
    out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
    out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
  }
  return out;
}

/**
 * Creates a quaternion from the given euler angle x, y, z using the provided intrinsic order for the conversion.
 *
 * @param {quat} out the receiving quaternion
 * @param {Number} x Angle to rotate around X axis in degrees.
 * @param {Number} y Angle to rotate around Y axis in degrees.
 * @param {Number} z Angle to rotate around Z axis in degrees.
 * @param {'xyz'|'xzy'|'yxz'|'yzx'|'zxy'|'zyx'} order Intrinsic order for conversion, default is zyx.
 * @returns {quat} out
 * @function
 */
function fromEuler(out, x, y, z) {
  var order = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : ANGLE_ORDER;
  var halfToRad = Math.PI / 360;
  x *= halfToRad;
  z *= halfToRad;
  y *= halfToRad;
  var sx = Math.sin(x);
  var cx = Math.cos(x);
  var sy = Math.sin(y);
  var cy = Math.cos(y);
  var sz = Math.sin(z);
  var cz = Math.cos(z);
  switch (order) {
    case "xyz":
      out[0] = sx * cy * cz + cx * sy * sz;
      out[1] = cx * sy * cz - sx * cy * sz;
      out[2] = cx * cy * sz + sx * sy * cz;
      out[3] = cx * cy * cz - sx * sy * sz;
      break;
    case "xzy":
      out[0] = sx * cy * cz - cx * sy * sz;
      out[1] = cx * sy * cz - sx * cy * sz;
      out[2] = cx * cy * sz + sx * sy * cz;
      out[3] = cx * cy * cz + sx * sy * sz;
      break;
    case "yxz":
      out[0] = sx * cy * cz + cx * sy * sz;
      out[1] = cx * sy * cz - sx * cy * sz;
      out[2] = cx * cy * sz - sx * sy * cz;
      out[3] = cx * cy * cz + sx * sy * sz;
      break;
    case "yzx":
      out[0] = sx * cy * cz + cx * sy * sz;
      out[1] = cx * sy * cz + sx * cy * sz;
      out[2] = cx * cy * sz - sx * sy * cz;
      out[3] = cx * cy * cz - sx * sy * sz;
      break;
    case "zxy":
      out[0] = sx * cy * cz - cx * sy * sz;
      out[1] = cx * sy * cz + sx * cy * sz;
      out[2] = cx * cy * sz + sx * sy * cz;
      out[3] = cx * cy * cz - sx * sy * sz;
      break;
    case "zyx":
      out[0] = sx * cy * cz - cx * sy * sz;
      out[1] = cx * sy * cz + sx * cy * sz;
      out[2] = cx * cy * sz - sx * sy * cz;
      out[3] = cx * cy * cz + sx * sy * sz;
      break;
    default:
      throw new Error('Unknown angle order ' + order);
  }
  return out;
}

/**
 * Returns a string representation of a quaternion
 *
 * @param {ReadonlyQuat} a vector to represent as a string
 * @returns {String} string representation of the vector
 */
function quat_str(a) {
  return "quat(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
}

/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param {ReadonlyQuat} a quaternion to clone
 * @returns {quat} a new quaternion
 * @function
 */
var quat_clone = vec4_clone;

/**
 * Creates a new quat initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} a new quaternion
 * @function
 */
var quat_fromValues = vec4_fromValues;

/**
 * Copy the values from one quat to another
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the source quaternion
 * @returns {quat} out
 * @function
 */
var quat_copy = vec4_copy;

/**
 * Set the components of a quat to the given values
 *
 * @param {quat} out the receiving quaternion
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} out
 * @function
 */
var quat_set = vec4_set;

/**
 * Adds two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @returns {quat} out
 * @function
 */
var quat_add = vec4_add;

/**
 * Alias for {@link quat.multiply}
 * @function
 */
var quat_mul = quat_multiply;

/**
 * Scales a quat by a scalar number
 *
 * @param {quat} out the receiving vector
 * @param {ReadonlyQuat} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {quat} out
 * @function
 */
var quat_scale = vec4_scale;

/**
 * Calculates the dot product of two quat's
 *
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */
var quat_dot = dot;

/**
 * Performs a linear interpolation between two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 * @function
 */
var quat_lerp = vec4_lerp;

/**
 * Calculates the length of a quat
 *
 * @param {ReadonlyQuat} a vector to calculate length of
 * @returns {Number} length of a
 */
var quat_length = vec4_length;

/**
 * Alias for {@link quat.length}
 * @function
 */
var quat_len = quat_length;

/**
 * Calculates the squared length of a quat
 *
 * @param {ReadonlyQuat} a vector to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */
var quat_squaredLength = vec4_squaredLength;

/**
 * Alias for {@link quat.squaredLength}
 * @function
 */
var quat_sqrLen = quat_squaredLength;

/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */
var quat_normalize = vec4_normalize;

/**
 * Returns whether or not the quaternions have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyQuat} a The first quaternion.
 * @param {ReadonlyQuat} b The second quaternion.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
var quat_exactEquals = vec4_exactEquals;

/**
 * Returns whether or not the quaternions point approximately to the same direction.
 *
 * Both quaternions are assumed to be unit length.
 *
 * @param {ReadonlyQuat} a The first unit quaternion.
 * @param {ReadonlyQuat} b The second unit quaternion.
 * @returns {Boolean} True if the quaternions are equal, false otherwise.
 */
function quat_equals(a, b) {
  return Math.abs(dot(a, b)) >= 1 - EPSILON;
}

/**
 * Sets a quaternion to represent the shortest rotation from one
 * vector to another.
 *
 * Both vectors are assumed to be unit length.
 *
 * @param {quat} out the receiving quaternion.
 * @param {ReadonlyVec3} a the initial vector
 * @param {ReadonlyVec3} b the destination vector
 * @returns {quat} out
 */
var rotationTo = function () {
  var tmpvec3 = vec3_create();
  var xUnitVec3 = vec3_fromValues(1, 0, 0);
  var yUnitVec3 = vec3_fromValues(0, 1, 0);
  return function (out, a, b) {
    var dot = vec3_dot(a, b);
    if (dot < -0.999999) {
      cross(tmpvec3, xUnitVec3, a);
      if (len(tmpvec3) < 0.000001) cross(tmpvec3, yUnitVec3, a);
      normalize(tmpvec3, tmpvec3);
      setAxisAngle(out, tmpvec3, Math.PI);
      return out;
    } else if (dot > 0.999999) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 1;
      return out;
    } else {
      cross(tmpvec3, a, b);
      out[0] = tmpvec3[0];
      out[1] = tmpvec3[1];
      out[2] = tmpvec3[2];
      out[3] = 1 + dot;
      return quat_normalize(out, out);
    }
  };
}();

/**
 * Performs a spherical linear interpolation with two control points
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @param {ReadonlyQuat} c the third operand
 * @param {ReadonlyQuat} d the fourth operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 */
var sqlerp = function () {
  var temp1 = quat_create();
  var temp2 = quat_create();
  return function (out, a, b, c, d, t) {
    quat_slerp(temp1, a, d, t);
    quat_slerp(temp2, b, c, t);
    quat_slerp(out, temp1, temp2, 2 * t * (1 - t));
    return out;
  };
}();

/**
 * Sets the specified quaternion with values corresponding to the given
 * axes. Each axis is a vec3 and is expected to be unit length and
 * perpendicular to all other specified axes.
 *
 * @param {ReadonlyVec3} view  the vector representing the viewing direction
 * @param {ReadonlyVec3} right the vector representing the local "right" direction
 * @param {ReadonlyVec3} up    the vector representing the local "up" direction
 * @returns {quat} out
 */
var setAxes = function () {
  var matr = mat3_create();
  return function (out, view, right, up) {
    matr[0] = right[0];
    matr[3] = right[1];
    matr[6] = right[2];
    matr[1] = up[0];
    matr[4] = up[1];
    matr[7] = up[2];
    matr[2] = -view[0];
    matr[5] = -view[1];
    matr[8] = -view[2];
    return quat_normalize(out, fromMat3(out, matr));
  };
}();
;// CONCATENATED MODULE: ./src/corelibs/node_modules/gl-matrix/esm/quat2.js




/**
 * Dual Quaternion<br>
 * Format: [real, dual]<br>
 * Quaternion format: XYZW<br>
 * Make sure to have normalized dual quaternions, otherwise the functions may not work as intended.<br>
 * @module quat2
 */

/**
 * Creates a new identity dual quat
 *
 * @returns {quat2} a new dual quaternion [real -> rotation, dual -> translation]
 */
function quat2_create() {
  var dq = new ARRAY_TYPE(8);
  if (ARRAY_TYPE != Float32Array) {
    dq[0] = 0;
    dq[1] = 0;
    dq[2] = 0;
    dq[4] = 0;
    dq[5] = 0;
    dq[6] = 0;
    dq[7] = 0;
  }
  dq[3] = 1;
  return dq;
}

/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param {ReadonlyQuat2} a dual quaternion to clone
 * @returns {quat2} new dual quaternion
 * @function
 */
function quat2_clone(a) {
  var dq = new ARRAY_TYPE(8);
  dq[0] = a[0];
  dq[1] = a[1];
  dq[2] = a[2];
  dq[3] = a[3];
  dq[4] = a[4];
  dq[5] = a[5];
  dq[6] = a[6];
  dq[7] = a[7];
  return dq;
}

/**
 * Creates a new dual quat initialized with the given values
 *
 * @param {Number} x1 X component
 * @param {Number} y1 Y component
 * @param {Number} z1 Z component
 * @param {Number} w1 W component
 * @param {Number} x2 X component
 * @param {Number} y2 Y component
 * @param {Number} z2 Z component
 * @param {Number} w2 W component
 * @returns {quat2} new dual quaternion
 * @function
 */
function quat2_fromValues(x1, y1, z1, w1, x2, y2, z2, w2) {
  var dq = new ARRAY_TYPE(8);
  dq[0] = x1;
  dq[1] = y1;
  dq[2] = z1;
  dq[3] = w1;
  dq[4] = x2;
  dq[5] = y2;
  dq[6] = z2;
  dq[7] = w2;
  return dq;
}

/**
 * Creates a new dual quat from the given values (quat and translation)
 *
 * @param {Number} x1 X component
 * @param {Number} y1 Y component
 * @param {Number} z1 Z component
 * @param {Number} w1 W component
 * @param {Number} x2 X component (translation)
 * @param {Number} y2 Y component (translation)
 * @param {Number} z2 Z component (translation)
 * @returns {quat2} new dual quaternion
 * @function
 */
function fromRotationTranslationValues(x1, y1, z1, w1, x2, y2, z2) {
  var dq = new ARRAY_TYPE(8);
  dq[0] = x1;
  dq[1] = y1;
  dq[2] = z1;
  dq[3] = w1;
  var ax = x2 * 0.5,
    ay = y2 * 0.5,
    az = z2 * 0.5;
  dq[4] = ax * w1 + ay * z1 - az * y1;
  dq[5] = ay * w1 + az * x1 - ax * z1;
  dq[6] = az * w1 + ax * y1 - ay * x1;
  dq[7] = -ax * x1 - ay * y1 - az * z1;
  return dq;
}

/**
 * Creates a dual quat from a quaternion and a translation
 *
 * @param {ReadonlyQuat2} dual quaternion receiving operation result
 * @param {ReadonlyQuat} q a normalized quaternion
 * @param {ReadonlyVec3} t translation vector
 * @returns {quat2} dual quaternion receiving operation result
 * @function
 */
function quat2_fromRotationTranslation(out, q, t) {
  var ax = t[0] * 0.5,
    ay = t[1] * 0.5,
    az = t[2] * 0.5,
    bx = q[0],
    by = q[1],
    bz = q[2],
    bw = q[3];
  out[0] = bx;
  out[1] = by;
  out[2] = bz;
  out[3] = bw;
  out[4] = ax * bw + ay * bz - az * by;
  out[5] = ay * bw + az * bx - ax * bz;
  out[6] = az * bw + ax * by - ay * bx;
  out[7] = -ax * bx - ay * by - az * bz;
  return out;
}

/**
 * Creates a dual quat from a translation
 *
 * @param {ReadonlyQuat2} dual quaternion receiving operation result
 * @param {ReadonlyVec3} t translation vector
 * @returns {quat2} dual quaternion receiving operation result
 * @function
 */
function quat2_fromTranslation(out, t) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = t[0] * 0.5;
  out[5] = t[1] * 0.5;
  out[6] = t[2] * 0.5;
  out[7] = 0;
  return out;
}

/**
 * Creates a dual quat from a quaternion
 *
 * @param {ReadonlyQuat2} dual quaternion receiving operation result
 * @param {ReadonlyQuat} q the quaternion
 * @returns {quat2} dual quaternion receiving operation result
 * @function
 */
function quat2_fromRotation(out, q) {
  out[0] = q[0];
  out[1] = q[1];
  out[2] = q[2];
  out[3] = q[3];
  out[4] = 0;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  return out;
}

/**
 * Creates a new dual quat from a matrix (4x4)
 *
 * @param {quat2} out the dual quaternion
 * @param {ReadonlyMat4} a the matrix
 * @returns {quat2} dual quat receiving operation result
 * @function
 */
function quat2_fromMat4(out, a) {
  //TODO Optimize this
  var outer = quat_create();
  getRotation(outer, a);
  var t = new ARRAY_TYPE(3);
  getTranslation(t, a);
  quat2_fromRotationTranslation(out, outer, t);
  return out;
}

/**
 * Copy the values from one dual quat to another
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the source dual quaternion
 * @returns {quat2} out
 * @function
 */
function quat2_copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  return out;
}

/**
 * Set a dual quat to the identity dual quaternion
 *
 * @param {quat2} out the receiving quaternion
 * @returns {quat2} out
 */
function quat2_identity(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = 0;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  return out;
}

/**
 * Set the components of a dual quat to the given values
 *
 * @param {quat2} out the receiving quaternion
 * @param {Number} x1 X component
 * @param {Number} y1 Y component
 * @param {Number} z1 Z component
 * @param {Number} w1 W component
 * @param {Number} x2 X component
 * @param {Number} y2 Y component
 * @param {Number} z2 Z component
 * @param {Number} w2 W component
 * @returns {quat2} out
 * @function
 */
function quat2_set(out, x1, y1, z1, w1, x2, y2, z2, w2) {
  out[0] = x1;
  out[1] = y1;
  out[2] = z1;
  out[3] = w1;
  out[4] = x2;
  out[5] = y2;
  out[6] = z2;
  out[7] = w2;
  return out;
}

/**
 * Gets the real part of a dual quat
 * @param  {quat} out real part
 * @param  {ReadonlyQuat2} a Dual Quaternion
 * @return {quat} real part
 */
var getReal = quat_copy;

/**
 * Gets the dual part of a dual quat
 * @param  {quat} out dual part
 * @param  {ReadonlyQuat2} a Dual Quaternion
 * @return {quat} dual part
 */
function getDual(out, a) {
  out[0] = a[4];
  out[1] = a[5];
  out[2] = a[6];
  out[3] = a[7];
  return out;
}

/**
 * Set the real component of a dual quat to the given quaternion
 *
 * @param {quat2} out the receiving quaternion
 * @param {ReadonlyQuat} q a quaternion representing the real part
 * @returns {quat2} out
 * @function
 */
var setReal = quat_copy;

/**
 * Set the dual component of a dual quat to the given quaternion
 *
 * @param {quat2} out the receiving quaternion
 * @param {ReadonlyQuat} q a quaternion representing the dual part
 * @returns {quat2} out
 * @function
 */
function setDual(out, q) {
  out[4] = q[0];
  out[5] = q[1];
  out[6] = q[2];
  out[7] = q[3];
  return out;
}

/**
 * Gets the translation of a normalized dual quat
 * @param  {vec3} out translation
 * @param  {ReadonlyQuat2} a Dual Quaternion to be decomposed
 * @return {vec3} translation
 */
function quat2_getTranslation(out, a) {
  var ax = a[4],
    ay = a[5],
    az = a[6],
    aw = a[7],
    bx = -a[0],
    by = -a[1],
    bz = -a[2],
    bw = a[3];
  out[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
  out[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
  out[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
  return out;
}

/**
 * Translates a dual quat by the given vector
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the dual quaternion to translate
 * @param {ReadonlyVec3} v vector to translate by
 * @returns {quat2} out
 */
function quat2_translate(out, a, v) {
  var ax1 = a[0],
    ay1 = a[1],
    az1 = a[2],
    aw1 = a[3],
    bx1 = v[0] * 0.5,
    by1 = v[1] * 0.5,
    bz1 = v[2] * 0.5,
    ax2 = a[4],
    ay2 = a[5],
    az2 = a[6],
    aw2 = a[7];
  out[0] = ax1;
  out[1] = ay1;
  out[2] = az1;
  out[3] = aw1;
  out[4] = aw1 * bx1 + ay1 * bz1 - az1 * by1 + ax2;
  out[5] = aw1 * by1 + az1 * bx1 - ax1 * bz1 + ay2;
  out[6] = aw1 * bz1 + ax1 * by1 - ay1 * bx1 + az2;
  out[7] = -ax1 * bx1 - ay1 * by1 - az1 * bz1 + aw2;
  return out;
}

/**
 * Rotates a dual quat around the X axis
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the dual quaternion to rotate
 * @param {number} rad how far should the rotation be
 * @returns {quat2} out
 */
function quat2_rotateX(out, a, rad) {
  var bx = -a[0],
    by = -a[1],
    bz = -a[2],
    bw = a[3],
    ax = a[4],
    ay = a[5],
    az = a[6],
    aw = a[7],
    ax1 = ax * bw + aw * bx + ay * bz - az * by,
    ay1 = ay * bw + aw * by + az * bx - ax * bz,
    az1 = az * bw + aw * bz + ax * by - ay * bx,
    aw1 = aw * bw - ax * bx - ay * by - az * bz;
  quat_rotateX(out, a, rad);
  bx = out[0];
  by = out[1];
  bz = out[2];
  bw = out[3];
  out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  return out;
}

/**
 * Rotates a dual quat around the Y axis
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the dual quaternion to rotate
 * @param {number} rad how far should the rotation be
 * @returns {quat2} out
 */
function quat2_rotateY(out, a, rad) {
  var bx = -a[0],
    by = -a[1],
    bz = -a[2],
    bw = a[3],
    ax = a[4],
    ay = a[5],
    az = a[6],
    aw = a[7],
    ax1 = ax * bw + aw * bx + ay * bz - az * by,
    ay1 = ay * bw + aw * by + az * bx - ax * bz,
    az1 = az * bw + aw * bz + ax * by - ay * bx,
    aw1 = aw * bw - ax * bx - ay * by - az * bz;
  quat_rotateY(out, a, rad);
  bx = out[0];
  by = out[1];
  bz = out[2];
  bw = out[3];
  out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  return out;
}

/**
 * Rotates a dual quat around the Z axis
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the dual quaternion to rotate
 * @param {number} rad how far should the rotation be
 * @returns {quat2} out
 */
function quat2_rotateZ(out, a, rad) {
  var bx = -a[0],
    by = -a[1],
    bz = -a[2],
    bw = a[3],
    ax = a[4],
    ay = a[5],
    az = a[6],
    aw = a[7],
    ax1 = ax * bw + aw * bx + ay * bz - az * by,
    ay1 = ay * bw + aw * by + az * bx - ax * bz,
    az1 = az * bw + aw * bz + ax * by - ay * bx,
    aw1 = aw * bw - ax * bx - ay * by - az * bz;
  quat_rotateZ(out, a, rad);
  bx = out[0];
  by = out[1];
  bz = out[2];
  bw = out[3];
  out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  return out;
}

/**
 * Rotates a dual quat by a given quaternion (a * q)
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the dual quaternion to rotate
 * @param {ReadonlyQuat} q quaternion to rotate by
 * @returns {quat2} out
 */
function rotateByQuatAppend(out, a, q) {
  var qx = q[0],
    qy = q[1],
    qz = q[2],
    qw = q[3],
    ax = a[0],
    ay = a[1],
    az = a[2],
    aw = a[3];
  out[0] = ax * qw + aw * qx + ay * qz - az * qy;
  out[1] = ay * qw + aw * qy + az * qx - ax * qz;
  out[2] = az * qw + aw * qz + ax * qy - ay * qx;
  out[3] = aw * qw - ax * qx - ay * qy - az * qz;
  ax = a[4];
  ay = a[5];
  az = a[6];
  aw = a[7];
  out[4] = ax * qw + aw * qx + ay * qz - az * qy;
  out[5] = ay * qw + aw * qy + az * qx - ax * qz;
  out[6] = az * qw + aw * qz + ax * qy - ay * qx;
  out[7] = aw * qw - ax * qx - ay * qy - az * qz;
  return out;
}

/**
 * Rotates a dual quat by a given quaternion (q * a)
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat} q quaternion to rotate by
 * @param {ReadonlyQuat2} a the dual quaternion to rotate
 * @returns {quat2} out
 */
function rotateByQuatPrepend(out, q, a) {
  var qx = q[0],
    qy = q[1],
    qz = q[2],
    qw = q[3],
    bx = a[0],
    by = a[1],
    bz = a[2],
    bw = a[3];
  out[0] = qx * bw + qw * bx + qy * bz - qz * by;
  out[1] = qy * bw + qw * by + qz * bx - qx * bz;
  out[2] = qz * bw + qw * bz + qx * by - qy * bx;
  out[3] = qw * bw - qx * bx - qy * by - qz * bz;
  bx = a[4];
  by = a[5];
  bz = a[6];
  bw = a[7];
  out[4] = qx * bw + qw * bx + qy * bz - qz * by;
  out[5] = qy * bw + qw * by + qz * bx - qx * bz;
  out[6] = qz * bw + qw * bz + qx * by - qy * bx;
  out[7] = qw * bw - qx * bx - qy * by - qz * bz;
  return out;
}

/**
 * Rotates a dual quat around a given axis. Does the normalisation automatically
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the dual quaternion to rotate
 * @param {ReadonlyVec3} axis the axis to rotate around
 * @param {Number} rad how far the rotation should be
 * @returns {quat2} out
 */
function rotateAroundAxis(out, a, axis, rad) {
  //Special case for rad = 0
  if (Math.abs(rad) < EPSILON) {
    return quat2_copy(out, a);
  }
  var axisLength = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
  rad = rad * 0.5;
  var s = Math.sin(rad);
  var bx = s * axis[0] / axisLength;
  var by = s * axis[1] / axisLength;
  var bz = s * axis[2] / axisLength;
  var bw = Math.cos(rad);
  var ax1 = a[0],
    ay1 = a[1],
    az1 = a[2],
    aw1 = a[3];
  out[0] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[1] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[2] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[3] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  var ax = a[4],
    ay = a[5],
    az = a[6],
    aw = a[7];
  out[4] = ax * bw + aw * bx + ay * bz - az * by;
  out[5] = ay * bw + aw * by + az * bx - ax * bz;
  out[6] = az * bw + aw * bz + ax * by - ay * bx;
  out[7] = aw * bw - ax * bx - ay * by - az * bz;
  return out;
}

/**
 * Adds two dual quat's
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the first operand
 * @param {ReadonlyQuat2} b the second operand
 * @returns {quat2} out
 * @function
 */
function quat2_add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  return out;
}

/**
 * Multiplies two dual quat's
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the first operand
 * @param {ReadonlyQuat2} b the second operand
 * @returns {quat2} out
 */
function quat2_multiply(out, a, b) {
  var ax0 = a[0],
    ay0 = a[1],
    az0 = a[2],
    aw0 = a[3],
    bx1 = b[4],
    by1 = b[5],
    bz1 = b[6],
    bw1 = b[7],
    ax1 = a[4],
    ay1 = a[5],
    az1 = a[6],
    aw1 = a[7],
    bx0 = b[0],
    by0 = b[1],
    bz0 = b[2],
    bw0 = b[3];
  out[0] = ax0 * bw0 + aw0 * bx0 + ay0 * bz0 - az0 * by0;
  out[1] = ay0 * bw0 + aw0 * by0 + az0 * bx0 - ax0 * bz0;
  out[2] = az0 * bw0 + aw0 * bz0 + ax0 * by0 - ay0 * bx0;
  out[3] = aw0 * bw0 - ax0 * bx0 - ay0 * by0 - az0 * bz0;
  out[4] = ax0 * bw1 + aw0 * bx1 + ay0 * bz1 - az0 * by1 + ax1 * bw0 + aw1 * bx0 + ay1 * bz0 - az1 * by0;
  out[5] = ay0 * bw1 + aw0 * by1 + az0 * bx1 - ax0 * bz1 + ay1 * bw0 + aw1 * by0 + az1 * bx0 - ax1 * bz0;
  out[6] = az0 * bw1 + aw0 * bz1 + ax0 * by1 - ay0 * bx1 + az1 * bw0 + aw1 * bz0 + ax1 * by0 - ay1 * bx0;
  out[7] = aw0 * bw1 - ax0 * bx1 - ay0 * by1 - az0 * bz1 + aw1 * bw0 - ax1 * bx0 - ay1 * by0 - az1 * bz0;
  return out;
}

/**
 * Alias for {@link quat2.multiply}
 * @function
 */
var quat2_mul = quat2_multiply;

/**
 * Scales a dual quat by a scalar number
 *
 * @param {quat2} out the receiving dual quat
 * @param {ReadonlyQuat2} a the dual quat to scale
 * @param {Number} b amount to scale the dual quat by
 * @returns {quat2} out
 * @function
 */
function quat2_scale(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  return out;
}

/**
 * Calculates the dot product of two dual quat's (The dot product of the real parts)
 *
 * @param {ReadonlyQuat2} a the first operand
 * @param {ReadonlyQuat2} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */
var quat2_dot = quat_dot;

/**
 * Performs a linear interpolation between two dual quats's
 * NOTE: The resulting dual quaternions won't always be normalized (The error is most noticeable when t = 0.5)
 *
 * @param {quat2} out the receiving dual quat
 * @param {ReadonlyQuat2} a the first operand
 * @param {ReadonlyQuat2} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat2} out
 */
function quat2_lerp(out, a, b, t) {
  var mt = 1 - t;
  if (quat2_dot(a, b) < 0) t = -t;
  out[0] = a[0] * mt + b[0] * t;
  out[1] = a[1] * mt + b[1] * t;
  out[2] = a[2] * mt + b[2] * t;
  out[3] = a[3] * mt + b[3] * t;
  out[4] = a[4] * mt + b[4] * t;
  out[5] = a[5] * mt + b[5] * t;
  out[6] = a[6] * mt + b[6] * t;
  out[7] = a[7] * mt + b[7] * t;
  return out;
}

/**
 * Calculates the inverse of a dual quat. If they are normalized, conjugate is cheaper
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a dual quat to calculate inverse of
 * @returns {quat2} out
 */
function quat2_invert(out, a) {
  var sqlen = quat2_squaredLength(a);
  out[0] = -a[0] / sqlen;
  out[1] = -a[1] / sqlen;
  out[2] = -a[2] / sqlen;
  out[3] = a[3] / sqlen;
  out[4] = -a[4] / sqlen;
  out[5] = -a[5] / sqlen;
  out[6] = -a[6] / sqlen;
  out[7] = a[7] / sqlen;
  return out;
}

/**
 * Calculates the conjugate of a dual quat
 * If the dual quaternion is normalized, this function is faster than quat2.inverse and produces the same result.
 *
 * @param {quat2} out the receiving quaternion
 * @param {ReadonlyQuat2} a quat to calculate conjugate of
 * @returns {quat2} out
 */
function quat2_conjugate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a[3];
  out[4] = -a[4];
  out[5] = -a[5];
  out[6] = -a[6];
  out[7] = a[7];
  return out;
}

/**
 * Calculates the length of a dual quat
 *
 * @param {ReadonlyQuat2} a dual quat to calculate length of
 * @returns {Number} length of a
 * @function
 */
var quat2_length = quat_length;

/**
 * Alias for {@link quat2.length}
 * @function
 */
var quat2_len = quat2_length;

/**
 * Calculates the squared length of a dual quat
 *
 * @param {ReadonlyQuat2} a dual quat to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */
var quat2_squaredLength = quat_squaredLength;

/**
 * Alias for {@link quat2.squaredLength}
 * @function
 */
var quat2_sqrLen = quat2_squaredLength;

/**
 * Normalize a dual quat
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a dual quaternion to normalize
 * @returns {quat2} out
 * @function
 */
function quat2_normalize(out, a) {
  var magnitude = quat2_squaredLength(a);
  if (magnitude > 0) {
    magnitude = Math.sqrt(magnitude);
    var a0 = a[0] / magnitude;
    var a1 = a[1] / magnitude;
    var a2 = a[2] / magnitude;
    var a3 = a[3] / magnitude;
    var b0 = a[4];
    var b1 = a[5];
    var b2 = a[6];
    var b3 = a[7];
    var a_dot_b = a0 * b0 + a1 * b1 + a2 * b2 + a3 * b3;
    out[0] = a0;
    out[1] = a1;
    out[2] = a2;
    out[3] = a3;
    out[4] = (b0 - a0 * a_dot_b) / magnitude;
    out[5] = (b1 - a1 * a_dot_b) / magnitude;
    out[6] = (b2 - a2 * a_dot_b) / magnitude;
    out[7] = (b3 - a3 * a_dot_b) / magnitude;
  }
  return out;
}

/**
 * Returns a string representation of a dual quaternion
 *
 * @param {ReadonlyQuat2} a dual quaternion to represent as a string
 * @returns {String} string representation of the dual quat
 */
function quat2_str(a) {
  return "quat2(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ")";
}

/**
 * Returns whether or not the dual quaternions have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyQuat2} a the first dual quaternion.
 * @param {ReadonlyQuat2} b the second dual quaternion.
 * @returns {Boolean} true if the dual quaternions are equal, false otherwise.
 */
function quat2_exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7];
}

/**
 * Returns whether or not the dual quaternions have approximately the same elements in the same position.
 *
 * @param {ReadonlyQuat2} a the first dual quat.
 * @param {ReadonlyQuat2} b the second dual quat.
 * @returns {Boolean} true if the dual quats are equal, false otherwise.
 */
function quat2_equals(a, b) {
  var a0 = a[0],
    a1 = a[1],
    a2 = a[2],
    a3 = a[3],
    a4 = a[4],
    a5 = a[5],
    a6 = a[6],
    a7 = a[7];
  var b0 = b[0],
    b1 = b[1],
    b2 = b[2],
    b3 = b[3],
    b4 = b[4],
    b5 = b[5],
    b6 = b[6],
    b7 = b[7];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7));
}
;// CONCATENATED MODULE: ./src/corelibs/node_modules/gl-matrix/esm/vec2.js


/**
 * 2 Dimensional Vector
 * @module vec2
 */

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */
function vec2_create() {
  var out = new ARRAY_TYPE(2);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
  }
  return out;
}

/**
 * Creates a new vec2 initialized with values from an existing vector
 *
 * @param {ReadonlyVec2} a vector to clone
 * @returns {vec2} a new 2D vector
 */
function vec2_clone(a) {
  var out = new ARRAY_TYPE(2);
  out[0] = a[0];
  out[1] = a[1];
  return out;
}

/**
 * Creates a new vec2 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */
function vec2_fromValues(x, y) {
  var out = new ARRAY_TYPE(2);
  out[0] = x;
  out[1] = y;
  return out;
}

/**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the source vector
 * @returns {vec2} out
 */
function vec2_copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  return out;
}

/**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */
function vec2_set(out, x, y) {
  out[0] = x;
  out[1] = y;
  return out;
}

/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */
function vec2_add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  return out;
}

/**
 * Subtracts vector b from vector a
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */
function vec2_subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  return out;
}

/**
 * Multiplies two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */
function vec2_multiply(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  return out;
}

/**
 * Divides two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */
function vec2_divide(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  return out;
}

/**
 * Math.ceil the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to ceil
 * @returns {vec2} out
 */
function vec2_ceil(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  return out;
}

/**
 * Math.floor the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to floor
 * @returns {vec2} out
 */
function vec2_floor(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  return out;
}

/**
 * Returns the minimum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */
function vec2_min(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  return out;
}

/**
 * Returns the maximum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */
function vec2_max(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  return out;
}

/**
 * symmetric round the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to round
 * @returns {vec2} out
 */
function vec2_round(out, a) {
  out[0] = round(a[0]);
  out[1] = round(a[1]);
  return out;
}

/**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec2} out
 */
function vec2_scale(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  return out;
}

/**
 * Adds two vec2's after scaling the second operand by a scalar value
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec2} out
 */
function vec2_scaleAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  return out;
}

/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {Number} distance between a and b
 */
function vec2_distance(a, b) {
  var x = b[0] - a[0],
    y = b[1] - a[1];
  return Math.sqrt(x * x + y * y);
}

/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {Number} squared distance between a and b
 */
function vec2_squaredDistance(a, b) {
  var x = b[0] - a[0],
    y = b[1] - a[1];
  return x * x + y * y;
}

/**
 * Calculates the length of a vec2
 *
 * @param {ReadonlyVec2} a vector to calculate length of
 * @returns {Number} length of a
 */
function vec2_length(a) {
  var x = a[0],
    y = a[1];
  return Math.sqrt(x * x + y * y);
}

/**
 * Calculates the squared length of a vec2
 *
 * @param {ReadonlyVec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
function vec2_squaredLength(a) {
  var x = a[0],
    y = a[1];
  return x * x + y * y;
}

/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to negate
 * @returns {vec2} out
 */
function vec2_negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  return out;
}

/**
 * Returns the inverse of the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to invert
 * @returns {vec2} out
 */
function vec2_inverse(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  return out;
}

/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to normalize
 * @returns {vec2} out
 */
function vec2_normalize(out, a) {
  var x = a[0],
    y = a[1];
  var len = x * x + y * y;
  if (len > 0) {
    //TODO: evaluate use of glm_invsqrt here?
    len = 1 / Math.sqrt(len);
  }
  out[0] = a[0] * len;
  out[1] = a[1] * len;
  return out;
}

/**
 * Calculates the dot product of two vec2's
 *
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {Number} dot product of a and b
 */
function vec2_dot(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}

/**
 * Computes the cross product of two vec2's
 * Note that the cross product must by definition produce a 3D vector
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec3} out
 */
function vec2_cross(out, a, b) {
  var z = a[0] * b[1] - a[1] * b[0];
  out[0] = out[1] = 0;
  out[2] = z;
  return out;
}

/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec2} out
 */
function vec2_lerp(out, a, b, t) {
  var ax = a[0],
    ay = a[1];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  return out;
}

/**
 * Generates a random vector with the given scale
 *
 * @param {vec2} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If omitted, a unit vector will be returned
 * @returns {vec2} out
 */
function vec2_random(out, scale) {
  scale = scale === undefined ? 1.0 : scale;
  var r = RANDOM() * 2.0 * Math.PI;
  out[0] = Math.cos(r) * scale;
  out[1] = Math.sin(r) * scale;
  return out;
}

/**
 * Transforms the vec2 with a mat2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to transform
 * @param {ReadonlyMat2} m matrix to transform with
 * @returns {vec2} out
 */
function transformMat2(out, a, m) {
  var x = a[0],
    y = a[1];
  out[0] = m[0] * x + m[2] * y;
  out[1] = m[1] * x + m[3] * y;
  return out;
}

/**
 * Transforms the vec2 with a mat2d
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to transform
 * @param {ReadonlyMat2d} m matrix to transform with
 * @returns {vec2} out
 */
function transformMat2d(out, a, m) {
  var x = a[0],
    y = a[1];
  out[0] = m[0] * x + m[2] * y + m[4];
  out[1] = m[1] * x + m[3] * y + m[5];
  return out;
}

/**
 * Transforms the vec2 with a mat3
 * 3rd vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to transform
 * @param {ReadonlyMat3} m matrix to transform with
 * @returns {vec2} out
 */
function vec2_transformMat3(out, a, m) {
  var x = a[0],
    y = a[1];
  out[0] = m[0] * x + m[3] * y + m[6];
  out[1] = m[1] * x + m[4] * y + m[7];
  return out;
}

/**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to transform
 * @param {ReadonlyMat4} m matrix to transform with
 * @returns {vec2} out
 */
function vec2_transformMat4(out, a, m) {
  var x = a[0];
  var y = a[1];
  out[0] = m[0] * x + m[4] * y + m[12];
  out[1] = m[1] * x + m[5] * y + m[13];
  return out;
}

/**
 * Rotate a 2D vector
 * @param {vec2} out The receiving vec2
 * @param {ReadonlyVec2} a The vec2 point to rotate
 * @param {ReadonlyVec2} b The origin of the rotation
 * @param {Number} rad The angle of rotation in radians
 * @returns {vec2} out
 */
function vec2_rotate(out, a, b, rad) {
  //Translate point to the origin
  var p0 = a[0] - b[0],
    p1 = a[1] - b[1],
    sinC = Math.sin(rad),
    cosC = Math.cos(rad);

  //perform rotation and translate to correct position
  out[0] = p0 * cosC - p1 * sinC + b[0];
  out[1] = p0 * sinC + p1 * cosC + b[1];
  return out;
}

/**
 * Get the smallest angle between two 2D vectors
 * @param {ReadonlyVec2} a The first operand
 * @param {ReadonlyVec2} b The second operand
 * @returns {Number} The angle in radians
 */
function vec2_angle(a, b) {
  var ax = a[0],
    ay = a[1],
    bx = b[0],
    by = b[1];
  return Math.abs(Math.atan2(ay * bx - ax * by, ax * bx + ay * by));
}

/**
 * Get the signed angle in the interval [-pi,pi] between two 2D vectors (positive if `a` is to the right of `b`)
 * 
 * @param {ReadonlyVec2} a The first vector
 * @param {ReadonlyVec2} b The second vector
 * @returns {number} The signed angle in radians
 */
function signedAngle(a, b) {
  var ax = a[0],
    ay = a[1],
    bx = b[0],
    by = b[1];
  return Math.atan2(ax * by - ay * bx, ax * bx + ay * by);
}

/**
 * Set the components of a vec2 to zero
 *
 * @param {vec2} out the receiving vector
 * @returns {vec2} out
 */
function vec2_zero(out) {
  out[0] = 0.0;
  out[1] = 0.0;
  return out;
}

/**
 * Returns a string representation of a vector
 *
 * @param {ReadonlyVec2} a vector to represent as a string
 * @returns {String} string representation of the vector
 */
function vec2_str(a) {
  return "vec2(" + a[0] + ", " + a[1] + ")";
}

/**
 * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyVec2} a The first vector.
 * @param {ReadonlyVec2} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
function vec2_exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {ReadonlyVec2} a The first vector.
 * @param {ReadonlyVec2} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
function vec2_equals(a, b) {
  var a0 = a[0],
    a1 = a[1];
  var b0 = b[0],
    b1 = b[1];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1));
}

/**
 * Alias for {@link vec2.length}
 * @function
 */
var vec2_len = vec2_length;

/**
 * Alias for {@link vec2.subtract}
 * @function
 */
var vec2_sub = vec2_subtract;

/**
 * Alias for {@link vec2.multiply}
 * @function
 */
var vec2_mul = vec2_multiply;

/**
 * Alias for {@link vec2.divide}
 * @function
 */
var vec2_div = vec2_divide;

/**
 * Alias for {@link vec2.distance}
 * @function
 */
var vec2_dist = vec2_distance;

/**
 * Alias for {@link vec2.squaredDistance}
 * @function
 */
var vec2_sqrDist = vec2_squaredDistance;

/**
 * Alias for {@link vec2.squaredLength}
 * @function
 */
var vec2_sqrLen = vec2_squaredLength;

/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
var vec2_forEach = function () {
  var vec = vec2_create();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;
    if (!stride) {
      stride = 2;
    }
    if (!offset) {
      offset = 0;
    }
    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }
    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
    }
    return a;
  };
}();
;// CONCATENATED MODULE: ./src/corelibs/cg/cg_geom.js





/**
 * a geometry contains all information about a mesh, vertices, texturecoordinates etc. etc.
 * @param {String} name
 * @example
 * // create a triangle with all attributes
 * const geom=new Geometry("triangle"),
 *
 * geom.vertices = [
 *      0.0,           sizeH.get(),  0.0,
 *     -sizeW.get(),  -sizeH.get(),  0.0,
 *      sizeW.get(),  -sizeH.get(),  0.0 ];
 *
 * geom.vertexNormals = [
 *      0.0,  0.0,  1.0,
 *      0.0,  0.0,  1.0,
 *      0.0,  0.0,  1.0 ];
 *
 * geom.tangents = [
 *     1,0,0,
 *     1,0,0,
 *     1,0,0 ];
 *
 * geom.biTangents = [
 *     0,1,0,
 *     0,1,0,
 *     0,1,0 ];
 *
 * geom.texCoords = [
 *      0.5,  0.0,
 *      1.0,  1.0,
 *      0.0,  1.0, ];
 *
 * geom.verticesIndices = [
 *     0, 1, 2 ];
 *
 */

class Geometry
{
    isGeometry = true;

    /**
     * @param {String} name
    */
    constructor(name)
    {
        this.name = name || "unknown";
        this._log = new external_CABLES_SHARED_namespaceObject.Logger("cgl_geometry");

        this.faceVertCount = 3;
        this.glPrimitive = null;
        this._attributes = {};

        /** @type {Array|Float32Array} */
        this._vertices = [];

        /** @type {Array} */
        this.verticesIndices = [];

        this.morphTargets = [];

        this.memItem = new external_CABLES_namespaceObject.MemProfilerItem("geom " + name, "geometry");
    }

    get vertices()
    {
        return this._vertices;
    }

    set vertices(v)
    {
        this.setVertices(v);
    }

    get texCoords()
    {
        const att = this.getAttribute("texCoords");
        if (!att) return [];
        return att.data;
    }

    set texCoords(v)
    {
        this.setAttribute("texCoords", v, 2);
    }

    get vertexNormals()
    {
        const att = this.getAttribute("vertexNormals");
        if (!att) return [];
        return att.data;
    }

    set vertexNormals(v)
    {
        this.setAttribute("vertexNormals", v, 3);
    }

    get tangents()
    {
        const att = this.getAttribute("tangents");
        if (!att) return [];
        return att.data;
    }

    set tangents(v)
    {
        this.setAttribute("tangents", v, 3);
    }

    get biTangents()
    {
        const att = this.getAttribute("biTangents");
        if (!att) return [];
        return att.data;
    }

    set biTangents(v)
    {
        this.setAttribute("biTangents", v, 3);
    }

    get vertexColors()
    {
        const att = this.getAttribute("vertexColors");
        if (!att) return [];
        return att.data;
    }

    set vertexColors(v)
    {
        this.setAttribute("vertexColors", v, 4);
    }

    /**
     * @description clear all buffers/set them to length 0
     */
    clear()
    {
        this._vertices = new Float32Array([]);
        this.verticesIndices = [];
        this.texCoords = new Float32Array([]);
        this.vertexNormals = new Float32Array([]);
        this.tangents = [];
        this.biTangents = [];
        this._attributes = {};
    }

    /**
    * @return {Object} returns array of attribute objects
    */
    getAttributes()
    {
        return this._attributes;
    }

    /**
     * @function getAttribute
     * @memberof Geometry
     * @instance
     * @param {String} name
     * @return {Object}
     */
    getAttribute(name)
    {
        for (const i in this._attributes)
        {
            if (this._attributes[i].name == name) return this._attributes[i];
        }
        return null;
    }

    updateMemoryUsage()
    {
        let bytes = 0;

        bytes += this._vertices.length * 4;
        bytes += this.verticesIndices.length * 4;

        for (let i = 0; i < this._attributes.length; i++)
        {
            if (this._attributes[i].data)
                bytes += this._attributes[i].data.length * 4;
        }
        this.memItem.setSize(bytes);
        return bytes;
    }

    /**
     * @function setAttribute
     * @description create an attribute
     * @memberof Geometry
     * @instance
     * @param {String} name
     * @param {Array} arr
     * @param {Number} itemSize
     */
    setAttribute(name, arr, itemSize)
    {
        let attrType = "";
        if (!itemSize || itemSize > 4)
        {
            this._log.warn("itemsize wrong?", itemSize, name);
            this._log.stack("itemsize");

            itemSize = 3;
        }

        if (itemSize == 1) attrType = "float";
        else if (itemSize == 2) attrType = "vec2";
        else if (itemSize == 3) attrType = "vec3";
        else if (itemSize == 4) attrType = "vec4";

        const attr = {
            "name": name,
            "data": arr,
            "itemSize": itemSize,
            "type": attrType,
        };

        this._attributes[name] = attr;

        this.updateMemoryUsage();
    }

    /**
     * @param {string} name
     * @param {Geometry} newgeom
     */
    copyAttribute(name, newgeom)
    {
        const attr = this.getAttribute(name);
        newgeom.setAttribute(name, new Float32Array(attr.data), attr.itemSize);
    }

    /**
     * @function setVertices
     * @memberof Geometry
     * @instance
     * @description set vertices
     * @param {Array|Float32Array} arr [x,y,z,x,y,z,...]
     */
    setVertices(arr)
    {
        if (arr instanceof Float32Array) this._vertices = arr;
        else this._vertices = new Float32Array(arr);
    }

    /**
     * set texcoords
     * @param {Array|Float32Array} arr [u,v,u,v,...]
     */
    setTexCoords(arr)
    {
        if (arr instanceof Float32Array) this.texCoords = arr;
        else this.texCoords = new Float32Array(arr);
    }

    // deprecated
    calcNormals(smooth)
    {
        const options = { "smooth": smooth };
        this.calculateNormals(options);
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    flipNormals(x, y, z)
    {
        let vec = vec3_create();

        if (x == undefined)x = 1;
        if (y == undefined)y = 1;
        if (z == undefined)z = 1;

        for (let i = 0; i < this.vertexNormals.length; i += 3)
        {
            vec3_set(vec,
                this.vertexNormals[i + 0],
                this.vertexNormals[i + 1],
                this.vertexNormals[i + 2]);

            vec[0] *= -x;
            vec[1] *= -y;
            vec[2] *= -z;

            normalize(vec, vec);

            this.vertexNormals[i + 0] = vec[0];
            this.vertexNormals[i + 1] = vec[1];
            this.vertexNormals[i + 2] = vec[2];
        }
    }

    getNumTriangles()
    {
        if (this.verticesIndices && this.verticesIndices.length) return this.verticesIndices.length / 3;
        return this.vertices.length / 3;
    }

    /**
     * flip order of vertices in geom faces
     */
    flipVertDir()
    {
        const newInd = [];
        newInd.length = this.verticesIndices.length;
        for (let i = 0; i < this.verticesIndices.length; i += 3)
        {
            newInd[i] = this.verticesIndices[i + 2];
            newInd[i + 1] = this.verticesIndices[i + 1];
            newInd[i + 2] = this.verticesIndices[i];
        }
        this.verticesIndices = newInd;
    }

    /**
     * @param {Array} verts
     */
    setPointVertices(verts)
    {
        if (verts.length % 3 !== 0)
        {
            this._log.error("SetPointVertices: Array must be multiple of three.");
            return;
        }

        if (!(verts instanceof Float32Array)) this.vertices = new Float32Array(verts);
        else this.vertices = verts;

        if (!(this.texCoords instanceof Float32Array)) this.texCoords = new Float32Array((verts.length / 3) * 2);

        // this.texCoords.length=verts.length/3*2;
        this.verticesIndices.length = verts.length / 3;
        // this.verticesIndices=[];

        for (let i = 0; i < verts.length / 3; i++)
        {
            this.verticesIndices[i] = i;
            this.texCoords[i * 2] = 0;
            this.texCoords[i * 2 + 1] = 0;
        }
    }

    /**
     * merge a different geometry into the this geometry
     * @param {Geometry} geom
     */
    merge(geom)
    {
        if (!geom) return;

        if (this.isIndexed() != geom.isIndexed())
        {
            if (this.isIndexed())
            {
                this.unIndex(false, true);
            }
            if (geom.isIndexed())
            {
                const g = geom.copy();
                g.unIndex(false, true);
                geom = g;
            }
        }

        const oldIndizesLength = this.verticesIndices.length;
        const vertLength = this._vertices.length / 3;

        this.verticesIndices.length += geom.verticesIndices.length;
        for (let i = 0; i < geom.verticesIndices.length; i++)
            this.verticesIndices[oldIndizesLength + i] = geom.verticesIndices[i] + vertLength;

        this.vertices = external_CABLES_namespaceObject.utils.float32Concat(this._vertices, geom.vertices);
        this.texCoords = external_CABLES_namespaceObject.utils.float32Concat(this.texCoords, geom.texCoords);
        this.vertexNormals = external_CABLES_namespaceObject.utils.float32Concat(this.vertexNormals, geom.vertexNormals);
        this.tangents = external_CABLES_namespaceObject.utils.float32Concat(this.tangents, geom.tangents);
        this.biTangents = external_CABLES_namespaceObject.utils.float32Concat(this.biTangents, geom.biTangents);
    }

    /**
     *   a copy of the geometry
     * @function copy
     * @memberof Geometry
     * @instance
     */
    copy()
    {
        const geom = new Geometry(this.name + " copy");
        geom.faceVertCount = this.faceVertCount;
        geom.glPrimitive = this.glPrimitive;

        geom.setVertices(this._vertices.slice(0));

        if (this.verticesIndices)
        {
            geom.verticesIndices.length = this.verticesIndices.length;
            for (let i = 0; i < this.verticesIndices.length; i++) geom.verticesIndices[i] = this.verticesIndices[i];
        }

        for (let i in this._attributes) this.copyAttribute(i, geom);

        geom.morphTargets.length = this.morphTargets.length;
        for (let i = 0; i < this.morphTargets.length; i++) geom.morphTargets[i] = this.morphTargets[i].copy();

        return geom;
    }

    /**
     * Calculaten normals
     * @function calculateNormals
     * @param {{ smooth?: any; forceZUp?: any; }} options
     */
    calculateNormals(options = null)
    {
        // todo: should check angle of normals to get edges    https://community.khronos.org/t/calculating-accurate-vertex-normals/28152
        options = options || {};
        if (options.smooth === false) this.unIndex();

        const u = vec3_create();
        const v = vec3_create();
        const n = vec3_create();

        function calcNormal(triangle)
        {
            vec3_subtract(u, triangle[0], triangle[1]);
            vec3_subtract(v, triangle[0], triangle[2]);
            cross(n, u, v);
            normalize(n, n);

            if (options && options.forceZUp)
            {
                if (n[2] < 0)
                {
                    n[0] *= -1;
                    n[1] *= -1;
                    n[2] *= -1;
                }
            }
            return n;
        }

        this.getVertexVec = function (which)
        {
            const vec = [0, 0, 0];
            vec[0] = this.vertices[which * 3 + 0];
            vec[1] = this.vertices[which * 3 + 1];
            vec[2] = this.vertices[which * 3 + 2];
            return vec;
        };

        if (!(this.vertexNormals instanceof Float32Array) || this.vertexNormals.length != this.vertices.length) this.vertexNormals = new Float32Array(this.vertices.length);

        for (let i = 0; i < this.vertices.length; i++)
        {
            this.vertexNormals[i] = 0;
        }

        if (!this.isIndexed())
        {
            const norms = [];
            for (let i = 0; i < this.vertices.length; i += 9)
            {
                const triangle = [[this.vertices[i + 0], this.vertices[i + 1], this.vertices[i + 2]], [this.vertices[i + 3], this.vertices[i + 4], this.vertices[i + 5]], [this.vertices[i + 6], this.vertices[i + 7], this.vertices[i + 8]]];
                const nn = calcNormal(triangle);
                norms.push(nn[0], nn[1], nn[2], nn[0], nn[1], nn[2], nn[0], nn[1], nn[2]);
            }
            this.vertexNormals = norms;
        }
        else
        {
            const faceNormals = [];

            faceNormals.length = Math.floor(this.verticesIndices.length / 3);

            for (let i = 0; i < this.verticesIndices.length; i += 3)
            {
                const triangle = [this.getVertexVec(this.verticesIndices[i + 0]), this.getVertexVec(this.verticesIndices[i + 1]), this.getVertexVec(this.verticesIndices[i + 2])];

                faceNormals[i / 3] = calcNormal(triangle);

                this.vertexNormals[this.verticesIndices[i + 0] * 3 + 0] += faceNormals[i / 3][0];
                this.vertexNormals[this.verticesIndices[i + 0] * 3 + 1] += faceNormals[i / 3][1];
                this.vertexNormals[this.verticesIndices[i + 0] * 3 + 2] += faceNormals[i / 3][2];

                this.vertexNormals[this.verticesIndices[i + 1] * 3 + 0] += faceNormals[i / 3][0];
                this.vertexNormals[this.verticesIndices[i + 1] * 3 + 1] += faceNormals[i / 3][1];
                this.vertexNormals[this.verticesIndices[i + 1] * 3 + 2] += faceNormals[i / 3][2];

                this.vertexNormals[this.verticesIndices[i + 2] * 3 + 0] += faceNormals[i / 3][0];
                this.vertexNormals[this.verticesIndices[i + 2] * 3 + 1] += faceNormals[i / 3][1];
                this.vertexNormals[this.verticesIndices[i + 2] * 3 + 2] += faceNormals[i / 3][2];
            }

            for (let i = 0; i < this.verticesIndices.length; i += 3) // faces
            {
                for (let k = 0; k < 3; k++) // triangles
                {
                    const vv = [this.vertexNormals[this.verticesIndices[i + k] * 3 + 0], this.vertexNormals[this.verticesIndices[i + k] * 3 + 1], this.vertexNormals[this.verticesIndices[i + k] * 3 + 2]];
                    normalize(vv, vv);
                    this.vertexNormals[this.verticesIndices[i + k] * 3 + 0] = vv[0];
                    this.vertexNormals[this.verticesIndices[i + k] * 3 + 1] = vv[1];
                    this.vertexNormals[this.verticesIndices[i + k] * 3 + 2] = vv[2];
                }
            }
        }
    }

    /**
     * Calculates tangents & bitangents with the help of uv-coordinates. Adapted from
     * Lengyel, Eric. “Computing Tangent Space Basis Vectors for an Arbitrary Mesh”.
     * Terathon Software 3D Graphics Library.
     * https://fenix.tecnico.ulisboa.pt/downloadFile/845043405449073/Tangent%20Space%20Calculation.pdf
     *
     * @function calcTangentsBitangents
     */
    calcTangentsBitangents()
    {
        if (!this.vertices || !this.vertices.length)
        {
            // this._log.error("Cannot calculate tangents/bitangents without vertices.");
            return;
        }
        if (!this.vertexNormals || !this.vertexNormals.length)
        {
            // this._log.error("Cannot calculate tangents/bitangents without normals.");
            return;
        }
        if (!this.texCoords || !this.texCoords.length)
        {
            const texCoordLength = (this.vertices.length / 3) * 2;
            this.texCoords = new Float32Array(texCoordLength);
            for (let i = 0; i < texCoordLength; i += 1) this.texCoords[i] = 0;
        }
        if (!this.verticesIndices || !this.verticesIndices.length)
        {
            // this._log.error("Cannot calculate tangents/bitangents without vertex indices.");
            return;
        }
        // this code assumes that we have three indices per triangle
        if (this.verticesIndices.length % 3 !== 0)
        {
            this._log.error("Vertex indices mismatch!");
            return;
        }

        const triangleCount = this.verticesIndices.length / 3;
        const vertexCount = this.vertices.length / 3;

        if (vertexCount == 0) return;
        this.tangents = new Float32Array(this.vertexNormals.length);
        this.biTangents = new Float32Array(this.vertexNormals.length);

        // temporary buffers
        const tempVertices = [];
        tempVertices.length = Math.ceil(vertexCount * 2);
        const v1 = vec3_create();
        const v2 = vec3_create();
        const v3 = vec3_create();

        const w1 = vec2_create();
        const w2 = vec2_create();
        const w3 = vec2_create();

        const sdir = vec3_create();
        const tdir = vec3_create();

        // for details on calculation, see article referenced above
        for (let tri = 0; tri < triangleCount; tri += 1)
        {
            // indices of the three vertices for a triangle
            const i1 = this.verticesIndices[tri * 3];
            const i2 = this.verticesIndices[tri * 3 + 1];
            const i3 = this.verticesIndices[tri * 3 + 2];

            // vertex position as vec3
            vec3_set(v1, this.vertices[i1 * 3], this.vertices[i1 * 3 + 1], this.vertices[i1 * 3 + 2]);
            vec3_set(v2, this.vertices[i2 * 3], this.vertices[i2 * 3 + 1], this.vertices[i2 * 3 + 2]);
            vec3_set(v3, this.vertices[i3 * 3], this.vertices[i3 * 3 + 1], this.vertices[i3 * 3 + 2]);

            // texture coordinate as vec2
            vec2_set(w1, this.texCoords[i1 * 2], this.texCoords[i1 * 2 + 1]);
            vec2_set(w2, this.texCoords[i2 * 2], this.texCoords[i2 * 2 + 1]);
            vec2_set(w3, this.texCoords[i3 * 2], this.texCoords[i3 * 2 + 1]);

            const x1 = v2[0] - v1[0];
            const x2 = v3[0] - v1[0];
            const y1 = v2[1] - v1[1];
            const y2 = v3[1] - v1[1];
            const z1 = v2[2] - v1[2];
            const z2 = v3[2] - v1[2];

            const s1 = w2[0] - w1[0];
            const s2 = w3[0] - w1[0];
            const t1 = w2[1] - w1[1];
            const t2 = w3[1] - w1[1];

            const r = 1.0 / (s1 * t2 - s2 * t1);

            vec3_set(sdir, (t2 * x1 - t1 * x2) * r, (t2 * y1 - t1 * y2) * r, (t2 * z1 - t1 * z2) * r);
            vec3_set(tdir, (s1 * x2 - s2 * x1) * r, (s1 * y2 - s2 * y1) * r, (s1 * z2 - s2 * z1) * r);

            tempVertices[i1] = sdir;
            tempVertices[i2] = sdir;
            tempVertices[i3] = sdir;

            tempVertices[i1 + vertexCount] = tdir;
            tempVertices[i2 + vertexCount] = tdir;
            tempVertices[i3 + vertexCount] = tdir;
        }

        const normal = vec3_create();
        const tempVert = vec3_create();
        const tan = vec3_create();
        const bitan = vec3_create();
        const temp1 = vec3_create();
        const temp2 = vec3_create();
        const crossPd = vec3_create();
        const normalized = vec3_create();

        for (let vert = 0; vert < vertexCount; vert += 1)
        {
            // NOTE: some meshes don't have index 0 - n in their indexbuffer, if this is the case, skip calculation of this vertex
            if (!tempVertices[vert]) continue;

            vec3_set(normal, this.vertexNormals[vert * 3], this.vertexNormals[vert * 3 + 1], this.vertexNormals[vert * 3 + 2]);
            vec3_set(tempVert, tempVertices[vert][0], tempVertices[vert][1], tempVertices[vert][2]);

            // Gram-Schmidt orthagonalize
            const _dp = vec3_dot(normal, tempVert);
            vec3_scale(temp1, normal, _dp);
            vec3_subtract(temp2, tempVert, temp1);

            normalize(normalized, temp2);
            cross(crossPd, normal, tempVert);

            // const intermDot = vec3.dot(crossPd, tempVertices[vert + vertexCount]);
            const w = 1.0;// intermDot < 0.0 ? -1.0 : 1.0;

            vec3_scale(tan, normalized, 1 / w);
            cross(bitan, normal, tan);

            this.tangents[vert * 3 + 0] = tan[0];
            this.tangents[vert * 3 + 1] = tan[1];
            this.tangents[vert * 3 + 2] = tan[2];
            this.biTangents[vert * 3 + 0] = bitan[0];
            this.biTangents[vert * 3 + 1] = bitan[1];
            this.biTangents[vert * 3 + 2] = bitan[2];
        }
    }

    isIndexed()
    {
        if (this._vertices.length == 0) return true;
        return this.verticesIndices.length != 0;
    }

    /**
     * @function unIndex
     * @description remove all vertex indizes, vertices array will contain 3*XYZ for every triangle
     * @param {boolean} reIndex
     * @param {boolean} dontCalcNormals
     */
    unIndex(reIndex = false, dontCalcNormals = false)
    {
        const newVerts = [];
        const newIndizes = [];
        let count = 0;

        for (let j in this._attributes)
        {
            const attr = this._attributes[j];
            let na = [];

            for (let i = 0; i < this.verticesIndices.length; i += 3)
            {
                for (let s = 0; s < 3; s++)
                {
                    if (attr.itemSize == 3)
                        na.push(
                            attr.data[this.verticesIndices[i + s] * 3 + 0],
                            attr.data[this.verticesIndices[i + s] * 3 + 1],
                            attr.data[this.verticesIndices[i + s] * 3 + 2]);
                    else if (attr.itemSize == 4)
                        na.push(
                            attr.data[this.verticesIndices[i + s] * 4 + 0],
                            attr.data[this.verticesIndices[i + s] * 4 + 1],
                            attr.data[this.verticesIndices[i + s] * 4 + 2],
                            attr.data[this.verticesIndices[i + s] * 4 + 3]);
                    else if (attr.itemSize == 2)
                        na.push(
                            attr.data[this.verticesIndices[i + s] * 2 + 0],
                            attr.data[this.verticesIndices[i + s] * 2 + 1]);
                    else if (attr.itemSize == 1)
                        na.push(
                            attr.data[this.verticesIndices[i + s]]);
                    else this._log.warn("unknown attr", attr);
                }
            }
            this.setAttribute(attr.name, na, attr.itemSize);
        }

        for (let i = 0; i < this.verticesIndices.length; i += 3)
        {
            newVerts.push(
                this.vertices[this.verticesIndices[i + 0] * 3 + 0],
                this.vertices[this.verticesIndices[i + 0] * 3 + 1],
                this.vertices[this.verticesIndices[i + 0] * 3 + 2]);

            newIndizes.push(count);
            count++;

            newVerts.push(
                this.vertices[this.verticesIndices[i + 1] * 3 + 0],
                this.vertices[this.verticesIndices[i + 1] * 3 + 1],
                this.vertices[this.verticesIndices[i + 1] * 3 + 2]);

            newIndizes.push(count);
            count++;

            newVerts.push(
                this.vertices[this.verticesIndices[i + 2] * 3 + 0],
                this.vertices[this.verticesIndices[i + 2] * 3 + 1],
                this.vertices[this.verticesIndices[i + 2] * 3 + 2]);

            newIndizes.push(count);
            count++;
        }

        this.vertices = newVerts;

        this.verticesIndices = [];
        if (reIndex) this.verticesIndices = newIndizes;

        if (!dontCalcNormals) this.calculateNormals();
    }

    calcBarycentric()
    {
        let barycentrics = [];
        barycentrics.length = this.vertices.length;
        for (let i = 0; i < this.vertices.length; i++) barycentrics[i] = 0;

        let count = 0;
        for (let i = 0; i < this.vertices.length; i += 3)
        {
            barycentrics[i + count] = 1;
            count++;
            if (count == 3) count = 0;
        }

        this.setAttribute("attrBarycentric", barycentrics, 3);
    }

    getBounds()
    {
        return new BoundingBox(this);
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    scale(x, y, z)
    {
        for (let i = 0; i < this.vertices.length; i += 3)
        {
            this.vertices[i + 0] *= x;
            this.vertices[i + 1] *= y;
            this.vertices[i + 2] *= z;
        }
    }

    /**
     * @param {boolean} x
     * @param {boolean} y
     * @param {boolean} z
     * @returns {Array} offset
     */
    center(x, y, z)
    {
        if (x === undefined)
        {
            x = true;
            y = true;
            z = true;
        }

        let i = 0;
        const bounds = this.getBounds();
        const offset = [bounds.minX + (bounds.maxX - bounds.minX) / 2, bounds.minY + (bounds.maxY - bounds.minY) / 2, bounds.minZ + (bounds.maxZ - bounds.minZ) / 2];

        for (i = 0; i < this.vertices.length; i += 3)
        {
            if (this.vertices[i + 0] == this.vertices[i + 0])
            {
                if (x) this.vertices[i + 0] -= offset[0];
                if (y) this.vertices[i + 1] -= offset[1];
                if (z) this.vertices[i + 2] -= offset[2];
            }
        }

        return offset;
    }

    mapTexCoords2d()
    {
        const bounds = this.getBounds();
        const num = this.vertices.length / 3;

        this.texCoords = new Float32Array(num * 2);

        for (let i = 0; i < num; i++)
        {
            const vertX = this.vertices[i * 3 + 0];
            const vertY = this.vertices[i * 3 + 1];
            this.texCoords[i * 2 + 0] = vertX / (bounds.maxX - bounds.minX) + 0.5;
            this.texCoords[i * 2 + 1] = 1.0 - vertY / (bounds.maxY - bounds.minY) + 0.5;
        }
    }

    getInfoOneLine()
    {
        let txt = "";
        if (this.faceVertCount == 3 && this.verticesIndices)txt += this.verticesIndices.length / 3;
        else txt += 0;

        txt += " tris ";

        if (this.vertices)txt += this.vertices.length / 3;
        else txt += 0;

        txt += " verts";

        return txt;
    }

    getInfo()
    {
        const info = {};

        info.name = this.name;
        info.class = this.constructor.name;

        if (this.faceVertCount == 3 && this.verticesIndices)info.numFaces = this.verticesIndices.length / 3;
        else info.numFaces = 0;

        if (this.verticesIndices && this.verticesIndices.length)info.indices = this.verticesIndices.length;

        if (this.vertices)info.numVerts = this.vertices.length / 3;
        else info.numVerts = 0;

        if (this.vertexNormals) info.numNormals = this.vertexNormals.length / 3;
        else info.numNormals = 0;

        if (this.texCoords) info.numTexCoords = this.texCoords.length / 2;
        else info.numTexCoords = 0;

        if (this.tangents) info.numTangents = this.tangents.length / 3;
        else info.numTangents = 0;

        if (this.biTangents) info.numBiTangents = this.biTangents.length / 3;
        else info.numBiTangents = 0;

        if (this.biTangents) info.numBiTangents = this.biTangents.length / 3;
        else info.numBiTangents = 0;

        if (this.vertexColors) info.numVertexColors = this.vertexColors.length / 4;
        else info.numVertexColors = 0;

        if (this.getAttributes()) info.numAttribs = Object.keys(this.getAttributes()).length;
        else info.numAttribs = 0;

        info.isIndexed = this.isIndexed();

        return info;
    }

    // -----------------
}

// TODO : rewritwe circle op 1
/** @deprecated */
Geometry.buildFromFaces = function (arr, name, optimize)
{
    const vertices = [];
    const verticesIndices = [];

    for (let i = 0; i < arr.length; i += 3)
    {
        const a = arr[i + 0];
        const b = arr[i + 1];
        const c = arr[i + 2];
        const face = [-1, -1, -1];

        if (optimize)
            for (let iv = 0; iv < vertices.length; iv += 3)
            {
                if (vertices[iv + 0] == a[0] && vertices[iv + 1] == a[1] && vertices[iv + 2] == a[2]) face[0] = iv / 3;
                if (vertices[iv + 0] == b[0] && vertices[iv + 1] == b[1] && vertices[iv + 2] == b[2]) face[1] = iv / 3;
                if (vertices[iv + 0] == c[0] && vertices[iv + 1] == c[1] && vertices[iv + 2] == c[2]) face[2] = iv / 3;
            }

        if (face[0] == -1)
        {
            vertices.push(a[0], a[1], a[2]);
            face[0] = (vertices.length / 3) - 1;
        }

        if (face[1] == -1)
        {
            vertices.push(b[0], b[1], b[2]);
            face[1] = (vertices.length / 3) - 1;
        }

        if (face[2] == -1)
        {
            vertices.push(c[0], c[1], c[2]);
            face[2] = (vertices.length / 3) - 1;
        }

        verticesIndices.push(face[0]);
        verticesIndices.push(face[1]);
        verticesIndices.push(face[2]);
    }

    const geom = new Geometry(name);
    geom.name = name;
    geom.vertices = vertices;
    geom.verticesIndices = verticesIndices;

    return geom;
};

;// CONCATENATED MODULE: ./src/corelibs/cg/cg_boundingbox.js




/**
 * bounding box
 *
 * @namespace external:CGL
 * @param {Geometry} geometry or bounding box
 */
class BoundingBox
{

    _first = true;
    _wireMesh = null;

    /**
     * @param {Geometry|BoundingBox} [geom]
     */
    constructor(geom)
    {
        this._init();

        if (geom)
            if (geom.isGeometry) this.applyGeom(geom);
            else this.applyBoundingBox(geom);
    }

    _init()
    {
        this._max = [-0, -0, -0];
        this._min = [0, 0, 0];
        this._center = [0, 0, 0];
        this._size = [0, 0, 0];
        this._maxAxis = 0.0;
        this._first = true;
    }

    get isBoundingBox()
    {
        return true;
    }

    /**
     * get biggest number of maxX,maxY,maxZ
     * @type {Number}
     */
    get maxAxis() { return this._maxAxis || 1; }

    /**
     * size of bounding box
     * @type {vec3}
     */
    get size() { return this._size; }

    /**
     * center of bounding box
     * @type {vec3}
     */
    get center() { return this._center; }

    /**
     * center x
     * @type {Number}
     */
    get x() { return this._center[0]; }

    /**
     * center y
     * @type {Number}
     */
    get y() { return this._center[1]; }

    /**
     * center z
     * @type {Number}
     */
    get z() { return this._center[2]; }

    /**
     * minimum x
     * @type {Number}
     */
    get minX() { return this._min[0]; }

    /**
     * minimum y
     * @type {Number}
     */
    get minY() { return this._min[1]; }

    /**
     * minimum z
     * @type {Number}
     */
    get minZ() { return this._min[2]; }

    /**
     * maximum x
     * @type {Number}
     */
    get maxX() { return this._max[0]; }

    /**
     * maximum y
     * @type {Number}
     */
    get maxY() { return this._max[1]; }

    /**
     * maximum z
     * @type {Number}
     */
    get maxZ() { return this._max[2]; }

    /**
     * @deprecated
     * @param {Geometry} geom
     */
    apply(geom)
    {
        console.warn("boundingbox apply is deprecated, use applyGeom or applyBoundingBox or applyPos");
        return this.applyGeom(geom);
    }

    /**
     * @param {BoundingBox} bb
     */
    applyBoundingBox(bb)
    {

        this.applyPos(bb.maxX, bb.maxY, bb.maxZ);
        this.applyPos(bb.minX, bb.minY, bb.minZ);
        this.calcCenterSize();
    }

    /**
     * @param {Geometry} geom
     */
    applyGeom(geom)
    {
        if (!geom) return;

        if (geom.isGeometry)
            for (let i = 0; i < geom.vertices.length; i += 3)
                this.applyPos(geom.vertices[i], geom.vertices[i + 1], geom.vertices[i + 2]);
        else
        {

            console.error("not geom! ");
            CABLES.logStack();

            if (geom.isGeometry)
                this.applyBoundingBox(geom);
        }
        this.calcCenterSize();
    }

    /**
     * returns a copy of the bounding box
     * @function copy
     * @memberof BoundingBox
     * @instance
     */
    copy()
    {
        return new BoundingBox(this);
    }

    get changed()
    {
        return !(this._max[0] == -Number.MAX_VALUE && this._max[1] == -Number.MAX_VALUE && this._max[2] == -Number.MAX_VALUE);
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    applyPos(x, y, z)
    {
        if (x == Number.MAX_VALUE || x == -Number.MAX_VALUE ||
            y == Number.MAX_VALUE || y == -Number.MAX_VALUE ||
            z == Number.MAX_VALUE || z == -Number.MAX_VALUE) return;

        if (!external_CABLES_namespaceObject.utils.isNumeric(x) || !external_CABLES_namespaceObject.utils.isNumeric(y) || !external_CABLES_namespaceObject.utils.isNumeric(z)) return;

        if (this._first)
        {
            this._max[0] = x;
            this._max[1] = y;
            this._max[2] = z;

            this._min[0] = x;
            this._min[1] = y;
            this._min[2] = z;
            this._first = false;
            return;
        }

        this._max[0] = Math.max(this._max[0], x);
        this._max[1] = Math.max(this._max[1], y);
        this._max[2] = Math.max(this._max[2], z);

        this._min[0] = Math.min(this._min[0], x);
        this._min[1] = Math.min(this._min[1], y);
        this._min[2] = Math.min(this._min[2], z);
    }

    calcCenterSize()
    {
        if (this._first) return;

        this._size[0] = this._max[0] - this._min[0];
        this._size[1] = this._max[1] - this._min[1];
        this._size[2] = this._max[2] - this._min[2];

        this._center[0] = (this._min[0] + this._max[0]) / 2;
        this._center[1] = (this._min[1] + this._max[1]) / 2;
        this._center[2] = (this._min[2] + this._max[2]) / 2;

        this._maxAxis = Math.max(this._size[2], Math.max(this._size[0], this._size[1]));
    }

    /**
     * @param {mat4} m
     */
    mulMat4(m)
    {
        if (this._first)
        {
            this._max[0] = 0;
            this._max[1] = 0;
            this._max[2] = 0;

            this._min[0] = 0;
            this._min[1] = 0;
            this._min[2] = 0;
            this._first = false;
        }
        transformMat4(this._max, this._max, m);
        transformMat4(this._min, this._min, m);
        this.calcCenterSize();
    }

    /**
     * @param {CglContext} cgl
     * @param {Shader} _shader
     * @param {Op} op
     */
    render(cgl, _shader, op)
    {
        if (!this._wireMesh) this._wireMesh = new CGL.WireCube(cgl);

        cgl.pushModelMatrix();
        mat4_translate(cgl.mMatrix, cgl.mMatrix, this._center);

        if (CABLES.UI && op)
        {
            CABLES.UI.OverlayMeshes.drawCube(op, this._size[0] / 2, this._size[1] / 2, this._size[2] / 2);
        }

        cgl.popModelMatrix();
    }
}

;// CONCATENATED MODULE: ./src/corelibs/cg/cg_canvas.js


class CgCanvas
{
    hasFocus = false;

    forceAspect = 0;
    pixelDensity = 1;
    _oldWidthRp = -1;
    _oldHeightRp = -1;

    /**
     * @param {{ canvasEle: any; cg: any; }} options
     */
    constructor(options)
    {
        this._log = new external_CABLES_SHARED_namespaceObject.Logger("CgCanvas");
        if (!options)
        {
            this._log.error("CgCanvas no options");
        }
        else
        {
            this._canvasEle = options.canvasEle;
        }

        if (!options.cg) this._log.error("CgCanvas options has no cg");
        // if (!options.canvasEle) this._log.error("CgCanvas options has no canvasEle");

        this._cg = options.cg;
        if (this.canvasEle)
        {
            this.canvasWidth = this.canvasEle.clientWidth;
            this.canvasHeight = this.canvasEle.clientHeight;

            this.setSize(this.canvasWidth, this.canvasHeight);
            this.canvasEle.addEventListener("focus", () => { this.hasFocus = true; });
            this.canvasEle.addEventListener("blur", () => { this.hasFocus = false; });

        }
    }

    /**
     * @returns {HTMLCanvasElement}
     */
    get canvasEle() { return this._canvasEle; }

    /**
     * @param {Number} w
     * @param {Number} h
     * @param {any} ignorestyle
     * @returns {any}
     */
    setSize(w, h, ignorestyle = false)
    {
        // let offY = 0;
        // if (this.forceAspect)
        // {
        //     let nh = w / this.forceAspect;
        //     if (nh < h)offY = (h - nh) / 2;
        //     h = nh;
        // }

        if (this._oldWidthRp != w * this.pixelDensity || this._oldHeightRp != h * this.pixelDensity)
        {
            this._oldWidthRp = this.canvasEle.width = w * this.pixelDensity;
            this._oldHeightRp = this.canvasEle.height = h * this.pixelDensity;

            if (!ignorestyle)
            {
                this.canvasEle.style.width = w + "px";
                this.canvasEle.style.height = h + "px";
                // this.canvasEle.style.marginTop = offY + "px";
            }

            this.updateSize();

            this._cg.emitEvent("resize");
        }
    }

    updateSize()
    {
        this.canvasEle.width = this.canvasWidth = Math.ceil(this.canvasEle.clientWidth * this.pixelDensity);
        this.canvasEle.height = this.canvasHeight = Math.ceil(this.canvasEle.clientHeight * this.pixelDensity);
        // console.log("text", this.canvasEle.width, this.canvasEle.clientWidth, this.canvasEle.getBoundingClientRect().width);
    }

    dispose()
    {
        if (this._canvasEle) this._canvasEle.remove();
        this._canvasEle = null;
    }
}

;// CONCATENATED MODULE: ./src/corelibs/cg/cg_fpscounter.js



class FpsCounter extends external_CABLES_SHARED_namespaceObject.Events
{
    #timeStartFrame = 0;
    #timeStartSecond = 0;
    #fpsCounter = 0;
    #msCounter = 0;
    #frameCount = 0;
    logFps = false;

    constructor()
    {
        super();

        this.stats = { "ms": 0, "fps": 0 };
    }

    get frameCount()
    {
        return this.#frameCount;
    }

    startFrame()
    {
        this.#timeStartFrame = (0,external_CABLES_namespaceObject.now)();
    }

    endFrame()
    {
        this.#frameCount++;
        this.#fpsCounter++;

        const timeFrame = (0,external_CABLES_namespaceObject.now)() - this.#timeStartFrame;
        this.#msCounter += timeFrame;

        if ((0,external_CABLES_namespaceObject.now)() - this.#timeStartSecond > 1000) this.endSecond();
    }

    endSecond()
    {
        this.stats.fps = this.#fpsCounter;
        this.stats.ms = Math.round(this.#msCounter / this.#fpsCounter * 100) / 100;

        this.emitEvent("performance", this.stats);
        if (this.logFps)console.log(this.stats);

        // reset
        this.#fpsCounter = 0;
        this.#msCounter = 0;
        this.#timeStartSecond = (0,external_CABLES_namespaceObject.now)();
    }
}

;// CONCATENATED MODULE: ./src/corelibs/cg/cg_matrixstack.js


class MatrixStack
{
    constructor()
    {
        this._arr = [mat4_create()];
        this._index = 0;
        this.stateCounter = 0;
    }

    /**
     * @param {mat4} m
     */
    push(m)
    {
        this._index++;
        this.stateCounter++;

        if (this._index == this._arr.length)
        {
            const copy = mat4_create();
            this._arr.push(copy);
        }

        mat4_copy(this._arr[this._index], m || this._arr[this._index - 1]);

        return this._arr[this._index];
    }

    pop()
    {
        this.stateCounter++;

        this._index--;
        if (this._index < 0) this._index = 0;

        return this._arr[this._index];
    }

    length()
    {
        return this._index;
    }
}

;// CONCATENATED MODULE: ./src/corelibs/cg/cg_profiledata.js


class ProfileData
{

    /**
     * @param {CgContext} cgl
     */
    constructor(cgl)
    {
        this._cgl = cgl;
        this._lastTime = 0;
        this.pause = false;
        this.profileUniformCount = 0;
        this.profileShaderBinds = 0;
        this.profileUniformCount = 0;
        this.profileShaderCompiles = 0;
        this.profileVideosPlaying = 0;
        this.profileMVPMatrixCount = 0;
        this.profileEffectBuffercreate = 0;
        this.profileShaderGetUniform = 0;
        this.profileFrameBuffercreate = 0;
        this.profileMeshSetGeom = 0;
        this.profileTextureNew = 0;
        this.profileGenMipMap = 0;
        this.profileOnAnimFrameOps = 0;

        this.profileFencedPixelRead = 0;
        this.profileMainloopMs = 0;
        this.profileMeshDraw = 0;
        this.profileTextureEffect = 0;
        this.profileTexPreviews = 0;
        this.shaderCompileTime = 0;
        this.shaderCompileCount = 0;
        this.profileMeshNumElements = 0;
        this.profileMeshAttributes = 0;
        this.profileSingleMeshAttribute = {};
        this.heavyEvents = [];

        this.doProfileGlQuery = false;
        this.glQueryData = {};
        this.counts = {};
        this.timeSpent = {};
    }

    clear()
    {
        for (const i in this.counts) this.counts[i] = 0;

    //     this.profileSingleMeshAttribute = {};
    //     this.profileMeshAttributes = 0;
    //     this.profileUniformCount = 0;
    //     this.profileShaderGetUniform = 0;
    //     this.profileShaderCompiles = 0;
    //     this.profileShaderBinds = 0;
    //     this.profileTextureResize = 0;
    //     this.profileFrameBuffercreate = 0;
    //     this.profileEffectBuffercreate = 0;
    //     this.profileTextureDelete = 0;
    //     this.profileMeshSetGeom = 0;
    //     this.profileVideosPlaying = 0;
    //     this.profileMVPMatrixCount = 0;
    //     this.profileNonTypedAttrib = 0;
    //     this.profileNonTypedAttribNames = "";
    //     this.profileTextureNew = 0;
    //     this.profileGenMipMap = 0;
    //     this.profileFramebuffer = 0;
    //     this.profileMeshDraw = 0;
    //     this.profileTextureEffect = 0;
    //     this.profileTexPreviews = 0;
    //     this.profileMeshNumElements = 0;
    //     this.profileFencedPixelRead = 0;
    }

    clearGlQuery()
    {
        for (let i in this.glQueryData)
        {
            if (!this.glQueryData[i].lastClear || performance.now() - this.glQueryData[i].lastClear > 1000)
            {
                this.glQueryData[i].time = this.glQueryData[i]._times / this.glQueryData[i]._numcount;
                this.glQueryData[i].num = this.glQueryData[i]._numcount;

                this.glQueryData[i]._times = 0;
                this.glQueryData[i]._numcount = 0;
                this.glQueryData[i].lastClear = performance.now();
            }
        }
    }

    /**
     * @param {string  } eventName
     * @param {number} timeMs
     */
    addTimeSpend(eventName, timeMs)
    {
        this.timeSpent[eventName] = this.timeSpent[eventName] || 0;
        this.timeSpent[eventName] += timeMs;
    }

    /**
     * @param {string} event
     * @param {number} [count]
     */
    count(event, count = 1)
    {
        this.counts[event] = this.counts[event] || 0;
        this.counts[event] += count;
    }

    /**
     * @param {string } event
     */
    getCount(event)
    {
        return this.counts[event];
    }

    /**
     * @param {string} event
     * @param {string} name
     * @param {string} [info]
     */
    addHeavyEvent(event, name, info)
    {
        const e = { "event": event, "name": name, "info": info, "date": performance.now() };
        this.heavyEvents.push(e);
        this._cgl.emitEvent("heavyEvent", e);
    }

    start(name)
    {

        // performance.mark("start " + name);
        return { "finish": () =>
        {
            // performance.mark("end " + name);
            // performance.measure(name, {
            //     "start": "start " + name,
            //     "end": "end " + name,
            //     "detail": {
            //         "devtools":
            //              {
            //                  "dataType": "track-entry",
            //                  "track": "cgl",
            //              }
            //     }
            // });
        }
        };
    }
}

;// CONCATENATED MODULE: ./src/corelibs/cg/cg_context.js








class CgContext extends external_CABLES_SHARED_namespaceObject.Events
{

    static API_UNKNOWN = 0;
    static API_WEBGL = 1;
    static API_WEBGPU = 2;

    static EVENT_RESIZE = "resize";

    #patch = null;
    gApi = 0;

    _textureslots = [];
    _pMatrixStack = new MatrixStack();
    _mMatrixStack = new MatrixStack();
    _vMatrixStack = new MatrixStack();
    canvasScale = 1; // this is not pixeldensity, this is only for command "scale canvas"

    /**
     * Description
     * @param {Patch} _patch
     */
    constructor(_patch)
    {
        super();

        this._log = new external_CABLES_SHARED_namespaceObject.Logger("cg_context", { "onError": _patch.config.onError });

        /** @type {object} */
        this.tempData = this.frameStore = this.frameStore || {};
        this.fpsCounter = new FpsCounter();
        this._identView = vec3_create();
        this._ident = vec3_create();
        vec3_set(this._identView, 0, 0, -2);
        vec3_set(this._ident, 0, 0, 0);
        this._onetimeCallbacks = [];
        this.maxTexSize = 2048;
        this._viewPort = [0, 0, 1, 1];
        this._viewPortStack = [];
        this.patch = _patch;
        this.autoReSize = true;

        this.DEPTH_COMPARE_FUNC_NEVER = 0;
        this.DEPTH_COMPARE_FUNC_LESS = 1;
        this.DEPTH_COMPARE_FUNC_EQUAL = 2;
        this.DEPTH_COMPARE_FUNC_LESSEQUAL = 3;
        this.DEPTH_COMPARE_FUNC_GREATER = 4;
        this.DEPTH_COMPARE_FUNC_NOTEQUAL = 5;
        this.DEPTH_COMPARE_FUNC_GREATEREQUAL = 6;
        this.DEPTH_COMPARE_FUNC_ALWAYS = 7;

        this.profileData = new ProfileData(this);

        /**
         * Current projection matrix
         * @memberof Context
         * @instance
         * @type {mat4}
         */
        this.pMatrix = mat4_create();

        /**
         * Current model matrix
         * @memberof Context
         * @instance
         * @type {mat4}
         */
        this.mMatrix = mat4_create();

        /**
         * Current view matrix
         * @memberof Context
         * @instance
         * @type {mat4}
         */
        this.vMatrix = mat4_create();

        mat4_identity(this.mMatrix);
        mat4_identity(this.vMatrix);

        window.matchMedia("screen and (min-resolution: 2dppx)").addEventListener("change", () =>
        {
            this.emitEvent("resize");
        });
    }

    get canvasWidth()
    {
        return this.width;
    }

    get canvasHeight()
    {
        return this.height;
    }

    get width()
    {
        return this.cgCanvas.canvasWidth;
    }

    get height()
    {
        return this.cgCanvas.canvasHeight;
    }

    get widthCss()
    {
        return this.cgCanvas.canvasWidth / this.pixelDensity;
    }

    get heightCss()
    {
        return this.cgCanvas.canvasHeight / this.pixelDensity;
    }

    set pixelDensity(p)
    {
        if (this.cgCanvas.pixelDensity != p)
        {
            this.cgCanvas.pixelDensity = p;
            this.cgCanvas.updateSize();
            this.emitEvent("resize");
        }
    }

    get pixelDensity()
    {
        return this.cgCanvas.pixelDensity;
    }

    getGApiName()
    {
        return ["unknown", "WebGL", "WebGPU"][this.gApi];
    }

    get canvas()
    {
        return this.cgCanvas.canvasEle;
    }

    get viewPort()
    {
        // TODO: add stack...
        return [0, 0, this.canvasWidth, this.canvasHeight];
    }

    /**
     * @param {String|HTMLElement} canvEle
     */
    setCanvas(canvEle)
    {
        if (this.cgCanvas && canvEle == this.cgCanvas.canvasEle) return;
        if (typeof canvEle === "string") canvEle = document.getElementById(canvEle);

        this.cgCanvas = new CgCanvas({ "canvasEle": canvEle, "cg": this });
        if (!canvEle) return;

        canvEle.parentElement.classList.add("cablesContainer");
        if (this._setCanvas) this._setCanvas(canvEle);

        this.updateSize();
    }

    /**
     * @param {HTMLElement} _canvEle
     */
    _setCanvas(_canvEle)
    {
    }

    updateSize()
    {
        this.cgCanvas.updateSize();
    }

    /**
     * @param {number} w
     * @param {number} h
     * @param {boolean} ignorestyle
     */
    setSize(w, h, ignorestyle = false)
    {
        this.cgCanvas.setSize(w, h, ignorestyle);
    }

    _resizeToWindowSize()
    {
        if (this.autoReSize)
        {
            this.setSize(window.innerWidth, window.innerHeight);
            this.updateSize();
        }
    }

    _resizeToParentSize()
    {
        if (this.autoReSize)
        {
            const p = this.canvas.parentElement;
            if (!p)
            {
                this._log.error("cables: can not resize to container element");
                return;
            }

            this.setSize(p.clientWidth, p.clientHeight);
            this.updateSize();
        }
    }

    setAutoResize(parent)
    {
        window.removeEventListener("resize", this._resizeToWindowSize.bind(this));
        window.removeEventListener("resize", this._resizeToParentSize.bind(this));

        if (parent == "window")
        {
            window.addEventListener("resize", this._resizeToWindowSize.bind(this));
            window.addEventListener("orientationchange", this._resizeToWindowSize.bind(this));
            this._resizeToWindowSize();
        }
        if (parent == "parent")
        {
            window.addEventListener("resize", this._resizeToParentSize.bind(this));
            this._resizeToParentSize();
        }
    }

    /**
     * push a matrix to the projection matrix stack
     * @function pushPMatrix
     * @memberof Context
     * @instance
     */
    pushPMatrix()
    {
        this.pMatrix = this._pMatrixStack.push(this.pMatrix);
    }

    /**
      * pop projection matrix stack
      * @function popPMatrix
      * @memberof Context
      * @instance
      * @returns {mat4} current projectionmatrix
      */
    popPMatrix()
    {
        this.pMatrix = this._pMatrixStack.pop();
        return this.pMatrix;
    }

    getProjectionMatrixStateCount()
    {
        return this._pMatrixStack.stateCounter;
    }

    /**
      * push a matrix to the model matrix stack
      * @function pushModelMatrix
      * @memberof Context
      * @instance
      * @example
      * // see source code of translate op:
      * cgl.pushModelMatrix();
      * mat4.translate(cgl.mMatrix,cgl.mMatrix, vec);
      * trigger.trigger();
      * cgl.popModelMatrix();
      */
    pushModelMatrix()
    {
        this.mMatrix = this._mMatrixStack.push(this.mMatrix);
    }

    /**
      * pop model matrix stack
      * @function popModelMatrix
      * @memberof Context
      * @instance
      * @returns {mat4} current modelmatrix
      */
    popModelMatrix()
    {
        // todo: DEPRECATE
        // if (this._mMatrixStack.length === 0) throw "Invalid modelview popMatrix!";
        this.mMatrix = this._mMatrixStack.pop();
        return this.mMatrix;
    }

    /**
      * get model matrix
      * @function modelMatrix
      * @memberof Context
      * @instance
      * @returns {mat4} current modelmatrix
      */
    modelMatrix()
    {
        return this.mMatrix;
    }

    /**
     * push a matrix to the view matrix stack
     * @function pushviewMatrix
     * @memberof Context
     * @instance
     */
    pushViewMatrix()
    {
        this.vMatrix = this._vMatrixStack.push(this.vMatrix);
    }

    /**
      * pop view matrix stack
      * @function popViewMatrix
      * @memberof Context
      * @instance
      * @returns {mat4} current viewmatrix
      * @function
      */
    popViewMatrix()
    {
        this.vMatrix = this._vMatrixStack.pop();
    }

    getViewMatrixStateCount()
    {
        return this._vMatrixStack.stateCounter;
    }

    /**
     * @param {vec3} identTranslate
     * @param {vec3} identTranslateView
     */
    _startMatrixStacks(identTranslate, identTranslateView)
    {
        identTranslate = identTranslate || this._ident;
        identTranslateView = identTranslateView || this._identView;

        perspective(this.pMatrix, 45, this.canvasWidth / this.canvasHeight, 0.1, 1000.0);

        mat4_identity(this.mMatrix);
        mat4_identity(this.vMatrix);
        mat4_translate(this.mMatrix, this.mMatrix, identTranslate);
        mat4_translate(this.vMatrix, this.vMatrix, identTranslateView);

        this.pushPMatrix();
        this.pushModelMatrix();
        this.pushViewMatrix();
    }

    _endMatrixStacks()
    {
        this.popViewMatrix();
        this.popModelMatrix();
        this.popPMatrix();
    }

    dispose()
    {
        this.aborted = true;
        if (this.cgCanvas) this.cgCanvas.dispose();
        if (this._dispose) this._dispose();
    }

    _dispose()
    {
    }

    /**
     * @param {any} _op
     */
    shouldDrawHelpers(_op)
    {
        return false;
    }

    /**
     * execute the callback next frame, once
     * @param {function} cb
     */
    addNextFrameOnceCallback(cb)
    {
        if (cb && this._onetimeCallbacks.indexOf(cb) == -1) this._onetimeCallbacks.push(cb);
    }

    _execOneTimeCallbacks()
    {
        if (this._onetimeCallbacks.length > 0)
        {
            for (let i = 0; i < this._onetimeCallbacks.length; i++) this._onetimeCallbacks[i]();
            this._onetimeCallbacks.length = 0;
        }
    }

    /**
     * @param {number} x
     */
    checkTextureSize(x)
    {
        x = x || 1;
        x = Math.floor(x);
        x = Math.min(x, this.maxTexSize);
        x = Math.max(x, 1);
        return x;
    }

    // should be overwritten...
    screenShot(cb, doScreenshotClearAlpha, mimeType, quality)
    {
        console.log("no screenshot function implemented");
    }

    /**
     * @param {string} [filename]
     * @param {function} [cb]
     * @param {number} [pw]
     * @param {number} [ph]
     * @param {boolean} [_noclearalpha]
     */
    saveScreenshot(filename, cb, pw, ph, _noclearalpha)
    {
        this.patch.renderOneFrame();

        let w = this.canvas.clientWidth * this.pixelDensity;
        let h = this.canvas.clientHeight * this.pixelDensity;

        if (pw)
        {
            this.canvas.width = pw;
            w = pw;
        }
        if (ph)
        {
            this.canvas.height = ph;
            h = ph;
        }

        function padLeft(nr, n, str)
        {
            return Array(n - String(nr).length + 1).join(str || "0") + nr;
        }

        const d = new Date();
        const dateStr = "".concat(String(d.getFullYear()) + String(d.getMonth() + 1) + String(d.getDate()), "_").concat(padLeft(d.getHours(), 2)).concat(padLeft(d.getMinutes(), 2)).concat(padLeft(d.getSeconds(), 2));

        if (!filename) filename = "cables_" + dateStr + ".png";
        else filename += ".png";

        this.screenShot((blob) =>
        {
            this.canvas.width = w;
            this.canvas.height = h;

            if (blob)
            {
                const anchor = document.createElement("a");

                anchor.download = filename;
                anchor.href = URL.createObjectURL(blob);

                console.log("scrrenshot");
                setTimeout(function ()
                {
                    anchor.click();
                    if (cb) cb(blob);
                }, 100);
            }
            else
            {
                this._log.log("screenshot: no blob");
            }
        });
    }

    hasFocus()
    {
        return this.cgCanvas.hasFocus;

    }

}

;// CONCATENATED MODULE: ./src/corelibs/cg/cg_shader.js



/**
 * @typedef ShaderModule
 * @property {String} title
 * @property {String} name
 * @property {Number} id
 * @property {Number} numId
 * @property {String} group
 * @property {String} prefix
 * @property {Number} priority
 * @property {Number} num
 * @property {String} attributes
 * @property {String} srcBodyFrag
 * @property {String} srcBodyVert
 * @property {String} srcHeadFrag
 * @property {String} srcHeadVert
  */

class CgShader extends external_CABLES_SHARED_namespaceObject.Events
{
    id = external_CABLES_namespaceObject.utils.simpleId();
    _isValid = true;

    /** @type {Array<Array<String>>} */
    _defines = [];

    /** @type {Array<String>} */
    _moduleNames = [];

    _name = "unknown shader";
    _moduleNumId = 0;
    _needsRecompile = true;
    _compileReason = "initial";

    /** @type {Array<ShaderModule>} */
    _modules = [];

    _compileCount = 0;

    logError = true;
    num = -1;
    lastCompile = 0;

    constructor()
    {
        super();
    }

    get name()
    {
        return this._name;
    }

    /**
     * @param {string} reason
     */
    setWhyCompile(reason)
    {
        this._compileReason = reason;
        this._needsRecompile = true;
    }

    getWhyCompile()
    {
        return this._compileReason;
    }

    needsRecompile()
    {
        return this._needsRecompile;
    }

    /**
     * @param {string} name
     */
    removeUniform(name)
    {
        for (let i = 0; i < this._uniforms.length; i++)
        {
            if (this._uniforms[i].getName() == name)
            {
                this._uniforms.splice(i, 1);
            }
        }
        this.setWhyCompile("remove uniform " + name);
    }

    /**
     * @param {String} name
     * @param {number} stage
     */
    hasUniformInStage(name, stage)
    {

        let binding = this.defaultUniBindingFrag;
        if (stage == GPUShaderStage.VERTEX) binding = this.defaultUniBindingVert;
        if (stage == GPUShaderStage.COMPUTE) binding = this.defaultUniBindingCompute;

        for (let i = 0; i < this._uniforms.length; i++)
        {

            console.log("hasuniiiiiiiiiiiiiii", this._uniforms[i].getName(), name);
            if (this._uniforms[i].getName() == name) return true;
        }
        return false;
    }

    /**
     * @param {String} name
     */
    hasUniform(name)
    {
    }

    /**
     * easily enable/disable a define without a value
     * @param {String} name
     * @param {Port|boolean} enabled value or port
     */
    toggleDefine(name, enabled)
    {
        if (enabled && typeof (enabled) == "object" && enabled.addEventListener) // port
        {
            if (enabled.changeListener)enabled.off(enabled.changeListener);

            enabled.onToggleDefine = (v) =>
            {
                this.toggleDefine(name, v);
            };

            enabled.changeListener = enabled.on("change", enabled.onToggleDefine);
            enabled = enabled.get();
        }

        if (enabled) this.define(name);
        else this.removeDefine(name);
    }

    /**
     * add a define to a shader, e.g.  #define DO_THIS_THAT 1
     * @param {String} name
     * @param {any} value (can be empty)
     */
    define(name, value = "")
    {
        if (value === null || value === undefined) value = "";

        if (typeof (value) == "object") // port
        {
            value.removeEventListener("change", value.onDefineChange);
            value.onDefineChange = (v) =>
            {
                this.define(name, v);
            };
            value.on("change", value.onDefineChange);

            value = value.get();
        }

        for (let i = 0; i < this._defines.length; i++)
        {
            if (this._defines[i][0] == name && this._defines[i][1] == value) return;
            if (this._defines[i][0] == name)
            {
                this._defines[i][1] = value;
                this.setWhyCompile("define " + name + " " + value);
                return;
            }
        }
        this.setWhyCompile("define " + name + " " + value);

        this._defines.push([name, value]);
    }

    getDefines()
    {
        return this._defines;
    }

    /**
     * @param {string} name
     */
    getDefine(name)
    {
        for (let i = 0; i < this._defines.length; i++)
            if (this._defines[i][0] == name) return this._defines[i][1];
        return null;
    }

    /**
     * return true if shader has define
     * @function hasDefine
     * @memberof Shader
     * @instance
     * @param {String} name
     * @return {Boolean}
     */
    hasDefine(name)
    {
        for (let i = 0; i < this._defines.length; i++)
            if (this._defines[i][0] == name) return true;
    }

    /**
     * remove a define from a shader
     * @param {string} name
     */
    removeDefine(name)
    {
        for (let i = 0; i < this._defines.length; i++)
        {
            if (this._defines[i][0] == name)
            {
                this._defines.splice(i, 1);
                this.setWhyCompile("define removed:" + name);
                return;
            }
        }
    }

    /**
     * @param {any} modId
     */
    hasModule(modId)
    {
        for (let i = 0; i < this._modules.length; i++)
            if (this._modules[i].id == modId) return true;

        return false;
    }

    /**
     *
     * @param {Array<String>} names
     */
    setModules(names)
    {
        this._moduleNames = names;
    }

    /**
     * remove a module from shader
     * @param {ShaderModule} mod the module to be removed
     */
    removeModule(mod)
    {
        for (let i = 0; i < this._modules.length; i++)
        {
            if (mod && mod.id)
            {
                if (this._modules[i].id == mod.id || !this._modules[i])
                {
                    let found = true;
                    while (found)
                    {
                        found = false;
                        for (let j = 0; j < this._uniforms.length; j++)
                        {
                            if (this._uniforms[j].getName().startsWith(mod.prefix))
                            {
                                this._uniforms.splice(j, 1);
                                found = true;
                                continue;
                            }
                        }
                    }

                    this.setWhyCompile("remove module " + mod.title);
                    this._modules.splice(i, 1);
                    break;
                }
            }
        }
    }

    getNumModules()
    {
        return this._modules.length;
    }

    getCurrentModules() { return this._modules; }

    /**
     * add a module
     * @param {ShaderModule} mod the module to be added
     * @param {ShaderModule} [sibling] sibling module, new module will share the same group
     */
    addModule(mod, sibling)
    {
        if (this.hasModule(mod.id)) return;
        if (!mod.id) mod.id = external_CABLES_namespaceObject.utils.simpleId();
        if (!mod.numId) mod.numId = this._moduleNumId;
        if (!mod.num)mod.num = this._modules.length;
        if (sibling && !sibling.group) sibling.group = external_CABLES_namespaceObject.utils.simpleId();

        if (!mod.group)
            if (sibling) mod.group = sibling.group;
            else mod.group = external_CABLES_namespaceObject.utils.simpleId();

        mod.prefix = "mod" + mod.group + "_";
        this._modules.push(mod);

        this.setWhyCompile("add module " + mod.title);
        this._moduleNumId++;

        return mod;
    }

    isValid()
    {
        return this._isValid;
    }

}

;// CONCATENATED MODULE: ./src/corelibs/cg/cg_uniform.js




class CgUniform
{

    /**
     * Description
     * @param {CgShader} __shader
     * @param {string} __type
     * @param {string} __name
     * @param {Number|Port} _value
     * @param {Port} _port2
     * @param {Port} _port3
     * @param {Port} _port4
     */
    constructor(__shader, __type, __name, _value, _port2, _port3, _port4, _structUniformName, _structName, _propertyName)
    {
        this._log = new external_CABLES_SHARED_namespaceObject.Logger("cg_uniform");
        this._type = __type;
        this._name = __name;

        /** @type {CgShader} */
        this._shader = __shader;
        this._value = 0.00001;
        this._oldValue = null;
        this._port = null;

        this._structName = _structName;
        this._structUniformName = _structUniformName;
        this._propertyName = _propertyName;

        if (this._shader._addUniform) this._shader._addUniform(this);
        this.needsUpdate = true;
        this.shaderType = null;
        this.comment = null;

        if (__type == "f")
        {
            this.set = this.setValue = this.setValueF.bind(this);
            this.updateValue = this.updateValueF.bind(this);
        }
        else if (__type == "f[]")
        {
            this.set = this.setValue = this.setValueArrayF.bind(this);
            this.updateValue = this.updateValueArrayF.bind(this);
        }
        else if (__type == "2f[]")
        {
            this.set = this.setValue = this.setValueArray2F.bind(this);
            this.updateValue = this.updateValueArray2F.bind(this);
        }
        else if (__type == "3f[]")
        {
            this.set = this.setValue = this.setValueArray3F.bind(this);
            this.updateValue = this.updateValueArray3F.bind(this);
        }
        else if (__type == "4f[]")
        {
            this.set = this.setValue = this.setValueArray4F.bind(this);
            this.updateValue = this.updateValueArray4F.bind(this);
        }
        else if (__type == "i")
        {
            this.set = this.setValue = this.setValueI.bind(this);
            this.updateValue = this.updateValueI.bind(this);
        }
        else if (__type == "2i")
        {
            this.set = this.setValue = this.setValue2I.bind(this);
            this.updateValue = this.updateValue2I.bind(this);
        }
        else if (__type == "3i")
        {
            this.set = this.setValue = this.setValue3I.bind(this);
            this.updateValue = this.updateValue3I.bind(this);
        }
        else if (__type == "4i")
        {
            this.set = this.setValue = this.setValue4I.bind(this);
            this.updateValue = this.updateValue4I.bind(this);
        }
        else if (__type == "b")
        {
            this.set = this.setValue = this.setValueBool.bind(this);
            this.updateValue = this.updateValueBool.bind(this);
        }
        else if (__type == "4f")
        {
            this.set = this.setValue = this.setValue4F.bind(this);
            this.updateValue = this.updateValue4F.bind(this);
        }
        else if (__type == "3f")
        {
            this.set = this.setValue = this.setValue3F.bind(this);
            this.updateValue = this.updateValue3F.bind(this);
        }
        else if (__type == "2f")
        {
            this.set = this.setValue = this.setValue2F.bind(this);
            this.updateValue = this.updateValue2F.bind(this);
        }
        else if (__type == "t")
        {
            this.set = this.setValue = this.setValueT.bind(this);
            this.updateValue = this.updateValueT.bind(this);
        }
        else if (__type == "sampler")
        {
            if (this.setValueAny)
            {
                this.set = this.setValue = this.setValueAny.bind(this);
                this.updateValue = this.updateValueAny.bind(this);
            }
        }
        else if (__type == "tc")
        {
            this.set = this.setValue = this.setValueT.bind(this);
            this.updateValue = this.updateValueT.bind(this);
        }
        else if (__type == "t[]")
        {
            this.set = this.setValue = this.setValueArrayT.bind(this);
            this.updateValue = this.updateValueArrayT.bind(this);
        }
        else if (__type == "m4" || __type == "m4[]")
        {
            this.set = this.setValue = this.setValueM4.bind(this);
            this.updateValue = this.updateValueM4.bind(this);
        }
        else
        {
            // console.error("unknown");
            this._log.error("Unknown uniform type " + __type, __name, typeof this._shader);
        }

        if (typeof _value == "object" && _value instanceof external_CABLES_namespaceObject.Port)
        {
            this._port = _value;
            this._value = this._port.get();

            if (_port2 && _port3 && _port4)
            {
                if (!(_port2 instanceof external_CABLES_namespaceObject.Port) || !(_port3 instanceof external_CABLES_namespaceObject.Port) || !(_port4 instanceof external_CABLES_namespaceObject.Port))
                {
                    this._log.error("[cgl_uniform] mixed port/value parameter for vec4 ", this._name);
                }

                this._value = [0, 0, 0, 0];
                this._port2 = _port2;
                this._port3 = _port3;
                this._port4 = _port4;

                this._port.on("change", () => { this.updateFromPort4f(); });
                this._port2.on("change", () => { this.updateFromPort4f(); });
                this._port3.on("change", () => { this.updateFromPort4f(); });
                this._port4.on("change", () => { this.updateFromPort4f(); });

                // this._port.onChange = this._port2.onChange = this._port3.onChange = this._port4.onChange = this.updateFromPort4f.bind(this);
                this.updateFromPort4f();
            }
            else if (_port2 && _port3)
            {
                if (!(_port2 instanceof external_CABLES_namespaceObject.Port) || !(_port3 instanceof external_CABLES_namespaceObject.Port))
                {
                    this._log.error("[cgl_uniform] mixed port/value parameter for vec4 ", this._name);
                }

                this._value = [0, 0, 0];
                this._port2 = _port2;
                this._port3 = _port3;
                // this._port.onChange = this._port2.onChange = this._port3.onChange = this.updateFromPort3f.bind(this);
                this._port.on("change", this.updateFromPort3f.bind(this));
                this._port2.on("change", this.updateFromPort3f.bind(this));
                this._port3.on("change", this.updateFromPort3f.bind(this));

                this.updateFromPort3f();
            }
            else if (_port2)
            {
                if (!(_port2 instanceof external_CABLES_namespaceObject.Port))
                {
                    this._log.error("[cgl_uniform] mixed port/value parameter for vec4 ", this._name);
                }

                this._value = [0, 0];
                this._port2 = _port2;
                // this._port.onChange = this._port2.onChange = this.updateFromPort2f.bind(this);
                this._port.on("change", this.updateFromPort2f.bind(this));
                this._port2.on("change", this.updateFromPort2f.bind(this));

                this.updateFromPort2f();
            }
            else
            {
                // this._port.on = this.updateFromPort.bind(this);
                this._port.on("change", this.updateFromPort.bind(this));
            }
        }
        else this._value = _value;

        if (this._value == undefined)
        {
            this._value = 0;
        }

        this.setValue(this._value);

        this.needsUpdate = true;
    }

    getType()
    {
        return this._type;
    }

    get type()
    {
        return this._type;
    }

    get name()
    {
        return this._name;
    }

    getName()
    {
        return this._name;
    }

    getValue()
    {
        return this._value;
    }

    getShaderType()
    {
        return this.shaderType;
    }

    isStructMember()
    {
        return !!this._structName;
    }

    updateFromPort4f()
    {
        this._value[0] = this._port.get();
        this._value[1] = this._port2.get();
        this._value[2] = this._port3.get();
        this._value[3] = this._port4.get();
        this.setValue(this._value);
    }

    updateFromPort3f()
    {
        this._value[0] = this._port.get();
        this._value[1] = this._port2.get();
        this._value[2] = this._port3.get();
        this.setValue(this._value);
    }

    updateFromPort2f()
    {
        this._value[0] = this._port.get();
        this._value[1] = this._port2.get();
        this.setValue(this._value);
    }

    updateFromPort()
    {
        this.setValue(this._port.get());
    }

    get port()
    {
        return this._port;
    }
}

;// CONCATENATED MODULE: ./src/corelibs/cg/cg_mesh.js
class CgMesh
{
    _name = "unknown";

    constructor()
    {
    }

}

;// CONCATENATED MODULE: ./src/corelibs/cg/cg_texture.js


const DEFAULT_TEXTURE_SIZE = 8;

class CgTexture
{

    /**
     * @param {CglTextureOptions} options={}
     */
    constructor(options = {})
    {
        this.id = external_CABLES_namespaceObject.utils.uuid();
        this.width = 0;
        this.height = 0;
        this.name = "unknown";

        options = options || {};
        this.pixelFormat = options.pixelFormat || CgTexture.PFORMATSTR_RGBA8UB;

        this.name = options.name || "unknown";

        if (!options.width) options.width = DEFAULT_TEXTURE_SIZE;
        if (!options.height) options.height = DEFAULT_TEXTURE_SIZE;
    }
}

CgTexture.getDefaultTextureData = (name, size, options = {}) =>
{
    if (name == "empty")
    {
        return new Uint8Array(size * size * 4).fill(0);
    }
    else
    if (name == "color")
    {
        const data = new Uint8Array(size * size * 4);
        let r = options.r || 1;
        let g = options.g || 1;
        let b = options.b || 1;

        for (let x = 0; x < size * size; x++)
        {
            data[x * 4 + 0] = r;
            data[x * 4 + 1] = g;
            data[x * 4 + 2] = b;
            data[x * 4 + 3] = 255;
        }
        return data;
    }
    else
    if (name == "randomUInt")
    {
        const data = new Uint8Array(size * size * 4);

        for (let x = 0; x < size * size; x++)
        {
            data[x * 4 + 0] = Math.random() * 255;
            data[x * 4 + 1] = Math.random() * 255;
            data[x * 4 + 2] = Math.random() * 255;
            data[x * 4 + 3] = 255;
        }
        return data;
    }
    else
    if (name == "random" || name == "randomFloat")
    {
        const data = new Float32Array(size * size * 4);

        for (let x = 0; x < size * size; x++)
        {
            data[x * 4 + 0] = (Math.random() - 0.5) * 2.0;
            data[x * 4 + 1] = (Math.random() - 0.5) * 2.0;
            data[x * 4 + 2] = (Math.random() - 0.5) * 2.0;
            data[x * 4 + 3] = 1;
        }
        return data;
    }
    else
    if (name == "stripes")
    {
        const arr = [];

        let r = options.r;
        let g = options.g;
        let b = options.b;

        if (r === undefined)r = 1;
        if (g === undefined)g = 1;
        if (b === undefined)b = 1;

        for (let y = 0; y < size; y++)
        {
            for (let x = 0; x < size; x++)
            {
                if ((x + y) % 64 < 32)
                {
                    arr.push((200 + (y / size) * 25 + (x / size) * 25) * r);
                    arr.push((200 + (y / size) * 25 + (x / size) * 25) * g);
                    arr.push((200 + (y / size) * 25 + (x / size) * 25) * b);
                }
                else
                {
                    arr.push((40 + (y / size) * 25 + (x / size) * 25) * r);
                    arr.push((40 + (y / size) * 25 + (x / size) * 25) * g);
                    arr.push((40 + (y / size) * 25 + (x / size) * 25) * b);
                }
                arr.push(255);
            }
        }

        return new Uint8Array(arr);
    }
    else
    {
        console.warn("unknown default texture", name);
        return CgTexture.getDefaultTextureData("stripes", size, { "r": 1, "g": 0, "b": 0 });
    }
};

CgTexture.FILTER_NEAREST = 0;
CgTexture.FILTER_LINEAR = 1;
CgTexture.FILTER_MIPMAP = 2;

CgTexture.WRAP_REPEAT = 0;
CgTexture.WRAP_MIRRORED_REPEAT = 1;
CgTexture.WRAP_CLAMP_TO_EDGE = 2;

CgTexture.TYPE_DEFAULT = 0;
CgTexture.TYPE_DEPTH = 1;
CgTexture.TYPE_FLOAT = 2;

CgTexture.PFORMATSTR_RGB565 = "RGB 5/6/5bit ubyte";

CgTexture.PFORMATSTR_R8UB = "R 8bit ubyte";
CgTexture.PFORMATSTR_RG8UB = "RG 8bit ubyte";
CgTexture.PFORMATSTR_RGB8UB = "RGB 8bit ubyte";
CgTexture.PFORMATSTR_RGBA8UB = "RGBA 8bit ubyte";

CgTexture.PFORMATSTR_SRGBA8 = "SRGBA 8bit ubyte";

CgTexture.PFORMATSTR_R11FG11FB10F = "RGB 11/11/10bit float";

CgTexture.PFORMATSTR_R16F = "R 16bit float";
CgTexture.PFORMATSTR_RG16F = "RG 16bit float";
CgTexture.PFORMATSTR_RGB16F = "RGB 16bit float";
CgTexture.PFORMATSTR_RGBA16F = "RGBA 16bit float";

CgTexture.PFORMATSTR_R32F = "R 32bit float";
CgTexture.PFORMATSTR_RG32F = "RG 32bit float";
CgTexture.PFORMATSTR_RGB32F = "RGB 32bit float";
CgTexture.PFORMATSTR_RGBA32F = "RGBA 32bit float";

CgTexture.PFORMATSTR_DEPTH = "DEPTH";

CgTexture.PIXELFORMATS = [

    CgTexture.PFORMATSTR_RGB565,

    CgTexture.PFORMATSTR_R8UB,
    CgTexture.PFORMATSTR_RG8UB,
    CgTexture.PFORMATSTR_RGB8UB,
    CgTexture.PFORMATSTR_RGBA8UB,

    CgTexture.PFORMATSTR_SRGBA8,

    CgTexture.PFORMATSTR_R11FG11FB10F,
    CgTexture.PFORMATSTR_R16F,
    CgTexture.PFORMATSTR_RG16F,
    CgTexture.PFORMATSTR_RGBA16F,

    CgTexture.PFORMATSTR_R32F,
    CgTexture.PFORMATSTR_RGBA32F

];

;// CONCATENATED MODULE: ./src/corelibs/cg/constants.js
const SHADER = {
    // default attributes
    "SHADERVAR_VERTEX_POSITION": "vPosition",
    "SHADERVAR_VERTEX_NUMBER": "attrVertIndex",
    "SHADERVAR_VERTEX_NORMAL": "attrVertNormal",
    "SHADERVAR_VERTEX_TEXCOORD": "attrTexCoord",
    "SHADERVAR_INSTANCE_MMATRIX": "instMat",
    "SHADERVAR_VERTEX_COLOR": "attrVertColor",

    "SHADERVAR_INSTANCE_INDEX": "instanceIndex",

    // default uniforms
    "SHADERVAR_UNI_PROJMAT": "projMatrix",
    "SHADERVAR_UNI_VIEWMAT": "viewMatrix",
    "SHADERVAR_UNI_MODELMAT": "modelMatrix",
    "SHADERVAR_UNI_NORMALMAT": "normalMatrix",
    "SHADERVAR_UNI_INVVIEWMAT": "inverseViewMatrix",
    "SHADERVAR_UNI_INVPROJMAT": "invProjMatrix",
    "SHADERVAR_UNI_MATERIALID": "materialId",
    "SHADERVAR_UNI_OBJECTID": "objectId",

    "SHADERVAR_UNI_VIEWPOS": "camPos",
};

const BLEND_MODES = {
    "BLEND_NONE": 0,
    "BLEND_NORMAL": 1,
    "BLEND_ADD": 2,
    "BLEND_SUB": 3,
    "BLEND_MUL": 4,
};

const RAD2DEG = 180.0 / Math.PI;
const DEG2RAD = Math.PI / 180.0;

const CONSTANTS = {
    "MATH": {
        "DEG2RAD": DEG2RAD,
        "RAD2DEG": RAD2DEG,
    },
    "SHADER": SHADER,
    "BLEND_MODES": BLEND_MODES,
};
const nl = "\n";// newline


;// CONCATENATED MODULE: ./src/corelibs/cg/index.js















const CG = {

    "DEPTH_COMPARE_NEVER": 0,
    "DEPTH_COMPARE_LESS": 1,
    "DEPTH_COMPARE_EQUAL": 2,
    "DEPTH_COMPARE_LESSEQUAL": 3,
    "DEPTH_COMPARE_GREATER": 4,
    "DEPTH_COMPARE_NOTEQUAL": 5,
    "DEPTH_COMPARE_GREATEREQUAL": 6,
    "DEPTH_COMPARE_ALWAYS": 7,

    "CULL_NONE": 0,
    "CULL_BACK": 1,
    "CULL_FRONT": 2,
    "CULL_BOTH": 3,

    "Geometry": Geometry,
    "BoundingBox": BoundingBox,
    "FpsCounter": FpsCounter,

    "CgCanvas": CgCanvas
};

window.CABLES = window.CABLES || {};
window.CABLES.CG = { ...CG, ...window.CABLES.CG };
window.CG = { ...CG, ...window.CABLES.CG, ...window.CG };

window.glMatrix = common_namespaceObject;
window.mat2 = mat2_namespaceObject;
window.mat2d = mat2d_namespaceObject;
window.mat3 = mat3_namespaceObject;
window.mat4 = mat4_namespaceObject;
window.quat = quat_namespaceObject;
window.quat2 = quat2_namespaceObject;
window.vec2 = vec2_namespaceObject;

window.vec3 = vec3_namespaceObject;
window.vec4 = vec4_namespaceObject;



;// CONCATENATED MODULE: ./src/corelibs/cgl/cgl_shader_uniform.js




/**
 * Shader uniforms
 *
 * types:
 * <pre>
 * f    - float
 * 2f   - vec2
 * 3f   - vec3
 * 4f   - vec4
 * i    - integer
 * t    - texture
 * m4   - mat4, 4x4 float matrix
 * f[]  - array of floats
 * 2f[] - array of float vec2
 * 3f[] - array of float vec3
 * 4f[] - array of float vec4
 * </pre>
 *
 * @namespace external:CGL
 * @class
 * @param {CgShader} shader
 * @param {String} [type=f]
 * @param {String} name
 * @param {Number|Port} value  can be a Number,Matrix or Port
 * @example
 * // bind float uniform called myfloat and initialize with value 1.0
 * const unir=new CGL.Uniform(shader,'f','myfloat',1.0);
 * unir.setValue(1.0);
 *
 * // bind float uniform called myfloat and automatically set it to input port value
 * const myPort=op.inFloat("input");
 * const pv=new CGL.Uniform(shader,'f','myfloat',myPort);
 *
 */

// export const Uniform(__shader, __type, __name, _value, _port2, _port3, _port4, _structUniformName, _structName, _propertyName)

class Uniform extends CgUniform
{
    #lastShaderCompile = performance.now();
    constructor(__shader, __type, __name, _value, _port2, _port3, _port4, _structUniformName, _structName, _propertyName)
    {
        super(__shader, __type, __name, _value, _port2, _port3, _port4, _structUniformName, _structName, _propertyName);
        this._loc = -1;
        this._cgl = __shader._cgl;
    }

    get name()
    {
        return this._name;
    }

    /**
     * @param {Shader} newShader
     */
    copy(newShader)
    {
        const uni = new Uniform(newShader, this._type, this._name, this._value, this._port2, this._port3, this._port4, this._structUniformName, this._structName, this._propertyName);
        uni.shaderType = this.shaderType;
        return uni;
    }

    /**
     * returns type as glsl type string. e.g. 'f' returns 'float'
     * @function getGlslTypeString
     * @memberof Uniform
     * @instance
     * @return {string} type as string
     */
    getGlslTypeString()
    {
        return Uniform.glslTypeString(this._type);
    }

    isValidLoc()
    {
        const v = this._loc != -1 && this._loc != null;
        // if (!v)console.log("invalid", this);
        return v;

    }

    resetLoc()
    {
        this._loc = null;
        this.needsUpdate = true;
    }

    bindTextures() {}

    getLoc()
    {
        return this._loc;
    }

    updateFromPort4f()
    {
        this._value[0] = this._port.get();
        this._value[1] = this._port2.get();
        this._value[2] = this._port3.get();
        this._value[3] = this._port4.get();
        this.setValue(this._value);
    }

    updateFromPort3f()
    {
        this._value[0] = this._port.get();
        this._value[1] = this._port2.get();
        this._value[2] = this._port3.get();
        this.setValue(this._value);
    }

    updateFromPort2f()
    {
        this._value[0] = this._port.get();
        this._value[1] = this._port2.get();
        this.setValue(this._value);
    }

    updateFromPort()
    {
        this.setValue(this._port.get());
    }

    #updateLoc()
    {

        if (!this.isValidLoc())
        {
            if (this.#lastShaderCompile == this._shader.lastCompile) return; // ignore until shader changes

            const measure = this._cgl.profileData.start("uni updateloc");
            this.#lastShaderCompile = this._shader.lastCompile;
            this._loc = this._shader.getCgl().gl.getUniformLocation(this._shader.getProgram(), this._name);
            if (this._loc == null)
            {
                // console.log("loc null", this);
            }
            measure.finish();
        }
        else this.needsUpdate = false;

        // CABLES.shaderUsed = CABLES.shaderUsed || {};
        // CABLES.shaderUsed[this._shader.name] = CABLES.shaderUsed[this._shader.name] || {};
        // CABLES.shaderUsed[this._shader.name][this.name] = true;
        if (!this.isValidLoc()) this._cgl.profileData.count("uniformUpdateInvalid");
    }

    updateValueF()
    {
        this.#updateLoc();

        this._shader.getCgl().gl.uniform1f(this._loc, this._value);
        this._cgl.profileData.count("uniformUpdate");
        this.needsUpdate = false;
    }

    /**
     * @param {number} v
     */
    setValueF(v)
    {
        if (v != this._value)
        {
            this.needsUpdate = true;
            this._value = v;
        }
    }

    updateValueBool()
    {
        this.#updateLoc();
        // if (!this.isValidLoc()) this._loc = this._shader.getCgl().gl.getUniformLocation(this._shader.getProgram(), this._name);
        // else this.needsUpdate = false;
        this._shader.getCgl().gl.uniform1i(this._loc, this._value ? 1 : 0);

        this._cgl.profileData.count("uniformUpdate");
    }

    updateValueI()
    {
        this.#updateLoc();

        this._shader.getCgl().gl.uniform1i(this._loc, this._value);
        this._cgl.profileData.count("uniformUpdate");
        this.needsUpdate = false;
    }

    updateValue2I()
    {
        if (!this._value) return;

        this.#updateLoc();

        this._shader.getCgl().gl.uniform2i(this._loc, this._value[0], this._value[1]);

        this._cgl.profileData.count("uniformUpdate");
        this.needsUpdate = false;
    }

    updateValue3I()
    {
        if (!this._value) return;
        this.#updateLoc();

        this._shader.getCgl().gl.uniform3i(this._loc, this._value[0], this._value[1], this._value[2]);
        this._cgl.profileData.count("uniformUpdate");
        this.needsUpdate = false;
    }

    updateValue4I()
    {
        this.#updateLoc();
        this._shader.getCgl().gl.uniform4i(this._loc, this._value[0], this._value[1], this._value[2], this._value[3]);
        this._cgl.profileData.count("uniformUpdate");
        this.needsUpdate = false;
    }

    setValueI(v)
    {
        if (v != this._value)
        {
            this.needsUpdate = true;
            this._value = v;
        }
    }

    setValue2I(v)
    {
        if (!v) return;
        if (!this._oldValue)
        {
            this._oldValue = [v[0] - 1, 1];
            this.needsUpdate = true;
        }
        else if (v[0] != this._oldValue[0] || v[1] != this._oldValue[1])
        {
            this._oldValue[0] = v[0];
            this._oldValue[1] = v[1];
            this.needsUpdate = true;
        }

        this._value = v;
    }

    setValue3I(v)
    {
        if (!v) return;
        if (!this._oldValue)
        {
            this._oldValue = [v[0] - 1, 1, 2];
            this.needsUpdate = true;
        }
        else if (v[0] != this._oldValue[0] || v[1] != this._oldValue[1] || v[2] != this._oldValue[2])
        {
            this._oldValue[0] = v[0];
            this._oldValue[1] = v[1];
            this._oldValue[2] = v[2];
            this.needsUpdate = true;
        }

        this._value = v;
    }

    setValue4I(v)
    {
        this.needsUpdate = true;
        this._value = v || vec4.create();
    }

    setValueBool(v)
    {
        if (v != this._value)
        {
            this.needsUpdate = true;
            this._value = v;
        }
    }

    setValueArray4F(v)
    {
        this.needsUpdate = true;
        this._value = v;
    }

    updateValueArray4F()
    {
        this.#updateLoc();

        if (!this._value) return;
        this._shader.getCgl().gl.uniform4fv(this._loc, this._value);
        this._cgl.profileData.count("uniformUpdate");
        this.needsUpdate = false;
    }

    setValueArray3F(v)
    {
        this.needsUpdate = true;
        this._value = v;
    }

    updateValueArray3F()
    {
        this.#updateLoc();

        if (!this._value) return;
        this._shader.getCgl().gl.uniform3fv(this._loc, this._value);
        this._cgl.profileData.count("uniformUpdate");
        this.needsUpdate = false;
    }

    setValueArray2F(v)
    {
        this.needsUpdate = true;
        this._value = v;
    }

    updateValueArray2F()
    {
        this.#updateLoc();

        if (!this._value) return;
        this._shader.getCgl().gl.uniform2fv(this._loc, this._value);
        this._cgl.profileData.count("uniformUpdate");
        this.needsUpdate = false;
    }

    setValueArrayF(v)
    {
        this.needsUpdate = true;
        this._value = v;
    }

    updateValueArrayF()
    {
        this.#updateLoc();

        if (!this._value) return;
        // if(!this._value)
        // console.log("updateValueArrayF", this._value);
        // console.trace("updateValueArrayF", this._value);
        this._shader.getCgl().gl.uniform1fv(this._loc, this._value);
        this._cgl.profileData.count("uniformUpdate");
        this.needsUpdate = false;
    }

    setValueArrayT(v)
    {
        this.needsUpdate = true;
        this._value = v;
    }

    updateValue3F()
    {
        if (!this._value) return;
        this.#updateLoc();

        this._shader.getCgl().gl.uniform3f(this._loc, this._value[0], this._value[1], this._value[2]);
        this.needsUpdate = false;
        this._cgl.profileData.count("uniformUpdate");
    }

    setValue3F(v)
    {
        if (!v) return;
        if (!this._oldValue)
        {
            this._oldValue = [v[0] - 1, 1, 2];
            this.needsUpdate = true;
        }
        else if (v[0] != this._oldValue[0] || v[1] != this._oldValue[1] || v[2] != this._oldValue[2])
        {
            this._oldValue[0] = v[0];
            this._oldValue[1] = v[1];
            this._oldValue[2] = v[2];
            this.needsUpdate = true;
        }

        this._value = v;
    }

    updateValue2F()
    {
        if (!this._value) return;

        // if (!this._isValidLoc())
        // {
        //     this._loc = this._shader.getCgl().gl.getUniformLocation(this._shader.getProgram(), this._name);
        //     this._cgl.profileData.count("uniformGet");
        //     this._cgl.profileData.profileShaderGetUniformName = this._name;
        // }
        this.#updateLoc();

        this._shader.getCgl().gl.uniform2f(this._loc, this._value[0], this._value[1]);
        this.needsUpdate = false;
        this._cgl.profileData.count("uniformUpdate");
    }

    setValue2F(v)
    {
        if (!v) return;
        if (!this._oldValue)
        {
            this._oldValue = [v[0] - 1, 1];
            this.needsUpdate = true;
        }
        else if (v[0] != this._oldValue[0] || v[1] != this._oldValue[1])
        {
            this._oldValue[0] = v[0];
            this._oldValue[1] = v[1];
            this.needsUpdate = true;
        }
        this._value = v;
    }

    updateValue4F()
    {
        // if (!this._isValidLoc())
        // {
        //     this._loc = this._shader.getCgl().gl.getUniformLocation(this._shader.getProgram(), this._name);
        //     this._cgl.profileData.count("uniformGet");
        //     this._cgl.profileData.profileShaderGetUniformName = this._name;
        // }
        this.#updateLoc();

        if (!this._value)
        {
            this._log.warn("no value for uniform", this._name, this);
            this._value = [0, 0, 0, 0];
        }

        this._shader.getCgl().gl.uniform4f(this._loc, this._value[0], this._value[1], this._value[2], this._value[3]);
        this._cgl.profileData.count("uniformUpdate");
        this.needsUpdate = false;
    }

    setValue4F(v)
    {
        if (typeof this.value == "number") this.value = vec4.create(); // this should not be needed, but somehow it crashes with some shadermods

        if (!v) return;
        if (!this._oldValue)
        {
            this._oldValue = [v[0] - 1, 1, 2, 3];
            this.needsUpdate = true;
        }
        else if (v[0] != this._oldValue[0] || v[1] != this._oldValue[1] || v[2] != this._oldValue[2] || v[3] != this._oldValue[3])
        {
            this._oldValue[0] = v[0];
            this._oldValue[1] = v[1];
            this._oldValue[2] = v[2];
            this.needsUpdate = true;
        }

        this._value = v;
    }

    updateValueM4()
    {
        // if (!this._isValidLoc())
        // {
        //     this._loc = this._shader.getCgl().gl.getUniformLocation(this._shader.getProgram(), this._name);
        //     this._cgl.profileData.count("uniformGet");
        //     this._cgl.profileData.profileShaderGetUniformName = this._name;
        // }
        this.#updateLoc();
        if (!this._value || this._value.length % 16 != 0) return console.log("this.name", this._name, this._value);

        this._shader.getCgl().gl.uniformMatrix4fv(this._loc, false, this._value);
        this._cgl.profileData.count("uniformUpdate");
        this.needsUpdate = false;
    }

    setValueM4(v)
    {
        this.needsUpdate = true;
        this._value = v || mat4.create();
    }

    updateValueArrayT()
    {
        // if (!this._isValidLoc()) this._loc = this._shader.getCgl().gl.getUniformLocation(this._shader.getProgram(), this._name);
        // else this.needsUpdate = false;
        this.#updateLoc();

        if (!this._value) return;
        this._shader.getCgl().gl.uniform1iv(this._loc, this._value);
        this._cgl.profileData.count("uniformUpdate");
    }

    updateValueT()
    {
        // if (!this._isValidLoc())
        // {
        //     this._loc = this._shader.getCgl().gl.getUniformLocation(this._shader.getProgram(), this._name);
        //     this._cgl.profileData.count("uniformGet");
        //     this._cgl.profileData.profileShaderGetUniformName = this._name;
        // }
        this.#updateLoc();

        this._cgl.profileData.count("uniformUpdate");
        this._shader.getCgl().gl.uniform1i(this._loc, this._value);
        this.needsUpdate = false;
    }

    /**
     * @param {any} v
     */
    setValueT(v)
    {
        if (this._value != v) this.needsUpdate = true;
        this._value = v;
    }
}

Uniform.glslTypeString = (t) =>
{
    if (t == "f") return "float";
    if (t == "b") return "bool";
    if (t == "i") return "int";
    if (t == "2i") return "ivec2";
    if (t == "2f") return "vec2";
    if (t == "3f") return "vec3";
    if (t == "4f") return "vec4";
    if (t == "m4") return "mat4";

    if (t == "t") return "sampler2D";
    if (t == "tc") return "samplerCube";

    if (t == "3f[]") return null; // ignore this for now...
    if (t == "m4[]") return null; // ignore this for now...
    if (t == "f[]") return null; // ignore this for now...

    console.warn("[CGL UNIFORM] unknown glsl type string ", t);
};

/**
 * @function setValue
 * @memberof Uniform
 * @instance
 * @param {Number|Array|Matrix|Texture} value
 */

;// CONCATENATED MODULE: ./src/corelibs/cgl/cgl_mesh.js







// import { uuid } from "../../core/utils.js";
// import { uuid } from "../../core/utils.js";

let queryExt = null;
let globalQueryStartedTime = 0;
let globalQueryStarted = null;
const MESH = {};
MESH.lastMesh = null;

/**
 * @typedef AttributeObject
 * @property {WebGLBuffer} buffer
 * @property {number} itemSize
 * @property {number} numItems
 * @property {string} name
 */

/**
 * @typedef {Object} CglMeshAttributeOptions
 * @property {boolean} [instanced]
 * @property {Function} [cb]
 * @property {Function} [type]
 */

/**
 * @typedef CglMeshOptions
 * @property {Number} [glPrimitive]
 * @property {String} [opId]
 */

/**
 * webgl renderable 3d object
 *
 * @example
 * const cgl=this._cgl
 * const mesh=new CGL.Mesh(cgl, geometry);
 *
 * function render()
 * {
 *   mesh.render(cgl.getShader());
 * }
 *
 */
class Mesh extends CgMesh
{
    #id = external_CABLES_namespaceObject.utils.uuid();
    #log = new external_CABLES_SHARED_namespaceObject.Logger("cgl_mesh");

    /** @type {CglContext} */
    #cgl = null;

    /** @type {Geometry} */
    #geom = null;

    /** @type {WebGLBuffer} */
    #bufVerticesIndizes = null;

    /** @type {number} */
    #indexType;

    /** @type {AttributeObject[]} */
    #attributes = [];
    #attribLocs = {};

    #lastShader = null;
    #numInstances = 0;
    opId = "";

    _preWireframeGeom = null;
    addVertexNumbers = false;

    feedBackAttributes = [];
    _feedBacks = [];
    _feedBacksChanged = false;
    _transformFeedBackLoc = -1;

    #lastAttrUpdate = 0;

    memFreed = false;
    queryExt = null;

    memItem = null;

    /**
     * @param {CglContext} _cgl cgl
     * @param {Geometry} __geom geometry
     * @param {CglMeshOptions} _options
     */
    constructor(_cgl, __geom, _options = {})
    {
        super();
        this.#cgl = _cgl;

        let options = _options || {};
        if (external_CABLES_namespaceObject.utils.isNumeric(options))options = { "glPrimitive": _options }; // old constructor fallback...
        this._bufVertexAttrib = null;
        this.#bufVerticesIndizes = this.#cgl.gl.createBuffer();

        this.#indexType = this.#cgl.gl.UNSIGNED_SHORT;
        this._glPrimitive = options.glPrimitive || null;

        this.memItem = new external_CABLES_namespaceObject.MemProfilerItem("mesh " + __geom.name, "mesh");
        this.opId = options.opId || "";
        this.setGeom(__geom);

        this.#cgl.profileData.addHeavyEvent("mesh constructed", this._name);
        if (!queryExt && queryExt !== false) queryExt = this.#cgl.enableExtension("EXT_disjoint_timer_query_webgl2") || false;
    }

    get geom()
    {
        return this.#geom;
    }

    get numInstances()
    {
        return this.#numInstances;
    }

    set numInstances(v)
    {
        this.setNumInstances(v);
    }

    freeMem()
    {
        this.memFreed = true;

        for (let i = 0; i < this.#attributes.length; i++)
            this.#attributes[i].floatArray = null;
    }

    /**
     * @function updateVertices
     * @memberof Mesh
     * @instance
     * @description update vertices only from a geometry
     * @param {Geometry} geom
     */
    updateVertices(geom)
    {
        this.setAttribute(CONSTANTS.SHADER.SHADERVAR_VERTEX_POSITION, geom.vertices, 3);
        this._numVerts = geom.vertices.length / 3;
    }

    /**
     * @param {String} attrName
     * @param {String} name
     * @param {Number} stride
     * @param {Number} offset
      */
    setAttributePointer(attrName, name, stride, offset)
    {
        for (let i = 0; i < this.#attributes.length; i++)
        {
            if (this.#attributes[i].name == attrName)
            {
                if (!this.#attributes[i].pointer) this.#attributes[i].pointer = [];

                this.#attributes[i].pointer.push(
                    {
                        "loc": -1,
                        "name": name,
                        "stride": stride,
                        "offset": offset,
                        "instanced": attrName == CONSTANTS.SHADER.SHADERVAR_INSTANCE_MMATRIX,
                    }
                );
            }
        }
    }

    /**
     * @param {String} name
     * @returns {AttributeObject}
     */
    getAttribute(name)
    {
        for (let i = 0; i < this.#attributes.length; i++) if (this.#attributes[i].name == name) return this.#attributes[i];
    }

    /**
     * @param {AttributeObject} attr
     * @param {Float32Array} array
     * @param {number} start
     * @param {number} end
     */
    setAttributeRange(attr, array, start, end)
    {
        if (!attr) return;
        if (!start && !end) return;

        if (!attr.name)
            this.#log.stack("no attrname?!");

        const gl = this.#cgl.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer);
        this.#cgl.profileData.profileMeshAttributes += (end - start) || 0;

        this.#cgl.profileData.profileSingleMeshAttribute[this._name] = this.#cgl.profileData.profileSingleMeshAttribute[this._name] || 0;
        this.#cgl.profileData.profileSingleMeshAttribute[this._name] += (end - start) || 0;

        if (attr.numItems < array.length / attr.itemSize)
        {
            this._resizeAttr(array, attr);
        }

        if (end > array.length)
        {
            this.warned = true;
            if (!this.warned) this.#log.warn(this.#cgl.canvas.id + "'" + attr.name + "' buffersubdata out of bounds ?", array.length, end, start, attr);
            return;
            // end = array.length - 1;
        }

        // if (glVersion == 1) gl.bufferSubData(gl.ARRAY_BUFFER, 0, array); // probably slow/ maybe create and array with only changed size ??
        // else
        // gl.bufferSubData(gl.ARRAY_BUFFER, start * 4, array, start, (end - start));
        gl.bufferSubData(gl.ARRAY_BUFFER, start * 4, array, start, (end - start));
    }

    /**
     * @param {Float32Array} array
     * @param {AttributeObject} attr
     */
    _resizeAttr(array, attr)
    {
        const gl = this.#cgl.gl;

        if (attr.buffer)
            gl.deleteBuffer(attr.buffer);

        attr.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer);
        this._bufferArray(array, attr);
        attr.numItems = array.length / attr.itemSize;// numItems;

    }

    /**
     * @param {Float32Array|number[]} array
     * @param {object} attr
     */
    _bufferArray(array, attr)
    {
        let floatArray = attr.floatArray || null;
        if (!array) return;

        if (this.#cgl.debugOneFrame)
            console.log("_bufferArray", array.length, attr.name); // eslint-disable-line

        if (!(array instanceof Float32Array))
        {
            if (attr && floatArray && floatArray.length == array.length)
            {
                floatArray.set(array);
            }
            else
            {
                floatArray = new Float32Array(array);

                if (this.#cgl.debugOneFrame)
                {
                console.log("_bufferArray create new float32array", array.length, attr.name); // eslint-disable-line
                }

                if (array.length > 10000)
                {
                    this.#cgl.profileData.profileNonTypedAttrib++;
                    this.#cgl.profileData.profileNonTypedAttribNames = "(" + this._name + ":" + attr.name + ")";
                }
            }
        }
        else floatArray = array;

        attr.arrayLength = floatArray.length;
        attr.floatArray = null;// floatArray;

        this.#cgl.gl.bufferData(this.#cgl.gl.ARRAY_BUFFER, floatArray, this.#cgl.gl.DYNAMIC_DRAW);
    }

    /**
     * update attribute
     * @param {String} name
     * @param {Array} array
     * @param {Number} itemSize
     * @param {Object} options
     */
    addAttribute(name, array, itemSize, options)
    {
        this.setAttribute(name, array, itemSize, options);
    }

    /**
     * @param {String} name
     * @param {Array|Float32Array} array
     * @param {Number} itemSize Integer
     * @param {CglMeshAttributeOptions} options
     */
    setAttribute(name, array, itemSize, options = {})
    {
        if (!array)
        {
            this.#log.error("mesh addAttribute - no array given! " + name);
            throw new Error();
        }
        let cb = null;
        let instanced = false;
        let i = 0;
        const numItems = array.length / itemSize;

        // if (Math.floor(numItems) != numItems) console.log("scheisse", name, array, itemSize);

        this.#cgl.profileData.profileMeshAttributes += numItems || 0;

        if (typeof options == "function")
        {
            cb = options;
        }

        if (typeof options == "object")
        {
            if (options.cb) cb = options.cb;
            if (options.instanced) instanced = options.instanced;
        }

        if (name == CONSTANTS.SHADER.SHADERVAR_INSTANCE_MMATRIX) instanced = true;

        for (i = 0; i < this.#attributes.length; i++)
        {
            const attr = this.#attributes[i];
            if (attr.name == name)
            {
                if (attr.numItems === numItems)
                {
                }
                else
                {
                    this._resizeAttr(array, attr);
                }

                this.#cgl.gl.bindBuffer(this.#cgl.gl.ARRAY_BUFFER, attr.buffer);
                this._bufferArray(array, attr);

                return attr;
            }
        }

        // create new buffer...

        const buffer = this.#cgl.gl.createBuffer();

        this.#cgl.gl.bindBuffer(this.#cgl.gl.ARRAY_BUFFER, buffer);
        // this._cgl.gl.bufferData(this._cgl.gl.ARRAY_BUFFER, floatArray, this._cgl.gl.DYNAMIC_DRAW);

        let type = this.#cgl.gl.FLOAT;
        if (options && options.type) type = options.type;
        const attr = {
            "buffer": buffer,
            "name": name,
            "cb": cb,
            "itemSize": itemSize,
            "numItems": numItems,
            "startItem": 0,
            "instanced": instanced,
            "type": type
        };

        this._bufferArray(array, attr);

        if (name == CONSTANTS.SHADER.SHADERVAR_VERTEX_POSITION) this._bufVertexAttrib = attr;
        this.#attributes.push(attr);
        this.#attribLocs = {};

        return attr;
    }

    getAttributes()
    {
        return this.#attributes;
    }

    /**
     * update texture coordinates only from a geometry
     * @param {Geometry} geom
     */
    updateTexCoords(geom)
    {
        if (geom.texCoords && geom.texCoords.length > 0)
        {
            this.setAttribute(CONSTANTS.SHADER.SHADERVAR_VERTEX_TEXCOORD, geom.texCoords, 2);
        }
        else
        {
            const tcBuff = new Float32Array(Math.round((geom.vertices.length / 3) * 2));
            this.setAttribute(CONSTANTS.SHADER.SHADERVAR_VERTEX_TEXCOORD, tcBuff, 2);
        }
    }

    /**
     * update normals only from a geometry
     * @param {Geometry} geom
     */
    updateNormals(geom)
    {
        if (geom.vertexNormals && geom.vertexNormals.length > 0)
        {
            this.setAttribute(CONSTANTS.SHADER.SHADERVAR_VERTEX_NORMAL, geom.vertexNormals, 3);
        }
        else
        {
            const tcBuff = new Float32Array(Math.round((geom.vertices.length)));
            this.setAttribute(CONSTANTS.SHADER.SHADERVAR_VERTEX_NORMAL, tcBuff, 3);
        }
    }

    /**
     * @param {Array} [arr]
     */
    _setVertexNumbers(arr = null)
    {
        if (!this._verticesNumbers || this._verticesNumbers.length != this._numVerts || arr)
        {
            if (arr) this._verticesNumbers = arr;
            else
            {
                this._verticesNumbers = new Float32Array(this._numVerts);
                for (let i = 0; i < this._numVerts; i++) this._verticesNumbers[i] = i;
            }

            this.setAttribute(CONSTANTS.SHADER.SHADERVAR_VERTEX_NUMBER, this._verticesNumbers, 1, (_attr, _geom, shader) =>
            {
                if (!shader.uniformNumVertices) shader.uniformNumVertices = new Uniform(shader, "f", "numVertices", this._numVerts);
                shader.uniformNumVertices.setValue(this._numVerts);
            });
        }
    }

    /**
     * update vertex indices / faces
     * @param {array} vertIndices
     */
    setVertexIndices(vertIndices)
    {
        if (!this.#bufVerticesIndizes)
        {
            this.#log.warn("no bufVerticesIndizes: " + this._name);
            return;
        }
        if (vertIndices && vertIndices.length > 0)
        {
            if (vertIndices instanceof Float32Array)
            {

                this.#log.warn("vertIndices float32Array: " + this._name, this.#geom.name, vertIndices.length, this.#geom.vertices.length);
                // console.trace("hurzz");
            }

            for (let i = 0; i < vertIndices.length; i++)
            {
                if (vertIndices[i] >= this._numVerts)
                {
                    this.#log.warn("invalid index in " + this._name, i, vertIndices[i]);
                    return;
                }
            }

            this.#cgl.gl.bindBuffer(this.#cgl.gl.ELEMENT_ARRAY_BUFFER, this.#bufVerticesIndizes);

            /*
             * todo cache this ?
             * if(!this.vertIndicesTyped || this.vertIndicesTyped.length!=this._geom.verticesIndices.length)
             */

            if (vertIndices.length > 65535)
            {
                this.vertIndicesTyped = new Uint32Array(vertIndices);
                this.#indexType = this.#cgl.gl.UNSIGNED_INT;
            }
            else
            if (vertIndices instanceof Uint32Array)
            {
                this.vertIndicesTyped = vertIndices;
                this.#indexType = this.#cgl.gl.UNSIGNED_INT;
            }
            else
            if (!(vertIndices instanceof Uint16Array))
            {
                this.vertIndicesTyped = new Uint16Array(vertIndices);
                this.#indexType = this.#cgl.gl.UNSIGNED_SHORT;
            }
            else this.vertIndicesTyped = vertIndices;

            this.#cgl.gl.bufferData(this.#cgl.gl.ELEMENT_ARRAY_BUFFER, this.vertIndicesTyped, this.#cgl.gl.DYNAMIC_DRAW);
            this.#bufVerticesIndizes.itemSize = 1;
            this.#bufVerticesIndizes.numItems = vertIndices.length;
        }
        else this.#bufVerticesIndizes.numItems = 0;
    }

    /**
     * @function setGeom
     * @memberof Mesh
     * @instance
     * @description set geometry for mesh
     * @param {Geometry} geom
     * @param {boolean} removeRef
     */
    setGeom(geom, removeRef = false)
    {
        this.memItem.setSizeGpu(geom.updateMemoryUsage());
        this.#geom = geom;
        if (geom.glPrimitive != null) this._glPrimitive = geom.glPrimitive;
        if (this.#geom && this.#geom.name) this._name = "mesh " + this.#geom.name;

        MESH.lastMesh = null;

        this.#cgl.profileData.count("meshSetGeom");
        const measure = this.#cgl.profileData.start("meshSetGeom");

        this._disposeAttributes();

        this.updateVertices(this.#geom);
        this.setVertexIndices(this.#geom.verticesIndices);

        if (this.addVertexNumbers)
        {
            this._setVertexNumbers();
            // console.log("add vertexnumbers", this);
        }

        const geomAttribs = this.#geom.getAttributes();

        const attribAssoc = {
            "texCoords": CONSTANTS.SHADER.SHADERVAR_VERTEX_TEXCOORD,
            "vertexNormals": CONSTANTS.SHADER.SHADERVAR_VERTEX_NORMAL,
            "vertexColors": CONSTANTS.SHADER.SHADERVAR_VERTEX_COLOR,
            "tangents": "attrTangent",
            "biTangents": "attrBiTangent",
        };

        for (const index in geomAttribs)
            if (geomAttribs[index].data && geomAttribs[index].data.length)
                this.setAttribute(attribAssoc[index] || index, geomAttribs[index].data, geomAttribs[index].itemSize);

        if (removeRef) this.#geom = null;
        measure.finish();
    }

    _preBind(shader)
    {
        for (let i = 0; i < this.#attributes.length; i++)
            if (this.#attributes[i].cb)
                this.#attributes[i].cb(this.#attributes[i], this.#geom, shader);
    }

    _checkAttrLengths()
    {
        if (this.memFreed) return;
        // check length
        for (let i = 0; i < this.#attributes.length; i++)
        {
            if (this.#attributes[i].arrayLength / this.#attributes[i].itemSize < this.#attributes[0].arrayLength / this.#attributes[0].itemSize)
            {
                let name = "unknown";
                if (this.#geom)name = this.#geom.name;

            /*
             * this._log.warn(
             *     name + ": " + this._attributes[i].name +
             *     " wrong attr length. is:", this._attributes[i].arrayLength / this._attributes[i].itemSize,
             *     " should be:", this._attributes[0].arrayLength / this._attributes[0].itemSize,
             * );
             */
            }
        }
    }

    _bind(shader)
    {
        if (!shader) return;
        if (!shader.isValid()) return;

        let attrLocs = [];
        if (this.#attribLocs[shader.id]) attrLocs = this.#attribLocs[shader.id];
        else this.#attribLocs[shader.id] = attrLocs;

        this.#lastShader = shader;
        if (shader.lastCompile > this.#lastAttrUpdate || attrLocs.length != this.#attributes.length)
        {
            this.#lastAttrUpdate = shader.lastCompile;
            for (let i = 0; i < this.#attributes.length; i++) attrLocs[i] = -1;
        }

        for (let i = 0; i < this.#attributes.length; i++)
        {
            const attribute = this.#attributes[i];
            if (attrLocs[i] == -1)
            {
                if (attribute._attrLocationLastShaderTime != shader.lastCompile)
                {
                    attribute._attrLocationLastShaderTime = shader.lastCompile;
                    attrLocs[i] = this.#cgl.glGetAttribLocation(shader.getProgram(), attribute.name);
                    // this._log.log('attribloc',attribute.name,attrLocs[i]);
                    this.#cgl.profileData.profileAttrLoc++;
                }
            }

            if (attrLocs[i] != -1)
            {
                this.#cgl.gl.enableVertexAttribArray(attrLocs[i]);
                this.#cgl.gl.bindBuffer(this.#cgl.gl.ARRAY_BUFFER, attribute.buffer);

                if (attribute.instanced)
                {
                // todo: easier way to fill mat4 attribs...
                    if (attribute.itemSize <= 4)
                    {
                        if (!attribute.itemSize || attribute.itemSize == 0) this.#log.warn("instanced attrib itemsize error", this.#geom.name, attribute);

                        this.#cgl.gl.vertexAttribPointer(attrLocs[i], attribute.itemSize, attribute.type, false, attribute.itemSize * 4, 0);
                        this.#cgl.gl.vertexAttribDivisor(attrLocs[i], 1);
                    }
                    else if (attribute.itemSize == 16)
                    {
                        const stride = 16 * 4;

                        this.#cgl.gl.vertexAttribPointer(attrLocs[i], 4, attribute.type, false, stride, 0);
                        this.#cgl.gl.enableVertexAttribArray(attrLocs[i] + 1);
                        this.#cgl.gl.vertexAttribPointer(attrLocs[i] + 1, 4, attribute.type, false, stride, 4 * 4 * 1);
                        this.#cgl.gl.enableVertexAttribArray(attrLocs[i] + 2);
                        this.#cgl.gl.vertexAttribPointer(attrLocs[i] + 2, 4, attribute.type, false, stride, 4 * 4 * 2);
                        this.#cgl.gl.enableVertexAttribArray(attrLocs[i] + 3);
                        this.#cgl.gl.vertexAttribPointer(attrLocs[i] + 3, 4, attribute.type, false, stride, 4 * 4 * 3);

                        this.#cgl.gl.vertexAttribDivisor(attrLocs[i], 1);
                        this.#cgl.gl.vertexAttribDivisor(attrLocs[i] + 1, 1);
                        this.#cgl.gl.vertexAttribDivisor(attrLocs[i] + 2, 1);
                        this.#cgl.gl.vertexAttribDivisor(attrLocs[i] + 3, 1);
                    }
                    else
                    {
                        this.#log.warn("unknown instance attrib size", attribute.name);
                    }
                }
                else
                {
                    if (!attribute.itemSize || attribute.itemSize == 0) this.#log.warn("attrib itemsize error", this._name, attribute);
                    this.#cgl.gl.vertexAttribPointer(attrLocs[i], attribute.itemSize, attribute.type, false, attribute.itemSize * 4, 0);

                    if (attribute.pointer)
                    {
                        for (let ip = 0; ip < attribute.pointer.length; ip++)
                        {
                            const pointer = attribute.pointer[ip];

                            if (pointer.loc == -1)
                            {

                                pointer.loc = this.#cgl.glGetAttribLocation(shader.getProgram(), pointer.name);
                            }

                            if (pointer.loc > -1)
                            {
                                this.#cgl.profileData.profileAttrLoc++;

                                this.#cgl.gl.enableVertexAttribArray(pointer.loc);
                                this.#cgl.gl.vertexAttribPointer(pointer.loc, attribute.itemSize, attribute.type, false, pointer.stride, pointer.offset);

                            }
                        }
                    }
                    if (this.bindFeedback) this.bindFeedback(attribute);
                }
            }
        }

        if (this.#bufVerticesIndizes && this.#bufVerticesIndizes.numItems !== 0) this.#cgl.gl.bindBuffer(this.#cgl.gl.ELEMENT_ARRAY_BUFFER, this.#bufVerticesIndizes);
    }

    unBind()
    {
        const shader = this.#lastShader;
        this.#lastShader = null;
        if (!shader) return;

        let attrLocs = [];
        if (this.#attribLocs[shader.id]) attrLocs = this.#attribLocs[shader.id];
        else this.#attribLocs[shader.id] = attrLocs;

        MESH.lastMesh = null;

        for (let i = 0; i < this.#attributes.length; i++)
        {
            if (this.#attributes[i].instanced)
            {
            // todo: easier way to fill mat4 attribs...
                if (this.#attributes[i].itemSize <= 4)
                {
                    if (attrLocs[i] != -1) this.#cgl.gl.vertexAttribDivisor(attrLocs[i], 0);
                    if (attrLocs[i] >= 0) this.#cgl.gl.disableVertexAttribArray(attrLocs[i]);
                }
                else
                {
                    this.#cgl.gl.vertexAttribDivisor(attrLocs[i], 0);
                    this.#cgl.gl.vertexAttribDivisor(attrLocs[i] + 1, 0);
                    this.#cgl.gl.vertexAttribDivisor(attrLocs[i] + 2, 0);
                    this.#cgl.gl.vertexAttribDivisor(attrLocs[i] + 3, 0);
                    this.#cgl.gl.disableVertexAttribArray(attrLocs[i] + 1);
                    this.#cgl.gl.disableVertexAttribArray(attrLocs[i] + 2);
                    this.#cgl.gl.disableVertexAttribArray(attrLocs[i] + 3);
                }
            }

            if (attrLocs[i] != -1) this.#cgl.gl.disableVertexAttribArray(attrLocs[i]);

        }
    }

    meshChanged()
    {
        return this.#cgl.lastMesh && this.#cgl.lastMesh != this;
    }

    printDebug()
    {
        console.log("--attributes");
        for (let i = 0; i < this.#attributes.length; i++)
        {
            console.log("attribute " + i + " " + this.#attributes[i].name);
        }
    }

    /**
     * @param {Number} num
     */
    setNumVertices(num)
    {
        // this._bufVerticesIndizes.numItems = num;
        this._bufVertexAttrib.numItems = num;
    }

    /**
     * @returns {Number}
     */
    getNumVertices()
    {
        return this._bufVertexAttrib.numItems;
    }

    /**
     * @param {Number} num
     */
    setNumIndices(num)
    {
        this.#bufVerticesIndizes.numItems = num;
    }

    /**
     * @returns {Number}
     */
    getNumIndices()
    {
        return this.#bufVerticesIndizes.numItems;
    }

    /**
     * draw mesh to screen
     * @param {Shader} shader
     */
    render(shader)
    {
        // TODO: enable/disablevertex only if the mesh has changed... think drawing 10000x the same mesh

        if (this.#cgl.aborted) return;
        shader = shader || this.#cgl.getShader();

        if (!shader)
        {
            for (let i = 0; i < this.#cgl._shaderStack.length; i++)
            {
                console.log(i + " " + this.#cgl._shaderStack[i].getName());

            }
            return console.log("shader not valid");
        }

        if (!shader.isValid())
        {
            shader = this.#cgl.getErrorShader();
        }

        this._checkAttrLengths();

        if (this.#geom)
        {
            if (this._preWireframeGeom && !shader.wireframe && !this.#geom.isIndexed())
            {
                this.setGeom(this._preWireframeGeom);
                this._preWireframeGeom = null;
            }

            if (shader.wireframe)
            {
                let changed = false;

                if (this.#geom.isIndexed())
                {
                    if (!this._preWireframeGeom)
                    {
                        this._preWireframeGeom = this.#geom;
                        this.#geom = this.#geom.copy();
                    }

                    this.#geom.unIndex();
                    changed = true;
                }

                if (!this.#geom.getAttribute("attrBarycentric"))
                {
                    if (!this._preWireframeGeom)
                    {
                        this._preWireframeGeom = this.#geom;
                        this.#geom = this.#geom.copy();
                    }
                    changed = true;

                    this.#geom.calcBarycentric();
                }
                if (changed) this.setGeom(this.#geom);
            }
        }

        let needsBind = false;
        if (MESH.lastMesh != this)
        {
            if (MESH.lastMesh) MESH.lastMesh.unBind();
            needsBind = true;
        }

        if (needsBind) this._preBind(shader);

        if (!shader.bind()) return;

        this._bind(shader);
        if (this.addVertexNumbers) this._setVertexNumbers();

        MESH.lastMesh = this;

        let prim = this.#cgl.gl.TRIANGLES;
        if (this._glPrimitive !== null) prim = this._glPrimitive;
        if (shader.glPrimitive !== null) prim = shader.glPrimitive;

        let elementDiv = 1;
        let queryStarted = false;

        /* minimalcore:start */
        const doQuery = this.#cgl.profileData.doProfileGlQuery;
        if (doQuery && queryExt)
        {
            let name = this._name + " - " + shader.getName() + " #" + shader.id;
            // if (this.#numInstances) id += " instanced " + this.#numInstances + "x";

            // let this.queryProfilerData = this.#cgl.profileData.glQueryData[id];

            if (globalQueryStartedTime != 0 && performance.now() - globalQueryStartedTime > 1000) globalQueryStarted = false;

            if (!this.queryProfilerData) this.queryProfilerData = { "num": 0 };

            this.queryProfilerData.name = name;
            if (shader.opId) this.queryProfilerData.shaderOp = shader.opId;
            if (this.opId) this.queryProfilerData.meshOp = this.opId;

            this.#cgl.profileData.glQueryData[this.#id] = this.queryProfilerData;

            if (queryExt)
            {

                if (!this.queryProfilerData.queryStarted && !globalQueryStarted)
                {
                    this.queryProfilerData._drawQuery = this.#cgl.gl.createQuery();
                    this.#cgl.gl.beginQuery(queryExt.TIME_ELAPSED_EXT, this.queryProfilerData._drawQuery);

                    globalQueryStarted = this.queryProfilerData;
                    globalQueryStartedTime = performance.now();

                    this.queryProfilerData.queryStarted = true;
                    queryStarted = true;
                    this.queryProfilerData.startedTime = performance.now();
                    this.queryProfilerData.frameNum = this.#cgl.patch.getFrameNum();
                }
            }
        }

        /* minimalcore:end */

        if (this.hasFeedbacks && this.hasFeedbacks()) this.drawFeedbacks(shader, prim);
        else if (!this.#bufVerticesIndizes || this.#bufVerticesIndizes.numItems === 0)
        {

            /*
             * for (let i = 0; i < this._attributes.length; i++)
             * {
             *     if (this._attributes[i].arrayLength / this._attributes[i].itemSize != this._bufVertexAttrib.floatArray.length / 3)
             *     {
             *         this._log.warn("attrib buffer length wrong! ", this._attributes[i].name, this._attributes[i].arrayLength / this._attributes[i].itemSize, this._bufVertexAttrib.floatArray.length / 3, this._attributes[i].itemSize);
             *         // this._log.log(this);
             *         // debugger;
             *         return;
             *     }
             * }
             */

            if (prim == this.#cgl.gl.TRIANGLES)elementDiv = 3;

            if (this.#numInstances === 0) this.#cgl.gl.drawArrays(prim, this._bufVertexAttrib.startItem, this._bufVertexAttrib.numItems - this._bufVertexAttrib.startItem);
            else this.#cgl.gl.drawArraysInstanced(prim, this._bufVertexAttrib.startItem, this._bufVertexAttrib.numItems, this.#numInstances);
        }
        else
        {
            if (prim == this.#cgl.gl.TRIANGLES)elementDiv = 3;
            if (this.#numInstances === 0)
            {
                // console.log("text", this.#bufVerticesIndizes.numItems, this.geom.vertices.length);

                this.#cgl.gl.drawElements(prim, this.#bufVerticesIndizes.numItems, this.#indexType, 0);

                // if (this.#cgl.gl.getError())
                // {
                //     console.log("  or", this._verticesNumbers, this.addVertexNumbers, this._attributes);
                // }
            }
            else
            {
                this.#cgl.gl.drawElementsInstanced(prim, this.#bufVerticesIndizes.numItems, this.#indexType, 0, this.#numInstances);
            }
        }

        if (doQuery)
        {
            if (queryStarted)
            {
                this.#cgl.gl.endQuery(queryExt.TIME_ELAPSED_EXT);
                this.#cgl.gl.flush();
                queryStarted = false;
            }
            if (this.queryProfilerData && this.queryProfilerData._drawQuery && this.#cgl.patch.getFrameNum() > this.queryProfilerData.frameNum + 1)
            {
                const available = this.#cgl.gl.getQueryParameter(this.queryProfilerData._drawQuery, this.#cgl.gl.QUERY_RESULT_AVAILABLE);
                const disjoint = this.#cgl.gl.getParameter(queryExt.GPU_DISJOINT_EXT);
                if (disjoint)console.log("disjoint");

                if (available)
                {
                    if (!disjoint)
                    {
                        const elapsedNanos = this.#cgl.gl.getQueryParameter(this.queryProfilerData._drawQuery, this.#cgl.gl.QUERY_RESULT);
                        const currentTimeGPU = elapsedNanos / 1000000;

                        this.queryProfilerData._times = this.queryProfilerData._times || 0;
                        this.queryProfilerData._times = currentTimeGPU;
                        this.queryProfilerData._numcount = 1;
                    }

                    this.queryProfilerData.lastTime = performance.now();
                    this.queryProfilerData._drawQuery = null;
                    this.queryProfilerData.queryStarted = false;
                    globalQueryStarted = false;
                }
            }
        }

        if (this.#cgl.debugOneFrame)
        {
            if (this.#cgl.gl.getError() != this.#cgl.gl.NO_ERROR)
            {
                this.#log.error("mesh draw gl error");
                this.#log.error("mesh", this);
                this.#log.error("shader", shader);

                const attribNames = [];
                for (let i = 0; i < this.#cgl.gl.getProgramParameter(shader.getProgram(), this.#cgl.gl.ACTIVE_ATTRIBUTES); i++)
                {
                    const name = this.#cgl.gl.getActiveAttrib(shader.getProgram(), i).name;
                    this.#log.error("attrib ", name);
                }
            }
        }

        /* minimalcore:start */
        this.#cgl.profileData.count("glprimitives", (this._bufVertexAttrib.numItems / elementDiv) * (this.#numInstances || 1));
        this.#cgl.profileData.count("meshDrawCalls");
        if (this.#cgl.profileData.profileDrawCalls)
        {
            this.#cgl.profileData.profileDrawCalls.push({
                "name": this._name,
                "shader": shader.name,
                "verts": (this._bufVertexAttrib.numItems) * (this.#numInstances || 1),
                "instances": this.#numInstances,
                "opId": this.opId,
            });
        }

        /* minimalcore:end */
        this.#cgl.printError("mesh render " + this._name);

        this.unBind();
    }

    /**
     * @param {number} n
     */
    setNumInstances(n)
    {
        n = Math.max(0, n);
        if (this.#numInstances != n)
        {
            this.#numInstances = n;
            const indexArr = new Float32Array(n);
            for (let i = 0; i < n; i++) indexArr[i] = i;
            this.setAttribute(CONSTANTS.SHADER.SHADERVAR_INSTANCE_INDEX, indexArr, 1, { "instanced": true });
        }
    }

    _disposeAttributes()
    {
        if (!this.#attributes) return;

        // window.requestIdleCallback(() =>
        // {

        for (let i = 0; i < this.#attributes.length; i++)
        {
            if (this.#attributes[i].buffer)
            {
                this.#cgl.gl.deleteBuffer(this.#attributes[i].buffer);
                this.#attributes[i].buffer = null;
            }
        }
        this.#attributes.length = 0;

        // });
    }

    disposeGeom()
    {
        this.#geom = null;
    }

    dispose()
    {
        // window.requestIdleCallback(() =>
        // {
        if (this.#cgl.aborted) return;
        // const measure = this.#cgl.profileData.start("mesh dispose " + this._name);
        if (this._bufVertexAttrib && this._bufVertexAttrib.buffer) this.#cgl.gl.deleteBuffer(this._bufVertexAttrib.buffer);
        if (this.#bufVerticesIndizes) this.#cgl.gl.deleteBuffer(this.#bufVerticesIndizes);
        this.#bufVerticesIndizes = null;

        this._disposeAttributes();
        // measure.finish();
        // });
        return null;
    }
}



;// CONCATENATED MODULE: ./src/corelibs/cgl/cgl_simplerect.js



const MESHES = {};

MESHES.getSimpleRect = function (cgl, name, size = 1.0)
{
    const geom = new Geometry(name);

    geom.vertices = [1.0 * size, 1.0 * size, 0.0, -1.0 * size, 1.0 * size, 0.0, 1.0 * size, -1.0 * size, 0.0, -1.0 * size, -1.0 * size, 0.0];
    geom.texCoords = [1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0];
    geom.verticesIndices = [0, 1, 2, 2, 1, 3];
    geom.vertexNormals = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];

    return cgl.createMesh(geom);
};

MESHES.getSimpleCube = function (cgl, name)
{
    const geom = new Geometry(name);
    geom.vertices = [-1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1, 1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1];
    geom.setTexCoords([0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0,]);
    geom.verticesIndices = [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23];
    geom.vertexNormals = new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0]);
    geom.tangents = new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);
    geom.biTangents = new Float32Array([-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1]);

    return new Mesh(cgl, geom);
};



;// CONCATENATED MODULE: ./src/corelibs/cgl/cgl_textureeffect.js





class TextureEffect
{
    #cgl = null;
    _textureSource = null;
    switched = false;
    depth = false;
    imgCompVer = 0;
    aspectRatio = 1;
    _textureTarget = null;

    /**
     * @param {CglContext} cgl
     * @param {object} options
     */
    constructor(cgl, options)
    {
        this.#cgl = cgl;
        this._log = new external_CABLES_SHARED_namespaceObject.Logger("cgl_TextureEffect");

        if (!cgl.TextureEffectMesh) this.createMesh();

        this._options = options;
        this.name = options.name || "unknown";

        this._frameBuf = this.#cgl.gl.createFramebuffer();
        this._frameBuf2 = this.#cgl.gl.createFramebuffer();
        this._renderbuffer = this.#cgl.gl.createRenderbuffer();
        this._renderbuffer2 = this.#cgl.gl.createRenderbuffer();
    }

    dispose()
    {
        if (this._renderbuffer) this.#cgl.gl.deleteRenderbuffer(this._renderbuffer);
        if (this._frameBuf) this.#cgl.gl.deleteFramebuffer(this._frameBuf);
        if (this._renderbuffer2) this.#cgl.gl.deleteRenderbuffer(this._renderbuffer2);
        if (this._frameBuf2) this.#cgl.gl.deleteFramebuffer(this._frameBuf2);
    }

    getWidth()
    {
        return this._textureSource.width;
    }

    getHeight()
    {
        return this._textureSource.height;
    }

    /**
     * @param {Texture} tex
     */
    setSourceTexture(tex)
    {
        if (tex === null)
        {
            this._textureSource = new Texture(this.#cgl);
            this._textureSource.setSize(16, 16);
        }
        else
        {
            this._textureSource = tex;
        }

        if (!this._textureSource.compareSettings(this._textureTarget))
        {
            if (this._textureTarget) this._textureTarget.delete();

            this._textureTarget = this._textureSource.clone();

            this.#cgl.profileData.count("effectBuffercreate");

            this.#cgl.gl.bindFramebuffer(this.#cgl.gl.FRAMEBUFFER, this._frameBuf);

            this.#cgl.gl.bindRenderbuffer(this.#cgl.gl.RENDERBUFFER, this._renderbuffer);

            // if(tex.textureType==CGL.Texture.TYPE_FLOAT) this._cgl.gl.renderbufferStorage(this._cgl.gl.RENDERBUFFER,this._cgl.gl.RGBA32F, this._textureSource.width,this._textureSource.height);
            // else this._cgl.gl.renderbufferStorage(this._cgl.gl.RENDERBUFFER,this._cgl.gl.RGBA8, this._textureSource.width,this._textureSource.height);

            if (this.depth) this.#cgl.gl.renderbufferStorage(this.#cgl.gl.RENDERBUFFER, this.#cgl.gl.DEPTH_COMPONENT16, this._textureSource.width, this._textureSource.height);
            this.#cgl.gl.framebufferTexture2D(this.#cgl.gl.FRAMEBUFFER, this.#cgl.gl.COLOR_ATTACHMENT0, this.#cgl.gl.TEXTURE_2D, this._textureTarget.tex, 0);
            if (this.depth) this.#cgl.gl.framebufferRenderbuffer(this.#cgl.gl.FRAMEBUFFER, this.#cgl.gl.DEPTH_ATTACHMENT, this.#cgl.gl.RENDERBUFFER, this._renderbuffer);

            // this._cgl.gl.framebufferTexture2D(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.COLOR_ATTACHMENT0, this._cgl.gl.TEXTURE_2D, this._textureTarget.tex, 0);

            this.#cgl.gl.bindTexture(this.#cgl.gl.TEXTURE_2D, null);
            this.#cgl.gl.bindRenderbuffer(this.#cgl.gl.RENDERBUFFER, null);
            this.#cgl.gl.bindFramebuffer(this.#cgl.gl.FRAMEBUFFER, null);

            this.#cgl.gl.bindFramebuffer(this.#cgl.gl.FRAMEBUFFER, this._frameBuf2);

            this.#cgl.gl.bindRenderbuffer(this.#cgl.gl.RENDERBUFFER, this._renderbuffer2);

            // if(tex.textureType==CGL.Texture.TYPE_FLOAT) this._cgl.gl.renderbufferStorage(this._cgl.gl.RENDERBUFFER,this._cgl.gl.RGBA32F, this._textureSource.width,this._textureSource.height);
            // else this._cgl.gl.renderbufferStorage(this._cgl.gl.RENDERBUFFER,this._cgl.gl.RGBA8, this._textureSource.width,this._textureSource.height);

            if (this.depth) this.#cgl.gl.renderbufferStorage(this.#cgl.gl.RENDERBUFFER, this.#cgl.gl.DEPTH_COMPONENT16, this._textureSource.width, this._textureSource.height);
            this.#cgl.gl.framebufferTexture2D(this.#cgl.gl.FRAMEBUFFER, this.#cgl.gl.COLOR_ATTACHMENT0, this.#cgl.gl.TEXTURE_2D, this._textureSource.tex, 0);

            if (this.depth) this.#cgl.gl.framebufferRenderbuffer(this.#cgl.gl.FRAMEBUFFER, this.#cgl.gl.DEPTH_ATTACHMENT, this.#cgl.gl.RENDERBUFFER, this._renderbuffer2);

            // this._cgl.gl.framebufferTexture2D(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.COLOR_ATTACHMENT0, this._cgl.gl.TEXTURE_2D, this._textureSource.tex, 0);

            this.#cgl.gl.bindTexture(this.#cgl.gl.TEXTURE_2D, null);
            this.#cgl.gl.bindRenderbuffer(this.#cgl.gl.RENDERBUFFER, null);
            this.#cgl.gl.bindFramebuffer(this.#cgl.gl.FRAMEBUFFER, null);
        }

        this.aspectRatio = this._textureSource.width / this._textureSource.height;
    }

    continueEffect()
    {
        this.#cgl.pushDepthTest(false);
        this.#cgl.pushModelMatrix();
        this.#cgl.pushPMatrix();
        // todo why two pushs?

        this.#cgl.pushViewPort(0, 0, this.getCurrentTargetTexture().width, this.getCurrentTargetTexture().height);

        mat4.perspective(this.#cgl.pMatrix, 45, this.getCurrentTargetTexture().width / this.getCurrentTargetTexture().height, 0.1, 1100.0); // todo: why?

        this.#cgl.pushPMatrix();
        mat4.identity(this.#cgl.pMatrix);

        this.#cgl.pushViewMatrix();
        mat4.identity(this.#cgl.vMatrix);

        this.#cgl.pushModelMatrix();
        mat4.identity(this.#cgl.mMatrix);
    }

    startEffect(bgTex)
    {
        if (!this._textureTarget)
        {
            this._log.warn("effect has no target");
            return;
        }

        this.switched = false;

        this.continueEffect();

        if (bgTex)
        {
            this._bgTex = bgTex;
        }
        this._countEffects = 0;
    }

    endEffect()
    {
        this.#cgl.popDepthTest();
        this.#cgl.popModelMatrix();

        this.#cgl.popPMatrix();
        this.#cgl.popModelMatrix();
        this.#cgl.popViewMatrix();

        this.#cgl.popPMatrix();
        this.#cgl.popViewPort();
    }

    bind()
    {
        if (this._textureSource === null)
        {
            this._log.warn("no base texture set!");
            return;
        }

        if (!this.switched)
        {
            this.#cgl.gl.bindFramebuffer(this.#cgl.gl.FRAMEBUFFER, this._frameBuf);
            this.#cgl.pushGlFrameBuffer(this._frameBuf);
        }
        else
        {
            this.#cgl.gl.bindFramebuffer(this.#cgl.gl.FRAMEBUFFER, this._frameBuf2);
            this.#cgl.pushGlFrameBuffer(this._frameBuf2);
        }
    }

    finish()
    {
        if (this._textureSource === null)
        {
            this._log.warn("no base texture set!");
            return;
        }

        this.#cgl.TextureEffectMesh.render(this.#cgl.getShader());

        this.#cgl.gl.bindFramebuffer(this.#cgl.gl.FRAMEBUFFER, this.#cgl.popGlFrameBuffer());

        this.#cgl.profileData.count("textureEffect");

        if (this._textureTarget.filter == Texture.FILTER_MIPMAP)
        {
            if (!this.switched)
            {
                this.#cgl.gl.bindTexture(this.#cgl.gl.TEXTURE_2D, this._textureTarget.tex);
                this._textureTarget.updateMipMap();
            }
            else
            {
                this.#cgl.gl.bindTexture(this.#cgl.gl.TEXTURE_2D, this._textureSource.tex);
                this._textureSource.updateMipMap();
            }

            this.#cgl.gl.bindTexture(this.#cgl.gl.TEXTURE_2D, null);
        }

        this.switched = !this.switched;
        this._countEffects++;
    }

    getCurrentTargetTexture()
    {
        if (this.switched) return this._textureSource;
        return this._textureTarget;
    }

    getCurrentSourceTexture()
    {
        if (this._countEffects == 0 && this._bgTex) return this._bgTex;

        if (this.switched) return this._textureTarget;
        return this._textureSource;
    }

    delete()
    {
        if (this._textureTarget) this._textureTarget.delete();
        if (this._textureSource) this._textureSource.delete();
        this.#cgl.gl.deleteRenderbuffer(this._renderbuffer);
        this.#cgl.gl.deleteFramebuffer(this._frameBuf);
    }

    createMesh()
    {
        this.#cgl.TextureEffectMesh = MESHES.getSimpleRect(this.#cgl, "texEffectRect");
    }

    // ---------------------------------------------------------------------------------
}

TextureEffect.checkOpNotInTextureEffect = function (op)
{
    if (!op.patch.cgl) return true;
    if (op.uiAttribs.error && !op.patch.cgl.currentTextureEffect)
    {
        op.setUiError("textureeffect", null);
        return true;
    }
    if (!op.patch.cgl.currentTextureEffect) return true;

    if (op.patch.cgl.currentTextureEffect && !op.uiAttribs.error)
    {
        op.setUiError("textureeffect", "This op can not be a child of a ImageCompose/texture effect! imagecompose should only have textureeffect childs.", 0);
        return false;
    }

    if (op.patch.cgl.currentTextureEffect) return false;
    return true;
};

TextureEffect.checkOpInEffect = function (op, minver)
{
    minver = minver || 0;

    if (op.patch.cgl.currentTextureEffect)
    {
        if (op.uiAttribs.uierrors && op.patch.cgl.currentTextureEffect.imgCompVer >= minver)
        {
            op.setUiError("texeffect", null);
            return true;
        }

        if (minver && op.patch.cgl.currentTextureEffect.imgCompVer < minver)
        {
            op.setUiError("texeffect", "This op must be a child of an ImageCompose op with version >=" + minver + " <span class=\"button-small\" onclick=\"gui.patchView.downGradeOp('" + op.id + "','" + op.name + "')\">Downgrade</span> to previous version", 1);
        }
    }

    if (op.patch.cgl.currentTextureEffect) return true;

    if (!op.patch.cgl.currentTextureEffect && (!op.uiAttribs.uierrors || op.uiAttribs.uierrors.length == 0))
    {
        op.setUiError("texeffect", "This op must be a child of an ImageCompose op! More infos <a href=\"https://cables.gl/docs/image_composition/image_composition.html\" target=\"_blank\">here</a>. ", 1);
        return false;
    }

    if (!op.patch.cgl.currentTextureEffect) return false;
    return true;
};

TextureEffect.getBlendCode = function (ver)
{
    let src = "".endl()
        + "vec3 _blend(vec3 base,vec3 blend)".endl()
        + "{".endl()
        + "   vec3 colNew=blend;".endl()
        + "   #ifdef BM_MULTIPLY".endl()
        + "       colNew=base*blend;".endl()
        + "   #endif".endl()
        + "   #ifdef BM_MULTIPLY_INV".endl()
        + "       colNew=base* vec3(1.0)-blend;".endl()
        + "   #endif".endl()
        + "   #ifdef BM_AVERAGE".endl()
        + "       colNew=((base + blend) / 2.0);".endl()
        + "   #endif".endl()
        + "   #ifdef BM_ADD".endl()
        + "       colNew=min(base + blend, vec3(1.0));".endl()
        + "   #endif".endl()
        + "   #ifdef BM_SUBTRACT_ONE".endl()
        + "       colNew=max(base + blend - vec3(1.0), vec3(0.0));".endl()
        + "   #endif".endl()

        + "   #ifdef BM_SUBTRACT".endl()
        + "       colNew=base - blend;".endl()
        + "   #endif".endl()

        + "   #ifdef BM_DIFFERENCE".endl()
        + "       colNew=abs(base - blend);".endl()
        + "   #endif".endl()
        + "   #ifdef BM_NEGATION".endl()
        + "       colNew=(vec3(1.0) - abs(vec3(1.0) - base - blend));".endl()
        + "   #endif".endl()
        + "   #ifdef BM_EXCLUSION".endl()
        + "       colNew=(base + blend - 2.0 * base * blend);".endl()
        + "   #endif".endl()
        + "   #ifdef BM_LIGHTEN".endl()
        + "       colNew=max(blend, base);".endl()
        + "   #endif".endl()
        + "   #ifdef BM_DARKEN".endl()
        + "       colNew=min(blend, base);".endl()
        + "   #endif".endl()
        + "   #ifdef BM_OVERLAY".endl()
        + "      #define BlendOverlayf(base, blend)  (base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend)))"
            // .endl()+'       #define BlendOverlay(base, blend)       Blend(base, blend, BlendOverlayf)'
            //    .endl()+'      colNew=Blend(base, blend, BlendOverlayf);'
            .endl()
        + "      colNew=vec3(BlendOverlayf(base.r, blend.r),BlendOverlayf(base.g, blend.g),BlendOverlayf(base.b, blend.b));".endl()
        + "   #endif".endl()
        + "   #ifdef BM_SCREEN".endl()
        + "      #define BlendScreenf(base, blend)       (1.0 - ((1.0 - base) * (1.0 - blend)))"
            // .endl()+'       #define BlendScreen(base, blend)        Blend(base, blend, BlendScreenf)'
            // .endl()+'      colNew=Blend(base, blend, BlendScreenf);'
            .endl()
        + "      colNew=vec3(BlendScreenf(base.r, blend.r),BlendScreenf(base.g, blend.g),BlendScreenf(base.b, blend.b));".endl()
        + "   #endif".endl()
        + "   #ifdef BM_SOFTLIGHT".endl()
        + "      #define BlendSoftLightf(base, blend)    ((blend < 0.5) ? (2.0 * base * blend + base * base * (1.0 - 2.0 * blend)) : (sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend)))"
            // .endl()+'       #define BlendSoftLight(base, blend)     Blend(base, blend, BlendSoftLightf)'
            //    .endl()+'      colNew=Blend(base, blend, BlendSoftLightf);'
            .endl()
        + "      colNew=vec3(BlendSoftLightf(base.r, blend.r),BlendSoftLightf(base.g, blend.g),BlendSoftLightf(base.b, blend.b));".endl()
        + "   #endif".endl()
        + "   #ifdef BM_HARDLIGHT".endl()
        + "      #define BlendOverlayf(base, blend)  (base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend)))"
            // .endl()+'       #define BlendOverlay(base, blend)       Blend(base, blend, BlendOverlayf)'
            // .endl()+'      colNew=Blend(blend, base, BlendOverlayf);'
            .endl()
        + "      colNew=vec3(BlendOverlayf(base.r, blend.r),BlendOverlayf(base.g, blend.g),BlendOverlayf(base.b, blend.b));".endl()
        + "   #endif".endl()
        + "   #ifdef BM_COLORDODGE".endl()
        + "      #define BlendColorDodgef(base, blend)   ((blend == 1.0) ? blend : min(base / (1.0 - blend), 1.0))"
            // .endl()+'      colNew=Blend(base, blend, BlendColorDodgef);'
            .endl()
        + "      colNew=vec3(BlendColorDodgef(base.r, blend.r),BlendColorDodgef(base.g, blend.g),BlendColorDodgef(base.b, blend.b));".endl()
        + "   #endif".endl()
        + "   #ifdef BM_COLORBURN".endl()
        + "      #define BlendColorBurnf(base, blend)    ((blend == 0.0) ? blend : max((1.0 - ((1.0 - base) / blend)), 0.0))"
            // .endl()+'      colNew=Blend(base, blend, BlendColorBurnf);'
            .endl()
        + "      colNew=vec3(BlendColorBurnf(base.r, blend.r),BlendColorBurnf(base.g, blend.g),BlendColorBurnf(base.b, blend.b));".endl()
        + "   #endif".endl()

        + "   return colNew;".endl()
        + "}".endl();

    if (!ver)
        src += "vec4 cgl_blend(vec4 oldColor,vec4 newColor,float amount)".endl()
                + "{".endl()
                    + "vec4 col=vec4( _blend(oldColor.rgb,newColor.rgb) ,1.0);".endl()
                    + "col=vec4( mix( col.rgb, oldColor.rgb ,1.0-oldColor.a*amount),1.0);".endl()
                    + "return col;".endl()
                + "}".endl();

    if (ver >= 3)
        src += "vec4 cgl_blendPixel(vec4 base,vec4 col,float amount)".endl() +
                "{".endl() +

                "#ifdef BM_MATH_ADD".endl() +
                "   return vec4(base.rgb+col.rgb*amount,1.0);".endl() +
                "#endif".endl() +

                "#ifdef BM_MATH_SUB".endl() +
                "   return vec4(base.rgb-col.rgb*amount,1.0);".endl() +
                "#endif".endl() +

                "#ifdef BM_MATH_MUL".endl() +
                "   return vec4(base.rgb*col.rgb*amount,1.0);".endl() +
                "#endif".endl() +

                "#ifdef BM_MATH_DIV".endl() +
                "   return vec4(base.rgb/col.rgb*amount,1.0);".endl() +
                "#endif".endl() +

                    "#ifndef BM_MATH".endl() +
                        "vec3 colNew=_blend(base.rgb,col.rgb);".endl() +

                        "float newA=clamp(base.a+(col.a*amount),0.,1.);".endl() +

                        "#ifdef BM_ALPHAMASKED".endl() +
                            "newA=base.a;".endl() +
                        "#endif".endl() +

                        "return vec4(".endl() +
                            "mix(colNew,base.rgb,1.0-(amount*col.a)),".endl() +
                            "newA);".endl() +

                    "#endif".endl() +
    "}".endl();

    return src;
};

TextureEffect.onChangeBlendSelect = function (shader, blendName, maskAlpha = false)
{
    blendName = String(blendName);
    shader.toggleDefine("BM_NORMAL", blendName == "normal");
    shader.toggleDefine("BM_MULTIPLY", blendName == "multiply");
    shader.toggleDefine("BM_MULTIPLY_INV", blendName == "multiply invert");
    shader.toggleDefine("BM_AVERAGE", blendName == "average");
    shader.toggleDefine("BM_ADD", blendName == "add");
    shader.toggleDefine("BM_SUBTRACT_ONE", blendName == "subtract one");
    shader.toggleDefine("BM_SUBTRACT", blendName == "subtract");
    shader.toggleDefine("BM_DIFFERENCE", blendName == "difference");
    shader.toggleDefine("BM_NEGATION", blendName == "negation");
    shader.toggleDefine("BM_EXCLUSION", blendName == "exclusion");
    shader.toggleDefine("BM_LIGHTEN", blendName == "lighten");
    shader.toggleDefine("BM_DARKEN", blendName == "darken");
    shader.toggleDefine("BM_OVERLAY", blendName == "overlay");
    shader.toggleDefine("BM_SCREEN", blendName == "screen");
    shader.toggleDefine("BM_SOFTLIGHT", blendName == "softlight");
    shader.toggleDefine("BM_HARDLIGHT", blendName == "hardlight");
    shader.toggleDefine("BM_COLORDODGE", blendName == "color dodge");
    shader.toggleDefine("BM_COLORBURN", blendName == "color burn");

    shader.toggleDefine("BM_MATH_ADD", blendName == "Math Add");
    shader.toggleDefine("BM_MATH_SUB", blendName == "Math Subtract");
    shader.toggleDefine("BM_MATH_MUL", blendName == "Math Multiply");
    shader.toggleDefine("BM_MATH_DIV", blendName == "Math Divide");

    shader.toggleDefine("BM_MATH", blendName.indexOf("Math ") == 0);

    shader.toggleDefine("BM_ALPHAMASKED", maskAlpha);
};

TextureEffect.AddBlendSelect = function (op, name, defaultMode)
{
    const p = op.inValueSelect(name || "Blend Mode", [
        "normal", "lighten", "darken", "multiply", "multiply invert", "average", "add", "subtract", "difference", "negation", "exclusion", "overlay", "screen", "color dodge", "color burn", "softlight", "hardlight", "subtract one",
        "Math Add",
        "Math Subtract",
        "Math Multiply",
        "Math Divide",

    ], defaultMode || "normal");
    return p;
};

TextureEffect.AddBlendAlphaMask = function (op, name, defaultMode)
{
    const p = op.inSwitch(name || "Alpha Mask", ["Off", "On"], defaultMode || "Off");
    return p;
};

TextureEffect.setupBlending = function (op, shader, blendPort, amountPort, alphaMaskPort)
{
    const onChange = () =>
    {
        let maskAlpha = false;
        if (alphaMaskPort) maskAlpha = alphaMaskPort.get() == "On";
        TextureEffect.onChangeBlendSelect(shader, blendPort.get(), maskAlpha);

        let str = blendPort.get();
        if (str == "normal") str = null;
        else if (str == "multiply") str = "mul";
        else if (str == "multiply invert") str = "mulinv";
        else if (str == "lighten") str = "light";
        else if (str == "darken") str = "darken";
        else if (str == "average") str = "avg";
        else if (str == "subtract one") str = "sub one";
        else if (str == "subtract") str = "sub";
        else if (str == "difference") str = "diff";
        else if (str == "negation") str = "neg";
        else if (str == "exclusion") str = "exc";
        else if (str == "overlay") str = "ovl";
        else if (str == "color dodge") str = "dodge";
        else if (str == "color burn") str = "burn";
        else if (str == "softlight") str = "soft";
        else if (str == "hardlight") str = "hard";
        else if (str == "Math Add") str = "+";
        else if (str == "Math Subtract") str = "-";
        else if (str == "Math Multiply") str = "*";
        else if (str == "Math Divide") str = "/";

        op.setUiAttrib({ "extendTitle": str });
    };
    op.setPortGroup("Blending", [blendPort, amountPort, alphaMaskPort]);

    let maskAlpha = false;

    blendPort.onChange = onChange;
    if (alphaMaskPort)
    {
        alphaMaskPort.onChange = onChange;
        maskAlpha = alphaMaskPort.get() == "On";
    }

    TextureEffect.onChangeBlendSelect(shader, blendPort.get(), maskAlpha);
};

;// CONCATENATED MODULE: ./src/corelibs/cgl/cgl_shader_lib.js




/** @type {Object} */
const ShaderLibMods = {
    "CGL.BLENDMODES": function ()
    {
        this.name = "blendmodes";
        this.srcHeadFrag = TextureEffect.getBlendCode();
    },

    "CGL.BLENDMODES3": function ()
    {
        this.name = "blendmodes3";
        this.srcHeadFrag = TextureEffect.getBlendCode(3);
    },

    "CGL.LUMINANCE": function ()
    {
        this.name = "luminance";
        this.srcHeadFrag = "".endl()
            + "float cgl_luminance(vec3 c)".endl()
            + "{".endl()
            + "    return dot(vec3(0.2126,0.7152,0.0722),c);".endl()
            + "}".endl();
    },

    // quite good random numbers, but somehow don't work in ANGLE
    "CGL.RANDOM_OLD": function ()
    {
        this.name = "randomNumber";
        this.srcHeadFrag = "".endl()
            + "float cgl_random(vec2 co)".endl()
            + "{".endl()
            + "    return fract(sin(dot(co.xy ,vec2(12.9898,4.1414))) * 432758.5453);".endl()
            + "}".endl()
            + "vec3 cgl_random3(vec2 co)".endl()
            + "{".endl()
            + "    return vec3( cgl_random(co),cgl_random(co+0.5711),cgl_random(co+1.5711));".endl()
            + "}";
    },

    // low quality generative ranodm numbers
    "CGL.RANDOM_LOW": function ()
    {
        this.name = "randomNumber";
        this.srcHeadFrag = "".endl()
            + "float cgl_random(vec2 co)".endl()
            + "{".endl()
            + "    return fract(sin(dot(co.xy ,vec2(12.9898,4.1414))) * 358.5453);".endl()
            + "}".endl()
            + "vec3 cgl_random3(vec2 co)".endl()
            + "{".endl()
            + "    return vec3( cgl_random(co),cgl_random(co+0.5711),cgl_random(co+1.5711));".endl()
            + "}";
    },

    "CGL.RANDOM_TEX": function ()
    {
        this.name = "randomNumbertex";

        this.srcHeadFrag = "".endl()
            + "UNI sampler2D CGLRNDTEX;".endl()
            + "float cgl_random(vec2 co)".endl()
            + "{".endl()
            + "    return texture(CGLRNDTEX,co*5711.0).r;".endl()
            + "}".endl()
            + "vec3 cgl_random3(vec2 co)".endl()
            + "{".endl()
            + "    return texture(CGLRNDTEX,co*5711.0).rgb;".endl()
            + "}";

        this.initUniforms = function (shader)
        {
            return [new Uniform(shader, "t", "CGLRNDTEX", 7)];
        };

        this.onBind = function (cgl, shader)
        {
            Texture.getRandomTexture(cgl);
            cgl.setTexture(7, Texture.getRandomTexture(cgl).tex);
        };
    }

};

;// CONCATENATED MODULE: ./src/corelibs/cgl/cgl_shader_default_glsl.vert
/* harmony default export */ const cgl_shader_default_glsl = ("{{MODULES_HEAD}}\nIN vec3 vPosition; //!@\nIN vec2 attrTexCoord;\nIN vec3 attrVertNormal;\nIN vec3 attrTangent,attrBiTangent;\n\nIN float attrVertIndex;\n\nOUT vec2 texCoord;\nOUT vec3 norm;\nUNI mat4 projMatrix;\nUNI mat4 viewMatrix;\nUNI mat4 modelMatrix;\n\nvoid main()\n{\n    texCoord=attrTexCoord;\n    norm=attrVertNormal;\n    vec4 pos=vec4(vPosition,  1.0);\n    vec3 tangent=attrTangent;\n    vec3 bitangent=attrBiTangent;\n    mat4 mMatrix=modelMatrix;\n    gl_PointSize=10.0;\n\n    {{MODULE_VERTEX_POSITION}}\n\n    mat4 modelViewMatrix=viewMatrix*mMatrix;\n    {{MODULE_VERTEX_MODELVIEW}}\n\n    gl_Position = projMatrix * modelViewMatrix * pos;\n}\n");
;// CONCATENATED MODULE: ./src/corelibs/cgl/cgl_shader.js












// ---------------------------------------------------------------------------

/*

proposal default shader variable names:

attrVertex - currently: vPosition
attrVertexIndex - currently: attrVertIndex
attrTexCoord
attrInstMat - currently: instMat
attrVertColor
attrTangent
attrBiTangent

uProjMatrix - currently: projMatrix
uModelMatrix - currently: modelMatrix
uNormalMatrix - currently: normalMatrix
uCamPosition - currently: camPos

*/

// ---------------------------------------------------------------------------

let materialIdCounter = 0;

function getDefaultVertexShader()
{
    return cgl_shader_default_glsl;
}

/**
 * @param {number} [r]
 * @param {number} [g]
 * @param {number} [b]
 */
function getDefaultFragmentShader(r, g, b)
{
    if (r == undefined)
    {
        r = 0.5;
        g = 0.5;
        b = 0.5;
    }
    return ""
        + nl + "IN vec2 texCoord;"
        + nl + "{{MODULES_HEAD}}"
        + nl + "void main()"
        + nl + "{"

        + nl + "    vec4 col=vec4(" + r + "," + g + "," + b + ",1.0);"
        + nl + "    {{MODULE_COLOR}}"
        + nl + "    outColor = col;"
        + nl + "}";
}

/**
 * @example
 * var shader=new CGL.Shader(cgl,'MinimalMaterial');
 * shader.setSource(attachments.shader_vert,attachments.shader_frag);
 */
class CglShader extends CgShader
{

    /** @type {Uniform[]} */
    _uniforms = [];

    /** @type {Object<String,Uniform>} */
    materialPropUniforms = {};
    #validated = false;

    /**
     * @param {CglContext} _cgl
     * @param {string} _name
     * @param {Op} [_op]
     */
    constructor(_cgl, _name, _op)
    {
        super();
        if (!_cgl) throw new Error("shader constructed without cgl " + _name);

        this._log = new external_CABLES_SHARED_namespaceObject.Logger("cgl_shader");
        this._cgl = _cgl;

        if (!_name) this._log.stack("no shader name given");
        this._name = _name || "unknown";

        if (_op) this.opId = _op.id;
        this.glslVersion = 0;
        if (_cgl.glVersion > 1) this.glslVersion = 300;

        this._materialId = ++materialIdCounter;

        this._program = null;
        this._drawBuffers = [true];
        this.error = null;

        this.ignoreMissingUniforms = false;
        this._projMatrixUniform = null;
        this._mvMatrixUniform = null;
        this._mMatrixUniform = null;
        this._vMatrixUniform = null;
        this._camPosUniform = null;
        this._normalMatrixUniform = null;
        this._inverseViewMatrixUniform = null;
        this._fromUserInteraction = false;

        this._attrVertexPos = -1;
        this.precision = _cgl.patch.config.glslPrecision || "highp";

        this._pMatrixState = -1;
        this._vMatrixState = -1;

        this._countMissingUniforms = 0;
        this._modGroupCount = 0; // not needed anymore...
        this._feedBackNames = [];
        this._attributes = [];

        this.glPrimitive = null;
        this.offScreenPass = false;
        this._extensions = [];
        this.srcVert = getDefaultVertexShader();
        this.srcFrag = getDefaultFragmentShader();
        this.lastCompile = 0;

        this._libs = [];
        this._structNames = [];
        this._structUniformNames = [];

        /** @type {Uniform[]} */
        this._textureStackUni = [];
        this._textureStackTex = [];
        this._textureStackType = [];
        this._textureStackTexCgl = [];

        this._tempNormalMatrix = mat4_create();
        this._tempCamPosMatrix = mat4_create();
        this._tempInverseViewMatrix = mat4_create();
        this._tempInverseProjMatrix = mat4_create();

        this.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_NORMAL", "MODULE_BEGIN_FRAG", "MODULE_VERTEX_MODELVIEW"]);
    }

    isValid()
    {
        return this._isValid;
    }

    getCgl()
    {
        return this._cgl;
    }

    getName()
    {
        return this._name;
    }

    /**
     * @param {string} name
     */
    enableExtension(name)
    {
        this.setWhyCompile("enable extension " + name);

        this._extensions.push(name);
    }

    getAttrVertexPos()
    {
        return this._attrVertexPos;
    }

    hasTextureUniforms()
    {
        for (let i = 0; i < this._uniforms.length; i++)
            if (this._uniforms[i].getType() == "t") return true;
        return false;
    }

    /**
     * copy all uniform values from another shader
     * @param {CglShader} origShader uniform values will be copied from this shader
     */
    copyUniformValues(origShader)
    {
        for (let i = 0; i < origShader._uniforms.length; i++)
        {
            if (!this._uniforms[i])
            {
                this._log.log("unknown uniform?!");
                continue;
            }

            this.getUniform(origShader._uniforms[i].getName()).set(origShader._uniforms[i].getValue());
        }

        this.popTextures();
        for (let i = 0; i < origShader._textureStackUni.length; i++)
        {
            this._textureStackUni[i] = origShader._textureStackUni[i];
            this._textureStackTex[i] = origShader._textureStackTex[i];
            this._textureStackType[i] = origShader._textureStackType[i];
            this._textureStackTexCgl[i] = origShader._textureStackTexCgl[i];
        }

    }

    /**
     * copy current shader
     * @returns {CglShader} newShader
     */
    copy()
    {
        const shader = new CglShader(this._cgl, this._name + " copy");
        shader.setSource(this.srcVert, this.srcFrag);

        shader._modules = structuredClone(this._modules);
        shader._defines = structuredClone(this._defines);

        shader._modGroupCount = this._modGroupCount;
        shader._moduleNames = this._moduleNames;
        shader.glPrimitive = this.glPrimitive;
        shader.offScreenPass = this.offScreenPass;
        shader._extensions = this._extensions;
        shader.wireframe = this.wireframe;
        shader._attributes = this._attributes;

        for (let i = 0; i < this._uniforms.length; i++)
        {
            const u = this._uniforms[i].copy(shader);
            u.resetLoc();
        }

        if (this.materialPropUniforms)
            for (const i in this.materialPropUniforms)
            {
                if (!this.materialPropUniforms[i] || !this.materialPropUniforms[i].copy)
                {
                    // console.log("no matprop", this.materialPropUniforms[i]);
                }
                else
                {
                    shader.materialPropUniforms[i] = this.materialPropUniforms[i].copy(shader);
                }
            }

        shader.setWhyCompile("copy");
        return shader;
    }

    /**
     * set shader source code
     * @param {String} srcVert
     * @param {String} srcFrag
     * @param {Boolean} fromUserInteraction
     */
    setSource(srcVert, srcFrag, fromUserInteraction = false)
    {
        this._fromUserInteraction = fromUserInteraction;
        this.srcVert = srcVert;
        this.srcFrag = srcFrag;
        this.setWhyCompile("Source changed");
        this._isValid = true;
    }

    _addLibs(src)
    {
        for (const id in ShaderLibMods)
        {
            if (src.includes(id))
            {
                const lib = new ShaderLibMods[id]();
                src = src.replace("{{" + id + "}}", lib.srcHeadFrag);
                this._libs.push(lib);
                if (lib.initUniforms)lib.initUniforms(this);
            }
        }

        return src;
    }

    createStructUniforms()
    {
        // * create structs
        let structStrFrag = "";
        let structStrVert = ""; // TODO: not used yet

        this._structNames = [];
        // * reset the arrays holding the value each recompile so we don't skip structs
        // * key value mapping so the same struct can be added twice (two times the same modifier)
        this._injectedStringsFrag = {};
        this._injectedStringsVert = {};

        this._structUniformNamesIndicesFrag = [];
        this._structUniformNamesIndicesVert = [];

        for (let i = 0; i < this._uniforms.length; i++)
        {
            // * only add uniforms to struct that are a member of a struct
            if (this._uniforms[i].isStructMember())
            {
                const injectionString = "{{INJECTION_POINT_STRUCT_" + this._uniforms[i]._structName + "}}";

                // * check if struct is not already part of shader
                if (!this._structNames.includes(this._uniforms[i]._structName))
                {
                    // * create struct definition with placeholder string to inject
                    const structDefinition = "struct "
                        + this._uniforms[i]._structName + " {" + nl
                        + injectionString
                        + "};" + nl + nl;

                    if (this._uniforms[i].getShaderType() === "both" || this._uniforms[i].getShaderType() === "frag")
                        structStrFrag = structStrFrag.concat(structDefinition);

                    if (this._uniforms[i].getShaderType() === "both" || this._uniforms[i].getShaderType() === "vert")
                        structStrVert = structStrVert.concat(structDefinition);

                    this._structNames.push(this._uniforms[i]._structName);
                    this._injectedStringsFrag[this._uniforms[i]._structName] = [];
                    this._injectedStringsVert[this._uniforms[i]._structName] = [];
                }

                // * create member & comment
                let comment = "";
                if (this._uniforms[i].comment) comment = " // " + this._uniforms[i].comment;

                let stringToInsert = "";
                if (this._uniforms[i].getGlslTypeString() == undefined)stringToInsert += "//";
                stringToInsert += "  " + this._uniforms[i].getGlslTypeString()
                        + " " + this._uniforms[i]._propertyName + ";"
                        + comment;

                if (this._uniforms[i].getShaderType() === "both")
                {
                    // * inject member before {injectionString}
                    if (
                        !this._injectedStringsFrag[this._uniforms[i]._structName].includes(stringToInsert)
                    && !this._injectedStringsVert[this._uniforms[i]._structName].includes(stringToInsert))
                    {
                        const insertionIndexFrag = structStrFrag.lastIndexOf(injectionString);
                        const insertionIndexVert = structStrVert.lastIndexOf(injectionString);

                        structStrFrag =
                            structStrFrag.slice(0, insertionIndexFrag)
                            + stringToInsert + structStrFrag.slice(insertionIndexFrag - 1);

                        structStrVert =
                            structStrVert.slice(0, insertionIndexVert)
                            + stringToInsert + structStrVert.slice(insertionIndexVert - 1);

                        this._injectedStringsFrag[this._uniforms[i]._structName].push(stringToInsert);
                        this._injectedStringsVert[this._uniforms[i]._structName].push(stringToInsert);
                    }

                    if (!this._structUniformNamesIndicesFrag.includes(i)) this._structUniformNamesIndicesFrag.push(i);
                    if (!this._structUniformNamesIndicesVert.includes(i)) this._structUniformNamesIndicesVert.push(i);
                }
                else if (this._uniforms[i].getShaderType() === "frag")
                {
                    // * inject member before {injectionString}
                    if (!this._injectedStringsFrag[this._uniforms[i]._structName].includes(stringToInsert)) //
                    {
                        const insertionIndexFrag = structStrFrag.lastIndexOf(injectionString);

                        structStrFrag =
                            structStrFrag.slice(0, insertionIndexFrag)
                            + stringToInsert + structStrFrag.slice(insertionIndexFrag - 1);

                        this._injectedStringsFrag[this._uniforms[i]._structName].push(stringToInsert);
                    }

                    if (!this._structUniformNamesIndicesFrag.includes(i)) this._structUniformNamesIndicesFrag.push(i);
                }
                else if (this._uniforms[i].getShaderType() === "vert")
                {
                    // * inject member before {injectionString}
                    if (!this._injectedStringsVert[this._uniforms[i]._structName].includes(stringToInsert))
                    {
                        const insertionIndexVert = structStrVert.lastIndexOf(injectionString);

                        structStrVert =
                            structStrVert.slice(0, insertionIndexVert)
                            + stringToInsert + structStrVert.slice(insertionIndexVert - 1);

                        this._injectedStringsVert[this._uniforms[i]._structName].push(stringToInsert);
                    }

                    if (!this._structUniformNamesIndicesVert.includes(i)) this._structUniformNamesIndicesVert.push(i);
                }
            }
        }

        // * dedupe injected uni declarations
        this._uniDeclarationsFrag = [];
        this._uniDeclarationsVert = [];

        // * remove struct injection points and add uniform in fragment
        for (let i = 0; i < this._structUniformNamesIndicesFrag.length; i += 1)
        {
            const index = this._structUniformNamesIndicesFrag[i];
            const uniDeclarationString = "UNI " + this._uniforms[index]._structName + " " + this._uniforms[index]._structUniformName + ";" + nl;

            if (!this._uniDeclarationsFrag.includes(uniDeclarationString))
            {
                const injectionString = "{{INJECTION_POINT_STRUCT_" + this._uniforms[index]._structName + "}}";

                structStrFrag = structStrFrag.replace(injectionString, "");
                structStrFrag += uniDeclarationString;

                this._uniDeclarationsFrag.push(uniDeclarationString);
            }
        }

        // * remove struct injection points and add uniform in vertex
        for (let i = 0; i < this._structUniformNamesIndicesVert.length; i += 1)
        {
            const index = this._structUniformNamesIndicesVert[i];
            const uniDeclarationString = "UNI " + this._uniforms[index]._structName + " " + this._uniforms[index]._structUniformName + ";" + nl;

            if (!this._uniDeclarationsVert.includes(uniDeclarationString))
            {
                const injectionString = "{{INJECTION_POINT_STRUCT_" + this._uniforms[index]._structName + "}}";

                structStrVert = structStrVert.replace(injectionString, "");
                structStrVert += uniDeclarationString;
                this._uniDeclarationsVert.push(uniDeclarationString);
            }
        }

        return [structStrVert, structStrFrag];
    }

    _getAttrSrc(attr, firstLevel)
    {
        const r = {};
        if (attr.name && attr.type)
        {
            r.srcHeadVert = "";
            if (!firstLevel) r.srcHeadVert += "#ifndef ATTRIB_" + attr.name + nl;
            r.srcHeadVert += "#define ATTRIB_" + attr.name + nl;
            r.srcHeadVert += "IN " + attr.type + " " + attr.name + ";" + nl;
            if (!firstLevel) r.srcHeadVert += "#endif" + nl;

            if (attr.nameFrag)
            {
                r.srcHeadVert += "";
                if (!firstLevel) r.srcHeadVert += "#ifndef ATTRIB_" + attr.nameFrag + nl;
                r.srcHeadVert += "#define ATTRIB_" + attr.nameFrag + nl;
                r.srcHeadVert += "OUT " + attr.type + " " + attr.nameFrag + ";" + nl;
                if (!firstLevel) r.srcHeadVert += "#endif" + nl;

                r.srcVert = "" + nl + attr.nameFrag + "=" + attr.name + ";";

                r.srcHeadFrag = "";
                if (!firstLevel) r.srcHeadFrag += "#ifndef ATTRIB_" + attr.nameFrag + nl;
                r.srcHeadFrag += "#define ATTRIB_" + attr.nameFrag + nl;
                r.srcHeadFrag += "IN " + attr.type + " " + attr.nameFrag + ";" + nl;
                if (!firstLevel) r.srcHeadFrag += "#endif" + nl;
            }
        }
        return r;
    }

    compile()
    {
        if (this._cgl.aborted) return;
        const startTime = performance.now();
        const measure = this._cgl.profileData.start("shadercompile " + this.name);

        performance.mark("start");
        this._cgl.profileData.count("shaderCompile");
        this._cgl.profileData.profileShaderCompileName = this._name + " [" + this._compileReason + "]";

        let extensionString = "";
        if (this._extensions)
            for (let i = 0; i < this._extensions.length; i++)
                extensionString += "#extension " + this._extensions[i] + " : enable" + nl;

        let definesStr = "";
        if (this._defines.length) definesStr = "\n// cgl generated" + nl;
        for (let i = 0; i < this._defines.length; i++)
            definesStr += "#define " + this._defines[i][0] + " " + this._defines[i][1] + "" + nl;

        const structStrings = this.createStructUniforms();
        this._cgl.profileData.addHeavyEvent("shader compile", this._name + " [" + this._compileReason + "]");
        this._compileReason = "";

        if (this._uniforms)
        {
            // * we create an array of the uniform names to check our indices & an array to save them
            const uniNames = this._uniforms.map((uni) => { return uni._name; });
            const indicesToRemove = [];

            // * we go through our uniforms and check if the same name is contained somewhere further in the array
            // * if so, we add the current index to be removed later
            for (let i = 0; i < this._uniforms.length; i++)
            {
                const uni = this._uniforms[i];
                const nextIndex = uniNames.indexOf(uni._name, i + 1);
                if (nextIndex > -1) indicesToRemove.push(i);
            }

            // * after that, we go through the uniforms backwards (so we keep the order) and remove the indices
            // * also, we reset the locations of all the other valid uniforms
            for (let j = this._uniforms.length - 1; j >= 0; j -= 1)
            {
                if (indicesToRemove.includes(j)) this._uniforms.splice(j, 1);
                else this._uniforms[j].resetLoc();
            }
        }

        this._cgl.printError("uniform resets");

        this._compileCount++;
        if (this.hasTextureUniforms()) definesStr += "#define HAS_TEXTURES" + nl;

        let vs = "";
        let fs = "";

        if (!this.srcFrag)
        {
            this._log.warn("[cgl shader] has no fragment source!", this._name, this);
            this.srcVert = getDefaultVertexShader();
            this.srcFrag = getDefaultFragmentShader();
        }

        vs = "#version 300 es"
            + nl + "// "
            + nl + "// vertex shader " + this._name
            + nl + "// "
            + nl + "precision " + this.precision + " float;"
            + nl + "precision " + this.precision + " sampler2D;"
            + nl + ""
            + nl + "#define WEBGL2"
            + nl + "#define texture2D texture"
            + nl + "#define UNI uniform"
            + nl + "#define IN in"
            + nl + "#define OUT out"
            + nl;

        fs = "#version 300 es"
            + nl + "// "
            + nl + "// fragment shader " + this._name
            + nl + "// "
            + nl + "precision " + this.precision + " float;"
            + nl + "precision " + this.precision + " sampler2D;"
            + nl + ""
            + nl + "#define WEBGL2"
            + nl + "#define texture2D texture"
            + nl + "#define IN in"
            + nl + "#define OUT out"
            + nl + "#define UNI uniform"
            + nl + "{{DRAWBUFFER}}"

            + nl;

        let uniformsStrVert = "\n// cgl generated" + nl;
        let uniformsStrFrag = "\n// cgl generated" + nl;

        fs += "\n// active mods: --------------- ";
        vs += "\n// active mods: --------------- ";

        let foundModsFrag = false;
        let foundModsVert = false;
        for (let i = 0; i < this._moduleNames.length; i++)
        {
            for (let j = 0; j < this._modules.length; j++)
            {
                if (this._modules[j].name == this._moduleNames[i])
                {
                    if (this._modules[j].srcBodyFrag || this._modules[j].srcHeadFrag)
                    {
                        foundModsFrag = true;
                        fs += "\n// " + i + "." + j + ". " + this._modules[j].title + " (" + this._modules[j].name + ")";
                    }
                    if (this._modules[j].srcBodyVert || this._modules[j].srcHeadVert)
                    {
                        vs += "\n// " + i + "." + j + ". " + this._modules[j].title + " (" + this._modules[j].name + ")";
                        foundModsVert = true;
                    }
                }
            }
        }
        if (!foundModsVert)fs += "\n// no mods used...";
        if (!foundModsFrag)fs += "\n// no mods used...";
        fs += "\n";
        vs += "\n";

        for (let i = 0; i < this._uniforms.length; i++)
        {
            if (this._uniforms[i].shaderType && !this._uniforms[i].isStructMember())
            {
                let uniStr = "";
                if (!this._uniforms[i].getGlslTypeString())uniStr += "// ";
                uniStr += "UNI " + this._uniforms[i].getGlslTypeString() + " " + this._uniforms[i].getName();
                let comment = "";
                if (this._uniforms[i].comment) comment = " // " + this._uniforms[i].comment;

                if (this._uniforms[i].shaderType == "vert" || this._uniforms[i].shaderType == "both")
                    if (!this.srcVert.includes(uniStr) && !this.srcVert.includes("uniform " + this._uniforms[i].getGlslTypeString() + " " + this._uniforms[i].getName()))
                        uniformsStrVert += uniStr + ";" + comment + nl;

                if (this._uniforms[i].shaderType == "frag" || this._uniforms[i].shaderType == "both")
                    if (!this.srcFrag.includes(uniStr) && !this.srcFrag.includes("uniform " + this._uniforms[i].getGlslTypeString() + " " + this._uniforms[i].getName()))
                        uniformsStrFrag += uniStr + ";" + comment + nl;
            }
        }

        let countUniFrag = 0;
        let countUniVert = 0;
        for (let i = 0; i < this._uniforms.length; i++)
        {
            if (this._uniforms[i].shaderType && !this._uniforms[i].isStructMember())
            {
                if (this._uniforms[i].shaderType == "vert" || this._uniforms[i].shaderType == "both") countUniVert++;
                if (this._uniforms[i].shaderType == "frag" || this._uniforms[i].shaderType == "both") countUniFrag++;
            }
        }
        if (countUniFrag >= this._cgl.maxUniformsFrag) this._log.warn("[cgl_shader] num uniforms frag: " + countUniFrag + " / " + this._cgl.maxUniformsFrag);
        if (countUniVert >= this._cgl.maxUniformsVert) this._log.warn("[cgl_shader] num uniforms vert: " + countUniVert + " / " + this._cgl.maxUniformsVert);

        if (!fs.includes("precision")) fs = "precision " + this.precision + " float;" + nl + fs;
        if (!vs.includes("precision")) vs = "precision " + this.precision + " float;" + nl + vs;
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
        {
            fs += "#define MOBILE" + nl;
            vs += "#define MOBILE" + nl;
        }
        vs = extensionString + vs + definesStr + structStrings[0] + uniformsStrVert + "\n// -- \n" + this.srcVert;
        fs = extensionString + fs + definesStr + structStrings[1] + uniformsStrFrag + "\n// -- \n" + this.srcFrag;

        let srcHeadVert = "";
        let srcHeadFrag = "";

        this._modules.sort(function (a, b)
        {
            // return a.priority || 0 - b.priority || 0;
            return (a.priority || 0) - (b.priority || 0);
        });

        let addedAttribs = false;

        for (let i = 0; i < this._moduleNames.length; i++)
        {
            let srcVert = "";
            let srcFrag = "";

            if (!addedAttribs)
            {
                addedAttribs = true;

                for (let k = 0; k < this._attributes.length; k++)
                {
                    const r = this._getAttrSrc(this._attributes[k], true);
                    if (r.srcHeadVert)srcHeadVert += r.srcHeadVert;
                    if (r.srcVert)srcVert += r.srcVert;
                    if (r.srcHeadFrag)srcHeadFrag += r.srcHeadFrag;
                }
            }

            for (let j = 0; j < this._modules.length; j++)
            {
                const mod = this._modules[j];
                if (mod.name == this._moduleNames[i])
                {
                    srcHeadVert += "\n//---- MOD: group:" + mod.group + ": idx:" + j + " - prfx:" + mod.prefix + " - " + mod.title + " ------\n";
                    srcHeadFrag += "\n//---- MOD: group:" + mod.group + ": idx:" + j + " - prfx:" + mod.prefix + " - " + mod.title + " ------\n";

                    srcVert += "\n\n//---- MOD: " + mod.title + " / " + mod.priority + " ------\n";
                    srcFrag += "\n\n//---- MOD: " + mod.title + " / " + mod.priority + " ------\n";

                    if (mod.attributes)
                        for (let k = 0; k < mod.attributes.length; k++)
                        {
                            const r = this._getAttrSrc(mod.attributes[k], false);
                            if (r.srcHeadVert)srcHeadVert += r.srcHeadVert;
                            if (r.srcVert)srcVert += r.srcVert;
                            if (r.srcHeadFrag)srcHeadFrag += r.srcHeadFrag;
                        }

                    srcHeadVert += mod.srcHeadVert || "";
                    srcHeadFrag += mod.srcHeadFrag || "";
                    srcVert += mod.srcBodyVert || "";
                    srcFrag += mod.srcBodyFrag || "";

                    srcHeadVert += "\n//---- end mod ------\n";
                    srcHeadFrag += "\n//---- end mod ------\n";

                    srcVert += "\n//---- end mod ------\n";
                    srcFrag += "\n//---- end mod ------\n";

                    srcVert = srcVert.replace(/{{mod}}/g, mod.prefix);
                    srcFrag = srcFrag.replace(/{{mod}}/g, mod.prefix);
                    srcHeadVert = srcHeadVert.replace(/{{mod}}/g, mod.prefix);
                    srcHeadFrag = srcHeadFrag.replace(/{{mod}}/g, mod.prefix);

                    srcVert = srcVert.replace(/MOD_/g, mod.prefix);
                    srcFrag = srcFrag.replace(/MOD_/g, mod.prefix);
                    srcHeadVert = srcHeadVert.replace(/MOD_/g, mod.prefix);
                    srcHeadFrag = srcHeadFrag.replace(/MOD_/g, mod.prefix);
                }
            }

            vs = vs.replace("{{" + this._moduleNames[i] + "}}", srcVert);
            fs = fs.replace("{{" + this._moduleNames[i] + "}}", srcFrag);
        }

        vs = vs.replace("{{MODULES_HEAD}}", srcHeadVert);
        fs = fs.replace("{{MODULES_HEAD}}", srcHeadFrag);

        vs = this._addLibs(vs);
        fs = this._addLibs(fs);

        // SETUP draw buffers / multi texture render targets

        let drawBufferStr = "";
        for (let i = 0; i < 16; i++)
            if (fs.includes("outColor" + i)) this._drawBuffers[i] = true;

        if (this._drawBuffers.length == 1)
        {
            drawBufferStr = "out vec4 outColor;" + nl;
            drawBufferStr += "#define gl_FragColor outColor" + nl;
        }
        else
        {
            drawBufferStr += "#define MULTI_COLORTARGETS" + nl;
            drawBufferStr += "vec4 outColor;" + nl;

            let count = 0;
            for (let i = 0; i < this._drawBuffers.length; i++)
            {
                if (count == 0) drawBufferStr += "#define gl_FragColor outColor" + i + "" + nl;
                drawBufferStr += "layout(location = " + i + ") out vec4 outColor" + i + ";" + nl;
                count++;
            }
        }

        fs = fs.replace("{{DRAWBUFFER}}", drawBufferStr);
        // //////

        if (!this._program)
        {
            this._program = this._createProgram(vs, fs);
        }
        else
        {
            // this.vshader=createShader(vs, gl.VERTEX_SHADER, this.vshader );
            // this.fshader=createShader(fs, gl.FRAGMENT_SHADER, this.fshader );
            // linkProgram(program);
            this._program = this._createProgram(vs, fs);

            this._projMatrixUniform = null;

            for (let i = 0; i < this._uniforms.length; i++) this._uniforms[i].resetLoc();
        }

        this.finalShaderFrag = fs;
        this.finalShaderVert = vs;

        MESH.lastMesh = null;
        MESH.lastShader = null;

        this._countMissingUniforms = 0;
        this._needsRecompile = false;
        this.lastCompile = (0,external_CABLES_namespaceObject.now)();

        this._cgl.profileData.shaderCompileTime += performance.now() - startTime;
        this._cgl.profileData.shaderCompileCount++;
        measure.finish();
    }

    bind()
    {
        if (!this._isValid || this._cgl.aborted) return;
        if (this.needsCheckLinkStatus) this.checkLinkStatus();

        MESH.lastShader = this;

        if (!this._program || this.needsRecompile()) this.compile();
        if (!this._isValid) return;

        if (!this._projMatrixUniform && !this.ignoreMissingUniforms)
        {
            this._countMissingUniforms++;
            // if (this._countMissingUniforms == 10)this._log.log("stopping getlocation of missing uniforms...", this._name);
            if (this._countMissingUniforms < 10)
            {
                const measure = this._cgl.profileData.start("shader default uniforms");
                this._projMatrixUniform = this._cgl.gl.getUniformLocation(this._program, CONSTANTS.SHADER.SHADERVAR_UNI_PROJMAT);
                this._attrVertexPos = this._cgl.glGetAttribLocation(this._program, CONSTANTS.SHADER.SHADERVAR_VERTEX_POSITION);
                this._mvMatrixUniform = this._cgl.gl.getUniformLocation(this._program, "mvMatrix");
                this._vMatrixUniform = this._cgl.gl.getUniformLocation(this._program, CONSTANTS.SHADER.SHADERVAR_UNI_VIEWMAT);
                this._mMatrixUniform = this._cgl.gl.getUniformLocation(this._program, CONSTANTS.SHADER.SHADERVAR_UNI_MODELMAT);
                this._camPosUniform = this._cgl.gl.getUniformLocation(this._program, CONSTANTS.SHADER.SHADERVAR_UNI_VIEWPOS);
                this._normalMatrixUniform = this._cgl.gl.getUniformLocation(this._program, CONSTANTS.SHADER.SHADERVAR_UNI_NORMALMAT);
                this._inverseViewMatrixUniform = this._cgl.gl.getUniformLocation(this._program, CONSTANTS.SHADER.SHADERVAR_UNI_INVVIEWMAT);
                this._inverseProjMatrixUniform = this._cgl.gl.getUniformLocation(this._program, CONSTANTS.SHADER.SHADERVAR_UNI_INVPROJMAT);
                this._materialIdUniform = this._cgl.gl.getUniformLocation(this._program, CONSTANTS.SHADER.SHADERVAR_UNI_MATERIALID);
                this._objectIdUniform = this._cgl.gl.getUniformLocation(this._program, CONSTANTS.SHADER.SHADERVAR_UNI_OBJECTID);

                measure.finish();

                for (let i = 0; i < this._uniforms.length; i++) this._uniforms[i].needsUpdate = true;
            }
        }

        if (this._cgl.currentProgram != this._program)
        {
            this._cgl.profileData.count("shaderBinds");
            this._cgl.gl.useProgram(this._program);
            this._cgl.currentProgram = this._program;
        }

        for (let i = 0; i < this._uniforms.length; i++)
            if (this._uniforms[i].needsUpdate) this._uniforms[i].updateValue();

        if (this._pMatrixState != this._cgl.getProjectionMatrixStateCount())
        {
            this._pMatrixState = this._cgl.getProjectionMatrixStateCount();
            this._cgl.gl.uniformMatrix4fv(this._projMatrixUniform, false, this._cgl.pMatrix);
            this._cgl.profileData.count("mvpMatrixCount");

        }

        if (this._objectIdUniform)
            this._cgl.gl.uniform1f(this._objectIdUniform, ++this._cgl.tempData.objectIdCounter);

        if (this._materialIdUniform)
            this._cgl.gl.uniform1f(this._materialIdUniform, this._materialId);

        if (this._vMatrixUniform)
        {
            if (this._vMatrixState != this._cgl.getViewMatrixStateCount())
            {
                this._cgl.gl.uniformMatrix4fv(this._vMatrixUniform, false, this._cgl.vMatrix);
                this._cgl.profileData.count("mvpMatrixCount");
                this._vMatrixState = this._cgl.getViewMatrixStateCount();

                if (this._inverseViewMatrixUniform)
                {
                    mat4_invert(this._tempInverseViewMatrix, this._cgl.vMatrix);
                    this._cgl.gl.uniformMatrix4fv(this._inverseViewMatrixUniform, false, this._tempInverseViewMatrix);
                    this._cgl.profileData.count("mvpMatrixCount");
                }
                if (this._inverseProjMatrixUniform)
                {
                    mat4_invert(this._tempInverseProjMatrix, this._cgl.pMatrix);
                    this._cgl.gl.uniformMatrix4fv(this._inverseProjMatrixUniform, false, this._tempInverseProjMatrix);
                    this._cgl.profileData.count("mvpMatrixCount");
                }
            }
            this._cgl.gl.uniformMatrix4fv(this._mMatrixUniform, false, this._cgl.mMatrix);
            this._cgl.profileData.count("mvpMatrixCount");

            if (this._camPosUniform)
            {
                mat4_invert(this._tempCamPosMatrix, this._cgl.vMatrix);
                this._cgl.gl.uniform3f(this._camPosUniform, this._tempCamPosMatrix[12], this._tempCamPosMatrix[13], this._tempCamPosMatrix[14]);
                this._cgl.profileData.count("mvpMatrixCount");
            }
        }
        else
        {
            // mvmatrix deprecated....
            const tempmv = mat4_create();

            mat4_mul(tempmv, this._cgl.vMatrix, this._cgl.mMatrix);
            this._cgl.gl.uniformMatrix4fv(this._mvMatrixUniform, false, tempmv);
            this._cgl.profileData.count("mvpMatrixCount");
        }

        if (this._normalMatrixUniform)
        {
            // mat4.mul(this._tempNormalMatrix, this._cgl.vMatrix, this._cgl.mMatrix);
            mat4_invert(this._tempNormalMatrix, this._cgl.mMatrix);
            mat4_transpose(this._tempNormalMatrix, this._tempNormalMatrix);

            this._cgl.gl.uniformMatrix4fv(this._normalMatrixUniform, false, this._tempNormalMatrix);
            this._cgl.profileData.count("mvpMatrixCount");
        }

        for (let i = 0; i < this._libs.length; i++)
        {
            if (this._libs[i].onBind) this._libs[i].onBind.bind(this._libs[i])(this._cgl, this);
        }

        this._bindTextures();

        if (!this.#validated)
        {
            this._cgl.gl.validateProgram(this.getProgram());
            this.#validated = true;

            if (!this._cgl.gl.getProgramParameter(this.getProgram(), this._cgl.gl.VALIDATE_STATUS))
            {
                const str = this._cgl.gl.getProgramInfoLog(this.getProgram());
                this._log.log("shaderprogram validation problem:", str);
            }

        }
        return this._isValid;
    }

    unBind()
    {
    }

    dispose()
    {

        if (this._program && this._cgl && this._cgl.gl) this._cgl.gl.deleteProgram(this._program);
        this._program = null;
    }

    setDrawBuffers(arr)
    {
        this._log.warn("useless drawbuffers...?!");
    }

    getUniforms()
    {
        return this._uniforms;
    }

    /**
     * @param {string} name
     */
    getUniform(name)
    {
        for (let i = 0; i < this._uniforms.length; i++)
            if (this._uniforms[i].getName() == name)
                return this._uniforms[i];
        return null;
    }

    removeAllUniforms()
    {
        this._uniforms = [];
        // for (let i = 0; i < this._uniforms.length; i++)
        //     this.removeUniform(this._uniforms[i].name);
    }

    _addUniform(uni)
    {
        this._uniforms.push(uni);
        this.setWhyCompile("add uniform " + name);
    }

    /**
     * add a uniform to the fragment shader
     * @param {String} type ['f','t', etc]
     * @param {String} name
     * @param {any} valueOrPort value or port
     * @param p2
     * @param p3
     * @param p4
     * @returns {Uniform}
     */
    addUniformFrag(type, name, valueOrPort, p2, p3, p4)
    {
        const uni = new Uniform(this, type, name, valueOrPort, p2, p3, p4);
        uni.shaderType = "frag";
        return uni;
    }

    /**
     * add a uniform to the vertex shader
     * @param {String} type ['f','t', etc]
     * @param {String} name
     * @param {any} valueOrPort value or port
     * @param p2
     * @param p3
     * @param p4
     * @returns {Uniform}
     */
    addUniformVert(type, name, valueOrPort, p2, p3, p4)
    {
        const uni = new Uniform(this, type, name, valueOrPort, p2, p3, p4);
        uni.shaderType = "vert";
        return uni;
    }

    /**
     * add a uniform to both shaders
     * @param {String} type ['f','t', etc]
     * @param {String} name
     * @param {any} valueOrPort value or port
     * @param p2
     * @param p3
     * @param p4
     * @returns {Uniform}
     */
    addUniformBoth(type, name, valueOrPort, p2, p3, p4)
    {
        const uni = new Uniform(this, type, name, valueOrPort, p2, p3, p4);
        uni.shaderType = "both";
        return uni;
    }

    /**
     * add a struct & its uniforms to the fragment shader
     * @param {String} structName name of the struct, i.e.: LightStruct
     * @param {String} uniformName name of the struct uniform in the shader, i.e.: lightUni
     * @param {Array} members array of objects containing the struct members. see example for structure

     * @returns {Object}
     * @example
     * const shader = new CGL.Shader(cgl, 'MinimalMaterial');
     * shader.setSource(attachments.shader_vert, attachments.shader_frag);
     * shader.addUniformStructFrag("Light", "uniformLight", [
     * { "type": "3f", "name": "position", "v1": null },
     * { "type": "4f", "name": "color", "v1": inR, v2: inG, v3: inB, v4: inAlpha }
     * ]);
     */
    addUniformStructFrag(structName, uniformName, members)
    {
        const uniforms = {};

        if (!members) return uniforms;

        for (let i = 0; i < members.length; i += 1)
        {
            const member = members[i];
            if (!this.hasUniform(uniformName + "." + member.name))
            {
                const uni = new Uniform(this, member.type, uniformName + "." + member.name, member.v1, member.v2, member.v3, member.v4, uniformName, structName, member.name);
                uni.shaderType = "frag";
                uniforms[uniformName + "." + member.name] = uni;
            }
        }

        return uniforms;
    }

    /**
     * add a struct & its uniforms to the vertex shader
     * @param {String} structName name of the struct, i.e.: LightStruct
     * @param {String} uniformName name of the struct uniform in the shader, i.e.: lightUni
     * @param {Array} members array of objects containing the struct members. see example for structure
     * @returns {object}
     * @example
     * const shader = new CGL.Shader(cgl, 'MinimalMaterial');
     * shader.setSource(attachments.shader_vert, attachments.shader_frag);
     * shader.addUniformStructVert("Light", "uniformLight", [
     * { "type": "3f", "name": "position", "v1": null },
     * { "type": "4f", "name": "color", "v1": inR, v2: inG, v3: inB, v4: inAlpha }
     * ]);
     */
    addUniformStructVert(structName, uniformName, members)
    {
        const uniforms = {};

        if (!members) return uniforms;

        for (let i = 0; i < members.length; i += 1)
        {
            const member = members[i];
            if (!this.hasUniform(uniformName + "." + member.name))
            {
                const uni = new Uniform(this, member.type, uniformName + "." + member.name, member.v1, member.v2, member.v3, member.v4, uniformName, structName, member.name);
                uni.shaderType = "vert";
                uniforms[uniformName + "." + member.name] = uni;
            }
        }

        return uniforms;
    }

    /**
     * add a struct & its uniforms to the both shaders. PLEASE NOTE: it is not possible to add the same struct to both shaders when it contains ANY integer members.
     * @param {String} structName name of the struct, i.e.: LightStruct
     * @param {String} uniformName name of the struct uniform in the shader, i.e.: lightUni
     * @param {Array} members array of objects containing the struct members. see example for structure

     * @returns {Object}
     * @example
     * const shader = new CGL.Shader(cgl, 'MinimalMaterial');
     * shader.setSource(attachments.shader_vert, attachments.shader_frag);
     * shader.addUniformStructBoth("Light", "uniformLight", [
     * { "type": "3f", "name": "position", "v1": null },
     * { "type": "4f", "name": "color", "v1": inR, v2: inG, v3: inB, v4: inAlpha }
     * ]);
     */
    addUniformStructBoth(structName, uniformName, members)
    {
        const uniforms = {};

        if (!members) return uniforms;

        for (let i = 0; i < members.length; i += 1)
        {
            const member = members[i];
            if ((member.type === "2i" || member.type === "i" || member.type === "3i"))
                this._log.error("Adding an integer struct member to both shaders can potentially error. Please use different structs for each shader. Error occured in struct:", structName, " with member:", member.name, " of type:", member.type, ".");
            if (!this.hasUniform(uniformName + "." + member.name))
            {
                const uni = new Uniform(this, member.type, uniformName + "." + member.name, member.v1, member.v2, member.v3, member.v4, uniformName, structName, member.name);
                uni.shaderType = "both";
                uniforms[uniformName + "." + member.name] = uni;
            }
        }

        return uniforms;
    }

    /**
     * @param {String} vstr
     * @param {String} fstr
     */
    _createProgram(vstr, fstr)
    {
        this._cgl.printError("before _createprogram");

        const program = this._cgl.gl.createProgram();

        this.vshader = CglShader.createShader(this._cgl, vstr, this._cgl.gl.VERTEX_SHADER, this);
        this.fshader = CglShader.createShader(this._cgl, fstr, this._cgl.gl.FRAGMENT_SHADER, this);

        if (this.vshader && this.fshader)
        {
            this._cgl.gl.attachShader(program, this.vshader);
            this._cgl.gl.attachShader(program, this.fshader);

            this._linkProgram(program, vstr, fstr);
        }
        else
        {
            this._isValid = false;
            this._cgl.printError("shader _createProgram");
            this._log.error("could not link shaderprogram");
            return null;
        }

        this._cgl.printError("shader _createProgram");
        return program;
    }

    hasErrors()
    {
        return this._hasErrors;
    }

    /**
     * @param {any} program
     * @param {string} vstr
     * @param {string} fstr
     */
    _linkProgram(program, vstr, fstr)
    {
        this._cgl.printError("before _linkprogram");

        if (this._feedBackNames.length > 0)
        {
            this._cgl.gl.transformFeedbackVaryings(program, this._feedBackNames, this._cgl.gl.SEPARATE_ATTRIBS);
            // INTERLEAVED_ATTRIBS
            // SEPARATE_ATTRIBS
        }

        this._cgl.gl.linkProgram(program);
        this._cgl.printError("gl.linkprogram");
        this._isValid = true;
        this._hasErrors = false;

        if (this._cgl.patch.config.glValidateShader !== false)
        {
            this.needsCheckLinkStatus = true;
            // this.checkLinkStatus(program);
        }
        this.#validated = false;
    }

    checkLinkStatus(program)
    {
        program = program || this._program;
        if (!program) return;
        if (!this._cgl.gl.getProgramParameter(program, this._cgl.gl.LINK_STATUS))
        {
            this._hasErrors = true;

            const infoLogFrag = this._cgl.gl.getShaderInfoLog(this.fshader);
            const infoLogVert = this._cgl.gl.getShaderInfoLog(this.vshader);

            if (this.logError)
                this._log.error(this._name + " shader linking fail...");
            else
                this._log.warn(this._name + " shader linking fail...");

            if (infoLogFrag) this._log.warn(this._cgl.gl.getShaderInfoLog(this.fshader));
            if (infoLogVert) this._log.warn(this._cgl.gl.getShaderInfoLog(this.vshader));

            const str = this._cgl.gl.getProgramInfoLog(program);
            if (str) this._log.log("shaderprogram link failed:", str);

            if (!CABLES.UI) this._log.log(this);
            this._isValid = false;

            this._cgl.printError("shader link err");
        }
        this.needsCheckLinkStatus = false;

    }

    getProgram()
    {
        return this._program;
    }

    /**
     * @param {any[]} names
     */
    setFeedbackNames(names)
    {
        this.setWhyCompile("setFeedbackNames");
        this._feedBackNames = names;
    }

    /**
      * adds attribute definition to shader header without colliding with other shader modules...
     * when attrFrag is defined, vertex shader will output this attribute to the fragment shader
     * @param {Object} attr {type:x,name:x,[nameFrag:x]}
     * @return {Object}
     */
    addAttribute(attr)
    {
        for (let i = 0; i < this._attributes.length; i++)
        {
            if (this._attributes[i].name == attr.name && this._attributes[i].nameFrag == attr.nameFrag) return;
        }
        this._attributes.push(attr);

        this.setWhyCompile("addAttribute");
    }

    bindTextures()
    {
        this._bindTextures();
    }

    _bindTextures()
    {
        if (this._textureStackTex.length > this._cgl.maxTextureUnits)
        {
            this._log.warn("[shader._bindTextures] too many textures bound", this._textureStackTex.length + "/" + this._cgl.maxTextureUnits);
        }

        // for (let i = this._textureStackTex.length + 1; i < this._cgl.maxTextureUnits; i++) this._cgl.setTexture(i, null);

        for (let i = 0; i < this._textureStackTex.length; i++)
        {
            // this._log.log(this._textureStackTex.length, i);
            if (!this._textureStackTex[i] && !this._textureStackTexCgl[i])
            {
                this._log.warn("no texture for pushtexture", this._name);
            }
            else
            {
                let t = this._textureStackTex[i];
                if (this._textureStackTexCgl[i])
                {
                    t = this._textureStackTexCgl[i].tex || Texture.getEmptyTexture(this._cgl).tex;
                }

                // if (!this._cgl.gl.isTexture(t) && !this.errrrrrrr)
                // {
                //     console.log("noooooooooooootex", i, this.name, this._textureStackTexCgl[i]);
                //     this.errrrrrrr = 1;
                // }

                let bindOk = true;

                if (!this._textureStackUni[i])
                {
                    // throw(new Error('no uniform given to texturestack'));
                    this._log.warn("no uniform for pushtexture", this._name);

                    bindOk = this._cgl.setTexture(i, t, this._textureStackType[i]);
                }
                else
                {
                    this._textureStackUni[i].setValue(i);
                    bindOk = this._cgl.setTexture(i, t, this._textureStackType[i]);

                    // this._log.log(bindOk, i, t, this._textureStackType[i]);
                }
                if (!bindOk) this._log.warn("tex bind failed", this.getName(), this._textureStackUni[i]);
            }
        }
    }

    // setUniformTexture(uni, tex)
    // {
    //     if (!uni) return;
    //     tex = tex || Texture.getTempTexture(this._cgl);
    //     for (let i = 0; i < this._textureStackUni.length; i++)
    //         if (this._textureStackUni[i] == uni)
    //         {
    //             const old = this._textureStackTex[i] || this._textureStackTexCgl[i];
    //             if (tex.hasOwnProperty("tex"))
    //             {
    //                 this._textureStackTexCgl[i] = tex;
    //                 this._textureStackTex[i] = null;
    //             }
    //             else
    //             {
    //                 this._textureStackTexCgl[i] = null;
    //                 this._textureStackTex[i] = tex;
    //             }

    //             // this._textureStackTex[i] = tex;
    //             // this._cgl.setTexture(i, tex, this._textureStackType[i]);
    //             return old;
    //         }
    //     return null;
    // }

    /**
     * push a texture on the stack. those textures will be bound when binding the shader. texture slots are automatically set
     * @param {Uniform} uniform texture uniform
     * @param {Texture} t texture
     * @param {number} type texture type, can be ignored when TEXTURE_2D
     */
    pushTexture(uniform, t, type)
    {
        if (!uniform)
        {
            // this._log.log("pushtexture: no uniform given to texturestack", "shader:"+this._name,uniform,t,type);
            return;
        }
        if (!t)
        {
            // if(uniform)this._log.warn("pushtexture: no tex","shader:"+this._name," uniform:"+uniform.name);
            return;
        }
        if (!t.hasOwnProperty("tex") && !(t instanceof WebGLTexture))
        {
            this._log.warn(new Error("invalid texture").stack);

            this._log.warn("[cgl_shader] invalid texture...", t);
            return;
        }

        this._textureStackUni.push(uniform);

        if (t.hasOwnProperty("tex"))
        {
            this._textureStackTexCgl.push(t);
            this._textureStackTex.push(null);
        }
        else
        {
            this._textureStackTexCgl.push(null);
            this._textureStackTex.push(t);
        }

        this._textureStackType.push(type);
    }

    /**
     * @param {Uniform} uni
     * @param {Texture} t
     */
    setUniformTexture(uni, t)
    {

        if (!uni) return;
        for (let i = 0; i < this._textureStackUni.length; i++)
        {

            if (this._textureStackUni[i] && this._textureStackUni[i].name == uni.name)
            {
                if (t.tex)
                {
                    this._textureStackTexCgl[i] = t;
                    this._textureStackTex[i] = null;
                }
                else
                {
                    this._textureStackTexCgl[i] = null;
                    this._textureStackTex[i] = t;
                }
                return;

            }
        }

        // console.log("setunitex not found?", uni.name);
        // for (let i = 0; i < this._textureStackUni.length; i++)
        // {
        //     console.log(this._textureStackUni[i].name == uni.name);
        // }
        // this.pushTexture(uni, t);

    }

    /**
     * pop last texture
     */
    popTexture()
    {
        this._textureStackUni.pop();
        this._textureStackTex.pop();
        this._textureStackTexCgl.pop();
        this._textureStackType.pop();
    }

    /**
     * pop all textures
     */
    popTextures()
    {
        this._textureStackTex.length =
        this._textureStackTexCgl.length =
        this._textureStackType.length =
        this._textureStackUni.length = 0;
    }

    getMaterialId()
    {
        return this._materialId;
    }

    getInfo()
    {
        const info = {};
        info.name = this._name;
        info.defines = this.getDefines();
        info.hasErrors = this.hasErrors();

        return info;
    }

    getDefaultFragmentShader(r, g, b, a)
    {
        return getDefaultFragmentShader(r, g, b, a);
    }

    getDefaultVertexShader()
    {
        return getDefaultVertexShader();
    }
}

// --------------------------

CglShader.getDefaultVertexShader = getDefaultVertexShader;
CglShader.getDefaultFragmentShader = getDefaultFragmentShader;

CglShader.getErrorFragmentShader = function ()
{
    return ""
        + nl + "void main()"
        + nl + "{"
        + nl + "   float g=mod((gl_FragCoord.y+gl_FragCoord.x),50.0)/50.0;"
        + nl + "   g= step(0.1,g);"
        + nl + "   outColor = vec4( g+0.5, 0.0, 0.0, 1.0);"
        + nl + "}";
};

/**
 * @param {CglContext} cgl
 * @param {String} str
 * @param {number} type
 * @param {CglShader} cglShader
 * @returns {CglShader}
 */
CglShader.createShader = function (cgl, str, type, cglShader)
{
    if (cgl.aborted) return;

    const shader = cgl.gl.createShader(type);
    cgl.gl.shaderSource(shader, str);
    cgl.gl.compileShader(shader);

    if (!cgl.gl.getShaderParameter(shader, cgl.gl.COMPILE_STATUS))
    {
        cglShader.error = { "str": str, "infoLog": cgl.gl.getShaderInfoLog(shader) };

        if (CABLES.UI) gui.emitEvent("ShaderError", cglShader);

        if (!cglShader.error.infoLog)
        {
            cglShader._log.warn("empty shader info log", this._name);
            return;
        }
        cglShader.setSource(CglShader.getDefaultVertexShader(), CglShader.getErrorFragmentShader());
    }
    return shader;
};



;// CONCATENATED MODULE: ./src/corelibs/cgl/cgl_renderloop.js




class CglRenderLoop extends external_CABLES_namespaceObject.RenderLoop
{

    /** @type {Patch} */
    #patch;

    /** @type {CglContext} */
    #cgl;

    #renderOneFrame;
    #animReq;

    frameNum = 0;
    onOneFrameRendered = null;
    _frameNext = 0;
    _frameInterval = 0;
    _lastFrameTime = 0;
    reqAnimTimeStamp = 0;
    _frameWasdelayed = true;
    aborted = false;

    /**
     * @param {CglContext} cgl
     * @param {Patch<any>} patch
     */
    constructor(cgl, patch)
    {
        super();
        this.#cgl = cgl;
        this.#patch = patch;
        this.#patch.renderloop = this;
        this.exec(0);
    }

    /**
     * @param {number} timestamp
     */
    exec(timestamp)
    {
        // if (!this.#renderOneFrame && (this.paused || this.aborted)) return;
        // this.emitEvent("reqAnimFrame");
        // cancelAnimationFrame(this.#animReq);

        this.#patch.config.fpsLimit = this.#patch.config.fpsLimit || 0;
        if (this.#patch.config.fpsLimit)
        {
            this._frameInterval = 1000 / this.#patch.config.fpsLimit;
        }

        const now = CABLES.now();
        const frameDelta = now - this._frameNext;

        if (this.#patch.isEditorMode())
        {
            if (!this.#renderOneFrame)
            {
                if (now - this._lastFrameTime >= 500 && this._lastFrameTime !== 0 && !this._frameWasdelayed)
                {
                    this._lastFrameTime = 0;
                    setTimeout(this.exec.bind(this), 500);
                    this.emitEvent("renderDelayStart");
                    this._frameWasdelayed = true;
                    return;
                }
            }
        }

        // console.log("text", frameDelta, this.#renderOneFrame, this.#patch.config.fpsLimit === 0, frameDelta > this._frameInterval, this._frameWasdelayed);
        if (this.#renderOneFrame || this.#patch.config.fpsLimit === 0 || frameDelta > this._frameInterval || this._frameWasdelayed)
        {
            this.renderFrame(timestamp);
            if (this._frameInterval) this._frameNext = now - (frameDelta % this._frameInterval);
        }

        if (this._frameWasdelayed)
        {
            this.emitEvent("renderDelayEnd");
            this._frameWasdelayed = false;
        }

        if (this.#renderOneFrame)
        {
            if (this.onOneFrameRendered) this.onOneFrameRendered(); // todo remove everywhere and use propper event...
            this.emitEvent(external_CABLES_namespaceObject.Patch.EVENT_RENDERED_ONE_FRAME);
            this._renderOneFrame = false;
        }

        if (this.#patch.config.doRequestAnimation)
        {
            this.#animReq = this.#patch.getDocument().defaultView.requestAnimationFrame(this.exec.bind(this));
        }
    }

    /**
     * @param {number} timestamp
     */
    renderFrame(timestamp)
    {
        // if (this.paused) return;
        const time = this.#patch.timer.getTime();
        const startTime = performance.now();
        this.#cgl.frameStartTime = this.#patch.timer.getTime();

        const delta = timestamp - this.reqAnimTimeStamp || timestamp;

        this.#patch.updateAnims(null, delta, timestamp);

        this.#cgl.profileData.profileFrameDelta = delta;
        this.reqAnimTimeStamp = timestamp;
        this.#cgl.profileData.profileOnAnimFrameOps = performance.now() - startTime;

        this.#patch.emitEvent(external_CABLES_namespaceObject.Patch.EVENT_RENDER_FRAME, time);

        this.frameNum++;
        if (this.frameNum == 1)
        {
            if (this.#patch.config.onFirstFrameRendered) this.#patch.config.onFirstFrameRendered();
        }

    }

    pause()
    {
        cancelAnimationFrame(this.#animReq);
        this.#animReq = null;
        this.paused = true;
    }

    resume()
    {
        cancelAnimationFrame(this.#animReq);
        this.paused = false;
        this.exec(0);

    }
}

;// CONCATENATED MODULE: ./src/corelibs/cgl/cgl_state.js










const BLENDS = {
    "BLEND_NONE": 0,
    "BLEND_NORMAL": 1,
    "BLEND_ADD": 2,
    "BLEND_SUB": 3,
    "BLEND_MUL": 4,
};

/**
 * cables gl context/state manager
 */
class CglContext extends CgContext
{
    #cursor = "auto";

    frameStartTime = 0;

    /**
     * @param {Patch} _patch
     */
    constructor(_patch)
    {
        super(_patch);
        this.gApi = CgContext.API_WEBGL;
        this.aborted = false;
        _patch.cgl = this;

        /** @deprecated */
        this.pushMvMatrix = this.pushModelMatrix; // deprecated and wrong... still used??
        /** @deprecated */
        this.popMvMatrix = this.popmMatrix = this.popModelMatrix;// deprecated and wrong... still used??

        this._log = new external_CABLES_SHARED_namespaceObject.Logger("cgl_context", { "onError": _patch.config.onError });

        this.lastMesh = null;
        this.glVersion = 0;
        this.glUseHalfFloatTex = false;
        this.clearCanvasTransparent = true;
        this.clearCanvasDepth = true;
        this.debugOneFrame = false;
        this.checkGlErrors = false; // true is slow // false should be default...
        this.maxTextureUnits = 0;
        this.maxVaryingVectors = 0;
        this.currentProgram = null;
        this._hadStackError = false;
        this.glSlowRendere = false;
        this._isSafariCrap = false;

        /** @type {WebGL2RenderingContext} */
        this.gl = null;

        this.#cursor = "auto";
        this._currentCursor = "";

        this._viewPortStack = [];
        this._glFrameBufferStack = [];
        this._frameBufferStack = [];
        this._shaderStack = [];
        this._stackDepthTest = [];
        this.mainloopOp = null;
        this._stackBlendMode = [];
        this._stackBlendModePremul = [];
        this._stackBlend = [];
        this._stackDepthFunc = [];
        this._stackCullFaceFacing = [];
        this._stackCullFace = [];
        this._stackDepthWrite = [];
        this._stackDepthTest = [];
        this._stackStencil = [];

        this._simpleShader = new CglShader(this, "simpleshader");
        this._simpleShader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG", "MODULE_VERTEX_MODELVIEW"]);
        this._simpleShader.setSource(CglShader.getDefaultVertexShader(), CglShader.getDefaultFragmentShader());

        this._currentShader = this._simpleShader;
        this.errorShader = null;

        this._oldCanvasWidth = -1;
        this._oldCanvasHeight = -1;
        this._enabledExtensions = {};

        this.temporaryTexture = null;
        this.errorTexture = null;
        this.tempTexture = null;
        this.blackTexture = null;
        this.randomTexture = null;
        this.getRandomFloatTexture = null;

        this.setCanvas(_patch.config.glCanvasId || _patch.config.glCanvas || "glcanvas");
        if (_patch.config.glCanvasResizeToWindow === true) this.setAutoResize("window");
        if (_patch.config.glCanvasResizeToParent === true) this.setAutoResize("parent");

        if (this.aborted) _patch.aborted = true;

        _patch.on(external_CABLES_namespaceObject.Patch.EVENT_DISPOSE, () =>
        {
            this.dispose();
        });
        _patch.on("patchClearStart", () =>
        {
            this.TextureEffectMesh = null;
        });

        this.renderLoop = new CglRenderLoop(this, _patch);
    }

    get viewPort()
    {
        if (this._viewPortStack.length > 3)
        {
            const l = this._viewPortStack.length;

            return [
                this._viewPortStack[l - 4],
                this._viewPortStack[l - 3],
                this._viewPortStack[l - 2],
                this._viewPortStack[l - 1]
            ];
        }
        else
        {
            // workaround pre viewport stack times / or+and initial value...

            return this._viewPort;
        }
    }

    get mvMatrix() // deprecate
    {
        return this.mMatrix;
    }

    set mvMatrix(m) // deprecate
    {
        this.mMatrix = m;
    }

    /**
     * @param {HTMLCanvasElement} canv
     */
    _setCanvas(canv)
    {
        if (!canv) this._log.stack("_setCanvas undef");

        if (!this.patch.config.canvas) this.patch.config.canvas = {};
        if (!this.patch.config.canvas.hasOwnProperty("preserveDrawingBuffer")) this.patch.config.canvas.preserveDrawingBuffer = true;
        if (!this.patch.config.canvas.hasOwnProperty("premultipliedAlpha")) this.patch.config.canvas.premultipliedAlpha = false;
        if (!this.patch.config.canvas.hasOwnProperty("alpha")) this.patch.config.canvas.alpha = false;

        this.patch.config.canvas.stencil = true;

        if (this.patch.config.hasOwnProperty("clearCanvasColor")) this.clearCanvasTransparent = this.patch.config.clearCanvasColor;
        if (this.patch.config.hasOwnProperty("clearCanvasDepth")) this.clearCanvasDepth = this.patch.config.clearCanvasDepth;

        // safari stuff.......... ipad is not detectable,just do it for any safari
        if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent))// && ((navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i))))
        {
            this._isSafariCrap = true;
            this.glUseHalfFloatTex = true; // 2026 did they fix it ? did hell freeze over ?? maybe remove all the workarouonds ??????
        }

        if (!this.patch.config.canvas.forceWebGl1) this.gl = canv.getContext("webgl2", this.patch.config.canvas);

        if (!this.gl || this.gl.isContextLost())
        {
            this.aborted = true;
            this._log.warn("NO_WEBGL", "sorry, could not initialize WebGL. Please check if your Browser supports WebGL or try to restart your browser.");
            return;
        }

        if (this.gl.getParameter(this.gl.VERSION) != "WebGL 1.0")
        {
            this.glVersion = 2;
        }
        else
        {
            this.gl = canv.getContext("webgl", this.patch.config.canvas) || canv.getContext("experimental-webgl", this.patch.config.canvas);
            this.glVersion = 1;

            // safari
            // if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent) && (navigator.userAgent.match(/iPhone/i)))
            // {
            //     this.glUseHalfFloatTex = true;
            // }

            // ios
            // @ts-ignore
            if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)
            {
                if (!this.patch.config.canvas.hasOwnProperty("powerPreference")) this.patch.config.canvas.powerPreference = "high-performance";
            }

            this.enableExtension("OES_standard_derivatives");
            // this.enableExtension("GL_OES_standard_derivatives");
            const instancingExt = this.enableExtension("ANGLE_instanced_arrays") || this.gl;
            if (instancingExt.vertexAttribDivisorANGLE)
            {
                this.gl.vertexAttribDivisor = instancingExt.vertexAttribDivisorANGLE.bind(instancingExt);
                this.gl.drawElementsInstanced = instancingExt.drawElementsInstancedANGLE.bind(instancingExt);
            }
        }

        const dbgRenderInfo = this.enableExtension("WEBGL_debug_renderer_info");
        if (dbgRenderInfo)
        {
            this.glRenderer = this.gl.getParameter(dbgRenderInfo.UNMASKED_RENDERER_WEBGL);
            if (this.glRenderer === "Google SwiftShader") this.glSlowRenderer = true;
        }

        this.canvas.addEventListener("webglcontextlost", (event) =>
        {
            if (this.aborted) return this._log.warn("[cgl_state] aborted context lost... can be ignored...");
            this._log.error("canvas lost...", event);
            this.emitEvent("webglcontextlost");
            this.aborted = true;
        });

        this.maxAnisotropic = 0;
        if (this.enableExtension("EXT_texture_filter_anisotropic"))
            this.maxAnisotropic = this.gl.getParameter(this.enableExtension("EXT_texture_filter_anisotropic").MAX_TEXTURE_MAX_ANISOTROPY_EXT);

        this.maxVaryingVectors = this.gl.getParameter(this.gl.MAX_VARYING_VECTORS);
        this.maxTextureUnits = this.gl.getParameter(this.gl.MAX_TEXTURE_IMAGE_UNITS);
        this.maxTexSize = this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE);
        this.maxUniformsFrag = this.gl.getParameter(this.gl.MAX_FRAGMENT_UNIFORM_VECTORS);
        this.maxUniformsVert = this.gl.getParameter(this.gl.MAX_VERTEX_UNIFORM_VECTORS);
        this.maxSamples = 0;
        if (this.gl.MAX_SAMPLES) this.maxSamples = this.gl.getParameter(this.gl.MAX_SAMPLES);

        if (this.glVersion == 1)
        {
            this.enableExtension("OES_standard_derivatives");
            const instancingExt = this.enableExtension("ANGLE_instanced_arrays") || this.gl;

            if (instancingExt.vertexAttribDivisorANGLE)
            {
                this.gl.vertexAttribDivisor = instancingExt.vertexAttribDivisorANGLE.bind(instancingExt);
                this.gl.drawElementsInstanced = instancingExt.drawElementsInstancedANGLE.bind(instancingExt);
            }
        }

        this.DEPTH_FUNCS = [
            this.gl.NEVER,
            this.gl.ALWAYS,
            this.gl.LESS,
            this.gl.LEQUAL,
            this.gl.GREATER,
            this.gl.GEQUAL,
            this.gl.EQUAL,
            this.gl.NOTEQUAL
        ];
        this.CULL_MODES = [
            null,
            this.gl.BACK,
            this.gl.FRONT,
            this.gl.FRONT_AND_BACK
        ];
    }

    getInfo()
    {
        return {
            "glVersion": this.glVersion,
            "glRenderer": this.glRenderer,
            "glUseHalfFloatTex": this.glUseHalfFloatTex,
            "maxVaryingVectors": this.maxVaryingVectors,
            "maxTextureUnits": this.maxTextureUnits,
            "maxTexSize": this.maxTexSize,
            "maxUniformsFrag": this.maxUniformsFrag,
            "maxUniformsVert": this.maxUniformsVert,
            "maxSamples": this.maxSamples
        };
    }

    /**
     * @function popViewPort
     * @memberof Context
     * @instance
     * @description pop viewPort stack
     */
    popViewPort()
    {
        this._viewPortStack.pop();
        this._viewPortStack.pop();
        this._viewPortStack.pop();
        this._viewPortStack.pop();

        if (this._viewPortStack.length == 0)
            this.setViewPort(0, 0, this.canvasWidth, this.canvasHeight);
        else
            this.setViewPort(this._viewPortStack[this._viewPort.length - 4], this._viewPortStack[this._viewPort.length - 3], this._viewPortStack[this._viewPort.length - 2], this._viewPortStack[this._viewPort.length - 1]);
    }

    /**
     * @function pushViewPort
     * @memberof Context
     * @instance
     * @description push a new viewport onto stack
     * @param {Number} x
     * @param {Number} y
     * @param {Number} w
     * @param {Number} h
     */

    pushViewPort(x, y, w, h)
    {
        this._viewPortStack.push(x, y, w, h);
        this.setViewPort(x, y, w, h);
    }

    // old
    getViewPort()
    {
        return this._viewPort;
    }

    // old
    resetViewPort()
    {
        this.gl.viewport(this._viewPort[0], this._viewPort[1], this._viewPort[2], this._viewPort[3]);
    }

    // old
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     */
    setViewPort(x, y, w, h)
    {
        this._viewPort[0] = Math.round(x);
        this._viewPort[1] = Math.round(y);
        this._viewPort[2] = Math.round(w);
        this._viewPort[3] = Math.round(h);
        this.gl.viewport(this._viewPort[0], this._viewPort[1], this._viewPort[2], this._viewPort[3]);
    }

    /**
     * @param {function} cb
     * @param {boolean} doScreenshotClearAlpha
     * @param {string} mimeType
     * @param {number} quality
     */
    screenShot(cb, doScreenshotClearAlpha, mimeType, quality)
    {
        if (doScreenshotClearAlpha)
        {
            this.gl.clearColor(1, 1, 1, 1);
            this.gl.colorMask(false, false, false, true);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            this.gl.colorMask(true, true, true, true);
        }

        if (this.canvas && this.canvas.toBlob)
        {
            this.canvas.toBlob(
                (blob) =>
                {
                    if (cb) cb(blob);
                    else this._log.log("no screenshot callback...");
                }, mimeType, quality);
        }
    }

    endFrame()
    {
        if (this.patch.isEditorMode()) CABLES.GL_MARKER.drawMarkerLayer(this);

        this.setPreviousShader();

        if (this._vMatrixStack.length() > 0) this.logStackError("view matrix stack length !=0 at end of rendering...");
        if (this._mMatrixStack.length() > 0) this.logStackError("mvmatrix stack length !=0 at end of rendering...");
        if (this._pMatrixStack.length() > 0) this.logStackError("pmatrix stack length !=0 at end of rendering...");
        if (this._glFrameBufferStack.length > 0) this.logStackError("glFrameBuffer stack length !=0 at end of rendering...");
        if (this._stackDepthTest.length > 0) this.logStackError("depthtest stack length !=0 at end of rendering...");
        if (this._stackDepthWrite.length > 0) this.logStackError("depthwrite stack length !=0 at end of rendering...");
        if (this._stackDepthFunc.length > 0) this.logStackError("depthfunc stack length !=0 at end of rendering...");
        if (this._stackBlend.length > 0) this.logStackError("blend stack length !=0 at end of rendering...");
        if (this._stackBlendMode.length > 0) this.logStackError("blendMode stack length !=0 at end of rendering...");
        if (this._shaderStack.length > 0) this.logStackError("this._shaderStack length !=0 at end of rendering...");
        if (this._stackCullFace.length > 0) this.logStackError("this._stackCullFace length !=0 at end of rendering...");
        if (this._stackCullFaceFacing.length > 0) this.logStackError("this._stackCullFaceFacing length !=0 at end of rendering...");
        if (this._viewPortStack.length > 0) this.logStackError("viewport stack length !=0 at end of rendering...");

        this._frameStarted = false;

        if (this._oldCanvasWidth != this.canvasWidth || this._oldCanvasHeight != this.canvasHeight)
        {
            this._oldCanvasWidth = this.canvasWidth;
            this._oldCanvasHeight = this.canvasHeight;
            this.emitEvent(CgContext.EVENT_RESIZE);
        }

        if (this.#cursor != this._currentCursor)
        {
            this._currentCursor = this.canvas.style.cursor = this.#cursor;
        }

        this.emitEvent("endframe");

        this.fpsCounter.endFrame();
    }

    logStackError(str)
    {
        if (!this._hadStackError)
        {
            this._hadStackError = true;
            this._log.warn("[" + this.canvas.id + "]: ", str);
        }
    }

    // shader stack
    getShader()
    {
        if (this._currentShader) if (!this.tempData || ((this.tempData.renderOffscreen === true) == this._currentShader.offScreenPass) === true) return this._currentShader;

        for (let i = this._shaderStack.length - 1; i >= 0; i--)
            if (this._shaderStack[i])
                if (this.tempData.renderOffscreen == this._shaderStack[i].offScreenPass)
                    return this._shaderStack[i];
    }

    getDefaultShader()
    {
        return this._simpleShader;
    }

    /**
     * @deprecated
     * @param {Shader} s
     */
    setShader(s)
    {
        this.pushShader(s);
    }

    /**
     * push a shader to the shader stack
     * @function pushShader
     * @memberof Context
     * @instance
     * @param {Shader} shader
     * @function
     */
    pushShader(shader)
    {

        if (this.tempData.forceShaderMods && !this.tempData.shadowPass)
        {
            for (let i = 0; i < this.tempData.forceShaderMods.length; i++)
            {
                // if (!currentShader.forcedMod && currentShader != this.tempData.forceShaderMods[i])
                // {
                //     currentShader.forcedMod = this.tempData.forceShaderMods[i];
                shader = this.tempData.forceShaderMods[i].bind(shader, false);
                // }
                // return currentShader;
                // if (this.tempData.forceShaderMods[i].currentShader() && shader != this.tempData.forceShaderMods[i].currentShader().shader)
            }
        }

        this._shaderStack.push(shader);
        this._currentShader = shader;
    }

    popShader()
    {
        this.setPreviousShader();
    }

    /**
     * pop current used shader from shader stack
     * @function popShader
     * @memberof Context
     * @instance
     * @function
     */
    setPreviousShader()
    {
        if (this.tempData.forceShaderMods && !this.tempData.shadowPass)
        {
            for (let i = 0; i < this.tempData.forceShaderMods.length; i++)
            {
                // const a =
                this.tempData.forceShaderMods[i].unbind(false);
                // if (a) return;
                // this.popShader();
            }
        }

        if (this._shaderStack.length === 0) throw new Error("Invalid shader stack pop!");
        this._shaderStack.pop();
        this._currentShader = this._shaderStack[this._shaderStack.length - 1];
    }

    /**
     * push a framebuffer to the framebuffer stack
     * @function pushGlFrameBuffer
     * @memberof Context
     * @instance
     * @param {Object} fb framebuffer
     * @function
     */
    pushGlFrameBuffer(fb)
    {
        this._glFrameBufferStack.push(fb);
    }

    /**
     * pop framebuffer stack
     * @function popGlFrameBuffer
     * @memberof Context
     * @instance
     * @returns {Object} current framebuffer or null
     */
    popGlFrameBuffer()
    {
        if (this._glFrameBufferStack.length == 0) return null;
        this._glFrameBufferStack.pop();
        return this._glFrameBufferStack[this._glFrameBufferStack.length - 1];
    }

    /**
     * get current framebuffer
     * @function getCurrentFrameBuffer
     * @memberof Context
     * @instance
     * @returns {Object} current framebuffer or null
     */
    getCurrentGlFrameBuffer()
    {
        if (this._glFrameBufferStack.length === 0) return null;
        return this._glFrameBufferStack[this._glFrameBufferStack.length - 1];
    }

    /**
     * push a framebuffer to the framebuffer stack
     * @function pushGlFrameBuffer
     * @memberof Context
     * @instance
     * @param {Framebuffer2} fb framebuffer
     */
    pushFrameBuffer(fb)
    {
        this._frameBufferStack.push(fb);
    }

    /**
     * pop framebuffer stack
     * @function popFrameBuffer
     * @memberof Context
     * @instance
     * @returns {Framebuffer2} current framebuffer or null
     */
    popFrameBuffer()
    {
        if (this._frameBufferStack.length == 0) return null;
        this._frameBufferStack.pop();
        return this._frameBufferStack[this._frameBufferStack.length - 1];
    }

    /**
     * get current framebuffer
     * @function getCurrentFrameBuffer
     * @memberof Context
     * @instance
     * @returns {Framebuffer2} current framebuffer or null
     */
    getCurrentFrameBuffer()
    {
        if (this._frameBufferStack.length === 0) return null;
        return this._frameBufferStack[this._frameBufferStack.length - 1];
    }

    renderStart(cgl, identTranslate, identTranslateView)
    {
        this.fpsCounter.startFrame();
        this.pushDepthTest(true);
        this.pushDepthWrite(true);
        this.pushDepthFunc(cgl.gl.LEQUAL);
        this.pushCullFaceFacing(cgl.gl.BACK);
        this.pushCullFace(false);

        // if (this.clearCanvasTransparent)
        // {
        //     cgl.gl.clearColor(0, 0, 0, 0);
        //     cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT);
        // }
        // if (this.clearCanvasDepth) cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT);

        cgl.setViewPort(0, 0, cgl.canvasWidth, cgl.canvasHeight);

        this._startMatrixStacks(identTranslate, identTranslateView);

        cgl.pushBlendMode(CONSTANTS.BLEND_MODES.BLEND_NORMAL, false);

        for (let i = 0; i < this._textureslots.length; i++) this._textureslots[i] = null;

        this.pushShader(this._simpleShader);

        this._frameStarted = true;

        this._execOneTimeCallbacks();

        for (let i = 0; i < this._textureslots.length; i++)
        {
            this.gl.activeTexture(this.gl.TEXTURE0 + i);
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
            this._textureslots[i] = null;
        }

        this.emitEvent("beginFrame");
    }

    /**
     * @param {CglContext} cgl
     */
    renderEnd(cgl, endFrame = true)
    {
        this._endMatrixStacks();

        this.popDepthTest();
        this.popDepthWrite();
        this.popDepthFunc();
        this.popCullFaceFacing();
        this.popCullFace();
        this.popBlend();
        this.popBlendMode();

        if (endFrame)cgl.endFrame();

        this.emitEvent("endFrame");
    }

    /**
     * @param {number} slot
     */
    getTexture(slot)
    {
        return this._textureslots[slot];
    }

    hasFrameStarted()
    {
        return this._frameStarted;
    }

    /**
     * log warning to console if the rendering of one frame has not been started / handy to check for async problems
     * @function checkFrameStarted
     * @memberof Context
     * @param {string} string
     * @instance
     */
    checkFrameStarted(string)
    {
        if (CABLES.UI && CABLES.UI.showDevInfo && !this._frameStarted)
        {
            this._log.warn("frame not started " + string);

            Error.stackTraceLimit = 25;
            external_CABLES_namespaceObject.utils.logStack();
            this.patch.printTriggerStack();
        }
    }

    /**
     * @param {number} slot
     * @param {WebGLTexture} t
     * @param {undefined} [type]
     */
    setTexture(slot, t, type)
    {
        this.checkFrameStarted("cgl setTexture");

        if (t === null) t = Texture.getEmptyTexture(this).tex;

        if (this._textureslots[slot] != t)
        {
            this.gl.activeTexture(this.gl.TEXTURE0 + slot);
            try
            {

                this.gl.bindTexture(type || this.gl.TEXTURE_2D, t);
            }
            catch (e)
            {
                console.log(e, t);
            }
            this._textureslots[slot] = t;
        }

        return true;
    }

    fullScreen()
    {
        if (this.canvas.requestFullscreen) this.canvas.requestFullscreen();
        else if (this.canvas.mozRequestFullScreen) this.canvas.mozRequestFullScreen();
        else if (this.canvas.webkitRequestFullscreen) this.canvas.webkitRequestFullscreen();
        else if (this.canvas.msRequestFullscreen) this.canvas.msRequestFullscreen();
    }

    /**
     * @param {string} [str]
     */
    printError(str)
    {
        if (!this.checkGlErrors) return;
        let found = false;
        let error = this.gl.getError();

        if (error != this.gl.NO_ERROR)
        {
            let errStr = "";
            if (error == this.gl.OUT_OF_MEMORY) errStr = "OUT_OF_MEMORY";
            if (error == this.gl.INVALID_ENUM) errStr = "INVALID_ENUM";
            if (error == this.gl.INVALID_OPERATION) errStr = "INVALID_OPERATION";
            if (error == this.gl.INVALID_FRAMEBUFFER_OPERATION) errStr = "INVALID_FRAMEBUFFER_OPERATION";
            if (error == this.gl.INVALID_VALUE) errStr = "INVALID_VALUE";
            if (error == this.gl.CONTEXT_LOST_WEBGL)
            {
                this.aborted = true;
                errStr = "CONTEXT_LOST_WEBGL";
            }
            if (error == this.gl.NO_ERROR) errStr = "NO_ERROR";

            found = true;

            this._log.warn("gl error [" + this.canvas.id + "]: ", str, error, errStr);

            if (this.canvas.id.includes("glGuiCanvas"))
                if (!this._loggedGlError)
                {
                    this.patch.printTriggerStack();
                    this._log.stack("glerror");
                    this._loggedGlError = true;
                }
        }
        error = this.gl.getError();

        return found;
    }

    _dispose()
    {
        this._simpleShader.dispose();
        this.gl = null;
    }

    // state depthtest

    /**
     * push depth testing enabled state
     * @function pushDepthTest
     * @param {Boolean} enabled
     * @memberof Context
     * @instance
     */

    pushDepthTest(enabled)
    {
        this._stackDepthTest.push(enabled);
        if (!enabled) this.gl.disable(this.gl.DEPTH_TEST);
        else this.gl.enable(this.gl.DEPTH_TEST);
    }

    /**
     * current state of depth testing
     * @function stateCullFace
     * @returns {Boolean} enabled
     * @memberof Context
     * @instance
     */
    stateDepthTest()
    {
        return this._stackDepthTest[this._stackDepthTest.length - 1];
    }

    /**
     * pop depth testing state
     * @function popCullFace
     * @memberof Context
     * @instance
     */
    popDepthTest()
    {
        this._stackDepthTest.pop();

        if (!this._stackDepthTest[this._stackDepthTest.length - 1]) this.gl.disable(this.gl.DEPTH_TEST);
        else this.gl.enable(this.gl.DEPTH_TEST);
    }

    // --------------------------------------
    // state depthwrite

    /**
     * push depth write enabled state
     * @function pushDepthTest
     * @param {Boolean} enabled
     * @memberof Context
     * @instance
     */
    pushDepthWrite(enabled)
    {
        enabled = enabled || false;
        this._stackDepthWrite.push(enabled);
        this.gl.depthMask(enabled);
    }

    /**
     * current state of depth writing
     * @function stateDepthWrite
     * @returns {Boolean} enabled
     * @memberof Context
     * @instance
     */
    stateDepthWrite()
    {
        return this._stackDepthWrite[this._stackDepthWrite.length - 1];
    }

    /**
     * pop depth writing state
     * @function popDepthWrite
     * @memberof Context
     * @instance
     */
    popDepthWrite()
    {
        this._stackDepthWrite.pop();
        this.gl.depthMask(this._stackDepthWrite[this._stackDepthWrite.length - 1] || false);
    }

    // --------------------------------------
    // state CullFace

    /**
     * push face culling face enabled state
     * @function pushCullFace
     * @param {Boolean} enabled
     * @memberof Context
     * @instance
     */
    pushCullFace(enabled)
    {
        this._stackCullFace.push(enabled);

        if (enabled) this.gl.enable(this.gl.CULL_FACE);
        else this.gl.disable(this.gl.CULL_FACE);
    }

    /**
     * current state of face culling
     * @function stateCullFace
     * @returns {Boolean} enabled
     * @memberof Context
     * @instance
     */
    stateCullFace()
    {
        return this._stackCullFace[this._stackCullFace.length - 1];
    }

    /**
     * pop face culling enabled state
     * @function popCullFace
     * @memberof Context
     * @instance
     */
    popCullFace()
    {
        this._stackCullFace.pop();

        if (this._stackCullFace[this._stackCullFace.length - 1]) this.gl.enable(this.gl.CULL_FACE);
        else this.gl.disable(this.gl.CULL_FACE);
    }

    // --------------------------------------
    // state CullFace Facing

    /**
     * push face culling face side
     * @function pushCullFaceFacing
     * @param {Number} face - cgl.gl.FRONT_AND_BACK, cgl.gl.BACK or cgl.gl.FRONT
     * @memberof Context
     * @instance
     */

    pushCullFaceFacing(face)
    {
        this._stackCullFaceFacing.push(face);
        this.gl.cullFace(this._stackCullFaceFacing[this._stackCullFaceFacing.length - 1]);
    }

    /**
     * current state of face culling side
     * @function stateCullFaceFacing
     * @returns {Boolean} enabled
     * @memberof Context
     * @instance
     */
    stateCullFaceFacing()
    {
        return this._stackCullFaceFacing[this._stackCullFaceFacing.length - 1];
    }

    /**
     * pop face culling face side
     * @function popCullFaceFacing
     * @memberof Context
     * @instance
     */
    popCullFaceFacing()
    {
        this._stackCullFaceFacing.pop();
        if (this._stackCullFaceFacing.length > 0) this.gl.cullFace(this._stackCullFaceFacing[this._stackCullFaceFacing.length - 1]);
    }

    // --------------------------------------
    // state depthfunc

    /**
     * enable / disable depth testing
     * like `gl.depthFunc(boolean);`
     * @function pushDepthFunc
     * @memberof Context
     * @instance
     * @param {Boolean} f depthtesting
     */
    pushDepthFunc(f)
    {
        this._stackDepthFunc.push(f);
        this.gl.depthFunc(f);
    }

    /**
     * current state of blend
     * @function stateDepthFunc
     * @memberof Context
     * @instance
     * @returns {Boolean} depth testing enabled/disabled
     */
    stateDepthFunc()
    {
        if (this._stackDepthFunc.length > 0) return this._stackDepthFunc[this._stackDepthFunc.length - 1];
        return false;
    }

    /**
     * pop depth testing and set the previous state
     * @function popDepthFunc
     * @memberof Context
     * @instance
     */
    popDepthFunc()
    {
        this._stackDepthFunc.pop();
        if (this._stackDepthFunc.length > 0) this.gl.depthFunc(this._stackDepthFunc[this._stackDepthFunc.length - 1]);
    }

    // --------------------------------------
    // state blending

    /**
     * enable / disable blend
     * like gl.enable(gl.BLEND); / gl.disable(gl.BLEND);
     * @function pushBlend
     * @memberof Context
     * @instance
     * @param {boolean} b blending
     */
    pushBlend(b)
    {
        this._stackBlend.push(b);
        if (!b) this.gl.disable(this.gl.BLEND);
        else this.gl.enable(this.gl.BLEND);
    }

    /**
     * pop blend state and set the previous state
     * @function popBlend
     * @memberof Context
     * @instance
     */
    popBlend()
    {
        this._stackBlend.pop();

        if (!this._stackBlend[this._stackBlend.length - 1]) this.gl.disable(this.gl.BLEND);
        else this.gl.enable(this.gl.BLEND);
    }

    /**
     * current state of blend
     * @function stateBlend
     * @returns {boolean} blending enabled/disabled
     * @memberof Context
     * @instance
     */
    stateBlend()
    {
        return this._stackBlend[this._stackBlend.length - 1];
    }

    /**
     * push and switch to predefined blendmode (CONSTANTS.BLEND_MODES.BLEND_NONE,CONSTANTS.BLEND_MODES.BLEND_NORMAL,CONSTANTS.BLEND_MODES.BLEND_ADD,CONSTANTS.BLEND_MODES.BLEND_SUB,CONSTANTS.BLEND_MODES.BLEND_MUL)
     * @function pushBlendMode
     * @memberof Context
     * @instance
     * @param {Number} blendMode
     * @param {Boolean} premul premultiplied mode
     */
    pushBlendMode(blendMode, premul)
    {
        this._stackBlendMode.push(blendMode);
        this._stackBlendModePremul.push(premul);

        const n = this._stackBlendMode.length - 1;

        this.pushBlend(this._stackBlendMode[n] !== CONSTANTS.BLEND_MODES.BLEND_NONE);
        this._setBlendMode(this._stackBlendMode[n], this._stackBlendModePremul[n]);
    }

    /**
     * pop predefined blendmode / switch back to previous blendmode
     * @function popBlendMode
     * @memberof Context
     * @instance
     */
    popBlendMode()
    {
        this._stackBlendMode.pop();
        this._stackBlendModePremul.pop();

        const n = this._stackBlendMode.length - 1;

        this.popBlend();

        if (n >= 0) this._setBlendMode(this._stackBlendMode[n], this._stackBlendModePremul[n]);
    }

    // --------------------------------------
    // state stencil

    /**
     * enable / disable stencil testing

    * @function pushStencil
    * @memberof Context
    * @instance
    * @param {Boolean} b enable
    */
    pushStencil(b)
    {
        this._stackStencil.push(b);
        if (!b) this.gl.disable(this.gl.STENCIL_TEST);
        else this.gl.enable(this.gl.STENCIL_TEST);
    }

    /**
     * pop stencil test state and set the previous state
     * @function popStencil
     * @memberof Context
     * @instance
     */
    popStencil()
    {
        this._stackStencil.pop();

        if (!this._stackStencil[this._stackStencil.length - 1]) this.gl.disable(this.gl.STENCIL_TEST);
        else this.gl.enable(this.gl.STENCIL_TEST);
    }

    // --------------------------------------

    /**
     * @param {WebGLProgram} prog
     * @param {string} name
     */
    glGetAttribLocation(prog, name)
    {
        const l = this.gl.getAttribLocation(prog, name);
        if (l == -1) this.profileData.count("invalidAttribLoc");
        return l;
    }

    /**
     * should an op now draw helpermeshes
     * @param {Op} op
     */
    shouldDrawHelpers(op)
    {
        if (this.tempData.shadowPass) return false;
        if (!op.patch.isEditorMode()) return false;
        return gui.shouldDrawOverlay;
    }

    /**
     * @param {number} blendMode
     * @param {boolean} premul
     */
    _setBlendMode(blendMode, premul)
    {
        const gl = this.gl;

        if (blendMode == CONSTANTS.BLEND_MODES.BLEND_NONE)
        {
            // this.gl.disable(this.gl.BLEND);
        }
        else if (blendMode == CONSTANTS.BLEND_MODES.BLEND_ADD)
        {
            if (premul)
            {
                gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
                gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ONE, gl.ONE);
            }
            else
            {
                gl.blendEquation(gl.FUNC_ADD);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
            }
        }
        else if (blendMode == CONSTANTS.BLEND_MODES.BLEND_SUB)
        {
            if (premul)
            {
                gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
                gl.blendFuncSeparate(gl.ZERO, gl.ZERO, gl.ONE_MINUS_SRC_COLOR, gl.ONE_MINUS_SRC_ALPHA);
            }
            else
            {
                gl.blendEquation(gl.FUNC_ADD);
                gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_COLOR);
            }
        }
        else if (blendMode == CONSTANTS.BLEND_MODES.BLEND_MUL)
        {
            if (premul)
            {
                gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
                gl.blendFuncSeparate(gl.ZERO, gl.SRC_COLOR, gl.ZERO, gl.SRC_ALPHA);
            }
            else
            {
                gl.blendEquation(gl.FUNC_ADD);
                gl.blendFunc(gl.ZERO, gl.SRC_COLOR);
            }
        }
        else if (blendMode == CONSTANTS.BLEND_MODES.BLEND_NORMAL)
        {
            if (premul)
            {
                gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
                gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            }
            else
            {
                gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
                gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            }
        }
        else
        {
            this._log.log("setblendmode: unknown blendmode");
        }
    }

    /**
     * @param {Geometry} geom
     * @param {import("./cgl_mesh.js").CglMeshOptions} options
     */
    createMesh(geom, options)
    {
        if (external_CABLES_namespaceObject.utils.isNumeric(options))options = { "glPrimitive": options }; // old constructor fallback...
        return new Mesh(this, geom, options);
    }

    /**
     * set cursor
     * @function setCursor
     * @memberof Context
     * @instance
     * @param {String} str css cursor string
     */
    setCursor(str)
    {
        this.#cursor = str;
    }

    /**
     * enable a webgl extension
     * @function enableExtension
     * @memberof Context
     * @instance
     * @param {String} name extension name
     * @returns {Object} extension object or null
     */
    enableExtension(name)
    {
        if (!this.gl) return null;

        if (this._enabledExtensions.hasOwnProperty(name))
            return this._enabledExtensions[name];

        const o = this.gl.getExtension(name);
        this._enabledExtensions[name] = o;

        if (!o) this._log.warn("[cgl_state] extension not available " + name);

        return o;
    }

    getErrorShader()
    {
        if (this.errorShader) return this.errorShader;

        this.errorShader = new CglShader(this, "errormaterial");
        this.errorShader.setSource(CglShader.getDefaultVertexShader(), CglShader.getErrorFragmentShader());
        return this.errorShader;
    }

}

;// CONCATENATED MODULE: ./src/corelibs/cgl/cgl_texture.js





const cgl_texture_DEFAULT_TEXTURE_SIZE = 8;

const log = new external_CABLES_SHARED_namespaceObject.Logger("cgl_texture");

/**
 * @typedef CglTextureOptions
 * @property {string} [name]
 * @property {string} [pixelFormat]
 * @property {number} [type]
 * @property {number} [width]
 * @property {number} [height]
 * @property {boolean} [compression]
 * @property {number} [textureType]
 * @property {number} [filter]
 * @property {number} [wrap]
 * @property {boolean} [unpackAlpha]
 * @property {boolean} [flip]
 * @property {boolean} [shadowMap]
 * @property {number} [anisotropic]
 * @property {boolean} [isDepthTexture]
 * @property {boolean} [isFloatingPointTexture]
 */

/**
 * A Texture
 * @namespace external:CGL
 * @class
 * @param {CglContext} __cgl cgl
 * @param {Object} options
 * @hideconstructor
 * @example
 * // generate a 256x256 pixel texture of random colors
 * const size=256;
 * const data = new Uint8Array(size*size*4);
 *
 * for(var x=0;x<size*size*4;x++) data[ x*4+3]=255;
 *
 * const tex=new CGL.Texture(cgl);
 * tex.initFromData(data,size,size,CGL.Texture.FILTER_NEAREST,CGL.Texture.WRAP_REPEAT);
 */
class Texture extends CgTexture
{

    /**
     * @param {CglContext} __cgl
     * @param {CglTextureOptions} options
     */

    disposable = true;

    constructor(__cgl, options = {})
    {
        super(options);
        if (!__cgl) throw new Error("no cgl");

        this._cgl = __cgl;
        this._log = new external_CABLES_SHARED_namespaceObject.Logger("tex");
        this.tex = this._cgl.gl.createTexture();
        this.loading = false;

        /** @type {boolean} */
        this.flip = true;
        this.flipped = false;
        this.shadowMap = false;
        this.deleted = false;
        this.image = null;
        this.anisotropic = 0;
        this.filter = Texture.FILTER_NEAREST;
        this.wrap = Texture.WRAP_CLAMP_TO_EDGE;
        this.texTarget = this._cgl.gl.TEXTURE_2D;
        if (options && options.type) this.texTarget = options.type;
        this.textureType = Texture.TYPE_DEFAULT;

        /** @type {boolean} */
        this.unpackAlpha = true;
        this._fromData = true;
        this.cubemap = null;

        this._glDataType = -1;
        this._glInternalFormat = -1;
        this._glDataFormat = -1;
        this.compression = false;

        this.memItem = new external_CABLES_namespaceObject.MemProfilerItem("texture " + this.name, "texture");

        if (options)
        {
            if (options.isDepthTexture) this.textureType = Texture.TYPE_DEPTH;
            if (options.isFloatingPointTexture === true) this.textureType = Texture.TYPE_FLOAT;

            if ("compression" in options) this.compression = options.compression;
            if ("textureType" in options) this.textureType = options.textureType;
            if ("filter" in options) this.filter = options.filter;
            if ("wrap" in options) this.wrap = options.wrap;
            if ("unpackAlpha" in options) this.unpackAlpha = options.unpackAlpha;
            if ("flip" in options) this.flip = options.flip;
            if ("shadowMap" in options) this.shadowMap = options.shadowMap;
            if ("anisotropic" in options) this.anisotropic = options.anisotropic;
            if ("pixelFormat" in options) this.pixelFormat = options.pixelFormat;

        }
        else
        {
            options = {};
        }

        if (!options.pixelFormat && options.isFloatingPointTexture) this.pixelFormat = Texture.PFORMATSTR_RGBA32F;

        if (this.textureType == Texture.TYPE_DEPTH) this.pixelFormat = Texture.PFORMATSTR_DEPTH;

        // this._cgl.profileData.profileTextureNew++;
        this._cgl.profileData.count("texturecreated");

        this.setFormat(Texture.setUpGlPixelFormat(this._cgl, this.pixelFormat));
        this._cgl.profileData.addHeavyEvent("texture created", this.name, options.width + "x" + options.height);

        this.setSize(options.width, options.height);

        this.getInfoOneLine();

        this.updateMemory();
    }

    isFloatingPoint()
    {
        return Texture.isPixelFormatFloat(this.pixelFormat);
    }

    /**
     * returns true if otherTexture has same options (width/height/filter/wrap etc)
     * @function compareSettings
     * @memberof Texture
     * @instance
     * @param {Texture} tex otherTexture
     * @returns {Boolean}
     */
    compareSettings(tex)
    {
    // if (!tex) { this._log.warn("compare: no tex"); return false; }
    // if (tex.width != this.width) this._log.warn("tex.width not equal", tex.width, this.width);
    // if (tex.height != this.height) this._log.warn("tex.height not equal", tex.height, this.height);
    // if (tex.filter != this.filter) this._log.warn("tex.filter not equal");
    // if (tex.wrap != this.wrap) this._log.warn("tex.wrap not equal");
    // if (tex.textureType != this.textureType) this._log.warn("tex.textureType not equal");
    // if (tex.unpackAlpha != this.unpackAlpha) this._log.warn("tex.unpackAlpha not equal");
    // if (tex.anisotropic != this.anisotropic) this._log.warn("tex.anisotropic not equal");
    // if (tex.shadowMap != this.shadowMap) this._log.warn("tex.shadowMap not equal");
    // if (tex.texTarget != this.texTarget) this._log.warn("tex.texTarget not equal");
    // if (tex.flip != this.flip) this._log.warn("tex.flip not equal");

        if (!tex) return false;
        return (
            tex.width == this.width &&
            tex.height == this.height &&
            tex.filter == this.filter &&
            tex.wrap == this.wrap &&
            tex.textureType == this.textureType &&
            tex.unpackAlpha == this.unpackAlpha &&
            tex.anisotropic == this.anisotropic &&
            tex.shadowMap == this.shadowMap &&
            tex.texTarget == this.texTarget &&
            tex.flip == this.flip
        );
    }

    /**
     * returns a new texture with the same settings (does not copy texture itself)
     * @function clone
     * @memberof Texture
     * @instance
     * @returns {Texture}
     */
    clone()
    {
        const newTex = new Texture(this._cgl, {
            "name": this.name,
            "filter": this.filter,
            "anisotropic": this.anisotropic,
            "wrap": this.wrap,
            "textureType": this.textureType,
            "pixelFormat": this.pixelFormat,
            "unpackAlpha": this.unpackAlpha,
            "flip": this.flip,
            "width": this.width,
            "height": this.height
        });

        this._cgl.profileData.addHeavyEvent("texture created", this.name, this.width + "x" + this.height);

        if (!this.compareSettings(newTex))
        {
            this._log.error("Cloned texture settings do not compare!");
            this._log.error(this);
            this._log.error(newTex);
        }

        return newTex;
    }

    /**
     * @param {object} o
     */
    setFormat(o)
    {
        this.pixelFormat = o.pixelFormat;
        this._glDataFormat = o.glDataFormat;
        this._glInternalFormat = o.glInternalFormat;
        this._glDataType = o.glDataType;
    }

    updateMemory()
    {
        this.memItem.setSizeGpu(this.width * this.height * 4);
        this.memItem.name = this.name + " " + this.width + "x" + this.height;
    }

    /**
     * set pixel size of texture
     * @function setSize
     * @param {Number} w width
     * @param {Number} h height
     */
    setSize(w, h)
    {
        if (this.compression) return;
        if (this._cgl.aborted) return;
        if (w != w || w <= 0 || !w) w = cgl_texture_DEFAULT_TEXTURE_SIZE;
        if (h != h || h <= 0 || !h) h = cgl_texture_DEFAULT_TEXTURE_SIZE;

        if (w > this._cgl.maxTexSize || h > this._cgl.maxTexSize) this._log.error("texture size too big! " + w + "x" + h + " / max: " + this._cgl.maxTexSize);

        w = Math.min(w, this._cgl.maxTexSize);
        h = Math.min(h, this._cgl.maxTexSize);

        w = Math.floor(w);
        h = Math.floor(h);
        if (this.width == w && this.height == h) return;

        w = this._cgl.checkTextureSize(w);
        h = this._cgl.checkTextureSize(h);

        this.width = w;
        this.height = h;
        this.deleted = false;

        this.setFormat(Texture.setUpGlPixelFormat(this._cgl, this.pixelFormat));

        this.shortInfoString = this.getInfoOneLine();// w + "x" + h + "";

        this._cgl.gl.bindTexture(this.texTarget, this.tex);
        this._cgl.profileData.count("textureResize");

        const uarr = null;

        this.glTexImage2D(this.texTarget, 0, this._glInternalFormat, w, h, 0, this._glDataFormat, this._glDataType, uarr);

        this._setFilter();

        this.updateMipMap();
        this.updateMemory();

        this._cgl.gl.bindTexture(this.texTarget, null);
    }

    glTexImage2D(...args)
    {
        if (this.compression)
            this._cgl.gl.compressedTexImage2D(...args);
        else
            this._cgl.gl.texImage2D(...args);

    }

    /**
     * @function initFromData
     * @memberof Texture
     * @instance
     * @description create texturem from rgb data
     * @param {Array<Number>} data rgb color array [r,g,b,a,r,g,b,a,...]
     * @param {Number} w width
     * @param {Number} h height
     * @param {Number} filter
     * @param {Number} wrap
     */
    initFromData(data, w, h, filter, wrap)
    {
        const measure = this._cgl.profileData.start("texture.initfromdata ");
        this.filter = filter;
        this.wrap = wrap;
        if (filter == undefined) this.filter = Texture.FILTER_LINEAR;
        if (wrap == undefined) this.wrap = Texture.WRAP_CLAMP_TO_EDGE;
        this.width = w;
        this.height = h;
        this._fromData = true;
        this.deleted = false;

        if (this.height > this._cgl.maxTexSize || this.width > this._cgl.maxTexSize)
        {
            const t = CGL.Texture.getTempTexture(this._cgl);
            this.width = t.width;
            this.height = t.height;
            this.tex = t.tex;
            this._log.warn("[cgl_texture] texture size too big!", this.width, this.height, this._cgl.maxTexSize);
            return;
        }

        if (this.flip) this._cgl.gl.pixelStorei(this._cgl.gl.UNPACK_FLIP_Y_WEBGL, this.flip);

        this._cgl.gl.bindTexture(this.texTarget, this.tex);

        this.setFormat(Texture.setUpGlPixelFormat(this._cgl, this.pixelFormat, this._fromData));

        // this.filter = Texture.FILTER_NEAREST;

        // this._glDataType = this._cgl.gl.HALF_FLOAT;
        // console.log("jajajajaj", this._glInternalFormat == this._cgl.gl.RGBA16F, this._glDataFormat == this._cgl.gl.RGBA, this._glDataType == this._cgl.gl.HALF_FLOAT, this.getInfoOneLine());

        this.glTexImage2D(this.texTarget, 0, this._glInternalFormat, w, h, 0, this._glDataFormat, this._glDataType, data);

        this._setFilter();
        this.updateMipMap();

        if (this.flip) this._cgl.gl.pixelStorei(this._cgl.gl.UNPACK_FLIP_Y_WEBGL, false);
        this._cgl.gl.bindTexture(this.texTarget, null);
        measure.finish();

        this.updateMemory();
    }

    /**
     * @param {Object[]} mips
     */
    initFromMipMapData(mips)
    {
        this._cgl.gl.bindTexture(this.texTarget, this.tex);

        for (let i = 0; i < mips.length; i++)
        {
            this.glTexImage2D(this._cgl.gl.TEXTURE_2D, i, this._glDataFormat, mips[i].width, mips[i].height, 0, mips[i].data);
            this._setFilter();
        }

        this._cgl.gl.bindTexture(this.texTarget, null);
        this.updateMemory();
    }

    updateMipMap()
    {
        if ((this._cgl.glVersion == 2 || this.isPowerOfTwo()) && this.filter == Texture.FILTER_MIPMAP)
        {
            this._cgl.gl.generateMipmap(this.texTarget);
            this._cgl.profileData.count("textureGenMipMap");
        }
    }

    /**
     * set texture data from an image/canvas object
     * @function initTexture
     * @memberof Texture
     * @instance
     * @param {Object} img image
     * @param {Number} [filter]
     * @param {boolean} [noflipping]
     */
    initTexture(img, filter = null, noflipping)
    {
        const measure = this._cgl.profileData.start("texture.initTex ");
        this._cgl.printError("before initTexture");
        this._cgl.checkFrameStarted("texture inittexture");
        this._fromData = false;

        this._cgl.gl.pixelStorei(this._cgl.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.unpackAlpha);
        if (img.width || img.videoWidth) this.width = img.videoWidth || img.width;
        if (img.height || img.videoHeight) this.height = img.videoHeight || img.height;

        if (filter !== null) this.filter = filter; // todo: can we remove this filter param?

        if (img.height > this._cgl.maxTexSize || img.width > this._cgl.maxTexSize)
        {
            const t = CGL.Texture.getTempTexture(this._cgl);
            this.width = t.width;
            this.height = t.height;
            this.tex = t.tex;
            this._log.warn("[cgl_texture] texture size too big!", img.width, img.height, this._cgl.maxTexSize);

            this.updateMemory();
            return;
        }

        this._cgl.gl.bindTexture(this.texTarget, this.tex);

        this.deleted = false;
        this.flipped = !this.flip;
        if (!noflipping && this.flipped) this._cgl.gl.pixelStorei(this._cgl.gl.UNPACK_FLIP_Y_WEBGL, this.flipped);

        this.setFormat(Texture.setUpGlPixelFormat(this._cgl, this.pixelFormat));

        this.glTexImage2D(this.texTarget, 0, this._glInternalFormat, this._glDataFormat, this._glDataType, img);

        this._setFilter();
        this.updateMipMap();
        this.updateMemory();

        this._cgl.gl.bindTexture(this.texTarget, null);
        if (!noflipping) this._cgl.gl.pixelStorei(this._cgl.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        if (!noflipping) if (this.flipped) this._cgl.gl.pixelStorei(this._cgl.gl.UNPACK_FLIP_Y_WEBGL, false);

        this.getInfoOneLine();
        measure.finish();
        this._cgl.printError("initTexture");
    }

    /**
     * delete texture. use this when texture is no longer needed
     */
    dispose()
    {
        this.delete();
        this.memItem.dispose();
        return Texture.getTempTexture(this._cgl);
    }

    delete()
    {
        if (!this.disposable) return;

        if (this.loading)
        {
            // cant delete texture when still loading
            // setTimeout(this.delete.bind(this), 50);
            return;
        }

        this.deleted = true;
        this.width = 0;
        this.height = 0;
        this.updateMemory();

        this._cgl.profileData.count("textureDelete");
        this.image = null;
        CABLES.idleCallback(() =>
        {
            this._cgl.gl.deleteTexture(this.tex);
            this.tex = null;
        });
    }

    /**
     * @function isPowerOfTwo
     * @memberof Texture
     * @instance
     * @description return true if texture width and height are both power of two
     * @return {Boolean}
     */
    isPowerOfTwo()
    {
        return Texture.isPowerOfTwo(this.width) && Texture.isPowerOfTwo(this.height);
    }

    printInfo()
    {
        log.log(this.getInfo());
    }

    getInfoReadable()
    {
        const info = this.getInfo();
        let html = "";

        info.name = info.name.substr(0, info.name.indexOf("?rnd="));

        for (const i in info)
        {
            html += "* " + i + ":  **" + info[i] + "**\n";
        }

        return html;
    }

    getInfoOneLine()
    {
        let txt = "" + this.width + "x" + this.height;
        txt += " ";
        // if (this.textureType === CGL.Texture.TYPE_FLOAT) txt += " 32bit"; else txt += " 8bit";
        // if (this.textureType === CGL.Texture.TYPE_FLOAT) txt += " 32bit"; else txt += " 8bit";
        txt += this.pixelFormat;

        if (this.filter === Texture.FILTER_NEAREST) txt += " nearest";
        if (this.filter === Texture.FILTER_LINEAR) txt += " linear";
        if (this.filter === Texture.FILTER_MIPMAP) txt += " mipmap";

        if (this.wrap === Texture.WRAP_CLAMP_TO_EDGE) txt += " clamp";
        if (this.wrap === Texture.WRAP_REPEAT) txt += " repeat";
        if (this.wrap === Texture.WRAP_MIRRORED_REPEAT) txt += " repeatmir";

        this.shortInfoString = txt;

        return txt;
    }

    getInfoOneLineShort()
    {
        let txt = "" + this.width + "x" + this.height;
        // if (this.textureType === CGL.Texture.TYPE_FLOAT) txt += " 32bit"; else txt += " 8bit";
        txt += " ";
        txt += this.pixelFormat;

        this.shortInfoString = txt;

        return txt;
    }

    getInfo()
    {
        return Texture.getTexInfo(this);
    }

    _setFilter()
    {
        this._cgl.printError("before _setFilter");

        if (!this._fromData)
        {
            this._cgl.gl.pixelStorei(this._cgl.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.unpackAlpha);
        }

        if (this.shadowMap)
        {
            this._cgl.gl.texParameteri(this._cgl.gl.TEXTURE_2D, this._cgl.gl.TEXTURE_COMPARE_MODE, this._cgl.gl.COMPARE_REF_TO_TEXTURE);
            this._cgl.gl.texParameteri(this._cgl.gl.TEXTURE_2D, this._cgl.gl.TEXTURE_COMPARE_FUNC, this._cgl.gl.LEQUAL);
        }

        if (this.textureType == Texture.TYPE_FLOAT && this.filter == Texture.FILTER_MIPMAP)
        {
            this.filter = Texture.FILTER_LINEAR;
            this._log.stack("texture: HDR and mipmap filtering at the same time is not possible");
        }

        if (this._cgl.glVersion == 1 && !this.isPowerOfTwo())
        {
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MAG_FILTER, this._cgl.gl.NEAREST);
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MIN_FILTER, this._cgl.gl.NEAREST);

            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_S, this._cgl.gl.CLAMP_TO_EDGE);
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_T, this._cgl.gl.CLAMP_TO_EDGE);

            this.filter = Texture.FILTER_NEAREST;
            this.wrap = Texture.WRAP_CLAMP_TO_EDGE;
        }
        else
        {
            if (this.wrap == Texture.WRAP_CLAMP_TO_EDGE)
            {
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_S, this._cgl.gl.CLAMP_TO_EDGE);
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_T, this._cgl.gl.CLAMP_TO_EDGE);
            }
            else if (this.wrap == Texture.WRAP_REPEAT)
            {
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_S, this._cgl.gl.REPEAT);
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_T, this._cgl.gl.REPEAT);
            }
            else if (this.wrap == Texture.WRAP_MIRRORED_REPEAT)
            {
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_S, this._cgl.gl.MIRRORED_REPEAT);
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_T, this._cgl.gl.MIRRORED_REPEAT);
            }

            if (this.filter == Texture.FILTER_NEAREST)
            {
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MAG_FILTER, this._cgl.gl.NEAREST);
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MIN_FILTER, this._cgl.gl.NEAREST);
            }
            else if (this.filter == Texture.FILTER_LINEAR)
            {
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MIN_FILTER, this._cgl.gl.LINEAR);
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MAG_FILTER, this._cgl.gl.LINEAR);
            }
            else if (this.filter == Texture.FILTER_MIPMAP)
            {
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MAG_FILTER, this._cgl.gl.LINEAR);
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MIN_FILTER, this._cgl.gl.LINEAR_MIPMAP_LINEAR);
            }
            else
            {
                this._log.log("unknown texture filter!", this.filter);
                throw new Error("unknown texture filter!" + this.filter);
            }

            if (this.anisotropic)
            {
                const ext = this._cgl.enableExtension("EXT_texture_filter_anisotropic");

                if (this._cgl.maxAnisotropic)
                {
                    const aniso = Math.min(this._cgl.maxAnisotropic, this.anisotropic);
                    this._cgl.gl.texParameterf(this._cgl.gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, aniso);
                }
            }
        }
        this.getInfoOneLine();
        this._cgl.printError("_setFilter");
    }

    /**
     * load an image from an url
     * @param {CglContext} cgl
     * @param {String} url
     * @param {Function} finishedCallback
     * @param {Object} settings
     * @param {Op} [op]

     * @return {Texture}
     */
    static load(cgl, url, finishedCallback, settings, op)
    {
        if (!url) return finishedCallback({ "error": true });
        let loadingId = null;
        if (!cgl.patch.loading.existByName(url)) loadingId = cgl.patch.loading.start("cgl.texture", url, op);

        const texture = new Texture(cgl);
        if (url.startsWith("blob:")) texture.name = +"blob";
        else texture.name = url + "";

        if (settings && settings.hasOwnProperty("filter")) texture.filter = settings.filter;
        if (settings && settings.hasOwnProperty("name")) texture.name = settings.name;
        if (settings && settings.hasOwnProperty("flip")) texture.flip = settings.flip;
        if (settings && settings.hasOwnProperty("wrap")) texture.wrap = settings.wrap;
        if (settings && settings.hasOwnProperty("anisotropic")) texture.anisotropic = settings.anisotropic;
        if (settings && settings.hasOwnProperty("unpackAlpha")) texture.unpackAlpha = settings.unpackAlpha;
        if (settings && settings.hasOwnProperty("pixelFormat")) texture.pixelFormat = settings.pixelFormat;

        if (!settings.imgBitmap)
        {
            console.warn("old texture loader");

            const measure = cgl.profileData.start("old texture load");

            texture.image = new Image();
            texture.image.crossOrigin = "anonymous";
            texture.loading = true;
            texture.image.onabort = texture.image.onerror = (e) =>
            {
                console.warn("[cgl.texture.load] error loading texture", url, e);
                texture.loading = false;
                if (loadingId) cgl.patch.loading.finished(loadingId);
                const error = { "error": true };
                if (finishedCallback) finishedCallback(error, texture);
                measure.finish();
            };

            texture.image.onload = function (e)
            {
                cgl.addNextFrameOnceCallback(() =>
                {
                    texture.initTexture(texture.image);
                    if (loadingId) cgl.patch.loading.finished(loadingId);
                    texture.loading = false;

                    measure.finish();
                    if (finishedCallback) finishedCallback(null, texture);
                });
            };
            texture.image.src = url;

        }
        else
        {
            fetch(url).then((r) =>
            {
                r.blob().then((blob) =>
                {

                    /** @type {ImageBitmapOptions} */
                    const bmpOptions = {
                        "colorSpaceConversion": "none",
                        "premultiplyAlpha": "none"
                    };

                    if (!settings.flip) bmpOptions.imageOrientation = "flipY";

                    createImageBitmap(blob, bmpOptions).then((bitmap) =>
                    {

                        texture.initTexture(bitmap, null, true);
                        if (loadingId) cgl.patch.loading.finished(loadingId);
                        texture.loading = false;

                        if (finishedCallback) finishedCallback(null, texture);

                        CABLES.idleCallback(() =>
                        {
                            bitmap.close();
                        });

                    }).catch((e) =>
                    {
                        console.log("tex create err", e);
                        texture.loading = false;
                        if (loadingId) cgl.patch.loading.finished(loadingId);
                        if (finishedCallback) finishedCallback(e, texture);
                    });

                }).catch((e) =>
                {
                    console.log("tex blob err", e);
                    texture.loading = false;
                    if (loadingId) cgl.patch.loading.finished(loadingId);
                    if (finishedCallback) finishedCallback(e, texture);
                });
            }).catch((e) =>
            {
                console.log("tex fetch err", e);
                texture.loading = false;
                if (loadingId) cgl.patch.loading.finished(loadingId);
                if (finishedCallback) finishedCallback(e, texture);
            });

        }
        return texture;
    }

    /**
     * @static
     * @function getTempTexture
     * @memberof Texture
     * @description returns the default temporary texture (grey diagonal stipes)
     * @return {Texture}
     * @param {CglContext} cgl
     */
    static getTempTexture(cgl)
    {
        if (!cgl) console.error("[getTempTexture] no cgl!");
        if (!cgl.tempTexture) cgl.tempTexture = Texture.getTemporaryTexture(cgl, 256, Texture.FILTER_LINEAR, Texture.WRAP_REPEAT);
        cgl.tempTexture.disposable = false;
        return cgl.tempTexture;
    }

    /**
     * @static
     * @function getErrorTexture
     * @memberof Texture
     * @description returns the default temporary texture (grey diagonal stipes)
     * @param {CglContext} cgl
     * @return {Texture}
     */
    static getErrorTexture(cgl)
    {
        if (!cgl) console.error("[getTempTexture] no cgl!");
        if (!cgl.errorTexture) cgl.errorTexture = Texture.getTemporaryTexture(cgl, 256, Texture.FILTER_LINEAR, Texture.WRAP_REPEAT, 1, 0.2, 0.2);
        cgl.errorTexture.disposable = false;
        return cgl.errorTexture;
    }

    /**
 * @function getEmptyTexture
 * @memberof Texture
 * @instance
 * @param cgl
 * @param fp
 * @description returns a reference to a small empty (transparent) texture
 * @return {Texture}
 */
    static getEmptyTexture(cgl, fp)
    {
        if (fp) return Texture.getEmptyTextureFloat(cgl);
        if (!cgl) console.error("[getEmptyTexture] no cgl!");
        if (cgl.tempTextureEmpty) return cgl.tempTextureEmpty;

        let size = 8;

        cgl.tempTextureEmpty = new Texture(cgl, { "name": "emptyTexture" });
        const data = Texture.getDefaultTextureData("empty", size);

        cgl.tempTextureEmpty.initFromData(data, size, size, Texture.FILTER_NEAREST, Texture.WRAP_REPEAT);

        return cgl.tempTextureEmpty;
    }

    /**
 * @function getEmptyTextureFloat
 * @memberof Texture
 * @instance
 * @param cgl
 * @description returns a reference to a small empty (transparent) 32bit texture
 * @return {Texture}
 */
    static getEmptyTextureFloat(cgl)
    {
        if (!cgl) console.error("[getEmptyTextureFloat] no cgl!");
        if (cgl.tempTextureEmptyFloat) return cgl.tempTextureEmptyFloat;

        cgl.tempTextureEmptyFloat = new Texture(cgl, { "name": "emptyTexture", "isFloatingPointTexture": true });
        const data = new Float32Array(8 * 8 * 4).fill(1);
        for (let i = 0; i < 8 * 8 * 4; i += 4) data[i + 3] = 0;

        cgl.tempTextureEmptyFloat.initFromData(data, 8, 8, Texture.FILTER_NEAREST, Texture.WRAP_REPEAT);

        return cgl.tempTextureEmptyFloat;
    }

    /**
     * @description returns a reference to a random texture
     * @return {Texture}
     * @param {CglContext} cgl
     */
    static getRandomTexture(cgl)
    {
        if (!cgl) console.error("[getRandomTexture] no cgl!");
        if (cgl.randomTexture) return cgl.randomTexture;

        const size = 256;
        const data = Texture.getDefaultTextureData("randomUInt", size);

        cgl.randomTexture = new Texture(cgl);
        cgl.randomTexture.initFromData(data, size, size, Texture.FILTER_NEAREST, Texture.WRAP_REPEAT);

        return cgl.randomTexture;
    }

    /**
     * @description returns a reference to a texture containing random numbers between -1 and 1
     * @return {Texture}
     * @param {CglContext} cgl
     */
    static getRandomFloatTexture(cgl)
    {
        if (!cgl) console.error("[getRandomTexture] no cgl!");
        if (cgl.getRandomFloatTexture) return cgl.getRandomFloatTexture;

        const size = 256;
        const data = Texture.getDefaultTextureData("randomFloat", size);

        cgl.getRandomFloatTexture = new Texture(cgl, { "isFloatingPointTexture": true });
        cgl.getRandomFloatTexture.initFromData(data, size, size, Texture.FILTER_NEAREST, Texture.WRAP_REPEAT);

        return cgl.getRandomFloatTexture;
    }

    /**
 * @param {CglContext} cgl
 * @description returns a reference to a black texture
 * @return {Texture}
 */
    static getBlackTexture(cgl)
    {
        if (cgl.blackTexture) return cgl.blackTexture;
        cgl.blackTexture = Texture.getColorTexture(cgl, 0, 0, 0, 1);
        return cgl.blackTexture;
    }

    /**
     * @param {CglContext} cgl
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {number} a
     */
    static getColorTexture(cgl, r, g, b, a)
    {
        const size = 8;
        const data = Texture.getDefaultTextureData("color", size, { "r": r, "g": g, "b": b, "a": a });

        const ctex = new Texture(cgl);
        ctex.initFromData(data, size, size, Texture.FILTER_NEAREST, Texture.WRAP_REPEAT);

        return ctex;
    }

    /**
     * @description returns an empty cubemap texture with rgba = [0, 0, 0, 0]
     * @return {Texture}
     * @param {CglContext} cgl
     */
    static getEmptyCubemapTexture(cgl)
    {
        const faces = [
            cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            cgl.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            cgl.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            cgl.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ];

        const tex = cgl.gl.createTexture();
        const target = cgl.gl.TEXTURE_CUBE_MAP;
        const filter = Texture.FILTER_NEAREST;
        const wrap = Texture.WRAP_CLAMP_TO_EDGE;
        const width = 8;
        const height = 8;

        cgl.profileData.count("texturecreated");

        cgl.gl.bindTexture(target, tex);
        cgl.profileData.count("textureResize");

        for (let i = 0; i < 6; i += 1)
        {
            const data = new Uint8Array(8 * 8 * 4);

            cgl.gl.texImage2D(faces[i], 0, cgl.gl.RGBA, 8, 8, 0, cgl.gl.RGBA, cgl.gl.UNSIGNED_BYTE, data);
            cgl.gl.texParameteri(target, cgl.gl.TEXTURE_MAG_FILTER, cgl.gl.NEAREST);
            cgl.gl.texParameteri(target, cgl.gl.TEXTURE_MIN_FILTER, cgl.gl.NEAREST);

            cgl.gl.texParameteri(target, cgl.gl.TEXTURE_WRAP_S, cgl.gl.CLAMP_TO_EDGE);
            cgl.gl.texParameteri(target, cgl.gl.TEXTURE_WRAP_T, cgl.gl.CLAMP_TO_EDGE);
        }

        cgl.gl.bindTexture(target, null);

        return {
            "id": external_CABLES_namespaceObject.utils.uuid(),
            "tex": tex,
            "cubemap": tex,
            "width": width,
            "height": height,
            "filter": filter,
            "wrap": wrap,
            "unpackAlpha": true,
            "flip": true,
            "_fromData": true,
            "name": "emptyCubemapTexture",
            "anisotropic": 0
        };
    }

    /**
     * @deprecated
     * @param {CglContext} cgl
     */
    static getTempGradientTexture(cgl) // deprecated...
    {
        if (!cgl) console.error("[getTempGradientTexture] no cgl!");
        return Texture.getTempTexture(cgl);
    }

    /**
     * @param {CglContext} cgl
     * @param {number} size
     * @param {number} filter
     * @param {number} wrap
     * @param {number} [r]
     * @param {number} [g]
     * @param {number} [b]
     */
    static getTemporaryTexture(cgl, size, filter, wrap, r, g, b)
    {
        const data = Texture.getDefaultTextureData("stripes", 256, { "r": r, "g": g, "b": b });
        const temptex = new Texture(cgl);
        temptex.initFromData(data, size, size, filter, wrap);
        return temptex;
    }

    /**
 * create texturem from image data (e.g. image or canvas)
 * @param {CglContext} cgl
 * @param {Object} img image
 * @param {Object} options
 */
    static createFromImage = function (cgl, img, options)
    {
        options = options || {};
        const texture = new Texture(cgl, options);
        texture.flip = false;
        texture.image = img;
        texture.width = img.videoWidth || img.width || 8;
        texture.height = img.videoHeight || img.height || 8;
        if (options.hasOwnProperty("wrap"))texture.wrap = options.wrap;

        texture.initTexture(img, options.filter);

        return texture;
    };

    /**
     * @deprecated
     * @param {CglContext} cgl
     * @param {any} img
     * @param {number} filter
     * @param {number} wrap
     */
    static fromImage(cgl, img, filter, wrap)
    {
        console.error("deprecated texture from image...");

        const texture = new Texture(cgl);
        texture.flip = false;
        if (filter) texture.filter = filter;
        if (wrap) texture.wrap = wrap;
        texture.image = img;
        texture.initTexture(img);
        return texture;
    }

    /**
 * @static
 * @description returns true if x is power of two
 * @param {Number} x
 * @return {Boolean}
 */
    static isPowerOfTwo(x)
    {
        return x == 1 || x == 2 || x == 4 || x == 8 || x == 16 || x == 32 || x == 64 || x == 128 || x == 256 || x == 512 || x == 1024 || x == 2048 || x == 4096 || x == 8192 || x == 16384;
    }

    /**
     * @param {Texture} tex
     */
    static getTexInfo(tex)
    {
        const obj = {};

        obj.name = tex.name;
        obj["power of two"] = tex.isPowerOfTwo();
        obj.size = tex.width + " x " + tex.height;

        let targetString = tex.texTarget;
        if (tex.texTarget == tex._cgl.gl.TEXTURE_2D) targetString = "TEXTURE_2D";
        obj.target = targetString;

        obj.unpackAlpha = tex.unpackAlpha;

        if (tex.cubemap)obj.cubemap = true;

        if (tex.textureType == Texture.TYPE_FLOAT) obj.textureType = "TYPE_FLOAT";

        // else if (tex.textureType == Texture.TYPE_HALF_FLOAT) obj.textureType = "TYPE_HALF_FLOAT";
        else if (tex.textureType == Texture.TYPE_DEPTH) obj.textureType = "TYPE_DEPTH";
        else if (tex.textureType == Texture.TYPE_DEFAULT) obj.textureType = "TYPE_DEFAULT";
        else obj.textureType = "UNKNOWN " + tex.textureType;

        if (tex.wrap == Texture.WRAP_CLAMP_TO_EDGE) obj.wrap = "CLAMP_TO_EDGE";
        else if (tex.wrap == Texture.WRAP_REPEAT) obj.wrap = "WRAP_REPEAT";
        else if (tex.wrap == Texture.WRAP_MIRRORED_REPEAT) obj.wrap = "WRAP_MIRRORED_REPEAT";
        else obj.wrap = "UNKNOWN";

        if (tex.filter == Texture.FILTER_NEAREST) obj.filter = "FILTER_NEAREST";
        else if (tex.filter == Texture.FILTER_LINEAR) obj.filter = "FILTER_LINEAR";
        else if (tex.filter == Texture.FILTER_MIPMAP) obj.filter = "FILTER_MIPMAP";
        else obj.filter = "UNKNOWN";

        obj.pixelFormat = tex.pixelFormat || "unknown";

        return obj;
    }

    /**
     * @param {CglContext} cgl
     * @param {string} pixelFormatStr
     */
    static setUpGlPixelFormat(cgl, pixelFormatStr, fromData)
    {
        const o = {};

        if (!pixelFormatStr)
        {
            cgl._log.error("no pixelformatstr!");
            cgl._log.log(new Error());
            pixelFormatStr = Texture.PFORMATSTR_RGBA8UB;
        }

        o.pixelFormatBase = pixelFormatStr;
        o.pixelFormat = pixelFormatStr;
        o.glDataType = cgl.gl.UNSIGNED_BYTE;
        o.glInternalFormat = cgl.gl.RGBA8;
        o.glDataFormat = cgl.gl.RGBA;

        let floatDatatype = cgl.gl.FLOAT;

        // const hasExt = cgl.enableExtension("EXT_color_buffer_half_float");
        if (cgl.glUseHalfFloatTex && !fromData)
        {
            if (pixelFormatStr == Texture.PFORMATSTR_RGBA32F) pixelFormatStr = Texture.PFORMATSTR_RGBA16F;
            if (pixelFormatStr == Texture.PFORMATSTR_RG32F) pixelFormatStr = Texture.PFORMATSTR_RG16F;
            if (pixelFormatStr == Texture.PFORMATSTR_R32F) pixelFormatStr = Texture.PFORMATSTR_R16F;
        }

        if (pixelFormatStr.includes("16bit"))
        {
            if (cgl.glVersion == 2)
            {
                // cgl.enableExtension("OES_texture_half_float");
                const hasExt = cgl.enableExtension("EXT_color_buffer_half_float");

                if (!hasExt)
                {
                    console.warn("no 16bit extension, fallback to 32bit", pixelFormatStr);
                    // fallback to 32 bit?
                    if (pixelFormatStr == Texture.PFORMATSTR_RGBA16F) pixelFormatStr = Texture.PFORMATSTR_RGBA32F;
                    if (pixelFormatStr == Texture.PFORMATSTR_RGB16F) pixelFormatStr = Texture.PFORMATSTR_RGB32F;
                    if (pixelFormatStr == Texture.PFORMATSTR_RG16F) pixelFormatStr = Texture.PFORMATSTR_RG32F;
                    if (pixelFormatStr == Texture.PFORMATSTR_R16F) pixelFormatStr = Texture.PFORMATSTR_R32F;
                }
                else
                {
                    floatDatatype = cgl.gl.HALF_FLOAT;
                }
            }
        }

        if (cgl.glVersion == 1)
        {
            o.glInternalFormat = cgl.gl.RGBA;

            if (pixelFormatStr == Texture.PFORMATSTR_RGBA16F || pixelFormatStr == Texture.PFORMATSTR_RG16F || pixelFormatStr == Texture.PFORMATSTR_R16F)
            {
                const ext = cgl.enableExtension("OES_texture_half_float");
                if (!ext) throw new Error("no half float texture extension");

                floatDatatype = ext.HALF_FLOAT_OES;
            }
        }

        if (pixelFormatStr == Texture.PFORMATSTR_RGBA8UB)
        {
        }
        else if (pixelFormatStr == Texture.PFORMATSTR_RGB565)
        {
            o.glInternalFormat = cgl.gl.RGB565;
            o.glDataFormat = cgl.gl.RGB;
        }
        else if (pixelFormatStr == Texture.PFORMATSTR_R8UB)
        {
            o.glInternalFormat = cgl.gl.R8;
            o.glDataFormat = cgl.gl.RED;
        }
        else if (pixelFormatStr == Texture.PFORMATSTR_RG8UB)
        {
            o.glInternalFormat = cgl.gl.RG8;
            o.glDataFormat = cgl.gl.RG;
        }
        else if (pixelFormatStr == Texture.PFORMATSTR_RGB8UB)
        {
            o.glInternalFormat = cgl.gl.RGB8;
            o.glDataFormat = cgl.gl.RGB;
        }
        else if (pixelFormatStr == Texture.PFORMATSTR_SRGBA8)
        {
            o.glInternalFormat = cgl.gl.SRGB8_ALPHA8;
        }

        else if (pixelFormatStr == Texture.PFORMATSTR_R32F)
        {
            o.glInternalFormat = cgl.gl.R32F;
            o.glDataFormat = cgl.gl.RED;
            o.glDataType = floatDatatype;
        }
        else if (pixelFormatStr == Texture.PFORMATSTR_R16F)
        {
            o.glInternalFormat = cgl.gl.R16F;
            o.glDataType = floatDatatype;
            o.glDataFormat = cgl.gl.RED;
        }
        else if (pixelFormatStr == Texture.PFORMATSTR_RG16F)
        {
            o.glInternalFormat = cgl.gl.RG16F;
            o.glDataType = floatDatatype;
            o.glDataFormat = cgl.gl.RG;
        }
        else if (pixelFormatStr == Texture.PFORMATSTR_RGBA16F)
        {
            if (cgl.glVersion == 1) o.glInternalFormat = cgl.gl.RGBA;
            else o.glInternalFormat = cgl.gl.RGBA16F;
            o.glDataType = floatDatatype;
        }
        else if (pixelFormatStr == Texture.PFORMATSTR_R11FG11FB10F)
        {
            o.glInternalFormat = cgl.gl.R11F_G11F_B10F;
            o.glDataType = floatDatatype;
            o.glDataFormat = cgl.gl.RGB;
        }
        else if (pixelFormatStr == Texture.PFORMATSTR_RGBA32F)
        {
            if (cgl.glVersion == 1) o.glInternalFormat = cgl.gl.RGBA;
            else o.glInternalFormat = cgl.gl.RGBA32F;
            o.glDataType = floatDatatype;
        }
        else if (pixelFormatStr == Texture.PFORMATSTR_DEPTH)
        {
            if (cgl.glVersion == 1)
            {
                o.glInternalFormat = cgl.gl.DEPTH_COMPONENT;
                o.glDataType = cgl.gl.UNSIGNED_SHORT;
                o.glDataFormat = cgl.gl.DEPTH_COMPONENT;
            }
            else
            {
                o.glInternalFormat = cgl.gl.DEPTH_COMPONENT32F;
                o.glDataType = cgl.gl.FLOAT;
                o.glDataFormat = cgl.gl.DEPTH_COMPONENT;
            }
        }
        else
        {
            log.log("unknown pixelformat ", pixelFormatStr);
        }

        /// //////

        if (pixelFormatStr.includes("32bit") || pixelFormatStr == Texture.PFORMATSTR_R11FG11FB10F)
        {
            if (cgl.glVersion == 2) cgl.enableExtension("EXT_color_buffer_float");
            if (cgl.glVersion == 2) cgl.enableExtension("EXT_float_blend");

            cgl.enableExtension("OES_texture_float_linear"); // yes, i am sure, this is a webgl 1 and 2 ext
        }

        o.numColorChannels = Texture.getPixelFormatNumChannels(pixelFormatStr);

        if (!o.glDataType || !o.glInternalFormat || !o.glDataFormat) log.log("pixelformat wrong ?!", pixelFormatStr, o.glDataType, o.glInternalFormat, o.glDataFormat, this);

        return o;
    }

    /**
     * @param {string} pxlFrmtStr
     */
    static getPixelFormatNumChannels(pxlFrmtStr)
    {
        if (pxlFrmtStr.startsWith("RGBA")) return 4;
        if (pxlFrmtStr.startsWith("RGB")) return 3;
        if (pxlFrmtStr.startsWith("RG")) return 2;
        return 1;
    }

    /**
     * @param {string} pxlFrmtStr
     */
    static isPixelFormatFloat(pxlFrmtStr)
    {
        return (pxlFrmtStr || "").includes("float");
    }

    /**
     * @param {string} pxlFrmtStr
     */
    static isPixelFormatHalfFloat(pxlFrmtStr)
    {
        return (pxlFrmtStr || "").includes("float") && (pxlFrmtStr || "").includes("16bit");
    }

}

external_CABLES_namespaceObject.Op.prototype.outTexture = function (name, v)
{
    const p = this.addOutPort(
        this.newPort(this, name, external_CABLES_namespaceObject.Port.TYPE_OBJECT, {
            "preview": true,
            "objType": "texture",
            "display": "texture"
        })
    );
    if (v !== undefined) p.setRef(v || Texture.getEmptyTexture(this.patch.cgl));

    p.ignoreValueSerialize = true;
    return p;
};

;// CONCATENATED MODULE: ./src/corelibs/cgl/cgl_framebuffer2.js




class Framebuffer2
{

    /**
     * @param {CglContext} cgl
     * @param {number} w
     * @param {number} h
     * @param {object} options
     */
    constructor(cgl, w, h, options)
    {
        this._log = new external_CABLES_SHARED_namespaceObject.Logger("cgl_framebuffer2");
        if (cgl.glVersion == 1) this._log.error("framebuffer2 used on webgl1");
        this.Framebuffer2DrawTargetsDefault = null;
        this.Framebuffer2BlittingFramebuffer = null;
        this.Framebuffer2FinalFramebuffer = null;
        this._cgl = cgl;

        this._cgl.printError("before framebuffer2 constructor");

        this._width = 0;
        this._height = 0;
        this.valid = true;

        this._depthRenderbuffer = null;
        this._frameBuffer = null;
        this._textureFrameBuffer = null;
        this._colorRenderbuffers = [];
        this._drawTargetArray = [];
        this._disposed = false;

        if (!this.Framebuffer2BlittingFramebuffer) this.Framebuffer2BlittingFramebuffer = cgl.gl.createFramebuffer();
        if (!this.Framebuffer2FinalFramebuffer) this.Framebuffer2FinalFramebuffer = cgl.gl.createFramebuffer();

        if (!this.Framebuffer2DrawTargetsDefault) this.Framebuffer2DrawTargetsDefault = [cgl.gl.COLOR_ATTACHMENT0];

        this._options = options || {
            "isFloatingPointTexture": false,
        };

        this.name = this._options.name || "unknown";

        this._cgl.profileData.addHeavyEvent("framebuffer create", this.name);

        if (!this._options.hasOwnProperty("numRenderBuffers")) this._options.numRenderBuffers = 1;
        if (!this._options.hasOwnProperty("depth")) this._options.depth = true;
        if (!this._options.hasOwnProperty("clear")) this._options.clear = true;
        if (!this._options.hasOwnProperty("multisampling"))
        {
            this._options.multisampling = false;
            this._options.multisamplingSamples = 0;
        }

        if (this._options.multisamplingSamples)
        {
            if (this._cgl.glSlowRenderer) this._options.multisamplingSamples = 0;
            if (!this._cgl.gl.MAX_SAMPLES) this._options.multisamplingSamples = 0;
            else this._options.multisamplingSamples = Math.min(this._cgl.maxSamples, this._options.multisamplingSamples);
        }

        if (!this._options.hasOwnProperty("filter")) this._options.filter = Texture.FILTER_LINEAR;
        if (!this._options.hasOwnProperty("wrap")) this._options.wrap = Texture.WRAP_REPEAT;

        this._numRenderBuffers = this._options.numRenderBuffers;
        this._colorTextures = [];

        this.clearColors = [];
        for (let i = 0; i < this._numRenderBuffers; i++) this.clearColors.push([0, 0, 0, 1]);

        if (!options.pixelFormat)
        {
            if (options.isFloatingPointTexture) this._options.pixelFormat = Texture.PFORMATSTR_RGBA32F;
            else this._options.pixelFormat = Texture.PFORMATSTR_RGBA8UB;
        }

        for (let i = 0; i < this._numRenderBuffers; i++)
        {
            this._colorTextures[i] = new Texture(cgl, {
                "name": "fb2 " + this.name + " " + i,
                "isFloatingPointTexture": this._options.isFloatingPointTexture,
                "anisotropic": this._options.anisotropic || 0,
                "pixelFormat": this._options.pixelFormat,
                "filter": this._options.filter,
                "wrap": this._options.wrap,
            });
        }

        let fil = Texture.FILTER_NEAREST;
        if (this._options.shadowMap) fil = Texture.FILTER_LINEAR;

        const defaultTexSize = 512;

        if (this._options.depth)
        {
            this._textureDepth = new Texture(cgl,
                {
                    "name": "fb2 depth " + this.name,
                    "isDepthTexture": true,
                    "filter": fil,
                    "shadowMap": this._options.shadowMap || false,
                    "width": w || defaultTexSize,
                    "height": h || defaultTexSize,
                });
        }

        if (cgl.aborted) return;

        this.setSize(w || defaultTexSize, h || defaultTexSize);

        this._cgl.printError("framebuffer2 constructor");
    }

    getWidth()
    {
        return this._width;
    }

    getHeight()
    {
        return this._height;
    }

    getGlFrameBuffer()
    {
        return this._frameBuffer;
    }

    getDepthRenderBuffer()
    {
        return this._depthRenderbuffer;
    }

    getTextureColor()
    {
        return this._colorTextures[0];
    }

    getTextureColorNum(i)
    {
        return this._colorTextures[i];
    }

    getTextureDepth()
    {
        return this._textureDepth;
    }

    setFilter(f)
    {
        for (let i = 0; i < this._numRenderBuffers; i++)
        {
            this._colorTextures[i].filter = f;
            this._colorTextures[i].setSize(this._width, this._height);
        }
    }

    delete()
    {
        this.dispose();
    }

    dispose()
    {
        this._disposed = true;
        let i = 0;
        for (i = 0; i < this._numRenderBuffers; i++) this._colorTextures[i].delete();
        // this._texture.delete();
        if (this._textureDepth) this._textureDepth.delete();
        for (i = 0; i < this._numRenderBuffers; i++) this._cgl.gl.deleteRenderbuffer(this._colorRenderbuffers[i]);
        this._cgl.gl.deleteRenderbuffer(this._depthRenderbuffer);
        this._cgl.gl.deleteFramebuffer(this._frameBuffer);
        this._cgl.gl.deleteFramebuffer(this._textureFrameBuffer);
    }

    /**
     * @param {number} w
     * @param {number} h
     */
    setSize(w, h)
    {
        if (this._disposed) return this._log.warn("disposed framebuffer setsize...");
        this._cgl.profileData.addHeavyEvent("framebuffer resize", this.name);

        let i = 0;

        this._width = this._cgl.checkTextureSize(w);
        this._height = this._cgl.checkTextureSize(h);

        this._cgl.profileData.profileFrameBuffercreate++;

        if (this._frameBuffer)
        {
            for (i = 0; i < this._numRenderBuffers; i++) this._cgl.gl.deleteRenderbuffer(this._colorRenderbuffers[i]);
            // this._cgl.gl.deleteRenderbuffer(this._colorRenderbuffer);
            this._cgl.gl.deleteRenderbuffer(this._depthRenderbuffer);
            this._cgl.gl.deleteFramebuffer(this._frameBuffer);
            this._cgl.gl.deleteFramebuffer(this._textureFrameBuffer);
        }

        this._frameBuffer = this._cgl.gl.createFramebuffer();
        this._textureFrameBuffer = this._cgl.gl.createFramebuffer();

        const depth = this._options.depth;

        for (i = 0; i < this._numRenderBuffers; i++)
        {
            this._colorTextures[i].setSize(this._width, this._height);
        }

        for (i = 0; i < this._numRenderBuffers; i++)
        {
            const renderBuffer = this._cgl.gl.createRenderbuffer();

            // color renderbuffer

            this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._frameBuffer);
            this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, renderBuffer);

            const info = Texture.setUpGlPixelFormat(this._cgl, this._options.pixelFormat);
            let internFormat = info.glInternalFormat;

            // if (this._options.isFloatingPointTexture)
            // {
            if (CGL.Texture.isPixelFormatHalfFloat(info.pixelFormat))
            {
                if (!this._cgl.enableExtension("OES_texture_float_linear"))
                {
                    this._options.filter = Texture.FILTER_NEAREST;
                    this.setFilter(this._options.filter);
                }
            }
            else if (CGL.Texture.isPixelFormatFloat(info.pixelFormat))
            {
                if (!this._cgl.enableExtension("OES_texture_float_linear"))
                {
                    this._log.warn("no linear pixelformat,using nearest");
                    this._options.filter = Texture.FILTER_NEAREST;
                    this.setFilter(this._options.filter);
                }
            }
            // else if (info.pixelFormat == Texture.PFORMATSTR_RGBA32F || info.pixelFormat == Texture.PFORMATSTR_R11FG11FB10F
            // else if (info.pixelFormat == Texture.PFORMATSTR_RGBA32F || info.pixelFormat == Texture.PFORMATSTR_R11FG11FB10F
            // else if (info.pixelFormat == Texture.PFORMATSTR_RG16F)
            // {
            //     const extcb = this._cgl.enableExtension("EXT_color_buffer_float");

            //     if (!this._cgl.enableExtension("OES_texture_float_linear"))
            //     {
            //         console.log("no linear pixelformat,switching to nearest");
            //         this._options.filter = Texture.FILTER_NEAREST;
            //         this.setFilter(this._options.filter);
            //     }
            // }
            // }

            if (this._options.multisampling && this._options.multisamplingSamples)
            {
                this._cgl.gl.renderbufferStorageMultisample(this._cgl.gl.RENDERBUFFER, this._options.multisamplingSamples, internFormat, this._width, this._height);
            }
            else
            {
                this._cgl.gl.renderbufferStorage(this._cgl.gl.RENDERBUFFER, internFormat, this._width, this._height);
            }

            this._cgl.gl.framebufferRenderbuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.COLOR_ATTACHMENT0 + i, this._cgl.gl.RENDERBUFFER, renderBuffer);
            this._colorRenderbuffers[i] = renderBuffer;
        }

        // this._cgl.gl.bindFramebuffer(this._cgl.gl.DRAW_FRAMEBUFFER, this._textureFrameBuffer);
        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._textureFrameBuffer);

        for (i = 0; i < this._numRenderBuffers; i++)
        {
            this._cgl.gl.framebufferTexture2D(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.COLOR_ATTACHMENT0 + i, this._cgl.gl.TEXTURE_2D, this._colorTextures[i].tex, 0);
        }

        if (this._options.depth)
        {
            this._cgl.gl.framebufferTexture2D(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.DEPTH_ATTACHMENT, this._cgl.gl.TEXTURE_2D, this._textureDepth.tex, 0);
        }

        // depth renderbuffer

        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._frameBuffer);

        let depthType = this._cgl.gl.DEPTH_COMPONENT32F;

        if (this._cgl.glSlowRenderer) depthType = this._cgl.gl.DEPTH_COMPONENT16;
        if (depth)
        {
            this._textureDepth.setSize(this._width, this._height);
            this._depthRenderbuffer = this._cgl.gl.createRenderbuffer();

            this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, this._depthRenderbuffer);
            if (this._options.isFloatingPointTexture)
            {
                if (this._options.multisampling) this._cgl.gl.renderbufferStorageMultisample(this._cgl.gl.RENDERBUFFER, this._options.multisamplingSamples, depthType, this._width, this._height);
                else this._cgl.gl.renderbufferStorage(this._cgl.gl.RENDERBUFFER, depthType, this._width, this._height);
            }
            else if (this._options.multisampling)
            {
                this._cgl.gl.renderbufferStorageMultisample(this._cgl.gl.RENDERBUFFER, this._options.multisamplingSamples, depthType, this._width, this._height);
            // this._cgl.gl.renderbufferStorage(this._cgl.gl.RENDERBUFFER,depthType, this._width, this._height);
            }
            else
            {
                this._cgl.gl.renderbufferStorage(this._cgl.gl.RENDERBUFFER, depthType, this._width, this._height);
            }

            this._cgl.gl.framebufferRenderbuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.DEPTH_ATTACHMENT, this._cgl.gl.RENDERBUFFER, this._depthRenderbuffer);
        }

        // this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, null);
        // this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._textureFrameBuffer);

        this._drawTargetArray.length = 0;
        for (i = 0; i < this._numRenderBuffers; i++) this._drawTargetArray.push(this._cgl.gl.COLOR_ATTACHMENT0 + i);

        // this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, null);

        if (!this._cgl.gl.isFramebuffer(this._textureFrameBuffer)) this._log.warn("invalid framebuffer");// throw new Error("Invalid framebuffer");
        const status = this._cgl.gl.checkFramebufferStatus(this._cgl.gl.FRAMEBUFFER);

        if (status != this._cgl.gl.FRAMEBUFFER_COMPLETE)
        {
            this._log.error("framebuffer incomplete: " + this.name, this);
            this._log.log("options", this._options);
            this._log.log("options pixelformat", this._options.pixelFormat);

            switch (status)
            {
            case this._cgl.gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                this._log.warn("FRAMEBUFFER_INCOMPLETE_ATTACHMENT...", this);
                throw new Error("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
            case this._cgl.gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                this._log.warn("FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
                throw new Error("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
            case this._cgl.gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                this._log.warn("FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
                throw new Error("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
            case this._cgl.gl.FRAMEBUFFER_UNSUPPORTED:
                this._log.warn("FRAMEBUFFER_UNSUPPORTED");
                throw new Error("Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");
            default:
                this.valid = false;
                this._log.error("incomplete framebuffer", status, this._frameBuffer);
                this._cgl.printError();

                this._frameBuffer = null;
                // debugger;
                throw new Error("Incomplete framebuffer: " + status);

        // throw("Incomplete framebuffer: " + status);
            }
        }

        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, null);
        this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, null);

    // this._cgl.printError("fb setsize");
    }

    renderStart()
    {
        if (this._disposed) return this._log.warn("disposed framebuffer renderStart...");
        this._cgl.checkFrameStarted("fb2 renderstart");
        this._cgl.pushModelMatrix(); // needed ??

        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._frameBuffer);
        this._cgl.pushGlFrameBuffer(this._frameBuffer);
        this._cgl.pushFrameBuffer(this);

        this._cgl.pushPMatrix();
        this._cgl.pushViewPort(0, 0, this._width, this._height);

        this._cgl.gl.drawBuffers(this._drawTargetArray);

        if (this._options.clear)
        {
            this._cgl.gl.clearColor(0, 0, 0, 0);
            this._cgl.gl.clear(this._cgl.gl.COLOR_BUFFER_BIT | this._cgl.gl.DEPTH_BUFFER_BIT);
        }
    }

    clear()
    {
        if (this._numRenderBuffers <= 1)
        {
            this._cgl.gl.bindFramebuffer(this._cgl.gl.READ_FRAMEBUFFER, this._frameBuffer);
            this._cgl.gl.bindFramebuffer(this._cgl.gl.DRAW_FRAMEBUFFER, this._textureFrameBuffer);
        }
        else this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._frameBuffer);

        this._cgl.gl.drawBuffers(this._drawTargetArray);

        for (let i = 0; i < this._numRenderBuffers; i++)
        {
            this._cgl.gl.framebufferTexture2D(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.COLOR_ATTACHMENT0 + i, this._cgl.gl.TEXTURE_2D, this._colorTextures[i].tex, 0);
            this._cgl.gl.clearBufferfv(this._cgl.gl.COLOR, i, this.clearColors[i]);
        }
        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, null);
    }

    renderEnd()
    {
        if (this._disposed) return this._log.warn("disposed framebuffer renderEnd...");
        this._cgl.popPMatrix();

        this._cgl.profileData.count("framebufferBlit");

        if (this._numRenderBuffers <= 1)
        {
            this._cgl.gl.bindFramebuffer(this._cgl.gl.READ_FRAMEBUFFER, this._frameBuffer);
            this._cgl.gl.bindFramebuffer(this._cgl.gl.DRAW_FRAMEBUFFER, this._textureFrameBuffer);

            this._cgl.gl.clearBufferfv(this._cgl.gl.COLOR, 0, [0.0, 0.0, 0.0, 1.0]);
            this._cgl.gl.blitFramebuffer(0, 0, this._width, this._height, 0, 0, this._width, this._height, this._cgl.gl.COLOR_BUFFER_BIT | this._cgl.gl.DEPTH_BUFFER_BIT, this._cgl.gl.NEAREST);
        }
        else
        {
            this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this.Framebuffer2BlittingFramebuffer);
            this._cgl.gl.framebufferRenderbuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.DEPTH_ATTACHMENT, this._cgl.gl.RENDERBUFFER, this._depthRenderbuffer);

            this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this.Framebuffer2FinalFramebuffer);
            this._cgl.gl.framebufferTexture2D(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.DEPTH_ATTACHMENT, this._cgl.gl.TEXTURE_2D, this._textureDepth.tex, 0);

            for (let i = 0; i < this._numRenderBuffers; i++)
            {
                this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this.Framebuffer2BlittingFramebuffer);
                this._cgl.gl.framebufferRenderbuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.COLOR_ATTACHMENT0, this._cgl.gl.RENDERBUFFER, this._colorRenderbuffers[i]);

                this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this.Framebuffer2FinalFramebuffer);
                this._cgl.gl.framebufferTexture2D(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.COLOR_ATTACHMENT0, this._cgl.gl.TEXTURE_2D, this._colorTextures[i].tex, 0);

                this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, null);

                this._cgl.gl.bindFramebuffer(this._cgl.gl.READ_FRAMEBUFFER, this.Framebuffer2BlittingFramebuffer);
                this._cgl.gl.bindFramebuffer(this._cgl.gl.DRAW_FRAMEBUFFER, this.Framebuffer2FinalFramebuffer);

                // this._cgl.gl.clearBufferfv(this._cgl.gl.COLOR, i, [0.0, 0.0, 0.0, 1.0]);

                let flags = this._cgl.gl.COLOR_BUFFER_BIT;
                if (i == 0) flags |= this._cgl.gl.DEPTH_BUFFER_BIT;

                this._cgl.gl.blitFramebuffer(0, 0, this._width, this._height, 0, 0, this._width, this._height, flags, this._cgl.gl.NEAREST);
            }
        }

        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.popGlFrameBuffer());
        this._cgl.popFrameBuffer();

        this._cgl.popModelMatrix();
        this._cgl.popViewPort();

        if (this._colorTextures[0].filter == Texture.FILTER_MIPMAP)
        {
            for (let i = 0; i < this._numRenderBuffers; i++)
            {
                this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_2D, this._colorTextures[i].tex);
                this._colorTextures[i].updateMipMap();
                this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_2D, null);
            }
        }
    }
}

;// CONCATENATED MODULE: ./src/corelibs/cgl/cgl_marker.js
/** @type {function}
 * @deprecated
*/
const Marker = function (_cgl) // deprecated...
{
    this.draw = function (cgl, _size, depthTest) {};
};

/** @type {function}
 * @deprecated
*/
const WirePoint = function (cgl) // deprecated...
{
    this.render = function (_cgl, _size) {};
};

/** @type {function}
 * @deprecated
*/
const WireCube = function (cgl) // deprecated...
{
    this.render = function (_cgl, sizeX, sizeY, sizeZ) {};
};

;// CONCATENATED MODULE: ./src/corelibs/cgl/cgl_unicolorshader.js


class UniColorShader
{
    constructor(_cgl)
    {
        this.shader = new CGL.Shader(_cgl, "markermaterial");

        const frag = ""
            .endl() + "void main()"
            .endl() + "{"
            .endl() + "    outColor = vec4(color.rgb,1.0);"
            .endl() + "}";

        const vert = ""
            .endl() + "IN vec3 vPosition;"
            .endl() + "UNI mat4 projMatrix;"
            .endl() + "UNI mat4 mvMatrix;"

            .endl() + "void main()"
            .endl() + "{"
            .endl() + "   gl_Position = projMatrix * mvMatrix * vec4(vPosition,1.0);"
            .endl() + "}";

        this.shader.setSource(vert, frag);
        this.coloruni = this.shader.addUniformFrag("4f", "color", [1, 0.777, 1, 1]);
    }

    setColor(r, g, b, a)
    {
        this.coloruni.set(r, g, b, a);
    }
}

;// CONCATENATED MODULE: ./src/corelibs/cgl/cgl_utils.js
/**
 * @namespace CGL
 */

/**
 * multiply to get radians from degree, e.g. `360 * CGL.DEG2RAD`
 * @const {Number}
 * @memberof CGL
 * @static
 */
const cgl_utils_DEG2RAD = Math.PI / 180.0;

/**
 * to get degrees from radians, e.g. `3.14 * CGL.RAD2DEG`
 * @const {number}
 * @memberof CGL
 */
const cgl_utils_RAD2DEG = 180.0 / Math.PI;

const onLoadingAssetsFinished = null; // deprecated / remove later

/**
 * get normalized mouse wheel delta (including browser specific adjustment)
 * @function getWheelDelta
 * @static
 * @memberof CGL
 * @param {MouseEvent} event
 * @return {Number} normalized delta
 */
const isWindows = window.navigator.userAgent.includes("Windows");
const getWheelDelta_ = function (event)
{
    let normalized;
    if (event.wheelDelta)
    {
        // chrome
        normalized = (event.wheelDelta % 120) - 0 == -0 ? event.wheelDelta / 120 : event.wheelDelta / 30;
        normalized *= -1.5;
        if (isWindows) normalized *= 2;
    }
    else
    {
        // firefox
        let d = event.deltaY;
        if (event.shiftKey) d = event.deltaX;
        const rawAmmount = d || event.detail;
        normalized = -(rawAmmount % 3 ? rawAmmount * 10 : rawAmmount / 3);
        normalized *= -3;
    }

    if (normalized > 20) normalized = 20;
    if (normalized < -20) normalized = -20;

    return normalized;
};

const getWheelSpeed = getWheelDelta_;
const getWheelDelta = getWheelDelta_;

;// CONCATENATED MODULE: ./src/corelibs/cgl/cgl_shadermodifier.js



class ShaderModifier
{
    _origShaders = {};
    _uniforms = [];
    _structUniforms = [];
    _definesToggled = {};
    _defines = {};
    _mods = [];
    _textures = [];
    _boundShader = null;
    _changedDefines = true;
    _changedUniforms = true;
    _modulesChanged = false;
    needsTexturePush = false;
    _lastShader = null;
    _attributes = [];

    /**
     * @param {CglContext} cgl
     * @param {string} name
     * @param {object} options
     */
    constructor(cgl, name, options)
    {
        this._cgl = cgl;
        this._name = name;
        if (options && options.opId) this.opId = options.opId;

        if (this._cgl.glVersion == 1)
        {
            this._cgl.enableExtension("OES_texture_float");
            this._cgl.enableExtension("OES_texture_float_linear");
            this._cgl.enableExtension("OES_texture_half_float");
            this._cgl.enableExtension("OES_texture_half_float_linear");
        }
    }

    /**
     * @param {Shader} curShader
     * @param {Shader} pushShader
     */
    bind(curShader, pushShader)
    {
        const shader = curShader || this._cgl.getShader();
        if (!shader) return;

        this._boundShader = this._origShaders[shader.id];
        let missingMod = false;

        if (this._boundShader && this._lastShader != this._boundShader.shader) // shader changed since last bind
        {
            if (!this._boundShader.shader.hasModule(this._mods[0].id)) missingMod = true;
        }

        if (missingMod || !this._boundShader || shader.lastCompile != this._boundShader.lastCompile || this._modulesChanged || shader.needsRecompile())
        {
            if (this._boundShader) this._boundShader.shader.dispose();
            if (shader.needsRecompile()) shader.compile();
            this.needsTexturePush = true;

            this._boundShader = this._origShaders[shader.id] =
            {
                "lastCompile": shader.lastCompile,
                "orig": shader,
                "shader": shader.copy()
            };

            this._addModulesToShader(this._boundShader.shader);
            this._updateDefinesShader(this._boundShader.shader);
            this._updateUniformsShader(this._boundShader.shader);
        }

        this._boundShader.wireframe = shader.wireframe;
        if (this._changedDefines) this._updateDefines();
        if (this._changedUniforms) this._updateUniforms();

        if (pushShader !== false) this._cgl.pushShader(this._boundShader.shader);

        this._boundShader.shader.copyUniformValues(this._boundShader.orig);

        if (this.needsTexturePush)
        {
            for (let j = 0; j < this._textures.length; j++)
            {
                const uniformName = this._textures[j][0];
                const tex = this._textures[j][1];
                const texType = this._textures[j][2];

                if (this._getUniform(uniformName))
                {
                    const name = this.getPrefixedName(uniformName);
                    const uni = this._boundShader.shader.getUniform(name);

                    if (uni) this._boundShader.shader.pushTexture(uni, tex, texType);
                }
            }

            this.needsTexturePush = false;
            this._textures.length = 0;
        }

        this._modulesChanged = false;

        this._boundShader.shader.fromMod = this;

        if (this.onBind) this.onBind(this._boundShader.shader);

        return this._boundShader.shader;
    }

    unbind(popShader)
    {
        if (this._boundShader)
        {
            if (popShader !== false) this._cgl.popShader();
            // this._boundShader = null;
            // return true;
        }
        this._boundShader = null;
    }

    /**
     * @param {Shader} shader
     */
    _addModulesToShader(shader)
    {
        let firstMod;

        if (this._mods.length > 1) firstMod = this._mods[0];

        for (let i = 0; i < this._mods.length; i++) shader.addModule(this._mods[i], firstMod);
    }

    _removeModulesFromShader(mod)
    {
        for (const j in this._origShaders) this._origShaders[j].shader.removeModule(mod);
    }

    addModule(mod)
    {
        this._mods.push(mod);
        this._modulesChanged = true;
    }

    /**
     * @param {string} title
     */
    removeModule(title)
    {
        const indicesToRemove = [];

        let found = false;
        for (let i = 0; i < this._mods.length; i++)
        {
            if (this._mods[i].title == title)
            {
                found = true;
                this._removeModulesFromShader(this._mods[i]);
                indicesToRemove.push(i);
            }
        }

        // * go in reverse order so the indices of the mods stay the same
        for (let j = indicesToRemove.length - 1; j >= 0; j -= 1)
            this._mods.splice(indicesToRemove[j], 1);

        this._modulesChanged = true;
    }

    /**
     * @param {Shader} shader
     */
    _updateUniformsShader(shader)
    {
        for (let i = 0; i < this._uniforms.length; i++)
        {
            const uni = this._uniforms[i];
            const name = this.getPrefixedName(uni.name);

            if (!shader.hasUniform(name) && !uni.structName)
            {
                let un = null;
                if (uni.shaderType === "both")
                {
                    un = shader.addUniformBoth(uni.type, name, uni.v1, uni.v2, uni.v3, uni.v4);
                    un.comment = "mod: " + this._name;
                }
                else if (uni.shaderType === "frag")
                {
                    un = shader.addUniformFrag(uni.type, name, uni.v1, uni.v2, uni.v3, uni.v4);
                    un.comment = "mod: " + this._name;
                }
                else if (uni.shaderType === "vert")
                {
                    un = shader.addUniformVert(uni.type, name, uni.v1, uni.v2, uni.v3, uni.v4);
                    un.comment = "mod: " + this._name;
                }
            }
        }

        for (let j = 0; j < this._structUniforms.length; j += 1)
        {
            const structUniform = this._structUniforms[j];
            let structUniformName = structUniform.uniformName;
            let structName = structUniform.structName;

            const members = structUniform.members;

            structUniformName = this.getPrefixedName(structUniform.uniformName);
            structName = this.getPrefixedName(structUniform.structName);

            if (structUniform.shaderType === "frag")
            {
                shader.addUniformStructFrag(structName, structUniformName, members);
            }
            if (structUniform.shaderType === "vert")
            {
                shader.addUniformStructVert(structName, structUniformName, members);
            }
            if (structUniform.shaderType === "both")
            {
                shader.addUniformStructBoth(structName, structUniformName, members);
            }
        }
    }

    _updateUniforms()
    {
        for (const j in this._origShaders)
            this._updateUniformsShader(this._origShaders[j].shader);

        this._changedUniforms = false;
    }

    _setUniformValue(shader, uniformName, value)
    {
        const uniform = shader.getUniform(uniformName);

        if (uniform) uniform.setValue(value);
    }

    setUniformValue(name, value)
    {
        const uni = this._getUniform(name);
        if (!uni) return;

        const defineName = this.getPrefixedName(name);

        for (const j in this._origShaders)
        {
            this._setUniformValue(this._origShaders[j].shader, defineName, value);
        }
    }

    /**
     * @param {String} name
     */
    hasUniform(name)
    {
        return this._getUniform(name);
    }

    /**
     * @param {string} name
     */
    _getUniform(name)
    {
        for (let i = 0; i < this._uniforms.length; i++)
        {
            if (this._uniforms[i].name == name) return this._uniforms[i];
            if (this._uniforms[i].structName)
            {
                if (this._uniforms[i].propertyName == name) return this._uniforms[i];
            }
        }
        return false;
    }

    /**
     * @param {string} uniName
     */
    _getStructUniform(uniName)
    {
        for (let i = 0; i < this._structUniforms.length; i += 1)
            if (this._structUniforms[i].uniformName === uniName) return this._structUniforms[i];

        return null;
    }

    _isStructUniform(name)
    {
        for (let i = 0; i < this._uniforms.length; i++)
        {
            if (this._uniforms[i].name == name) return false;
            if (this._uniforms[i].structName)
            {
                if (this._uniforms[i].propertyName == name) return true;
            }
        }
        return false;
    }

    addUniform(type, name, valOrPort, v2, v3, v4, structUniformName, structName, propertyName, shaderType)
    {
        if (!this._getUniform(name))
        {
            let _shaderType = "both";
            if (shaderType) _shaderType = shaderType;

            this._uniforms.push(
                {
                    "type": type,
                    "name": name,
                    "v1": valOrPort,
                    "v2": v2,
                    "v3": v3,
                    "v4": v4,
                    "structUniformName": structUniformName,
                    "structName": structName,
                    "propertyName": propertyName,
                    "shaderType": _shaderType,
                });
            this._changedUniforms = true;
        }
    }

    addUniformFrag(type, name, valOrPort, v2, v3, v4)
    {
        this.addUniform(type, name, valOrPort, v2, v3, v4, null, null, null, "frag");
        this._changedUniforms = true;
    }

    addUniformVert(type, name, valOrPort, v2, v3, v4)
    {
        this.addUniform(type, name, valOrPort, v2, v3, v4, null, null, null, "vert");
        this._changedUniforms = true;
    }

    addUniformBoth(type, name, valOrPort, v2, v3, v4)
    {
        this.addUniform(type, name, valOrPort, v2, v3, v4, null, null, null, "both");
        this._changedUniforms = true;
    }

    addUniformStruct(structName, uniformName, members, shaderType)
    {
        for (let i = 0; i < members.length; i += 1)
        {
            const member = members[i];
            if ((member.type === "2i" || member.type === "i" || member.type === "3i") && shaderType === "both")
                console.error("Adding an integer struct member to both shaders can potentially error. Please use different structs for each shader. Error occured in struct:", structName, " with member:", member.name, " of type:", member.type, ".");

            if (!this._getUniform(uniformName + "." + member.name))
            {
                this.addUniform(
                    member.type,
                    uniformName + "." + member.name,
                    member.v1,
                    member.v2,
                    member.v3,
                    member.v4,
                    uniformName,
                    structName,
                    member.name,
                    shaderType
                );
            }
        }
        if (!this._getStructUniform(uniformName))
        {
            this._structUniforms.push({
                "structName": structName,
                "uniformName": uniformName,
                "members": members,
                "shaderType": shaderType,
            });
        }
    }

    addUniformStructVert(structName, uniformName, members)
    {
        this.addUniformStruct(structName, uniformName, members, "vert");
    }

    addUniformStructFrag(structName, uniformName, members)
    {
        this.addUniformStruct(structName, uniformName, members, "frag");
    }

    addUniformStructBoth(structName, uniformName, members)
    {
        this.addUniformStruct(structName, uniformName, members, "both");
    }

    addAttribute(attr)
    {
        for (let i = 0; i < this._attributes.length; i++)
        {
            if (this._attributes[i].name == attr.name && this._attributes[i].nameFrag == attr.nameFrag) return;
        }
        this._attributes.push(attr);
    }

    pushTexture(uniformName, tex, texType)
    {
        if (!tex) throw (new Error("no texture given to texturestack"));

        this._textures.push([uniformName, tex, texType]);
        this.needsTexturePush = true;
    }

    _removeUniformFromShader(name, shader)
    {
        if (shader.hasUniform(name)) shader.removeUniform(name);
    }

    removeUniform(name)
    {
        if (this._getUniform(name))
        {
            for (let j = this._uniforms.length - 1; j >= 0; j -= 1)
            {
                const nameToRemove = name;

                if (this._uniforms[j].name == name && !this._uniforms[j].structName)
                {
                    for (const k in this._origShaders)
                    {
                        this._removeUniformFromShader(
                            this.getPrefixedName(nameToRemove),
                            this._origShaders[k].shader
                        );
                    }

                    this._uniforms.splice(j, 1);
                }
            }
            this._changedUniforms = true;
        }
    }

    /**
     * @param {string} uniformName
     */
    removeUniformStruct(uniformName)
    {
        if (this._getStructUniform(uniformName))
        {
            for (let i = this._structUniforms.length - 1; i >= 0; i -= 1)
            {
                const structToRemove = this._structUniforms[i];

                if (structToRemove.uniformName === uniformName)
                {
                    for (const j in this._origShaders)
                    {
                        for (let k = 0; k < structToRemove.members.length; k += 1)
                        {
                            const member = structToRemove.members[k];
                            this._removeUniformFromShader(
                                this.getPrefixedName(member.name),
                                this._origShaders[j].shader
                            );
                        }
                    }

                    this._structUniforms.splice(i, 1);
                }
            }

            this._changedUniforms = true;
        }
    }

    getPrefixedName(name)
    {
        const prefix = this._mods[0].group;
        if (prefix === undefined)
        {
            return;
        }
        if (name.startsWith("MOD_"))
        {
            name = name.substr("MOD_".length);
            name = "mod" + prefix + "_" + name;
        }
        return name;
    }

    /**
     * @param {Shader} shader
     */
    _updateDefinesShader(shader)
    {
        for (const i in this._defines)
        {
            const name = this.getPrefixedName(i);
            if (this._defines[i] !== null && this._defines[i] !== undefined) shader.define(name, this._defines[i]);
            else shader.removeDefine(name);
        }

        for (const i in this._definesToggled)
        {
            const name = this.getPrefixedName(i);
            shader.toggleDefine(name, this._definesToggled[i]);
        }
    }

    _updateDefines()
    {
        for (const j in this._origShaders) this._updateDefinesShader(this._origShaders[j].shader);

        this._changedDefines = false;
    }

    define(what, value)
    {
        if (value === undefined)value = true;
        this._defines[what] = value;
        this._changedDefines = true;
    }

    /**
     * @param {string} name
     */
    removeDefine(name)
    {
        this._defines[name] = null;
        this._changedDefines = true;
    }

    /**
     * @param {string} name
     */
    hasDefine(name)
    {
        if (this._defines[name] !== null && this._defines[name] !== undefined) return true;
        return false;
    }

    /**
     * @param {string | number} name
     * @param {boolean} b
     */
    toggleDefine(name, b)
    {
        this._changedDefines = true;
        this._definesToggled[name] = b;
    }

    currentShader()
    {
        if (!this._boundShader) return null;
        return this._boundShader.shader;
    }

    dispose()
    {

    }
}

;// CONCATENATED MODULE: ./src/corelibs/cgl/rendertargets_slots.frag
/* harmony default export */ const rendertargets_slots = ("\n        float instIdx=0.0;\n    #ifdef INSTANCING\n        instIdx=frag_instIndex;\n    #endif\n    #ifndef INSTANCING\n    #endif\n");
;// CONCATENATED MODULE: ./src/corelibs/cgl/rendertargets_slots.vert
/* harmony default export */ const cgl_rendertargets_slots = ("#ifdef MOD_SLOT_POS_WORLD\n    MOD_pos_world=(mMatrix*pos).xyz;\n#endif\n\n#ifdef MOD_SLOT_POS_OBJECT\n    MOD_pos_object=(mMatrix*vec4(0.,0.,0.,1.)).xyz;\n#endif\n\n#ifdef MOD_SLOT_POS_LOCAL\n    MOD_pos_local=vPosition.xyz;\n#endif\n\n#ifdef MOD_SLOT_POS_NORMAL_MV\n    MOD_normal_mv=((viewMatrix*mMatrix)*vec4(norm,1.0)).xyz;\n#endif\n\n#ifdef MOD_SLOT_POS_MV\n    MOD_pos_mv=((viewMatrix*mMatrix)*vec4(pos.xyz,1.0)).xyz;\n#endif\n\n\n#ifdef MOD_SLOT_POS_NORMAL_WORLD\n    mat4 MOD_fmMatrix=mMatrix;\n    #ifdef INSTANCING\n        #ifdef TEXINSTMAT\n            MOD_fmMatrix = texInstMat;\n        #endif\n        #ifndef TEXINSTMAT\n            MOD_fmMatrix = iMat;\n        #endif\n    #endif\n    MOD_normal_world=vec3(MOD_fmMatrix * vec4(norm, 0.0));\n#endif\n\n");
;// CONCATENATED MODULE: ./src/corelibs/cgl/rendertargets_slots_head.frag
/* harmony default export */ const rendertargets_slots_head = ("\n#ifdef MOD_SLOT_POS_WORLD\n    in vec3 MOD_pos_world;\n#endif\n\n#ifdef MOD_SLOT_POS_LOCAL\n    in vec3 MOD_pos_local;\n#endif\n\n#ifdef MOD_SLOT_POS_OBJECT\n    in vec3 MOD_pos_object;\n#endif\n\n#ifdef MOD_SLOT_POS_NORMAL_WORLD\n    in vec3 MOD_normal_world;\n#endif\n\n#ifdef MOD_SLOT_POS_NORMAL_MV\n    in vec3 MOD_normal_mv;\n#endif\n\n#ifdef MOD_SLOT_POS_MV\n    in vec3 MOD_pos_mv;\n#endif\n\n\n#ifdef MOD_UNI_OBJECT_ID\n    UNI float objectId;\n#endif\n\n#ifdef MOD_UNI_MATERIAL_ID\n    UNI float materialId;\n#endif\n\n");
;// CONCATENATED MODULE: ./src/corelibs/cgl/rendertargets_slots_head.vert
/* harmony default export */ const cgl_rendertargets_slots_head = ("#ifdef MOD_SLOT_POS_WORLD\n    out vec3 MOD_pos_world;\n#endif\n\n#ifdef MOD_SLOT_POS_LOCAL\n    out vec3 MOD_pos_local;\n#endif\n\n#ifdef MOD_SLOT_POS_OBJECT\n    out vec3 MOD_pos_object;\n#endif\n\n#ifdef MOD_SLOT_POS_NORMAL_MV\n    out vec3 MOD_normal_mv;\n#endif\n\n#ifdef MOD_SLOT_POS_NORMAL_WORLD\n    out vec3 MOD_normal_world;\n#endif\n\n\n#ifdef MOD_SLOT_POS_MV\n    out vec3 MOD_pos_mv;\n#endif\n");
;// CONCATENATED MODULE: ./src/corelibs/cgl/rendertargets.js






class RenderTargets
{
    constructor(cgl)
    {
        this._numBuffers = 4;
        this.asString = "";
        this._slots = ["Default", "Normal"];
        this._name = "rendertargets" + external_CABLES_namespaceObject.utils.uuid();
        this.mod = new CGL.ShaderModifier(cgl, this._name);

        this.mod.onBind = (currentShader) =>
        {
            // console.log(currentShader);
            // currentShader.setDrawBuffers([true, true, true, true]);
        };
    }

    updateModules()
    {
        this.mod.removeModule(this._name + "_frag");

        this.mod.addModule(
            {
                "priority": 2,
                "title": this._name + "_frag",
                "name": "MODULE_COLOR",
                "srcHeadFrag": rendertargets_slots_head,
                "srcBodyFrag": this.getSrcFrag(),
            });

        this.mod.removeModule(this._name + "_vert");

        this.mod.addModule(
            {
                "priority": 12,
                "title": this._name + "_vert",
                "name": "MODULE_VERTEX_POSITION",
                "srcHeadVert": cgl_rendertargets_slots_head,
                "srcBodyVert": cgl_rendertargets_slots
            });
    }

    getTypes()
    {
        return ["Default",
            "Material Id, Object Id, Instance Id",
            "Material Id",
            "Object Id",
            "Position World",
            "Position * ModelView",
            "Position Local",
            "Position Object",
            "Normal",
            "Normal World",
            "Normal * ModelView",
            "OIT Accum",
            "OIT Revealage",
            "FragCoord.z",
            "TexCoord",
            "Black",
            "0", "1"];
    }

    setNumBuffers(n)
    {
        this._numBuffers = n;
    }

    getSrcString(type, i)
    {
        let outcolor = "outColor";
        if (i === "")outcolor = "col";

        if (type == "Normal") return "    " + outcolor + i + " = vec4(norm,1.);".endl();
        else if (type == "Material Id, Object Id, Instance Id") return "    " + outcolor + i + " = vec4(round(materialId),round(objectId),round(instIdx),1.0);".endl();
        else if (type == "Default" || type == "Color") return "    " + outcolor + i + " = col;".endl();
        else if (type == "1") return "    " + outcolor + i + " = vec4(1.,1.,1.,1.);".endl();
        else if (type == "0") return "    " + outcolor + i + " = vec4(0.,0.,0.,0.);".endl();
        else if (type == "Black") return "    " + outcolor + i + " = vec4(0.,0.,0.,1.);".endl();
        else if (type == "TexCoord") return "    " + outcolor + i + " = vec4(texCoord,0.,1.);".endl();
        else if (type == "Position Local") return "    " + outcolor + i + " = vec4(MOD_pos_local,1.);".endl();
        else if (type == "Position World") return "    " + outcolor + i + " = vec4(MOD_pos_world,1.);".endl();
        else if (type == "Position * ModelView") return "    " + outcolor + i + " = vec4(MOD_pos_mv,1.);".endl();

        else if (type == "Position Object") return "    " + outcolor + i + " = vec4(MOD_pos_object,1.);".endl();
        else if (type == "Normal World") return "    " + outcolor + i + " = vec4(normalize(MOD_normal_world),1.);".endl();
        else if (type == "Normal * ModelView") return "    " + outcolor + i + " = vec4(MOD_normal_mv,1.);".endl();
        else if (type == "Material Id") return "    " + outcolor + i + " = vec4(round(materialId),round(instIdx),0.,1.);".endl();
        else if (type == "Object Id") return "    " + outcolor + i + " = vec4(objectId,0.,0.,1.);".endl();
        else if (type == "FragCoord.z") return "    " + outcolor + i + " = vec4(vec3(gl_FragCoord.z),1.);".endl();

        else if (type.includes("OIT "))
        {
            let str = ""
                .endl() + "#ifndef OIT_WEIGHT"
                .endl() + "#define OIT_WEIGHT"
                .endl() + "    float oitWeight=clamp(pow(min(1.0, col.a * 10.0) + 0.01, 3.0) * 1e8 * pow(1.0 - gl_FragCoord.z * 0.9, 3.0), 1e-2, 3e3);"
                // .endl() + "    float oitWeight=100.0*exp(gl_FragCoord.z*gl_FragCoord.z);"
                .endl() + "#endif"
                .endl();

            if (type == "OIT Revealage") str += "    " + outcolor + i + " = vec4(col.a*oitWeight,col.a,1.0,1.0);".endl();
            if (type == "OIT Accum") str += ""
                .endl() + "    " + outcolor + i + " = vec4(col.rgb * col.a * oitWeight, col.a);";

            return str;
        }
    }

    getSrcFrag()
    {
        let src = rendertargets_slots;

        if (this._slots.length == 1)
        {
            src += this.getSrcString(this._slots[0], "");
        }
        else
            for (let i = 0; i < this._numBuffers; i++)
                src += this.getSrcString(this._slots[i], i);

        return src;
    }

    update(slots)
    {
        this._slots = slots;
        this._numBuffers = slots.length;
        this.asString = "";

        let hasPosWorld = false;
        let hasPosLocal = false;
        let hasPosObject = false;
        let hasMaterialId = false;
        let hasObjectId = false;
        let hasNormalModelView = false;
        let hasNormalWorld = false;
        let hasPosModelView = false;

        for (let i = 0; i < this._numBuffers; i++)
        {
            hasPosWorld = (slots[i] == "Position World") || hasPosWorld;
            hasNormalModelView = (slots[i] == "Normal * ModelView") || hasNormalModelView;
            hasPosLocal = (slots[i] == "Position Local") || hasPosLocal;
            hasPosModelView = (slots[i] == "Position * ModelView") || hasPosModelView;
            hasPosObject = (slots[i] == "Position Object") || hasPosObject;
            hasMaterialId = (slots[i].includes("Material Id")) || hasMaterialId;
            hasObjectId = (slots[i].includes("Object Id")) || hasObjectId;
            hasNormalWorld = (slots[i].includes("Normal World")) || hasNormalWorld;

            this.asString += slots[i];
            if (i != this._numBuffers - 1) this.asString += " | ";
        }

        this.updateModules();

        this.mod.toggleDefine("MOD_UNI_OBJECT_ID", hasObjectId);
        this.mod.toggleDefine("MOD_UNI_MATERIAL_ID", hasMaterialId);
        this.mod.toggleDefine("MOD_SLOT_POS_MV", hasPosModelView);

        this.mod.toggleDefine("MOD_SLOT_POS_WORLD", hasPosWorld);
        this.mod.toggleDefine("MOD_SLOT_POS_LOCAL", hasPosLocal);
        this.mod.toggleDefine("MOD_SLOT_POS_OBJECT", hasPosObject);
        this.mod.toggleDefine("MOD_SLOT_POS_NORMAL_MV", hasNormalModelView);
        this.mod.toggleDefine("MOD_SLOT_POS_NORMAL_WORLD", hasNormalWorld);
    }
}

;// CONCATENATED MODULE: ./src/corelibs/cgl/cgl_cubemaptexture.js


const cgl_cubemaptexture_DEFAULT_TEXTURE_SIZE = 8;

class CubemapTexture
{
    constructor(cgl, options)
    {
        this.id = external_CABLES_namespaceObject.utils.uuid();
        this.name = options.name || "unknown cubemap texture";
        this._cgl = cgl;
        this.textureType = CGL.Texture.TYPE_DEFAULT;
        this._options = options;

        if (!this._cgl.gl) return;

        this._cubemapFaces = [
            this._cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            this._cgl.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            this._cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            this._cgl.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            this._cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            this._cgl.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ];

        this.cubemap = this.tex = this._cgl.gl.createTexture();

        this.texTarget = this._cgl.gl.TEXTURE_CUBE_MAP;

        this.width = cgl_cubemaptexture_DEFAULT_TEXTURE_SIZE;
        this.height = cgl_cubemaptexture_DEFAULT_TEXTURE_SIZE;

        this.filter = options.filter || CGL.Texture.FILTER_NEAREST;
        this.wrap = options.wrap || CGL.Texture.WRAP_CLAMP_TO_EDGE;
        this.unpackAlpha = options.unpackAlpha || true;

        this.flip = options.flip || true;

        if (!options.hasOwnProperty("pixelFormat") || !options.pixelFormat)
        {
            if (options.isFloatingPointTexture) options.pixelFormat = CGL.Texture.PFORMATSTR_RGBA32F;
            else options.pixelFormat = CGL.Texture.PFORMATSTR_RGBA8UB;
        }

        this.pixelFormat = options.pixelFormat;

        cgl.profileData.count("texturecreated");

        this.setSize(options.width, options.height);
    }

    getInfo()
    {
        return { "pixelFormat": this.pixelFormat };
    }

    /**
     * @param {number} w
     * @param {number} h
     */
    setSize(w, h)
    {
        // if (this.width == w && this.height == h) return;

        this.delete();
        this.cubemap = this.tex = this._cgl.gl.createTexture();

        this._cgl.checkFrameStarted("cubemap corelib setsize");

        if (w != w || w <= 0 || !w) w = cgl_cubemaptexture_DEFAULT_TEXTURE_SIZE;
        if (h != h || h <= 0 || !h) h = cgl_cubemaptexture_DEFAULT_TEXTURE_SIZE;

        if (w > this._cgl.maxTexSize || h > this._cgl.maxTexSize) console.error("texture size too big! " + w + "x" + h + " / max: " + this._cgl.maxTexSize);

        w = Math.min(w, this._cgl.maxTexSize);
        h = Math.min(h, this._cgl.maxTexSize);

        w = Math.floor(w);
        h = Math.floor(h);

        this.width = w;
        this.height = h;

        this._cgl.gl.bindTexture(this.texTarget, this.tex);
        this._cgl.profileData.count("textureResize");

        const info = CGL.Texture.setUpGlPixelFormat(this._cgl, this._options.pixelFormat);
        this.pixelFormat = info.pixelFormat;

        if (CGL.Texture.isPixelFormatHalfFloat(info.pixelFormat))
        {
            const extcb = this._cgl.enableExtension("EXT_color_buffer_half_float");

            if (!this._cgl.enableExtension("OES_texture_float_linear"))
            {
                this.filter = CGL.Texture.FILTER_NEAREST;
            }
        }
        else if (CGL.Texture.isPixelFormatFloat(info.pixelFormat))
        {
            if (!this._cgl.enableExtension("OES_texture_float_linear"))
            {
                console.log("no linear pixelformat,using nearest");
                this.filter = CGL.Texture.FILTER_NEAREST;
            }
        }
        // console.log("cubemaptex setfilter...");

        for (let i = 0; i < 6; i++)
        {
            // console.log("cube tex ", i);

            // if (this._cgl.glVersion == 1)console.log("webgl1");
            // {
            // if (this._cgl.glUseHalfFloatTex)
            // {
            //     const ext = this._cgl.enableExtension("OES_texture_half_float");
            //     if (this._cgl.glVersion == 1 && !ext) throw new Error("no half float texture extension");

            //     this._cgl.gl.texImage2D(this._cubemapFaces[i], 0, this._cgl.gl.RGBA, this.width, this.height, 0, this._cgl.gl.RGBA, ext.HALF_FLOAT_OES, null);
            // }
            // else
            // {
            //     const ext = this._cgl.enableExtension("OES_texture_float");

            //     this._cgl.gl.texImage2D(this._cubemapFaces[i], 0, this._cgl.gl.RGBA, this.width, this.height, 0, this._cgl.gl.RGBA, this._cgl.gl.FLOAT, null);
            // }
            //     this._cgl.gl.texImage2D(this._cubemapFaces[i], 0, this._cgl.gl.RGBA, this.width, this.height, 0, this._cgl.gl.RGBA, this._cgl.gl.UNSIGNED_BYTE, null);
            // }
            // else
            // {
            // this._cgl.enableExtension("EXT_color_buffer_float");
            // this._cgl.enableExtension("OES_texture_float_linear"); // yes, i am sure, this is a webgl 1 and 2 ext

            // console.log(info);
            this._cgl.gl.texImage2D(this._cubemapFaces[i], 0, info.glInternalFormat, this.width, this.height, 0, info.glDataFormat, info.glDataType, null);

            // if (this.textureType == Texture.TYPE_FLOAT)
            // {
            //     // console.log("cubemap FLOAT TEX", this._options);
            //     this._cgl.enableExtension("EXT_color_buffer_float");
            //     this._cgl.enableExtension("OES_texture_float_linear"); // yes, i am sure, this is a webgl 1 and 2 ext

            //     this._cgl.gl.texImage2D(this._cubemapFaces[i], 0, this._cgl.gl.RGBA32F, this.width, this.height, 0, this._cgl.gl.RGBA, this._cgl.gl.FLOAT, null);
            // }
            // else
            // {
            //     this._cgl.gl.texImage2D(this._cubemapFaces[i], 0, this._cgl.gl.RGBA, this.width, this.height, 0, this._cgl.gl.RGBA, this._cgl.gl.UNSIGNED_BYTE, null);
            // }
            // }
            // * NOTE: was gl.RGBA32F && gl.FLOAT instead of gl.RGBA && gl.UNSIGNED_BYTE
        }

        this._setFilter();

        // console.log("cubemaptex update mips ..");
        this.updateMipMap();
        // console.log("cubemaptex ende");
        this._cgl.gl.bindTexture(this.texTarget, null);
    }

    _setFilter()
    {
        this._cgl.checkFrameStarted("cubemap corelib");

        this._cgl.gl.pixelStorei(this._cgl.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.unpackAlpha);

        if (CGL.Texture.isPixelFormatFloat(this.pixelFormat) && this.filter == CGL.Texture.FILTER_MIPMAP)
        {
            console.log("texture: HDR and mipmap filtering at the same time is not possible");
            this.filter = CGL.Texture.FILTER_LINEAR;
        }

        if (this._cgl.glVersion == 1 && !CGL.Texture.isPowerOfTwo())
        {
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MAG_FILTER, this._cgl.gl.NEAREST);
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MIN_FILTER, this._cgl.gl.NEAREST);

            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_S, this._cgl.gl.CLAMP_TO_EDGE);
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_T, this._cgl.gl.CLAMP_TO_EDGE);

            this.filter = CGL.Texture.FILTER_NEAREST;
            this.wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;
        }
        else
        {
            if (this.wrap == CGL.Texture.WRAP_CLAMP_TO_EDGE)
            {
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_S, this._cgl.gl.CLAMP_TO_EDGE);
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_T, this._cgl.gl.CLAMP_TO_EDGE);
            }
            else if (this.wrap == CGL.Texture.WRAP_REPEAT)
            {
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_S, this._cgl.gl.REPEAT);
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_T, this._cgl.gl.REPEAT);
            }
            else if (this.wrap == CGL.Texture.WRAP_MIRRORED_REPEAT)
            {
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_S, this._cgl.gl.MIRRORED_REPEAT);
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_T, this._cgl.gl.MIRRORED_REPEAT);
            }
            else
            {
                throw new Error("[CubemapTexture] unknown texture filter!" + this.filter);
            }

            if (this.filter == CGL.Texture.FILTER_NEAREST)
            {
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MAG_FILTER, this._cgl.gl.NEAREST);
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MIN_FILTER, this._cgl.gl.NEAREST);
            }
            else if (this.filter == CGL.Texture.FILTER_LINEAR)
            {
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MIN_FILTER, this._cgl.gl.LINEAR);
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MAG_FILTER, this._cgl.gl.LINEAR);
            }
            else if (this.filter == CGL.Texture.FILTER_MIPMAP)
            {
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MAG_FILTER, this._cgl.gl.LINEAR);
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MIN_FILTER, this._cgl.gl.LINEAR_MIPMAP_LINEAR);
            }
            else
            {
                throw new Error("[CubemapTexture] unknown texture filter!" + this.filter);
            }
        }
    }

    updateMipMap()
    {
        // if (!((this._cgl.glVersion == 2 || Texture.isPowerOfTwo()) && this.filter == CGL.Texture.FILTER_MIPMAP)) return;

        if (this.filter == CGL.Texture.FILTER_MIPMAP)
        {
            this._cgl.gl.bindTexture(this.texTarget, this.tex);
            this._cgl.gl.generateMipmap(this.texTarget);
            this._cgl.profileData.count("textureGenMipMap");
        }
    }

    delete()
    {
        this._cgl.gl.deleteTexture(this.tex);
    }
}

;// CONCATENATED MODULE: ./src/corelibs/cgl/cgl_cubemapframebuffer.js



class CubemapFramebuffer
{

    /**
     * @param {any} cgl
     * @param {number} width
     * @param {number} height
     * @param {object} options
     */
    constructor(cgl, width, height, options)
    {
        this._cgl = cgl;
        this.width = width || 8;
        this.height = height || 8;
        this._cubemapProperties = [
            // targets for use in some gl functions for working with cubemaps
            {
                "face": this._cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                "lookAt": vec3_fromValues(1.0, 0.0, 0.0),
                "up": vec3_fromValues(0.0, -1.0, 0.0),
            },
            {
                "face": this._cgl.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                "lookAt": vec3_fromValues(-1.0, 0.0, 0.0),
                "up": vec3_fromValues(0.0, -1.0, 0.0),
            },
            {
                "face": this._cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                "lookAt": vec3_fromValues(0.0, 1.0, 0.0),
                "up": vec3_fromValues(0.0, 0.0, 1.0),
            },
            {
                "face": this._cgl.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                "lookAt": vec3_fromValues(0.0, -1.0, 0.0),
                "up": vec3_fromValues(0.0, 0.0, -1.0),
            },
            {
                "face": this._cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                "lookAt": vec3_fromValues(0.0, 0.0, 1.0),
                "up": vec3_fromValues(0.0, -1.0, 0.0),
            },
            {
                "face": this._cgl.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
                "lookAt": vec3_fromValues(0.0, 0.0, -1.0),
                "up": vec3_fromValues(0.0, -1.0, 0.0),
            },
        ];

        this._lookAtTemp = vec3_fromValues(0, 0, 0);
        this.camPos = vec3_fromValues(0, 0, 0);

        this._modelMatrix = mat4_create();
        this._viewMatrix = mat4_create();
        this._projectionMatrix = perspective(mat4_create(), CGL.DEG2RAD * 90, 1, 0.1, 1000.0);
        this._depthRenderbuffer = null;
        this._framebuffer = null;
        this._depthbuffer = null;
        // this._textureFrameBuffer = null;
        this._textureDepth = null;

        this._options = options || {
            // "isFloatingPointTexture": false
        };

        this.name = this._options.name || "unknown cubemapframebuffer";
        if (!this._options.hasOwnProperty("numRenderBuffers")) this._options.numRenderBuffers = 1;
        if (!this._options.hasOwnProperty("depth")) this._options.depth = true;
        if (!this._options.hasOwnProperty("clear")) this._options.clear = true;
        if (!this._options.hasOwnProperty("multisampling"))
        {
            this._options.multisampling = false;
            this._options.multisamplingSamples = 0;
        }

        if (this._options.multisamplingSamples)
        {
            if (this._cgl.glSlowRenderer) this._options.multisamplingSamples = 0;
            if (!this._cgl.gl.MAX_SAMPLES) this._options.multisamplingSamples = 0;
            else this._options.multisamplingSamples = Math.min(this._cgl.gl.getParameter(this._cgl.gl.MAX_SAMPLES), this._options.multisamplingSamples);
        }

        if (!this._options.hasOwnProperty("filter")) this._options.filter = CGL.Texture.FILTER_LINEAR;
        if (!this._options.hasOwnProperty("wrap")) this._options.wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

        this._cgl.checkFrameStarted("cubemap framebuffer");

        let pxlFormat = options.pixeFormat;
        if (!pxlFormat && options.isFloatingPointTexture)pxlFormat = CGL.Texture.PFORMATSTR_RGBA32F;

        this.texture = new CubemapTexture(this._cgl, {
            "width": this.width,
            "height": this.height,
            "pixelFormat": options.pixelFormat,
            "filter": this._options.filter,
            "wrap": this._options.wrap,
            "name": this.name + " cubemaptexture"
        });

        this.initializeRenderbuffers();
        this.setSize(this.width, this.height);
    }

    initializeRenderbuffers()
    {
        this._framebuffer = this._cgl.gl.createFramebuffer(); // crate the framebuffer that will draw to the reflection map
        this._depthbuffer = this._cgl.gl.createRenderbuffer(); // renderbuffer for depth buffer in framebuffer

        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._framebuffer); // select the framebuffer, so we can attach the depth buffer to it
        this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, this._depthbuffer); // so we can create storage for the depthBuffer

        this._cgl.gl.renderbufferStorage(this._cgl.gl.RENDERBUFFER, this._cgl.gl.DEPTH_COMPONENT16, this.width, this.height);
        this._cgl.gl.framebufferRenderbuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.DEPTH_ATTACHMENT, this._cgl.gl.RENDERBUFFER, this._depthbuffer);

        this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, null);
        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, null);
    }

    getWidth()
    {
        return this.width;
    }

    getHeight()
    {
        return this.height;
    }

    getGlFrameBuffer()
    {
        return this._framebuffer;
    }

    getDepthRenderBuffer()
    {
        return this._depthRenderbuffer;
    }

    getTextureColor()
    {
        return this.texture;
    }

    getTextureDepth()
    {
        return this._textureDepth;
    }

    dispose()
    {
        if (this.texture) this.texture = this.texture.delete();
        if (this._framebuffer) this._cgl.gl.deleteFramebuffer(this._framebuffer);
        if (this._depthRenderbuffer) this._cgl.gl.deleteRenderbuffer(this._depthbuffer);
        // // if (this._textureFrameBuffer) this._cgl.gl.deleteFramebuffer(this._textureFrameBuffer);
    }

    delete()
    {
        this.dispose();
    }

    /**
     * @param {number} width
     * @param {number} height
     */
    setSize(width, height)
    {
        this._cgl.printError("before cubemap setsize");

        this.width = Math.floor(width);
        this.height = Math.floor(height);
        this.width = Math.min(this.width, this._cgl.maxTexSize);
        this.height = Math.min(this.height, this._cgl.maxTexSize);

        this._cgl.profileData.profileFrameBuffercreate++;

        // if (this._framebuffer) this._cgl.gl.deleteFramebuffer(this._framebuffer);
        // if (this._depthRenderbuffer) this._cgl.gl.deleteRenderbuffer(this._depthbuffer);
        // // if (this._textureFrameBuffer) this._cgl.gl.deleteFramebuffer(this._textureFrameBuffer);

        this._framebuffer = this._cgl.gl.createFramebuffer();
        this._depthbuffer = this._cgl.gl.createRenderbuffer();
        this.texture.setSize(this.width, this.height);

        // this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_CUBE_MAP, this.texture.tex);
        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._framebuffer); // select the framebuffer, so we can attach the depth buffer to it
        this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, this._depthbuffer); // so we can create storage for the depthBuffer

        this._cgl.gl.renderbufferStorage(this._cgl.gl.RENDERBUFFER, this._cgl.gl.DEPTH_COMPONENT16, this.width, this.height);
        this._cgl.gl.framebufferRenderbuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.DEPTH_ATTACHMENT, this._cgl.gl.RENDERBUFFER, this._depthbuffer);

        if (!this._cgl.gl.isFramebuffer(this._framebuffer))
        {
            console.error("invalid framebuffer...");
            // throw new Error("Invalid framebuffer");
        }

        // * NOTE: if we check for the error in Safari, we get error code 36059 aka 0x8CDB
        // * NOTE: an error that is found in a WebGL extension (WEBGL_draw_buffers) not supported by most iOS devices
        // * NOTE: see https://gist.github.com/TimvanScherpenzeel/2a604e178013a5ac4b411fbcbfd2fa33
        // * NOTE: also, this error is nowhere to be found in the official WebGL 1 spec
        // if (this._cgl.glVersion !== 1)
        // {
        const status = this._cgl.gl.checkFramebufferStatus(this._cgl.gl.FRAMEBUFFER);
        this.checkErrorsByStatus(status);
        // }

        this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_CUBE_MAP, null);
        this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, null);
        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, null);

        this._cgl.printError("cubemap setsize");
    }

    checkErrorsByStatus(status)
    {
        switch (status)
        {
        case this._cgl.gl.FRAMEBUFFER_COMPLETE:
            break;
        case this._cgl.gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
            console.error("FRAMEBUFFER_INCOMPLETE_ATTACHMENT...", this.width, this.height, this.texture.tex, this._depthBuffer);
            throw new Error("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
        case this._cgl.gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
            console.error("FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
            throw new Error("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
        case this._cgl.gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
            console.error("FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
            throw new Error("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
        case this._cgl.gl.FRAMEBUFFER_UNSUPPORTED:
            console.error("FRAMEBUFFER_UNSUPPORTED");
            throw new Error("Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");
        case 0x8CDB:
            console.error("Incomplete: FRAMEBUFFER_INCOMPLETE_DRAW_BUFFER from ext. Or Safari/iOS undefined behaviour.");
            break;
        default:
            console.error("incomplete framebuffer", status);
            console.log(this);
            throw new Error("Incomplete framebuffer: " + status);
        }
    }

    setFilter(filter)
    {
        this.texture.filter = filter;
        this.texture.setSize(this.width, this.height);
    }

    setCamPos(camPos)
    {
        this.camPos = camPos || this.camPos;
    }

    setMatrices(M, V, P)
    {
        this._modelMatrix = M || this._modelMatrix;
        this._viewMatrix = V || this._viewMatrix;
        this._projectionMatrix = P || this._projectionMatrix;
    }

    renderStart()
    {
        this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_CUBE_MAP, this.texture.tex);
        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._framebuffer);
        this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, this._depthbuffer);
        this._cgl.gl.viewport(0, 0, this.width, this.height);
        this._cgl.pushGlFrameBuffer(this._framebuffer);
        this._cgl.pushFrameBuffer(this);
    }

    renderStartCubemapFace(index)
    {
        this._cgl.pushModelMatrix();
        this._cgl.pushViewMatrix();
        this._cgl.pushPMatrix();

        this._cgl.gl.framebufferTexture2D(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.COLOR_ATTACHMENT0, this._cubemapProperties[index].face, this.texture.tex, 0);
        this._cgl.gl.framebufferRenderbuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.DEPTH_ATTACHMENT, this._cgl.gl.RENDERBUFFER, this._depthbuffer);

        if (this._options.clear)
        {
            this._cgl.gl.clearColor(0, 0, 0, 1);
            this._cgl.gl.clear(this._cgl.gl.COLOR_BUFFER_BIT | this._cgl.gl.DEPTH_BUFFER_BIT);
        }

        this.setMatricesCubemapFace(index);
    }

    setMatricesCubemapFace(index)
    {
        mat4_copy(this._cgl.mMatrix, this._modelMatrix);
        vec3_add(this._lookAtTemp, this.camPos, this._cubemapProperties[index].lookAt);

        lookAt(this._cgl.vMatrix, this.camPos, this._lookAtTemp, this._cubemapProperties[index].up); // V

        mat4_copy(this._cgl.pMatrix, this._projectionMatrix);
    }

    renderEndCubemapFace()
    {
        this._cgl.popPMatrix();
        this._cgl.popModelMatrix();
        this._cgl.popViewMatrix();
    }

    renderEnd()
    {
        this._cgl.profileData.count("frameBufferBlit");

        if (this._cgl.glVersion !== 1)
        {
            this._cgl.gl.bindFramebuffer(this._cgl.gl.READ_FRAMEBUFFER, this._framebuffer);
            // this._cgl.gl.bindFramebuffer(this._cgl.gl.DRAW_FRAMEBUFFER, this._textureFrameBuffer);
            // * NOTE: the line below is commented out because it clears the screen to black after
            // * point light shadow map has been rendered
            // this._cgl.gl.clearBufferfv(this._cgl.gl.COLOR, 0, [0.0, 0.0, 0.0, 1.0]);
        }

        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.popGlFrameBuffer());
        this._cgl.popFrameBuffer();

        this._cgl.resetViewPort();
        this.updateMipMap();
    }

    updateMipMap()
    {
        if (!this.texture) return;

        this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_CUBE_MAP, this.texture.tex);
        this.texture.updateMipMap();
        this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_CUBE_MAP, null);
    }
}



;// CONCATENATED MODULE: ./src/corelibs/cgl/cgl_light.js



class Light
{

    /**
     * @param {CglContext} cgl
     * @param {object} config
     */
    constructor(cgl, config)
    {
        // * common settings for each light
        this.type = config.type || "point";
        this.color = config.color || [1, 1, 1];
        this.specular = config.specular || [0, 0, 0];
        this.position = config.position || null;
        this.intensity = config.intensity || 1;
        this.radius = config.radius || 1;
        this.falloff = config.falloff || 1;

        // * spot light specific config
        this.spotExponent = config.spotExponent || 1;
        this.cosConeAngleInner = config.cosConeAngleInner || 0; // spot light
        this.cosConeAngle = config.cosConeAngle || 0;
        this.conePointAt = config.conePointAt || [0, 0, 0];

        // * shadow specific config
        this.castShadow = config.castShadow || false;
        this.nearFar = config.nearFar || [0, 0];
        this.normalOffset = config.normalOffset || 0;
        this.shadowBias = config.shadowBias || 0;
        this.shadowStrength = config.shadowStrength || 0;
        this.lightMatrix = null;

        this.shadowMap = null;
        this.shadowMapDepth = null;
        this.shadowCubeMap = null;

        // * internal config
        this._cgl = cgl;
        this.state = {
            "isUpdating": false
        };
        this._framebuffer = null;
        this._shaderShadowMap = {
            "shader": null,
            "uniforms": {
                "lightPosition": null,
                "nearFar": null,
            },
            "matrices": {
                "modelMatrix": mat4_create(),
                "viewMatrix": mat4_create(),
                "projMatrix": mat4_create(),
                "biasMatrix": mat4_fromValues(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0),
            },
            "vectors": {
                "lookAt": vec3_create(),
                "camPos": vec3_create(),
                "up": vec3_fromValues(0, 1, 0),
            },
        };
        this._effectBlur = null;
        this._shaderBlur = {
            "shader": null,
            "uniforms": {
                "XY": null,
            },
        };
        this._cubemap = null;

    }

    getModifiableParameters()
    {
        return [
            "color",
            "specular",
            "position",
            "intensity",
            "radius",
            "falloff",

            // * spot light specific config
            "spotExponent",
            "cosConeAngleInner",
            "cosConeAngle",
            "conePointAt",
        ];
    }

    createProjectionMatrix(lrBottomTop, near, far, angle)
    {
        this.updateProjectionMatrix(lrBottomTop, near, far, angle);
    }

    updateProjectionMatrix(lrBottomTop, near, far, angle)
    {
        if (this.type === "spot")
        {
            perspective(this._shaderShadowMap.matrices.projMatrix, -2 * CGL.DEG2RAD * angle, 1, near, far); // * angle in degrees
        }
        else if (this.type === "directional")
        {
            ortho(this._shaderShadowMap.matrices.projMatrix, -1 * lrBottomTop, lrBottomTop, -1 * lrBottomTop, lrBottomTop, near, far);
        }
        else if (this.type === "point")
        {
            perspective(this._shaderShadowMap.matrices.projMatrix, CGL.DEG2RAD * 90, 1, near, far);
            this.nearFar = [near, far];
        }
    }

    hasFramebuffer()
    {
        return !!this._framebuffer;
    }

    hasShadowMapShader()
    {
        return !!this._shaderShadowMap.shader;
    }

    hasBlurShader()
    {
        return !!this._shaderBlur.shader;
    }

    hasBlurEffect()
    {
        return !!this._effectBlur;
    }

    getShadowMap()
    {
        if (this.type === "point") return null; // TODO: replace
        return this._framebuffer.getTextureColor();
    }

    getShadowMapDepth()
    {
        if (this.type === "point") return null;
        return this._framebuffer.getTextureDepth();
    }

    /**
     * @param {number} width
     * @param {number} height
     * @param {{ filter: any; isFloatingPointTexture: boolean; }} options
     */
    createFramebuffer(width, height, options)
    {
        this.state.isUpdating = true;

        const fbWidth = width || 512;
        const fbHeight = height || 512;

        if (this.type === "point")
        {
            if (!this.hasCubemap())
            {
                this._cubemap = new CGL.CubemapFramebuffer(this._cgl, fbWidth, fbHeight, {
                    "name": "point light shadowmap"
                });
            }
            else
            {
                this._cubemap.setSize(fbWidth, fbHeight);
            }

            this._cubemap.setCamPos(this.position);
            this._cubemap.setMatrices(
                this._shaderShadowMap.matrices.modelMatrix,
                this._shaderShadowMap.matrices.viewMatrix,
                this._shaderShadowMap.matrices.projMatrix
            );

            this.state.isUpdating = false;
            return;
        }

        if (this.hasFramebuffer()) this._framebuffer.delete();

        if (options)
        {
            if (options.filter)
            {
            // * set FP to false if mipmap filtering is selected
                options.isFloatingPointTexture = options.filter !== CGL.Texture.FILTER_MIPMAP;
            }
        }

        if (this._cgl.glVersion == 1)
        {
            this._framebuffer = new CGL.Framebuffer(
                this._cgl,
                fbWidth,
                fbHeight,
                ({
                    "isFloatingPointTexture": true,
                    "filter": CGL.Texture.FILTER_LINEAR,
                    "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE,
                    ...options,
                }),
            );
        }
        else
        {
            this._framebuffer = new CGL.Framebuffer2(
                this._cgl,
                fbWidth,
                fbHeight,
                ({
                    "isFloatingPointTexture": true,
                    "filter": CGL.Texture.FILTER_LINEAR,
                    "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE,
                    ...options,
                }),
            );
        }

        this.state.isUpdating = false;
    }

    hasCubemap()
    {
        return !!this._cubemap;
    }

    /**
     * @param {number} size
     */
    setFramebufferSize(size)
    {
        if (this.hasFramebuffer()) this._framebuffer.setSize(size, size);
    }

    /**
     * @param {string} vertexShader
     * @param {string} fragmentShader
     */
    createShadowMapShader(vertexShader, fragmentShader)
    {
        if (this.hasShadowMapShader()) return;

        this.state.isUpdating = true;

        this._shaderShadowMap.shader = new CGL.Shader(this._cgl, "shadowPass" + this.type.charAt(0).toUpperCase() + this.type.slice(1));
        this._shaderShadowMap.shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);

        const vShader = vertexShader || this.getShadowPassVertexShader();
        const fShader = fragmentShader || this.getShadowPassFragmentShader();

        this._shaderShadowMap.shader.setSource(vShader, fShader);
        this._shaderShadowMap.shader.offScreenPass = true;

        if (this.type === "point")
        {
            this._shaderShadowMap.uniforms.lightPosition = new CGL.Uniform(this._shaderShadowMap.shader, "3f", "inLightPosition", vec3_create());

            this._shaderShadowMap.uniforms.nearFar = new CGL.Uniform(this._shaderShadowMap.shader, "2f", "inNearFar", vec2_create());
        }

        if (this._cgl.glVersion == 1)
        {
            this._cgl.enableExtension("OES_texture_float");
            this._cgl.enableExtension("OES_texture_float_linear");
            this._cgl.enableExtension("OES_texture_half_float");
            this._cgl.enableExtension("OES_texture_half_float_linear");

            this._shaderShadowMap.shader.enableExtension("GL_OES_standard_derivatives");
            this._shaderShadowMap.shader.enableExtension("GL_OES_texture_float");
            this._shaderShadowMap.shader.enableExtension("GL_OES_texture_float_linear");
            this._shaderShadowMap.shader.enableExtension("GL_OES_texture_half_float");
            this._shaderShadowMap.shader.enableExtension("GL_OES_texture_half_float_linear");
        }

        this.state.isUpdating = false;
    }

    /**
     * @param {import("../cg/cg_texture").CglTextureOptions} options
     */
    createBlurEffect(options)
    {
        if (this.type === "point") return;
        this.state.isUpdating = true;
        if (this.hasBlurEffect()) this._effectBlur.delete();

        this._effectBlur = new CGL.TextureEffect(
            this._cgl,
            ({
                "isFloatingPointTexture": true,
                "filter": CGL.Texture.FILTER_LINEAR,
                "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE,
                ...options,
            }),
        );
        this.state.isUpdating = false;
    }

    /**
     * @param {string} vertexShader
     * @param {string} fragmentShader
     */
    createBlurShader(vertexShader, fragmentShader)
    {
        if (this.hasBlurShader())
        {
            return;
        }
        if (this.type === "point") return; // TODO: add cubemap convolution

        this.state.isUpdating = true;

        const vShader = vertexShader || this.getBlurPassVertexShader();
        const fShader = fragmentShader || this.getBlurPassFragmentShader();

        this._shaderBlur.shader = new CGL.Shader(this._cgl, "blurPass" + this.type.charAt(0).toUpperCase() + this.type.slice(1));
        this._shaderBlur.shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
        this._shaderBlur.shader.setSource(vShader, fShader);

        this._shaderBlur.uniforms.XY = new CGL.Uniform(this._shaderBlur.shader, "2f", "inXY", vec2_create());
        this._shaderBlur.shader.offScreenPass = true;
        this.state.isUpdating = false;
    }

    /**
     * @param {number} polygonOffset
     * @param {number} blurAmount
     * @param {Function} renderFunction
     */
    renderPasses(polygonOffset, blurAmount, renderFunction)
    {
        if (this.state.isUpdating) return;
        if (this._cgl.tempData.shadowPass) return;

        this._cgl.pushCullFace(true);
        this._cgl.pushCullFaceFacing(this._cgl.gl.FRONT);
        this._cgl.gl.enable(this._cgl.gl.POLYGON_OFFSET_FILL);
        this._cgl.gl.polygonOffset(polygonOffset, polygonOffset);

        this._cgl.tempData.renderOffscreen = true;
        this._cgl.tempData.shadowPass = true;

        this._cgl.pushBlend(false);
        this._cgl.gl.colorMask(true, true, this.type === "point", this.type === "point"); // * for now just 2 channels, with MSM we need 4

        this.renderShadowPass(renderFunction);

        this._cgl.gl.cullFace(this._cgl.gl.BACK);
        this._cgl.gl.disable(this._cgl.gl.CULL_FACE);
        this._cgl.gl.disable(this._cgl.gl.POLYGON_OFFSET_FILL);

        if (this.type !== "point") this.renderBlurPass(blurAmount);

        this._cgl.gl.colorMask(true, true, true, true);

        this._cgl.popBlend();
        this._cgl.popCullFaceFacing();
        this._cgl.popCullFace();

        this._cgl.tempData.shadowPass = false;
        this._cgl.tempData.renderOffscreen = false;

        if (this.type !== "point")
        {
            this.shadowMap = this._framebuffer.getTextureColor();
            this.shadowMapDepth = this._framebuffer.getTextureDepth();
        }
        else
        {
            this.shadowMap = null;
            this.shadowMapDepth = null;
        }
    }

    /**
     * @param {Function} renderFunction
     */
    renderShadowPass(renderFunction)
    {
        if (this.state.isUpdating) return;
        if (this.type === "point")
        {
            this._shaderShadowMap.uniforms.nearFar.setValue(this.nearFar);
            this._shaderShadowMap.uniforms.lightPosition.setValue(this.position);

            this._cubemap.setCamPos(this.position);
            this._cubemap.setMatrices(this._shaderShadowMap.matrices.modelMatrix, this._shaderShadowMap.matrices.viewMatrix, this._shaderShadowMap.matrices.projMatrix);

            this._cgl.pushShader(this._shaderShadowMap.shader);

            // this._cubemap.renderCubemap(renderFunction);

            this._cubemap.renderStart();

            for (let i = 0; i < 6; i += 1)
            {
                this._cubemap.renderStartCubemapFace(i);
                if (renderFunction) renderFunction();
                this._cubemap.renderEndCubemapFace();
            }

            this._cubemap.renderEnd();

            this._cgl.popShader();
            this.shadowCubeMap = this._cubemap.getTextureColor(); // getCubemap();
            return;
        }

        this._cgl.pushShader(this._shaderShadowMap.shader);

        this._cgl.pushModelMatrix();
        this._cgl.pushViewMatrix();
        this._cgl.pushPMatrix();

        this._framebuffer.renderStart(this._cgl);

        // * create MVP matrices
        mat4_copy(this._cgl.mMatrix, this._shaderShadowMap.matrices.modelMatrix);

        vec3_set(this._shaderShadowMap.vectors.camPos, this.position[0], this.position[1], this.position[2]);

        if (this.type === "spot") vec3_set(this._shaderShadowMap.vectors.lookAt, this.conePointAt[0], this.conePointAt[1], this.conePointAt[2]);

        lookAt(this._cgl.vMatrix, this._shaderShadowMap.vectors.camPos, this._shaderShadowMap.vectors.lookAt, this._shaderShadowMap.vectors.up);

        mat4_copy(this._cgl.pMatrix, this._shaderShadowMap.matrices.projMatrix);

        if (!this.lightMatrix) this.lightMatrix = mat4_create();

        // * create light mvp bias matrix
        mat4_mul(this.lightMatrix, this._cgl.pMatrix, this._cgl.vMatrix);
        mat4_mul(this.lightMatrix, this._cgl.mMatrix, this.lightMatrix);
        mat4_mul(this.lightMatrix, this._shaderShadowMap.matrices.biasMatrix, this.lightMatrix);

        this._cgl.gl.clearColor(1, 1, 1, 1);
        this._cgl.gl.clear(this._cgl.gl.DEPTH_BUFFER_BIT | this._cgl.gl.COLOR_BUFFER_BIT);

        if (renderFunction) renderFunction(); // * e.g. op.trigger();
        this._framebuffer.renderEnd(this._cgl);
        this._cgl.popPMatrix();
        this._cgl.popModelMatrix();
        this._cgl.popViewMatrix();

        this._cgl.popShader();
    }

    renderBlurPass(blurAmount)
    {
        if (this.state.isUpdating) return;
        this._cgl.pushShader(this._shaderBlur.shader);

        this._effectBlur.setSourceTexture(this._framebuffer.getTextureColor()); // take shadow map as source
        this._effectBlur.startEffect();

        this._effectBlur.bind();

        this._cgl.setTexture(0, this._effectBlur.getCurrentSourceTexture().tex);
        this._shaderBlur.uniforms.XY.setValue([blurAmount, 0]);
        this._effectBlur.finish();

        this._effectBlur.bind();
        this._cgl.setTexture(0, this._effectBlur.getCurrentSourceTexture().tex);
        this._shaderBlur.uniforms.XY.setValue([0, blurAmount]);

        this._effectBlur.finish();

        this._effectBlur.endEffect();

        this._cgl.popShader();
    }

    getShadowPassVertexShader()
    {
        return `
IN vec3 vPosition;
IN vec2 attrTexCoord;
IN vec3 attrVertNormal;
IN float attrVertIndex;
IN vec3 attrTangent;
IN vec3 attrBiTangent;

UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;


OUT vec2 texCoord;
OUT vec3 norm;

{{MODULES_HEAD}}

${this.type === "point" ? "OUT vec3 modelPos;" : ""}
void main() {
    texCoord=attrTexCoord;
    texCoord.y = 1. - texCoord.y;
    norm=attrVertNormal;
    vec4 pos = vec4(vPosition, 1.0);
    mat4 mMatrix=modelMatrix;
    vec3 tangent = attrTangent;
    vec3 bitangent = attrBiTangent;

    {{MODULE_VERTEX_POSITION}}

    mat4 mvMatrix=viewMatrix * mMatrix;
    vec4 vPos = projMatrix * mvMatrix * pos;
    ${this.type === "point" ? "modelPos = (mMatrix * pos).xyz;" : ""}
    gl_Position = vPos;
}
`;
    }

    getShadowPassFragmentShader()
    {

        /*
    // http://fabiensanglard.net/shadowmappingVSM/
    #define SQRT3 1.73205081
    #define SQRT3DIV2 0.86602540378
    #define SQRT12DIV9 -0.38490017946

    // FOR MOMENT SHADOW MAPPING
    const mat4 ENCODE_MATRIX = mat4(
    vec4(1.5, 0., SQRT3DIV2, 0.),
    vec4(0., 4., 0., 0.5),
    vec4(-2., 0., SQRT12DIV9, 0.),
    vec4(0., -4., 0., 0.5)
    );
    */
        /*
   dot(x, x) = x*x
   Finally, it is usually beneficial to clamp the partial derivative portion of M 2
   to avoid an excessively high variance if an occluder is almost parallel to the light direction.
   Hardware-generated partial derivatives become somewhat unstable in these cases
   and a correspondingly unstable variance can produce random, flashing pixels of light
   in regions that should be fully shadowed.
   https://developer.nvidia.com/gpugems/gpugems3/part-ii-light-and-shadows/chapter-8-summed-area-variance-shadow-maps
   */
        return `
   {{MODULES_HEAD}}
   ${this.type === "point" ? "IN vec3 modelPos;" : ""}
   ${this.type === "point" ? "UNI vec3 inLightPosition;" : ""}
   ${this.type === "point" ? "UNI vec2 inNearFar;" : ""}

    IN vec2 texCoord;

    void main() {
        {{MODULE_BEGIN_FRAG}}
        vec4 col = vec4(1.);


        outColor = vec4(1.);

        {{MODULE_COLOR}}

        ${this.type === "point" ? "vec3 fromLightToFrag = (modelPos - inLightPosition);" : ""}


        ${this.type === "point" ? "float depth = (length(fromLightToFrag) - inNearFar.x) / (inNearFar.y - inNearFar.x);" : "float depth = gl_FragCoord.z;"}

        float dx = dFdx(depth); // for biasing depth-per-pixel
        float dy = dFdy(depth); // for biasing depth-per-pixel

        float clampedDerivative = clamp(dot(dx, dx) + dot(dy, dy), 0., 1.);
        float moment2 = dot(depth, depth) + 0.25 * clampedDerivative;

        outColor.x = depth;
        outColor.y = moment2;
        outColor.z = depth;
    }
`;
    }

    getBlurPassVertexShader()
    {
        if (this.type === "point") return "";
        return `

IN vec3 vPosition;
IN vec2 attrTexCoord;

OUT vec2 texCoord;
OUT vec2 coord0;
OUT vec2 coord1;
OUT vec2 coord2;
OUT vec2 coord3;
OUT vec2 coord4;
OUT vec2 coord5;
OUT vec2 coord6;

UNI mat4 projMatrix;
UNI mat4 mvMatrix;
UNI mat4 modelMatrix;

UNI vec2 inXY;

void main() {
    texCoord=attrTexCoord;

    vec4 pos = vec4(vPosition,  1.0);

    {{MODULE_VERTEX_POSITION}}

    coord3 = attrTexCoord;


    coord0 = attrTexCoord + (-3.0368997744118595 * inXY);
    coord0 = clamp(coord0, 0., 1.);
    coord1 = attrTexCoord + (-2.089778445362373 * inXY);
    coord1 = clamp(coord1, 0., 1.);
    coord2 = attrTexCoord + (-1.2004366090034069 * inXY);
    coord2 = clamp(coord2, 0., 1.);
    coord4 = attrTexCoord + (1.2004366090034069 * inXY);
    coord4 = clamp(coord4, 0., 1.);
    coord5 = attrTexCoord + (2.089778445362373* inXY);
    coord5 = clamp(coord5, 0., 1.);
    coord6 = attrTexCoord + (3.0368997744118595 * inXY);
    coord6 = clamp(coord6, 0., 1.);

    gl_Position = projMatrix * mvMatrix * pos;
}
    `;
    }

    getBlurPassFragmentShader()
    {
        if (this.type === "point") return "";

        return `
UNI sampler2D tex;

IN vec2 coord0;
IN vec2 coord1;
IN vec2 coord2;
IN vec2 coord3;
IN vec2 coord4;
IN vec2 coord5;
IN vec2 coord6;

void main() {

    vec4 color = vec4(0.0);


    color.xyz += texture(tex, coord0).xyz * 0.06927096443792478;  // 1/64
    color.xyz += texture(tex, coord1).xyz * 0.1383328848652136;   // 6/64
    color.xyz += texture(tex, coord2).xyz * 0.21920904690397863;  // 15/64
    color.xyz += texture(tex, coord3).xyz * 0.14637421;           // 20/64
    color.xyz += texture(tex, coord4).xyz * 0.21920904690397863;  // 15/64
    color.xyz += texture(tex, coord5).xyz * 0.1383328848652136;   // 6/64
    color.xyz += texture(tex, coord6).xyz * 0.06927096443795711;  // 1/64

    color.a = 1.;

    outColor = color;
}
    `;
    }
}

;// CONCATENATED MODULE: ./src/corelibs/cgl/cgl_wireframecube.js


class WireframeCube
{
    constructor(_cgl)
    {
        this.cgl = _cgl;
        this.geom = new CGL.Geometry("marker");
        this.geom.setPointVertices(
            [
                // frontal
                -1, -1, 1,
                1, -1, 1,

                1, 1, 1,
                -1, 1, 1,

                -1, -1, -1,
                1, -1, -1,

                -1, 1, -1,
                1, 1, -1,

                // vertical lines
                1, -1, -1,
                1, 1, -1,

                -1, 1, -1,
                -1, -1, -1,

                1, 1, 1,
                1, -1, 1,

                -1, 1, 1,
                -1, -1, 1,

                // horizontal lines
                1, 1, -1,
                1, 1, 1,

                -1, 1, -1,
                -1, 1, 1,

                1, -1, 1,
                1, -1, -1,

                -1, -1, 1,
                -1, -1, -1,
            ]
        );

        this.mesh = new CGL.Mesh(this.cgl, this.geom, this.cgl.gl.LINES);
        this.mesh.setGeom(this.geom);

        this.colorShader = new CGL.UniColorShader(this.cgl);
        this.colorShader.setColor([0, 1, 1, 1]);

        this._vScale = vec3.create();
    }

    render(_scaleX, _scaleY, _scaleZ)
    {
        this.cgl.pushModelMatrix();
        this.cgl.pushShader(this.colorShader.shader);
        this.cgl.pushDepthTest(false);

        if (_scaleX == undefined) _scaleX = 1.0;
        if (_scaleY == undefined) _scaleY = _scaleX;
        if (_scaleZ == undefined) _scaleZ = _scaleX;


        // vec3.set(this._vScale, _scaleX || 1, _scaleY || _scaleX || 1, _scaleZ || _scaleX || 1);
        vec3.set(this._vScale, _scaleX, _scaleY, _scaleZ);
        mat4.scale(this.cgl.mvMatrix, this.cgl.mvMatrix, this._vScale);

        this.mesh.render(this.cgl.getShader());

        this.cgl.popDepthTest();
        this.cgl.popShader();
        this.cgl.popModelMatrix();
    }
}

;// CONCATENATED MODULE: ./src/corelibs/cgl/cgl_wireframerect.js





class WireframeRect
{

    /**
     * @param {CglContext} _cgl
     */
    constructor(_cgl)
    {
        this.cgl = _cgl;
        this.geom = new CGL.Geometry("marker");

        const fr = -1.0;
        const to = 1.0;

        this.geom.setPointVertices(
            [
                fr, fr, 0,
                to, fr, 0,

                to, fr, 0,
                to, to, 0,

                to, to, 0,
                fr, to, 0,

                fr, to, 0,
                fr, fr, 0,
            ]
        );

        this.mesh = new CGL.Mesh(this.cgl, this.geom, this.cgl.gl.LINES);
        this.mesh.setGeom(this.geom);

        this.colorShader = new CGL.UniColorShader(this.cgl);
        this.colorShader.setColor([0, 1, 1, 1]);

        this._vScale = vec3_create();
    }

    /**
     * @param {any} _scaleX
     * @param {any} _scaleY
     * @param {any} _scaleZ
     */
    render(_scaleX, _scaleY, _scaleZ)
    {
        this.cgl.pushModelMatrix();
        this.cgl.pushShader(this.colorShader.shader);
        this.cgl.pushDepthTest(false);

        vec3_set(this._vScale, _scaleX || 1, _scaleY || _scaleX || 1, _scaleZ || _scaleX || 1);
        mat4_scale(this.cgl.mvMatrix, this.cgl.mvMatrix, this._vScale);

        this.mesh.render(this.cgl.getShader());

        this.cgl.popDepthTest();
        this.cgl.popShader();
        this.cgl.popModelMatrix();
    }
}

;// CONCATENATED MODULE: ./src/corelibs/cgl/cgl_copytexture.js
class CopyTexture
{
    constructor(cgl, name, options)
    {
        this.cgl = cgl;

        this._options = options;
        this.fb = null;

        let shader = options.shader;

        this._useDefaultShader = true;
        if (options.shader) this._useDefaultShader = false;

        options.numRenderBuffers = options.numRenderBuffers || 1;

        if (!shader)
        {
            shader = ""
                .endl() + "IN vec2 texCoord;";

            for (let i = 0; i < options.numRenderBuffers; i++)
            {
                shader = shader.endl() + "UNI sampler2D tex" + i + ";".endl();
            }

            shader = shader
                .endl() + "void main()"
                .endl() + "{";

            if (options.numRenderBuffers == 1)
            {
                shader = shader.endl() + "    outColor= texture(tex0,texCoord);".endl();
            }

            else
                for (let i = 0; i < options.numRenderBuffers; i++)
                {
                    shader = shader.endl() + "outColor" + i + " = texture(tex" + i + ",texCoord);".endl();
                }

            shader = shader.endl() + "}";
        }

        const verts = options.vertexShader || ""
            .endl() + "IN vec3 vPosition;"
            .endl() + "IN vec2 attrTexCoord;"

            .endl() + "OUT vec2 texCoord;"

            .endl() + "void main()"
            .endl() + "{"
            .endl() + "   texCoord=attrTexCoord;"
            .endl() + "   gl_Position = vec4(vPosition,  1.0);"
            .endl() + "}";

        this.bgShader = new CGL.Shader(cgl, "corelib copytexture " + name);
        this.bgShader.setSource(verts, shader);

        if (!options.vertexShader)
            this.bgShader.ignoreMissingUniforms = true;

        new CGL.Uniform(this.bgShader, "t", "tex", 0);
        new CGL.Uniform(this.bgShader, "t", "tex1", 1);
        new CGL.Uniform(this.bgShader, "t", "tex2", 2);
        new CGL.Uniform(this.bgShader, "t", "tex3", 3);

        this.mesh = CGL.MESHES.getSimpleRect(this.cgl, "texEffectRect");
    }

    setSize(w, h)
    {
        this._options.width = w;
        this._options.height = h;
    }

    copy(tex, tex1, tex2, tex3, tex4)
    {
        const cgl = this.cgl;
        if (!tex) tex = CGL.Texture.getEmptyTexture(this.cgl);
        let
            w = this._options.width || tex.width,
            h = this._options.height || tex.height;

        if (this.fb)
        {
            if (w <= 0)w = 8;
            if (h <= 0)h = 8;
            if (this.fb.getWidth() != w || this.fb.getHeight() != h) this.fb.setSize(w, h);
        }
        else
        {
            let filter = CGL.Texture.FILTER_LINEAR;
            let wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

            if (this._options.isFloatingPointTexture)filter = CGL.Texture.FILTER_NEAREST;

            if (this._options.hasOwnProperty("filter"))filter = this._options.filter;
            if (this._options.hasOwnProperty("wrap"))wrap = this._options.wrap;

            const options =
                {
                    "isFloatingPointTexture": this._options.isFloatingPointTexture,
                    "pixelFormat": this._options.pixelFormat,
                    "numRenderBuffers": this._options.numRenderBuffers || 1,
                    "filter": filter,
                    "wrap": wrap,
                };

            if (cgl.glVersion == 1) this.fb = new CGL.Framebuffer(cgl, w, h, options);
            else this.fb = new CGL.Framebuffer2(cgl, w, h, options);
        }

        cgl.tempData.renderOffscreen = true;
        this.fb.renderStart(cgl);

        cgl.setTexture(0, tex.tex);
        if (tex1) cgl.setTexture(1, tex1.tex);
        if (tex2) cgl.setTexture(2, tex2.tex);
        if (tex3) cgl.setTexture(3, tex3.tex);
        if (tex4) cgl.setTexture(4, tex4.tex);

        cgl.pushShader(this.bgShader);
        this.mesh.render(this.bgShader);
        cgl.popShader();

        this.fb.renderEnd();
        cgl.tempData.renderOffscreen = false;

        return this.fb.getTextureColor();
    }

    dispose()
    {
        if (this.fb) this.fb.dispose();
        if (this.bgShader) this.bgShader.dispose();
        if (this.mesh) this.mesh.dispose();
    }
}

;// CONCATENATED MODULE: ./src/corelibs/cgl/cgl_pixelreader.js


class PixelReader
{
    constructor()
    {
        this._log = new external_CABLES_SHARED_namespaceObject.Logger("LoadingStatus");

        this.pixelData = null;
        this._finishedFence = true;
        this._size = 0;
        this._pbo = null;
    }

    _fence(cgl)
    {
        const gl = cgl.gl;
        this._finishedFence = false;
        return new Promise(function (resolve, reject)
        {
            if (cgl.aborted) return;
            let sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
            if (!sync) return;
            gl.flush(); // Ensure the fence is submitted.

            function check()
            {
                if (cgl.aborted) return;
                const status = gl.clientWaitSync(sync, 0, 0);

                if (status == gl.WAIT_FAILED)
                {
                    console.error("fence wait failed");
                    if (reject) reject();
                }
                else
                if (status == gl.TIMEOUT_EXPIRED)
                {
                    // this._log.log("TIMEOUT_EXPIRED");
                    return setTimeout(check, 0);
                }
                else
                if (status == gl.CONDITION_SATISFIED)
                {
                    // this._log.log("CONDITION_SATISFIED");
                    resolve();
                    gl.deleteSync(sync);
                }
                else if (status == gl.ALREADY_SIGNALED)
                {
                    // this._log.log("already signaled");
                    resolve();
                    gl.deleteSync(sync);
                }
                else
                {
                    this._log.log("unknown fence status", status);
                }
            }

            // setTimeout(check, 3);
            check();
        });
    }

    read(cgl, fb, pixelFormat, x, y, w, h, finishedcb)
    {
        if (CABLES.UI)
            if (!CABLES.UI.loaded || performance.now() - CABLES.UI.loadedTime < 1000) return;

        if (!this._finishedFence) return;

        const gl = cgl.gl;
        let bytesPerItem = 1;

        if (cgl.aborted) return;
        if (!fb) return;

        if (pixelFormat === CGL.Texture.TYPE_FLOAT) pixelFormat = CGL.Texture.PFORMATSTR_RGBA32F;
        // let isFloatingPoint = pixelFormat == CGL.Texture.TYPE_FLOAT; // old parameter was "textureType", now it is pixelformat, keeping this for compatibility...

        let isFloatingPoint = CGL.Texture.isPixelFormatFloat(pixelFormat);

        if (isFloatingPoint)bytesPerItem = 4;
        if (CGL.Texture.isPixelFormatHalfFloat(pixelFormat)) bytesPerItem = 2;

        const pixelInfo = CGL.Texture.setUpGlPixelFormat(cgl, pixelFormat);
        const numItems = pixelInfo.numColorChannels * w * h;

        if (w == 0 || h == 0 || numItems == 0) return;

        if (!this._pixelData || this._size != numItems * bytesPerItem)
        {
            if (bytesPerItem > 1) this._pixelData = new Float32Array(numItems);
            else this._pixelData = new Uint8Array(numItems);

            this._size = numItems * bytesPerItem;
        }

        let channelType = gl.UNSIGNED_BYTE;
        if (bytesPerItem > 1)channelType = gl.FLOAT;

        if (this._size == 0 || !this._pixelData)
        {
            this._log.error("readpixel size 0", this._size, w, h);
            return;
        }

        if (this._finishedFence)
        {
            this._pbo = gl.createBuffer();
            gl.bindBuffer(gl.PIXEL_PACK_BUFFER, this._pbo);
            gl.bufferData(gl.PIXEL_PACK_BUFFER, this._pixelData.byteLength, gl.DYNAMIC_READ);
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            gl.bindBuffer(gl.PIXEL_PACK_BUFFER, this._pbo);
            cgl.profileData.count("textureFencedPixelRead");

            if (this._size != numItems * bytesPerItem)
                this._log.error("buffer size invalid", numItems, w, h, bytesPerItem);

            let dataType = pixelInfo.glDataType;
            if (bytesPerItem > 1)dataType = cgl.gl.FLOAT;

            let format = pixelInfo.glDataFormat;
            gl.readPixels(x, y, w, h, format, dataType, 0);

            gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
        let startLength = this._pixelData.byteLength;

        if (this._finishedFence && this._pbo)
            this._fence(cgl).then((error) =>
            {
                this._wasTriggered = false;
                this._finishedFence = true;

                if (!error && this._pixelData && this._pixelData.byteLength == startLength)
                {
                    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, this._pbo);
                    gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, this._pixelData);
                    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);

                    if (finishedcb) finishedcb(this._pixelData);
                }
                gl.deleteBuffer(this._pbo);
                this._pbo = null;
            });

        return true;
    }
}

;// CONCATENATED MODULE: ./src/corelibs/cgl/index.js

























const cgl_CGL = {
    "BoundingBox": BoundingBox,
    "Context": CglContext,
    "CopyTexture": CopyTexture,
    "CubemapFramebuffer": CubemapFramebuffer,
    "CubemapTexture": CubemapTexture,
    "Framebuffer2": Framebuffer2,
    "Geometry": Geometry,
    "getWheelDelta": getWheelDelta,
    "getWheelSpeed": getWheelSpeed,
    "Light": Light,
    "Marker": Marker,
    "MatrixStack": MatrixStack,
    "Mesh": Mesh,
    "MESH": MESH,
    "MESHES": MESHES,
    "onLoadingAssetsFinished": onLoadingAssetsFinished,
    "ProfileData": ProfileData,
    "PixelReader": PixelReader,
    "RenderTargets": RenderTargets,
    "Shader": CglShader,
    "ShaderLibMods": ShaderLibMods,
    "ShaderModifier": ShaderModifier,
    "Texture": Texture,
    "TextureEffect": TextureEffect,
    "UniColorShader": UniColorShader,
    "Uniform": Uniform,
    "WireCube": WireCube,
    "WirePoint": WirePoint,
    "WireframeCube": WireframeCube,
    "WireframeRect": WireframeRect,
    ...CONSTANTS.BLEND_MODES,
    ...CONSTANTS.SHADER,
    ...CONSTANTS.MATH,
    ...CONSTANTS.BLEND_MODES,
};

window.CABLES = window.CABLES || {};
window.CABLES.CGL = { ...window.CABLES.CGL, ...cgl_CGL };
window.CGL = { ...window.CABLES.CGL, ...window.CGL, ...cgl_CGL };

/**
 * HACK: this needs to be wrapped into a function, exported and be
 * called when using this as a module, as otherwise as subsequent webpack
 * build (like cables_ui) might treeshake this whole file away
 *
 * if it's not treeshaken away, we call it immediately right after declaration
 * to register listeners (i.e. in export)
 */
const initCGL = () =>
{
    window.addEventListener(external_CABLES_namespaceObject.Patch.EVENT_INIT_CGL, (e) =>
    {
        const patch = e?.detail;
        if (!patch || patch.tempData.cglInitialized) return;
        patch.tempData.cglInitialized = true;
        const cgl = new CglContext(patch);
    });
};
initCGL();

/**
 * @param {number} time
 * @param {quat} q
 * @param {Anim} animx
 * @param {Anim} animy
 * @param {Anim} animz
 * @param {Anim} animw
 */
external_CABLES_namespaceObject.Anim.slerpQuaternion = function (time, q, animx, animy, animz, animw)
{
    if (!external_CABLES_namespaceObject.Anim.slerpQuaternion.q1)
    {
        external_CABLES_namespaceObject.Anim.slerpQuaternion.q1 = quat.create();
        external_CABLES_namespaceObject.Anim.slerpQuaternion.q2 = quat.create();
    }

    const i1 = animx.getKeyIndex(time);
    let i2 = i1 + 1;
    if (i2 >= animx.keys.length) i2 = animx.keys.length - 1;

    if (i1 == i2)
    {
        quat.set(q, animx.keys[i1].value, animy.keys[i1].value, animz.keys[i1].value, animw.keys[i1].value);
    }
    else
    {
        const key1Time = animx.keys[i1].time;
        const key2Time = animx.keys[i2].time;
        const perc = (time - key1Time) / (key2Time - key1Time);

        quat.set(external_CABLES_namespaceObject.Anim.slerpQuaternion.q1, animx.keys[i1].value, animy.keys[i1].value, animz.keys[i1].value, animw.keys[i1].value);

        quat.set(external_CABLES_namespaceObject.Anim.slerpQuaternion.q2, animx.keys[i2].value, animy.keys[i2].value, animz.keys[i2].value, animw.keys[i2].value);

        quat.slerp(q, external_CABLES_namespaceObject.Anim.slerpQuaternion.q1, external_CABLES_namespaceObject.Anim.slerpQuaternion.q2, perc);
    }
    return q;
};



})();

var __webpack_export_target__ = (CABLES = typeof CABLES === "undefined" ? {} : CABLES);
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;