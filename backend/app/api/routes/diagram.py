from fastapi import APIRouter
from app.schemas.request import GenerateDiagramRequest
from app.services.llm_service import generate_diagram_from_prompt
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logging.getLogger('diagram-route')


router = APIRouter(prefix= '/diagram',tags=['Diagram'])

@router.post("/generate")
def generate_diagram(data:GenerateDiagramRequest):

    try:
    
        return {"diagram":generate_diagram_from_prompt(data.prompt)}
    
    except Exception as e:
        logging.info(f"error generating diagram from prompt \n error : {e}")
        