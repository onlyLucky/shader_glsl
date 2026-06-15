# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个从零开始学习 GLSL 着色器的项目，跟随视频教程进行实践学习。

## 开发工具

### 着色器验证

使用 glslangValidator 验证 GLSL 代码：

```bash
# 验证语法
glslangValidator --target-env opengl shader.frag

# 编译为 SPIR-V
glslangValidator -V shader.frag -o shader.spv
```

### VSCode 集成

已配置 GLSL Lint 扩展（`.vscode/settings.json`），打开 `.frag` 文件时自动进行语法检查。

## GLSL 版本约定

- **当前代码**：GLSL ES 1.00（旧语法，使用 `gl_FragColor`）
- **学习目标**：GLSL ES 3.10+（现代语法，需要显式 `out` 变量和 `location` 声明）

### 现代 GLSL 模板

```glsl
#version 310 es
precision mediump float;

layout(location = 0) out vec4 fragColor;

void main() {
    fragColor = vec4(1.0);
}
```

## 文件类型

| 扩展名 | 用途 |
|---|---|
| `.frag` | 片段着色器 |
| `.vert` | 顶点着色器 |
| `.comp` | 计算着色器 |

## 学习进度

跟随视频教程从基础开始，逐步掌握：
1. 基础语法和数据类型
2. 向量和矩阵操作
3. 内建函数
4. 纹理采样
5. 光照和阴影
