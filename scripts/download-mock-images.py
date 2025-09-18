#!/usr/bin/env python3
"""
Mock图片下载工具
为Blueprint能力卡下载合适的示例图片
"""

import requests
import os
import json
from pathlib import Path
from typing import Dict, List
import time

class MockImageDownloader:
    def __init__(self, output_dir: str = "public/images/examples"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # 图片配置 - 使用Unsplash API
        self.image_configs = {
            "identity-and-appeal": {
                "good": {
                    "search_term": "portrait,face,character,3d,figurine",
                    "description": "清晰可识别的Q版人物肖像"
                },
                "bad": {
                    "search_term": "generic,anime,character,unrecognizable",
                    "description": "通用动漫脸，失去个人特征"
                }
            },
            "form-and-stylization": {
                "good": {
                    "search_term": "consistent,art,style,3d,model",
                    "description": "统一的Q版风格，从头到脚一致"
                },
                "bad": {
                    "search_term": "mixed,style,inconsistent,3d,model",
                    "description": "混合风格，卡通头+写实身体"
                }
            },
            "material-expression": {
                "good": {
                    "search_term": "material,texture,3d,rendering,clean",
                    "description": "正确的材质表现，皮肤像哑光涂料"
                },
                "bad": {
                    "search_term": "material,confusion,shiny,opaque",
                    "description": "材质混乱，皮肤过亮，阴影烘焙"
                }
            },
            "technical-integrity": {
                "good": {
                    "search_term": "clean,3d,model,professional,mesh",
                    "description": "干净的3D模型，无穿透"
                },
                "bad": {
                    "search_term": "broken,3d,model,clipping,artifacts",
                    "description": "技术缺陷，头发穿透身体"
                }
            }
        }
    
    def download_from_unsplash(self, search_term: str, filename: str) -> str:
        """从Unsplash下载图片 (需要API密钥)"""
        try:
            # 注意：Unsplash Source API已停用，需要使用正式API
            # 这里保留接口，但实际使用Picsum
            print(f"⚠️  Unsplash Source API已停用，使用Picsum替代")
            return None
            
        except Exception as e:
            print(f"❌ 下载失败 {filename}: {e}")
            return None
    
    def download_from_picsum(self, seed: int, filename: str) -> str:
        """从Picsum下载随机图片作为备选"""
        try:
            url = f"https://picsum.photos/400/300?random={seed}"
            
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            file_path = self.output_dir / filename
            with open(file_path, 'wb') as f:
                f.write(response.content)
            
            print(f"✅ Picsum图片下载成功: {filename}")
            return str(file_path.relative_to(Path("public")))
            
        except Exception as e:
            print(f"❌ Picsum图片下载失败 {filename}: {e}")
            return None
    
    def download_from_placeholder(self, text: str, filename: str) -> str:
        """从Placeholder服务下载图片"""
        try:
            # 使用placeholder.com服务
            url = f"https://via.placeholder.com/400x300/4F46E5/FFFFFF?text={text.replace(' ', '+')}"
            
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            file_path = self.output_dir / filename
            with open(file_path, 'wb') as f:
                f.write(response.content)
            
            print(f"✅ Placeholder图片下载成功: {filename}")
            return str(file_path.relative_to(Path("public")))
            
        except Exception as e:
            print(f"❌ Placeholder图片下载失败 {filename}: {e}")
            return None
    
    def download_all_images(self) -> Dict[str, Dict[str, str]]:
        """下载所有示例图片"""
        results = {}
        
        for capability_id, config in self.image_configs.items():
            print(f"\n📸 下载 {capability_id} 的示例图片...")
            results[capability_id] = {}
            
            for example_type, image_config in config.items():
                filename = f"{capability_id}-{example_type}.jpg"
                image_path = None
                
                # 方案1: 尝试从Unsplash下载 (已停用，直接跳过)
                # image_path = self.download_from_unsplash(image_config["search_term"], filename)
                
                # 方案2: 使用Picsum随机图片
                if not image_path:
                    seed = hash(f"{capability_id}-{example_type}") % 1000
                    image_path = self.download_from_picsum(seed, filename)
                
                # 方案3: 如果Picsum也失败，使用Placeholder
                if not image_path:
                    text = f"{capability_id.replace('-', ' ').title()} {example_type.title()}"
                    image_path = self.download_from_placeholder(text, filename)
                
                if image_path:
                    results[capability_id][example_type] = image_path
                else:
                    print(f"⚠️  无法下载 {capability_id}-{example_type} 图片")
                
                # 避免请求过快
                time.sleep(0.5)
        
        return results
    
    def generate_image_mapping(self, results: Dict[str, Dict[str, str]]) -> str:
        """生成图片映射配置"""
        mapping = {
            "capability_images": {},
            "fallback_images": {
                "good": "/images/examples/default-good.jpg",
                "bad": "/images/examples/default-bad.jpg"
            }
        }
        
        for capability_id, images in results.items():
            mapping["capability_images"][capability_id] = {
                "good": images.get("good", mapping["fallback_images"]["good"]),
                "bad": images.get("bad", mapping["fallback_images"]["bad"])
            }
        
        # 保存映射文件
        mapping_file = self.output_dir / "image-mapping.json"
        with open(mapping_file, 'w', encoding='utf-8') as f:
            json.dump(mapping, f, indent=2, ensure_ascii=False)
        
        print(f"\n📋 图片映射已保存到: {mapping_file}")
        return str(mapping_file)
    
    def create_default_images(self):
        """创建默认图片"""
        default_images = [
            ("default-good.jpg", "https://source.unsplash.com/400x300/?success,good,quality"),
            ("default-bad.jpg", "https://source.unsplash.com/400x300/?error,bad,poor")
        ]
        
        for filename, url in default_images:
            try:
                response = requests.get(url, timeout=30)
                response.raise_for_status()
                
                file_path = self.output_dir / filename
                with open(file_path, 'wb') as f:
                    f.write(response.content)
                
                print(f"✅ 默认图片下载成功: {filename}")
            except Exception as e:
                print(f"❌ 默认图片下载失败 {filename}: {e}")

def main():
    print("🚀 开始下载Mock示例图片...")
    
    downloader = MockImageDownloader()
    
    # 下载所有图片
    results = downloader.download_all_images()
    
    # 创建默认图片
    downloader.create_default_images()
    
    # 生成映射文件
    mapping_file = downloader.generate_image_mapping(results)
    
    print(f"\n🎉 下载完成！")
    print(f"📁 图片保存在: {downloader.output_dir}")
    print(f"📋 映射文件: {mapping_file}")
    
    # 显示结果摘要
    print(f"\n📊 下载摘要:")
    for capability_id, images in results.items():
        print(f"  {capability_id}:")
        print(f"    Good: {'✅' if images.get('good') else '❌'}")
        print(f"    Bad:  {'✅' if images.get('bad') else '❌'}")

if __name__ == "__main__":
    main()
