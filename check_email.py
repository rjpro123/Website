import urllib.request
import re

# Check email.html content
try:
    r = urllib.request.urlopen('https://rjpro123.github.io/Website/email.html')
    c = r.read().decode()
    print("email.html first 500 chars:")
    print(c[:500])
except Exception as e:
    print(f"email.html error: {e}")

# Check if email.html is linked from any nav
print("\nChecking if email.html is linked from nav tabs:")
for p in ['index.html', 'services.html', 'gallery.html', 'staff.html', 'game.html', 'thanks.html']:
    try:
        r = urllib.request.urlopen(f'https://rjpro123.github.io/Website/{p}')
        c = r.read().decode()
        if 'email.html' in c or 'email' in c.lower():
            # Show context around mentions
            idx = c.lower().find('email')
            context = c[max(0,idx-30):idx+30]
            print(f"  {p}: ...{context}...")
    except Exception as e:
        pass

# Check Files/ folder
print("\nFiles/ folder contents:")
import os
try:
    for f in sorted(os.listdir('D:/Website/Files/')):
        print(f"  {f}")
except Exception as e:
    print(f"  Files/ error: {e}")

# Check local email.js
print("\nlocal email.js first 300 chars:")
try:
    with open('D:/Website/email.js', 'r') as f:
        print(f.read()[:300])
except Exception as e:
    print(f"  error: {e}")