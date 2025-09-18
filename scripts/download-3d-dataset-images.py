#!/usr/bin/env python3
"""
3D Dataset Image Downloader
从Pexels API下载3D数据集预览照片，特别关注Material Textures和Lighting Scenarios
"""

import requests
import os
import json
import time
from pathlib import Path
from typing import List, Dict, Optional
import argparse

class PexelsImageDownloader:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.pexels.com/v1/search"
        self.headers = {
            "Authorization": api_key
        }
        
        # 创建下载目录
        self.download_dir = Path("public/images/datasets")
        self.download_dir.mkdir(parents=True, exist_ok=True)
        
        # 3D数据集相关的搜索查询
        self.search_queries = {
            "material_textures": [
                "fabric texture",
                "metal texture", 
                "wood texture",
                "stone texture",
                "leather texture",
                "glass material",
                "ceramic texture",
                "plastic material",
                "rubber texture",
                "marble texture",
                "brick texture",
                "concrete texture",
                "fabric close up",
                "metal surface",
                "wood grain",
                "stone surface"
            ],
            "lighting_scenarios": [
                "studio lighting",
                "natural lighting",
                "golden hour",
                "blue hour",
                "soft lighting",
                "hard lighting",
                "dramatic lighting",
                "ambient lighting",
                "backlighting",
                "side lighting",
                "top lighting",
                "rim lighting",
                "volumetric lighting",
                "mood lighting",
                "product lighting",
                "portrait lighting"
            ],
            "3d_objects": [
                "3d model",
                "product photography",
                "object photography",
                "still life",
                "geometric shapes",
                "abstract objects",
                "minimalist objects",
                "modern objects",
                "design objects",
                "architectural elements"
            ]
        }
    
    def search_images(self, query: str, per_page: int = 10) -> Optional[Dict]:
        """搜索图片"""
        params = {
            "query": query,
            "per_page": per_page,
            "orientation": "square"  # 正方形图片更适合3D预览
        }
        
        try:
            response = requests.get(self.base_url, headers=self.headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"搜索失败 '{query}': {e}")
            return None
    
    def download_image(self, url: str, filename: str) -> bool:
        """下载单张图片"""
        try:
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            file_path = self.download_dir / filename
            with open(file_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            print(f"✅ 下载成功: {filename}")
            return True
        except requests.exceptions.RequestException as e:
            print(f"❌ 下载失败 '{filename}': {e}")
            return False
    
    def download_category_images(self, category: str, queries: List[str], images_per_query: int = 3) -> Dict[str, List[str]]:
        """下载特定类别的图片"""
        print(f"\n🎯 开始下载 {category} 类别图片...")
        
        downloaded_files = []
        category_dir = self.download_dir / category
        category_dir.mkdir(exist_ok=True)
        
        for i, query in enumerate(queries, 1):
            print(f"\n📸 搜索: '{query}' ({i}/{len(queries)})")
            
            # 搜索图片
            search_result = self.search_images(query, per_page=images_per_query)
            if not search_result or not search_result.get('photos'):
                print(f"⚠️  未找到图片: {query}")
                continue
            
            # 下载图片
            for j, photo in enumerate(search_result['photos'][:images_per_query]):
                # 使用medium尺寸，适合预览
                image_url = photo['src']['medium']
                
                # 生成文件名
                filename = f"{category}_{i:02d}_{j+1:02d}_{photo['id']}.jpg"
                file_path = category_dir / filename
                
                # 检查文件是否已存在
                if file_path.exists():
                    print(f"⏭️  文件已存在: {filename}")
                    downloaded_files.append(str(file_path.relative_to(self.download_dir)))
                    continue
                
                # 下载图片
                if self.download_image(image_url, str(file_path.relative_to(self.download_dir))):
                    downloaded_files.append(str(file_path.relative_to(self.download_dir)))
                
                # 避免API限制
                time.sleep(0.5)
        
        return {category: downloaded_files}
    
    def download_all_categories(self, images_per_query: int = 3) -> Dict[str, List[str]]:
        """下载所有类别的图片"""
        print("🚀 开始下载3D数据集预览图片...")
        print(f"📁 下载目录: {self.download_dir}")
        
        all_results = {}
        
        for category, queries in self.search_queries.items():
            results = self.download_category_images(category, queries, images_per_query)
            all_results.update(results)
            
            # 类别间暂停，避免API限制
            time.sleep(2)
        
        return all_results
    
    def generate_dataset_info(self, results: Dict[str, List[str]]) -> None:
        """生成数据集信息文件"""
        info_file = self.download_dir / "dataset_info.json"
        
        dataset_info = {
            "total_images": sum(len(files) for files in results.values()),
            "categories": {},
            "download_time": time.strftime("%Y-%m-%d %H:%M:%S"),
            "description": "3D Dataset Preview Images from Pexels API",
            "categories_description": {
                "material_textures": "各种材质纹理图片，用于3D材质渲染参考",
                "lighting_scenarios": "不同光照场景图片，用于3D光照效果参考", 
                "3d_objects": "3D对象和产品摄影，用于3D建模参考"
            }
        }
        
        for category, files in results.items():
            dataset_info["categories"][category] = {
                "count": len(files),
                "files": files,
                "description": dataset_info["categories_description"].get(category, "")
            }
        
        with open(info_file, 'w', encoding='utf-8') as f:
            json.dump(dataset_info, f, indent=2, ensure_ascii=False)
        
        print(f"\n📋 数据集信息已保存: {info_file}")
    
    def print_summary(self, results: Dict[str, List[str]]) -> None:
        """打印下载摘要"""
        print("\n" + "="*60)
        print("📊 下载摘要")
        print("="*60)
        
        total_images = 0
        for category, files in results.items():
            count = len(files)
            total_images += count
            print(f"📁 {category}: {count} 张图片")
        
        print(f"\n🎉 总计下载: {total_images} 张图片")
        print(f"📁 保存位置: {self.download_dir}")
        print("="*60)

def main():
    parser = argparse.ArgumentParser(description="从Pexels API下载3D数据集预览图片")
    parser.add_argument("--api-key", required=True, help="Pexels API密钥")
    parser.add_argument("--images-per-query", type=int, default=3, help="每个查询下载的图片数量")
    parser.add_argument("--category", choices=["material_textures", "lighting_scenarios", "3d_objects", "all"], 
                       default="all", help="要下载的图片类别")
    
    args = parser.parse_args()
    
    # 创建下载器
    downloader = PexelsImageDownloader(args.api_key)
    
    if args.category == "all":
        # 下载所有类别
        results = downloader.download_all_categories(args.images_per_query)
    else:
        # 下载特定类别
        queries = downloader.search_queries[args.category]
        results = downloader.download_category_images(args.category, queries, args.images_per_query)
    
    # 生成数据集信息
    downloader.generate_dataset_info(results)
    
    # 打印摘要
    downloader.print_summary(results)

if __name__ == "__main__":
    # 如果直接运行，使用默认API密钥
    API_KEY = "yi0EZidm8kZmEEvn4H643YtHX2BO05YD8yPeHTsnfbMZQEY6RkW7H0wO"
    
    # 创建下载器
    downloader = PexelsImageDownloader(API_KEY)
    
    # 下载所有类别
    results = downloader.download_all_categories(images_per_query=3)
    
    # 生成数据集信息
    downloader.generate_dataset_info(results)
    
    # 打印摘要
    downloader.print_summary(results)
