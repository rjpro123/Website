import subprocess

# Read the file
with open('D:/Website/index.html', 'r') as f:
    c = f.read()

# Replace ALL occurrences of the formsubmit action
old = 'action="https://formsubmit.co/rileyhutchins12@gmail.com"'
new = 'action="https://formsubmit.co/'

# Do the replacement
new_c = c.replace(old, new)

# Also check for any other variations
old2 = "action='https://formsubmit.co/rileyhutchins12@gmail.com'"
new2 = "action='https://formsubmit.co/"

if old2 in c:
    new_c = c.replace(old2, new2)

# Write back
with open('D:/Website/index.html', 'w') as f:
    f.write(new_c)

print("FormSubmit action URLs updated")
"