import requests

url = "http://localhost:5000/api/geocode"
payload = {"location": "Lloret de Mar"}
headers = {"Content-Type": "application/json"}

response = requests.post(url, json=payload, headers=headers)
print(response.json())
