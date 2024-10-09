from fastapi import FastAPI, HTTPException
from transformers import pipeline

app = FastAPI()

# Load the model once when the app starts
model = pipeline("text-generation", model="gpt2")

@app.post("/generate")
async def generate_text(prompt: dict):
    try:
        # Ensure the prompt is present
        if "prompt" not in prompt or not prompt["prompt"]:
            raise HTTPException(status_code=400, detail="Invalid prompt")

        inputs = prompt["prompt"]
        
        # Generate text
        outputs = model(inputs, max_length=100)
        return {"generated_text": outputs[0]["generated_text"]}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
