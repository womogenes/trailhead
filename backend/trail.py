# python
import os
from dotenv import load_dotenv  # Ensure you've installed python-dotenv: pip install python-dotenv
from supabase import create_client, Client
from pydantic import BaseModel
from gpt import GPTInterface
import re

class Node:
    def __init__(self, node_id: str, title: str, description: str):
        self.id = node_id
        self.title = title
        self.description = description

class Trail:
    def __init__(self, trail_id: str, nodes: list = None):
        self.trail_id = trail_id
        self.nodes = nodes

    def get_trail_end(self) -> Node:
        return self.nodes[-1]


class Hike:
    class Output(BaseModel):
            response: str


    def __init__(self, trailhead_id: str = None, url: str = None, key: str = None, api_key: str = None, model: str = "gpt-4o-mini"):
        self.trailhead_id = trailhead_id

        if not url or not key:
            load_dotenv()
            self.db = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
        else:
            self.db = create_client(url, key)

        self.gpt = GPTInterface(api_key=os.getenv("OPENAI_KEY"))

    
    def create_node_from_id(self, node_id: str) -> Node:
        response = self.db.from_("resources").select("*").eq("id", node_id).execute()
        data = response.data[0] if response.data else None

        if data:
            return Node(node_id, data["title"], data["description"])
        else:
            return None

    def get_trails(self) -> list:
        response = self.db.from_("trails").select("*").execute()
        rows = response.data if response.data else []
        trails = []
        
        for row in rows:
            edges = row.get("edges", [[self.trailhead_id]])

            for i in range(len(edges)):
                if edges[i][0] == self.trailhead_id:
                    
                    nodes = [self.create_node_from_id(self.trailhead_id)]

                    for j in range(i, len(edges)):
                        nodes.append(self.create_node_from_id(edges[j][1]))

                    trails.append(Trail(row["id"], nodes))
                    break

        self.trails = trails
        return trails
            
    def extend_topic(self, focus: Node, trail: Trail) -> str:

        system_role = """
        You are currently helping a user learn about a specific topic by finding specific subtopics that guide the user towards mastery of the subject.
        To do this, you will be given two pieces of information: a focus topic and a list of related, prerequisite topics and their descriptions that the user has already learned.
        Read through the list of topics and how they relate to the focus topic, and then propose several new, related topics that would naturally extend off the focus topic.
        These topics should be fundamental skills that the user can learn from online resources and builds off the existing skills.
        
        The topics should be a single sentence without any additional description, which is why it needs to be short and concise. Additionally, it should not overlap with any of the existing
        topics in the list. Each of the new topics should have a very clear focus. After deciding on the new topics,
        each topic should be formatted by being placed between double brackets.
        """

        prompt = f""" The focus topic is {focus.title}. It is described as {focus.description}.
        The following is the list of topics and descriptions that the user has already learned.
        """

        prerequisites = []

        for node in trail.nodes:
            prerequisites.append(f"The next topic is called {node.title}, which is about {node.description}.")

        response = self.gpt.run_prompt(
            prompt=prompt,
            data=prerequisites,
            schema_model=self.Output,
            system_role=system_role,
        )

        new_topics = self.extract_topics(response.response)

        return new_topics

    def extend_summit(self, focus: Node, current_trail: Trail) -> str:
        system_role = """
        You are currently helping a user learn about a specific topic by finding specific subtopics that guide the user towards mastery of the subject.
        To do this, you will be given two pieces of information: a focus topic and a list of 'trails', which are different learning prerequisites of information of increasing commplexity that the user has already learned.
        Read through the list of the different paths and try to merge the trails with the focus topic by finding similarities between the trail topic and the focus.
        Decide if at least one of the trails relate to the focus. If so, specify which trails they are it is and propose a new, related topic that extends off both the trail and the focus topic. Make sure there
        is a clear connection between the trails, and if there isn't then be sure to not propose a new topic.

        The first word in the response should be "True" if the trail relates to the focus, and "False" if it does not. The first word should have double brackets around it. If the response is true, then the second part of the
        response should be the topic that relates to all the trails, also with double brackets around it. Then, list all the indices of the paths that relate to the focus, each with double brackets around them.
        The topic should be a single sentence without any additional description, which is why it needs to be short and concise. Additionally, it should not overlap with any of the existing
        topics. 
        """

        prompt = f""" The focus topic is {focus.title}, which is about {focus.description}.
        The following is the list of topics and descriptions that the user has already learned.
        """

        all_paths = []
        for trail in self.trails:
            if trail.trail_id == current_trail.trail_id:
                continue

            prerequisites = []
            for node in trail.nodes:
                prerequisites.append(f"The next topic is called {node.title}, which is about {node.description}.")

            all_paths.append(f"This is the start of a new trail description. This trail contains the following information: {prerequisites}")

        response = self.gpt.run_prompt(
            prompt=prompt,
            data=all_paths,
            schema_model=self.Output,
            system_role=system_role,
        )

        new_topics = self.extract_topics(response.response)

        if new_topics[0] == "True":
            return new_topics[1], new_topics[2:]

    def extract_topics(self, topics_str: str) -> list:

        # Use regular expression to find all occurrences of text within double brackets
        topics = re.findall(r'\[\[(.*?)\]\]', topics_str)
        return topics 
    


poker_id = "5b212b56-5380-47a8-90d7-b25ef220c2be"
trailhead_id = "f0004603-e220-45a8-b9d2-55b7291ef48b"

trail = Hike(trailhead_id=trailhead_id)
trails = trail.get_trails()

# response = trail.extend_summit("How to maintain poker face with food", nodes)
# print(nodes)
print(trails)
for trail in trails:
    for node in trail.nodes:
        print(node.title)