import os, re

with open('D:/Website/index.html', 'r') as f:
    c = f.read()

# Find Patrick Glynn line and add email after it
idx = c.find('Patrick Glynn</p>')
if idx != -1:
    email_line = '<p class="footline">Contact: rileyhutchins12@gmail.com</p>'
    # Build new content
    new_c = c[:idx+len('Patrick Glynn</p>')] + email_line + c[idx+len('Patrick Glynn</p>'):]
    with open('D:/Website/index.html', 'w') as f:
        f.write(new_c)
    print('Done - email line added')
else:
    print('Patrick Glynn not found')
"