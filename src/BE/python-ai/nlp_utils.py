"""
NLP Utilities — Tiện ích chuẩn hóa và xử lý ngôn ngữ tự nhiên tiếng Việt
Hoàn toàn độc lập bằng thư viện chuẩn Python (Zero Dependencies)
"""

import re
import unicodedata

# Bảng tra ký tự tiếng Việt có dấu sang không dấu
VIETNAMESE_ACCENT_MAP = {
    'a': 'áàảãạăắằẳẵặâấầẩẫậ',
    'A': 'ÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬ',
    'd': 'đ',
    'D': 'Đ',
    'e': 'éèẻẽẹêếềểễệ',
    'E': 'ÉÈẺẼẸÊẾỀỂỄỆ',
    'i': 'íìỉĩị',
    'I': 'ÍÌỈĨỊ',
    'o': 'óòỏõọôốồổỗộơớờởỡợ',
    'O': 'ÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢ',
    'u': 'úùủũụưứừửữự',
    'U': 'ÚÙỦŨỤƯỨỪỬỮỰ',
    'y': 'ýỳỷỹỵ',
    'Y': 'ÝỲỶỸỴ'
}

# Tạo bảng chuyển đổi ký tự
_CHAR_MAP = {}
for plain_char, accented_chars in VIETNAMESE_ACCENT_MAP.items():
    for acc in accented_chars:
        _CHAR_MAP[ord(acc)] = plain_char

# Từ điển chuẩn hóa từ viết tắt & tiếng lóng hay gặp khi chat
SLANG_MAP = {
    r'\bng\s*già\b': 'người già',
    r'\bng\s*gia\b': 'người già',
    r'\bng\s*lớn\b': 'người lớn',
    r'\bng\s*lon\b': 'người lớn',
    r'\bib\b': 'nhắn tin',
    r'\binbox\b': 'nhắn tin',
    r'\bko\b': 'không',
    r'\bk\b': 'không',
    r'\bkh\b': 'không',
    r'\bhok\b': 'không',
    r'\bhong\b': 'không',
    r'\bdc\b': 'được',
    r'\bđc\b': 'được',
    r'\bbn\b': 'bao nhiêu',
    r'\bnhiu\b': 'bao nhiêu',
    r'\bbao nhiu\b': 'bao nhiêu',
    r'\bsdt\b': 'số điện thoại',
    r'\bsđt\b': 'số điện thoại',
    r'\bđt\b': 'điện thoại',
    r'\bdt\b': 'điện thoại',
    r'\bad ơi\b': '',
    r'\bad\b': '',
    r'\bshop ơi\b': '',
    r'\bshop oi\b': '',
    r'\bstk\b': 'số tài khoản',
    r'\bck\b': 'chuyển khoản',
    r'\bbh\b': 'bảo hành',
    r'\blh\b': 'liên hệ',
    r'\bngta\b': 'người ta',
    r'\bmn\b': 'mọi người',
    r'\btks\b': 'cảm ơn',
    r'\bthanks\b': 'cảm ơn',
    r'\bthk\b': 'cảm ơn',
    r'\bok\b': 'đồng ý',
    r'\boke\b': 'đồng ý',
    r'\bokay\b': 'đồng ý',
    r'\boki\b': 'đồng ý',
}

def remove_accents(text: str) -> str:
    """Chuyển chuỗi tiếng Việt có dấu thành không dấu (VD: 'xông hơi' -> 'xong hoi')"""
    if not text:
        return ""
    converted = text.translate(_CHAR_MAP)
    nfkd = unicodedata.normalize('NFKD', converted)
    return "".join([c for c in nfkd if not unicodedata.combining(c)])

def normalize_text(text: str) -> str:
    """
    Chuẩn hóa văn bản:
    1. Chuyển chữ thường
    2. Thay thế từ viết tắt / tiếng lóng
    3. Xóa các ký tự đặc biệt thừa, giữ nguyên dấu tiếng Việt
    4. Rút gọn khoảng trắng
    """
    if not text:
        return ""

    lowered = text.lower()

    # Thay thế tiếng lóng theo regex
    for pattern, replacement in SLANG_MAP.items():
        lowered = re.sub(pattern, replacement, lowered)

    # Xóa dấu câu thừa ở đầu/cuối và các ký tự đặc biệt lặp
    cleaned = re.sub(r'[\r\n\t]+', ' ', lowered)
    cleaned = re.sub(r'[?!.,;:"\'()\[\]{}]+', ' ', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()

    return cleaned

def extract_phone_number(text: str) -> str | None:
    """
    Phát hiện và chuẩn hóa số điện thoại Việt Nam trong văn bản.
    Nhận diện được cả dạng dính liền (0905123456) và dạng có dấu cách/chấm (0385.927.274, 0905 123 456).
    """
    if not text:
        return None

    # 1. Tìm trực tiếp trên văn bản
    direct_match = re.search(r'(?:\+84|84|0)(?:3|5|7|8|9)[0-9]{8}\b', text)
    if direct_match:
        return direct_match.group(0)

    # 2. Xóa các ký tự ngăn cách phổ biến như '.', '-', ' ' rồi tìm kiếm
    cleaned = re.sub(r'[.\-\s]', '', text)
    cleaned_match = re.search(r'(?:\+84|84|0)(?:3|5|7|8|9)[0-9]{8}', cleaned)
    if cleaned_match:
        return cleaned_match.group(0)

    return None
