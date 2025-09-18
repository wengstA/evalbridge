# 🚀 AI PM Evaluation System - Dual Mode

一个支持**演示模式**和**生产模式**的AI产品经理评估系统。

## 🎯 双模式特性

### 🎭 演示模式 (Demo Mode)
- **无需API密钥** - 使用预生成的模拟数据
- **即时响应** - 无需等待AI处理时间
- **零成本** - 不产生任何API费用
- **完美演示** - 提供真实感的用户体验
- **快速测试** - 适合开发和演示场景

### ⚡ 生产模式 (Production Mode)
- **真实AI能力** - 使用Gemini 2.5 Pro API
- **完整功能** - 所有AI特性完全可用
- **需要API密钥** - 需要配置Gemini API密钥
- **适合生产** - 用于实际的评估工作

## 🚀 快速开始

### 1. 安装依赖
```bash
cd backend
pip install -r requirements.txt
```

### 2. 启动系统

#### 演示模式 (推荐用于演示)
```bash
python launch.py --mode demo
```

#### 生产模式 (需要API密钥)
```bash
# 首先配置API密钥
cp env.example .env
# 编辑 .env 文件，添加你的 GEMINI_API_KEY

# 然后启动
python launch.py --mode production
```

### 3. 访问系统
- **主应用**: http://localhost:8080
- **监控面板**: http://localhost:5001

## 🔧 配置说明

### 环境变量 (.env)
```bash
# 应用模式
APP_MODE=demo  # 或 production

# Gemini API配置 (仅生产模式需要)
GEMINI_API_KEY=your_gemini_api_key_here

# 服务器配置
MAIN_APP_PORT=8080
DASHBOARD_PORT=5001
```

### 模式切换
```bash
# 演示模式
python launch.py --mode demo

# 生产模式
python launch.py --mode production

# 自定义端口
python launch.py --mode demo --port 3000 --dashboard-port 5000
```

## 📊 监控面板

系统包含一个实时监控面板，可以查看：
- **执行历史** - 所有AI工作流程的执行记录
- **步骤详情** - 每个执行步骤的详细信息
- **性能指标** - 响应时间、成功率等
- **错误日志** - 失败执行的错误信息

访问: http://localhost:5001

## 🎨 前端集成

### 模式切换组件
```tsx
import { ModeToggle } from '@/components/mode-toggle'

function App() {
  return (
    <div>
      <ModeToggle />
      {/* 其他组件 */}
    </div>
  )
}
```

### API调用
```typescript
// 获取当前模式
const response = await fetch('/api/mode')
const { mode, is_demo } = await response.json()

// 切换模式 (需要重启)
await fetch('/api/mode', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ mode: 'production' })
})
```

## 🔍 模式对比

| 特性 | 演示模式 | 生产模式 |
|------|----------|----------|
| API密钥 | 不需要 | 必需 |
| 响应速度 | 即时 | 2-10秒 |
| 数据真实性 | 模拟 | 真实 |
| 成本 | 免费 | API费用 |
| 适用场景 | 演示、测试 | 生产使用 |

## 🛠️ 开发指南

### 添加新的模拟数据
编辑 `mock_data_generator.py`:
```python
def generate_custom_data(self, params):
    # 添加你的模拟数据生成逻辑
    return mock_data
```

### 扩展API端点
在 `app.py` 中添加新的端点:
```python
@app.route('/api/custom', methods=['POST'])
def custom_endpoint():
    if APP_MODE == 'demo':
        return jsonify(mock_generator.generate_custom_response())
    else:
        # 真实API调用
        return jsonify(real_api_call())
```

## 🚨 故障排除

### 常见问题

1. **API密钥错误**
   ```
   ValueError: GEMINI_API_KEY environment variable is required
   ```
   - 确保在 `.env` 文件中设置了正确的API密钥
   - 检查API密钥是否有效

2. **端口被占用**
   ```
   Address already in use
   ```
   - 使用 `--port` 参数指定其他端口
   - 或者停止占用端口的其他服务

3. **依赖缺失**
   ```
   ModuleNotFoundError: No module named 'flask'
   ```
   - 运行 `pip install -r requirements.txt`

### 调试模式
```bash
# 启用调试模式
export FLASK_DEBUG=True
python launch.py --mode demo
```

## 📈 性能优化

### 演示模式优化
- 模拟数据预生成，响应极快
- 无网络延迟，适合演示

### 生产模式优化
- 使用最新的Gemini 2.5 Pro模型
- 智能提示词缓存
- 工作流程监控和优化

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License - 详见 LICENSE 文件

---

**享受使用AI PM评估系统！** 🎉
