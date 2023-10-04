import http.client

conn = http.client.HTTPSConnection("api.magicstudio.com")
payload = "{\n    \"client_id\": \"NaJ5cJAGZ-rSL0bGdEpemA9GbC5_yYW_3z6CajNWBbs\",\n    \"client_secret\": \"VXFW6jvAb11zj3_TUcWSsdH1CskKC_CCXervMOmfCws\",\n    \"expiry_days\": 4\n}"
headers = {}
conn.request("POST", "/auth/token", payload, headers)
res = conn.getresponse()
data = res.read()
print(data.decode("utf-8"))
