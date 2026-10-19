"""Bundle the application and artwork into one offline HTML file."""
import base64
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main():
    html = (ROOT / 'index.html').read_text(encoding='utf-8')
    css = (ROOT / 'styles.css').read_text(encoding='utf-8')
    html = html.replace('<link rel="stylesheet" href="styles.css">', '<style>\n' + css + '\n</style>')
    payload = (ROOT / 'agents.js').read_text(encoding='utf-8')
    agents = json.loads(payload.removeprefix('window.AGENTS = ').strip().removesuffix(';'))
    for agent in agents:
        for key in ('icon', 'portrait'):
            encoded = base64.b64encode((ROOT / agent[key]).read_bytes()).decode('ascii')
            agent[key] = 'data:image/webp;base64,' + encoded
    for name in ('agents', 'core', 'app'):
        script = ('window.AGENTS = ' + json.dumps(agents, ensure_ascii=False) + ';'
                  if name == 'agents' else (ROOT / f'{name}.js').read_text(encoding='utf-8'))
        script = script.replace('</script', '<\\/script')
        html = html.replace(f'<script src="{name}.js" defer></script>', '')
        html = html.replace('</body>', '<script>\n' + script + '\n</script>\n</body>')
    favicon = base64.b64encode((ROOT / 'favicon.svg').read_bytes()).decode('ascii')
    html = html.replace('href="favicon.svg"', 'href="data:image/svg+xml;base64,' + favicon + '"')
    html = html.replace('href="./index.html"', 'href="#title"')
    output = ROOT / 'release' / 'Agent Shuffle.html'
    output.parent.mkdir(exist_ok=True)
    output.write_text(html, encoding='utf-8')
    print(f'Created: {output}')


if __name__ == '__main__':
    main()
