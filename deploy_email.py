import subprocess

r = subprocess.run(['git', 'add', '-A'], capture_output=True, text=True, cwd='D:/Website')
print('git add:', r.returncode)

r2 = subprocess.run(['git', 'commit', '-q', '-m', 'Replace FormSubmit email to rileyhutchins12@gmail.com'], capture_output=True, text=True, cwd='D:/Website')
print('git commit:', r2.returncode)

r3 = subprocess.run(['git', 'push', 'origin', 'main'], capture_output=True, text=True, cwd='D:/Website')
print('git push:', r3.returncode)
if r3.stderr:
    print('stderr:', r3.stderr[:200])