import os

# 1. Update email.js - set the email to rileyhutchins12@gmail.com
with open('D:/Website/email.js', 'r') as f:
    c = f.read()
print('Before email.js:', c[:80])
c = c.replace('var EMAIL = "";  // Email will be set when site is ready for publish', 
              'var EMAIL = "rileyhutchins12@gmail.com";')
print('After email.js:', c[:80])
with open('D:/Website/email.js', 'w') as f:
    f.write(c)
print('email.js saved')

# 2. Update index.html - change FormSubmit action to use the email
with open('D:/Website/index.html', 'r') as f:
    c = f.read()
print('Before index.html FormSubmit change')
# Replace the formsubmit action URL
old_action = 'action="https://formsubmit.co/"'
new_action = 'action="https://formsubmit.co/rileyhutchins12@gmail.com"'
print('Looking for:', repr(old_action))
print('In text:', old_action in c)
c = c.replace(old_action, new_action)
print('After index.html FormSubmit change')

# Also remove the placeholder quicklink if it exists
old_quicklink = '''<div class="quicklink">
  <p>Email for quotes: <span class="copyemail" onclick="copyEmail(this);return false;">[Email placeholder - will be provided when live]</span> <small>(click to copy)</small></p>
</div>'''
if old_quicklink in c:
    c = c.replace(old_quicklink, '')
    print('Removed placeholder quicklink')

# Add the email display in the footer area
email_line = '\n<p class="footline">Contact: rileyhutchins12@gmail.com</p>'
# Add after the existing footline
c = c.replace('<p class="footline">Patrick Glynn</p>', 
              '<p class="footline">Patrick Glynn</p>' + email_line)
with open('D:/Website/index.html', 'w') as f:
    f.write(c)
print('index.html saved')

# 5. Commit and push all changes
import subprocess
subprocess.run(['git', 'add', '-A'], cwd='D:/Website')
subprocess.run(['git', 'commit', '-q', '-m', 'Restore email to rileyhutchins12@gmail.com'], cwd='D:/Website')
subprocess.run(['git', 'push', 'origin', 'main'], cwd='D:/Website')
print('All changes committed and pushed')
"