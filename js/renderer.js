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

function initView(view) {
    view.mvMatrix = mat4.create();
    view.mvMatrixStack = [];
    view.pMatrix = mat4.create();
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

    rdr.view = {};
    initView(rdr.gl, rdr.view);

    rdr.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    rdr.gl.enable(rdr.gl.DEPTH_TEST);

    rdr.renderBody = function (space_body) {
        var buffers = rdr.prepareBuffers(space_body);
        
    };

    rdr.drawScene = function (ss_model) {

    };

    return rdr;
}

