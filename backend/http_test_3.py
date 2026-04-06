import urllib.request
import json
import traceback

url = "http://localhost:8888/auth/login"
try:
    print("Testing OPTIONS...")
    req = urllib.request.Request(url, method="OPTIONS", headers={"Origin": "http://localhost:5176", "Access-Control-Request-Method": "POST"})
    with urllib.request.urlopen(req) as f:
        print("OPTIONS status:", f.status)
        print("OPTIONS headers:", f.getheaders())
except urllib.error.HTTPError as e:
    print("OPTIONS HTTP Error:", e.code, e.headers)

try:
    print("\nTesting POST...")
    data = json.dumps({"role": "citizen", "email": "santhya032006@gmail.com", "password": "123"}).encode()
    req = urllib.request.Request(url, data=data, method="POST", headers={"Origin": "http://localhost:5176", "Content-Type": "application/json"})
    with urllib.request.urlopen(req) as f:
        print("POST status:", f.status)
        print("POST headers:", f.getheaders())
        print("POST body:", f.read().decode())
except urllib.error.HTTPError as e:
    print("POST HTTP Error:", e.code, e.headers, e.read().decode())
except Exception as e:
    traceback.print_exc()
