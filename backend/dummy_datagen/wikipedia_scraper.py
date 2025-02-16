# Script geneated by o3-mini lol

import requests
from bs4 import BeautifulSoup
import uuid
import re
from functools import lru_cache
import json

def is_disambiguation_page(soup: BeautifulSoup) -> bool:
    """
    Checks if the given BeautifulSoup object represents a disambiguation page.
    """
    return soup.find("table", id="disambigbox") is not None

def build_wikipedia_graph(query: str, max_depth: int, max_degree: int) -> dict:
    """
    Searches Wikipedia for the given query, then builds a graph by recursively
    parsing each article to extract links to other Wikipedia articles.
    
    For each article:
      - Only up to 3 unique linked articles are processed.
      - Recursion stops when a maximum depth of 10 is reached.
    
    Each node in the graph is a dict with:
      - id: a UUID (v4) string
      - title: article title
      - description: first paragraph text (if available)
      - link: full Wikipedia URL for the article
      - difficulty: float in [0.0, 1.0] computed as (current_depth/max_depth)
      
    Edges are represented as a list of two UUID strings [parent_id, child_id].
    """
    graph = {"nodes": [], "edges": []}
    # Use a dict to avoid processing the same URL twice:
    visited = {}  # key: article URL, value: node_id
    
    # STEP 1: Search for the article using Wikipedia’s API.
    search_url = "https://en.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "list": "search",
        "srsearch": query,
        "format": "json"
    }
    
    resp = requests.get(search_url, params=params)
    data = resp.json()
    
    # If no results are found, return an empty graph.
    if "query" not in data or "search" not in data["query"] or len(data["query"]["search"]) == 0:
        print("No article found for the query.")
        return graph
    
    # Take the first search result.
    start_title = data["query"]["search"][0]["title"]

    @lru_cache(None)
    def process_article(title: str, depth: int) -> str:
        """
        Processes a single Wikipedia article.
        
        Returns the UUID (string) of the created node or the existing one if already visited.
        """
        # Build the full article URL (replace spaces with underscores)
        article_url = "https://en.wikipedia.org/wiki/" + title.replace(" ", "_")
        
        # If already visited, just return its UUID.
        if article_url in visited:
            return visited[article_url]
        
        # Fetch the article page.
        response = requests.get(article_url)
        if response.status_code != 200:
            return None
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Skip disambiguation pages.
        if is_disambiguation_page(soup) or "disambiguation" in title.lower():
            return None
        
        print(f"Processing title={title}, depth={depth}")
        
        # Try to get the article description from the first paragraph in the main content.
        description = ""
        content_div = soup.find("div", class_="mw-parser-output")
        if content_div:
            p = content_div.find("p")
            if p:
                description = p.get_text().strip()
        
        # Compute difficulty as a function of depth.
        difficulty = depth / max_depth if max_depth > 0 else 0.0
        
        # Create a new node.
        node_id = str(uuid.uuid4())
        node = {
            "id": node_id,
            "title": title,
            "description": description,
            "link": article_url,
            "difficulty": difficulty,
            "resource_type": "wikipedia"
        }
        graph["nodes"].append(node)
        visited[article_url] = node_id

        # Only proceed with recursion if we haven't reached the maximum depth.
        if depth < max_depth and content_div:
            # Find all valid Wikipedia links in the article content.
            # Only consider <a> tags where href starts with "/wiki/" and does not contain ":".
            found_titles = []
            for a in content_div.find_all("a", href=True):
                href = a['href']
                if href.startswith("/wiki/") and not re.search(":", href):
                    # Extract the linked article title.
                    linked_title = href.split("/wiki/")[1].replace("_", " ")
                    # Avoid duplicates in the current page.
                    if linked_title not in found_titles:
                        found_titles.append(linked_title)
                if len(found_titles) >= max_degree:
                    break

            # Process each found link recursively.
            for linked_title in found_titles:
                child_node_id = process_article(linked_title, depth + 1)
                if child_node_id:
                    # Add an edge from the current node to the child node.
                    graph["edges"].append([node_id, child_node_id])
        return node_id

    # Start the recursion from the starting article.
    process_article(start_title, 0)
    return graph

# Example usage:
if __name__ == "__main__":
    query = "Python programming"
    graph = build_wikipedia_graph(query, 5, 3)
    with open("./data.json", "w") as fout:
        json.dump(graph, fout)
