import os

with open('D:/Website/index.html', 'r') as f:
    c = f.read()

# Replace the formsubmit action URL
old_action = 'action="https://formsubmit.co/rileyhutchins12@gmail.com"'
new_action = 'action="https://formsubmit.co/'

c = c.replace(old_action, new_action)

with open('D:/Website/index.html', 'w') as f:
    f.write(c)

print("FormSubmit action URL updated to blank (will use default from FormSubmit settings)")