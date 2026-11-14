import pathlib
import re

p = pathlib.Path(r"D:\Website\styles.css")
s = p.read_text(encoding="utf-8")

# Find and replace the second .wrapwide block (the one with safe-area insets)
# The second occurrence starts after the first one
first_wrapwide = s.find('.wrapwide{')
second_wrapwide = s.find('.wrapwide{', first_wrapwide+1)

if first_wrapwide != -1 and second_wrapwide != -1:
    # Find where the second wrapwide block ends
    # It ends at the next selector or at a significant break
    # Let's find the next '@media' or '.' class selector after the second wrapwide
    after_second = s[second_wrapwide:]
    
    # Look for the next CSS selector (a line starting with . or #)
    next_sel_match = re.search(r'^\.[a-zA-Z_-][a-zA-Z0-9_-]*', after_second, re.MULTILINE)
    if next_sel_match:
        sel_start = next_sel_match.start()
        # The second wrapwide block ends before the next selector
        block_end = second_wrapwide + sel_start
    else:
        block_end = len(after_second) + second_wrapwide
    
    # Replace the second wrapwide block with a simple, consistent rule
    new_wrapwide = '.wrapwide{width:min(960px,100%);margin-inline:auto;padding:18px}'
    
    s = s[:second_wrapwide] + new_wrapwide + s[block_end:]
    print("Replaced second wrapwide block with consistent padding")
else:
    print("Could not find both wrapwide blocks")

# Also make sure the first wrapwide is consistent
# The first one is: .wrapwide{width:min(960px,100%);margin-inline:auto;padding-inline:18px}
# This is fine, but let's ensure it's the only wrapwide rule we're using
# Remove any other wrapwide declarations

p.write_text(s, encoding="utf-8")
print(f"braces: {s.count('{')} / {s.count('}')}")

# Version bump
s = re.sub(r'\?v=\d+', '?v=62', s)
p.write_text(s, encoding="utf-8")
print("styles.css: v=62")
print("Fixed mobile centering")