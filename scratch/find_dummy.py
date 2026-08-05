import re

def find_dummy_data(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    dummy_patterns = [r'\baaa\b', r'\bbbb\b', r'\btest\b', r'\bok\b', r'giá quá cao']
    
    with open("scratch/dummy_lines.txt", "w", encoding='utf-8') as out:
        for i, line in enumerate(lines):
            # We only care about lines inside INSERT INTO ... VALUES
            # or just generally any line containing dummy patterns but not in urls or hashes
            if 'INSERT INTO' in line or line.strip().startswith('('):
                lower_line = line.lower()
                for pattern in dummy_patterns:
                    if re.search(pattern, lower_line) and "res.cloudinary.com" not in line and "$2b$" not in line:
                        out.write(f"L{i+1}: {line.strip()[:150]}...\n")
                        break

if __name__ == "__main__":
    find_dummy_data("teestudio.sql")
