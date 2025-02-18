from typing import Type, Any, Dict
from pydantic import BaseModel
from openai import OpenAI

class AnswerFormat(BaseModel):
    content_links: str

class PerplexityInterface:
    def __init__(self, api_key: str = None, model: str = "sonar"):
        self.client = OpenAI(api_key=api_key, base_url="https://api.perplexity.ai")
        self.model = model

    def run_prompt(self, 
                   prompt: str,
                   schema_model: Type[BaseModel], 
                   system_role: str = "You are working to help find online resources to learn more about a topic",
                   ) -> BaseModel:
        """
        Run a Perplexity prompt with a specified schema model and return parsed results.

        Args:
            prompt (str): The prompt to guide the Perplexity response.
            schema_model (Type[BaseModel]): Pydantic model to parse the response.
            system_role (str): Role of the Perplexity assistant.

        Returns:
            BaseModel: Parsed results as per the schema model.
        """
        # Generate the JSON schema from the Pydantic model
        json_schema = schema_model.schema()
        json_schema_with_name = {"name": schema_model.__name__, "schema": json_schema}

        # Send the request to Perplexity
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_role},
                {"role": "user", "content": f"Ask: {prompt}"}
            ],
            response_format={
                "type": "json_schema",
                "json_schema": json_schema_with_name
            }
        )

        # Parse and return the response
        return response.choices[0].message.content
