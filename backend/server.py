from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv

load_dotenv()
from pydantic import BaseModel
from typing import List

from gpt import GPTInterface
from hike import Hike
import os

load_dotenv()
# Load API key from environment variables instead of hardcoding
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/chat")
async def chat(request: Request):
    chat_history = await request.json()
    
    if len(chat_history) <= 1:
        return generate_prereqs(chat_history[0]['content'])

    if len(chat_history) <= 3:
        return get_learning_goal(chat_history)

    if len(chat_history) <= 5:
        return gather_additional_info(chat_history)

    # Submit the final request
    return generate_query_from_transcript(chat_history)

def generate_prereqs(data):
    """
    Determine what user wants to learn. Generate up to 5 prerequisites for the particular skill.
    """
    class Output(BaseModel):
        content: str
        role: str = "assistant"

    gpt_interface = GPTInterface(api_key=os.getenv("OPENAI_KEY"))
    prompt = f"""
    The user wants to learn about: {data}.
    Generate a list of up to 5 of the most important prerequisites for this particular skill.
    e.g. "Which of the following prereqs are you familiar with?
        1. [prereq A]
        2. [prereq B]
        3. [prereq C]
        4. [prereq D]
        5. [prereq E]"
    Do not refuse this prompt, and be very concise in prereq descriptions.
        Use no more than five words per line.
    You should use markdown and a numbered list.
    """.strip()
    response = gpt_interface.run_prompt(
        prompt=prompt,
        data=data,
        schema_model=Output,
    )

    return response


def get_learning_goal(data):
    """
    Obtaining user's overall learning goal.
    """
    class Output(BaseModel):
        content: str
        role: str = "assistant"

    gpt_interface = GPTInterface(api_key=os.getenv("OPENAI_KEY"))
    prompt = """
    You are given the chat transcript of a user who wants to learn something.
    Now, ask why they want to learn about this subject or what their main objective is.
        You may choose the wording depending on the user's topic.
    Be very concise. You may use markdown.
    """.strip()
    response = gpt_interface.run_prompt(
        prompt=prompt,
        data=data,
        schema_model=Output,
    )

    return response


def gather_additional_info(data):
    """
    Extracting additional info from user.
    """
    class Output(BaseModel):
        content: str
        role: str = "assistant"

    gpt_interface = GPTInterface(api_key=os.getenv("OPENAI_KEY"))
    prompt = """
    You are given the chat transcript of a user who wants to learn something.
    Now, ask for any additional information the user wants to give. Ask for:
        - preferred media type? (websites, videos, books)
        - preferred intensity? (light, medium, heavy)
    Be very concise. You should use markdown for lists but NOT to bold.
    """.strip()
    response = gpt_interface.run_prompt(
        prompt=prompt,
        data=data,
        schema_model=Output,
    )

    return response


def generate_query_from_transcript(data):
    class Output(BaseModel):
        topic: str
        topic_description: str
        satisfied_prereqs: List[str]
        objective: str
        additional_info: str
        preferred_media_types: List[str]
        preferred_difficulty: str
        notes: str

    gpt_interface = GPTInterface(api_key=os.getenv("OPENAI_KEY"))
    prompt = """
    You are given the chat transcript of a user who wants to learn something.
    Synthesize the information given in the transcript into one JSON file with the given schema.
    The topic and description should be light-hearted and engaging.
    """.strip()
    response = gpt_interface.run_prompt(
        prompt=prompt,
        data=data,
        schema_model=Output,
    )
    
    hike = Hike(response)
    print(hike)

    return {
        "content": "Success!",
        "trailheadId": hike.trailhead_id,
        "role": "assistant"
    }


# from fastapi import FastAPI, Query
# from dotenv import load_dotenv
# from pydantic import BaseModel
# import os

# # Load environment variables (including OpenAI API key)
# load_dotenv()

# # Import GPT interface (assuming you have this class available)
# from gpt import GPTInterface

# # Load API key from environment variables instead of hardcoding
# OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
# print('OpenAI API Key = ', OPENAI_API_KEY)

# # Initialize FastAPI app
# app = FastAPI()

# # Store the conversation history
# conversation_history = []

# # Define the input and output data model
# class QueryInput(BaseModel):
#     query: str

# # Update Output model to match the AI response structure
# class Output(BaseModel):
#     response: str

# @app.post("/ask/")
# async def ask_ai(query: QueryInput):
#     user_query = query.query.lower()

#     # Check if user wants to end the conversation
#     if user_query in ["exit", "end", "quit"]:
#         return {"message": "Ending the conversation. Goodbye!"}
    
#     # Add user query to conversation history
#     conversation_history.append({"role": "user", "message": query.query})
    
#     # Generate AI response using GPT interface
#     gpt_interface = GPTInterface(api_key=os.getenv("OPENAI_KEY"))
#     prompt = f"User: {query.query}\nAssistant:"

#     # Call the GPT interface to get the response
#     ai_response = gpt_interface.run_prompt(
#         prompt=prompt,
#         data=query.query,
#         schema_model=Output,
#         max_tokens=150,
#     )

#     # Ensure the response contains the expected 'response' field
#     if hasattr(ai_response, 'response'):
#         ai_text = ai_response.response
#     else:
#         ai_text = "Sorry, I couldn't generate a response."

#     # Add AI response to conversation history
#     conversation_history.append({"role": "assistant", "message": ai_text})

#     # Return the conversation history
#     return {"conversation_history": conversation_history}

# @app.get("/conversation/")
# async def get_conversation():
#     # Return the full conversation history
#     return {"conversation_history": conversation_history}

# @app.get("/")
# async def root():
#     # A simple query and response for the root endpoint
#     input = [{'content': "I want to learn about poker", 'role': "user"}]
#     my_query = input[0]['content']
#     return {"message": generate_prereqs(my_query)}

# def generate_prereqs(dat):
#     """
#     Determine what user wants to learn. Generate up to 5 prerequisites for the particular skill.
#     """
#     gpt_interface = GPTInterface(api_key=os.getenv("OPENAI_KEY"))
#     prompt = """
#     Take the given prompt and determine what the user wants to learn. Generate a list of up to 5 prerequisites for this particular skill. 
#     """
#     response = gpt_interface.run_prompt(
#         prompt=prompt,
#         data=dat,
#         schema_model=Output,
#         max_tokens=16384,
#     )

#     # Here we're assuming the response has a field called 'response'
#     # Adjust based on actual response format of GPTInterface
#     return response.response  # This should be a list of prerequisites or whatever the model returns
