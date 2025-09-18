"""
Mock Data Generator for Demo Mode
Generates realistic mock data for demonstration purposes
"""

import json
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any

class MockDataGenerator:
    """Generate mock data for demo mode"""
    
    def __init__(self):
        self.capability_templates = [
            {
                "id": "identity-preservation",
                "priority": "Critical",
                "icon": "🎭",
                "title": "Identity Preservation",
                "description": "Ensures the generated 3D model accurately captures the user's facial features, expressions, and distinctive characteristics",
                "userValue": "Users want to see themselves in the 3D figurine, not a generic avatar. This drives emotional connection and sharing behavior.",
                "keyTechnicalFactors": [
                    "Facial landmark detection accuracy",
                    "Expression preservation algorithms",
                    "Identity disentanglement techniques"
                ],
                "examples": {
                    "good": "Generated figurine clearly shows user's distinctive smile and eye shape",
                    "bad": "Generic face that could be anyone, missing user's unique features"
                },
                "order": 1
            },
            {
                "id": "artistic-appeal",
                "priority": "High",
                "icon": "🎨",
                "title": "Artistic Appeal",
                "description": "Creates visually appealing, stylized 3D models that are aesthetically pleasing and shareable on social media",
                "userValue": "Beautiful, artistic outputs encourage social sharing and viral marketing, driving user acquisition.",
                "keyTechnicalFactors": [
                    "Style transfer algorithms",
                    "Color harmony optimization",
                    "Proportional enhancement techniques"
                ],
                "examples": {
                    "good": "Visually stunning figurine with perfect proportions and appealing color scheme",
                    "bad": "Unattractive, poorly proportioned model that users wouldn't want to share"
                },
                "order": 2
            },
            {
                "id": "technical-quality",
                "priority": "High",
                "icon": "⚙️",
                "title": "Technical Quality",
                "description": "Ensures the 3D model meets technical standards for 3D printing, including manifold geometry and proper topology",
                "userValue": "High technical quality ensures successful 3D printing and customer satisfaction with physical products.",
                "keyTechnicalFactors": [
                    "Mesh topology optimization",
                    "Manifold geometry validation",
                    "Printability assessment algorithms"
                ],
                "examples": {
                    "good": "Clean, manifold mesh ready for 3D printing without errors",
                    "bad": "Non-manifold geometry that fails 3D printing validation"
                },
                "order": 3
            },
            {
                "id": "processing-speed",
                "priority": "Medium",
                "icon": "⚡",
                "title": "Processing Speed",
                "description": "Generates 3D models quickly to maintain user engagement and reduce server costs",
                "userValue": "Fast processing keeps users engaged and reduces bounce rate, improving conversion metrics.",
                "keyTechnicalFactors": [
                    "Model optimization techniques",
                    "GPU acceleration",
                    "Caching strategies"
                ],
                "examples": {
                    "good": "Model generated in under 30 seconds with high quality",
                    "bad": "Processing takes over 2 minutes, causing user abandonment"
                },
                "order": 4
            },
            {
                "id": "diversity-inclusion",
                "priority": "Medium",
                "icon": "🌍",
                "title": "Diversity & Inclusion",
                "description": "Ensures the system works equally well for users of different ethnicities, ages, and physical characteristics",
                "userValue": "Inclusive technology expands market reach and ensures fair representation across all user demographics.",
                "keyTechnicalFactors": [
                    "Bias detection algorithms",
                    "Diverse training data validation",
                    "Fairness metrics assessment"
                ],
                "examples": {
                    "good": "Consistent quality across all ethnicities and age groups",
                    "bad": "Significantly lower quality for certain demographic groups"
                },
                "order": 5
            }
        ]
        
        self.test_case_templates = {
            "Easy": [
                {
                    "name": "Basic Portrait Recognition",
                    "rationale": "Test fundamental ability to identify and preserve basic facial features",
                    "showcases": [
                        {
                            "inputType": "Front-facing selfie",
                            "description": "Clear, well-lit front-facing photo with neutral expression",
                            "expectedOutcome": "Accurate facial feature preservation"
                        },
                        {
                            "inputType": "Simple background",
                            "description": "Photo with plain background, minimal distractions",
                            "expectedOutcome": "Clean subject isolation"
                        }
                    ]
                }
            ],
            "Medium": [
                {
                    "name": "Expression Variation Handling",
                    "rationale": "Test ability to handle different facial expressions while maintaining identity",
                    "showcases": [
                        {
                            "inputType": "Smiling photo",
                            "description": "User with genuine smile, showing teeth",
                            "expectedOutcome": "Preserved smile while maintaining identity"
                        },
                        {
                            "inputType": "Side profile",
                            "description": "Three-quarter view showing facial depth",
                            "expectedOutcome": "Accurate 3D depth reconstruction"
                        }
                    ]
                }
            ],
            "Hard": [
                {
                    "name": "Complex Lighting & Pose",
                    "rationale": "Test system robustness with challenging lighting and pose conditions",
                    "showcases": [
                        {
                            "inputType": "Low-light selfie",
                            "description": "Photo taken in dim lighting with phone flash",
                            "expectedOutcome": "Successful feature extraction despite poor lighting"
                        },
                        {
                            "inputType": "Extreme angle",
                            "description": "Photo taken from unusual angle or distance",
                            "expectedOutcome": "Reasonable 3D reconstruction from limited information"
                        }
                    ]
                }
            ]
        }
    
    def generate_capability_dimensions(self, product_info: str, ideal_functions: str) -> List[Dict[str, Any]]:
        """Generate mock capability dimensions"""
        # Add some randomization to make it feel more realistic
        dimensions = self.capability_templates.copy()
        
        # Randomly shuffle priorities for some dimensions
        if random.random() < 0.3:
            random.shuffle(dimensions)
            for i, dim in enumerate(dimensions):
                dim["order"] = i + 1
        
        # Add some variation to descriptions based on input
        for dim in dimensions:
            if "3D" in product_info or "figurine" in product_info.lower():
                # Keep 3D-related content
                pass
            else:
                # Adapt for other product types
                dim["description"] = dim["description"].replace("3D model", "output")
                dim["description"] = dim["description"].replace("3D figurine", "result")
        
        return dimensions
    
    def generate_test_cases(self, capability_id: str) -> List[Dict[str, Any]]:
        """Generate mock test cases for a capability"""
        test_cases = []
        
        for tier in ["Easy", "Medium", "Hard"]:
            template = random.choice(self.test_case_templates[tier])
            test_case = {
                "id": f"{capability_id}-{tier.lower()}-{random.randint(1, 100)}",
                "tier": tier,
                "name": template["name"],
                "rationale": template["rationale"],
                "showcases": template["showcases"].copy()
            }
            test_cases.append(test_case)
        
        return test_cases
    
    def generate_execution_data(self, execution_id: str) -> Dict[str, Any]:
        """Generate mock execution data for monitoring"""
        start_time = datetime.now() - timedelta(seconds=random.randint(5, 30))
        
        steps = [
            {
                "name": "Load Prompt Template",
                "timestamp": (start_time + timedelta(seconds=1)).isoformat(),
                "data": {
                    "action": "Loading capability dimensions prompt template",
                    "template_source": "prompts/capability_dimensions_prompt.txt"
                }
            },
            {
                "name": "Call AI Model",
                "timestamp": (start_time + timedelta(seconds=3)).isoformat(),
                "data": {
                    "action": "Calling Gemini 2.5 Pro model",
                    "model": "gemini-2.5-pro",
                    "prompt_length": random.randint(3000, 5000)
                }
            },
            {
                "name": "Parse AI Response",
                "timestamp": (start_time + timedelta(seconds=8)).isoformat(),
                "data": {
                    "action": "Extracting JSON from AI response",
                    "response_length": random.randint(2000, 4000)
                }
            },
            {
                "name": "Validate Results",
                "timestamp": (start_time + timedelta(seconds=10)).isoformat(),
                "data": {
                    "action": "Validating generated capability dimensions",
                    "dimensions_count": random.randint(4, 6),
                    "dimensions": [
                        {"id": "identity-preservation", "title": "Identity Preservation"},
                        {"id": "artistic-appeal", "title": "Artistic Appeal"},
                        {"id": "technical-quality", "title": "Technical Quality"}
                    ]
                }
            }
        ]
        
        return {
            "id": execution_id,
            "start_time": start_time.isoformat(),
            "status": "completed",
            "input": {
                "product_info": "Mock product for demonstration",
                "ideal_functions": "Mock ideal functions for testing"
            },
            "steps": steps,
            "output": {
                "capability_dimensions": self.generate_capability_dimensions("", ""),
                "total_dimensions": random.randint(4, 6),
                "execution_time": datetime.now().isoformat()
            },
            "error": None,
            "end_time": (start_time + timedelta(seconds=12)).isoformat()
        }
    
    def generate_chat_response(self, user_message: str) -> str:
        """Generate mock chat responses"""
        responses = [
            f"I understand you're asking about: '{user_message}'. In demo mode, I can provide insights about capability dimensions and evaluation strategies. Here are some key points to consider...",
            
            f"Great question about '{user_message}'! For this type of evaluation, I'd recommend focusing on user experience metrics, technical performance indicators, and business impact measures. Would you like me to elaborate on any specific aspect?",
            
            f"Regarding '{user_message}', this is a common challenge in AI model evaluation. In our demo system, we typically see success rates of 85-95% for well-configured capability dimensions. The key is balancing technical accuracy with user satisfaction.",
            
            f"Excellent point about '{user_message}'! This relates directly to our capability framework. In demo mode, I can show you how different evaluation strategies impact model performance. Would you like to see some examples?"
        ]
        
        return random.choice(responses)

# Global mock data generator instance
mock_generator = MockDataGenerator()
