from pydantic import BaseModel

class GenerateDiagramRequest(BaseModel):
    prompt:str


