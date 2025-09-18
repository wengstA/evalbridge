from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import json
from google import genai
from typing import List, Dict, Any
import os
from datetime import datetime
import time
import threading
from prompt_manager import prompt_manager
from workflow_dashboard import workflow_monitor
from mock_data_generator import mock_generator
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Application mode configuration
APP_MODE = os.getenv('APP_MODE', 'demo').lower()
print(f"🚀 Application running in {APP_MODE.upper()} mode")

# Gemini API configuration (only for production mode)
client = None
if APP_MODE == 'production':
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY environment variable is required for production mode")
    client = genai.Client(api_key=GEMINI_API_KEY)
    print("✅ Gemini API client initialized")
else:
    print("🎭 Running in demo mode with mock data")

class ChatMessage:
    def __init__(self, role: str, content: str):
        self.role = role
        self.content = content

class EvaluationConsultant:
    def __init__(self):
        # Individual expert profiles that can be combined
        self.expert_profiles = {
            '3d_graphics': {
                'title': '3D Computer Graphics & Artistic Rendering Specialist',
                'emoji': '🎨',
                'expertise': 'Deep expertise in 3D modeling, neural rendering, photogrammetry, and digital art creation pipelines',
                'technical_focus': 'Identity-preserving 3D generation, PBR material decomposition, mesh topology optimization, UV unwrapping algorithms',
                'domains': ['q_figurine_3d', 'gaming', 'ar_vr']
            },
            'autonomous_systems': {
                'title': 'Autonomous Vehicle Systems Engineer',
                'emoji': '🚗',
                'expertise': 'Expertise in LIDAR, computer vision, sensor fusion, real-time systems, and automotive safety standards',
                'technical_focus': 'Perception algorithms, path planning, control systems, safety-critical software, V2X communication',
                'domains': ['autonomous_driving', 'robotics']
            },
            'medical_ai': {
                'title': 'Medical Imaging & Clinical Diagnostics Specialist',
                'emoji': '🏥',
                'expertise': 'Deep knowledge of medical imaging modalities, pathology, clinical workflows, and healthcare standards',
                'technical_focus': 'DICOM processing, anatomical structure detection, disease classification, clinical decision support',
                'domains': ['medical_diagnosis', 'healthcare']
            },
            'ai_researcher': {
                'title': 'AI/ML Model Architecture Researcher',
                'emoji': '🔬',
                'expertise': 'Advanced knowledge of neural networks, diffusion models, transformer architectures, and evaluation methodologies',
                'technical_focus': 'Model evaluation methodologies, benchmark design, performance metrics, technical feasibility analysis',
                'domains': ['all']
            },
            'user_experience': {
                'title': 'Product Experience & User Research Specialist',
                'emoji': '👥',
                'expertise': 'Understanding user psychology, product-market fit, usability testing, and customer journey optimization',
                'technical_focus': 'User journey mapping, emotional value assessment, usability testing, market positioning',
                'domains': ['all']
            },
            'safety_critical': {
                'title': 'Safety-Critical AI Systems Researcher',
                'emoji': '🛡️',
                'expertise': 'Advanced knowledge of robust ML, uncertainty quantification, formal verification, and edge case handling',
                'technical_focus': 'Safety metrics, adversarial robustness, model interpretability, real-world validation protocols',
                'domains': ['autonomous_driving', 'medical_diagnosis', 'aviation']
            },
            'healthcare_workflow': {
                'title': 'Healthcare Provider & Patient Experience Specialist', 
                'emoji': '⚕️',
                'expertise': 'Understanding clinician workflows, patient concerns, healthcare accessibility, and medical ethics',
                'technical_focus': 'Clinical usability, patient safety, workflow integration, health equity considerations',
                'domains': ['medical_diagnosis', 'healthcare']
            }
        }

        # Legacy domain configs for backward compatibility
        self.role_configs = {
            'q_figurine_3d': {
                'domain_specialist': {
                    'title': '3D Computer Graphics & Artistic Rendering Specialist',
                    'expertise': 'Deep expertise in 3D modeling, neural rendering, photogrammetry, and digital art creation pipelines',
                    'technical_focus': 'Identity-preserving 3D generation, PBR material decomposition, mesh topology optimization, UV unwrapping algorithms'
                },
                'technical_researcher': {
                    'title': 'AI/ML Model Architecture Researcher', 
                    'expertise': 'Advanced knowledge of neural networks, diffusion models, NeRFs, and multi-modal AI systems',
                    'technical_focus': 'Model evaluation methodologies, benchmark design, performance metrics, technical feasibility analysis'
                },
                'user_advocate': {
                    'title': 'Consumer Product Experience Specialist',
                    'expertise': 'Understanding end-user psychology, digital collectibles market, social media culture, and personalization desires',
                    'technical_focus': 'User journey mapping, emotional value assessment, usability testing, market positioning'
                },
                'domain': '3D Figurine Generation from Photos',
                'target_users': 'Social media users wanting personalized 3D avatars/collectibles',
                'business_context': 'B2C product with focus on viral sharing, personalization, and emotional connection'
            },
            'autonomous_driving': {
                'domain_specialist': {
                    'title': 'Autonomous Vehicle Systems Engineer',
                    'expertise': 'Expertise in LIDAR, computer vision, sensor fusion, real-time systems, and automotive safety standards',
                    'technical_focus': 'Perception algorithms, path planning, control systems, safety-critical software, V2X communication'
                },
                'technical_researcher': {
                    'title': 'Safety-Critical AI Systems Researcher',
                    'expertise': 'Advanced knowledge of robust ML, uncertainty quantification, formal verification, and edge case handling',
                    'technical_focus': 'Safety metrics, adversarial robustness, model interpretability, real-world validation protocols'
                },
                'user_advocate': {
                    'title': 'Automotive User Experience & Safety Specialist',
                    'expertise': 'Understanding driver psychology, passenger comfort, regulatory compliance, and public trust in autonomous systems',
                    'technical_focus': 'Human-vehicle interaction, trust calibration, accessibility design, emergency scenarios'
                },
                'domain': 'Autonomous Vehicle Perception and Control',
                'target_users': 'Drivers, passengers, pedestrians, and regulatory bodies',
                'business_context': 'Safety-critical B2C/B2B product requiring regulatory approval and public trust'
            },
            'medical_diagnosis': {
                'domain_specialist': {
                    'title': 'Medical Imaging & Clinical Diagnostics Specialist',
                    'expertise': 'Deep knowledge of medical imaging modalities, pathology, clinical workflows, and healthcare standards',
                    'technical_focus': 'DICOM processing, anatomical structure detection, disease classification, clinical decision support'
                },
                'technical_researcher': {
                    'title': 'Healthcare AI Validation Researcher',
                    'expertise': 'Expertise in clinical trial design, FDA validation protocols, bias detection, and medical AI ethics',
                    'technical_focus': 'Clinical validation metrics, demographic bias analysis, interpretability for clinicians, regulatory compliance'
                },
                'user_advocate': {
                    'title': 'Healthcare Provider & Patient Experience Specialist',
                    'expertise': 'Understanding clinician workflows, patient concerns, healthcare accessibility, and medical ethics',
                    'technical_focus': 'Clinical usability, patient safety, workflow integration, health equity considerations'
                },
                'domain': 'AI-Assisted Medical Diagnosis',
                'target_users': 'Healthcare providers, radiologists, patients, and healthcare administrators',
                'business_context': 'B2B healthcare product requiring clinical validation and regulatory approval'
            }
        }
        
    def get_system_prompt(self, config_key='q_figurine_3d', context=None):
        # Check if context has selected experts (new multi-expert approach)
        if context and 'selected_experts' in context:
            return self.get_multi_expert_prompt(context['selected_experts'], context)
        
        # Otherwise use legacy approach for backward compatibility
        return self.get_system_prompt_legacy(config_key, context)
        
    def get_multi_expert_prompt(self, selected_experts=None, context=None):
        """Generate system prompt based on selected experts"""
        if not selected_experts:
            selected_experts = ['3d_graphics', 'ai_researcher', 'user_experience']  # Default
        
        expert_sections = []
        for expert_id in selected_experts:
            if expert_id in self.expert_profiles:
                expert = self.expert_profiles[expert_id]
                expert_sections.append(f"""{expert['emoji']} **{expert['title']}**
{expert['expertise']}""")
        
        experts_text = "\n\n".join(expert_sections)
        
        return f"""You are an AI PM Capability Consultant with {len(selected_experts)} expert perspectives:

{experts_text}

CORE MISSION: Help AI Product Managers identify what capabilities their AI models need to succeed.

FOCUS AREAS: For each capability discussion, address these four questions:
1. **Capability**: What specific AI model capability is needed?
2. **Description**: What does this capability mean in practical terms?
3. **User Value**: Why does this capability matter to end users?
4. **Technical Factors**: What are the key technical considerations?

RESPONSE GUIDELINES:
• Keep responses concise (2-3 sentences per point)
• Focus on AI model capabilities, not measurement methods
• Avoid suggesting irrelevant capabilities (e.g., physical manufacturing tests for digital products)
• Prioritize capabilities that directly impact user experience
• Use clear, jargon-free language for business stakeholders

CONTENT MODIFICATION:
• ADDING: Suggest missing AI capabilities that would benefit users
• MODIFYING: Refine capability descriptions to be more precise
• DELETING: Remove capabilities that don't align with AI model needs
• PRIORITIZING: Rank capabilities by user impact and technical feasibility

EXPERT PERSPECTIVES:
{chr(10).join([f'• {self.expert_profiles[eid]["emoji"]} {self.expert_profiles[eid]["title"]}: Focus on {self.expert_profiles[eid]["technical_focus"].split(",")[0].lower()}' for eid in selected_experts if eid in self.expert_profiles])}

Stay focused on identifying what AI models need to do, not how to test them."""

    def get_system_prompt_legacy(self, config_key='q_figurine_3d', context=None):
        """Legacy method for backward compatibility"""
        config = self.role_configs.get(config_key, self.role_configs['q_figurine_3d'])
        
        return f"""You are a Multi-Role AI Evaluation Consultant with expertise across three critical perspectives:

🎨 DOMAIN SPECIALIST - {config['domain_specialist']['title']}
{config['domain_specialist']['expertise']}
Technical Focus: {config['domain_specialist']['technical_focus']}

🔬 TECHNICAL RESEARCHER - {config['technical_researcher']['title']}  
{config['technical_researcher']['expertise']}
Technical Focus: {config['technical_researcher']['technical_focus']}

👥 USER ADVOCATE - {config['user_advocate']['title']}
{config['user_advocate']['expertise']}
Technical Focus: {config['user_advocate']['technical_focus']}

CURRENT DOMAIN: {config['domain']}
TARGET USERS: {config['target_users']}
BUSINESS CONTEXT: {config['business_context']}

CORE MISSION - CAPABILITY DECOMPOSITION:
Leverage your three specialist perspectives to decompose user needs into measurable model capabilities:
• DOMAIN VIEW: What technical capabilities are essential for this specific domain?
• RESEARCH VIEW: How can we measure and evaluate these capabilities scientifically? 
• USER VIEW: What capabilities matter most to end users and drive business value?

MULTI-PERSPECTIVE ANALYSIS:
For each capability dimension, consider:
• Domain Specialist: "Is this technically sound and domain-appropriate?"
• Technical Researcher: "How do we measure this objectively and reliably?"
• User Advocate: "Does this create real value for our target users?"

CONTENT MODIFICATION CAPABILITIES:
• ADDING: Suggest new capabilities from domain, technical, or user perspectives
• MODIFYING: Refine capabilities to balance technical feasibility with user value
• DELETING: Remove capabilities that don't serve the domain, research goals, or user needs
• PRIORITIZING: Rank capabilities considering all three perspectives

STRUCTURED RESPONSE FORMATS:
• "From a DOMAIN perspective, I recommend ADDING [capability] because [domain reasoning]"
• "As a TECHNICAL RESEARCHER, consider MODIFYING [capability] to improve [measurement/evaluation]"
• "From the USER ADVOCATE view, you might DELETE [capability] since [user value reasoning]"
• "Balancing all perspectives, let me REPRIORITIZE these based on [multi-perspective analysis]"

CONVERSATION STYLE:
• Lead with the most relevant specialist perspective for each question
• Always validate recommendations across all three roles
• Use technical precision when discussing domain/research aspects
• Use empathetic, value-focused language when discussing user aspects
• Synthesize insights from all three perspectives for holistic recommendations"""

    def create_chat_session(self):
        return client.chats.create(
            model="gemini-2.0-flash-exp"
        )

consultant = EvaluationConsultant()

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get('message', '')
        history = data.get('history', [])
        context = data.get('context', {})
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400

        # Get config from context or use default
        config_key = context.get('domain_config', 'q_figurine_3d') if context else 'q_figurine_3d'
        
        # Create enhanced prompt with context
        enhanced_prompt = f"{consultant.get_system_prompt(config_key, context)}\n\n"
        
        if history:
            enhanced_prompt += "Previous conversation:\n"
            for msg in history[-5:]:  # Only include last 5 messages for context
                enhanced_prompt += f"{msg['role']}: {msg['content']}\n"
            enhanced_prompt += "\n"
        
        if context:
            enhanced_prompt += f"Current project context: {json.dumps(context)}\n\n"
        
        enhanced_prompt += f"User question: {message}\n\nPlease respond as the AI evaluation consultant:"

        if APP_MODE == 'demo':
            # 演示模式：使用模拟响应
            response_text = mock_generator.generate_chat_response(message)
        else:
            # 生产模式：使用真实AI API
            if not client:
                return jsonify({'error': 'AI client not initialized'}), 500
            
            # Generate response using Gemini
            response = client.models.generate_content(
                model="gemini-2.0-flash-exp",
                contents=enhanced_prompt
            )
            
            response_text = response.text
        
        return jsonify({
            'response': response_text,
            'timestamp': datetime.now().isoformat(),
            'status': 'success',
            'mode': APP_MODE
        })

    except Exception as e:
        print(f"Chat error: {str(e)}")
        return jsonify({'error': f'Failed to process chat message: {str(e)}'}), 500

@app.route('/api/chat/stream', methods=['POST'])
def chat_stream():
    def generate():
        try:
            data = request.get_json()
            message = data.get('message', '')
            history = data.get('history', [])
            context = data.get('context', {})
            
            if not message:
                yield f"data: {json.dumps({'error': 'Message is required'})}\n\n"
                return

            # Create chat session
            chat = consultant.create_chat_session()
            
            # Build context from history
            if history:
                for msg in history[-10:]:  # Include more history for better context
                    try:
                        if msg['role'] == 'user':
                            chat.send_message(msg['content'])
                        # Note: We can't add assistant messages to history in this way
                        # This is a limitation of the current Gemini API
                    except:
                        pass  # Continue if adding history fails
            
            # Get config from context or use default
            config_key = context.get('domain_config', 'q_figurine_3d') if context else 'q_figurine_3d'
            
            # Send current message and stream response
            response_stream = chat.send_message_stream(f"{consultant.get_system_prompt(config_key, context)}\n\nUser: {message}")
            
            full_response = ""
            for chunk in response_stream:
                if chunk.text:
                    full_response += chunk.text
                    yield f"data: {json.dumps({'type': 'chunk', 'content': chunk.text, 'timestamp': datetime.now().isoformat()})}\n\n"
            
            # Send completion
            yield f"data: {json.dumps({'type': 'complete', 'fullResponse': full_response, 'timestamp': datetime.now().isoformat()})}\n\n"
            
        except Exception as e:
            print(f"Streaming error: {str(e)}")
            yield f"data: {json.dumps({'type': 'error', 'error': str(e), 'timestamp': datetime.now().isoformat()})}\n\n"

    return Response(
        generate(),
        content_type='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
        }
    )

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'AI Evaluation Consultant API is running',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/capabilities/modify', methods=['POST'])
def modify_capabilities():
    """Modify capability blueprint based on AI recommendations"""
    try:
        data = request.get_json()
        action = data.get('action')  # 'add', 'modify', 'delete', 'reprioritize'
        capability_data = data.get('capability_data', {})
        capability_id = data.get('capability_id')
        
        # Process different actions
        response_data = {
            'action': action,
            'success': True,
            'message': f'Successfully processed {action} action',
            'capability_data': capability_data
        }
        
        if action == 'add':
            response_data['message'] = f"Added new capability: {capability_data.get('title', 'Unknown')}"
        elif action == 'modify':
            response_data['message'] = f"Modified capability: {capability_data.get('title', 'Unknown')}"
        elif action == 'delete':
            response_data['message'] = f"Deleted capability with ID: {capability_id}"
        elif action == 'reprioritize':
            response_data['message'] = "Updated capability priorities"
            
        return jsonify(response_data)
        
    except Exception as e:
        print(f"Capability modification error: {str(e)}")
        return jsonify({'error': f'Failed to modify capabilities: {str(e)}', 'success': False}), 500

@app.route('/api/experts', methods=['GET'])
def get_experts():
    """Get available expert profiles for multi-expert consultation"""
    try:
        experts = {}
        for key, expert in consultant.expert_profiles.items():
            experts[key] = {
                'title': expert['title'],
                'emoji': expert['emoji'],
                'expertise': expert['expertise'],
                'technical_focus': expert['technical_focus'],
                'domains': expert['domains']
            }
        
        return jsonify({
            'experts': experts,
            'default_selection': ['3d_graphics', 'ai_researcher', 'user_experience'],
            'recommended_combinations': {
                'balanced': ['3d_graphics', 'ai_researcher', 'user_experience'],
                'technical_focus': ['3d_graphics', 'ai_researcher', 'safety_critical'],
                'user_focused': ['user_experience', 'ai_researcher', '3d_graphics'],
                'healthcare': ['medical_ai', 'healthcare_workflow', 'ai_researcher', 'safety_critical'],
                'autonomous_systems': ['autonomous_systems', 'safety_critical', 'ai_researcher', 'user_experience']
            }
        })
    except Exception as e:
        return jsonify({'error': f'Failed to get expert profiles: {str(e)}'}), 500

@app.route('/api/domain-configs', methods=['GET'])
def get_domain_configs():
    """Get available domain configurations for the multi-role consultant"""
    try:
        configs = {}
        for key, config in consultant.role_configs.items():
            configs[key] = {
                'domain': config['domain'],
                'target_users': config['target_users'], 
                'business_context': config['business_context'],
                'roles': {
                    'domain_specialist': config['domain_specialist']['title'],
                    'technical_researcher': config['technical_researcher']['title'],
                    'user_advocate': config['user_advocate']['title']
                }
            }
        
        return jsonify({
            'domain_configs': configs,
            'default_config': 'q_figurine_3d'
        })
    except Exception as e:
        return jsonify({'error': f'Failed to get domain configs: {str(e)}'}), 500

def extract_product_info_and_functions(user_input: str) -> dict:
    """Step 0: Information Extraction Agent - Intelligently parse user input"""
    
    if APP_MODE == 'demo':
        # 演示模式：使用模拟数据
        return {
            'productInfo': f"Demo product based on: {user_input}",
            'idealFunctions': f"Demo functions based on: {user_input}"
        }
    
    # 生产模式：使用真实AI API
    if not client:
        raise ValueError("AI client not initialized for production mode")
    
    extraction_prompt = f"""# ROLE: 产品需求信息提取专家 (Product Requirements Extraction Specialist)

# CONTEXT:
你是一个专门从用户描述中提取结构化产品信息的AI助手。用户可能会用自然语言混合描述产品信息和期望功能，你的任务是将这些信息清晰地分离和组织。

# TASK:
分析用户提供的输入，将其智能地分离为两个核心部分：
1. **产品信息 (Product Information)**: 产品的基本信息、背景、定位、目标用户等
2. **理想功能 (Ideal Functions)**: 用户期望的具体功能、特性、能力需求等

# INPUT:
用户输入: {user_input}

# OUTPUT CONSTRAINTS (MANDATORY):
1. 你必须且只能返回一个符合以下JSON Schema的 **单一JSON对象**。不要包含任何JSON区块之外的解释性文本。
2. 如果用户输入中某部分信息不明确，请基于上下文进行合理推断。
3. 确保两个字段都有实质性内容，不能为空。

# JSON SCHEMA (Strictly Enforce):
{{
  "productInfo": "string (产品的基本信息、背景、定位、用户群体等)",
  "idealFunctions": "string (期望的功能、特性、能力需求等)"
}}

# EXAMPLES:

输入: "我想做一个3D头像生成器，用户上传照片就能生成卡通版3D模型，主要面向社交媒体用户，希望模型质量高、风格一致、能快速生成。"

输出:
{{
  "productInfo": "3D头像生成器产品，通过用户上传的照片生成卡通版3D模型，主要目标用户是社交媒体用户，用于个人头像和分享需求。",
  "idealFunctions": "高质量3D模型生成、风格一致的卡通化处理、快速生成响应、支持多种照片输入格式、适合社交媒体分享的输出格式。"
}}"""

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=extraction_prompt
        )
        
        response_text = response.text.strip()
        
        # Try to extract JSON from the response
        import re
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
            return json.loads(json_str)
        else:
            # Fallback: if extraction fails, use the original input for both
            return {
                "productInfo": user_input,
                "idealFunctions": user_input
            }
            
    except Exception as e:
        print(f"Information extraction error: {str(e)}")
        # Fallback: if extraction fails, use the original input for both
        return {
            "productInfo": user_input,
            "idealFunctions": user_input
        }

def call_domain_router_agent(product_info: str, ideal_functions: str) -> dict:
    """Step A: Domain Router Agent - Identifies required expert knowledge domains"""
    
    if APP_MODE == 'demo':
        # 演示模式：使用模拟数据
        return {
            'primary_domain': '3D Computer Vision',
            'secondary_domains': ['Machine Learning', 'User Experience'],
            'domain_config': 'q_figurine_3d'
        }
    
    # 生产模式：使用真实AI API
    if not client:
        raise ValueError("AI client not initialized for production mode")
    
    print(f"[DEBUG] Domain router called with product_info: {product_info[:50]}...")
    print(f"[DEBUG] Domain router called with ideal_functions: {ideal_functions[:50]}...")
    
    print(f"[DEBUG] Building domain router prompt...")
    domain_router_prompt = f"""# ROLE: 首席系统架构师 (Chief Systems Architect) & 专家调度中枢

# CONTEXT:
你是一个AI评测系统的"路由"中枢。你的任务是分析一个新产品的高阶需求，并准确判断：要"评测"这个产品，我们必须从哪些"专业领域"视角切入。

# TASK:
分析用户提供的 [产品信息] 和 [理想功能]。你必须识别出三个关键的知识领域：

# INPUT:
[产品信息]: {product_info}
[理想功能]: {ideal_functions}

# TASK:
分析用户提供的 [产品信息] 和 [理想功能]。你必须识别出三个关键的知识领域：
1. 专业/业务领域 (Professional/Business Domain): 即该产品所属的行业核心价值。 (例如：电影制作、广告营销、医疗诊断、游戏设计)。
2. 技术实现领域 (Technical Domain): 即支撑该产品的核心技术栈。 (例如：实时渲染管线、物理仿真、AIGC生成算法、生物信息学)。
3. 核心用户价值 (Core User Value / Persona): 即用户使用该产品的核心驱动力。 (例如：追求情感共鸣、追求生产力效率、追求商业变现)。

# INPUT (User will provide):
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

    try:
        print("[DEBUG] Calling Gemini API for domain router...")
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=domain_router_prompt
        )
        
        print(f"[DEBUG] API call successful. Response type: {type(response)}")
        if hasattr(response, 'text'):
            response_text = response.text.strip()
            print(f"[DEBUG] Raw domain router response: {response_text}")
        else:
            print(f"[DEBUG] Response has no text attribute: {response}")
            raise ValueError("No text in API response")
        
        # Try to extract JSON from the response (handle markdown code blocks)
        import re
        
        # First try to remove markdown code block markers
        if '```json' in response_text:
            print("[DEBUG] Detected markdown code block in domain router response")
            # Extract content between ```json and ```
            json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1).strip()
                print(f"[DEBUG] Extracted JSON string from domain router: {json_str[:100]}...")
            else:
                # Fallback to normal JSON extraction
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    json_str = json_match.group(0)
                else:
                    raise ValueError("No valid JSON found in domain router response")
        else:
            # Normal JSON extraction
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
            else:
                raise ValueError("No valid JSON found in domain router response")
        
        return json.loads(json_str)
            
    except Exception as e:
        print(f"Domain router error: {str(e)}")
        raise e

def call_dynamic_expert_agent(domain_context: dict, product_info: str, ideal_functions: str) -> list:
    """重构后的能力维度生成 - 支持演示模式和真实模式"""
    
    # 生成执行ID
    execution_id = f"capability_gen_{int(time.time())}"
    
    # 开始监控执行
    workflow_monitor.start_execution(execution_id, {
        'product_info': product_info,
        'ideal_functions': ideal_functions,
        'domain_context': domain_context,
        'mode': APP_MODE
    })
    
    try:
        if APP_MODE == 'demo':
            # 演示模式：使用模拟数据
            workflow_monitor.add_step("Demo Mode", {
                'action': 'Generating mock capability dimensions',
                'mode': 'demo',
                'note': 'Using pre-generated realistic data for demonstration'
            })
            
            # 模拟处理时间
            import time
            time.sleep(1)  # 模拟AI处理时间
            
            # 生成模拟数据
            result = mock_generator.generate_capability_dimensions(product_info, ideal_functions)
            
            workflow_monitor.add_step("Mock Data Generated", {
                'action': 'Mock capability dimensions generated',
                'dimensions_count': len(result),
                'dimensions': [{'id': dim.get('id'), 'title': dim.get('title')} for dim in result]
            })
            
        else:
            # 生产模式：使用真实AI API
            # 步骤1: 加载提示词
            workflow_monitor.add_step("Load Prompt Template", {
                'action': 'Loading capability dimensions prompt template',
                'template_source': 'prompts/capability_dimensions_prompt.txt'
            })
            
            # 使用提示词管理器加载和格式化提示词
            dynamic_expert_prompt = prompt_manager.format_capability_dimensions_prompt(
                product_info=product_info,
                ideal_functions=ideal_functions
            )
            
            # 步骤2: 调用AI模型
            workflow_monitor.add_step("Call AI Model", {
                'action': 'Calling Gemini 2.5 Pro model',
                'model': 'gemini-2.5-pro',
                'prompt_length': len(dynamic_expert_prompt)
            })
            
            response = client.models.generate_content(
                model="gemini-2.5-pro",
                contents=dynamic_expert_prompt
            )
            
            response_text = response.text.strip()
            
            # 步骤3: 解析响应
            workflow_monitor.add_step("Parse AI Response", {
                'action': 'Extracting JSON from AI response',
                'response_length': len(response_text)
            })
            
            # Try to extract JSON from the response (handle markdown code blocks)
            import re
            
            # First try to remove markdown code block markers
            if '```json' in response_text:
                # Extract content between ```json and ```
                json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
                if json_match:
                    json_str = json_match.group(1).strip()
                else:
                    # Fallback to normal JSON extraction
                    json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
                    if json_match:
                        json_str = json_match.group(0)
                    else:
                        raise ValueError("No valid JSON found in dynamic expert response")
            else:
                # Normal JSON extraction
                json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
                if json_match:
                    json_str = json_match.group(0)
                else:
                    raise ValueError("No valid JSON found in dynamic expert response")
            
            # 步骤4: 验证和返回结果
            result = json.loads(json_str)
            
            workflow_monitor.add_step("Validate Results", {
                'action': 'Validating generated capability dimensions',
                'dimensions_count': len(result),
                'dimensions': [{'id': dim.get('id'), 'title': dim.get('title')} for dim in result]
            })
        
        # 完成执行
        workflow_monitor.complete_execution({
            'capability_dimensions': result,
            'total_dimensions': len(result),
            'execution_time': datetime.now().isoformat(),
            'mode': APP_MODE
        })
        
        return result
            
    except Exception as e:
        print(f"Dynamic expert error: {str(e)}")
        
        # 记录错误
        workflow_monitor.complete_execution(
            output_data=None,
            error=str(e)
        )
        
        raise e

@app.route('/api/generate-capability-dimensions', methods=['POST'])
def generate_capability_dimensions():
    """V3: Three-stage AI workflow with intelligent input extraction"""
    try:
        data = request.get_json()
        
        # Check if we have structured input or need to extract
        product_info = data.get('productInfo', '')
        ideal_functions = data.get('idealFunctions', '')
        user_input = data.get('userInput', '')
        
        # If we don't have structured input, extract from userInput
        if not product_info or not ideal_functions:
            if not user_input:
                return jsonify({'error': 'Either structured (productInfo + idealFunctions) or unstructured (userInput) input is required'}), 400
            
            # Step 0: Extract product info and ideal functions using AI
            print("Step 0: Extracting product information and ideal functions...")
            extracted_info = extract_product_info_and_functions(user_input)
            product_info = extracted_info.get('productInfo', user_input)
            ideal_functions = extracted_info.get('idealFunctions', user_input)
            print(f"Extracted - Product Info: {product_info[:100]}...")
            print(f"Extracted - Ideal Functions: {ideal_functions[:100]}...")

        # Step A: Call Domain Router Agent
        print("Step A: Calling Domain Router Agent...")
        domain_context = call_domain_router_agent(product_info, ideal_functions)
        print(f"Domain context identified: {domain_context}")
        
        # Step B & C: Call Dynamic Expert Agent with injected context
        print("Step B & C: Calling Dynamic Expert Agent with injected expertise...")
        blueprint_cards = call_dynamic_expert_agent(domain_context, product_info, ideal_functions)
        print(f"Generated {len(blueprint_cards)} capability dimensions")
        
        return jsonify({
            'blueprintCards': blueprint_cards,
            'extractedInfo': {  # Return extracted info for debugging/verification
                'productInfo': product_info,
                'idealFunctions': ideal_functions
            },
            'domainContext': domain_context,  # Optional: Return for debugging
            'timestamp': datetime.now().isoformat(),
            'status': 'success'
        })
            
    except Exception as e:
        print(f"Capability dimensions generation error: {str(e)}")
        return jsonify({'error': f'Failed to generate capability dimensions: {str(e)}'}), 500

@app.route('/api/generate-blueprint', methods=['POST'])
def generate_blueprint():
    """Legacy endpoint - redirects to new two-stage workflow"""
    try:
        data = request.get_json()
        user_input = data.get('userInput', '')
        
        if not user_input:
            return jsonify({'error': 'User input is required'}), 400
        
        # Step 0: Extract product info and ideal functions using AI
        print("Step 0: Extracting product information and ideal functions...")
        extracted_info = extract_product_info_and_functions(user_input)
        product_info = extracted_info.get('productInfo', user_input)
        ideal_functions = extracted_info.get('idealFunctions', user_input)
        print(f"Extracted - Product Info: {product_info[:100]}...")
        print(f"Extracted - Ideal Functions: {ideal_functions[:100]}...")
        
        # Call the new three-stage workflow
        return generate_capability_dimensions_internal(product_info, ideal_functions)
            
    except Exception as e:
        print(f"Blueprint generation error: {str(e)}")
        return jsonify({'error': f'Failed to generate blueprint: {str(e)}'}), 500

def generate_capability_dimensions_internal(product_info: str, ideal_functions: str):
    """Internal function to avoid code duplication"""
    try:
        # Step A: Call Domain Router Agent
        domain_context = call_domain_router_agent(product_info, ideal_functions)
        
        # Step B & C: Call Dynamic Expert Agent with injected context
        blueprint_cards = call_dynamic_expert_agent(domain_context, product_info, ideal_functions)
        
        return jsonify({
            'blueprintCards': blueprint_cards,
            'domainContext': domain_context,
            'timestamp': datetime.now().isoformat(),
            'status': 'success'
        })
        
    except Exception as e:
        raise e

@app.route('/api/mode', methods=['GET'])
def get_mode():
    """Get current application mode"""
    return jsonify({
        'mode': APP_MODE,
        'is_demo': APP_MODE == 'demo',
        'is_production': APP_MODE == 'production'
    })

@app.route('/api/mode', methods=['POST'])
def set_mode():
    """Set application mode (requires restart)"""
    try:
        data = request.get_json()
        new_mode = data.get('mode', '').lower()
        
        if new_mode not in ['demo', 'production']:
            return jsonify({'error': 'Invalid mode. Must be "demo" or "production"'}), 400
        
        return jsonify({
            'message': f'Mode will be set to {new_mode} on next restart',
            'current_mode': APP_MODE,
            'new_mode': new_mode,
            'note': 'Please restart the application for changes to take effect'
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to set mode: {str(e)}'}), 500

@app.route('/api/templates', methods=['GET'])
def get_templates():
    """Get evaluation templates for different scenarios"""
    templates = [
        {
            "id": "ideal-output",
            "title": "Ideal Output Definition",
            "description": "Define what perfect model outputs should look like for your use case",
            "prompt": "I need to build an evaluation system for [Feature Name]. Help me define: 1. What does the ideal output look like? 2. What are the key quality dimensions I should measure? 3. What are the common failure modes I need to prevent?"
        },
        {
            "id": "user-feedback",
            "title": "User Feedback Analysis", 
            "description": "Analyze user complaints and feedback to identify improvement areas",
            "prompt": "I have collected user feedback about [Feature/Product Name]. Please help me: 1. Identify main user pain points 2. Translate complaints into technical requirements 3. Prioritize issues based on user impact 4. Suggest specific evaluation metrics"
        },
        {
            "id": "competitor-analysis",
            "title": "Competitor Analysis",
            "description": "Compare your model performance against competitors and benchmarks", 
            "prompt": "I want to benchmark [Your Product] against competitors. Help me: 1. Define evaluation criteria for competitive positioning 2. Identify key differentiators 3. Set target performance levels 4. Create head-to-head comparison frameworks"
        },
        {
            "id": "model-iteration",
            "title": "Model Iteration Eval",
            "description": "Set up evaluation frameworks for iterative model improvements",
            "prompt": "I'm working on iterative improvements for [Model Name]. Help me design: 1. Regression testing criteria 2. Progressive evaluation metrics 3. A/B testing frameworks 4. Success criteria for each iteration"
        }
    ]
    
    return jsonify({'templates': templates})

if __name__ == '__main__':
    print("Starting AI Evaluation Consultant API...")
    print(f"Application mode: {APP_MODE.upper()}")
    if APP_MODE == 'production':
        print(f"Gemini API configured: {'Yes' if GEMINI_API_KEY else 'No'}")
    else:
        print("Running in demo mode with mock data")
    app.run(debug=True, host='0.0.0.0', port=8080)