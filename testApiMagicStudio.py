import requests

url = "https://api.magicstudio.com/magiceraser/erase"

payload={'filename': 'filename.jpg'}
files=[
  ('image_file',('./model/image12.jpg',open('./model/image12.jpg','rb'))),
  ('mask_file',('./model/mask12.jpg',open('./model/mask12.jpg','rb')))
]
headers = {
  'accessToken': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjbGllbnRfaWQiOiJOYUo1Y0pBR1otclNMMGJHZEVwZW1BOUdiQzVfeVlXXzN6NkNhak5XQmJzIiwiZXhwIjoxNjk2NTYxOTk3LCJhcHBfbmFtZSI6IjUxMDM0NSIsIm1ldGFkYXRhIjpudWxsLCJncmFudF90eXBlIjoiY3JlZCJ9.v5tNnX_T5-ba1WurAWsM2_NBUbvLG29fE45EHYQj14U'
}

response = requests.request("POST", url, headers=headers, data=payload, files=files)

print(response.text)
