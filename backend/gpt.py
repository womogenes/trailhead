from typing import Type, Any, Dict
from pydantic import BaseModel
from openai import OpenAI as GPTClient
# from lib.status_checker import StatusChecker
# from lib.doppler_secrets_backend import DopplerSecretsBackend

from dotenv import load_dotenv
import os

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

class GPTInterface:
    def __init__(self, api_key: str = None, model: str = "gpt-4o-mini"):
        self.client = GPTClient(api_key=api_key)
        self.model = model

    def chat_completion(self, chat_history):
        response = self.client.chat.completions.create(
            model=self.model,
            reasoning_effort="low",
            messages=chat_history
        )
        return response.choices[0].message.to_dict()

    def run_prompt(self, 
                   prompt: str, 
                   data: Any, 
                   schema_model: Type[BaseModel], 
                   system_role: str = "You are working to help break down learning tasks into simpler subtasks.") -> BaseModel:
        """
        Run a GPT prompt with a specified schema model and return parsed results.

        Args:
            prompt (str): The prompt to guide the GPT response.
            data (Any): Data to include in the analysis.
            schema_model (Type[BaseModel]): Pydantic model to parse the response.
            system_role (str): Role of the GPT assistant.

        Returns:
            BaseModel: Parsed results as per the schema model.
        """
        # Generate the JSON schema from the Pydantic model
        json_schema = schema_model.model_json_schema()
        json_schema_with_name = {"name": schema_model.__name__, "schema": json_schema}

        # Send the request to GPT
        response = self.client.chat.completions.create(
            model=self.model,
            # reasoning_effort="low",
            messages=[
                {"role": "system", "content": system_role},
                {"role": "user", "content": f"Ask: {prompt} Analyze the following data: {data}"}
            ],
            response_format={
                "type": "json_schema",
                "json_schema": json_schema_with_name
            }
        )

        # Parse and return the response
        return schema_model.parse_raw(response.choices[0].message.content)
