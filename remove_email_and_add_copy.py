import pathlib
import re

# 1. Update email.js - replace the email with a placeholder
p = pathlib.Path(r"D:\Website\email.js")
s = p.read_text(encoding="utf-8")

# Replace the email with a placeholder
s = s.replace(
    'var EMAIL = "rileyhutchins12@gmail.com";',
    'var EMAIL = "";  // Email will be set when site is ready for publish'
)
# Also update the description
s = s.replace(
    'var MAX_FILES = 5;',
    'var MAX_FILES = 5;\n  // FormSubmit will be configured when site goes live'
)
p.write_text(s, encoding="utf-8")
print("email.js: email placeholder added")

# 2. Update index.html - remove the email reference from the form
p = pathlib.Path(r"D:\Website\index.html")
s = p.read_text(encoding="utf-8")

# Find and replace any email references in the form
# Look for the email input placeholder or any email-related text
# The form has an email field - we'll just clear the placeholder
s = re.sub(r'Your email.*?example@', 'Your email', s)  # clean up any example text

# Add "Under Construction" quick link section after the form or in the HUD
# Let's add a quick link at the bottom of the HUD or near the nav
quicklink_html = '''

<div class="quicklink">
  <p>Email for quotes: <span class="copyemail" onclick="copyEmail(this);return false;">rileyhutchins12@gmail.com</span> <small>(click to copy)</small></p>
</div>'''

# Insert after the .shhud or before the pagehead
# Let's insert it after the pagehead but before the shooter
insert_pos = s.find('</header>')
if insert_pos != -1:
    s = s[:insert_pos] + quicklink_html + s[insert_pos:]

# Remove v= and bump version
s = re.sub(r'\?v=\d+', '?v=64', s)
p.write_text(s, encoding="utf-8")
print("index.html: quick link added, v=64")

# 3. Add the copy function - we need to add it to the script or inline
# Let's add it inline in the HTML
copy_script = '<script>function copyEmail(el){ navigator.clipboard.writeText(el.dataset.email || el.textContent); el.select(); el.setSelectionRange(0,9999); }</script>'
# Insert before closing </body>
body_close = s.rfind('</body>')
if body_close != -1:
    s = s[:body_close] + copy_script + s[body_close:]
    print("index.html: copy script added")

p.write_text(s, encoding="utf-8")
print("index.html: copy script added")

print("\nDone - email placeholder added, quick link ready for when email is provided")