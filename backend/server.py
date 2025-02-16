from fastapi import FastAPI, Query
from dotenv import load_dotenv

from pydantic import BaseModel
from gpt import GPTInterface
import os

load_dotenv()
# Load API key from environment variables instead of hardcoding
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
print('OpenAI API Key = ', OPENAI_API_KEY)

app = FastAPI()

@app.get("/")
async def root():
    input = [{ 'content': "I want to learn about poker", 'role': "user" }]
    my_query = input[0]['content'] #change later when integrating with front-end
    input2 = [{ 'content': "I have never played poker before, but want to play with friends", 'role': "user" }]
    my_query2 = input2[0]['content'] #change later when integrating with front-end

    return {"message": generate_prereqs(my_query)}


def generate_prereqs(dat):
    """
    Determine what user wants to learn. Generate up to 5 prerequisites for the particular skill.
    """
    class Output(BaseModel):
        prereqs: list

    gpt_interface = GPTInterface()
    prompt = """
    Take the given prompt and determine what the user wants to learn. Generate a list of up to 5 prerequisites for this particular skill. 
    """
    response = gpt_interface.run_prompt(
        prompt=prompt,
        data=dat,
        schema_model=Output,
        max_tokens=16384,
    )

    return response.prereqs

def get_learning_goal(dat):
    """
    Obtaining user's overall learning goal.
    """
    class Output(BaseModel):
        user_goal: str

    gpt_interface = GPTInterface()
    prompt = """
    Parse user response and summarize what their main goal or learning objective is.  
    """
    response = gpt_interface.run_prompt(
        prompt=prompt,
        data=dat,
        schema_model=Output,
        max_tokens=16384,
    )

    return response.user_goal

def gather_additional_info(dat):
    """
    Extracting additional info from user.
    """
    class Output(BaseModel):
        additional_info: str

    gpt_interface = GPTInterface()
    prompt = """
    First, restate the given prompt. Then, identify important considerations for a learning plan that will satisfy the user. 
    """
    response = gpt_interface.run_prompt(
        prompt=prompt,
        data=dat,
        schema_model=Output,
        max_tokens=16384,
    )

    return response.additional_info

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
#     gpt_interface = GPTInterface()
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
#     gpt_interface = GPTInterface()
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
