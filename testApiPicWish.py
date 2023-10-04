import requests

response = requests.request(
"POST", 
"https://techhk.aoscdn.com/api/tasks/visual/inpaint", 
headers= {'X-API-KEY': 'wx3fdwlu6wk6hjv8j'}, 
data={'sync': '1'}, 
files= {
'image_file': open('./model/image9.jpg', 'rb'),
'mask_file': open('./model/mask9.jpg', 'rb')
})
print(response.text)