from lumaai import LumaAI
import requests
import time

from dotenv import load_dotenv
load_dotenv()

import os
import supabase


client = LumaAI()

def generate(desc):
    #desc is string of description
    generation = client.generations.image.create(
    prompt=desc,)

    completed = False
    while not completed:
        generation = client.generations.get(id=generation.id)
        if generation.state == "completed":
            completed = True
        elif generation.state == "failed":
            raise RuntimeError(f"Generation failed: {generation.failure_reason}")
        print("Dreaming")
        time.sleep(2)
    image_url = generation.assets.image
    print(image_url)
    return image_url



#generate("dancing cats")