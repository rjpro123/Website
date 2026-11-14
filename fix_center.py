import pathlib

p = pathlib.Path(r"D:\Website\styles.css")
s = p.read_text(encoding="utf-8")

# Fix: Ensure wrapwide has equal padding for mobile centering
# Replace the conflicting wrapwide rules with a single consistent rule
old1 = '.wrapwide{width:min(960px,100%);margin-inline:auto;padding-inline:18px}'
old2 = '''.wrapwide{
  padding-left:max(18px,env(safe-area-inset-left));
  padding-right:max(18px,env(safe-area-inset-right));
}'''

# Replace both with a simple, consistent rule
new_wrap = '.wrapwide{width:min(960px,100%);margin-inline:auto;padding:18px}'

s = s.replace(old1, new_wrap)
s = s.replace(old2, new_wrap)

# Also ensure body has text-align center for safety on inline elements
if 'body{' in s:
    # Add text-align center if not already there for inline elements
    body_idx = s.find('body{')
    if body_idx != -1:
        body_block_end = s.find('}', body_idx)
        body_block = s[body_idx:body_block_end]
        if 'text-align' not in body_block:
            s = s.replace(body_block, body_block + '\n  text-align:center;')

p.write_text(s, encoding="utf-8")
print("Fixed wrapwide centering and added body text-align:center")
print(f"braces: {s.count('{')} / {s.count('')}")

# Version bump
s = re.sub(r'\?v=\d+', '?v=62', s)
p.write_text(s, encoding="utf-8")
print("styles.css: v=62")