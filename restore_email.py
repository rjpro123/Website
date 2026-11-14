import subprocess

# 1. Update email.js - set the email to rileyhutchins12@gmail.com
subprocess.run(
    ['python', '-c',
     'with open("D:/Website/email.js", "r") as f:\n'
     '    c = f.read()\n'
     'c = c.replace("var EMAIL = \"\";  // Email will be set when site is ready for publish",\n'
     '          "var EMAIL = \"rileyhutchins12@gmail.com\";")\n'
     'with open("D:/Website/email.js", "w") as f:\n'
     '    f.write(c)'),
     capture_output=True, text=True, cwd='D:/Website')
print('email.js updated')

# 2. Update index.html - change FormSubmit action to use the email
subprocess.run(
    ['python', '-c',
     'with open("D:/Website/index.html", "r") as f:\n'
     '    c = f.read()\n'
     'c = c.replace("action=\\"https://formsubmit.co/\\"',\n'
     '          "action=\\"https://formsubmit.co/rileyhutchins12@gmail.com\\"")\n'
     'with open("D:/Website/index.html", "w") as f:\n'
     '    f.write(c)'),
     capture_output=True, text=True, cwd='D:/Website')
print('index.html FormSubmit action updated')

# 3. Remove the placeholder quicklink section since we now have the real email
subprocess.run(
    ['python', '-c',
     'with open("D:/Website/index.html", "r") as f:\n'
     '    c = f.read()\n'
     '# Remove the quicklink section that had placeholder text\n'
     'old = \"\"\"<div class=\"quicklink\">\\n  <p>Email for quotes: <span class=\"copyemail\" onclick=\"copyEmail(this);return false;\">[Email placeholder - will be provided when live]</span> <small>(click to copy)</small></p>\\n</div>\"\"\"\n'
     'c = c.replace(old, \"\")\n'
     'with open("D:/Website/index.html", "w") as f:\n'
     '    f.write(c)'),
     capture_output=True, text=True, cwd='D:/Website')
print('index.html quicklink removed')

# 4. Add the real email in a suitable place - add it after the form or in the footer area
# Actually, let's just add a simple line showing the email
subprocess.run(
    ['python', '-c',
     'with open("D:/Website/index.html", "r") as f:\n'
     '    c = f.read()\n'
     '# Add email display below the form or in the footer area\n'
     'email_line = \"\\n<p class=\"footline\">Contact: rileyhutchins12@gmail.com</p>\"\n'
     'if \"footline\" in c:\n'
     '    # Add after the existing footline\n'
     '    c = c.replace(\"<p class=\"footline\">Patrick Glynn</p>\",\n'
     '              \"<p class=\"footline\">Patrick Glynn</p>\" + email_line)\n'
     'with open("D:/Website/index.html", "w") as f:\n'
     '    f.write(c)'),
     capture_output=True, text=True, cwd='D:/Website')
print('email display added to index.html')

# 5. Commit and push all changes
subprocess.run(['git', 'add', '-A'], cwd='D:/Website')
subprocess.run(['git', 'commit', '-q', '-m', 'Restore FormSubmit email to rileyhutchins12@gmail.com'], cwd='D:/Website')
subprocess.run(['git', 'push', 'origin', 'main'], cwd='D:/Website')
print('All changes committed and pushed')
"