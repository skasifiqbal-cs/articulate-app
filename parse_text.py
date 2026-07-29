from html.parser import HTMLParser

class MyHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_script = False
        self.text = []

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'):
            self.in_script = True

    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.in_script = False

    def handle_data(self, data):
        if not self.in_script and data.strip():
            self.text.append(data.strip())

parser = MyHTMLParser()
with open('/home/rr/.gemini/antigravity-cli/brain/2322a466-8d78-4c8e-9fa6-db2118fd0faa/.system_generated/steps/542/content.md', 'r') as f:
    html = f.read()
    
parser.feed(html)
print('\n'.join(parser.text))
