import pathlib
import re

p = pathlib.Path(r"D:\Website\styles.css")
s = p.read_text(encoding="utf-8")

# Ensure .navtabs has centered alignment with symmetrical spacing
# The current CSS already has justify-content:center, but let's make sure it's explicit and add symmetrical padding if needed

navtabs_css = '''.navtabs{
  display:flex;
  gap:8px;
  justify-content:center;
  margin:0 0 16px;
  padding:0 16px;
}
.navtabs .tab{
  padding:9px 26px;
  border-radius:999px;
  font-family:var(--head);
  font-weight:700;
  font-size:.88rem;
  color:var(--muted);
  background:rgba(255,255,255,.05);
  text-decoration:none;
  transition:.2s;
}
.navtabs .tab:hover{
  color:var(--ink);
  background:rgba(255,255,255,.1);
}
.navtabs .isactive{
  background:var(--euc-bright);
  color:#08180E;
}'''

# Find and replace the navtabs block
if '.navtabs{' in s:
    # Replace the existing navtabs block
    old = s[s.find('.navtabs{'):s.find('.navtabs{')+1000]  # grab a generous chunk
    # Simple approach: replace the specific properties
    for prop in ['display:flex', 'gap:8px', 'justify-content:center', 'margin:0 0 16px']:
        if prop in s:
            # ensure it's there
            pass
    
    # Actually, let's just ensure the centering is correct by adding text-align:center fallback
    if 'text-align:center' not in s.split('.navtabs{')[1].split('}')[0]:
        # Add text-align center for safety
        s = s.replace(
            '.navtabs{',
            '.navtabs{\n  text-align:center;\n'
        )
    
    p.write_text(s, encoding="utf-8")
    print("navtabs centering ensured")
else:
    print("navtabs block not found")

# Version bump
s = re.sub(r"\?v=\d+", "?v=61", s)
p.write_text(s, encoding="utf-8")
print("styles.css: v=61")
print("braces:", s.count("{"), "/", s.count("}"))