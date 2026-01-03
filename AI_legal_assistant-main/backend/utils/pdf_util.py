import fitz  # PyMuPDF


def extract_text_from_pdf(pdf_file_path):
    doc = fitz.open(pdf_file_path)  # 打开PDF文件
    text = ''

    for page_num in range(doc.page_count):  # 遍历所有页面
        page = doc.load_page(page_num)  # 加载页面
        text += page.get_text()  # 获取页面文本

    return text
