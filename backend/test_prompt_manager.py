#!/usr/bin/env python3
"""
Test script for the new prompt management system
"""

import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from prompt_manager import prompt_manager

def test_prompt_loading():
    """Test loading the capability dimensions prompt"""
    try:
        # Test loading the prompt template
        template = prompt_manager.load_prompt("capability_dimensions_prompt")
        print("✅ Successfully loaded capability_dimensions_prompt")
        print(f"Template length: {len(template)} characters")
        
        # Test formatting the prompt
        formatted_prompt = prompt_manager.format_capability_dimensions_prompt(
            product_info="An iOS app that turns user selfies into stylized, Q-version 3D-printable figurines.",
            ideal_functions="It must capture the user's core identity and essence—it must look like them, not just a generic doll."
        )
        
        print("✅ Successfully formatted prompt with user input")
        print(f"Formatted prompt length: {len(formatted_prompt)} characters")
        
        # Check if the placeholders were replaced
        if "{product_info}" not in formatted_prompt and "{ideal_functions}" not in formatted_prompt:
            print("✅ Placeholders successfully replaced")
        else:
            print("❌ Placeholders not replaced properly")
            
        return True
        
    except Exception as e:
        print(f"❌ Error testing prompt management: {str(e)}")
        return False

def test_prompt_structure():
    """Test the structure of the loaded prompt"""
    try:
        template = prompt_manager.load_prompt("capability_dimensions_prompt")
        
        # Check for key sections
        required_sections = [
            "# ROLE:",
            "# CONTEXT:",
            "# CORE TASK:",
            "# MANDATORY THINKING PROCESS",
            "Step 1:",
            "Step 2:",
            "Step 3:",
            "Step 4:",
            "# USER INPUT:",
            "# OUTPUT INSTRUCTIONS",
            "# JSON SCHEMA:"
        ]
        
        missing_sections = []
        for section in required_sections:
            if section not in template:
                missing_sections.append(section)
        
        if not missing_sections:
            print("✅ All required prompt sections found")
            return True
        else:
            print(f"❌ Missing prompt sections: {missing_sections}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing prompt structure: {str(e)}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Prompt Management System")
    print("=" * 50)
    
    # Test prompt loading and formatting
    test1_passed = test_prompt_loading()
    print()
    
    # Test prompt structure
    test2_passed = test_prompt_structure()
    print()
    
    # Summary
    if test1_passed and test2_passed:
        print("🎉 All tests passed! Prompt management system is working correctly.")
    else:
        print("❌ Some tests failed. Please check the implementation.")
        sys.exit(1)
