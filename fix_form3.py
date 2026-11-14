with open('D:/Website/index.html', 'r') as f:
    c = f.read()
# replace all occurrences of the rileyhutchins form action
c = c.replace('action="https://formsubmit.co/rileyhutchins12@gmail.com"', 'action="https://formsubmit.co/"')
with open('D:/Website/index.html', 'w') as f:
    f.write(c)
print("Done - FormSubmit action URLs updated")