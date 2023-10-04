import requests

r = requests.post('https://clipdrop-api.co/cleanup/v1',
  files = {
    'image_file': ('./model/image6.jpg','image/jpeg'),
    'mask_file': ('./model/mask6.jpg', 'image/png')
    },
  headers = { 'x-api-key': '86c3b543e597fb7bef241cc4e4cd876a50a6447d094fc50dc39c12413bb9c8af60956a093fbdd797363b81b354cf0d42'}
)
if (r.ok):
  print(response.text)
else:
  r.raise_for_status()

