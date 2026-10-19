"""Fetch a portable roster snapshot and resize artwork for the offline app."""
import io
import json
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.request import Request, urlopen
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
API = 'https://valorant-api.com/v1/agents?isPlayableCharacter=true&language=pt-BR'

def fetch(url):
    request = Request(url, headers={'User-Agent': 'AgentShuffle/1.0'})
    with urlopen(request, timeout=45) as response:
        return response.read()

def asset(job):
    url, destination, size = job
    for attempt in range(3):
        try:
            image = Image.open(io.BytesIO(fetch(url))).convert('RGBA')
            image.thumbnail((size, size), Image.Resampling.LANCZOS)
            image.save(destination, 'WEBP', quality=86, method=4)
            return
        except Exception:
            if attempt == 2:
                raise

def main():
    (ROOT / 'assets').mkdir(exist_ok=True)
    agents = json.loads(fetch(API))['data']
    roster, jobs = [], []
    for agent in sorted(agents, key=lambda a: a['displayName'].lower()):
        uid = agent['uuid']
        icon = f'assets/{uid}-icon.webp'
        portrait = f'assets/{uid}-portrait.webp'
        roster.append({'id': uid, 'name': agent['displayName'],
                       'role': agent['role']['displayName'],
                       'description': agent['description'], 'icon': icon, 'portrait': portrait})
        jobs.append((agent['displayIcon'], ROOT / icon, 180))
        jobs.append((agent['fullPortrait'], ROOT / portrait, 900))
    with ThreadPoolExecutor(max_workers=8) as pool:
        list(pool.map(asset, jobs))
    payload = json.dumps(roster, ensure_ascii=False, indent=2)
    (ROOT / 'agents.js').write_text('window.AGENTS = ' + payload + ';\n', encoding='utf-8')
    print(f'{len(roster)} agents, {len(jobs)} local images ready.')

if __name__ == '__main__':
    main()
