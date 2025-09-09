from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import json
from google import genai
from typing import List, Dict, Any
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Gemini API configuration
GEMINI_API_KEY = "AIzaSyD0Zea1gCEd8niseu4K9ofF0Sj633ZCai4"
client = genai.Client(api_key=GEMINI_API_KEY)

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

        # Generate response using Gemini
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=enhanced_prompt
        )
        
        return jsonify({
            'response': response.text,
            'timestamp': datetime.now().isoformat(),
            'status': 'success'
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
    print(f"Gemini API configured: {'Yes' if GEMINI_API_KEY else 'No'}")
    app.run(debug=True, host='0.0.0.0', port=8080)