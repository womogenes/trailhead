from fastapi import FastAPI
from pydantic import BaseModel
from perplexity import PerplexityInterface
import os
from dotenv import load_dotenv
import os
from hike import Hike

response = {"topic":"Poker Skills Improvement", "topic_description": "Learn how to play poker!", "satisfied_prereqs":["Basic poker rules","Hand rankings knowledge","Position awareness skill"],"objective":"To get good at poker for fun.","additional_info":"Learner prefers heavy brain usage.","preferred_media_types":["podcasts"],"preferred_difficulty":"medium","notes":"Learner is familiar with betting strategies and bluffing techniques, but has not practiced them yet."}

hike = Hike(response)