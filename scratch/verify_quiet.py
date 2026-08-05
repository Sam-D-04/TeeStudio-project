import sys
def verify_fixes_quiet(file_path):
    with open(file_path, 'r', encoding='utf8') as f:
        content = f.read().lower()
    
    # Check for the literal old strings that we wanted to replace
    # We replaced "'aaaaa'", "'Thiết kế chưa đặt tên'", etc. 
    # Let's check for the exact replacements to see if they are still there.
    
    bad_strings = ["'aaaaa'", "'thiết kế chưa đặt tên'", "'chưa đặt tên'", "'test'", "'ok'", "'giá quá cao'"]
    issues = []
    
    for b in bad_strings:
        if b in content:
            issues.append(b)
            
    if issues:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == '__main__':
    verify_fixes_quiet('d:/NguyenThanhHieu/MonHoc_HK_8/LuanVanTotNghiep/code/TeeStudio-project/teestudio.sql')
