import urllib.request
import urllib.parse
import json

url = "https://api.fonnte.com/send"
token = "miMYecGgHMbMw3kZPmCM"
target = "TEKNIS PELAYANAN DOKUMEN"

data = urllib.parse.urlencode({
    'target': target,
    'message': 'Test Notifikasi Simpel Momen'
}).encode('utf-8')

req = urllib.request.Request(url, data=data)
req.add_header('Authorization', token)

try:
    with urllib.request.urlopen(req) as response:
        res = response.read().decode('utf-8')
        print("Fonnte Response:", res)
except Exception as e:
    print("Error:", e)
