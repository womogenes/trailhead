# python
import os
from dotenv import load_dotenv  # Ensure you've installed python-dotenv: pip install python-dotenv
from supabase import create_client, Client
from pydantic import BaseModel
from gpt import GPTInterface
from perplexity import PerplexityInterface
import re
from typing import List

class Node:
    def __init__(self, node_id: str, title: str, description: str):
        self.id = node_id
        self.title = title
        self.description = description

class Trail:
    def __init__(self, trail_id: str, title: str):
        self.trail_id = trail_id
        self.title = title

        self.edges = {}

    def contains_node(self, node_id: str) -> bool:
        return node_id in self.edges

    def get_number_nodes(self):
        return len(self.edges)

    def add_edge(self, start_node: str, end_node: str):
        if start_node not in self.edges:
            self.edges[start_node] = {end_node}
        else:
            self.edges[start_node].add(end_node)

        if end_node not in self.edges:
            self.edges[end_node] = set()

class Hike:

    def __init__(self, user_response):
        self.topic = user_response.topic
        self.prereqs = user_response.satisfied_prereqs
        self.preferred_media = user_response.preferred_media_types
        self.preferred_difficulty = user_response.preferred_difficulty
        self.db = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
        self.gpt = GPTInterface(api_key=os.getenv("OPENAI_KEY"), model="o3-mini")
        self.perplexity = PerplexityInterface(api_key=os.getenv("PERPLEXITY_KEY"))
        self.nodes = {}
        self.trails = []

        self.generate_initial_node(user_response)

    def create_from_trailhead(self, trailhead_id: str, url: str = None, key: str = None):
        self.trailhead_id = trailhead_id

        if not url or not key:
            load_dotenv()
            self.db = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
        else:
            self.db = create_client(url, key)

        self.gpt = GPTInterface(api_key=os.getenv("OPENAI_KEY"), model="o3-mini")
        self.perplexity = PerplexityInterface(api_key=os.getenv("PERPLEXITY_KEY"))
        self.nodes = {}
        self.nodes = {self.trailhead_id : self.create_node_from_id(self.trailhead_id)}
    
    def create_node_from_id(self, node_id: str) -> Node:
        response = self.db.from_("xresources").select("*").eq("id", node_id).execute()
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
            trail = Trail(row["id"], row["trail_title"])
            edges = self.db.from_("edges").select("*").eq("trail_id", row["id"]).execute().data
            
            for edge in edges:
                trail.add_edge(edge["id_a"], edge["id_b"])
            
            for node in trail.edges:
                self.nodes[node] = self.create_node_from_id(node)

            trails.append(trail)

        self.trails += trails
        return trails

    def extract_topics(self, topics_str: str) -> list:

        # Use regular expression to find all occurrences of text within double brackets
        topics = re.findall(r'\[\[(.*?)\]\]', topics_str)
        return topics 

    def parse_description(self, description: str) -> str:
        pattern = r'\[\s*\d+\s*\]'
        return re.sub(pattern, '', description)

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
        class Output(BaseModel):
            topics: List[str]

        system_role = f"""
        You are currently helping a user learn about {current_trail.title} by finding specific topics that guide the user towards mastery of {current_trail.title}.
        To do this, you will be given two pieces of information: a focus topic and a list of related, prerequisite subjects and their descriptions that the user has already learned.
        Read through the list of topics and how they relate to the focus topic, and then propose several new, related skills and topics that would naturally extend off the focus topic. Limit
        the number of generated topics to at most 4, but try to keep it at 1 or 2 if possible in order to increase their relevancy.
        These topics should be fundamental skills that the user can learn from online resources and builds off the existing skills. These topics should also be unique from one another.
        
        The topics should be a single sentence without any additional description, which is why it needs to be short and concise. Additionally, it should not overlap with any of the existing
        topics in the list. Each of the new topics should have a very clear focus. Output the topics into one JSON file with the given schema
        """

        prompt = f""" The focus topic is {focus.title}. It is described as {focus.description}.
        The following is the list of topics and descriptions that the user has already learned. If it is empty, then come up with new topics that are at an introduction level
        for the given topic. Make sure that the topics are specific enough.
        """

        prev_nodes = self.find_node_parents(focus, current_trail)
        prerequisites = []

        for node in prev_nodes:
            prerequisites.append(f"The next topic is called {self.nodes[node].title}, which is about {self.nodes[node].description}.")

        topics = self.gpt.run_prompt(
            prompt=prompt,
            data=prerequisites,
            schema_model=Output,
            system_role=system_role,
        ).topics


        return topics

    def extend_summit(self, focus: Node, current_trail: Trail) -> str:
        class Output(BaseModel):
            found_connection: bool
            new_topic: str
            related_indices: List[int]

        system_role = f"""
        You are currently helping a user learn about {current_trail.title} by finding specific subtopics that guide the user towards mastery of {current_trail.title}.
        To do this, you will be given two pieces of information: a focus topic and a list of 'trails', which are different learning prerequisites of information of increasing commplexity that the user has already learned.
        Read through the list of the different paths and try to merge the trails with the focus topic by finding similarities between the trail topic and the focus.
        Decide if at least one of the trails relate to the focus. If so, specify which trails they are it is and propose a new, related topic that extends off both the trail and the focus topic. Make sure there
        is a clear connection between the trails, and if there isn't then be sure to not propose a new topic.

        Synthesize whether there's a connection, the new topics, and the related indices into one JSON file with the given schema.
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
            schema_model=Output,
            system_role=system_role,
        )

        if response.found_connection:
            return response.new_topic, response.related_indices


    def generate_node(self, title: str) -> Node:

        class Output(BaseModel):
            article: str
            resource_types: List[str]
            article_difficulty: float

        system_role= f"""
            You are helping someone learn about a new topic. To do so, you'll create a short article that explains the general idea of the topic,
            and you will find links from the internet that help the user understand the topic and include them in the article. The links should be from a variety
            of sources, but note that the user in particular prefers {self.preferred_media} for learning.
            These articles should be {self.preferred_difficulty} to understand for someone unfamliar with the topic. Make sure that the article is focused on the topic and do not
            include any additional information on non-related topics.
        """

        prompt = f"""
            The topic that you need to create an article for is {title}. Remember that your article should focus on searching the internet to find the best links for this subject and include them in the article.
            Additionally, remember that you are writing a simple article that should primarily focus on the resources that you find, so don't describe the topic too much in detail in the article.
            Therefore, keep the article to have under 3 links and under 150 words. The links should be spread out across the paragraph, not all at the end.
            Also, do not include any summary of the topic. Go straight into how to do the specified task.
            """
        
        response = self.perplexity.run_prompt(
            prompt=prompt,
            schema_model=Output,
            system_role= system_role,
        )

        description = self.parse_description(response)

        import random

        payload = {
            "title": title,
            "description": description,
            "rating": 1.0,
            "difficulty": random.uniform(0.3, 0.7),
            "resource_type": self.preferred_media,
        }

        response = self.db.from_("resources").insert(payload).execute()
        new_resource = response.data[0] if response.data else {}
        new_node_id = new_resource.get("id")
        return Node(new_node_id, title, description)

    def generate_initial_node(self, user_response: dict) -> Node:

        class Output(BaseModel):
            topics: List[str]

        payload = {
            "title": user_response.topic,
            "description": user_response.topic_description,
        }

        response = self.db.from_("resources").insert(payload).execute()
        new_resource = response.data[0] if response.data else {}
        new_node_id = new_resource.get("id")

        self.trailhead_id = new_node_id
        self.nodes[new_node_id] = Node(new_node_id, user_response.topic, user_response.topic_description)

        system_role = f"""
        You are currently helping a user with this objective: {user_response.objective}. To do so, you need to find a wide range of topics that can build up to this objective.
        You will be given a list of topics that the user has already learned, and you need to find at least 5 broad categories that can be used to build up to this objective, which are
        different from one another and interesting to learn. You will also be given some additional information about this user. Each topic should be placed in double brackets for easy parsing.

        Format the topics in a JSON file with the given schema.
        """

        prompt = f""" Remember, the user's objective is: {user_response.objective}. The user has already learned the following topics: {user_response.satisfied_prereqs} so do not include any of these.
        Here is additional information about the user:
        The following is the list of topics and descriptions that the user has already learned.
        """

        trail_topics = self.gpt.run_prompt(
            prompt=prompt,
            data= (user_response.additional_info + user_response.notes),
            schema_model=Output,
            system_role=system_role,
        ).topics

        for topic in trail_topics:

            payload = {
                "trail_title": topic,
                "trailhead_id": self.trailhead_id,
            }

            response = self.db.from_("trails").insert(payload).execute()
            new_resource = response.data[0] if response.data else {}
            trail_id = new_resource.get("id")

            trail = Trail(trail_id, topic)
            self.extend_trail(self.nodes[self.trailhead_id], trail, 3)

            self.trails.append(trail)

    def extend_trail(self, current_node: Node, trail: Trail, depth: int):

        if depth == 0:
            return
        
        new_topics = self.extend_topic(current_node, trail)

        for topic in new_topics:
            new_node = self.generate_node(topic)
            self.nodes[new_node.id] = new_node

            trail.add_edge(current_node.id, new_node.id)

            # Insert a new record into the "edges" table
            edge_payload = {
                "id_a": current_node.id,
                "id_b": new_node.id,
                "trail_id": trail.trail_id,
            }

            edge_response = self.db.from_("edges").insert(edge_payload).execute()

            print(f"New node created: {topic}")

            self.extend_trail(new_node, trail, depth - 1)


# poker_id = "5b212b56-5380-47a8-90d7-b25ef220c2be"
# trailhead_id = "d5dc3dcd-0827-4c97-9259-49aef2f74e2e"

# node_id = "277f0f80-f216-4377-82fd-c6804f8daed5"

# hike = Hike(trailhead_id=trailhead_id)
# curr_node = hike.create_node_from_id(node_id)

# trails = hike.get_trails()
# curr_trail = trails[1]

# hike.extend_trail(curr_node, curr_trail, 3)