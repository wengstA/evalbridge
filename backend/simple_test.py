#!/usr/bin/env python3
"""
Simple test for the fixed API endpoint
"""

import requests
import json

def test_api_endpoint():
    """Test the API endpoint directly"""
    
    url = "http://localhost:8080/api/generate-blueprint"
    payload = {
        "userInput": "我想创建一个3D模型生成器，用于社交媒体发布。用户可以上传照片，然后生成3D模型用于AR展示和社交分享。"
    }
    
    print("=" * 60)
    print("Testing /api/generate-blueprint endpoint")
    print("=" * 60)
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(payload, ensure_ascii=False, indent=2)}")
    print()
    
    try:
        response = requests.post(url, json=payload, timeout=60)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ API Call Successful!")
            
            blueprint_cards = data.get('blueprintCards', [])
            print(f"Generated {len(blueprint_cards)} capability cards:")
            
            for i, card in enumerate(blueprint_cards, 1):
                print(f"  {i}. {card.get('title', 'No Title')} ({card.get('priority', 'No Priority')})")
                if card.get('description'):
                    print(f"     {card['description'][:80]}...")
                
                # Check technical factors
                tech_factors = card.get('keyTechnicalFactors', [])
                print(f"     技术因素: {len(tech_factors)} 个")
                
                if tech_factors and isinstance(tech_factors[0], dict):
                    for factor in tech_factors[:2]:  # Show first 2
                        print(f"       - {factor.get('name', 'No name')}")
            
            print()
            print("=" * 60)
            print("✅ THREE-STAGE WORKFLOW API TEST SUCCESSFUL!")
            print("=" * 60)
            return True
            
        else:
            print(f"❌ API Error: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error: {error_data}")
            except:
                print(f"Raw response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_api_endpoint()
    exit(0 if success else 1)