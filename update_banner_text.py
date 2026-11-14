import pathlib
import re

# Update the banner text on all pages to explicitly say "Under Construction"
files = ["index.html", "services.html", "gallery.html", "staff.html", "thanks.html"]

# New banner HTML with explicit "Under Construction" text
new_banner = '''<div class="soonbanner">
  <span class="soondot" aria-hidden="true"></span>
  <p class="soontext"><b>Under Construction</b>&nbsp;&middot;&nbsp;We are building a better experience for you. Book a quote when ready.</p>
</div>'''

for name in files:
    fp = pathlib.Path(r"D:\Website") / name
    t = fp.read_text(encoding="utf-8")
    
    # Replace the old banner if present, otherwise insert
    if "soonbanner" in t:
        t = t.replace(
            '''<div class="soonbanner">
  <span class="soondot" aria-hidden="true"></span>
  <p class="soontext"><b>Opening soon</b>&nbsp;&middot;&nbsp;Quote bookings open shortly</p>
</div>''',
            new_banner
        )
    
    # Bump version
    t = re.sub(r"\?v=\d+", "?v=60", t)
    fp.write_text(t, encoding="utf-8")
    print(name + ": banner updated to 'Under Construction', v=60")

# Also update CSS to keep it consistent (no changes needed, just the text)
print("\nAll pages now show: 'Under Construction' banner")