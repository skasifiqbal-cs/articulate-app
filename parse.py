import json, re

with open('/home/rr/.gemini/antigravity-cli/brain/2322a466-8d78-4c8e-9fa6-db2118fd0faa/.system_generated/steps/542/content.md', 'r') as f:
    content = f.read()

match = re.search(r'window\.WIZ_global_data\s*=\s*(\{.*?\});', content)
if match:
    data = json.loads(match.group(1))
    
    # Extract long text strings from the JSON structure
    def extract_strings(obj):
        strings = []
        if isinstance(obj, dict):
            for v in obj.values():
                strings.extend(extract_strings(v))
        elif isinstance(obj, list):
            for v in obj:
                strings.extend(extract_strings(v))
        elif isinstance(obj, str):
            if len(obj) > 100 and "{" not in obj and "http" not in obj:
                strings.append(obj)
        return strings
        
    for k, v in data.items():
        if isinstance(v, str) and len(v) > 500:
            # Often the conversation is embedded in a stringified JSON array
            try:
                parsed = json.loads(v)
                extracted = extract_strings(parsed)
                for s in extracted:
                    print("--- TEXT BLOCK ---")
                    print(s[:500] + ("..." if len(s) > 500 else ""))
            except:
                pass
