import urllib.request
import re
import os

print("=== CHECKING FOR USELESS/DEPRECATED CODE ===\n")

# 1. Check email.html exists and is used
try:
    r = urllib.request.urlopen('https://rjpro123.github.io/Website/email.html')
    print("email.html: exists on GitHub Pages")
except:
    print("email.html: NOT on GitHub Pages - may need deletion")

# 2. Check transitions.js usage
try:
    r = urllib.request.urlopen('https://rjpro123.github.io/Website/index.html')
    c = r.read().decode()
    has_transitions = 'transitions.js' in c
    print(f"transitions.js referenced: {has_transitions} in index.html")
except:
    pass

# 3. Check script.js usage
try:
    r = urllib.request.urlopen('https://rjpro123.github.io/Website/index.html')
    c = r.read().decode()
    has_scriptjs = 'script.js' in c
    print(f"script.js referenced: {has_scriptjs}")
except:
    pass

# 4. Check for any remaining 'experimental' references in all live HTML
html_files = ['index.html', 'services.html', 'gallery.html', 'staff.html', 'game.html', 'thanks.html']
for p in html_files:
    try:
        r = urllib.request.urlopen(f'https://rjpro123.github.io/Website/{p}')
        c = r.read().decode()
        if 'experimental' in c.lower():
            print(f"WARNING: {p} still contains 'experimental'!")
        else:
            print(f"{p}: no 'experimental' reference - clean")
    except Exception as e:
        print(f"{p}: error checking - {e}")

# 5. Check backup folder contents
print("\n=== BACKUP FOLDER ===")
backup_dir = "D:/Website/backup"
if os.path.exists(backup_dir):
    for f in sorted(os.listdir(backup_dir)):
        print(f"  backup/{f}")
else:
    print("backup/ directory not found")

# 6. Check for old platformer references
print("\n=== OLD PLATFORMER REFERENCES ===")
for p in html_files:
    try:
        r = urllib.request.urlopen(f'https://rjpro123.github.io/Website/{p}')
        c = r.read().decode()
        if 'platformer' in c.lower() or '8 bit' in c.lower() or 'souwest garden run' in c.lower():
            # But check if it's just in a comment or historical reference
            if '/*' not in c or c.count('/*') < 3:
                print(f"WARNING: {p} contains platformer-related text!")
            else:
                print(f"{p}: platformer text likely in comments only")
    except Exception as e:
        print(f"{p}: error - {e}")

# 7. Check CSS for any leftover platformer styles
try:
    r = urllib.request.urlopen('https://rjpro123.github.io/Website/styles.css')
    css = r.read().decode()
    platformer_markers = ['8 bit', 'platformer', 'player', 'canvas game', 'keydown']
    found = [m for m in platformer_markers if m.lower() in css.lower()]
    if found:
        print(f"WARNING: styles.css contains platformer markers: {found}")
    else:
        print("styles.css: no platformer markers found - clean")
except Exception as e:
    print(f"styles.css check error: {e}")

# 8. Check game.js for any leftover platformer code
try:
    r = urllib.request.urlopen('https://rjpro123.github.io/Website/game.js')
    js = r.read().decode()
    platformer_markers = ['8 bit', 'platformer', 'player', 'keydown', 'keypress']
    found = [m for m in platformer_markers if m.lower() in js.lower()]
    if found:
        print(f"WARNING: game.js contains platformer markers: {found}")
    else:
        print("game.js: no platformer markers found - clean")
except Exception as e:
    print(f"game.js check error: {e}")

# 9. Check for any .html files that shouldn't be there
print("\n=== CHECKING ALL REPO FILES ===")
repo_files = [
    '.git', '.gitignore', 'README.md', 'brief.md',
    'assets', 'backup', 'deploy_check.py', 'check_site.py', 'cleanup.py'
]
# List what's in the website root
try:
    r = urllib.request.urlopen('https://rjpro123.github.io/Website/')
    # Can't really list dirs via HTTP, just note
    print("Website root: cannot list directory via HTTP, checking locally instead")
except:
    pass

# 10. Check if there are any empty or nearly empty files
print("\n=== POTENTIALLY USELESS FILES ===")
for f in ['email.html', 'email.js', 'brief.md', 'Files/']:
    try:
        r = urllib.request.urlopen(f'https://rjpro123.github.io/Website/{f}' if f != 'Files/' else 'https://rjpro123.github.io/Website/assets/')
        size = len(r.read()) if f != 'Files/' else 0
        print(f"  {f}: size={size}")
    except:
        print(f"  {f}: not accessible via HTTP")

print("\n=== DONE ===")