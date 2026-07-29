import re

with open('/home/rr/.gemini/antigravity-cli/brain/2322a466-8d78-4c8e-9fa6-db2118fd0faa/.system_generated/steps/542/content.md', 'r') as f:
    text = f.read()

# Extract all string literals from the HTML
strings = re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', text)

for s in set(strings):
    # Only print strings that look like sentences/paragraphs (long, contains spaces, doesn't contain weird characters)
    if len(s) > 100 and ' ' in s and not s.startswith('https://') and '<' not in s and '{' not in s:
        # Decode some basic escapes
        s = s.replace('\\n', ' ').replace('\\"', '"').replace('\\u003c', '<').replace('\\u003e', '>')
        if '<' not in s: # skip html fragments
            print(s)
