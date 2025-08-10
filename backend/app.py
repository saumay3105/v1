import os
import pickle
import faiss
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
import google.generativeai as genai
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

GENAI_API_KEY = "AIzaSyAbUrj7O1Srhqe0N4kuebFweKKSJVOkFY8"
GENAI_CHAT_MODEL = "models/gemini-2.5-flash"

app = Flask(__name__)
CORS(app)

if not GENAI_API_KEY:
    logger.error("GOOGLE_GEMINI_API_KEY environment variable not set!")
    raise ValueError("GOOGLE_GEMINI_API_KEY environment variable is required")

genai.configure(api_key=GENAI_API_KEY)
embedder = SentenceTransformer("all-MiniLM-L6-v2")

try:
    with open("products.pkl", "rb") as fp:
        products = pickle.load(fp)
    logger.info(f"Loaded {len(products)} products")
except FileNotFoundError:
    logger.error("products.pkl file not found!")
    products = []

try:
    index = faiss.read_index("product_index.faiss")
    logger.info("FAISS index loaded successfully")
except Exception as e:
    logger.error(f"Error loading FAISS index: {e}")
    index = None

chat_histories = {}


def semantic_search(query, k=5):
    if index is None:
        logger.warning("FAISS index not available, returning empty results")
        return []
    try:
        query_vec = embedder.encode([query]).astype("float32")
        D, I = index.search(query_vec, k)
        return [products[i] for i in I[0] if i < len(products)]
    except Exception as e:
        logger.error(f"Error in semantic search: {e}")
        return []


def get_chat_history(user_id):
    return chat_histories.get(user_id, [])


def save_chat_history(user_id, history):
    chat_histories[user_id] = history


def is_greeting(user_msg):
    greetings = [
        "hello",
        "hi",
        "hiii",
        "hey there",
        "howdy",
        "greetings!",
        "hi there",
        "hello there",
        "hey",
        "greetings",
        "good morning",
        "good afternoon",
        "good evening",
    ]
    normalized = user_msg.lower().strip()
    return any(normalized.startswith(greet) for greet in greetings)


def build_prompt(history, products):
    chat = "\n".join(
        [f"{turn['role'].capitalize()}: {turn['content']}" for turn in history]
    )
    prods = "\n".join(
        [
            f"- {p['name']} (${p['price']})\n  {p['description'][:220]}..."
            for p in products
        ]
    )
    return (
        "You are a luxury fashion sales consultant. "
        "Act warm, empathetic, and proactive in finding the perfect fit, "
        "only recommending from the provided products.\n\n"
        f"Conversation so far:\n{chat}\n\n"
        "if the conversation history is not relevant dont use it.\n\n"
        f"Products to recommend from:\n{prods}\n\n"
        "Respond naturally, build on the conversation context, and explain why the product(s) "
        "fit the customer's needs."
        " If the user asks for something not in the product list, "
        "politely explain that you can only recommend from the provided products.\n\n"
    )


def gemini_chat_completion(prompt):
    try:
        logger.debug(f"Sending prompt to Gemini: {prompt[:200]}...")
        model = genai.GenerativeModel(GENAI_CHAT_MODEL)
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                candidate_count=1,
                temperature=0.7,
                top_p=0.95,
                max_output_tokens=500,
            ),
        )
        logger.debug(f"Gemini response: {response.text[:200]}...")
        return response.text.strip()
    except Exception as e:
        logger.error(f"Error in gemini_chat_completion: {type(e).__name__}: {str(e)}")
        raise


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        user_id = data.get("user_id", "default")
        user_msg = data.get("message", "")
        logger.info(f"Received message from user {user_id}: {user_msg}")
        history = get_chat_history(user_id)
        history.append({"role": "user", "content": user_msg})
        if is_greeting(user_msg):
            gemini_text = "Hello! 👋 Welcome to Luxe Fashion. If you’d like a personalized recommendation or have any questions about our premium collection, just let me know what you’re looking for!"
            history.append({"role": "assistant", "content": gemini_text})
            save_chat_history(user_id, history)
            return jsonify({"result": gemini_text, "products": [], "history": history})
        prods = semantic_search(user_msg, k=2)
        logger.info(f"Found {len(prods)} products for query")
        prompt = build_prompt(history, prods)
        try:
            gemini_text = gemini_chat_completion(prompt)
        except Exception as e:
            logger.error(f"Gemini API error: {type(e).__name__}: {str(e)}")
            gemini_text = f"I'm sorry, I'm having trouble generating a response right now. Error: {str(e)}"
        history.append({"role": "assistant", "content": gemini_text})
        save_chat_history(user_id, history)
        product_cards = [
            {
                "name": p["name"],
                "image": p["images"][0] if p.get("images") else "",
                "link": f"/product/{p['id']}",
            }
            for p in prods
        ]
        return jsonify(
            {"result": gemini_text, "products": product_cards, "history": history}
        )
    except Exception as e:
        logger.error(f"Error in chat endpoint: {type(e).__name__}: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@app.route("/health", methods=["GET"])
def health_check():
    status = {
        "api_key_configured": bool(GENAI_API_KEY),
        "products_loaded": len(products) > 0,
        "faiss_index_loaded": index is not None,
        "embedder_loaded": embedder is not None,
    }
    return jsonify(status)


if __name__ == "__main__":
    app.run(debug=True)
