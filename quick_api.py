from flask import Flask, jsonify, request

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

@app.route('/referral_code', methods=['POST'])
def referral_code():
    try:
      code = request.get_json()
      if not code:
          return jsonify({"error": "No code provided"}), 400
      print(f"Received code: {code}")
      return jsonify({"message": "Code received and printed to console"}), 200
    except Exception as e:
      print(f"Error: {e}")
      return jsonify({"error": str(e)}), 500

@app.route('/referral_code_confirmation', methods=["GET"])
def referral_code_confirmation():
   return jsonify({'confirmation': 1})

if __name__ == '__main__':
  print("__main__")
  app.run(host='0.0.0.0', port=5002, debug=True)