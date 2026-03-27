"""
Gemini Client Helper
Centralized Gemini API configuration and model initialization.
All services import from here instead of directly using the SDK.
"""
import os
import google.generativeai as genai


def get_gemini_model(model_name="gemini-2.0-flash"):
    """
    Return a configured GenerativeModel instance, or None if no API key.

    Usage:
        model = get_gemini_model()
        if model is None:
            return demo_data()
        response = model.generate_content(prompt, generation_config={...})
        text = response.text
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(model_name)
