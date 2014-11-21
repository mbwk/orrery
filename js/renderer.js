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

    shaders.srcs["per_vertex_lighting_fs"] = "precision mediump float;\n" +
"\n" +
"    varying vec2 vTextureCoord;\n" +
"    varying vec3 vLightWeighting;\n" +
"\n" +
"    uniform sampler2D uSampler;\n" +
"\n" +
"    void main(void) {\n" +
"        vec4 fragmentColor;\n" +
"        fragmentColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));\n" +
//"        vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));\n" +
"        gl_FragColor = vec4(fragmentColor.rgb * vLightWeighting, fragmentColor.a);\n" +
//"        gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a);\n" +
"    }\n";

    shaders.srcs["per_vertex_lighting_vs"] = "attribute vec3 aVertexPosition;\n" +
"    attribute vec3 aVertexNormal;\n" +
"    attribute vec2 aTextureCoord;\n" +
"\n" +
"    uniform mat4 uMVMatrix;\n" +
"    uniform mat4 uPMatrix;\n" +
"    uniform mat3 uNMatrix;\n" +
"\n" +
"    uniform vec3 uAmbientColor;\n" +
"\n" +
"    uniform vec3 uPointLightingLocation;\n" +
"    uniform vec3 uPointLightingColor;\n" +
"\n" +
"    uniform bool uUseLighting;\n" +
"\n" +
"    varying vec2 vTextureCoord;\n" +
"    varying vec3 vLightWeighting;\n" +
"\n" +
"    void main(void) {\n" +
"        vec4 mvPosition = uMVMatrix * vec4(aVertexPosition, 1.0);\n" +
"        gl_Position = uPMatrix * mvPosition;\n" +
"        vTextureCoord = aTextureCoord;\n" +
"\n" +
"        if (!uUseLighting) {\n" +
"            vLightWeighting = vec3(1.0, 1.0, 1.0);\n" +
"        } else {\n" +
"            vec3 lightDirection = normalize(uPointLightingLocation - mvPosition.xyz);\n" +
"\n" +
"            vec3 transformedNormal = uNMatrix * aVertexNormal;\n" +
"            float directionalLightWeighting = max(dot(transformedNormal, lightDirection), 0.0);\n" +
"            vLightWeighting = uAmbientColor + uPointLightingColor * directionalLightWeighting;\n" +
"        }\n" +
"    }\n";

    shaders.srcs["per_fragment_lighting_fs"] = "precision mediump float;\n" +
"\n" +
"    varying vec2 vTextureCoord;\n" +
"    varying vec3 vTransformedNormal;\n" +
"    varying vec4 vPosition;\n" +
"\n" +
"    uniform float uMaterialShininess;\n" +
"\n" +
"    uniform bool uShowSpecularHighlights;\n" +
"    uniform bool uUseLighting;\n" +
//"    uniform bool uUseTextures;\n" +
"\n" +
"    uniform vec3 uAmbientColor;\n" +
"\n" +
"    uniform vec3 uPointLightingLocation;\n" +
//"    uniform vec3 uPointLightingColor;\n" +
"    uniform vec3 uPointLightingSpecularColor;\n" +
"    uniform vec3 uPointLightingDiffuseColor;\n" +
"\n" +
"    uniform sampler2D uSampler;\n" +
"\n" +
"    void main(void) {\n" +
"        vec3 lightWeighting;\n" +
"        if (!uUseLighting) {\n" +
"            lightWeighting = vec3(1.0, 1.0, 1.0);\n" +
"        } else {\n" +
"            vec3 lightDirection = normalize(uPointLightingLocation - vPosition.xyz);\n" +
"            vec3 normal = normalize(vTransformedNormal);\n" +
"\n" +
"            float specularLightWeighting = 0.0;\n" +
"            if (uShowSpecularHighlights) {\n" +
"                vec3 eyeDirection = normalize(-vPosition.xyz);\n" +
"                vec3 reflectionDirection = reflect(-lightDirection, normal);\n" +
"\n" +
"                specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), uMaterialShininess);\n" +
"            }\n" +

"            float diffuseLightWeighting = max(dot(normal, lightDirection), 0.0);\n" +
"            lightWeighting = uAmbientColor + uPointLightingSpecularColor * specularLightWeighting + uPointLightingDiffuseColor * diffuseLightWeighting;\n" +
"        }\n" +
"\n" +
"        vec4 fragmentColor;\n" +
//"        if (uUseTextures) {\n" +
"        fragmentColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));\n" +
//"        } else {\n" +
//"            fragmentColor = vec4(1.0, 1.0, 1.0, 1.0);\n" +
//"        }\n" +
"\n" +
"        gl_FragColor = vec4(fragmentColor.rgb * lightWeighting, fragmentColor.a);\n" +
"    }\n";

    shaders.srcs["per_fragment_lighting_vs"] = "attribute vec3 aVertexPosition;\n" +
"    attribute vec3 aVertexNormal;\n" +
"    attribute vec2 aTextureCoord;\n" +
"\n" +
"    uniform mat4 uMVMatrix;\n" +
"    uniform mat4 uPMatrix;\n" +
"    uniform mat3 uNMatrix;\n" +
"\n" +
//"    uniform vec3 uAmbientColor;\n" +
//"\n" +
//"    uniform vec3 uPointLightingLocation;\n" +
//"    uniform vec3 uPointLightingColor;\n" +
//"\n" +
//"    uniform vec3 uLightingDirection;\n" +
//"    uniform vec3 uDirectionalColor;\n" +
//"\n" +
//"    uniform bool uUseLighting;\n" +
"\n" +
"    varying vec2 vTextureCoord;\n" +
"    varying vec3 vTransformedNormal;\n" +
"    varying vec4 vPosition;\n" +
//"    varying vec3 vLightWeighting;\n" +
"\n" +
"    void main(void) {\n" +
"        vPosition = uMVMatrix * vec4(aVertexPosition, 1.0);\n" +
"        gl_Position = uPMatrix * vPosition;\n" +
"        vTextureCoord = aTextureCoord;\n" +
"\n" +
//"        if (!uUseLighting) {\n" +
//"            vLightWeighting = vec3(1.0, 1.0, 1.0);\n" +
//"        } else {\n" +
//"            vec3 lightDirection = normalize(uPointLightingLocation - mvPosition.xyz);\n" +
//"\n" +
"        vTransformedNormal = uNMatrix * aVertexNormal;\n" +
//"            float directionalLightWeighting = max(dot(transformedNormal, lightDirection), 0.0);\n" +
//"            vLightWeighting = uAmbientColor + uPointLightingColor * directionalLightWeighting;\n" +
//"        }\n" +
"    }\n";

    return shaders;
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

    var filenames = [
        // "ringsRGBA.png",
        "sunmap.jpg", "earthmap1k.jpg", "moon.gif", "jupitermap.jpg",
        "marsmap1k.jpg", "mercurymap.jpg", "neptunemap.jpg",
        "saturnmap.jpg", "uranusmap.jpg", "venusmap.jpg"
    ];

    for (var i in filenames) {
        var name = filenames[i];
        textures.store[name] = gl.createTexture();
        initTexture(gl, textures.store[name], name);
    }
}

function initCamera(camera) {
    camera.zoom = 6;
    camera.rotationMatrix = mat4.create();
    mat4.identity(camera.rotationMatrix);
}

function Renderer() {
    var rdr = {};

    rdr.canvas = document.getElementById("glcanvas");
    rdr.gl = initGL(rdr.canvas);

    rdr.shaders = {};
    initGLSL(rdr.shaders);

    rdr.loadShader = function (name, type) {
        var shader;

        if (type == "fs") {
            shader = rdr.gl.createShader(rdr.gl.FRAGMENT_SHADER);
        } else if (type == "vs") { // vertex shader
            shader = rdr.gl.createShader(rdr.gl.VERTEX_SHADER);
        } else {
            return null;
        }

        rdr.gl.shaderSource(shader, rdr.shaders.srcs[name]);
        rdr.gl.compileShader(shader);

        if (!rdr.gl.getShaderParameter(shader, rdr.gl.COMPILE_STATUS)) {
            alert("IN " + name + "\n" + rdr.gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    };

    rdr.compileShaderProgram = function(fs_name, vs_name) {
        var fragmentShader = rdr.loadShader(fs_name, "fs");
        var vertexShader = rdr.loadShader(vs_name, "vs");

        var program = rdr.gl.createProgram();
        rdr.gl.attachShader(program, vertexShader);
        rdr.gl.attachShader(program, fragmentShader);
        rdr.gl.linkProgram(program);

        if (!rdr.gl.getProgramParameter(program, rdr.gl.LINK_STATUS)) {
            alert("Failed to initialize shaders");
        }

        program.vertexPositionAttribute = rdr.gl.getAttribLocation(program, "aVertexPosition");
        rdr.gl.enableVertexAttribArray(program.vertexPositionAttribute);

        program.textureCoordAttribute = rdr.gl.getAttribLocation(program, "aTextureCoord");
        rdr.gl.enableVertexAttribArray(program.textureCoordAttribute);

        program.vertexNormalAttribute = rdr.gl.getAttribLocation(program, "aVertexNormal");
        rdr.gl.enableVertexAttribArray(program.vertexNormalAttribute);

        program.pMatrixUniform = rdr.gl.getUniformLocation(program, "uPMatrix");
        program.mvMatrixUniform = rdr.gl.getUniformLocation(program, "uMVMatrix");
        program.nMatrixUniform = rdr.gl.getUniformLocation(program, "uNMatrix");

        program.samplerUniform = rdr.gl.getUniformLocation(program, "uSampler");

        program.materialShininessUniform = rdr.gl.getUniformLocation(program, "uMaterialShininess");
        program.showSpecularHighlightsUniform = rdr.gl.getUniformLocation(program, "uShowSpecularHighlights");

        program.uUseTexturesUniform = rdr.gl.getUniformLocation(program, "uUseTextures");
        program.useLightingUniform = rdr.gl.getUniformLocation(program, "uUseLighting");
        program.ambientColorUniform = rdr.gl.getUniformLocation(program, "uAmbientColor");

        program.pointLightingLocationUniform = rdr.gl.getUniformLocation(program, "uPointLightingLocation");
        // program.pointLightingColorUniform = rdr.gl.getUniformLocation(program, "uPointLightingColor");
        program.pointLightingSpecularColorUniform = rdr.gl.getUniformLocation(program, "uPointLightingSpecularColor");
        program.pointLightingDiffuseColorUniform = rdr.gl.getUniformLocation(program, "uPointLightingDiffuseColor");

        return program;
    };

    rdr.selectProgram = function(spec) {
        if (spec == "per_vertex") {
            rdr.shaders.program = rdr.shaders.perVertexProgram;
        } else if (spec == "per_fragment") {
            rdr.shaders.program = rdr.shaders.perFragmentProgram;
        } else {
            rdr.shaders.program = rdr.shaders.perFragmentProgram;
        }
        rdr.gl.useProgram(rdr.shaders.program);
        return rdr.shaders.program;
    };

    rdr.shaders.perVertexProgram = rdr.compileShaderProgram("per_vertex_lighting_fs", "per_vertex_lighting_vs");
    rdr.shaders.perFragmentProgram = rdr.compileShaderProgram("per_fragment_lighting_fs", "per_fragment_lighting_vs");
    rdr.shaders.program = rdr.selectProgram("per_fragment");

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
    rdr.controls.mouseDown = false;
    rdr.controls.lastMouseX = null;
    rdr.controls.lastMouseY = null;
    initCamera(rdr.camera);

    rdr.controls.handleMouseDown = function (event) {
        rdr.controls.mouseDown = true;
        rdr.controls.lastMouseX = event.clientX;
        rdr.controls.lastMouseY = event.clientY;
    };

    rdr.controls.handleMouseUp = function (event) {
        rdr.controls.mouseDown = false;;
    };

    rdr.controls.handleMouseMove = function (event) {
        if (!rdr.controls.mouseDown) {
            return;
        }
        var newX = event.clientX;
        var newY = event.clientY;

        var newRotationMatrix = mat4.create();
        mat4.identity(newRotationMatrix);

        var deltaX = newX - rdr.controls.lastMouseX;
        mat4.rotate(newRotationMatrix, degToRad(deltaX / 10), [0, 1, 0]);

        var deltaY = newY - rdr.controls.lastMouseY;
        mat4.rotate(newRotationMatrix, degToRad(deltaY / 10), [1, 0, 0]);

        mat4.multiply(newRotationMatrix, rdr.camera.rotationMatrix, rdr.camera.rotationMatrix);

        rdr.controls.lastMouseX = newX;
        rdr.controls.lastMouseY = newY;
    };

    rdr.controls.handleMouseWheel = function (event) {
        event.preventDefault();

        var delta = 0;
        if (event.wheelDelta) {
            delta = event.wheelDelta;
        };
        console.log(delta);

        rdr.camera.zoom -= delta / 1000;

        if (rdr.camera.zoom < 1) {
            rdr.camera.zoom = 1;
        } else if (rdr.camera.zoom > 16) {
            rdr.camera.zoom = 16;
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
        rdr.mvMatrix = rdr.mvMatrixStack.pop();
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

    rdr.prepareSphere = function (body, sphere) {
        // texture
        sphere.name = body._name;
        sphere.texture = body._texture;

        // attr
        sphere.rotationalSpeed = body._rotSpeed;
        sphere.rotationalAngle = 0;
        sphere.orbitalSpeed = body._orbSpeed;
        sphere.orbitalRadius = body._orbRadius;
        sphere.orbitalAngle = body._start;
        var radius = body._radius;

        // buffers
        var fidelity = 60 + Math.floor(radius) + 2 * 10;
        var latitudeBands = fidelity; // 60;
        var longitudeBands = fidelity; // 60;

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
                vertexPositionData.push(radius * x);
                vertexPositionData.push(radius * y);
                vertexPositionData.push(radius * z);
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
        rdr.gl.bindBuffer(rdr.gl.ELEMENT_ARRAY_BUFFER, sphere.vertexIndexBuffer);
        rdr.gl.bufferData(rdr.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), rdr.gl.STATIC_DRAW);
        sphere.vertexIndexBuffer.itemSize = 1;
        sphere.vertexIndexBuffer.numItems = indexData.length;

        // satellites
        sphere.satellites = [];
    };

    // new
    rdr.prepareSystem = function (bodies, system) {
        for (var i in bodies) {
            var sphere = {}
            rdr.prepareSphere(bodies[i], sphere);
            system.push(sphere);
            if (bodies[i]._satellites) {
                rdr.prepareSystem(bodies[i]._satellites, sphere.satellites);
            }
        }
    }

    rdr.drawSphere = function (sphere) {

        var lighting = false;

        if (sphere.name == "Sun") {
            var lighting = false;
        } else {
            var lighting = true;
        }
        rdr.gl.uniform1i(rdr.shaders.program.useLightingUniform, lighting);
        
        // rotate to point in orbit, move out by orbital distance, and rotate back
        mat4.rotate(rdr.mvMatrix, degToRad(sphere.orbitalAngle), [0, 1, 0]);
        mat4.translate(rdr.mvMatrix, [sphere.orbitalRadius, 0, 0]);
        mat4.rotate(rdr.mvMatrix, degToRad(sphere.orbitalAngle), [0, -1, 0]);

        rdr.mvPushMatrix();

        // rotate based on rotation of the sphere
        mat4.rotate(rdr.mvMatrix, degToRad(sphere.rotationalAngle), [0, 1, 0]);
        

        rdr.gl.activeTexture(rdr.gl.TEXTURE0);
        rdr.gl.bindTexture(rdr.gl.TEXTURE_2D, rdr.lookupTexture(sphere.texture));
        rdr.gl.uniform1i(rdr.shaders.program.samplerUniform, 0);

        rdr.gl.uniform1f(rdr.shaders.program.materialShininessUniform, 16.0);

        rdr.gl.bindBuffer(rdr.gl.ARRAY_BUFFER, sphere.vertexPositionBuffer);
        rdr.gl.vertexAttribPointer(rdr.shaders.program.vertexPositionAttribute, sphere.vertexPositionBuffer.itemSize, rdr.gl.FLOAT, false, 0, 0);

        rdr.gl.bindBuffer(rdr.gl.ARRAY_BUFFER, sphere.vertexTextureCoordBuffer);
        rdr.gl.vertexAttribPointer(rdr.shaders.program.textureCoordAttribute, sphere.vertexTextureCoordBuffer.itemSize, rdr.gl.FLOAT, false, 0, 0);

        rdr.gl.bindBuffer(rdr.gl.ARRAY_BUFFER, sphere.vertexNormalBuffer);
        rdr.gl.vertexAttribPointer(rdr.shaders.program.vertexNormalAttribute, sphere.vertexNormalBuffer.itemSize, rdr.gl.FLOAT, false, 0, 0);

        rdr.gl.bindBuffer(rdr.gl.ELEMENT_ARRAY_BUFFER, sphere.vertexIndexBuffer);
        rdr.setMatrixUniforms();
        rdr.gl.drawElements(rdr.gl.TRIANGLES, sphere.vertexIndexBuffer.numItems, rdr.gl.UNSIGNED_SHORT, 0);

        // change back mvMatrix rotation so satellites control their own orbits
        rdr.mvPopMatrix();
    };

    
    rdr.drawSystem = function (system) {
        rdr.mvPushMatrix();
        for (var i = 0; i < system.length; ++i) {
            rdr.mvPushMatrix();
            rdr.drawSphere(system[i]);
            if (system[i].satellites) {
                rdr.drawSystem(system[i].satellites);
            }
            rdr.mvPopMatrix();
        }
        rdr.mvPopMatrix();
    };

    rdr.drawScene = function () {
        rdr.gl.viewportWidth = rdr.canvas.width; //= window.innerWidth;
        rdr.gl.viewportHeight = rdr.canvas.height; //= window.innerHeight;

        rdr.gl.viewport(0, 0, rdr.gl.viewportWidth, rdr.gl.viewportHeight);
        rdr.gl.clear(rdr.gl.COLOR_BUFFER_BIT | rdr.gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45, rdr.gl.viewportWidth / rdr.gl.viewportHeight, 0.1, 100.0, rdr.pMatrix);
        mat4.identity(rdr.mvMatrix);

        // old, buggy free-roam camera
        // mat4.rotate(rdr.mvMatrix, degToRad(-rdr.camera.pitch), [1, 0, 0]);
        // mat4.rotate(rdr.mvMatrix, degToRad(-rdr.camera.yaw), [0, 1, 0]);
        // mat4.translate(rdr.mvMatrix, [-rdr.camera.xPos, -rdr.camera.yPos, -rdr.camera.zPos]);

        // new, simple rotation matrix camera
        mat4.translate(rdr.mvMatrix, [0, 0, -rdr.camera.zoom]);
        mat4.multiply(rdr.mvMatrix, rdr.camera.rotationMatrix);

        rdr.gl.uniform1i(rdr.shaders.program.showSpecularHighlightsUniform, true);

        var lighting = true;

        rdr.gl.uniform1i(rdr.shaders.program.useLightingUniform, lighting);


        if (lighting) {
            // ambient light - low
            rdr.gl.uniform3f(rdr.shaders.program.ambientColorUniform,
                    0.1, 0.1, 0.1
                );

            // point light - at centre of sun
            rdr.gl.uniform3f(rdr.shaders.program.pointLightingLocationUniform,
                    0, 0, -rdr.camera.zoom
                );

            // point light - brighter
            rdr.gl.uniform3f(rdr.shaders.program.pointLightingSpecularColorUniform,
                    0.8, 0.8, 0.8
                );
            // point light - brighter
            rdr.gl.uniform3f(rdr.shaders.program.pointLightingDiffuseColorUniform,
                    0.8, 0.8, 0.8
                );
        }

        rdr.drawSystem(rdr.spheres);
    };

    rdr.animateSphere = function (elapsed, sphere) {
        sphere.rotationalAngle += sphere.rotationalSpeed * elapsed / 1000;
        sphere.orbitalAngle += sphere.orbitalSpeed * elapsed / 1000;
    };

    rdr.animateSystem = function (elapsed, system) {
        for (var i = 0; i < system.length; ++i) {
            rdr.animateSphere(elapsed, system[i]);
            rdr.animateSystem(elapsed, system[i].satellites);
        }
    };

    rdr.render = function (elapsed) {
        rdr.drawScene();
        rdr.animateSystem(elapsed, rdr.spheres);
    };

    rdr.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    rdr.gl.enable(rdr.gl.DEPTH_TEST);

    rdr.canvas.onmousedown = rdr.controls.handleMouseDown;
    document.onmouseup = rdr.controls.handleMouseUp;
    document.onmousemove = rdr.controls.handleMouseMove;
    rdr.canvas.onmousewheel = rdr.controls.handleMouseWheel;
    
    return rdr;
}

