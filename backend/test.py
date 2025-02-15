from fastapi import FastAPI
from pydantic import BaseModel
from gpt import GPTInterface
import os
from dotenv import load_dotenv  # Ensure you've installed python-dotenv: pip install python-dotenv


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

    gpt_interface = GPTInterface(api_key=os.getenv("OPENAI_KEY"))
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

load_dotenv()

print(os.getenv("OPENAI_KEY"))
print(rewrite_in_shakespeare('I woke up this morning and walked to the building. I said hello to friends.'))
