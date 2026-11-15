import subprocess

subprocess.run(['git', 'add', '-A'], cwd='D:/Website')
subprocess.run(['git', 'commit', '-q', '-m', 'Add professional manual PDF to gallery with full screen viewer'], cwd='D:/Website')
subprocess.run(['git', 'push', 'origin', 'main'], cwd='D:/Website')
print('deployed')