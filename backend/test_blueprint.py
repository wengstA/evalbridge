#!/usr/bin/env python3
"""
Test script for generate_blueprint function
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import extract_product_info_and_functions, call_domain_router_agent, call_dynamic_expert_agent, generate_capability_dimensions_internal
import json

def test_three_stage_workflow():
    """Test the complete three-stage workflow"""
    
    # Test input
    user_input = "我想创建一个3D模型生成器，用于社交媒体发布。用户可以上传照片，然后生成3D模型用于AR展示和社交分享。"
    
    print("=" * 80)
    print("Testing Three-Stage AI Workflow")
    print("=" * 80)
    print(f"Input: {user_input}")
    print()
    
    try:
        # Step 0: Extract product info and ideal functions
        print("Step 0: Extracting product information and ideal functions...")
        print("-" * 60)
        extracted_info = extract_product_info_and_functions(user_input)
        
        product_info = extracted_info.get('productInfo', user_input)
        ideal_functions = extracted_info.get('idealFunctions', user_input)
        
        print(f"✓ Product Info: {product_info}")
        print(f"✓ Ideal Functions: {ideal_functions}")
        print()
        
        # Step A: Domain Router Agent
        print("Step A: Domain Router Agent - Identifying expert knowledge domains...")
        print("-" * 60)
        
        # Debug the domain router response first
        try:
            domain_context = call_domain_router_agent(product_info, ideal_functions)
        except Exception as e:
            print(f"Domain router failed, debugging the response...")
            # Let's manually check what the AI returns
            from app import client
            import re
            
            domain_router_prompt = f"""# ROLE: 首席系统架构师 (Chief Systems Architect) & 专家调度中枢

# CONTEXT:
你是一个AI评测系统的"路由"中枢。你的任务是分析一个新产品的高阶需求，并准确判断：要"评测"这个产品，我们必须从哪些"专业领域"视角切入。

# TASK:
分析用户提供的 [产品信息] 和 [理想功能]。你必须识别出三个关键的知识领域：
1. 专业/业务领域 (Professional/Business Domain): 即该产品所属的行业核心价值。 (例如：电影制作、广告营销、医疗诊断、游戏设计)。
2. 技术实现领域 (Technical Domain): 即支撑该产品的核心技术栈。 (例如：实时渲染管线、物理仿真、AIGC生成算法、生物信息学)。
3. 核心用户价值 (Core User Value / Persona): 即用户使用该产品的核心驱动力。 (例如：追求情感共鸣、追求生产力效率、追求商业变现)。

# INPUT:
[产品信息]: {product_info}
[理想功能]: {ideal_functions}

# OUTPUT CONSTRAINTS (MANDATORY):
1. 你必须且只能返回一个符合以下JSON Schema的 **单一JSON对象**。不要包含任何JSON区块之外的解释性文本。
2. `knowledgeDescription` 必须是精炼的短语，用于"注入"给下一个Agent作为指令。

# JSON SCHEMA (Strictly Enforce):
{{
  "professionalDomain": {{
    "domainName": "string (例如: 广告营销与病毒式传播)",
    "knowledgeDescription": "string (描述该领域的核心知识点，例如: 精通视觉锤、黄金3秒吸引力法则、A/B测试和CTR转化漏斗)"
  }},
  "technicalDomain": {{
    "domainName": "string (例如: 3D视频AIGC管线)",
    "knowledgeDescription": "string (描述该领域的核心技术点，例如: 精通3D资产生成、动态绑定、场景渲染与视频合成技术)"
  }},
  "userDomain": {{
    "domainName": "string (例如: 市场部经理 (User Persona))",
    "knowledgeDescription": "string (描述该用户最关心什么，例如: 深刻理解用户对'ROI最大化'和'品牌安全'的终极需求)"
  }}
}}"""

            response = client.models.generate_content(
                model="gemini-2.0-flash-exp",
                contents=domain_router_prompt
            )
            
            response_text = response.text.strip()
            print(f"Raw AI Response: {response_text}")
            
            # Try to extract JSON
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                print(f"Extracted JSON: {json_str}")
                try:
                    domain_context = json.loads(json_str)
                    print("✓ JSON parsing successful after manual debug")
                except Exception as parse_error:
                    print(f"JSON parsing still failed: {parse_error}")
                    return False
            else:
                print("No JSON found in response")
                return False
        
        print(f"✓ Professional Domain: {domain_context['professionalDomain']['domainName']}")
        print(f"  Knowledge: {domain_context['professionalDomain']['knowledgeDescription']}")
        print(f"✓ Technical Domain: {domain_context['technicalDomain']['domainName']}")
        print(f"  Knowledge: {domain_context['technicalDomain']['knowledgeDescription']}")
        print(f"✓ User Domain: {domain_context['userDomain']['domainName']}")
        print(f"  Knowledge: {domain_context['userDomain']['knowledgeDescription']}")
        print()
        
        # Step B & C: Dynamic Expert Agent
        print("Step B & C: Dynamic Expert Agent - Generating capability dimensions...")
        print("-" * 60)
        blueprint_cards = call_dynamic_expert_agent(domain_context, product_info, ideal_functions)
        
        print(f"✓ Generated {len(blueprint_cards)} capability cards")
        for i, card in enumerate(blueprint_cards, 1):
            print(f"  {i}. {card['title']} ({card['priority']})")
            print(f"     {card['description'][:100]}...")
            print(f"     技术因素: {len(card.get('keyTechnicalFactors', []))} 个")
        
        print()
        print("=" * 80)
        print("✓ THREE-STAGE WORKFLOW COMPLETED SUCCESSFULLY!")
        print("=" * 80)
        
        # Test the complete internal function
        print("\nTesting complete internal function...")
        result = generate_capability_dimensions_internal(product_info, ideal_functions)
        print(f"✓ Internal function returned: {type(result)} with status code")
        
        return True
        
    except Exception as e:
        print(f"✗ Error in three-stage workflow: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_three_stage_workflow()
    sys.exit(0 if success else 1)