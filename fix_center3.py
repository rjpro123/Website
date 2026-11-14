import pathlib
import re

p = pathlib.Path(r"D:\Website\styles.css")
s = p.read_text(encoding="utf-8")

# We want to keep only the first .wrapwide rule with padding-inline:18px
# and remove any other .wrapwide rules

# Find all .wrapwide positions
positions = [m.start() for m in re.finditer(r'\.wrapwide\{', s)]

if len(positions) >= 1:
    # Keep the first one, remove all others
    # The first rule starts at positions[0]
    # We need to remove rules at positions[1], positions[2], etc.
    
    # Build the new CSS by keeping only the first wrapwide rule
    # and removing the others
    
    # Strategy: split the CSS into lines, and keep only the first wrapwide rule
    lines = s.split('\n')
    new_lines = []
    in_first_wrapwide = False
    wrapwide_count = 0
    
    for line in lines:
        if '.wrapwide{' in line:
            wrapwide_count += 1
            if wrapwide_count == 1:
                in_first_wrapwide = True
                new_lines.append(line)
            else:
                # Skip this and following lines until we hit a new major selector
                # Actually, let's just skip lines until we find a major selector pattern
                # For now, just skip this line
                continue
        elif in_first_wrapwide:
            # We're inside the first wrapwide block
            # Check if this line closes the block
            if '}' in line and not line.strip().startswith('//'):
                # This might be the closing brace
                # Check if the next non-empty line is a new selector
                in_first_wrapwide = False
                new_lines.append(line)
            else:
                # Skip lines inside the first wrapwide (shouldn't have many since it's simple)
                continue
        else:
            new_lines.append(line)
    
    s = '\n'.join(new_lines)
    
    # Also do a simple regex replacement as fallback
    # Remove any .wrapwide{ that's not the first one
    # Actually, let's just do a direct regex approach
    
    # Remove any .wrapwide that's not at the first position
    # We'll replace all wrapwide rules and then re-add only the first one
    s = re.sub(r'\.wrapwide\{[^}]*\}', '', s)  # remove all wrapwide rules
    
    # Now add back only the first one at the appropriate position
    # The first rule was: .wrapwide{width:min(960px,100%);margin-inline:auto;padding-inline:18px}
    # But we need to find where to insert it - ideally near the top of the CSS
    # For now, just add it at the beginning of the body-related rules
    
    # Actually, let's just add it simply
    first_wrap = '.wrapwide{width:min(960px,100%);margin-inline:auto;padding-inline:18px}'
    # Insert after the body rules or at a logical place
    # Let's just prepend it if it's not there
    if '.wrapwide{' not in s:
        s = first_wrap + '\n\n' + s
    
    p.write_text(s, encoding="utf-8")
    print("Cleaned up wrapwide rules - kept only first one")
else:
    print("No wrapwide rules found")

# Version bump
s = re.sub(r'\?v=\d+', '?v=63', s)
p.write_text(s, encoding="utf-8")
print(f"styles.css: v=63")
print(f"braces: {s.count('{')} / {s.count('}')}")