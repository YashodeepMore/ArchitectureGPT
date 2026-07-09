from app.schemas.diagram import Diagram, Node, Edge
from app.prompt.get_diagram import llm_structured_prompt
from openai import OpenAI
from dotenv import load_dotenv
import json
import os
from openai import RateLimitError
import logging

FREE_MODELS = [
    # "openai/gpt-oss-120b:free",

    # "meta-llama/llama-3.3-70b-instruct:free",

    # "google/gemma-4-31b-it:free",

    # "qwen/qwen3-next-80b-a3b-instruct:free",

    # "nvidia/nemotron-3-super-120b-a12b:free",

    "tencent/hy3:free",
]

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

###trying different models methods
def call_model(model:str, prompt:str):
  response = client.chat.completions.create(
        model=model,  # change later if needed
        messages=[
            {
                "role": "system",
                "content": llm_structured_prompt,
            },
            {"role": "user", "content": prompt},
        ],
    )
  return response

########################




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

    last_error = None

    for model in FREE_MODELS:
      try:
          logging.info(f"trying model : {model}")

          responce = call_model(model=model, prompt=prompt)

          content = responce.choices[0].message.content

          if not content:
            continue

          data = json.loads(content)

          return Diagram(**data)
        
      except RateLimitError as e:

        logging.warning(f"{model} rate limited")

        last_error = e

      except json.JSONDecodeError as e:

          logging.warning(f"{model} returned invalid JSON")

          last_error = e

      except Exception as e:

          logging.warning(f"{model} failed: {e}")

          last_error = e

    # print("Content : ", content)
    #   logging.info(f"Responce : {response}")


    logging.error(f"error getting responce due rate limit \n error : tryed all models")
    if not content:
      return {"nodes": [], "edges": []}

    






#       content = """{
#   "id": "hospital-web-app-diagram",
#   "nodes": [
#     {
#       "id": "web-ui",
#       "type": "frontend",
#       "label": "Web UI",
#       "position": { "x": 100, "y": 100 },
#       "parent": "frontend-group"
#     },
#     {
#       "id": "mobile-app",
#       "type": "frontend",
#       "label": "Mobile App",
#       "position": { "x": 100, "y": 200 },
#       "parent": "frontend-group"
#     },
#     {
#       "id": "api-gateway",
#       "type": "gateway",
#       "label": "API Gateway",
#       "position": { "x": 300, "y": 150 },
#       "parent": "backend-group"
#     },
#     {
#       "id": "auth-service",
#       "type": "service",
#       "label": "Auth Service",
#       "position": { "x": 500, "y": 80 },
#       "parent": "backend-group"
#     },
#     {
#       "id": "patient-service",
#       "type": "service",
#       "label": "Patient Service",
#       "position": { "x": 500, "y": 130 },
#       "parent": "backend-group"
#     },
#     {
#       "id": "appointment-service",
#       "type": "service",
#       "label": "Appointment Service",
#       "position": { "x": 500, "y": 180 },
#       "parent": "backend-group"
#     },
#     {
#       "id": "notification-service",
#       "type": "service",
#       "label": "Notification Service",
#       "position": { "x": 500, "y": 230 },
#       "parent": "backend-group"
#     },
#     {
#       "id": "redis-cache",
#       "type": "cache",
#       "label": "Redis Cache",
#       "position": { "x": 700, "y": 80 },
#       "parent": "backend-group"
#     },
#     {
#       "id": "postgres-db",
#       "type": "database",
#       "label": "PostgreSQL",
#       "position": { "x": 700, "y": 200 },
#       "parent": "database-group"
#     },
#     {
#       "id": "email-provider",
#       "type": "external",
#       "label": "Email Provider",
#       "position": { "x": 900, "y": 80 },
#       "parent": null
#     }
#   ],
#   "edges": [
#     { "id": "e1", "source": "web-ui", "target": "api-gateway" },
#     { "id": "e2", "source": "mobile-app", "target": "api-gateway" },
#     { "id": "e3", "source": "api-gateway", "target": "auth-service" },
#     { "id": "e4", "source": "api-gateway", "target": "patient-service" },
#     { "id": "e5", "source": "api-gateway", "target": "appointment-service" },
#     { "id": "e6", "source": "api-gateway", "target": "notification-service" },
#     { "id": "e7", "source": "auth-service", "target": "postgres-db" },
#     { "id": "e8", "source": "patient-service", "target": "postgres-db" },
#     { "id": "e9", "source": "appointment-service", "target": "postgres-db" },
#     { "id": "e10", "source": "notification-service", "target": "redis-cache" },
#     { "id": "e11", "source": "notification-service", "target": "email-provider" }
#   ],
#   "groups": [
#     {
#       "id": "frontend-group",
#       "label": "Frontend",
#       "position": { "x": 50, "y": 50 },
#       "width": 200,
#       "height": 200
#     },
#     {
#       "id": "backend-group",
#       "label": "Backend",
#       "position": { "x": 250, "y": 30 },
#       "width": 600,
#       "height": 300
#     },
#     {
#       "id": "database-group",
#       "label": "Database",
#       "position": { "x": 650, "y": 150 },
#       "width": 200,
#       "height": 100
#     }
#   ],
#   "metadata": {
#     "title": "Hospital Web Application Architecture"
#   }
# }"""

    #   print("Content : ", content)
    # #   logging.info(f"Responce : {response}")


    #   if not content:
    #       return {"nodes": [], "edges": []}

    #   data = json.loads(content)

    #   return Diagram(**data)
    
    # except RateLimitError as e:
    #   logging.error(f"error getting responce due rate limit \n error : {e}")
    #   return {
    #       "nodes": [],
    #       "edges": []
    #   }
        