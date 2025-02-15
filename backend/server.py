from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()
from pydantic import BaseModel
from gpt import GPTInterface
from dotenv import load_dotenv
import os

load_dotenv()
# Load API key from environment variables instead of hardcoding
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

app = FastAPI()

@app.get("/")
async def root():
    my_str = 'I woke up this morning and walked to the building. I said hello to friends.'
    return {"message": rewrite_in_shakespeare(my_str)}


def rewrite_in_shakespeare(dat):
    """
    Rewrite textual prompt in old Shakespeare.
    """
    class Output(BaseModel):
        rewritten_text: str

    gpt_interface = GPTInterface()
    prompt = """
    Rephrase the given data in old Shakespeare English.  
    """
    response = gpt_interface.run_prompt(
        prompt=prompt,
        data=dat,
        schema_model=Output,
        max_tokens=16384,
    )

    return response.rewritten_text
