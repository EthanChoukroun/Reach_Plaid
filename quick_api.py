from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/', methods=['GET'])
def get_budget():
    return jsonify({'smart_budget': 40})

if __name__ == '__main__':
    app.run(debug=True, port=3010)
