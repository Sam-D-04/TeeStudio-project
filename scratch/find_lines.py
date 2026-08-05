import re

def find_bad_data(file_path):
    bad_keywords = ['aaa', 'bbb', 'test', 'ok', 'giá quá cao', 'chưa đặt tên']
    with open(file_path, 'r', encoding='utf8') as f:
        lines = f.readlines()
        
    for i, line in enumerate(lines):
        if not line.startswith('INSERT INTO'):
            if '(' in line and ')' in line and line.strip().endswith(',') or line.strip().endswith(';'):
                # This is likely a values row
                lower_line = line.lower()
                for kw in bad_keywords:
                    # check for the exact match within quotes, or just substring
                    if kw in lower_line:
                        print(f"Line {i+1}: {line.strip()[:100]}... [MATCH: {kw}]")

if __name__ == '__main__':
    find_bad_data('d:/NguyenThanhHieu/MonHoc_HK_8/LuanVanTotNghiep/code/TeeStudio-project/teestudio.sql')
