from fastapi import FastAPI
from pydantic import BaseModel
from perplexity import PerplexityInterface
import os
from dotenv import load_dotenv
import os

app = FastAPI()

def rewrite_in_shakespeare(dat):
    """
    Rewrite textual prompt in old Shakespeare.
    """
    class Output(BaseModel):
        rewritten_text: str

    
    load_dotenv()
    perplexity_interface = PerplexityInterface(api_key = os.getenv("PERPLEXITY_KEY"))

    system_role= f"""
        You are helping someone learn about a new topic. To do so, you'll create a short article that explains the general idea of the topic,
        and you will find links from the internet that help the user understand the topic and include them in the article. The links should be from a variety
        of sources such as books, podcasts, videos, and news articles.
        These articles should be easy to understand for someone unfamliar with the topic. Make sure that the article is focused on the topic and do not
        include any additional information on non-related topics.
    """

    prompt = f"""
        The topic that you need to create an article for is {dat}. Remember that your article should focus on searching the internet to find the best links for this subject and include them in the article.
        Additionally, remember that you are writing a simple article that should primarily focus on the resources that you find, so don't describe the topic too much in detail in the article.
        Therefore, keep the article to have under 3 links and under 150 words. The links should be spread out across the paragraph, not all at the end.
        Also, do not include any summary of the topic. Go straight into how to do the specified task.
        """

    response = perplexity_interface.run_prompt(
        prompt=prompt,
        schema_model=Output,
        system_role= system_role,
    )

    return response


print(rewrite_in_shakespeare("How to cook an egg?"))
