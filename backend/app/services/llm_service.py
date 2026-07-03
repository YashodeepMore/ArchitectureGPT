from app.schemas.diagram import Diagram, Node, Edge
from app.prompt.get_diagram import llm_structured_prompt
from openai import OpenAI
from dotenv import load_dotenv
import json
import os
from openai import RateLimitError
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logging.getLogger('llm-service')

load_dotenv()


client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1",
)


# def generate_diagram_from_prompt(prompt: str) -> Diagram:
#     # Temporary mock data
#     return Diagram(
#         nodes=[
#             Node(id="frontend", label="React", type="frontend"),
#             Node(id="backend", label="FastAPI", type="backend"),
#             Node(id="db", label="PostgreSQL", type="database"),
#         ],
#         edges=[
#             Edge(id="e1", source="frontend", target="backend"),
#             Edge(id="e2", source="backend", target="db"),
#         ],
#     )


def generate_diagram_from_prompt(prompt: str) -> Diagram:
    try:
      response = client.chat.completions.create(
          model="openai/gpt-oss-120b:free",  # change later if needed
          messages=[
              {
                  "role": "system",
                  "content": llm_structured_prompt,
              },
              {"role": "user", "content": prompt},
          ],
      )

      content = response.choices[0].message.content

      print("Content : ", content)
    #   logging.info(f"Responce : {response}")


      if not content:
          return {"nodes": [], "edges": []}

      data = json.loads(content)

      return Diagram(**data)
    
    except RateLimitError as e:
      logging.error(f"error getting responce due rate limit \n error : {e}")
      return {
          "nodes": [],
          "edges": []
      }
        