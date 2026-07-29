import re
import json

with open('/home/rr/.gemini/antigravity-cli/brain/2322a466-8d78-4c8e-9fa6-db2118fd0faa/.system_generated/steps/542/content.md', 'r') as f:
    html = f.read()

# Try to find AF_initDataCallback with large data arrays
matches = re.findall(r'AF_initDataCallback\(\{.*?data:(\[.*?\])\}\);', html, re.DOTALL)
for m in matches:
    if len(m) > 1000:
        try:
            arr = json.loads(m)
            def extract(node):
                if isinstance(node, str) and len(node) > 20 and 'http' not in node and '<' not in node and '{' not in node:
                    print("-", node.replace('\n', ' '))
                elif isinstance(node, list):
                    for item in node:
                        extract(item)
            extract(arr)
        except Exception as e:
            pass
