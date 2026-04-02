import re
from typing import Tuple, List

def parse_txt(content: str) -> Tuple[str, List[str]]:
    speaker_pattern = re.compile(r'^([A-Z][a-zA-Z\s]+):\s', re.MULTILINE)
    speakers = list(set(speaker_pattern.findall(content)))
    return content.strip(), speakers

def parse_vtt(content: str) -> Tuple[str, List[str]]:
    lines = content.split('\n')
    text_lines = []
    speakers = set()
    timestamp_pattern = re.compile(r'\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}')
    vtt_speaker_pattern = re.compile(r'^<v ([^>]+)>')
    colon_speaker_pattern = re.compile(r'^([^:]+):\s+(.*)')
    
    for line in lines:
        line = line.strip()
        # Skip header, timestamps, empty lines, and sequence numbers
        if not line or line == 'WEBVTT' or timestamp_pattern.match(line) or line.isdigit():
            continue
            
        # Try <v Speaker> Name format
        vtt_match = vtt_speaker_pattern.match(line)
        if vtt_match:
            speakers.add(vtt_match.group(1))
            line = vtt_speaker_pattern.sub('', line).strip()
        else:
            # Try Speaker: Text format
            colon_match = colon_speaker_pattern.match(line)
            if colon_match:
                speakers.add(colon_match.group(1))
                line = colon_match.group(2).strip()
        
        if line:
            text_lines.append(line)
    
    return '\n'.join(text_lines), list(speakers)

def count_words(text: str) -> int:
    return len(text.split())

def chunk_text(text: str, chunk_size: int = 500) -> List[str]:
    words = text.split()
    return [' '.join(words[i:i+chunk_size]) for i in range(0, len(words), chunk_size)]