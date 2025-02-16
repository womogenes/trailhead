import requests
from pydantic import BaseModel
import json
class AnswerFormat(BaseModel):
    content_links: str


def tutorials(topic,media):
    #topic should start with topic. and then later have info. Need to learn more about x,y,z. Already know about a,b,c
    #media is list of kinds of media. example  ["books","podcasts","videos"]
    
    media_prompt=','.join([i+" links,title and brief description" for i in media])

    url = "https://api.perplexity.ai/chat/completions"
    headers = {"Authorization": "Bearer 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"}
    payload = {
        "model": "sonar",
        "messages": [
            {"role": "system", "content": "Be precise and concise and don't repeat. Only provide links,title and brief description of each resource. no additional text"},
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
    
    answer=res[res.index('{'):].strip().removesuffix("```")
    print(answer)
    answer=json.loads(answer)
    #if(answer[-3:]=="```"):
    #    answer=answer[:-3]
    #print(type(answer))
    #print(answer)
    res={}
    return answer
    for i in answer:
        if(True):#i in topic):
            #if(answer[i][0].count(' ')>0):
                #continue
            res[i]=answer[i]
    print(res)
    return res

tutorials("oil painting",["videos","tutorials","images"])
