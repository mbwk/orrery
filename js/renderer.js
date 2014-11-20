function initGL(canvas) {
    var gl;
    try {
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
        console.log(e);
    }

    if (!gl) {
        gl = null;
        console.log("[error] failed to initialize WebGL context");
    }

    return gl;
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function initGLSL(shaders) {
    shaders.srcs = {};

    shaders.srcs.fragment = "precision mediump float;\n" +
"\n" +
"    varying vec2 vTextureCoord;\n" +
"    varying vec3 vLightWeighting;\n" +
"\n" +
"    uniform sampler2D uSampler;\n" +
"\n" +
"    void main(void) {\n" +
"        vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));\n" +
"        gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a);\n" +
"    }\n";

    shaders.srcs.vertex = "attribute vec3 aVertexPosition;\n" +
"    attribute vec3 aVertexNormal;\n" +
"    attribute vec2 aTextureCoord;\n" +
"\n" +
"    uniform mat4 uMVMatrix;\n" +
"    uniform mat4 uPMatrix;\n" +
"    uniform mat3 uNMatrix;\n" +
"\n" +
"    uniform vec3 uAmbientColor;\n" +
"\n" +
"    uniform vec3 uLightingDirection;\n" +
"    uniform vec3 uDirectionalColor;\n" +
"\n" +
// "    uniform bool uUseLighting;\n" +
"\n" +
"    varying vec2 vTextureCoord;\n" +
"    varying vec3 vLightWeighting;\n" +
"\n" +
"    void main(void) {\n" +
"        gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\n" +
"        vTextureCoord = aTextureCoord;\n" +
"\n" +
// "        if (!uUseLighting) {\n" +
// "            vLightWeighting = vec3(1.0, 1.0, 1.0);\n" +
// "        } else {\n" +
"            vec3 transformedNormal = uNMatrix * aVertexNormal;\n" +
"            float directionalLightWeighting = max(dot(transformedNormal, uLightingDirection), 0.0);\n" +
"            vLightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting;\n" +
// "        }\n" +
"    }\n";

    return shaders;
}

function compileShaders(gl, shaders) {
    shaders.objs = {};

    shaders.objs.fragment = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(shaders.objs.fragment, shaders.srcs.fragment);
    gl.compileShader(shaders.objs.fragment);

    if (!gl.getShaderParameter(shaders.objs.fragment, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shaders.objs.fragment));
    }

    shaders.objs.vertex = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(shaders.objs.vertex, shaders.srcs.vertex);
    gl.compileShader(shaders.objs.vertex);

    if (!gl.getShaderParameter(shaders.objs.vertex, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shaders.objs.vertex));
    }

    return shaders;
}

function linkShaders(gl, shaders) {
    shaders.program = gl.createProgram();
    gl.attachShader(shaders.program, shaders.objs.vertex);
    gl.attachShader(shaders.program, shaders.objs.fragment);
    gl.linkProgram(shaders.program);

    if (!gl.getProgramParameter(shaders.program, gl.LINK_STATUS)) {
        alert("Failed to initialize shaders");
    }

    gl.useProgram(shaders.program);

    shaders.program.vertexPositionAttribute = gl.getAttribLocation(shaders.program, "aVertexPosition");
    gl.enableVertexAttribArray(shaders.program.vertexPositionAttribute);

    shaders.program.textureCoordAttribute = gl.getAttribLocation(shaders.program, "aTextureCoord");
    gl.enableVertexAttribArray(shaders.program.textureCoordAttribute);

    shaders.program.vertexNormalAttribute = gl.getAttribLocation(shaders.program, "aVertexNormal");
    gl.enableVertexAttribArray(shaders.program.vertexNormalAttribute);

    shaders.program.pMatrixUniform = gl.getUniformLocation(shaders.program, "uPMatrix");
    shaders.program.mvMatrixUniform = gl.getUniformLocation(shaders.program, "uMVMatrix");
    shaders.program.nMatrixUniform = gl.getUniformLocation(shaders.program, "uNMatrix");
    shaders.program.samplerUniform = gl.getUniformLocation(shaders.program, "uSampler");
    // shaders.program.useLightingUniform = gl.getUniformLocation(shaders.program, "uUseLighting");
    shaders.program.ambientColorUniform = gl.getUniformLocation(shaders.program, "uAmbientColor");
    shaders.program.lightingDirectionUniform = gl.getUniformLocation(shaders.program, "uLightingDirection");
    shaders.program.directionalColorUniform = gl.getUniformLocation(shaders.program, "uDirectionalColor");
}

function handleLoadedTexture(gl, texture) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindTexture(gl.TEXTURE_2D, null);
}

function initTexture(gl, texture, name) {
    texture.image = new Image();
    texture.image.onload = function () {
        handleLoadedTexture(gl, texture);
    }
    texture.image.src = "textures/" + name;
}

function initTextures(gl, textures) {
    textures.store = {};

    var filenames = [ "sunmap.jpg", "earthmap1k.jpg", "moon.gif" ];

    for (var i in filenames) {
        var name = filenames[i];
        textures.store[name] = gl.createTexture();
        initTexture(gl, textures.store[name], name);
    }
}

function initCamera(camera) {
    camera.MAX_TURNSPEED = 0.15;
    camera.MAX_MOVESPEED = 0.009;

    camera.pitch = 0;
    camera.pitchRate = 0;

    camera.yaw = 0;
    camera.yawRate = 0;

    camera.xPos = 0.0;
    camera.yPos = 0.0;
    camera.zPos = -1.0;

    camera.speed = 0;
    camera.strafe = 0;
}

function initControls(controls, camera) {
}

function Renderer() {
    var rdr = {};

    rdr.canvas = document.getElementById("glcanvas");
    rdr.gl = initGL(rdr.canvas);

    rdr.shaders = {};
    initGLSL(rdr.shaders);
    compileShaders(rdr.gl, rdr.shaders);
    linkShaders(rdr.gl, rdr.shaders);

    rdr.textures = {};
    initTextures(rdr.gl, rdr.textures);

    rdr.lookupTexture = function (texture_name) {
        if (rdr.textures.store[texture_name]) {
            return rdr.textures.store[texture_name];
        } else {
            console.log("404 texture not found");
            return null;
        }
    };

    rdr.camera = {};
    rdr.controls = {};
    rdr.controls.currentlyPressedKeys = {};
    initCamera(rdr.camera);
    initControls(rdr.controls);

    rdr.controls.handleKeyDown = function (event) {
        rdr.controls.currentlyPressedKeys[event.keyCode] = true;
    };

    rdr.controls.handleKeyUp = function (event) {
        rdr.controls.currentlyPressedKeys[event.keyCode] = false;
    };

    rdr.controlCamera = function () {
        // pitch controls
        if (rdr.controls.currentlyPressedKeys[33]) { // Page Up
            rdr.camera.pitchRate = rdr.camera.MAX_TURNSPEED;
        } else if (rdr.controls.currentlyPressedKeys[34]) { // Page Down
            rdr.camera.pitchRate = -1 * rdr.camera.MAX_TURNSPEED;
        } else {
            rdr.camera.pitchRate = 0;
        }

        // yaw controls
        if (rdr.controls.currentlyPressedKeys[81]) {
            rdr.camera.yawRate = rdr.camera.MAX_TURNSPEED;
        } else if (rdr.controls.currentlyPressedKeys[69]) {
            rdr.camera.yawRate = -1 * rdr.camera.MAX_TURNSPEED;
        } else {
            rdr.camera.yawRate = 0;
        }

        // forward and backward movement
        if (rdr.controls.currentlyPressedKeys[38] || rdr.controls.currentlyPressedKeys[87]) { // Up arrow or 'W' keys
            if (rdr.camera.speed < rdr.camera.MAX_MOVESPEED) {
                rdr.camera.speed += 0.001;
            }
        } else if (rdr.controls.currentlyPressedKeys[40] || rdr.controls.currentlyPressedKeys[83]) { // Down arrow or 'S' keys
            if (rdr.camera.speed > -1 * rdr.camera.MAX_MOVESPEED) {
                rdr.camera.speed -= 0.001;
            }
        } else {
            if (rdr.camera.speed > 0) {
                rdr.camera.speed -= 0.001;
            } else if (rdr.camera.speed < 0) {
                rdr.camera.speed += 0.001;
            } else if (rdr.camera.speed < 0.001 && rdr.camera.speed > -0.001) {
                rdr.camera.speed = 0;
            }
        }

        // strafe movement
        if (rdr.controls.currentlyPressedKeys[37] || rdr.controls.currentlyPressedKeys[65]) { // Left arrow or 'A' keys
            if (rdr.camera.strafe < rdr.camera.MAX_MOVESPEED) {
                rdr.camera.strafe += 0.001;
            }
        } else if (rdr.controls.currentlyPressedKeys[39] || rdr.controls.currentlyPressedKeys[68]) { // Right arrow or 'D' keys
            if (rdr.camera.strafe > -1 * rdr.camera.MAX_MOVESPEED) {
                rdr.camera.strafe -= 0.001;
            }
        } else {
            if (rdr.camera.strafe > 0) {
                rdr.camera.strafe -= 0.001;
            } else if (rdr.camera.strafe < 0) {
                rdr.camera.strafe += 0.001;
            } else if (rdr.camera.strafe < 0.001 && rdr.camera.strafe > -0.001) {
                rdr.camera.strafe = 0;
            }
        }
    };

    rdr.updateCamera = function (elapsed) {
        if (rdr.camera.speed != 0) {
            var pitchMult = (90 - Math.abs(rdr.camera.pitch)) / 90;

            rdr.camera.xPos -= Math.sin(degToRad(rdr.camera.yaw)) * (rdr.camera.speed * pitchMult) * elapsed;
            rdr.camera.zpos -= Math.cos(degToRad(rdr.camera.yaw)) * (rdr.camera.speed * pitchMult) * elapsed;

            rdr.camera.xPos -= Math.sin(degToRad(rdr,camera.yaw + 90)) * rdr.camera.strafe * elapsed;
            rdr.camera.zPos -= Math.cos(degToRad(rdr.camera.yaw + 90)) * rdr.camera.strafe * elapsed;

            rdr.camera.yPos += Math.sin(degToRad(rdr.camera.pitch)) * rdr.camera.speed * elapsed;
        }

        rdr.camera.yaw += rdr.camera.yawRate * elapsed;
        rdr.camera.pitch += rdr.camera.pitchRate * elapsed;

        if (rdr.camera.pitch > 90.0) {
            rdr.camera.pitch = 90.0;
        } else if (rdr.pitch < -90.0) {
            rdr.camera.pitch = -90.0;
        }
    };

    // model-view and projection matrices
    rdr.mvMatrix = mat4.create();
    rdr.mvMatrixStack = [];
    rdr.pMatrix = mat4.create();
    
    rdr.mvPushMatrix = function () {
        var copy = mat4.create();
        mat4.set(rdr.mvMatrix, copy);
        rdr.mvMatrixStack.push(copy);
    };

    rdr.mvPopMatrix = function () {
        if (rdr.mvMatrixStack.length < 1) {
            throw "Invalid pop operation...";
        }
        rdr.mvMatrix = mvMatrixStack.pop();
    };

    rdr.setMatrixUniforms = function () {
        rdr.gl.uniformMatrix4fv(rdr.shaders.program.pMatrixUniform, false, rdr.pMatrix);
        rdr.gl.uniformMatrix4fv(rdr.shaders.program.mvMatrixUniform, false, rdr.mvMatrix);

        var normalMatrix = mat3.create();
        mat4.toInverseMat3(rdr.mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        rdr.gl.uniformMatrix3fv(rdr.shaders.program.nMatrixUniform, false, normalMatrix);
    };

    rdr.spheres = [];
    rdr.prepared = false;

    rdr.updateSphere = function (body, sphere) {
        // position in world space
        sphere.x = body.xPos;
        sphere.y = body.yPos;
        sphere.z = body.zPos;

        // rotation matrix
        var deltaX = body.diffX();
        var deltaY = body.diffY();
        var newRotationMatrix = mat4.create();
        mat4.identity(newRotationMatrix);
        mat4.rotate(newRotationMatrix, degToRad(deltaX / 10), [0, 1, 0]);
        mat4.rotate(newRotationMatrix, degToRad(deltaY / 10), [1, 0, 0]);
        mat4.multiply(newRotationMatrix, sphere.rotationMatrix, sphereRotationMatrix);

        // buffers
    };
    rdr.updateSystem = function (bodies) {
        // first time running this function?
        if (!rdr.prepared) {
            rdr.prepareSystem(bodies);
        }
    };

    rdr.prepareSphere = function (body) {
        var sphere = {};

        // texture
        sphere.texture = body._texture;

        // attr
        sphere.x = body.xPos;
        sphere.y = body.yPos;
        sphere.z = body.zPos;
        sphere.radius = body.radius;

        // rotation
        sphere.rotationMatrix = mat4.create();
        mat4.identity(sphere.rotationMatrix);

        // buffers
        var latitudeBands = 30;
        var longitudeBands = 30;

        var vertexPositionData = [];
        var normalData = [];
        var textureCoordData = [];

        for (var latNumber = 0; latNumber <= latitudeBands; ++latNumber) {
            var theta = latNumber * Math.PI / latitudeBands;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            for (var lonNumber = 0; lonNumber <= longitudeBands; ++lonNumber) {
                var phi = lonNumber * 2 * Math.PI / longitudeBands;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);

                var x = cosPhi * sinTheta;
                var y = cosTheta;
                var z = sinPhi * sinTheta;
                var u = 1 - (lonNumber / longitudeBands);
                var v = 1 - (latNumber / latitudeBands);

                normalData.push(x);
                normalData.push(y);
                normalData.push(z);
                textureCoordData.push(u);
                textureCoordData.push(v);
                vertexPositionData.push(sphere.radius * x);
                vertexPositionData.push(sphere.radius * y);
                vertexPositionData.push(sphere.radius * z);
            }
        }

        var indexData = [];

        for (var latNumber = 0; latNumber < latitudeBands; ++latNumber) {
            for (var lonNumber = 0; lonNumber < longitudeBands; ++lonNumber) {
                var first = (latNumber * (longitudeBands + 1)) + lonNumber;
                var second = first + longitudeBands + 1;
                indexData.push(first);
                indexData.push(second);
                indexData.push(first + 1);

                indexData.push(second);
                indexData.push(second + 1);
                indexData.push(first + 1);
            }
        }

        sphere.vertexNormalBuffer = rdr.gl.createBuffer();
        sphere.vertexTextureCoordBuffer = rdr.gl.createBuffer();
        sphere.vertexPositionBuffer = rdr.gl.createBuffer();
        sphere.vertexIndexBuffer = rdr.gl.createBuffer();

        // normal
        rdr.gl.bindBuffer(rdr.gl.ARRAY_BUFFER, sphere.vertexNormalBuffer);
        rdr.gl.bufferData(rdr.gl.ARRAY_BUFFER, new Float32Array(normalData), rdr.gl.STATIC_DRAW);
        sphere.vertexNormalBuffer.itemSize = 3;
        sphere.vertexNormalBuffer.numItems = normalData.length / 3;

        // texture
        rdr.gl.bindBuffer(rdr.gl.ARRAY_BUFFER, sphere.vertexTextureCoordBuffer);
        rdr.gl.bufferData(rdr.gl.ARRAY_BUFFER, new Float32Array(textureCoordData), rdr.gl.STATIC_DRAW);
        sphere.vertexTextureCoordBuffer.itemSize = 2;
        sphere.vertexTextureCoordBuffer.numItems = textureCoordData.length / 2;

        // position
        rdr.gl.bindBuffer(rdr.gl.ARRAY_BUFFER, sphere.vertexPositionBuffer);
        rdr.gl.bufferData(rdr.gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), rdr.gl.STATIC_DRAW);
        sphere.vertexPositionBuffer.itemSize = 3;
        sphere.vertexPositionBuffer.numItems = vertexPositionData.length / 3;

        // index
        rdr.gl.bindBuffer(rdr.gl.ARRAY_BUFFER, sphere.vertexIndexBuffer);
        rdr.gl.bufferData(rdr.gl.ARRAY_BUFFER, new Uint16Array(indexData), rdr.gl.STATIC_DRAW);
        sphere.vertexIndexBuffer.itemSize = 1;
        sphere.vertexIndexBuffer.numItems = indexData;

        // push prepared sphere into array
        rdr.spheres.push(sphere);
    };
    rdr.prepareSystem = function (bodies) {
        for (var i in bodies) {
            rdr.prepareSphere(bodies[i]);

            if (bodies[i]._satellites) {
                rdr.prepareSystem(bodies[i]._satellites);
            }
        }
    };

    // actual rendering of spheres
    rdr.drawSphere = function (sphere) {
        var texture = rdr.lookupTexture(sphere.texture);

        rdr.gl.activeTexture(rdr.gl.TEXTURE0);
        rdr.gl.bindTexture(rdr.gl.TEXTURE_2D, texture);
        rdr.gl.uniform1i(rdr.shaders.program.samplerUniform, 0);

        rdr.gl.bindBuffer(rdr.gl.ARRAY_BUFFER, sphere.vertexPositionBuffer);
        rdr.gl.vertexAttribPointer(rdr.shaders.program.vertexPositionAttribute, sphere.vertexPositionBuffer.itemSize, rdr.gl.FLOAT, false, 0, 0);

        rdr.gl.bindBuffer(rdr.gl.ARRAY_BUFFER, sphere.vertexTextureCoordBuffer);
        rdr.gl.vertexAttribPointer(rdr.shaders.program.textureCoordAttribute, sphere.vertexTextureCoordBuffer.itemSize, rdr.gl.FLOAT, false, 0, 0);

        rdr.gl.bindBuffer(rdr.gl.ARRAY_BUFFER, sphere.vertexNormalBuffer);
        rdr.gl.vertexAttribPointer(rdr.shaders.program.vertexNormalAttribute, sphere.vertexNormalBuffer.itemSize, rdr.gl.FLOAT, false, 0, 0);

        rdr.gl.bindBuffer(rdr.gl.ELEMENT_ARRAY_BUFFER, sphere.vertexIndexBuffer);
        rdr.setMatrixUniforms();
        rdr.gl.drawElements(rdr.gl.TRIANGLES, sphere.vertexIndexBuffer.numItems, rdr.gl.UNSIGNED_SHORT, 0);
    };
    rdr.drawSystem = function () {
        for (var i in rdr.spheres) {
            rdr.drawSphere(rdr.spheres[i]);
        }
    };
    rdr.drawScene = function () {
        rdr.gl.viewport(0, 0, rdr.gl.viewportWidth, rdr.gl.viewportHeight);
        rdr.gl.clear(rdr.gl.COLOR_BUFFER_BIT | rdr.gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45, rdr.gl.viewportWidth / rdr.gl.viewportHeight, 0.1, 100.0, rdr.pMatrix);
        mat4.identity(rdr.mvMatrix);

        mat4.rotate(rdr.mvMatrix, degToRad(-rdr.camera.pitch), [1, 0, 0]);
        mat4.rotate(rdr.mvMatrix, degToRad(-rdr.camera.yaw), [0, 1, 0]);
        mat4.translate(rdr.mvMatrix, [-rdr.camera.xPos, -rdr.camera.yPos, -rdr.camera.zPos]);

        rdr.drawSystem();
    }

    rdr.render = function (bodies, elapsed) {
        rdr.controlCamera();
        rdr.updateCamera(elapsed);
        rdr.updateSystem(bodies);
        rdr.drawScene();
    };

    rdr.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    rdr.gl.enable(rdr.gl.DEPTH_TEST);

    return rdr;
}

