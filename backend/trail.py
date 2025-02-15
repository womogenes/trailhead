# python
import os
from dotenv import load_dotenv  # Ensure you've installed python-dotenv: pip install python-dotenv
from supabase import create_client, Client
from pydantic import BaseModel
from gpt import GPTInterface
import re

class Trail:
    def __init__(self, trailhead_id: str = None, url: str = None, key: str = None, api_key: str = None, model: str = "gpt-4o-mini"):
        self.trailhead_id = trailhead_id

        if not url or not key:
            load_dotenv()
            self.db = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
        else:
            self.db = create_client(url, key)

        self.gpt = GPTInterface(api_key=os.getenv("OPENAI_KEY"))

    def get_trails(self) -> list:
        response = self.db.from_("trails").select("*").execute()
        rows = response.data if response.data else []
        trails = []
        
        for row in rows:
            edges = row.get("edges", [[self.trailhead_id]])

            for i in range(len(edges)):
                if edges[i][0] == self.trailhead_id:
                    nodes = [self.trailhead_id]
                    for j in range(i, len(edges)):
                        nodes.append(edges[j][1])
                    trails.append(nodes)
                    break

        trails = self.parse_trail(trails)
        self.trails = trails

        return trails

    def parse_trail(self, trails: list) -> list:
        parsed_trails = []

        for trail in trails:
            nodes = {}
            for node in trail:
                response = self.db.from_("resources").select("*").eq("id", node).execute()
                node_data = response.data[0] if response.data else None

                if node_data:
                    # nodes[node_data["title"]] = 1
                    nodes[node_data["title"]] = node_data["description"]
            
            parsed_trails.append(nodes)
        
        return parsed_trails
            
            
    def extend_topic(self, focus: str, path: dict) -> str:

        class Output(BaseModel):
            response: str

        system_role = """
        You are currently helping a user learn about a specific topic by finding specific subtopics that guide the user towards mastery of the subject.
        To do this, you will be given two pieces of information: a focus topic and a dictionary of related topics and their descriptions that the user has already learned.
        Read through the list of topics and how they relate to the focus topic, and then propose several new, related topics that would naturally extend off the focus topic.
        These topics should be fundamental skills that the user can learn from online resources and builds off the existing skills.
        
        The topics should be a single sentence without any additional description, which is why it needs to be short and concise. Additionally, it should not overlap with any of the existing
        topics in the dictionary. Each of the new topics should have a very clear focus. After deciding on the new topics,
        each topic should be formatted by being placed between double brackets.
        """

        prompt = f""" The focus topic is {focus}.
        The following is the list of topics and descriptions that the user has already learned.
        """

        response = self.gpt.run_prompt(
            prompt=prompt,
            data=path,
            schema_model=Output,
            system_role=system_role,
            max_tokens=16384,
        )

        new_topics = self.extract_topics(response.response)

        return new_topics


    def extract_topics(self, topics_str: str) -> list:

        # Use regular expression to find all occurrences of text within double brackets
        topics = re.findall(r'\[\[(.*?)\]\]', topics_str)
        return topics 



poker_id = "5b212b56-5380-47a8-90d7-b25ef220c2be"
trailhead_id = "472f3930-62ce-4c3c-8c0a-7e293021f405"

trail = Trail(trailhead_id=trailhead_id)
nodes = trail.get_trails()

response = trail.extend_topic("Cooking during poker night", nodes[0])

print(response)