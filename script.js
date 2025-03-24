document.addEventListener('DOMContentLoaded', function() {
    const markdownInput = document.getElementById('markdownInput');
    const markdownOutput = document.getElementById('markdownOutput');
    const excelUploadBtn = document.getElementById('excelUploadBtn');
    const excelFile = document.getElementById('excelFile');
    const copyBtn = document.getElementById('copyBtn');
    
    // 设置marked选项
    marked.setOptions({
        breaks: true,        // 允许换行
        gfm: true,           // 启用GitHub风格Markdown
        headerIds: true,     // 为标题添加id
        mangle: false,       // 不转义HTML
        sanitize: false      // 不过滤HTML标签
    });
    
    // 实时渲染Markdown
    function renderMarkdown() {
        const markdown = markdownInput.value;
        markdownOutput.innerHTML = marked.parse(markdown);
    }
    
    // 监听输入事件，实时渲染
    markdownInput.addEventListener('input', renderMarkdown);
    
    // 点击按钮触发文件上传
    excelUploadBtn.addEventListener('click', function() {
        excelFile.click();
    });
    
    // 处理Excel文件上传
    excelFile.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // 获取第一个工作表
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            
            // 提取第一列数据
            let markdownContent = '';
            let rowIndex = 1;
            
            while (true) {
                const cellAddress = 'A' + rowIndex;
                const cell = firstSheet[cellAddress];
                
                if (!cell) break;
                
                if (cell.v) {
                    markdownContent += cell.v + '\n\n';
                }
                
                rowIndex++;
            }
            
            // 设置到输入框并渲染
            markdownInput.value = markdownContent;
            renderMarkdown();
        };
        
        reader.readAsArrayBuffer(file);
    });
    
    // 添加复制功能
    copyBtn.addEventListener('click', function() {
        // 使用 Clipboard API 复制内容
        const htmlContent = markdownOutput.innerHTML;
        
        // 创建一个不可见的textarea来存放HTML内容
        const textarea = document.createElement('textarea');
        textarea.value = htmlContent;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        
        // 添加到文档中
        document.body.appendChild(textarea);
        
        // 选择内容
        textarea.select();
        
        try {
            // 执行复制命令
            document.execCommand('copy');
            
            // 显示提示
            const tips = document.querySelector('.copy-tips');
            tips.classList.add('show');
            setTimeout(() => {
                tips.classList.remove('show');
            }, 2000);
        } catch (err) {
            console.error('复制失败:', err);
        }
        
        // 移除临时元素
        document.body.removeChild(textarea);
    });
    
    // 初始渲染（如果有默认内容）
    renderMarkdown();
}); 
