import requests
from pydantic import BaseModel
import json
class AnswerFormat(BaseModel):
    content_links: str

""""messages": [
            {"role": "system", "content": "Be precise and concise and don't repeat."},
            {"role": "user", "content": (
                "Interesting resources to learn more about "+topic,
                "Please output a JSON object containing the following fields: "+media_prompt,
            )},
        ],"""
def tutorials(topic,media):
    #topic should start with topic. and then later have info. Need to learn more about x,y,z. Already know about a,b,c
    #media is list of kinds of media. example  ["books","podcasts","videos"]
    """"messages": [
        {"role": "system", "content": "Be precise and concise."},
        {"role": "user", "content": (
            "Tell me about Michael Jordan. "
            "Please output a JSON object containing the following fields: "
            "first_name, last_name, year_of_birth, num_seasons_in_nba. "
        )},
        ],"""
    media_prompt=','.join([i+" links" for i in media])

    url = "https://api.perplexity.ai/chat/completions"
    headers = {"Authorization": "Bearer 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"}
    payload = {
        "model": "sonar",
        "messages": [
            {"role": "system", "content": "Be precise and concise and don't repeat. Only provide links. no additional text"},
            {"role": "user", "content": (
                "Interesting resources to learn more about {}".format(topic)+
                "Please output a JSON object containing the following fields: {}".format(media_prompt)
            )},
        ],
        
    

        "response_format": {
                "type": "json_schema",
            "json_schema": {"schema": AnswerFormat.model_json_schema()},
        },
    }
    response = requests.post(url, headers=headers, json=payload).json()
    
    res=response["choices"][0]["message"]["content"]
    answer=res[res.index('{'):res.index("}")+1]
    #print(answer)
    answer=eval(answer)
    #print(type(answer))
    #print(answer)
    res={}
    for i in answer:
       # print(i)
        if("links" in i.lower()):

            #if(answer[i][0].count(' ')>0):
                #continue
            res[i]=answer[i]
    print(res)
    return res

tutorials("calculus",["videos","tutorials","images"])
