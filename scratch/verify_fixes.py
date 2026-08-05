import re
def verify_fixes(file_path):
    with open(file_path, 'r', encoding='utf8') as f:
        content = f.read().lower()
    
    bad_strings = ["aaaaa", "chưa đặt tên", "test", "ok", "giá quá cao"]
    issues = []
    
    # "test", "ok" might be part of valid words, so we must be careful, but we replaced them if they matched exactly in quotes.
    # Let's just check if they are in the content. For "aaaaa" and "chưa đặt tên" and "giá quá cao", it's very clear.
    for b in ["aaaaa", "chưa đặt tên", "giá quá cao", "'test'", "'ok'"]:
        if b in content:
            issues.append(b)
            
    if issues:
        print("Found remaining bad strings: " + ", ".join(issues))
    else:
        print("All clear.")

if __name__ == '__main__':
    verify_fixes('d:/NguyenThanhHieu/MonHoc_HK_8/LuanVanTotNghiep/code/TeeStudio-project/teestudio.sql')
