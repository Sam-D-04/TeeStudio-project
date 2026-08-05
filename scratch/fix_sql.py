import re

def fix_sql_data(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replacements based on findings
    replacements = [
        # customerorder
        ("'aaaaaaaaaaaaa'", "'Giao hàng nhanh chóng'"),
        ("'aab'", "'Ghi chú cho shipper'"),
        ("'[TECH_ADJUST] aaaaaaaaaa'", "'[TECH_ADJUST] Điều chỉnh giá hệ thống'"),
        
        # inventorytransaction
        ("'aaaaaaa'", "'Nhập phôi áo thun đen size M'"),
        
        # product
        ("'aaaaaa'", "'Áo thun basic'"),
        ("'aaaaaa-1784464296661'", "'ao-thun-basic-1784464296661'"),
        # product description - there's another aaaaaaa
        ("'aaaaaaa', 'Việt Nam'", "'Chất liệu vải cao cấp', 'Việt Nam'"),
        
        ("'bbbbbbbb-1784464500203'", "'ao-nhom-phuot-1784464500203'"),
        ("'bbbbbbbbb'", "'Chất liệu co giãn, thoáng mát'"),
        
        # productvariant
        ("'AAAAAA-DEN-S'", "'AO-THUN-BASIC-DEN-S'"),
        ("'AAAAAA-DEN-M'", "'AO-THUN-BASIC-DEN-M'"),
        ("'BBBBBB-XAM-S'", "'AO-NHOM-PHUOT-XAM-S'"),
        ("'BBBBBB-BE-XS'", "'AO-NHOM-PHUOT-BE-XS'"),
        
        # sticker (we replaced 'aaaaaaa' above, but wait, the sticker one is just 'aaaaaaa' too)
        # Let's be careful. The sticker one is: ('aaaaaaa', 'logo', 'https...)
        ("(37, 'aaaaaaa', 'logo',", "(37, 'Mẫu logo phong cách', 'logo',"),
        
        # useraddress
        ("'100 Đường Test Tồn Kho'", "'100 Đường Tồn Kho'"),
        ("'100 Đường Test Tồn Kho, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'", "'100 Đường Tồn Kho, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'"),
        
        # Any stray "test", "aaa", "bbb", "giá quá cao" that we might have missed?
        ("'test'", "'kiểm tra'"),
        ("'ok'", "'Thành công'"),
        ("'giá quá cao'", "'Giá hơi cao, cần xem xét lại'")
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    # Let's also ensure there are no stray isolated 'aaa', 'bbb'
    # Actually, the specific replacements should cover everything we found in the JSON.
    
    # Check for 'giá quá cao' in lowercase just in case
    content = content.replace("'giá quá cao'", "'Giá cần xem xét lại'")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    fix_sql_data("teestudio.sql")
