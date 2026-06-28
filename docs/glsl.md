# GLSL 着色器入门指南

## 什么是着色器？

**一句话解释**：着色器是运行在显卡（GPU）上的小程序，专门用来计算每个像素应该显示什么颜色。

**生活比喻**：
- 想象你是一个画家，面前有一张 1920×1080 的画布（屏幕）
- 你需要给**每一个像素**涂上颜色
- 如果用 CPU（普通程序）来画，就像**一个人**拿着画笔，一个像素一个像素地涂
- 如果用 GPU（着色器）来画，就像有**200万个助手**同时工作，每人负责一个像素

这就是着色器的核心思想：**并行处理**。

---

## GPU vs CPU：分工不同

| 对比项 | CPU | GPU |
|--------|-----|-----|
| 核心数量 | 几个到几十个 | 几千到几万个 |
| 擅长任务 | 复杂逻辑、顺序执行 | 简单计算、大规模并行 |
| 比喻 | 一个数学教授 | 200个小学生 |
| 着色器角色 | 负责调度、传数据 | 负责计算每个像素的颜色 |

**为什么用 GPU 画图更快？**

假设屏幕分辨率是 1920×1080 = 2,073,600 个像素
- CPU：一个核心算一个像素，需要循环 200 万次
- GPU：200 万个核心同时算，**一次搞定**

---

## 着色器的种类

GPU 渲染管线像一条**工厂流水线**，不同着色器负责不同工序：

```
┌                                                     ┐

  3D模型 ──→ [顶点着色器] ──→ [几何着色器] ──→ [光栅化]
  (顶点)     摆放位置        增减顶点       生成像素

           ──→ [片段着色器] ──→ 屏幕显示
                涂颜色

  [曲面细分]  ← 可选工序，让模型更精细
  [计算着色器] ← 独立工人，随时调用
└                                                     ┘
```

### 1. 顶点着色器（Vertex Shader）

我们学的是**顶点着色器**，它的工作就是：

```
输入：3D 模型的每个顶点坐标 (x, y, z)
处理：移动、旋转、缩放这些点
输出：变换后的屏幕坐标 (x, y, z, w)
```

**执行流程**：

```
┌                                                      ┐

  模型上的每个顶点都会执行一次 main() 函数

  顶点A(1,2,3)   → 执行 main() → 屏幕位置(500,300)
  顶点B(4,5,6)   → 执行 main() → 屏幕位置(600,400)
  顶点C(7,8,9)   → 执行 main() → 屏幕位置(700,500)
  ...

└                                                      ┘
```

**关键理解**：顶点着色器只管**点在哪里**，不管颜色。就像摆骨架，不管皮肤。

**常见用途**：移动物体、旋转、缩放、骨骼动画

**创建和使用（WebGL）**：

```javascript
// 1. 编写着色器代码
const vertexShaderSource = `
  attribute vec2 a_position;  // 顶点坐标
  uniform vec2 u_resolution;  // 画布大小

  void main() {
    // 将像素坐标转换为裁剪空间坐标 (-1 到 1)
    vec2 zeroToOne = a_position / u_resolution;
    vec2 clipSpace = zeroToOne * 2.0 - 1.0;
    gl_Position = vec4(clipSpace, 0.0, 1.0);
  }
`;

// 2. 编译着色器
function createShader(gl, type, source) {
  const shader = gl.createShader(type);  // 创建着色器
  gl.shaderSource(shader, source);       // 设置源码
  gl.compileShader(shader);              // 编译
  return shader;
}

// 3. 创建顶点着色器
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
```

**文件扩展名**：`.vert`

---

### 2. 几何着色器（Geometry Shader）

它的工作就是：

```
输入：一组顶点（比如一个三角形的 3 个点）
处理：可以增加、减少、或改变这些顶点
输出：新的顶点组合
```

**执行流程**：

```
┌                                                      ┐

  输入一个三角形（3个顶点）
        ↓
  几何着色器可以：
    • 变成 2 个三角形（6个顶点）← 增加
    • 变成 1 条线（2个顶点）   ← 减少
    • 直接丢弃              ← 删除

└                                                      ┘
```

**关键理解**：几何着色器能**凭空创造**或**删除**顶点。其他着色器做不到。

**常见用途**：粒子效果、毛发、草地、轮廓线

**创建和使用（OpenGL）**：

```glsl
// 几何着色器代码（.geom 文件）
#version 330 core

layout(triangles) in;  // 输入：三角形（3个顶点）
layout(triangle_strip, max_vertices = 6) out;  // 输出：最多6个顶点

void main() {
    // 复制整个三角形，并向外挤出
    for (int i = 0; i < 3; i++) {
        gl_Position = gl_in[i].gl_Position;
        EmitVertex();  // 输出顶点
    }
    EndPrimitive();  // 结束当前图元

    // 再复制一份，放大 1.1 倍
    for (int i = 0; i < 3; i++) {
        gl_Position = gl_in[i].gl_Position * 1.1;
        EmitVertex();
    }
    EndPrimitive();
}
```

**文件扩展名**：`.geom`

---

### 3. 曲面细分着色器（Tessellation Shader）

它的工作就是：

```
输入：一个粗糙的模型（很少的顶点）
处理：自动插入更多顶点，让表面更光滑
输出：精细的模型（很多顶点）
```

**执行流程**：

```
┌                                                      ┐

  输入：一个方形（4个顶点）
        ↓
  曲面细分：自动添加中间点
        ↓
  输出：由很多小三角形组成的光滑曲面

   ┌──┐        ┌┬┬┐
   │  │   →    ├┼┼┤
   └──┘        └┴┴┘
   4个顶点      很多个顶点

└                                                      ┘
```

**关键理解**：让粗糙的模型变精细，省去手动添加顶点的麻烦。

**常见用途**：地形、角色模型、光滑曲面

**创建和使用（OpenGL）**：

```glsl
// 1. Hull Shader（外壳着色器）- 决定如何细分
#version 400 core

layout(vertices = 4) out;  // 输出4个控制点

void main() {
    gl_out[gl_InvocationID].gl_Position = gl_in[gl_InvocationID].gl_Position;

    // 设置细分级别
    if (gl_InvocationID == 0) {
        gl_TessLevelOuter[0] = 4.0;  // 外部细分级别
        gl_TessLevelOuter[1] = 4.0;
        gl_TessLevelOuter[2] = 4.0;
        gl_TessLevelOuter[3] = 4.0;
        gl_TessLevelInner[0] = 4.0;  // 内部细分级别
        gl_TessLevelInner[1] = 4.0;
    }
}

// 2. Domain Shader（域着色器）- 计算新顶点位置
#version 400 core

layout(quads, equal_spacing, ccw) in;  // 四边形细分

void main() {
    float u = gl_TessCoord.x;
    float v = gl_TessCoord.y;

    // 双线性插值计算新位置
    vec4 p0 = mix(gl_in[0].gl_Position, gl_in[1].gl_Position, u);
    vec4 p1 = mix(gl_in[3].gl_Position, gl_in[2].gl_Position, u);
    gl_Position = mix(p0, p1, v);
}
```

**文件扩展名**：`.tesc`（Hull）、`.tese`（Domain）

---

### 4. 计算着色器（Compute Shader）

它的工作就是：

```
输入：任意数据（数字、数组、图像）
处理：执行任何计算
输出：计算结果
```

**执行流程**：

```
┌                                                      ┐

  计算着色器不参与渲染管线
  它是一个独立的"万能工人"

  可以做：
    • 物理模拟（水、布料、粒子）
    • 图像处理（模糊、滤镜）
    • AI 计算
    • 任何需要大量并行计算的任务

└                                                      ┘
```

**关键理解**：其他着色器只能画图，计算着色器能做**任何计算**。

**常见用途**：物理模拟、图像处理、光线追踪、AI

**创建和使用（WebGL 2.0 / OpenGL）**：

```glsl
// 计算着色器代码（.comp 文件）
#version 310 es

layout(local_size_x = 16, local_size_y = 16) in;  // 工作组大小

layout(binding = 0, rgba8) uniform image2D u_input;   // 输入图像
layout(binding = 1, rgba8) uniform image2D u_output;  // 输出图像

void main() {
    ivec2 coord = ivec2(gl_GlobalInvocationID.xy);

    // 读取输入像素
    vec4 color = imageLoad(u_input, coord);

    // 简单的灰度处理
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));

    // 写入输出
    imageStore(u_output, coord, vec4(vec3(gray), 1.0));
}
```

**JavaScript 调用**：

```javascript
// 1. 编译计算着色器
const computeShader = gl.createShader(0x91B9);  // GL_COMPUTE_SHADER
gl.shaderSource(computeShader, source);
gl.compileShader(computeShader);

// 2. 创建程序并链接
const program = gl.createProgram();
gl.attachShader(program, computeShader);
gl.linkProgram(program);

// 3. 分派计算
gl.useProgram(program);
gl.dispatchCompute(groupCountX, groupCountY, 1);  // 启动计算
```

**文件扩展名**：`.comp`

---

### 5. 片段着色器（Fragment Shader）

我们学的是**片段着色器**，它的工作就是：

```
输入：每个像素的坐标 (x, y)
处理：计算这个像素应该是什么颜色
输出：颜色值 (r, g, b, a)
```

**执行流程**：

```
┌                                                      ┐

  屏幕上的每个像素都会执行一次 main() 函数

  像素(0,0)   → 执行 main() → 输出颜色
  像素(0,1)   → 执行 main() → 输出颜色
  像素(0,2)   → 执行 main() → 输出颜色
  ...
  像素(1919,1079) → 执行 main() → 输出颜色

└                                                      ┘
```

**关键理解**：你写的代码会被执行**几百万次**，每次处理一个像素。

**创建和使用（WebGL）**：

```javascript
// 1. 编写着色器代码
const fragmentShaderSource = `
  precision mediump float;
  uniform vec2 u_resolution;  // 画布大小
  uniform float u_time;       // 时间

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(uv.x, uv.y, sin(u_time) * 0.5 + 0.5);
    gl_FragColor = vec4(color, 1.0);
  }
`;

// 2. 编译着色器
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

// 3. 创建片段着色器
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

// 4. 链接程序
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

// 5. 使用程序绘制
gl.useProgram(program);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);  // 绘制矩形
```

**文件扩展名**：`.frag`

---

### 着色器种类对比

| 着色器 | 干什么 | 并行单位 | 比喻 |
|--------|--------|----------|------|
| 顶点着色器 | 移动点的位置 | 每个顶点 | 摆骨架 |
| 几何着色器 | 增减顶点数量 | 每个图元 | 变形金刚 |
| 曲面细分 | 让模型更精细 | 每个补丁 | 美颜滤镜 |
| 片段着色器 | 计算像素颜色 | 每个像素 | 涂颜色 |
| 计算着色器 | 通用计算 | 任意粒度 | 万能工人 |

---

## 坐标系统

### 原始坐标：像素坐标

GPU 给你的坐标是**像素坐标**：
- 左下角是 (0, 0)
- 右上角是 (屏幕宽度-1, 屏幕高度-1)
- 例如 1920×1080 屏幕：(0,0) 到 (1919, 1079)

```glsl
// gl_FragCoord.xy 就是当前像素的坐标
// 例如当前像素在屏幕中央：gl_FragCoord.xy = vec2(960.0, 540.0)
```

### 归一化坐标：0.0 ~ 1.0

像素坐标不好用（不同屏幕分辨率不同），所以通常**归一化**到 0.0 ~ 1.0：

```glsl
// 归一化公式：当前像素坐标 ÷ 屏幕分辨率
vec2 position = gl_FragCoord.xy / u_resolution;

// 归一化后：
// 左下角 (0.0, 0.0)
// 右上角 (1.0, 1.0)
// 中央   (0.5, 0.5)
```

**好处**：不管屏幕多大，(0.5, 0.5) 永远是中央。

**比喻**：
- 像素坐标 = 实际地址（北京市海淀区XX路XX号）
- 归一化坐标 = 相对位置（在城市的东北方向 30% 处）

---

## 数据类型

### 标量（一个数）

```glsl
float a = 1.0;     // 浮点数（小数）
int b = 1;         // 整数
bool c = true;     // 布尔值
```

### 向量（多个数组合）

```glsl
vec2 a = vec2(1.0, 2.0);           // 2D 向量 (x, y)
vec3 b = vec3(1.0, 2.0, 3.0);      // 3D 向量 (x, y, z)
vec4 c = vec4(1.0, 2.0, 3.0, 4.0); // 4D 向量 (x, y, z, w)
```

**向量的多种用途**：

```glsl
// vec3 可以表示：
vec3 position = vec3(1.0, 2.0, 3.0);  // 3D 坐标
vec3 color = vec3(1.0, 0.0, 0.0);     // RGB 颜色（红色）
vec3 scale = vec3(2.0, 2.0, 2.0);     // 缩放因子

// vec4 通常表示 RGBA 颜色：
vec4 red = vec4(1.0, 0.0, 0.0, 1.0);  // 不透明红色
vec4 transparent = vec4(1.0, 0.0, 0.0, 0.5); // 半透明红色
//                 (红, 绿, 蓝, 透明度)
```

### 向量访问

```glsl
vec4 color = vec4(1.0, 0.5, 0.3, 1.0);

// 用 .xyzw 或 .rgba 访问
float r = color.x;    // 或 color.r → 1.0
float g = color.y;    // 或 color.g → 0.5
float b = color.z;    // 或 color.b → 0.3
float a = color.w;    // 或 color.a → 1.0

// 用下标访问
float r = color[0];   // 1.0
float g = color[1];   // 0.5
```

### 矩阵

```glsl
mat2 m = mat2(1.0, 0.0, 0.0, 1.0);  // 2x2 矩阵
mat3 m = mat3(1.0);                   // 3x3 单位矩阵
mat4 m = mat4(1.0);                   // 4x4 单位矩阵
```

矩阵用于**变换**（旋转、缩放、平移），后面会详细讲。

---

## 变量类型

### uniform：外部传入

```glsl
uniform vec2 u_resolution;  // 屏幕分辨率
uniform float u_time;       // 时间（秒）
uniform vec2 u_mouse;       // 鼠标位置
```

**特点**：
- 由 JavaScript/CPU 程序传入
- 在一次绘制中**所有像素共享同一个值**
- 像素之间不能通过 uniform 通信

**比喻**：uniform 就像老师发给全班的**同一份试卷**，每个学生（像素）拿到的题目一样。

### varying：顶点传入（暂不深入）

```glsl
varying vec2 v_uv;  // 从顶点着色器传来的 UV 坐标
```

### 本地变量

```glsl
void main() {
    float x = 0.5;           // 局部变量，只在这个像素有效
    vec3 color = vec3(0.0);  // 局部变量
}
```

---

## 常用内置变量

| 变量 | 类型 | 含义 |
|------|------|------|
| `gl_FragCoord` | vec4 | 当前像素的坐标 (x, y, z, w) |
| `gl_FragColor` | vec4 | 输出颜色（必须设置） |

```glsl
void main() {
    // 获取当前像素坐标
    vec2 pos = gl_FragCoord.xy;

    // 设置输出颜色（RGBA）
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // 红色
}
```

---

## 常用函数

### step：阶梯函数

```glsl
float step(float edge, float x)
// x < edge  → 返回 0.0
// x >= edge → 返回 1.0
```

**比喻**：门槛函数，过了门槛就是 1，没过就是 0。

```glsl
float result = step(0.5, 0.3);  // 0.3 < 0.5 → 返回 0.0
float result = step(0.5, 0.7);  // 0.7 >= 0.5 → 返回 1.0
```

**用途**：画形状（圆形、矩形）

```glsl
// 画圆形：到中心的距离 < 半径 → 在圆内
float circle = step(radius, length(position - center));
```

### length：向量长度

```glsl
float length(vec2 v)
// 计算向量的长度（欧几里得距离）
```

**数学公式**：length(vec2(x, y)) = √(x² + y²)

```glsl
vec2 pos = vec2(0.3, 0.4);
float len = length(pos);  // √(0.09 + 0.16) = √0.25 = 0.5
```

**用途**：计算点到中心的距离

```glsl
float dist = length(position - vec2(0.5));  // 到中心的距离
```

### smoothstep：平滑阶梯

```glsl
float smoothstep(float edge0, float edge1, float x)
// 在 edge0 和 edge1 之间平滑过渡
```

**比喻**：step 是硬边界，smoothstep 是**渐变边界**。

```glsl
// step：硬边界
float hard = step(0.5, x);  // 0 或 1

// smoothstep：软边界（在 0.4 到 0.6 之间渐变）
float soft = smoothstep(0.4, 0.6, x);  // 0.0 → 1.0 平滑过渡
```

### mix：混合

```glsl
float mix(float a, float b, float t)
// 返回 a*(1-t) + b*t
// t=0 → 返回 a
// t=1 → 返回 b
// t=0.5 → 返回 a 和 b 的中间值
```

**用途**：颜色渐变

```glsl
vec3 red = vec3(1.0, 0.0, 0.0);
vec3 blue = vec3(0.0, 0.0, 1.0);
vec3 purple = mix(red, blue, 0.5);  // 红蓝各一半 → 紫色
```

### clamp：限制范围

```glsl
float clamp(float x, float minVal, float maxVal)
// x < minVal → 返回 minVal
// x > maxVal → 返回 maxVal
// 其他 → 返回 x
```

**比喻**：给数值加个围栏，不能太小也不能太大。

```glsl
float value = clamp(1.5, 0.0, 1.0);  // 1.5 > 1.0 → 返回 1.0
float value = clamp(-0.5, 0.0, 1.0); // -0.5 < 0.0 → 返回 0.0
float value = clamp(0.7, 0.0, 1.0);  // 0.7 在范围内 → 返回 0.7
```

### sin / cos：三角函数

```glsl
float sin(float angle)  // 正弦函数，角度是弧度
float cos(float angle)  // 余弦函数，角度是弧度
```

**特点**：
- 输入：弧度（不是角度）
- 输出：-1.0 到 1.0 之间
- 周期：2π ≈ 6.28

**用途**：动画、波浪效果

```glsl
// 随时间变化的脉动效果
float pulse = sin(u_time) + 1.0;  // 0.0 到 2.0 之间振荡

// 波浪效果
float wave = sin(position.x * 10.0 + u_time);
```

**弧度与角度转换**：
```glsl
float radians = degrees * 3.14159 / 180.0;
float degrees = radians * 180.0 / 3.14159;
```

### distance：两点距离

```glsl
float distance(vec2 a, vec2 b)
// 计算两个点之间的距离
// 等价于 length(a - b)
```

```glsl
vec2 center = vec2(0.5, 0.5);
float dist = distance(position, center);  // 到中心的距离
```

---


## 术语概念

### 1. 光栅化（Rasterization）

**一句话**：把**连续的图形**变成**离散的像素**

**生活比喻**：
- 想象你用乐高积木拼一幅画
- 原本是光滑的曲线（数学图形）
- 用积木拼出来就变成了方块（像素）
- 这个"转成积木"的过程就是光栅化

**技术解释**：
- GPU 拿到的是顶点坐标（连续的数字）
- 屏幕显示的是像素（离散的格子）
- 光栅化就是把"连续坐标"映射到"像素格子"上

```
数学图形（连续）        光栅化后（离散）
    ╭──╮                 ██  ██
   ╱    ╲               ██  ██  ██
  │      │             ██  ██  ██  ██
   ╲    ╱               ██  ██  ██
    ╰──╯                 ██  ██
```

**什么时候发生**：在顶点着色器之后、片段着色器之前

---

### 2. 片段（Fragment）

**一句话**：像素的**候选者**，还没确定最终颜色

**生活比喻**：
- 片段就像"待审核的简历"
- 每个片段包含：位置、颜色、深度等信息
- 经过深度测试等审核后，才能成为真正的像素

**片段 vs 像素**：
```
片段（Fragment）          像素（Pixel）
├── 位置 (x, y)          ├── 最终颜色
├── 颜色 (r, g, b, a)    └── 已确定
├── 深度 (z)
└── 待审核状态
```

**为什么叫"片段"**：因为一个像素可能被多个物体覆盖，每个物体都产生一个片段，最后只有一个胜出。

---

### 3. 纹理（Texture）

**一句话**：贴在物体表面的**图片**

**生活比喻**：
- 纹理就像**贴纸**
- 你有一个白色的立方体（3D 模型）
- 贴上木纹贴纸 → 看起来像木箱
- 贴上砖墙贴纸 → 看起来像砖墙

**技术解释**：
- 纹理是一张 2D 图片（比如 512×512 像素）
- 用 UV 坐标（0.0~1.0）来定位贴图位置
- 片段着色器根据 UV 坐标采样纹理颜色

```glsl
// 纹理采样示例
vec4 texColor = texture2D(u_texture, v_uv);  // 根据 UV 获取纹理颜色
gl_FragColor = texColor;  // 输出纹理颜色
```

---

### 4. UV 坐标

**一句话**：纹理上的**地址**，范围 0.0 ~ 1.0

**生活比喻**：
- UV 坐标就像**快递地址**
- (0, 0) = 纹理的左下角
- (1, 1) = 纹理的右上角
- (0.5, 0.5) = 纹理的正中央

**坐标系**：
```
(0,1) ┌                ┐ (1,1)
                    纹理
(0,0) └                ┘ (1,0)
```

**为什么要归一化**：不管纹理多大（256×256 或 4096×4096），UV 坐标都是 0~1，方便计算。

---

### 5. 向量（Vector）

**一句话**：有**方向**的**箭头**

**生活比喻**：
- 向量就像**导航指令**
- "向东走 3 公里，再向北走 4 公里"
- 包含：方向 + 长度

**技术解释**：
```glsl
vec2 v = vec2(3.0, 4.0);  // x 方向 3，y 方向 4
float len = length(v);     // 长度 = √(9+16) = 5.0
```

**常见用途**：
- 位置：从原点到某点的方向和距离
- 法线：表面朝向的方向
- 速度：物体运动的方向和快慢

---

### 6. 矩阵（Matrix）

**一句话**：**变换工具**，能移动、旋转、缩放

**生活比喻**：
- 矩阵就像**魔法咒语**
- 乘以"移动矩阵" → 物体移动
- 乘以"旋转矩阵" → 物体旋转
- 乘以"缩放矩阵" → 物体放大缩小

**技术解释**：
```glsl
// 2x2 缩放矩阵
mat2 scale = mat2(2.0, 0.0,
                  0.0, 2.0);  // 放大 2 倍

// 应用变换
vec2 pos = vec2(1.0, 1.0);
vec2 newPos = scale * pos;  // 结果：(2.0, 2.0)
```

**为什么用矩阵**：可以把多个变换合并成一个矩阵，一次计算搞定。

---

### 7. 混合（Blending）

**一句话**：把**多个颜色**叠加在一起

**生活比喻**：
- 混合就像**叠玻璃**
- 红色玻璃 + 蓝色玻璃 = 紫色
- 透明度越高，越能看到后面的

**技术解释**：
```glsl
// 源颜色（新画的）
vec4 src = vec4(1.0, 0.0, 0.0, 0.5);  // 半透明红色

// 目标颜色（已经画好的）
vec4 dst = vec4(0.0, 0.0, 1.0, 1.0);  // 不透明蓝色

// 混合结果
vec4 result = src * src.a + dst * (1.0 - src.a);  // 紫色
```

**常见用途**：半透明物体、玻璃、烟雾、UI 元素

---

### 8. 深度测试（Depth Test）

**一句话**：判断**谁在前面**，挡住谁

**生活比喻**：
- 深度测试就像**排队拍照**
- 站在前面的人挡住后面的人
- 只有最前面的人会被拍到

**技术解释**：
- 每个像素都有一个"深度值"（z 坐标）
- 深度值小的 = 离相机近 = 在前面
- 深度值大的 = 离相机远 = 在后面

```
相机 →  [物体A: z=5]  [物体B: z=10]

深度测试结果：物体A 在前面，挡住物体B
```

**为什么需要**：如果不做深度测试，后画的物体会覆盖先画的，不管远近。

---


## 参考资源

- [The Book of Shaders](https://thebookofshaders.com/) - 最好的入门教程
- [Shadertoy](https://www.shadertoy.com/) - 在线着色器编辑器，看大神作品
- [GLSL Specification](https://www.khronos.org/registry/OpenGL/specs/gl/GLSLangSpec.1.20.pdf) - 官方规范

---
