import pathlib
import re

p = pathlib.Path(r"D:\Website\index.html")
s = p.read_text(encoding="utf-8")

# Update the quicklink section with placeholder email
old_quicklink = '''<div class="quicklink">
  <p>Email for quotes: <span class="copyemail" onclick="copyEmail(this);return false;">[Email will be provided when site is live]</span> <small>(click to copy)</small></p>
</div>'''

new_quicklink = '''<div class="quicklink">
  <p>Email for quotes: <span class="copyemail" onclick="copyEmail(this);return false;">[Email placeholder - will be provided when live]</span> <small>(click to copy)</small></p>
</div>'''

s = s.replace(old_quicklink, new_quicklink)
p.write_text(s, encoding="utf-8")
print("index.html: quicklink email placeholder updated")

# Version bump
s = re.sub(r'\?v=\d+', '?v=66', s)
p.write_text(s, encoding="utf-8")
print("index.html: v=66")