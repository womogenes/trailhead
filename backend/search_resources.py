import requests
from pydantic import BaseModel

class AnswerFormat(BaseModel):
    content_links: list(list(str))


def tutorials(topic,media):
    #topic should start with topic. and then later have info. Need to learn more about x,y,z. Already know about a,b,c
    #media is list of kinds of media. example  ["books","podcasts","videos"]

    media_prompt=','.join([i+" links" for i in media])
    url = "https://api.perplexity.ai/chat/completions"
    headers = {"Authorization": "Bearer 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"}
    payload = {
        "model": "sonar",
        "messages": [
            {"role": "system", "content": "Be precise and concise and don't repeat."},
            {"role": "user", "content": (
                "Interesting resources to learn more about "+topic,
                "Please output a JSON object containing the following fields: ",
                 media_prompt
            )},
        ],
        "response_format": {
                "type": "json_schema",
            "json_schema": {"schema": AnswerFormat.model_json_schema()},
        },
    }
    response = requests.post(url, headers=headers, json=payload).json()
    answer=response["choices"][0]["message"]["content"]
    return answer

tutorials("oil painting",["videos","tutorials","images"])
