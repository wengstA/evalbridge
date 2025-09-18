#!/usr/bin/env python3
"""
3D Dataset Image Downloader - 简化版
快速下载Material Textures和Lighting Scenarios图片
"""

import requests
import os
import json
import time
from pathlib import Path

# API配置
API_KEY = "yi0EZidm8kZmEEvn4H643YtHX2BO05YD8yPeHTsnfbMZQEY6RkW7H0wO"
BASE_URL = "https://api.pexels.com/v1/search"
HEADERS = {"Authorization": API_KEY}

# 创建下载目录
DOWNLOAD_DIR = Path("public/images/datasets")
DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)

# 3D数据集搜索查询
SEARCH_QUERIES = {
    "material_textures": [
        "fabric texture close up",
        "metal surface detail", 
        "wood grain texture",
        "stone texture pattern",
        "leather material",
        "glass reflection",
        "ceramic surface",
        "marble texture"
    ],
    "lighting_scenarios": [
        "studio lighting setup",
        "natural window light",
        "golden hour lighting",
        "soft diffused light",
        "dramatic shadows",
        "backlighting effect",
        "rim lighting",
        "product lighting"
    ]
}

def search_and_download(query: str, category: str, count: int = 5):
    """搜索并下载图片"""
    print(f"\n🔍 搜索: {query}")
    
    params = {
        "query": query,
        "per_page": count,
        "orientation": "square"
    }
    
    try:
        response = requests.get(BASE_URL, headers=HEADERS, params=params)
        response.raise_for_status()
        data = response.json()
        
        if not data.get('photos'):
            print(f"❌ 未找到图片: {query}")
            return []
        
        downloaded_files = []
        category_dir = DOWNLOAD_DIR / category
        category_dir.mkdir(exist_ok=True)
        
        for i, photo in enumerate(data['photos'][:count]):
            # 使用medium尺寸
            image_url = photo['src']['medium']
            filename = f"{category}_{photo['id']}_{i+1}.jpg"
            file_path = category_dir / filename
            
            # 检查文件是否已存在
            if file_path.exists():
                print(f"⏭️  已存在: {filename}")
                downloaded_files.append(str(file_path.relative_to(DOWNLOAD_DIR)))
                continue
            
            # 下载图片
            try:
                img_response = requests.get(image_url, stream=True)
                img_response.raise_for_status()
                
                with open(file_path, 'wb') as f:
                    for chunk in img_response.iter_content(chunk_size=8192):
                        f.write(chunk)
                
                print(f"✅ 下载: {filename}")
                downloaded_files.append(str(file_path.relative_to(DOWNLOAD_DIR)))
                
            except Exception as e:
                print(f"❌ 下载失败: {filename} - {e}")
            
            # 避免API限制
            time.sleep(0.5)
        
        return downloaded_files
        
    except Exception as e:
        print(f"❌ 搜索失败: {query} - {e}")
        return []

def main():
    print("🚀 开始下载3D数据集预览图片...")
    print(f"📁 下载目录: {DOWNLOAD_DIR}")
    
    all_results = {}
    
    for category, queries in SEARCH_QUERIES.items():
        print(f"\n🎯 处理类别: {category}")
        category_files = []
        
        for query in queries:
            files = search_and_download(query, category, count=3)
            category_files.extend(files)
            time.sleep(1)  # 避免API限制
        
        all_results[category] = category_files
    
    # 生成数据集信息
    dataset_info = {
        "total_images": sum(len(files) for files in all_results.values()),
        "categories": all_results,
        "download_time": time.strftime("%Y-%m-%d %H:%M:%S"),
        "description": "3D Dataset Preview Images - Material Textures & Lighting Scenarios"
    }
    
    info_file = DOWNLOAD_DIR / "dataset_info.json"
    with open(info_file, 'w', encoding='utf-8') as f:
        json.dump(dataset_info, f, indent=2, ensure_ascii=False)
    
    # 打印摘要
    print("\n" + "="*60)
    print("📊 下载摘要")
    print("="*60)
    
    total_images = 0
    for category, files in all_results.items():
        count = len(files)
        total_images += count
        print(f"📁 {category}: {count} 张图片")
    
    print(f"\n🎉 总计下载: {total_images} 张图片")
    print(f"📁 保存位置: {DOWNLOAD_DIR}")
    print(f"📋 信息文件: {info_file}")
    print("="*60)

if __name__ == "__main__":
    main()
