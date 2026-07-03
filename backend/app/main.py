from fastapi import FastAPI
from app.api.routes.diagram import router as diagram_router
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title='ArchitectureGPT API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/')
def root():
    return {'message' : "API is runnig"}


app.include_router(diagram_router)