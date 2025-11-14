from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/', methods=['GET'])
def home():
    return "AI Image Editor API is running!"

@app.route('/edit', methods=['POST'])
def process_image():
    # Bu kısım daha sonra resim işleme ve AI kodu ile doldurulacak

    # Geçici yanıt
    return jsonify({
        "status": "success",
        "message": "Image received and ready for AI processing."
    })

if __name__ == '__main__':
    # Geliştirme için basit bir sunucu başlatma
    app.run(debug=True)
