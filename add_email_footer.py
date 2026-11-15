import os

with open('D:/Website/index.html', 'r') as f:
    c = f.read()

old = '<p class="footline">Patrick Glynn</p>'
new = '<p class="footline">Patrick Glynn</p>' + '\n' + '<p class="footline">Contact: rileyhutchins12@gmail.com</p>'

c = c.replace(old, new)

with open('D:/Website/index.html', 'w') as f:
    f.write(c)
print('Done')