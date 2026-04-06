import requests

url = "http://localhost:8000/auth/login"
headers = {"Origin": "http://localhost:5176"}
try:
    print("Testing OPTIONS...")
    options_rsp = requests.options(url, headers=headers)
    print("OPTIONS status:", options_rsp.status_code)
    print("OPTIONS headers:", dict(options_rsp.headers))
    
    print("\nTesting POST...")
    post_rsp = requests.post(url, json={"role": "citizen", "email": "santhya032006@gmail.com", "password": "123"}, headers=headers)
    print("POST status:", post_rsp.status_code)
    print("POST response:", post_rsp.text)
    print("POST headers:", dict(post_rsp.headers))
except Exception as e:
    print("ERROR:", e)
