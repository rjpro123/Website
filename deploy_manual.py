import subprocess

subprocess.run(['git', 'add', '-A'], cwd='D:/Website')
subprocess.run(['git', 'commit', '-q', '-m', 'Embed manual reader inline on gallery page as page images'], cwd='D:/Website')
subprocess.run(['git', 'push', 'origin', 'main'], cwd='D:/Website')
print('deployed')