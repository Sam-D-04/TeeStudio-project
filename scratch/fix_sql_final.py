import re

def fix_all(file_path):
    with open(file_path, 'r', encoding='utf8') as f:
        content = f.read()

    # We do a direct string replace for exact known bad phrases since they are very distinct
    replacements = {
        "'aaaaa'": "'Áo thun sự kiện 2026'",
        "'aaaa'": "'Áo nhóm bạn thân'",
        "'aaa'": "'Sản phẩm thử nghiệm'",
        "'bbbbb'": "'Thiết kế mẫu số 1'",
        "'bbbb'": "'Thiết kế mẫu số 2'",
        "'bbb'": "'Thiết kế mẫu số 3'",
        "'test'": "'Mẫu thiết kế áo'",
        "'ok'": "'Tốt'",
        "'giá quá cao'": "'Giá hơi cao nhưng chất lượng tốt'",
        "'khách hàng test'": "'Nguyễn Văn Khách'",
        "'Thiết kế chưa đặt tên'": "'Áo nhóm kỷ niệm'",
        "'thiết kế chưa đặt tên'": "'Áo nhóm kỷ niệm'",
        "'Văn bản mới'": "'Nội dung chữ'",
        "'Văn bản mẫu'": "'Nội dung mẫu'"
    }

    new_content = content
    for old, new in replacements.items():
        # Case insensitive replace is safer using re.sub
        # Escape the old string to be safe
        pattern = re.compile(re.escape(old), re.IGNORECASE)
        new_content = pattern.sub(new, new_content)

    # Some might not have quotes exactly matching if they were part of a JSON or something.
    # Like 'aaaaa' might be inside JSON: "aaaaa"
    # But let's only target the exact matches we know exist.

    with open(file_path, 'w', encoding='utf8') as f:
        f.write(new_content)

if __name__ == '__main__':
    fix_all('d:/NguyenThanhHieu/MonHoc_HK_8/LuanVanTotNghiep/code/TeeStudio-project/teestudio.sql')
