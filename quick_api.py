from flask import Flask, jsonify


app = Flask(__name__)

@app.route('/', methods=['GET'])
def expose_endpoint():
    return jsonify({"smart_budget": 40})
    
    
if __name__ == '__main__':
  print("__main__")
  app.run(host='0.0.0.0', port=5002, debug=True)