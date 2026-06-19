# GLSL Shader 学习项目

从零开始学习 GLSL 着色器编程，跟随视频教程进行实践学习。

## 目录结构

```
├── test.frag                    # 主练习文件
├── glsl/                        # 独立着色器示例（基于 lewislepton/shadertutorialseries）
│   ├── circle_shape.frag        # 圆形
│   ├── rectangle.frag           # 矩形
│   ├── polygon_shape.frag       # 多边形
│   └── color.frag               # 颜色
├── docs/
│   ├── glslang-tools.md         # glslangValidator 使用指南
└── .vscode/settings.json        # VSCode GLSL Lint 配置
```

## 代码来源

`glsl/` 目录中的着色器示例基于 [lewislepton/shadertutorialseries](https://github.com/lewislepton/shadertutorialseries) 仓库的代码，跟随其教程进行学习和实践。

## 开发工具

### 着色器验证

使用 [glslangValidator](https://github.com/KhronosGroup/glslang) 验证 GLSL 代码：

```bash
# 验证语法
glslangValidator --target-env opengl shader.frag

# 编译为 SPIR-V
glslangValidator -V shader.frag -o shader.spv
```

### VSCode 集成

已配置 GLSL Lint 扩展，打开 `.frag` 文件时自动进行语法检查。

配置文件：`.vscode/settings.json`

```json
{
  "glsl-lint.glslangValidatorPath": "/opt/homebrew/bin/glslangValidator",
  "glsl-lint.additionalOptions": "--target-env opengl"
}
```

## GLSL 版本

| 版本 | 说明 |
|------|------|
| GLSL ES 1.00 | 旧语法，使用 `gl_FragColor`（当前使用） |
| GLSL ES 3.10+ | 现代语法，需要 `#version 310 es`、显式 `out` 变量和 `layout(location)` |

## 学习内容

### 基础形状
- 圆形 (`circleShape`)
- 矩形 (`rectShape`)
- 多边形 (`polygonShape`)

### 变换操作
- 平移 (`translate`)
- 缩放 (`scale`)
- 旋转 (`rotate`)

### 进阶效果
- 颜色 (`color`)
- 噪声 (`noise`)
- 图像处理 (`image`)
- 水彩效果 (`waterColor`)
- 扫描线 (`scanningLines`)
- 彩虹漩涡 (`rainbowSwirl`)

## 着色器文件扩展名

| 扩展名 | 用途 |
|--------|------|
| `.frag` | 片段着色器 |
| `.vert` | 顶点着色器 |
| `.comp` | 计算着色器 |

## 相关资源

- [glslang GitHub](https://github.com/KhronosGroup/glslang)
- [GLSL 规范](https://www.khronos.org/opengles/sdk/docs/man/)
- [SPIR-V 规范](https://www.khronos.org/registry/spir-v/)
- [The Book of Shaders](https://thebookofshaders.com/)
