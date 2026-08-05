import json

def find_dummy_json():
    with open('scratch/db_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    with open('scratch/dummy_json_results.txt', 'w', encoding='utf-8') as out:
        for k, v in data.items():
            lower_v = v.lower()
            if 'test' in lower_v or 'aaa' in lower_v or 'bbb' in lower_v or 'ok' in lower_v or 'giá quá cao' in lower_v:
                # Be careful, 'ok' might match 'token'
                # Let's use word boundaries or just check if it's there
                # We'll write out the whole string but just the table name
                out.write(f"Table: {k}\n")
                # Split by line and print only lines with match
                for line in v.split('\n'):
                    lower_line = line.lower()
                    if 'test' in lower_line or 'aaa' in lower_line or 'bbb' in lower_line or 'giá quá cao' in lower_line:
                        out.write(f"  Match: {line[:200]}\n")
                    if 'ok' in lower_line and 'token' not in lower_line and 'ok' in lower_line.split():
                        out.write(f"  Match 'ok': {line[:200]}\n")
                out.write("-" * 40 + "\n")

if __name__ == "__main__":
    find_dummy_json()
