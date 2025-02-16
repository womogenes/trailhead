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
    def __init__(self, trail_id: str, edges_list: list = None):
        self.trail_id = trail_id
        self.edges = {}

        for edge in edges_list:
            self.add_edge(edge)

    def contains_node(self, node_id: str) -> bool:
        return node_id in self.edges

    def get_number_nodes(self):
        return len(self.edges)

    def add_edge(self, edge: list):
        if edge[0] not in self.edges:
            self.edges[edge[0]] = {edge[1]}
        else:
            self.edges[edge[0]].add(edge[1])

        if edge[1] not in self.edges:
            self.edges[edge[1]] = set()


class Hike:
    class Output(BaseModel):
            response: str


    def __init__(self, trailhead_id: str, url: str = None, key: str = None):
        self.trailhead_id = trailhead_id

        if not url or not key:
            load_dotenv()
            self.db = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
        else:
            self.db = create_client(url, key)

        self.gpt = GPTInterface(api_key=os.getenv("OPENAI_KEY"))
        self.nodes = {}
        self.nodes = {self.trailhead_id : self.create_node_from_id(self.trailhead_id)}
    
    def create_node_from_id(self, node_id: str) -> Node:
        response = self.db.from_("resources").select("*").eq("id", node_id).execute()
        data = response.data[0] if response.data else None

        if data:
            if node_id not in self.nodes:
                self.nodes[node_id] = Node(node_id, data["title"], data["description"])
            return self.nodes[node_id]
        else:
            return None

    def get_trails(self) -> list:
        response = self.db.from_("trails").select("*").eq("trailhead_id", self.trailhead_id).execute()
        rows = response.data if response.data else []
        trails = []
        
        for row in rows:
            edges = row.get("edges", [[self.trailhead_id]])
            trail = Trail(row["id"], edges)

            for start_node in trail.edges:
                self.nodes[start_node] = self.create_node_from_id(start_node)

            trails.append(trail)

        self.trails = trails
        return trails

    def extract_topics(self, topics_str: str) -> list:

        # Use regular expression to find all occurrences of text within double brackets
        topics = re.findall(r'\[\[(.*?)\]\]', topics_str)
        return topics 

    def find_node_parents(self, node: Node, trail: Trail, depth: int = 6) -> list:
        prev_nodes = []
        q = []

        q.append(node.id)

        for i in range(depth):
            if not q:
                break

            current_node = q.pop(0)
            for start_node in trail.edges:
                if current_node in trail.edges[start_node]:
                    prev_nodes.append(start_node)
                    q.append(start_node)

        return prev_nodes

    def find_node_children(self, node: Node, trail: Trail, depth: int = 8) -> list:
        next_nodes = []
        q = []

        q.append(node.id)

        for i in range(depth):
            if not q:
                break

            current_node = q.pop(0)
            for next_node in trail.edges[current_node]:
                next_nodes.append(next_node)
                q.append(next_node)

        return next_nodes

    def extend_topic(self, focus: Node, current_trail: Trail) -> str:

        system_role = """
        You are currently helping a user learn about a specific topic by finding specific subtopics that guide the user towards mastery of the subject.
        To do this, you will be given two pieces of information: a focus topic and a list of related, prerequisite topics and their descriptions that the user has already learned.
        Read through the list of topics and how they relate to the focus topic, and then propose several new, related topics that would naturally extend off the focus topic.
        These topics should be fundamental skills that the user can learn from online resources and builds off the existing skills. These topics should also be unique from one another.
        
        The topics should be a single sentence without any additional description, which is why it needs to be short and concise. Additionally, it should not overlap with any of the existing
        topics in the list. Each of the new topics should have a very clear focus. After deciding on the new topics,
        each topic should be formatted by being placed between double brackets.
        """

        prompt = f""" The focus topic is {focus.title}. It is described as {focus.description}.
        The following is the list of topics and descriptions that the user has already learned.
        """

        prev_nodes = self.find_node_parents(focus, current_trail)
        prerequisites = []

        for node in prev_nodes:
            prerequisites.append(f"The next topic is called {self.nodes[node].title}, which is about {self.nodes[node].description}.")

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

            prev_nodes = self.find_node_children(focus, current_trail)
            prerequisites = []

            for node in prev_nodes:
                prerequisites.append(f"The next topic is called {self.nodes[node].title}, which is about {self.nodes[node].description}.")

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


    def generate_node(self, title: str, node_id: str) -> Node:
        system_role = f"""
        You are currently creating an article about a new topic that they've never learned before. The article should be concise and informative, being around a paragraph in length,
        and be understandable for someone who is new to the topic. Furthermore, the article should be very focused and not contain any irrelevant information.
        """

        prompt = f"The topic that you need to create an article for is:"

        description = self.gpt.run_prompt(
            prompt=prompt,
            data=title,
            schema_model=self.Output,
            system_role=system_role,
        ).response

        payload = {
            "title": title,
            "description": description,
        }

        response = self.db.from_("resources").insert(payload).execute()

        return Node(node_id, title, description)

    def extend_trail(self, current_node: Node, trail: Trail, depth: int):

        if depth == 0:
            return
        
        new_topics = self.extend_topic(current_node, trail)

        for topic in new_topics:
            new_node_id = f"{self.trailhead_id}_{trail.trail_id}_{trail.get_number_nodes() + 1}"
            new_node = self.generate_node(topic, new_node_id)
            self.nodes[new_node_id] = new_node

            trail.add_edge([current_node.id, new_node.id])
            response = self.db.from_("trails").update({"edges": [[current_node.id, new_node.id]]}).eq("id", trail.trail_id).execute()

            if not response.error:
                self.generate_trail(new_node, trail, depth - 1)


poker_id = "5b212b56-5380-47a8-90d7-b25ef220c2be"
trailhead_id = "f0004603-e220-45a8-b9d2-55b7291ef48b"

node_id = "2e31b68f-8ddd-4c06-aba6-373311abe763"

hike = Hike(trailhead_id=trailhead_id)
curr_node = hike.create_node_from_id(node_id)

trails = hike.get_trails()
curr_trail = trails[1]

hike.extend_trail(curr_node, curr_trail, 3)

# print(trails)
# for trail in trails:
#     for node in trail.nodes:
#         print(node.title)