import urllib.request
import re

pages = ['index.html', 'services.html', 'gallery.html', 'staff.html', 'game.html', 'thanks.html']
for p in pages:
    try:
        r = urllib.request.urlopen(f'https://rjpro123.github.io/Website/{p}')
        c = r.read().decode()
        title_start = c.find('<title>') + 7
        title_end = c.find('</title>')
        title = c[title_start:title_end] if title_start > 6 and title_end > title_start else 'NO TITLE'
        classes = re.findall(r'class="([^"]+)"', c)
        hyphen_classes = []
        for cls in classes:
            for part in cls.split():
                if '-' in part and not part.startswith('aria-') and not part.startswith('data-'):
                    hyphen_classes.append(part)
        status = 'OK' if not hyphen_classes else f'ISSUES({len(hyphen_classes)} hyphen classes)'
        print(f'{p}: title="{title}" | {status}')
    except Exception as e:
        print(f'{p}: ERROR {e}')

# Check game.html specific things
print("\n--- game.html specifics ---")
try:
    r = urllib.request.urlopen('https://rjpro123.github.io/Website/game.html')
    c = r.read().decode()
    checks = {
        'tyscene canvas': 'tyscene' in c,
        'goal bar': 'tygoalfill' in c,
        'scene painted': 'drawScene' in c,
        'popCoin': 'popCoin' in c,
        'shop icons': 'tyshopicon' in c,
        'no experimental': 'experimental' not in c.lower(),
        'no hyphen-ids': len(re.findall(r'[a-z]+-[a-z]+', c.lower().replace('stroke-', ''))) == 0,
    }
    for k, v in checks.items():
        print(f"  {k}: {'OK' if v else 'FAIL'}")
except Exception as e:
    print(f"  error: {e}")

# Check staff.html specific
print("\n--- staff.html specifics ---")
try:
    r = urllib.request.urlopen('https://rjpro123.github.io/Website/staff.html')
    c = r.read().decode()
    hutch_refs = c.count('Hutch') + c.count('hutch')
    pg_refs = c.count('Patrick') + c.count('patrick')
    has_title = '<title>' in c
    print(f"  Patrick refs: {pg_refs}")
    print(f"  Hutch refs: {hutch_refs} (should be 0)")
    print(f"  has title: {has_title}")
except Exception as e:
    print(f"  error: {e}")