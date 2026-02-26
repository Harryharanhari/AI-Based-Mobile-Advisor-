from flask import Flask, render_template, request, jsonify
from recommendation_engine import RecommendationEngine
from api_client import MobileApiClient

app = Flask(__name__)
api_client = MobileApiClient()
recommender = RecommendationEngine()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/recommend', methods=['POST'])
def recommend():
    user_preferences = request.json
    
    # Fetch real-time mobile data
    mobiles = api_client.get_mobiles()
    
    # Process recommendations
    results = recommender.get_recommendations(mobiles, user_preferences)
    
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
