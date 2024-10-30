from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
import os
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB Configuration
print("Starting")
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
print(MONGO_URI)
client = MongoClient(MONGO_URI)
db = client['onenote_clone']
contents_collection = db['contents']


# Helper function to serialize MongoDB documents
def serialize_doc(doc):
    return {
        'id': str(doc['_id']),
        'title': doc['title'],
        'content': doc['content'],
        'parentId': str(doc['parentId']) if doc.get('parentId') else None
    }

# Routes

@app.route('/api/contents', methods=['GET'])
def get_contents():
    contents = contents_collection.find()
    serialized = [serialize_doc(content) for content in contents]
    return jsonify(serialized), 200

@app.route('/api/contents', methods=['POST'])
def create_content():
    data = request.get_json()
    title = data.get('title')
    parent_id = data.get('parentId')

    if not title:
        return jsonify({'error': 'Title is required'}), 400

    new_content = {
        'title': title,
        'content': '',
        'parentId': ObjectId(parent_id) if parent_id else None
    }
    result = contents_collection.insert_one(new_content)
    created = contents_collection.find_one({'_id': result.inserted_id})
    return jsonify(serialize_doc(created)), 201

@app.route('/api/contents/<id>', methods=['PUT'])
def update_content(id):
    data = request.get_json()
    content = data.get('content', '')

    result = contents_collection.find_one_and_update(
        {'_id': ObjectId(id)},
        {'$set': {'content': content}},
        return_document=True
    )

    if not result:
        return jsonify({'error': 'Content not found'}), 404

    return jsonify(serialize_doc(result)), 200

@app.route('/api/contents/<id>', methods=['DELETE'])
def delete_content(id):
    # Delete child contents first
    contents_collection.delete_many({'parentId': ObjectId(id)})
    # Delete the content itself
    result = contents_collection.delete_one({'_id': ObjectId(id)})

    if result.deleted_count == 0:
        return jsonify({'error': 'Content not found'}), 404

    return jsonify({'message': 'Content deleted'}), 200

if __name__ == '__main__':
    app.run()