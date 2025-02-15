# python
import os
from dotenv import load_dotenv  # Ensure you've installed python-dotenv: pip install python-dotenv
from supabase import create_client, Client
from pydantic import BaseModel
from gpt import GPTInterface
import re

# Load the environment variables from .env
load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def get_trail_node_ids(trailhead_id, client: Client) -> list:
    # Retrieve all rows from the "trails" table
    response = client.from_("trails").select("*").execute()
    rows = response.data if response.data else []
    trails = []
    
    
    for row in rows:
        edges = row.get("edges", [[trailhead_id]])

        for i in range(len(edges)):
            if edges[i][0] == trailhead_id:
                nodes = [trailhead_id]
                for j in range(i, len(edges)):
                    nodes.append(edges[j][1])
                trails.append(nodes)
                break

    return trails

def parse_trail(trails: list, client: Client) -> list:
    parsed_trails = []

    for trail in trails:
        nodes = {}
        for node in trail:
            response = client.from_("resources").select("*").eq("id", node).execute()
            node_data = response.data[0] if response.data else None

            if node_data:
                # nodes[node_data["title"]] = 1
                nodes[node_data["title"]] = node_data["description"]
        
        parsed_trails.append(nodes)
    
    return parsed_trails
            
def generate_next_topics_prompt(topics_dict: dict, interface: GPTInterface) -> str:

    class Output(BaseModel):
        response: str

    system_role = """
    You are currently helping a user learn about a specific topic by finding specific subtopics that guide the user towards mastery of the subject.
    To do this, you will be given a dictionary of topics and their corresponding descriptions that the user has already learned. Find the overarching
    skill they revolve around, and the  propose several new, related topics that would naturally extend off this list of topics. The topics should be
    a single sentence without any additional description, which is why it needs to be short and concise.
    Each of the new topics should have a very clear focus. After deciding on the new topics,
    each topic should be formatted by being placed between double brackets.
    """

    prompt = """
    The following is the list of topics and descriptions that the user has already learned. Remember to find the overarching skill they revolve around, and propose several new, related topics that would naturally extend off this list of topics.
    """

    response = interface.run_prompt(
        prompt=prompt,
        data=topics_dict,
        schema_model=Output,
        system_role=system_role,
        max_tokens=16384,
    )

    return response

def extract_topics(topics_str: str) -> list:
    """
    Extracts topics enclosed in double brackets from a given string and compiles them into a list.

    Args:
        topics_str (str): The string containing topics separated by double brackets.

    Returns:
        list: A list of topics extracted from the input string.
    """
    # Use regular expression to find all occurrences of text within double brackets
    topics = re.findall(r'\[\[(.*?)\]\]', topics_str)
    return topics 

gpt_interface = GPTInterface(api_key=os.getenv("OPENAI_KEY"))


poker_id = "5b212b56-5380-47a8-90d7-b25ef220c2be"
trailhead_id = "472f3930-62ce-4c3c-8c0a-7e293021f405"
nodes = get_trail_node_ids(trailhead_id, supabase)

nodes = parse_trail(nodes, supabase)

response = generate_next_topics_prompt(nodes, gpt_interface)

response = extract_topics(response.response)

print(response)