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
def submit_code():
    try:
        if request.is_json:
            data = request.get_json()
            code = data.get('code')
        elif request.content_type == 'application/x-www-form-urlencoded':
            data = request.form
            code = data.get('code')
        else:
            return jsonify({"error": "Invalid content type, expecting application/json or application/x-www-form-urlencoded"}), 400
        
        if not code:
            return jsonify({"error": "No code provided"}), 400

        print(f"Received code: {code}")
        return jsonify({"response": 1}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/referral_code_confirmation', methods=["GET"])
def referral_code_confirmation():
    override = request.args.get('override', type=int)
    if override == 0:
        return jsonify({'Referral_code_confirmation': 0})
    return jsonify({'Referral_code_confirmation': 1})

@app.route('/user_name', methods=['POST'])
def user_name():
    try:
        if request.is_json:
            data = request.get_json()
            code = data.get('code')
        elif request.content_type == 'application/x-www-form-urlencoded':
            data = request.form
            code = data.get('code')
        else:
            return jsonify({"error": "Invalid content type, expecting application/json or application/x-www-form-urlencoded"}), 400
        
        if not code:
            return jsonify({"error": "No code provided"}), 400

        print(f"Received code: {code}")
        return jsonify({"response": 1}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500
    
@app.route('/saving_capacity', methods=['POST'])
def saving_capacity():
    try:
        # Ensure that the request contains JSON data
        if request.is_json:
            data = request.get_json()
            code = data.get('code')
            if not code:
                return jsonify({"error": "No saving provided"}), 400
        elif request.content_type == 'application/x-www-form-urlencoded':
            data = request.form
            code = data.get('code')
            if not code:
                return jsonify({"error": "No saving provided"}), 400
            print(f"Received user_name: {code}")
            return jsonify({"message": "saving capacity received and printed to console"}), 200
        else:
            return jsonify({"error": "Invalid content type, expecting application/json"}), 400
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/plaid_status', methods=["GET"])
def plaid_status():
   return jsonify({'plaid_status': 1})

@app.route('/get_ref_code', methods=["GET"])
def get_ref_code():
   return jsonify({'Code_referral': 1717})

@app.route('/user_behavior', methods=["GET"])
def user_behavior():
   return jsonify({'user_behavior': 1})

@app.route('/thirty_saving_prog', methods=["GET"])
def thirty_saving_prog():
   return jsonify({'Thirsty_Days_savings_Progression': 56})

@app.route('/thirty_saving', methods=["GET"])
def thirty_saving():
   return jsonify({'Thirsty_Days_Savings': 5600})

@app.route('/list_goals', methods=['GET'])
def list_goal():
    return jsonify({'List_of_goals': ['1', '2']})

@app.route('/new_goal', methods=['POST'])
def new_goal():
    try:
        # Ensure that the request contains JSON data
        if request.is_json:
            data = request.get_json()
            code_name = data.get('code_name')
            code_eta = data.get('code_eta')
            code_amount = data.get('code_amount')
        elif request.content_type == 'application/x-www-form-urlencoded':
            data = request.form
            code_name = data.get('code_name')
            code_eta = data.get('code_eta')
            code_amount = data.get('code_amount')
        else:
            return jsonify({"error": "Invalid content type, expecting application/json"}), 400
        if not code_name:
            return jsonify({"error": "No saving provided"}), 400
        elif not code_eta:
            return jsonify({'eta_response': 'Your ETA is 2025-01-01'}), 200
        print(f"Received user_name: {code_name}")
        return jsonify({"response": "goal received and printed to console"}), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500
    
@app.route('/check_eta', methods=['GET'])
def check_eta():
    return jsonify({'ETA_format': 1})

@app.route('/check_goal', methods=['GET'])
def check_goal():
  return jsonify({'Savings_Goal_ETA_Check': 1})
  
@app.route('/get_eta', methods=['GET'])
def get_eta():
    return jsonify({"Savings_Goal_Revised_ETA": "2025-01-01"})
          
@app.route('/cancel_goal', methods=['POST'])
def cancel_goal():
  try:
          # Ensure that the request contains JSON data
      if request.is_json:
          data = request.get_json()
          code = data.get('code')
          if not code:
              return jsonify({"error": "No goal provided"}), 400
          print(f"Received user_name: {code}")
          return jsonify({"confirmation": 1}), 200
      else:
          return jsonify({"error": "Invalid content type, expecting application/json"}), 400
  except Exception as e:
      print(f"Error: {e}")
      return jsonify({"error": str(e)})

@app.route('/delete_account', methods=['POST'])
def delete_account():
  return jsonify({'Delete_Account': 1})

@app.route('/weekly_audit', methods=['GET'])
def weekly_audit():
    return jsonify({'Weekly_Audit': 500})

if __name__ == '__main__':
  print("__main__")
  app.run(host='0.0.0.0', port=5002, debug=True)