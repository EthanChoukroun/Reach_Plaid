from flask import Flask, jsonify


app = Flask(__name__)

@app.route('/smart_budget', methods=['GET'])
def expose_endpoint():
    return jsonify({
       "smart_budget": 40,
       "updated": False,
       "spending_status": 2
       })

@app.route('/ref_status', methods=['GET'])
def expose_ref_status():
   return jsonify({
      'first_ref_status': 'done',
      'second_ref_status': 'done'
   })

@app.route('/initial_status', methods=['GET'])
def expose_initial_status():
   return jsonify({
      'saving_predictions': 5250,
      'saving_rate_increase': 3
   })
    
if __name__ == '__main__':
  print("__main__")
  app.run(host='0.0.0.0', port=5002, debug=True)