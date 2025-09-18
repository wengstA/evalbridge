# 3D Dataset Image Downloader

从Pexels API下载3D数据集预览图片，特别关注Material Textures和Lighting Scenarios。

## 🎯 功能特性

- **Material Textures**: 各种材质纹理图片（布料、金属、木材、石材等）
- **Lighting Scenarios**: 不同光照场景图片（自然光、工作室灯光、戏剧性光照等）
- **智能搜索**: 使用专业的3D相关搜索查询
- **自动分类**: 按类别自动组织下载的图片
- **重复检测**: 避免重复下载已存在的图片
- **API限制**: 内置请求频率控制

## 📁 文件结构

```
scripts/
├── download-3d-dataset-images.py      # 完整版脚本（支持命令行参数）
├── download-dataset-images-simple.py  # 简化版脚本（直接运行）
└── README.md                          # 说明文档

public/images/datasets/
├── material_textures/                 # 材质纹理图片
├── lighting_scenarios/               # 光照场景图片
└── dataset_info.json                 # 数据集信息文件
```

## 🚀 使用方法

### 方法1: 简化版（推荐）

直接运行简化版脚本：

```bash
cd scripts
python download-dataset-images-simple.py
```

### 方法2: 完整版

使用命令行参数：

```bash
cd scripts
python download-3d-dataset-images.py --api-key YOUR_API_KEY --images-per-query 5 --category all
```

#### 参数说明

- `--api-key`: Pexels API密钥（必需）
- `--images-per-query`: 每个查询下载的图片数量（默认3）
- `--category`: 要下载的图片类别
  - `material_textures`: 材质纹理
  - `lighting_scenarios`: 光照场景
  - `3d_objects`: 3D对象
  - `all`: 所有类别（默认）

## 🔍 搜索查询

### Material Textures（材质纹理）
- fabric texture close up
- metal surface detail
- wood grain texture
- stone texture pattern
- leather material
- glass reflection
- ceramic surface
- marble texture

### Lighting Scenarios（光照场景）
- studio lighting setup
- natural window light
- golden hour lighting
- soft diffused light
- dramatic shadows
- backlighting effect
- rim lighting
- product lighting

## 📊 输出示例

```
🚀 开始下载3D数据集预览图片...
📁 下载目录: public/images/datasets

🎯 处理类别: material_textures

🔍 搜索: fabric texture close up
✅ 下载: material_textures_1234567_1.jpg
✅ 下载: material_textures_1234568_2.jpg
✅ 下载: material_textures_1234569_3.jpg

🔍 搜索: metal surface detail
✅ 下载: material_textures_1234570_1.jpg
...

============================================================
📊 下载摘要
============================================================
📁 material_textures: 24 张图片
📁 lighting_scenarios: 24 张图片

🎉 总计下载: 48 张图片
📁 保存位置: public/images/datasets
📋 信息文件: public/images/datasets/dataset_info.json
============================================================
```

## 📋 数据集信息文件

脚本会自动生成 `dataset_info.json` 文件，包含：

```json
{
  "total_images": 48,
  "categories": {
    "material_textures": [
      "material_textures/1234567_1.jpg",
      "material_textures/1234568_2.jpg"
    ],
    "lighting_scenarios": [
      "lighting_scenarios/1234569_1.jpg",
      "lighting_scenarios/1234570_2.jpg"
    ]
  },
  "download_time": "2024-01-15 14:30:25",
  "description": "3D Dataset Preview Images - Material Textures & Lighting Scenarios"
}
```

## ⚙️ 配置说明

### API密钥
脚本中已包含API密钥，如需更换：

```python
API_KEY = "your_new_api_key_here"
```

### 下载数量
调整每个查询的图片数量：

```python
# 在简化版中
files = search_and_download(query, category, count=5)  # 改为5张

# 在完整版中
python download-3d-dataset-images.py --images-per-query 5
```

### 搜索查询
在 `SEARCH_QUERIES` 字典中添加或修改搜索词：

```python
SEARCH_QUERIES = {
    "material_textures": [
        "fabric texture close up",
        "metal surface detail",
        # 添加新的搜索词
        "new_material_query"
    ]
}
```

## 🛡️ API限制

- Pexels API有请求频率限制
- 脚本内置了延迟机制避免超限
- 建议不要同时运行多个下载脚本

## 🔧 故障排除

### 常见问题

1. **API密钥错误**
   ```
   ❌ 搜索失败: query - 401 Unauthorized
   ```
   解决：检查API密钥是否正确

2. **网络连接问题**
   ```
   ❌ 下载失败: filename - Connection timeout
   ```
   解决：检查网络连接，重试运行脚本

3. **磁盘空间不足**
   ```
   ❌ 下载失败: filename - No space left on device
   ```
   解决：清理磁盘空间

### 调试模式

在脚本开头添加调试信息：

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📝 注意事项

- 图片版权归Pexels摄影师所有
- 仅用于3D数据集预览和参考
- 请遵守Pexels API使用条款
- 建议定期更新图片以保持数据集新鲜度
