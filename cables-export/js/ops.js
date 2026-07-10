"use strict";

var CABLES=CABLES||{};
CABLES.OPS=CABLES.OPS||{};

var Ops=Ops || {};
Ops.Gl=Ops.Gl || {};
Ops.Ui=Ops.Ui || {};
Ops.Anim=Ops.Anim || {};
Ops.Html=Ops.Html || {};
Ops.Json=Ops.Json || {};
Ops.Math=Ops.Math || {};
Ops.Team=Ops.Team || {};
Ops.User=Ops.User || {};
Ops.Array=Ops.Array || {};
Ops.Patch=Ops.Patch || {};
Ops.Cables=Ops.Cables || {};
Ops.Gl.Pbr=Ops.Gl.Pbr || {};
Ops.Number=Ops.Number || {};
Ops.String=Ops.String || {};
Ops.Boolean=Ops.Boolean || {};
Ops.Devices=Ops.Devices || {};
Ops.Sidebar=Ops.Sidebar || {};
Ops.Trigger=Ops.Trigger || {};
Ops.Graphics=Ops.Graphics || {};
Ops.Extension=Ops.Extension || {};
Ops.Gl.Matrix=Ops.Gl.Matrix || {};
Ops.Gl.Meshes=Ops.Gl.Meshes || {};
Ops.Gl.Shader=Ops.Gl.Shader || {};
Ops.Html.Utils=Ops.Html.Utils || {};
Ops.Gl.Textures=Ops.Gl.Textures || {};
Ops.Math.Compare=Ops.Math.Compare || {};
Ops.Devices.Mouse=Ops.Devices.Mouse || {};
Ops.Patch.PjocSFN=Ops.Patch.PjocSFN || {};
Ops.Team.Particles=Ops.Team.Particles || {};
Ops.Gl.ImageCompose=Ops.Gl.ImageCompose || {};
Ops.Graphics.Meshes=Ops.Graphics.Meshes || {};
Ops.Devices.Keyboard=Ops.Devices.Keyboard || {};
Ops.Gl.ShaderEffects=Ops.Gl.ShaderEffects || {};
Ops.Graphics.Geometry=Ops.Graphics.Geometry || {};
Ops.Team.Particles.Dev=Ops.Team.Particles.Dev || {};
Ops.Gl.ImageCompose.Math=Ops.Gl.ImageCompose.Math || {};
Ops.Extension.GlParticles=Ops.Extension.GlParticles || {};
Ops.Gl.ImageCompose.Noise=Ops.Gl.ImageCompose.Noise || {};
Ops.Graphics.Intersection=Ops.Graphics.Intersection || {};
Ops.Extension.GlParticles.Dev=Ops.Extension.GlParticles.Dev || {};
Ops.User.amajesticseaflapflap=Ops.User.amajesticseaflapflap || {};



// **************************************************************
// 
// Ops.Gl.MainLoop
// 
// **************************************************************

Ops.Gl.MainLoop= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    fpsLimit = op.inValue("FPS Limit", 0),
    trigger = op.outTrigger("trigger"),
    width = op.outNumber("width"),
    height = op.outNumber("height"),
    reduceFocusFPS = op.inValueBool("Reduce FPS not focussed", false),
    reduceLoadingFPS = op.inValueBool("Reduce FPS loading"),
    clear = op.inValueBool("Clear", true),
    clearAlpha = op.inValueBool("ClearAlpha", true),
    fullscreen = op.inValueBool("Fullscreen Button", false),
    active = op.inValueBool("Active", true),
    hdpi = op.inValueBool("Hires Displays", false),
    inUnit = op.inSwitch("Pixel Unit", ["Display", "CSS"], "Display");

op.onAnimFrame = render;
hdpi.onChange = function ()
{
    if (hdpi.get()) op.patch.cgl.pixelDensity = window.devicePixelRatio;
    else op.patch.cgl.pixelDensity = 1;

    op.patch.cgl.updateSize();
    if (CABLES.UI) gui.setLayout();
};

active.onChange = function ()
{
    op.patch.removeOnAnimFrame(op);

    if (active.get())
    {
        op.setUiAttrib({ "extendTitle": "" });
        op.onAnimFrame = render;
        op.patch.addOnAnimFrame(op);
        op.log("adding again!");
    }
    else
    {
        op.setUiAttrib({ "extendTitle": "Inactive" });
    }
};

const cgl = op.patch.cgl;
if (CABLES.UI)gui.canvasManager.addCgContext(op.patch.cgl);
if (CABLES.UI)gui.setLayout();

let rframes = 0;
let rframeStart = 0;
let timeOutTest = null;
let addedListener = false;

if (!op.patch.cgl) op.uiAttr({ "error": "No webgl cgl context" });

const identTranslate = vec3.create();
vec3.set(identTranslate, 0, 0, 0);
const identTranslateView = vec3.create();
vec3.set(identTranslateView, 0, 0, -2);

fullscreen.onChange = updateFullscreenButton;
setTimeout(updateFullscreenButton, 100);
let fsElement = null;

let winhasFocus = true;
let winVisible = true;

window.addEventListener("blur", () => { winhasFocus = false; });
window.addEventListener("focus", () => { winhasFocus = true; });
document.addEventListener("visibilitychange", () => { winVisible = !document.hidden; });
testMultiMainloop();

op.patch.tempData.mainloopOp = this;

inUnit.onChange = () =>
{
    width.set(0);
    height.set(0);
};

function getFpsLimit()
{
    if (reduceLoadingFPS.get() && op.patch.loading.getProgress() < 1.0) return 5;

    if (reduceFocusFPS.get())
    {
        if (!winVisible) return 10;
        if (!winhasFocus) return 30;
    }

    return fpsLimit.get();
}

function updateFullscreenButton()
{
    function onMouseEnter()
    {
        if (fsElement)fsElement.style.display = "block";
    }

    function onMouseLeave()
    {
        if (fsElement)fsElement.style.display = "none";
    }

    op.patch.cgl.canvas.addEventListener("mouseleave", onMouseLeave);
    op.patch.cgl.canvas.addEventListener("mouseenter", onMouseEnter);

    if (fullscreen.get())
    {
        if (!fsElement)
        {
            fsElement = document.createElement("div");

            const container = op.patch.cgl.canvas.parentElement;
            if (container)container.appendChild(fsElement);

            fsElement.addEventListener("mouseenter", onMouseEnter);
            fsElement.addEventListener("click", function (e)
            {
                if (CABLES.UI && !e.shiftKey) gui.toggleMaximized();
                else cgl.fullScreen();
            });
        }

        fsElement.style.padding = "10px";
        fsElement.style.position = "absolute";
        fsElement.style.right = "5px";
        fsElement.style.top = "5px";
        fsElement.style.width = "20px";
        fsElement.style.height = "20px";
        fsElement.style.cursor = "pointer";
        fsElement.style["border-radius"] = "40px";
        fsElement.style.background = "#444";
        fsElement.style["z-index"] = "9999";
        fsElement.style.display = "none";
        fsElement.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1.1\" id=\"Capa_1\" x=\"0px\" y=\"0px\" viewBox=\"0 0 490 490\" style=\"width:20px;height:20px;\" xml:space=\"preserve\" width=\"512px\" height=\"512px\"><g><path d=\"M173.792,301.792L21.333,454.251v-80.917c0-5.891-4.776-10.667-10.667-10.667C4.776,362.667,0,367.442,0,373.333V480     c0,5.891,4.776,10.667,10.667,10.667h106.667c5.891,0,10.667-4.776,10.667-10.667s-4.776-10.667-10.667-10.667H36.416     l152.459-152.459c4.093-4.237,3.975-10.99-0.262-15.083C184.479,297.799,177.926,297.799,173.792,301.792z\" fill=\"#FFFFFF\"/><path d=\"M480,0H373.333c-5.891,0-10.667,4.776-10.667,10.667c0,5.891,4.776,10.667,10.667,10.667h80.917L301.792,173.792     c-4.237,4.093-4.354,10.845-0.262,15.083c4.093,4.237,10.845,4.354,15.083,0.262c0.089-0.086,0.176-0.173,0.262-0.262     L469.333,36.416v80.917c0,5.891,4.776,10.667,10.667,10.667s10.667-4.776,10.667-10.667V10.667C490.667,4.776,485.891,0,480,0z\" fill=\"#FFFFFF\"/><path d=\"M36.416,21.333h80.917c5.891,0,10.667-4.776,10.667-10.667C128,4.776,123.224,0,117.333,0H10.667     C4.776,0,0,4.776,0,10.667v106.667C0,123.224,4.776,128,10.667,128c5.891,0,10.667-4.776,10.667-10.667V36.416l152.459,152.459     c4.237,4.093,10.99,3.975,15.083-0.262c3.992-4.134,3.992-10.687,0-14.82L36.416,21.333z\" fill=\"#FFFFFF\"/><path d=\"M480,362.667c-5.891,0-10.667,4.776-10.667,10.667v80.917L316.875,301.792c-4.237-4.093-10.99-3.976-15.083,0.261     c-3.993,4.134-3.993,10.688,0,14.821l152.459,152.459h-80.917c-5.891,0-10.667,4.776-10.667,10.667s4.776,10.667,10.667,10.667     H480c5.891,0,10.667-4.776,10.667-10.667V373.333C490.667,367.442,485.891,362.667,480,362.667z\" fill=\"#FFFFFF\"/></g></svg>";
    }
    else
    {
        if (fsElement)
        {
            fsElement.style.display = "none";
            fsElement.remove();
            fsElement = null;
        }
    }
}

op.onDelete = function ()
{
    cgl.gl.clearColor(0, 0, 0, 0);
    cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);
};

function render(time)
{
    if (!active.get()) return;
    if (cgl.aborted || cgl.canvas.clientWidth === 0 || cgl.canvas.clientHeight === 0) return;

    op.patch.cg = cgl;

    if (hdpi.get())op.patch.cgl.pixelDensity = window.devicePixelRatio;

    const startTime = performance.now();

    op.patch.config.fpsLimit = getFpsLimit();

    if (cgl.canvasWidth == -1)
    {
        cgl.setCanvas(op.patch.config.glCanvasId);
        return;
    }

    if (cgl.canvasWidth != width.get() || cgl.canvasHeight != height.get())
    {
        let div = 1;
        if (inUnit.get() == "CSS")div = op.patch.cgl.pixelDensity;

        width.set(cgl.canvasWidth / div);
        height.set(cgl.canvasHeight / div);
    }

    if (CABLES.now() - rframeStart > 1000)
    {
        CGL.fpsReport = CGL.fpsReport || [];
        if (op.patch.loading.getProgress() >= 1.0 && rframeStart !== 0)CGL.fpsReport.push(rframes);
        rframes = 0;
        rframeStart = CABLES.now();
    }
    cgl.lastShader = null;
    cgl.lastMesh = null;

    cgl.renderStart(cgl, identTranslate, identTranslateView);

    if (clear.get())
    {
        cgl.gl.clearColor(0, 0, 0, 1);
        cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);
    }

    trigger.trigger();

    if (cgl.lastMesh)cgl.lastMesh.unBind();

    if (CGL.Texture.previewTexture)
    {
        if (!CGL.Texture.texturePreviewer) CGL.Texture.texturePreviewer = new CGL.Texture.texturePreview(cgl);
        CGL.Texture.texturePreviewer.render(CGL.Texture.previewTexture);
    }
    cgl.renderEnd(cgl);

    op.patch.cg = null;

    if (clearAlpha.get())
    {
        cgl.gl.clearColor(1, 1, 1, 1);
        cgl.gl.colorMask(false, false, false, true);
        cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT);
        cgl.gl.colorMask(true, true, true, true);
    }

    if (!cgl.tempData.phong)cgl.tempData.phong = {};
    rframes++;

    op.patch.cgl.profileData.profileMainloopMs = performance.now() - startTime;
}

function testMultiMainloop()
{
    clearTimeout(timeOutTest);
    timeOutTest = setTimeout(
        () =>
        {
            if (op.patch.getOpsByObjName(op.name).length > 1)
            {
                op.setUiError("multimainloop", "there should only be one mainloop op!");
                if (!addedListener)addedListener = op.patch.addEventListener("onOpDelete", testMultiMainloop);
            }
            else op.setUiError("multimainloop", null, 1);
        }, 500);
}

}
};






// **************************************************************
// 
// Ops.Graphics.OrbitControls
// 
// **************************************************************

Ops.Graphics.OrbitControls= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    render = op.inTrigger("render"),
    minDist = op.inValueFloat("min distance"),
    maxDist = op.inValueFloat("max distance"),

    minRotY = op.inValue("min rot y", 0),
    maxRotY = op.inValue("max rot y", 0),

    initialRadius = op.inValue("initial radius", 0),
    initialAxis = op.inValueSlider("initial axis y"),
    initialX = op.inValueSlider("initial axis x"),

    mul = op.inValueFloat("mul"),
    smoothness = op.inValueSlider("Smoothness", 1.0),
    speedX = op.inValue("Speed X", 1),
    speedY = op.inValue("Speed Y", 1),

    active = op.inValueBool("Active", true),

    allowPanning = op.inValueBool("Allow Panning", true),
    allowZooming = op.inValueBool("Allow Zooming", true),
    allowRotation = op.inValueBool("Allow Rotation", true),
    restricted = op.inValueBool("restricted", true),

    trigger = op.outTrigger("trigger"),
    outRadius = op.outNumber("radius"),
    outXDeg = op.outNumber("Rot X"),
    outYDeg = op.outNumber("Rot Y"),

    inReset = op.inTriggerButton("Reset");

op.setPortGroup("Initial Values", [initialAxis, initialX, initialRadius]);
op.setPortGroup("Interaction", [mul, smoothness, speedX, speedY]);
op.setPortGroup("Boundaries", [minRotY, maxRotY, minDist, maxDist]);

mul.set(1);
minDist.set(0.01);
maxDist.set(99999);

inReset.onTriggered = reset;

let eye = vec3.create();
const vUp = vec3.create();
const vCenter = vec3.create();
const viewMatrix = mat4.create();
const tempViewMatrix = mat4.create();
const vOffset = vec3.create();
const finalEyeAbs = vec3.create();

initialAxis.set(0.5);

let mouseDown = false;
let radius = 5;
outRadius.set(radius);

let lastMouseX = 0, lastMouseY = 0;
let percX = 0, percY = 0;

vec3.set(vCenter, 0, 0, 0);
vec3.set(vUp, 0, 1, 0);

const tempEye = vec3.create();
const finalEye = vec3.create();
const tempCenter = vec3.create();
const finalCenter = vec3.create();

let px = 0;
let py = 0;

let divisor = 1;
let element = null;
updateSmoothness();

op.onDelete = unbind;

const halfCircle = Math.PI;
const fullCircle = Math.PI * 2;

function reset()
{
    let off = 0;

    if (px % fullCircle < -halfCircle)
    {
        off = -fullCircle;
        px %= -fullCircle;
    }
    else
    if (px % fullCircle > halfCircle)
    {
        off = fullCircle;
        px %= fullCircle;
    }
    else px %= fullCircle;

    py %= (Math.PI);

    vec3.set(vOffset, 0, 0, 0);
    vec3.set(vCenter, 0, 0, 0);
    vec3.set(vUp, 0, 1, 0);

    percX = (initialX.get() * Math.PI * 2 + off);
    percY = (initialAxis.get() - 0.5);

    radius = initialRadius.get();
    eye = circlePos(percY);
}

function updateSmoothness()
{
    divisor = smoothness.get() * 10 + 1.0;
}

smoothness.onChange = updateSmoothness;

let initializing = true;

function ip(val, goal)
{
    if (initializing) return goal;
    return val + (goal - val) / divisor;
}

let lastPy = 0;
const lastPx = 0;

render.onTriggered = function ()
{
    const cgl = op.patch.cg;
    if (!cgl) return;

    if (!element)
    {
        setElement(cgl.canvas);
        bind();
    }

    cgl.pushViewMatrix();

    px = ip(px, percX);
    py = ip(py, percY);

    let degY = (py + 0.5) * 180;

    if (minRotY.get() !== 0 && degY < minRotY.get())
    {
        degY = minRotY.get();
        py = lastPy;
    }
    else if (maxRotY.get() !== 0 && degY > maxRotY.get())
    {
        degY = maxRotY.get();
        py = lastPy;
    }
    else
    {
        lastPy = py;
    }

    const degX = (px) * CGL.RAD2DEG;

    outYDeg.set(degY);
    outXDeg.set(degX);

    circlePosi(eye, py);

    vec3.add(tempEye, eye, vOffset);
    vec3.add(tempCenter, vCenter, vOffset);

    finalEye[0] = ip(finalEye[0], tempEye[0]);
    finalEye[1] = ip(finalEye[1], tempEye[1]);
    finalEye[2] = ip(finalEye[2], tempEye[2]);

    finalCenter[0] = ip(finalCenter[0], tempCenter[0]);
    finalCenter[1] = ip(finalCenter[1], tempCenter[1]);
    finalCenter[2] = ip(finalCenter[2], tempCenter[2]);

    const empty = vec3.create();

    mat4.lookAt(viewMatrix, finalEye, finalCenter, vUp);
    mat4.rotate(viewMatrix, viewMatrix, px, vUp);

    // finaly multiply current scene viewmatrix
    mat4.multiply(cgl.vMatrix, cgl.vMatrix, viewMatrix);

    trigger.trigger();
    cgl.popViewMatrix();
    initializing = false;
};

function circlePosi(vec, perc)
{
    const mmul = mul.get();
    if (radius < minDist.get() * mmul) radius = minDist.get() * mmul;
    if (radius > maxDist.get() * mmul) radius = maxDist.get() * mmul;

    outRadius.set(radius * mmul);

    let i = 0, degInRad = 0;

    degInRad = 360 * perc / 2 * CGL.DEG2RAD;
    vec3.set(vec,
        Math.cos(degInRad) * radius * mmul,
        Math.sin(degInRad) * radius * mmul,
        0);
    return vec;
}

function circlePos(perc)
{
    const mmul = mul.get();
    if (radius < minDist.get() * mmul)radius = minDist.get() * mmul;
    if (radius > maxDist.get() * mmul)radius = maxDist.get() * mmul;

    outRadius.set(radius * mmul);

    let i = 0, degInRad = 0;
    const vec = vec3.create();
    degInRad = 360 * perc / 2 * CGL.DEG2RAD;
    vec3.set(vec,
        Math.cos(degInRad) * radius * mmul,
        Math.sin(degInRad) * radius * mmul,
        0);
    return vec;
}

function onmousemove(event)
{
    if (!mouseDown) return;

    const x = event.clientX;
    const y = event.clientY;

    let movementX = (x - lastMouseX);
    let movementY = (y - lastMouseY);

    movementX *= speedX.get();
    movementY *= speedY.get();

    if (event.buttons == 2 && allowPanning.get())
    {
        vOffset[2] += movementX * 0.01 * mul.get();
        vOffset[1] += movementY * 0.01 * mul.get();
    }
    else
    if (event.buttons == 4 && allowZooming.get())
    {
        radius += movementY * 0.05;
        eye = circlePos(percY);
    }
    else
    {
        if (allowRotation.get())
        {
            percX += movementX * 0.003;
            percY += movementY * 0.002;

            if (restricted.get())
            {
                if (percY > 0.5)percY = 0.5;
                if (percY < -0.5)percY = -0.5;
            }
        }
    }

    lastMouseX = x;
    lastMouseY = y;
}

function onMouseDown(event)
{
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    mouseDown = true;

    try { element.setPointerCapture(event.pointerId); }
    catch (e) {}
}

function onMouseUp(e)
{
    mouseDown = false;
    // cgl.canvas.style.cursor='url(/ui/img/rotate.png),pointer';

    try { element.releasePointerCapture(e.pointerId); }
    catch (e) {}
}

function lockChange()
{
    const el = op.patch.cg.canvas;

    if (document.pointerLockElement === el || document.mozPointerLockElement === el || document.webkitPointerLockElement === el)
    {
        document.addEventListener("mousemove", onmousemove, false);
    }
}

function onMouseEnter(e)
{
    // cgl.canvas.style.cursor='url(/ui/img/rotate.png),pointer';
}

initialRadius.onChange = function ()
{
    radius = initialRadius.get();
    reset();
};

initialX.onChange = function ()
{
    px = percX = (initialX.get() * Math.PI * 2);
};

initialAxis.onChange = function ()
{
    py = percY = (initialAxis.get() - 0.5);
    eye = circlePos(percY);
};

const onMouseWheel = function (event)
{
    if (allowZooming.get())
    {
        const delta = CGL.getWheelSpeed(event) * 0.06;
        radius += (parseFloat(delta)) * 1.2;

        eye = circlePos(percY);
    }
};

const ontouchstart = function (event)
{
    if (event.touches && event.touches.length > 0) onMouseDown(event.touches[0]);
};

const ontouchend = function (event)
{
    onMouseUp();
};

const ontouchmove = function (event)
{
    if (event.touches && event.touches.length > 0) onmousemove(event.touches[0]);
};

active.onChange = function ()
{
    if (active.get())bind();
    else unbind();
};

function setElement(ele)
{
    unbind();
    element = ele;
    bind();
}

function bind()
{
    if (!element) return;

    element.addEventListener("pointermove", onmousemove);
    element.addEventListener("pointerdown", onMouseDown);
    element.addEventListener("pointerup", onMouseUp);
    element.addEventListener("pointerleave", onMouseUp);
    element.addEventListener("pointerenter", onMouseEnter);
    element.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    element.addEventListener("wheel", onMouseWheel, { "passive": true });
}

function unbind()
{
    if (!element) return;

    element.removeEventListener("pointermove", onmousemove);
    element.removeEventListener("pointerdown", onMouseDown);
    element.removeEventListener("pointerup", onMouseUp);
    element.removeEventListener("pointerleave", onMouseUp);
    element.removeEventListener("pointerenter", onMouseUp);
    element.removeEventListener("wheel", onMouseWheel);
}

eye = circlePos(0);

initialX.set(0.25);
initialRadius.set(0.05);

}
};






// **************************************************************
// 
// Ops.Gl.Meshes.MeshInstancerFromTexture_v3
// 
// **************************************************************

Ops.Gl.Meshes.MeshInstancerFromTexture_v3= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"billboard_vert":"\n#ifdef BILLBOARDING\n\n    modelViewMatrix[0][0] = 1.0;\n    modelViewMatrix[0][1] = 0.0;\n    modelViewMatrix[0][2] = 0.0;\n\n    #ifndef BILLBOARDING_CYLINDRIC\n        modelViewMatrix[1][0] = 0.0;\n        modelViewMatrix[1][1] = 1.0;\n        modelViewMatrix[1][2] = 0.0;\n    #endif\n\n    modelViewMatrix[2][0] = 0.0;\n    modelViewMatrix[2][1] = 0.0;\n    modelViewMatrix[2][2] = 1.0;\n\n#endif\n","instancer_body_frag":"#ifdef USE_TEX_COLOR\n    #ifdef BLEND_MODE_MULTIPLY\n        col.rgb *= frag_instColor.rgb;\n        col.a *= frag_instColor.a;\n    #endif\n\n    #ifdef BLEND_MODE_ADD\n        col.rgb += frag_instColor.rgb;\n        col.a += frag_instColor.a;\n    #endif\n\n    #ifdef BLEND_MODE_NONE\n        col.rgb = frag_instColor.rgb;\n        col.a = frag_instColor.a;\n    #endif\n#endif\n","instancer_body_vert":"float tx=mod(instanceIndex,(MOD_texSizeX))/MOD_texSizeX+(1.0/MOD_texSizeX*0.5);\nfloat ty=float(int((instanceIndex/(MOD_texSizeX))))/MOD_texSizeY+(1.0/MOD_texSizeY*0.5);\n\nvec2 tc=vec2(tx,ty);\n\nvec4 posCol=texture(MOD_texTrans,tc);\nvec3 MOD_texPos=posCol.rgb*MOD_mulRGB;\nmat4 texInstMat;\nvec3 scale=vec3(1.0);\n\n#ifdef USE_TEX_SCALE\n    scale*=texture(MOD_texScale,tc).rgb;\n#endif\n\n\n\ntexInstMat[0][0]=\ntexInstMat[1][1]=\ntexInstMat[2][2]=\ntexInstMat[3][3]=1.0;\n\n#ifdef USE_TEX_ROT\n    vec4 MOD_texRota=texture(MOD_texRot,tc);\n\n    #ifdef ROT_EULER\n        texInstMat*=rotationMatrix(vec3(1.0,0.0,0.0),MOD_texRota.r*PI*2.0);\n        texInstMat*=rotationMatrix(vec3(0.0,1.0,0.0),MOD_texRota.g*PI*2.0);\n        texInstMat*=rotationMatrix(vec3(0.0,0.0,1.0),MOD_texRota.b*PI*2.0);\n    #endif\n    #ifdef ROT_NORMAL\n        texInstMat*=rotateMatrixDir(MOD_texRota.rgb);\n    #endif\n    #ifdef ROT_QUAT\n\n        // MOD_texRota=normalize(MOD_texRota);\n\n\n        texInstMat*=quat_to_mat4(quat(MOD_texRota.w,MOD_texRota.xyz));\n    #endif\n\n#endif\n\ntexInstMat[3][0]=MOD_texPos.x;\ntexInstMat[3][1]=MOD_texPos.y;\ntexInstMat[3][2]=MOD_texPos.z;\n\n\nif(posCol.a<MOD_alphaThresh)\n{\ntexInstMat[3][0]=\ntexInstMat[3][1]=\ntexInstMat[3][2]=999999.0;\n    // scale=vec3(0.0); // use step ?\n}\n\n\nmat4 scalem;\nscalem[0][0]=MOD_scale*scale.x;\nscalem[1][1]=MOD_scale*scale.y;\nscalem[2][2]=MOD_scale*scale.z;\nscalem[3][3]=1.0;\ntexInstMat*=scalem;\n\nmMatrix*=texInstMat;\n#define TEXINSTMAT\n\n#ifdef USE_TEX_COLOR\n\n    vec4 instColor=texture(MOD_texColor,tc);\n    frag_instColor=abs(instColor);\n#endif\n\n#ifdef USE_TEX_TC\n    vec4 instTexCoords=texture(MOD_texCoords,tc);\n\n    texCoord=(texCoord*instTexCoords.zw)+instTexCoords.xy;\n#endif\n\nfrag_instIndex=instanceIndex;\n","instancer_head_frag":"IN vec4 frag_instColor;\nIN float frag_instIndex;\n\n#define INSTANCING\n","instancer_head_vert":"IN mat4 instMat;\nIN vec4 instColor;\nIN float instanceIndex;\nOUT mat4 instModelMat;\nOUT vec4 frag_instColor;\nOUT float frag_instIndex;\n\n#define PI 3.14159265358\n#define INSTANCING\n\nmat3 ntorot(vec3 r)\n{\n    float cx = cos(radians(r.x));\n    float sx = sin(radians(r.x));\n    float cy = cos(radians(r.y));\n    float sy = sin(radians(r.y));\n    float cz = cos(radians(r.z));\n    float sz = sin(radians(r.z));\n\n    return mat3(cy * cz, \tcx * sz + sx * sy * cz, \tsx * sz - cx * sy * cz,\n    \t\t\t-cy * sz,\tcx * cz - sx * sy * sz,\t\tsx * cz + cx * sy * sz,\n    \t\t\tsy,\t\t\t-sx * cy,\t\t\t\t\tcx * cy);\n}\n\nmat4 rotationMatrix(vec3 axis, float angle)\n{\n    axis = normalize(axis);\n    float s = sin(angle);\n    float c = cos(angle);\n    float oc = 1.0 - c;\n\n    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,\n                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,\n                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,\n                0.0,                                0.0,                                0.0,                                1.0);\n}\n\nmat4 rotateMatrixDir(vec3 direction) {\n        vec4 addition = vec4(0,0,0,1);\n        mat4 transform= mat4(vec4(1.0, 0., 0.,0.),vec4( 0., 1.0,0.,0.),vec4( 0.,0.,1.0,0.), addition);\n\n        //zero case\n        if (direction.x == 0. && direction.z == 0. && direction.y>=0.) return transform;\n        if (direction.x == 0. && direction.z == 0. && direction.y<0.) return mat4(vec4(-1.0, 0.,  0.,0.),vec4( 0., -1.0, 0.,0.),vec4( 0.,  0., -1.0,0.), addition);\n\n        direction = normalize(direction);\n\n        vec3 new_z = normalize(direction);\n        vec3 new_y = normalize(cross(new_z, vec3(0.0, -1.0, 0.0)));\n        vec3 new_x = normalize(cross(new_z, new_y));\n\n        return mat4(vec4(new_y,0.), vec4(new_z,0.), vec4(new_x,0.),addition);\n}\n\nstruct quat\n{\n    float s;\n    vec3 v;\n};\nquat conjugate(quat q)\n{\n    return quat(q.s,-q.v);\n}\n\n\nquat div(quat q, float s)\n{\n    return quat(q.s / s, q.v / s);\n}\n\nfloat norm_squared(quat q)\n{\n    return q.s * q.s + dot(q.v, q.v);\n}\n\nquat invert(quat q) // NOTE: can't reuse function name inverse here\n{\n    return div(conjugate(q), norm_squared(q));\n}\n\n\nquat mul(quat a, quat b)\n{\n    return quat(a.s * b.s - dot(a.v, b.v), a.s * b.v + b.s * a.v + cross(a.v, b.v));\n}\n\nquat mul(float s, quat q)\n{\n    return quat(s * q.s, s * q.v);\n}\n\nvec3 rotate(quat q, vec3 p)\n{\n    return mul(mul(q, quat(0.0, p)), invert(q)).v;\n}\n\nmat4 quat_to_mat4(quat q)\n{\n    return\n        mat4\n        (\n            vec4(rotate(q, vec3(1,0,0)), 0.0),\n            vec4(rotate(q, vec3(0,1,0)), 0.0),\n            vec4(rotate(q, vec3(0,0,1)), 0.0),\n            vec4(0.0,    0.0,    0.0,    1.0)\n        );\n}\n\n\n// vec4 MOD_rot(vec4 pos, vec3 rot, mat4 modelMatrix)\n// {\n//     // pos=pos*rotationX(rot.x)*rotationY(rot.y)*rotationZ(rot.z);\n//     pos.xyz*=ntorot( (rot-0.5) * 3.14*2.0 );\n\n//     return pos;\n// }\n",};
const
    exe = op.inTrigger("exe"),
    geom = op.inObject("Geometry", null, "geometry"),
    inScale = op.inValue("Scale", 1),
    inLimit = op.inBool("Limit Instances", false),
    inNum = op.inInt("Num Instances", 1000),
    inBillboarding = op.inSwitch("Billboarding", ["Off", "Spherical", "Cylindrical"], "Off"),

    inTex1 = op.inTexture("Position Texture", null, "texture"),
    inTex2 = op.inTexture("Rotation Texture", null, "texture"),
    inRotMode = op.inSwitch("Rotation", ["Euler", "Normal", "Quaternion"], "Euler"),
    inTex3 = op.inTexture("Scale Texture", null, "texture"),
    inTex4 = op.inTexture("Color Texture", null, "texture"),
    inTex5 = op.inTexture("TexCoord Texture", null, "texture"),
    inBlendMode = op.inSwitch("Color Texture Blendmode", ["Multiply", "Add", "Normal"], "Multiply"),
    inAlphaThresh = op.inFloatSlider("Ignore Alpha Less Than", 0.5),
    inMulR = op.inValue("Multiply Pos X", 1),
    inMulG = op.inValue("Multiply Pos Y", 1),
    inMulB = op.inValue("Multiply Pos Z", 1),
    outTrigger = op.outTrigger("Trigger Out"),
    outNum = op.outNumber("Num");

op.toWorkPortsNeedToBeLinked(geom);
op.toWorkPortsNeedToBeLinked(exe);
op.toWorkPortsNeedToBeLinked(inTex1);

geom.ignoreValueSerialize = true;

const cgl = op.patch.cgl;
const m = mat4.create();
let
    mesh = null,
    recalc = true,
    num = 0,
    arrayChangedTrans = true;

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "name": "MODULE_VERTEX_POSITION",
    "title": op.name,
    "priority": -2,
    "srcHeadVert": attachments.instancer_head_vert,
    "srcBodyVert": attachments.instancer_body_vert
});

mod.addModule({
    "name": "MODULE_VERTEX_MODELVIEW",
    "title": op.name + "_billboard",
    "srcBodyVert": attachments.billboard_vert
});

mod.addModule({
    "name": "MODULE_COLOR",
    "priority": -2,
    "title": op.name,
    "srcHeadFrag": attachments.instancer_head_frag,
    "srcBodyFrag": attachments.instancer_body_frag,
});

mod.addUniformVert("f", "MOD_scale", inScale);
mod.addUniformVert("t", "MOD_texTrans");
mod.addUniformVert("t", "MOD_texRot");
mod.addUniformVert("t", "MOD_texScale");
mod.addUniformVert("t", "MOD_texCoords");
const modCol = mod.addUniformVert("t", "MOD_texColor");
mod.addUniformVert("f", "MOD_texSizeX", 0);
mod.addUniformVert("f", "MOD_texSizeY", 0);
mod.addUniformVert("f", "MOD_alphaThresh", inAlphaThresh);
mod.addUniformVert("3f", "MOD_mulRGB", inMulR, inMulG, inMulB);

inBillboarding.onChange =
    inBlendMode.onChange =
    inRotMode.onChange =
    inTex1.onChange =
    inTex3.onChange =
    inTex4.onChange =
    inTex5.onChange =
    inTex2.onChange = updateDefines;

updateUi();
exe.onTriggered = doRender;

inLimit.onChange =
inNum.onChange =
    function ()
    {
        updateDefines();
        updateUi();
        reset();
    };

function reset()
{
    arrayChangedTrans = true;
    recalc = true;
}

function updateUi()
{
    inNum.setUiAttribs({ "greyout": !inLimit.get() });
}

function updateDefines()
{
    mod.toggleDefine("BILLBOARDING", inBillboarding.get() != "Off");
    mod.toggleDefine("BILLBOARDING_CYLINDRIC", inBillboarding.get() == "Cylindrical");

    mod.toggleDefine("ROT_EULER", inRotMode.get() === "Euler");
    mod.toggleDefine("ROT_NORMAL", inRotMode.get() === "Normal");
    mod.toggleDefine("ROT_QUAT", inRotMode.get() === "Quaternion");

    mod.toggleDefine("BLEND_MODE_MULTIPLY", inBlendMode.get() === "Multiply");
    mod.toggleDefine("BLEND_MODE_ADD", inBlendMode.get() === "Add");
    mod.toggleDefine("BLEND_MODE_NONE", inBlendMode.get() === "Normal");

    mod.toggleDefine("USE_TEX_ROT", inTex2.isLinked());
    mod.toggleDefine("USE_TEX_SCALE", inTex3.isLinked());
    mod.toggleDefine("USE_TEX_COLOR", inTex4.isLinked());
    mod.toggleDefine("USE_TEX_TC", inTex5.isLinked());
}

geom.onChange = function ()
{
    if (mesh)mesh.dispose();
    mesh = null;

    reset();
};

function setupArray()
{
    if (!mesh) return;
    if (!inTex1.get()) return;

    if (inLimit.get()) num = Math.max(0, Math.floor(inNum.get()));
    else num = inTex1.get().width * inTex1.get().height;

    mesh.numInstances = num;

    recalc = false;
}

function doRender()
{
    if (!inTex1.get()) return;
    if (!mesh && geom.get())
        mesh = new CGL.Mesh(cgl, geom.get());
    op.checkGraphicsApi();

    if (!mesh) return;

    if (mesh.numInstances != inTex1.get().width * inTex1.get().height) reset();
    if (recalc)
    {
        setupArray();
        mod.bind();
        mod.unbind();
        updateDefines();
    }

    if (inTex1.isLinked() && inTex1.get()) mod.pushTexture("MOD_texTrans", inTex1.get().tex);
    if (inTex2.isLinked() && inTex2.get()) mod.pushTexture("MOD_texRot", inTex2.get().tex);
    if (inTex3.isLinked() && inTex3.get()) mod.pushTexture("MOD_texScale", inTex3.get().tex);
    if (inTex4.isLinked() && inTex4.get()) mod.pushTexture("MOD_texColor", inTex4.get().tex);
    if (inTex5.isLinked() && inTex5.get()) mod.pushTexture("MOD_texCoords", inTex5.get().tex);

    if (inTex1.get())
    {
        mod.setUniformValue("MOD_texSizeX", inTex1.get().width);
        mod.setUniformValue("MOD_texSizeY", inTex1.get().height);
    }

    outNum.set(mesh.numInstances);

    mod.bind();
    if (mesh.numInstances > 0) mesh.render(cgl.getShader());

    outTrigger.trigger();

    mod.unbind();
}

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.ImageCompose_v4
// 
// **************************************************************

Ops.Gl.ImageCompose.ImageCompose_v4= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"imgcomp_frag":"IN vec2 texCoord;\nUNI vec4 bgColor;\nUNI sampler2D tex;\n#ifdef USE_UVTEX\nUNI sampler2D UVTex;\n#endif\n\nvoid main()\n{\n\n    #ifndef USE_TEX\n        outColor=bgColor;\n    #endif\n    #ifdef USE_TEX\n        #ifndef USE_UVTEX\n        outColor=texture(tex,texCoord);\n        #else\n        outColor=texture(tex,texture(UVTex,texCoord).xy);\n        #endif\n    #endif\n\n\n\n}\n",};
const
    cgl = op.patch.cgl,
    render = op.inTrigger("Render"),
    inTex = op.inTexture("Base Texture"),
    inUVTex = op.inTexture("UV Texture"),
    inSize = op.inSwitch("Size", ["Auto", "Canvas", "Manual"], "Auto"),
    width = op.inValueInt("Width", 640),
    height = op.inValueInt("Height", 480),
    inFilter = op.inSwitch("Filter", ["nearest", "linear", "mipmap"], "linear"),
    inWrap = op.inValueSelect("Wrap", ["clamp to edge", "repeat", "mirrored repeat"], "repeat"),
    aniso = op.inSwitch("Anisotropic", ["0", "1", "2", "4", "8", "16"], "0"),

    inPixelFormat = op.inDropDown("Pixel Format", CGL.Texture.PIXELFORMATS, CGL.Texture.PFORMATSTR_RGBA8UB),

    inClear = op.inBool("Clear", true),
    r = op.inValueSlider("R", 0),
    g = op.inValueSlider("G", 0),
    b = op.inValueSlider("B", 0),
    a = op.inValueSlider("A", 0),

    trigger = op.outTrigger("Next"),
    texOut = op.outTexture("texture_out", CGL.Texture.getEmptyTexture(cgl)),
    outRatio = op.outNumber("Aspect Ratio"),
    outWidth = op.outNumber("Texture Width"),
    outHeight = op.outNumber("Texture Height");

op.setPortGroup("Texture Size", [inSize, width, height]);
op.setPortGroup("Texture Parameters", [inWrap, aniso, inFilter, inPixelFormat]);

r.setUiAttribs({ "colorPick": true });
op.setPortGroup("Color", [r, g, b, a, inClear]);

op.toWorkPortsNeedToBeLinked(render);

const prevViewPort = [0, 0, 0, 0];
let effect = null;
let tex = null;
let reInitEffect = true;
let isFloatTex = false;
let copyShader = null;
let copyShaderTexUni = null;
let copyShaderUVTexUni = null;
let copyShaderRGBAUni = null;

inWrap.onChange =
inFilter.onChange =
aniso.onChange =
inPixelFormat.onChange = reInitLater;

inTex.onLinkChanged =
inClear.onChange =
    inSize.onChange =
    inUVTex.onChange = updateUi;

render.onTriggered =
    op.preRender = doRender;

updateUi();

function initEffect()
{
    if (effect)effect.delete();
    if (tex)tex.delete();
    tex = null;
    effect = new CGL.TextureEffect(cgl, { "isFloatingPointTexture": CGL.Texture.isPixelFormatFloat(inPixelFormat.get()), "name": op.name });

    const cgl_aniso = Math.min(cgl.maxAnisotropic, parseFloat(aniso.get()));

    tex = new CGL.Texture(cgl,
        {
            "anisotropic": cgl_aniso,
            "name": "image_compose_v2_" + op.id,
            "pixelFormat": inPixelFormat.get(),
            "filter": getFilter(),
            "wrap": getWrap(),
            "width": getWidth(),
            "height": getHeight()
        });

    effect.setSourceTexture(tex);

    outWidth.set(getWidth());
    outHeight.set(getHeight());
    outRatio.set(getWidth() / getHeight());

    texOut.setRef(CGL.Texture.getEmptyTexture(cgl));

    reInitEffect = false;
    updateUi();
}

function getFilter()
{
    if (inFilter.get() == "nearest") return CGL.Texture.FILTER_NEAREST;
    else if (inFilter.get() == "linear") return CGL.Texture.FILTER_LINEAR;
    else if (inFilter.get() == "mipmap") return CGL.Texture.FILTER_MIPMAP;
}

function getWrap()
{
    if (inWrap.get() == "repeat") return CGL.Texture.WRAP_REPEAT;
    else if (inWrap.get() == "mirrored repeat") return CGL.Texture.WRAP_MIRRORED_REPEAT;
    else if (inWrap.get() == "clamp to edge") return CGL.Texture.WRAP_CLAMP_TO_EDGE;
}

function getWidth()
{
    let x = 0;
    if (inTex.get() && inSize.get() == "Auto") x = inTex.get().width;
    else if (inSize.get() == "Auto" || inSize.get() == "Canvas") x = cgl.canvasWidth;
    else if (inSize.get() == "ViewPort") x = cgl.getViewPort()[2];
    else x = Math.ceil(width.get());
    return op.patch.cgl.checkTextureSize(x);
}

function getHeight()
{
    let x = 0;

    if (inTex.get() && inSize.get() == "Auto") x = inTex.get().height;
    else if (inSize.get() == "Auto" || inSize.get() == "Canvas") x = cgl.canvasHeight;
    else if (inSize.get() == "ViewPort") x = cgl.getViewPort()[3];
    else x = Math.ceil(height.get());
    return op.patch.cgl.checkTextureSize(x);
}

function reInitLater()
{
    reInitEffect = true;
}

function updateResolution()
{
    if ((
        getWidth() != tex.width ||
        getHeight() != tex.height ||
        // tex.anisotropic != parseFloat(aniso.get()) ||
        // tex.isFloatingPoint() != CGL.Texture.isPixelFormatFloat(inPixelFormat.get()) ||
        tex.pixelFormat != inPixelFormat.get() ||
        tex.filter != getFilter() ||
        tex.wrap != getWrap()
    ) && (getWidth() !== 0 && getHeight() !== 0))
    {
        initEffect();
        effect.setSourceTexture(tex);
        // texOut.set(CGL.Texture.getEmptyTexture(cgl));
        texOut.setRef(tex);
        updateResolutionInfo();
        checkTypes();
    }
}

function updateResolutionInfo()
{
    let info = null;

    if (inSize.get() == "Manual")
    {
        info = null;
    }
    else if (inSize.get() == "Auto")
    {
        if (inTex.get()) info = "Input Texture";
        else info = "Canvas Size";

        info += ": " + getWidth() + " x " + getHeight();
    }

    let changed = false;
    changed = inSize.uiAttribs.info != info;
    inSize.setUiAttribs({ "info": info });
    if (changed)op.refreshParams();
}

function updateDefines()
{
    if (copyShader)copyShader.toggleDefine("USE_TEX", inTex.isLinked() || !inClear.get());
    if (copyShader)copyShader.toggleDefine("USE_UVTEX", inUVTex.isLinked());
}

function updateUi()
{
    aniso.setUiAttribs({ "greyout": getFilter() != CGL.Texture.FILTER_MIPMAP });

    r.setUiAttribs({ "greyout": inTex.isLinked() });
    b.setUiAttribs({ "greyout": inTex.isLinked() });
    g.setUiAttribs({ "greyout": inTex.isLinked() });
    a.setUiAttribs({ "greyout": inTex.isLinked() });

    inClear.setUiAttribs({ "greyout": inTex.isLinked() });
    width.setUiAttribs({ "greyout": inSize.get() != "Manual" });
    height.setUiAttribs({ "greyout": inSize.get() != "Manual" });

    // width.setUiAttribs({ "hideParam": inSize.get() != "Manual" });
    // height.setUiAttribs({ "hideParam": inSize.get() != "Manual" });

    if (tex)
        if (CGL.Texture.isPixelFormatFloat(inPixelFormat.get()) && getFilter() == CGL.Texture.FILTER_MIPMAP) op.setUiError("fpmipmap", "Don't use mipmap and 32bit at the same time, many systems do not support this.", 1);
        else op.setUiError("fpmipmap", null);

    updateResolutionInfo();
    updateDefines();
    checkTypes();
}

function checkTypes()
{
    if (tex)
        if (inTex.isLinked() && inTex.get() && (tex.isFloatingPoint() < inTex.get().isFloatingPoint()))
            op.setUiError("textypediff", "Warning: Mixing floating point and non floating point texture can result in data/precision loss", 1);
        else
            op.setUiError("textypediff", null);
}

op.preRender = () =>
{
    doRender();
};

function copyTexture()
{
    if (!copyShader)
    {
        copyShader = new CGL.Shader(cgl, "copytextureshader");
        copyShader.setSource(copyShader.getDefaultVertexShader(), attachments.imgcomp_frag);
        copyShaderTexUni = new CGL.Uniform(copyShader, "t", "tex", 0);
        copyShaderUVTexUni = new CGL.Uniform(copyShader, "t", "UVTex", 1);
        copyShaderRGBAUni = new CGL.Uniform(copyShader, "4f", "bgColor", r, g, b, a);
        updateDefines();
    }

    cgl.pushShader(copyShader);
    cgl.currentTextureEffect.bind();

    if (inTex.get()) cgl.setTexture(0, inTex.get().tex);
    else if (!inClear.get() && texOut.get()) cgl.setTexture(0, texOut.get().tex);
    if (inUVTex.get()) cgl.setTexture(1, inUVTex.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();
}

function doRender()
{
    if (!effect || reInitEffect) initEffect();

    cgl.pushBlend(false);

    updateResolution();

    const oldEffect = cgl.currentTextureEffect;
    cgl.currentTextureEffect = effect;
    cgl.currentTextureEffect.imgCompVer = 3;
    cgl.currentTextureEffect.width = width.get();
    cgl.currentTextureEffect.height = height.get();
    effect.setSourceTexture(tex);

    effect.startEffect(inTex.get() || CGL.Texture.getEmptyTexture(cgl, isFloatTex), true);
    copyTexture();

    trigger.trigger();

    cgl.pushViewPort(0, 0, width.get(), height.get());

    effect.endEffect();
    texOut.setRef(effect.getCurrentSourceTexture());

    cgl.popViewPort();

    cgl.popBlend();
    cgl.currentTextureEffect = oldEffect;
}

}
};






// **************************************************************
// 
// Ops.Gl.Textures.NoiseTexture
// 
// **************************************************************

Ops.Gl.Textures.NoiseTexture= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const

    inWidth = op.inValueInt("Width", 256),
    inHeight = op.inValueInt("Height", 256),
    tfilter = op.inSwitch("Filter", ["nearest", "linear"], "nearest"),
    wrap = op.inValueSelect("Wrap", ["repeat", "mirrored repeat", "clamp to edge"], "repeat"),
    inColor = op.inValueBool("Color", false),
    inPixel = op.inDropDown("Pixel Format", CGL.Texture.PIXELFORMATS, CGL.Texture.PFORMATSTR_RGBA8UB),
    inInteger = op.inBool("Integer", false),
    inSeed = op.inFloat("Seed", 1),
    inOutR = op.inBool("Channel R", true),
    inMinR = op.inFloat("Min R", 0),
    inMaxR = op.inFloat("Max R", 1),
    inOutG = op.inBool("Channel G", true),
    inMinG = op.inFloat("Min G", 0),
    inMaxG = op.inFloat("Max G", 1),
    inOutB = op.inBool("Channel B", true),
    inMinB = op.inFloat("Min B", 0),
    inMaxB = op.inFloat("Max B", 1),
    inOutA = op.inBool("Channel A", true),
    inMinA = op.inFloat("Min A", 1),
    inMaxA = op.inFloat("Max A", 1),
    outTex = op.outTexture("Texture"),
    outNumPixel = op.outNumber("Total Pixel");

const cgl = op.patch.cgl;
let to = null;
let loadingId = null;

inSeed.onChange =
    inWidth.onChange =
    inHeight.onChange =
    inPixel.onChange =
    inMinR.onChange =
    inMaxR.onChange =
    inMinG.onChange =
    inMinA.onChange =
    inMaxG.onChange =
    inMaxA.onChange =
    inMinB.onChange =
    inMaxB.onChange =
    inOutR.onChange =
    inOutB.onChange =
    inOutG.onChange =
    inOutA.onChange =
    tfilter.onChange =
    wrap.onChange =
    inInteger.onChange =
    inColor.onChange = createSoon;

createSoon();

function createSoon()
{
    if (!loadingId) loadingId = cgl.patch.loading.start("noisetexture", "noisetexture");
    cgl.addNextFrameOnceCallback(update);
}

function update()
{
    const isFp = inPixel.get().indexOf("float") > -1;
    if (!isFp)
    {
        if (
            inMinR.get() < 0.0 || inMinR.get() > 1.0 ||
            inMinG.get() < 0.0 || inMinG.get() > 1.0 ||
            inMinB.get() < 0.0 || inMinB.get() > 1.0 ||
            inMaxR.get() < 0.0 || inMaxR.get() > 1.0 ||
            inMaxA.get() < 0.0 || inMaxA.get() > 1.0 ||
            inMaxG.get() < 0.0 || inMaxG.get() > 1.0 ||
            inMaxB.get() < 0.0 || inMaxB.get() > 1.0) op.setUiError("nonfprange", "Non floating point textures have to be between 0 and 1");
        else op.setUiError("nonfprange", null);
    }
    else op.setUiError("nonfprange", null);

    inMinG.setUiAttribs({ "greyout": !inColor.get() });
    inMaxG.setUiAttribs({ "greyout": !inColor.get() });
    inMinB.setUiAttribs({ "greyout": !inColor.get() });
    inMaxB.setUiAttribs({ "greyout": !inColor.get() });
    inMaxA.setUiAttribs({ "greyout": !inColor.get() });

    let width = Math.ceil(inWidth.get());
    let height = Math.ceil(inHeight.get());

    if (width < 1)width = 1;
    if (height < 1)height = 1;

    let pixels;
    const num = width * 4 * height;

    const minR = inMinR.get();
    const diffR = inMaxR.get() - minR;

    const minG = inMinG.get();
    const diffG = inMaxG.get() - minG;

    const minB = inMinB.get();
    const diffB = inMaxB.get() - minB;

    const minA = inMinA.get();
    const diffA = inMaxA.get() - minA;

    Math.randomSeed = inSeed.get();

    if (isFp)
    {
        pixels = new Float32Array(num);

        if (inColor.get())
        {
            for (let i = 0; i < num; i += 4)
            {
                pixels[i + 0] = minR + Math.seededRandom() * diffR;
                pixels[i + 1] = minG + Math.seededRandom() * diffG;
                pixels[i + 2] = minB + Math.seededRandom() * diffB;
                pixels[i + 3] = minA + Math.seededRandom() * diffA;
            }
        }
        else
        {
            for (let i = 0; i < num; i += 4)
            {
                let c = minR + Math.seededRandom() * diffR;
                pixels[i + 0] = pixels[i + 1] = pixels[i + 2] = c;
                pixels[i + 3] = 1;
            }
        }
    }
    else
    {
        pixels = new Uint8Array(num);

        if (inColor.get())
        {
            for (let i = 0; i < num; i += 4)
            {
                pixels[i + 0] = (minR + Math.seededRandom() * diffR) * 255;
                pixels[i + 1] = (minG + Math.seededRandom() * diffG) * 255;
                pixels[i + 2] = (minB + Math.seededRandom() * diffB) * 255;
                pixels[i + 3] = (minA + Math.seededRandom() * diffA) * 255;
            }
        }
        else
        {
            for (let i = 0; i < num; i += 4)
            {
                pixels[i + 0] =
                pixels[i + 1] =
                pixels[i + 2] = (minR + Math.seededRandom() * diffR) * 255;
                pixels[i + 3] = 255;
            }
        }
    }

    if (inInteger.get())
    {
        for (let i = 0; i < pixels.length; i++)pixels[i] = Math.round(pixels[i] - 0.5);
    }

    if (!inOutR.get()) for (let i = 0; i < num; i += 4)pixels[i + 0] = 0.0;
    if (!inOutG.get()) for (let i = 0; i < num; i += 4)pixels[i + 1] = 0.0;
    if (!inOutB.get()) for (let i = 0; i < num; i += 4)pixels[i + 2] = 0.0;
    if (!inOutA.get()) for (let i = 0; i < num; i += 4)pixels[i + 3] = 0.0;

    let cgl_filter = CGL.Texture.FILTER_NEAREST;
    if (tfilter.get() == "linear") cgl_filter = CGL.Texture.FILTER_LINEAR;
    // else if (tfilter.get() == "mipmap") cgl_filter = CGL.Texture.FILTER_MIPMAP;
    // else if (tfilter.get() == "Anisotropic") cgl_filter = CGL.Texture.FILTER_ANISOTROPIC;

    let cgl_wrap = CGL.Texture.WRAP_REPEAT;
    if (wrap.get() == "mirrored repeat") cgl_wrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
    if (wrap.get() == "clamp to edge") cgl_wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

    let tex = new CGL.Texture(cgl, { "isFloatingPointTexture": isFp, "name": "noisetexture" });

    tex.initFromData(pixels, width, height, cgl_filter, cgl_wrap);

    outNumPixel.set(width * height);
    outTex.setRef(tex);
    loadingId = cgl.patch.loading.finished(loadingId);
}

}
};






// **************************************************************
// 
// Ops.Gl.Pbr.PbrMaterial
// 
// **************************************************************

Ops.Gl.Pbr.PbrMaterial= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"BasicPBR_frag":"precision highp float;\nprecision highp int;\n{{MODULES_HEAD}}\n\n#ifndef PI\n#define PI 3.14159265358\n#endif\n\n// set by cables\nUNI vec3 camPos;\nUNI float _Unlit;\n\n// utility maps\n#ifdef USE_ENVIRONMENT_LIGHTING\n    UNI sampler2D IBL_BRDF_LUT;\n#endif\n// mesh maps\n#ifdef USE_ALBEDO_TEX\n    UNI sampler2D _AlbedoMap;\n#endif\nUNI vec4 _Albedo;\n\n#ifdef USE_NORMAL_TEX\n    UNI sampler2D _NormalMap;\n#endif\n#ifdef USE_EMISSION\n    UNI sampler2D _EmissionMap;\n#endif\n#ifdef USE_HEIGHT_TEX\n    UNI sampler2D _HeightMap;\n#endif\n#ifdef USE_THIN_FILM_MAP\n    UNI sampler2D _ThinFilmMap;\n    UNI float _TFThicknessTexMin;\n    UNI float _TFThicknessTexMax;\n#endif\n#ifdef USE_AORM_TEX\n    UNI sampler2D _AORMMap;\n#else\n    UNI float _Roughness;\n    UNI float _Metalness;\n#endif\n#ifdef USE_LIGHTMAP\n    #ifndef VERTEX_COLORS\n        UNI sampler2D _Lightmap;\n    #else\n        #ifndef VCOL_LIGHTMAP\n            UNI sampler2D _Lightmap;\n        #endif\n    #endif\n#endif\n#ifdef USE_CLEAR_COAT\n    UNI float _ClearCoatIntensity;\n    UNI float _ClearCoatRoughness;\n    #ifdef USE_CC_NORMAL_MAP\n        #ifndef USE_NORMAL_MAP_FOR_CC\n            UNI sampler2D _CCNormalMap;\n        #endif\n    #endif\n#endif\n#ifdef USE_THIN_FILM\n    UNI float _ThinFilmIntensity;\n    UNI float _ThinFilmIOR;\n    UNI float _ThinFilmThickness;\n#endif\n// IBL inputs\n#ifdef USE_ENVIRONMENT_LIGHTING\n    UNI samplerCube _irradiance;\n    UNI samplerCube _prefilteredEnvironmentColour;\n    UNI float MAX_REFLECTION_LOD;\n    UNI float diffuseIntensity;\n    UNI float specularIntensity;\n    UNI float envIntensity;\n#endif\n#ifdef USE_LIGHTMAP\n    UNI float lightmapIntensity;\n#endif\nUNI float tonemappingExposure;\n#ifdef USE_HEIGHT_TEX\n    UNI float _HeightDepth;\n    #ifndef USE_OPTIMIZED_HEIGHT\n        UNI mat4 modelMatrix;\n    #endif\n#endif\n#ifdef USE_PARALLAX_CORRECTION\n    UNI vec3 _PCOrigin;\n    UNI vec3 _PCboxMin;\n    UNI vec3 _PCboxMax;\n#endif\n#ifdef USE_EMISSION\n    UNI float _EmissionIntensity;\n#endif\nIN vec2 texCoord;\nIN vec2 texCoordTransformed;\n\n#ifdef USE_LIGHTMAP\n    #ifndef ATTRIB_texCoord1\n    #ifndef VERTEX_COLORS\n        IN vec2 texCoord1;\n    #else\n        #ifndef VCOL_LIGHTMAP\n            IN vec2 texCoord1;\n        #endif\n    #endif\n    #endif\n#endif\nIN vec4 FragPos;\nIN mat3 TBN;\nIN vec3 norm;\nIN vec3 normM;\n#ifdef VERTEX_COLORS\n    IN vec4 vertCol;\n#endif\n#ifdef USE_HEIGHT_TEX\n    #ifdef USE_OPTIMIZED_HEIGHT\n        IN vec3 fragTangentViewDir;\n    #else\n        IN mat3 invTBN;\n    #endif\n#endif\n\n\n// structs\nstruct Light {\n    vec3 color;\n    vec3 position;\n    vec3 specular;\n\n    #define INTENSITY x\n    #define ATTENUATION y\n    #define FALLOFF z\n    #define RADIUS w\n    vec4 lightProperties;\n\n    int castLight;\n\n    vec3 conePointAt;\n    #define COSCONEANGLE x\n    #define COSCONEANGLEINNER y\n    #define SPOTEXPONENT z\n    vec3 spotProperties;\n};\n\n\n#ifdef WEBGL1\n    #ifdef GL_EXT_shader_texture_lod\n        #define textureLod textureCubeLodEXT\n    #endif\n#endif\n#define SAMPLETEX textureLod\n\n// https://community.khronos.org/t/addition-of-two-hdr-rgbe-values/55669\nhighp vec4 EncodeRGBE8(highp vec3 rgb)\n{\n    highp vec4 vEncoded;\n    float maxComponent = max(max(rgb.r, rgb.g), rgb.b);\n    float fExp = ceil(log2(maxComponent));\n    vEncoded.rgb = rgb / exp2(fExp);\n    vEncoded.a = (fExp + 128.0) / 255.0;\n    return vEncoded;\n}\n// https://enkimute.github.io/hdrpng.js/\nhighp vec3 DecodeRGBE8(highp vec4 rgbe)\n{\n    highp vec3 vDecoded = rgbe.rgb * pow(2.0, rgbe.a * 255.0-128.0);\n    return vDecoded;\n}\n\n// from https://github.com/BabylonJS/Babylon.js/blob/master/src/Shaders/ShadersInclude/pbrIBLFunctions.fx\nfloat environmentRadianceOcclusion(float ambientOcclusion, float NdotVUnclamped) {\n    // Best balanced (implementation time vs result vs perf) analytical environment specular occlusion found.\n    // http://research.tri-ace.com/Data/cedec2011_RealtimePBR_Implementation_e.pptx\n    float temp = NdotVUnclamped + ambientOcclusion;\n    return clamp(temp * temp - 1.0 + ambientOcclusion, 0.0, 1.0);\n}\nfloat environmentHorizonOcclusion(vec3 view, vec3 normal, vec3 geometricNormal) {\n    // http://marmosetco.tumblr.com/post/81245981087\n    vec3 reflection = reflect(view, normal);\n    float temp = clamp(1.0 + 1.1 * dot(reflection, geometricNormal), 0.0, 1.0);\n    return temp * temp;\n}\n#ifdef ALPHA_DITHERED\n// from https://github.com/google/filament/blob/main/shaders/src/dithering.fs\n// modified to use this to discard based on factor instead of dithering\nfloat interleavedGradientNoise(highp vec2 n) {\n    return fract(52.982919 * fract(dot(vec2(0.06711, 0.00584), n)));\n}\nfloat Dither_InterleavedGradientNoise(float a) {\n    // Jimenez 2014, \"Next Generation Post-Processing in Call of Duty\"\n    highp vec2 uv = gl_FragCoord.xy;\n\n    // The noise variable must be highp to workaround Adreno bug #1096.\n    highp float noise = interleavedGradientNoise(uv);\n\n    return step(noise, a);\n}\n#endif\n\n#ifdef USE_HEIGHT_TEX\n#ifndef WEBGL1\n// based on Jasper Flicks great tutorials (:\nfloat getSurfaceHeight(sampler2D surfaceHeightMap, vec2 UV)\n{\n\treturn texture(surfaceHeightMap, UV).r;\n}\n\nvec2 RaymarchedParallax(vec2 UV, sampler2D surfaceHeightMap, float strength, vec3 viewDir)\n{\n    #ifndef USE_OPTIMIZED_HEIGHT\n\t#define PARALLAX_RAYMARCHING_STEPS 50\n    #else\n    #define PARALLAX_RAYMARCHING_STEPS 20\n    #endif\n\tvec2 uvOffset = vec2(0.0);\n\tfloat stepSize = 1.0 / float(PARALLAX_RAYMARCHING_STEPS);\n\tvec2 uvDelta = vec2(viewDir * (stepSize * strength));\n\tfloat stepHeight = 1.0;\n\tfloat surfaceHeight = getSurfaceHeight(surfaceHeightMap, UV);\n\n\tvec2 prevUVOffset = uvOffset;\n\tfloat prevStepHeight = stepHeight;\n\tfloat prevSurfaceHeight = surfaceHeight;\n\n    // doesnt work with webgl 1.0 as the && condition is not fixed length for loop\n\tfor (int i = 1; i < PARALLAX_RAYMARCHING_STEPS && stepHeight > surfaceHeight; ++i)\n\t{\n\t\tprevUVOffset = uvOffset;\n\t\tprevStepHeight = stepHeight;\n\t\tprevSurfaceHeight = surfaceHeight;\n\n\t\tuvOffset -= uvDelta;\n\t\tstepHeight -= stepSize;\n\t\tsurfaceHeight = getSurfaceHeight(surfaceHeightMap, UV + uvOffset);\n\t}\n\n\tfloat prevDifference = prevStepHeight - prevSurfaceHeight;\n\tfloat difference = surfaceHeight - stepHeight;\n\tfloat t = prevDifference / (prevDifference + difference);\n\tuvOffset = mix(prevUVOffset, uvOffset, t);\n\treturn uvOffset;\n}\n#endif // TODO: use non raymarched parallax mapping here if webgl 1.0?\n#endif\n\n#ifdef USE_PARALLAX_CORRECTION\nvec3 BoxProjection(vec3 direction, vec3 position, vec3 cubemapPosition, vec3 boxMin, vec3 boxMax)\n{\n\tboxMin -= position;\n\tboxMax -= position;\n\tfloat x = (direction.x > 0.0 ? boxMax.x : boxMin.x) / direction.x;\n\tfloat y = (direction.y > 0.0 ? boxMax.y : boxMin.y) / direction.y;\n\tfloat z = (direction.z > 0.0 ? boxMax.z : boxMin.z) / direction.z;\n\tfloat scalar = min(min(x, y), z);\n\n\treturn direction * scalar + (position - cubemapPosition);\n}\n#endif\n\n#ifdef USE_THIN_FILM\n// section from https://github.com/BabylonJS/Babylon.js/blob/8a5077e0efb4ba471d16f7cd010fe6124ea8d005/packages/dev/core/src/Shaders/ShadersInclude/pbrBRDFFunctions.fx\n// helper functions from https://github.com/BabylonJS/Babylon.js/blob/8a5077e0efb4ba471d16f7cd010fe6124ea8d005/packages/dev/core/src/Shaders/ShadersInclude/helperFunctions.fx\nfloat square(float value)\n{\n    return value * value;\n}\nvec3 square(vec3 value)\n{\n    return value * value;\n}\nfloat pow5(float value) {\n    float sq = value * value;\n    return sq * sq * value;\n}\nconst mat3 XYZ_TO_REC709 = mat3(\n     3.2404542, -0.9692660,  0.0556434,\n    -1.5371385,  1.8760108, -0.2040259,\n    -0.4985314,  0.0415560,  1.0572252\n);\n// Assume air interface for top\n// Note: We don't handle the case fresnel0 == 1\nvec3 getIORTfromAirToSurfaceR0(vec3 f0) {\n    vec3 sqrtF0 = sqrt(f0);\n    return (1. + sqrtF0) / (1. - sqrtF0);\n}\n\n// Conversion FO/IOR\nvec3 getR0fromIORs(vec3 iorT, float iorI) {\n    return square((iorT - vec3(iorI)) / (iorT + vec3(iorI)));\n}\n\nfloat getR0fromIORs(float iorT, float iorI) {\n    return square((iorT - iorI) / (iorT + iorI));\n}\n\n// Fresnel equations for dielectric/dielectric interfaces.\n// Ref: https://belcour.github.io/blog/research/publication/2017/05/01/brdf-thin-film.html\n// Evaluation XYZ sensitivity curves in Fourier space\nvec3 evalSensitivity(float opd, vec3 shift) {\n    float phase = 2.0 * PI * opd * 1.0e-9;\n\n    const vec3 val = vec3(5.4856e-13, 4.4201e-13, 5.2481e-13);\n    const vec3 pos = vec3(1.6810e+06, 1.7953e+06, 2.2084e+06);\n    const vec3 var = vec3(4.3278e+09, 9.3046e+09, 6.6121e+09);\n\n    vec3 xyz = val * sqrt(2.0 * PI * var) * cos(pos * phase + shift) * exp(-square(phase) * var);\n    xyz.x += 9.7470e-14 * sqrt(2.0 * PI * 4.5282e+09) * cos(2.2399e+06 * phase + shift[0]) * exp(-4.5282e+09 * square(phase));\n    xyz /= 1.0685e-7;\n\n    vec3 srgb = XYZ_TO_REC709 * xyz;\n    return srgb;\n}\n// from https://github.com/BabylonJS/Babylon.js/blob/8a5077e0efb4ba471d16f7cd010fe6124ea8d005/packages/dev/core/src/Shaders/ShadersInclude/pbrBRDFFunctions.fx\nvec3 fresnelSchlickGGX(float VdotH, vec3 reflectance0, vec3 reflectance90)\n{\n    return reflectance0 + (reflectance90 - reflectance0) * pow5(1.0 - VdotH);\n}\nfloat fresnelSchlickGGX(float VdotH, float reflectance0, float reflectance90)\n{\n    return reflectance0 + (reflectance90 - reflectance0) * pow5(1.0 - VdotH);\n}\nvec3 evalIridescence(float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0) {\n    vec3 I = vec3(1.0);\n\n    // Force iridescenceIOR -> outsideIOR when thinFilmThickness -> 0.0\n    float iridescenceIOR = mix(outsideIOR, eta2, smoothstep(0.0, 0.03, thinFilmThickness));\n    // Evaluate the cosTheta on the base layer (Snell law)\n    float sinTheta2Sq = square(outsideIOR / iridescenceIOR) * (1.0 - square(cosTheta1));\n\n    // Handle TIR:\n    float cosTheta2Sq = 1.0 - sinTheta2Sq;\n    if (cosTheta2Sq < 0.0) {\n        return I;\n    }\n\n    float cosTheta2 = sqrt(cosTheta2Sq);\n\n    // First interface\n    float R0 = getR0fromIORs(iridescenceIOR, outsideIOR);\n    float R12 = fresnelSchlickGGX(cosTheta1, R0, 1.);\n    float R21 = R12;\n    float T121 = 1.0 - R12;\n    float phi12 = 0.0;\n    if (iridescenceIOR < outsideIOR) phi12 = PI;\n    float phi21 = PI - phi12;\n\n    // Second interface\n    vec3 baseIOR = getIORTfromAirToSurfaceR0(clamp(baseF0, 0.0, 0.9999)); // guard against 1.0\n    vec3 R1 = getR0fromIORs(baseIOR, iridescenceIOR);\n    vec3 R23 = fresnelSchlickGGX(cosTheta2, R1, vec3(1.));\n    vec3 phi23 = vec3(0.0);\n    if (baseIOR[0] < iridescenceIOR) phi23[0] = PI;\n    if (baseIOR[1] < iridescenceIOR) phi23[1] = PI;\n    if (baseIOR[2] < iridescenceIOR) phi23[2] = PI;\n\n    // Phase shift\n    float opd = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;\n    vec3 phi = vec3(phi21) + phi23;\n\n    // Compound terms\n    vec3 R123 = clamp(R12 * R23, 1e-5, 0.9999);\n    vec3 r123 = sqrt(R123);\n    vec3 Rs = square(T121) * R23 / (vec3(1.0) - R123);\n\n    // Reflectance term for m = 0 (DC term amplitude)\n    vec3 C0 = R12 + Rs;\n    I = C0;\n\n    // Reflectance term for m > 0 (pairs of diracs)\n    vec3 Cm = Rs - T121;\n    for (int m = 1; m <= 2; ++m)\n    {\n        Cm *= r123;\n        vec3 Sm = 2.0 * evalSensitivity(float(m) * opd, float(m) * phi);\n        I += Cm * Sm;\n    }\n\n    // Since out of gamut colors might be produced, negative color values are clamped to 0.\n    return max(I, vec3(0.0));\n}\n#endif\n\n{{PBR_FRAGMENT_HEAD}}\nvoid main()\n{\n    vec4 col;\n\n    // set up interpolated vertex data\n    vec2 UV0             = texCoord;\n    vec2 UV0_transformed = texCoordTransformed;\n    #ifdef USE_LIGHTMAP\n        #ifndef VERTEX_COLORS\n            vec2 UV1             = texCoord1;\n        #else\n            #ifndef VCOL_LIGHTMAP\n                vec2 UV1             = texCoord1;\n\n            #endif\n        #endif\n    #endif\n    vec3 V               = normalize(camPos - FragPos.xyz);\n\n    #ifdef USE_HEIGHT_TEX\n        #ifndef USE_OPTIMIZED_HEIGHT\n            vec3 fragTangentViewDir = normalize(invTBN * (camPos - FragPos.xyz));\n        #endif\n        #ifndef WEBGL1\n            UV0 += RaymarchedParallax(UV0, _HeightMap, _HeightDepth * 0.1, fragTangentViewDir);\n            UV0_transformed += RaymarchedParallax(UV0_transformed, _HeightMap, _HeightDepth * 0.1, fragTangentViewDir);\n        #endif\n    #endif\n\n    // load relevant mesh maps\n    #ifdef USE_ALBEDO_TEX\n        vec4 AlbedoMap   = texture(_AlbedoMap, UV0_transformed);\n\n        #ifdef GAMMAENC\n          AlbedoMap = vec4(pow(AlbedoMap.rgb, vec3(1.0/2.2)), AlbedoMap.a);\n        #endif\n\n        #ifdef MUL_ALBEDO\n        AlbedoMap*=_Albedo;\n        #endif\n\n    #else\n        vec4 AlbedoMap   = _Albedo;\n    #endif\n    #ifdef ALPHA_MASKED\n\tif ( AlbedoMap.a <= 0.5 )\n\t    discard;\n\t#endif\n\n\t#ifdef ALPHA_DITHERED\n\tif ( Dither_InterleavedGradientNoise(AlbedoMap.a) <= 0.5 )\n\t    discard;\n\t#endif\n\n    #ifdef USE_AORM_TEX\n        vec4 AORM        = texture(_AORMMap, UV0);\n// AORM.g=1.0-AORM.g;\n        // AORM        = texture(_AORMMap, UV0).agra;\n    #else\n        vec4 AORM        = vec4(1.0, _Roughness, _Metalness, 1.0);\n    #endif\n    #ifdef USE_NORMAL_TEX\n        vec3 internalNormals = texture(_NormalMap, UV0).rgb;\n        internalNormals      = internalNormals * 2.0 - 1.0;\n        internalNormals      = normalize(TBN * internalNormals);\n    #else\n        vec3 internalNormals = normM;\n\n        #ifdef DOUBLE_SIDED\n            if(!gl_FrontFacing) internalNormals = internalNormals*-1.0;\n        #endif\n\n    #endif\n\t#ifdef USE_LIGHTMAP\n    \t#ifndef VERTEX_COLORS\n\t        #ifndef LIGHTMAP_IS_RGBE\n                vec3 Lightmap = texture(_Lightmap, UV1).rgb;\n            #else\n                vec3 Lightmap = DecodeRGBE8(texture(_Lightmap, UV1));\n            #endif\n        #else\n            #ifdef VCOL_LIGHTMAP\n                vec3 Lightmap = pow(vertCol.rgb, vec3(2.2));\n            #else\n  \t            #ifndef LIGHTMAP_IS_RGBE\n                    vec3 Lightmap = texture(_Lightmap, UV1).rgb;\n                #else\n                    vec3 Lightmap = DecodeRGBE8(texture(_Lightmap, UV1));\n                #endif\n            #endif\n        #endif\n\n        #ifdef GAMMAENC\n          Lightmap = pow(Lightmap.rgb, vec3(1.0/2.2));\n        #endif\n\n    #endif\n    // initialize texture values\n    float AO             = AORM.r;\n    float specK          = AORM.g;\n    float metalness      = AORM.b;\n    vec3  N              = normalize(internalNormals);\n    #ifndef ALBEDO_SRGB\n    vec3  albedo         = pow(AlbedoMap.rgb, vec3(2.2));\n    #else\n    vec3  albedo         = AlbedoMap.rgb;\n    #endif\n\n    #ifdef VERTEX_COLORS\n        #ifdef VCOL_COLOUR\n            albedo.rgb *= pow(vertCol.rgb, vec3(2.2));\n            AlbedoMap.rgb *= pow(vertCol.rgb, vec3(2.2));\n        #endif\n        #ifdef VCOL_AORM\n            AO = vertCol.r;\n            specK = vertCol.g;\n            metalness = vertCol.b;\n        #endif\n        #ifdef VCOL_AO\n            AO = vertCol.r;\n        #endif\n        #ifdef VCOL_R\n            specK = vertCol.g;\n        #endif\n        #ifdef VCOL_M\n            metalness = vertCol.b;\n        #endif\n    #endif\n\n    // set up values for later calculations\n    float NdotV          = abs(dot(N, V));\n    vec3  F0             = mix(vec3(0.04), AlbedoMap.rgb, metalness);\n\n    #ifdef USE_THIN_FILM\n        #ifndef USE_THIN_FILM_MAP\n            vec3 iridescenceFresnel = evalIridescence(1.0, _ThinFilmIOR, NdotV, _ThinFilmThickness, F0);\n            F0 = mix(F0, iridescenceFresnel, _ThinFilmIntensity);\n        #else\n            vec3 ThinFilmParameters = texture(_ThinFilmMap, UV0).rgb;\n            vec3 iridescenceFresnel = evalIridescence(1.0, 1.0 / ThinFilmParameters.b, NdotV, mix(_TFThicknessTexMin, _TFThicknessTexMax, ThinFilmParameters.g), F0);\n            F0 = mix(F0, iridescenceFresnel, ThinFilmParameters.r);\n        #endif\n    #endif\n\n    #ifndef WEBGL1\n        #ifndef DONT_USE_GR\n            // from https://github.com/BabylonJS/Babylon.js/blob/5e6321d887637877d8b28b417410abbbeb651c6e/src/Shaders/ShadersInclude/pbrHelperFunctions.fx\n            // modified to fit variable names\n            #ifndef DONT_USE_NMGR\n                vec3 nDfdx = dFdx(normM.xyz);\n                vec3 nDfdy = dFdy(normM.xyz);\n            #else\n                vec3 nDfdx = dFdx(N.xyz) + dFdx(normM.xyz);\n                vec3 nDfdy = dFdy(N.xyz) + dFdy(normM.xyz);\n            #endif\n            float slopeSquare = max(dot(nDfdx, nDfdx), dot(nDfdy, nDfdy));\n\n            // Vive analytical lights roughness factor.\n            float geometricRoughnessFactor = pow(clamp(slopeSquare, 0.0, 1.0), 0.333);\n\n            specK = max(specK, geometricRoughnessFactor);\n            #endif\n        #endif\n\n    \t// IBL\n    \t// from https://github.com/google/filament/blob/df6a100fcba66d9c99328a49d41fe3adecc0165d/shaders/src/light_indirect.fs\n    \t// and https://github.com/google/filament/blob/df6a100fcba66d9c99328a49d41fe3adecc0165d/shaders/src/shading_lit.fs\n    \t// modified to fit structure/variable names\n    \t#ifdef USE_ENVIRONMENT_LIGHTING\n        \tvec2 envBRDF = texture(IBL_BRDF_LUT, vec2(NdotV, specK)).xy;\n        \tvec3 E = mix(envBRDF.xxx, envBRDF.yyy, F0);\n        #endif\n\n        float specOcclusion    = environmentRadianceOcclusion(AO, NdotV);\n        float horizonOcclusion = environmentHorizonOcclusion(-V, N, normM);\n\n        #ifdef USE_ENVIRONMENT_LIGHTING\n            float envSampleSpecK = specK * MAX_REFLECTION_LOD;\n            vec3  R = reflect(-V, N);\n\n            #ifdef USE_PARALLAX_CORRECTION\n                R = BoxProjection(R, FragPos.xyz, _PCOrigin, _PCboxMin, _PCboxMax);\n            #endif\n\n    \t    vec3 prefilteredEnvColour = DecodeRGBE8(SAMPLETEX(_prefilteredEnvironmentColour, R, envSampleSpecK)) * specularIntensity*envIntensity;\n\n        \tvec3 Fr = E * prefilteredEnvColour;\n        \tFr *= specOcclusion * horizonOcclusion * (1.0 + F0 * (1.0 / envBRDF.y - 1.0));\n        \tFr *= 1.0 + F0; // TODO: this might be wrong, figure this out\n\n        \t#ifdef USE_LIGHTMAP\n                vec3 IBLIrradiance = Lightmap * lightmapIntensity;\n            #else\n                vec3 IBLIrradiance = DecodeRGBE8(SAMPLETEX(_irradiance, N, 0.0)) * diffuseIntensity*envIntensity;\n        #endif\n\n\t    vec3 Fd = (1.0 - metalness) * albedo * IBLIrradiance * (1.0 - E) * AO;\n    #endif\n    vec3 directLighting = vec3(0.0);\n\n    {{PBR_FRAGMENT_BODY}}\n\n    // combine IBL\n    col.rgb = directLighting;\n    #ifdef USE_ENVIRONMENT_LIGHTING\n\n        col.rgb += Fr + Fd;\n\n        #ifdef USE_CLEAR_COAT\n            float CCEnvSampleSpecK = _ClearCoatRoughness * MAX_REFLECTION_LOD;\n            #ifndef USE_NORMAL_MAP_FOR_CC\n                #ifndef USE_CC_NORMAL_MAP\n                    vec3 CCR = reflect(-V, normM);\n                #else\n                    vec3 CCN = texture(_CCNormalMap, UV0).rgb;\n                    CCN      = CCN * 2.0 - 1.0;\n                    CCN      = normalize(TBN * CCN);\n                    vec3 CCR = reflect(-V, CCN);\n                #endif\n                #ifdef USE_PARALLAX_CORRECTION\n                    CCR = BoxProjection(CCR, FragPos.xyz, _PCOrigin, _PCboxMin, _PCboxMax);\n                #endif\n            #endif\n            #ifndef USE_NORMAL_MAP_FOR_CC\n        \t    vec3 CCPrefilteredEnvColour = DecodeRGBE8(SAMPLETEX(_prefilteredEnvironmentColour, CCR, CCEnvSampleSpecK));\n        \t#else\n        \t    vec3 CCPrefilteredEnvColour = DecodeRGBE8(SAMPLETEX(_prefilteredEnvironmentColour, R, CCEnvSampleSpecK));\n        \t#endif\n        \tvec3 CCFr = E * CCPrefilteredEnvColour;\n        \tCCFr *= specOcclusion * horizonOcclusion * (0.96 + (0.04 / envBRDF.y));\n        \tCCFr *= 1.04;\n        \tcol.rgb += CCFr * _ClearCoatIntensity*envIntensity;\n        #endif\n    #else\n        #ifdef USE_LIGHTMAP\n              col.rgb += (1.0 - metalness) * albedo * Lightmap * lightmapIntensity;\n        #endif\n    #endif\n    #ifdef USE_EMISSION\n    col.rgb += texture(_EmissionMap, UV0).rgb * _EmissionIntensity;\n    #endif\n\n    col.rgb=mix(col.rgb,albedo.rgb,_Unlit);\n    col.a   = 1.0;\n\n    #ifdef ALPHA_BLEND\n        col.a = AlbedoMap.a;\n    #endif\n\n    // from https://github.com/BabylonJS/Babylon.js/blob/5e6321d887637877d8b28b417410abbbeb651c6e/src/Shaders/tonemap.fragment.fx\n    // modified to fit variable names\n    #ifdef TONEMAP_HejiDawson\n        col.rgb *= tonemappingExposure;\n\n        vec3 X = max(vec3(0.0, 0.0, 0.0), col.rgb - 0.004);\n        vec3 retColor = (X * (6.2 * X + 0.5)) / (X * (6.2 * X + 1.7) + 0.06);\n\n        col.rgb = retColor * retColor;\n    #elif defined(TONEMAP_Photographic)\n        col.rgb =  vec3(1.0, 1.0, 1.0) - exp2(-tonemappingExposure * col.rgb);\n    #else\n        col.rgb *= tonemappingExposure;\n        //col.rgb = clamp(col.rgb, vec3(0.0), vec3(1.0));\n    #endif\n\n\n\t#ifndef TONEMAP_None\n    col.rgb = pow(col.rgb, vec3(1.0/2.2));\n\t#endif\n\n    {{MODULE_COLOR}}\n\n    outColor = col;\n}\n","BasicPBR_vert":"precision highp float;\nprecision highp int;\n\nUNI vec3 camPos;\n\nIN vec3  vPosition;\nIN vec2  attrTexCoord;\n#ifdef USE_LIGHTMAP\n    #ifndef ATTRIB_attrTexCoord1\n        IN vec2 attrTexCoord1;\n        OUT vec2 texCoord1;\n        #define ATTRIB_attrTexCoord1\n        #define ATTRIB_texCoord1\n    #endif\n#endif\nIN vec3  attrVertNormal;\nIN vec3  attrTangent;\nIN vec3  attrBiTangent;\nIN float attrVertIndex;\n#ifdef VERTEX_COLORS\nIN vec4 attrVertColor;\n#endif\n\n{{MODULES_HEAD}}\n\nOUT vec2 texCoord;\nOUT vec2 texCoordTransformed;\n\nOUT vec4 FragPos;\nOUT mat3 TBN;\nOUT vec3 norm;\nOUT vec3 normM;\n#ifdef VERTEX_COLORS\nOUT vec4 vertCol;\n#endif\n#ifdef USE_HEIGHT_TEX\n#ifdef USE_OPTIMIZED_HEIGHT\nOUT vec3 fragTangentViewDir;\n#else\nOUT mat3 invTBN;\n#endif\n#endif\nUNI mat4 projMatrix;\nUNI mat4 viewMatrix;\nUNI mat4 modelMatrix;\nUNI vec4 texTransform;\n\nvoid main()\n{\n    mat4 mMatrix = modelMatrix; // needed to make vertex effects work\n\n    #ifdef USE_LIGHTMAP\n        texCoord1 = attrTexCoord1;\n        #ifndef FLIP_TEX\n          texCoord1.y=1.0-texCoord1.y;\n        #endif\n    #endif\n    texCoord = attrTexCoord;\n\n    #ifdef FLIP_TEX\n      // texCoord.y = texCoord.y;\n    #else\n      texCoord.y = 1.0 - texCoord.y;\n    #endif\n    texCoordTransformed.x=attrTexCoord.x*texTransform.x+texTransform.z;\n    texCoordTransformed.y=(texCoord.y)*texTransform.y+texTransform.w;\n\n    vec4 pos = vec4(vPosition,  1.0);\n    norm = attrVertNormal;\n    vec3 tangent = attrTangent;\n    vec3 bitangent = attrBiTangent;\n\n    {{MODULE_VERTEX_POSITION}}\n\n    mat4 theMMat=mMatrix;\n\n    #ifdef INSTANCING\n        #ifdef TEXINSTMAT\n            theMMat = texInstMat;\n        #endif\n        #ifndef TEXINSTMAT\n            theMMat = iMat;\n        #endif\n    #endif\n\n    FragPos = theMMat * pos;\n\n    tangent = normalize(vec3(theMMat * vec4(tangent,    0.0)));\n    vec3 N = normalize(vec3(theMMat * vec4(norm, 0.0)));\n    bitangent = normalize(vec3(theMMat * vec4(bitangent,  0.0)));\n\n    #ifdef VERTEX_COLORS\n        vertCol = attrVertColor;\n    #endif\n\n    TBN = mat3(tangent, bitangent, N);\n\n    #ifdef USE_HEIGHT_TEX\n    #ifndef WEBGL1\n    #ifdef USE_OPTIMIZED_HEIGHT\n    fragTangentViewDir = normalize(transpose(TBN) * (camPos - FragPos.xyz));\n    #else\n    invTBN = transpose(TBN);\n    #endif\n    #endif\n    #endif\n\n    normM = N;\n\n    mat4 modelViewMatrix=viewMatrix*mMatrix;\n    {{MODULE_VERTEX_MODELVIEW}}\n\n    gl_Position = projMatrix * modelViewMatrix * pos;\n}\n","light_body_directional_frag":"\nvec3 L{{LIGHT_INDEX}} = normalize(lightOP{{LIGHT_INDEX}}.position);\n#ifdef USE_ENVIRONMENT_LIGHTING\ndirectLighting += evaluateLighting(lightOP{{LIGHT_INDEX}}, L{{LIGHT_INDEX}}, FragPos, V, N, albedo, specK, NdotV, F0, envBRDF.y, AO, false);\n#else\ndirectLighting += evaluateLighting(lightOP{{LIGHT_INDEX}}, L{{LIGHT_INDEX}}, FragPos, V, N, albedo, specK, NdotV, F0, AO, false);\n#endif\n","light_body_point_frag":"\nvec3 L{{LIGHT_INDEX}} = normalize(lightOP{{LIGHT_INDEX}}.position - FragPos.xyz);\n#ifdef USE_ENVIRONMENT_LIGHTING\ndirectLighting += evaluateLighting(lightOP{{LIGHT_INDEX}}, L{{LIGHT_INDEX}}, FragPos, V, N, albedo, specK, NdotV, F0, envBRDF.y, AO, true);\n#else\ndirectLighting += evaluateLighting(lightOP{{LIGHT_INDEX}}, L{{LIGHT_INDEX}}, FragPos, V, N, albedo, specK, NdotV, F0, AO, true);\n#endif\n","light_body_spot_frag":"\nvec3 L{{LIGHT_INDEX}} = normalize(lightOP{{LIGHT_INDEX}}.position - FragPos.xyz);\nfloat spotIntensity{{LIGHT_INDEX}} = CalculateSpotLightEffect(\n    lightOP{{LIGHT_INDEX}}.position, lightOP{{LIGHT_INDEX}}.conePointAt, lightOP{{LIGHT_INDEX}}.spotProperties.COSCONEANGLE,\n    lightOP{{LIGHT_INDEX}}.spotProperties.COSCONEANGLEINNER, lightOP{{LIGHT_INDEX}}.spotProperties.SPOTEXPONENT,\n    L{{LIGHT_INDEX}}\n);\n#ifdef USE_ENVIRONMENT_LIGHTING\ndirectLighting += evaluateLighting(lightOP{{LIGHT_INDEX}}, L{{LIGHT_INDEX}}, FragPos, V, N, albedo, specK, NdotV, F0, envBRDF.y, AO * spotIntensity{{LIGHT_INDEX}}, true);\n#else\ndirectLighting += evaluateLighting(lightOP{{LIGHT_INDEX}}, L{{LIGHT_INDEX}}, FragPos, V, N, albedo, specK, NdotV, F0, AO * spotIntensity{{LIGHT_INDEX}}, true);\n#endif\n","light_head_frag":"UNI Light lightOP{{LIGHT_INDEX}};\n","light_includes_frag":"#ifndef PI\n#define PI 3.14159265359\n#endif\n\n// from https://github.com/google/filament/blob/036bfa9b20d730bb8e5852ed449b024570167648/shaders/src/brdf.fs\n// modified to fit variable names / structure\nfloat F_Schlick(float f0, float f90, float VoH)\n{\n    return f0 + (f90 - f0) * pow(1.0 - VoH, 5.0);\n}\nvec3 F_Schlick(const vec3 f0, float VoH)\n{\n    float f = pow(1.0 - VoH, 5.0);\n    return f + f0 * (1.0 - f);\n}\nfloat Fd_Burley(float roughness, float NoV, float NoL, float LoH)\n{\n    // Burley 2012, \"Physically-Based Shading at Disney\"\n    float f90 = 0.5 + 2.0 * roughness * LoH * LoH;\n    float lightScatter = F_Schlick(1.0, f90, NoL);\n    float viewScatter  = F_Schlick(1.0, f90, NoV);\n    return lightScatter * viewScatter * (1.0 / PI);\n}\nfloat D_GGX(float roughness, float NoH, const vec3 h)\n{\n    float oneMinusNoHSquared = 1.0 - NoH * NoH;\n\n    float a = NoH * roughness;\n    float k = roughness / (oneMinusNoHSquared + a * a);\n    float d = k * k * (1.0 / PI);\n    return clamp(d, 0.0, 1.0);\n}\nfloat V_SmithGGXCorrelated(float roughness, float NoV, float NoL)\n{\n    // Heitz 2014, \"Understanding the Masking-Shadowing Function in Microfacet-Based BRDFs\"\n    float a2 = roughness * roughness;\n    // TODO: lambdaV can be pre-computed for all the lights, it should be moved out of this function\n    float lambdaV = NoL * sqrt((NoV - a2 * NoV) * NoV + a2);\n    float lambdaL = NoV * sqrt((NoL - a2 * NoL) * NoL + a2);\n    float v = 0.5 / (lambdaV + lambdaL);\n    // a2=0 => v = 1 / 4*NoL*NoV   => min=1/4, max=+inf\n    // a2=1 => v = 1 / 2*(NoL+NoV) => min=1/4, max=+inf\n    // clamp to the maximum value representable in mediump\n    return clamp(v, 0.0, 1.0);\n}\n// from https://github.com/google/filament/blob/73e339b05d67749e3b1d1d243650441162c10f8a/shaders/src/light_punctual.fs\n// modified to fit variable names\nfloat getSquareFalloffAttenuation(float distanceSquare, float falloff)\n{\n    float factor = distanceSquare * falloff;\n    float smoothFactor = clamp(1.0 - factor * factor, 0.0, 1.0);\n    // We would normally divide by the square distance here\n    // but we do it at the call site\n    return smoothFactor * smoothFactor;\n}\n\nfloat getDistanceAttenuation(vec3 posToLight, float falloff, vec3 V, float volume)\n{\n    float distanceSquare = dot(posToLight, posToLight);\n    float attenuation = getSquareFalloffAttenuation(distanceSquare, falloff);\n    // light far attenuation\n    float d = dot(V, V);\n    float f = 100.0; // CONFIG_Z_LIGHT_FAR, ttps://github.com/google/filament/blob/df6a100fcba66d9c99328a49d41fe3adecc0165d/filament/src/details/Engine.h\n    vec2 lightFarAttenuationParams = 0.5 * vec2(10.0, 10.0 / (f * f));\n    attenuation *= clamp(lightFarAttenuationParams.x - d * lightFarAttenuationParams.y, 0.0, 1.0);\n    // Assume a punctual light occupies a min volume of 1cm to avoid a division by 0\n    return attenuation / max(distanceSquare, max(1e-4, volume));\n}\n\n#ifdef USE_CLEAR_COAT\n// from https://github.com/google/filament/blob/73e339b05d67749e3b1d1d243650441162c10f8a/shaders/src/shading_model_standard.fs\n// modified to fit variable names / structure\nfloat clearCoatLobe(vec3 shading_clearCoatNormal, vec3 h, float LoH, float CCSpecK)\n{\n    float clearCoatNoH = clamp(dot(shading_clearCoatNormal, h), 0.0, 1.0);\n\n    // clear coat specular lobe\n    float D = D_GGX(CCSpecK, clearCoatNoH, h);\n    // from https://github.com/google/filament/blob/036bfa9b20d730bb8e5852ed449b024570167648/shaders/src/brdf.fs\n    float V = clamp(0.25 / (LoH * LoH), 0.0, 1.0);\n    float F = F_Schlick(0.04, 1.0, LoH); // fix IOR to 1.5\n\n    return D * V * F;\n}\n#endif\n\n#ifdef USE_ENVIRONMENT_LIGHTING\nvec3 evaluateLighting(Light light, vec3 L, vec4 FragPos, vec3 V, vec3 N, vec3 albedo, float specK, float NdotV, vec3 F0, float envBRDFY, float AO, bool hasFalloff)\n#else\nvec3 evaluateLighting(Light light, vec3 L, vec4 FragPos, vec3 V, vec3 N, vec3 albedo, float specK, float NdotV, vec3 F0, float AO, bool hasFalloff)\n#endif\n{\n    vec3 directLightingResult = vec3(0.0);\n    if (light.castLight == 1)\n    {\n        specK = max(0.08, specK);\n        // from https://github.com/google/filament/blob/73e339b05d67749e3b1d1d243650441162c10f8a/shaders/src/shading_model_standard.fs\n        // modified to fit variable names / structure\n        vec3 H = normalize(V + L);\n\n        float NdotL = clamp(dot(N, L), 0.0, 1.0);\n        float NdotH = clamp(dot(N, H), 0.0, 1.0);\n        float LdotH = clamp(dot(L, H), 0.0, 1.0);\n\n        vec3 Fd = albedo * Fd_Burley(specK, NdotV, NdotL, LdotH);\n\n        float D  = D_GGX(specK, NdotH, H);\n        float V2 = V_SmithGGXCorrelated(specK, NdotV, NdotL);\n        vec3  F  = F_Schlick(F0, LdotH);\n\n        // TODO: modify this with the radius\n        vec3 Fr = (D * V2) * F;\n\n        #ifdef USE_ENVIRONMENT_LIGHTING\n        vec3 directLighting = Fd + Fr * (1.0 + F0 * (1.0 / envBRDFY - 1.0));\n        #else\n        vec3 directLighting = Fd + Fr;\n        #endif\n\n        float attenuation = getDistanceAttenuation(L, hasFalloff ? light.lightProperties.FALLOFF : 0.0, V, light.lightProperties.RADIUS);\n\n        directLightingResult = (directLighting * light.color) *\n                          (light.lightProperties.INTENSITY * attenuation * NdotL * AO);\n\n        #ifdef USE_CLEAR_COAT\n        directLightingResult += clearCoatLobe(normM, H, LdotH, _ClearCoatRoughness);\n        #endif\n    }\n    return directLightingResult;\n}\n\n// from phong OP to make sure the light parameters change lighting similar to what people are used to\nfloat CalculateSpotLightEffect(vec3 lightPosition, vec3 conePointAt, float cosConeAngle, float cosConeAngleInner, float spotExponent, vec3 lightDirection) {\n    vec3 spotLightDirection = normalize(lightPosition-conePointAt);\n    float spotAngle = dot(-lightDirection, spotLightDirection);\n    float epsilon = cosConeAngle - cosConeAngleInner;\n\n    float spotIntensity = clamp((spotAngle - cosConeAngle)/epsilon, 0.0, 1.0);\n    spotIntensity = pow(spotIntensity, max(0.01, spotExponent));\n\n    return max(0., spotIntensity);\n}\n",};
// utility
const cgl = op.patch.cgl;
// inputs
const inTrigger = op.inTrigger("render");

const inDiffuseR = op.inFloat("R", Math.random());
const inDiffuseG = op.inFloat("G", Math.random());
const inDiffuseB = op.inFloat("B", Math.random());
const inDiffuseA = op.inFloatSlider("A", 1);
const diffuseColors = [inDiffuseR, inDiffuseG, inDiffuseB, inDiffuseA];
op.setPortGroup("Diffuse Color", diffuseColors);

const inRoughness = op.inFloatSlider("Roughness", 0.5);
const inMetalness = op.inFloatSlider("Metalness", 0.0);
const inAlphaMode = op.inSwitch("Alpha Mode", ["Opaque", "Masked", "Dithered", "Blend"], "Blend");

const inUseClearCoat = op.inValueBool("Use Clear Coat", false);
const inClearCoatIntensity = op.inFloatSlider("Clear Coat Intensity", 1.0);
const inClearCoatRoughness = op.inFloatSlider("Clear Coat Roughness", 0.5);
const inUseNormalMapForCC = op.inValueBool("Use Normal map for Clear Coat", false);
const inTexClearCoatNormal = op.inTexture("Clear Coat Normal map");

const inUseThinFilm = op.inValueBool("Use Thin Film", false);
const inThinFilmIntensity = op.inFloatSlider("Thin Film Intensity", 1.0);
const inThinFilmIOR = op.inFloat("Thin Film IOR", 1.3);
const inThinFilmThickness = op.inFloat("Thin Film Thickness (nm)", 600.0);

const inTFThicknessTexMin = op.inFloat("Thickness Tex Min", 300.0);
const inTFThicknessTexMax = op.inFloat("Thickness Tex Max", 600.0);

const inTonemapping = op.inSwitch("Tonemapping", ["None", "sRGB", "HejiDawson", "Photographic"], "sRGB");
const inTonemappingExposure = op.inFloat("Exposure", 1.0);

const inEmissionIntensity = op.inFloat("Emission Intensity", 1.0);
const inToggleGR = op.inBool("Disable geometric roughness", false);
const inToggleNMGR = op.inBool("Use roughness from normal map", false);
const inUseVertexColours = op.inValueBool("Use Vertex Colours", false);
const inVertexColourMode = op.inSwitch("Vertex Colour Mode", ["colour", "AORM", "AO", "R", "M", "lightmap"], "colour");
const inHeightDepth = op.inFloat("Height Intensity", 1.0);
const inUseOptimizedHeight = op.inValueBool("Faster heightmapping", false);
const inDoubleSided = op.inValueBool("Double Sided", false);

// texture inputs
const inTexIBLLUT = op.inTexture("IBL LUT");
const inTexIrradiance = op.inTexture("Diffuse Irradiance");
const inTexPrefiltered = op.inTexture("Pre-filtered envmap");
const inMipLevels = op.inInt("Num mip levels");

const inTexAlbedo = op.inTexture("Albedo");
const inTexAORM = op.inTexture("AORM");
const inTexNormal = op.inTexture("Normal map");
const inTexEmission = op.inTexture("Emission");
const inTexHeight = op.inTexture("Height");
const inLightmap = op.inTexture("Lightmap");
const inTexThinFilm = op.inTexture("Thin Film");

const inDiffuseIntensity = op.inFloat("Diffuse Intensity", 1.0);
const inSpecularIntensity = op.inFloat("Specular Intensity", 1.0);
const inLightmapRGBE = op.inBool("Lightmap is RGBE", false);

const inLightmapIntensity = op.inFloat("Lightmap Intensity", 1.0);

const inTexTransRepeatX = op.inValue("Texture RepeatX", 1);
const inTexTransRepeatY = op.inValue("Texture RepeatY", 1);
const inTexTransOffsetX = op.inValue("Texture Offset X", 0);
const inTexTransOffsetY = op.inValue("Texture Offset Y", 0);

const inMulAlbedo = op.inValueBool("Multiply Texture Color", false);
const inTexFlip = op.inBool("Flip Textures");
const inGammaEnc = op.inBool("Gamma encoded");

inTrigger.onTriggered = doRender;

// outputs
const outTrigger = op.outTrigger("Next");
const shaderOut = op.outObject("Shader", null, "shader");
shaderOut.ignoreValueSerialize = true;
// UI stuff
op.toWorkPortsNeedToBeLinked(inTrigger);
op.toWorkShouldNotBeChild("Ops.Gl.TextureEffects.ImageCompose", CABLES.OP_PORT_TYPE_FUNCTION);

inDiffuseR.setUiAttribs({ "colorPick": true });
op.setPortGroup("Shader Parameters", [inRoughness, inMetalness, inAlphaMode]);
op.setPortGroup("Advanced Shader Parameters", [inEmissionIntensity, inToggleGR, inToggleNMGR, inUseVertexColours, inVertexColourMode, inHeightDepth, inUseOptimizedHeight, inDoubleSided]);
op.setPortGroup("Textures", [inTexAlbedo, inTexAORM, inTexNormal, inTexEmission, inTexHeight, inLightmap, inTexThinFilm]);
op.setPortGroup("Lighting", [inDiffuseIntensity, inSpecularIntensity, inLightmapIntensity, inLightmapRGBE, inTexIBLLUT, inTexIrradiance, inTexPrefiltered, inMipLevels]);
op.setPortGroup("Tonemapping", [inTonemapping, inTonemappingExposure]);
op.setPortGroup("Clear Coat", [inUseClearCoat, inClearCoatIntensity, inClearCoatRoughness, inUseNormalMapForCC, inTexClearCoatNormal]);
op.setPortGroup("Thin Film Iridescence", [inUseThinFilm, inThinFilmIntensity, inThinFilmIOR, inThinFilmThickness, inTFThicknessTexMin, inTFThicknessTexMax]);
// globals
let PBRShader = new CGL.Shader(cgl, "PBRShader", this);
PBRShader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG", "MODULE_VERTEX_MODELVIEW"]);

// light sources (except IBL)
let PBRLightStack = [];
const lightUniforms = [];
const LIGHT_INDEX_REGEX = new RegExp("{{LIGHT_INDEX}}", "g");
const FRAGMENT_HEAD_REGEX = new RegExp("{{PBR_FRAGMENT_HEAD}}", "g");
const FRAGMENT_BODY_REGEX = new RegExp("{{PBR_FRAGMENT_BODY}}", "g");
const lightFragmentHead = attachments.light_head_frag;
const lightFragmentBodies = {
    "point": attachments.light_body_point_frag,
    "directional": attachments.light_body_directional_frag,
    "spot": attachments.light_body_spot_frag,
};
const createLightFragmentHead = (n) => { return lightFragmentHead.replace("{{LIGHT_INDEX}}", n); };
const createLightFragmentBody = (n, type) =>
{ return (lightFragmentBodies[type] || "").replace(LIGHT_INDEX_REGEX, n); };
let currentLightCount = -1;
const defaultLightStack = [{
    "type": "point",
    "position": [5, 5, 5],
    "color": [1, 1, 1],
    "specular": [1, 1, 1],
    "intensity": 120,
    "attenuation": 0,
    "falloff": 0.5,
    "radius": 60,
    "castLight": 1,
    "nearFar": [0.01, 100],

}];

if (cgl.glVersion == 1)
{
    if (!cgl.gl.getExtension("EXT_shader_texture_lod"))
    {
        op.log("no EXT_shader_texture_lod texture extension");
        throw "no EXT_shader_texture_lod texture extension";
    }
    else
    {
        PBRShader.enableExtension("GL_EXT_shader_texture_lod");
        cgl.gl.getExtension("OES_texture_float");
        cgl.gl.getExtension("OES_texture_float_linear");
        cgl.gl.getExtension("OES_texture_half_float");
        cgl.gl.getExtension("OES_texture_half_float_linear");

        PBRShader.enableExtension("GL_OES_standard_derivatives");
        PBRShader.enableExtension("GL_OES_texture_float");
        PBRShader.enableExtension("GL_OES_texture_float_linear");
        PBRShader.enableExtension("GL_OES_texture_half_float");
        PBRShader.enableExtension("GL_OES_texture_half_float_linear");
    }
}

buildShader();
// uniforms

const inAlbedoUniform = new CGL.Uniform(PBRShader, "t", "_AlbedoMap", -1);
const inAORMUniform = new CGL.Uniform(PBRShader, "t", "_AORMMap", -2);
const inNormalUniform = new CGL.Uniform(PBRShader, "t", "_NormalMap");
const inEmissionUniform = new CGL.Uniform(PBRShader, "t", "_EmissionMap");
const inCCNormalUniform = new CGL.Uniform(PBRShader, "t", "_CCNormalMap");
const inIBLLUTUniform = new CGL.Uniform(PBRShader, "t", "IBL_BRDF_LUT");
const inIrradianceUniform = new CGL.Uniform(PBRShader, "tc", "_irradiance", 1);
const inPrefilteredUniform = new CGL.Uniform(PBRShader, "tc", "_prefilteredEnvironmentColour", 1);
const inMipLevelsUniform = new CGL.Uniform(PBRShader, "f", "MAX_REFLECTION_LOD", 0);

const inTonemappingExposureUniform = new CGL.Uniform(PBRShader, "f", "tonemappingExposure", inTonemappingExposure);
const inDiffuseIntensityUniform = new CGL.Uniform(PBRShader, "f", "diffuseIntensity", inDiffuseIntensity);
const inSpecularIntensityUniform = new CGL.Uniform(PBRShader, "f", "specularIntensity", inSpecularIntensity);
const inIntensity = new CGL.Uniform(PBRShader, "f", "envIntensity", 1);

const inHeightUniform = new CGL.Uniform(PBRShader, "t", "_HeightMap");
const inLightmapUniform = new CGL.Uniform(PBRShader, "t", "_Lightmap");
const inLightmapIntensityUniform = new CGL.Uniform(PBRShader, "f", "lightmapIntensity", inLightmapIntensity);
const inTexThinFilmUniform = new CGL.Uniform(PBRShader, "t", "_ThinFilmMap");

const inDiffuseColor = new CGL.Uniform(PBRShader, "4f", "_Albedo", inDiffuseR, inDiffuseG, inDiffuseB, inDiffuseA);
const inRoughnessUniform = new CGL.Uniform(PBRShader, "f", "_Roughness", inRoughness);
const inMetalnessUniform = new CGL.Uniform(PBRShader, "f", "_Metalness", inMetalness);
const inHeightDepthUniform = new CGL.Uniform(PBRShader, "f", "_HeightDepth", inHeightDepth);
const inClearCoatIntensityUniform = new CGL.Uniform(PBRShader, "f", "_ClearCoatIntensity", inClearCoatIntensity);
const inClearCoatRoughnessUniform = new CGL.Uniform(PBRShader, "f", "_ClearCoatRoughness", inClearCoatRoughness);
const inEmissionIntensityUniform = new CGL.Uniform(PBRShader, "f", "_EmissionIntensity", inEmissionIntensity);

const inThinFilmIntensityUniform = new CGL.Uniform(PBRShader, "f", "_ThinFilmIntensity", inThinFilmIntensity);
const inThinFilmIORUniform = new CGL.Uniform(PBRShader, "f", "_ThinFilmIOR", inThinFilmIOR);
const inThinFilmThicknessUniform = new CGL.Uniform(PBRShader, "f", "_ThinFilmThickness", inThinFilmThickness);

const inTFThicknessTexMinUniform = new CGL.Uniform(PBRShader, "f", "_TFThicknessTexMin", inTFThicknessTexMin);
const inTFThicknessTexMaxUniform = new CGL.Uniform(PBRShader, "f", "_TFThicknessTexMax", inTFThicknessTexMax);
const inUnlitUniform = new CGL.Uniform(PBRShader, "f", "_Unlit", 0);

// const inEmissiveColorUniform = new CGL.Uniform(PBRShader, "3f", "_EmissionColor", [0, 0, 0]);

const inPCOrigin = new CGL.Uniform(PBRShader, "3f", "_PCOrigin", [0, 0, 0]);
const inPCboxMin = new CGL.Uniform(PBRShader, "3f", "_PCboxMin", [-1, -1, -1]);
const inPCboxMax = new CGL.Uniform(PBRShader, "3f", "_PCboxMax", [1, 1, 1]);
const uniTexTrans = PBRShader.addUniformFrag("4f", "texTransform", inTexTransRepeatX, inTexTransRepeatY, inTexTransOffsetX, inTexTransOffsetY);

PBRShader.materialPropUniforms = {
    "diffuseTexture": inAlbedoUniform,
    "normalTexture": inNormalUniform,
    "metalRoughnessTexture": inAORMUniform,
    "diffuseColor": inDiffuseColor,
    "pbrMetalness": inMetalnessUniform,
    "pbrMetalness": inMetalnessUniform,
    "pbrRoughness": inRoughnessUniform,
    "occlusionTexture": inLightmapUniform,
    "lightmapTexture": inLightmapUniform,
    "unlit": inUnlitUniform,
    "texTransform": uniTexTrans
};
PBRShader.uniformColorDiffuse = inDiffuseColor; // remove later... backward compat to gltf4 ...
PBRShader.uniformPbrMetalness = inMetalnessUniform; // remove later... backward compat to gltf4 ...
PBRShader.uniformPbrRoughness = inRoughnessUniform; // remove later... backward compat to gltf4 ...

inTexPrefiltered.onChange = updateIBLTexDefines;

inTexAORM.onChange =
    inMulAlbedo.onChange =
    inDoubleSided.onChange =
    inLightmapRGBE.onChange =
    inUseNormalMapForCC.onChange =
    inUseClearCoat.onChange =
    inTexClearCoatNormal.onChange =
    inTexAlbedo.onChange =
    inTexNormal.onChange =
    inTexEmission.onChange =
    inTexHeight.onChange =
    inAlphaMode.onChange =
    inToggleNMGR.onChange =
    inTonemapping.onChange =
    inLightmap.onChange =
    inTexThinFilm.onChange =
    inUseOptimizedHeight.onChange =
    inUseVertexColours.onChange =
    inToggleGR.onChange =
    inUseThinFilm.onChange =
    inTexFlip.onChange =
    inGammaEnc.onChange =
    inVertexColourMode.onChange = updateDefines;

function updateDefines()
{
    PBRShader.toggleDefine("MUL_ALBEDO", inMulAlbedo.get());
    PBRShader.toggleDefine("DOUBLE_SIDED", inDoubleSided.get());
    PBRShader.toggleDefine("USE_OPTIMIZED_HEIGHT", inUseOptimizedHeight.get());
    PBRShader.toggleDefine("USE_CLEAR_COAT", inUseClearCoat.get());
    PBRShader.toggleDefine("USE_NORMAL_MAP_FOR_CC", inUseNormalMapForCC.get());
    PBRShader.toggleDefine("USE_CC_NORMAL_MAP", inTexClearCoatNormal.isLinked());
    PBRShader.toggleDefine("LIGHTMAP_IS_RGBE", inLightmapRGBE.get());
    PBRShader.toggleDefine("USE_LIGHTMAP", inLightmap.isLinked() || inVertexColourMode.get() === "lightmap");
    PBRShader.toggleDefine("USE_NORMAL_TEX", inTexNormal.isLinked());
    PBRShader.toggleDefine("USE_HEIGHT_TEX", inTexHeight.isLinked());
    PBRShader.toggleDefine("DONT_USE_NMGR", inToggleNMGR.get());
    PBRShader.toggleDefine("DONT_USE_GR", inToggleGR.get());
    PBRShader.toggleDefine("USE_THIN_FILM", inUseThinFilm.get());
    PBRShader.toggleDefine("USE_EMISSION", inTexEmission.get());
    PBRShader.toggleDefine("USE_THIN_FILM_MAP", inTexThinFilm.get());
    PBRShader.toggleDefine("FLIP_TEX", inTexFlip.get());
    PBRShader.toggleDefine("GAMMAENC", inGammaEnc.get());

    // VERTEX_COLORS
    PBRShader.toggleDefine("VCOL_COLOUR", inVertexColourMode.get() === "colour");
    PBRShader.toggleDefine("VCOL_AORM", inVertexColourMode.get() === "AORM");
    PBRShader.toggleDefine("VCOL_AO", inVertexColourMode.get() === "AO");
    PBRShader.toggleDefine("VCOL_R", inVertexColourMode.get() === "R");
    PBRShader.toggleDefine("VCOL_M", inVertexColourMode.get() === "M");
    PBRShader.toggleDefine("VCOL_LIGHTMAP", inVertexColourMode.get() === "lightmap");

    // ALBEDO TEX
    PBRShader.toggleDefine("USE_ALBEDO_TEX", inTexAlbedo.get());
    PBRShader.toggleDefine("ALBEDO_SRGB", inTexAlbedo.get() && inTexAlbedo.get().pixelFormat == "SRGBA 8bit ubyte");
    // inDiffuseR.setUiAttribs({ "greyout": inTexAlbedo.isLinked() });
    // inDiffuseG.setUiAttribs({ "greyout": inTexAlbedo.isLinked() });
    // inDiffuseB.setUiAttribs({ "greyout": inTexAlbedo.isLinked() });
    // inDiffuseA.setUiAttribs({ "greyout": inTexAlbedo.isLinked() });

    // AORM
    PBRShader.toggleDefine("USE_AORM_TEX", inTexAORM.get());
    inRoughness.setUiAttribs({ "greyout": inTexAORM.isLinked() });
    inMetalness.setUiAttribs({ "greyout": inTexAORM.isLinked() });

    // lightmaps
    PBRShader.toggleDefine("VERTEX_COLORS", inUseVertexColours.get());

    if (!inUseVertexColours.get())
    {
        PBRShader.toggleDefine("USE_LIGHTMAP", inLightmap.get());
    }
    else
    {
        if (inVertexColourMode.get() === "lightmap")
        {
            PBRShader.define("USE_LIGHTMAP");
        }
    }

    // alpha mode
    PBRShader.toggleDefine("ALPHA_MASKED", inAlphaMode.get() === "Masked");
    PBRShader.toggleDefine("ALPHA_DITHERED", inAlphaMode.get() === "Dithered");
    PBRShader.toggleDefine("ALPHA_BLEND", inAlphaMode.get() === "Blend");

    // tonemapping
    PBRShader.toggleDefine("TONEMAP_None", inTonemapping.get() === "None");
    PBRShader.toggleDefine("TONEMAP_sRGB", inTonemapping.get() === "sRGB");
    PBRShader.toggleDefine("TONEMAP_HejiDawson", inTonemapping.get() === "HejiDawson");
    PBRShader.toggleDefine("TONEMAP_Photographic", inTonemapping.get() === "Photographic");
}

updateDefines();

function setEnvironmentLighting(enabled)
{
    PBRShader.toggleDefine("USE_ENVIRONMENT_LIGHTING", enabled);
}

function updateIBLTexDefines()
{
    inMipLevels.setUiAttribs({ "greyout": !inTexPrefiltered.get() });
}

function updateLightUniforms()
{
    for (let i = 0; i < PBRLightStack.length; i += 1)
    {
        const light = PBRLightStack[i];
        light.isUsed = true;

        lightUniforms[i].position.setValue(light.position);
        lightUniforms[i].color.setValue(light.color);
        lightUniforms[i].specular.setValue(light.specular);

        lightUniforms[i].lightProperties.setValue([
            light.intensity,
            light.attenuation,
            light.falloff,
            light.radius,
        ]);

        lightUniforms[i].conePointAt.setValue(light.conePointAt);
        lightUniforms[i].spotProperties.setValue([
            light.cosConeAngle,
            light.cosConeAngleInner,
            light.spotExponent,
        ]);

        lightUniforms[i].castLight.setValue(light.castLight);
    }
}

function buildShader()
{
    const vertexShader = attachments.BasicPBR_vert;
    const lightIncludes = attachments.light_includes_frag;
    let fragmentShader = attachments.BasicPBR_frag;

    let fragmentHead = "";
    let fragmentBody = "";

    if (PBRLightStack.length > 0)
    {
        fragmentHead = fragmentHead.concat(lightIncludes);
    }

    for (let i = 0; i < PBRLightStack.length; i += 1)
    {
        const light = PBRLightStack[i];
        const type = light.type;

        fragmentHead = fragmentHead.concat(createLightFragmentHead(i) || "");
        fragmentBody = fragmentBody.concat(createLightFragmentBody(i, light.type) || "");
    }

    fragmentShader = fragmentShader.replace(FRAGMENT_HEAD_REGEX, fragmentHead || "");
    fragmentShader = fragmentShader.replace(FRAGMENT_BODY_REGEX, fragmentBody || "");

    PBRShader.setSource(vertexShader, fragmentShader);
    shaderOut.setRef(PBRShader);

    for (let i = 0; i < PBRLightStack.length; i += 1)
    {
        lightUniforms[i] = null;
        if (!lightUniforms[i])
        {
            lightUniforms[i] = {
                "color": new CGL.Uniform(PBRShader, "3f", "lightOP" + i + ".color", [1, 1, 1]),
                "position": new CGL.Uniform(PBRShader, "3f", "lightOP" + i + ".position", [0, 11, 0]),
                "specular": new CGL.Uniform(PBRShader, "3f", "lightOP" + i + ".specular", [1, 1, 1]),
                "lightProperties": new CGL.Uniform(PBRShader, "4f", "lightOP" + i + ".lightProperties", [1, 1, 1, 1]),

                "conePointAt": new CGL.Uniform(PBRShader, "3f", "lightOP" + i + ".conePointAt", vec3.create()),
                "spotProperties": new CGL.Uniform(PBRShader, "3f", "lightOP" + i + ".spotProperties", [0, 0, 0, 0]),
                "castLight": new CGL.Uniform(PBRShader, "i", "lightOP" + i + ".castLight", 1),

            };
        }
    }
}

function updateLights()
{
    if (cgl.tempData.lightStack)
    {
        let changed = currentLightCount !== cgl.tempData.lightStack.length;

        if (!changed)
        {
            for (let i = 0; i < cgl.tempData.lightStack.length; i++)
            {
                if (PBRLightStack[i] != cgl.tempData.lightStack[i])
                {
                    changed = true;
                    break;
                }
            }
        }

        if (changed)
        {
            PBRLightStack.length = 0;
            for (let i = 0; i < cgl.tempData.lightStack.length; i++)
                PBRLightStack[i] = cgl.tempData.lightStack[i];

            buildShader();

            currentLightCount = cgl.tempData.lightStack.length;
        }
    }
}

function doRender()
{
    if (!PBRShader)buildShader();
    cgl.pushShader(PBRShader);
    let useDefaultLight = false;

    PBRShader.popTextures();

    let numLights = 0;
    if (cgl.tempData.lightStack)numLights = cgl.tempData.lightStack.length;

    if ((!cgl.tempData.pbrEnvStack || cgl.tempData.pbrEnvStack.length == 0) && !inLightmap.isLinked() && numLights == 0)
    {
        useDefaultLight = true;
        op.setUiError("deflight", "Default light is enabled. Please add lights or PBREnvironmentLights to your patch to make this warning disappear.", 1);
    }
    else op.setUiError("deflight", null);

    if (cgl.tempData.pbrEnvStack &&
        cgl.tempData.pbrEnvStack.length > 0 &&
        cgl.tempData.pbrEnvStack[cgl.tempData.pbrEnvStack.length - 1].texIBLLUT.tex &&
        cgl.tempData.pbrEnvStack[cgl.tempData.pbrEnvStack.length - 1].texDiffIrr.tex &&
        cgl.tempData.pbrEnvStack[cgl.tempData.pbrEnvStack.length - 1].texPreFiltered.tex)
    {
        const pbrEnv = cgl.tempData.pbrEnvStack[cgl.tempData.pbrEnvStack.length - 1];

        inIntensity.setValue(pbrEnv.intensity);

        PBRShader.pushTexture(inIBLLUTUniform, pbrEnv.texIBLLUT.tex);
        PBRShader.pushTexture(inIrradianceUniform, pbrEnv.texDiffIrr.tex, cgl.gl.TEXTURE_CUBE_MAP);
        PBRShader.pushTexture(inPrefilteredUniform, pbrEnv.texPreFiltered.tex, cgl.gl.TEXTURE_CUBE_MAP);
        inMipLevelsUniform.setValue(pbrEnv.texPreFilteredMipLevels || 7);

        PBRShader.toggleDefine("USE_PARALLAX_CORRECTION", pbrEnv.UseParallaxCorrection);

        if (pbrEnv.UseParallaxCorrection)
        {
            inPCOrigin.setValue(pbrEnv.PCOrigin);
            inPCboxMin.setValue(pbrEnv.PCboxMin);
            inPCboxMax.setValue(pbrEnv.PCboxMax);
        }

        setEnvironmentLighting(true);
    }
    else
    {
        setEnvironmentLighting(false);
    }

    if (useDefaultLight)
    {
        const iViewMatrix = mat4.create();
        mat4.invert(iViewMatrix, cgl.vMatrix);

        defaultLightStack[0].position = [iViewMatrix[12], iViewMatrix[13], iViewMatrix[14]];
        cgl.tempData.lightStack = defaultLightStack;
    }

    if (inTexIBLLUT.get())
    {
        setEnvironmentLighting(true);
        PBRShader.pushTexture(inIBLLUTUniform, inTexIBLLUT.get().tex);
        inMipLevelsUniform.setValue(inMipLevels.get());
        if (inTexIrradiance.get()) PBRShader.pushTexture(inIrradianceUniform, inTexIrradiance.get().cubemap, cgl.gl.TEXTURE_CUBE_MAP);
        if (inTexPrefiltered.get()) PBRShader.pushTexture(inPrefilteredUniform, inTexPrefiltered.get().cubemap, cgl.gl.TEXTURE_CUBE_MAP);
    }

    if (inTexAlbedo.get()) PBRShader.pushTexture(inAlbedoUniform, inTexAlbedo.get().tex);
    if (inTexAORM.get()) PBRShader.pushTexture(inAORMUniform, inTexAORM.get().tex);
    if (inTexNormal.get()) PBRShader.pushTexture(inNormalUniform, inTexNormal.get().tex);
    if (inTexEmission.get()) PBRShader.pushTexture(inEmissionUniform, inTexEmission.get().tex);
    if (inTexHeight.get()) PBRShader.pushTexture(inHeightUniform, inTexHeight.get().tex);
    if (inLightmap.get()) PBRShader.pushTexture(inLightmapUniform, inLightmap.get().tex);
    if (inTexClearCoatNormal.get()) PBRShader.pushTexture(inCCNormalUniform, inTexClearCoatNormal.get().tex);
    if (inTexThinFilm.get()) PBRShader.pushTexture(inTexThinFilmUniform, inTexThinFilm.get().tex);

    updateLights();
    updateLightUniforms();

    outTrigger.trigger();
    cgl.popShader();

    if (useDefaultLight) cgl.tempData.lightStack = [];
}

}
};






// **************************************************************
// 
// Ops.Gl.Pbr.PbrEnvironmentLight
// 
// **************************************************************

Ops.Gl.Pbr.PbrEnvironmentLight= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"IBLLUT_frag":"precision highp float;\nprecision highp int;\nprecision highp sampler2D;\n\n#ifndef WEBGL1\n#define NUM_SAMPLES 1024u\n#else\n#define NUM_SAMPLES 1024\n#endif\n#define PI 3.14159265358\n\nIN vec3 P;\n{{MODULES_HEAD}}\n\n// from https://github.com/BabylonJS/Babylon.js/blob/5e6321d887637877d8b28b417410abbbeb651c6e/src/Shaders/ShadersInclude/hdrFilteringFunctions.fx\n// modified to use different syntax for a number of variables\n#if NUM_SAMPLES > 0\n    #ifndef WEBGL1\n        // https://learnopengl.com/PBR/IBL/Specular-IBL\n        // Hammersley\n        float radicalInverse_VdC(uint bits)\n        {\n            bits = (bits << 16u) | (bits >> 16u);\n            bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);\n            bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);\n            bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);\n            bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);\n            return float(bits) * 2.3283064365386963e-10; // / 0x100000000\n        }\n\n        vec2 hammersley(uint i, uint N)\n        {\n            return vec2(float(i)/float(N), radicalInverse_VdC(i));\n        }\n    #else\n        float vanDerCorpus(int n, int base)\n        {\n            float invBase = 1.0 / float(base);\n            float denom   = 1.0;\n            float result  = 0.0;\n\n            for(int i = 0; i < 32; ++i)\n            {\n                if(n > 0)\n                {\n                    denom   = mod(float(n), 2.0);\n                    result += denom * invBase;\n                    invBase = invBase / 2.0;\n                    n       = int(float(n) / 2.0);\n                }\n            }\n\n            return result;\n        }\n\n        vec2 hammersley(int i, int N)\n        {\n            return vec2(float(i)/float(N), vanDerCorpus(i, 2));\n        }\n    #endif\n\n\t// from https://github.com/BabylonJS/Babylon.js/blob/5e6321d887637877d8b28b417410abbbeb651c6e/src/Shaders/ShadersInclude/importanceSampling.fx\n\tvec3 hemisphereImportanceSampleDggx(vec2 u, float a) {\n\t\t// pdf = D(a) * cosTheta\n\t\tfloat phi = 2. * PI * u.x;\n\n\t\t// NOTE: (aa-1) == (a-1)(a+1) produces better fp accuracy\n\t\tfloat cosTheta2 = (1. - u.y) / (1. + (a + 1.) * ((a - 1.) * u.y));\n\t\tfloat cosTheta = sqrt(cosTheta2);\n\t\tfloat sinTheta = sqrt(1. - cosTheta2);\n\n\t\treturn vec3(sinTheta * cos(phi), sinTheta * sin(phi), cosTheta);\n\t}\n\n\t// from https://google.github.io/filament/Filament.md.html#toc9.5\n\t// modified to use different syntax for a number of variables\n    const float NUM_SAMPLES_FLOAT = float(NUM_SAMPLES);\n    const float NUM_SAMPLES_FLOAT_INVERSED = 1. / NUM_SAMPLES_FLOAT;\n    const float NUM_SAMPLES_FLOAT_INVERSED4 = 4. / NUM_SAMPLES_FLOAT;\n\n    float Visibility(float NdotV, float NdotL, float alphaG)\n    {\n        // from https://github.com/BabylonJS/Babylon.js/blob/5e6321d887637877d8b28b417410abbbeb651c6e/src/Shaders/ShadersInclude/pbrBRDFFunctions.fx\n        #ifdef WEBGL1\n            // Appply simplification as all squared root terms are below 1 and squared\n            float GGXV = NdotL * (NdotV * (1.0 - alphaG) + alphaG);\n            float GGXL = NdotV * (NdotL * (1.0 - alphaG) + alphaG);\n            return 0.5 / (GGXV + GGXL);\n        #else\n            float a2 = alphaG * alphaG;\n            float GGXV = NdotL * sqrt(NdotV * (NdotV - a2 * NdotV) + a2);\n            float GGXL = NdotV * sqrt(NdotL * (NdotL - a2 * NdotL) + a2);\n            return 0.5 / (GGXV + GGXL);\n        #endif\n    }\n\n\tvoid main()\n\t{\n\t    // actual implementation (not documentation) here: https://github.com/google/filament/blob/94ff2ea6b1e39d909e9066459f2ce8c2942eb876/libs/ibl/src/CubemapIBL.cpp\n\t\t{{MODULE_BEGIN_FRAG}}\n\t\tfloat NoV = P.x;\n\t\tfloat a   = P.y;\n\n\t\tvec3 V;\n\t\tV.x = sqrt(1.0 - NoV*NoV);\n\t\tV.y = 0.0;\n\t\tV.z = NoV;\n\n\t\tvec2 r = vec2(0.0);\n\n        #ifndef WEBGL1\n        for(uint i = 0u; i < NUM_SAMPLES; i++)\n        #else\n        for(int i = 0; i < NUM_SAMPLES; i++)\n        #endif\n        {\n\t\t\tvec2 Xi = hammersley(i, NUM_SAMPLES);\n\t\t\tvec3 H  = hemisphereImportanceSampleDggx(Xi, a);\n\t\t\tvec3 L  = 2.0 * dot(V, H) * H - V;\n\n\t\t\tfloat VoH = clamp(dot(V, H), 0.0, 1.0);\n\t\t\tfloat NoL = clamp(L.z, 0.0, 1.0);\n\t\t\tfloat NoH = clamp(H.z, 0.0, 1.0);\n\n\t\t\tif (NoL > 0.0) {\n\t\t\t\tfloat Gv = Visibility(NoV, NoL, a) * NoL * (VoH / NoH);\n\t\t\t\tfloat Fc = pow(1.0 - VoH, 5.0);\n\n\t\t\t\t// modified for multiscattering https://google.github.io/filament/Filament.md.html#toc5.3.4.7\n\t\t\t    r.x += Gv * Fc;\n\t\t\t\tr.y += Gv;\n\t\t\t}\n\t\t}\n\t\tr *= NUM_SAMPLES_FLOAT_INVERSED4;\n\n\t\t{{MODULE_COLOR}}\n\t\toutColor = vec4(r.x, r.y, 0.0, 1.0);\n\t}\n#endif\n","IBLLUT_vert":"precision highp float;\nprecision highp int;\nprecision highp sampler2D;\n\n{{MODULES_HEAD}}\nIN vec3 vPosition;\nOUT vec3 P;\nUNI mat4 projMatrix;\nUNI mat4 viewMatrix;\nUNI mat4 modelMatrix;\n\nvoid main()\n{\n   vec4 pos     = vec4(vPosition,  1.0);\n   mat4 mMatrix = modelMatrix;\n\n   {{MODULE_VERTEX_POSITION}}\n\n   gl_Position  = pos;\n\n   P            = (vPosition + 1.0) * 0.5;\n}\n","irradiance_frag":"precision highp float;\nprecision highp int;\nprecision highp sampler2D;\n\n\n// from https://github.com/BabylonJS/Babylon.js/blob/5e6321d887637877d8b28b417410abbbeb651c6e/src/Shaders/ShadersInclude/hdrFilteringFunctions.fx\n// modified to use different syntax for a number of variables, equirectangular projection and rgbe encoding\n{{MODULES_HEAD}}\n#ifndef WEBGL1\n#define NUM_SAMPLES 2048u\n#else\n#define NUM_SAMPLES 2048\n#endif\n#define PI 3.14159265358\n#define PI_TWO 2.*PI\n#define RECIPROCAL_PI 1./PI\n#define RECIPROCAL_PI2 RECIPROCAL_PI/2.\n\n\n#ifdef WEBGL1\n    #ifdef GL_EXT_shader_texture_lod\n        #define textureLod texture2DLodEXT\n    #endif\n#endif\n#define SAMPLETEX textureLod\n\n// set by cables\nUNI vec3 camPos;\n\nIN  vec3 FragPos;\nUNI float rotation;\nUNI vec2 filteringInfo;\nUNI sampler2D EquiCubemap;\n\nvec2 SampleSphericalMap(vec3 direction, float rotation)\n{\n    #ifndef WEBGL1\n        vec3 newDirection = normalize(direction);\n\t\tvec2 sampleUV;\n\t\tsampleUV.x = -1. * (atan( direction.z, direction.x ) * RECIPROCAL_PI2 + 0.5);\n\t\tsampleUV.y = asin( clamp(direction.y, -1., 1.) ) * RECIPROCAL_PI + 0.5;\n    #endif\n\n    #ifdef WEBGL1\n        vec3 newDirection = normalize(direction);\n\t\tvec2 sampleUV = vec2(atan(newDirection.z, newDirection.x), asin(newDirection.y+1e-6));\n        sampleUV *= vec2(-0.1591, 0.3183);\n        sampleUV += 0.5;\n    #endif\n    sampleUV.x += rotation;\n    return sampleUV * vec2(-1.,1.);\n}\n\n// https://community.khronos.org/t/addition-of-two-hdr-rgbe-values/55669\nvec4 EncodeRGBE8(vec3 rgb)\n{\n    vec4 vEncoded;\n    float maxComponent = max(max(rgb.r, rgb.g), rgb.b);\n    float fExp = ceil(log2(maxComponent));\n    vEncoded.rgb = rgb / exp2(fExp);\n    vEncoded.a = (fExp + 128.0) / 255.0;\n    return vEncoded;\n}\n// https://enkimute.github.io/hdrpng.js/\nvec3 DecodeRGBE8(vec4 rgbe)\n{\n    vec3 vDecoded = rgbe.rgb * pow(2.0, rgbe.a * 255.0 - 128.0);\n    return vDecoded;\n}\n\n// from https://github.com/BabylonJS/Babylon.js/blob/5e6321d887637877d8b28b417410abbbeb651c6e/src/Shaders/ShadersInclude/importanceSampling.fx\nvec3 hemisphereCosSample(vec2 u) {\n    // pdf = cosTheta / M_PI;\n    float phi = 2. * PI * u.x;\n\n    float cosTheta2 = 1. - u.y;\n    float cosTheta = sqrt(cosTheta2);\n    float sinTheta = sqrt(1. - cosTheta2);\n\n    return vec3(sinTheta * cos(phi), sinTheta * sin(phi), cosTheta);\n}\n\n#ifndef WEBGL1\n    // https://learnopengl.com/PBR/IBL/Specular-IBL\n    // Hammersley\n    float radicalInverse_VdC(uint bits)\n    {\n        bits = (bits << 16u) | (bits >> 16u);\n        bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);\n        bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);\n        bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);\n        bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);\n        return float(bits) * 2.3283064365386963e-10; // / 0x100000000\n    }\n\n    vec2 hammersley(uint i, uint N)\n    {\n        return vec2(float(i)/float(N), radicalInverse_VdC(i));\n    }\n#else\n    float vanDerCorpus(int n, int base)\n    {\n        float invBase = 1.0 / float(base);\n        float denom   = 1.0;\n        float result  = 0.0;\n\n        for(int i = 0; i < 32; ++i)\n        {\n            if(n > 0)\n            {\n                denom   = mod(float(n), 2.0);\n                result += denom * invBase;\n                invBase = invBase / 2.0;\n                n       = int(float(n) / 2.0);\n            }\n        }\n\n        return result;\n    }\n\n    vec2 hammersley(int i, int N)\n    {\n        return vec2(float(i)/float(N), vanDerCorpus(i, 2));\n    }\n#endif\n\n// from https://github.com/google/filament/blob/main/shaders/src/light_indirect.fs\nfloat prefilteredImportanceSampling(float ipdf, float omegaP)\n{\n    // See: \"Real-time Shading with Filtered Importance Sampling\", Jaroslav Krivanek\n    // Prefiltering doesn't work with anisotropy\n    const float numSamples = float(NUM_SAMPLES);\n    const float invNumSamples = 1.0 / float(numSamples);\n    const float K = 4.0;\n    float omegaS = invNumSamples * ipdf;\n    float mipLevel = log2(K * omegaS / omegaP) * 0.5;    // log4\n    return mipLevel;\n}\n\nconst float NUM_SAMPLES_FLOAT = float(NUM_SAMPLES);\nconst float NUM_SAMPLES_FLOAT_INVERSED = 1. / NUM_SAMPLES_FLOAT;\n\nconst float K = 4.;\n\nvoid main()\n{\n    {{MODULE_BEGIN_FRAG}}\n    vec4 col = vec4(0.0, 0.0, 0.0, 0.0);\n\n    vec3 n = normalize(FragPos);\n    vec3 tangent = normalize(cross(vec3(0.0, 0.0, 1.0), n));\n    vec3 bitangent = cross(n, tangent);\n    mat3 tbn = mat3(tangent, bitangent, n);\n\n    float maxLevel = filteringInfo.y;\n    float dim0 = filteringInfo.x;\n    float omegaP = (4. * PI) / (6. * dim0 * dim0);\n\n    #ifndef WEBGL1\n    for(uint i = 0u; i < NUM_SAMPLES; ++i)\n    #else\n    for(int i = 0; i < NUM_SAMPLES; ++i)\n    #endif\n    {\n        vec2 Xi = hammersley(i, NUM_SAMPLES);\n        vec3 Ls = hemisphereCosSample(Xi);\n\n        Ls = normalize(Ls);\n\n        vec3 Ns = vec3(0., 0., 1.);\n\n        float NoL = dot(Ns, Ls);\n\n        if (NoL > 0.) {\n            float pdf_inversed = PI / NoL;\n\n            float omegaS = NUM_SAMPLES_FLOAT_INVERSED * pdf_inversed;\n            // from https://github.com/google/filament/blob/main/shaders/src/light_indirect.fs\n            float l = log2(K * omegaS / omegaP) * 0.5;\n            float mipLevel = clamp(l + 1.0, 0.0, maxLevel);\n\n            #ifndef DONT_USE_RGBE_CUBEMAPS\n            vec3 c = DecodeRGBE8(SAMPLETEX(EquiCubemap, SampleSphericalMap(tbn * Ls, rotation), mipLevel)).rgb;\n            #else\n            vec3 c = SAMPLETEX(EquiCubemap, SampleSphericalMap(tbn * Ls, rotation), mipLevel).rgb;\n            #endif\n            col.rgb += c;\n        }\n    }\n\n    col = EncodeRGBE8(col.rgb * PI * NUM_SAMPLES_FLOAT_INVERSED);\n\n    {{MODULE_COLOR}}\n    outColor = col;\n}\n","irradiance_vert":"precision highp float;\nprecision highp int;\nprecision highp sampler2D;\n\n\n{{MODULES_HEAD}}\nIN vec3 vPosition;\nIN float attrVertIndex;\n\nOUT vec3 FragPos;\nUNI mat4 projMatrix;\nUNI mat4 viewMatrix;\nUNI mat4 modelMatrix;\n\n\nvoid main()\n{\n    FragPos     = vPosition;\n\n    {{MODULE_VERTEX_POSITION}}\n    gl_Position = projMatrix * viewMatrix * modelMatrix * vec4(vPosition, 1.0);\n    gl_Position = gl_Position.xyww;\n}\n","prefiltering_frag":"precision highp float;\nprecision highp int;\nprecision highp sampler2D;\n\n\n// from https://github.com/BabylonJS/Babylon.js/blob/5e6321d887637877d8b28b417410abbbeb651c6e/src/Shaders/ShadersInclude/hdrFilteringFunctions.fx\n// modified to use different syntax for a number of variables, equirectangular projection and rgbe encoding\n{{MODULES_HEAD}}\n#ifndef WEBGL1\n#define NUM_SAMPLES 2048u\n#else\n#define NUM_SAMPLES 2048\n#endif\n#define PI 3.14159265358\n#define PI_TWO 2.*PI\n#define RECIPROCAL_PI 1./PI\n#define RECIPROCAL_PI2 RECIPROCAL_PI/2.\n#define MINIMUMVARIANCE 0.0005\n\n\n#ifdef WEBGL1\n    #ifdef GL_EXT_shader_texture_lod\n        #define textureLod texture2DLodEXT\n    #endif\n#endif\n#define SAMPLETEX textureLod\n\nIN  vec3 FragPos;\nUNI float roughness;\nUNI float rotation;\nUNI vec2 filteringInfo;\nUNI sampler2D EquiCubemap;\n\nvec2 SampleSphericalMap(vec3 direction, float rotation)\n{\n    #ifndef WEBGL1\n        vec3 newDirection = normalize(direction);\n\t\tvec2 sampleUV;\n\t\tsampleUV.x = -1. * (atan( direction.z, direction.x ) * RECIPROCAL_PI2 + 0.5);\n\t\tsampleUV.y = asin( clamp(direction.y, -1., 1.) ) * RECIPROCAL_PI + 0.5;\n    #endif\n\n    #ifdef WEBGL1\n        vec3 newDirection = normalize(direction);\n\t\tvec2 sampleUV = vec2(atan(newDirection.z, newDirection.x), asin(newDirection.y+1e-6));\n        sampleUV *= vec2(-0.1591, 0.3183);\n        sampleUV += 0.5;\n    #endif\n    sampleUV.x += rotation;\n    return sampleUV * vec2(-1.,1.);\n}\n\n// https://community.khronos.org/t/addition-of-two-hdr-rgbe-values/55669\nvec4 EncodeRGBE8(vec3 rgb)\n{\n    vec4 vEncoded;\n    float maxComponent = max(max(rgb.r, rgb.g), rgb.b);\n    float fExp = ceil(log2(maxComponent));\n    vEncoded.rgb = rgb / exp2(fExp);\n    vEncoded.a = (fExp + 128.0) / 255.0;\n    return vEncoded;\n}\n// https://enkimute.github.io/hdrpng.js/\nvec3 DecodeRGBE8(vec4 rgbe)\n{\n    vec3 vDecoded = rgbe.rgb * pow(2.0, rgbe.a * 255.0-128.0);\n    return vDecoded;\n}\n\n// from https://github.com/BabylonJS/Babylon.js/blob/5e6321d887637877d8b28b417410abbbeb651c6e/src/Shaders/ShadersInclude/importanceSampling.fx\nvec3 hemisphereImportanceSampleDggx(vec2 u, float a) {\n    // pdf = D(a) * cosTheta\n    float phi = 2. * PI * u.x;\n\n    // NOTE: (aa-1) == (a-1)(a+1) produces better fp accuracy\n    float cosTheta2 = (1. - u.y) / (1. + (a + 1.) * ((a - 1.) * u.y));\n    float cosTheta = sqrt(cosTheta2);\n    float sinTheta = sqrt(1. - cosTheta2);\n\n    return vec3(sinTheta * cos(phi), sinTheta * sin(phi), cosTheta);\n}\n\n// from https://github.com/BabylonJS/Babylon.js/blob/5e6321d887637877d8b28b417410abbbeb651c6e/src/Shaders/ShadersInclude/pbrBRDFFunctions.fx\nfloat normalDistributionFunction_TrowbridgeReitzGGX(float NdotH, float alphaG)\n{\n    // Note: alphaG is average slope (gradient) of the normals in slope-space.\n    // It is also the (trigonometric) tangent of the median distribution value, i.e. 50% of normals have\n    // a tangent (gradient) closer to the macrosurface than this slope.\n    float a2 = alphaG * alphaG;\n    float d = NdotH * NdotH * (a2 - 1.0) + 1.0;\n    return a2 / (PI * d * d);\n}\n\n// from https://github.com/BabylonJS/Babylon.js/blob/5e6321d887637877d8b28b417410abbbeb651c6e/src/Shaders/ShadersInclude/pbrHelperFunctions.fx\nfloat convertRoughnessToAverageSlope(float roughness)\n{\n    // Calculate AlphaG as square of roughness (add epsilon to avoid numerical issues)\n    return (roughness * roughness) + MINIMUMVARIANCE;\n}\n\n\n#ifndef WEBGL1\n    // https://learnopengl.com/PBR/IBL/Specular-IBL\n    // Hammersley\n    float radicalInverse_VdC(uint bits)\n    {\n        bits = (bits << 16u) | (bits >> 16u);\n        bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);\n        bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);\n        bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);\n        bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);\n        return float(bits) * 2.3283064365386963e-10; // / 0x100000000\n    }\n\n    vec2 hammersley(uint i, uint N)\n    {\n        return vec2(float(i)/float(N), radicalInverse_VdC(i));\n    }\n#else\n    float vanDerCorpus(int n, int base)\n    {\n        float invBase = 1.0 / float(base);\n        float denom   = 1.0;\n        float result  = 0.0;\n\n        for(int i = 0; i < 32; ++i)\n        {\n            if(n > 0)\n            {\n                denom   = mod(float(n), 2.0);\n                result += denom * invBase;\n                invBase = invBase / 2.0;\n                n       = int(float(n) / 2.0);\n            }\n        }\n\n        return result;\n    }\n\n    vec2 hammersley(int i, int N)\n    {\n        return vec2(float(i)/float(N), vanDerCorpus(i, 2));\n    }\n#endif\n\nfloat log4(float x)\n{\n    return log2(x) / 2.;\n}\n\nconst float NUM_SAMPLES_FLOAT = float(NUM_SAMPLES);\nconst float NUM_SAMPLES_FLOAT_INVERSED = 1. / NUM_SAMPLES_FLOAT;\n\nconst float K = 4.;\n\nvoid main()\n{\n    {{MODULE_BEGIN_FRAG}}\n    vec3 n = normalize(FragPos);\n    float alphaG = convertRoughnessToAverageSlope(roughness);\n    vec4 result = vec4(0.);\n\n    if (alphaG == 0.)\n    {\n        result = SAMPLETEX(EquiCubemap, SampleSphericalMap(n, rotation), 0.0);\n    }\n    else\n    {\n        vec3 tangent = abs(n.z) < 0.999 ? vec3(0., 0., 1.) : vec3(1., 0., 0.);\n        tangent = normalize(cross(tangent, n));\n        vec3 bitangent = cross(n, tangent);\n        mat3 tbn = mat3(tangent, bitangent, n);\n\n        float maxLevel = filteringInfo.y;\n        float dim0 = filteringInfo.x;\n        float omegaP = (4. * PI) / (6. * dim0 * dim0);\n\n        float weight = 0.;\n        #if defined(WEBGL2)\n        for(uint i = 0u; i < NUM_SAMPLES; ++i)\n        #else\n        for(int i = 0; i < NUM_SAMPLES; ++i)\n        #endif\n        {\n            vec2 Xi = hammersley(i, NUM_SAMPLES);\n            vec3 H = hemisphereImportanceSampleDggx(Xi, alphaG);\n\n            float NoV = 1.;\n            float NoH = H.z;\n            float NoH2 = H.z * H.z;\n            float NoL = 2. * NoH2 - 1.;\n            vec3 L = vec3(2. * NoH * H.x, 2. * NoH * H.y, NoL);\n            L = normalize(L);\n\n            if (NoL > 0.)\n            {\n                float pdf_inversed = 4. / normalDistributionFunction_TrowbridgeReitzGGX(NoH, alphaG);\n\n                float omegaS = NUM_SAMPLES_FLOAT_INVERSED * pdf_inversed;\n                float l = log4(omegaS) - log4(omegaP) + log4(K);\n                float mipLevel = clamp(l, 0.0, maxLevel);\n\n                weight += NoL;\n\n                #ifndef DONT_USE_RGBE_CUBEMAPS\n                vec3 c = DecodeRGBE8(SAMPLETEX(EquiCubemap, SampleSphericalMap(tbn * L, rotation), mipLevel)).rgb;\n                #else\n                vec3 c = SAMPLETEX(EquiCubemap, SampleSphericalMap(tbn * L, rotation), mipLevel).rgb;\n                #endif\n                result.rgb += c * NoL;\n            }\n        }\n\n        result = result / weight;\n        result = EncodeRGBE8(result.rgb);\n    }\n\n    {{MODULE_COLOR}}\n    outColor = result;\n}\n","prefiltering_vert":"precision highp float;\nprecision highp int;\nprecision highp sampler2D;\n\n{{MODULES_HEAD}}\nIN vec3 vPosition;\nIN float attrVertIndex;\n\nOUT vec3 FragPos;\nUNI mat4 projMatrix;\nUNI mat4 viewMatrix;\nUNI mat4 modelMatrix;\n\n\nvoid main()\n{\n    FragPos     = vPosition;\n\n    {{MODULE_VERTEX_POSITION}}\n    gl_Position = projMatrix * viewMatrix * modelMatrix * vec4(vPosition, 1.0);\n    gl_Position = gl_Position.xyww;\n}\n",};
// utility
const cgl = op.patch.cgl;
const IS_WEBGL_1 = cgl.glVersion == 1;

const BB = new CABLES.CG.BoundingBox();
const geometry = new CGL.Geometry("unit cube");
geometry.vertices = new Float32Array([
    -1.0, 1.0, -1.0,
    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, 1.0, -1.0,
    -1.0, 1.0, -1.0,

    -1.0, -1.0, 1.0,
    -1.0, -1.0, -1.0,
    -1.0, 1.0, -1.0,
    -1.0, 1.0, -1.0,
    -1.0, 1.0, 1.0,
    -1.0, -1.0, 1.0,

    1.0, -1.0, -1.0,
    1.0, -1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, -1.0,
    1.0, -1.0, -1.0,

    -1.0, -1.0, 1.0,
    -1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, -1.0, 1.0,
    -1.0, -1.0, 1.0,

    -1.0, 1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,
    -1.0, 1.0, -1.0,

    -1.0, -1.0, -1.0,
    -1.0, -1.0, 1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0
]);
const mesh = new CGL.Mesh(cgl, geometry);
const fullscreenRectangle = CGL.MESHES.getSimpleRect(cgl, "fullscreenRectangle");
// inputs
const inTrigger = op.inTrigger("render");
const inIntensity = op.inFloatSlider("Intensity", 1);
const inCubemap = op.inTexture("RGBE Environment map");

const inIrradianceSize = op.inDropDown("Size Irradiance map", [16, 32, 64], 64);
const inPrefilteredSize = op.inDropDown("Size pre-filtered environment", [64, 128], 128);
const inIBLLUTSize = op.inDropDown("Size IBL LUT", [128, 256, 512, 1024], 256);
const inForce8bitIbl = op.inBool("Force 8bit IBL", true);
const inToggleRGBE = op.inBool("Environment map does not contain RGBE data", false);
const inRotation = op.inFloat("Rotation", 0.0);
const inUseParallaxCorrection = op.inValueBool("Use parallax correction", false);

const inPCOriginX = op.inFloat("center X", 0);
const inPCOriginY = op.inFloat("center Y", 1.8);
const inPCOriginZ = op.inFloat("center Z", 0);
const inPCboxMinX = op.inFloat("Box min X", -1);
const inPCboxMinY = op.inFloat("Box min Y", -1);
const inPCboxMinZ = op.inFloat("Box min Z", -1);
const inPCboxMaxX = op.inFloat("Box max X", 1);
const inPCboxMaxY = op.inFloat("Box max Y", 1);
const inPCboxMaxZ = op.inFloat("Box max Z", 1);

op.setPortGroup("Parallax Correction", [
    inUseParallaxCorrection,
    inPCOriginX,
    inPCOriginY,
    inPCOriginZ,
    inPCboxMinX,
    inPCboxMinY,
    inPCboxMinZ,
    inPCboxMaxX,
    inPCboxMaxY,
    inPCboxMaxZ
]);

let IrradianceSizeChanged = true;
let PrefilteredSizeChanged = true;
let IBLLUTSettingsChanged = true;
inIrradianceSize.onChange = () => { IrradianceSizeChanged = true; };
inPrefilteredSize.onChange = () => { PrefilteredSizeChanged = true; };
inIBLLUTSize.onChange =
    inForce8bitIbl.onChange = () => { IBLLUTSettingsChanged = true; };

// outputs
const outTrigger = op.outTrigger("next");

const outTexIBLLUT = op.outTexture("IBL LUT");
const outTexIrradiance = op.outTexture("cubemap (diffuse irradiance)");
const outTexPrefiltered = op.outTexture("cubemap (pre-filtered environment map)");
const outMipLevels = op.outNumber("Number of Pre-filtered mip levels");
// UI stuff
op.toWorkPortsNeedToBeLinked(inCubemap);

// globals
let irradianceFrameBuffer = null;
let PrefilteredTexture = null;
let prefilteredFrameBuffer = null;
let iblLutFrameBuffer = null;
let maxMipLevels = null;
const pbrEnv = {};
const IrradianceShader = new CGL.Shader(cgl, "IrradianceShader");
const PrefilteringShader = new CGL.Shader(cgl, "PrefilteringShader");
IrradianceShader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
PrefilteringShader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);

if (cgl.glVersion == 1)
{
    if (!cgl.gl.getExtension("EXT_shader_texture_lod"))
    {
        op.log("no EXT_shader_texture_lod texture extension");
        throw "no EXT_shader_texture_lod texture extension";
    }
    else
    {
        IrradianceShader.enableExtension("GL_EXT_shader_texture_lod");
        PrefilteringShader.enableExtension("GL_EXT_shader_texture_lod");
        cgl.gl.getExtension("OES_texture_float");
        cgl.gl.getExtension("OES_texture_float_linear");
        cgl.gl.getExtension("OES_texture_half_float");
        cgl.gl.getExtension("OES_texture_half_float_linear");

        cgl.gl.getExtension("WEBGL_color_buffer_float");

        IrradianceShader.enableExtension("GL_OES_standard_derivatives");
        IrradianceShader.enableExtension("GL_OES_texture_float");
        IrradianceShader.enableExtension("GL_OES_texture_float_linear");
        IrradianceShader.enableExtension("GL_OES_texture_half_float");
        IrradianceShader.enableExtension("GL_OES_texture_half_float_linear");
        PrefilteringShader.enableExtension("GL_OES_standard_derivatives");
        PrefilteringShader.enableExtension("GL_OES_texture_float");
        PrefilteringShader.enableExtension("GL_OES_texture_float_linear");
        PrefilteringShader.enableExtension("GL_OES_texture_half_float");
        PrefilteringShader.enableExtension("GL_OES_texture_half_float_linear");
    }
}

let filteringInfo = [0, 0];
IrradianceShader.offScreenPass = true;
const uniformIrradianceCubemap = new CGL.Uniform(IrradianceShader, "t", "EquiCubemap");
const uniformFilteringInfo = new CGL.Uniform(IrradianceShader, "2f", "filteringInfo", filteringInfo);
const uniformRotation = new CGL.Uniform(IrradianceShader, "f", "rotation", 0);
IrradianceShader.setSource(attachments.irradiance_vert, attachments.irradiance_frag);

let prefilteringInfo = [0, 0];
PrefilteringShader.offScreenPass = true;
const uniformPrefilteringCubemap = new CGL.Uniform(PrefilteringShader, "t", "EquiCubemap");
const uniformPrefilteringRoughness = new CGL.Uniform(PrefilteringShader, "f", "roughness", 0);
const uniformPrefilteringRotation = new CGL.Uniform(PrefilteringShader, "f", "rotation", 0);
const uniformPrefilteringInfo = new CGL.Uniform(PrefilteringShader, "2f", "filteringInfo", prefilteringInfo);
PrefilteringShader.setSource(attachments.prefiltering_vert, attachments.prefiltering_frag);

const IBLLUTShader = new CGL.Shader(cgl, "IBLLUTShader");
IBLLUTShader.offScreenPass = true;
IBLLUTShader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
IBLLUTShader.setSource(attachments.IBLLUT_vert, attachments.IBLLUT_frag);

inToggleRGBE.onChange = () =>
{
    IrradianceShader.toggleDefine("DONT_USE_RGBE_CUBEMAPS", inToggleRGBE);
    PrefilteringShader.toggleDefine("DONT_USE_RGBE_CUBEMAPS", inToggleRGBE);

    IrradianceSizeChanged = true;
    PrefilteredSizeChanged = true;
};

inRotation.onChange = () =>
{
    PrefilteredSizeChanged =
    IrradianceSizeChanged = true;
};

// utility functions
function captureIrradianceCubemap(size)
{
    if (irradianceFrameBuffer) irradianceFrameBuffer.dispose();

    irradianceFrameBuffer = new CGL.CubemapFramebuffer(cgl, Number(size), Number(size), {
        // "isFloatingPointTexture": false,
        "clear": false,
        "filter": CGL.Texture.FILTER_NEAREST, // due to banding with rgbe
        "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE
    });

    filteringInfo[0] = size;
    filteringInfo[1] = 1.0 + Math.floor(Math.log(size) * 1.44269504088896340736);

    IrradianceShader.popTextures();
    IrradianceShader.pushTexture(uniformIrradianceCubemap, inCubemap.get().tex);
    uniformRotation.setValue(inRotation.get() / 360.0);

    irradianceFrameBuffer.renderStart(cgl);
    for (let i = 0; i < 6; i += 1)
    {
        irradianceFrameBuffer.renderStartCubemapFace(i);

        //  cgl.gl.clearColor(0, 0, 0, 0);
        // if(i==0) cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);
        mesh.render(IrradianceShader);
        irradianceFrameBuffer.renderEndCubemapFace();
    }
    irradianceFrameBuffer.renderEnd();

    // outTexIrradiance.set(null); // pandur
    outTexIrradiance.setRef(irradianceFrameBuffer.getTextureColor());
}

function capturePrefilteredCubemap(size)
{
    size = Number(size);
    let captureFBO = new CGL.CubemapFramebuffer(cgl, size, size, {
        "isFloatingPointTexture": false,
        "clear": false,
        "filter": CGL.Texture.FILTER_LINEAR,
        "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE
    });

    if (prefilteredFrameBuffer) prefilteredFrameBuffer.dispose();

    prefilteredFrameBuffer = new CGL.CubemapFramebuffer(cgl, size, size, {
        "clear": false,
        "filter": CGL.Texture.FILTER_MIPMAP,
        "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE
    });

    cgl.gl.bindTexture(cgl.gl.TEXTURE_CUBE_MAP, prefilteredFrameBuffer.getTextureColor().tex);

    cgl.gl.texParameteri(cgl.gl.TEXTURE_CUBE_MAP, cgl.gl.TEXTURE_WRAP_S, cgl.gl.CLAMP_TO_EDGE);
    cgl.gl.texParameteri(cgl.gl.TEXTURE_CUBE_MAP, cgl.gl.TEXTURE_WRAP_T, cgl.gl.CLAMP_TO_EDGE);
    if (cgl.glVersion == 2) cgl.gl.texParameteri(cgl.gl.TEXTURE_CUBE_MAP, cgl.gl.TEXTURE_WRAP_R, cgl.gl.CLAMP_TO_EDGE);
    cgl.gl.texParameteri(cgl.gl.TEXTURE_CUBE_MAP, cgl.gl.TEXTURE_MIN_FILTER, cgl.gl.LINEAR_MIPMAP_LINEAR);
    cgl.gl.texParameteri(cgl.gl.TEXTURE_CUBE_MAP, cgl.gl.TEXTURE_MAG_FILTER, cgl.gl.LINEAR);
    cgl.gl.generateMipmap(cgl.gl.TEXTURE_CUBE_MAP); // make sure memory is assigned for mips

    maxMipLevels = 1.0 + Math.floor(Math.log(size) * 1.44269504088896340736);
    outMipLevels.set(maxMipLevels);
    prefilteringInfo[0] = size;
    prefilteringInfo[1] = maxMipLevels;

    PrefilteringShader.popTextures();
    PrefilteringShader.pushTexture(uniformPrefilteringCubemap, inCubemap.get().tex);
    uniformPrefilteringRotation.setValue(inRotation.get() / 360.0);

    let iosFix = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) && (navigator.userAgent.match(/iPhone/i));

    if (iosFix)
    {
        maxMipLevels = 0;
    }

    for (let mip = 0; mip <= maxMipLevels; ++mip)
    {
        const currentMipSize = size * 0.5 ** mip;
        const roughness = mip / (maxMipLevels - 1);
        uniformPrefilteringRoughness.setValue(roughness);

        captureFBO.setSize(currentMipSize, currentMipSize);
        captureFBO.renderStart(cgl);
        for (let i = 0; i < 6; i++)
        {
            captureFBO.renderStartCubemapFace(i);

            mesh.render(PrefilteringShader);

            cgl.gl.bindTexture(cgl.gl.TEXTURE_CUBE_MAP, prefilteredFrameBuffer.getTextureColor().tex);
            cgl.gl.copyTexImage2D(cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, mip, cgl.gl.RGBA8, 0, 0, currentMipSize, currentMipSize, 0);
            captureFBO.renderEndCubemapFace();
        }
        captureFBO.renderEnd();
    }

    if (iosFix)
    {
        cgl.gl.bindTexture(cgl.gl.TEXTURE_CUBE_MAP, prefilteredFrameBuffer.getTextureColor().tex);
        cgl.gl.generateMipmap(cgl.gl.TEXTURE_CUBE_MAP);
    }

    captureFBO.delete();
    cgl.setTexture(0, null);

    outTexPrefiltered.setRef(prefilteredFrameBuffer.getTextureColor());
}

function computeIBLLUT(size)
{
    size = Number(size);
    if (iblLutFrameBuffer) iblLutFrameBuffer.dispose();

    if (IS_WEBGL_1)
    {
        iblLutFrameBuffer = new CGL.Framebuffer(cgl, size, size, {
            "isFloatingPointTexture": true,
            "filter": CGL.Texture.FILTER_LINEAR,
            "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE
        });
    }
    else
    {
        let isFloatingPointTexture = (!inForce8bitIbl.get()) && !cgl.glUseHalfFloatTex;

        if (isFloatingPointTexture)
        {
            iblLutFrameBuffer = new CGL.Framebuffer2(cgl, size, size, {
                "pixelFormat": CGL.Texture.PFORMATSTR_RG16F,
                "filter": CGL.Texture.FILTER_LINEAR,
                "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE,
            });
        }
        else
        {
            iblLutFrameBuffer = new CGL.Framebuffer2(cgl, size, size, {
                "filter": CGL.Texture.FILTER_LINEAR,
                "pixelFormat": CGL.Texture.PFORMATSTR_RGBA8UB,
                "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE,
            });
        }
    }

    cgl.tempData.renderOffscreen = true;
    iblLutFrameBuffer.renderStart(cgl);
    fullscreenRectangle.render(IBLLUTShader);
    iblLutFrameBuffer.renderEnd();
    cgl.tempData.renderOffscreen = false;
    outTexIBLLUT.setRef(iblLutFrameBuffer.getTextureColor());
}

inCubemap.onChange = () =>
{
    if (inCubemap.get())
        op.setUiError("nocubemapinput", null);

    PrefilteredSizeChanged =
    IrradianceSizeChanged = true;
};

function drawHelpers()
{
    gui.setTransformGizmo({
        "posX": inPCOriginX,
        "posY": inPCOriginY,
        "posZ": inPCOriginZ,
    });
    gui.setTransformGizmo({
        "posX": inPCboxMinX,
        "posY": inPCboxMinY,
        "posZ": inPCboxMinZ,
    }, 1);
    gui.setTransformGizmo({
        "posX": inPCboxMaxX,
        "posY": inPCboxMaxY,
        "posZ": inPCboxMaxZ,
    }, 2);
    if (CABLES.UI && gui.shouldDrawOverlay)
    {
        cgl.pushShader(CABLES.GL_MARKER.getDefaultShader(cgl));
    }
    else
    {
        cgl.pushShader(CABLES.GL_MARKER.getSelectedShader(cgl));
    }
    cgl.pushModelMatrix();
    // translate
    mat4.translate(cgl.mMatrix, cgl.mMatrix, [(inPCboxMinX.get() + inPCboxMaxX.get()) / 2.0, (inPCboxMinY.get() + inPCboxMaxY.get()) / 2.0, (inPCboxMinZ.get() + inPCboxMaxZ.get()) / 2.0]);
    // scale to bounds
    mat4.scale(cgl.mMatrix, cgl.mMatrix, [(inPCboxMaxX.get() - inPCboxMinX.get()) / 2.0, (inPCboxMaxY.get() - inPCboxMinY.get()) / 2.0, (inPCboxMaxZ.get() - inPCboxMinZ.get()) / 2.0]);
    // draw
    BB.render(cgl);
    cgl.popShader();
    cgl.popModelMatrix();
}

inUseParallaxCorrection.onChange = () =>
{
    const active = inUseParallaxCorrection.get();
    inPCOriginX.setUiAttribs({ "greyout": !active });
    inPCOriginY.setUiAttribs({ "greyout": !active });
    inPCOriginZ.setUiAttribs({ "greyout": !active });
    inPCboxMinX.setUiAttribs({ "greyout": !active });
    inPCboxMinY.setUiAttribs({ "greyout": !active });
    inPCboxMinZ.setUiAttribs({ "greyout": !active });
    inPCboxMaxX.setUiAttribs({ "greyout": !active });
    inPCboxMaxY.setUiAttribs({ "greyout": !active });
    inPCboxMaxZ.setUiAttribs({ "greyout": !active });
};

// onTriggered
inTrigger.onTriggered = function ()
{
    if (op.patch.cgl.tempData.shadowPass)
    {
        // outTrigger.trigger();
        return;
    }
    if (!inCubemap.get())
    {
        outTrigger.trigger();
        op.setUiError("nocubemapinput", "No Environment Texture connected");
        return;
    }

    uniformFilteringInfo.setValue(filteringInfo);
    uniformPrefilteringInfo.setValue(prefilteringInfo);

    if (!cgl.tempData.shadowPass)
    {
        if (IBLLUTSettingsChanged)
        {
            computeIBLLUT(Number(inIBLLUTSize.get()));
            IBLLUTSettingsChanged = false;
        }

        if (PrefilteredSizeChanged)
        {
            capturePrefilteredCubemap(Number(inPrefilteredSize.get()));
            PrefilteredSizeChanged = false;
        }

        if (IrradianceSizeChanged)
        {
            captureIrradianceCubemap(Number(inIrradianceSize.get()));
            IrradianceSizeChanged = false;
        }
    }
    pbrEnv.texIBLLUT = iblLutFrameBuffer.getTextureColor();
    pbrEnv.texDiffIrr = irradianceFrameBuffer.getTextureColor();// outTexIrradiance.get();
    pbrEnv.texPreFiltered = prefilteredFrameBuffer.getTextureColor();// outTexPrefiltered.get();
    pbrEnv.texPreFilteredMipLevels = outMipLevels.get();

    pbrEnv.intensity = inIntensity.get();
    pbrEnv.UseParallaxCorrection = inUseParallaxCorrection.get();
    pbrEnv.PCOrigin = [inPCOriginX.get(), inPCOriginY.get(), inPCOriginZ.get()];
    pbrEnv.PCboxMin = [inPCboxMinX.get(), inPCboxMinY.get(), inPCboxMinZ.get()];
    pbrEnv.PCboxMax = [inPCboxMaxX.get(), inPCboxMaxY.get(), inPCboxMaxZ.get()];

    cgl.tempData.pbrEnvStack = cgl.tempData.pbrEnvStack || [];
    cgl.tempData.pbrEnvStack.push(pbrEnv);

    if (cgl.shouldDrawHelpers(op) && pbrEnv.UseParallaxCorrection && !cgl.tempData.shadowPass) drawHelpers();

    outTrigger.trigger();
    cgl.tempData.pbrEnvStack.pop();
};

}
};






// **************************************************************
// 
// Ops.Gl.Texture_v2
// 
// **************************************************************

Ops.Gl.Texture_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    filename = op.inUrl("File", [".jpg", ".png", ".webp", ".jpeg", ".avif"]),
    tfilter = op.inSwitch("Filter", ["nearest", "linear", "mipmap"]),
    wrap = op.inValueSelect("Wrap", ["repeat", "mirrored repeat", "clamp to edge"], "clamp to edge"),
    aniso = op.inSwitch("Anisotropic", ["0", "1", "2", "4", "8", "16"], "0"),
    dataFrmt = op.inSwitch("Data Format", ["R", "RG", "RGB", "RGBA", "SRGBA"], "RGBA"),
    flip = op.inValueBool("Flip", false),
    unpackAlpha = op.inValueBool("Pre Multiplied Alpha", false),
    active = op.inValueBool("Active", true),
    inFreeMemory = op.inBool("Save Memory", true),
    textureOut = op.outTexture("Texture"),
    addCacheBust = op.inBool("Add Cachebuster", false),
    inReload = op.inTriggerButton("Reload"),
    width = op.outNumber("Width"),
    height = op.outNumber("Height"),
    ratio = op.outNumber("Aspect Ratio"),
    loaded = op.outBoolNum("Loaded", 0),
    loading = op.outBoolNum("Loading", 0);

const cgl = op.patch.cgl;

// op.toWorkPortsNeedToBeLinked(textureOut);
op.setPortGroup("Size", [width, height]);

let loadedFilename = null;
let loadingId = null;
let tex = null;
let cgl_filter = CGL.Texture.FILTER_MIPMAP;
let cgl_wrap = CGL.Texture.WRAP_REPEAT;
let cgl_aniso = 0;
let timedLoader = 0;

unpackAlpha.setUiAttribs({ "hidePort": true });
unpackAlpha.onChange =
    filename.onChange =
    dataFrmt.onChange =
    addCacheBust.onChange =
    flip.onChange = reloadSoon;
aniso.onChange = tfilter.onChange = onFilterChange;
wrap.onChange = onWrapChange;

tfilter.set("mipmap");
wrap.set("repeat");

textureOut.setRef(CGL.Texture.getEmptyTexture(cgl));

inReload.onTriggered = reloadSoon;

active.onChange = function ()
{
    if (active.get())
    {
        if (loadedFilename != filename.get() || !tex) reloadSoon();
        else textureOut.setRef(tex);
    }
    else
    {
        textureOut.setRef(CGL.Texture.getEmptyTexture(cgl));
        width.set(CGL.Texture.getEmptyTexture(cgl).width);
        height.set(CGL.Texture.getEmptyTexture(cgl).height);
        if (tex)tex.delete();

        op.setUiAttrib({ "extendTitle": "x" });
        tex = null;
    }
};

const setTempTexture = function ()
{
    const t = CGL.Texture.getTempTexture(cgl);
    textureOut.setRef(t);
};

function reloadSoon(nocache)
{
    clearTimeout(timedLoader);
    timedLoader = setTimeout(function ()
    {
        realReload(nocache);
    }, 1);
}

function getPixelFormat()
{
    if (dataFrmt.get() == "R") return CGL.Texture.PFORMATSTR_R8UB;
    if (dataFrmt.get() == "RG") return CGL.Texture.PFORMATSTR_RG8UB;
    if (dataFrmt.get() == "RGB") return CGL.Texture.PFORMATSTR_RGB8UB;
    if (dataFrmt.get() == "SRGBA") return CGL.Texture.PFORMATSTR_SRGBA8;

    return CGL.Texture.PFORMATSTR_RGBA8UB;
}

function realReload(nocache)
{
    op.checkMainloopExists();
    if (!active.get()) return;
    if (loadingId)loadingId = op.patch.loading.finished(loadingId);

    loadingId = op.patch.loading.start(op.objName, filename.get(), op);

    let url = op.patch.getFilePath(String(filename.get()));

    if (addCacheBust.get() || nocache === true) url = CABLES.cacheBust(url);

    if (String(filename.get()).indexOf("data:") == 0) url = filename.get();

    let needsRefresh = false;
    loadedFilename = filename.get();

    if ((filename.get() && filename.get().length > 1))
    {
        loaded.set(false);
        loading.set(true);

        const fileToLoad = filename.get();

        op.setUiAttrib({ "extendTitle": CABLES.basename(url) });
        if (needsRefresh) op.refreshParams();

        op.patch.loading.addAssetLoadingTask(() =>
        {
            op.setUiError("urlerror", null);
            CGL.Texture.load(cgl, url, function (err, newTex)
            {
                if (filename.get() != fileToLoad)
                {
                    loadingId = op.patch.loading.finished(loadingId);
                    return;
                }

                if (tex)tex.delete();

                if (err)
                {
                    const t = CGL.Texture.getErrorTexture(cgl);
                    textureOut.setRef(t);

                    op.setUiError("urlerror", "could not load texture: \"" + filename.get() + "\"", 2);
                    loadingId = op.patch.loading.finished(loadingId);
                    return;
                }

                width.set(newTex.width);
                height.set(newTex.height);
                ratio.set(newTex.width / newTex.height);

                tex = newTex;
                textureOut.setRef(tex);

                loading.set(false);
                loaded.set(true);

                if (inFreeMemory.get()) tex.image = null;

                if (loadingId)
                {
                    loadingId = op.patch.loading.finished(loadingId);
                }
                op.checkMainloopExists();
            }, {
                "anisotropic": cgl_aniso,
                "wrap": cgl_wrap,
                "flip": flip.get(),
                "unpackAlpha": unpackAlpha.get(),
                "pixelFormat": getPixelFormat(),
                "filter": cgl_filter
            });

            op.checkMainloopExists();
        });
    }
    else
    {
        setTempTexture();
        loadingId = op.patch.loading.finished(loadingId);
    }
}

function onFilterChange()
{
    if (tfilter.get() == "nearest") cgl_filter = CGL.Texture.FILTER_NEAREST;
    else if (tfilter.get() == "linear") cgl_filter = CGL.Texture.FILTER_LINEAR;
    else if (tfilter.get() == "mipmap") cgl_filter = CGL.Texture.FILTER_MIPMAP;
    else if (tfilter.get() == "Anisotropic") cgl_filter = CGL.Texture.FILTER_ANISOTROPIC;
    aniso.setUiAttribs({ "greyout": cgl_filter != CGL.Texture.FILTER_MIPMAP });

    cgl_aniso = parseFloat(aniso.get());

    reloadSoon();
}

function onWrapChange()
{
    if (wrap.get() == "repeat") cgl_wrap = CGL.Texture.WRAP_REPEAT;
    if (wrap.get() == "mirrored repeat") cgl_wrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
    if (wrap.get() == "clamp to edge") cgl_wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

    reloadSoon();
}

op.onFileChanged = function (fn)
{
    if (filename.get() && filename.get().indexOf(fn) > -1)
    {
        textureOut.setRef(CGL.Texture.getEmptyTexture(op.patch.cgl));
        textureOut.setRef(CGL.Texture.getTempTexture(cgl));
        realReload(true);
    }
};

}
};






// **************************************************************
// 
// Ops.Devices.Mouse.MouseButtons
// 
// **************************************************************

Ops.Devices.Mouse.MouseButtons= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    mouseClickLeft = op.outTrigger("Click Left"),
    mouseClickRight = op.outTrigger("Click Right"),
    mouseDoubleClick = op.outTrigger("Double Click"),
    mouseDownLeft = op.outBoolNum("Button pressed Left", false),
    mouseDownMiddle = op.outBoolNum("Button pressed Middle", false),
    mouseDownRight = op.outBoolNum("Button pressed Right", false),
    triggerMouseDownLeft = op.outTrigger("Mouse Down Left"),
    triggerMouseDownMiddle = op.outTrigger("Mouse Down Middle"),
    triggerMouseDownRight = op.outTrigger("Mouse Down Right"),
    triggerMouseUpLeft = op.outTrigger("Mouse Up Left"),
    triggerMouseUpMiddle = op.outTrigger("Mouse Up Middle"),
    triggerMouseUpRight = op.outTrigger("Mouse Up Right"),
    area = op.inValueSelect("Area", ["Canvas", "Document"], "Canvas"),
    active = op.inValueBool("Active", true);

const cgl = op.patch.cgl;
let listenerElement = null;
area.onChange = updateListeners;
op.onDelete = removeListeners;
updateListeners();

function onMouseDown(e)
{
    if (e.which == 1)
    {
        mouseDownLeft.set(true);
        triggerMouseDownLeft.trigger();
    }
    else if (e.which == 2)
    {
        mouseDownMiddle.set(true);
        triggerMouseDownMiddle.trigger();
    }
    else if (e.which == 3)
    {
        mouseDownRight.set(true);
        triggerMouseDownRight.trigger();
    }
}

function onMouseUp(e)
{
    if (e.which == 1 && mouseDownLeft.get())
    {
        mouseDownLeft.set(false);
        triggerMouseUpLeft.trigger();
    }
    else if (e.which == 2 && mouseDownMiddle.get())
    {
        mouseDownMiddle.set(false);
        triggerMouseUpMiddle.trigger();
    }
    else if (e.which == 3 && mouseDownRight.get())
    {
        mouseDownRight.set(false);
        triggerMouseUpRight.trigger();
    }
}

function onClickRight(e)
{
    mouseClickRight.trigger();
    e.preventDefault();
}

function onDoubleClick(e)
{
    mouseDoubleClick.trigger();
}

function onmouseclick(e)
{
    mouseClickLeft.trigger();
}

function ontouchstart(event)
{
    if (event.touches && event.touches.length > 0)
    {
        event.touches[0].which = 1;
        onMouseDown(event.touches[0]);
    }
}

function ontouchend(event)
{
    onMouseUp({ "which": 1 });
}

function removeListeners()
{
    if (!listenerElement) return;
    listenerElement.removeEventListener("touchend", ontouchend);
    listenerElement.removeEventListener("touchcancel", ontouchend);
    listenerElement.removeEventListener("touchstart", ontouchstart);
    listenerElement.removeEventListener("dblclick", onDoubleClick);
    listenerElement.removeEventListener("click", onmouseclick);
    listenerElement.removeEventListener("mousedown", onMouseDown);
    listenerElement.removeEventListener("mouseup", onMouseUp);
    listenerElement.removeEventListener("contextmenu", onClickRight);
    listenerElement.removeEventListener("mouseleave", onMouseUp);
    listenerElement = null;
}

function addListeners()
{
    if (listenerElement)removeListeners();

    listenerElement = cgl.canvas;
    if (area.get() == "Document") listenerElement = document.body;

    listenerElement.addEventListener("touchend", ontouchend);
    listenerElement.addEventListener("touchcancel", ontouchend);
    listenerElement.addEventListener("touchstart", ontouchstart);
    listenerElement.addEventListener("dblclick", onDoubleClick);
    listenerElement.addEventListener("click", onmouseclick);
    listenerElement.addEventListener("mousedown", onMouseDown);
    listenerElement.addEventListener("mouseup", onMouseUp);
    listenerElement.addEventListener("contextmenu", onClickRight);
    listenerElement.addEventListener("mouseleave", onMouseUp);
}

op.onLoaded = updateListeners;

active.onChange = updateListeners;

function updateListeners()
{
    removeListeners();
    if (active.get()) addListeners();
}

}
};






// **************************************************************
// 
// Ops.Gl.Textures.ExrTexture
// 
// **************************************************************

Ops.Gl.Textures.ExrTexture= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inFile = op.inUrl("EXR File", [".exr"]),
    inAlpha = op.inBool("Remove Alpha", false),
    inFilter = op.inSwitch("Filter", ["Nearest", "Linear"], "Nearest"),
    inFlip = op.inBool("Flip", true),
    outTex = op.outTexture("Texture"),
    outWidth = op.outNumber("Width"),
    outHeight = op.outNumber("Height"),
    outChannels = op.outString("Channels"),
    outLoading = op.outBool("Loading");

let
    loadingId = null,
    timedLoader = null,
    finishedLoading = false;

const cgl = op.patch.cgl;

inFlip.onChange =
inFilter.onChange =
inAlpha.onChange =
inFile.onChange = reloadSoon;

function reloadSoon(nocache)
{
    clearTimeout(timedLoader);
    timedLoader = setTimeout(function () { loadBin(nocache); }, 30);
}

function loadBin(addCacheBuster)
{
    // if (!inActive.get()) return;

    if (!loadingId)loadingId = op.patch.loading.start("exr" + inFile.get(), inFile.get(), op);

    let url = op.patch.getFilePath(String(inFile.get()));
    if (addCacheBuster)url += "?rnd=" + CABLES.generateUUID();
    finishedLoading = false;
    outLoading.set(true);
    const oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";
    op.setUiError("exc", null);

    op.patch.loading.addAssetLoadingTask(() =>
    {
        oReq.onload = (oEvent) =>
        {
            const arrayBuffer = oReq.response;
            const l = new CABLES.EXRLoader();

            try
            {
                const p = l.parse(arrayBuffer);
                outTex.set(CGL.Texture.getEmptyTexture(op.patch.cgl));

                if (p)
                {
                    const arr = new Float32Array(p.data.length);
                    for (let i = 0; i < p.data.length; i++)
                        arr[i] = p.data[i];

                    if (inAlpha.get())
                        for (let i = 3; i < arr.length; i += 4)arr[i] = 1;

                    let channels = "";
                    for (let i = 0; i < p.header.channels.length; i++)
                        channels += p.header.channels[i].name;

                    outChannels.set(channels);

                    let filter = CGL.Texture.FILTER_NEAREST;
                    if (inFilter.get() === "Linear") filter = CGL.Texture.FILTER_LINEAR;

                    const tex = new CGL.Texture(cgl, {
                        "name": "exr texture",
                        "filter": filter,
                        "wrap": filter,
                        "flip": inFlip.get(),
                        "isFloatingPointTexture": true });

                    tex.initFromData(arr, p.width, p.height, filter, filter);
                    outTex.set(tex);
                    outWidth.set(p.width);
                    outHeight.set(p.height);
                }
                else
                {
                    outWidth.set(0);
                    outHeight.set(0);
                }
            }
            catch (e)
            {
                op.setUiError("exc", e.message);
                // op.logError(e);
            }

            cgl.patch.loading.finished(loadingId);
            finishedLoading = true;
            outLoading.set(false);
        };

        oReq.send(null);
    });
}

op.onFileChanged = function (fn)
{
    if (inFile.get() && inFile.get().indexOf(fn) > -1)
    {
        outTex.set(CGL.Texture.getEmptyTexture(op.patch.cgl));
        reloadSoon(true);
    }
};

}
};






// **************************************************************
// 
// Ops.Trigger.Sequence
// 
// **************************************************************

Ops.Trigger.Sequence= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    exe = op.inTrigger("exe"),
    cleanup = op.inTriggerButton("Clean up connections");

op.setUiAttrib({ "resizable": true, "resizableY": false, "stretchPorts": true });
const
    exes = [],
    triggers = [],
    num = 16;

let
    updateTimeout = null,
    connectedOuts = [];

exe.onTriggered = triggerAll;
cleanup.onTriggered = clean;
cleanup.setUiAttribs({ "hideParam": true, "hidePort": true });

for (let i = 0; i < num; i++)
{
    const p = op.outTrigger("trigger " + i);
    triggers.push(p);
    p.onLinkChanged = updateButton;

    if (i < num - 1)
    {
        let newExe = op.inTrigger("exe " + i);
        newExe.onTriggered = triggerAll;
        exes.push(newExe);
    }
}

updateConnected();

function updateConnected()
{
    connectedOuts.length = 0;
    for (let i = 0; i < triggers.length; i++)
        if (triggers[i].links.length > 0) connectedOuts.push(triggers[i]);
}

function updateButton()
{
    updateConnected();
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() =>
    {
        let show = false;
        for (let i = 0; i < triggers.length; i++)
            if (triggers[i].links.length > 1) show = true;

        cleanup.setUiAttribs({ "hideParam": !show });

        if (op.isCurrentUiOp()) op.refreshParams();
    }, 60);
}

function triggerAll()
{
    // for (let i = 0; i < triggers.length; i++) triggers[i].trigger();
    for (let i = 0; i < connectedOuts.length; i++) connectedOuts[i].trigger();
}

function clean()
{
    let count = 0;
    for (let i = 0; i < triggers.length; i++)
    {
        let removeLinks = [];

        if (triggers[i].links.length > 1)
            for (let j = 1; j < triggers[i].links.length; j++)
            {
                while (triggers[count].links.length > 0) count++;

                removeLinks.push(triggers[i].links[j]);
                const otherPort = triggers[i].links[j].getOtherPort(triggers[i]);
                op.patch.link(op, "trigger " + count, otherPort.op, otherPort.name);
                count++;
            }

        for (let j = 0; j < removeLinks.length; j++) removeLinks[j].remove();
    }
    updateButton();
    updateConnected();
}

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.Math.RgbMath
// 
// **************************************************************

Ops.Gl.ImageCompose.Math.RgbMath= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"rgbmul_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\n#ifdef MOD_MASK\n    UNI sampler2D texMask;\n#endif\n#ifdef MOD_USE_VALUETEX\n    UNI sampler2D texValues;\n#endif\nUNI float r;\nUNI float g;\nUNI float b;\nUNI float a;\nUNI float mulTex;\n\n\nvoid main()\n{\n    vec4 col=texture(tex,texCoord);\n    vec4 v=vec4(r,g,b,a);\n\n    #ifdef MOD_USE_VALUETEX\n        v=texture(texValues,texCoord)*mulTex;\n    #endif\n\n    #ifdef MOD_MASK\n        v*=texture(texMask,texCoord);\n    #endif\n\n    #ifdef MOD_OP_SUB_CX\n        #ifdef MOD_CHAN_R\n            col.r=col.r-v.r;\n        #endif\n        #ifdef MOD_CHAN_G\n            col.g=col.g-v.g;\n        #endif\n        #ifdef MOD_CHAN_B\n            col.b=col.b-v.b;\n        #endif\n        #ifdef MOD_CHAN_A\n            col.a=col.a-v.a;\n        #endif\n    #endif\n\n    #ifdef MOD_OP_SUB_XC\n        #ifdef MOD_CHAN_R\n            col.r=v.r-col.r;\n        #endif\n        #ifdef MOD_CHAN_G\n            col.g=v.g-col.g;\n        #endif\n        #ifdef MOD_CHAN_B\n            col.b=v.b-col.b;\n        #endif\n        #ifdef MOD_CHAN_A\n            col.a=v.a-col.a;\n        #endif\n    #endif\n\n    #ifdef MOD_OP_ADD\n        #ifdef MOD_CHAN_R\n            col.r+=v.r;\n        #endif\n        #ifdef MOD_CHAN_G\n            col.g+=v.g;\n        #endif\n        #ifdef MOD_CHAN_B\n            col.b+=v.b;\n        #endif\n        #ifdef MOD_CHAN_A\n            col.a+=v.a;\n        #endif\n    #endif\n\n    #ifdef MOD_OP_MUL\n        #ifdef MOD_CHAN_R\n            col.r*=v.r;\n        #endif\n        #ifdef MOD_CHAN_G\n            col.g*=v.g;\n        #endif\n        #ifdef MOD_CHAN_B\n            col.b*=v.b;\n        #endif\n        #ifdef MOD_CHAN_A\n            col.a*=v.a;\n        #endif\n    #endif\n\n    #ifdef MOD_OP_DIV_XC\n        #ifdef MOD_CHAN_R\n            col.r=v.r/col.r;\n        #endif\n        #ifdef MOD_CHAN_G\n            col.g=v.g/col.g;\n        #endif\n        #ifdef MOD_CHAN_B\n            col.b=v.b/col.b;\n        #endif\n        #ifdef MOD_CHAN_A\n            col.a=v.a/col.a;\n        #endif\n    #endif\n\n    #ifdef MOD_OP_DIV_CX\n        #ifdef MOD_CHAN_R\n            col.r=col.r/v.r;\n        #endif\n        #ifdef MOD_CHAN_G\n            col.g=col.g/v.g;\n        #endif\n        #ifdef MOD_CHAN_B\n            col.b=col.b/v.b;\n        #endif\n        #ifdef MOD_CHAN_A\n            col.a=col.a/v.a;\n        #endif\n    #endif\n\n    #ifdef MOD_OP_MODULO\n        #ifdef MOD_CHAN_R\n            col.r=mod(col.r,v.r);\n        #endif\n        #ifdef MOD_CHAN_G\n            col.g=mod(col.g,v.g);\n        #endif\n        #ifdef MOD_CHAN_B\n            col.b=mod(col.b,v.b);\n        #endif\n        #ifdef MOD_CHAN_A\n            col.a=mod(col.a,v.a);\n        #endif\n    #endif\n\n    #ifdef MOD_OP_DISTANCE\n        #ifdef MOD_CHAN_R\n            col.r=distance(col.r,v.r);\n        #endif\n        #ifdef MOD_CHAN_G\n            col.g=distance(col.g,v.g);\n        #endif\n        #ifdef MOD_CHAN_B\n            col.b=distance(col.b,v.b);\n        #endif\n        #ifdef MOD_CHAN_A\n            col.a=distance(col.a,v.a);\n        #endif\n    #endif\n\n   outColor= col;\n}\n",};
const
    render = op.inTrigger("Render"),
    inOp = op.inSwitch("Operation", ["c-x", "x-c", "c+x", "c*x", "x/c", "c/x", "c%x", "dist"], "c*x"),
    chanR = op.inBool("R Active", true),
    chanG = op.inBool("G Active", true),
    chanB = op.inBool("B Active", true),
    chanA = op.inBool("A Active", false),
    inTexValues = op.inTexture("Texture"),
    r = op.inValue("r", 1),
    g = op.inValue("g", 1),
    b = op.inValue("b", 1),
    a = op.inValue("a", 1),
    mulTex = op.inValue("Multiply Texture", 1),

    inTexMask = op.inTexture("Mask"),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.rgbmul_frag);
const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    textureMaskUniform = new CGL.Uniform(shader, "t", "texMask", 1),
    tex2 = new CGL.Uniform(shader, "t", "texValues", 2),
    uniformMulTex = new CGL.Uniform(shader, "f", "mulTex", mulTex),
    uniformR = new CGL.Uniform(shader, "f", "r", r),
    uniformG = new CGL.Uniform(shader, "f", "g", g),
    uniformB = new CGL.Uniform(shader, "f", "b", b),
    uniformA = new CGL.Uniform(shader, "f", "a", a);

inTexValues.onLinkChanged =
    inTexMask.onChange =
    chanR.onChange =
    chanG.onChange =
    chanB.onChange =
    chanA.onChange =
    inOp.onChange = updateDefines;

updateDefines();

function updateDefines()
{
    shader.toggleDefine("MOD_MASK", inTexMask.get());

    shader.toggleDefine("MOD_OP_SUB_CX", inOp.get() === "c-x");
    shader.toggleDefine("MOD_OP_SUB_XC", inOp.get() === "x-c");

    shader.toggleDefine("MOD_OP_ADD", inOp.get() === "c+x");
    shader.toggleDefine("MOD_OP_MUL", inOp.get() === "c*x");

    shader.toggleDefine("MOD_OP_DIV_XC", inOp.get() === "x/c");
    shader.toggleDefine("MOD_OP_DIV_CX", inOp.get() === "c/x");

    shader.toggleDefine("MOD_OP_MODULO", inOp.get() === "c%x");
    shader.toggleDefine("MOD_OP_DISTANCE", inOp.get() === "dist");

    shader.toggleDefine("MOD_CHAN_R", chanR.get());
    r.setUiAttribs({ "greyout": !chanR.get() || inTexValues.isLinked() });

    shader.toggleDefine("MOD_CHAN_G", chanG.get());
    g.setUiAttribs({ "greyout": !chanG.get() || inTexValues.isLinked() });

    shader.toggleDefine("MOD_CHAN_B", chanB.get());
    b.setUiAttribs({ "greyout": !chanB.get() || inTexValues.isLinked() });

    shader.toggleDefine("MOD_CHAN_A", chanA.get());
    a.setUiAttribs({ "greyout": !chanA.get() || inTexValues.isLinked() });

    mulTex.setUiAttribs({ "greyout": !inTexValues.isLinked() });

    shader.toggleDefine("MOD_USE_VALUETEX", inTexValues.isLinked());
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    if (inTexMask.get())cgl.setTexture(1, inTexMask.get().tex);
    if (inTexValues.get())cgl.setTexture(2, inTexValues.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.DrawImage_v3
// 
// **************************************************************

Ops.Gl.ImageCompose.DrawImage_v3= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"drawimage_frag":"#ifdef HAS_TEXTURES\n    IN vec2 texCoord;\n    UNI sampler2D tex;\n    UNI sampler2D image;\n#endif\n\n#ifdef TEX_TRANSFORM\n    IN mat3 transform;\n#endif\n// UNI float rotate;\n\n{{CGL.BLENDMODES}}\n\n#ifdef HAS_TEXTUREALPHA\n   UNI sampler2D imageAlpha;\n#endif\n\nUNI float amount;\n\n#ifdef ASPECT_RATIO\n    UNI float aspectTex;\n    UNI float aspectPos;\n#endif\n\nvoid main()\n{\n    vec4 blendRGBA=vec4(0.0,0.0,0.0,1.0);\n\n    #ifdef HAS_TEXTURES\n        vec2 tc=texCoord;\n\n        #ifdef TEX_FLIP_X\n            tc.x=1.0-tc.x;\n        #endif\n        #ifdef TEX_FLIP_Y\n            tc.y=1.0-tc.y;\n        #endif\n\n        #ifdef ASPECT_RATIO\n            #ifdef ASPECT_AXIS_X\n                tc.y=(1.0-aspectPos)-(((1.0-aspectPos)-tc.y)*aspectTex);\n            #endif\n            #ifdef ASPECT_AXIS_Y\n                tc.x=(1.0-aspectPos)-(((1.0-aspectPos)-tc.x)/aspectTex);\n            #endif\n        #endif\n\n        #ifdef TEX_TRANSFORM\n            vec3 coordinates=vec3(tc.x, tc.y,1.0);\n            tc=(transform * coordinates ).xy;\n        #endif\n\n        blendRGBA=texture(image,tc);\n\n        vec3 blend=blendRGBA.rgb;\n        vec4 baseRGBA=texture(tex,texCoord);\n        vec3 base=baseRGBA.rgb;\n\n\n        #ifdef PREMUL\n            blend.rgb = (blend.rgb) + (base.rgb * (1.0 - blendRGBA.a));\n        #endif\n\n        vec3 colNew=_blend(base,blend);\n\n\n\n\n        #ifdef REMOVE_ALPHA_SRC\n            blendRGBA.a=1.0;\n        #endif\n\n        #ifdef HAS_TEXTUREALPHA\n            vec4 colImgAlpha=texture(imageAlpha,tc);\n            float colImgAlphaAlpha=colImgAlpha.a;\n\n            #ifdef ALPHA_FROM_LUMINANCE\n                vec3 gray = vec3(dot(vec3(0.2126,0.7152,0.0722), colImgAlpha.rgb ));\n                colImgAlphaAlpha=(gray.r+gray.g+gray.b)/3.0;\n            #endif\n\n            #ifdef ALPHA_FROM_INV_UMINANCE\n                vec3 gray = vec3(dot(vec3(0.2126,0.7152,0.0722), colImgAlpha.rgb ));\n                colImgAlphaAlpha=1.0-(gray.r+gray.g+gray.b)/3.0;\n            #endif\n\n            #ifdef INVERT_ALPHA\n                colImgAlphaAlpha=clamp(colImgAlphaAlpha,0.0,1.0);\n                colImgAlphaAlpha=1.0-colImgAlphaAlpha;\n            #endif\n\n            blendRGBA.a=colImgAlphaAlpha*blendRGBA.a;\n        #endif\n    #endif\n\n    float am=amount;\n\n    #ifdef CLIP_REPEAT\n        if(tc.y>1.0 || tc.y<0.0 || tc.x>1.0 || tc.x<0.0)\n        {\n            // colNew.rgb=vec3(0.0);\n            am=0.0;\n        }\n    #endif\n\n    #ifdef ASPECT_RATIO\n        #ifdef ASPECT_CROP\n            if(tc.y>1.0 || tc.y<0.0 || tc.x>1.0 || tc.x<0.0)\n            {\n                colNew.rgb=base.rgb;\n                am=0.0;\n            }\n\n        #endif\n    #endif\n\n\n\n    #ifndef PREMUL\n        blendRGBA.rgb=mix(colNew,base,1.0-(am*blendRGBA.a));\n        blendRGBA.a=clamp(baseRGBA.a+(blendRGBA.a*am),0.,1.);\n    #endif\n\n    #ifdef PREMUL\n        // premultiply\n        // blendRGBA.rgb = (blendRGBA.rgb) + (baseRGBA.rgb * (1.0 - blendRGBA.a));\n        blendRGBA=vec4(\n            mix(colNew.rgb,base,1.0-(am*blendRGBA.a)),\n            blendRGBA.a*am+baseRGBA.a\n            );\n    #endif\n\n    #ifdef ALPHA_MASK\n    blendRGBA.a=baseRGBA.a;\n    #endif\n\n    outColor=blendRGBA;\n}\n\n\n\n\n\n\n\n","drawimage_vert":"IN vec3 vPosition;\nIN vec2 attrTexCoord;\nIN vec3 attrVertNormal;\n\nUNI mat4 projMatrix;\nUNI mat4 mvMatrix;\n\nOUT vec2 texCoord;\n// OUT vec3 norm;\n\n#ifdef TEX_TRANSFORM\n    UNI float posX;\n    UNI float posY;\n    UNI float scaleX;\n    UNI float scaleY;\n    UNI float rotate;\n    OUT mat3 transform;\n#endif\n\nvoid main()\n{\n   texCoord=attrTexCoord;\n//   norm=attrVertNormal;\n\n   #ifdef TEX_TRANSFORM\n        vec3 coordinates=vec3(attrTexCoord.x, attrTexCoord.y,1.0);\n        float angle = radians( rotate );\n        vec2 scale= vec2(scaleX,scaleY);\n        vec2 translate= vec2(posX,posY);\n\n        transform = mat3(   scale.x * cos( angle ), scale.x * sin( angle ), 0.0,\n            - scale.y * sin( angle ), scale.y * cos( angle ), 0.0,\n            - 0.5 * scale.x * cos( angle ) + 0.5 * scale.y * sin( angle ) - 0.5 * translate.x*2.0 + 0.5,  - 0.5 * scale.x * sin( angle ) - 0.5 * scale.y * cos( angle ) - 0.5 * translate.y*2.0 + 0.5, 1.0);\n   #endif\n\n   gl_Position = projMatrix * mvMatrix * vec4(vPosition,  1.0);\n}\n",};
const
    render = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "blendMode"),
    amount = op.inValueSlider("amount", 1),

    image = op.inTexture("Image"),
    inAlphaPremul = op.inValueBool("Premultiplied", false),
    inAlphaMask = op.inValueBool("Alpha Mask", false),
    removeAlphaSrc = op.inValueBool("removeAlphaSrc", false),

    imageAlpha = op.inTexture("Mask"),
    alphaSrc = op.inValueSelect("Mask Src", ["alpha channel", "luminance", "luminance inv"], "luminance"),
    invAlphaChannel = op.inBool("Invert alpha channel"),

    inAspect = op.inValueBool("Aspect Ratio", false),
    inAspectAxis = op.inValueSelect("Stretch Axis", ["X", "Y"], "X"),
    inAspectPos = op.inValueSlider("Position", 0.0),
    inAspectCrop = op.inValueBool("Crop", false),

    trigger = op.outTrigger("trigger");

blendMode.set("normal");
const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "drawimage");

imageAlpha.onLinkChanged = updateAlphaPorts;

op.setPortGroup("Aspect Ratio", [inAspect, inAspectPos, inAspectCrop, inAspectAxis]);
op.setPortGroup("Mask", [imageAlpha, alphaSrc, invAlphaChannel]);

function updateAlphaPorts()
{
    if (imageAlpha.isLinked())
    {
        removeAlphaSrc.setUiAttribs({ "greyout": true });
        alphaSrc.setUiAttribs({ "greyout": false });
        invAlphaChannel.setUiAttribs({ "greyout": false });
    }
    else
    {
        removeAlphaSrc.setUiAttribs({ "greyout": false });
        alphaSrc.setUiAttribs({ "greyout": true });
        invAlphaChannel.setUiAttribs({ "greyout": true });
    }
}

op.toWorkPortsNeedToBeLinked(image);

shader.setSource(attachments.drawimage_vert, attachments.drawimage_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    textureImaghe = new CGL.Uniform(shader, "t", "image", 1),
    textureAlpha = new CGL.Uniform(shader, "t", "imageAlpha", 2),
    uniTexAspect = new CGL.Uniform(shader, "f", "aspectTex", 1),
    uniAspectPos = new CGL.Uniform(shader, "f", "aspectPos", inAspectPos);

inAspect.onChange =
    inAspectCrop.onChange =
    inAspectAxis.onChange = updateAspectRatio;

function updateAspectRatio()
{
    shader.removeDefine("ASPECT_AXIS_X");
    shader.removeDefine("ASPECT_AXIS_Y");
    shader.removeDefine("ASPECT_CROP");

    inAspectPos.setUiAttribs({ "greyout": !inAspect.get() });
    inAspectCrop.setUiAttribs({ "greyout": !inAspect.get() });
    inAspectAxis.setUiAttribs({ "greyout": !inAspect.get() });

    if (inAspect.get())
    {
        shader.define("ASPECT_RATIO");

        if (inAspectCrop.get()) shader.define("ASPECT_CROP");

        if (inAspectAxis.get() == "X") shader.define("ASPECT_AXIS_X");
        if (inAspectAxis.get() == "Y") shader.define("ASPECT_AXIS_Y");
    }
    else
    {
        shader.removeDefine("ASPECT_RATIO");
        if (inAspectCrop.get()) shader.define("ASPECT_CROP");

        if (inAspectAxis.get() == "X") shader.define("ASPECT_AXIS_X");
        if (inAspectAxis.get() == "Y") shader.define("ASPECT_AXIS_Y");
    }
}

//
// texture flip
//
const flipX = op.inValueBool("flip x");
const flipY = op.inValueBool("flip y");

//
// texture transform
//

let doTransform = op.inValueBool("Transform");

let scaleX = op.inValueSlider("Scale X", 1);
let scaleY = op.inValueSlider("Scale Y", 1);

let posX = op.inValue("Position X", 0);
let posY = op.inValue("Position Y", 0);

let rotate = op.inValue("Rotation", 0);

const inClipRepeat = op.inValueBool("Clip Repeat", false);

const uniScaleX = new CGL.Uniform(shader, "f", "scaleX", scaleX);
const uniScaleY = new CGL.Uniform(shader, "f", "scaleY", scaleY);
const uniPosX = new CGL.Uniform(shader, "f", "posX", posX);
const uniPosY = new CGL.Uniform(shader, "f", "posY", posY);
const uniRotate = new CGL.Uniform(shader, "f", "rotate", rotate);

doTransform.onChange = updateTransformPorts;

function updateTransformPorts()
{
    shader.toggleDefine("TEX_TRANSFORM", doTransform.get());

    scaleX.setUiAttribs({ "greyout": !doTransform.get() });
    scaleY.setUiAttribs({ "greyout": !doTransform.get() });
    posX.setUiAttribs({ "greyout": !doTransform.get() });
    posY.setUiAttribs({ "greyout": !doTransform.get() });
    rotate.setUiAttribs({ "greyout": !doTransform.get() });
}

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

const amountUniform = new CGL.Uniform(shader, "f", "amount", amount);

render.onTriggered = doRender;

inClipRepeat.onChange =
    imageAlpha.onChange =
    inAlphaPremul.onChange =
    inAlphaMask.onChange =
    invAlphaChannel.onChange =
    flipY.onChange =
    flipX.onChange =
    removeAlphaSrc.onChange =
    alphaSrc.onChange = updateDefines;

updateTransformPorts();
updateAlphaPorts();
updateAspectRatio();
updateDefines();

function updateDefines()
{
    shader.toggleDefine("REMOVE_ALPHA_SRC", removeAlphaSrc.get());
    shader.toggleDefine("ALPHA_MASK", inAlphaMask.get());

    shader.toggleDefine("CLIP_REPEAT", inClipRepeat.get());

    shader.toggleDefine("HAS_TEXTUREALPHA", imageAlpha.get() && imageAlpha.get().tex);

    shader.toggleDefine("TEX_FLIP_X", flipX.get());
    shader.toggleDefine("TEX_FLIP_Y", flipY.get());

    shader.toggleDefine("INVERT_ALPHA", invAlphaChannel.get());

    shader.toggleDefine("ALPHA_FROM_LUMINANCE", alphaSrc.get() == "luminance");
    shader.toggleDefine("ALPHA_FROM_INV_UMINANCE", alphaSrc.get() == "luminance_inv");
    shader.toggleDefine("PREMUL", inAlphaPremul.get());
}

function doRender()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    const tex = image.get();
    if (tex && tex.tex && amount.get() > 0.0)
    {
        cgl.pushShader(shader);
        cgl.currentTextureEffect.bind();

        const imgTex = cgl.currentTextureEffect.getCurrentSourceTexture();
        cgl.setTexture(0, imgTex.tex);

        // if (imgTex && tex)
        // {
        //     if (tex.textureType != imgTex.textureType && (tex.textureType == CGL.Texture.TYPE_FLOAT))
        //         op.setUiError("textypediff", "Drawing 32bit texture into an 8 bit can result in data/precision loss", 1);
        //     else
        //         op.setUiError("textypediff", null);
        // }

        const asp = 1 / (cgl.currentTextureEffect.getWidth() / cgl.currentTextureEffect.getHeight()) * (tex.width / tex.height);
        // uniTexAspect.setValue(1 / (tex.height / tex.width * imgTex.width / imgTex.height));

        uniTexAspect.setValue(asp);

        cgl.setTexture(1, tex.tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, image.get().tex );

        if (imageAlpha.get() && imageAlpha.get().tex)
        {
            cgl.setTexture(2, imageAlpha.get().tex);
            // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, imageAlpha.get().tex );
        }

        // cgl.pushBlend(false);

        cgl.pushBlendMode(CGL.BLEND_NONE, true);

        cgl.currentTextureEffect.finish();
        cgl.popBlendMode();

        // cgl.popBlend();

        cgl.popShader();
    }

    trigger.trigger();
}

}
};






// **************************************************************
// 
// Ops.Anim.Bang
// 
// **************************************************************

Ops.Anim.Bang= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inUpdate = op.inTrigger("update"),
    inBang = op.inTriggerButton("Bang"),
    inDuration = op.inValue("Duration", 0.1),
    invert = op.inBool("Invert", false),
    outTrigger = op.outTrigger("Trigger Out"),
    outValue = op.outNumber("Value");

const anim = new CABLES.Anim();
let startTime = CABLES.now();
op.toWorkPortsNeedToBeLinked(inUpdate, inBang);

let needsReset = false;

inBang.onTriggered = function ()
{
    needsReset = true;
};

inUpdate.onTriggered = function ()
{
    if (needsReset)
    {
        startTime = CABLES.now();
        anim.clear();
        anim.setValue(0, 1);
        anim.setValue(inDuration.get(), 0);
        needsReset = false;
    }

    const elapsed = (CABLES.now() - startTime) / 1000;
    if (elapsed <= inDuration.get())
    {
        const v = anim.getValue(elapsed);
        if (invert.get()) outValue.set(1.0 - v);
        else outValue.set(v);
    }
    else
    {
        if (invert.get())
        {
            outValue.set(1.0);
        }
        else
        {
            outValue.set(0);
        }
    }

    outTrigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Math.Subtract
// 
// **************************************************************

Ops.Math.Subtract= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    number1 = op.inValue("number1", 1),
    number2 = op.inValue("number2", 1),
    result = op.outNumber("result");

op.setUiAttribs({ "mathTitle": true });

number1.onChange =
    number2.onChange = exec;
exec();

function exec()
{
    let v = number1.get() - number2.get();
    if (!isNaN(v)) result.set(v);
}

}
};






// **************************************************************
// 
// Ops.Patch.PjocSFN.GeometryFromTextureTmp_3WMvLN0
// 
// **************************************************************

Ops.Patch.PjocSFN.GeometryFromTextureTmp_3WMvLN0= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"vpos_vert":"#ifndef MOD_ANIM\n    #ifndef MOD_XYZisRGB\n    pos.xyz = DecodeRGBE8(getValueByIndexFromTexture(MOD_XYZ, vec2(MOD_size.x, MOD_size.x), float(gl_VertexID)));\n    #else\n    pos.xyz = getValueByIndexFromTexture(MOD_XYZ, vec2(MOD_size.x, MOD_size.x), float(gl_VertexID)).rgb;\n    #endif\n    #ifdef VERTEX_COLORS\n    vertCol = getValueByIndexFromTexture(MOD_RGB, vec2(MOD_size.x, MOD_size.x), float(gl_VertexID));\n    #endif\n    norm.xyz = getValueByIndexFromTexture(MOD_Norm, vec2(MOD_size.x, MOD_size.x), float(gl_VertexID)).rgb;\n#else\n    #ifdef MOD_ANIM_LINES\n        // TODO: put proper switching\n        #ifndef MOD_XYZisRGB\n        #else\n        #ifndef INSTANCING\n        vec4 res = getAnimatedValue(MOD_XYZ, vec2(MOD_size.x, MOD_size.y), float(gl_VertexID), MOD_time);\n        #else\n        vec4 res = getAnimatedValue(MOD_XYZ, vec2(MOD_size.x, MOD_size.y), float(gl_VertexID), MOD_time + instanceIndex / 82.5);\n        #endif\n        pos.xyz = res.xzy;\n        #ifndef INSTANCING\n        vec4 scaledNorm = getAnimatedValue(MOD_Norm, vec2(MOD_size.x, MOD_size.y), float(gl_VertexID), MOD_time);\n        #else\n        vec4 scaledNorm = getAnimatedValue(MOD_Norm, vec2(MOD_size.x, MOD_size.y), float(gl_VertexID), MOD_time + instanceIndex / 82.5);\n        #endif\n        //scaledNorm.xyz = vec3(scaledNorm.x, scaledNorm.z, -scaledNorm.y);\n        #ifdef MOD_AlphaContainsNorm\n        norm.xyz = decodeNormals(res.a);\n        #else\n        norm.xyz = scaledNorm.xyz;\n        #endif\n        #endif\n        norm.xyz=norm.xzy;\n    #endif\n    #ifdef MOD_ANIM_FLIPBOOK\n        // TODO: put proper switching\n        float tileSize = MOD_size.x / MOD_FlipbookFrames;\n        vec2 UV = getValueByIndexFromTextureUV(vec2(tileSize, tileSize), float(gl_VertexID));\n        UV = Flipbook(UV, MOD_FlipbookFrames, MOD_FlipbookFrames, ceil(-MOD_time));\n        UV.y = 1.0 - UV.y;\n\n        vec3 scaledNorm = texture2D(MOD_Norm, UV).rgb;\n        #ifndef MOD_XYZisRGB\n        vec4 res = vec4(0.0);\n        res.xyz = DecodeRGBE8(texture2D(MOD_XYZ, UV));\n        //pos.xyz = res.xyz;\n        scaledNorm = ((scaledNorm - vec3(0.5)) * vec3(2.0));\n        #else\n        vec4 res = vec4(0.0);\n        res.xyz = texture2D(MOD_XYZ, UV).rgb;\n        //pos.xyz = res.xyz;\n        #endif\n        #ifdef MOD_AlphaContainsNorm\n        norm.xyz = decodeNormals(res.a);\n        #else\n        norm.xyz = scaledNorm;//(scaledNorm + vec3(0.5)) * vec3(2.0);\n        #endif\n        pos.xyz = res.xyz;\n    #endif\n#endif","vpos_head_vert":"// https://enkimute.github.io/hdrpng.js/\nhighp vec3 DecodeRGBE8(highp vec4 rgbe)\n{\n    highp vec3 vDecoded = rgbe.rgb * pow(2.0, rgbe.a * 255.0-128.0);\n    return vDecoded;\n}\n// https://webglfundamentals.org/webgl/lessons/webgl-pulling-vertices.html\nvec4 texelFetch(sampler2D tex, vec2 texSize, vec2 pixelCoord)\n{\n    vec2 uv = (pixelCoord + 0.5) / texSize;\n    return texture2D(tex, uv);\n}\nvec4 getValueByIndexFromTexture(sampler2D tex, vec2 texSize, float index)\n{\n    float col = mod(index, texSize.x);\n    float row = floor(index / texSize.x);\n\n    return texelFetch(tex, texSize, vec2(col, row));\n}\nvec4 getAnimatedValue(sampler2D tex, vec2 texSize, float index, float timer)\n{\n    vec2 uv = vec2((index / texSize.x), -timer);\n    uv.x += (1.0/texSize.x) * 0.5;\n    return texture2D(tex, uv);\n}\n\n#ifdef MOD_ANIM_FLIPBOOK\n// https://docs.unity3d.com/Packages/com.unity.shadergraph@6.9/manual/Flipbook-Node.html\nfloat frac(float v)\n{\n    return v - floor(v);\n}\nfloat fmod(float a, float b)\n{\n    float c = frac(abs(a/b))*abs(b);\n    return (a < 0.0) ? -c : c;\n}\nvec2 Flipbook(vec2 UV, float Width, float Height, float Tile)\n{\n    Tile = fmod(Tile, Width * Height);\n    vec2 tileCount = vec2(1.0, 1.0) / vec2(Width, Height);\n    float tileY = abs(Height - (floor(Tile * tileCount.x) + 1.0));\n    float tileX = abs(Width - ((Tile - Width * floor(Tile * tileCount.x)) + 1.0));\n    return (UV + vec2(tileX, tileY)) * tileCount;\n}\nvec2 texelFetchUV(vec2 texSize, vec2 pixelCoord)\n{\n    return (pixelCoord + 0.5) / texSize;\n}\nvec2 getValueByIndexFromTextureUV(vec2 texSize, float index)\n{\n    float col = mod(index, texSize.x);\n    float row = floor(index / texSize.x);\n\n    return texelFetchUV(texSize, vec2(col, row));\n}\n#endif\n#ifdef MOD_AlphaContainsNorm\n// from the generated .hip file\nvec4 frac(vec4 v)\n{\n    return v - floor(v);\n}\nvec3 decodeNormals(float a)\n{\n    // https://answers.unity.com/questions/733677/cg-shader-float3-to-float-packunpack-functions.html\n    //return frac(vec3(a) / vec3(16777216, 65536, 256));\n    //https://community.khronos.org/t/packing-multiple-floats-into-a-single-float-value/59320/2\n    vec4 enc = vec4(1.0, 255.0, 65025.0, 160581375.0) * vec4(a);\n    enc = frac(enc);\n    enc -= enc.yzww * vec4(1.0/255.0,1.0/255.0,1.0/255.0,0.0);\n    return enc.xyz;\n\n    //decode float to float2\n    float alpha      = a * 1024.0;\n    vec2 f2;\n    f2.x             = floor(alpha / 32.0) / 31.5;\n    f2.y             = (alpha - (floor(alpha / 32.0)*32.0)) / 31.5;\n\n    //decode float2 to float3\n    vec3 f3;\n    f2              *= 4.0;\n    f2              -= 2.0;\n    float f2dot      = dot(f2,f2);\n    f3.xy            = sqrt(1.0 - (f2dot/4.0)) * f2;\n    f3.z             = 1.0 - (f2dot/2.0);\n    f3               = clamp(f3, -1.0, 1.0);\n    //f3.x = 1.0 - f3.x; in another implementation in the same file .-.\n\n    return f3;\n}\n#endif\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",};
const cgl = op.patch.cgl;
const mod = new CGL.ShaderModifier(cgl, op.name);

// inputs
const inTrigger = op.inTrigger("render");
const inToggleRGB = op.inBool("XYZ is RGB", false);
const inToggleAlphaNorm = op.inBool("XYZ alpha contains Normals", false);
const inToggleAnim = op.inBool("animated", false);
const inAnimMode = op.inSwitch("Animation Mode", ["Lines", "Flipbook"], "Lines");

const inXYZ = op.inTexture("XYZ");
const inRGB = op.inTexture("RGB");
const inNorm = op.inTexture("Normals");

const inTime = op.inFloat("Time", 0);
const inFrames = op.inInt("Frames", 64);

// variables
var size = [0, 0];
var geometry = new CGL.Geometry("GeometryFromTexture");
var mesh = new CGL.Mesh(cgl, geometry);
var FlipbookFrames = Math.sqrt(inFrames.get());
var TileSize = inXYZ.get().width / Math.max(1, FlipbookFrames);

// outputs
const outTrigger = op.outTrigger("next");
const outGeometry = op.outObject("geometry", null, "geometry");

mod.addModule({
    "priority": -2,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": attachments.vpos_head_vert || "",
    "srcBodyVert": attachments.vpos_vert || ""
});
mod.addUniformVert("t", "MOD_XYZ", 0);
mod.addUniformVert("t", "MOD_RGB", 0);
mod.addUniformVert("t", "MOD_Norm", 0);
mod.addUniformVert("2f", "MOD_size", size);
mod.addUniformVert("f", "MOD_time", inTime);
mod.addUniformVert("f", "MOD_FlipbookFrames", FlipbookFrames);

inToggleAlphaNorm.onChange = () =>
{
    mod.toggleDefine("MOD_AlphaContainsNorm", inToggleAlphaNorm);
};

inToggleRGB.onChange = () =>
{
    mod.toggleDefine("MOD_XYZisRGB", inToggleRGB);
};

function createGeo()
{
    if (!inXYZ.get()) return;
    size[0] = inXYZ.get().width;
    size[1] = inXYZ.get().height;

    if(inToggleAnim.get())
    {
        if (inAnimMode.get() === "Lines")
        {
            geometry.vertices = new Float32Array(size[0] * 3);
        }
        else if (inAnimMode.get() === "Flipbook")
        {
            TileSize = size[0] / Math.max(1, FlipbookFrames);
            geometry.vertices = new Float32Array(TileSize * TileSize * 3);
        }
    }
    else
    {
        geometry.vertices = new Float32Array(size[0] * size[0] * 3);
    }
    mesh = new CGL.Mesh(cgl, geometry);

    outGeometry.set(null);
    outGeometry.set(geometry);
}

inFrames.onChange = () =>
{
    FlipbookFrames = Math.sqrt(inFrames.get());
    createGeo();
};

inAnimMode.onChange = function ()
{
    mod.toggleDefine("MOD_ANIM", inToggleAnim.get());
    if (inAnimMode.get() === "Lines")
    {
        mod.toggleDefine("MOD_ANIM_LINES", true);
        mod.toggleDefine("MOD_ANIM_FLIPBOOK", false);
    }
    else if (inAnimMode.get() === "Flipbook")
    {
        mod.toggleDefine("MOD_ANIM_FLIPBOOK", true);
        mod.toggleDefine("MOD_ANIM_LINES", false);
    }
    createGeo();
};

inToggleAnim.onChange = () =>
{
    mod.toggleDefine("MOD_ANIM", inToggleAnim.get());
    createGeo();
};

inXYZ.onChange = () =>
{
    createGeo();
};

inAnimMode.onChange();
inToggleAnim.onChange();
inToggleRGB.onChange();
inToggleAlphaNorm.onChange();

inTrigger.onTriggered = function ()
{
    mod.bind();
    if (inXYZ.get()) mod.pushTexture("MOD_XYZ", inXYZ.get().tex);
    if (inRGB.get()) mod.pushTexture("MOD_RGB", inRGB.get().tex);
    if (inNorm.get()) mod.pushTexture("MOD_Norm", inNorm.get().tex);
    mod.setUniformValue("MOD_size", size);
    mod.setUniformValue("MOD_FlipbookFrames", FlipbookFrames);

    mesh.render(cgl.getShader());

    outTrigger.trigger();

    mod.unbind();
};

}
};






// **************************************************************
// 
// Ops.Gl.FaceCulling_v2
// 
// **************************************************************

Ops.Gl.FaceCulling_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    STR_FRONT = "Front Sides",
    STR_BACK = "Back Sides",
    STR_BOTH = "All",
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    facing = op.inSwitch("Discard", [STR_BACK, STR_FRONT, STR_BOTH], STR_BACK),
    enable = op.inValueBool("Active", true),
    cgl = op.patch.cgl;

op.setPortGroup("Face Fulling", [enable, facing]);
let whichFace = cgl.gl.BACK;
let updateFacing = true;

render.onTriggered = function ()
{
    const cg = op.patch.cg;

    if (!cg) return;

    if (updateFacing)
    {
        whichFace = cg.CULL_MODES[CABLES.CG.CULL_BACK];
        if (facing.get() == STR_FRONT) whichFace = cg.CULL_MODES[CABLES.CG.CULL_FRONT];
        else if (facing.get() == STR_BOTH) whichFace = cg.CULL_MODES[CABLES.CG.CULL_BOTH];
    }

    cg.pushCullFace(enable.get());
    cg.pushCullFaceFacing(whichFace);

    trigger.trigger();

    cg.popCullFace();
    cg.popCullFaceFacing();
};

enable.onChange = () =>
{
    facing.setUiAttribs({ "greyout": !enable.get() });
};

facing.onChange = () =>
{
    updateFacing = true;
};

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.Noise.PerlinNoise_v2
// 
// **************************************************************

Ops.Gl.ImageCompose.Noise.PerlinNoise_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"perlinnoise3d_frag":"UNI float z;\nUNI float x;\nUNI float y;\nUNI float scale;\nUNI float rangeMul;\nUNI float harmonics;\nUNI float aspect;\n\nIN vec2 texCoord;\nUNI sampler2D tex;\n\n#ifdef HAS_TEX_OFFSETMAP\n    UNI sampler2D texOffsetZ;\n    UNI float offMul;\n#endif\n\n#ifdef HAS_TEX_MASK\n    UNI sampler2D texMask;\n#endif\n\nUNI float amount;\n\n{{CGL.BLENDMODES3}}\n\n\nfloat Interpolation_C2( float x ) { return x * x * x * (x * (x * 6.0 - 15.0) + 10.0); }   //  6x^5-15x^4+10x^3\t( Quintic Curve.  As used by Perlin in Improved Noise.  http://mrl.nyu.edu/~perlin/paper445.pdf )\nvec2 Interpolation_C2( vec2 x ) { return x * x * x * (x * (x * 6.0 - 15.0) + 10.0); }\nvec3 Interpolation_C2( vec3 x ) { return x * x * x * (x * (x * 6.0 - 15.0) + 10.0); }\nvec4 Interpolation_C2( vec4 x ) { return x * x * x * (x * (x * 6.0 - 15.0) + 10.0); }\nvec4 Interpolation_C2_InterpAndDeriv( vec2 x ) { return x.xyxy * x.xyxy * ( x.xyxy * ( x.xyxy * ( x.xyxy * vec2( 6.0, 0.0 ).xxyy + vec2( -15.0, 30.0 ).xxyy ) + vec2( 10.0, -60.0 ).xxyy ) + vec2( 0.0, 30.0 ).xxyy ); }\nvec3 Interpolation_C2_Deriv( vec3 x ) { return x * x * (x * (x * 30.0 - 60.0) + 30.0); }\n\n\nvoid FAST32_hash_3D( vec3 gridcell, out vec4 lowz_hash, out vec4 highz_hash )\t//\tgenerates a random number for each of the 8 cell corners\n{\n    //    gridcell is assumed to be an integer coordinate\n\n    //\tTODO: \tthese constants need tweaked to find the best possible noise.\n    //\t\t\tprobably requires some kind of brute force computational searching or something....\n    const vec2 OFFSET = vec2( 50.0, 161.0 );\n    const float DOMAIN = 69.0;\n    const float SOMELARGEFLOAT = 635.298681;\n    const float ZINC = 48.500388;\n\n    //\ttruncate the domain\n    gridcell.xyz = gridcell.xyz - floor(gridcell.xyz * ( 1.0 / DOMAIN )) * DOMAIN;\n    vec3 gridcell_inc1 = step( gridcell, vec3( DOMAIN - 1.5 ) ) * ( gridcell + 1.0 );\n\n    //\tcalculate the noise\n    vec4 P = vec4( gridcell.xy, gridcell_inc1.xy ) + OFFSET.xyxy;\n    P *= P;\n    P = P.xzxz * P.yyww;\n    highz_hash.xy = vec2( 1.0 / ( SOMELARGEFLOAT + vec2( gridcell.z, gridcell_inc1.z ) * ZINC ) );\n    lowz_hash = fract( P * highz_hash.xxxx );\n    highz_hash = fract( P * highz_hash.yyyy );\n}\n\n\n\n\nvoid FAST32_hash_3D( \tvec3 gridcell,\n                        out vec4 lowz_hash_0,\n                        out vec4 lowz_hash_1,\n                        out vec4 lowz_hash_2,\n                        out vec4 highz_hash_0,\n                        out vec4 highz_hash_1,\n                        out vec4 highz_hash_2\t)\t\t//\tgenerates 3 random numbers for each of the 8 cell corners\n{\n    //    gridcell is assumed to be an integer coordinate\n\n    //\tTODO: \tthese constants need tweaked to find the best possible noise.\n    //\t\t\tprobably requires some kind of brute force computational searching or something....\n    const vec2 OFFSET = vec2( 50.0, 161.0 );\n    const float DOMAIN = 69.0;\n    const vec3 SOMELARGEFLOATS = vec3( 635.298681, 682.357502, 668.926525 );\n    const vec3 ZINC = vec3( 48.500388, 65.294118, 63.934599 );\n\n    //\ttruncate the domain\n    gridcell.xyz = gridcell.xyz - floor(gridcell.xyz * ( 1.0 / DOMAIN )) * DOMAIN;\n    vec3 gridcell_inc1 = step( gridcell, vec3( DOMAIN - 1.5 ) ) * ( gridcell + 1.0 );\n\n    //\tcalculate the noise\n    vec4 P = vec4( gridcell.xy, gridcell_inc1.xy ) + OFFSET.xyxy;\n    P *= P;\n    P = P.xzxz * P.yyww;\n    vec3 lowz_mod = vec3( 1.0 / ( SOMELARGEFLOATS.xyz + gridcell.zzz * ZINC.xyz ) );\n    vec3 highz_mod = vec3( 1.0 / ( SOMELARGEFLOATS.xyz + gridcell_inc1.zzz * ZINC.xyz ) );\n    lowz_hash_0 = fract( P * lowz_mod.xxxx );\n    highz_hash_0 = fract( P * highz_mod.xxxx );\n    lowz_hash_1 = fract( P * lowz_mod.yyyy );\n    highz_hash_1 = fract( P * highz_mod.yyyy );\n    lowz_hash_2 = fract( P * lowz_mod.zzzz );\n    highz_hash_2 = fract( P * highz_mod.zzzz );\n}\nfloat Falloff_Xsq_C1( float xsq ) { xsq = 1.0 - xsq; return xsq*xsq; }\t// ( 1.0 - x*x )^2   ( Used by Humus for lighting falloff in Just Cause 2.  GPUPro 1 )\nfloat Falloff_Xsq_C2( float xsq ) { xsq = 1.0 - xsq; return xsq*xsq*xsq; }\t// ( 1.0 - x*x )^3.   NOTE: 2nd derivative is 0.0 at x=1.0, but non-zero at x=0.0\nvec4 Falloff_Xsq_C2( vec4 xsq ) { xsq = 1.0 - xsq; return xsq*xsq*xsq; }\n\n\n//\n//\tPerlin Noise 3D  ( gradient noise )\n//\tReturn value range of -1.0->1.0\n//\thttp://briansharpe.files.wordpress.com/2011/11/perlinsample.jpg\n//\nfloat Perlin3D( vec3 P )\n{\n    //\testablish our grid cell and unit position\n    vec3 Pi = floor(P);\n    vec3 Pf = P - Pi;\n    vec3 Pf_min1 = Pf - 1.0;\n\n#if 1\n    //\n    //\tclassic noise.\n    //\trequires 3 random values per point.  with an efficent hash function will run faster than improved noise\n    //\n\n    //\tcalculate the hash.\n    //\t( various hashing methods listed in order of speed )\n    vec4 hashx0, hashy0, hashz0, hashx1, hashy1, hashz1;\n    FAST32_hash_3D( Pi, hashx0, hashy0, hashz0, hashx1, hashy1, hashz1 );\n    //SGPP_hash_3D( Pi, hashx0, hashy0, hashz0, hashx1, hashy1, hashz1 );\n\n    //\tcalculate the gradients\n    vec4 grad_x0 = hashx0 - 0.49999;\n    vec4 grad_y0 = hashy0 - 0.49999;\n    vec4 grad_z0 = hashz0 - 0.49999;\n    vec4 grad_x1 = hashx1 - 0.49999;\n    vec4 grad_y1 = hashy1 - 0.49999;\n    vec4 grad_z1 = hashz1 - 0.49999;\n    vec4 grad_results_0 = inversesqrt( grad_x0 * grad_x0 + grad_y0 * grad_y0 + grad_z0 * grad_z0 ) * ( vec2( Pf.x, Pf_min1.x ).xyxy * grad_x0 + vec2( Pf.y, Pf_min1.y ).xxyy * grad_y0 + Pf.zzzz * grad_z0 );\n    vec4 grad_results_1 = inversesqrt( grad_x1 * grad_x1 + grad_y1 * grad_y1 + grad_z1 * grad_z1 ) * ( vec2( Pf.x, Pf_min1.x ).xyxy * grad_x1 + vec2( Pf.y, Pf_min1.y ).xxyy * grad_y1 + Pf_min1.zzzz * grad_z1 );\n\n#if 1\n    //\tClassic Perlin Interpolation\n    vec3 blend = Interpolation_C2( Pf );\n    vec4 res0 = mix( grad_results_0, grad_results_1, blend.z );\n    vec4 blend2 = vec4( blend.xy, vec2( 1.0 - blend.xy ) );\n    float final = dot( res0, blend2.zxzx * blend2.wwyy );\n    final *= 1.1547005383792515290182975610039;\t\t//\t(optionally) scale things to a strict -1.0->1.0 range    *= 1.0/sqrt(0.75)\n    return final;\n#else\n    //\tClassic Perlin Surflet\n    //\thttp://briansharpe.wordpress.com/2012/03/09/modifications-to-classic-perlin-noise/\n    Pf *= Pf;\n    Pf_min1 *= Pf_min1;\n    vec4 vecs_len_sq = vec4( Pf.x, Pf_min1.x, Pf.x, Pf_min1.x ) + vec4( Pf.yy, Pf_min1.yy );\n    float final = dot( Falloff_Xsq_C2( min( vec4( 1.0 ), vecs_len_sq + Pf.zzzz ) ), grad_results_0 ) + dot( Falloff_Xsq_C2( min( vec4( 1.0 ), vecs_len_sq + Pf_min1.zzzz ) ), grad_results_1 );\n    final *= 2.3703703703703703703703703703704;\t\t//\t(optionally) scale things to a strict -1.0->1.0 range    *= 1.0/cube(0.75)\n    return final;\n#endif\n\n#else\n    //\n    //\timproved noise.\n    //\trequires 1 random value per point.  Will run faster than classic noise if a slow hashing function is used\n    //\n\n    //\tcalculate the hash.\n    //\t( various hashing methods listed in order of speed )\n    vec4 hash_lowz, hash_highz;\n    FAST32_hash_3D( Pi, hash_lowz, hash_highz );\n    //BBS_hash_3D( Pi, hash_lowz, hash_highz );\n    //SGPP_hash_3D( Pi, hash_lowz, hash_highz );\n\n    //\n    //\t\"improved\" noise using 8 corner gradients.  Faster than the 12 mid-edge point method.\n    //\tKen mentions using diagonals like this can cause \"clumping\", but we'll live with that.\n    //\t[1,1,1]  [-1,1,1]  [1,-1,1]  [-1,-1,1]\n    //\t[1,1,-1] [-1,1,-1] [1,-1,-1] [-1,-1,-1]\n    //\n    hash_lowz -= 0.5;\n    vec4 grad_results_0_0 = vec2( Pf.x, Pf_min1.x ).xyxy * sign( hash_lowz );\n    hash_lowz = abs( hash_lowz ) - 0.25;\n    vec4 grad_results_0_1 = vec2( Pf.y, Pf_min1.y ).xxyy * sign( hash_lowz );\n    vec4 grad_results_0_2 = Pf.zzzz * sign( abs( hash_lowz ) - 0.125 );\n    vec4 grad_results_0 = grad_results_0_0 + grad_results_0_1 + grad_results_0_2;\n\n    hash_highz -= 0.5;\n    vec4 grad_results_1_0 = vec2( Pf.x, Pf_min1.x ).xyxy * sign( hash_highz );\n    hash_highz = abs( hash_highz ) - 0.25;\n    vec4 grad_results_1_1 = vec2( Pf.y, Pf_min1.y ).xxyy * sign( hash_highz );\n    vec4 grad_results_1_2 = Pf_min1.zzzz * sign( abs( hash_highz ) - 0.125 );\n    vec4 grad_results_1 = grad_results_1_0 + grad_results_1_1 + grad_results_1_2;\n\n    //\tblend the gradients and return\n    vec3 blend = Interpolation_C2( Pf );\n    vec4 res0 = mix( grad_results_0, grad_results_1, blend.z );\n    vec4 blend2 = vec4( blend.xy, vec2( 1.0 - blend.xy ) );\n    return dot( res0, blend2.zxzx * blend2.wwyy ) * (2.0 / 3.0);\t//\t(optionally) mult by (2.0/3.0) to scale to a strict -1.0->1.0 range\n#endif\n}\n\nvoid main()\n{\n    vec4 base=texture(tex,texCoord);\n    vec2 p=vec2(texCoord.x-0.5,texCoord.y-0.5);\n\n    p=p*scale;\n    p=vec2(p.x+0.5-x,p.y+0.5-y);\n\n\n\n    vec3 offset;\n    #ifdef HAS_TEX_OFFSETMAP\n        vec4 offMap=texture(texOffsetZ,texCoord);\n\n        #ifdef OFFSET_X_R\n            offset.x=offMap.r;\n        #endif\n        #ifdef OFFSET_X_G\n            offset.x=offMap.g;\n        #endif\n        #ifdef OFFSET_X_B\n            offset.x=offMap.b;\n        #endif\n\n        #ifdef OFFSET_Y_R\n            offset.y=offMap.r;\n        #endif\n        #ifdef OFFSET_Y_G\n            offset.y=offMap.g;\n        #endif\n        #ifdef OFFSET_Y_B\n            offset.y=offMap.b;\n        #endif\n\n        #ifdef OFFSET_Z_R\n            offset.z=offMap.r;\n        #endif\n        #ifdef OFFSET_Z_G\n            offset.z=offMap.g;\n        #endif\n        #ifdef OFFSET_Z_B\n            offset.z=offMap.b;\n        #endif\n        offset*=offMul;\n    #endif\n\n    float aa=texture(tex,texCoord).r;\n\n    float v = 0.0;\n    p.x*=aspect;\n\n    v+=Perlin3D(vec3(p.x,p.y,z)+offset);\n\n    #ifdef HARMONICS\n        if (harmonics >= 2.0) v += Perlin3D(vec3(p.x,p.y,z)*2.2+offset) * 0.5;\n        if (harmonics >= 3.0) v += Perlin3D(vec3(p.x,p.y,z)*4.3+offset) * 0.25;\n        if (harmonics >= 4.0) v += Perlin3D(vec3(p.x,p.y,z)*8.4+offset) * 0.125;\n        if (harmonics >= 5.0) v += Perlin3D(vec3(p.x,p.y,z)*16.5+offset) * 0.0625;\n    #endif\n\n\n    v*=rangeMul;\n    v=v*0.5+0.5;\n    float v2=v;\n    float v3=v;\n\n    #ifdef RGB\n        v2=Perlin3D(vec3(p.x+2.0,p.y+2.0,z))*0.5+0.5;\n\n        #ifdef HARMONICS\n            if (harmonics >= 2.0) v2 += Perlin3D(vec3(p.x,p.y,z)*2.2+offset) * 0.5;\n            if (harmonics >= 3.0) v2 += Perlin3D(vec3(p.x,p.y,z)*4.3+offset) * 0.25;\n            if (harmonics >= 4.0) v2 += Perlin3D(vec3(p.x,p.y,z)*8.4+offset) * 0.125;\n            if (harmonics >= 5.0) v2 += Perlin3D(vec3(p.x,p.y,z)*16.5+offset) * 0.0625;\n        #endif\n\n        v3=Perlin3D(vec3(p.x+3.0,p.y+3.0,z))*0.5+0.5;\n\n        #ifdef HARMONICS\n            if (harmonics >= 2.0) v3 += Perlin3D(vec3(p.x,p.y,z)*2.2+offset) * 0.5;\n            if (harmonics >= 3.0) v3 += Perlin3D(vec3(p.x,p.y,z)*4.3+offset) * 0.25;\n            if (harmonics >= 4.0) v3 += Perlin3D(vec3(p.x,p.y,z)*8.4+offset) * 0.125;\n            if (harmonics >= 5.0) v3 += Perlin3D(vec3(p.x,p.y,z)*16.5+offset) * 0.0625;\n        #endif\n\n    #endif\n\n    vec4 col=vec4(v,v2,v3,1.0);\n\n    float str=1.0;\n    #ifdef HAS_TEX_MASK\n        str=texture(texMask,texCoord).r;\n    #endif\n\n    #ifdef RANGE_MIN1\n        col=col*2.0-1.0;\n    #endif\n\n    col=cgl_blendPixel(base,col,amount*str);\n\n\n    #ifdef NO_CHANNEL_R\n        col.r=base.r;\n    #endif\n    #ifdef NO_CHANNEL_G\n        col.g=base.g;\n    #endif\n    #ifdef NO_CHANNEL_B\n        col.b=base.b;\n    #endif\n\n\n\n    outColor=col;\n}\n",};
const
    render = op.inTrigger("render"),
    inTexMask = op.inTexture("Mask"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),
    amount = op.inValueSlider("Amount", 1),
    inMode = op.inSwitch("Color", ["Mono", "RGB", "R", "G", "B"], "Mono"),
    scale = op.inValue("Scale", 8),
    rangeMul = op.inValue("Multiply", 1),
    valueRange = op.inSwitch("Value", ["0-1", "-1-1"], "0-1"),
    inHarmonics = op.inSwitch("Harmonics", ["1", "2", "3", "4", "5"], "1"),
    x = op.inValue("X", 0),
    y = op.inValue("Y", 0),
    z = op.inValue("Z", 0),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "perlinnoise");

op.setPortGroup("Position", [x, y, z]);

shader.setSource(shader.getDefaultVertexShader(), attachments.perlinnoise3d_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    textureUniformOffZ = new CGL.Uniform(shader, "t", "texOffsetZ", 1),
    textureUniformMask = new CGL.Uniform(shader, "t", "texMask", 2),

    uniZ = new CGL.Uniform(shader, "f", "z", z),
    uniX = new CGL.Uniform(shader, "f", "x", x),
    uniY = new CGL.Uniform(shader, "f", "y", y),
    uniScale = new CGL.Uniform(shader, "f", "scale", scale),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    rangeMulUniform = new CGL.Uniform(shader, "f", "rangeMul", rangeMul);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);

// offsetMap

const
    inTexOffsetZ = op.inTexture("Offset"),
    inOffsetMul = op.inFloat("Offset Multiply", 1),
    offsetX = op.inSwitch("Offset X", ["None", "R", "G", "B"], "None"),
    offsetY = op.inSwitch("Offset Y", ["None", "R", "G", "B"], "None"),
    offsetZ = op.inSwitch("Offset Z", ["None", "R", "G", "B"], "R");

op.setPortGroup("Offset Map", [inTexOffsetZ, offsetZ, offsetY, offsetX, inOffsetMul]);

const uniOffMul = new CGL.Uniform(shader, "f", "offMul", inOffsetMul);

const uniAspect = new CGL.Uniform(shader, "f", "aspect", 1);
const uniHarmonics = new CGL.Uniform(shader, "f", "harmonics", 0);

inHarmonics.onChange = () =>
{
    uniHarmonics.setValue(parseFloat(inHarmonics.get()));
    shader.toggleDefine("HARMONICS", inHarmonics.get() > 1);
};

valueRange.onChange =
    offsetX.onChange =
    offsetY.onChange =
    offsetZ.onChange =
    inTexMask.onChange =
    inMode.onChange =
    inTexOffsetZ.onChange = updateDefines;
updateDefines();

function updateDefines()
{
    shader.toggleDefine("NO_CHANNEL_R", inMode.get() == "G" || inMode.get() == "B");
    shader.toggleDefine("NO_CHANNEL_G", inMode.get() == "R" || inMode.get() == "B");
    shader.toggleDefine("NO_CHANNEL_B", inMode.get() == "R" || inMode.get() == "G");

    shader.toggleDefine("HAS_TEX_OFFSETMAP", inTexOffsetZ.get());
    shader.toggleDefine("HAS_TEX_MASK", inTexMask.get());

    shader.toggleDefine("OFFSET_X_R", offsetX.get() == "R");
    shader.toggleDefine("OFFSET_X_G", offsetX.get() == "G");
    shader.toggleDefine("OFFSET_X_B", offsetX.get() == "B");

    shader.toggleDefine("OFFSET_Y_R", offsetY.get() == "R");
    shader.toggleDefine("OFFSET_Y_G", offsetY.get() == "G");
    shader.toggleDefine("OFFSET_Y_B", offsetY.get() == "B");

    shader.toggleDefine("OFFSET_Z_R", offsetZ.get() == "R");
    shader.toggleDefine("OFFSET_Z_G", offsetZ.get() == "G");
    shader.toggleDefine("OFFSET_Z_B", offsetZ.get() == "B");

    shader.toggleDefine("RANGE_MIN1", valueRange.get() == "-1-1");

    offsetX.setUiAttribs({ "greyout": !inTexOffsetZ.isLinked() });
    offsetY.setUiAttribs({ "greyout": !inTexOffsetZ.isLinked() });
    offsetZ.setUiAttribs({ "greyout": !inTexOffsetZ.isLinked() });
    inOffsetMul.setUiAttribs({ "greyout": !inTexOffsetZ.isLinked() });

    shader.toggleDefine("RGB", inMode.get() == "RGB");
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    uniAspect.setValue(cgl.currentTextureEffect.aspectRatio);

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    if (inTexOffsetZ.get()) cgl.setTexture(1, inTexOffsetZ.get().tex);
    if (inTexMask.get()) cgl.setTexture(2, inTexMask.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Anim.Timer_v2
// 
// **************************************************************

Ops.Anim.Timer_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inSpeed = op.inValue("Speed", 1),
    playPause = op.inValueBool("Play", true),
    reset = op.inTriggerButton("Reset"),
    inSyncTimeline = op.inValueBool("Sync to timeline", false),
    outTime = op.outNumber("Time");

op.setPortGroup("Controls", [playPause, reset, inSpeed]);

const timer = new CABLES.Timer();
let lastTime = null;
let time = 0;
let syncTimeline = false;

playPause.onChange = setState;
setState();

function setState()
{
    if (playPause.get())
    {
        timer.play();
        op.patch.addOnAnimFrame(op);
    }
    else
    {
        timer.pause();
        op.patch.removeOnAnimFrame(op);
    }
}

reset.onTriggered = doReset;

function doReset()
{
    time = 0;
    lastTime = null;
    timer.setTime(0);
    outTime.set(0);
}

inSyncTimeline.onChange = function ()
{
    syncTimeline = inSyncTimeline.get();
    playPause.setUiAttribs({ "greyout": syncTimeline });
    reset.setUiAttribs({ "greyout": syncTimeline });
};

op.onAnimFrame = function (tt, frameNum, deltaMs)
{
    if (timer.isPlaying())
    {
        if (CABLES.overwriteTime !== undefined)
        {
            outTime.set(CABLES.overwriteTime * inSpeed.get());
        }
        else

        if (syncTimeline)
        {
            outTime.set(tt * inSpeed.get());
        }
        else
        {
            timer.update();

            const timerVal = timer.get();

            if (lastTime === null)
            {
                lastTime = timerVal;
                return;
            }

            const t = Math.abs(timerVal - lastTime);
            lastTime = timerVal;

            time += t * inSpeed.get();
            if (time != time)time = 0;
            outTime.set(time);
        }
    }
};

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.ColorChannel_v2
// 
// **************************************************************

Ops.Gl.ImageCompose.ColorChannel_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"colorchannel_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\n\nvoid main()\n{\n    vec4 color=texture(tex,texCoord);\n    vec4 col=vec4(0.0,0.0,0.0,color.a);\n\n   #ifdef CHANNEL_R\n        col.r=color.r;\n        #ifdef MONO\n            col.g=col.b=col.r;\n        #endif\n   #endif\n\n   #ifdef CHANNEL_G\n       col.g=color.g;\n       #ifdef MONO\n            col.r=col.b=col.g;\n       #endif\n   #endif\n\n   #ifdef CHANNEL_B\n       col.b=color.b;\n       #ifdef MONO\n            col.g=col.r=col.b;\n       #endif\n   #endif\n\n   #ifdef CHANNEL_A\n       col.r=col.g=col.b=color.a;\n   #endif\n\n   outColor = col;\n}",};
const
    render = op.inTrigger("render"),
    channelR = op.inValueBool("channelR", true),
    channelG = op.inValueBool("channelG", false),
    channelB = op.inValueBool("channelB", false),
    channelA = op.inValueBool("channelA", false),
    mono = op.inValueBool("mono", false),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.colorchannel_frag || "");
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

mono.onChange =
    channelA.onChange =
    channelR.onChange =
    channelG.onChange =
    channelB.onChange = updateChannels;
updateChannels();

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

function updateChannels()
{
    shader.toggleDefine("CHANNEL_R", channelR.get());
    shader.toggleDefine("CHANNEL_G", channelG.get());
    shader.toggleDefine("CHANNEL_B", channelB.get());
    shader.toggleDefine("CHANNEL_A", channelA.get());
    shader.toggleDefine("MONO", mono.get());
}

}
};






// **************************************************************
// 
// Ops.Math.Multiply
// 
// **************************************************************

Ops.Math.Multiply= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    number1 = op.inValueFloat("number1", 1),
    number2 = op.inValueFloat("number2", 1),
    result = op.outNumber("result");

op.setUiAttribs({ "mathTitle": true });

number1.onChange = number2.onChange = update;
update();

function update()
{
    const n1 = number1.get();
    const n2 = number2.get();

    result.set(n1 * n2);
}

}
};






// **************************************************************
// 
// Ops.Number.Number
// 
// **************************************************************

Ops.Number.Number= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    v = op.inFloat("value"),
    result = op.outNumber("result");

v.onChange = exec;

let isLinked = false;
v.onLinkChanged = () =>
{
    if (!isLinked && v.isLinked())op.setUiAttribs({ "extendTitle": null });
    isLinked = v.isLinked();
};

function exec()
{
    if (CABLES.UI && !isLinked) op.setUiAttribs({ "extendTitle": Math.round(10000 * v.get()) / 10000 });

    result.set(Number(v.get()));
}

}
};






// **************************************************************
// 
// Ops.Graphics.Intersection.IntersectWorld
// 
// **************************************************************

Ops.Graphics.Intersection.IntersectWorld= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    trigger = op.inTrigger("Trigger"),
    inTextCol = op.inBool("Check Body Collisions", false),
    next = op.outTrigger("Next"),
    outNum = op.outNumber("Total Bodies"),
    outCollisions = op.outArray("Collisions", []);

trigger.onTriggered = doRender;

const SHAPE_SPHERE = 1;
const SHAPE_AABB = 2;
const SHAPE_POINT = 3;

const cgl = op.patch.cgl;

function doRender()
{
    cgl.tempData.collisionWorld = { "bodies": [], "testCollision": testCollision };
    next.trigger();

    outNum.set(cgl.tempData.collisionWorld.bodies.length);

    if (inTextCol.get()) checkCollisions();

    // if (render.get())renderBodies();
}

function testCollision(bodyA, bodyB)
{
    if (bodyA.type === SHAPE_SPHERE && bodyB.type === SHAPE_SPHERE)
    {
        const dist = vec3.distance(bodyA.pos, bodyB.pos);

        if (dist < bodyA.radius + bodyB.radius)
        {
            return {
                "body0": bodyA,
                "name0": bodyA.name,
                "body1": bodyB,
                "name1": bodyB.name
            };
        }
    }
    else
    if (bodyA.type === SHAPE_POINT && bodyB.type === SHAPE_POINT)
    {
        if (bodyA.pos[0] === bodyB.pos[0] && bodyA.pos[1] === bodyB.pos[1] && bodyA.pos[2] === bodyB.pos[2])
        {
            return {
                "body0": bodyA,
                "name0": bodyA.name,
                "body1": bodyB,
                "name1": bodyB.name
            };
        }
    }
    else
    if (
        (bodyB.type === SHAPE_SPHERE && bodyA.type === SHAPE_POINT) ||
                    (bodyA.type === SHAPE_SPHERE && bodyB.type === SHAPE_POINT)
    )
    {
        let bodyPoint = bodyA;
        let bodySphere = bodyB;

        if (bodyA.type === SHAPE_SPHERE)
        {
            bodyPoint = bodyB;
            bodySphere = bodyA;
        }

        const xd = Math.abs(bodyPoint.pos[0] - bodySphere.pos[0]);
        const yd = Math.abs(bodyPoint.pos[1] - bodySphere.pos[1]);
        const zd = Math.abs(bodyPoint.pos[2] - bodySphere.pos[2]);
        const dist = Math.sqrt(xd * xd + yd * yd + zd * zd);

        if (dist < bodySphere.radius)
        {
            return {
                "body0": bodyA,
                "name0": bodyA.name,
                "body1": bodyB,
                "name1": bodyB.name };
        }
    }
    else
    if (
        (bodyB.type === SHAPE_AABB && bodyA.type === SHAPE_POINT) ||
                    (bodyA.type === SHAPE_AABB && bodyB.type === SHAPE_POINT)
    )
    {
        let bodyPoint = bodyA;
        let bodyBox = bodyB;

        if (bodyA.type === SHAPE_AABB)
        {
            bodyPoint = bodyB;
            bodyBox = bodyA;
        }

        if (
            (bodyPoint.pos[0] > bodyBox.minX && bodyPoint.pos[0] < bodyBox.maxX) &&
            (bodyPoint.pos[1] > bodyBox.minY && bodyPoint.pos[1] < bodyBox.maxY) &&
            (bodyPoint.pos[2] > bodyBox.minZ && bodyPoint.pos[2] < bodyBox.maxZ)
        )
        {
            return {
                "body0": bodyA,
                "name0": bodyA.name,
                "body1": bodyB,
                "name1": bodyB.name };
        }
    }
    else
    if ((bodyA.type === SHAPE_SPHERE && bodyB.type === SHAPE_AABB) || (bodyA.type === SHAPE_AABB && bodyB.type === SHAPE_SPHERE))
    {
        let bBox = bodyA;
        let bSphere = bodyB;
        if (bodyB.type === SHAPE_AABB)
        {
            bBox = bodyB;
            bSphere = bodyA;
        }

        let r2 = bSphere.radius * bSphere.radius;
        let dmin = 0;

        let dist_squared = bSphere.radius * bSphere.radius;
        /* assume bBox.minand C2 are element-wise sorted, if not, do that now */
        if (bSphere.pos[0] < bBox.minX) dist_squared -= (bSphere.pos[0] - bBox.minX) ** 2;
        else if (bSphere.pos[0] > bBox.maxX) dist_squared -= (bSphere.pos[0] - bBox.maxX) ** 2;
        if (bSphere.pos[1] < bBox.minY) dist_squared -= (bSphere.pos[1] - bBox.minY) ** 2;
        else if (bSphere.pos[1] > bBox.maxY) dist_squared -= (bSphere.pos[1] - bBox.maxY) ** 2;
        if (bSphere.pos[2] < bBox.minZ) dist_squared -= (bSphere.pos[2] - bBox.minZ) ** 2;
        else if (bSphere.pos[2] > bBox.maxZ) dist_squared -= (bSphere.pos[2] - bBox.maxZ) ** 2;

        if (dist_squared > 0)
        {
            return {
                "body0": bodyA,
                "name0": bodyA.name,
                "body1": bodyB,
                "name1": bodyB.name
            };
        }
    }
    else
    {
        console.warn("unknown collision pair...", bodyA.type, bodyB.type);
    }
}

function checkCollisions()
{
    const collisions = [];
    const bodies = cgl.tempData.collisionWorld.bodies;

    for (let j = 0; j < bodies.length; j++)
    {
        for (let i = j + 1; i < bodies.length; i++)
        {
            if (i != j)
            {
                const c = testCollision(bodies[i], bodies[j]);
                if (c)collisions.push(c);
            }
        }
    }
    outCollisions.setRef(collisions, []);
}

}
};






// **************************************************************
// 
// Ops.Graphics.Intersection.IntersectTestRaycast
// 
// **************************************************************

Ops.Graphics.Intersection.IntersectTestRaycast= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    trigger = op.inTrigger("Trigger"),
    inCoords = op.inSwitch("Coordinate Format", ["-1 to 1", "XYZ-XYZ"], "-1 to 1"),
    inX = op.inValueFloat("X"),
    inY = op.inValueFloat("Y"),

    inZ = op.inValueFloat("Z"),

    inToX = op.inValueFloat("To X"),
    inToY = op.inValueFloat("To Y"),
    inToZ = op.inValueFloat("To Z"),

    active = op.inBool("Active", true),
    inCursor = op.inBool("Change Cursor", true),
    next = op.outTrigger("Next"),
    outHasHit = op.outBoolNum("Has Hit", false),
    outName = op.outString("Hit Body Name", ""),
    outX = op.outNumber("Hit X"),
    outY = op.outNumber("Hit Y"),
    outZ = op.outNumber("Hit Z");

const cgl = op.patch.cgl;
const oc = vec3.create();
const mat = mat4.create();
const dir = vec3.create();
let didsetCursor = false;
let isScreenCoords = true;

op.toWorkPortsNeedToBeLinked(trigger);

trigger.onTriggered = doRender;

inCoords.onChange = updateUi;
updateUi();

function updateUi()
{
    inZ.setUiAttribs({ "greyout": inCoords.get() != "XYZ-XYZ" });

    inToX.setUiAttribs({ "greyout": inCoords.get() != "XYZ-XYZ" });
    inToY.setUiAttribs({ "greyout": inCoords.get() != "XYZ-XYZ" });
    inToZ.setUiAttribs({ "greyout": inCoords.get() != "XYZ-XYZ" });
}

function doRender()
{
    next.trigger();

    if (cgl.tempData.collisionWorld && active.get())
    {
        let origin = vec3.create();

        if (inCoords.get() == "-1 to 1")
        {
            origin = vec3.fromValues(inX.get(), inY.get(), -1);
            mat4.mul(mat, cgl.pMatrix, cgl.vMatrix);
            mat4.invert(mat, mat);
            vec3.transformMat4(origin, origin, mat);
        }

        if (inCoords.get() == "XYZ-XYZ")
        {
            origin = vec3.fromValues(inX.get(), inY.get(), inZ.get());
        }

        // -----------

        let to = vec3.create();

        if (inCoords.get() == "-1 to 1")
        {
            to = vec3.fromValues(inX.get(), inY.get(), 1);
            mat4.mul(mat, cgl.pMatrix, cgl.vMatrix);
            mat4.invert(mat, mat);
            vec3.transformMat4(to, to, mat);
        }

        if (inCoords.get() == "XYZ-XYZ")
        {
            to = vec3.fromValues(inToX.get(), inToY.get(), inToZ.get());
        }

        vec3.sub(dir, to, origin);
        vec3.normalize(dir, dir);
        const a = vec3.dot(dir, dir);

        let foundDist = 9999999;

        let found = false;
        const bodies = cgl.tempData.collisionWorld.bodies;
        for (let i = 0; i < bodies.length; i++)
        {
            // if (found) break;

            const body = bodies[i];
            if (body.type == 1) // sphere
            {
                vec3.sub(oc, origin, body.pos);
                const b = 2 * vec3.dot(oc, dir);
                const c = vec3.dot(oc, oc) - (body.radius * body.radius);
                const discriminant = b * b - 4 * a * c;

                if (discriminant > 0)
                {
                    const dist = (-b - Math.sqrt(discriminant)) / (2 + a);
                    if (dist < foundDist)
                    {
                        found = true;
                        outName.set(body.name);
                        outHasHit.set(true);

                        foundDist = dist;

                        vec3.mul(oc, dir, [dist, dist, dist]);
                        vec3.add(oc, oc, origin);

                        outX.set(oc[0]);
                        outY.set(oc[1]);
                        outZ.set(oc[2]);
                    }
                }
            }
            else if (body.type == 2) // aabb
            {
                const t1 = (body.minX - origin[0]) / dir[0];
                const t2 = (body.maxX - origin[0]) / dir[0];

                const t3 = (body.minY - origin[1]) / dir[1];
                const t4 = (body.maxY - origin[1]) / dir[1];

                const t5 = (body.minZ - origin[2]) / dir[2];
                const t6 = (body.maxZ - origin[2]) / dir[2];

                const tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
                const tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6));

                // // if tmax < 0, ray (line) is intersecting AABB, but whole AABB is behing us
                if (tmax < 0) continue;

                // if tmin > tmax, ray doesn't intersect AABB
                if (tmin > tmax) continue;

                found = true;
                outName.set(body.name);
                outHasHit.set(true);

                vec3.mul(oc, dir, [tmin, tmin, tmin]);
                vec3.add(oc, oc, origin);

                outX.set(oc[0]);
                outY.set(oc[1]);
                outZ.set(oc[2]);
            }
        }

        if (!found)
        {
            outName.set("");
            outHasHit.set(false);
            outX.set(0);
            outY.set(0);
            outZ.set(0);
        }
    }
}

}
};






// **************************************************************
// 
// Ops.Graphics.Intersection.IntersectBody
// 
// **************************************************************

Ops.Graphics.Intersection.IntersectBody= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    shapes = ["Sphere", "BoxAA", "Point"],
    trigger = op.inTrigger("Trigger"),
    inArea = op.inSwitch("Shape", shapes, "Sphere"),
    inName = op.inString("Name", ""),
    inRadius = op.inFloat("Radius", 0.5),
    inSizeX = op.inFloat("Size X", 1),
    inSizeY = op.inFloat("Size Y", 1),
    inSizeZ = op.inFloat("Size Z", 1),
    inPositions = op.inArray("Positions", null, 3),
    inPosIndex = op.inBool("Append Index to name", true),
    next = op.outTrigger("Next");

op.setPortGroup("Array", [inPositions, inPosIndex]);

const cgl = op.patch.cgl;
const pos = vec3.create();
const empty = vec3.create();

updateUi();

let objs = [];
let obj =
{
    "name": "???",
    "type": 1,
};

trigger.onTriggered = render;

function getCopyObj()
{
    return { "name": obj.name, "type": obj.type };
}

inArea.onChange = () =>
{
    obj.type = shapes.indexOf(inArea.get()) + 1;
    updateUi();
};

function updateUi()
{
    inRadius.setUiAttribs({ "greyout": inArea.get() != "Sphere" });
    inSizeX.setUiAttribs({ "greyout": inArea.get() != "BoxAA" });
    inSizeY.setUiAttribs({ "greyout": inArea.get() != "BoxAA" });
    inSizeZ.setUiAttribs({ "greyout": inArea.get() != "BoxAA" });
}

function setBox(o)
{
    o.minX = o.pos[0] - o.size[0] / 2;
    o.maxX = o.pos[0] + o.size[0] / 2;

    o.minY = o.pos[1] - o.size[1] / 2;
    o.maxY = o.pos[1] + o.size[1] / 2;

    o.minZ = o.pos[2] - o.size[2] / 2;
    o.maxZ = o.pos[2] + o.size[2] / 2;
}

const SHAPE_SPHERE = 1;
const SHAPE_AABB = 2;
const SHAPE_POINT = 3;

function renderOverlay(body)
{
    if (!CABLES.UI) return;
    if (!cgl.shouldDrawHelpers(op)) return;
    // const collisions = [];
    // const bodies = cgl.tempData.collisionWorld.bodies;

    // for (let i = 0; i < bodies.length; i++)
    // {
    // const body = bodies[i];

    if (body.type === SHAPE_SPHERE) // sphere
    {
        // console.log("sphere")
        cgl.pushModelMatrix();
        // mat4.translate(cgl.mMatrix, cgl.mMatrix, body.pos);
        CABLES.UI.OverlayMeshes.drawSphere(op, body.radius, true);
        cgl.popModelMatrix();
    }
    else if (body.type === SHAPE_AABB) // AABB
    {
        cgl.pushModelMatrix();
        // mat4.translate(cgl.mMatrix, cgl.mMatrix, body.pos);
        CABLES.UI.OverlayMeshes.drawCube(op, body.size[0] / 2, body.size[1] / 2, body.size[2] / 2);
        cgl.popModelMatrix();
    }
    else if (body.type === SHAPE_POINT) // point
    {
        cgl.pushModelMatrix();
        // mat4.translate(cgl.mMatrix, cgl.mMatrix, body.pos);
        CABLES.UI.OverlayMeshes.drawAxisMarker(op, 0.05);
        cgl.popModelMatrix();
    }
    else console.warn("[intersectWorld] unknown col shape");

    // }
}

function render()
{
    if (!cgl.tempData || !cgl.tempData.collisionWorld) return;
    const cg = op.patch.cgl;

    // vec3.transformMat4(pos, empty, cg.mMatrix);
    // mat4.getScaling(scale, cg.mMatrix);

    const posArr = inPositions.get();
    const radius = inRadius.get();

    if (posArr && posArr.length > 0 && posArr.length % 3 == 0)
    {
        objs.length = posArr.length / 3;
        for (let i = 0; i < posArr.length; i += 3)
        {
            const o = objs[i / 3] || {};
            if (inPosIndex.get()) o.name = inName.get() + "." + i / 3;
            else o.name = inName.get();

            o.pos = [posArr[i + 0], posArr[i + 1], posArr[i + 2]];
            vec3.transformMat4(o.pos, o.pos, cg.mMatrix);

            // vec3.mul(o.pos, o.pos, scale);
            o.type = obj.type;
            o.size = [inSizeX.get(), inSizeY.get(), inSizeZ.get()];

            if (o.type == 2)setBox(o);
            if (o.type == 1)o.radius = radius;

            cgl.tempData.collisionWorld.bodies.push(o);
            renderOverlay(o);
        }
    }
    else
    {
        const objCopy = getCopyObj();
        cgl.tempData.collisionWorld.bodies.push(objCopy);
        objCopy.name = inName.get();
        objCopy.pos = [0, 0, 0];

        vec3.transformMat4(objCopy.pos, objCopy.pos, cg.mMatrix);

        objCopy.size = [inSizeX.get(), inSizeY.get(), inSizeZ.get()];

        if (objCopy.type == 2)setBox(objCopy);
        if (objCopy.type == 1)objCopy.radius = radius;
        renderOverlay(objCopy);
    }

    next.trigger();
}

}
};






// **************************************************************
// 
// Ops.Devices.Mouse.Mouse_v3
// 
// **************************************************************

Ops.Devices.Mouse.Mouse_v3= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inCoords = op.inSwitch("Coordinates", ["-1 to 1", "Pixel Display", "Pixel", "0 to 1"], "-1 to 1"),
    area = op.inValueSelect("Area", ["Canvas", "Document", "Parent Element", "Canvas Area"], "Canvas"),
    flipY = op.inValueBool("flip y", true),
    rightClickPrevDef = op.inBool("right click prevent default", true),
    touchscreen = op.inValueBool("Touch support", true),
    inPassive = op.inValueBool("Passive Events", false),
    active = op.inValueBool("Active", true),
    outMouseX = op.outNumber("x", 0),
    outMouseY = op.outNumber("y", 0),
    mouseClick = op.outTrigger("click"),
    mouseClickRight = op.outTrigger("click right"),
    mouseDown = op.outBoolNum("Button is down"),
    mouseOver = op.outBoolNum("Mouse is hovering"),
    outMovementX = op.outNumber("Movement X", 0),
    outMovementY = op.outNumber("Movement Y", 0);

const cgl = op.patch.cgl;
let normalize = 1;
let listenerElement = null;
let areaElement = null;

inPassive.onChange =
area.onChange = addListeners;

inCoords.onChange = updateCoordNormalizing;
op.onDelete = removeListeners;

addListeners();

op.on("loadedValueSet", onStart);

function onStart()
{
    if (normalize == 0)
    {
        if (areaElement.clientWidth === 0) setTimeout(onStart, 50);

        outMouseX.set(areaElement.clientWidth / 2);
        outMouseY.set(areaElement.clientHeight / 2);
    }
    else if (normalize == 1)
    {
        outMouseX.set(0);
        outMouseY.set(0);
    }
    else if (normalize == 2)
    {
        outMouseX.set(0.5);
        outMouseY.set(0.5);
    }
    else if (normalize == 3)
    {
        if (areaElement.clientWidth === 0)
        {
            setTimeout(onStart, 50);
        }

        outMouseX.set(areaElement.clientWidth / 2 / cgl.pixelDensity);
        outMouseY.set(areaElement.clientHeight / 2 / cgl.pixelDensity);
    }
    else console.error("unknown normalize mouse", normalize);
}

function setValue(x, y)
{
    x = x || 0;
    y = y || 0;

    if (normalize == 0) // pixel
    {
        outMouseX.set(x);
        outMouseY.set(y);
    }
    else
    if (normalize == 3) // pixel css
    {
        outMouseX.set(x * cgl.pixelDensity);
        outMouseY.set(y * cgl.pixelDensity);
    }
    else
    {
        let w = areaElement.clientWidth / cgl.pixelDensity;
        let h = areaElement.clientHeight / cgl.pixelDensity;

        w = w || 1;
        h = h || 1;

        if (normalize == 1) // -1 to 1
        {
            let xx = (x / w * 2.0 - 1.0);
            let yy = (y / h * 2.0 - 1.0);
            xx = CABLES.clamp(xx, -1, 1);
            yy = CABLES.clamp(yy, -1, 1);

            outMouseX.set(xx);
            outMouseY.set(yy);
        }
        else if (normalize == 2) // 0 to 1
        {
            let xx = x / w;
            let yy = y / h;

            xx = CABLES.clamp(xx, 0, 1);
            yy = CABLES.clamp(yy, 0, 1);

            outMouseX.set(xx);
            outMouseY.set(yy);
        }
    }
}

function checkHovering(e)
{
    if (!areaElement) return;
    const r = areaElement.getBoundingClientRect();

    return (
        e.clientX > r.left &&
        e.clientX < r.left + r.width &&
        e.clientY > r.top &&
        e.clientY < r.top + r.height
    );
}

touchscreen.onChange = function ()
{
    removeListeners();
    addListeners();
};

active.onChange = function ()
{
    if (listenerElement)removeListeners();
    if (active.get())addListeners();
};

function updateCoordNormalizing()
{
    if (inCoords.get() == "Pixel") normalize = 0;
    else if (inCoords.get() == "-1 to 1") normalize = 1;
    else if (inCoords.get() == "0 to 1") normalize = 2;
    else if (inCoords.get() == "Pixel Display") normalize = 3;
}

function onMouseEnter(e)
{
    mouseDown.set(false);
    mouseOver.set(checkHovering(e));
}

function onMouseDown(e)
{
    if (!checkHovering(e)) return;
    mouseDown.set(true);
}

function onMouseUp(e)
{
    mouseDown.set(false);
}

function onClickRight(e)
{
    if (!checkHovering(e)) return;
    mouseClickRight.trigger();
    if (rightClickPrevDef.get()) e.preventDefault();
}

function onmouseclick(e)
{
    if (!checkHovering(e)) return;
    mouseClick.trigger();
}

function onMouseLeave(e)
{
    mouseDown.set(false);
    mouseOver.set(checkHovering(e));
}

function setCoords(e)
{
    let x = e.clientX;
    let y = e.clientY;

    if (area.get() != "Document")
    {
        x = e.offsetX;
        y = e.offsetY;
    }
    if (area.get() === "Canvas Area")
    {
        const r = areaElement.getBoundingClientRect();
        x = e.clientX - r.left;
        y = e.clientY - r.top;

        if (x < 0 || x > r.width || y > r.height || y < 0) return;
        x = CABLES.clamp(x, 0, r.width);
        y = CABLES.clamp(y, 0, r.height);
    }

    if (flipY.get()) y = areaElement.clientHeight - y;

    setValue(x / cgl.pixelDensity, y / cgl.pixelDensity);
}

function onmousemove(e)
{
    mouseOver.set(checkHovering(e));
    if (area.get() === "Canvas Area")
    {
        const r = areaElement.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;

        if (x < 0 || x > r.width || y > r.height || y < 0) return;
    }

    setCoords(e);

    outMovementX.set(e.movementX / cgl.pixelDensity);
    outMovementY.set(e.movementY / cgl.pixelDensity);
}

function ontouchmove(e)
{
    if (event.touches && event.touches.length > 0) setCoords(e.touches[0]);
}

function ontouchstart(event)
{
    mouseDown.set(true);

    if (event.touches && event.touches.length > 0) onMouseDown(event.touches[0]);
}

function ontouchend(event)
{
    mouseDown.set(false);
    onMouseUp();
}

function removeListeners()
{
    if (!listenerElement) return;
    listenerElement.removeEventListener("touchend", ontouchend);
    listenerElement.removeEventListener("touchstart", ontouchstart);
    listenerElement.removeEventListener("touchmove", ontouchmove);

    listenerElement.removeEventListener("click", onmouseclick);
    listenerElement.removeEventListener("mousemove", onmousemove);
    listenerElement.removeEventListener("mouseleave", onMouseLeave);
    listenerElement.removeEventListener("mousedown", onMouseDown);
    listenerElement.removeEventListener("mouseup", onMouseUp);
    listenerElement.removeEventListener("mouseenter", onMouseEnter);
    listenerElement.removeEventListener("contextmenu", onClickRight);
    listenerElement = null;
}

function addListeners()
{
    if (listenerElement || !active.get())removeListeners();
    if (!active.get()) return;

    listenerElement = areaElement = cgl.canvas;

    if (area.get() == "Canvas Area")
    {
        areaElement = cgl.canvas.parentElement;
        listenerElement = document.body;
    }
    if (area.get() == "Document") areaElement = listenerElement = document.body;
    if (area.get() == "Parent Element") listenerElement = areaElement = cgl.canvas.parentElement;

    if (!areaElement)
    {
        op.setUiError("noarea", "could not find area element for mouse", 2);
        return;
    }
    op.setUiError("noarea", null);

    let passive = false;
    if (inPassive.get())passive = { "passive": true };

    if (touchscreen.get())
    {
        listenerElement.addEventListener("touchend", ontouchend, passive);
        listenerElement.addEventListener("touchstart", ontouchstart, passive);
        listenerElement.addEventListener("touchmove", ontouchmove, passive);
    }

    listenerElement.addEventListener("mousemove", onmousemove, passive);
    listenerElement.addEventListener("mouseleave", onMouseLeave, passive);
    listenerElement.addEventListener("mousedown", onMouseDown, passive);
    listenerElement.addEventListener("mouseup", onMouseUp, passive);
    listenerElement.addEventListener("mouseenter", onMouseEnter, passive);
    listenerElement.addEventListener("contextmenu", onClickRight, passive);
    listenerElement.addEventListener("click", onmouseclick, passive);
}

//

}
};






// **************************************************************
// 
// Ops.Graphics.Transform
// 
// **************************************************************

Ops.Graphics.Transform= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    render = op.inTrigger("render"),
    posX = op.inValue("posX", 0),
    posY = op.inValue("posY", 0),
    posZ = op.inValue("posZ", 0),
    scale = op.inValue("scale", 1),
    rotX = op.inValue("rotX", 0),
    rotY = op.inValue("rotY", 0),
    rotZ = op.inValue("rotZ", 0),
    trigger = op.outTrigger("trigger");

op.setPortGroup("Rotation", [rotX, rotY, rotZ]);
op.setPortGroup("Position", [posX, posY, posZ]);
op.setPortGroup("Scale", [scale]);
op.setUiAxisPorts(posX, posY, posZ);

op.toWorkPortsNeedToBeLinked(render, trigger);

const vPos = vec3.create();
const vScale = vec3.create();
const transMatrix = mat4.create();
mat4.identity(transMatrix);

let
    doScale = false,
    doTranslate = false,
    translationChanged = true,
    scaleChanged = true,
    rotChanged = true;

rotX.onChange = rotY.onChange = rotZ.onChange = setRotChanged;
posX.onChange = posY.onChange = posZ.onChange = setTranslateChanged;
scale.onChange = setScaleChanged;

render.onTriggered = function ()
{
    // if(!CGL.TextureEffect.checkOpNotInTextureEffect(op)) return;

    let updateMatrix = false;
    if (translationChanged)
    {
        updateTranslation();
        updateMatrix = true;
    }
    if (scaleChanged)
    {
        updateScale();
        updateMatrix = true;
    }
    if (rotChanged) updateMatrix = true;

    if (updateMatrix) doUpdateMatrix();

    const cg = op.patch.cg || op.patch.cgl;
    cg.pushModelMatrix();
    mat4.multiply(cg.mMatrix, cg.mMatrix, transMatrix);

    trigger.trigger();
    cg.popModelMatrix();

    if (CABLES.UI)
    {
        if (!posX.isLinked() && !posY.isLinked() && !posZ.isLinked())
        {
            gui.setTransform(op.id, posX.get(), posY.get(), posZ.get(), op.uiAttribs.comment);

            if (op.isCurrentUiOp())
                gui.setTransformGizmo({
                    "posX": posX,
                    "posY": posY,
                    "posZ": posZ,
                });
        }
    }
};

// op.transform3d = function ()
// {
//     return { "pos": [posX, posY, posZ] };
// };

function doUpdateMatrix()
{
    mat4.identity(transMatrix);
    if (doTranslate)mat4.translate(transMatrix, transMatrix, vPos);

    if (rotX.get() !== 0)mat4.rotateX(transMatrix, transMatrix, rotX.get() * CGL.DEG2RAD);
    if (rotY.get() !== 0)mat4.rotateY(transMatrix, transMatrix, rotY.get() * CGL.DEG2RAD);
    if (rotZ.get() !== 0)mat4.rotateZ(transMatrix, transMatrix, rotZ.get() * CGL.DEG2RAD);

    if (doScale)mat4.scale(transMatrix, transMatrix, vScale);
    rotChanged = false;
}

function updateTranslation()
{
    doTranslate = false;
    if (posX.get() !== 0.0 || posY.get() !== 0.0 || posZ.get() !== 0.0) doTranslate = true;
    vec3.set(vPos, posX.get(), posY.get(), posZ.get());
    translationChanged = false;
}

function updateScale()
{
    doScale = true;
    vec3.set(vScale, scale.get(), scale.get(), scale.get());
    scaleChanged = false;
}

function setTranslateChanged()
{
    translationChanged = true;
}

function setScaleChanged()
{
    scaleChanged = true;
}

function setRotChanged()
{
    rotChanged = true;
}

doUpdateMatrix();

}
};






// **************************************************************
// 
// Ops.Graphics.Meshes.Sphere_v3
// 
// **************************************************************

Ops.Graphics.Meshes.Sphere_v3= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    TAU = Math.PI * 2,
    inTrigger = op.inTrigger("render"),
    inRadius = op.inValue("radius", 0.5),
    inStacks = op.inValue("stacks", 32),
    inSlices = op.inValue("slices", 32),
    inStacklimit = op.inValueSlider("Filloffset", 1),
    inDraw = op.inValueBool("Render", true),
    outTrigger = op.outTrigger("trigger"),
    outGeometry = op.outObject("geometry", null, "geometry"),
    UP = vec3.fromValues(0, 1, 0),
    RIGHT = vec3.fromValues(1, 0, 0);

let
    cgl = null,
    geom = new CGL.Geometry("Sphere"),
    tmpNormal = vec3.create(),
    tmpVec = vec3.create(),
    needsRebuild = true,
    lastRadius = 0.0,
    doScale = true,
    vScale = vec3.create(),
    mesh = null;
updateScale();
op.onDelete = function () { if (mesh)mesh.dispose(); };

inDraw.onChange = () => { op.setUiAttrib({ "extendTitle": inDraw.get() ? "" : "x" }); };

inTrigger.onTriggered = function ()
{
    cgl = op.patch.cg || op.patch.cgl;
    if (needsRebuild) buildMesh();

    if (doScale)
    {
        cgl.pushModelMatrix();
        mat4.scale(cgl.mMatrix, cgl.mMatrix, vScale);
    }

    if (inDraw.get()) mesh.render(cgl.getShader());

    if (doScale)
    {
        cgl.popModelMatrix();
    }

    outTrigger.trigger();
};

inStacks.onChange =
    inSlices.onChange =
    inStacklimit.onChange =
        () =>
        {
            needsRebuild = true;
        };

outGeometry.onLinkChanged =
    inRadius.onChange =
        () =>
        {
            if (outGeometry.isLinked()) doScale = false;
            else doScale = true;

            if (doScale) updateScale();
            else needsRebuild = true;
        };

function updateScale()
{
    if (doScale && lastRadius != 1.0)needsRebuild = true;
    vec3.set(vScale, inRadius.get(), inRadius.get(), inRadius.get());
}

function buildMesh()
{
    const
        stacks = Math.ceil(Math.max(inStacks.get(), 2)),
        slices = Math.ceil(Math.max(inSlices.get(), 3)),
        stackLimit = Math.min(Math.max(inStacklimit.get() * stacks, 1), stacks);
    let radius = inRadius.get();

    if (doScale)radius = 1.0;
    lastRadius = radius;
    let
        positions = [],
        texcoords = [],
        normals = [],
        tangents = [],
        biTangents = [],
        indices = [],
        x, y, z, d, t, a,
        o, u, v, i, j;
    for (i = o = 0; i < stacks + 1; i++)
    {
        v = (i / stacks - 0.5) * Math.PI;
        y = Math.sin(v);
        a = Math.cos(v);
        // for (j = 0; j < slices+1; j++) {
        for (j = slices; j >= 0; j--)
        {
            u = (j / slices) * TAU;
            x = Math.cos(u) * a;
            z = Math.sin(u) * a;

            positions.push(x * radius, y * radius, z * radius);
            // texcoords.push(i/(stacks+1),j/slices);
            texcoords.push(j / slices, i / (stacks + 1));

            d = Math.sqrt(x * x + y * y + z * z);
            normals.push(
                tmpNormal[0] = x / d,
                tmpNormal[1] = y / d,
                tmpNormal[2] = z / d
            );

            if (y == d) t = RIGHT;
            else t = UP;
            vec3.cross(tmpVec, tmpNormal, t);
            vec3.normalize(tmpVec, tmpVec);
            Array.prototype.push.apply(tangents, tmpVec);
            vec3.cross(tmpVec, tmpVec, tmpNormal);
            Array.prototype.push.apply(biTangents, tmpVec);
        }
        if (i == 0 || i > stackLimit) continue;
        for (j = 0; j < slices; j++, o++)
        {
            indices.push(
                o, o + 1, o + slices + 1, o + 1, o + slices + 2, o + slices + 1
            );
        }
        o++;
    }

    // set geometry
    geom.clear();
    geom.vertices = positions;
    geom.texCoords = texcoords;
    geom.vertexNormals = normals;
    geom.tangents = tangents;
    geom.biTangents = biTangents;
    geom.verticesIndices = indices;

    outGeometry.setRef(geom);

    if (op.patch.cg) // only generate mesh when there is a cg available, otherwise only outputs a geometry
        if (!mesh) mesh = op.patch.cg.createMesh(geom, { "opId": op.id });
        else mesh.setGeom(geom);

    needsRebuild = false;
}

}
};






// **************************************************************
// 
// Ops.Gl.Shader.BasicMaterial_v3
// 
// **************************************************************

Ops.Gl.Shader.BasicMaterial_v3= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"basicmaterial_frag":"{{MODULES_HEAD}}\n\nIN vec2 texCoord;\n\n#ifdef VERTEX_COLORS\nIN vec4 vertCol;\n#endif\n\n#ifdef HAS_TEXTURES\n    IN vec2 texCoordOrig;\n    #ifdef HAS_TEXTURE_DIFFUSE\n        UNI sampler2D texDiffuse;\n    #endif\n    #ifdef HAS_TEXTURE_OPACITY\n        UNI sampler2D texOpacity;\n   #endif\n#endif\n\n///\n\nvoid main()\n{\n    {{MODULE_BEGIN_FRAG}}\n    vec4 col=color;\n\n\n    #ifdef HAS_TEXTURES\n        vec2 uv=texCoord;\n\n        #ifdef CROP_TEXCOORDS\n            if(uv.x<0.0 || uv.x>1.0 || uv.y<0.0 || uv.y>1.0) discard;\n        #endif\n\n        #ifdef HAS_TEXTURE_DIFFUSE\n            col=texture(texDiffuse,uv);\n\n            #ifdef COLORIZE_TEXTURE\n                col.r*=color.r;\n                col.g*=color.g;\n                col.b*=color.b;\n            #endif\n        #endif\n        col.a*=color.a;\n        #ifdef HAS_TEXTURE_OPACITY\n            #ifdef TRANSFORMALPHATEXCOORDS\n                uv=texCoordOrig;\n            #endif\n            #ifdef ALPHA_MASK_IR\n                col.a*=1.0-texture(texOpacity,uv).r;\n            #endif\n            #ifdef ALPHA_MASK_IALPHA\n                col.a*=1.0-texture(texOpacity,uv).a;\n            #endif\n            #ifdef ALPHA_MASK_ALPHA\n                col.a*=texture(texOpacity,uv).a;\n            #endif\n            #ifdef ALPHA_MASK_LUMI\n                col.a*=dot(vec3(0.2126,0.7152,0.0722), texture(texOpacity,uv).rgb);\n            #endif\n            #ifdef ALPHA_MASK_R\n                col.a*=texture(texOpacity,uv).r;\n            #endif\n            #ifdef ALPHA_MASK_G\n                col.a*=texture(texOpacity,uv).g;\n            #endif\n            #ifdef ALPHA_MASK_B\n                col.a*=texture(texOpacity,uv).b;\n            #endif\n            // #endif\n        #endif\n    #endif\n\n    {{MODULE_COLOR}}\n\n    #ifdef DISCARDTRANS\n        if(col.a<0.2) discard;\n    #endif\n\n    #ifdef VERTEX_COLORS\n        col*=vertCol;\n    #endif\n\n    outColor = col;\n}\n","basicmaterial_vert":"\n{{MODULES_HEAD}}\n\nOUT vec2 texCoord;\nOUT vec2 texCoordOrig;\n\nUNI mat4 projMatrix;\nUNI mat4 modelMatrix;\nUNI mat4 viewMatrix;\n\n#ifdef HAS_TEXTURES\nUNI vec4 texTransform;\n#endif\n\n#ifdef VERTEX_COLORS\n    in vec4 attrVertColor;\n    out vec4 vertCol;\n#endif\n\nvoid main()\n{\n    mat4 mMatrix=modelMatrix;\n    mat4 modelViewMatrix;\n\n    norm=attrVertNormal;\n    texCoordOrig=attrTexCoord;\n    texCoord=attrTexCoord;\n    #ifdef HAS_TEXTURES\n        texCoord.x=texCoord.x*texTransform.x+texTransform.z;\n        texCoord.y=(1.0-texCoord.y)*texTransform.y+texTransform.w;\n    #endif\n\n    #ifdef VERTEX_COLORS\n        vertCol=attrVertColor;\n    #endif\n\n    vec4 pos = vec4(vPosition, 1.0);\n\n    #ifdef BILLBOARD\n       vec3 position=vPosition;\n       modelViewMatrix=viewMatrix*modelMatrix;\n\n       gl_Position = projMatrix * modelViewMatrix * vec4((\n           position.x * vec3(\n               modelViewMatrix[0][0],\n               modelViewMatrix[1][0],\n               modelViewMatrix[2][0] ) +\n           position.y * vec3(\n               modelViewMatrix[0][1],\n               modelViewMatrix[1][1],\n               modelViewMatrix[2][1]) ), 1.0);\n    #endif\n\n    {{MODULE_VERTEX_POSITION}}\n\n    #ifndef BILLBOARD\n        modelViewMatrix=viewMatrix * mMatrix;\n\n        {{MODULE_VERTEX_MODELVIEW}}\n\n    #endif\n\n    // mat4 modelViewMatrix=viewMatrix*mMatrix;\n\n    #ifndef BILLBOARD\n        // gl_Position = projMatrix * viewMatrix * modelMatrix * pos;\n        gl_Position = projMatrix * modelViewMatrix * pos;\n    #endif\n}\n",};
const render = op.inTrigger("render");
const trigger = op.outTrigger("trigger");
const shaderOut = op.outObject("shader", null, "shader");

shaderOut.ignoreValueSerialize = true;

op.toWorkPortsNeedToBeLinked(render);
op.toWorkShouldNotBeChild("Ops.Gl.TextureEffects.ImageCompose", CABLES.OP_PORT_TYPE_FUNCTION);

const cgl = op.patch.cgl;
let diffuseTextureUniform = null;

const shader = new CGL.Shader(cgl, "basicmaterial", this);
shader.addAttribute({ "type": "vec3", "name": "vPosition" });
shader.addAttribute({ "type": "vec2", "name": "attrTexCoord" });
shader.addAttribute({ "type": "vec3", "name": "attrVertNormal", "nameFrag": "norm" });
shader.addAttribute({ "type": "float", "name": "attrVertIndex" });

shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG", "MODULE_VERTEX_MODELVIEW"]);

shader.setSource(attachments.basicmaterial_vert, attachments.basicmaterial_frag);

shaderOut.setRef(shader);

render.onTriggered = doRender;

// rgba colors
const r = op.inValueSlider("r", Math.random());
const g = op.inValueSlider("g", Math.random());
const b = op.inValueSlider("b", Math.random());
const a = op.inValueSlider("a", 1);
r.setUiAttribs({ "colorPick": true });

// const uniColor=new CGL.Uniform(shader,'4f','color',r,g,b,a);
const colUni = shader.addUniformFrag("4f", "color", r, g, b, a);
// diffuse outTexture

const diffuseTexture = op.inTexture("texture");
diffuseTexture.onChange = updateDiffuseTexture;

const colorizeTexture = op.inValueBool("colorizeTexture", false);
const vertexColors = op.inValueBool("Vertex Colors", false);

// opacity texture
const textureOpacity = op.inTexture("textureOpacity");
let textureOpacityUniform = null;

const alphaMaskSource = op.inSwitch("Alpha Mask Source", ["Luminance", "R", "G", "B", "A", "1-A", "1-R"], "Luminance");
alphaMaskSource.setUiAttribs({ "greyout": true });
textureOpacity.onChange = updateOpacity;

const texCoordAlpha = op.inValueBool("Opacity TexCoords Transform", false);
const discardTransPxl = op.inValueBool("Discard Transparent Pixels");

shader.uniformColorDiffuse = colUni; // todo remove in next versio

// texture coords
const
    diffuseRepeatX = op.inValue("diffuseRepeatX", 1),
    diffuseRepeatY = op.inValue("diffuseRepeatY", 1),
    diffuseOffsetX = op.inValue("Tex Offset X", 0),
    diffuseOffsetY = op.inValue("Tex Offset Y", 0),
    cropRepeat = op.inBool("Crop TexCoords", false);

const texTransUni = shader.addUniformFrag("4f", "texTransform", diffuseRepeatX, diffuseRepeatY, diffuseOffsetX, diffuseOffsetY);
const doBillboard = op.inValueBool("billboard", false);

shader.materialPropUniforms = {
    "diffuseColor": colUni,
    "texTransform": texTransUni,
    "diffuseTexture": diffuseTextureUniform
};

alphaMaskSource.onChange =
    doBillboard.onChange =
    discardTransPxl.onChange =
    texCoordAlpha.onChange =
    cropRepeat.onChange =
    vertexColors.onChange =
    colorizeTexture.onChange = updateDefines;

op.setPortGroup("Color", [r, g, b, a]);
op.setPortGroup("Color Texture", [diffuseTexture, vertexColors, colorizeTexture]);
op.setPortGroup("Opacity", [textureOpacity, alphaMaskSource, discardTransPxl, texCoordAlpha]);
op.setPortGroup("Texture Transform", [diffuseRepeatX, diffuseRepeatY, diffuseOffsetX, diffuseOffsetY, cropRepeat]);

updateOpacity();
updateDiffuseTexture();

op.preRender = function ()
{
    shader.bind();
    doRender();
    if (!shader) return;
};

function doRender()
{
    op.checkGraphicsApi();
    shader.popTextures();

    cgl.pushShader(shader);

    if (diffuseTextureUniform && diffuseTexture.get()) shader.pushTexture(diffuseTextureUniform, diffuseTexture.get().tex);
    if (textureOpacityUniform && textureOpacity.get()) shader.pushTexture(textureOpacityUniform, textureOpacity.get().tex);
    shader.materialPropUniforms.diffuseTexture = diffuseTextureUniform;
    shader.materialPropUniforms.texTransform = texTransUni;

    trigger.trigger();

    cgl.popShader();
}

function updateOpacity()
{
    if (textureOpacity.get())
    {
        if (textureOpacityUniform !== null) return;
        shader.removeUniform("texOpacity");
        shader.define("HAS_TEXTURE_OPACITY");
        if (!textureOpacityUniform) textureOpacityUniform = new CGL.Uniform(shader, "t", "texOpacity");
    }
    else
    {
        shader.removeUniform("texOpacity");
        shader.removeDefine("HAS_TEXTURE_OPACITY");
        textureOpacityUniform = null;
    }

    updateDefines();
}

function updateDiffuseTexture()
{
    if (diffuseTexture.get())
    {
        if (!shader.hasDefine("HAS_TEXTURE_DIFFUSE")) shader.define("HAS_TEXTURE_DIFFUSE");
        if (!diffuseTextureUniform) diffuseTextureUniform = new CGL.Uniform(shader, "t", "texDiffuse");

        shader.materialPropUniforms.diffuseTexture = diffuseTextureUniform;
    }
    else
    {
        shader.removeUniform("texDiffuse");
        shader.removeDefine("HAS_TEXTURE_DIFFUSE");
        diffuseTextureUniform = null;
    }
    updateUi();
}

function updateUi()
{
    const hasTexture = diffuseTexture.isLinked() || textureOpacity.isLinked();
    diffuseRepeatX.setUiAttribs({ "greyout": !hasTexture });
    diffuseRepeatY.setUiAttribs({ "greyout": !hasTexture });
    diffuseOffsetX.setUiAttribs({ "greyout": !hasTexture });
    diffuseOffsetY.setUiAttribs({ "greyout": !hasTexture });
    colorizeTexture.setUiAttribs({ "greyout": !hasTexture });

    alphaMaskSource.setUiAttribs({ "greyout": !textureOpacity.get() });
    texCoordAlpha.setUiAttribs({ "greyout": !textureOpacity.get() });

    let notUsingColor = true;
    notUsingColor = diffuseTexture.get() && !colorizeTexture.get();
    r.setUiAttribs({ "greyout": notUsingColor });
    g.setUiAttribs({ "greyout": notUsingColor });
    b.setUiAttribs({ "greyout": notUsingColor });
}

function updateDefines()
{
    shader.toggleDefine("VERTEX_COLORS", vertexColors.get());
    shader.toggleDefine("CROP_TEXCOORDS", cropRepeat.get());
    shader.toggleDefine("COLORIZE_TEXTURE", colorizeTexture.get());
    shader.toggleDefine("TRANSFORMALPHATEXCOORDS", texCoordAlpha.get());
    shader.toggleDefine("DISCARDTRANS", discardTransPxl.get());
    shader.toggleDefine("BILLBOARD", doBillboard.get());

    shader.toggleDefine("ALPHA_MASK_ALPHA", alphaMaskSource.get() == "A");
    shader.toggleDefine("ALPHA_MASK_IALPHA", alphaMaskSource.get() == "1-A");
    shader.toggleDefine("ALPHA_MASK_IR", alphaMaskSource.get() == "1-R");
    shader.toggleDefine("ALPHA_MASK_LUMI", alphaMaskSource.get() == "Luminance");
    shader.toggleDefine("ALPHA_MASK_R", alphaMaskSource.get() == "R");
    shader.toggleDefine("ALPHA_MASK_G", alphaMaskSource.get() == "G");
    shader.toggleDefine("ALPHA_MASK_B", alphaMaskSource.get() == "B");
    updateUi();
}

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.Gradient_v2
// 
// **************************************************************

Ops.Gl.ImageCompose.Gradient_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"gradient_frag":"IN vec2 texCoord;\nUNI float amount;\nUNI float pos;\nUNI float width;\n\nUNI vec3 colA;\nUNI vec3 colB;\nUNI vec3 colC;\nUNI sampler2D tex;\n\n{{CGL.BLENDMODES3}}\n\n\n\n\nvec3 lin2srgb( vec3 cl )\n{\n\tcl = clamp( cl, 0.0, 1.0 );\n\tvec3 c_lo = 12.92 * cl;\n\tvec3 c_hi = 1.055 * pow(cl,vec3(0.41666,0.41666,0.41666)) - 0.055;\n\treturn vec3( (cl.r<0.0031308) ? c_lo.r : c_hi.r,\n                (cl.g<0.0031308) ? c_lo.g : c_hi.g,\n                (cl.b<0.0031308) ? c_lo.b : c_hi.b );\n}\n\nvec3 oklab_mix( vec3 colA, vec3 colB, float h )\n{\n    // https://www.shadertoy.com/view/ttcyRS\n    // https://bottosson.github.io/posts/oklab\n    const mat3 kCONEtoLMS = mat3(\n         0.4121656120,  0.2118591070,  0.0883097947,\n         0.5362752080,  0.6807189584,  0.2818474174,\n         0.0514575653,  0.1074065790,  0.6302613616);\n    const mat3 kLMStoCONE = mat3(\n         4.0767245293, -1.2681437731, -0.0041119885,\n        -3.3072168827,  2.6093323231, -0.7034763098,\n         0.2307590544, -0.3411344290,  1.7068625689);\n\n    // rgb to cone (arg of pow can't be negative)\n    vec3 lmsA = pow( kCONEtoLMS*colA, vec3(1.0/3.0) );\n    vec3 lmsB = pow( kCONEtoLMS*colB, vec3(1.0/3.0) );\n    // lerp\n    vec3 lms = mix( lmsA, lmsB, h );\n    // gain in the middle (no oaklab anymore, but looks better?)\n    #ifdef OKLABGAIN\n  lms *= 1.0+0.2*h*(1.0-h);\n  #endif\n    // cone to rgb\n    return kLMStoCONE*(lms*lms*lms);\n}\n\n\nvoid main()\n{\n    vec4 base=texture(tex,texCoord);\n    vec4 col;\n    float ax=texCoord.x;\n\n    #ifdef GRAD_Y\n        ax=texCoord.y;\n    #endif\n    #ifdef GRAD_XY\n        ax=(texCoord.x+texCoord.y)/2.0;\n    #endif\n    #ifdef GRAD_RADIAL\n        ax=distance(texCoord,vec2(0.5,0.5))*2.0;\n    #endif\n\n    ax=((ax-0.5)*width)+0.5;\nax=clamp(ax,0.0,1.0);\n\n    #ifndef GRAD_SMOOTHSTEP\n        if(ax<=pos) col = vec4(MIXER(colA, colB, ax*1.0/pos),1.0);\n        else col = vec4(MIXER(colB, colC, min(1.0,(ax-pos)*1.0/(1.0-pos))),1.0);\n    #endif\n\n    #ifdef GRAD_SMOOTHSTEP\n        if(ax<=pos) col = vec4(MIXER(colA, colB, smoothstep(0.0,1.0,ax*1.0/pos)),1.0);\n        else col = vec4(MIXER(colB, colC, smoothstep(0.0,1.0,min(1.0,(ax-pos)*1.0/(1.0-pos)))),1.0);\n    #endif\n\n    #ifdef SRGB\n        col.rgb=lin2srgb(col.rgb);\n    #endif\n\n    outColor=cgl_blendPixel(base,col,amount);\n}",};
const
    render = op.inTrigger("Render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),
    amount = op.inValueSlider("Amount", 1),
    width = op.inValue("Width", 1),
    gType = op.inSwitch("Type", ["X", "Y", "XY", "Radial"], "X"),
    pos1 = op.inValueSlider("Pos", 0.5),
    smoothStep = op.inValueBool("Smoothstep", true),
    inSrgb = op.inValueBool("sRGB", false),
    inColSpace = op.inSwitch("color space", ["RGB", "Oklab", "OklabG"], "RGB"),

    r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),

    r2 = op.inValueSlider("r2", Math.random()),
    g2 = op.inValueSlider("g2", Math.random()),
    b2 = op.inValueSlider("b2", Math.random()),

    r3 = op.inValueSlider("r3", Math.random()),
    g3 = op.inValueSlider("g3", Math.random()),
    b3 = op.inValueSlider("b3", Math.random()),

    randomize = op.inTriggerButton("Randomize"),
    next = op.outTrigger("Next");

r.setUiAttribs({ "colorPick": true });
r2.setUiAttribs({ "colorPick": true });
r3.setUiAttribs({ "colorPick": true });

op.setPortGroup("Blending", [blendMode, amount]);
op.setPortGroup("Color A", [r, g, b]);
op.setPortGroup("Color B", [r2, g2, b2]);
op.setPortGroup("Color C", [r3, g3, b3]);

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "gradient");

shader.setSource(shader.getDefaultVertexShader(), attachments.gradient_frag);
const amountUniform = new CGL.Uniform(shader, "f", "amount", amount);
const uniPos = new CGL.Uniform(shader, "f", "pos", pos1);
const uniWidth = new CGL.Uniform(shader, "f", "width", width);
const textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
let r3uniform, r2uniform, runiform;

r2.onChange = g2.onChange = b2.onChange = updateCol2;
r3.onChange = g3.onChange = b3.onChange = updateCol3;
r.onChange = g.onChange = b.onChange = updateCol;

r2.onLinkChanged = g2.onLinkChanged = b2.onLinkChanged =
r3.onLinkChanged = g3.onLinkChanged = b3.onLinkChanged =
r.onLinkChanged = g.onLinkChanged = b.onLinkChanged = updateUi;

updateCol();
updateCol2();
updateCol3();
updateDefines();

inSrgb.onChange =
inColSpace.onChange =
smoothStep.onChange =
    gType.onChange = updateDefines;

function updateUi()
{
    randomize.setUiAttribs({ "greyout": r2.isLinked() || g2.isLinked() || b2.isLinked() || r3.isLinked() || g3.isLinked() || b3.isLinked() || r.isLinked() || g.isLinked() || b.isLinked() });
}

function updateDefines()
{
    // shader.toggleDefine("OKLABGAIN", inoklabGain.get());
    shader.toggleDefine("SRGB", inSrgb.get());

    shader.define("MIXER", (inColSpace.get() + "").indexOf("Oklab") > -1 ? "oklab_mix" : "mix");
    shader.toggleDefine("OKLABGAIN", (inColSpace.get() + "").indexOf("OklabG") > -1);

    shader.toggleDefine("GRAD_SMOOTHSTEP", smoothStep.get());
    shader.toggleDefine("GRAD_X", gType.get() == "X");
    shader.toggleDefine("GRAD_XY", gType.get() == "XY");
    shader.toggleDefine("GRAD_Y", gType.get() == "Y");
    shader.toggleDefine("GRAD_RADIAL", gType.get() == "Radial");
}

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);

randomize.onTriggered = function ()
{
    r.set(Math.random());
    g.set(Math.random());
    b.set(Math.random());

    r2.set(Math.random());
    g2.set(Math.random());
    b2.set(Math.random());

    r3.set(Math.random());
    g3.set(Math.random());
    b3.set(Math.random());

    op.refreshParams();
};

function updateCol()
{
    const colA = [r.get(), g.get(), b.get()];
    if (!runiform) runiform = new CGL.Uniform(shader, "3f", "colA", colA);
    else runiform.setValue(colA);
}

function updateCol2()
{
    const colB = [r2.get(), g2.get(), b2.get()];
    if (!r2uniform) r2uniform = new CGL.Uniform(shader, "3f", "colB", colB);
    else r2uniform.setValue(colB);
}

function updateCol3()
{
    const colC = [r3.get(), g3.get(), b3.get()];
    if (!r3uniform) r3uniform = new CGL.Uniform(shader, "3f", "colC", colC);
    else r3uniform.setValue(colC);
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();
    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    cgl.currentTextureEffect.finish();
    cgl.popShader();

    next.trigger();
};

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.RgbMultiply
// 
// **************************************************************

Ops.Gl.ImageCompose.RgbMultiply= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"rgbmul_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\nUNI float r;\nUNI float g;\nUNI float b;\n\nvoid main()\n{\n   vec4 col=vec4(1.0,0.0,0.0,1.0);\n   col=texture(tex,texCoord);\n   col.r*=r;\n   col.g*=g;\n   col.b*=b;\n   outColor= col;\n}\n",};
const render = op.inTrigger("render");
const r = op.inValue("r", 1);
const g = op.inValue("g", 1);
const b = op.inValue("b", 1);
const trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.rgbmul_frag);
const textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
const uniformR = new CGL.Uniform(shader, "f", "r", r);
const uniformG = new CGL.Uniform(shader, "f", "g", g);
const uniformB = new CGL.Uniform(shader, "f", "b", b);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Gl.ShaderEffects.ColorArea_v5
// 
// **************************************************************

Ops.Gl.ShaderEffects.ColorArea_v5= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"colorarea_frag":"\nvec3 MOD_size=vec3(MOD_inSizeAmountFalloffSizeX.x);\n#ifdef MOD_DOSCALE\n    MOD_size*=MOD_scale.xyz;\n#endif\n\nvec3 MOD_col=MOD_color;\n\n#ifdef MOD_USE_TEX\n    MOD_col=texture(MOD_tex,gl_FragCoord.xy/float(textureSize(MOD_tex,0).xy)).rgb;\n#endif\n\nvec4 MOD_vp=MOD_vertPos;\n\n#ifdef MOD_SPACE_SCREEN\n   MOD_vp=vec4(gl_FragCoord.x,gl_FragCoord.y,0.0,1.0);\n#endif\n\n\n\n#ifdef MOD_AREA_SPHERE\n    float MOD_de=MOD_sdSphere(MOD_pos.xyz-MOD_vp.xyz,MOD_size.x);\n#endif\n\n#ifdef MOD_AREA_BOX\n    float MOD_r=MOD_scale.w;\n    MOD_r*=MOD_inSizeAmountFalloffSizeX.x;\n    float MOD_de=MOD_sdRoundBox(MOD_pos.xyz-MOD_vp.xyz,MOD_size-MOD_r,MOD_r);\n#endif\n\n#ifdef MOD_AREA_TRIPRISM\n    float MOD_de=MOD_sdTriPrism(MOD_pos.xyz-MOD_vp.xyz,vec2(MOD_size.x,MOD_size.z));\n#endif\n\n#ifdef MOD_AREA_HEXPRISM\n    float MOD_de=MOD_sdHexPrism(MOD_pos.xyz-MOD_vp.xyz,vec2(MOD_size.x,MOD_size.z));\n#endif\n\n// #ifndef MOD_AREA_SPHERE\n// #ifndef MOD_AREA_BOX\n//     float MOD_de=1.0-smoothstep(MOD_inSizeAmountFalloffSizeX.z*MOD_inSizeAmountFalloffSizeX.x,MOD_inSizeAmountFalloffSizeX.x,MOD_de);\n// #endif\n// #endif\n\n#ifdef MOD_AREA_AXIS_X\n    float MOD_de=abs(MOD_pos.x-MOD_vp.x);\n#endif\n#ifdef MOD_AREA_AXIS_Y\n    float MOD_de=abs(MOD_pos.y-MOD_vp.y);\n#endif\n#ifdef MOD_AREA_AXIS_Z\n    float MOD_de=abs(MOD_pos.z-MOD_vp.z);\n#endif\n\n#ifdef MOD_AREA_AXIS_X_INFINITE\n    float MOD_de=MOD_pos.x-MOD_vp.x;\n#endif\n#ifdef MOD_AREA_AXIS_Y_INFINITE\n    float MOD_de=MOD_pos.y-MOD_vp.y;\n#endif\n#ifdef MOD_AREA_AXIS_Z_INFINITE\n    float MOD_de=MOD_pos.z-MOD_vp.z;\n#endif\n\n\nMOD_de=1.0-MOD_map(\n    MOD_de,\n    0.0, MOD_inSizeAmountFalloffSizeX.z,\n    0.0,1.0\n    );\n\n#ifdef MOD_FALLOFF_SMOOTH\n    MOD_de=smoothstep(0.0,1.0,MOD_de);\n#endif\n#ifdef MOD_FALLOFF_POW2\n    MOD_de=pow(MOD_de,2.0);\n#endif\n#ifdef MOD_FALLOFF_POW3\n    MOD_de=pow(MOD_de,3.0);\n#endif\n\n\n#ifdef MOD_AREA_INVERT\n    MOD_de=1.0-MOD_de;\n#endif\n\n#ifdef MOD_BLEND_NORMAL\n    col.rgb=mix(col.rgb,MOD_col, MOD_de*MOD_inSizeAmountFalloffSizeX.y);\n#endif\n\n\n#ifdef MOD_BLEND_MULTIPLY\n    col.rgb=mix(col.rgb,col.rgb*MOD_col,MOD_de*MOD_inSizeAmountFalloffSizeX.y);\n#endif\n\n#ifdef MOD_BLEND_ADD\n    col.rgb+=MOD_de*MOD_inSizeAmountFalloffSizeX.y*MOD_col;\n#endif\n\n\n#ifdef MOD_BLEND_OPACITY\n    col.a*=(1.0-MOD_de*MOD_inSizeAmountFalloffSizeX.y);\n\n    if(col.a==0.0)discard;\n#endif\n\n#ifdef MOD_BLEND_DISCARD\n    if(MOD_de*MOD_inSizeAmountFalloffSizeX.y>=0.999)discard;\n#endif\n\n\n// col.rgb=vec3(distance(MOD_vp.xyz,MOD_pos.xyz))*0.1\n// col.rgb=MOD_pos.xyz;\n\n//","colorarea_head_frag":"IN vec4 MOD_vertPos;\n\nfloat MOD_map(float value,float min1,float max1,float min2,float max2)\n{\n    return max(min2,min(max2,min2 + (value - min1) * (max2 - min2) / (max1 - min1)));\n\n}\n\n\nfloat MOD_sdSphere( vec3 p, float s )\n{\n    return length(p)-s;\n}\n\n\nfloat MOD_sdRoundBox( vec3 p, vec3 b, float r )\n{\n  vec3 q = abs(p) - b;\n  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;\n}\n\nfloat MOD_sdTriPrism( vec3 p, vec2 h )\n{\n  vec3 q = abs(p);\n  return max(q.z-h.y,max(q.x*0.866025+p.y*0.5,-p.y)-h.x*0.5);\n}\n\nfloat MOD_sdHexPrism( vec3 p, vec2 h )\n{\n  const vec3 k = vec3(-0.8660254, 0.5, 0.57735);\n  p = abs(p);\n  p.xy -= 2.0*min(dot(k.xy, p.xy), 0.0)*k.xy;\n  vec2 d = vec2(\n       length(p.xy-vec2(clamp(p.x,-k.z*h.x,k.z*h.x), h.x))*sign(p.y-h.x),\n       p.z-h.y );\n  return min(max(d.x,d.y),0.0) + length(max(d,0.0));\n}\n\n",};
const
    render = op.inTrigger("Render"),
    inArea = op.inValueSelect("Area", ["Sphere", "Box", "Tri Prism", "Hex Prism", "Axis X", "Axis Y", "Axis Z", "Axis X Infinite", "Axis Y Infinite", "Axis Z Infinite"], "Sphere"),
    inSize = op.inValue("Size", 1),
    roundNess = op.inFloatSlider("Roundness", 0),
    inAmount = op.inValueSlider("Amount", 0.5),
    inFalloff = op.inFloat("Falloff", 0),
    inFalloffCurve = op.inSwitch("Falloff Curve", ["Linear", "Smoothstep", "pow2", "pow3"], "Linear"),
    inInvert = op.inValueBool("Invert"),
    inBlend = op.inSwitch("Blend ", ["Normal", "Multiply", "Opacity", "Add", "Discard"], "Normal"),
    r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),
    x = op.inValue("x"),
    y = op.inValue("y"),
    z = op.inValue("z"),
    doScale = op.inBool("Change Size", false),
    sizeX = op.inFloat("Size X", 1),
    sizeY = op.inFloat("Size Y", 1),
    sizeZ = op.inFloat("Size Z", 1),
    inTex = op.inTexture("Texture"),
    inSpace = op.inSwitch("Space", ["World", "Model", "UV", "Screen"], "World"),
    inPrio = op.inBool("Priority", true),
    next = op.outTrigger("Next");

op.setPortGroup("Scale", [doScale, sizeX, sizeZ, sizeY]);
op.setPortGroup("Position", [x, y, z]);
op.setPortGroup("Color", [inBlend, r, g, b]);
r.setUiAttribs({ "colorPick": true });

const cgl = op.patch.cgl;

const srcHeadVert = ""
    .endl() + "OUT vec4 MOD_vertPos;"
    .endl();

const srcBodyVert = ""
    .endl() + "#ifdef MOD_SPACE_MODEL"
    .endl() + "   MOD_vertPos=vec4(vPosition,1.0);"
    .endl() + "#endif"

    .endl() + "#ifdef MOD_SPACE_WORLD"
    .endl() + "   MOD_vertPos=mMatrix*pos;"
    .endl() + "#endif"

    .endl() + "#ifdef MOD_SPACE_UV"
    .endl() + "   MOD_vertPos=vec4(attrTexCoord.x,attrTexCoord.y,0.0,1.0);"
    .endl() + "#endif"

    .endl();

inSpace.onChange =
    inTex.onLinkChanged =
    inArea.onChange =
    inInvert.onChange =
    doScale.onChange =
    inFalloffCurve.onChange =
    inBlend.onChange = updateDefines;

render.onTriggered = doRender;

const vertModTitle = "vert_" + op.name;
const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "priority": 2,
    "title": vertModTitle,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": srcHeadVert,
    "srcBodyVert": srcBodyVert
});

mod.addModule({
    "title": op.name,
    "name": "MODULE_COLOR",
    "srcHeadFrag": attachments.colorarea_head_frag,
    "srcBodyFrag": attachments.colorarea_frag
});

mod.addUniform("4f", "MOD_inSizeAmountFalloffSizeX", inSize, inAmount, inFalloff, inFalloff);
mod.addUniform("3f", "MOD_color", r, g, b);
mod.addUniform("3f", "MOD_pos", x, y, z);
mod.addUniform("4f", "MOD_scale", sizeX, sizeY, sizeZ, roundNess);
mod.addUniform("t", "MOD_tex");

updateDefines();

inPrio.onChange = updatePrio;
updatePrio();

function updatePrio()
{
    mod.removeModule(vertModTitle);

    const vmod = {
        // "priority": 0,
        "title": vertModTitle,
        "name": "MODULE_VERTEX_POSITION",
        "srcHeadVert": srcHeadVert,
        "srcBodyVert": srcBodyVert
    };

    if (inPrio.get()) vmod.priority = 2;

    mod.addModule(vmod);
}

function updateDefines()
{
    // inFalloffCurve = op.inSwitch("Falloff Curve", ["Linear","Smoothstep"],"Linear"),

    mod.toggleDefine("MOD_FALLOFF_SMOOTH", inFalloffCurve.get() == "Smoothstep");
    mod.toggleDefine("MOD_FALLOFF_POW2", inFalloffCurve.get() == "pow2");
    mod.toggleDefine("MOD_FALLOFF_POW3", inFalloffCurve.get() == "pow3");

    mod.toggleDefine("MOD_BLEND_NORMAL", inBlend.get() == "Normal");
    mod.toggleDefine("MOD_BLEND_OPACITY", inBlend.get() == "Opacity");
    mod.toggleDefine("MOD_BLEND_MULTIPLY", inBlend.get() == "Multiply");
    mod.toggleDefine("MOD_BLEND_DISCARD", inBlend.get() == "Discard");
    mod.toggleDefine("MOD_BLEND_ADD", inBlend.get() == "Add");

    mod.toggleDefine("MOD_AREA_SIZE", doScale.get());

    mod.toggleDefine("MOD_AREA_INVERT", inInvert.get());

    mod.toggleDefine("MOD_SPACE_WORLD", inSpace.get() == "World");
    mod.toggleDefine("MOD_SPACE_MODEL", inSpace.get() == "Model");
    mod.toggleDefine("MOD_SPACE_UV", inSpace.get() == "UV");
    mod.toggleDefine("MOD_SPACE_SCREEN", inSpace.get() == "Screen");

    mod.toggleDefine("MOD_AREA_AXIS_X", inArea.get() == "Axis X");
    mod.toggleDefine("MOD_AREA_AXIS_Y", inArea.get() == "Axis Y");
    mod.toggleDefine("MOD_AREA_AXIS_Z", inArea.get() == "Axis Z");
    mod.toggleDefine("MOD_AREA_AXIS_X_INFINITE", inArea.get() == "Axis X Infinite");
    mod.toggleDefine("MOD_AREA_AXIS_Y_INFINITE", inArea.get() == "Axis Y Infinite");
    mod.toggleDefine("MOD_AREA_AXIS_Z_INFINITE", inArea.get() == "Axis Z Infinite");
    mod.toggleDefine("MOD_AREA_SPHERE", inArea.get() == "Sphere");
    mod.toggleDefine("MOD_AREA_BOX", inArea.get() == "Box");
    mod.toggleDefine("MOD_AREA_TRIPRISM", inArea.get() == "Tri Prism");
    mod.toggleDefine("MOD_AREA_HEXPRISM", inArea.get() == "Hex Prism");

    mod.toggleDefine("MOD_DOSCALE", doScale.get());

    // mod.removeUniform("3f", "MOD_scale",sizeX,sizeY,sizeZ);
    sizeX.setUiAttribs({ "greyout": !doScale.get() });
    sizeY.setUiAttribs({ "greyout": !doScale.get() });
    sizeZ.setUiAttribs({ "greyout": !doScale.get() });

    roundNess.setUiAttribs({ "greyout": inArea.get() != "Box" });

    mod.toggleDefine("MOD_USE_TEX", inTex.isLinked());
}

function drawHelpers()
{
    if (cgl.tempData.shadowPass) return;
    if (cgl.shouldDrawHelpers(op))
    {
        if (op.isCurrentUiOp())
            gui.setTransformGizmo({ "posX": x, "posY": y, "posZ": z });

        cgl.pushModelMatrix();
        mat4.translate(cgl.mMatrix, cgl.mMatrix, [x.get(), y.get(), z.get()]);

        if (inArea.get() == "Sphere")
        {
            CABLES.GL_MARKER.drawSphere(op, inSize.get());
            CABLES.GL_MARKER.drawSphere(op, inSize.get() + inFalloff.get());
        }
        cgl.popModelMatrix();
    }
}

function doRender()
{
    mod.bind();

    if (inTex.isLinked())
    {
        let tex = inTex.get();

        if (!tex) tex = CGL.Texture.getEmptyTexture(cgl).tex;
        else tex = tex.tex;

        mod.pushTexture("MOD_tex", tex);
    }

    drawHelpers();
    next.trigger();

    mod.unbind();
}

}
};






// **************************************************************
// 
// Ops.Ui.VizTexture
// 
// **************************************************************

Ops.Ui.VizTexture= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"viztex_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\nUNI samplerCube cubeMap;\nUNI float width;\nUNI float height;\nUNI float type;\nUNI float time;\nUNI float lod;\n\nfloat LinearizeDepth(float d,float zNear,float zFar)\n{\n    float z_n = 2.0 * d - 1.0;\n    return 2.0 * zNear / (zFar + zNear - z_n * (zFar - zNear));\n}\n\nvec3 decodeRGBE8(vec4 rgbe)\n{\n    vec3 vDecoded = rgbe.rgb * pow(2.0, rgbe.a * 255.0-128.0);\n    return vDecoded;\n}\n\nvoid main()\n{\n    vec4 col=vec4(vec3(0.),0.0);\n\n    vec4 colTex=textureLod(tex,texCoord,lod);\n    // vec4 colTex=texture(tex,texCoord);\n\n\n\n#ifdef MONO_R\n colTex.rgb=vec3(colTex.r);\n#endif\n\n#ifdef MONO_G\n colTex.rgb=vec3(colTex.g);\n#endif\n\n#ifdef MONO_B\n colTex.rgb=vec3(colTex.b);\n#endif\n\n    if(type==1.0)\n    {\n        vec4 depth=vec4(0.);\n        vec2 localST=texCoord;\n        localST.y = 1. - localST.y;\n\n        localST.t = mod(localST.t*3.,1.);\n        localST.s = mod(localST.s*4.,1.);\n\n        #ifdef WEBGL2\n            #define texCube texture\n        #endif\n        #ifdef WEBGL1\n            #define texCube textureCube\n        #endif\n\n//         //Due to the way my depth-cubeMap is rendered, objects to the -x,y,z side is projected to the positive x,y,z side\n//         //Inside where top/bottom is to be drawn?\n        if (texCoord.s*4.> 1. && texCoord.s*4.<2.)\n        {\n            //Bottom (-y) quad\n            if (texCoord.t*3. < 1.)\n            {\n                vec3 dir=vec3(localST.s*2.-1.,-1.,-localST.t*2.+1.);//Due to the (arbitrary) way I choose as up in my depth-viewmatrix, i her emultiply the latter coordinate with -1\n                depth = texCube(cubeMap, dir);\n            }\n            //top (+y) quad\n            else if (texCoord.t*3. > 2.)\n            {\n                vec3 dir=vec3(localST.s*2.-1.,1.,localST.t*2.-1.);//Get lower y texture, which is projected to the +y part of my cubeMap\n                depth = texCube(cubeMap, dir);\n            }\n            else//Front (-z) quad\n            {\n                vec3 dir=vec3(localST.s*2.-1.,-localST.t*2.+1.,1.);\n                depth = texCube(cubeMap, dir);\n            }\n        }\n//         //If not, only these ranges should be drawn\n        else if (texCoord.t*3. > 1. && texCoord.t*3. < 2.)\n        {\n            if (texCoord.x*4. < 1.)//left (-x) quad\n            {\n                vec3 dir=vec3(-1.,-localST.t*2.+1.,localST.s*2.-1.);\n                depth = texCube(cubeMap, dir);\n            }\n            else if (texCoord.x*4. < 3.)//right (+x) quad (front was done above)\n            {\n                vec3 dir=vec3(1,-localST.t*2.+1.,-localST.s*2.+1.);\n                depth = texCube(cubeMap, dir);\n            }\n            else //back (+z) quad\n            {\n                vec3 dir=vec3(-localST.s*2.+1.,-localST.t*2.+1.,-1.);\n                depth = texCube(cubeMap, dir);\n            }\n        }\n        // colTex = vec4(vec3(depth),1.);\n        colTex = vec4(depth);\n    }\n\n    if(type==2.0)\n    {\n       float near = 0.1;\n       float far = 50.;\n       float depth = LinearizeDepth(colTex.r, near, far);\n       colTex.rgb = vec3(depth);\n    }\n\n\n\n\n    #ifdef ANIM_RANGE\n\n        if(colTex.r>1.0 || colTex.r<0.0)\n            colTex.r=mod(colTex.r,1.0)*0.5+(sin(colTex.r+mod(colTex.r*3.0,1.0)+time*5.0)*0.5+0.5)*0.5;\n        if(colTex.g>1.0 || colTex.g<0.0)\n            colTex.g=mod(colTex.g,1.0)*0.5+(sin(colTex.g+mod(colTex.g*3.0,1.0)+time*5.0)*0.5+0.5)*0.5;\n        if(colTex.b>1.0 || colTex.b<0.0)\n            colTex.b=mod(colTex.b,1.0)*0.5+(sin(colTex.b+mod(colTex.b*3.0,1.0)+time*5.0)*0.5+0.5)*0.5;\n\n    #endif\n\n\n    // #ifdef ANIM_RANGE\n    //     if(colTex.r>1.0 || colTex.r<0.0)\n    //     {\n    //         float r=mod( time+colTex.r,1.0)*0.5+0.5;\n    //         colTex.r=r;\n    //     }\n    //     if(colTex.g>1.0 || colTex.g<0.0)\n    //     {\n    //         float r=mod( time+colTex.g,1.0)*0.5+0.5;\n    //         colTex.g=r;\n    //     }\n    //     if(colTex.b>1.0 || colTex.b<0.0)\n    //     {\n    //         float r=mod( time+colTex.b,1.0)*0.5+0.5;\n    //         colTex.b=r;\n    //     }\n    // #endif\n\n    #ifdef MOD_RANGE\n        colTex.r=mod(colTex.r,1.0001);\n        colTex.g=mod(colTex.g,1.0001);\n        colTex.b=mod(colTex.b,1.0001);\n\n    #endif\n\n    #ifdef ALPHA_ONE\n        colTex.a=1.0;\n    #endif\n    #ifdef ALPHA_INV\n        colTex.a=1.0-colTex.a;\n    #endif\n\n#ifdef RGBE\n    colTex= vec4(decodeRGBE8(colTex),1.0);\n#endif\n\n\n    outColor = mix(col,colTex,colTex.a);\n}\n\n","viztex_vert":"IN vec3 vPosition;\nIN vec2 attrTexCoord;\nOUT vec2 texCoord;\nUNI mat4 projMatrix;\nUNI mat4 modelMatrix;\nUNI mat4 viewMatrix;\n\nvoid main()\n{\n    texCoord=vec2(attrTexCoord.x,1.0-attrTexCoord.y);\n    vec4 pos = vec4( vPosition, 1. );\n    mat4 mvMatrix=viewMatrix * modelMatrix;\n    gl_Position = projMatrix * mvMatrix * pos;\n}",};
const
    inTex = op.inTexture("Texture In"),
    inShowInfo = op.inBool("Show Info", false),
    inVizRange = op.inSwitch("Visualize outside 0-1", ["Off", "Anim", "Modulo"], "Anim"),
    inAlpha = op.inSwitch("Alpha", ["A", "1", "1-A"], "A"),
    inRgbe = op.inBool("Convert RGBE", false),

    inRGB = op.inSwitch("Channels", ["RGB", "R", "G", "B"], "RGB"),
    inType = op.inSwitch("Type", ["Automatic", "Default", "Depth", "Cubemap"], "Automatic"),
    
    inPickColor = op.inBool("Show Color", false),
    inX = op.inFloatSlider("X", 0.5),
    inY = op.inFloatSlider("Y", 0.5),
    inLod = op.inInt("Mip Level", 0),
    outTex = op.outTexture("Texture Out"),
    outInfo = op.outString("Info");

op.setUiAttrib({ "height": 150, "resizable": true });

op.setPortGroup("Show Values", [inPickColor, inX, inY]);

const timer = new CABLES.Timer();
let shader = null;
let fb = null;
let pixelReader = null;
let colorString = "";
let firstTime = true;

inRGB.onChange =

inRgbe.onChange =
inAlpha.onChange =
    inVizRange.onChange = updateDefines;

inPickColor.onChange = updateUi;
updateUi();

if (CABLES.UI)
{
    timer.play();
}

function updateUi()
{
    inX.setUiAttribs({ "greyout": !inPickColor.get() });
    inY.setUiAttribs({ "greyout": !inPickColor.get() });
}

inTex.onChange = () =>
{
    const t = inTex.get();

    outTex.setRef(t);

    let title = "";

    if (inTex.get() && inTex.isLinked()) title = inTex.links[0].getOtherPort(inTex).name;

    op.setUiAttrib({ "extendTitle": title });
};

function updateDefines()
{
    if (!shader) return;

    shader.toggleDefine("MOD_RANGE", inVizRange.get() == "Modulo");
    shader.toggleDefine("ANIM_RANGE", inVizRange.get() == "Anim");
    shader.toggleDefine("ALPHA_INV", inAlpha.get() == "1-A");
    shader.toggleDefine("ALPHA_ONE", inAlpha.get() == "1");
    shader.toggleDefine("RGBE", inRgbe.get());

    shader.toggleDefine("MONO_R", inRGB.get() == "R");
    shader.toggleDefine("MONO_G", inRGB.get() == "G");
    shader.toggleDefine("MONO_B", inRGB.get() == "B");
}

op.renderVizLayerGl = (ctx, layer) =>
{
    if (!inTex.isLinked()) return;
    if (!layer.useGl) return;

    const port = inTex;
    const texSlot = 5;
    const texSlotCubemap = texSlot + 1;

    const perf = gui.uiProfiler.start("previewlayer texture");
    const cgl = port.op.patch.cgl;

    if (!this._emptyCubemap) this._emptyCubemap = CGL.Texture.getEmptyCubemapTexture(cgl);
    port.op.patch.cgl.profileData.count("vizTexPreviews");

    const portTex = port.get() || CGL.Texture.getEmptyTexture(cgl);

    if (!this._mesh)
    {
        const geom = new CGL.Geometry("vizTexture rect");
        geom.vertices = [1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0, -1.0, 0.0];
        geom.texCoords = [
            1.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            0.0, 0.0];
        geom.verticesIndices = [0, 1, 2, 3, 1, 2];
        this._mesh = new CGL.Mesh(cgl, geom);
    }
    if (!this._shader)
    {
        this._shader = new CGL.Shader(cgl, "glpreviewtex");
        this._shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
        this._shader.setSource(attachments.viztex_vert, attachments.viztex_frag);
        this._shaderTexUniform = new CGL.Uniform(this._shader, "t", "tex", texSlot);
        this._shaderTexCubemapUniform = new CGL.Uniform(this._shader, "tc", "cubeMap", texSlotCubemap);
        shader = this._shader;
        updateDefines();

        this._shaderTexUniformW = new CGL.Uniform(this._shader, "f", "width", portTex.width);
        this._shaderTexUniformH = new CGL.Uniform(this._shader, "f", "height", portTex.height);
        this._shaderTypeUniform = new CGL.Uniform(this._shader, "f", "type", 0);
        this._shaderTimeUniform = new CGL.Uniform(this._shader, "f", "time", 0);
        this._shaderLodUniform = new CGL.Uniform(this._shader, "f", "lod", inLod);
    }

    cgl.pushPMatrix();
    const sizeTex = [portTex.width, portTex.height];
    const small = port.op.patch.cgl.canvasWidth > sizeTex[0] && port.op.patch.cgl.canvasHeight > sizeTex[1];

    if (small)
    {
        mat4.ortho(cgl.pMatrix, 0, port.op.patch.cgl.canvasWidth, port.op.patch.cgl.canvasHeight, 0, 0.001, 11);
    }
    else mat4.ortho(cgl.pMatrix, -1, 1, 1, -1, 0.001, 11);

    const oldTex = cgl.getTexture(texSlot);
    const oldTexCubemap = cgl.getTexture(texSlotCubemap);
    
    let iTexType = inType.get();
    let texType = 0;
    if (portTex)
    {
        if (iTexType == "Automatic")
        {
            if (portTex.cubemap) texType = 1;
            if (portTex.textureType == CGL.Texture.TYPE_DEPTH) texType = 2;
        }
        else if (iTexType == "Depth")
        {
            texType = 2;
        }
        else if (iTexType == "Cubemap")
        {
            texType = 1;
        }
        
        if (texType == 0 || texType == 2)
        {
            cgl.setTexture(texSlot, portTex.tex);
            cgl.setTexture(texSlotCubemap, this._emptyCubemap.cubemap, cgl.gl.TEXTURE_CUBE_MAP);
        }
        else if (texType == 1)
        {
            cgl.setTexture(texSlotCubemap, portTex.cubemap, cgl.gl.TEXTURE_CUBE_MAP);
        }

        timer.update();
        this._shaderTimeUniform.setValue(timer.get());

        this._shaderTypeUniform.setValue(texType);
        let s = [port.op.patch.cgl.canvasWidth, port.op.patch.cgl.canvasHeight];

        cgl.gl.clearColor(0, 0, 0, 0);
        cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);

        cgl.pushModelMatrix();
        if (small)
        {
            s = sizeTex;
            mat4.translate(cgl.mMatrix, cgl.mMatrix, [sizeTex[0] / 2, sizeTex[1] / 2, 0]);
            mat4.scale(cgl.mMatrix, cgl.mMatrix, [sizeTex[0] / 2, sizeTex[1] / 2, 0]);
        }
        this._mesh.render(this._shader);
        cgl.popModelMatrix();

        if (texType == 0) cgl.setTexture(texSlot, oldTex);
        if (texType == 1) cgl.setTexture(texSlotCubemap, oldTexCubemap);

        cgl.popPMatrix();
        cgl.resetViewPort();

        const sizeImg = [layer.width, layer.height];

        const stretch = false;
        // if (!stretch)
        // {
        if (portTex.width > portTex.height) sizeImg[1] = layer.width * sizeTex[1] / sizeTex[0];
        else
        {
            sizeImg[1] = layer.width * (sizeTex[1] / sizeTex[0]);

            if (sizeImg[1] > layer.height)
            {
                const r = layer.height / sizeImg[1];
                sizeImg[0] *= r;
                sizeImg[1] *= r;
            }
        }

        const scaledDown = sizeImg[0] > sizeTex[0] && sizeImg[1] > sizeTex[1];

        // ctx.imageSmoothingEnabled = !small || !scaledDown;
        ctx.imageSmoothingEnabled = true;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(layer.x, layer.y - 10, 10, 10);
        ctx.fillStyle = "#000000";
        ctx.fillRect(layer.x, layer.y - 10, 5, 5);
        ctx.fillRect(layer.x + 5, layer.y - 10 + 5, 5, 5);

        let layerHeight = layer.height;
        let numX = (10 * layer.width / layerHeight * layer.scale) * 2;
        let numY = (numX * layer.height / layer.width);
        let stepY = (layerHeight / numY);
        let stepX = (layer.width / numX);

        for (let x = 0; x < numX + 1; x++)
            for (let y = 0; y < numY + 1; y++)
            {
                if ((x + y) % 2 == 0) ctx.fillStyle = "#333333";
                else ctx.fillStyle = "#393939";
                ctx.fillRect(layer.x - layer.x % stepX * 2 + stepX * x, layer.y - layer.y % stepX * 2 + stepY * y, stepX, stepY);
            }

        ctx.fillStyle = "#222";
        const borderLeft = (layer.width - sizeImg[0]) / 2;
        const borderTop = (layerHeight - sizeImg[1]) / 2;

        let imgPosX = layer.x + (layer.width - sizeImg[0]) / 2;
        let imgPosY = layer.y + (layerHeight - sizeImg[1]) / 2;
        let imgSizeW = sizeImg[0];
        let imgSizeH = sizeImg[1];

        if (layerHeight - sizeImg[1] < 0)
        {
            imgPosX = layer.x + (layer.width - sizeImg[0] * layerHeight / sizeImg[1]) / 2;
            imgPosY = layer.y;
            imgSizeW = sizeImg[0] * layerHeight / sizeImg[1];
            imgSizeH = layerHeight;
        }

        ctx.fillRect(layer.x, layer.y, imgPosX - layer.x, layerHeight);
        ctx.fillRect(layer.x + imgSizeW + imgPosX - layer.x, layer.y, imgSizeW, layerHeight);
        ctx.fillRect(layer.x, layer.y, layer.width, borderTop);
        ctx.fillRect(layer.x, layer.y + sizeImg[1] + borderTop, layer.width, borderTop);

        if (cgl.canvas && cgl.canvasWidth > 0 && cgl.canvasHeight > 0 && cgl.canvas.width > 0 && cgl.canvas.height > 0)
        {
            try
            {
                const bigPixels = imgSizeW / s[0] > 3 || imgSizeH / s[1] > 3;
                const veryBigPixels = imgSizeW / s[0] > 10 || imgSizeH / s[1] > 10;

                if (sizeTex[1] == 1)
                {
                    ctx.imageSmoothingEnabled = false;// workaround filtering problems
                    ctx.drawImage(cgl.canvas,
                        0,
                        0,
                        s[0],
                        s[1],
                        layer.x,
                        layer.y,
                        layer.width,
                        layerHeight);// workaround filtering problems
                    ctx.imageSmoothingEnabled = true;
                }
                else
                if (sizeTex[0] == 1 || inLod > 0)
                {
                    ctx.imageSmoothingEnabled = false;// workaround filtering problems
                    ctx.drawImage(cgl.canvas,
                        0,
                        0,
                        s[0],
                        s[1],
                        layer.x,
                        layer.y,
                        layer.width,
                        layerHeight);
                    ctx.imageSmoothingEnabled = true;
                }
                else
                if (sizeImg[0] != 0 && sizeImg[1] != 0 && layer.width != 0 && layerHeight != 0 && imgSizeW != 0 && imgSizeH != 0)
                {
                    ctx.imageSmoothingEnabled = !bigPixels;

                    ctx.drawImage(cgl.canvas,
                        0,
                        0,
                        s[0],
                        s[1],
                        imgPosX,
                        imgPosY,
                        imgSizeW,
                        imgSizeH);
                }

                if (veryBigPixels)
                {
                    const stepx = imgSizeW / s[0];
                    const stepy = imgSizeH / s[1];

                    ctx.imageSmoothingEnabled = true;
                    ctx.lineWidth = 1;
                    ctx.globalAlpha = 0.5;
                    ctx.beginPath();

                    for (let x = 0; x <= s[0]; x++)
                    {
                        ctx.moveTo(imgPosX + x * stepx, imgPosY);
                        ctx.lineTo(imgPosX + x * stepx, imgPosY + imgSizeH);
                    }

                    for (let y = 0; y <= s[1]; y++)
                    {
                        ctx.moveTo(imgPosX, imgPosY + y * stepy);
                        ctx.lineTo(imgPosX + imgSizeW, imgPosY + y * stepy);
                    }

                    ctx.strokeStyle = "#555";
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            }
            catch (e)
            {
                console.error("canvas drawimage exception...", e);
            }
            // }
        }

        let info = "";
        if (inShowInfo.get() && port.get() && port.get().getInfoOneLine) info += port.get().getInfoOneLine() + "\n";
        outInfo.set(info);

        if (inPickColor.get())
        {
            info += colorString + "\n";

            const x = imgPosX + imgSizeW * inX.get();
            const y = imgPosY + imgSizeH * inY.get();

            for (let ii = 0; ii < 2; ii++)
            {
                if (ii == 0)ctx.fillStyle = "#000";
                else ctx.fillStyle = "#fff";

                ctx.fillRect(
                    x - 1 + ii,
                    y - 10 + ii,
                    1,
                    20);

                ctx.fillRect(
                    x - 10 + ii,
                    y - 1 + ii,
                    20,
                    1);
            }
        }

        if (inShowInfo.get() || inPickColor.get())
        {
            op.setUiAttrib({ "comment": info });
        }

        if (inPickColor.get())
        {
            const gl = cgl.gl;

            const realTexture = inTex.get();
            if (!realTexture)
            {
                colorString = "";
                return;
            }
            if (!fb) fb = gl.createFramebuffer();
            if (!pixelReader) pixelReader = new CGL.PixelReader();

            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, realTexture.tex, 0);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            pixelReader.read(cgl, fb, realTexture.pixelFormat, inX.get() * realTexture.width, realTexture.height - inY.get() * realTexture.height, 1, 1, (pixel) =>
            {
                if (!CGL.Texture.isPixelFormatFloat(realTexture.pixelFormat))
                {
                    colorString = "Pixel Float: " + Math.floor(pixel[0] / 255 * 100) / 100;
                    if (!isNaN(pixel[1]))colorString += ", " + Math.floor(pixel[1] / 255 * 100) / 100;
                    if (!isNaN(pixel[2]))colorString += ", " + Math.floor(pixel[2] / 255 * 100) / 100;
                    if (!isNaN(pixel[3]))colorString += ", " + Math.floor(pixel[3] / 255 * 100) / 100;
                    colorString += "\n";

                    if (realTexture.pixelFormat.indexOf("ubyte") > 0)
                    {
                        colorString += "Pixel UByte: ";
                        colorString += Math.round(pixel[0]);
                        if (!isNaN(pixel[1]))colorString += ", " + Math.round(pixel[1]);
                        if (!isNaN(pixel[2]))colorString += ", " + Math.round(pixel[2]);
                        if (!isNaN(pixel[3]))colorString += ", " + Math.round(pixel[3]);

                        colorString += "\n";
                    }
                }
                else
                {
                    colorString = "Pixel Float: " + Math.round(pixel[0] * 100) / 100 + ", " + Math.round(pixel[1] * 100) / 100 + ", " + Math.round(pixel[2] * 100) / 100 + ", " + Math.round(pixel[3] * 100) / 100;
                    colorString += "\n";
                }
            });
        }
    }

    cgl.gl.clearColor(0, 0, 0, 0);
    cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);

    perf.finish();
};

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.Math.RgbMathExpression
// 
// **************************************************************

Ops.Gl.ImageCompose.Math.RgbMathExpression= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    render = op.inTrigger("Render"),

    inR = op.inString("R =", "color.r*x"),
    inG = op.inString("G =", "color.g*x"),
    inB = op.inString("B =", "color.b*x"),
    inA = op.inString("A =", "1.0"),
    inExec = op.inTriggerButton("Update Shader"),

    inX = op.inFloat("x", 1),
    inY = op.inFloat("y", 1),
    inZ = op.inFloat("z", 1),
    inW = op.inFloat("w", 1),

    intexA = op.inTexture("texA"),
    intexB = op.inTexture("texB"),
    intexC = op.inTexture("texC"),

    trigger = op.outTrigger("trigger"),
    outSrc = op.outString("code");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), shader.getDefaultFragmentShader());
const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    textureMaskUniform = new CGL.Uniform(shader, "t", "texMask", 1),
    tex2 = new CGL.Uniform(shader, "t", "utexA", 2),
    tex3 = new CGL.Uniform(shader, "t", "utexB", 3),
    tex4 = new CGL.Uniform(shader, "t", "utexC", 4),

    uniformW = new CGL.Uniform(shader, "f", "w", inW),
    uniformX = new CGL.Uniform(shader, "f", "x", inX),
    uniformY = new CGL.Uniform(shader, "f", "y", inY),
    uniformZ = new CGL.Uniform(shader, "f", "z", inZ);

inExec.onTriggered =
op.onLoadedValueSet = () =>
{
    init = true;
};

let init = true;

updateDefines();

inR.onChange =
inG.onChange =
inB.onChange = () =>
{
    op.setUiAttrib({ "extendTitle": "changed" });
    // inExec.setUiAttribs({ "greyout": false });
};

function updateDefines()
{

}

function myFloat(f)
{
    // if(CABLES.isNumeric(parseFloat(f)))
    // {
    //     let str= f+"";

    //     if(f%0)str+=".0";
    //     return str;

    // }
    return f;
}

function updateSource()
{
    // inExec.setUiAttribs({ "greyout": true });
    op.setUiAttrib({ "extendTitle": "" });
    let src = "";
    src += "IN vec2 texCoord;".endl();
    src += "UNI float x;".endl();
    src += "UNI float y;".endl();
    src += "UNI float z;".endl();
    src += "UNI float w;".endl();
    src += "UNI sampler2D tex;".endl();
    src += "UNI sampler2D utexA;".endl();
    src += "UNI sampler2D utexB;".endl();
    src += "UNI sampler2D utexC;".endl();

    src += "void main()".endl();
    src += "{".endl().endl();
    src += "  vec4 col=vec4(1.0);".endl();
    src += "  vec4 color=texture(tex,texCoord);".endl();
    src += "  vec4 texA=texture(utexA,texCoord);".endl();
    src += "  vec4 texB=texture(utexB,texCoord);".endl();
    src += "  vec4 texC=texture(utexC,texCoord);".endl().endl();

    src += "  // R src".endl();
    src += "  col.r=" + myFloat(inR.get()) + ";".endl();
    src += "  ".endl();

    src += "  // G src".endl();
    src += "  col.g=" + myFloat(inG.get()) + ";".endl();
    src += "  ".endl();

    src += "  // B src".endl();
    src += "  col.b=" + myFloat(inB.get()) + ";".endl();
    src += "  ".endl();

    src += "  // A src".endl();
    src += "  col.a=" + myFloat(inA.get()) + ";".endl();
    src += "  ".endl();

    src += "  outColor=col;".endl().endl();
    src += "}".endl();

    shader.setSource(shader.getDefaultVertexShader(), src);
    outSrc.set(src);
    shader.compile();
}

render.onTriggered = function ()
{
    if (init)
    {
        updateSource();
        init = false;
    }
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    // if (inTexMask.get())cgl.setTexture(1, inTexMask.get().tex);
    if (intexA.get())cgl.setTexture(2, intexA.get().tex);
    if (intexB.get())cgl.setTexture(3, intexB.get().tex);
    if (intexC.get())cgl.setTexture(4, intexC.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

//

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.Math.ColorMapRange
// 
// **************************************************************

Ops.Gl.ImageCompose.Math.ColorMapRange= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"maprange_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\n\nUNI float min1,min2,max1,max2;\n\nfloat map(float value)\n{\n    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);\n}\n\nvoid main()\n{\n    vec4 col=texture(tex,texCoord);\n\n    #ifdef CH_R\n        col.r=map(col.r);\n        #ifdef CLAMP\n            col.r=clamp(col.r,min2,max2);\n        #endif\n    #endif\n    #ifdef CH_G\n        col.g=map(col.g);\n        #ifdef CLAMP\n            col.g=clamp(col.g,min2,max2);\n        #endif\n    #endif\n    #ifdef CH_B\n        col.b=map(col.b);\n        #ifdef CLAMP\n            col.b=clamp(col.b,min2,max2);\n        #endif\n    #endif\n    #ifdef CH_A\n        col.a=map(col.a);\n        #ifdef CLAMP\n            col.a=clamp(col.a,min2,max2);\n        #endif\n    #endif\n\n    outColor = col;\n}",};
const
    render = op.inTrigger("render"),
    min1 = op.inValueSlider("Old Min", 0),
    max1 = op.inValueSlider("Old Max", 1),
    min2 = op.inValueSlider("New Min", 0),
    max2 = op.inValueSlider("New Max", 1),

    inClamp = op.inBool("Clamp", true),

    inR = op.inBool("R", true),
    inG = op.inBool("G", true),
    inB = op.inBool("B", true),
    inA = op.inBool("A", false),

    trigger = op.outTrigger("trigger");

op.setPortGroup("Input Range", [min1, max1]);
op.setPortGroup("Output Range", [min2, max2, inClamp]);

const cgl = op.patch.cgl;

const shader = new CGL.Shader(cgl, "colorMaprange");
shader.setSource(shader.getDefaultVertexShader(), attachments.maprange_frag);
toggleChannels(shader);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    uniMin1 = new CGL.Uniform(shader, "f", "min1", min1),
    uniMin2 = new CGL.Uniform(shader, "f", "min2", min2),
    unimax1 = new CGL.Uniform(shader, "f", "max1", max1),
    unimax2 = new CGL.Uniform(shader, "f", "max2", max2);

inR.onChange =
    inG.onChange =
    inB.onChange =
    inA.onChange =
    inClamp.onChange = () =>
    {
        toggleChannels(shader);
    };

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;
    if (!cgl.currentTextureEffect.getCurrentSourceTexture()) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

function toggleChannels(shader)
{
    shader.toggleDefine("CH_R", inR.get());
    shader.toggleDefine("CH_G", inG.get());
    shader.toggleDefine("CH_B", inB.get());
    shader.toggleDefine("CH_A", inA.get());
    shader.toggleDefine("CLAMP", inClamp.get());
}

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.ImageComposeSnapshot
// 
// **************************************************************

Ops.Gl.ImageCompose.ImageComposeSnapshot= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    render = op.inTrigger("Update"),
    trigger = op.outTrigger("trigger"),
    outTex = op.outTexture("Texture");

const cgl = op.patch.cgl;
let tc = new CGL.CopyTexture(cgl, "textureThief", {});
let pf = false;
let wrap = -1;
let filter = -1;

render.onTriggered = () =>
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    const effect = cgl.currentTextureEffect;
    effect.endEffect();

    const shouldPf = cgl.currentTextureEffect.getCurrentSourceTexture().pixelFormat;
    const shouldWrap = cgl.currentTextureEffect.getCurrentSourceTexture().wrap;
    const shouldFilter = cgl.currentTextureEffect.getCurrentSourceTexture().filter;

    if (pf != shouldPf || wrap != shouldWrap || filter != shouldFilter)
    {
        tc = new CGL.CopyTexture(cgl, "textureThief",
            {
                "pixelFormat": cgl.currentTextureEffect.getCurrentSourceTexture().pixelFormat,
                "wrap": shouldWrap,
                "filter": shouldFilter
            });
        pf = shouldPf;
        wrap = shouldWrap;
        filter = shouldFilter;
    }

    const vp = cgl.getViewPort();
    outTex.set(CGL.Texture.getEmptyTexture(cgl));

    const tx = cgl.currentTextureEffect.getCurrentSourceTexture();
    outTex.set(tc.copy(tx));

    effect.continueEffect();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.Invert_v2
// 
// **************************************************************

Ops.Gl.ImageCompose.Invert_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"invert_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\nUNI sampler2D texMask;\nUNI float amount;\n\n{{CGL.BLENDMODES3}}\n\nvoid main()\n{\n    vec4 col=texture(tex,texCoord);\n\n    #ifdef USE_MASK\n        #ifdef MASK_INVERT\n            if(texture(texMask,texCoord).r>0.5)\n            {\n                outColor= col;\n                return;\n            }\n        #endif\n\n        #ifndef MASK_INVERT\n            if(texture(texMask,texCoord).r<0.5)\n            {\n                outColor= col;\n                return;\n            }\n        #endif\n    #endif\n\n\n    vec3 m=vec3( INVR , INVG , INVB );\n    vec4 invert = vec4(clamp(m-col.rgb,0.0,1.0),col.a);\n\n    outColor=cgl_blendPixel(col,invert,amount);\n\n    // outColor.rgb=m;\n}\n",};
const
    render = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    maskInvert = op.inBool("Mask Invert", false),
    mask = op.inTexture("Mask"),
    invertR = op.inBool("Invert R", true),
    invertG = op.inBool("Invert G", true),
    invertB = op.inBool("Invert B", true),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.invert_frag);
const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    textureMaskUniform = new CGL.Uniform(shader, "t", "texMask", 1);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

maskInvert.onChange =
    invertR.onChange =
    invertG.onChange =
    invertB.onChange =
    mask.onLinkChanged = updateDefines;
updateDefines();

function updateDefines()
{
    shader.toggleDefine("USE_MASK", mask.isLinked());
    shader.toggleDefine("MASK_INVERT", maskInvert.get());

    shader.define("INVR", invertR.get() ? "1.0" : "0.0");
    shader.define("INVG", invertG.get() ? "1.0" : "0.0");
    shader.define("INVB", invertB.get() ? "1.0" : "0.0");
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    if (mask.get())cgl.setTexture(1, mask.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Gl.Matrix.WASDCamera_v2
// 
// **************************************************************

Ops.Gl.Matrix.WASDCamera_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    render = op.inTrigger("render"),
    enablePointerLock = op.inBool("Enable pointer lock", true),
    trigger = op.outTrigger("trigger"),
    isLocked = op.outBoolNum("isLocked", false),

    moveSpeed = op.inFloat("Speed", 1),
    mouseSpeed = op.inFloat("Mouse Speed", 1),
    fly = op.inValueBool("Allow Flying", true),
    inActive = op.inBool("Active", true),

    inMoveXPos = op.inBool("Move X+"),
    inMoveXNeg = op.inBool("Move X-"),
    inMoveYPos = op.inBool("Move Y+"),
    inMoveYNeg = op.inBool("Move Y-"),

    inReset = op.inTriggerButton("Reset"),

    outPosX = op.outNumber("posX"),
    outPosY = op.outNumber("posY"),
    outPosZ = op.outNumber("posZ"),

    outMouseDown = op.outTrigger("Mouse Left"),
    outMouseDownRight = op.outTrigger("Mouse Right"),

    outDirX = op.outNumber("Dir X"),
    outDirY = op.outNumber("Dir Y"),
    outDirZ = op.outNumber("Dir Z");

const vPos = vec3.create();
let speedx = 0, speedy = 0, speedz = 0;
const movementSpeedFactor = 0.5;

op.setPortGroup("Move", [inMoveYNeg, inMoveYPos, inMoveXNeg, inMoveXPos]);

let mouseNoPL = { "firstMove": true,
    "deltaX": 0,
    "deltaY": 0,
};

const DEG2RAD = 3.14159 / 180.0;

let rotX = 0;
let rotY = 0;

let posX = 0;
let posY = 0;
let posZ = 0;

let pressedW = false;
let pressedA = false;
let pressedS = false;
let pressedD = false;

const cgl = op.patch.cgl;

const viewMatrix = mat4.create();

op.toWorkPortsNeedToBeLinked(render);
let lastMove = 0;

initListener();

enablePointerLock.onChange = initListener;

inReset.onTriggered = () =>
{
    rotX = 0;
    rotY = 0;
    posX = 0;
    posY = 0;
    posZ = 0;
};

inActive.onChange = () =>
{
    document.exitPointerLock();
    removeListener();

    lockChangeCallback();

    if (inActive.get())
    {
        initListener();
    }
};

render.onTriggered = function ()
{
    if (cgl.tempData.shadowPass) return trigger.trigger();

    calcCameraMovement();
    move();

    if (!fly.get())posY = 0.0;

    if (speedx !== 0.0 || speedy !== 0.0 || speedz !== 0)
    {
        outPosX.set(posX);
        outPosY.set(posY);
        outPosZ.set(posZ);
    }

    cgl.pushViewMatrix();

    vec3.set(vPos, -posX, -posY, -posZ);

    mat4.identity(cgl.vMatrix);

    mat4.rotateX(cgl.vMatrix, cgl.vMatrix, DEG2RAD * rotX);
    mat4.rotateY(cgl.vMatrix, cgl.vMatrix, DEG2RAD * rotY);

    mat4.translate(cgl.vMatrix, cgl.vMatrix, vPos);

    trigger.trigger();
    cgl.popViewMatrix();

    // for dir vec
    mat4.identity(viewMatrix);
    mat4.rotateX(viewMatrix, viewMatrix, DEG2RAD * rotX);
    mat4.rotateY(viewMatrix, viewMatrix, DEG2RAD * rotY);
    mat4.transpose(viewMatrix, viewMatrix);

    const dir = vec4.create();
    vec4.transformMat4(dir, [0, 0, 1, 1], viewMatrix);

    vec4.normalize(dir, dir);
    outDirX.set(-dir[0]);
    outDirY.set(-dir[1]);
    outDirZ.set(-dir[2]);
};

//--------------

function calcCameraMovement()
{
    let camMovementXComponent = 0.0,
        camMovementYComponent = 0.0,
        camMovementZComponent = 0.0,
        pitchFactor = 0,
        yawFactor = 0;

    if (pressedW)
    {
        // Control X-Axis movement
        pitchFactor = Math.cos(DEG2RAD * rotX);

        camMovementXComponent += (movementSpeedFactor * (Math.sin(DEG2RAD * rotY))) * pitchFactor;

        // Control Y-Axis movement
        camMovementYComponent += movementSpeedFactor * (Math.sin(DEG2RAD * rotX)) * -1.0;

        // Control Z-Axis movement
        yawFactor = (Math.cos(DEG2RAD * rotX));
        camMovementZComponent += (movementSpeedFactor * (Math.cos(DEG2RAD * rotY)) * -1.0) * yawFactor;
    }

    if (pressedS)
    {
        // Control X-Axis movement
        pitchFactor = Math.cos(DEG2RAD * rotX);
        camMovementXComponent += (movementSpeedFactor * (Math.sin(DEG2RAD * rotY)) * -1.0) * pitchFactor;

        // Control Y-Axis movement
        camMovementYComponent += movementSpeedFactor * (Math.sin(DEG2RAD * rotX));

        // Control Z-Axis movement
        yawFactor = (Math.cos(DEG2RAD * rotX));
        camMovementZComponent += (movementSpeedFactor * (Math.cos(DEG2RAD * rotY))) * yawFactor;
    }

    let yRotRad = DEG2RAD * rotY;

    if (pressedA)
    {
        // Calculate our Y-Axis rotation in radians once here because we use it twice

        camMovementXComponent += -movementSpeedFactor * (Math.cos(yRotRad));
        camMovementZComponent += -movementSpeedFactor * (Math.sin(yRotRad));
    }

    if (pressedD)
    {
        // Calculate our Y-Axis rotation in radians once here because we use it twice

        camMovementXComponent += movementSpeedFactor * (Math.cos(yRotRad));
        camMovementZComponent += movementSpeedFactor * (Math.sin(yRotRad));
    }

    const mulSpeed = 0.016;

    speedx = camMovementXComponent * mulSpeed;
    speedy = camMovementYComponent * mulSpeed;
    speedz = camMovementZComponent * mulSpeed;

    if (speedx > movementSpeedFactor) speedx = movementSpeedFactor;
    if (speedx < -movementSpeedFactor) speedx = -movementSpeedFactor;

    if (speedy > movementSpeedFactor) speedy = movementSpeedFactor;
    if (speedy < -movementSpeedFactor) speedy = -movementSpeedFactor;

    if (speedz > movementSpeedFactor) speedz = movementSpeedFactor;
    if (speedz < -movementSpeedFactor) speedz = -movementSpeedFactor;
}

function moveCallback(e)
{
    const mouseSensitivity = 0.1;
    rotX += e.movementY * mouseSensitivity * mouseSpeed.get();
    rotY += e.movementX * mouseSensitivity * mouseSpeed.get();

    if (rotX < -90.0) rotX = -90.0;
    if (rotX > 90.0) rotX = 90.0;
    if (rotY < -180.0) rotY += 360.0;
    if (rotY > 180.0) rotY -= 360.0;
}

const canvas = op.patch.cgl.canvas;

function mouseDown(e)
{
    if (e.which == 3) outMouseDownRight.trigger();
    else outMouseDown.trigger();
}

function lockChangeCallback(e)
{
    if (document.pointerLockElement === canvas ||
            document.mozPointerLockElement === canvas ||
            document.webkitPointerLockElement === canvas)
    {
        document.addEventListener("pointerdown", mouseDown, false);
        document.addEventListener("pointermove", moveCallback, false);
        document.addEventListener("keydown", keyDown, false);
        document.addEventListener("keyup", keyUp, false);
        isLocked.set(true);
    }
    else
    {
        document.removeEventListener("pointerdown", mouseDown, false);
        document.removeEventListener("pointermove", moveCallback, false);
        document.removeEventListener("keydown", keyDown, false);
        document.removeEventListener("keyup", keyUp, false);
        isLocked.set(false);
        pressedW = false;
        pressedA = false;
        pressedS = false;
        pressedD = false;
    }
}

function startPointerLock()
{
    const test = false;
    if (render.isLinked() && enablePointerLock.get())
    {
        document.addEventListener("pointermove", moveCallback, false);
        canvas.requestPointerLock = canvas.requestPointerLock ||
                                    canvas.mozRequestPointerLock ||
                                    canvas.webkitRequestPointerLock;
        canvas.requestPointerLock();
    }
}

function removeListener()
{
    cgl.canvas.removeEventListener("pointermove", moveCallbackNoPL, false);
    cgl.canvas.removeEventListener("pointerup", upCallbackNoPL, false);
    cgl.canvas.removeEventListener("keydown", keyDown, false);
    cgl.canvas.removeEventListener("keyup", keyUp, false);

    document.removeEventListener("pointerlockchange", lockChangeCallback, false);
    document.removeEventListener("mozpointerlockchange", lockChangeCallback, false);
    document.removeEventListener("webkitpointerlockchange", lockChangeCallback, false);
    op.patch.cgl.canvas.removeEventListener("mousedown", startPointerLock);
}

function initListener()
{
    if (enablePointerLock.get())
    {
        document.addEventListener("pointerlockchange", lockChangeCallback, false);
        document.addEventListener("mozpointerlockchange", lockChangeCallback, false);
        document.addEventListener("webkitpointerlockchange", lockChangeCallback, false);
        op.patch.cgl.canvas.addEventListener("mousedown", startPointerLock);

        cgl.canvas.removeEventListener("pointermove", moveCallbackNoPL, false);
        cgl.canvas.removeEventListener("pointerup", upCallbackNoPL, false);
        cgl.canvas.removeEventListener("keydown", keyDown, false);
        cgl.canvas.removeEventListener("keyup", keyUp, false);
    }
    else
    {
        cgl.canvas.addEventListener("pointermove", moveCallbackNoPL, false);
        cgl.canvas.addEventListener("pointerup", upCallbackNoPL, false);
        cgl.canvas.addEventListener("keydown", keyDown, false);
        cgl.canvas.addEventListener("keyup", keyUp, false);
    }
}

function upCallbackNoPL(e)
{
    try { cgl.canvas.releasePointerCapture(e.pointerId); }
    catch (e) {}
    mouseNoPL.firstMove = true;
}

function moveCallbackNoPL(e)
{
    if (e && e.buttons == 1)
    {
        try { cgl.canvas.setPointerCapture(e.pointerId); }
        catch (_e) {}

        if (!mouseNoPL.firstMove)
        {
            // outDragging.set(true);
            const deltaX = (e.clientX - mouseNoPL.lastX) * mouseSpeed.get() * 0.5;
            const deltaY = (e.clientY - mouseNoPL.lastY) * mouseSpeed.get() * 0.5;

            rotX += deltaY;
            rotY += deltaX;
            // outDeltaX.set(deltaX);
            // outDeltaY.set(deltaY);
        }

        mouseNoPL.firstMove = false;

        mouseNoPL.lastX = e.clientX;
        mouseNoPL.lastY = e.clientY;
    }
}

function move()
{
    let timeOffset = window.performance.now() - lastMove;
    timeOffset *= moveSpeed.get();
    posX += speedx * timeOffset;
    posY += speedy * timeOffset;
    posZ += speedz * timeOffset;

    lastMove = window.performance.now();
}

function keyDown(e)
{
    switch (e.which)
    {
    case 87:
        pressedW = true;
        break;
    case 65:
        pressedA = true;
        break;
    case 83:
        pressedS = true;
        break;
    case 68:
        pressedD = true;
        break;

    default:
        break;
    }
}

function keyUp(e)
{
    switch (e.which)
    {
    case 87:
        pressedW = false;
        break;
    case 65:
        pressedA = false;
        break;
    case 83:
        pressedS = false;
        break;
    case 68:
        pressedD = false;
        break;
    }
}

inMoveXPos.onChange = () => { pressedD = inMoveXPos.get(); };
inMoveXNeg.onChange = () => { pressedA = inMoveXNeg.get(); };
inMoveYPos.onChange = () => { pressedW = inMoveYPos.get(); };
inMoveYNeg.onChange = () => { pressedS = inMoveYNeg.get(); };

}
};






// **************************************************************
// 
// Ops.Devices.Keyboard.KeyPressLearn
// 
// **************************************************************

Ops.Devices.Keyboard.KeyPressLearn= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    learnedKeyCode = op.inValueInt("key code"),
    canvasOnly = op.inValueBool("canvas only", true),
    modKey = op.inValueSelect("Mod Key", ["none", "alt"], "none"),
    inEnable = op.inValueBool("Enabled", true),
    preventDefault = op.inValueBool("Prevent Default"),
    learn = op.inTriggerButton("learn"),
    onPress = op.outTrigger("on press"),
    onRelease = op.outTrigger("on release"),
    outPressed = op.outBoolNum("Pressed", false),
    outKey = op.outString("Key");

const cgl = op.patch.cgl;
let learning = false;
let dia = null;
modKey.onChange = learnedKeyCode.onChange = updateKeyName;

addCanvasListener();

function onKeyDown(e)
{
    if (learning)
    {
        learnedKeyCode.set(e.keyCode);
        if (CABLES.UI)
        {
            if (dia)dia.close();
            op.refreshParams();
        }
        learning = false;
        removeListeners();
        addListener();

        if (CABLES.UI)gui.emitEvent("portValueEdited", op, learnedKeyCode, learnedKeyCode.get());
    }
    else
    {
        if (e.keyCode == learnedKeyCode.get())
        {
            if (modKey.get() == "alt")
            {
                if (e.altKey === true)
                {
                    onPress.trigger();
                    outPressed.set(true);
                    if (preventDefault.get())e.preventDefault();
                }
            }
            else
            {
                onPress.trigger();
                outPressed.set(true);
                if (preventDefault.get())e.preventDefault();
            }
        }
    }
}

function onKeyUp(e)
{
    if (e.keyCode == learnedKeyCode.get())
    {
        let doTrigger = true;
        if (modKey.get() == "alt" && e.altKey != true) doTrigger = false;

        if (doTrigger)
        {
            onRelease.trigger();
            outPressed.set(false);
        }
    }
}

op.onDelete = function ()
{
    cgl.canvas.removeEventListener("keyup", onKeyUp, false);
    cgl.canvas.removeEventListener("keydown", onKeyDown, false);
    document.removeEventListener("keyup", onKeyUp, false);
    document.removeEventListener("keydown", onKeyDown, false);
};

learn.onTriggered = function ()
{
    if (!CABLES.UI) return;

    learning = true;
    addDocumentListener();

    dia = new CABLES.UI.ModalDialog({
        "title": "Learn Key...",
        "text": "Just press any key" });

    dia.on("close", () =>
    {
        learning = false;
        removeListeners();
        addListener();
        dia = null;
    });
};

function addListener()
{
    if (canvasOnly.get()) addCanvasListener();
    else addDocumentListener();
}

function removeListeners()
{
    document.removeEventListener("keydown", onKeyDown, false);
    document.removeEventListener("keyup", onKeyUp, false);
    cgl.canvas.removeEventListener("keydown", onKeyDown, false);
    cgl.canvas.removeEventListener("keyup", onKeyUp, false);
    outPressed.set(false);
}

function addCanvasListener()
{
    if (!CABLES.isNumeric(cgl.canvas.getAttribute("tabindex"))) cgl.canvas.setAttribute("tabindex", 1);

    cgl.canvas.addEventListener("keydown", onKeyDown, false);
    cgl.canvas.addEventListener("keyup", onKeyUp, false);
}

function addDocumentListener()
{
    document.addEventListener("keydown", onKeyDown, false);
    document.addEventListener("keyup", onKeyUp, false);
}

inEnable.onChange = function ()
{
    if (!inEnable.get())
    {
        removeListeners();
    }
    else
    {
        addListener();
    }
};

canvasOnly.onChange = function ()
{
    removeListeners();
    addListener();
};

function updateKeyName()
{
    let keyName = keyCodeToName(learnedKeyCode.get());
    const modKeyName = modKey.get();
    if (modKeyName && modKeyName !== "none")
    {
        keyName = modKeyName.charAt(0).toUpperCase() + modKeyName.slice(1) + "-" + keyName;
    }
    op.setUiAttribs({ "extendTitle": keyName });
    outKey.set(keyName);
}

// todo remove in next version
function keyCodeToName(keyCode)
{
    if (!keyCode && keyCode !== 0) return "Unidentified";
    const keys = {
        "8": "Backspace",
        "9": "Tab",
        "12": "Clear",
        "13": "Enter",
        "16": "Shift",
        "17": "Control",
        "18": "Alt",
        "19": "Pause",
        "20": "CapsLock",
        "27": "Escape",
        "32": "Space",
        "33": "PageUp",
        "34": "PageDown",
        "35": "End",
        "36": "Home",
        "37": "ArrowLeft",
        "38": "ArrowUp",
        "39": "ArrowRight",
        "40": "ArrowDown",
        "45": "Insert",
        "46": "Delete",
        "112": "F1",
        "113": "F2",
        "114": "F3",
        "115": "F4",
        "116": "F5",
        "117": "F6",
        "118": "F7",
        "119": "F8",
        "120": "F9",
        "121": "F10",
        "122": "F11",
        "123": "F12",
        "144": "NumLock",
        "145": "ScrollLock",
        "224": "Meta"
    };
    if (keys[keyCode])
    {
        return keys[keyCode];
    }
    else
    {
        return String.fromCharCode(keyCode);
    }
}

}
};






// **************************************************************
// 
// Ops.Boolean.BoolToNumber_v2
// 
// **************************************************************

Ops.Boolean.BoolToNumber_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    useValue1Port = op.inBool("Use Value 1", false),
    value0port = op.inFloat("Value 0", 0),
    value1port = op.inFloat("Value 1", 1),
    outValuePort = op.outNumber("Out Value", 0);

value0port.onChange =
    value1port.onChange =
    useValue1Port.onChange = setOutput;

function setOutput()
{
    const useValue1 = useValue1Port.get();

    if (useValue1)
    {
        outValuePort.set(value1port.get());
    }
    else
    {
        outValuePort.set(value0port.get());
    }
}

}
};






// **************************************************************
// 
// Ops.Anim.Smooth
// 
// **************************************************************

Ops.Anim.Smooth= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    exec = op.inTrigger("Update"),
    inMode = op.inBool("Separate inc/dec", false),
    inVal = op.inValue("Value"),
    next = op.outTrigger("Next"),
    inDivisorUp = op.inValue("Inc factor", 4),
    inDivisorDown = op.inValue("Dec factor", 4),
    result = op.outNumber("Result", 0);

let val = 0;
let goal = 0;
let oldVal = 0;
let lastTrigger = 0;

op.toWorkPortsNeedToBeLinked(exec);

let divisorUp;
let divisorDown;
let divisor = 4;
let finished = true;

let selectIndex = 0;
const MODE_SINGLE = 0;
const MODE_UP_DOWN = 1;

onFilterChange();
getDivisors();

inMode.setUiAttribs({ "hidePort": true });

inDivisorUp.onChange = inDivisorDown.onChange = getDivisors;
inMode.onChange = onFilterChange;
update();

function onFilterChange()
{
    const selectedMode = inMode.get();
    if (!selectedMode) selectIndex = MODE_SINGLE;
    else selectIndex = MODE_UP_DOWN;

    if (selectIndex == MODE_SINGLE)
    {
        inDivisorDown.setUiAttribs({ "greyout": true });
        inDivisorUp.setUiAttribs({ "title": "Inc/Dec factor" });
    }
    else if (selectIndex == MODE_UP_DOWN)
    {
        inDivisorDown.setUiAttribs({ "greyout": false });
        inDivisorUp.setUiAttribs({ "title": "Inc factor" });
    }

    getDivisors();
    update();
}

function getDivisors()
{
    if (selectIndex == MODE_SINGLE)
    {
        divisorUp = inDivisorUp.get();
        divisorDown = inDivisorUp.get();
    }
    else if (selectIndex == MODE_UP_DOWN)
    {
        divisorUp = inDivisorUp.get();
        divisorDown = inDivisorDown.get();
    }

    if (divisorUp <= 0.2 || divisorUp != divisorUp)divisorUp = 0.2;
    if (divisorDown <= 0.2 || divisorDown != divisorDown)divisorDown = 0.2;
}

inVal.onChange = function ()
{
    finished = false;
    let oldGoal = goal;

    goal = inVal.get();
};

inDivisorUp.onChange = function ()
{
    getDivisors();
};

function update()
{
    let tm = 1;
    if (performance.now() - lastTrigger > 500 || lastTrigger === 0) val = inVal.get() || 0;
    else tm = (performance.now() - lastTrigger) / (performance.now() - lastTrigger);
    lastTrigger = performance.now();

    if (val != val)val = 0;

    if (divisor <= 0)divisor = 0.0001;

    const diff = goal - val;

    if (diff >= 0) val += (diff) / (divisorDown * tm);
    else val += (diff) / (divisorUp * tm);

    if (Math.abs(diff) < 0.00001)val = goal;

    if (divisor != divisor)val = 0;
    if (val != val || val == -Infinity || val == Infinity)val = inVal.get();

    if (oldVal != val)
    {
        result.set(val);
        oldVal = val;
    }

    if (val == goal && !finished)
    {
        finished = true;
        result.set(val);
    }
}

exec.onTriggered = function ()
{
    update();
    next.trigger();
};

}
};






// **************************************************************
// 
// Ops.Gl.Matrix.GetViewMatrix
// 
// **************************************************************

Ops.Gl.Matrix.GetViewMatrix= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    matrix = op.outArray("matrix", 4);

let m = mat4.create();

render.onTriggered = function ()
{
    mat4.copy(m, op.patch.cgl.vMatrix);
    // matrix.set(null);
    matrix.setRef(m);
    trigger.trigger();
};

matrix.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

}
};






// **************************************************************
// 
// Ops.Trigger.RouteTrigger
// 
// **************************************************************

Ops.Trigger.RouteTrigger= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const NUM_PORTS = 24;
const
    exePort = op.inTriggerButton("Execute"),
    switchPort = op.inValueInt("Switch Value"),
    nextTriggerPort = op.outTrigger("Next Trigger"),
    valueOutPort = op.outNumber("Switched Value");

const triggerPorts = [];
exePort.onTriggered = update;

switchPort.setUiAttribs({ "tlEase": 1 });

for (let j = 0; j < NUM_PORTS; j++)
{
    triggerPorts[j] = op.outTrigger("Trigger " + j);

    triggerPorts[j].onLinkChanged = countLinks;
}

const
    defaultTriggerPort = op.outTrigger("Default Trigger"),
    outNumConnected = op.outNumber("Highest Index");

function update()
{
    const index = Math.round(switchPort.get());

    if (index >= 0 && index < NUM_PORTS)
    {
        valueOutPort.set(index);
        triggerPorts[index].trigger();
    }
    else
    {
        valueOutPort.set(-1);
        defaultTriggerPort.trigger();
    }
    nextTriggerPort.trigger();
}

function countLinks()
{
    let count = 0;
    for (let i = 0; i < triggerPorts.length; i++)
        if (triggerPorts[i] && triggerPorts[i].isLinked())count = i;

    outNumConnected.set(count);
}

}
};






// **************************************************************
// 
// Ops.Gl.Matrix.MultiplyViewMatrix
// 
// **************************************************************

Ops.Gl.Matrix.MultiplyViewMatrix= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    render = op.inTrigger("render"),
    matrix = op.inArray("matrix"),
    inIdentity = op.inValueBool("Identity", false),
    trigger = op.outTrigger("trigger");

const m = mat4.create();
const cgl = this.patch.cgl;

matrix.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

render.onTriggered = function ()
{
    cgl.pushViewMatrix();

    if (matrix.get())
    {
        if (inIdentity.get()) mat4.identity(cgl.vMatrix);

        mat4.multiply(cgl.vMatrix, cgl.vMatrix, matrix.get());
    }

    trigger.trigger();
    cgl.popViewMatrix();
};

}
};






// **************************************************************
// 
// Ops.Gl.Matrix.AnimMatrix
// 
// **************************************************************

Ops.Gl.Matrix.AnimMatrix= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inTrigger = op.inTrigger("Update"),
    inMat = op.inArray("Next Matrix"),

    inDur = op.inFloat("Duration", 1),
    inCustomEase = op.inObject("Custom Ease Curve"),
    inCursomEaseFlip = op.inBool("Custom Curve Reverse", false),

    next = op.outTrigger("Next"),
    outArr = op.outArray("Matrix", 4);

let lastTime = 0;
let startTime = 0;
let firsttime = true;
let cycle = 1;

const anim = new CABLES.Anim();
anim.createPort(op, "easing", init);
anim.loop = false;

let lastMat = null;

inDur.onChange = inMat.onChange = init;

const a = vec3.create();
const b = vec3.create();

let arr1, arr2;
let result = mat4.create();

inTrigger.onTriggered = () =>
{
    let t = CABLES.now() / 1000;

    let perc = anim.getValue(t);
    if (inCustomEase.get())
    {
        const easeAn = inCustomEase.get();
        if (inCursomEaseFlip.get())perc = 1 - perc;
        perc = easeAn.getValue(perc * easeAn.getLength());
        if (inCursomEaseFlip.get())perc = 1 - perc;
    }

    if (arr1 && arr2) ipMat(perc);
};

function matEquals(a, b)
{
    return (
        a[0] == b[0] &&
        a[1] == b[1] &&
        a[2] == b[2] &&
        a[3] == b[3] &&
        a[4] == b[4] &&
        a[5] == b[5] &&
        a[6] == b[6] &&
        a[7] == b[7] &&
        a[8] == b[8] &&
        a[9] == b[9] &&
        a[10] == b[10] &&
        a[11] == b[11] &&
        a[12] == b[12] &&
        a[13] == b[13] &&
        a[14] == b[14] &&
        a[15] == b[15]);
}

function init()
{
    if (!inMat.get()) return;
    if (inMat.get() == lastMat)
    {
        // mat4.copy(result,inMat.get());
        return;
    }

    if (lastMat)
        if (inMat.get() == lastMat && matEquals(inMat.get(), lastMat))
        {
            return;
        }

    lastMat = inMat.get();
    startTime = performance.now();
    anim.clear(CABLES.now() / 1000.0);

    anim.setValue(CABLES.now() / 1000.0, cycle);

    if (cycle == 1) cycle = 0;
    else cycle = 1;

    if (cycle == 0)
    {
        arr1 = inMat.get();
        arr2 = mat4.create();
        mat4.copy(arr2, result);
    }
    else
    {
        arr1 = mat4.create();
        arr2 = inMat.get();
        mat4.copy(arr1, result);
    }

    anim.setValue(inDur.get() + CABLES.now() / 1000.0, cycle, () =>
    {
        // result=outArr.get();
    });

    firsttime = false;
}

function ip(val1, val2, perc)
{
    return ((val2 - val1) * perc + val1);
}

function ipMat(perc)
{
    if (!arr1 || !arr2 || arr1.length != arr2.length)
    {
        outArr.set(null);
        op.logError("arrays wrong", arr1.length, arr2.length);
    }
    else
    {
        getYPR(a, arr1);
        getYPR(b, arr2);

        mat4.identity(result);
        result[12] = ip(arr1[12], arr2[12], perc);
        result[13] = ip(arr1[13], arr2[13], perc);
        result[14] = ip(arr1[14], arr2[14], perc);

        vec3.lerp(a, a, b, perc);

        mat4.rotateZ(result, result, a[2]);
        mat4.rotateY(result, result, a[1]);
        mat4.rotateX(result, result, a[0]);

        outArr.setRef(result);
    }
    next.trigger();
}

// 0  1  2  3
// 4  5  6  7
// 8  9  10 11
// 12 13 14 15

function getYPR(v, m)
{
    const r1 = Math.atan2(m[6], m[10]);
    const c2 = Math.sqrt(m[0] * m[0] + m[1] * m[1]);
    const r2 = Math.atan2(-m[2], c2);
    const s1 = Math.sin(r1);
    const c1 = Math.cos(r1);
    const r3 = Math.atan2(s1 * m[8] - c1 * m[4], c1 * m[5] - s1 * m[9]);

    v[0] = r1;
    v[1] = r2;
    v[2] = r3;
    return v;
}

}
};






// **************************************************************
// 
// Ops.Sidebar.Sidebar
// 
// **************************************************************

Ops.Sidebar.Sidebar= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"style_css":" /*\n * SIDEBAR\n  http://danielstern.ca/range.css/#/\n  https://developer.mozilla.org/en-US/docs/Web/CSS/::-webkit-progress-value\n */\n\n.sidebar-icon-undo\n{\n    width:10px;\n    height:10px;\n    background-image: url(\"data:image/svg+xml;charset=utf8, %3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='grey' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 7v6h6'/%3E%3Cpath d='M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13'/%3E%3C/svg%3E\");\n    background-size: 19px;\n    background-repeat: no-repeat;\n    top: -19px;\n    margin-top: -7px;\n}\n\n.icon-chevron-down {\n    top: 2px;\n    right: 9px;\n}\n\n.iconsidebar-chevron-up,.sidebar__close-button {\n\tbackground-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM4ODg4ODgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWNoZXZyb24tdXAiPjxwb2x5bGluZSBwb2ludHM9IjE4IDE1IDEyIDkgNiAxNSI+PC9wb2x5bGluZT48L3N2Zz4=);\n}\n\n.iconsidebar-minimizebutton {\n    background-position: 98% center;\n    background-repeat: no-repeat;\n}\n\n.sidebar-cables-right\n{\n    right: 15px;\n    left: initial !important;\n}\n\n.sidebar-cables *\n{\n    color: #BBBBBB !important;\n    font-family: Arial;\n}\n\n.sidebar-cables {\n    --sidebar-color: #07f78c;\n    --sidebar-width: 220px;\n    --sidebar-border-radius: 10px;\n    --sidebar-monospace-font-stack: \"SFMono-Regular\", Consolas, \"Liberation Mono\", Menlo, Courier, monospace;\n    --sidebar-hover-transition-time: .2s;\n\n    position: absolute;\n    top: 15px;\n    left: 15px;\n    border-radius: var(--sidebar-border-radius);\n    z-index: 100000;\n    width: var(--sidebar-width);\n    max-height: 100%;\n    box-sizing: border-box;\n    overflow-y: auto;\n    overflow-x: hidden;\n    font-size: 13px;\n    line-height: 1em; /* prevent emojis from breaking height of the title */\n}\n\n.sidebar-cables::selection {\n    background-color: var(--sidebar-color);\n    color: #EEEEEE;\n}\n\n.sidebar-cables::-webkit-scrollbar {\n    background-color: transparent;\n    --cables-scrollbar-width: 8px;\n    width: var(--cables-scrollbar-width);\n}\n\n.sidebar-cables::-webkit-scrollbar-track {\n    background-color: transparent;\n    width: var(--cables-scrollbar-width);\n}\n\n.sidebar-cables::-webkit-scrollbar-thumb {\n    background-color: #333333;\n    border-radius: 4px;\n    width: var(--cables-scrollbar-width);\n}\n\n.sidebar-cables--closed {\n    width: auto;\n}\n\n.sidebar__close-button {\n    background-color: #222;\n    /*-webkit-user-select: none;  */\n    /*-moz-user-select: none;     */\n    /*-ms-user-select: none;      */\n    /*user-select: none;          */\n    /*transition: background-color var(--sidebar-hover-transition-time);*/\n    /*color: #CCCCCC;*/\n    height: 2px;\n    /*border-bottom:20px solid #222;*/\n\n    /*box-sizing: border-box;*/\n    /*padding-top: 2px;*/\n    /*text-align: center;*/\n    /*cursor: pointer;*/\n    /*border-radius: 0 0 var(--sidebar-border-radius) var(--sidebar-border-radius);*/\n    /*opacity: 1.0;*/\n    /*transition: opacity 0.3s;*/\n    /*overflow: hidden;*/\n}\n\n.sidebar__close-button-icon {\n    display: inline-block;\n    /*opacity: 0;*/\n    width: 20px;\n    height: 20px;\n    /*position: relative;*/\n    /*top: -1px;*/\n\n\n}\n\n.sidebar--closed {\n    width: auto;\n    margin-right: 20px;\n}\n\n.sidebar--closed .sidebar__close-button {\n    margin-top: 8px;\n    margin-left: 8px;\n    padding:10px;\n\n    height: 25px;\n    width:25px;\n    border-radius: 50%;\n    cursor: pointer;\n    opacity: 0.3;\n    background-repeat: no-repeat;\n    background-position: center center;\n    transform:rotate(180deg);\n}\n\n.sidebar--closed .sidebar__group\n{\n    display:none;\n\n}\n.sidebar--closed .sidebar__close-button-icon {\n    background-position: 0px 0px;\n}\n\n.sidebar__close-button:hover {\n    background-color: #111111;\n    opacity: 1.0 !important;\n}\n\n/*\n * SIDEBAR ITEMS\n */\n\n.sidebar__items {\n    /* max-height: 1000px; */\n    /* transition: max-height 0.5;*/\n    background-color: #222;\n    padding-bottom: 20px;\n}\n\n.sidebar--closed .sidebar__items {\n    /* max-height: 0; */\n    height: 0;\n    display: none;\n    pointer-interactions: none;\n}\n\n.sidebar__item__right {\n    float: right;\n}\n\n/*\n * SIDEBAR GROUP\n */\n\n.sidebar__group {\n    /*background-color: #1A1A1A;*/\n    overflow: hidden;\n    box-sizing: border-box;\n    animate: height;\n    /*background-color: #151515;*/\n    /* max-height: 1000px; */\n    /* transition: max-height 0.5s; */\n--sidebar-group-header-height: 33px;\n}\n\n.sidebar__group-items\n{\n    padding-top: 15px;\n    padding-bottom: 15px;\n}\n\n.sidebar__group--closed {\n    /* max-height: 13px; */\n    height: var(--sidebar-group-header-height);\n}\n\n.sidebar__group-header {\n    box-sizing: border-box;\n    color: #EEEEEE;\n    background-color: #151515;\n    -webkit-user-select: none;  /* Chrome all / Safari all */\n    -moz-user-select: none;     /* Firefox all */\n    -ms-user-select: none;      /* IE 10+ */\n    user-select: none;          /* Likely future */\n\n    /*height: 100%;//var(--sidebar-group-header-height);*/\n\n    padding-top: 7px;\n    text-transform: uppercase;\n    letter-spacing: 0.08em;\n    cursor: pointer;\n    /*transition: background-color var(--sidebar-hover-transition-time);*/\n    position: relative;\n}\n\n.sidebar__group-header:hover {\n  background-color: #111111;\n}\n\n.sidebar__group-header-title {\n  /*float: left;*/\n  overflow: hidden;\n  padding: 0 15px;\n  padding-top:5px;\n  padding-bottom:10px;\n  font-weight:bold;\n}\n\n.sidebar__group-header-undo {\n    float: right;\n    overflow: hidden;\n    padding-right: 15px;\n    padding-top:5px;\n    font-weight:bold;\n  }\n\n.sidebar__group-header-icon {\n    width: 17px;\n    height: 14px;\n    background-repeat: no-repeat;\n    display: inline-block;\n    position: absolute;\n    background-size: cover;\n\n    /* icon open */\n    /* feather icon: chevron up */\n    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM4ODg4ODgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWNoZXZyb24tdXAiPjxwb2x5bGluZSBwb2ludHM9IjE4IDE1IDEyIDkgNiAxNSI+PC9wb2x5bGluZT48L3N2Zz4=);\n    top: 4px;\n    right: 5px;\n    opacity: 0.0;\n    transition: opacity 0.3;\n}\n\n.sidebar__group-header:hover .sidebar__group-header-icon {\n    opacity: 1.0;\n}\n\n/* icon closed */\n.sidebar__group--closed .sidebar__group-header-icon {\n    /* feather icon: chevron down */\n    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM4ODg4ODgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWNoZXZyb24tZG93biI+PHBvbHlsaW5lIHBvaW50cz0iNiA5IDEyIDE1IDE4IDkiPjwvcG9seWxpbmU+PC9zdmc+);\n    top: 4px;\n    right: 5px;\n}\n\n/*\n * SIDEBAR ITEM\n */\n\n.sidebar__item\n{\n    box-sizing: border-box;\n    padding: 7px;\n    padding-left:15px;\n    padding-right:15px;\n\n    overflow: hidden;\n    position: relative;\n}\n\n.sidebar__item-label {\n    display: inline-block;\n    -webkit-user-select: none;  /* Chrome all / Safari all */\n    -moz-user-select: none;     /* Firefox all */\n    -ms-user-select: none;      /* IE 10+ */\n    user-select: none;          /* Likely future */\n    width: calc(50% - 7px);\n    margin-right: 7px;\n    margin-top: 2px;\n    text-overflow: ellipsis;\n    /* overflow: hidden; */\n}\n\n.sidebar__item-value-label {\n    font-family: var(--sidebar-monospace-font-stack);\n    display: inline-block;\n    text-overflow: ellipsis;\n    overflow: hidden;\n    white-space: nowrap;\n    max-width: 60%;\n}\n\n.sidebar__item-value-label::selection {\n    background-color: var(--sidebar-color);\n    color: #EEEEEE;\n}\n\n.sidebar__item + .sidebar__item,\n.sidebar__item + .sidebar__group,\n.sidebar__group + .sidebar__item,\n.sidebar__group + .sidebar__group {\n    /*border-top: 1px solid #272727;*/\n}\n\n/*\n * SIDEBAR ITEM TOGGLE\n */\n\n/*.sidebar__toggle */\n.icon_toggle{\n    cursor: pointer;\n}\n\n.sidebar__toggle-input {\n    --sidebar-toggle-input-color: #CCCCCC;\n    --sidebar-toggle-input-color-hover: #EEEEEE;\n    --sidebar-toggle-input-border-size: 2px;\n    display: inline;\n    float: right;\n    box-sizing: border-box;\n    border-radius: 50%;\n    /*outline-style: solid;*/\n    /*outline-color:red;*/\n    cursor: pointer;\n    --toggle-size: 11px;\n    margin-top: 2px;\n    background-color: transparent !important;\n    border: var(--sidebar-toggle-input-border-size) solid var(--sidebar-toggle-input-color);\n    width: var(--toggle-size);\n    height: var(--toggle-size);\n    transition: background-color var(--sidebar-hover-transition-time);\n    transition: border-color var(--sidebar-hover-transition-time);\n}\n.sidebar__toggle:hover .sidebar__toggle-input {\n    border-color: var(--sidebar-toggle-input-color-hover);\n}\n\n.sidebar__toggle .sidebar__item-value-label {\n    -webkit-user-select: none;  /* Chrome all / Safari all */\n    -moz-user-select: none;     /* Firefox all */\n    -ms-user-select: none;      /* IE 10+ */\n    user-select: none;          /* Likely future */\n    max-width: calc(50% - 12px);\n}\n.sidebar__toggle-input::after { clear: both; }\n\n.sidebar__toggle--active .icon_toggle\n{\n\n    background-image: url(data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjE1cHgiIHdpZHRoPSIzMHB4IiBmaWxsPSIjMDZmNzhiIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTAwIDEwMCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGcgZGlzcGxheT0ibm9uZSI+PGcgZGlzcGxheT0iaW5saW5lIj48Zz48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZmlsbD0iIzA2Zjc4YiIgZD0iTTMwLDI3QzE3LjM1LDI3LDcsMzcuMzUsNyw1MGwwLDBjMCwxMi42NSwxMC4zNSwyMywyMywyM2g0MCBjMTIuNjUsMCwyMy0xMC4zNSwyMy0yM2wwLDBjMC0xMi42NS0xMC4zNS0yMy0yMy0yM0gzMHogTTcwLDY3Yy05LjM4OSwwLTE3LTcuNjEtMTctMTdzNy42MTEtMTcsMTctMTdzMTcsNy42MSwxNywxNyAgICAgUzc5LjM4OSw2Nyw3MCw2N3oiPjwvcGF0aD48L2c+PC9nPjwvZz48Zz48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTMwLDI3QzE3LjM1LDI3LDcsMzcuMzUsNyw1MGwwLDBjMCwxMi42NSwxMC4zNSwyMywyMywyM2g0MCAgIGMxMi42NSwwLDIzLTEwLjM1LDIzLTIzbDAsMGMwLTEyLjY1LTEwLjM1LTIzLTIzLTIzSDMweiBNNzAsNjdjLTkuMzg5LDAtMTctNy42MS0xNy0xN3M3LjYxMS0xNywxNy0xN3MxNyw3LjYxLDE3LDE3ICAgUzc5LjM4OSw2Nyw3MCw2N3oiPjwvcGF0aD48L2c+PGcgZGlzcGxheT0ibm9uZSI+PGcgZGlzcGxheT0iaW5saW5lIj48cGF0aCBmaWxsPSIjMDZmNzhiIiBzdHJva2U9IiMwNmY3OGIiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNNyw1MGMwLDEyLjY1LDEwLjM1LDIzLDIzLDIzaDQwICAgIGMxMi42NSwwLDIzLTEwLjM1LDIzLTIzbDAsMGMwLTEyLjY1LTEwLjM1LTIzLTIzLTIzSDMwQzE3LjM1LDI3LDcsMzcuMzUsNyw1MEw3LDUweiI+PC9wYXRoPjwvZz48Y2lyY2xlIGRpc3BsYXk9ImlubGluZSIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9IiMwNmY3OGIiIHN0cm9rZT0iIzA2Zjc4YiIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGN4PSI3MCIgY3k9IjUwIiByPSIxNyI+PC9jaXJjbGU+PC9nPjxnIGRpc3BsYXk9Im5vbmUiPjxwYXRoIGRpc3BsYXk9ImlubGluZSIgZD0iTTcwLDI1SDMwQzE2LjIxNSwyNSw1LDM2LjIxNSw1LDUwczExLjIxNSwyNSwyNSwyNWg0MGMxMy43ODUsMCwyNS0xMS4yMTUsMjUtMjVTODMuNzg1LDI1LDcwLDI1eiBNNzAsNzEgICBIMzBDMTguNDIxLDcxLDksNjEuNTc5LDksNTBzOS40MjEtMjEsMjEtMjFoNDBjMTEuNTc5LDAsMjEsOS40MjEsMjEsMjFTODEuNTc5LDcxLDcwLDcxeiBNNzAsMzFjLTEwLjQ3NywwLTE5LDguNTIzLTE5LDE5ICAgczguNTIzLDE5LDE5LDE5czE5LTguNTIzLDE5LTE5UzgwLjQ3NywzMSw3MCwzMXogTTcwLDY1Yy04LjI3MSwwLTE1LTYuNzI5LTE1LTE1czYuNzI5LTE1LDE1LTE1czE1LDYuNzI5LDE1LDE1Uzc4LjI3MSw2NSw3MCw2NXoiPjwvcGF0aD48L2c+PC9zdmc+);\n    opacity: 1;\n    transform: rotate(0deg);\n    background-position: -4px -9px;\n}\n\n\n.icon_toggle\n{\n    float: right;\n    width:40px;\n    height:18px;\n    background-image: url(data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjE1cHgiIHdpZHRoPSIzMHB4IiBmaWxsPSIjYWFhYWFhIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTAwIDEwMCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGcgZGlzcGxheT0ibm9uZSI+PGcgZGlzcGxheT0iaW5saW5lIj48Zz48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZmlsbD0iI2FhYWFhYSIgZD0iTTMwLDI3QzE3LjM1LDI3LDcsMzcuMzUsNyw1MGwwLDBjMCwxMi42NSwxMC4zNSwyMywyMywyM2g0MCBjMTIuNjUsMCwyMy0xMC4zNSwyMy0yM2wwLDBjMC0xMi42NS0xMC4zNS0yMy0yMy0yM0gzMHogTTcwLDY3Yy05LjM4OSwwLTE3LTcuNjEtMTctMTdzNy42MTEtMTcsMTctMTdzMTcsNy42MSwxNywxNyAgICAgUzc5LjM4OSw2Nyw3MCw2N3oiPjwvcGF0aD48L2c+PC9nPjwvZz48Zz48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTMwLDI3QzE3LjM1LDI3LDcsMzcuMzUsNyw1MGwwLDBjMCwxMi42NSwxMC4zNSwyMywyMywyM2g0MCAgIGMxMi42NSwwLDIzLTEwLjM1LDIzLTIzbDAsMGMwLTEyLjY1LTEwLjM1LTIzLTIzLTIzSDMweiBNNzAsNjdjLTkuMzg5LDAtMTctNy42MS0xNy0xN3M3LjYxMS0xNywxNy0xN3MxNyw3LjYxLDE3LDE3ICAgUzc5LjM4OSw2Nyw3MCw2N3oiPjwvcGF0aD48L2c+PGcgZGlzcGxheT0ibm9uZSI+PGcgZGlzcGxheT0iaW5saW5lIj48cGF0aCBmaWxsPSIjYWFhYWFhIiBzdHJva2U9IiNhYWFhYWEiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNNyw1MGMwLDEyLjY1LDEwLjM1LDIzLDIzLDIzaDQwICAgIGMxMi42NSwwLDIzLTEwLjM1LDIzLTIzbDAsMGMwLTEyLjY1LTEwLjM1LTIzLTIzLTIzSDMwQzE3LjM1LDI3LDcsMzcuMzUsNyw1MEw3LDUweiI+PC9wYXRoPjwvZz48Y2lyY2xlIGRpc3BsYXk9ImlubGluZSIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9IiNhYWFhYWEiIHN0cm9rZT0iI2FhYWFhYSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGN4PSI3MCIgY3k9IjUwIiByPSIxNyI+PC9jaXJjbGU+PC9nPjxnIGRpc3BsYXk9Im5vbmUiPjxwYXRoIGRpc3BsYXk9ImlubGluZSIgZD0iTTcwLDI1SDMwQzE2LjIxNSwyNSw1LDM2LjIxNSw1LDUwczExLjIxNSwyNSwyNSwyNWg0MGMxMy43ODUsMCwyNS0xMS4yMTUsMjUtMjVTODMuNzg1LDI1LDcwLDI1eiBNNzAsNzEgICBIMzBDMTguNDIxLDcxLDksNjEuNTc5LDksNTBzOS40MjEtMjEsMjEtMjFoNDBjMTEuNTc5LDAsMjEsOS40MjEsMjEsMjFTODEuNTc5LDcxLDcwLDcxeiBNNzAsMzFjLTEwLjQ3NywwLTE5LDguNTIzLTE5LDE5ICAgczguNTIzLDE5LDE5LDE5czE5LTguNTIzLDE5LTE5UzgwLjQ3NywzMSw3MCwzMXogTTcwLDY1Yy04LjI3MSwwLTE1LTYuNzI5LTE1LTE1czYuNzI5LTE1LDE1LTE1czE1LDYuNzI5LDE1LDE1Uzc4LjI3MSw2NSw3MCw2NXoiPjwvcGF0aD48L2c+PC9zdmc+);\n    background-size: 50px 37px;\n    background-position: -6px -10px;\n    transform: rotate(180deg);\n    opacity: 0.4;\n}\n\n\n\n/*.sidebar__toggle--active .sidebar__toggle-input {*/\n/*    transition: background-color var(--sidebar-hover-transition-time);*/\n/*    background-color: var(--sidebar-toggle-input-color);*/\n/*}*/\n/*.sidebar__toggle--active .sidebar__toggle-input:hover*/\n/*{*/\n/*    background-color: var(--sidebar-toggle-input-color-hover);*/\n/*    border-color: var(--sidebar-toggle-input-color-hover);*/\n/*    transition: background-color var(--sidebar-hover-transition-time);*/\n/*    transition: border-color var(--sidebar-hover-transition-time);*/\n/*}*/\n\n/*\n * SIDEBAR ITEM BUTTON\n */\n\n.sidebar__button {}\n\n.sidebar__button-input:active\n{\n    background-color: #555 !important;\n}\n\n.sidebar__button-input {\n    -webkit-user-select: none;  /* Chrome all / Safari all */\n    -moz-user-select: none;     /* Firefox all */\n    -ms-user-select: none;      /* IE 10+ */\n    user-select: none;          /* Likely future */\n    min-height: 24px;\n    background-color: transparent;\n    color: #CCCCCC;\n    box-sizing: border-box;\n    padding-top: 3px;\n    text-align: center;\n    border-radius: 125px;\n    border:2px solid #555;\n    cursor: pointer;\n    padding-bottom: 3px;\n    display:block;\n}\n\n.sidebar__button-input.plus, .sidebar__button-input.minus {\n    display: inline-block;\n    min-width: 20px;\n}\n\n.sidebar__button-input:hover {\n  background-color: #333;\n  border:2px solid var(--sidebar-color);\n}\n\n/*\n * VALUE DISPLAY (shows a value)\n */\n\n.sidebar__value-display {}\n\n/*\n * SLIDER\n */\n\n.sidebar__slider {\n    --sidebar-slider-input-height: 3px;\n}\n\n.sidebar__slider-input-wrapper {\n    width: 100%;\n\n    margin-top: 8px;\n    position: relative;\n}\n\n.sidebar__slider-input {\n    -webkit-appearance: none;\n    appearance: none;\n    margin: 0;\n    width: 100%;\n    height: var(--sidebar-slider-input-height);\n    background: #555;\n    cursor: pointer;\n    /*outline: 0;*/\n\n    -webkit-transition: .2s;\n    transition: background-color .2s;\n    border: none;\n}\n\n.sidebar__slider-input:focus, .sidebar__slider-input:hover {\n    border: none;\n}\n\n.sidebar__slider-input-active-track {\n    user-select: none;\n    position: absolute;\n    z-index: 11;\n    top: 0;\n    left: 0;\n    background-color: var(--sidebar-color);\n    pointer-events: none;\n    height: var(--sidebar-slider-input-height);\n    max-width: 100%;\n}\n\n/* Mouse-over effects */\n.sidebar__slider-input:hover {\n    /*background-color: #444444;*/\n}\n\n/*.sidebar__slider-input::-webkit-progress-value {*/\n/*    background-color: green;*/\n/*    color:green;*/\n\n/*    }*/\n\n/* The slider handle (use -webkit- (Chrome, Opera, Safari, Edge) and -moz- (Firefox) to override default look) */\n\n.sidebar__slider-input::-moz-range-thumb\n{\n    position: absolute;\n    height: 15px;\n    width: 15px;\n    z-index: 900 !important;\n    border-radius: 20px !important;\n    cursor: pointer;\n    background: var(--sidebar-color) !important;\n    user-select: none;\n\n}\n\n.sidebar__slider-input::-webkit-slider-thumb\n{\n    position: relative;\n    appearance: none;\n    -webkit-appearance: none;\n    user-select: none;\n    height: 15px;\n    width: 15px;\n    display: block;\n    z-index: 900 !important;\n    border: 0;\n    border-radius: 20px !important;\n    cursor: pointer;\n    background: #777 !important;\n}\n\n.sidebar__slider-input:hover ::-webkit-slider-thumb {\n    background-color: #EEEEEE !important;\n}\n\n/*.sidebar__slider-input::-moz-range-thumb {*/\n\n/*    width: 0 !important;*/\n/*    height: var(--sidebar-slider-input-height);*/\n/*    background: #EEEEEE;*/\n/*    cursor: pointer;*/\n/*    border-radius: 0 !important;*/\n/*    border: none;*/\n/*    outline: 0;*/\n/*    z-index: 100 !important;*/\n/*}*/\n\n.sidebar__slider-input::-moz-range-track {\n    background-color: transparent;\n    z-index: 11;\n}\n\n.sidebar__slider input[type=text],\n.sidebar__slider input[type=paddword]\n{\n    box-sizing: border-box;\n    /*background-color: #333333;*/\n    text-align: right;\n    color: #BBBBBB;\n    display: inline-block;\n    background-color: transparent !important;\n\n    width: 40%;\n    height: 18px;\n    /*outline: none;*/\n    border: none;\n    border-radius: 0;\n    padding: 0 0 0 4px !important;\n    margin: 0;\n}\n\n.sidebar__slider input[type=text]:active,\n.sidebar__slider input[type=text]:focus,\n.sidebar__slider input[type=text]:hover,\n.sidebar__slider input[type=password]:active,\n.sidebar__slider input[type=password]:focus,\n.sidebar__slider input[type=password]:hover\n{\n\n    color: #EEEEEE;\n}\n\n/*\n * TEXT / DESCRIPTION\n */\n\n.sidebar__text .sidebar__item-label {\n    width: auto;\n    display: block;\n    max-height: none;\n    margin-right: 0;\n    line-height: 1.1em;\n}\n\n/*\n * SIDEBAR INPUT\n */\n.sidebar__text-input textarea,\n.sidebar__text-input input[type=date],\n.sidebar__text-input input[type=datetime-local],\n.sidebar__text-input input[type=text],\n.sidebar__text-input input[type=search],\n.sidebar__text-input input[type=password] {\n    box-sizing: border-box;\n    background-color: #333333;\n    color: #BBBBBB;\n    display: inline-block;\n    width: 50%;\n    height: 18px;\n\n\n    border: none;\n    border-radius: 0;\n    border:1px solid #666;\n    padding: 0 0 0 4px !important;\n    margin: 0;\n    color-scheme: dark;\n}\n\n.sidebar__text-input textarea:focus::placeholder {\n  color: transparent;\n}\n\n\n\n\n\n.sidebar__color-picker .sidebar__item-label\n{\n    width:45%;\n}\n\n.sidebar__text-input textarea,\n.sidebar__text-input input[type=text]:active,\n.sidebar__text-input input[type=text]:focus,\n.sidebar__text-input input[type=text]:hover,\n.sidebar__text-input input[type=search]:active,\n.sidebar__text-input input[type=search]:focus,\n.sidebar__text-input input[type=search]:hover,\n.sidebar__text-input input[type=password]:active,\n.sidebar__text-input input[type=password]:focus,\n.sidebar__text-input input[type=password]:hover {\n    background-color: transparent;\n    color: #EEEEEE;\n\n}\n\n.sidebar__text-input textarea\n{\n    margin-top:10px;\n    height:60px;\n    width:100%;\n}\n\n/*\n * SIDEBAR SELECT\n */\n\n\n\n .sidebar__select {}\n .sidebar__select-select {\n    color: #BBBBBB;\n    /*-webkit-appearance: none;*/\n    /*-moz-appearance: none;*/\n    appearance: none;\n    /*box-sizing: border-box;*/\n    width: 50%;\n    /*height: 20px;*/\n    background-color: #333333;\n    /*background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM4ODg4ODgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWNoZXZyb24tZG93biI+PHBvbHlsaW5lIHBvaW50cz0iNiA5IDEyIDE1IDE4IDkiPjwvcG9seWxpbmU+PC9zdmc+);*/\n    background-repeat: no-repeat;\n    background-position: right center;\n    background-size: 16px 16px;\n    margin: 0;\n    /*padding: 0 2 2 6px;*/\n    border-radius: 5px;\n    border: 1px solid #777;\n    background-color: #444;\n    cursor: pointer;\n    /*outline: none;*/\n    padding-left: 5px;\n\n }\n\n.sidebar__select-select:hover,\n.sidebar__select-select:active,\n.sidebar__select-select:inactive {\n    background-color: #444444;\n    color: #EEEEEE;\n}\n\n/*.sidebar__select-select option*/\n/*{*/\n/*    background-color: #444444;*/\n/*    color: #bbb;*/\n/*}*/\n\n.sidebar__select-select option:checked\n{\n    background-color: #000;\n    color: #FFF;\n}\n\n\n/*\n * COLOR PICKER\n */\n\n\n .sidebar__color-picker input[type=text] {\n    box-sizing: border-box;\n    background-color: #333333;\n    color: #BBBBBB;\n    display: inline-block;\n    width: calc(50% - 21px); /* 50% minus space of picker circle */\n    height: 18px;\n    /*outline: none;*/\n    border: none;\n    border-radius: 0;\n    padding: 0 0 0 4px !important;\n    margin: 0;\n    margin-right: 7px;\n}\n\n.sidebar__color-picker input[type=text]:active,\n.sidebar__color-picker input[type=text]:focus,\n.sidebar__color-picker input[type=text]:hover {\n    background-color: #444444;\n    color: #EEEEEE;\n}\n\ndiv.sidebar__color-picker-color-input,\n.sidebar__color-picker input[type=color],\n.sidebar__palette-picker input[type=color] {\n    display: inline-block;\n    border-radius: 100%;\n    height: 14px;\n    width: 14px;\n\n    padding: 0;\n    border: none;\n    /*border:2px solid red;*/\n    border-color: transparent;\n    outline: none;\n    background: none;\n    appearance: none;\n    -moz-appearance: none;\n    -webkit-appearance: none;\n    cursor: pointer;\n    position: relative;\n    top: 3px;\n}\n.sidebar__color-picker input[type=color]:focus,\n.sidebar__palette-picker input[type=color]:focus {\n    outline: none;\n}\n.sidebar__color-picker input[type=color]::-moz-color-swatch,\n.sidebar__palette-picker input[type=color]::-moz-color-swatch {\n    border: none;\n}\n.sidebar__color-picker input[type=color]::-webkit-color-swatch-wrapper,\n.sidebar__palette-picker input[type=color]::-webkit-color-swatch-wrapper {\n    padding: 0;\n}\n.sidebar__color-picker input[type=color]::-webkit-color-swatch,\n.sidebar__palette-picker input[type=color]::-webkit-color-swatch {\n    border: none;\n    border-radius: 100%;\n}\n\n/*\n * Palette Picker\n */\n.sidebar__palette-picker .sidebar__palette-picker-color-input.first {\n    margin-left: 0;\n}\n.sidebar__palette-picker .sidebar__palette-picker-color-input.last {\n    margin-right: 0;\n}\n.sidebar__palette-picker .sidebar__palette-picker-color-input {\n    margin: 0 4px;\n}\n\n.sidebar__palette-picker .circlebutton {\n    width: 14px;\n    height: 14px;\n    border-radius: 1em;\n    display: inline-block;\n    top: 3px;\n    position: relative;\n}\n\n/*\n * Preset\n */\n.sidebar__item-presets-preset\n{\n    padding:4px;\n    cursor:pointer;\n    padding-left:8px;\n    padding-right:8px;\n    margin-right:4px;\n    background-color:#444;\n}\n\n.sidebar__item-presets-preset:hover\n{\n    background-color:#666;\n}\n\n.sidebar__greyout\n{\n    background: #222;\n    opacity: 0.8;\n    width: 100%;\n    height: 100%;\n    position: absolute;\n    z-index: 1000;\n    right: 0;\n    top: 0;\n}\n\n.sidebar_tabs\n{\n    background-color: #151515;\n    padding-bottom: 0px;\n}\n\n.sidebar_switchs\n{\n    float: right;\n}\n\n.sidebar_tab\n{\n    float:left;\n    background-color: #151515;\n    border-bottom:1px solid transparent;\n    padding-right:7px;\n    padding-left:7px;\n    padding-bottom: 5px;\n    padding-top: 5px;\n    cursor:pointer;\n}\n\n.sidebar_tab_active\n{\n    background-color: #272727;\n    color:white;\n}\n\n.sidebar_tab:hover\n{\n    border-bottom:1px solid #777;\n    color:white;\n}\n\n\n.sidebar_switch\n{\n    float:left;\n    background-color: #444;\n    padding-right:7px;\n    padding-left:7px;\n    padding-bottom: 5px;\n    padding-top: 5px;\n    cursor:pointer;\n}\n\n.sidebar_switch:last-child\n{\n    border-top-right-radius: 7px;\n    border-bottom-right-radius: 7px;\n}\n\n.sidebar_switch:first-child\n{\n    border-top-left-radius: 7px;\n    border-bottom-left-radius: 7px;\n}\n\n\n.sidebar_switch_active\n{\n    background-color: #999;\n    color:white;\n}\n\n.sidebar_switch:hover\n{\n    color:white;\n}\n\n.sidebar__text-input-input::focus-visible,\n/*.sidebar__text-input-input:active,*/\n.sidebar__button-input:focus-visible,\n.sidebar__text-input:focus-visible\n/*.sidebar__text-input:active*/\n{\n    outline-style: solid;\n    outline-color:white;\n    outline-width: 1px;\n\n}\n\n",};
// vars
const CSS_ELEMENT_CLASS = "cables-sidebar-style"; /* class for the style element to be generated */
const CSS_ELEMENT_DYNAMIC_CLASS = "cables-sidebar-dynamic-style"; /* things which can be set via op-port, but not attached to the elements themselves, e.g. minimized opacity */
const SIDEBAR_CLASS = "sidebar-cables";
const SIDEBAR_ID = "sidebar" + CABLES.uuid();
const SIDEBAR_ITEMS_CLASS = "sidebar__items";
const SIDEBAR_OPEN_CLOSE_BTN_CLASS = "sidebar__close-button";

const BTN_TEXT_OPEN = ""; // 'Close';
const BTN_TEXT_CLOSED = ""; // 'Show Controls';

let openCloseBtn = null;
let openCloseBtnIcon = null;
let headerTitleText = null;

// inputs
const visiblePort = op.inValueBool("Visible", true);
const opacityPort = op.inValueSlider("Opacity", 1);
const defaultMinimizedPort = op.inValueBool("Default Minimized");
const minimizedOpacityPort = op.inValueSlider("Minimized Opacity", 0.5);
const undoButtonPort = op.inValueBool("Show undo button", false);
const inMinimize = op.inValueBool("Show Minimize", false);

const inTitle = op.inString("Title", "");
const side = op.inValueBool("Side");
const addCss = op.inValueBool("Default CSS", true);

let doc = op.patch.cgl.canvas.ownerDocument;

// outputs
const childrenPort = op.outObject("childs");
childrenPort.setUiAttribs({ "title": "Children" });

const isOpenOut = op.outBoolNum("Opfened");
isOpenOut.setUiAttribs({ "title": "Opened" });

let sidebarEl = doc.querySelector("." + SIDEBAR_ID);
if (!sidebarEl) sidebarEl = initSidebarElement();

const sidebarItemsEl = sidebarEl.querySelector("." + SIDEBAR_ITEMS_CLASS);
childrenPort.setRef({
    "parentElement": sidebarItemsEl,
    "parentOp": op,
});
onDefaultMinimizedPortChanged();
initSidebarCss();
updateDynamicStyles();

addCss.onChange = () =>
{
    initSidebarCss();
    updateDynamicStyles();
};
visiblePort.onChange = onVisiblePortChange;
opacityPort.onChange = onOpacityPortChange;
defaultMinimizedPort.onChange = onDefaultMinimizedPortChanged;
minimizedOpacityPort.onChange = onMinimizedOpacityPortChanged;
undoButtonPort.onChange = onUndoButtonChange;
op.onDelete = onDelete;

function onMinimizedOpacityPortChanged()
{
    updateDynamicStyles();
}

inMinimize.onChange = updateMinimize;

function updateMinimize(header)
{
    if (!header || header.uiAttribs) header = doc.querySelector(".sidebar-cables .sidebar__group-header");
    if (!header) return;

    const undoButton = doc.querySelector(".sidebar-cables .sidebar__group-header .sidebar__group-header-undo");

    if (inMinimize.get())
    {
        header.classList.add("iconsidebar-chevron-up");
        header.classList.add("iconsidebar-minimizebutton");

        if (undoButton)undoButton.style.marginRight = "20px";
    }
    else
    {
        header.classList.remove("iconsidebar-chevron-up");
        header.classList.remove("iconsidebar-minimizebutton");

        if (undoButton)undoButton.style.marginRight = "initial";
    }
}

side.onChange = function ()
{
    if (!sidebarEl) return;
    if (side.get()) sidebarEl.classList.add("sidebar-cables-right");
    else sidebarEl.classList.remove("sidebar-cables-right");
};

function onUndoButtonChange()
{
    const header = doc.querySelector(".sidebar-cables .sidebar__group-header");
    if (header)
    {
        initUndoButton(header);
    }
}

function initUndoButton(header)
{
    if (header)
    {
        const undoButton = doc.querySelector(".sidebar-cables .sidebar__group-header .sidebar__group-header-undo");
        if (undoButton)
        {
            if (!undoButtonPort.get())
            {
                // header.removeChild(undoButton);
                undoButton.remove();
            }
        }
        else
        {
            if (undoButtonPort.get())
            {
                const headerUndo = doc.createElement("span");
                headerUndo.classList.add("sidebar__group-header-undo");
                headerUndo.classList.add("sidebar-icon-undo");

                headerUndo.addEventListener("click", function (event)
                {
                    event.stopPropagation();
                    const reloadables = doc.querySelectorAll(".sidebar-cables .sidebar__reloadable");
                    const doubleClickEvent = doc.createEvent("MouseEvents");
                    doubleClickEvent.initEvent("dblclick", true, true);
                    reloadables.forEach((reloadable) =>
                    {
                        reloadable.dispatchEvent(doubleClickEvent);
                    });
                });
                header.appendChild(headerUndo);
            }
        }
    }
    updateMinimize(header);
}

function onDefaultMinimizedPortChanged()
{
    if (!openCloseBtn) { return; }
    if (defaultMinimizedPort.get())
    {
        sidebarEl.classList.add("sidebar--closed");
        if (visiblePort.get()) isOpenOut.set(false);
    }
    else
    {
        sidebarEl.classList.remove("sidebar--closed");
        if (visiblePort.get()) isOpenOut.set(true);
    }
}

function onOpacityPortChange()
{
    const opacity = opacityPort.get();
    sidebarEl.style.opacity = opacity;
}

function onVisiblePortChange()
{
    if (!sidebarEl) return;
    if (visiblePort.get())
    {
        sidebarEl.style.display = "block";
        if (!sidebarEl.classList.contains("sidebar--closed")) isOpenOut.set(true);
    }
    else
    {
        sidebarEl.style.display = "none";
        isOpenOut.set(false);
    }
}

side.onChanged = function ()
{

};

/**
 * Some styles cannot be set directly inline, so a dynamic stylesheet is needed.
 * Here hover states can be set later on e.g.
 */
function updateDynamicStyles()
{
    const dynamicStyles = doc.querySelectorAll("." + CSS_ELEMENT_DYNAMIC_CLASS);
    if (dynamicStyles)
    {
        dynamicStyles.forEach(function (e)
        {
            e.parentNode.removeChild(e);
        });
    }

    if (!addCss.get()) return;

    const newDynamicStyle = doc.createElement("style");
    newDynamicStyle.classList.add("cablesEle");
    newDynamicStyle.classList.add(CSS_ELEMENT_DYNAMIC_CLASS);
    let cssText = ".sidebar--closed .sidebar__close-button { ";
    cssText += "opacity: " + minimizedOpacityPort.get();
    cssText += "}";
    const cssTextEl = doc.createTextNode(cssText);
    newDynamicStyle.appendChild(cssTextEl);
    doc.body.appendChild(newDynamicStyle);
}

function initSidebarElement()
{
    const element = doc.createElement("div");
    element.classList.add(SIDEBAR_CLASS);
    element.classList.add(SIDEBAR_ID);
    const canvasWrapper = op.patch.cgl.canvas.parentElement; /* maybe this is bad outside cables!? */

    // header...
    const headerGroup = doc.createElement("div");
    headerGroup.classList.add("sidebar__group");

    element.appendChild(headerGroup);
    const header = doc.createElement("div");
    header.classList.add("sidebar__group-header");

    element.appendChild(header);
    const headerTitle = doc.createElement("span");
    headerTitle.classList.add("sidebar__group-header-title");
    headerTitleText = doc.createElement("span");
    headerTitleText.classList.add("sidebar__group-header-title-text");
    headerTitleText.innerHTML = inTitle.get();
    headerTitle.appendChild(headerTitleText);
    header.appendChild(headerTitle);

    initUndoButton(header);
    updateMinimize(header);

    headerGroup.appendChild(header);
    element.appendChild(headerGroup);
    headerGroup.addEventListener("click", onOpenCloseBtnClick);

    if (!canvasWrapper)
    {
        op.warn("[sidebar] no canvas parentelement found...");
        return;
    }
    canvasWrapper.appendChild(element);
    const items = doc.createElement("div");
    items.classList.add(SIDEBAR_ITEMS_CLASS);
    element.appendChild(items);
    openCloseBtn = doc.createElement("div");
    openCloseBtn.classList.add(SIDEBAR_OPEN_CLOSE_BTN_CLASS);
    openCloseBtn.addEventListener("click", onOpenCloseBtnClick);
    element.appendChild(openCloseBtn);

    return element;
}

inTitle.onChange = function ()
{
    if (headerTitleText)headerTitleText.innerHTML = inTitle.get();
};

function setClosed(b)
{

}

function onOpenCloseBtnClick(ev)
{
    ev.stopPropagation();
    if (!sidebarEl) { op.logError("Sidebar could not be closed..."); return; }
    sidebarEl.classList.toggle("sidebar--closed");
    const btn = ev.target;
    let btnText = BTN_TEXT_OPEN;
    if (sidebarEl.classList.contains("sidebar--closed"))
    {
        btnText = BTN_TEXT_CLOSED;
        isOpenOut.set(false);
    }
    else
    {
        isOpenOut.set(true);
    }
}

function initSidebarCss()
{
    const cssElements = doc.querySelectorAll("." + CSS_ELEMENT_CLASS);
    // remove old script tag
    if (cssElements)
    {
        cssElements.forEach((e) =>
        {
            e.parentNode.removeChild(e);
        });
    }

    if (!addCss.get()) return;

    const newStyle = doc.createElement("style");

    newStyle.innerHTML = attachments.style_css;
    newStyle.classList.add(CSS_ELEMENT_CLASS);
    newStyle.classList.add("cablesEle");
    doc.body.appendChild(newStyle);
}

function onDelete()
{
    removeElementFromDOM(sidebarEl);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild) el.parentNode.removeChild(el);
}

}
};






// **************************************************************
// 
// Ops.Gl.ClearColor
// 
// **************************************************************

Ops.Gl.ClearColor= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    r = op.inFloatSlider("r", 0.1),
    g = op.inFloatSlider("g", 0.1),
    b = op.inFloatSlider("b", 0.1),
    a = op.inFloatSlider("a", 1);

r.setUiAttribs({ "colorPick": true });

const cgl = op.patch.cgl;

render.onTriggered = function ()
{
    cgl.gl.clearColor(r.get(), g.get(), b.get(), a.get());
    cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);
    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Gl.RenderToTextures_v3
// 
// **************************************************************

Ops.Gl.RenderToTextures_v3= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    render = op.inTrigger("Render"),
    trigger = op.outTrigger("Next"),
    inSize = op.inSwitch("Size", ["Canvas", "Manual"], "Canvas"),
    width = op.inValueInt("texture width"),
    height = op.inValueInt("texture height"),
    aspect = op.inBool("Auto Aspect", true),
    inPixelFormat = op.inDropDown("Pixel Format", CGL.Texture.PIXELFORMATS, CGL.Texture.PFORMATSTR_RGBA32F),
    inFilter = op.inSwitch("Filter", ["nearest", "linear", "mipmap"], "linear"),
    inWrap = op.inValueSelect("Wrap", ["clamp to edge", "repeat", "mirrored repeat"], "repeat"),
    msaa = op.inSwitch("MSAA", ["none", "2x", "4x", "8x"], "none"),
    clear = op.inValueBool("Clear", true),
    inDepth = op.inObject("Depth Buffer", null, "framebuffer"),
    slots = op.inSwitch("Slots", ["1", "2", "3", "4", "5", "6", "7", "8"], "1");

let slotPorts = [];
let outTexPorts = [];
const NUM_BUFFERS = 8;
const cgl = op.patch.cgl;
const rt = new CGL.RenderTargets(cgl);
const mod = rt.mod;
const defaultShader = new CGL.Shader(cgl, "MinimalMaterial");

op.toWorkPortsNeedToBeLinked(render);

for (let i = 0; i < NUM_BUFFERS; i++)
{
    let slot = "Default";
    if (i != 0)slot = "Default";
    const p = op.inDropDown("Texture " + i, rt.getTypes(), slot);
    p.onChange = updateDefines;
    slotPorts.push(p);

    const outTexPort = op.outTexture("Result Texture " + i);
    outTexPorts.push(outTexPort);
}

const texDepth = op.outTexture("textureDepth");

/// ////////////////////////////////////////

let reInitFb = true;
let floatingPoint = false;
let fb = null;
let numSlots = 1;

render.onTriggered = doRender;
inSize.onChange = updateUi;

inWrap.onChange =
    inFilter.onChange =
    inPixelFormat.onChange =
    slots.onChange =
    clear.onChange =
    msaa.onChange = reInitLater;

updateUi();

function updateDefines()
{
    let types = [];
    for (let i = 0; i < numSlots; i++)
    {
        types.push(slotPorts[i].get());
        slotPorts[i].setUiAttribs({ "title": "Tex " + i + ": " + (slotPorts[i].get()) });
    }

    rt.update(types);

    op.setUiAttrib({ "extendTitle": rt.asString });

    reInitFb = true;
}

function updateUi()
{
    width.setUiAttribs({ "greyout": inSize.get() == "Canvas" });
    height.setUiAttribs({ "greyout": inSize.get() == "Canvas" });
    aspect.setUiAttribs({ "greyout": inSize.get() == "Canvas" });
}

function reInitLater()
{
    reInitFb = true;
}

function getFilter()
{
    if (inFilter.get() == "nearest") return CGL.Texture.FILTER_NEAREST;
    else if (inFilter.get() == "linear") return CGL.Texture.FILTER_LINEAR;
    else if (inFilter.get() == "mipmap") return CGL.Texture.FILTER_MIPMAP;
}

function getWrap()
{
    if (inWrap.get() == "repeat") return CGL.Texture.WRAP_REPEAT;
    else if (inWrap.get() == "mirrored repeat") return CGL.Texture.WRAP_MIRRORED_REPEAT;
    else if (inWrap.get() == "clamp to edge") return CGL.Texture.WRAP_CLAMP_TO_EDGE;
}

function isFloatingPoint()
{
    return CGL.Texture.isPixelFormatFloat(inPixelFormat.get());
}

function doRender()
{
    if (!fb || reInitFb)
    {
        numSlots = parseInt(slots.get());
        updateDefines();

        for (let i = 0; i < NUM_BUFFERS; i++) slotPorts[i].setUiAttribs({ "greyout": i > numSlots - 1 });

        if (fb) fb.delete();

        floatingPoint = isFloatingPoint();

        let msSamples = 4;

        if (msaa.get() == "none") msSamples = 0;
        if (msaa.get() == "2x")msSamples = 2;
        if (msaa.get() == "4x")msSamples = 4;
        if (msaa.get() == "8x")msSamples = 8;

        fb = new CGL.Framebuffer2(cgl, 8, 8, {
            "numRenderBuffers": numSlots,
            "isFloatingPointTexture": floatingPoint,
            "multisampling": msSamples > 0,
            "depth": true,
            "multisamplingSamples": msSamples,
            "wrap": getWrap(),
            "filter": getFilter(),
            "clear": clear.get()
        });

        for (let i = 0; i < NUM_BUFFERS; i++)
        {
            if (i <= numSlots) outTexPorts[i].setRef(fb.getTextureColorNum(i));
            else outTexPorts[i].setRef(CGL.Texture.getEmptyTexture(cgl));
        }

        texDepth.setRef(fb.getTextureDepth());
        reInitFb = false;
    }

    let setAspect = aspect.get();

    if (inSize.get() == "Canvas")
    {
        setAspect = true;
        width.set(cgl.canvasWidth);
        height.set(cgl.canvasHeight);
    }

    // fb.clear(2, [1, 1, 1, 1]);

    if (fb.getWidth() != Math.ceil(width.get()) || fb.getHeight() != Math.ceil(height.get())) fb.setSize(width.get(), height.get());

    fb.renderStart(cgl);

    if (inDepth.get())
    {
        cgl.gl.bindFramebuffer(cgl.gl.READ_FRAMEBUFFER, inDepth.get()._frameBuffer);
        // cgl.gl.bindFramebuffer(cgl.gl.DRAW_FRAMEBUFFER, fb._framebuffer); // or null

        cgl.gl.blitFramebuffer(
            0, 0, width.get(), height.get(), // src rect
            0, 0, width.get(), height.get(), // dst rect
            cgl.gl.DEPTH_BUFFER_BIT, // what to copy
            cgl.gl.NEAREST // must be NEAREST for depth
        );
    }

    // fb.clearColors[2] = [0, 0, 1, 1];
    // fb.clear();

    cgl.tempData.forceShaderMods = cgl.tempData.forceShaderMods || [];
    cgl.tempData.forceShaderMods.push(mod);

    cgl.tempData.objectIdCounter = 0;

    cgl.pushShader(defaultShader);
    cgl.pushViewPort(0, 0, width.get(), height.get());

    trigger.trigger();

    cgl.popViewPort();

    cgl.popShader();

    cgl.tempData.forceShaderMods.pop();
    // mod.unbind();

    fb.renderEnd(cgl);

    for (let i = 0; i < NUM_BUFFERS; i++)
        if (i <= numSlots)
            outTexPorts[i].setRef(fb.getTextureColorNum(i));

    texDepth.setRef(fb.getTextureDepth());

    cgl.resetViewPort();
}

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.PixelColor
// 
// **************************************************************

Ops.Gl.ImageCompose.PixelColor= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"pixelate_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\nUNI sampler2D srcTex;\nUNI float amount;\n\nUNI vec2 pixelPos;\n\n{{CGL.BLENDMODES3}}\n\nvoid main()\n{\n\n    vec4 base=texture(tex,texCoord);\n    vec4 col=texture(srcTex,pixelPos);\n\n    outColor=cgl_blendPixel(base,col,amount);\n    outColor=col;\n}",};
const render = op.inTrigger("render"),
    srcTex = op.inTexture("Source Texture"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    posX = op.inFloatSlider("Pos X", 0),
    posY = op.inFloatSlider("Pos Y", 0),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.pixelate_frag);

const textureMultiplierUniform = new CGL.Uniform(shader, "t", "srcTex", 1);
const unipos = new CGL.Uniform(shader, "2f", "pixelPos", posX, posY);
const textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

// srcTex.onChange = function ()
// {
//     shader.toggleDefine("PI XELATE_TEXTURE", srcTex.isLinked());
// };

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    if (srcTex.get()) cgl.setTexture(1, srcTex.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Gl.TextureColorPick
// 
// **************************************************************

Ops.Gl.TextureColorPick= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    cgl = op.patch.cgl,
    pUpdate = op.inTrigger("update"),
    inCoordFormat = op.inSwitch("Coordinates", ["Pixel", "0-1"], "Pixel"),
    inX = op.inInt("X", 0),
    inY = op.inInt("Y", 0),
    tex = op.inTexture("texture"),
    inAct = op.inBool("Active", true),
    outTrigger = op.outTrigger("trigger"),
    outR = op.outNumber("Red"),
    outG = op.outNumber("Green"),
    outB = op.outNumber("Blue"),
    outA = op.outNumber("Alpha");

let
    pbo = null,
    fb = null,
    pixelData = null,
    wasTriggered = true,
    texChanged = false;

let finishedFence = true;
tex.onChange = function () { texChanged = true; };

let isFloatingPoint = false;
let channelType = op.patch.cgl.gl.UNSIGNED_BYTE;
let pixelReader = new CGL.PixelReader();

op.toWorkPortsNeedToBeLinked(tex, pUpdate);

pUpdate.onTriggered = function ()
{
    if (!inAct.get()) return;
    const realTexture = tex.get();
    const gl = cgl.gl;

    if (!realTexture) return;
    if (!fb) fb = gl.createFramebuffer();

    isFloatingPoint = realTexture.isFloatingPoint();

    if (isFloatingPoint) channelType = gl.FLOAT;
    else channelType = gl.UNSIGNED_BYTE;

    const size = 4 * 4;
    if (!pixelData)
        if (isFloatingPoint) pixelData = new Float32Array(size);
        else pixelData = new Uint8Array(size);

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, realTexture.tex, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    let x = inX.get();
    let y = inY.get();

    if (inCoordFormat.get() == "0-1")
    {
        x = Math.min(realTexture.width, realTexture.width * x);
        y = Math.min(realTexture.height, realTexture.height * y);
        inX.setUiAttribs({ "increment": null });
        inY.setUiAttribs({ "increment": null });
    }

    pixelReader.read(cgl, fb, realTexture.pixelFormat, x, y, 1, 1, (pixel) =>
    {
        wasTriggered = false;
        texChanged = false;

        if (isFloatingPoint)
        {
            outR.set(pixel[0]);
            outG.set(pixel[1]);
            outB.set(pixel[2]);
            outA.set(pixel[3]);
        }
        else
        {
            outR.set(pixel[0] / 255);
            outG.set(pixel[1] / 255);
            outB.set(pixel[2] / 255);
            outA.set(pixel[3] / 255);
        }
    });

    outTrigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Trigger.TriggerNumber
// 
// **************************************************************

Ops.Trigger.TriggerNumber= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    setValuePort = op.inTriggerButton("Set"),
    valuePort = op.inValueFloat("Number"),
    outNext = op.outTrigger("Next"),
    outValuePort = op.outNumber("Out Value");

outValuePort.changeAlways = true;

setValuePort.onTriggered = function ()
{
    outValuePort.set(valuePort.get());
    outNext.trigger();
};

}
};






// **************************************************************
// 
// Ops.Math.Modulo
// 
// **************************************************************

Ops.Math.Modulo= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    number1 = op.inValueFloat("number1", 1),
    number2 = op.inValueFloat("number2", 2),
    pingpong = op.inValueBool("pingpong"),
    result = op.outNumber("result");

let calculateFunction = calculateModule;

number1.onChange =
number2.onChange = exec;

pingpong.onChange = updatePingPong;

exec();

function exec()
{
    let n2 = number2.get();
    let n1 = number1.get();

    result.set(calculateFunction(n1, n2));
}

function calculateModule(n1, n2)
{
    let re = ((n1 % n2) + n2) % n2;
    if (re != re) re = 0;
    return re;
}

function calculatePingPong(i, n)
{
    let cycle = 2 * n;
    i %= cycle;
    if (i >= n) return cycle - i;
    else return i;
}

function updatePingPong()
{
    if (pingpong.get()) calculateFunction = calculatePingPong;
    else calculateFunction = calculateModule;
}

}
};






// **************************************************************
// 
// Ops.Math.MapRange
// 
// **************************************************************

Ops.Math.MapRange= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    v = op.inValueFloat("value", 0),
    old_min = op.inValueFloat("old min", 0),
    old_max = op.inValueFloat("old max", 1),
    new_min = op.inValueFloat("new min", 0),
    new_max = op.inValueFloat("new max", 1),
    easing = op.inValueSelect("Easing", ["Linear", "Smoothstep", "Smootherstep"], "Linear"),
    inClamp = op.inBool("Clamp", true),
    result = op.outNumber("result", 0);

op.setPortGroup("Input Range", [old_min, old_max]);
op.setPortGroup("Output Range", [new_min, new_max]);

let doClamp = true;
let ease = 0;
let r = 0;

v.onChange =
    old_min.onChange =
    old_max.onChange =
    new_min.onChange =
    new_max.onChange = exec;

exec();

inClamp.onChange =
() =>
{
    doClamp = inClamp.get();
    exec();
};

easing.onChange = function ()
{
    if (easing.get() == "Smoothstep") ease = 1;
    else if (easing.get() == "Smootherstep") ease = 2;
    else ease = 0;
};

function exec()
{
    const nMin = new_min.get();
    const nMax = new_max.get();
    const oMin = old_min.get();
    const oMax = old_max.get();
    let x = v.get();

    if (doClamp)
    {
        if (x >= Math.max(oMax, oMin))
        {
            result.set(nMax);
            return;
        }
        else
        if (x <= Math.min(oMax, oMin))
        {
            result.set(nMin);
            return;
        }
    }

    let reverseInput = false;
    const oldMin = Math.min(oMin, oMax);
    const oldMax = Math.max(oMin, oMax);
    if (oldMin != oMin) reverseInput = true;

    let reverseOutput = false;
    const newMin = Math.min(nMin, nMax);
    const newMax = Math.max(nMin, nMax);
    if (newMin != nMin) reverseOutput = true;

    let portion = 0;

    if (reverseInput) portion = (oldMax - x) * (newMax - newMin) / (oldMax - oldMin);
    else portion = (x - oldMin) * (newMax - newMin) / (oldMax - oldMin);

    if (reverseOutput) r = newMax - portion;
    else r = portion + newMin;

    if (ease === 0)
    {
        result.set(r);
    }
    else
    if (ease == 1)
    {
        x = Math.max(0, Math.min(1, (r - nMin) / (nMax - nMin)));
        result.set(nMin + x * x * (3 - 2 * x) * (nMax - nMin)); // smoothstep
    }
    else
    if (ease == 2)
    {
        x = Math.max(0, Math.min(1, (r - nMin) / (nMax - nMin)));
        result.set(nMin + x * x * x * (x * (x * 6 - 15) + 10) * (nMax - nMin)); // smootherstep
    }
}

}
};






// **************************************************************
// 
// Ops.Math.Divide
// 
// **************************************************************

Ops.Math.Divide= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    number1 = op.inValueFloat("number1", 1),
    number2 = op.inValueFloat("number2", 2),
    result = op.outNumber("result");

op.setUiAttribs({ "mathTitle": true });

number1.onChange = number2.onChange = exec;
exec();

function exec()
{
    result.set(number1.get() / number2.get());
}

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.Color_v2
// 
// **************************************************************

Ops.Gl.ImageCompose.Color_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"color_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\nUNI float r;\nUNI float g;\nUNI float b;\nUNI float a;\nUNI float amount;\n\n#ifdef MASK\n    UNI sampler2D mask;\n#endif\n\n{{CGL.BLENDMODES3}}\n\nvoid main()\n{\n    vec4 col=vec4(r,g,b,a);\n    vec4 base=texture(tex,texCoord);\n\n    float am=amount;\n    #ifdef MASK\n        float msk=texture(mask,texCoord).r;\n        #ifdef INVERTMASK\n            msk=1.0-msk;\n        #endif\n        am*=1.0-msk;\n    #endif\n\n    outColor=cgl_blendPixel(base,col,am);\n}\n",};
const
    render = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op),
    amount = op.inValueSlider("Amount", 1),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),

    inMask = op.inTexture("Mask"),
    inMaskInvert = op.inValueBool("Mask Invert"),
    r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),
    a = op.inValueSlider("A", 1),
    trigger = op.outTrigger("trigger");

r.setUiAttribs({ "colorPick": true });
op.setPortGroup("Color", [r, g, b]);

const TEX_SLOT = 0;
const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "textureeffect color");
const srcFrag = attachments.color_frag || "";
shader.setSource(shader.getDefaultVertexShader(), srcFrag);
CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", TEX_SLOT),
    makstextureUniform = new CGL.Uniform(shader, "t", "mask", 1),
    uniformR = new CGL.Uniform(shader, "f", "r", r),
    uniformG = new CGL.Uniform(shader, "f", "g", g),
    uniformB = new CGL.Uniform(shader, "f", "b", b),
    uniformA = new CGL.Uniform(shader, "f", "a", a),
    uniformAmount = new CGL.Uniform(shader, "f", "amount", amount);

inMask.onChange = function ()
{
    if (inMask.isLinked())shader.define("MASK");
    else shader.removeDefine("MASK");
};

inMaskInvert.onChange = function ()
{
    if (inMaskInvert.get())shader.define("INVERTMASK");
    else shader.removeDefine("INVERTMASK");
};

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(TEX_SLOT, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    if (inMask.get()) cgl.setTexture(1, inMask.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Gl.Textures.ColorTexture
// 
// **************************************************************

Ops.Gl.Textures.ColorTexture= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),
    a = op.inValueSlider("a", 1.0),
    texOut = op.outTexture("texture_out");

r.setUiAttribs({ "colorPick": true });
const cgl = op.patch.cgl;
let fb = null;
let wasFp = false;

r.onChange =
    g.onChange =
    b.onChange =
    a.onChange = () => { cgl.addNextFrameOnceCallback(render); };

cgl.addNextFrameOnceCallback(render);

function render()
{
    const fp = wasFp || r.get() < 0.0 || r.get() > 1.0 || g.get() < 0.0 || g.get() > 1.0 || b.get() < 0.0 || b.get() > 1.0;

    if (!fb || wasFp != fp)
    {
        if (fb)fb.dispose();
        if (cgl.glVersion == 1) fb = new CGL.Framebuffer(cgl, 8, 8, { "name": "colorTexture" });
        else fb = new CGL.Framebuffer2(cgl, 8, 8, { "name": "colorTexture", "depth": false, "isFloatingPointTexture": fp });
        fb.setFilter(CGL.Texture.FILTER_LINEAR);
        wasFp = fp;
    }

    fb.renderStart();
    cgl.gl.clearColor(r.get(), g.get(), b.get(), a.get());
    cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT);
    fb.renderEnd();
    texOut.setRef(fb.getTextureColor());
}

op.onDelete = () =>
{
    if (fb)fb.dispose();
};

}
};






// **************************************************************
// 
// Ops.Sidebar.Button_v2
// 
// **************************************************************

Ops.Sidebar.Button_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
// inputs
const parentPort = op.inObject("link");
const buttonTextPort = op.inString("Text", "Button");

// outputs
const siblingsPort = op.outObject("childs");
const buttonPressedPort = op.outTrigger("Pressed Trigger");

const inGreyOut = op.inBool("Grey Out", false);
const inVisible = op.inBool("Visible", true);

// vars
const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar--button");
const input = document.createElement("button");
input.classList.add("sidebar__button-input");
el.appendChild(input);
input.addEventListener("click", onButtonClick);
input.style.width = "100%";
const inputText = document.createTextNode(buttonTextPort.get());
input.appendChild(inputText);
op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

// events
parentPort.onChange = onParentChanged;
buttonTextPort.onChange = onButtonTextChanged;
op.onDelete = onDelete;

const greyOut = document.createElement("div");
greyOut.classList.add("sidebar__greyout");
el.appendChild(greyOut);
greyOut.style.display = "none";

inGreyOut.onChange = function ()
{
    greyOut.style.display = inGreyOut.get() ? "block" : "none";
};

inVisible.onChange = function ()
{
    el.style.display = inVisible.get() ? "block" : "none";
};

function onButtonClick()
{
    buttonPressedPort.trigger();
}

function onButtonTextChanged()
{
    const buttonText = buttonTextPort.get();
    input.textContent = buttonText;

    input.setAttribute("aria-label", "button " + buttonTextPort.get());

    if (CABLES.UI) op.setUiAttrib({ "extendTitle": buttonText });
}

function onParentChanged()
{
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    }
    else
    { // detach
        if (el.parentElement)
        {
            el.parentElement.removeChild(el);
        }
    }
}

function showElement(el)
{
    if (el)
    {
        el.style.display = "block";
    }
}

function hideElement(el)
{
    if (el)
    {
        el.style.display = "none";
    }
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild)
    {
        el.parentNode.removeChild(el);
    }
}

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.Math.Normalize
// 
// **************************************************************

Ops.Gl.ImageCompose.Math.Normalize= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"rgbmul_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\nUNI float fade;\nUNI float mul;\n\n\nvoid main()\n{\n    vec4 col=texture(tex,texCoord);\n    #ifdef SAFE\n    float l = length(col.xyz);\n    col.xyz = mix(col.xyz,(col.xyz/(l==0.0?0.0000001:l))*mul,fade);\n    #else\n    col.xyz=(normalize(col.xyz)*mul)*fade+col.xyz*(1.0-fade);\n    #endif\n    outColor=col;\n}\n",};
const
    render = op.inTrigger("Render"),
    inFade = op.inFloatSlider("Fade", 1),
    inMul = op.inFloat("Size", 1),
    inSafe = op.inBool("Safe", false),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.rgbmul_frag);
const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    uniformMorph = new CGL.Uniform(shader, "f", "fade", inFade),
    uniformMul = new CGL.Uniform(shader, "f", "mul", inMul);
inSafe.onChange = function ()
{
    shader.toggleDefine("SAFE", inSafe.get());
};

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Json.RouteObject
// 
// **************************************************************

Ops.Json.RouteObject= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    NUM_PORTS = 10,
    DEFAULT_OBJECT = {},
    indexPort = op.inInt("index"),
    objectPort = op.inObject("Object in"),
    defaultObjectPort = op.inObject("default object", DEFAULT_OBJECT),
    objectPorts = createOutPorts(DEFAULT_OBJECT);

indexPort.onChange = objectPort.onChange = defaultObjectPort.onChange = update;

setDefaultValues();
update();

function createOutPorts()
{
    let arrayObjects = [];
    for (let i = 0; i < NUM_PORTS; i++)
    {
        let port = op.outObject("Index " + i + " Object");
        arrayObjects.push(port);
    }
    defaultObjectPort.set(null);
    return arrayObjects;
}

function setDefaultValues()
{
    let defaultValue = defaultObjectPort.get();

    objectPorts.forEach((port) => { return port.set(null); });
    if (defaultObjectPort.get())
    {
        objectPorts.forEach((port) => { return port.set(defaultValue); });
    }
}

function update()
{
    setDefaultValues();
    let index = indexPort.get();
    let value = objectPort.get();

    index = Math.floor(index);
    index = clamp(index, 0, NUM_PORTS - 1);
    objectPorts[index].setRef(value);
}

function clamp(value, min, max)
{
    return Math.min(Math.max(value, min), max);
}

}
};






// **************************************************************
// 
// Ops.Sidebar.Toggle_v3
// 
// **************************************************************

Ops.Sidebar.Toggle_v3= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const DEFAULT_VALUE_DEFAULT = true;

// inputs
const parentPort = op.inObject("link");
const labelPort = op.inString("Text", "Toggle");
const inputValuePort = op.inValueBool("Input", DEFAULT_VALUE_DEFAULT);
const setDefaultValueButtonPort = op.inTriggerButton("Set Default");
const defaultValuePort = op.inValueBool("Default", DEFAULT_VALUE_DEFAULT);
defaultValuePort.setUiAttribs({ "hidePort": true, "greyout": true });
const inGreyOut = op.inBool("Grey Out", false);
const inVisible = op.inBool("Visible", true);

// outputs
const siblingsPort = op.outObject("childs");
const valuePort = op.outBoolNum("Value", defaultValuePort.get());
const outToggled = op.outTrigger("Toggled");

// vars
const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar__toggle");
el.classList.add("sidebar__reloadable");

if (DEFAULT_VALUE_DEFAULT) el.classList.add("sidebar__toggle--active");

el.addEventListener("dblclick", function ()
{
    valuePort.set(defaultValuePort.get());
    inputValuePort.set(defaultValuePort.get());
    outToggled.trigger();
});

const label = document.createElement("div");
label.classList.add("sidebar__item-label");
const labelText = document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);

const icon = document.createElement("div");
icon.classList.add("icon_toggle");
icon.addEventListener("click", onInputClick);
el.appendChild(icon);

const greyOut = document.createElement("div");
greyOut.classList.add("sidebar__greyout");
el.appendChild(greyOut);
greyOut.style.display = "none";

// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
inputValuePort.onChange = onInputValuePortChanged;
op.onDelete = onDelete;
setDefaultValueButtonPort.onTriggered = setDefaultValue;

function setDefaultValue()
{
    const defaultValue = inputValuePort.get();

    defaultValuePort.set(defaultValue);
    valuePort.set(defaultValue);
    outToggled.trigger();
    op.refreshParams();
}

function onInputClick()
{
    el.classList.toggle("sidebar__toggle--active");
    if (el.classList.contains("sidebar__toggle--active"))
    {
        valuePort.set(true);
        inputValuePort.set(true);
        icon.classList.add("icon_toggle_true");
        icon.classList.remove("icon_toggle_false");
        outToggled.trigger();
    }
    else
    {
        icon.classList.remove("icon_toggle_true");
        icon.classList.add("icon_toggle_false");

        valuePort.set(false);
        inputValuePort.set(false);
        outToggled.trigger();
    }
    op.refreshParams();
}

function onInputValuePortChanged()
{
    const inputValue = inputValuePort.get();
    if (inputValue)
    {
        el.classList.add("sidebar__toggle--active");
        valuePort.set(true);
    }
    else
    {
        el.classList.remove("sidebar__toggle--active");
        valuePort.set(false);
    }
    outToggled.trigger();
}

function onLabelTextChanged()
{
    const text = labelPort.get();
    label.textContent = text;
    if (CABLES.UI) op.setUiAttrib({ "extendTitle": text });
}

function onParentChanged()
{
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    }
    else if (el.parentElement) el.parentElement.removeChild(el);
}

function showElement(element)
{
    if (element) element.style.display = "block";
}

function hideElement(element)
{
    if (element) element.style.display = "none";
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(element)
{
    if (element && element.parentNode && element.parentNode.removeChild) element.parentNode.removeChild(el);
}

inGreyOut.onChange = function ()
{
    greyOut.style.display = inGreyOut.get() ? "block" : "none";
};

inVisible.onChange = function ()
{
    el.style.display = inVisible.get() ? "block" : "none";
};

}
};






// **************************************************************
// 
// Ops.Boolean.Not
// 
// **************************************************************

Ops.Boolean.Not= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    bool = op.inBool("Boolean"),
    outbool = op.outBoolNum("Result");

bool.changeAlways = true;

bool.onChange = function ()
{
    outbool.set((!bool.get()));
};

}
};






// **************************************************************
// 
// Ops.Gl.Meshes.Pyramid_v2
// 
// **************************************************************

Ops.Gl.Meshes.Pyramid_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    render = op.inTrigger("Render"),
    sizeW = op.inValue("Width", 1),
    sizeL = op.inValue("Length", 1),
    sizeH = op.inValue("Height", 2),
    inSmooth = op.inValueBool("Smooth", false),
    inDraw = op.inValueBool("Draw", true),
    trigger = op.outTrigger("trigger"),
    geomOut = op.outObject("geometry", null, "geometry");

const cgl = op.patch.cgl;
let geom = null;
let mesh = null;
op.onDelete = function () { if (mesh) mesh.dispose(); };
sizeW.onChange =
    sizeH.onChange =
    sizeL.onChange =
    inSmooth.onChange = () => { mesh = null; };

render.onTriggered = function ()
{
    if (!mesh) create();
    if (inDraw.get()) mesh.render();
    trigger.trigger();
};

function create()
{
    if (!geom) geom = new CGL.Geometry(op.name);
    let w = sizeW.get();
    let h = sizeH.get();
    let l = sizeL.get();

    geom.vertices = [
        // -w,-l,0,
        // w,-l,0,
        // w,l,0,
        // -w,l,0,
        // 0,0,h,
        -w, 0, -l,
        w, 0, -l,
        w, 0, l,
        -w, 0, l,
        0, h, 0
    ];

    geom.vertexNormals = [
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0
    ];

    geom.texCoords = [
        0.5, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 1.0,
        0.0, 1.0
    ];

    geom.verticesIndices = [
        0, 1, 2,
        0, 2, 3, // bottom

        4, 1, 0,
        4, 3, 2,
        0, 3, 4,
        4, 2, 1
    ];

    if (!inSmooth.get()) geom.unIndex();
    geom.calculateNormals({ "forceZUp": false });

    if (mesh) mesh.dispose();
    mesh = op.patch.cg.createMesh(geom, { "opId": op.id });

    geomOut.setRef(geom);
}

}
};






// **************************************************************
// 
// Ops.Graphics.Geometry.AlignGeometry
// 
// **************************************************************

Ops.Graphics.Geometry.AlignGeometry= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    geometry = op.inObject("Geometry"),
    x = op.inSwitch("X", ["Ignore", "Center", "Max", "Min"], "Ignore"),
    y = op.inSwitch("Y", ["Ignore", "Center", "Max", "Min"], "Ignore"),
    z = op.inSwitch("Z", ["Ignore", "Center", "Max", "Min"], "Ignore"),
    outGeom = op.outObject("Result");

op.toWorkPortsNeedToBeLinked(geometry);

x.onChange = y.onChange = z.onChange = geometry.onChange = update;

const
    axis = [0, 0, 0],
    ALIGN_NONE = 0,
    ALIGN_CENTER = 1,
    ALIGN_MAX = 2,
    ALIGN_MIN = 3;

let geom = null;

function getAxisId(port)
{
    if (port.get() == "Ignore") return ALIGN_NONE;
    if (port.get() == "Center") return ALIGN_CENTER;
    if (port.get() == "Max") return ALIGN_MAX;
    if (port.get() == "Min") return ALIGN_MIN;
}

function update()
{
    const oldGeom = geometry.get();

    if (!oldGeom)
    {
        outGeom.set(null);
        return;
    }

    axis[0] = getAxisId(x);
    axis[1] = getAxisId(y);
    axis[2] = getAxisId(z);

    const bounds = oldGeom.getBounds();
    geom = oldGeom.copy();

    for (let axi = 0; axi < 3; axi++)
    {
        let min = 0, max = 0;
        if (axi === 0)
        {
            min = bounds.minX;
            max = bounds.maxX;
        }
        else if (axi == 1)
        {
            min = bounds.minY;
            max = bounds.maxY;
        }
        else if (axi == 2)
        {
            min = bounds.minZ;
            max = bounds.maxZ;
        }

        if (axis[axi] == ALIGN_NONE)
        {
            for (let i = 0; i < geom.vertices.length; i += 3)
                geom.vertices[i + axi] = oldGeom.vertices[i + axi];
        }
        else if (axis[axi] == ALIGN_CENTER)
        {
            const off = min + (max - min) / 2;
            for (let i = 0; i < geom.vertices.length; i += 3)
                geom.vertices[i + axi] = oldGeom.vertices[i + axi] - off;
        }
        else if (axis[axi] == ALIGN_MAX)
        {
            for (let i = 0; i < geom.vertices.length; i += 3)
                geom.vertices[i + axi] = oldGeom.vertices[i + axi] - max;
        }
        else if (axis[axi] == ALIGN_MIN)
        {
            for (let i = 0; i < geom.vertices.length; i += 3)
                geom.vertices[i + axi] = oldGeom.vertices[i + axi] - min;
        }
    }

    outGeom.setRef(geom);
}

}
};






// **************************************************************
// 
// Ops.Sidebar.Slider_v3
// 
// **************************************************************

Ops.Sidebar.Slider_v3= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
// constants
const STEP_DEFAULT = 0.00001;

// inputs
const parentPort = op.inObject("link");
const labelPort = op.inString("Text", "Slider");
const minPort = op.inValue("Min", 0);
const maxPort = op.inValue("Max", 1);
const stepPort = op.inValue("Step", STEP_DEFAULT);
const labelSuffix = op.inString("Suffix", "");

const inGreyOut = op.inBool("Grey Out", false);
const inVisible = op.inBool("Visible", true);

const inputValuePort = op.inValue("Input", 0.5);
const setDefaultValueButtonPort = op.inTriggerButton("Set Default");
const reset = op.inTriggerButton("Reset");

let parent = null;

const defaultValuePort = op.inValue("Default", 0.5);
defaultValuePort.setUiAttribs({ "hidePort": true, "greyout": true });

// outputs
const siblingsPort = op.outObject("childs");
const valuePort = op.outNumber("Result", defaultValuePort.get());

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");
op.setPortGroup("Range", [minPort, maxPort, stepPort]);
op.setPortGroup("Display", [inGreyOut, inVisible]);

// vars
const el = document.createElement("div");
el.addEventListener("dblclick", function ()
{
    valuePort.set(parseFloat(defaultValuePort.get()));
    inputValuePort.set(parseFloat(defaultValuePort.get()));
    setValueFieldValue(defaultValuePort.get());
});

el.dataset.op = op.id;
el.classList.add("cablesEle");

el.classList.add("sidebar__item");
el.classList.add("sidebar__slider");
el.classList.add("sidebar__reloadable");

op.patch.on("sidebarStylesChanged", () => { updateActiveTrack(); });

const label = document.createElement("div");
label.classList.add("sidebar__item-label");

const greyOut = document.createElement("div");
greyOut.classList.add("sidebar__greyout");
el.appendChild(greyOut);
greyOut.style.display = "none";

const labelText = document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);

const value = document.createElement("input");
value.value = defaultValuePort.get();
value.classList.add("sidebar__text-input-input");
value.setAttribute("type", "text");

value.oninput = onTextInputChanged;
el.appendChild(value);

const suffixEle = document.createElement("span");
// setValueFieldValue(defaultValuePort).get();
// value.setAttribute("type", "text");
// value.oninput = onTextInputChanged;

el.appendChild(suffixEle);

labelSuffix.onChange = () =>
{
    suffixEle.innerHTML = labelSuffix.get();
};

const inputWrapper = document.createElement("div");
inputWrapper.classList.add("sidebar__slider-input-wrapper");
el.appendChild(inputWrapper);

const activeTrack = document.createElement("div");
activeTrack.classList.add("sidebar__slider-input-active-track");
inputWrapper.appendChild(activeTrack);
const input = document.createElement("input");
input.classList.add("sidebar__slider-input");
input.setAttribute("min", minPort.get());
input.setAttribute("max", maxPort.get());
input.setAttribute("type", "range");
input.setAttribute("step", stepPort.get());
input.setAttribute("value", defaultValuePort.get());
input.style.display = "block"; /* needed because offsetWidth returns 0 otherwise */
inputWrapper.appendChild(input);

updateActiveTrack();
input.addEventListener("input", onSliderInput);

// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
inputValuePort.onChange = onInputValuePortChanged;
defaultValuePort.onChange = onDefaultValueChanged;
setDefaultValueButtonPort.onTriggered = onSetDefaultValueButtonPress;
minPort.onChange = onMinPortChange;
maxPort.onChange = onMaxPortChange;
stepPort.onChange = stepPortChanged;
op.onDelete = onDelete;

// op.onLoadedValueSet=function()
op.onLoaded = op.onInit = function ()
{
    if (op.patch.config.sidebar)
    {
        op.patch.config.sidebar[labelPort.get()];
        valuePort.set(op.patch.config.sidebar[labelPort.get()]);
    }
    else
    {
        valuePort.set(parseFloat(defaultValuePort.get()));
        inputValuePort.set(parseFloat(defaultValuePort.get()));
        // onInputValuePortChanged();
    }
};

reset.onTriggered = function ()
{
    const newValue = parseFloat(defaultValuePort.get());
    valuePort.set(newValue);
    setValueFieldValue(newValue);
    setInputFieldValue(newValue);
    inputValuePort.set(newValue);
    updateActiveTrack();
};

inGreyOut.onChange = function ()
{
    greyOut.style.display = inGreyOut.get() ? "block" : "none";
};

inVisible.onChange = function ()
{
    el.style.display = inVisible.get() ? "block" : "none";
};

function onTextInputChanged(ev)
{
    let newValue = parseFloat(ev.target.value);
    if (isNaN(newValue)) newValue = 0;
    const min = minPort.get();
    const max = maxPort.get();
    if (newValue < min) { newValue = min; }
    else if (newValue > max) { newValue = max; }
    // setInputFieldValue(newValue);
    valuePort.set(newValue);
    updateActiveTrack();
    inputValuePort.set(newValue);
    op.refreshParams();
}

function onInputValuePortChanged()
{
    let newValue = parseFloat(inputValuePort.get());
    const minValue = minPort.get();
    const maxValue = maxPort.get();
    if (newValue > maxValue) { newValue = maxValue; }
    else if (newValue < minValue) { newValue = minValue; }
    setValueFieldValue(newValue);
    setInputFieldValue(newValue);
    valuePort.set(newValue);
    updateActiveTrack();
}

function onSetDefaultValueButtonPress()
{
    let newValue = parseFloat(inputValuePort.get());
    const minValue = minPort.get();
    const maxValue = maxPort.get();
    if (newValue > maxValue) { newValue = maxValue; }
    else if (newValue < minValue) { newValue = minValue; }
    setValueFieldValue(newValue);
    setInputFieldValue(newValue);
    valuePort.set(newValue);
    defaultValuePort.set(newValue);
    op.refreshParams();

    updateActiveTrack();
}

function onSliderInput(ev)
{
    ev.preventDefault();
    ev.stopPropagation();
    setValueFieldValue(ev.target.value);
    const inputFloat = parseFloat(ev.target.value);
    valuePort.set(inputFloat);
    inputValuePort.set(inputFloat);
    op.refreshParams();

    updateActiveTrack();
    return false;
}

function stepPortChanged()
{
    const step = stepPort.get();
    input.setAttribute("step", step);
    updateActiveTrack();
}

function updateActiveTrack(val)
{
    let valueToUse = parseFloat(input.value);
    if (typeof val !== "undefined") valueToUse = val;
    let availableWidth = activeTrack.parentElement.getBoundingClientRect().width || 220;
    if (parent) availableWidth = parseInt(getComputedStyle(parent.parentElement).getPropertyValue("--sidebar-width")) - 20;

    const trackWidth = CABLES.map(
        valueToUse,
        parseFloat(input.min),
        parseFloat(input.max),
        0,
        availableWidth - 16 /* subtract slider thumb width */
    );
    activeTrack.style.width = trackWidth + "px";
}

function onMinPortChange()
{
    const min = minPort.get();
    input.setAttribute("min", min);
    updateActiveTrack();
}

function onMaxPortChange()
{
    const max = maxPort.get();
    input.setAttribute("max", max);
    updateActiveTrack();
}

function onDefaultValueChanged()
{
    const defaultValue = defaultValuePort.get();
    valuePort.set(parseFloat(defaultValue));
    onMinPortChange();
    onMaxPortChange();
    setInputFieldValue(defaultValue);
    setValueFieldValue(defaultValue);

    updateActiveTrack(defaultValue); // needs to be passed as argument, is this async?
}

function onLabelTextChanged()
{
    const labelText = labelPort.get();
    label.textContent = labelText;
    if (CABLES.UI) op.setUiAttrib({ "extendTitle": labelText });
    value.setAttribute("aria-label", "slider " + labelPort.get());
    input.setAttribute("aria-label", "slider " + labelPort.get());
}

function onParentChanged()
{
    siblingsPort.set(null);
    parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    }
    else if (el.parentElement) el.parentElement.removeChild(el);

    updateActiveTrack();
}

function setValueFieldValue(v)
{
    value.value = v;
}

function setInputFieldValue(v)
{
    input.value = v;
}

function showElement(el)
{
    if (el)el.style.display = "block";
}

function hideElement(el)
{
    if (el)el.style.display = "none";
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild) el.parentNode.removeChild(el);
}

}
};






// **************************************************************
// 
// Ops.Math.OneMinus
// 
// **************************************************************

Ops.Math.OneMinus= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inValue = op.inValue("Value"),
    result = op.outNumber("Result");

inValue.onChange = update;
update();

function update()
{
    result.set(1 - inValue.get());
}

}
};






// **************************************************************
// 
// Ops.User.amajesticseaflapflap.ParticleForce_v4
// 
// **************************************************************

Ops.User.amajesticseaflapflap.ParticleForce_v4= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"force_vert":"IN vec2 texCoord;\nUNI float time;\nUNI float radius;\nUNI float falloff;\nUNI float influence;\nUNI float force;\nUNI float scale;\nUNI float timer;\nUNI vec3 pos;\nUNI vec3 tangent;\nUNI vec3 normal;\nUNI vec3 offset;\n\nUNI vec3 p;\nUNI vec3 q;\nUNI sampler2D tex;\n#ifdef USE_MASK\nUNI sampler2D mask;\n#endif\n\n\nvoid main()\n{\n    vec4 base = texture(tex,texCoord);\n    vec3 position = base.xyz - pos;\n    float d = smoothstep(radius * falloff, radius, length(position)) * force * 0.01;\n    vec3 dir = vec3(0.0, 0.0, 0.0);\n    float limit = 1000.0;\n\n    #ifdef FORCE_ATTRACTOR\n    dir = position;\n    #else\n    #ifdef FORCE_VORTEX\n    vec3 n = cross(-position, tangent);\n    if(length(n) != 0.0)\n        dir = normalize(n);\n    #else\n    #ifdef FORCE_TURBULENCE\n    d *= 0.01;\n    vec3 n = cross(-position, vec3(sin(scale * (position.x + offset.x) + timer), sin(scale * (position.y + offset.y) + mod(time, 1.0) * 3.14 + timer), sin(scale * (position.z + offset.z) + 3.14 + timer)));\n    if(length(n) != 0.0)\n        dir = normalize(n);\n    #else\n    #ifdef FORCE_SLICE\n    dir = -normal * normalize(dot(position, normal));\n    d = 0.01;\n    #else\n    #ifdef FORCE_STRANGE\n    //dir.x = position.z * sin(p.x * position.x) - cos(p.y * position.y);\n    //dir.y = position.x * sin(p.z * position.y) + cos(q.x * position.z);\n    //dir.z = position.y * sin(q.y * position.z) - cos(q.z * position.x);\n\n    dir.x = position.x * position.z * sin(p.x*position.x) - cos(p.y*position.y);\n    dir.y = position.y * position.x * sin(p.z*position.y) - cos(q.x*position.z);\n    dir.z = position.z * position.y * sin(q.y*position.z) - cos(q.z*position.x);\n    #endif\n    #endif\n    #endif\n    #endif\n    #endif\n\n    vec3 diff = dot(position, position) > 0.001 && dot(position, position) < limit ? (dir * d * influence) * base.a : vec3(0.0);\n    #ifdef USE_MASK\n    vec4 mask = texture(mask,texCoord);\n    #ifdef MASK_R\n    diff *= mask.r;\n    #elif defined(MASK_G)\n    diff *= mask.g;\n    #elif defined(MASK_B)\n    diff *= mask.b;\n    #elif defined(MASK_A)\n    diff *= mask.a;\n    #endif\n    #endif\n    base.xyz -= diff;\n\n    outColor = base;\n}\n",};
const
    render = op.inTrigger("Render"),
    force = op.inValue("force", 1.0),
    influence = op.inValueSlider("influence", 1.0),
    inForceType = op.inSwitch("Type", ["Attractor", "Vortex", "Turbulence", "Slice", "Strange"], "Attractor"),
    radius = op.inFloat("radius", 0.5),
    falloff = op.inFloat("falloff", 0.5),
    inTexMask = op.inTexture("Mask (red channel)"),
    inMaskType = op.inSwitch("Mask Channel", ["R", "G", "B", "A"], "R"),
    posX = op.inFloat("Pos X", 0),
    posY = op.inFloat("Pos Y", 0),
    posZ = op.inFloat("Pos Z", 0),
    rotX = op.inValue("tangent X", 0),
    rotY = op.inValue("tangent Y", 0),
    rotZ = op.inValue("tangent Z", 0),
    offsetX = op.inFloat("Offset X", 0),
    offsetY = op.inFloat("Offset Y", 0),
    offsetZ = op.inFloat("Offset Z", 0),
    normX = op.inValue("normal X", 0),
    normY = op.inValue("normal Y", 1.0),
    normZ = op.inValue("normal Z", 0),
    v1 = op.inValue("v 1", 0),
    v2 = op.inValue("v 2", 0),
    v3 = op.inValue("v 3", 0),
    v4 = op.inValue("v 4", 0),
    v5 = op.inValue("v 5", 0),
    v6 = op.inValue("v 6", 0),
    scale = op.inValue("scale", 1.0),
    timer = op.inValue("timer", 1.0),
    trigger = op.outTrigger("trigger");

op.setPortGroup("Force", [force, influence, inForceType, radius, falloff, inTexMask, inMaskType]);
op.setPortGroup("Transform", [posX, posY, posZ, rotX, rotY, rotZ, scale, timer, offsetX, offsetY, offsetZ, normX, normY, normZ]);
op.setPortGroup("Strange", [v1, v2, v3, v4, v5, v6]);

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name);

shader.setSource(shader.getDefaultVertexShader(), attachments.force_vert);
const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    textureMaskUniform = new CGL.Uniform(shader, "t", "mask", 1),
    uniPos = new CGL.Uniform(shader, "3f", "pos", posX, posY, posZ),
    uniRadius = new CGL.Uniform(shader, "f", "radius", radius),
    uniFalloff = new CGL.Uniform(shader, "f", "falloff", falloff),
    uniForce = new CGL.Uniform(shader, "f", "force", force),
    uniInfluence = new CGL.Uniform(shader, "f", "influence", influence),
    uniScale = new CGL.Uniform(shader, "f", "scale", scale),
    uniTimer = new CGL.Uniform(shader, "f", "timer", timer),
    uniRotation = new CGL.Uniform(shader, "3f", "tangent", rotX, rotY, rotZ),
    uniNormal = new CGL.Uniform(shader, "3f", "normal", normX, normY, normZ),
    uniOffset = new CGL.Uniform(shader, "3f", "offset", offsetX, offsetY, offsetZ),
    uniP = new CGL.Uniform(shader, "3f", "p", v1, v2, v3),
    uniQ = new CGL.Uniform(shader, "3f", "q", v4, v5, v6);

inMaskType.onChange  =
inForceType.onChange =
inTexMask.onChange   = updateDefines;

function updateUi()
{
    rotX.setUiAttribs({ "greyout": !(inForceType.get() == "Vortex") });
    rotY.setUiAttribs({ "greyout": !(inForceType.get() == "Vortex") });
    rotZ.setUiAttribs({ "greyout": !(inForceType.get() == "Vortex") });
    scale.setUiAttribs({ "greyout": !(inForceType.get() == "Turbulence") });
    timer.setUiAttribs({ "greyout": !(inForceType.get() == "Turbulence") });

    offsetX.setUiAttribs({ "greyout": !(inForceType.get() == "Turbulence") });
    offsetY.setUiAttribs({ "greyout": !(inForceType.get() == "Turbulence") });
    offsetZ.setUiAttribs({ "greyout": !(inForceType.get() == "Turbulence") });

    normX.setUiAttribs({ "greyout": !(inForceType.get() == "Slice") });
    normY.setUiAttribs({ "greyout": !(inForceType.get() == "Slice") });
    normZ.setUiAttribs({ "greyout": !(inForceType.get() == "Slice") });

    v1.setUiAttribs({ "greyout": !(inForceType.get() == "Strange") });
    v2.setUiAttribs({ "greyout": !(inForceType.get() == "Strange") });
    v3.setUiAttribs({ "greyout": !(inForceType.get() == "Strange") });
    v4.setUiAttribs({ "greyout": !(inForceType.get() == "Strange") });
    v5.setUiAttribs({ "greyout": !(inForceType.get() == "Strange") });
    v6.setUiAttribs({ "greyout": !(inForceType.get() == "Strange") });
}

function updateDefines()
{
    shader.toggleDefine("FORCE_ATTRACTOR", inForceType.get() == "Attractor");
    shader.toggleDefine("FORCE_VORTEX", inForceType.get() == "Vortex");
    shader.toggleDefine("FORCE_TURBULENCE", inForceType.get() == "Turbulence");
    shader.toggleDefine("FORCE_SLICE", inForceType.get() == "Slice");
    shader.toggleDefine("FORCE_STRANGE", inForceType.get() == "Strange");
    shader.toggleDefine("USE_MASK", inTexMask.get());

    shader.toggleDefine("MASK_R", inMaskType.get() === "R");
    shader.toggleDefine("MASK_G", inMaskType.get() === "G");
    shader.toggleDefine("MASK_B", inMaskType.get() === "B");
    shader.toggleDefine("MASK_A", inMaskType.get() === "A");

    updateUi();
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    if (inTexMask.get()) cgl.setTexture(1, inTexMask.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

updateDefines();
}
};






// **************************************************************
// 
// Ops.Math.Speed
// 
// **************************************************************

Ops.Math.Speed= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inExe = op.inTrigger("Update"),
    inVal = op.inValue("Value"),
    result = op.outNumber("Speed");

inVal.alwaysChange = true;

let lastVal = 0;
let lastTime = CABLES.now();
inExe.onTriggered = update;

function update()
{
    let diff = Math.abs(inVal.get() - lastVal);
    let diffTime = CABLES.now() - lastTime;

    let speed = diff * (1000 / diffTime);

    result.set(speed);

    lastVal = inVal.get();
    lastTime = CABLES.now();
}

}
};






// **************************************************************
// 
// Ops.Math.Sum
// 
// **************************************************************

Ops.Math.Sum= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    number1 = op.inValueFloat("number1", 0),
    number2 = op.inValueFloat("number2", 0),
    result = op.outNumber("result");

op.setUiAttribs({ "mathTitle": true });

number1.onChange =
    number2.onChange = exec;
exec();

function exec()
{
    const v = number1.get() + number2.get();
    if (!isNaN(v))
        result.set(v || 0);

}

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.Flip
// 
// **************************************************************

Ops.Gl.ImageCompose.Flip= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"flip_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\nUNI float x;\nUNI float y;\n\nvoid main()\n{\n   vec4 col=vec4(1.0,0.0,0.0,1.0);\n   col=texture(tex,vec2(abs(x-texCoord.x),abs(y-texCoord.y)));\n   outColor= col;\n}",};
const render = op.inTrigger("render");
const x = op.inValueBool("X");
const y = op.inValueBool("Y");
const trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.flip_frag);

const uniTexture = new CGL.Uniform(shader, "t", "tex", 0);
const uniX = new CGL.Uniform(shader, "f", "x", x);
const uniY = new CGL.Uniform(shader, "f", "y", y);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Gl.Textures.CopyTexture_v3
// 
// **************************************************************

Ops.Gl.Textures.CopyTexture_v3= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"copytexture_frag":"UNI float a;\nUNI sampler2D tex;\n\n#ifdef TEX_MASK\nUNI sampler2D texMask;\n#endif\n\nIN vec2 texCoord;\n\nvoid main()\n{\n    vec2 tc=texCoord;\n\n    #ifdef FLIPX\n        tc.x=1.0-tc.x;\n    #endif\n    #ifdef FLIPY\n        tc.y=1.0-tc.y;\n    #endif\n\n    vec4 col=texture(tex,tc);\n\n    #ifdef TEX_MASK\n        col.a=texture(texMask,tc).r;\n    #endif\n\n    #ifdef GREY_R\n        col.rgb=vec3(col.r);\n    #endif\n\n    #ifdef GREY_G\n        col.rgb=vec3(col.g);\n    #endif\n\n    #ifdef GREY_B\n        col.rgb=vec3(col.b);\n    #endif\n\n    #ifdef GREY_A\n        col.rgb=vec3(col.a);\n    #endif\n\n    #ifdef GREY_LUMI\n        col.rgb=vec3( dot(vec3(0.2126,0.7152,0.0722), col.rgb) );\n    #endif\n\n\n    #ifdef INVERT_A\n        col.a=1.0-col.a;\n    #endif\n\n    #ifdef INVERT_R\n        col.r=1.0-col.r;\n    #endif\n\n    #ifdef INVERT_G\n        col.g=1.0-col.g;\n    #endif\n\n    #ifdef INVERT_B\n        col.b=1.0-col.b;\n    #endif\n\n    #ifdef ALPHA_1\n        col.a=1.0;\n    #endif\n\n\n\n\n    outColor= col;\n}",};
const
    render = op.inTriggerButton("render"),
    inTexture = op.inTexture("Texture"),
    inTextureMask = op.inTexture("Alpha Mask"),
    useVPSize = op.inValueBool("use original size", true),
    width = op.inValueInt("width", 640),
    height = op.inValueInt("height", 360),
    tfilter = op.inSwitch("filter", ["nearest", "linear", "mipmap"], "linear"),
    inPixelFormat = op.inDropDown("Pixel Format", CGL.Texture.PIXELFORMATS, CGL.Texture.PFORMATSTR_RGBA8UB),
    aniso = op.inSwitch("Anisotropic", ["0", "1", "2", "4", "8", "16"], "0"),

    twrap = op.inValueSelect("wrap", ["clamp to edge", "repeat", "mirrored repeat"], "clamp to edge"),
    alphaMaskMethod = op.inSwitch("Alpha Mask Source", ["A", "1"], "A"),
    greyscale = op.inSwitch("Convert Greyscale", ["Off", "R", "G", "B", "A", "Luminance"], "Off"),
    invertR = op.inBool("Invert R", false),
    invertG = op.inBool("Invert G", false),
    invertB = op.inBool("Invert B", false),
    invertA = op.inBool("Invert A", false),

    flipX = op.inBool("Flip X", false),
    flipY = op.inBool("Flip Y", false),

    trigger = op.outTrigger("trigger"),
    texOut = op.outTexture("texture_out", null),
    outRatio = op.outNumber("Aspect Ratio");

alphaMaskMethod.setUiAttribs({ "hidePort": true });
greyscale.setUiAttribs({ "hidePort": true });
invertR.setUiAttribs({ "hidePort": true });
invertG.setUiAttribs({ "hidePort": true });
invertB.setUiAttribs({ "hidePort": true });

let autoRefreshTimeout = null;
const cgl = op.patch.cgl;
let lastTex = null;
let effect = null;
let tex = null;
let needsResUpdate = true;
let oldTex = null;

let w = 2, h = 2;
const prevViewPort = [0, 0, 0, 0];
let reInitEffect = true;

op.toWorkPortsNeedToBeLinked(render, inTexture);
op.setPortGroup("Size", [useVPSize, width, height]);

const bgShader = new CGL.Shader(cgl, "copytexture");
bgShader.setSource(bgShader.getDefaultVertexShader(), attachments.copytexture_frag);
const textureUniform = new CGL.Uniform(bgShader, "t", "tex", 0);
let textureMaskUniform = new CGL.Uniform(bgShader, "t", "texMask", 1);

let selectedFilter = CGL.Texture.FILTER_LINEAR;
let selectedWrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

flipX.onChange =
flipY.onChange =
alphaMaskMethod.onChange =
    aniso.onChange =
    greyscale.onChange =
    invertR.onChange =
    invertG.onChange =
    invertB.onChange =
    twrap.onChange =
    tfilter.onChange =
    inPixelFormat.onChange =
    render.onLinkChanged =
    inTextureMask.onChange =
    inTexture.onLinkChanged = () => { updateSoon(); };

inTexture.onChange = () =>
{
    if (oldTex != inTexture.get()) { updateSoon(); }
    oldTex = inTexture.get();
};

render.onTriggered = doRender;
updateUi();

function initEffect()
{
    if (effect)effect.delete();
    if (tex)
    {
        tex.delete();
        tex = null;
    }
    effect = new CGL.TextureEffect(cgl, { "pixelFormat": inPixelFormat.get(), "clear": false });

    if (!tex ||
        tex.width != Math.floor(width.get()) ||
        tex.height != Math.floor(height.get()) ||
        tex.wrap != selectedWrap ||
        tex.pixelFormat != inPixelFormat.get()
    )
    {
        const cgl_aniso = Math.min(cgl.maxAnisotropic, parseFloat(aniso.get()));

        if (tex) tex.delete();
        tex = new CGL.Texture(cgl,
            {
                "name": "copytexture_" + op.id,
                "pixelFormat": inPixelFormat.get(),
                "anisotropic": cgl_aniso,
                "filter": selectedFilter,
                "wrap": selectedWrap,
                "width": Math.floor(width.get()),
                "height": Math.floor(height.get()),
            });
    }

    effect.setSourceTexture(tex);
    updateUi();
    // texOut.set(CGL.Texture.getEmptyTexture(cgl));
    reInitEffect = false;
}

function updateSoon()
{
    updateParams();
    reInitEffect = true;

    if (!render.isLinked() || !inTexture.isLinked()) texOut.setRef(CGL.Texture.getEmptyTexture(cgl));
}

function updateResolution()
{
    if (!inTexture.get() || inTexture.get() == CGL.Texture.getEmptyTexture(cgl)) return;
    if (!effect)initEffect();

    if (useVPSize.get())
    {
        w = inTexture.get().width;
        h = inTexture.get().height;
    }
    else
    {
        w = Math.floor(width.get());
        h = Math.floor(height.get());
    }

    if ((w != tex.width || h != tex.height) && (w !== 0 && h !== 0))
    {
        height.set(h);
        width.set(w);
        tex.filter = selectedFilter;
        tex.setSize(w, h);
        outRatio.set(w / h);
        effect.setSourceTexture(tex);
    }

    // if (texOut.get() && selectedFilter != CGL.Texture.FILTER_NEAREST)
    // {
    //     if (!texOut.get().isPowerOfTwo()) op.setUiError("hintnpot", "texture dimensions not power of two! - texture filtering when scaling will not work on ios devices.", 0);
    //     else op.setUiError("hintnpot", null, 0);
    // }
    // else op.setUiError("hintnpot", null, 0);

    needsResUpdate = false;
}

function updateUi()
{
    if (!CABLES.UI) return;
    aniso.setUiAttribs({ "greyout": tfilter.get() != "mipmap" });
    width.setUiAttribs({ "greyout": useVPSize.get() });
    height.setUiAttribs({ "greyout": useVPSize.get() });
}

function updateResolutionLater()
{
    needsResUpdate = true;
    updateSoon();
}

useVPSize.onChange = function ()
{
    updateUi();
    if (useVPSize.get())
    {
        width.onChange = null;
        height.onChange = null;
    }
    else
    {
        width.onChange = updateResolutionLater;
        height.onChange = updateResolutionLater;
    }
    updateResolution();
};

function doRender()
{
    // op.patch.removeOnAnimCallback(doRender);
    // if (!inTexture.get())

    if (!inTexture.get() || inTexture.get() == CGL.Texture.getEmptyTexture(cgl)) texOut.setRef(CGL.Texture.getEmptyTexture(cgl));

    if (!inTexture.get() || inTexture.get() == CGL.Texture.getEmptyTexture(cgl))
    {
        lastTex = null;// CGL.Texture.getEmptyTexture(cgl);
        trigger.trigger();
        return;
    }
    else
    if (!effect || reInitEffect || lastTex != inTexture.get())
    {
        initEffect();
    }
    const vp = cgl.getViewPort();
    prevViewPort[0] = vp[0];
    prevViewPort[1] = vp[1];
    prevViewPort[2] = vp[2];
    prevViewPort[3] = vp[3];

    updateResolution();

    lastTex = inTexture.get();
    const oldEffect = cgl.currentTextureEffect;
    cgl.currentTextureEffect = effect;
    effect.setSourceTexture(tex);

    effect.startEffect();

    // render background color...
    cgl.pushShader(bgShader);
    cgl.currentTextureEffect.bind();
    cgl.setTexture(0, inTexture.get().tex);
    if (inTextureMask.get())cgl.setTexture(1, inTextureMask.get().tex);

    cgl.pushBlend(false);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    cgl.popBlend();

    texOut.setRef(effect.getCurrentSourceTexture());

    effect.endEffect();

    cgl.setViewPort(prevViewPort[0], prevViewPort[1], prevViewPort[2], prevViewPort[3]);

    cgl.currentTextureEffect = oldEffect;

    cgl.setTexture(0, CGL.Texture.getEmptyTexture(cgl).tex);

    trigger.trigger();
}

function updateParams()
{
    bgShader.toggleDefine("FLIPX", flipX.get());
    bgShader.toggleDefine("FLIPY", flipY.get());

    bgShader.toggleDefine("TEX_MASK", inTextureMask.get());

    bgShader.toggleDefine("GREY_R", greyscale.get() === "R");
    bgShader.toggleDefine("GREY_G", greyscale.get() === "G");
    bgShader.toggleDefine("GREY_B", greyscale.get() === "B");
    bgShader.toggleDefine("GREY_A", greyscale.get() === "A");
    bgShader.toggleDefine("GREY_LUMI", greyscale.get() === "Luminance");

    bgShader.toggleDefine("ALPHA_1", alphaMaskMethod.get() === "1");
    bgShader.toggleDefine("ALPHA_A", alphaMaskMethod.get() === "A");

    bgShader.toggleDefine("INVERT_R", invertR.get());
    bgShader.toggleDefine("INVERT_G", invertG.get());
    bgShader.toggleDefine("INVERT_B", invertB.get());
    bgShader.toggleDefine("INVERT_A", invertA.get());

    if (twrap.get() == "repeat") selectedWrap = CGL.Texture.WRAP_REPEAT;
    else if (twrap.get() == "mirrored repeat") selectedWrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
    else if (twrap.get() == "clamp to edge") selectedWrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

    if (tfilter.get() == "nearest") selectedFilter = CGL.Texture.FILTER_NEAREST;
    else if (tfilter.get() == "linear") selectedFilter = CGL.Texture.FILTER_LINEAR;
    else if (tfilter.get() == "mipmap") selectedFilter = CGL.Texture.FILTER_MIPMAP;

    if (bgShader.needsRecompile())
    {
        reInitEffect = true;
    }
    if (tex && (
        tex.width != Math.floor(width.get()) ||
        tex.height != Math.floor(height.get()) ||
        tex.wrap != selectedWrap ||
        tex.pixelFormat != inPixelFormat.get()
    ))
    {
        reInitEffect = true;
    }
}

}
};






// **************************************************************
// 
// Ops.Boolean.MonoFlop
// 
// **************************************************************

Ops.Boolean.MonoFlop= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    trigger = op.inTriggerButton("Trigger"),
    duration = op.inValue("Duration", 1),
    valueTrue = op.inValue("Value True", 1),
    valueFalse = op.inValue("Value False", 0),
    resetButton = op.inTriggerButton("Reset"),
    outAct = op.outTrigger("Activated"),
    outEnded = op.outTrigger("Ended"),
    result = op.outNumber("Result", false);

let lastTimeout = -1;

resetButton.onTriggered = function ()
{
    result.set(valueFalse.get());

    clearTimeout(lastTimeout);
};

trigger.onTriggered = function ()
{
    if (result.get() == valueFalse.get())outAct.trigger();
    result.set(valueTrue.get());

    clearTimeout(lastTimeout);
    lastTimeout = setTimeout(function ()
    {
        result.set(valueFalse.get());
        outEnded.trigger();
    }, duration.get() * 1000);
};

}
};






// **************************************************************
// 
// Ops.Gl.ArrayToTexture_v2
// 
// **************************************************************

Ops.Gl.ArrayToTexture_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inExe = op.inTrigger("Update"),
    inArr = op.inArray("array", null),
    inStride = op.inSwitch("Source Structure", ["MONO", "RGB", "RGBA"], "RGBA"),
    inSizeType = op.inSwitch("Size", ["Manual", "Square", "Row", "Column"], "Manual"),
    inWidth = op.inValueInt("width", 32),
    inHeight = op.inValueInt("height", 32),
    fillUp = op.inBool("Fill Up", false),
    flip = op.inBool("Flip", false),
    inPixel = op.inDropDown("Pixel Format", CGL.Texture.PIXELFORMATS, CGL.Texture.PFORMATSTR_RGBA32F),
    tfilter = op.inSwitch("Filter", ["nearest", "linear", "mipmap"], "nearest"),
    wrap = op.inValueSelect("Wrap", ["repeat", "mirrored repeat", "clamp to edge"], "repeat"),
    outNext = op.outTrigger("Next"),
    outTex = op.outTexture("Texture out"),
    outWidth = op.outNumber("Tex Width"),
    outHeight = op.outNumber("Tex Height");

const cgl = op.patch.cgl;
const emptyTex = CGL.Texture.getEmptyTexture(cgl);

let tex = null;
let arrayResized = true;
let pixels = new Uint8Array(8);
let cgl_filter = CGL.Texture.FILTER_NEAREST;
let cgl_wrap = CGL.Texture.WRAP_REPEAT;
let needsUpdate = true;
inExe.onTriggered = update;

flip.onChange =
    inStride.onChange =
    inSizeType.onChange =
    inArr.onChange =
    tfilter.onChange =
    inPixel.onChange =
    wrap.onChange =
    inWidth.onChange =
    fillUp.onChange =
    inHeight.onChange = () =>
    {
        needsUpdate = true;

        arrayResized = true;

        if (tfilter.get() == "nearest") cgl_filter = CGL.Texture.FILTER_NEAREST;
        else if (tfilter.get() == "linear") cgl_filter = CGL.Texture.FILTER_LINEAR;
        else if (tfilter.get() == "mipmap") cgl_filter = CGL.Texture.FILTER_MIPMAP;
        else if (tfilter.get() == "Anisotropic") cgl_filter = CGL.Texture.FILTER_ANISOTROPIC;

        if (wrap.get() == "repeat") cgl_wrap = CGL.Texture.WRAP_REPEAT;
        else if (wrap.get() == "mirrored repeat") cgl_wrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
        else if (wrap.get() == "clamp to edge") cgl_wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;
    };

function update()
{
    if (!needsUpdate) return outNext.trigger();
    // fillUp.setUiAttribs({greyout:inSizeType.get()!="Manual"});
    inWidth.setUiAttribs({ "greyout": inSizeType.get() != "Manual" });
    inHeight.setUiAttribs({ "greyout": inSizeType.get() != "Manual" });

    let error = false;
    let w = inWidth.get();
    let h = inHeight.get();
    let stride = 3;
    if (inStride.get() == "RGBA")stride = 4;
    if (inStride.get() == "MONO")stride = 1;

    inArr.setUiAttribs({ "stride": stride });

    let data = inArr.get();
    const isFp = inPixel.get().indexOf("float") > -1;

    if (w <= 0 || h <= 0 || !data) error = true;

    if (error)
    {
        outTex.setRef(emptyTex);
        return;
    }

    if (inSizeType.get() == "Square")
    {
        w = h = Math.ceil(Math.sqrt(data.length / stride));
    }
    else if (inSizeType.get() == "Row")
    {
        w = data.length / stride;
        h = 1;
    }
    else if (inSizeType.get() == "Column")
    {
        h = data.length / stride;
        w = 1;
    }

    if (arrayResized)
    {
        if (isFp) pixels = new Float32Array(w * h * 4);
        else pixels = new Uint8Array(w * h * 4);

        arrayResized = false;
    }

    let num = data.length / stride;
    if (fillUp.get())num = w * h;

    for (let i = 0; i < num; i++)
    {
        for (let j = 0; j < stride; j++)
        {
            let v = data[(i * stride + j) % data.length];
            if (!isFp)v *= 255;

            pixels[i * 4 + j] = v;
        }
        if (stride == 1)
        {
            const v = pixels[i * 4 + 0];
            pixels[i * 4 + 1] = v;
            pixels[i * 4 + 2] = v;
            if (isFp) pixels[i * 4 + 3] = 1;
            else pixels[i * 4 + 3] = 255;
        }

        if (stride == 3)
            if (isFp) pixels[i * 4 + 3] = 1.0;
            else pixels[i * 4 + 3] = 255;
    }
    if (tex && (w != tex.width || h != tex.height))
    {
        if (tex)tex.delete();
        tex = null;
    }
    if (!tex) tex = new CGL.Texture(cgl, { "pixelFormat": inPixel.get(), "name": "array2texture" });

    if (flip.get())
    {
        const flipped = new Float32Array(pixels.length);

        for (let i = 0; i < pixels.length; i += 4)
        {
            flipped[pixels.length - i - 4] = pixels[i];
            flipped[pixels.length - i - 3] = pixels[i + 1];
            flipped[pixels.length - i - 2] = pixels[i + 2];
            flipped[pixels.length - i - 1] = pixels[i + 3];
        }

        pixels = flipped;
    }

    tex.initFromData(pixels, w, h, cgl_filter, cgl_wrap);

    outWidth.set(w);
    outHeight.set(h);

    outTex.setRef(tex);

    outNext.trigger();
    needsUpdate = false;
}

}
};






// **************************************************************
// 
// Ops.Array.BoolStateArray
// 
// **************************************************************

Ops.Array.BoolStateArray= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
// constants
let ARRAY_LENGTH_DEFAULT = 10;
let INACTIVE_VALUE = 0;
let ACTIVE_VALUE = 1;

// variables
let stateArray = [];

// inputs
let arrayLengthPort = op.inValue("Array Length", ARRAY_LENGTH_DEFAULT);
let activeIndexPort = op.inValue("Active Index", 0);
let inactiveValuePort = op.inValue("Inactive Value", 0);
let activeValuePort = op.inValue("Active Value", 1);

// outputs
let stateArrayPort = op.outArray("State Array");

// change listeners
arrayLengthPort.onChange = update;
activeIndexPort.onChange = update;
inactiveValuePort.onChange = update;
activeValuePort.onChange = update;

// init
update();

// functions

function update()
{
    let arrLength = Math.max(0, arrayLengthPort.get());
    let activeIndex = Math.round(activeIndexPort.get());
    let inactiveValue = inactiveValuePort.get();
    let activeValue = activeValuePort.get();
    for (let i = 0; i < arrLength; i++)
    {
        if (i === activeIndex)
        {
            stateArray[i] = activeValue;
        }
        else
        {
            stateArray[i] = inactiveValue;
        }
    }
    stateArray.length = arrLength;
    stateArrayPort.set(null);
    stateArrayPort.set(stateArray);
}

}
};






// **************************************************************
// 
// Ops.Gl.ShaderEffects.TransformVertex
// 
// **************************************************************

Ops.Gl.ShaderEffects.TransformVertex= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"trans_vert":"\n\n\npos.xyz*=vec3(MOD_scale);\npos.xyz+=vec3(MOD_translate);\n\nmat4 MOD_rmat=\n        MOD_rotationX(MOD_rot.x*0.0174533)*\n        MOD_rotationY(MOD_rot.y*0.0174533)*\n        MOD_rotationZ(MOD_rot.z*0.0174533);\n\npos*=MOD_rmat;\n\n#ifdef MOD_TRANS_NORMS\n    norm=(vec4(norm,1.0)*MOD_rmat).xyz;\n    bitangent=(vec4(bitangent,1.0)*MOD_rmat).xyz;\n    tangent=(vec4(tangent,1.0)*MOD_rmat).xyz;\n#endif","trans_head_vert":"\nmat4 MOD_rotationX( in float angle ) {\n\treturn mat4(\t1.0,\t\t0,\t\t\t0,\t\t\t0,\n\t\t\t \t\t0, \tcos(angle),\t-sin(angle),\t\t0,\n\t\t\t\t\t0, \tsin(angle),\t cos(angle),\t\t0,\n\t\t\t\t\t0, \t\t\t0,\t\t\t  0, \t\t1);\n}\n\nmat4 MOD_rotationY( in float angle ) {\n\treturn mat4(\tcos(angle),\t\t0,\t\tsin(angle),\t0,\n\t\t\t \t\t\t\t0,\t\t1.0,\t\t\t 0,\t0,\n\t\t\t\t\t-sin(angle),\t0,\t\tcos(angle),\t0,\n\t\t\t\t\t\t\t0, \t\t0,\t\t\t\t0,\t1);\n}\n\nmat4 MOD_rotationZ( in float angle ) {\n\treturn mat4(\tcos(angle),\t\t-sin(angle),\t0,\t0,\n\t\t\t \t\tsin(angle),\t\tcos(angle),\t\t0,\t0,\n\t\t\t\t\t\t\t0,\t\t\t\t0,\t\t1,\t0,\n\t\t\t\t\t\t\t0,\t\t\t\t0,\t\t0,\t1);\n}\n",};
const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("Trigger"),
    transX = op.inValue("Translate X", 0),
    transY = op.inValue("Translate Y", 0),
    transZ = op.inValue("Translate Z", 0),

    scaleX = op.inValue("Scale X", 1),
    scaleY = op.inValue("Scale Y", 1),
    scaleZ = op.inValue("Scale Z", 1),

    rotX = op.inValue("Rotation X", 0),
    rotY = op.inValue("Rotation Y", 0),
    rotZ = op.inValue("Rotation Z", 0),
    transNorm = op.inBool("Transform normals", false);

const cgl = op.patch.cgl;
const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });

mod.addModule({
    "priority": -2,
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": attachments.trans_head_vert || "",
    "srcBodyVert": attachments.trans_vert || ""
});

mod.addUniformVert("3f", "MOD_translate", transX, transY, transZ);
mod.addUniformVert("3f", "MOD_scale", scaleX, scaleY, scaleZ);
mod.addUniformVert("3f", "MOD_rot", rotX, rotY, rotZ);

transNorm.onChange = updateDefines;

updateDefines();

function updateDefines()
{
    mod.toggleDefine("MOD_TRANS_NORMS", transNorm.get());
}

render.onTriggered = function ()
{
    mod.bind();
    trigger.trigger();
    mod.unbind();
};

}
};






// **************************************************************
// 
// Ops.Gl.GradientTexture
// 
// **************************************************************

Ops.Gl.GradientTexture= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
// STOP UPDATING THIS OP ... use Ops.Color.GradientColorArray

const inGrad = op.inGradient("Gradient"),
    inDir = op.inValueSelect("Direction", ["X", "XX", "Y", "YY", "XY", "YX", "Radial"], "X"),
    inSmoothstep = op.inValueBool("Smoothstep", false),
    inStep = op.inBool("Step", false),
    inFlip = op.inBool("Flip", false),
    inSRGB = op.inBool("sRGB", false),
    inOklab = op.inBool("Oklab", false),
    inSize = op.inValueInt("Size", 256),
    tfilter = op.inSwitch("filter", ["nearest", "linear", "mipmap"], "linear"),
    twrap = op.inValueSelect("wrap", ["clamp to edge", "repeat", "mirrored repeat"], "clamp to edge"),
    inNoise = op.inFloatSlider("Dither", 0),
    inGradArray = op.inArray("Gradient Array"),
    inRandom = op.inTriggerButton("Randomize Colors"),
    outAlpha = op.inSwitch("Alpha", ["Mask", "combined"], "Mask"),
    outTex = op.outTexture("Texture"),
    outTexMask = op.outTexture("Alpha Mask"),
    outColors = op.outArray("Colors", null, 3),
    outColorPos = op.outArray("Colors Pos", null, 1);

const cgl = op.patch.cgl;
let timeout = null;
inGrad.setUiAttribs({ "editShortcut": true });

const bluenoise = [221, 125, 40, 94, 163, 50, 214, 174, 69, 229, 135, 79, 25, 92, 217, 129, 103, 155, 16, 237, 168, 75, 212, 126, 203, 157, 104, 223, 50, 96, 115, 189, 0, 104, 199, 16, 185, 242, 83, 26, 123, 95, 191, 175, 247, 159, 32, 170, 0, 88, 203, 133, 106, 46, 227, 14, 35, 246, 66, 20, 240, 205, 36, 159, 74, 252, 148, 231, 132, 117, 6, 145, 254, 39, 222, 5, 111, 46, 67, 197, 228, 116, 181, 66, 25, 245, 98, 139, 172, 89, 190, 149, 127, 177, 64, 138, 210, 169, 58, 28, 70, 100, 206, 188, 164, 107, 60, 150, 203, 126, 235, 142, 56, 249, 38, 222, 148, 178, 195, 56, 115, 230, 45, 108, 7, 84, 234, 21, 44, 90, 110, 216, 178, 37, 226, 53, 14, 77, 212, 31, 86, 180, 100, 23, 82, 14, 162, 93, 122, 6, 81, 156, 24, 209, 75, 255, 163, 218, 196, 121, 237, 187, 9, 152, 247, 136, 158, 91, 128, 232, 169, 137, 251, 10, 216, 154, 188, 131, 211, 71, 200, 34, 236, 216, 129, 13, 179, 136, 32, 54, 99, 146, 33, 131, 202, 49, 84, 18, 64, 197, 245, 114, 21, 193, 52, 74, 118, 44, 243, 105, 173, 50, 252, 110, 63, 166, 41, 102, 199, 62, 117, 184, 15, 77, 250, 162, 69, 120, 231, 107, 213, 2, 177, 43, 67, 102, 159, 238, 171, 206, 64, 29, 233, 10, 151, 135, 185, 87, 247, 147, 223, 91, 241, 152, 225, 175, 3, 102, 220, 25, 191, 170, 36, 143, 81, 152, 209, 224, 133, 35, 93, 2, 145, 87, 124, 193, 97, 22, 228, 1, 120, 51, 171, 8, 26, 210, 108, 48, 205, 59, 179, 92, 147, 253, 124, 99, 237, 186, 11, 120, 19, 181, 229, 112, 198, 160, 220, 76, 42, 210, 160, 71, 202, 31, 78, 190, 130, 67, 86, 138, 115, 156, 243, 14, 46, 74, 57, 219, 28, 51, 90, 250, 59, 81, 140, 47, 255, 17, 58, 181, 243, 114, 56, 178, 239, 139, 228, 156, 251, 40, 167, 232, 28, 38, 82, 136, 206, 161, 9, 196, 106, 139, 167, 204, 150, 195, 218, 70, 172, 35, 132, 103, 146, 27, 89, 128, 16, 107, 96, 57, 119, 201, 15, 187, 239, 126, 194, 225, 112, 182, 234, 131, 174, 240, 72, 39, 109, 29, 8, 100, 122, 207, 231, 4, 166, 224, 198, 153, 217, 44, 183, 212, 4, 93, 143, 72, 99, 172, 64, 0, 97, 34, 85, 66, 20, 208, 3, 125, 243, 164, 186, 235, 156, 82, 191, 67, 248, 49, 80, 10, 253, 68, 23, 162, 244, 179, 49, 215, 24, 151, 246, 51, 214, 153, 251, 118, 45, 157, 98, 224, 53, 88, 134, 62, 42, 23, 116, 94, 140, 33, 121, 188, 169, 141, 113, 76, 33, 131, 227, 110, 11, 202, 78, 122, 168, 18, 141, 194, 221, 80, 187, 142, 177, 210, 18, 249, 144, 221, 180, 12, 201, 215, 106, 60, 91, 226, 200, 236, 150, 85, 61, 164, 185, 133, 42, 229, 187, 73, 55, 101, 27, 235, 59, 12, 35, 75, 113, 199, 101, 163, 237, 57, 152, 174, 234, 134, 1, 37, 53, 123, 193, 6, 208, 253, 34, 91, 145, 104, 8, 240, 211, 175, 129, 164, 109, 253, 123, 230, 171, 6, 50, 79, 27, 127, 73, 43, 19, 246, 161, 211, 103, 17, 172, 96, 46, 117, 70, 241, 219, 27, 162, 115, 88, 38, 4, 148, 204, 92, 189, 154, 63, 130, 217, 188, 111, 254, 208, 101, 86, 191, 144, 75, 180, 249, 65, 137, 233, 157, 18, 171, 192, 49, 66, 201, 137, 246, 218, 51, 71, 15, 43, 214, 29, 95, 239, 38, 139, 165, 7, 225, 124, 30, 59, 112, 221, 154, 28, 197, 217, 106, 58, 85, 209, 128, 232, 151, 15, 79, 182, 120, 238, 168, 134, 81, 248, 146, 173, 16, 88, 195, 65, 150, 183, 205, 242, 11, 41, 89, 126, 80, 8, 183, 121, 141, 3, 98, 180, 31, 108, 58, 196, 97, 24, 222, 107, 198, 2, 116, 70, 207, 52, 230, 22, 109, 47, 80, 165, 132, 199, 235, 170, 52, 148, 247, 165, 23, 242, 74, 45, 254, 170, 226, 155, 36, 142, 179, 60, 158, 48, 182, 223, 154, 124, 98, 178, 250, 140, 5, 231, 96, 68, 19, 116, 204, 32, 227, 43, 200, 113, 161, 213, 122, 87, 0, 130, 248, 77, 13, 241, 92, 229, 30, 102, 13, 244, 77, 160, 33, 209, 119, 55, 176, 143, 190, 255, 103, 71, 93, 186, 62, 223, 145, 12, 189, 68, 202, 47, 211, 114, 192, 41, 127, 203, 141, 65, 189, 40, 135, 198, 61, 89, 222, 158, 24, 216, 45, 1, 157, 213, 130, 239, 83, 104, 26, 55, 134, 238, 29, 159, 95, 63, 167, 149, 7, 78, 255, 119, 166, 212, 1, 233, 19, 105, 186, 37, 244, 110, 86, 135, 56, 173, 11, 151, 36, 176, 196, 230, 94, 149, 109, 184, 226, 20, 236, 215, 105, 175, 22, 219, 52, 87, 111, 174, 128, 248, 149, 78, 125, 63, 184, 227, 242, 118, 22, 220, 138, 252, 119, 76, 168, 39, 250, 10, 136, 84, 123, 54, 69, 194, 37, 95, 147, 241, 73, 153, 48, 68, 7, 194, 17, 207, 161, 31, 76, 201, 90, 166, 69, 4, 48, 215, 21, 204, 57, 73, 176, 200, 30, 249, 155, 133, 233, 163, 9, 197, 32, 183, 220, 205, 137, 232, 167, 94, 144, 9, 105, 181, 44, 111, 207, 99, 132, 155, 182, 85, 127, 219, 147, 42, 97, 184, 5, 83, 208, 108, 61, 125, 228, 21, 100, 39, 90, 114, 53, 218, 41, 252, 129, 61, 234, 143, 30, 192, 245, 12, 112, 236, 101, 2, 244, 113, 165, 225, 118, 47, 20, 176, 251, 142, 84, 117, 160, 254, 177, 26, 238, 121, 72, 193, 213, 153, 13, 55, 173, 79, 224, 65, 140, 34, 195, 158, 54, 17, 206, 62, 144, 240, 190, 72, 40, 214, 54, 192, 5, 146, 60, 82, 185, 3, 138, 169, 25, 83, 245];
const bluenoiseSize = 32;

inNoise.onChange =
outAlpha.onChange =
twrap.onChange =
    tfilter.onChange =
    inStep.onChange =
    inFlip.onChange =
    inSRGB.onChange =
    inOklab.onChange =
    inSize.onChange =
    inGrad.onChange =
    inSmoothstep.onChange =
    inDir.onChange =
    inGradArray.onChange = update;

inGrad.set("{\"keys\" : [{\"pos\":0,\"r\":0,\"g\":0,\"b\":0},{\"pos\":1,\"r\":1,\"g\":1,\"b\":1}]}");

op.onLoaded = update;

inRandom.onTriggered = () =>
{
    const keys = parseKeys();
    if (keys)
    {
        keys.forEach((key) =>
        {
            key.r = Math.random();
            key.g = Math.random();
            key.b = Math.random();
        });
        const newKeys = JSON.stringify({ "keys": keys });
        inGrad.set(newKeys);
    }
};

function rgbToOklab(r, g, b)
{
    let l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
    let m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
    let s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
    l = Math.cbrt(l); m = Math.cbrt(m); s = Math.cbrt(s);
    return [
        l * +0.2104542553 + m * +0.7936177850 + s * -0.0040720468,
        l * +1.9779984951 + m * -2.4285922050 + s * +0.4505937099,
        l * +0.0259040371 + m * +0.7827717662 + s * -0.8086757660
    ];
}

function oklabToRGB(L, a, b)
{
    let l = L + a * +0.3963377774 + b * +0.2158037573;
    let m = L + a * -0.1055613458 + b * -0.0638541728;
    let s = L + a * -0.0894841775 + b * -1.2914855480;
    l **= 3; m **= 3; s **= 3;
    let rgb_r = l * +4.0767416621 + m * -3.3077115913 + s * +0.2309699292;
    let rgb_g = l * -1.2684380046 + m * +2.6097574011 + s * -0.3413193965;
    let rgb_b = l * -0.0041960863 + m * -0.7034186147 + s * +1.7076147010;
    rgb_r = CABLES.clamp(rgb_r, 0, 1); rgb_g = CABLES.clamp(rgb_g, 0, 1); rgb_b = CABLES.clamp(rgb_b, 0, 1);
    return [rgb_r, rgb_g, rgb_b];
}

function lin2srgb(r, g, b)
{
    r /= 255;
    const thr = 0.0031308;
    let c_loR = 12.92 * r;
    let c_hiR = 1.055 * Math.pow(r, 0.41666) - 0.055;
    return ((r < thr) ? c_loR : c_hiR) * 255;
}

function update()
{
    cgl.addNextFrameOnceCallback(doUpdate);
}

function doUpdate()
{
    const keys = parseKeys();
    if (keys) updateGradient(keys);
}

function parseKeys()
{
    let keys = null;
    op.setUiError("nodata", null);
    op.setUiError("parse", null);

    if (Array.isArray(inGradArray.get()))
    {
        keys = inGradArray.get();
    }
    else
    {
        let grad = null;
        if (!inGrad.get() || inGrad.get() === "")
        {
            // op.setUiError("nodata", "gradient no data");
            return null;
        }

        try
        {
            grad = JSON.parse(inGrad.get());
        }
        catch (e)
        {
            op.setUiError("parse", "could not parse gradient data");
        }

        if (!grad || !grad.keys)
        {
            op.setUiError("nodata", "gradient no data");
            return null;
        }
        keys = grad.keys;
    }
    return keys;
}

function noise(x, y)
{
    x %= bluenoiseSize;
    y %= bluenoiseSize;

    return bluenoise[x + y * bluenoiseSize] / 255 - 0.5;
}

function addNoise(pixels, width, height)
{
    if (inNoise.get() == 0.0) return pixels;

    for (let x = 0; x < width; x++)
        for (let y = 0; y < height; y++)
        {
            const r1 = pixels[(x + (y * width)) * 4 + 0];
            const g1 = pixels[(x + (y * width)) * 4 + 1];
            const b1 = pixels[(x + (y * width)) * 4 + 2];

            let offX = (width / 8) * inNoise.get() * noise(x, y);
            let offY = (height / 8) * inNoise.get() * noise(x + bluenoiseSize / 2, y + bluenoiseSize / 2);

            if (height == 1) offY = 0;
            if (width == 1) offX = 0;

            offX = Math.round(offX);
            offY = Math.round(offY);

            const yOffY = CABLES.clamp(y + offY, 0, height - 1);
            const xOffX = CABLES.clamp(x + offX, 0, width - 1);

            const r2 = pixels[(xOffX + ((yOffY) * width)) * 4 + 0];
            const g2 = pixels[(xOffX + ((yOffY) * width)) * 4 + 1];
            const b2 = pixels[(xOffX + ((yOffY) * width)) * 4 + 2];

            pixels[(x + y * width) * 4 + 0] = r2;
            pixels[(x + y * width) * 4 + 1] = g2;
            pixels[(x + y * width) * 4 + 2] = b2;

            pixels[(xOffX + ((yOffY) * width)) * 4 + 0] = r1;
            pixels[(xOffX + ((yOffY) * width)) * 4 + 1] = g1;
            pixels[(xOffX + ((yOffY) * width)) * 4 + 2] = b1;
        }
    return pixels;
}

function updateGradient(keys)
{
    let width = Math.round(inSize.get());
    if (width < 4) width = 4;

    inGrad.setUiAttribs(
        {
            "editShortcut": true,
            "gradEditSmoothstep": inSmoothstep.get(),
            "gradEditStep": inStep.get(),
            "gradOklab": inOklab.get()
        });

    let selectedWrap = 0;
    let selectedFilter = 0;
    if (twrap.get() == "repeat") selectedWrap = CGL.Texture.WRAP_REPEAT;
    else if (twrap.get() == "mirrored repeat") selectedWrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
    else if (twrap.get() == "clamp to edge") selectedWrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

    if (tfilter.get() == "nearest") selectedFilter = CGL.Texture.FILTER_NEAREST;
    else if (tfilter.get() == "linear") selectedFilter = CGL.Texture.FILTER_LINEAR;
    else if (tfilter.get() == "mipmap") selectedFilter = CGL.Texture.FILTER_MIPMAP;

    const tex = new CGL.Texture(cgl);
    const texAlpha = new CGL.Texture(cgl);

    let pixels = new Uint8Array(width * 4);
    let pixelsAlpha = new Uint8Array(width * 4);

    const alphaInCol = outAlpha.get() == "combined";

    for (let i = 0; i < keys.length - 1; i++)
    {
        const keyA = keys[i];
        const keyB = keys[i + 1];

        for (let x = keyA.pos * width; x < keyB.pos * width; x++)
        {
            let p = CABLES.map(x, keyA.pos * width, keyB.pos * width, 0, 1);
            if (inStep.get())p = Math.round(p);
            if (inSmoothstep.get()) p = CABLES.smoothStep(p);
            x = Math.round(x);

            let xx = x;
            if (inFlip.get())xx = width - x - 1;

            if (inOklab.get())
            {
                const klabA = rgbToOklab(keyA.r, keyA.g, keyA.b);
                const labA_r = klabA[0];
                const labA_g = klabA[1];
                const labA_b = klabA[2];

                const klabB = rgbToOklab(keyB.r, keyB.g, keyB.b);
                const labB_r = klabB[0];
                const labB_g = klabB[1];
                const labB_b = klabB[2];

                const l = ((p * labB_r + (1.0 - p) * labA_r));
                const a = ((p * labB_g + (1.0 - p) * labA_g));
                const b = ((p * labB_b + (1.0 - p) * labA_b));

                const pixCol = oklabToRGB(l, a, b);
                pixels[xx * 4 + 0] = Math.round(pixCol[0] * 255);
                pixels[xx * 4 + 1] = Math.round(pixCol[1] * 255);
                pixels[xx * 4 + 2] = Math.round(pixCol[2] * 255);
            }
            else
            {
                pixels[xx * 4 + 0] = Math.round((p * keyB.r + (1.0 - p) * keyA.r) * 255);
                pixels[xx * 4 + 1] = Math.round((p * keyB.g + (1.0 - p) * keyA.g) * 255);
                pixels[xx * 4 + 2] = Math.round((p * keyB.b + (1.0 - p) * keyA.b) * 255);
            }

            if (typeof keyA.a !== "undefined" && typeof keyB.a !== "undefined")
            {
                const alpha = Math.round((p * keyB.a + (1.0 - p) * keyA.a) * 255);
                if (alphaInCol)pixels[xx * 4 + 3] = alpha;
                else pixels[xx * 4 + 3] = 255;

                pixelsAlpha[xx * 4 + 0] =
                pixelsAlpha[xx * 4 + 1] =
                pixelsAlpha[xx * 4 + 2] = Math.round(alpha * 255);
                pixelsAlpha[xx * 4 + 3] = 255;
            }
            else
            {
                pixels[xx * 4 + 3] = Math.round(255);
            }
        }
    }
    if (inSRGB.get())
        for (let i = 0; i < pixels.length; i += 4)
        {
            pixels[i + 0] = lin2srgb(pixels[i + 0]);
            pixels[i + 1] = lin2srgb(pixels[i + 1]);
            pixels[i + 2] = lin2srgb(pixels[i + 2]);
        }

    if (inDir.get() == "X")
    {
        tex.initFromData(addNoise(pixels, width, 1), width, 1, selectedFilter, selectedWrap);
        texAlpha.initFromData(pixelsAlpha, width, 1, selectedFilter, selectedWrap);
    }

    if (inDir.get() == "Y")
    {
        tex.initFromData(addNoise(pixels, 1, width), 1, width, selectedFilter, selectedWrap);
        texAlpha.initFromData(pixelsAlpha, 1, width, selectedFilter, selectedWrap);
    }

    if (inDir.get() == "Radial")
    {
        const rpixels = new Uint8Array(width * width * 4);
        const rpixelsAlpha = new Uint8Array(width * width * 4);

        for (let x = 0; x < width; x++)
        {
            for (let y = 0; y < width; y++)
            {
                const dx = x - (width - 1) / 2;
                const dy = y - (width - 1) / 2;
                let pos = Math.sqrt(dx * dx + dy * dy) / (width) * 2;

                if (inSmoothstep.get()) pos = CABLES.smoothStep(pos);

                let aa = Math.round(pos * width) * 4;
                if (aa >= width * 4)aa = width * 4 - 4;

                rpixels[(x * 4) + (y * 4 * width) + 0] = pixels[aa + 0];
                rpixels[(x * 4) + (y * 4 * width) + 1] = pixels[aa + 1];
                rpixels[(x * 4) + (y * 4 * width) + 2] = pixels[aa + 2];
                rpixels[(x * 4) + (y * 4 * width) + 3] = pixels[aa + 3];

                rpixelsAlpha[(x * 4) + (y * 4 * width) + 0] = pixelsAlpha[aa + 0];
                rpixelsAlpha[(x * 4) + (y * 4 * width) + 1] = pixelsAlpha[aa + 1];
                rpixelsAlpha[(x * 4) + (y * 4 * width) + 2] = pixelsAlpha[aa + 2];
                rpixelsAlpha[(x * 4) + (y * 4 * width) + 3] = Math.round(255);
            }
        }

        pixels = rpixels;

        tex.initFromData(addNoise(pixels, width, width), width, width, selectedFilter, selectedWrap);
        texAlpha.initFromData(rpixelsAlpha, width, width, selectedFilter, selectedWrap);
    }

    if (inDir.get() == "XX")
    {
        const rpixels = new Uint8Array(width * width * 4);
        const rpixelsAlpha = new Uint8Array(width * width * 4);

        for (let x = 0; x < width; x++)
            for (let y = 0; y < width; y++)
            {
                const aa = x * 4;
                rpixels[(x * 4) + (y * 4 * width) + 0] = pixels[aa + 0];
                rpixels[(x * 4) + (y * 4 * width) + 1] = pixels[aa + 1];
                rpixels[(x * 4) + (y * 4 * width) + 2] = pixels[aa + 2];
                rpixels[(x * 4) + (y * 4 * width) + 3] = pixels[aa + 3];

                rpixelsAlpha[(x * 4) + (y * 4 * width) + 0] = pixelsAlpha[aa + 0];
                rpixelsAlpha[(x * 4) + (y * 4 * width) + 1] = pixelsAlpha[aa + 1];
                rpixelsAlpha[(x * 4) + (y * 4 * width) + 2] = pixelsAlpha[aa + 2];
                rpixelsAlpha[(x * 4) + (y * 4 * width) + 3] = Math.round(255);
            }
        pixels = rpixels;
        pixelsAlpha = rpixelsAlpha;
        tex.initFromData(addNoise(pixels, width, width), width, width, selectedFilter, selectedWrap);
        texAlpha.initFromData(pixelsAlpha, width, width, selectedFilter, selectedWrap);
    }

    if (inDir.get() == "YY")
    {
        const rpixels = new Uint8Array(width * width * 4);
        const rpixelsAlpha = new Uint8Array(width * width * 4);
        for (let x = 0; x < width; x++)
            for (let y = 0; y < width; y++)
            {
                const aa = x * 4;
                rpixels[(y * 4) + (x * 4 * width) + 0] = pixels[aa + 0];
                rpixels[(y * 4) + (x * 4 * width) + 1] = pixels[aa + 1];
                rpixels[(y * 4) + (x * 4 * width) + 2] = pixels[aa + 2];
                rpixels[(y * 4) + (x * 4 * width) + 3] = pixels[aa + 3];

                rpixelsAlpha[(y * 4) + (x * 4 * width) + 0] = pixelsAlpha[aa + 0];
                rpixelsAlpha[(y * 4) + (x * 4 * width) + 1] = pixelsAlpha[aa + 1];
                rpixelsAlpha[(y * 4) + (x * 4 * width) + 2] = pixelsAlpha[aa + 2];
                rpixelsAlpha[(y * 4) + (x * 4 * width) + 3] = 255;
            }
        pixels = rpixels;

        tex.initFromData(addNoise(pixels, width, width), width, width, selectedFilter, selectedWrap);
        texAlpha.initFromData(rpixelsAlpha, width, width, selectedFilter, selectedWrap);
    }

    if (inDir.get() == "XY" || inDir.get() == "YX")
    {
        const rpixels = new Uint8Array(width * width * 4);
        const rpixelsAlpha = new Uint8Array(width * width * 4);

        for (let x = 0; x < width; x++)
        {
            let xx = x;
            if (inDir.get() == "YX")xx = width - x - 1;

            for (let y = 0; y < width; y++)
            {
                let aa = Math.round(((xx) + y) / 2) * 4;

                rpixels[(x * 4) + (y * 4 * width) + 0] = pixels[aa + 0];
                rpixels[(x * 4) + (y * 4 * width) + 1] = pixels[aa + 1];
                rpixels[(x * 4) + (y * 4 * width) + 2] = pixels[aa + 2];
                rpixels[(x * 4) + (y * 4 * width) + 3] = pixels[aa + 3];

                rpixelsAlpha[(x * 4) + (y * 4 * width) + 0] = pixelsAlpha[aa + 0];
                rpixelsAlpha[(x * 4) + (y * 4 * width) + 1] = pixelsAlpha[aa + 1];
                rpixelsAlpha[(x * 4) + (y * 4 * width) + 2] = pixelsAlpha[aa + 2];
                rpixelsAlpha[(x * 4) + (y * 4 * width) + 3] = Math.round(255);
            }
        }

        pixels = rpixels;

        tex.initFromData(addNoise(pixels, width, width), width, width, selectedFilter, selectedWrap);
        texAlpha.initFromData(rpixelsAlpha, width, width, selectedFilter, selectedWrap);
    }

    const colorArr = [];
    for (let i = 0; i < keys.length - 1; i++)
    {
        colorArr.push(keys[i].r, keys[i].g, keys[i].b);
    }

    const colorPosArr = [];
    for (let i = 0; i < keys.length - 1; i++)
    {
        colorPosArr.push(keys[i].pos);
    }

    outColors.set(colorArr);
    outColorPos.set(colorPosArr);

    // outTex.set(null);
    outTex.setRef(tex);
    outTexMask.setRef(texAlpha);
}

}
};






// **************************************************************
// 
// Ops.Graphics.DepthTest
// 
// **************************************************************

Ops.Graphics.DepthTest= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    render = op.inTrigger("Render"),
    enable = op.inValueBool("Enable depth testing", true),
    meth = op.inValueSelect("Depth Test Method", ["never", "always", "less", "less or equal", "greater", "greater or equal", "equal", "not equal"], "less or equal"),
    write = op.inValueBool("Write to depth buffer", true),
    trigger = op.outTrigger("Next");

const cgl = op.patch.cgl;
let compareMethod = CABLES.CG.DEPTH_COMPARE_LESSEQUAL;

meth.onChange = updateFunc;

function updateFunc()
{
    const m = meth.get();
    if (m == "never") compareMethod = CABLES.CG.DEPTH_COMPARE_NEVER;
    else if (m == "always") compareMethod = CABLES.CG.DEPTH_COMPARE_ALWAYS;
    else if (m == "less") compareMethod = CABLES.CG.DEPTH_COMPARE_LESS;
    else if (m == "less or equal") compareMethod = CABLES.CG.DEPTH_COMPARE_LESSEQUAL;
    else if (m == "greater") compareMethod = CABLES.CG.DEPTH_COMPARE_GREATER;
    else if (m == "greater or equal") compareMethod = CABLES.CG.DEPTH_COMPARE_GREATEREQUAL;
    else if (m == "equal") compareMethod = CABLES.CG.DEPTH_COMPARE_EQUAL;
    else if (m == "not equal") compareMethod = CABLES.CG.DEPTH_COMPARE_NOTEQUAL;
}

render.onTriggered = function ()
{
    const cg = op.patch.cg;
    if (!cg) return;

    op.patch.cg.pushDepthTest(enable.get());
    op.patch.cg.pushDepthWrite(write.get());
    op.patch.cg.pushDepthFunc(cg.DEPTH_FUNCS[compareMethod]);

    trigger.trigger();

    op.patch.cg.popDepthTest();
    op.patch.cg.popDepthWrite();
    op.patch.cg.popDepthFunc();
};

}
};






// **************************************************************
// 
// Ops.Graphics.Meshes.Circle_v3
// 
// **************************************************************

Ops.Graphics.Meshes.Circle_v3= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    render = op.inTrigger("render"),
    radius = op.inValue("radius", 0.5),
    innerRadius = op.inValueSlider("innerRadius", 0),
    segments = op.inValueInt("segments", 40),
    percent = op.inValueSlider("percent", 1),
    steps = op.inValue("steps", 0),
    invertSteps = op.inValueBool("invertSteps", false),
    mapping = op.inSwitch("mapping", ["flat", "round"]),
    drawSpline = op.inValueBool("Spline", false),
    inDraw = op.inValueBool("Draw", true),
    trigger = op.outTrigger("trigger"),
    geomOut = op.outObject("geometry", null, "geometry");

op.setPortGroup("Size", [radius, innerRadius]);
op.setPortGroup("Display", [percent, steps, invertSteps]);
op.toWorkShouldNotBeChild("Ops.Gl.TextureEffects.ImageCompose", CABLES.OP_PORT_TYPE_FUNCTION);

inDraw.setUiAttribs({ "title": "Render mesh" });

mapping.set("flat");

mapping.onChange =
    segments.onChange =
    radius.onChange =
    innerRadius.onChange =
    percent.onChange =
    steps.onChange =
    invertSteps.onChange =
    drawSpline.onChange = calcLater;

geomOut.ignoreValueSerialize = true;
const cgl = op.patch.cgl;

let geom = new CGL.Geometry("circle");
let mesh = null;
const lastSegs = -1;

let oldPrim = 0;
let shader = null;
let needsCalc = true;

render.onTriggered = renderMesh;
op.onDelete = function () { if (mesh)mesh.dispose(); };

op.preRender = () =>
{
    renderMesh();
};

render.onLinkChanged = function ()
{
    if (!render.isLinked()) geomOut.set(null);
    else geomOut.setRef(geom);
};

function renderMesh()
{
    if (!op.patch.cg) return;
    if (needsCalc)calc();

    if (!CGL.TextureEffect.checkOpNotInTextureEffect(op)) return;

    shader = op.patch.cg.getShader();
    if (!shader) return;
    oldPrim = shader.glPrimitive;

    if (drawSpline.get()) shader.glPrimitive = cgl.gl.LINE_STRIP;

    if (inDraw.get() && mesh)
    {
        // mesh.instances = 3;
        mesh.render(shader);
    }
    trigger.trigger();

    shader.glPrimitive = oldPrim;
}

function calc()
{
    const segs = Math.max(3, Math.floor(segments.get()));

    geom.clear();

    const faces = [];
    const texCoords = [];
    const vertexNormals = [];
    const tangents = [];
    const biTangents = [];

    let i = 0, degInRad = 0;
    let oldPosX = 0, oldPosY = 0;
    let oldPosXTexCoord = 0, oldPosYTexCoord = 0;

    let oldPosXIn = 0, oldPosYIn = 0;
    let oldPosXTexCoordIn = 0, oldPosYTexCoordIn = 0;

    let posxTexCoordIn = 0, posyTexCoordIn = 0;
    let posxTexCoord = 0, posyTexCoord = 0;
    let posx = 0, posy = 0;

    const perc = Math.max(0.0, percent.get());
    const verts = [];

    if (drawSpline.get())
    {
        let lastX = 0;
        let lastY = 0;
        const tc = [];
        for (i = 0; i <= segs * perc; i++)
        {
            degInRad = (360 / segs) * i * CGL.DEG2RAD;
            posx = Math.cos(degInRad) * radius.get();
            posy = Math.sin(degInRad) * radius.get();

            posyTexCoord = 0.5;

            if (i > 0)
            {
                verts.push(lastX);
                verts.push(lastY);
                verts.push(0);
                posxTexCoord = 1.0 - (i - 1) / segs;

                tc.push(posxTexCoord, posyTexCoord);
            }
            verts.push(posx);
            verts.push(posy);
            verts.push(0);

            lastX = posx;
            lastY = posy;
        }
        geom.setPointVertices(verts);
    }
    else
    if (innerRadius.get() <= 0)
    {
        for (i = 0; i <= segs * perc; i++)
        {
            degInRad = (360 / segs) * i * CGL.DEG2RAD;
            posx = Math.cos(degInRad) * radius.get();
            posy = Math.sin(degInRad) * radius.get();

            if (mapping.get() == "flat")
            {
                posxTexCoord = (Math.cos(degInRad) + 1.0) / 2;
                posyTexCoord = 1.0 - (Math.sin(degInRad) + 1.0) / 2;
                posxTexCoordIn = 0.5;
                posyTexCoordIn = 0.5;
            }
            else if (mapping.get() == "round")
            {
                posxTexCoord = 1.0 - i / segs;
                posyTexCoord = 0;
                posxTexCoordIn = posxTexCoord;
                posyTexCoordIn = 1;
            }

            faces.push(
                [0, 0, 0],
                [oldPosX, oldPosY, 0],
                [posx, posy, 0]
            );

            texCoords.push(
                posxTexCoordIn, posyTexCoordIn, oldPosXTexCoord, oldPosYTexCoord, posxTexCoord, posyTexCoord
            );
            vertexNormals.push(0, 0, 1, 0, 0, 1, 0, 0, 1);
            tangents.push(1, 0, 0, 1, 0, 0, 1, 0, 0);
            biTangents.push(0, -1, 0, 0, -1, 0, 0, -1, 0);

            oldPosXTexCoord = posxTexCoord;
            oldPosYTexCoord = posyTexCoord;

            oldPosX = posx;
            oldPosY = posy;
        }

        geom = CGL.Geometry.buildFromFaces(faces, "circle");
        geom.vertexNormals = vertexNormals;
        geom.tangents = tangents;
        geom.biTangents = biTangents;
        geom.texCoords = texCoords;
    }
    else
    {
        let count = 0;
        const numSteps = segs * perc;
        const pos = 0;

        for (i = 0; i <= numSteps; i++)
        {
            count++;

            degInRad = (360 / segs) * i * CGL.DEG2RAD;
            posx = Math.cos(degInRad) * radius.get();
            posy = Math.sin(degInRad) * radius.get();

            const posxIn = Math.cos(degInRad) * innerRadius.get() * radius.get();
            const posyIn = Math.sin(degInRad) * innerRadius.get() * radius.get();

            if (mapping.get() == "round")
            {
                posxTexCoord = 1.0 - i / segs;
                posyTexCoord = 0;
                posxTexCoordIn = posxTexCoord;
                posyTexCoordIn = 1;
            }

            if (steps.get() === 0.0 ||
                (count % parseInt(steps.get(), 10) === 0 && !invertSteps.get()) ||
                (count % parseInt(steps.get(), 10) !== 0 && invertSteps.get()))
            {
                faces.push(
                    [posxIn, posyIn, 0],
                    [oldPosX, oldPosY, 0],
                    [posx, posy, 0]
                );

                faces.push(
                    [oldPosXIn, oldPosYIn, 0],
                    [oldPosX, oldPosY, 0],
                    [posxIn, posyIn, 0]
                );

                texCoords.push(
                    posxTexCoord, 0, oldPosXTexCoord, 0, posxTexCoordIn, 1, posxTexCoord, 1, oldPosXTexCoord, 0, oldPosXTexCoordIn, 1);

                vertexNormals.push(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);
                tangents.push(1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0);
                biTangents.push(0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1);
            }

            oldPosXTexCoordIn = posxTexCoordIn;
            oldPosYTexCoordIn = posyTexCoordIn;

            oldPosXTexCoord = posxTexCoord;
            oldPosYTexCoord = posyTexCoord;

            oldPosX = posx;
            oldPosY = posy;

            oldPosXIn = posxIn;
            oldPosYIn = posyIn;
        }

        geom = CGL.Geometry.buildFromFaces(faces, "circle");
        geom.vertexNormals = vertexNormals;
        geom.tangents = tangents;
        geom.biTangents = biTangents;

        if (mapping.get() == "flat") geom.mapTexCoords2d();
        else geom.texCoords = texCoords;
    }

    geomOut.setRef(geom);

    if (geom.vertices.length == 0) return;
    if (mesh) mesh.dispose();
    mesh = null;
    if (op.patch.cg)
        mesh = op.patch.cg.createMesh(geom, { "opId": op.id });
    needsCalc = false;
}

function calcLater()
{
    needsCalc = true;
}

}
};






// **************************************************************
// 
// Ops.Trigger.GateTrigger
// 
// **************************************************************

Ops.Trigger.GateTrigger= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    exe = op.inTrigger('Execute'),
    passThrough = op.inValueBool('Pass Through',true),
    triggerOut = op.outTrigger('Trigger out');

exe.onTriggered = function()
{
    if(passThrough.get())
        triggerOut.trigger();
}

}
};






// **************************************************************
// 
// Ops.Trigger.TriggerOnChangeArray
// 
// **************************************************************

Ops.Trigger.TriggerOnChangeArray= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inval = op.inArray("Array"),
    next = op.outTrigger("Changed"),
    outArr = op.outArray("Result");

inval.onChange = function ()
{
    outArr.set(inval.get());
    next.trigger();
};

}
};






// **************************************************************
// 
// Ops.Math.Sine
// 
// **************************************************************

Ops.Math.Sine= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    value = op.inValue("value"),
    phase = op.inValue("phase", 0.0),
    mul = op.inValue("frequency", 1.0),
    amplitude = op.inValue("amplitude", 1.0),
    invert = op.inValueBool("asine", false),
    result = op.outNumber("result");

let calculate = Math.sin;

mul.onChange =
amplitude.onChange =
phase.onChange =
value.onChange = function ()
{
    result.set(
        amplitude.get() * calculate((value.get() * mul.get()) + phase.get())
    );
};

invert.onChange = function ()
{
    if (invert.get()) calculate = Math.asin;
    else calculate = Math.sin;
};

}
};






// **************************************************************
// 
// Ops.Ui.Comment_v2
// 
// **************************************************************

Ops.Ui.Comment_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inTitle = op.inString("title", "New comment"),
    inText = op.inTextarea("text");
inTitle.setUiAttribs({ "hidePort": true });
inText.setUiAttribs({ "hidePort": true });

op.init =
    inTitle.onChange =
    inText.onChange =
    op.onLoaded = update;

update();

function update()
{
    if (CABLES.UI)
    {
        op.uiAttr(
            {
                "comment_title": inTitle.get(),
                "comment_text": inText.get(),
                "extendTitle": inTitle.get()
            });
    }
}

}
};






// **************************************************************
// 
// Ops.Cables.LoadingStatus_v2
// 
// **************************************************************

Ops.Cables.LoadingStatus_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    exe = op.inTrigger("exe"),
    startTimeLine = op.inBool("Play Timeline", true),
    inConLog = op.inBool("Console Logging", false),
    next = op.outTrigger("Next"),
    outInitialFinished = op.outBoolNum("Finished Initial Loading", false),
    outLoading = op.outBoolNum("Loading"),
    outProgress = op.outNumber("Progress"),
    outList = op.outArray("Jobs"),
    loadingFinished = op.outTrigger("Trigger Loading Finished ");

op.toWorkPortsNeedToBeLinked(exe);
const patch = op.patch;
let finishedOnce = false;
const preRenderTimes = [];
let firstTime = true;
let timeout = 0;

document.body.classList.add("cables-loading");

let loadingId = patch.loading.start("loadingStatusInit", "loadingStatusInit", op);

op.patch.loading.on("finishedTask", updateStatus.bind(this));
op.patch.loading.on("startTask", updateStatus.bind(this));

inConLog.onChange = () =>
{
    op.patch.loading.consoleLog = inConLog.get();
};

function updateStatus()
{
    if (!exe.isLinked()) return;
    const jobs = op.patch.loading.getListJobs();
    outProgress.set(patch.loading.getProgress());

    let hasFinished = jobs.length === 0;
    const notFinished = !hasFinished;

    if (notFinished)
    {
        outList.set(op.patch.loading.getListJobs());
    }

    if (notFinished)
    {
        if (firstTime)
        {
            // if (preRenderOps.get()) op.patch.preRenderOps();

            op.patch.timer.setTime(0);
            if (startTimeLine.get())
            {
                op.patch.timer.play();
            }
            else
            {
                op.patch.timer.pause();
            }
        }
        firstTime = false;

        document.body.classList.remove("cables-loading");
        document.body.classList.add("cables-loaded");
    }
    else
    {
        finishedOnce = true;
        outList.set(op.patch.loading.getListJobs());
        if (patch.loading.getProgress() < 1.0)
        {
            op.patch.timer.setTime(0);
            op.patch.timer.pause();
        }
    }

    outInitialFinished.set(finishedOnce);

    if (outLoading.get() && hasFinished) loadingFinished.trigger();

    outLoading.set(notFinished);
    // clearTimeout(timeout);
    // if (notFinished) outLoading.set(notFinished);
    // else
    //     timeout = setTimeout(() =>
    //     {
    //         outLoading.set(notFinished);
    //     }, 100);

    op.setUiAttribs({ "loading": notFinished });
}

op.onDelete = () =>
{
    if (loadingId)
    {
        patch.loading.finished(loadingId);
        loadingId = null;
    }
};

exe.onTriggered = () =>
{
    updateStatus();

    next.trigger();

    if (loadingId)
    {
        patch.loading.finished(loadingId);
        loadingId = null;
    }
};

}
};






// **************************************************************
// 
// Ops.Graphics.TransformView
// 
// **************************************************************

Ops.Graphics.TransformView= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    render = op.inTrigger("render"),
    posX = op.inValueFloat("posX"),
    posY = op.inValueFloat("posY"),
    posZ = op.inValueFloat("posZ"),
    scale = op.inValueFloat("scale"),
    rotX = op.inValueFloat("rotX"),
    rotY = op.inValueFloat("rotY"),
    rotZ = op.inValueFloat("rotZ"),
    trigger = op.outTrigger("trigger");

op.setPortGroup("Position", [posX, posY, posZ]);
op.setPortGroup("Scale", [scale]);
op.setPortGroup("Rotation", [rotX, rotZ, rotY]);

const vPos = vec3.create();
const vScale = vec3.create();
const transMatrix = mat4.create();
mat4.identity(transMatrix);

let doScale = false;
let doTranslate = false;

let translationChanged = true;
let didScaleChanged = true;
let didRotChanged = true;

render.onTriggered = function ()
{
    const cg = op.patch.cg || op.patch.cgl;

    let updateMatrix = false;
    if (translationChanged)
    {
        updateTranslation();
        updateMatrix = true;
    }
    if (didScaleChanged)
    {
        updateScale();
        updateMatrix = true;
    }
    if (didRotChanged)
    {
        updateMatrix = true;
    }
    if (updateMatrix)doUpdateMatrix();

    cg.pushViewMatrix();
    mat4.multiply(cg.vMatrix, cg.vMatrix, transMatrix);

    trigger.trigger();
    cg.popViewMatrix();

    if (op.isCurrentUiOp())
        gui.setTransformGizmo(
            {
                "posX": posX,
                "posY": posY,
                "posZ": posZ,
            });
};

op.transform3d = function ()
{
    return {
        "pos": [posX, posY, posZ]
    };
};

function doUpdateMatrix()
{
    mat4.identity(transMatrix);
    if (doTranslate)mat4.translate(transMatrix, transMatrix, vPos);

    if (rotX.get() !== 0)mat4.rotateX(transMatrix, transMatrix, rotX.get() * CGL.DEG2RAD);
    if (rotY.get() !== 0)mat4.rotateY(transMatrix, transMatrix, rotY.get() * CGL.DEG2RAD);
    if (rotZ.get() !== 0)mat4.rotateZ(transMatrix, transMatrix, rotZ.get() * CGL.DEG2RAD);

    if (doScale)mat4.scale(transMatrix, transMatrix, vScale);
    rotChanged = false;
}

function updateTranslation()
{
    doTranslate = false;
    if (posX.get() !== 0.0 || posY.get() !== 0.0 || posZ.get() !== 0.0) doTranslate = true;
    vec3.set(vPos, posX.get(), posY.get(), posZ.get());
    translationChanged = false;
}

function updateScale()
{
    doScale = false;
    if (scale.get() !== 0.0)doScale = true;
    vec3.set(vScale, scale.get(), scale.get(), scale.get());
    scaleChanged = false;
}

function translateChanged()
{
    translationChanged = true;
}

function scaleChanged()
{
    didScaleChanged = true;
}

function rotChanged()
{
    didRotChanged = true;
}

rotX.onChange =
rotY.onChange =
rotZ.onChange = rotChanged;

scale.onChange = scaleChanged;

posX.onChange =
posY.onChange =
posZ.onChange = translateChanged;

rotX.set(0.0);
rotY.set(0.0);
rotZ.set(0.0);

scale.set(1.0);

posX.set(0.0);
posY.set(0.0);
posZ.set(0.0);

doUpdateMatrix();

}
};






// **************************************************************
// 
// Ops.Gl.Matrix.Coordinates
// 
// **************************************************************

Ops.Gl.Matrix.Coordinates= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y"),
    outZ = op.outNumber("Z"),
    pos = vec3.create(),
    empty = vec3.create();

render.onTriggered = function ()
{
    const cg = op.patch.cg || op.patch.cgl;

    vec3.transformMat4(pos, empty, cg.mMatrix);

    outX.set(pos[0]);
    outY.set(pos[1]);
    outZ.set(pos[2]);

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Math.FlipSign
// 
// **************************************************************

Ops.Math.FlipSign= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inval = op.inValueFloat("Value", 1),
    result = op.outNumber("Result");

inval.onChange = update;
update();

function update()
{
    result.set(inval.get() * -1);
}

}
};






// **************************************************************
// 
// Ops.Sidebar.SideBarSwitch
// 
// **************************************************************

Ops.Sidebar.SideBarSwitch= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const parentPort = op.inObject("link"),
    inArr = op.inArray("Names"),
    inStyle = op.inSwitch("Style", ["Tabs", "Switch"], "Switch"),
    labelPort = op.inString("Text", "Switch"),

    inInput = op.inInt("Input", 0),

    setDefaultValueButtonPort = op.inTriggerButton("Set Default"),
    inGreyOut = op.inBool("Grey Out", false),
    inDefault = op.inValue("Default", 0),

    siblingsPort = op.outObject("childs"),
    outIndex = op.outNumber("Index", -1),
    outStr = op.outString("String");

let elTabActive = null;
const el = document.createElement("div");
el.classList.add("sidebar__item");
el.dataset.op = op.id;
el.classList.add("cablesEle");
inDefault.setUiAttribs({ "greyout": true });

const label = document.createElement("div");
label.classList.add("sidebar__item-label");
const labelText = document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);

const switchGroup = document.createElement("div");
el.appendChild(switchGroup);

const greyOut = document.createElement("div");
greyOut.classList.add("sidebar__greyout");
el.appendChild(greyOut);
greyOut.style.display = "none";

parentPort.onChange = onParentChanged;
op.onDelete = onDelete;

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");
op.setPortGroup("Default Item", [inDefault, setDefaultValueButtonPort]);
const tabEles = [];

inArr.onChange = rebuildHtml;
inStyle.onChange = updateStyle;
updateStyle();

labelPort.onChange = () =>
{
    label.innerHTML = labelPort.get();
};

inGreyOut.onChange = function ()
{
    greyOut.style.display = inGreyOut.get() ? "block" : "none";
};

function rebuildHtml()
{
    tabEles.length = 0;
    switchGroup.innerHTML = "";
    elTabActive = null;

    const arr = inArr.get();
    if (!arr) return;

    for (let i = 0; i < arr.length; i++)
    {
        const el = addTab(String(arr[i]));
        if (i == inDefault.get())setActiveTab(el);
    }
}

setDefaultValueButtonPort.onTriggered = () =>
{
    inDefault.set(outIndex.get());
    op.refreshParams();
};

function updateStyle()
{
    if (inStyle.get() == "Tabs")
    {
        el.classList.add("sidebar_tabs");
        switchGroup.classList.remove("sidebar_switchs");
        label.style.display = "none";
    }
    else
    {
        el.classList.remove("sidebar_tabs");
        switchGroup.classList.add("sidebar_switchs");
        label.style.display = "inline-block";
    }

    labelPort.setUiAttribs({ "greyout": inStyle.get() == "Tabs" });

    rebuildHtml();
}

function addTab(title)
{
    const tabEle = document.createElement("div");

    if (inStyle.get() == "Tabs") tabEle.classList.add("sidebar_tab");
    else tabEle.classList.add("sidebar_switch");

    tabEle.id = "tabEle" + tabEles.length;
    tabEle.innerHTML = title;
    tabEle.dataset.index = tabEles.length;
    tabEle.dataset.txt = title;

    tabEle.addEventListener("click", tabClicked);

    switchGroup.appendChild(tabEle);

    tabEles.push(tabEle);

    return tabEle;
}

inInput.onChange = () =>
{
    if (tabEles.length > inInput.get())
        tabClicked({ "target": tabEles[inInput.get()] });
    // setActiveTab(tabEles[inInput.get()]);
};

function setActiveTab(el)
{
    if (el)
    {
        elTabActive = el;
        outIndex.set(parseInt(el.dataset.index));
        outStr.set(el.dataset.txt);

        if (inStyle.get() == "Tabs") el.classList.add("sidebar_tab_active");
        else el.classList.add("sidebar_switch_active");
    }
}

function tabClicked(e)
{
    if (elTabActive)
        if (inStyle.get() == "Tabs") elTabActive.classList.remove("sidebar_tab_active");
        else elTabActive.classList.remove("sidebar_switch_active");
    setActiveTab(e.target);
}

function onParentChanged()
{
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    }
    else
    {
        if (el.parentElement)
            el.parentElement.removeChild(el);
    }
}

function showElement(el)
{
    if (!el) return;
    el.style.display = "block";
}

function hideElement(el)
{
    if (!el) return;
    el.style.display = "none";
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild)
    {
        el.parentNode.removeChild(el);
    }
}

}
};






// **************************************************************
// 
// Ops.Array.StringToArray_v2
// 
// **************************************************************

Ops.Array.StringToArray_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const text = op.inStringEditor("text", "1,2,3"),
    separator = op.inString("separator", ","),
    toNumber = op.inValueBool("Numbers", true),
    trim = op.inValueBool("Trim", true),
    splitNewLines = op.inBool("Split Lines", false),
    arr = op.outArray("array"),
    parsed = op.outTrigger("Parsed"),
    len = op.outNumber("length");

text.setUiAttribs({ "ignoreBigPort": true });

text.onChange = separator.onChange = toNumber.onChange = trim.onChange = parse;

splitNewLines.onChange = () =>
{
    separator.setUiAttribs({ "greyout": splitNewLines.get() });
    parse();
};

parse();

function parse()
{
    if (!text.get())
    {
        arr.set(null);
        arr.set([]);
        len.set(0);
        return;
    }

    let textInput = text.get();
    if (trim.get() && textInput)
    {
        textInput = textInput.replace(/^\s+|\s+$/g, "");
        textInput = textInput.trim();
    }

    let r;
    let sep = separator.get();
    if (separator.get() === "\\n") sep = "\n";
    if (splitNewLines.get()) r = textInput.split("\n");
    else r = textInput.split(sep);

    if (r[r.length - 1] === "") r.length -= 1;

    len.set(r.length);

    if (trim.get())
    {
        for (let i = 0; i < r.length; i++)
        {
            r[i] = r[i].replace(/^\s+|\s+$/g, "");
            r[i] = r[i].trim();
        }
    }

    op.setUiError("notnum", null);
    if (toNumber.get())
    {
        let hasStrings = false;
        for (let i = 0; i < r.length; i++)
        {
            r[i] = Number(r[i]);
            if (!CABLES.isNumeric(r[i]))
            {
                hasStrings = true;
            }
        }
        if (hasStrings)
        {
            op.setUiError("notnum", "Parse Error / Not all values numerical!", 1);
        }
    }

    arr.setRef(r);
    parsed.trigger();
}

}
};






// **************************************************************
// 
// Ops.Boolean.BoolToNumber
// 
// **************************************************************

Ops.Boolean.BoolToNumber= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    bool = op.inValueBool("bool"),
    number = op.outNumber("number");

bool.onChange = function ()
{
    if (bool.get()) number.set(1);
    else number.set(0);
};

}
};






// **************************************************************
// 
// Ops.Boolean.Boolean
// 
// **************************************************************

Ops.Boolean.Boolean= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    v = op.inBool("value", false),
    result = op.outBoolNum("result");

result.set(false);
v.onChange = exec;

function exec()
{
    if (result.get() != v.get()) result.set(v.get());
}

}
};






// **************************************************************
// 
// Ops.Gl.Matrix.CameraInfo
// 
// **************************************************************

Ops.Gl.Matrix.CameraInfo= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    render = op.inTrigger("render"),
    cameraType = op.inSwitch("Camera Type", ["Perspective", "Orthographic"], "Perspective"),
    trigger = op.outTrigger("trigger"),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y"),
    outZ = op.outNumber("Z"),
    outRightX = op.outNumber("Right X"),
    outRightY = op.outNumber("Right Y"),
    outRightZ = op.outNumber("Right Z"),
    outUpX = op.outNumber("Up X"),
    outUpY = op.outNumber("Up Y"),
    outUpZ = op.outNumber("Up Z"),
    outForwardX = op.outNumber("Forward X"),
    outForwardY = op.outNumber("Forward Y"),
    outForwardZ = op.outNumber("Forward Z"),
    outNear = op.outNumber("Near Frustum"),
    outFar = op.outNumber("Far Frustum"),
    outTop = op.outNumber("Bottom Frustum"),
    outBottom = op.outNumber("Top Frustum"),
    outLeft = op.outNumber("Left Frustum"),
    outRight = op.outNumber("Right Frustum"),
    outFov = op.outNumber("FOV"),
    outAspect = op.outNumber("Aspect Ratio");
const
    cgl = op.patch.cgl,
    pos = vec3.create(),
    identVec = vec3.create(),
    iViewMatrix = mat4.create();
render.onTriggered = update;

function update()
{
    mat4.invert(iViewMatrix, cgl.vMatrix);

    outRightX.set(iViewMatrix[0]);
    outRightY.set(iViewMatrix[1]);
    outRightZ.set(iViewMatrix[2]);

    outUpX.set(iViewMatrix[4]);
    outUpY.set(iViewMatrix[5]);
    outUpZ.set(iViewMatrix[6]);

    outForwardX.set(iViewMatrix[8]);
    outForwardY.set(iViewMatrix[9]);
    outForwardZ.set(iViewMatrix[10]);

    outX.set(iViewMatrix[12]);
    outY.set(iViewMatrix[13]);
    outZ.set(iViewMatrix[14]);

    // https://stackoverflow.com/questions/10830293/decompose-projection-matrix44-to-left-right-bottom-top-near-and-far-boundary/10836497#10836497
    const m11 = cgl.pMatrix[4 * 0 + 0];
    const m13 = cgl.pMatrix[4 * 2 + 0];
    const m14 = cgl.pMatrix[4 * 3 + 0];
    const m22 = cgl.pMatrix[4 * 1 + 1];
    const m23 = cgl.pMatrix[4 * 2 + 1];
    const m24 = cgl.pMatrix[4 * 3 + 1];
    const m33 = cgl.pMatrix[4 * 2 + 2];
    const m34 = cgl.pMatrix[4 * 3 + 2];

    // https://stackoverflow.com/questions/46182845/field-of-view-aspect-ratio-view-matrix-from-projection-matrix-hmd-ost-calib
    const FOV = 2 * Math.atan(1 / m22) * 180 / Math.PI;
    const aspectRatio = m22 / m11;

    outFov.set(FOV);
    outAspect.set(aspectRatio);
    if (cameraType.get() === "Perspective")
    {
        const near = m34 / (m33 - 1);
        const far = m34 / (m33 + 1);
        const top = near * (m23 + 1) / m22;
        const bottom = near * (m23 - 1) / m22;
        const left = near * (m13 - 1) / m11;
        const right = near * (m13 + 1) / m11;

        outNear.set(near);
        outFar.set(far);
        outTop.set(top);
        outBottom.set(bottom);
        outLeft.set(left);
        outRight.set(right);
    }
    else if (cameraType.get() === "Orthographic")
    {
        const near = (1 + m34) / m33;
        const far = -(1 - m34) / m33;
        const bottom = near * (m23 - 1) / m22;
        const top = near * (m23 + 1) / m22;
        const left = near * (m13 - 1) / m11;
        const right = near * (m13 + 1) / m11;

        outNear.set(near);
        outFar.set(far);
        outTop.set(top);
        outBottom.set(bottom);
        outLeft.set(left);
        outRight.set(right);
    }

    trigger.trigger();
}

}
};






// **************************************************************
// 
// Ops.Array.ArrayGetString
// 
// **************************************************************

Ops.Array.ArrayGetString= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    array = op.inArray("array"),
    index = op.inValueInt("index"),
    result = op.outString("result");

array.ignoreValueSerialize = true;
op.toWorkPortsNeedToBeLinked(array);

array.onChange =
index.onChange = update;

function update()
{
    const arr = array.get();
    if (arr) result.set(arr[index.get()]);
}

}
};






// **************************************************************
// 
// Ops.Html.Utils.YoutubePlayer
// 
// **************************************************************

Ops.Html.Utils.YoutubePlayer= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    src = op.inString("Video Id", "dQw4w9WgXcQ"),
    active = op.inBool("Active", true),
    inStyle = op.inStringEditor("Style"),
    elId = op.inString("ElementID"),
    paramAutoplay = op.inBool("Autoplay", false),
    paramCC = op.inBool("Display Captions", false),
    paramLoop = op.inBool("Loop", false),
    paramFs = op.inBool("Allow Fullscreen", true),
    paramControls = op.inBool("Hide Controls", false),
    paramStart = op.inInt("Start at Second", 0),

    outEle = op.outObject("Element"),
    outDirectLink = op.outString("Direct Link");
    // outImageMax=op.outString("Thumbnail Max");

const defaultStyle = "position:absolute;\n\
z-index:9;\n\
border:0;\n";

op.setPortGroup("Youtube Options", [paramAutoplay, paramCC, paramLoop, paramFs, paramControls, paramStart]);

// https://developers.google.com/youtube/player_parameters

let element = null;
let initialized = false;

paramStart.onChange =
    paramAutoplay.onChange =
    paramCC.onChange =
    paramLoop.onChange =
    paramFs.onChange =
    paramControls.onChange =
    src.onChange = updateURL;

elId.onChange = updateID;
inStyle.onChange = updateStyle;
op.onDelete = removeEle;

active.onChange = update;

op.init = function ()
{
    initialized = true;
    setTimeout(() => { update(); }, 100);
};

inStyle.set(defaultStyle);

function update()
{
    if (!active.get())
    {
        removeEle();
        return;
    }

    addElement();
}

function addElement()
{
    if (!initialized) return;
    if (element) removeEle();

    const parent = op.patch.cgl.canvas.parentElement;
    element = op.patch.getDocument().createElement("iframe");
    element.dataset.op = op.id;
    element.style.position = "absolute";
    element.allowfullscreen = true;
    element.frameborder = 0;
    element.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";

    parent.appendChild(element);

    updateURL();
    updateID();
    updateStyle();

    outEle.set(null);
    outEle.set(element);
}

function removeEle()
{
    if (element && element.parentNode) element.parentNode.removeChild(element);
    element = null;
    outEle.set(null);
}

function updateURL()
{
    if (src.get()) outDirectLink.set("https://www.youtube.com/watch?v=" + src.get());

    if (!initialized) return;
    if (!active.get()) return;
    const urlParams = [];

    if (paramAutoplay.get()) urlParams.push("autoplay=1");
    if (paramCC.get()) urlParams.push("cc_load_policy=1");
    if (paramLoop.get()) urlParams.push("loop=1");
    if (paramFs.get()) urlParams.push("fs=1");
    if (paramControls.get()) urlParams.push("controls=0");
    if (paramStart.get() > 0) urlParams.push("start=" + paramStart.get());

    let urlParamsStr = "";
    if (urlParams.length > 0) urlParamsStr = "?" + urlParams.join("&") + "&rel=0";

    const urlStr = "https://www.youtube.com/embed/" + src.get() + urlParamsStr;
    if (element)
        element.setAttribute("src", urlStr);
}

function updateID()
{
    if (!active.get()) return;
    if (element) element.setAttribute("id", elId.get());
}

function updateStyle()
{
    if (!active.get()) return;
    if (element) element.style = inStyle.get();
}

}
};






// **************************************************************
// 
// Ops.Extension.GlParticles.Dev.VelocityArea_v3
// 
// **************************************************************

Ops.Extension.GlParticles.Dev.VelocityArea_v3= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"velocityarea_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\nUNI sampler2D texPos;\nUNI sampler2D texAbsVel;\n\n#ifdef HAS_TEX_LIFETIME\n    UNI sampler2D texLifetime;\n#endif\n\nUNI float strength;\nUNI float falloff;\nUNI float size;\nUNI vec3 areaPos;\nUNI vec3 scale;\nUNI vec3 direction;\nUNI vec4 collisionParams;\n\n#ifdef HAS_TEX_TIMING\n    UNI vec3 ageMul; // x age start - y age end - z age fade\n    UNI sampler2D texTiming;\n#endif\n\n{{CGL.RANDOM_LOW}}\n\n\n#ifdef HAS_TEX_MUL\n    UNI sampler2D texMul;\n#endif\n\nfloat MOD_sdSphere( vec3 p, float s )\n{\n    return length(p)-s;\n}\n\nfloat MOD_map(float value,float min1,float max1,float min2,float max2)\n{\n    return max(min2,min(max2,min2 + (value - min1) * (max2 - min2) / (max1 - min1)));\n}\n\nfloat MOD_sdRoundBox( vec3 p, vec3 b, float r )\n{\n    vec3 q = abs(p) - b;\n    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;\n}\n\nvoid main()\n{\n    vec4 pos=texture(texPos,texCoord);\n    vec4 col=texture(tex,texCoord);\n\n    // col.xyz=(normalize(col.xyz)*mul)*fade+col.xyz*(1.0-fade);\n\n    // if(pos.y<2.0)\n    // col.g=1.0;\n    // col.b=1.0;\n\n    // float mul=clamp(abs(length(areaPos-pos.xyz)),0.0,size)/size;\n\n    vec3 p=pos.xyz-areaPos;\n\n    #ifdef MOD_AREA_SPHERE\n        float MOD_de=1.0-MOD_sdSphere(p,size);\n    #endif\n\n    #ifdef MOD_AREA_BOX\n        float MOD_de=1.0-MOD_sdRoundBox(p,scale,0.0);\n    #endif\n    #ifdef MOD_AREA_EVERYWHERE\n        float MOD_de=1.0;\n    #endif\n\n    #ifdef HAS_TEX_TIMING\n        vec4 t=texture(texTiming,texCoord);\n        float age=t.g-t.r;\n\n        MOD_de*=smoothstep(0.0,1.0, MOD_map(age,ageMul.x,ageMul.x+ageMul.z,0.0,1.0));\n        // MOD_de=ageMul.x;\n        // MOD_de=1.0;\n    #endif\n\n    MOD_de=MOD_map(\n        MOD_de,\n        0.0, falloff,\n        0.0,1.0\n        );\n\n    #ifdef INVERT_SHAPE\n        MOD_de=1.0-MOD_de;\n    #endif\n\n    // mul=clamp(mul,0.0,1.0);\n    vec3 finalStrength=vec3(strength);\n\n    #ifdef HAS_TEX_MUL\n        finalStrength*=texture(texMul,texCoord).rgb;\n    #endif\n\n\n    #ifdef METHOD_DIR\n        if(length(direction)>0.0)\n            col.xyz+=normalize(direction)*finalStrength*MOD_de;\n    #endif\n\n    #ifdef METHOD_POINT\n\n        // col.xyz+=normalize( pos.xyz-areaPos )*finalStrength*MOD_de;\n\n        if(MOD_de>0.0)\n            col.xyz+=normalize( pos.xyz-areaPos )*finalStrength*MOD_de;\n    #endif\n\n\n    #ifdef METHOD_COLLISION\n\n        if(MOD_de>0.0)\n        {\n\n            // collisionParams\n            // x: bouncyness\n            // y: dir randomness\n            // z: forceoutwards\n            // w: tbd\n\n            float lifeProgress=1.0;\n            #ifdef HAS_TEX_LIFETIME\n                lifeProgress=texture(texLifetime,texCoord).r;\n            #endif\n\n            float bouncyness=collisionParams.x*cgl_random(texCoord*13.0+MOD_de)*collisionParams.x;\n\n            bouncyness*=lifeProgress;\n\n            float outwardForce=collisionParams.z;\n\n            vec4 oldVel=texture(texAbsVel,texCoord);\n            // vec3 oppositeDir=oldVel.xyz*-vec3(1.0+(MOD_de*2.0));\n            vec3 oppositeDir=oldVel.xyz*-1.0;\n\n            vec3 r=normalize((vec3( cgl_random(texCoord),cgl_random(texCoord*200.0),cgl_random(texCoord*10.0) )-0.5)*2.0)*collisionParams.y;\n\n\n            if(MOD_de>0.5)\n            {\n                if(MOD_de>0.9)\n                {\n\n                }\n                col.xyz+=10000.0;\n                col.a=0.0;\n\n                // #ifdef INVERT_SHAPE\n                //     outwardForce=-MOD_de;\n                // #endif\n\n                // col.xyz+=((oppositeDir*(bouncyness) + (pos.xyz-areaPos) * outwardForce)) * finalStrength;\n            }\n            else\n            col.xyz+=((oppositeDir*(bouncyness) + (pos.xyz-areaPos) * outwardForce)+r) * finalStrength;\n        }\n        // col.xyz+=(( pos.xyz-areaPos )*MOD_de)*finalStrength; // simples collision\n    #endif\n\n\n    outColor=col;\n}\n\n\n\n//",};
const
    render = op.inTrigger("Render"),
    inArea = op.inValueSelect("Area", ["Everywhere", "Sphere", "Box"], "Everywhere"),
    inInvArea = op.inBool("Invert Area", false),
    inMethod = op.inValueSelect("Method", ["Point", "Direction", "Collision"], "Direction"),
    inStrength = op.inFloat("Strength", 1),
    inMul = op.inFloat("Size", 1),
    inFalloff = op.inFloat("Falloff", 0.3),
    inBounciness = op.inFloat("Boncyness", 1),
    inRandomDir = op.inFloat("Dir Randomness", 1),
    inForceOutwards = op.inFloat("inForceOutwards", 1),
    x = op.inValue("x"),
    y = op.inValue("y"),
    z = op.inValue("z"),
    dir_x = op.inValue("Velocity X", 0),
    dir_y = op.inValue("Velocity Y", 1),
    dir_z = op.inValue("Velocity Z", 0),
    scale_x = op.inValue("Size X", 1),
    scale_y = op.inValue("Size Y", 1),
    scale_z = op.inValue("Size Z", 1),
    inPositions = op.inTexture("Positions"),
    inAbsVel = op.inTexture("Absolute Velocity"),
    inLifetime = op.inTexture("Lifetime"),
    inTexMultiply = op.inTexture("Multiply"),

    inTimeAge = op.inTexture("Timing Internal"),
    inTimeStart = op.inFloat("Age Start", 0.0),
    inTimeEnd = op.inFloat("Age End", 1000.0),
    inTimeFade = op.inFloat("Age Fade Duration", 0.2),
    inVisualize = op.inTrigger("Draw Visual Helper"),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name);
op.setPortGroup("Collision", [inBounciness, inRandomDir, inForceOutwards]);
op.setPortGroup("Position", [x, y, z]);
op.setPortGroup("Age Activation", [inTimeEnd, inTimeFade, inTimeStart, inTimeAge]);
op.toWorkPortsNeedToBeLinked(inPositions);
shader.setSource(shader.getDefaultVertexShader(), attachments.velocityarea_frag);

inTimeAge.onLinkChanged =
    inLifetime.onLinkChanged =
    inAbsVel.onLinkChanged =
    inTexMultiply.onLinkChanged =
    inInvArea.onChange =
    inMethod.onChange =
    inArea.onChange = updateDefines;

updateDefines();

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    texposuni = new CGL.Uniform(shader, "t", "texPos", 1),
    texMuluni = new CGL.Uniform(shader, "t", "texMul", 2),
    texAbsVel = new CGL.Uniform(shader, "t", "texAbsVel", 3),
    texLifetime = new CGL.Uniform(shader, "t", "texLifetime", 4),
    texTiming = new CGL.Uniform(shader, "t", "texTiming", 5),

    uniformMorph = new CGL.Uniform(shader, "f", "strength", inStrength),
    uniform2 = new CGL.Uniform(shader, "f", "falloff", inFalloff),
    uniAreaPos = new CGL.Uniform(shader, "3f", "areaPos", x, y, z),
    uniScale = new CGL.Uniform(shader, "3f", "scale", scale_x, scale_y, scale_z),
    uniDir = new CGL.Uniform(shader, "3f", "direction", dir_x, dir_y, dir_z),
    uniAgeMul = new CGL.Uniform(shader, "3f", "ageMul", inTimeStart, inTimeEnd, inTimeFade),
    uniCollisionParams = new CGL.Uniform(shader, "4f", "collisionParams", inBounciness, inRandomDir, inForceOutwards, inForceOutwards),

    uniformMul = new CGL.Uniform(shader, "f", "size", inMul);

function drawHelpers()
{
    if (op.isCurrentUiOp())
        gui.setTransformGizmo({ "posX": x, "posY": y, "posZ": z });

    cgl.pushModelMatrix();

    mat4.translate(cgl.mMatrix, cgl.mMatrix, [x.get(), y.get(), z.get()]);

    if (cgl.shouldDrawHelpers(op))
    {
        if (inArea.get() == "Box")
            CABLES.GL_MARKER.drawCube(op,
                scale_x.get() + inFalloff.get() / 2,
                scale_y.get() + inFalloff.get() / 2,
                scale_z.get() + inFalloff.get() / 2);
        else if (inArea.get() == "Sphere")
            CABLES.GL_MARKER.drawSphere(op, inMul.get() + inFalloff.get());
    }
    cgl.popModelMatrix();
}

function updateDefines()
{
    inMul.setUiAttribs({ "greyout": inArea.get() != "Sphere" });
    x.setUiAttribs({ "greyout": inArea.get() == "Everywhere" });
    y.setUiAttribs({ "greyout": inArea.get() == "Everywhere" });
    z.setUiAttribs({ "greyout": inArea.get() == "Everywhere" });

    inTimeStart.setUiAttribs({ "greyout": !inTimeAge.isLinked() });
    inTimeEnd.setUiAttribs({ "greyout": !inTimeAge.isLinked() });
    inTimeFade.setUiAttribs({ "greyout": !inTimeAge.isLinked() });

    inFalloff.setUiAttribs({ "greyout": inArea.get() == "Everywhere" });

    shader.toggleDefine("MOD_AREA_SPHERE", inArea.get() == "Sphere");
    shader.toggleDefine("MOD_AREA_BOX", inArea.get() == "Box");
    shader.toggleDefine("MOD_AREA_EVERYWHERE", inArea.get() == "Everywhere");

    shader.toggleDefine("METHOD_POINT", inMethod.get() == "Point");
    shader.toggleDefine("METHOD_DIR", inMethod.get() == "Direction");
    shader.toggleDefine("METHOD_COLLISION", inMethod.get() == "Collision");

    shader.toggleDefine("HAS_TEX_TIMING", inTimeAge.isLinked());
    shader.toggleDefine("HAS_TEX_LIFETIME", inLifetime.isLinked());
    shader.toggleDefine("HAS_TEX_MUL", inTexMultiply.isLinked());

    shader.toggleDefine("INVERT_SHAPE", inInvArea.get());

    scale_x.setUiAttribs({ "greyout": inArea.get() != "Box" });
    scale_y.setUiAttribs({ "greyout": inArea.get() != "Box" });
    scale_z.setUiAttribs({ "greyout": inArea.get() != "Box" });

    dir_x.setUiAttribs({ "greyout": inMethod.get() != "Direction" });
    dir_y.setUiAttribs({ "greyout": inMethod.get() != "Direction" });
    dir_z.setUiAttribs({ "greyout": inMethod.get() != "Direction" });

    inBounciness.setUiAttribs({ "greyout": inMethod.get() != "Collision" });
    inRandomDir.setUiAttribs({ "greyout": inMethod.get() != "Collision" });
    inForceOutwards.setUiAttribs({ "greyout": inMethod.get() != "Collision" });

    if (!inAbsVel.isLinked() && inMethod.get() == "Collision")op.setUiError("absvelneeded", "need to connect abs velocity");
    else op.setUiError("absvelneeded", null);
}

inVisualize.onTriggered = function ()
{
    drawHelpers();
};

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;
    if (!inPositions.get()) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    cgl.setTexture(1, inPositions.get().tex);
    if (inTexMultiply.get()) cgl.setTexture(2, inTexMultiply.get().tex);
    if (inAbsVel.get()) cgl.setTexture(3, inAbsVel.get().tex);
    if (inLifetime.get()) cgl.setTexture(4, inLifetime.get().tex);
    if (inTimeAge.get()) cgl.setTexture(5, inTimeAge.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.Math.RgbTransform
// 
// **************************************************************

Ops.Gl.ImageCompose.Math.RgbTransform= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"rgbmul_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\n#ifdef MOD_MASK\n    UNI sampler2D texMask;\n#endif\n\nUNI vec3 translate;\nUNI vec3 scale;\nUNI vec3 rot;\n\n\n\nmat4 rotationMatrix(vec3 axis, float angle)\n{\n    axis = normalize(axis);\n    float s = sin(angle);\n    float c = cos(angle);\n    float oc = 1.0 - c;\n\n    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,\n                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,\n                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,\n                0.0,                                0.0,                                0.0,                                1.0);\n}\n\n\nvoid main()\n{\n    vec4 col=texture(tex,texCoord);\n\n    float mul=1.0;\n\n\n    #ifdef MOD_MASK\n        mul=texture(texMask,texCoord).r;\n    #endif\n\n    #ifdef DO_ROT\n        col*=rotationMatrix(vec3(1.0,0.0,0.0), mul*rot.x/57.29577951308232);\n        col*=rotationMatrix(vec3(0.0,1.0,0.0), mul*rot.y/57.29577951308232);\n        col*=rotationMatrix(vec3(0.0,0.0,1.0), mul*rot.z/57.29577951308232);\n    #endif\n\n    #ifdef DO_SCALE\n        col.xyz*=scale*mul;\n    #endif\n\n    #ifdef DO_TRANS\n        col.xyz+=translate*mul;\n    #endif\n\n    outColor=col;\n}\n",};
const
    render = op.inTrigger("Render"),

    inDoTrans = op.inBool("Translate", true),
    posx = op.inValue("Pos X", 0),
    posy = op.inValue("Pos Y", 0),
    posz = op.inValue("Pos Z", 0),

    inDoScale = op.inBool("Scale", true),
    scalex = op.inValue("Scale X", 1),
    scaley = op.inValue("Scale Y", 1),
    scalez = op.inValue("Scale Z", 1),

    inDoRot = op.inBool("Rotate", true),
    rotx = op.inValue("Rotation X", 1),
    roty = op.inValue("Rotation Y", 1),
    rotz = op.inValue("Rotation Z", 1),

    inTexMask = op.inTexture("Mask"),
    trigger = op.outTrigger("trigger");

op.setPortGroup("Rotation", [inDoRot, rotx, roty, rotz]);
op.setPortGroup("Position", [inDoTrans, posx, posy, posz]);
op.setPortGroup("Scale", [inDoScale, scalex, scaley, scalez]);
op.setUiAxisPorts(posx, posz, posy);

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.rgbmul_frag);
const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    textureMaskUniform = new CGL.Uniform(shader, "t", "texMask", 1),
    uniformTransl = new CGL.Uniform(shader, "3f", "translate", posx, posy, posz),
    uniformScale = new CGL.Uniform(shader, "3f", "scale", scalex, scaley, scalez),
    uniformRot = new CGL.Uniform(shader, "3f", "rot", rotx, roty, rotz);

inTexMask.onChange =
    inDoTrans.onChange =
    inDoRot.onChange =
    inDoScale.onChange = updateDefines;

updateDefines();

function updateDefines()
{
    shader.toggleDefine("MOD_MASK", inTexMask.get());

    shader.toggleDefine("DO_TRANS", inDoTrans.get());
    shader.toggleDefine("DO_ROT", inDoRot.get());
    shader.toggleDefine("DO_SCALE", inDoScale.get());

    posx.setUiAttribs({ "greyout": !inDoTrans.get() });
    posy.setUiAttribs({ "greyout": !inDoTrans.get() });
    posz.setUiAttribs({ "greyout": !inDoTrans.get() });

    rotx.setUiAttribs({ "greyout": !inDoRot.get() });
    roty.setUiAttribs({ "greyout": !inDoRot.get() });
    rotz.setUiAttribs({ "greyout": !inDoRot.get() });

    scalex.setUiAttribs({ "greyout": !inDoScale.get() });
    scaley.setUiAttribs({ "greyout": !inDoScale.get() });
    scalez.setUiAttribs({ "greyout": !inDoScale.get() });
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    if (inTexMask.get())cgl.setTexture(1, inTexMask.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Extension.GlParticles.Dev.NoiseVectorField
// 
// **************************************************************

Ops.Extension.GlParticles.Dev.NoiseVectorField= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"noisefield_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\nUNI sampler2D texPos;\nUNI float falloff;\nUNI float size;\nUNI vec3 areaPos;\nUNI vec3 scale;\nUNI vec3 direction;\nUNI vec3 noisePos;\nUNI vec3 noiseMul;\n\nUNI float noiseStrength;\nUNI vec4 noise;\n\nfloat MOD_sdSphere( vec3 p, float s )\n{\n    return length(p)-s;\n}\n\nfloat MOD_map(float value,float min1,float max1,float min2,float max2)\n{\n    return max(min2,min(max2,min2 + (value - min1) * (max2 - min2) / (max1 - min1)));\n}\n\nfloat MOD_sdRoundBox( vec3 p, vec3 b, float r )\n{\n  vec3 q = abs(p) - b;\n  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;\n}\n\nvoid main()\n{\n    vec4 pos=texture(texPos,texCoord);\n    vec4 col=texture(tex,texCoord);\n    vec3 p=pos.xyz-areaPos;\n\n    #ifdef MOD_AREA_SPHERE\n        float MOD_de=MOD_sdSphere(p,size);\n    #endif\n\n    #ifdef MOD_AREA_BOX\n        float MOD_de=MOD_sdRoundBox(p,scale,0.0);\n    #endif\n    #ifdef MOD_AREA_EVERYWHERE\n        float MOD_de=0.0;\n    #endif\n\n    MOD_de=1.0-MOD_map(\n        MOD_de,\n        0.0, falloff,\n        0.0,1.0\n        );\n\n    #ifdef INVERT\n        MOD_de=1.0-MOD_de;\n    #endif\n\n\n    // vec4 noise\n    // x: strngth\n    // y: scale\n\n    float noiseStrength=noise.x;\n    float noiseScale=noise.y/10.0;\n    col.xyz+=\n        noiseStrength*\n        MOD_de*\n        vec3(\n            Perlin3D( ( (pos.xyz+20.0) + noisePos.xyz) *noiseScale )*noiseMul.x,\n            Perlin3D( ( (pos.xyz-20.0) + noisePos.xyz) *noiseScale )*noiseMul.y,\n            Perlin3D( ( (pos.xyz+60.0) + noisePos.xyz) *noiseScale )*noiseMul.z\n        );\n\n// col.xyz=noise.rgb;\n\n    outColor=col;\n}\n\n\n\n//","perlin_frag":"\nfloat Interpolation_C2( float x ) { return x * x * x * (x * (x * 6.0 - 15.0) + 10.0); }   //  6x^5-15x^4+10x^3\t( Quintic Curve.  As used by Perlin in Improved Noise.  http://mrl.nyu.edu/~perlin/paper445.pdf )\nvec2 Interpolation_C2( vec2 x ) { return x * x * x * (x * (x * 6.0 - 15.0) + 10.0); }\nvec3 Interpolation_C2( vec3 x ) { return x * x * x * (x * (x * 6.0 - 15.0) + 10.0); }\nvec4 Interpolation_C2( vec4 x ) { return x * x * x * (x * (x * 6.0 - 15.0) + 10.0); }\nvec4 Interpolation_C2_InterpAndDeriv( vec2 x ) { return x.xyxy * x.xyxy * ( x.xyxy * ( x.xyxy * ( x.xyxy * vec2( 6.0, 0.0 ).xxyy + vec2( -15.0, 30.0 ).xxyy ) + vec2( 10.0, -60.0 ).xxyy ) + vec2( 0.0, 30.0 ).xxyy ); }\nvec3 Interpolation_C2_Deriv( vec3 x ) { return x * x * (x * (x * 30.0 - 60.0) + 30.0); }\n\n\nvoid FAST32_hash_3D( \tvec3 gridcell,\n                        out vec4 lowz_hash_0,\n                        out vec4 lowz_hash_1,\n                        out vec4 lowz_hash_2,\n                        out vec4 highz_hash_0,\n                        out vec4 highz_hash_1,\n                        out vec4 highz_hash_2\t)\t\t//\tgenerates 3 random numbers for each of the 8 cell corners\n{\n    //    gridcell is assumed to be an integer coordinate\n\n    //\tTODO: \tthese constants need tweaked to find the best possible noise.\n    //\t\t\tprobably requires some kind of brute force computational searching or something....\n    const vec2 OFFSET = vec2( 50.0, 161.0 );\n    const float DOMAIN = 69.0;\n    const vec3 SOMELARGEFLOATS = vec3( 635.298681, 682.357502, 668.926525 );\n    const vec3 ZINC = vec3( 48.500388, 65.294118, 63.934599 );\n\n    //\ttruncate the domain\n    gridcell.xyz = gridcell.xyz - floor(gridcell.xyz * ( 1.0 / DOMAIN )) * DOMAIN;\n    vec3 gridcell_inc1 = step( gridcell, vec3( DOMAIN - 1.5 ) ) * ( gridcell + 1.0 );\n\n    //\tcalculate the noise\n    vec4 P = vec4( gridcell.xy, gridcell_inc1.xy ) + OFFSET.xyxy;\n    P *= P;\n    P = P.xzxz * P.yyww;\n    vec3 lowz_mod = vec3( 1.0 / ( SOMELARGEFLOATS.xyz + gridcell.zzz * ZINC.xyz ) );\n    vec3 highz_mod = vec3( 1.0 / ( SOMELARGEFLOATS.xyz + gridcell_inc1.zzz * ZINC.xyz ) );\n    lowz_hash_0 = fract( P * lowz_mod.xxxx );\n    highz_hash_0 = fract( P * highz_mod.xxxx );\n    lowz_hash_1 = fract( P * lowz_mod.yyyy );\n    highz_hash_1 = fract( P * highz_mod.yyyy );\n    lowz_hash_2 = fract( P * lowz_mod.zzzz );\n    highz_hash_2 = fract( P * highz_mod.zzzz );\n}\n\n//\n//\tPerlin Noise 3D  ( gradient noise )\n//\tReturn value range of -1.0->1.0\n//\thttp://briansharpe.files.wordpress.com/2011/11/perlinsample.jpg\n//\nfloat Perlin3D( vec3 P )\n{\n    //\testablish our grid cell and unit position\n    vec3 Pi = floor(P);\n    vec3 Pf = P - Pi;\n    vec3 Pf_min1 = Pf - 1.0;\n\n#if 1\n    //\n    //\tclassic noise.\n    //\trequires 3 random values per point.  with an efficent hash function will run faster than improved noise\n    //\n\n    //\tcalculate the hash.\n    //\t( various hashing methods listed in order of speed )\n    vec4 hashx0, hashy0, hashz0, hashx1, hashy1, hashz1;\n    FAST32_hash_3D( Pi, hashx0, hashy0, hashz0, hashx1, hashy1, hashz1 );\n    //SGPP_hash_3D( Pi, hashx0, hashy0, hashz0, hashx1, hashy1, hashz1 );\n\n    //\tcalculate the gradients\n    vec4 grad_x0 = hashx0 - 0.49999;\n    vec4 grad_y0 = hashy0 - 0.49999;\n    vec4 grad_z0 = hashz0 - 0.49999;\n    vec4 grad_x1 = hashx1 - 0.49999;\n    vec4 grad_y1 = hashy1 - 0.49999;\n    vec4 grad_z1 = hashz1 - 0.49999;\n    vec4 grad_results_0 = inversesqrt( grad_x0 * grad_x0 + grad_y0 * grad_y0 + grad_z0 * grad_z0 ) * ( vec2( Pf.x, Pf_min1.x ).xyxy * grad_x0 + vec2( Pf.y, Pf_min1.y ).xxyy * grad_y0 + Pf.zzzz * grad_z0 );\n    vec4 grad_results_1 = inversesqrt( grad_x1 * grad_x1 + grad_y1 * grad_y1 + grad_z1 * grad_z1 ) * ( vec2( Pf.x, Pf_min1.x ).xyxy * grad_x1 + vec2( Pf.y, Pf_min1.y ).xxyy * grad_y1 + Pf_min1.zzzz * grad_z1 );\n\n#if 1\n    //\tClassic Perlin Interpolation\n    vec3 blend = Interpolation_C2( Pf );\n    vec4 res0 = mix( grad_results_0, grad_results_1, blend.z );\n    vec4 blend2 = vec4( blend.xy, vec2( 1.0 - blend.xy ) );\n    float final = dot( res0, blend2.zxzx * blend2.wwyy );\n    final *= 1.1547005383792515290182975610039;\t\t//\t(optionally) scale things to a strict -1.0->1.0 range    *= 1.0/sqrt(0.75)\n    return final;\n#else\n    //\tClassic Perlin Surflet\n    //\thttp://briansharpe.wordpress.com/2012/03/09/modifications-to-classic-perlin-noise/\n    Pf *= Pf;\n    Pf_min1 *= Pf_min1;\n    vec4 vecs_len_sq = vec4( Pf.x, Pf_min1.x, Pf.x, Pf_min1.x ) + vec4( Pf.yy, Pf_min1.yy );\n    float final = dot( Falloff_Xsq_C2( min( vec4( 1.0 ), vecs_len_sq + Pf.zzzz ) ), grad_results_0 ) + dot( Falloff_Xsq_C2( min( vec4( 1.0 ), vecs_len_sq + Pf_min1.zzzz ) ), grad_results_1 );\n    final *= 2.3703703703703703703703703703704;\t\t//\t(optionally) scale things to a strict -1.0->1.0 range    *= 1.0/cube(0.75)\n    return final;\n#endif\n\n#else\n    //\n    //\timproved noise.\n    //\trequires 1 random value per point.  Will run faster than classic noise if a slow hashing function is used\n    //\n\n    //\tcalculate the hash.\n    //\t( various hashing methods listed in order of speed )\n    vec4 hash_lowz, hash_highz;\n    FAST32_hash_3D( Pi, hash_lowz, hash_highz );\n    //BBS_hash_3D( Pi, hash_lowz, hash_highz );\n    //SGPP_hash_3D( Pi, hash_lowz, hash_highz );\n\n    //\n    //\t\"improved\" noise using 8 corner gradients.  Faster than the 12 mid-edge point method.\n    //\tKen mentions using diagonals like this can cause \"clumping\", but we'll live with that.\n    //\t[1,1,1]  [-1,1,1]  [1,-1,1]  [-1,-1,1]\n    //\t[1,1,-1] [-1,1,-1] [1,-1,-1] [-1,-1,-1]\n    //\n    hash_lowz -= 0.5;\n    vec4 grad_results_0_0 = vec2( Pf.x, Pf_min1.x ).xyxy * sign( hash_lowz );\n    hash_lowz = abs( hash_lowz ) - 0.25;\n    vec4 grad_results_0_1 = vec2( Pf.y, Pf_min1.y ).xxyy * sign( hash_lowz );\n    vec4 grad_results_0_2 = Pf.zzzz * sign( abs( hash_lowz ) - 0.125 );\n    vec4 grad_results_0 = grad_results_0_0 + grad_results_0_1 + grad_results_0_2;\n\n    hash_highz -= 0.5;\n    vec4 grad_results_1_0 = vec2( Pf.x, Pf_min1.x ).xyxy * sign( hash_highz );\n    hash_highz = abs( hash_highz ) - 0.25;\n    vec4 grad_results_1_1 = vec2( Pf.y, Pf_min1.y ).xxyy * sign( hash_highz );\n    vec4 grad_results_1_2 = Pf_min1.zzzz * sign( abs( hash_highz ) - 0.125 );\n    vec4 grad_results_1 = grad_results_1_0 + grad_results_1_1 + grad_results_1_2;\n\n    //\tblend the gradients and return\n    vec3 blend = Interpolation_C2( Pf );\n    vec4 res0 = mix( grad_results_0, grad_results_1, blend.z );\n    vec4 blend2 = vec4( blend.xy, vec2( 1.0 - blend.xy ) );\n    return dot( res0, blend2.zxzx * blend2.wwyy ) * (2.0 / 3.0);\t//\t(optionally) mult by (2.0/3.0) to scale to a strict -1.0->1.0 range\n#endif\n}",};
const
    render = op.inTrigger("Render"),
    inArea = op.inValueSelect("Area", ["Everywhere", "Sphere", "Box"], "Sphere"),
    inInvertArea = op.inBool("Invert Area", false),

    noiseStr = op.inFloatSlider("Strength", 1),
    noiseScale = op.inFloat("Scale", 1),

    inMul = op.inFloat("Size", 11),
    inFalloff = op.inFloat("Falloff", 1),
    x = op.inValue("x"),
    y = op.inValue("y"),
    z = op.inValue("z"),

    noisex = op.inValue("Noise X"),
    noisey = op.inValue("Noise Y"),
    noisez = op.inValue("Noise Z"),

    mul_x = op.inValue("Multiply X", 1),
    mul_y = op.inValue("Multiply Y", 1),
    mul_z = op.inValue("Multiply Z", 1),

    scale_x = op.inValue("Size X", 1),
    scale_y = op.inValue("Size Y", 1),
    scale_z = op.inValue("Size Z", 1),

    inPositions = op.inTexture("Positions"),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name);
op.setPortGroup("Position", [x, y, z]);
op.setPortGroup("Size", [scale_x, scale_y, scale_z]);
op.toWorkPortsNeedToBeLinked(inPositions);
shader.setSource(shader.getDefaultVertexShader(), attachments.perlin_frag + attachments.noisefield_frag);

inInvertArea.onChange =
    inArea.onChange = updateDefines;
updateDefines();

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    texposuni = new CGL.Uniform(shader, "t", "texPos", 1),
    uniform2 = new CGL.Uniform(shader, "f", "falloff", inFalloff),
    uniAreaPos = new CGL.Uniform(shader, "3f", "areaPos", x, y, z),
    uniNoisePos = new CGL.Uniform(shader, "3f", "noisePos", noisex, noisey, noisez),
    uniNoiseMul = new CGL.Uniform(shader, "3f", "noiseMul", mul_x, mul_y, mul_z),

    uniScale = new CGL.Uniform(shader, "3f", "scale", scale_x, scale_y, scale_z),
    uniNoise = new CGL.Uniform(shader, "4f", "noise", noiseStr, noiseScale, noiseScale, noiseScale),

    uniformMul = new CGL.Uniform(shader, "f", "size", inMul);

function drawHelpers()
{
    const effect = cgl.currentTextureEffect;
    effect.endEffect();

    gui.setTransformGizmo({ "posX": x, "posY": y, "posZ": z });

    cgl.pushModelMatrix();

    mat4.translate(cgl.mMatrix, cgl.mMatrix, [x.get(), y.get(), z.get()]);

    if (inArea.get() == "Box")
        CABLES.GL_MARKER.drawCube(op,
            inMul.get() * scale_x.get() + inFalloff.get(),
            inMul.get() * scale_y.get() + inFalloff.get(),
            inMul.get() * scale_z.get() + inFalloff.get());
    else if (inArea.get() == "Sphere")
        CABLES.GL_MARKER.drawCube(op,
            inMul.get() + inFalloff.get(),
            inMul.get() + inFalloff.get(),
            inMul.get() + inFalloff.get());

    cgl.popModelMatrix();

    effect.continueEffect();
}

function updateDefines()
{
    shader.toggleDefine("MOD_AREA_AXIS_X", inArea.get() == "Axis X");
    shader.toggleDefine("MOD_AREA_AXIS_Y", inArea.get() == "Axis Y");
    shader.toggleDefine("MOD_AREA_AXIS_Z", inArea.get() == "Axis Z");
    shader.toggleDefine("MOD_AREA_SPHERE", inArea.get() == "Sphere");
    shader.toggleDefine("MOD_AREA_BOX", inArea.get() == "Box");
    shader.toggleDefine("MOD_AREA_EVERYWHERE", inArea.get() == "Everywhere");
    shader.toggleDefine("MOD_AREA_TRIPRISM", inArea.get() == "Tri Prism");
    shader.toggleDefine("MOD_AREA_HEXPRISM", inArea.get() == "Hex Prism");

    shader.toggleDefine("INVERT", inInvertArea.get());

    scale_x.setUiAttribs({ "greyout": inArea.get() != "Box" });
    scale_y.setUiAttribs({ "greyout": inArea.get() != "Box" });
    scale_z.setUiAttribs({ "greyout": inArea.get() != "Box" });
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;
    if (!inPositions.get()) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    cgl.setTexture(1, inPositions.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    if (cgl.shouldDrawHelpers(op))drawHelpers();
    if (op.isCurrentUiOp())
        gui.setTransformGizmo(
            {
                "posX": x,
                "posY": y,
                "posZ": z,
            });

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Gl.Meshes.FloorGrid
// 
// **************************************************************

Ops.Gl.Meshes.FloorGrid= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"grid_frag":"IN vec4 posColor;\nIN vec3 posFrag;\n\nvoid main()\n{\n    outColor=posColor;\n    outColor.a*=clamp(1.0-(length(posFrag)/30.0),0.0,1.0);\n}","grid_vert":"IN vec3 vPosition;\nIN vec3 attrVertNormal;\nIN vec2 attrTexCoord;\n\nUNI mat4 projMatrix;\nUNI mat4 modelMatrix;\nUNI mat4 viewMatrix;\n\nOUT vec4 posColor;\nOUT vec3 posFrag;\n\nvoid main()\n{\n    vec4 pos = vec4( vPosition, 1. );\n    mat4 mMatrix=modelMatrix;\n\n    mat4 mvMatrix=viewMatrix*mMatrix;\n    posFrag=vPosition;\n    posColor=vec4(0.6,0.6,0.6,0.4);\n\n    if(pos.x==0.0) posColor=vec4(0.3,0.3,1.0,1.0);\n    else if(pos.y==0.0 && pos.z==0.0) posColor=vec4(1.0,0.3,0.3,1.0);\n    else if(mod(pos.z,10.0)==0.0 && mod(pos.x,10.0)==0.0 ) posColor.a=1.0;\n\n    if(pos.y>0.0 && pos.x==0.0) posColor=vec4(0.3,1.0,0.3,1.0);\n\n    gl_Position = projMatrix * mvMatrix * pos;\n}\n",};
const
    render = op.inTrigger("Render"),
    inDraw = op.inBool("Active", true),
    next = op.outTrigger("Next");

const num = 100;

const cgl = op.patch.cgl;
let mesh = null;

const shader = new CGL.Shader(cgl, "gridMaterial", this);
shader.setSource(attachments.grid_vert, attachments.grid_frag);

inDraw.onChange = () => { op.setUiAttrib({ "extendTitle": inDraw.get() ? "" : "x" }); };

function init()
{
    let geomVertical = new CGL.Geometry(op.name);

    const space = 1.0;
    let l = space * num / 2;

    let tc = [];

    for (var i = -num / 2; i < num / 2 + 1; i++)
    {
        geomVertical.vertices.push(-l);
        geomVertical.vertices.push(0);
        geomVertical.vertices.push(i * space);

        geomVertical.vertices.push(l);
        geomVertical.vertices.push(0);
        geomVertical.vertices.push(i * space);

        geomVertical.vertices.push(i * space);
        geomVertical.vertices.push(0);
        geomVertical.vertices.push(-l);

        geomVertical.vertices.push(i * space);
        geomVertical.vertices.push(0);
        geomVertical.vertices.push(l);

        if (i == 0)
        {
            tc.push(0, 1);
            tc.push(0, 1);
            tc.push(0, 0.5);
            tc.push(0, 0.5);
        }
        else
        {
            tc.push(0, 0);
            tc.push(0, 0);
            tc.push(0, 0);
            tc.push(0, 0);
        }
    }

    geomVertical.vertices.push(0);
    geomVertical.vertices.push(0.001);
    geomVertical.vertices.push(0);

    geomVertical.vertices.push(0);
    geomVertical.vertices.push(10);
    geomVertical.vertices.push(0);

    tc.push(0, 0, 0, 0);

    for (var i = 0; i <= 10; i++)
    {
        geomVertical.vertices.push(-0.25);
        geomVertical.vertices.push(i);
        geomVertical.vertices.push(0);

        geomVertical.vertices.push(0.25);
        geomVertical.vertices.push(i);
        geomVertical.vertices.push(0);

        tc.push(0, 0, 0, 0);
    }

    geomVertical.setTexCoords(tc);
    geomVertical.calculateNormals();

    if (!mesh) mesh = new CGL.Mesh(cgl, geomVertical);
    else mesh.setGeom(geomVertical);
}

render.onTriggered = function ()
{
    if (!mesh)init();

    if (cgl.tempData.shadowPass) return next.trigger();

    cgl.pushShader(shader);
    if (!shader) return;

    let oldPrim = shader.glPrimitive;

    shader.glPrimitive = cgl.gl.LINES;

    if (inDraw.get()) mesh.render(shader);
    cgl.popShader();

    shader.glPrimitive = oldPrim;

    next.trigger();
};

}
};






// **************************************************************
// 
// Ops.Gl.Meshes.Grid
// 
// **************************************************************

Ops.Gl.Meshes.Grid= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    render = op.inTrigger("Render"),
    inNum = op.inInt("Num", 10),
    inSpacing = op.inValue("Spacing", 1),
    inCenter = op.inBool("Center", true),
    axis = op.inSwitch("Axis", ["XY", "XZ"], "XY"),
    next = op.outTrigger("Next");

const cgl = op.patch.cgl;
let mesh = null;

axis.onChange =
    inCenter.onChange =
    inNum.onChange =
    inSpacing.onChange = function ()
    {
        if (mesh)mesh.dispose();
        mesh = null;
    };

function init()
{
    const geomStepsOne = new CGL.Geometry(op.name);
    const geomX = new CGL.Geometry(op.name);

    const space = inSpacing.get();
    const num = Math.floor(inNum.get());
    const l = space * num / 2;

    const tc = [];

    let start = -num / 2;
    let end = num / 2 + 1;

    if (axis.get() == "XY")
        for (let i = start; i < end; i++)
        {
            geomStepsOne.vertices.push(-l, i * space, 0);
            geomStepsOne.vertices.push(l, i * space, 0);
            geomStepsOne.vertices.push(i * space, -l, 0);
            geomStepsOne.vertices.push(i * space, l, 0);

            tc.push(0, 0, 0, 0, 0, 0, 0, 0);
        }
    else
        for (let i = start; i < end; i++)
        {
            geomStepsOne.vertices.push(-l, 0, i * space);
            geomStepsOne.vertices.push(l, 0, i * space);
            geomStepsOne.vertices.push(i * space, 0, -l);
            geomStepsOne.vertices.push(i * space, 0, l);

            tc.push(0, 0, 0, 0, 0, 0, 0, 0);
        }

    if (!inCenter.get())
    {
        for (let i = 0; i < geomStepsOne.vertices.length; i += 3)
        {
            geomStepsOne.vertices[i + 0] += l;
            geomStepsOne.vertices[i + 1] += l;
        }
    }

    geomStepsOne.setTexCoords(tc);
    geomStepsOne.calculateNormals();

    if (!mesh) mesh = new CGL.Mesh(cgl, geomStepsOne);
    else mesh.setGeom(geomStepsOne);
}

render.onTriggered = function ()
{
    if (!mesh)init();
    let shader = cgl.getShader();
    if (!shader) return;

    let oldPrim = shader.glPrimitive;

    shader.glPrimitive = cgl.gl.LINES;

    mesh.render(shader);

    shader.glPrimitive = oldPrim;

    next.trigger();
};

}
};






// **************************************************************
// 
// Ops.Graphics.Meshes.Rectangle_v4
// 
// **************************************************************

Ops.Graphics.Meshes.Rectangle_v4= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    render = op.inTrigger("render"),
    doRender = op.inValueBool("Render Mesh", true),
    width = op.inValue("width", 1),
    height = op.inValue("height", 1),
    pivotX = op.inSwitch("pivot x", ["left", "center", "right"], "center"),
    pivotY = op.inSwitch("pivot y", ["top", "center", "bottom"], "center"),
    axis = op.inSwitch("axis", ["xy", "xz"], "xy"),
    flipTcX = op.inBool("Flip TexCoord X", false),
    flipTcY = op.inBool("Flip TexCoord Y", true),
    nColumns = op.inValueInt("num columns", 1),
    nRows = op.inValueInt("num rows", 1),
    trigger = op.outTrigger("trigger"),
    geomOut = op.outObject("geometry", null, "geometry");

geomOut.ignoreValueSerialize = true;

const geom = new CG.Geometry("rectangle");

doRender.setUiAttribs({ "title": "Render" });
render.setUiAttribs({ "title": "Trigger" });
trigger.setUiAttribs({ "title": "Next" });
op.setPortGroup("Pivot", [pivotX, pivotY, axis]);
op.setPortGroup("Size", [width, height]);
op.setPortGroup("Structure", [nColumns, nRows]);
op.toWorkPortsNeedToBeLinked(render);
op.toWorkShouldNotBeChild("Ops.Gl.TextureEffects.ImageCompose", CABLES.OP_PORT_TYPE_TRIGGER);

const AXIS_XY = 0;
const AXIS_XZ = 1;

let curAxis = AXIS_XY;
let mesh = null;
let needsRebuild = true;
let doScale = true;

const vScale = vec3.create();
vec3.set(vScale, 1, 1, 1);

axis.onChange =
    pivotX.onChange =
    pivotY.onChange =
    flipTcX.onChange =
    flipTcY.onChange =
    nRows.onChange =
    nColumns.onChange = rebuildLater;
updateScale();

doRender.onChange = () =>
{
    op.setUiAttrib({ "extendTitle": doRender.get() ? "" : "X" });
};

width.onChange =
    height.onChange =
    () =>
    {
        if (doScale) updateScale();
        else needsRebuild = true;
    };

function updateScale()
{
    if (curAxis === AXIS_XY) vec3.set(vScale, width.get(), height.get(), 1);
    if (curAxis === AXIS_XZ) vec3.set(vScale, width.get(), 1, height.get());
}

geomOut.onLinkChanged = () =>
{
    doScale = !geomOut.isLinked();
    updateScale();
    needsRebuild = true;
};

function rebuildLater()
{
    needsRebuild = true;
}

render.onTriggered = () =>
{
    if (needsRebuild) rebuild();
    const cg = op.patch.cg;
    if (cg && mesh && doRender.get())
    {
        if (doScale)
        {
            cg.pushModelMatrix();
            mat4.scale(cg.mMatrix, cg.mMatrix, vScale);
        }

        mesh.render(cg.getShader());

        if (doScale) cg.popModelMatrix();
    }

    trigger.trigger();
};

op.onDelete = function () { if (mesh)mesh.dispose(); };

function rebuild()
{
    if (axis.get() == "xy") curAxis = AXIS_XY;
    if (axis.get() == "xz") curAxis = AXIS_XZ;

    updateScale();
    let w = width.get();
    let h = height.get();

    if (doScale) w = h = 1;

    let x = 0;
    let y = 0;

    if (pivotX.get() == "center") x = 0;
    else if (pivotX.get() == "right") x = -w / 2;
    else if (pivotX.get() == "left") x = +w / 2;

    if (pivotY.get() == "center") y = 0;
    else if (pivotY.get() == "top") y = -h / 2;
    else if (pivotY.get() == "bottom") y = +h / 2;

    const numRows = Math.max(1, Math.round(nRows.get()));
    const numColumns = Math.max(1, Math.round(nColumns.get()));

    const stepColumn = w / numColumns;
    const stepRow = h / numRows;

    const indices = [];
    const tc = new Float32Array((numColumns + 1) * (numRows + 1) * 2);
    const verts = new Float32Array((numColumns + 1) * (numRows + 1) * 3);
    const norms = new Float32Array((numColumns + 1) * (numRows + 1) * 3);
    const tangents = new Float32Array((numColumns + 1) * (numRows + 1) * 3);
    const biTangents = new Float32Array((numColumns + 1) * (numRows + 1) * 3);

    let idxTc = 0;
    let idxVert = 0;
    let idxNorms = 0;
    let idxTangent = 0;
    let idxBiTangent = 0;

    for (let r = 0; r <= numRows; r++)
    {
        for (let c = 0; c <= numColumns; c++)
        {
            verts[idxVert++] = c * stepColumn - w / 2 + x;
            if (curAxis == AXIS_XZ) verts[idxVert++] = 0;
            verts[idxVert++] = r * stepRow - h / 2 + y;

            if (curAxis == AXIS_XY)verts[idxVert++] = 0;

            tc[idxTc++] = c / numColumns;
            tc[idxTc++] = r / numRows;

            if (curAxis == AXIS_XY) // default
            {
                norms[idxNorms++] = 0;
                norms[idxNorms++] = 0;
                norms[idxNorms++] = 1;

                tangents[idxTangent++] = 1;
                tangents[idxTangent++] = 0;
                tangents[idxTangent++] = 0;

                biTangents[idxBiTangent++] = 0;
                biTangents[idxBiTangent++] = 1;
                biTangents[idxBiTangent++] = 0;
            }
            else if (curAxis == AXIS_XZ)
            {
                norms[idxNorms++] = 0;
                norms[idxNorms++] = 1;
                norms[idxNorms++] = 0;

                biTangents[idxBiTangent++] = 0;
                biTangents[idxBiTangent++] = 0;
                biTangents[idxBiTangent++] = 1;
            }
        }
    }

    indices.length = numColumns * numRows * 6;
    let idx = 0;

    for (let c = 0; c < numColumns; c++)
    {
        for (let r = 0; r < numRows; r++)
        {
            const ind = c + (numColumns + 1) * r;
            const v1 = ind;
            const v2 = ind + 1;
            const v3 = ind + numColumns + 1;
            const v4 = ind + 1 + numColumns + 1;

            if (curAxis == AXIS_XY) // default
            {
                indices[idx++] = v1;
                indices[idx++] = v2;
                indices[idx++] = v3;

                indices[idx++] = v3;
                indices[idx++] = v2;
                indices[idx++] = v4;
            }
            else
            if (curAxis == AXIS_XZ)
            {
                indices[idx++] = v1;
                indices[idx++] = v3;
                indices[idx++] = v2;

                indices[idx++] = v2;
                indices[idx++] = v3;
                indices[idx++] = v4;
            }
        }
    }

    if (flipTcY.get()) for (let i = 0; i < tc.length; i += 2)tc[i + 1] = 1.0 - tc[i + 1];
    if (flipTcX.get()) for (let i = 0; i < tc.length; i += 2)tc[i] = 1.0 - tc[i];

    geom.clear();
    geom.vertices = verts;
    geom.texCoords = tc;
    geom.verticesIndices = indices;
    geom.vertexNormals = norms;
    geom.tangents = tangents;
    geom.biTangents = biTangents;

    if (op.patch.cg)
        if (!mesh) mesh = op.patch.cg.createMesh(geom, { "opId": op.id });
        else mesh.setGeom(geom);

    geomOut.setRef(geom);
    needsRebuild = false;
}

}
};






// **************************************************************
// 
// Ops.Gl.Matrix.Billboard
// 
// **************************************************************

Ops.Gl.Matrix.Billboard= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const exec = op.inTrigger("Exec");
const next = op.outTrigger("Next");

const cgl = op.patch.cgl;

let mm = mat4.create();
let mv = mat4.create();
let m = mat4.create();
let mempty = mat4.create();

exec.onTriggered = function ()
{
    mat4.invert(mm, cgl.mMatrix);
    mat4.invert(mv, cgl.vMatrix);

    mat4.mul(mm, mm, mv);

    mm[12] = 0;
    mm[13] = 0;
    mm[14] = 0;

    cgl.pushModelMatrix();
    cgl.pushViewMatrix();
    mat4.mul(cgl.mMatrix, cgl.mMatrix, mm);
    next.trigger();
    cgl.popViewMatrix();
    cgl.popModelMatrix();
};

}
};






// **************************************************************
// 
// Ops.Gl.Matrix.Translate
// 
// **************************************************************

Ops.Gl.Matrix.Translate= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    x = op.inValue("x"),
    y = op.inValue("y"),
    z = op.inValue("z");

const vec = vec3.create();
op.setUiAxisPorts(x, y, z);

render.onTriggered = function ()
{
    const cgl = op.patch.cg || op.patch.cgl;

    vec3.set(vec, x.get(), y.get(), z.get());
    cgl.pushModelMatrix();
    mat4.translate(cgl.mMatrix, cgl.mMatrix, vec);
    trigger.trigger();
    cgl.popModelMatrix();
};

}
};






// **************************************************************
// 
// Ops.Gl.Meshes.TextMesh_v2
// 
// **************************************************************

Ops.Gl.Meshes.TextMesh_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"textmesh_frag":"{{MODULES_HEAD}}\n\n#define INSTANCING\n\nUNI sampler2D tex;\n#ifdef DO_MULTEX\n    UNI sampler2D texMul;\n#endif\n#ifdef DO_MULTEX_MASK\n    UNI sampler2D texMulMask;\n#endif\nIN vec2 texCoord;\nIN vec2 texPos;\nUNI float r;\nUNI float g;\nUNI float b;\nUNI float a;\n\nflat IN float frag_instIndex;\n\nvoid main()\n{\n    {{MODULE_BEGIN_FRAG}}\n\n    vec4 col=texture(tex,texCoord);\n    col.a=col.r;\n    col.r*=r;\n    col.g*=g;\n    col.b*=b;\n    col*=a;\n\n    if(col.a==0.0)discard;\n\n    #ifdef DO_MULTEX\n        col*=texture(texMul,texPos);\n    #endif\n\n    #ifdef DO_MULTEX_MASK\n        col*=texture(texMulMask,texPos).r;\n    #endif\n\n    {{MODULE_COLOR}}\n\n    outColor=col;\n}","textmesh_vert":"{{MODULES_HEAD}}\n\nUNI sampler2D tex;\nUNI mat4 projMatrix;\nUNI mat4 modelMatrix;\nUNI mat4 viewMatrix;\nUNI float scale;\nIN vec3 vPosition;\nIN vec2 attrTexCoord;\nIN mat4 instMat;\nIN vec2 attrTexOffsets;\nIN vec2 attrTexSize;\nIN vec2 attrTexPos;\nIN float attrVertIndex;\nIN float instanceIndex;\nflat OUT float frag_instIndex;\n\nOUT vec2 texPos;\n\nOUT vec2 texCoord;\nOUT vec4 modelPos;\n\nvoid main()\n{\n\n    texCoord=(attrTexCoord*(attrTexSize)) + attrTexOffsets;\n    mat4 instMVMat=instMat;\n    instMVMat[3][0]*=scale;\n\n    texPos=attrTexPos;\n\n    vec4 pos=vec4( vPosition.x*(attrTexSize.x/attrTexSize.y)*scale,vPosition.y*scale,vPosition.z*scale, 1. );\n\n    mat4 mvMatrix=viewMatrix * modelMatrix * instMVMat;\n    frag_instIndex=instanceIndex;\n\n    {{MODULE_VERTEX_POSITION}}\n\n    gl_Position = projMatrix * mvMatrix * pos;\n}\n\n",};
const
    render = op.inTrigger("Render"),
    str = op.inString("Text", "cables"),
    scaleText = op.inFloat("Scale Text", 1),
    scale = op.inValueFloat("Scale", 1),
    inFont = op.inString("Font", "Arial"),
    align = op.inValueSelect("align", ["left", "center", "right"], "center"),
    valign = op.inValueSelect("vertical align", ["Top", "Middle", "Bottom"], "Middle"),
    lineHeight = op.inValueFloat("Line Height", 1),
    letterSpace = op.inValueFloat("Letter Spacing"),

    tfilter = op.inSwitch("filter", ["nearest", "linear", "mipmap"], "mipmap"),
    aniso = op.inSwitch("Anisotropic", [0, 1, 2, 4, 8, 16], 0),

    inMulTex = op.inTexture("Texture Color"),
    inMulTexMask = op.inTexture("Texture Mask"),
    next = op.outTrigger("Next"),
    textureOut = op.outTexture("texture"),
    outLines = op.outNumber("Total Lines", 0),
    outWidth = op.outNumber("Width", 0),
    loaded = op.outBoolNum("Font Available", 0);

const cgl = op.patch.cgl;
const vScale = vec3.create();

vec3.set(vScale, 1, 1, 1);

op.toWorkPortsNeedToBeLinked(render);

op.setPortGroup("Masking", [inMulTex, inMulTexMask]);

scale.setUiAttribs({ "title": "Line Scale" });

textureOut.setUiAttribs({ "hidePort": true });

const textureSize = 1024;
let fontLoaded = false;
let needUpdate = true;

align.onChange =
    str.onChange =
    lineHeight.onChange = generateMeshLater;

function generateMeshLater()
{
    needUpdate = true;
}

let canvasid = null;
CABLES.OpTextureMeshCanvas = {};
let valignMode = 0;

const geom = null;
let mesh = null;

let createMesh = true;
let createTexture = true;

op.onDelete = function () { if (mesh)mesh.dispose(); };

scaleText.onChange = () =>
{
    vec3.set(vScale, scaleText.get(), scaleText.get(), scaleText.get());
};

aniso.onChange =
tfilter.onChange = () =>
{
    getFont().texture = null;
    createTexture = true;
};

inMulTexMask.onChange =
inMulTex.onChange = function ()
{
    shader.toggleDefine("DO_MULTEX", inMulTex.get());
    shader.toggleDefine("DO_MULTEX_MASK", inMulTexMask.get());
};

textureOut.setRef(null);
inFont.onChange = function ()
{
    createTexture = true;
    createMesh = true;
    checkFont();
};

op.patch.on("fontLoaded", (fontName) =>
{
    if (fontName == inFont.get())
    {
        createTexture = true;
        createMesh = true;
    }
});

function checkFont()
{
    const oldFontLoaded = fontLoaded;
    try
    {
        fontLoaded = document.fonts.check("20px \"" + inFont.get() + "\"");
    }
    catch (ex)
    {
        op.logError(ex);
    }

    if (!oldFontLoaded && fontLoaded)
    {
        loaded.set(true);
        createTexture = true;
        createMesh = true;
    }

    if (!fontLoaded) setTimeout(checkFont, 250);
}

valign.onChange = function ()
{
    if (valign.get() == "Middle")valignMode = 0;
    else if (valign.get() == "Top")valignMode = 1;
    else if (valign.get() == "Bottom")valignMode = 2;
};

function getFont()
{
    canvasid = "" + inFont.get();
    if (CABLES.OpTextureMeshCanvas.hasOwnProperty(canvasid))
        return CABLES.OpTextureMeshCanvas[canvasid];

    const fontImage = document.createElement("canvas");
    fontImage.dataset.font = inFont.get();
    fontImage.id = "texturetext_" + CABLES.generateUUID();
    fontImage.style.display = "none";
    const body = document.getElementsByTagName("body")[0];
    body.appendChild(fontImage);
    const _ctx = fontImage.getContext("2d");
    CABLES.OpTextureMeshCanvas[canvasid] =
        {
            "ctx": _ctx,
            "canvas": fontImage,
            "chars": {},
            "characters": "",
            "fontSize": 320
        };
    return CABLES.OpTextureMeshCanvas[canvasid];
}

op.onDelete = function ()
{
    if (canvasid && CABLES.OpTextureMeshCanvas[canvasid])
        CABLES.OpTextureMeshCanvas[canvasid].canvas.remove();
};

const shader = new CGL.Shader(cgl, "TextMesh", this);
shader.setSource(attachments.textmesh_vert, attachments.textmesh_frag);
const uniTex = new CGL.Uniform(shader, "t", "tex", 0);
const uniTexMul = new CGL.Uniform(shader, "t", "texMul", 1);
const uniTexMulMask = new CGL.Uniform(shader, "t", "texMulMask", 2);
const uniScale = new CGL.Uniform(shader, "f", "scale", scale);

const
    r = op.inValueSlider("r", 1),
    g = op.inValueSlider("g", 1),
    b = op.inValueSlider("b", 1),
    a = op.inValueSlider("a", 1),
    runiform = new CGL.Uniform(shader, "f", "r", r),
    guniform = new CGL.Uniform(shader, "f", "g", g),
    buniform = new CGL.Uniform(shader, "f", "b", b),
    auniform = new CGL.Uniform(shader, "f", "a", a);
r.setUiAttribs({ "colorPick": true });

op.setPortGroup("Display", [scale, inFont]);
op.setPortGroup("Alignment", [align, valign]);
op.setPortGroup("Color", [r, g, b, a]);

let height = 0;
const vec = vec3.create();
let lastTextureChange = -1;
let disabled = false;

render.onTriggered = function ()
{
    if (needUpdate)
    {
        generateMesh();
        needUpdate = false;
    }
    const font = getFont();
    if (font.lastChange != lastTextureChange)
    {
        createMesh = true;
        lastTextureChange = font.lastChange;
    }

    if (createTexture) generateTexture();
    if (createMesh) generateMesh();

    if (mesh && mesh.numInstances > 0)
    {
        cgl.pushBlendMode(CGL.BLEND_NORMAL, true);
        cgl.pushShader(shader);
        cgl.setTexture(0, textureOut.get().tex);

        const mulTex = inMulTex.get();
        if (mulTex)cgl.setTexture(1, mulTex.tex);

        const mulTexMask = inMulTexMask.get();
        if (mulTexMask)cgl.setTexture(2, mulTexMask.tex);

        if (valignMode === 2) vec3.set(vec, 0, height, 0);
        else if (valignMode === 1) vec3.set(vec, 0, 0, 0);
        else if (valignMode === 0) vec3.set(vec, 0, height / 2, 0);

        vec[1] -= lineHeight.get();
        cgl.pushModelMatrix();
        mat4.translate(cgl.mMatrix, cgl.mMatrix, vec);
        mat4.scale(cgl.mMatrix, cgl.mMatrix, vScale);

        if (!disabled)mesh.render(cgl.getShader());

        cgl.popModelMatrix();

        cgl.setTexture(0, null);
        cgl.popShader();
        cgl.popBlendMode();
    }

    next.trigger();
};

letterSpace.onChange = function ()
{
    createMesh = true;
};

function generateMesh()
{
    const theString = String(str.get() + "");
    if (!textureOut.get()) return;

    const font = getFont();
    if (!font.geom)
    {
        font.geom = new CGL.Geometry("textmesh");

        font.geom.vertices = [
            1.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            1.0, 0.0, 0.0,
            0.0, 0.0, 0.0
        ];

        font.geom.texCoords = new Float32Array([
            1.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            0.0, 0.0
        ]);

        font.geom.verticesIndices = [
            0, 1, 2,
            2, 1, 3
        ];
    }

    if (!mesh)mesh = new CGL.Mesh(cgl, font.geom);

    const strings = (theString).split("\n");
    outLines.set(strings.length);

    const transformations = [];
    const tcOffsets = [];
    const tcSize = [];
    const texPos = [];
    const m = mat4.create();
    let charCounter = 0;
    let maxWidth = 0;
    createTexture = false;

    for (let s = 0; s < strings.length; s++)
    {
        const txt = strings[s];
        const numChars = txt.length;

        let pos = 0;
        let offX = 0;
        let width = 0;

        for (let i = 0; i < numChars; i++)
        {
            const chStr = txt.substring(i, i + 1);
            const char = font.chars[String(chStr)];
            if (char)
            {
                width += (char.texCoordWidth / char.texCoordHeight);
                width += letterSpace.get();
            }
        }

        width -= letterSpace.get();

        height = 0;

        if (align.get() == "left") offX = 0;
        else if (align.get() == "right") offX = width;
        else if (align.get() == "center") offX = width / 2;

        height = (s + 1) * lineHeight.get();

        for (let i = 0; i < numChars; i++)
        {
            const chStr = txt.substring(i, i + 1);
            const char = font.chars[String(chStr)];

            if (!char)
            {
                createTexture = true;
                return;
            }
            else
            {
                texPos.push(pos / width * 0.99 + 0.005, (1.0 - (s / (strings.length - 1))) * 0.99 + 0.005);
                tcOffsets.push(char.texCoordX, 1 - char.texCoordY - char.texCoordHeight);
                tcSize.push(char.texCoordWidth, char.texCoordHeight);

                mat4.identity(m);
                mat4.translate(m, m, [pos - offX, 0 - s * lineHeight.get(), 0]);

                pos += (char.texCoordWidth / char.texCoordHeight) + letterSpace.get();
                maxWidth = Math.max(maxWidth, pos - offX);

                transformations.push(Array.prototype.slice.call(m));

                charCounter++;
            }
        }
    }

    const transMats = [].concat.apply([], transformations);

    disabled = false;
    if (transMats.length == 0)disabled = true;

    const n = transMats.length / 16;
    mesh.setNumInstances(n);

    if (mesh.numInstances == 0)
    {
        disabled = true;
        return;
    }

    outWidth.set(maxWidth * scale.get());
    mesh.setAttribute("instMat", new Float32Array(transMats), 16, { "instanced": true });
    mesh.setAttribute("attrTexOffsets", new Float32Array(tcOffsets), 2, { "instanced": true });
    mesh.setAttribute("attrTexSize", new Float32Array(tcSize), 2, { "instanced": true });
    mesh.setAttribute("attrTexPos", new Float32Array(texPos), 2, { "instanced": true });

    createMesh = false;

    if (createTexture) generateTexture();
}

function printChars(fontSize, simulate)
{
    const font = getFont();
    if (!simulate) font.chars = {};

    const ctx = font.ctx;

    ctx.font = fontSize + "px " + inFont.get();
    ctx.textAlign = "left";

    let posy = 0;
    let posx = 0;
    const lineHeight = fontSize * 1.4;
    const result =
        {
            "fits": true
        };

    for (let i = 0; i < font.characters.length; i++)
    {
        const chStr = String(font.characters.substring(i, i + 1));
        const chWidth = (ctx.measureText(chStr).width);

        if (posx + chWidth >= textureSize)
        {
            posy += lineHeight + 2;
            posx = 0;
        }

        if (!simulate)
        {
            font.chars[chStr] =
                {
                    "str": chStr,
                    "texCoordX": posx / textureSize,
                    "texCoordY": posy / textureSize,
                    "texCoordWidth": chWidth / textureSize,
                    "texCoordHeight": lineHeight / textureSize,
                };

            ctx.fillText(chStr, posx, posy + fontSize);
        }

        posx += chWidth + 12;
    }

    if (posy > textureSize - lineHeight)
    {
        result.fits = false;
    }

    result.spaceLeft = textureSize - posy;

    return result;
}

function generateTexture()
{
    let filter = CGL.Texture.FILTER_LINEAR;
    if (tfilter.get() == "nearest") filter = CGL.Texture.FILTER_NEAREST;
    if (tfilter.get() == "mipmap") filter = CGL.Texture.FILTER_MIPMAP;

    const font = getFont();
    let string = String(str.get());
    if (string == null || string == undefined)string = "";
    for (let i = 0; i < string.length; i++)
    {
        const ch = string.substring(i, i + 1);
        if (font.characters.indexOf(ch) == -1)
        {
            font.characters += ch;
            createTexture = true;
        }
    }

    const ctx = font.ctx;
    font.canvas.width = font.canvas.height = textureSize;

    if (!font.texture)
        font.texture = CGL.Texture.createFromImage(cgl, font.canvas, {
            "filter": filter,
            "anisotropic": parseFloat(aniso.get())
        });

    font.texture.setSize(textureSize, textureSize);

    ctx.fillStyle = "transparent";
    ctx.clearRect(0, 0, textureSize, textureSize);
    ctx.fillStyle = "rgba(255,255,255,255)";

    let fontSize = font.fontSize + 40;
    let simu = printChars(fontSize, true);

    while (!simu.fits)
    {
        fontSize -= 5;
        simu = printChars(fontSize, true);
    }

    printChars(fontSize, false);

    ctx.restore();

    font.texture.initTexture(font.canvas, filter);
    font.texture.unpackAlpha = true;
    textureOut.setRef(font.texture);

    font.lastChange = CABLES.now();

    createMesh = true;
    createTexture = false;
}

}
};






// **************************************************************
// 
// Ops.Gl.Meshes.Cylinder_v2
// 
// **************************************************************

Ops.Gl.Meshes.Cylinder_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inRender = op.inTrigger("render"),
    inDraw = op.inValueBool("Draw", true),
    inSegments = op.inValueInt("segments", 40),
    inStacks = op.inValueInt("stacks", 1),
    inLength = op.inValueFloat("length", 1),
    inOuterRadius = op.inValueFloat("outer radius", 0.5),
    inInnerRadius = op.inValueFloat("inner radius", 0),
    inUVMode = op.inValueSelect("UV mode", ["simple", "atlas"], "simple"),
    flipSideMapping = op.inValueBool("Flip Mapping", false),
    inCaps = op.inValueBool("Caps", true),
    inFlat = op.inValueBool("Flat Normals", false),
    outTrigger = op.outTrigger("next"),
    outGeometry = op.outObject("geometry", null, "geometry");

const geom = new CGL.Geometry("cylinder");

inDraw.setUiAttribs({ "title": "Render mesh" });
inDraw.onChange = () => { op.setUiAttrib({ "extendTitle": inDraw.get() ? "" : "x" }); };

const
    TAU = Math.PI * 2,
    cgl = op.patch.cgl;

let needsRebuild = true;
let mesh = null;

inUVMode.setUiAttribs({ "hidePort": true });
op.onDelete = function () { if (mesh)mesh.dispose(); };

op.preRender = buildMesh;

function buildMesh()
{
    const flipTex = flipSideMapping.get();

    const
        segments = Math.max(inSegments.get(), 3) | 0,
        innerRadius = Math.max(inInnerRadius.get(), 0),
        outerRadius = Math.max(inOuterRadius.get(), innerRadius),
        stacks = Math.max(inStacks.get(), inStacks.defaultValue) | 0,
        length = inLength.get(),
        stackLength = length / stacks,
        segmentRadians = TAU / segments,
        uvMode = inUVMode.get();
    let
        positions = [],
        normals = [],
        tangents = [],
        biTangents = [],
        texcoords = [],
        indices = [],
        x, y, z, i, j,
        a, d, o;
    if (uvMode == "atlas") o = 0.5;
    else o = 1;

    // for each stack
    for (
        i = 0, z = -length / 2;
        i <= stacks;
        i++, z += stackLength
    )
    {
        // for each segment
        for (
            j = a = 0;
            j <= segments;
            j++, a += segmentRadians
        )
        {
            positions.push(
                (x = Math.sin(a)) * outerRadius,
                (y = Math.cos(a)) * outerRadius,
                z
            );
            d = Math.sqrt(x * x + y * y);
            x /= d;
            y /= d;
            normals.push(x, y, 0);
            tangents.push(-y, x, 0);
            biTangents.push(0, 0, 1);

            if (flipTex)
                texcoords.push(
                    j / segments,
                    1.0 - ((z / length + 0.5) * o)
                );

            else
                texcoords.push(
                    (z / length + 0.5) * o,
                    j / segments
                );
        }
    }

    // create indices
    for (j = 0; j < stacks; j++)
    {
        for (
            i = 0, d = j * (segments + 1);
            i < segments;
            i++, d++
        )
        {
            a = d + 1;
            indices.push(
                d + (segments + 1), a, d, d + (segments + 1), a + (segments + 1), a
            );
        }
    }

    // create inner shell
    if (innerRadius)
    {
        d = positions.length;
        for (i = j = 0; i < d; i += 3, j += 2)
        {
            positions.push(
                (positions[i] / outerRadius) * innerRadius,
                (positions[i + 1] / outerRadius) * innerRadius,
                positions[i + 2]
            );
            normals.push(
                -normals[i],
                -normals[i + 1],
                0
            );
            tangents.push(
                -tangents[i],
                -tangents[i + 1],
                0
            );
            biTangents.push(
                0,
                -biTangents[i + 1],
                -biTangents[i + 2]
            );
            texcoords.push(
                texcoords[j],
                1 - texcoords[j + 1]
            );
        }
        a = d / 3;
        d = indices.length;
        for (i = 0; i < d; i += 6)
        {
            indices.push(
                a + indices[i],
                a + indices[i + 2],
                a + indices[i + 1],
                a + indices[i + 3],
                a + indices[i + 5],
                a + indices[i + 4]
            );
        }

        if (inCaps.get())
        {
            // create caps
            a = positions.length;
            o = a / 2;
            d = segments * 3;

            // cap positions
            Array.prototype.push.apply(positions, positions.slice(0, d));
            Array.prototype.push.apply(positions, positions.slice(o, o + d));
            Array.prototype.push.apply(positions, positions.slice(o - d, o));
            Array.prototype.push.apply(positions, positions.slice(a - d, a));

            // cap normals
            d = segments * 2;
            for (i = 0; i < d; i++) normals.push(0, 0, -1), tangents.push(-1, 0, 0), biTangents.push(0, -1, 0);
            for (i = 0; i < d; i++) normals.push(0, 0, 1), tangents.push(1, 0, 0), biTangents.push(0, 1, 0);

            // cap uvs
            if (uvMode == "atlas")
            {
                d = (innerRadius / outerRadius) * 0.5;
                for (i = o = 0; i < segments; i++, o += segmentRadians)
                    texcoords.push(
                        Math.sin(o) * 0.25 + 0.75,
                        Math.cos(o) * 0.25 + 0.25
                    );
                for (i = o = 0; i < segments; i++, o += segmentRadians)
                    texcoords.push(
                        (Math.sin(o) * d + 0.5) * 0.5 + 0.5,
                        (Math.cos(o) * d + 0.5) * 0.5
                    );
                for (i = o = 0; i < segments; i++, o += segmentRadians)
                    texcoords.push(
                        Math.sin(o) * 0.25 + 0.75,
                        Math.cos(o) * 0.25 + 0.75
                    );
                for (i = o = 0; i < segments; i++, o += segmentRadians)
                    texcoords.push(
                        (Math.sin(o) * d + 0.5) * 0.5 + 0.5,
                        (Math.cos(o) * d + 0.5) * 0.5 + 0.5
                    );
            }
            else
            {
                for (i = 0; i < d; i++) texcoords.push(0, 0);
                for (i = 0; i < d; i++) texcoords.push(1, 1);
            }

            // cap indices
            for (
                i = 0, o = a / 3 + x;
                i < segments - 1;
                i++, o++
            )
            {
                indices.push(
                    o + 1, o + segments, o, o + segments + 1, o + segments, o + 1
                );
            }
            indices.push(
                o + segments, a / 3 + x, a / 3 + segments + x, o + segments, o, a / 3 + x
            );
            x += segments * 2;
            for (
                i = 0, o = a / 3 + x;
                i < segments - 1;
                i++, o++
            )
            {
                indices.push(
                    o, o + segments, o + 1, o + 1, o + segments, o + segments + 1
                );
            }
            indices.push(
                a / 3 + segments + x, a / 3 + x, o + segments, a / 3 + x, o, o + segments
            );
        }
    }
    else
    {
        a = positions.length;
        d = a / 3;

        positions.push(0, 0, -length / 2);
        Array.prototype.push.apply(positions, positions.slice(0, segments * 3));
        for (i = 0; i <= segments; i++) normals.push(0, 0, -1), tangents.push(-1, 0, 0), biTangents.push(0, -1, 0);

        if (inCaps.get())
        {
            positions.push(0, 0, length / 2);
            Array.prototype.push.apply(positions, positions.slice(a - segments * 3, a));
            for (i = 0; i <= segments; i++) normals.push(0, 0, 1), tangents.push(1, 0, 0), biTangents.push(0, 1, 0);
            if (uvMode == "atlas")
            {
                texcoords.push(0.75, 0.25);
                for (i = a = 0; i < segments; i++, a += segmentRadians)
                    texcoords.push(Math.sin(a) * 0.25 + 0.75, Math.cos(a) * 0.25 + 0.25);
                texcoords.push(0.75, 0.75);
                for (i = a = 0; i < segments; i++, a += segmentRadians)
                    texcoords.push(Math.sin(a) * 0.25 + 0.75, Math.cos(a) * 0.25 + 0.75);
            }
            else
            {
                for (i = 0; i <= segments; i++) texcoords.push(0, 0);
                for (i = 0; i <= segments; i++) texcoords.push(1, 1);
            }
            indices.push(d + 1, d, d + segments);
            for (i = 1; i < segments; i++)
                indices.push(d, d + i, d + i + 1);
            d += segments + 1;
            indices.push(d, d + 1, d + segments);
            for (i = 1; i < segments; i++)
                indices.push(d, d + i + 1, d + i);
            d += segments + 1;
        }
    }

    // set geometry
    geom.clear();
    geom.vertices = positions;
    geom.texCoords = texcoords;
    geom.vertexNormals = normals;
    geom.tangents = tangents;
    geom.biTangents = biTangents;
    geom.verticesIndices = indices;

    if (inFlat.get()) geom.unIndex();

    outGeometry.setRef(geom);

    if (op.patch.cg)
        if (!mesh) mesh = op.patch.cg.createMesh(geom, { "opId": op.id });
        else mesh.setGeom(geom);

    needsRebuild = false;
}

// set event handlers
inRender.onTriggered = function ()
{
    if (needsRebuild) buildMesh();
    if (inDraw.get() && mesh) mesh.render();
    outTrigger.trigger();
};

inSegments.onChange =
inOuterRadius.onChange =
inInnerRadius.onChange =
inCaps.onChange =
inLength.onChange =
flipSideMapping.onChange =
inStacks.onChange =
inFlat.onChange =
inUVMode.onChange = function ()
{
    // only calculate once, even after multiple settings could were changed
    needsRebuild = true;
};

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.Noise.FBMNoise_v2
// 
// **************************************************************

Ops.Gl.ImageCompose.Noise.FBMNoise_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"fbmnoise_frag":"UNI sampler2D tex;\nUNI float anim;\n\nUNI float scale;\nUNI float repeat;\n\nUNI float scrollX;\nUNI float scrollY;\n\nUNI float amount;\n\nUNI bool layer1;\nUNI bool layer2;\nUNI bool layer3;\nUNI bool layer4;\nUNI vec3 color;\nUNI float aspect;\n\nIN vec2 texCoord;\n\n\n{{CGL.BLENDMODES3}}\n\n// adapted from warp shader by inigo quilez/iq\n// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.\n\n// See here for a tutorial on how to make this: http://www.iquilezles.org/www/articles/warp/warp.htm\n\nconst mat2 m = mat2( 0.80,  0.60, -0.60,  0.80 );\n\nfloat noise( in vec2 x )\n{\n\treturn sin(1.5*x.x)*sin(1.5*x.y);\n}\n\nfloat fbm4( vec2 p )\n{\n    float f = 0.0;\n    f += 0.5000*noise( p ); p = m*p*2.02;\n    f += 0.2500*noise( p ); p = m*p*2.03;\n    f += 0.1250*noise( p ); p = m*p*2.01;\n    f += 0.0625*noise( p );\n    return f/0.9375;\n}\n\nfloat fbm6( vec2 p )\n{\n    float f = 0.0;\n    f += 0.500000*(0.5+0.5*noise( p )); p = m*p*2.02;\n    f += 0.250000*(0.5+0.5*noise( p )); p = m*p*2.03;\n    f += 0.125000*(0.5+0.5*noise( p )); p = m*p*2.01;\n    f += 0.062500*(0.5+0.5*noise( p )); p = m*p*2.04;\n    f += 0.031250*(0.5+0.5*noise( p )); p = m*p*2.01;\n    f += 0.015625*(0.5+0.5*noise( p ));\n    return f/0.96875;\n}\n\nvoid main()\n{\n    vec2 tc=texCoord;\n\t#ifdef DO_TILEABLE\n\t    tc=abs(texCoord-0.5);\n\t#endif\n\n    vec2 p=(tc-0.5)*scale;\n\n    p.y/=aspect;\n    vec2 q = vec2( fbm4( p + vec2(0.3+scrollX,0.20+scrollY) ),\n                   fbm4( p + vec2(3.1+scrollX,1.3+scrollY) ) );\n\n    vec2 q2 = vec2( fbm4( p + vec2(2.0+scrollX,1.0+scrollY) ),\n                   fbm4( p + vec2(3.1+scrollX,1.3+scrollY) ) );\n\n    vec2 q3 = vec2( fbm4( p + vec2(9.0+scrollX,4.0+scrollY) ),\n                   fbm4( p + vec2(3.1+scrollX,4.3+scrollY) ) );\n\n    float v= fbm4( ( p + 4.0*q +anim*0.1)*repeat);\n    float v2= fbm4( (p + 4.0*q2 +anim*0.1)*repeat );\n\n    float v3= fbm6( (p + 4.0*q3 +anim*0.1)*repeat );\n    float v4= fbm6( (p + 4.0*q2 +anim*0.1)*repeat );\n\n    vec4 base=texture(tex,texCoord);\n\n    vec4 finalColor;\n    float colVal=0.0;\n    float numLayers=0.0;\n\n    if(layer1)\n    {\n        colVal+=v;\n        numLayers++;\n    }\n\n    if(layer2)\n    {\n        colVal+=v2;\n        numLayers++;\n    }\n\n    if(layer3)\n    {\n        colVal+=v3;\n        numLayers++;\n    }\n\n    if(layer4)\n    {\n        colVal+=v4;\n        numLayers++;\n    }\n\n    finalColor=vec4( color*vec3(colVal/numLayers),1.0);\n\n    outColor = cgl_blendPixel(base,finalColor,amount);\n}\n",};
const
    render = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),
    r = op.inValueSlider("r", 1.0),
    g = op.inValueSlider("g", 1.0),
    b = op.inValueSlider("b", 1.0),
    trigger = op.outTrigger("trigger");

r.setUiAttribs({ "colorPick": true });

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "fbmnoise");

shader.setSource(shader.getDefaultVertexShader(), attachments.fbmnoise_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    uniScale = new CGL.Uniform(shader, "f", "scale", op.inValue("scale", 2)),
    uniAnim = new CGL.Uniform(shader, "f", "anim", op.inValue("anim", 0)),
    uniScrollX = new CGL.Uniform(shader, "f", "scrollX", op.inValue("scrollX", 9)),
    uniScrollY = new CGL.Uniform(shader, "f", "scrollY", op.inValue("scrollY", 0)),
    uniRepeat = new CGL.Uniform(shader, "f", "repeat", op.inValue("repeat", 1)),
    uniAspect = new CGL.Uniform(shader, "f", "aspect", op.inValue("aspect", 1)),
    uniLayer1 = new CGL.Uniform(shader, "b", "layer1", op.inValueBool("Layer 1", true)),
    uniLayer2 = new CGL.Uniform(shader, "b", "layer2", op.inValueBool("Layer 2", true)),
    uniLayer3 = new CGL.Uniform(shader, "b", "layer3", op.inValueBool("Layer 3", true)),
    uniLayer4 = new CGL.Uniform(shader, "b", "layer4", op.inValueBool("Layer 4", true)),
    uniColor = new CGL.Uniform(shader, "3f", "color", r, g, b),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount);

const tile = op.inValueBool("Tileable", false);
tile.onChange = updateTileable;

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);

function updateTileable()
{
    shader.toggleDefine("DO_TILEABLE", tile.get());
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    uniAspect.set(cgl.currentTextureEffect.getCurrentSourceTexture().width / cgl.currentTextureEffect.getCurrentSourceTexture().height);

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.Mirror
// 
// **************************************************************

Ops.Gl.ImageCompose.Mirror= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"mirror_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\nUNI float axis;\nUNI float width;\nUNI float flip;\nUNI float offset;\n\nvoid main()\n{\n   vec4 col=vec4(1.0,0.0,0.0,1.0);\n\n   float tc=texCoord.x;\n   if(axis==1.0) tc=(texCoord.y);\n\n   float x=(tc);\n   if(tc>=0.5)x=1.0-tc;\n\n   x*=width*2.0;\n   if(flip==1.0)x=1.0-x;\n   x*=1.0-offset;\n\n   if(axis==1.0) col=texture(tex,vec2(texCoord.x,x) );\n       else col=texture(tex,vec2(x,texCoord.y) );\n\n   outColor= col;\n}",};
const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    axis = op.inSwitch("axis", ["X", "Y"], "X"),
    width = op.inValueFloat("width", 0.5),
    offset = op.inValueFloat("offset"),
    flip = op.inValueBool("flip");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.mirror_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    uniAxis = new CGL.Uniform(shader, "f", "axis", 0),
    uniWidth = new CGL.Uniform(shader, "f", "width", width),
    uniOffset = new CGL.Uniform(shader, "f", "offset", offset),
    uniFlip = new CGL.Uniform(shader, "f", "flip", 0);

flip.onChange = function ()
{
    if (flip.get())uniFlip.setValue(1);
    else uniFlip.setValue(0);
};

axis.onChange = function ()
{
    if (axis.get() == "X")uniAxis.setValue(0);
    else if (axis.get() == "Y")uniAxis.setValue(1);
};

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Team.Particles.Dev.LinesArrayFromTexture_v2
// 
// **************************************************************

Ops.Team.Particles.Dev.LinesArrayFromTexture_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"spline_frag":"\n\n// if(mulAlpha!=1.0)\ncol*=mulAlpha;\n\n\n// col.a=texture(MOD_particleMask,texCoord).r;\n// col*=texture(MOD_particleMask,texCoord).r;\n","spline_head_frag":"IN float mulAlpha;\n\n","splinetex_vert":"\nvec4 col=texture(MOD_tex,texCoord);\n\nvec3 MOD_pos=col.xyz;\n\npos.xyz=MOD_pos.xyz;\n\nmulAlpha=1.0;\nif(col.a<1.0) mulAlpha=0.0;\n\n#ifdef MASK_PARTICLES\n    float MOD_e=texture(MOD_particleMask,texCoord).r;\n\n    if(MOD_e<0.95 && MOD_e>0.05) mulAlpha*=1.0;\n    else mulAlpha=0.0;\n#endif","splinetex_head_vert":"OUT float mulAlpha;\n\n",};
const
    render = op.inTrigger("render"),
    inTex = op.inTexture("Texture", null, "texture"),
    inTexParticleTiming = op.inTexture("Particle Timing", null, "texture"),
    trigger = op.outTrigger("Trigger");

const cgl = op.patch.cgl;
let mesh = null;
let numVerts = 0;

const mod = new CGL.ShaderModifier(cgl, op.name);
mod.addModule({
    "priority": 0,
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": attachments.splinetex_head_vert,
    "srcBodyVert": attachments.splinetex_vert
});

mod.addModule({
    "title": op.name,
    "name": "MODULE_COLOR",
    "srcHeadFrag": attachments.spline_head_frag,
    "srcBodyFrag": attachments.spline_frag
});

mod.addUniformVert("t", "MOD_tex");
mod.addUniformVert("t", "MOD_texPointSize");
mod.addUniformBoth("t", "MOD_particleMask");

mod.addUniformVert("f", "MOD_texSize", 0);

render.onTriggered = doRender;
updateDefines();

inTex.onChange = setupMesh;
setupMesh();
updateDefines();

inTexParticleTiming.onLinkChanged = updateDefines;

function updateDefines()
{
    mod.toggleDefine("MASK_PARTICLES", inTexParticleTiming.isLinked());
}

function doRender()
{
    mod.bind();
    if (!inTex.get() || !inTex.get().tex) return;
    if (inTex.get()) mod.pushTexture("MOD_tex", inTex.get().tex);
    if (inTexParticleTiming.get()) mod.pushTexture("MOD_particleMask", inTexParticleTiming.get().tex);

    mod.setUniformValue("MOD_texSize", inTex.get().width + 1);

    const shader = cgl.getShader();
    shader.glPrimitive = cgl.gl.LINES;

    if (numVerts > 0 && mesh)
    {
        mesh.render(shader);
    }

    trigger.trigger();
    mod.unbind();
}

function setupMesh()
{
    if (!inTex.get()) return;

    if (inTex.get() == CGL.Texture.getEmptyTexture(op.patch.cgl)) return;

    const tw = inTex.get().width;
    const w = (inTex.get().width) * 2;
    const h = (inTex.get().height);

    const num = w * h;

    if (num == numVerts) return;

    let verts = new Float32Array(num * 3);
    let texCoords = new Float32Array(num * 2);

    let biasX = 0.5 * (1.0 / tw);
    let biasY = 0.5 * (1.0 / h);

    for (let x = 0; x < tw; x++)
        for (let y = 0; y < h; y++)
        {
            texCoords[(x + y * tw) * 4] = ((x + 1) / tw) + biasX;
            texCoords[(x + y * tw) * 4 + 1] = (y / h) + biasY;

            texCoords[(x + y * tw) * 4 + 2] = ((x) / tw) + biasX;
            texCoords[(x + y * tw) * 4 + 3] = (y / h) + biasY;
        }

    const geom = new CGL.Geometry("splineFromTexture");
    geom.setPointVertices(verts);
    geom.setTexCoords(texCoords);
    geom.verticesIndices = [];
    numVerts = verts.length / 3;

    if (mesh)mesh.dispose();

    if (numVerts > 0) mesh = new CGL.Mesh(cgl, geom, cgl.gl.LINES);

    mesh.addVertexNumbers = true;
    mesh.setGeom(geom);
}

}
};






// **************************************************************
// 
// Ops.Team.Particles.Dev.BufferRgbHistory
// 
// **************************************************************

Ops.Team.Particles.Dev.BufferRgbHistory= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"buffer_frag":"UNI sampler2D texRandoms;\n\nUNI sampler2D texInput0;\nUNI sampler2D texFeedback0;\n\nUNI sampler2D texInput1;\nUNI sampler2D texFeedback1;\n\n\n#ifdef USE_MASK\nUNI sampler2D texMask;\n#endif\n\nIN vec2 texCoord;\n\nUNI float column;\nUNI float width;\n\nvoid main()\n{\n    #define SCROLLING\n\n    vec4 col=texture(texFeedback0,vec2(texCoord.x-(1.0/width),texCoord.y));\n    vec4 col1=texture(texFeedback1,vec2(texCoord.x-(1.0/width),texCoord.y));\n    col1.a=col.a;\n\n    #ifdef SCROLLING\n        if(texCoord.x*width<2.0)\n    #endif\n    #ifndef SCROLLING\n        if(column>=floor(texCoord.x*width) && column<=ceil(texCoord.x*width)+2.0)\n    #endif\n    {\n        vec4 theTexCoords = texture(texRandoms, vec2(texCoord.x,texCoord.y));\n\n        vec4 ncol=texture(texInput0,theTexCoords.xy);\n\n        // if( ncol.xyz!=vec3(0.0) && abs( distance(col.xyz, ncol.xyz) ) > 3.1) ncol.a=0.0;\n        // else ncol.a=1.0;\n\n        // if(ncol.xyz==vec3(0.0))ncol.a=0.0;\n\n        col=ncol;\n        col1=texture(texInput1,theTexCoords.xy);\n\n\n    }\n\n\n    outColor0=col;\n    outColor1=col1;\n\n}",};
const
    exec = op.inTrigger("Execute"),
    inTex0 = op.inTexture("Position Texture"),
    inTex1 = op.inTexture("Pass Through 1"),
    inWidth = op.inInt("Num Frames", 200),
    inLines = op.inInt("Num Lines", 100),
    inSeed = op.inFloat("Seed", 0),
    next = op.outTrigger("Next"),
    inReset=op.inTriggerButton("Reset"),
    outFpTex = op.outTexture("Spline Rows Texture"),
    outPass1 = op.outTexture("Result Pass Through 1");

const cgl = op.patch.cgl;
let pixelPos = 0;
let width = 200;
let numLines = 100;
let texRandoms = null;
let feedback0 = null;
let feedback1 = null;
let randomCoords = null;
let needsSetSize = true;

const tc = new CGL.CopyTexture(op.patch.cgl, "bufferrgbpoints",
    {
        "shader": attachments.buffer_frag,
        "isFloatingPointTexture": true,
        "numRenderBuffers": 2,
    });

const feedback = new CGL.CopyTexture(op.patch.cgl, "rgbpointsfeedback",
    {
        "isFloatingPointTexture": true,
        "numRenderBuffers": 2,
    });

const
    uniColumn = new CGL.Uniform(tc.bgShader, "f", "column", 0),
    uniWidth = new CGL.Uniform(tc.bgShader, "f", "width", 0),

    uniRandoms = new CGL.Uniform(tc.bgShader, "t", "texRandoms", 1),

    uniTex0 = new CGL.Uniform(tc.bgShader, "t", "texInput0", 2),
    uniTexFb0 = new CGL.Uniform(tc.bgShader, "t", "texFeedback0", 3),

    uniTex1 = new CGL.Uniform(tc.bgShader, "t", "texInput1", 4),
    uniTexFb1 = new CGL.Uniform(tc.bgShader, "t", "texFeedback1", 5);

inWidth.onChange =
    inLines.onChange =
    inReset.onTriggered= () => { needsSetSize = true; };

function setSize()
{
    numLines = Math.max(1, inLines.get());
    width = Math.max(1, inWidth.get());

    texRandoms = new CGL.Texture(cgl, { "isFloatingPointTexture": true, "name": "noisetexture" });

    randomCoords = new Float32Array(numLines * 4);
    genRandomTex();

    feedback0 = CGL.Texture.getEmptyTextureFloat(cgl);
    feedback1 = CGL.Texture.getEmptyTextureFloat(cgl);

    tc.setSize(width, numLines);
    feedback.setSize(width, numLines);

    tc.copy(CGL.Texture.getEmptyTextureFloat(cgl), CGL.Texture.getEmptyTextureFloat(cgl));
    feedback.copy(CGL.Texture.getEmptyTextureFloat(cgl), CGL.Texture.getEmptyTextureFloat(cgl));

    needsSetSize = false;
}

function genRandomTex()
{
    Math.randomSeed = inSeed.get();
    for (let i = 0; i < numLines; i++)
    {
        randomCoords[i * 4] = Math.seededRandom();
        randomCoords[i * 4 + 1] = Math.seededRandom();
        randomCoords[i * 4 + 2] = 0;
        randomCoords[i * 4 + 3] = 1;
    }

    texRandoms.initFromData(randomCoords, 1, numLines, CGL.Texture.FILTER_NEAREST, CGL.Texture.WRAP_REPEAT);
}

exec.onTriggered = () =>
{
    if (needsSetSize)setSize();
    pixelPos++;
    pixelPos %= width;

    if (!inTex0.get()) return;

    uniColumn.set(pixelPos);
    uniWidth.set(width);

    const shader = tc.bgShader;

    if (texRandoms.tex) shader.pushTexture(uniRandoms, texRandoms.tex);

    shader.pushTexture(uniTex0, inTex0.get().tex);
    if (feedback0.tex) shader.pushTexture(uniTexFb0, feedback0.tex);
    else shader.pushTexture(uniTexFb0, CGL.Texture.getEmptyTextureFloat(cgl).tex);

    if (inTex1.isLinked() && inTex1.get())
    {
        shader.pushTexture(uniTex1, inTex1.get());
        if (feedback.fb) shader.pushTexture(uniTexFb1, feedback.fb.getTextureColorNum(1));
    }

    const newTex = tc.copy(feedback0);

    tc.bgShader.popTextures();

    feedback.copy(newTex, tc.fb.getTextureColorNum(1));
    feedback0 = feedback.fb.getTextureColorNum(0);
    feedback1 = feedback.fb.getTextureColorNum(1);

    outFpTex.setRef(feedback0);
    outPass1.setRef(feedback1);

    next.trigger();
};

}
};






// **************************************************************
// 
// Ops.Gl.Performance
// 
// **************************************************************

Ops.Gl.Performance= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    exe = op.inTrigger("exe"),
    inActive = op.inValueBool("Active", true),
    inShow = op.inValueBool("Visible", true),
    inDoGpu = op.inValueBool("Measure GPU", true),
    next = op.outTrigger("childs"),
    position = op.inSwitch("Position", ["top", "bottom"], "top"),
    openDefault = op.inBool("Open", false),
    smoothGraph = op.inBool("Smooth Graph", true),
    inScaleGraph = op.inFloat("Scale", 3),
    inSizeGraph = op.inFloat("Size", 128),
    outCanv = op.outObject("Canvas"),
    outCounts = op.outObject("Count Per Second Data"),
    outFPS = op.outNumber("FPS");

const cgl = op.patch.cgl;
const element = document.createElement("div");

let elementMeasures = null;
let ctx = null;
let opened = false;
let frameCount = 0;
let fps = 0;
let fpsStartTime = 0;
let childsTime = 0;
let avgMsChilds = 0;
const queue = [];
const timesMainloop = [];
const timesOnFrame = [];
const timesGPU = [];
let avgMs = 0;
let selfTime = 0;
let canvas = null;
let lastTime = 0;
let loadingCounter = 0;
const loadingChars = ["|", "/", "-", "\\"];
let initMeasures = true;

const colorRAFSlow = "#007f9c";
const colorRAFVeruSlow = "#aaaaaa";
const colorBg = "#222222";
const colorRAF = "#003f5c"; // color: https://learnui.design/tools/data-color-picker.html
const colorMainloop = "#7a5195";
const colorOnFrame = "#ef5675";
const colorGPU = "#ffa600";

let startedQuery = false;

let currentTimeGPU = 0;
let currentTimeMainloop = 0;
let currentTimeOnFrame = 0;

op.toWorkPortsNeedToBeLinked(exe, next);

const gl = op.patch.cgl.gl;
const glQueryExt = gl.getExtension("EXT_disjoint_timer_query_webgl2");

inActive.onChange =
exe.onLinkChanged =
    inShow.onChange = () =>
    {
        updateOpened();
        updateVisibility();
    };

position.onChange = updatePos;
inSizeGraph.onChange = updateSize;

element.id = "performance";
element.style.position = "absolute";
element.style.left = "0px";
element.style.opacity = "0.8";
element.style.padding = "10px";
element.style.cursor = "pointer";
element.style.background = "#222";
element.style.color = "white";
element.style["font-family"] = "monospace";
element.style["font-size"] = "12px";
element.style["z-index"] = "99999";

element.innerHTML = "&nbsp;";
element.addEventListener("click", toggleOpened);

const container = op.patch.cgl.canvas.parentElement;
container.appendChild(element);

updateSize();
updateOpened();
updatePos();
updateVisibility();

op.onDelete = function ()
{
    if (canvas)canvas.remove();
    if (element)element.remove();
};

function updatePos()
{
    canvas.style["pointer-events"] = "none";
    if (position.get() == "top")
    {
        canvas.style.top = element.style.top = "0px";
        canvas.style.bottom = element.style.bottom = "initial";
    }
    else
    {
        canvas.style.bottom = element.style.bottom = "0px";
        canvas.style.top = element.style.top = "initial";
    }
}

function updateVisibility()
{
    if (!inShow.get() || !exe.isLinked() || !inActive.get())
    {
        element.style.display = "none";
        element.style.opacity = 0;
        canvas.style.display = "none";
    }
    else
    {
        element.style.display = "block";
        element.style.opacity = 1;
        canvas.style.display = "block";
    }
}

function updateSize()
{
    if (!canvas) return;

    const num = Math.max(0, parseInt(inSizeGraph.get()));

    canvas.width = num;
    canvas.height = num;
    element.style.left = num + "px";

    queue.length = 0;
    timesMainloop.length = 0;
    timesOnFrame.length = 0;
    timesGPU.length = 0;

    for (let i = 0; i < num; i++)
    {
        queue[i] = -1;
        timesMainloop[i] = -1;
        timesOnFrame[i] = -1;
        timesGPU[i] = -1;
    }
}

openDefault.onChange = function ()
{
    opened = openDefault.get();
    updateOpened();
};

function toggleOpened()
{
    if (!inShow.get()) return;
    element.style.opacity = 1;
    opened = !opened;
    updateOpened();
}

function updateOpened()
{
    updateText();
    if (!canvas)createCanvas();
    if (opened)
    {
        canvas.style.display = "block";
        element.style.left = inSizeGraph.get() + "px";
        element.style["min-height"] = "56px";
    }
    else
    {
        canvas.style.display = "none";
        element.style.left = "0px";
        element.style["min-height"] = "auto";
    }
}

function updateCanvas()
{
    const height = canvas.height;
    const hmul = inScaleGraph.get();

    ctx.fillStyle = colorBg;
    ctx.fillRect(0, 0, canvas.width, height);

    ctx.fillStyle = colorRAF;

    let k = 0;
    const numBars = Math.max(0, parseInt(inSizeGraph.get()));

    for (k = numBars; k >= 0; k--)
    {
        if (queue[k] > 30) ctx.fillStyle = colorRAFSlow;
        if (queue[k] > 60) ctx.fillStyle = colorRAFVeruSlow;

        ctx.fillRect(numBars - k, height - queue[k] * hmul, 1, queue[k] * hmul);
        if (queue[k] > 30)ctx.fillStyle = colorRAF;
    }

    for (k = numBars; k >= 0; k--)
    {
        let sum = 0;
        ctx.fillStyle = colorMainloop;
        sum = timesMainloop[k];
        ctx.fillRect(numBars - k, height - sum * hmul, 1, timesMainloop[k] * hmul);

        ctx.fillStyle = colorOnFrame;
        sum += timesOnFrame[k];
        ctx.fillRect(numBars - k, height - sum * hmul, 1, timesOnFrame[k] * hmul);

        ctx.fillStyle = colorGPU;
        sum += timesGPU[k];
        ctx.fillRect(numBars - k, height - sum * hmul, 1, timesGPU[k] * hmul);
    }

    for (let i = 10; i < height; i += 10)
    {
        ctx.fillStyle = "#888";
        const y = height - (i * hmul);
        ctx.fillRect(canvas.width - 5, y, 5, 1);
        ctx.font = "8px arial";

        ctx.fillText(i + "ms", canvas.width - 27, y + 3);
    }

    ctx.fillStyle = "#fff";
    ctx.fillRect(canvas.width - 5, height - (1000 / fps * hmul), 5, 1);
    ctx.fillText(Math.round(1000 / fps) + "ms", canvas.width - 27, height - (1000 / fps * hmul));
}

function createCanvas()
{
    canvas = document.createElement("canvas");
    canvas.id = "performance_" + op.patch.config.glCanvasId;
    canvas.width = inSizeGraph.get();
    canvas.height = inSizeGraph.get();
    canvas.style.display = "block";
    canvas.style.opacity = 0.9;
    canvas.style.position = "absolute";
    canvas.style.left = "0px";
    canvas.style.cursor = "pointer";
    canvas.style.top = "-64px";
    canvas.style["z-index"] = "99998";
    container.appendChild(canvas);
    ctx = canvas.getContext("2d");

    canvas.addEventListener("click", toggleOpened);

    updateSize();
}

function updateText()
{
    outCounts.setRef(op.patch.cgl.profileData.counts);

    if (!inShow.get()) return;
    let warn = "";

    if (op.patch.cgl.profileData.getCount("shaderCompile") > 0)warn += "Shader compile (" + op.patch.cgl.profileData.profileShaderCompileName + ") ";
    if (op.patch.cgl.profileData.getCount("uniformGet") > 0)warn += "Shader get uni loc! (" + op.patch.cgl.profileData.profileShaderGetUniformName + ")";
    if (op.patch.cgl.profileData.getCount("textureResize") > 0)warn += "Texture resize! ";
    if (op.patch.cgl.profileData.getCount("profileFrameBuffercreate") > 0)warn += "Framebuffer create! ";
    if (op.patch.cgl.profileData.getCount("effectBuffercreate") > 0)warn += "Effectbuffer create! " + op.patch.cgl.profileData.profileEffectBuffercreate;
    if (op.patch.cgl.profileData.getCount("textureDelete") > 0)warn += "Texture delete! ";
    if (op.patch.cgl.profileData.profileNonTypedAttrib > 0)warn += "Not-Typed Buffer Attrib! " + op.patch.cgl.profileData.profileNonTypedAttribNames;
    if (op.patch.cgl.profileData.getCount("texturecreated") > 0)warn += "new texture created! ";
    if (op.patch.cgl.profileData.getCount("textureGenMipMap") > 0)warn += "generating mip maps!";
    if (op.patch.cgl.profileData.getCount("videoPlaying") > 120)warn += " playing " + op.patch.cgl.profileData.getCount("videoPlaying") + " videos";

    if (warn.length > 0)
    {
        warn = "<br/><span style=\"color:#f80;\">WARNING: " + warn + "</span>";
    }

    let html = "";

    if (opened)
    {
        html += "<span style=\"color:" + colorRAF + "\">&block;</span> " + fps + " fps ";
        html += "<span style=\"color:" + colorMainloop + "\">&block;</span> " + Math.round(currentTimeMainloop * 100) / 100 + "ms mainloop ";
        html += "<span style=\"color:" + colorOnFrame + "\">&block;</span> " + Math.round((currentTimeOnFrame) * 100) / 100 + "ms onframe ";
        if (currentTimeGPU) html += "<span style=\"color:" + colorGPU + "\">&block;</span> " + Math.round(currentTimeGPU * 100) / 100 + "ms GPU";
        html += warn;
        element.innerHTML = html;
    }
    else
    {
        html += fps + " fps / ";
        html += "CPU: " + Math.round((op.patch.cgl.profileData.profileOnAnimFrameOps) * 100) / 100 + "ms / ";
        if (currentTimeGPU)html += "GPU: " + Math.round(currentTimeGPU * 100) / 100 + "ms  ";
        element.innerHTML = html;
    }

    if (op.patch.loading.getProgress() != 1.0)
    {
        element.innerHTML += "<br/>loading " + Math.round(op.patch.loading.getProgress() * 100) + "% " + loadingChars[(++loadingCounter) % loadingChars.length];
    }

    if (opened)
    {
        let count = 0;
        avgMs = 0;
        avgMsChilds = 0;
        for (let i = queue.length; i > queue.length - queue.length / 3; i--)
        {
            if (queue[i] > -1)
            {
                avgMs += queue[i];
                count++;
            }

            if (timesMainloop[i] > -1) avgMsChilds += timesMainloop[i];
        }

        avgMs /= count;
        avgMsChilds /= count;

        let str = "";
        str += "<br/> " + cgl.canvasWidth + " x " + cgl.canvasHeight + " (x" + cgl.pixelDensity + ") ";
        str += " frame avg: " + Math.round(avgMsChilds * 100) / 100 + " ms (" + Math.round(avgMsChilds / avgMs * 100) + "%) / " + Math.round(avgMs * 100) / 100 + " ms";
        // str += " (self: " + Math.round((selfTime) * 100) / 100 + " ms) ";

        str += "<br/>draw calls: " + Math.ceil(op.patch.cgl.profileData.counts.meshDrawCalls / fps);
        html += str;
        // element.innerHTML += "<br/>" +
        // " shader binds: " + Math.ceil(op.patch.cgl.profileData.profileShaderBinds / fps) +
        // " uniforms: " + Math.ceil(op.patch.cgl.profileData.profileUniformCount / fps) +
        // " mvp_uni_mat4: " + Math.ceil(op.patch.cgl.profileData.profileMVPMatrixCount / fps) +
        // " num glPrimitives: " + Math.ceil(op.patch.cgl.profileData.profileMeshNumElements / (fps)) +

        // " fenced pixelread: " + Math.ceil(op.patch.cgl.profileData.profileFencedPixelRead) +

        // " mesh.setGeom: " + op.patch.cgl.profileData.profileMeshSetGeom +
        // " videoPlaying: " + op.patch.cgl.profileData.getCount("videoPlaying");
        // " tex preview: " + op.patch.cgl.profileData.profileTexPreviews;

        // element.innerHTML +=
        // " draw meshes: " + Math.ceil(op.patch.cgl.profileData.profileMeshDraw / fps) +
        // " framebuffer blit: " + Math.ceil(op.patch.cgl.profileData.profileFramebuffer / fps);
        // " texeffect blit: " + Math.ceil(op.patch.cgl.profileData.profileTextureEffect / fps);

        html += "<br/>shader compiletime: " + (Math.round(op.patch.cgl.profileData.shaderCompileTime * 100) / 100) + "(" + op.patch.cgl.profileData.shaderCompileCount + ")";

        let memStr = "<br/>memory: ";
        if (performance && performance.memory && performance.memory.usedJSHeapSize)
            memStr += "js : " + Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + "mb";

        memStr += " tracked: cpu:" + Math.round(CABLES.memProfiler.getUsage() / 1024 / 1024) + "mb";
        memStr += " gpu:" + Math.round(CABLES.memProfiler.getUsageGpu() / 1024 / 1024) + "mb";
        html += memStr;

        element.innerHTML = html;
    }

    op.patch.cgl.profileData.clear();
}

function styleMeasureEle(ele)
{
    ele.style.padding = "0px";
    ele.style.margin = "0px";
}

function addMeasureChild(m, parentEle, timeSum, level)
{
    const height = 20;
    m.usedAvg = (m.usedAvg || m.used);

    if (!m.ele || initMeasures)
    {
        const newEle = document.createElement("div");
        m.ele = newEle;

        if (m.childs && m.childs.length > 0) newEle.style.height = "500px";
        else newEle.style.height = height + "px";

        newEle.style.overflow = "hidden";
        newEle.style.display = "inline-block";

        if (!m.isRoot)
        {
            newEle.innerHTML = "<div style=\"min-height:" + height + "px;width:100%;overflow:hidden;color:black;position:relative\">&nbsp;" + m.name + "</div>";
            newEle.style["background-color"] = "rgb(" + m.colR + "," + m.colG + "," + m.colB + ")";
            newEle.style["border-left"] = "1px solid black";
        }

        parentEle.appendChild(newEle);
    }

    if (!m.isRoot)
    {
        if (performance.now() - m.lastTime > 200)
        {
            m.ele.style.display = "none";
            m.hidden = true;
        }
        else
        {
            if (m.hidden)
            {
                m.ele.style.display = "inline-block";
                m.hidden = false;
            }
        }

        m.ele.style.float = "left";
        m.ele.style.width = Math.floor((m.usedAvg / timeSum) * 98.0) + "%";
    }
    else
    {
        m.ele.style.width = "100%";
        m.ele.style.clear = "both";
        m.ele.style.float = "none";
    }

    if (m && m.childs && m.childs.length > 0)
    {
        let thisTimeSum = 0;
        for (var i = 0; i < m.childs.length; i++)
        {
            m.childs[i].usedAvg = (m.childs[i].usedAvg || m.childs[i].used) * 0.95 + m.childs[i].used * 0.05;
            thisTimeSum += m.childs[i].usedAvg;
        }
        for (var i = 0; i < m.childs.length; i++)
        {
            addMeasureChild(m.childs[i], m.ele, thisTimeSum, level + 1);
        }
    }
}

function clearMeasures(p)
{
    for (let i = 0; i < p.childs.length; i++) clearMeasures(p.childs[i]);
    p.childs.length = 0;
}

function measures()
{
    if (!CGL.performanceMeasures) return;

    if (!elementMeasures)
    {
        op.log("create measure ele");
        elementMeasures = document.createElement("div");
        elementMeasures.style.width = "100%";
        elementMeasures.style["background-color"] = "#444";
        elementMeasures.style.bottom = "10px";
        elementMeasures.style.height = "100px";
        elementMeasures.style.opacity = "1";
        elementMeasures.style.position = "absolute";
        elementMeasures.style["z-index"] = "99999";
        elementMeasures.innerHTML = "";
        container.appendChild(elementMeasures);
    }

    let timeSum = 0;
    const root = CGL.performanceMeasures[0];

    for (let i = 0; i < root.childs.length; i++) timeSum += root.childs[i].used;

    addMeasureChild(CGL.performanceMeasures[0], elementMeasures, timeSum, 0);

    root.childs.length = 0;

    clearMeasures(CGL.performanceMeasures[0]);

    CGL.performanceMeasures.length = 0;
    initMeasures = false;
}

exe.onTriggered = render;

function render()
{
    const selfTimeStart = performance.now();

    if (inActive.get())
    {
        frameCount++;

        if (glQueryExt && inDoGpu.get() && inShow.get())op.patch.cgl.profileData.doProfileGlQuery = true;
        else op.patch.cgl.profileData.doProfileGlQuery = false;

        if (fpsStartTime === 0)fpsStartTime = Date.now();
        if (Date.now() - fpsStartTime >= 1000)
        {
        // query=null;
            fps = frameCount;
            frameCount = 0;
            // frames = 0;
            outFPS.set(fps);
            if (inShow.get())updateText();

            fpsStartTime = Date.now();
        }

        const glQueryData = op.patch.cgl.profileData.glQueryData;
        currentTimeGPU = 0;
        if (glQueryData)
        {
            let count = 0;
            for (let i in glQueryData)
            {
                count++;
                if (glQueryData[i].time && (performance.now() - glQueryData[i].lastTime) < 3000)
                    currentTimeGPU += glQueryData[i].time;
            }
        }

        if (inShow.get())
        {
            measures();

            if (opened && !op.patch.cgl.profileData.pause)
            {
            // const timeUsed = performance.now() - lastTime;
                queue.push(op.patch.cgl.profileData.profileFrameDelta);
                queue.shift();

                timesMainloop.push(childsTime);
                timesMainloop.shift();

                timesOnFrame.push(op.patch.cgl.profileData.profileOnAnimFrameOps - op.patch.cgl.profileData.profileMainloopMs);
                timesOnFrame.shift();

                timesGPU.push(currentTimeGPU);
                timesGPU.shift();

                updateCanvas();
            }
        }

        lastTime = performance.now();
        selfTime = performance.now() - selfTimeStart;

        outCanv.setRef(canvas);
    }
    const startTimeChilds = performance.now();

    next.trigger();

    if (inActive.get())
    {
        const nChildsTime = performance.now() - startTimeChilds;
        const nCurrentTimeMainloop = op.patch.cgl.profileData.profileMainloopMs;
        const nCurrentTimeOnFrame = op.patch.cgl.profileData.profileOnAnimFrameOps - op.patch.cgl.profileData.profileMainloopMs;

        if (smoothGraph.get())
        {
            childsTime = childsTime * 0.9 + nChildsTime * 0.1;
            currentTimeMainloop = currentTimeMainloop * 0.5 + nCurrentTimeMainloop * 0.5;
            currentTimeOnFrame = currentTimeOnFrame * 0.5 + nCurrentTimeOnFrame * 0.5;
        }
        else
        {
            childsTime = nChildsTime;
            currentTimeMainloop = nCurrentTimeMainloop;
            currentTimeOnFrame = nCurrentTimeOnFrame;
        }

        op.patch.cgl.profileData.clearGlQuery();
    }
}

}
};






// **************************************************************
// 
// Ops.Graphics.Meshes.Cross
// 
// **************************************************************

Ops.Graphics.Meshes.Cross= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    render = op.inTrigger("Render"),
    size = op.inValue("Size", 1),
    thick = op.inValue("Thickness", 0.25),
    target = op.inValueBool("Crosshair"),

    showLeft = op.inValueBool("Left", true),
    showRight = op.inValueBool("Right", true),
    showTop = op.inValueBool("Top", true),
    showBottom = op.inValueBool("Bottom", true),

    inDraw = op.inValueBool("Active", true),

    trigger = op.outTrigger("Next"),
    geomOut = op.outObject("Geometry");

const cgl = op.patch.cgl;
let geom = null;
let mesh = null;

inDraw.onChange = () => { op.setUiAttrib({ "extendTitle": inDraw.get() ? "" : "x" }); };

showLeft.onChange =
    showRight.onChange =
    showTop.onChange =
    showBottom.onChange =
    size.onChange =
    thick.onChange =
    target.onChange = buildMeshLater;

render.onTriggered = function ()
{
    if (!mesh)buildMesh();
    if (inDraw.get() && mesh) mesh.render();
    trigger.trigger();
};

function buildMesh()
{
    if (!geom)geom = new CGL.Geometry("crossmesh");
    geom.clear();

    let ext = size.get() / 2.0;
    let thi = thick.get();

    if (thi < 0.0)
    {
        thi = 0.0;
    }
    else if (thi > ext)
    {
        thi = ext;
    }

    if (ext < 0.0)
    {
        ext = 0.0;
        thi = 0.0;
    }

    // center verts
    let cx = thi;
    let cy = thi;

    // o is outer verts from center
    let ox = ext;
    let oy = ext;

    geom.vertices = [
        // center piece
        -cx, -cy, 0, // 0
        -cx, cy, 0, // 1
        cx, cy, 0, // 2
        cx, -cy, 0, // 3

        // left piece
        -ox, -cy, 0, // 4
        -ox, cy, 0, // 5
        -cx, cy, 0, // 6
        -cx, -cy, 0, // 7

        // right piece
        cx, -cy, 0, // 8
        cx, cy, 0, // 9
        ox, cy, 0, // 10
        ox, -cy, 0, // 11

        // top piece
        -cx, cy, 0, // 12
        -cx, oy, 0, // 13
        cx, oy, 0, // 14
        cx, cy, 0, // 15

        // bottom piece
        -cx, -oy, 0, // 12
        -cx, -cy, 0, // 13
        cx, -cy, 0, // 14
        cx, -oy, 0 // 15
    ];

    let texCoords = [];
    texCoords.length = (geom.vertices.length / 3.0) * 2.0;

    for (let i = 0; i < geom.vertices.length; i += 3)
    {
        let vx = (geom.vertices[i] / (ox) + 1) / 2;
        let vy = (geom.vertices[i + 1] / (oy) + 1) / 2;
        let index = (i / 3.0) * 2.0;

        texCoords[index] = vx;
        texCoords[index + 1] = vy;
    }

    geom.setTexCoords(texCoords);
    geom.tangents = geom.vertices.map(function (v, i) { return i % 3 == 0 ? 1 : 0; });
    geom.biTangents = geom.vertices.map(function (v, i) { return i % 3 == 1 ? 1 : 0; });
    geom.vertexNormals = geom.vertices.map(function (v, i) { return i % 3 == 2 ? 1 : 0; });

    geom.vertexNormals = [
        // center piece
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,

        // left
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        // right
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        // top
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        // bottom
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0
    ];

    if (target.get() == true)
    {
        // draws a crosshair
        geom.verticesIndices = [];
        // left
        if (showLeft.get())geom.verticesIndices.push(4, 5, 6, 4, 6, 7);
        // right
        if (showRight.get())geom.verticesIndices.push(8, 9, 10, 8, 10, 11);
        // top
        if (showTop.get())geom.verticesIndices.push(12, 13, 14, 12, 14, 15);
        // bottom
        if (showBottom.get())geom.verticesIndices.push(16, 17, 18, 16, 18, 19);
    }
    else
    {
        // draws a solid cross
        geom.verticesIndices = [
            // center
            2, 1, 0, 3, 2, 0];
        // left
        if (showLeft.get())geom.verticesIndices.push(6, 5, 4, 7, 6, 4);
        // right
        if (showRight.get())geom.verticesIndices.push(10, 9, 8, 11, 10, 8);
        // top
        if (showTop.get())geom.verticesIndices.push(14, 13, 12, 15, 14, 12);
        // bottom
        if (showBottom.get())geom.verticesIndices.push(18, 17, 16, 19, 18, 16);
    }

    if (geom.verticesIndices.length === 0)geom.verticesIndices.push(0, 0, 0);

    // mesh = new CGL.Mesh(cgl, geom);
    mesh = op.patch.cg.createMesh(geom, { "opId": op.id });
    geomOut.setRef(geom);
}

function buildMeshLater()
{
    if (mesh)mesh.dispose();
    mesh = null;
}

}
};






// **************************************************************
// 
// Ops.Ui.Area
// 
// **************************************************************

Ops.Ui.Area= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inTitle = op.inString("Title", ""),
    inDelete = op.inTriggerButton("Delete");

inTitle.setUiAttribs({ "hidePort": true });

op.setUiAttrib({ "hasArea": true });

op.init =
    inTitle.onChange =
    op.onLoaded = update;

update();

function update()
{
    if (CABLES.UI)
    {
        gui.savedState.setUnSaved("areaOp", op.getSubPatch());
        op.uiAttr(
            {
                "comment_title": inTitle.get() || " "
            });

        op.name = inTitle.get();
    }
}

inDelete.onTriggered = () =>
{
    op.patch.deleteOp(op.id);
};

}
};






// **************************************************************
// 
// Ops.String.SwitchString
// 
// **************************************************************

Ops.String.SwitchString= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    idx=op.inValueInt("Index"),
    result=op.outString("Result");

const valuePorts=[];

idx.onChange=update;

for(var i=0;i<10;i++)
{
    var p=op.inString("String "+i);
    valuePorts.push( p );
    p.onChange=update;
}

function update()
{
    if(idx.get()>=0 && valuePorts[idx.get()])
    {
        result.set( valuePorts[idx.get()].get() );
    }
}
}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.WaveformGradient_v4
// 
// **************************************************************

Ops.Gl.ImageCompose.WaveformGradient_v4= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"waveform_v2_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\nUNI float uFreq;\nUNI float uOffset;\nUNI float uPow;\nUNI float uRotate;\nUNI float amount;\n\nUNI float r;\nUNI float g;\nUNI float b;\n\n{{CGL.BLENDMODES3}}\n\n#define PI 3.14159265359\n#define TAU (2.0 * PI)\n\nvoid pR(inout vec2 p, float a)\n{\n    float s = sin(a),c=cos(a); p *= mat2(c,s,-s,c);\n}\n\nfloat pModMirror1(inout float p, float size) {\n\tfloat halfsize = size * 0.5;\n\tfloat c = floor((p + halfsize)/size);\n\tp = mod(p + halfsize,size) - halfsize;\n\tp *= mod(c, 2.0) * 2.0 - 1.0;\n\treturn c;\n}\n\nvoid main()\n{\n    vec2 uv = texCoord;\n    float v = 0.0;\n\n    uv -= 0.5;\n    pR(uv,TAU * uRotate);\n    uv += 0.5 + uOffset;\n\n    uv.x *= uFreq;\n\n    #ifdef MODE_SINE\n        uv.x += 0.5;\n        pModMirror1(uv.x,1.0);\n        v = pow(cos(PI * uv.x / 2.0),uPow);\n    #endif\n\n    #ifdef MODE_SAW\n        uv.x = mod(uv.x,1.0);\n        v = pow(min(cos(PI * uv.x /2.0),1.0 - abs(uv.x)),uPow);\n    #endif\n\n    #ifdef MODE_TRI\n        uv.x += 0.5;\n        pModMirror1(uv.x,1.0);\n        uv.x = -abs(uv.x);\n        uv.x = fract(uv.x);\n        v = pow(uv.x,uPow);\n    #endif\n\n    #ifdef MODE_SQR\n        pModMirror1(uv.x,1.0);\n        uv.x = -abs(uv.x);\n        uv.x = fract(uv.x);\n        v = step(uv.x,uPow);\n    #endif\n\n    vec4 col = vec4(vec3(v*r,v*g,v*b),1.0);\n    vec4 base = texture(tex,texCoord);\n\n    outColor = cgl_blendPixel(base,col,amount);\n}\n",};
const
    render = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),
    amount = op.inValueSlider("Amount", 1),
    mode = op.inValueSelect("Mode", ["Sine", "Sawtooth", "Triangle", "Square"], "Sine"),
    freq = op.inValue("Frequency", 4),
    pow = op.inValue("Pow factor", 6),
    offset = op.inValue("Offset", 0),
    rotate = op.inFloatSlider("Rotate", 0),
    r = op.inValueSlider("r", 1.0),
    g = op.inValueSlider("g", 1.0),
    b = op.inValueSlider("b", 1.0),
    trigger = op.outTrigger("trigger");

op.setPortGroup("Waveform", [mode, freq, pow, offset, rotate]);
op.setPortGroup("Color", [r, g, b]);
r.setUiAttribs({ "colorPick": true });

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.waveform_v2_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    freqUniform = new CGL.Uniform(shader, "f", "uFreq", freq),
    offsetUniform = new CGL.Uniform(shader, "f", "uOffset", offset),
    powUniform = new CGL.Uniform(shader, "f", "uPow", pow),
    rotateUniform = new CGL.Uniform(shader, "f", "uRotate", rotate),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    uniformR = new CGL.Uniform(shader, "f", "r", r),
    uniformG = new CGL.Uniform(shader, "f", "g", g),
    uniformB = new CGL.Uniform(shader, "f", "b", b);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);
mode.onChange = updateMode;
updateMode();

function updateMode()
{
    shader.toggleDefine("MODE_SAW", mode.get() == "Sawtooth");
    shader.toggleDefine("MODE_SINE", mode.get() == "Sine");
    shader.toggleDefine("MODE_TRI", mode.get() == "Triangle");
    shader.toggleDefine("MODE_SQR", mode.get() == "Square");
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.Twirl_v4
// 
// **************************************************************

Ops.Gl.ImageCompose.Twirl_v4= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"twirl_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\nUNI float amount;\nUNI float twistAmount;\nUNI float times;\nUNI float radius;\nUNI float centerX;\nUNI float centerY;\nUNI float aspect;\n\n{{CGL.BLENDMODES3}}\n\nvoid main()\n{\n    vec2 center=vec2(centerX,centerY);\n    center =((center+1.0)/2.0);\n    vec2 tc = texCoord;\n    tc -= center;\n\n    float dist = length(vec2(tc.x,tc.y/aspect));\n    if (dist < radius)\n    {\n        float percent = (radius - dist) / radius;\n        float theta = percent * percent * twistAmount * 8.0;\n        float s = sin(theta);\n        float c = cos(theta);\n        tc = vec2(dot(tc, vec2(c, -s)), dot(tc, vec2(s, c)));\n    }\n    tc += center;\n\n    vec4 col = texture(tex, tc);\n    vec4 base=texture(tex,texCoord);\n    outColor=cgl_blendPixel(base,col,amount);\n}\n",};
const render = op.inTrigger("Render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    twistAmount = op.inValue("Twist amount", 500),
    radius = op.inValue("Radius", 0.5),
    centerX = op.inValue("Center X", 0),
    centerY = op.inValue("Center Y", 0),
    trigger = op.outTrigger("Next");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.twirl_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    uniTwistAmount = new CGL.Uniform(shader, "f", "twistAmount", 1),
    uniRadius = new CGL.Uniform(shader, "f", "radius", radius),
    uniAspect = new CGL.Uniform(shader, "f", "aspect", 1),
    unicenterX = new CGL.Uniform(shader, "f", "centerX", centerX),
    unicenterY = new CGL.Uniform(shader, "f", "centerY", centerY);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    let texture = cgl.currentTextureEffect.getCurrentSourceTexture();

    uniTwistAmount.setValue(twistAmount.get() * (1 / texture.width));
    uniAspect.setValue(cgl.currentTextureEffect.aspectRatio);

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.RotateTexture_v2
// 
// **************************************************************

Ops.Gl.ImageCompose.RotateTexture_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"rotate_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\nUNI sampler2D multiplierTex;\nUNI float amount;\nUNI float resX;\nUNI float resY;\nUNI float rotate;\n\n{{CGL.BLENDMODES3}}\n\n#define PI 3.14159265\n#define TAU (2.0*PI)\n\nvoid pR(inout vec2 p, float a)\n{\n\tp = cos(a)*p + sin(a)*vec2(p.y, -p.x);\n}\n\nvoid main()\n{\n    float multiplier = 0.0;\n\n    #ifdef ROTATE_TEXTURE\n        multiplier = dot(vec3(0.2126,0.7152,0.0722), texture(multiplierTex,texCoord).rgb);\n    #endif\n\n    vec2 uv = texCoord;\n    vec2 res = vec2(resX,resY);\n    uv -= 0.5;\n    pR(uv.xy,(rotate + multiplier) * (TAU)  );\n    uv += 0.5;\n\n\n\n    vec4 col=texture(tex,uv);\n    vec4 base=texture(tex,texCoord);\n\n    #ifdef CLEAR\n        base.a=0.0;\n    #endif\n\n\n    #ifdef CROP_IMAGE\n    if(uv.x>1.0 ||uv.x<0.0  || uv.y>1.0 ||uv.y<0.0 )\n    {\n        base.a=0.0;\n        col.a=0.0;\n        // discard;\n        // return;\n    }\n    #endif\n\n    outColor=cgl_blendPixel(base,col,amount);\n}",};
const render = op.inTrigger("render"),
    multiplierTex = op.inTexture("Multiplier"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    inRotate = op.inValueSlider("Rotate", 0.125),
    crop = op.inValueBool("Crop", true),
    inClear = op.inBool("Clear", true),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.rotate_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    textureMultiplierUniform = new CGL.Uniform(shader, "t", "multiplierTex", 1),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    rotateUniform = new CGL.Uniform(shader, "f", "rotate", inRotate);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

crop.onChange =
    multiplierTex.onChange = updateDefines;

updateDefines();

function updateDefines()
{
    shader.toggleDefine("CLEAR", inClear.get());
    shader.toggleDefine("CROP_IMAGE", crop.get());
    shader.toggleDefine("ROTATE_TEXTURE", multiplierTex.isLinked());
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    if (multiplierTex.get()) cgl.setTexture(1, multiplierTex.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.Vignette_v3
// 
// **************************************************************

Ops.Gl.ImageCompose.Vignette_v3= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"vignette_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\nUNI float lensRadius1;\nUNI float aspect;\nUNI float amount;\nUNI float strength;\nUNI float sharp;\n\nUNI vec3 vcol;\n\n{{CGL.BLENDMODES3}}\n\nvoid main()\n{\n    vec4 base=texture(tex,texCoord);\n    vec4 vvcol=vec4(vcol,1.0);\n    vec4 col=texture(tex,texCoord);\n    vec2 tcPos=vec2(texCoord.x,(texCoord.y-0.5)*aspect+0.5);\n    float dist = distance(tcPos, vec2(0.5,0.5));\n    float am = (1.0-smoothstep( (lensRadius1+0.5), (lensRadius1*0.99+0.5)*sharp, dist));\n\n    col=mix(col,vvcol,am*strength);\n\n    #ifndef ALPHA\n        outColor=cgl_blendPixel(base,col,amount);\n    #endif\n\n    #ifdef ALPHA\n        outColor=vec4(base.rgb,base.a*(1.0-am*strength));\n    #endif\n}\n",};
const
    render = op.inTrigger("Render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),
    amount = op.inValueSlider("Amount", 1),
    trigger = op.outTrigger("Trigger"),
    strength = op.inValueSlider("Strength", 1),
    lensRadius1 = op.inValueSlider("Radius", 0.3),
    sharp = op.inValueSlider("Sharp", 0.25),
    aspect = op.inValue("Aspect", 1),
    r = op.inValueSlider("r", 0),
    g = op.inValueSlider("g", 0),
    b = op.inValueSlider("b", 0),
    alpha = op.inBool("Alpha", false);

r.setUiAttribs({ "colorPick": true });

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "vignette");

shader.setSource(shader.getDefaultVertexShader(), attachments.vignette_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    uniLensRadius1 = new CGL.Uniform(shader, "f", "lensRadius1", lensRadius1),
    uniaspect = new CGL.Uniform(shader, "f", "aspect", aspect),
    unistrength = new CGL.Uniform(shader, "f", "strength", strength),
    unisharp = new CGL.Uniform(shader, "f", "sharp", sharp),
    unir = new CGL.Uniform(shader, "3f", "vcol", r, g, b);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);

alpha.onChange = updateDefines;
updateDefines();

function updateDefines()
{
    shader.toggleDefine("ALPHA", alpha.get());

    r.setUiAttribs({ "greyout": alpha.get() });
    g.setUiAttribs({ "greyout": alpha.get() });
    b.setUiAttribs({ "greyout": alpha.get() });
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Gl.ShaderEffects.VertexPositionFromTexture_v2
// 
// **************************************************************

Ops.Gl.ShaderEffects.VertexPositionFromTexture_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"vertposbody_vert":"vec4 col=texture(MOD_tex,texCoord);\n\nvec3 MOD_pos=col.xyz;\n\n#ifdef MOD_ADD\npos.xyz+=MOD_pos.xyz;\n#endif\n\n#ifdef MOD_ABS\npos.xyz=MOD_pos.xyz;\n#endif\n\n",};
const
    render = op.inTrigger("render"),
    inTex = op.inTexture("Texture"),
    inMode = op.inSwitch("Mode", ["Absolute", "Add"], "Absolute"),
    trigger = op.outTrigger("Trigger");

const cgl = op.patch.cgl;

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "priority": 2,
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": "",
    "srcBodyVert": attachments.vertposbody_vert
});

mod.addUniformVert("t", "MOD_tex");
inMode.onChange = updateDefines;
render.onTriggered = doRender;
updateDefines();

function updateDefines()
{
    mod.toggleDefine("MOD_ADD", inMode.get() == "Add");
    mod.toggleDefine("MOD_ABS", inMode.get() == "Absolute");
}

function doRender()
{
    mod.bind();
    if (inTex.get())mod.pushTexture("MOD_tex", inTex.get().tex);

    trigger.trigger();
    mod.unbind();
}

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.CircleTexture_v4
// 
// **************************************************************

Ops.Gl.ImageCompose.CircleTexture_v4= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"circle_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\n\nUNI float amount;\nUNI float size;\nUNI float inner;\nUNI float fadeOut;\n\nUNI float r;\nUNI float g;\nUNI float b;\nUNI float a;\nUNI float aspect;\nUNI vec2 stretch;\n\n\nUNI float x;\nUNI float y;\n\n{{CGL.BLENDMODES3}}\n\nfloat dist(float x,float y,float x2,float y2)\n{\n\tfloat xd = x2-x;\n\tfloat yd = y2-y;\n\treturn abs(sqrt(xd*xd*(1.0-stretch.x) + yd*yd*(1.0-stretch.y)));\n}\n\nvoid main()\n{\n    vec4 base=texture(tex,texCoord);\n\n    vec4 col=vec4(r,g,b,1.0);\n    float dist = dist(x,y/aspect,(texCoord.x-0.5)*2.0,(texCoord.y-0.5)*2.0/aspect);\n\n    float sz=size*0.5/aspect;\n    float v=0.0;\n    float fade=fadeOut;\n\n    if(fade==0.0)\n    {\n        if(dist<sz && dist>inner*sz) v=(smoothstep(0.0,1.0,(dist-(inner*sz))/(fade)));\n    }\n\n    if(fade>=0.0)\n    {\n\n        #ifdef FALLOFF_SMOOTHSTEP\n            if(dist>inner*sz && dist<sz+fade)v=1.0-(smoothstep(0.0,1.0,(dist-sz)/(fade)));\n        #endif\n        #ifndef FALLOFF_SMOOTHSTEP\n            fade+=0.0001;\n            if(dist>inner*sz && dist<sz+fade)v=1.0-((dist-sz)/(fade));\n            v=pow(v,5.0);\n        #endif\n    }\n\n    v=clamp(v,0.0,1.0);\n\n    outColor=cgl_blendPixel(base,col,amount*v);\n\n    outColor.a-=(1.0-a)*v;\n\n    #ifdef WARN_OVERFLOW\n        float width=0.01;\n        if( texCoord.x>(1.0-width) || texCoord.y>(1.0-width) || texCoord.y<width || texCoord.x<width )\n            if(v>0.001*amount)outColor= vec4(1.0,0.0,0.0, 1.0);\n    #endif\n}\n",};
const
    render = op.inTrigger("Render"),
    amount = op.inValueSlider("Amount", 1),
    blendMode = CGL.TextureEffect.AddBlendSelect(op),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),
    inSize = op.inValueSlider("Size", 0.25),
    inInner = op.inValueSlider("Inner"),
    inStretchX = op.inFloat("Stretch X"),
    inStretchY = op.inFloat("Stretch Y"),
    inX = op.inValue("Pos X", 0),
    inY = op.inValue("Pos Y", 0),
    fallOff = op.inValueSelect("fallOff", ["Linear", "SmoothStep"], "Linear"),
    inFadeOut = op.inValueSlider("fade Out"),
    warnOverflow = op.inValueBool("warn overflow", false),
    r = op.inValueSlider("r", 1),
    g = op.inValueSlider("g", 1),
    b = op.inValueSlider("b", 1),
    a = op.inValueSlider("a", 1),
    trigger = op.outTrigger("Next");

r.setUiAttribs({ "colorPick": true });

op.setPortGroup("Size", [inSize, inInner, inStretchX, inStretchY]);
op.setPortGroup("Position", [inX, inY]);
op.setPortGroup("Style", [warnOverflow, fallOff, inFadeOut]);

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, "textureeffect stripes");
shader.setSource(shader.getDefaultVertexShader(), attachments.circle_frag);

updateDefines();

let
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    uniStretch = new CGL.Uniform(shader, "2f", "stretch", inStretchX, inStretchY),
    uniSize = new CGL.Uniform(shader, "f", "size", inSize),
    uniFadeOut = new CGL.Uniform(shader, "f", "fadeOut", inFadeOut),
    uniInner = new CGL.Uniform(shader, "f", "inner", inInner),
    aspect = new CGL.Uniform(shader, "f", "aspect", 1),
    uniformR = new CGL.Uniform(shader, "f", "r", r),
    uniformG = new CGL.Uniform(shader, "f", "g", g),
    uniformB = new CGL.Uniform(shader, "f", "b", b),
    uniformA = new CGL.Uniform(shader, "f", "a", a),
    uniformX = new CGL.Uniform(shader, "f", "x", inX),
    uniformY = new CGL.Uniform(shader, "f", "y", inY);

fallOff.onChange =
    warnOverflow.onChange = updateDefines;

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);

function updateDefines()
{
    shader.toggleDefine("FALLOFF_LINEAR", fallOff.get() == "Linear");
    shader.toggleDefine("FALLOFF_SMOOTHSTEP", fallOff.get() == "SmoothStep");
    shader.toggleDefine("WARN_OVERFLOW", warnOverflow.get());
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    aspect.set(cgl.currentTextureEffect.aspectRatio);

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Math.Compare.LessThan
// 
// **************************************************************

Ops.Math.Compare.LessThan= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const number1 = op.inValue("number1");
const number2 = op.inValue("number2");
const result = op.outBoolNum("result");

op.setUiAttribs({ "mathTitle": true });

number1.onChange = exec;
number2.onChange = exec;
exec();

function exec()
{
    result.set(number1.get() < number2.get());
}

}
};






// **************************************************************
// 
// Ops.Trigger.TriggerButton
// 
// **************************************************************

Ops.Trigger.TriggerButton= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inTrig = op.inTriggerButton("Trigger"),
    outTrig = op.outTrigger("Next");

inTrig.onTriggered = function ()
{
    outTrig.trigger();
};

}
};






// **************************************************************
// 
// Ops.Trigger.TriggerOnce
// 
// **************************************************************

Ops.Trigger.TriggerOnce= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    exe = op.inTriggerButton("Exec"),
    reset = op.inTriggerButton("Reset"),
    next = op.outTrigger("Next"),
    outTriggered = op.outBoolNum("Was Triggered");

let triggered = false;

op.toWorkPortsNeedToBeLinked(exe);

reset.onTriggered = function ()
{
    triggered = false;
    outTriggered.set(triggered);
};

exe.onTriggered = function ()
{
    if (triggered) return;

    triggered = true;
    next.trigger();
    outTriggered.set(triggered);
};

}
};





window.addEventListener('load', function(event) {
CABLES.jsLoaded=new Event('CABLES.jsLoaded');
document.dispatchEvent(CABLES.jsLoaded);
});
