import pathlib
import re

p = pathlib.Path(r"D:\Website\index.html")
s = p.read_text(encoding="utf-8")

# Update the quicklink to use a placeholder
old_quicklink = '''<div class="quicklink">
  <p>Email for quotes: <span class="copyemail" onclick="copyEmail(this);return false;">rileyhutchins12@gmail.com</span> <small>(click to copy)</small></p>
</div>'''

new_quicklink = '''<div class="quicklink">
  <p>Email for quotes: <span class="copyemail" onclick="copyEmail(this);return false;">[Email will be provided when site is live]</span> <small>(click to copy)</small></p>
</div>'''

s = s.replace(old_quicklink, new_quicklink)
p.write_text(s, encoding="utf-8")
print("index.html: quicklink placeholder updated")

# Version bump
s = re.sub(r'\?v=\d+', '?v=65', s)
p.write_text(s, encoding="utf-8")
print("index.html: v=65")