---
name: "cocos-scene-inspector"
description: "Inspect Cocos Creator live scene via Funplay MCP: hierarchy, node components, script bindings. Invoke for scene/node/component queries instead of parsing .scene files with shell scripts."
---

# Cocos 场景检查器（Funplay MCP）

通过 Funplay Cocos MCP 插件读取**编辑器实时**场景数据：场景节点树、节点组件列表、自定义脚本组件的属性绑定。

## 何时使用

- 用户要求查看/分析场景节点树、某节点挂载了哪些组件、脚本属性（@property）绑定到了哪些节点。
- 用户提到「当前编辑器场景」「场景里有哪些节点」「Player 节点上有什么组件」等。
- 排查「脚本看似没挂载 / 属性绑定为 null / 节点引用对不上」类问题时，用实时数据核对。

**禁止**为上述目的用 PowerShell/Node 脚本去解析 `assets/**/*.scene` 序列化 JSON（用户明确要求走 MCP；解析文件只能得到磁盘快照，且容易误判）。

## 1. 调用前确认 MCP 服务在线

服务名带项目哈希后缀（本工作区为 `mcp_cocos-3d-a4d037`，换项目会变），**不要硬编码**，按以下方式动态发现：

1. 列出 `c:\Users\<用户名>\.trae-cn\mcps\<工作区哈希>\solo_agent\`，找 `mcp_cocos-*` 目录。
2. 确认其 `tools/` 下存在 `get_hierarchy.json` 等描述符；**调用前先 Read 描述符**，按其中的参数 schema 传参。
3. 通过 `run_mcp`（server_name = 该目录名）调用工具。

若调用返回 `mcp error: MCP server is not found`：

- 说明服务未被当前会话加载。请用户检查：Cocos 编辑器 Funplay 面板为 Running、TRAE 的 MCP 管理中已启用该服务、然后 Reload Window 或新开会话。
- **把原始报错原样告诉用户**，不要改用 shell 解析 `.scene` 文件兜底。

## 2. 工具选择

| 需求 | 工具 | 关键参数 |
|---|---|---|
| 场景树（含组件） | `get_hierarchy` | `{ "includeComponents": true, "includeInactive": true }`；`rootPath` 查子树；`maxDepth` 限深 |
| 当前场景概览 | `get_scene_info` | 无；先确认 `sceneName`，回答中注明数据来自哪个场景 |
| 切场景/列场景 | `open_scene` / `list_scenes` | 查询前若编辑器打开的不是目标场景，先切换 |
| 脚本属性绑定、自定义查询 | `execute_javascript` | `{ "context": "scene", "code": "..." }` |

注意：当前 core 工具档位**没有** `list_components`——节点组件用 `get_hierarchy`（includeComponents）或场景脚本获取。

## 3. execute_javascript（context=scene）注意事项

1. **执行环境已注入全局变量 `scene`**：不要再 `const scene = ...`，否则报 `Identifier 'scene' has already been declared`。用 IIFE 包裹整段代码。
2. **不要在代码中写 `'\n'` 字面量**：会被安全检查误判为绝对路径，报 `JavaScript safety checks blocked ... absolute path outside the Cocos project is blocked`。改用 `String.fromCharCode(10)` 或数组 `join`。
3. `cc` 全局可用；结果用 `return` 返回。自定义脚本组件的类名即 `@ccclass('Xxx')` 注册名（如 `Player`）。
4. 自定义脚本组件的 `@property` 绑定可直接读实例属性（Label/Node 取 `.node.name`，Collider 取 `.constructor.name + ' @ ' + .node.name`）。

## 4. 输出约定

- 用树状缩进展示节点，行尾 `[组件1, 组件2]`，未激活节点标注 `[未激活]`。
- **过滤编辑器内置节点**：`Editor Scene Foreground`、`Editor Scene Background`（gizmo、坐标轴、网格、编辑器相机等）不属于游戏内容；若用场景脚本遍历得到它们，展示时删除并说明（`get_hierarchy` 工具结果通常不含）。
- 注明数据来源场景名与「编辑器实时数据」。
- 对查询的目标节点，单独给「组件列表」表和「脚本属性绑定」表。

## 5. 可复用代码片段

精简场景树（已处理上述两个坑）：

```javascript
return (() => {
  const NL = String.fromCharCode(10);
  const root = cc.director.getScene();
  function walk(n, d) {
    const comps = n.components.map(c => c.constructor.name);
    let lines = ['  '.repeat(d) + '- ' + n.name
      + (n.active ? '' : ' [inactive]')
      + (comps.length ? '  [' + comps.join(', ') + ']' : '')];
    for (const ch of n.children) lines = lines.concat(walk(ch, d + 1));
    return lines;
  }
  return walk(root, 0).join(NL);
})();
```

查节点组件 + 指定脚本属性绑定：

```javascript
return (() => {
  const n = cc.find('Player');
  const out = { node: n.name, active: n.active,
    components: n.components.map(c => c.constructor.name) };
  const s = n.components.find(c => c.constructor.name === 'Player');
  if (s) out.bindings = {
    Player_Speed: s.Player_Speed,
    Tips_Label: s.Tips_Label ? s.Tips_Label.node.name : null,
    Tips_Node:   s.Tips_Node ? s.Tips_Node.name : null,
    Player_Node: s.Player_Node ? s.Player_Node.constructor.name + ' @ ' + s.Player_Node.node.name : null,
    C_Node:      s.C_Node ? s.C_Node.name : null
  };
  return out;
})();
```
