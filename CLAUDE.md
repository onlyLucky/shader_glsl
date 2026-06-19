# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

从零学习 GLSL 着色器的实践项目，跟随视频教程逐步掌握着色器编程。

## 常用命令

```bash
# 验证着色器语法（VSCode 会自动执行，但也可手动运行）
glslangValidator --target-env opengl shader.frag

# 编译为 SPIR-V
glslangValidator -V shader.frag -o shader.spv

# 查看预处理结果
glslangValidator -E shader.frag
```

glslangValidator 路径：`/opt/homebrew/bin/glslangValidator`

## 目录结构

| 路径 | 说明 |
|---|---|
| `test.frag` | 主练习文件，跟随教程编写 |
| `glsl/` | 独立的着色器示例（circle_shape.frag, color.frag） |
| `docs/` | 工具使用文档（glslang-tools.md） |

## GLSL 版本

- **当前代码**：GLSL ES 1.00（使用 `gl_FragColor`）
- **学习目标**：GLSL ES 3.10+（需要 `#version 310 es`、显式 `out` 变量和 `layout(location)`）

编译为 SPIR-V 时必须使用 310 es 或更高版本，旧语法会报 `gl_FragColor undeclared` 错误。

## 着色器文件扩展名

`.frag`（片段）、`.vert`（顶点）、`.comp`（计算）——扩展名决定着色器阶段，glslangValidator 据此自动识别。
