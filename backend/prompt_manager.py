"""
Prompt Management Module
Handles loading and formatting of system prompts for different AI tasks
"""

import os
from typing import Dict, Any

class PromptManager:
    """Manages system prompts for different AI tasks"""
    
    def __init__(self, prompts_dir: str = "prompts"):
        self.prompts_dir = prompts_dir
        self._prompt_cache: Dict[str, str] = {}
    
    def load_prompt(self, prompt_name: str) -> str:
        """
        Load a prompt template from file
        
        Args:
            prompt_name: Name of the prompt file (without extension)
            
        Returns:
            The prompt template content
        """
        if prompt_name in self._prompt_cache:
            return self._prompt_cache[prompt_name]
        
        prompt_file = os.path.join(self.prompts_dir, f"{prompt_name}.txt")
        
        try:
            with open(prompt_file, 'r', encoding='utf-8') as f:
                content = f.read()
                self._prompt_cache[prompt_name] = content
                return content
        except FileNotFoundError:
            raise FileNotFoundError(f"Prompt file not found: {prompt_file}")
        except Exception as e:
            raise Exception(f"Error loading prompt {prompt_name}: {str(e)}")
    
    def format_capability_dimensions_prompt(self, product_info: str, ideal_functions: str) -> str:
        """
        Format the capability dimensions prompt with user input
        
        Args:
            product_info: Product information from user
            ideal_functions: Ideal functions description from user
            
        Returns:
            Formatted prompt ready for AI processing
        """
        template = self.load_prompt("capability_dimensions_prompt")
        return template.format(
            product_info=product_info,
            ideal_functions=ideal_functions
        )
    
    def clear_cache(self):
        """Clear the prompt cache"""
        self._prompt_cache.clear()

# Global prompt manager instance
prompt_manager = PromptManager()
