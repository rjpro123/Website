import urllib.request
import re

pages = ['index.html', 'services.html', 'gallery.html', 'staff.html', 'game.html', 'thanks.html']
for p in pages:
    try:
        r = urllib.request.urlopen(f'https://rjpro123.github.io/Website/{p}')
        c = r.read().decode()
        # Check for hyphens in class/id attributes (except ARIA)
        classes = re.findall(r'([a-zA-Z0-9_-]+)=["\']?([^\"\']*)["\']?', c)
        hyphen_issues = []
        for attr, val in classes:
            if '-' in attr and not attr.startswith('aria-') and not attr.startswith('data-'):
                hyphen_issues.append(f'{attr}="{val}"')
        # Check for experimental references
        has_exp = 'experimental' in c.lower()
        # Check for proper viewport
        has_viewport = 'viewport' in c.lower()
        # Check has title
        has_title = '<title>' in c
        # Check for nohyphens text content
        no_hyphen_text = not re.search(r'-[a-z]', c.lower())
        status = 'OK' if not hyphen_issues and not has_exp else 'ISSUES'
        print(f'{p}: hyphen-non-aria={hyphen_issues[:3] if hyphen_issues else "none"} exp={has_exp} title={has_title} viewport={has_viewport} no-hyphen-text={no_hyphen_text} | {status}')
    except Exception as e:
        print(f'{p}: ERROR {e}')